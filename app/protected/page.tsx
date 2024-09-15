'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useLanguage } from '../../components/LanguageContext'

function simpleMarkdownToHtml(markdown: string): string {
  return markdown
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
    .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
}

export default function ProtectedPage() {
  const { user, isLoading: isUserLoading, error: userError } = useUser()
  const { language } = useLanguage()
  const [title, setTitle] = useState('Lost')
  const [chapter, setChapter] = useState('Temporada 2 capítulo 3')
  const [summary, setSummary] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')
  const [summaryType, setSummaryType] = useState<'specific' | 'general'>('general')
  const [isCopied, setIsCopied] = useState(false)
  const [titleEdited, setTitleEdited] = useState(false)
  const [chapterEdited, setChapterEdited] = useState(false)
  const summaryRef = useRef<HTMLDivElement>(null)

  const content = {
    es: {
      title: 'Resumen de Películas y Series',
      welcome: 'Bienvenido',
      titlePlaceholder: 'Ingresa el título de una película o serie',
      chapterPlaceholder: 'Capítulo/película',
      summaryTypeOptions: {
        general: 'Resume todo hasta este capitulo',
        specific: 'Resumen sólo este capítulo'
      },
      getButton: 'Obtener Resumen',
      searching: 'Buscando...',
      copy: 'Copiar',
      copied: 'Copiado',
      loginPrompt: 'Por favor, inicia sesión para usar esta función.',
      loading: 'Cargando...',
      error: 'Error al obtener el resumen. Por favor, intenta de nuevo.'
    },
    en: {
      title: 'Movie and Series Summary',
      welcome: 'Welcome',
      titlePlaceholder: 'Enter the title of a movie or series',
      chapterPlaceholder: 'Chapter/movie',
      summaryTypeOptions: {
        general: 'Summarize everything up to this chapter',
        specific: 'Summarize only this chapter'
      },
      getButton: 'Get Summary',
      searching: 'Searching...',
      copy: 'Copy',
      copied: 'Copied',
      loginPrompt: 'Please log in to use this feature.',
      loading: 'Loading...',
      error: 'Error fetching the summary. Please try again.'
    },
    fr: {
      title: 'Résumé de Films et Séries',
      welcome: 'Bienvenue',
      titlePlaceholder: 'Entrez le titre d\'un film ou d\'une série',
      chapterPlaceholder: 'Chapitre/film',
      summaryTypeOptions: {
        general: 'Résumer tout jusqu\'à ce chapitre',
        specific: 'Résumer uniquement ce chapitre'
      },
      getButton: 'Obtenir le résumé',
      searching: 'Recherche en cours...',
      copy: 'Copier',
      copied: 'Copié',
      loginPrompt: 'Veuillez vous connecter pour utiliser cette fonctionnalité.',
      loading: 'Chargement...',
      error: 'Erreur lors de la récupération du résumé. Veuillez réessayer.'
    }
  }

  const t = content[language]

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    setTitleEdited(true)
  }

  const handleChapterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setChapter(e.target.value)
    setChapterEdited(true)
  }

  const fetchSummary = async () => {
    setIsSearching(true)
    setError('')
    setSummary('')

    const content = summaryType === 'specific' && chapter
      ? `Provide a summary of what happens in ${chapter} of "${title}". Limit yourself to describing only the main plot events, without adding additional information. Use Markdown headings (# for main titles, ## for subtitles) to structure the summary.`
      : `Provide a summary of only the main events in the series/movie "${title}" from the first movie or chapter of the first season or movie up to the chapter "${chapter}" (included). Omit details external to the narrative. Use Markdown headings (# for main titles, ## for subtitles) to structure the summary.`
    
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-large-128k-online",
        messages: [
          { role: "system", content: `You are a cinema expert who provides structured summaries of movies and series. Respond in ${language === 'es' ? 'Spanish' : language === 'en' ? 'English' : 'French'}.` },
          { role: "user", content: content }
        ],
        max_tokens: 3000,
        temperature: 0.2,
        top_p: 0.9,
        stream: false
      })
    };

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', options)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data.choices && data.choices[0] && data.choices[0].message) {
        setSummary(data.choices[0].message.content)
      } else {
        throw new Error('Unexpected API response')
      }
    } catch (err) {
      setError(t.error)
      console.error('Error:', err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchSummary()
  }

  const handleCopy = () => {
    if (summaryRef.current) {
      const text = summaryRef.current.innerText
      navigator.clipboard.writeText(text).then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
    }
  }

  if (isUserLoading) return <div className="text-center p-4">{t.loading}</div>
  if (userError) return <div className="text-center p-4 text-red-500">Error: {userError.message}</div>

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">{t.title}</h1>
      {user ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="mb-4 text-lg font-semibold text-gray-700">{t.welcome}, {user.name}!</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder={t.titlePlaceholder}
                className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${titleEdited ? 'text-black' : 'text-gray-500'}`}
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                type="text"
                value={chapter}
                onChange={handleChapterChange}
                placeholder={t.chapterPlaceholder}
                className={`w-full sm:w-1/3 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${chapterEdited ? 'text-black' : 'text-gray-500'}`}
              />
              <select
                value={summaryType}
                onChange={(e) => setSummaryType(e.target.value as 'specific' | 'general')}
                className="w-full sm:w-2/3 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="general">{t.summaryTypeOptions.general}</option>
                <option value="specific">{t.summaryTypeOptions.specific}</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 transition duration-150 ease-in-out"
              disabled={isSearching}
            >
              {isSearching ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t.searching}
                </span>
              ) : t.getButton}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md" role="alert">
              <p>{error}</p>
            </div>
          )}
          {summary && (
            <div className="mt-6 bg-white rounded-md overflow-hidden shadow-md">
              <div className="flex justify-between items-center bg-gray-100 px-4 py-2">
                <h2 className="font-bold text-xl text-gray-800">{t.title}:</h2>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                >
                  {isCopied ? t.copied : t.copy}
                </button>
              </div>
              <div 
                ref={summaryRef}
                className="p-4 max-h-[60vh] overflow-auto text-gray-700 space-y-2"
                dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(summary) }}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p className="text-lg text-gray-700">{t.loginPrompt}</p>
        </div>
      )}
    </div>
  )
}