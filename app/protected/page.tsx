'use client'

import { useState, useRef } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Loader2, Copy, Check } from "lucide-react"

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
  const [title, setTitle] = useState('Perdidos')
  const [chapter, setChapter] = useState('Temporada 2 capítulo 3')
  const [summary, setSummary] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')
  const [summaryType, setSummaryType] = useState<'specific' | 'general'>('general')
  const [isCopied, setIsCopied] = useState(false)
  const summaryRef = useRef<HTMLDivElement>(null)

  const fetchSummary = async () => {
    setIsSearching(true)
    setError('')
    setSummary('')

    const content = summaryType === 'specific' && chapter
      ? `Proporciona un resumen de lo que sucede en el capítulo/película ${chapter} de "${title}". Limítate a describir solo los eventos principales de la trama, sin añadir información adicional. Usa encabezados Markdown (# para títulos principales, ## para subtítulos) para estructurar el resumen.`
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
        <Card>
          <CardHeader>
            <CardTitle>Bienvenido, {user.name}!</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ingresa el título de una película o serie"
                  className="w-full"
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Input
                  type="text"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  placeholder="Número de capítulo/película (opcional)"
                  className="w-full sm:w-2/3"
                />
                <select
                  value={summaryType}
                  onChange={(e) => setSummaryType(e.target.value as 'specific' | 'general')}
                  className="w-full sm:w-1/3 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">Resumen General</option>
                  <option value="specific">Resumen Específico</option>
                </select>
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
                ) : 'Obtener Resumen'}
              </Button>
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
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    {isCopied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
                <div 
                  ref={summaryRef}
                  className="p-4 max-h-[60vh] overflow-auto text-gray-700 space-y-2"
                  dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(summary) }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <p className="text-center text-lg text-gray-700">Por favor, inicia sesión para usar esta función.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}