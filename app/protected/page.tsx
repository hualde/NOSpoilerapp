'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'

function simpleMarkdownToHtml(markdown: string): string {
  return markdown
    .replace(/^### (.*$)/gim, '<strong class="block mt-4 mb-2">$1</strong>')
    .replace(/^## (.*$)/gim, '<strong class="block mt-6 mb-3">$1</strong>')
    .replace(/^# (.*$)/gim, '<strong class="block mt-8 mb-4">$1</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
    .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
}

export default function ProtectedPage() {
  const { user, isLoading: isUserLoading, error: userError } = useUser()
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
      ? `Proporciona un resumen de lo que sucede en ${chapter} de "${title}". Limítate a describir solo los eventos principales de la trama, sin añadir información adicional. Usa encabezados Markdown (# para títulos principales, ## para subtítulos) para estructurar el resumen.`
      : `Proporciona un resumen solo de los eventos principales en la serie/película "${title}" desde la primera película o capítulo de la primera temporada o película hasta el capítulo "${chapter}"(incluido). Omite detalles externos a la narrativa. Usa encabezados Markdown (# para títulos principales, ## para subtítulos) para estructurar el resumen.`
    
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-large-128k-online",
        messages: [
          { role: "system", content: "Eres un experto en cine que proporciona resúmenes estructurados de películas y series." },
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
        throw new Error('Respuesta inesperada de la API')
      }
    } catch (err) {
      setError('Error al obtener el resumen. Por favor, intenta de nuevo.')
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

  if (isUserLoading) return <div className="text-center p-4">Cargando...</div>
  if (userError) return <div className="text-center p-4 text-red-500">Error: {userError.message}</div>

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Resumen de Películas y Series</h1>
      {user ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="mb-4 text-lg font-semibold text-gray-700">Bienvenido, {user.name}!</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="Ingresa el título de una película o serie"
                className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${titleEdited ? 'text-black' : 'text-gray-500'}`}
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                type="text"
                value={chapter}
                onChange={handleChapterChange}
                placeholder="Capítulo/película"
                className={`w-full sm:w-1/3 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${chapterEdited ? 'text-black' : 'text-gray-500'}`}
              />
              <select
                value={summaryType}
                onChange={(e) => setSummaryType(e.target.value as 'specific' | 'general')}
                className="w-full sm:w-2/3 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="general">Resume todo hasta este capitulo</option>
                <option value="specific">Resumen sólo este capítulo</option>
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
                  Buscando...
                </span>
              ) : 'Obtener Resumen'}
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
                <h2 className="font-bold text-xl text-gray-800">Resumen:</h2>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                >
                  {isCopied ? 'Copiado' : 'Copiar'}
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
          <p className="text-lg text-gray-700">Por favor, inicia sesión para usar esta función.</p>
        </div>
      )}
    </div>
  )
}