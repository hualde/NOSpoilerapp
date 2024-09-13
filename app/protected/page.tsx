'use client'

import { useState } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

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
        model: "llama-3.1-sonar-large-128k-online",
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
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Resumen de Películas y Series</h1>
      {user ? (
        <Card>
          <CardHeader>
            <CardTitle>Bienvenido, {user.name}!</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
              <div>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ingresa el título de una película o serie"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  placeholder="Número de capítulo/película (opcional)"
                />
                <Button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={isSearching || !chapter}
                  variant="secondary"
                >
                  Resumen Específico
                </Button>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : 'Obtener Resumen General'}
              </Button>
            </form>
            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded" role="alert">
                <p>{error}</p>
              </div>
            )}
            {summary && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <h2 className="font-bold mb-2">Resumen:</h2>
                <p>{summary}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <p className="text-center">Por favor, inicia sesión para usar esta función.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}