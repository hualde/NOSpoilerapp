'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'

export default function ProtectedPage() {
  const { user, isLoading, error } = useUser()
  const [title, setTitle] = useState('')
  const [chapter, setChapter] = useState('')
  const [summary, setSummary] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    console.log('Component mounted')
    console.log('User:', user)
    console.log('Is loading:', isLoading)
    console.log('Error:', error)
  }, [user, isLoading, error])

  const handleSubmit = async (e: React.FormEvent, isSpecific: boolean) => {
    e.preventDefault()
    setIsSearching(true)
    setSummary('')

    // Simulamos una búsqueda
    setTimeout(() => {
      if (isSpecific && chapter) {
        setSummary(`Este es un resumen específico para "${title}", capítulo/película ${chapter}. Aquí implementaremos la llamada a la API de Perplexity más adelante.`)
      } else {
        setSummary(`Este es un resumen general para "${title}". Aquí implementaremos la llamada a la API de Perplexity más adelante.`)
      }
      setIsSearching(false)
    }, 1000)
  }

  if (isLoading) return <div>Cargando...</div>
  if (error) return <div>Error: {error.message}</div>

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