'use client'

import { useState } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'

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
      ? `Proporciona un resumen conciso del capítulo/película ${chapter} de "${title}".`
      : `Proporciona un resumen general conciso de la película o serie "${title}".`

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-large-128k-online",
        messages: [
          { role: "system", content: "Eres un asistente que proporciona resúmenes concisos de películas y series." },
          { role: "user", content: content }
        ],
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.9
      })
    };

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', options)
      const data = await response.json()
      if (response.ok) {
        setSummary(data.choices[0].message.content)
      } else {
        setError('Error al obtener el resumen. Por favor, intenta de nuevo.')
      }
    } catch (err) {
      setError('Error de red. Por favor, verifica tu conexión e intenta de nuevo.')
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
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Resumen de Películas y Series</h1>
      {user ? (
        <>
          <p className="mb-4">Bienvenido, {user.name}!</p>
          <form onSubmit={(e) => handleSubmit(e, false)} className="mb-4">
            <div className="mb-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ingresa el título de una película o serie"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-2 flex">
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="Número de capítulo/película (opcional)"
                className="flex-grow p-2 border border-gray-300 rounded-l"
              />
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="bg-green-500 text-white p-2 rounded-r hover:bg-green-600 disabled:bg-green-300"
                disabled={isSearching || !chapter}
              >
                Resumen Específico
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
              disabled={isSearching}
            >
              {isSearching ? 'Buscando...' : 'Obtener Resumen General'}
            </button>
          </form>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {summary && (
            <div className="bg-gray-100 p-4 rounded">
              <h2 className="font-bold mb-2">Resumen:</h2>
              <p>{summary}</p>
            </div>
          )}
        </>
      ) : (
        <p>Por favor, inicia sesión para usar esta función.</p>
      )}
    </div>
  )
}