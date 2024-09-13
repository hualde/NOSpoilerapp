'use client'

import { useState } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'

// Función auxiliar para convertir markdown básico a HTML
function simpleMarkdownToHtml(markdown: string): string {
  return markdown
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

export default function ProtectedPage() {
  const { user, isLoading: isUserLoading, error: userError } = useUser()
  const [title, setTitle] = useState('')
  const [chapter, setChapter] = useState('')
  const [summary, setSummary] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')

  const fetchSummary = async (isSpecific: boolean) => {
    setIsSearching(true)
    setError('')
    setSummary('')

    const content = isSpecific && chapter
      ? `Proporciona un resumen conciso del capítulo/película ${chapter} de "${title}". El resumen debe ser de aproximadamente 3-4 oraciones.`
      : `Proporciona un resumen general conciso de la película o serie "${title}". El resumen debe ser de aproximadamente 3-4 oraciones.`

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          { role: "system", content: "Eres un asistente que proporciona resúmenes concisos de películas y series." },
          { role: "user", content: content }
        ],
        max_tokens: 150,
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

  const handleSubmit = (e: React.FormEvent, isSpecific: boolean) => {
    e.preventDefault()
    fetchSummary(isSpecific)
  }

  if (isUserLoading) return <div className="text-center p-4">Cargando...</div>
  if (userError) return <div className="text-center p-4 text-red-500">Error: {userError.message}</div>

  return (
    <div className="max-w-2xl mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Resumen de Películas y Series</h1>
      {user ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="mb-4 text-lg font-semibold text-gray-700">Bienvenido, {user.name}!</p>
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ingresa el título de una película o serie"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="Número de capítulo/película (opcional)"
                className="w-full sm:w-2/3 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="w-full sm:w-1/3 px-4 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 transition duration-150 ease-in-out"
                disabled={isSearching || !chapter}
              >
                Resumen Específico
              </button>
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
              ) : 'Obtener Resumen General'}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md" role="alert">
              <p>{error}</p>
            </div>
          )}
          {summary && (
            <div className="mt-6 p-4 bg-gray-100 rounded-md overflow-auto max-h-96">
              <h2 className="font-bold text-lg mb-2 text-gray-800">Resumen:</h2>
              <div 
                className="text-gray-700"
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