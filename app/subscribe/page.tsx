'use client'

import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useLanguage } from '../../components/LanguageContext'

export default function Subscribe() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const { language } = useLanguage()

  const content = {
    es: {
      title: 'Suscríbete',
      loading: 'Cargando...',
      alreadySubscribed: 'Ya estás suscrito. Redirigiendo...',
      subscribeButton: 'Suscribirse',
      loginPrompt: 'Por favor, inicia sesión para suscribirte.',
    },
    en: {
      title: 'Subscribe',
      loading: 'Loading...',
      alreadySubscribed: 'You are already subscribed. Redirecting...',
      subscribeButton: 'Subscribe',
      loginPrompt: 'Please log in to subscribe.',
    },
    fr: {
      title: 'S\'abonner',
      loading: 'Chargement...',
      alreadySubscribed: 'Vous êtes déjà abonné. Redirection...',
      subscribeButton: 'S\'abonner',
      loginPrompt: 'Veuillez vous connecter pour vous abonner.',
    }
  }

  const t = content[language]

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus()
    }
  }, [user])

  const checkSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/check-subscription')
      if (!response.ok) {
        throw new Error('Failed to fetch subscription status')
      }
      const data = await response.json()
      setIsSubscribed(data.isSubscribed)
      if (data.isSubscribed) {
        setTimeout(() => router.push('/protected'), 2000)
      }
    } catch (error) {
      console.error('Error checking subscription status:', error)
    }
  }

  const handleSubscribe = async () => {
    try {
      const response = await fetch('/api/create-checkout-session', { method: 'POST' })
      const data = await response.json()
      router.push(data.url)
    } catch (error) {
      console.error('Error creating checkout session:', error)
    }
  }

  if (isLoading) {
    return <div className="text-center p-4">{t.loading}</div>
  }

  if (isSubscribed) {
    return <div className="text-center p-4">{t.alreadySubscribed}</div>
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4 text-center">{t.title}</h1>
      {user ? (
        <button
          onClick={handleSubscribe}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
        >
          {t.subscribeButton}
        </button>
      ) : (
        <p className="text-center">{t.loginPrompt}</p>
      )}
    </div>
  )
}