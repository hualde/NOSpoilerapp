'use client'

import { useState } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'

function simpleMarkdownToHtml(markdown: string): string {
  return markdown
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

// Texto extremadamente largo para demostrar que no se trunca
const extremelyLongSummary = `
En esta épica saga que abarca múltiples generaciones y continentes, nos sumergimos en un mundo de fantasía medieval lleno de intrigas políticas, batallas épicas y elementos mágicos. La historia se desarrolla principalmente en el continente ficticio de Westeros, donde siete reinos luchan por el control del Trono de Hierro, símbolo del poder absoluto sobre los Siete Reinos.

Capítulo 1: El inicio de la tormenta

La historia comienza con la familia Stark, gobernantes del Norte, recibiendo la visita del Rey Robert Baratheon, viejo amigo de Eddard "Ned" Stark. Robert ofrece a Ned el puesto de Mano del Rey, el segundo al mando en los Siete Reinos. Ned acepta a regañadientes, sospechando que hay problemas en la capital.

Mientras tanto, al otro lado del Mar Angosto, los últimos supervivientes de la dinastía Targaryen, derrocada por Robert años atrás, planean su regreso al poder. Viserys Targaryen arregla el matrimonio de su hermana Daenerys con Khal Drogo, líder de una poderosa horda de guerreros nómadas conocidos como los Dothraki.

Capítulo 2: Secretos y conspiraciones

En la capital, Desembarco del Rey, Ned descubre una verdad peligrosa sobre los hijos del rey Robert y la reina Cersei Lannister. Esta revelación desencadena una serie de eventos que llevarán a los Siete Reinos a una guerra civil conocida como la Guerra de los Cinco Reyes.

En el Norte, el hijo bastardo de Ned, Jon Snow, se une a la Guardia de la Noche, una antigua orden que protege el reino de las amenazas que acechan más allá del Muro, una colosal estructura de hielo que marca la frontera norte de los Siete Reinos.

Capítulo 3: El despertar de la magia

Mientras los reinos se sumergen en el caos, elementos mágicos comienzan a resurgir en el mundo. Daenerys Targaryen recibe tres huevos de dragón petrificados como regalo de bodas. Contra todo pronóstico, los huevos eclosionan, dando nacimiento a los primeros dragones vistos en siglos.

En el Norte, los hijos de Ned Stark descubren que poseen una conexión psíquica con sus lobos huargo, enormes lobos que adoptan como mascotas. Bran Stark, tras sufrir un accidente que lo deja paralítico, comienza a tener visiones proféticas.

Capítulo 4: La Guerra de los Cinco Reyes

Tras la muerte del rey Robert, los Siete Reinos se dividen. Joffrey Baratheon, hijo de Cersei, reclama el trono, pero su legitimidad es cuestionada. Robb Stark, hijo mayor de Ned, es proclamado Rey en el Norte y busca venganza por la ejecución de su padre. Stannis y Renly Baratheon, hermanos de Robert, también reclaman el trono, mientras que Balon Greyjoy declara la independencia de las Islas del Hierro.

La guerra se extiende por todo Westeros, cambiando alianzas y lealtades. Familias enteras son aniquiladas, mientras que otras ascienden al poder. La brutalidad de la guerra se refleja en eventos como la Boda Roja, donde Robb Stark y gran parte de su ejército son traicionados y masacrados.

Capítulo 5: El ascenso de Daenerys

Al otro lado del mar, Daenerys Targaryen comienza su ascenso al poder. Tras la muerte de su esposo, Khal Drogo, lidera a un pequeño grupo de seguidores a través del hostil desierto rojo. Sus dragones, aunque jóvenes, comienzan a crecer y se convierten en una fuente de poder y temor.

Daenerys libera ciudades esclavistas, ganándose el título de "Rompedora de Cadenas" y acumulando un ejército leal. Su búsqueda de justicia a menudo se enfrenta con las realidades políticas de gobernar, obligándola a tomar decisiones difíciles que cuestionan su sentido de la moralidad.

Capítulo 6: La amenaza del Norte

Mientras los reinos del sur se desangran en guerras, una amenaza ancestral despierta en el lejano norte. Los Caminantes Blancos, criaturas sobrenaturales capaces de resucitar a los muertos, comienzan a moverse hacia el Muro. La Guardia de la Noche, drásticamente reducida en número y recursos, se encuentra como la única línea de defensa contra esta amenaza sobrenatural.

Jon Snow emerge como un líder clave en la Guardia de la Noche. Sus experiencias más allá del Muro lo llevan a comprender la verdadera magnitud de la amenaza que se avecina y a tomar decisiones controvertidas para preparar a los reinos para la batalla que se aproxima.

Capítulo 7: Juegos de poder

En la capital, la lucha por el poder continúa. Cersei Lannister consolida su control sobre el Trono de Hierro, pero se enfrenta a numerosos desafíos. La llegada de la Casa Tyrell, con la carismática Margaery Tyrell, introduce nuevas dinámicas en la corte.

Mientras tanto, Tyrion Lannister, el hijo enano de la poderosa familia Lannister, navega hábilmente por las peligrosas aguas de la política de la corte. Su ingenio y astucia lo convierten en un jugador clave en el juego de tronos, a pesar de ser menospreciado por su propia familia.

Capítulo 8: El viaje de los Stark

Los hijos supervivientes de Ned Stark se embarcan en viajes transformadores. Arya Stark se convierte en una asesina entrenada, buscando venganza contra aquellos que han dañado a su familia. Sansa Stark, inicialmente una pieza en los juegos de otros, aprende a manipular la política cortesana y emerge como una jugadora astuta por derecho propio.

Bran Stark viaja más allá del Muro, desarrollando sus habilidades como cambiapieles y vidente. Su viaje lo lleva a descubrir secretos antiguos que podrían ser cruciales para la supervivencia de los reinos.

Capítulo 9: La larga noche se acerca

A medida que la amenaza de los Caminantes Blancos se hace más inminente, los reinos, agotados por años de guerra civil, luchan por unirse. Jon Snow trabaja incansablemente para forjar alianzas y preparar a los vivos para la batalla contra los muertos.

Daenerys Targaryen finalmente llega a Westeros con sus dragones y su ejército. Su llegada cambia drásticamente el equilibrio de poder, pero también la enfrenta a nuevos desafíos y expectativas como potencial gobernante de los Siete Reinos.

Capítulo 10: Secretos revelados

A medida que la historia se acerca a su clímax, secretos largamente guardados salen a la luz. La verdadera herencia de Jon Snow es revelada, lo que complica aún más la lucha por el Trono de Hierro. Antiguas profecías comienzan a cobrar sentido, y el destino de Westeros pende de un hilo.

Capítulo 11: La batalla por el amanecer

La gran batalla contra los Caminantes Blancos finalmente llega. Los ejércitos de los vivos se unen en una última resistencia desesperada contra las fuerzas de la muerte. La lucha es brutal y las pérdidas son enormes. El destino de la humanidad depende del resultado de esta batalla épica.

Capítulo 12: El juego final

Con la amenaza sobrenatural derrotada, los supervivientes deben determinar el futuro de los Siete Reinos. Las alianzas se ponen a prueba, las lealtades se cuestionan y se toman decisiones que alterarán el curso de la historia de Westeros para siempre.

La saga concluye con una reflexión sobre el costo del poder, la naturaleza cíclica de la historia y la importancia de la unidad frente a amenazas existenciales. Los personajes que han sobrevivido emergen transformados por sus experiencias, dejando un legado que perdurará por generaciones.

Temas recurrentes:

1. Poder y corrupción: La saga explora cómo el poder puede corromper incluso a las personas más nobles, y cómo la búsqueda del poder puede llevar a la destrucción.

2. Identidad y crecimiento: Muchos personajes experimentan viajes de autodescubrimiento, cuestionando sus creencias y valores a medida que enfrentan desafíos cada vez mayores.

3. Familia y lealtad: Las complejas dinámicas familiares son un tema central, explorando cómo los lazos familiares pueden ser tanto una fuente de fuerza como de conflicto.

4. Moralidad en tiempos de guerra: La serie examina las difíciles decisiones morales que los personajes deben tomar en tiempos de conflicto, cuestionando la naturaleza del bien y el mal.

5. El costo de la venganza: Varios personajes buscan venganza, pero la narrativa muestra cómo esta búsqueda a menudo lleva a un ciclo interminable de violencia y sufrimiento.

6. La naturaleza del liderazgo: A través de diversos personajes en posiciones de poder, la historia explora lo que significa ser un buen líder y los desafíos de gobernar.

7. El choque entre tradición y cambio: La saga muestra una sociedad en transición, donde las antiguas formas de hacer las cosas se enfrentan a nuevas ideas y desafíos.

8. El papel del destino y el libre albedrío: La narrativa juega con la idea de profecías y destino, pero también muestra cómo las elecciones individuales pueden alterar el curso de la historia.

Impacto cultural:

Esta saga épica ha tenido un impacto significativo en la cultura popular, redefiniendo las expectativas para la fantasía en la literatura y la televisión. Su mezcla de realismo político, elementos fantásticos y desarrollo complejo de personajes ha inspirado numerosas obras y discusiones.

La serie ha generado un vasto universo expandido, incluyendo precuelas, spin-offs y material complementario que explora la rica historia y mitología del mundo creado. Fans de todo el mundo han creado teorías, análisis y obras de arte inspiradas en la saga, demostrando su duradera influencia en la imaginación colectiva.

Además, la serie ha provocado discusiones sobre temas como la representación de género, la violencia en los medios y la naturaleza del poder político, trascendiendo los límites del género de fantasía para convertirse en un fenómeno cultural más amplio.

En última instancia, esta saga épica no solo entretiene, sino que también desafía a los lectores y espectadores a reflexionar sobre la naturaleza de la humanidad, el costo del poder y la importancia de la compasión y la unidad en un mundo a menudo cruel y caótico. Su legado perdurará como un hito en la narración épica, inspirando a futuras generaciones de escritores y creadores.

Conclusión:

Esta vasta y compleja narrativa entrelaza hábilmente múltiples líneas argumentales, creando un tapiz rico en detalles y profundidad emocional. A través de sus numerosos personajes y conflictos, la saga explora temas universales como el poder, la lealtad, la identidad y la naturaleza de la humanidad frente a amenazas existenciales.

La mezcla de realismo político con elementos fantásticos crea un mundo que, aunque lleno de dragones y magia, refleja de manera sorprendente las complejidades y contradicciones de nuestra propia realidad. La saga desafía las convenciones del género de fantasía, subvirtiendo expectativas y presentando un mundo donde los héroes pueden caer y los villanos pueden encontrar la redención.

Al final, la historia nos recuerda que, en el gran juego de la vida y el poder, las consecuencias de nuestras acciones a menudo superan nuestras intenciones, y que la verdadera fuerza reside no solo en la capacidad de conquistar, sino también en la sabiduría para gobernar con justicia y la humildad para reconocer nuestras propias limitaciones.

Esta epopeya quedará grabada en la memoria colectiva como un recordatorio de la complejidad de la naturaleza humana y del eterno conflicto entre nuestros ideales más nobles y nuestros impulsos más oscuros. Es un testimonio del poder de la narración para inspirar, provocar y, en última instancia, iluminar los rincones más profundos del alma humana.
`

export default function ProtectedPage() {
  const { user, isLoading: isUserLoading, error: userError } = useUser()
  const [title, setTitle] = useState('')
  const [chapter, setChapter] = useState('')
  const [summary, setSummary] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')
  const [summaryType, setSummaryType] = useState<'specific' | 'general'>('general')

  const fetchSummary = async () => {
    setIsSearching(true)
    setError('')
    setSummary('')

    // Simulamos una llamada a la API con un retraso
    setTimeout(() => {
      setSummary(extremelyLongSummary)
      setIsSearching(false)
    }, 2000)

    // Aquí iría la llamada real a la API, que hemos comentado para esta demostración
    /*
    const content = summaryType === 'specific' && chapter
      ? `Proporciona un resumen objetivo y conciso de lo que sucede en el capítulo/película ${chapter} de "${title}". Limítate a describir solo los eventos principales de la trama, sin añadir información adicional.`
      : `Proporciona un resumen objetivo y conciso de los eventos principales en la serie/película "${title}"${chapter ? ` hasta el capítulo ${chapter}` : ''}. Enfócate en la historia principal.`
    
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          { role: "system", content: "Eres un experto en cine que proporciona resúmenes objetivos y concisos." },
          { role: "user", content: content }
        ],
        max_tokens: 1000,
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
    */
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchSummary()
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
              <select
                value={summaryType}
                onChange={(e) => setSummaryType(e.target.value as 'specific' | 'general')}
                className="w-full sm:w-1/3 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="general">Resumen General</option>
                <option value="specific">Resumen Específico</option>
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
            <div className="mt-6 p-4 bg-gray-100 rounded-md overflow-auto max-h-[70vh]">
              <h2 className="font-bold text-lg mb-2 text-gray-800 sticky top-0 bg-gray-100 py-2">Resumen:</h2>
              <div 
                className="text-gray-700 whitespace-pre-wrap"
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