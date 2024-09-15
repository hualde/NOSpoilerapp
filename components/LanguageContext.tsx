'use client'

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react'

type Language = 'es' | 'en' | 'fr'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

const detectBrowserLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const browserLang = navigator.language.split('-')[0]
    if (['es', 'en', 'fr'].includes(browserLang)) {
      return browserLang as Language
    }
  }
  return 'en' // Default to English if not detected or not supported
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    const detectedLang = detectBrowserLanguage()
    setLanguage(detectedLang)
  }, [])

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}