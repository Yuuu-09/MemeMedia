'use client'

import { useState, useEffect } from 'react'

export default function LanguageSwitcher() {
  const [lang, setLang] = useState<'zh' | 'en'>('zh')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const cookie = document.cookie.match(/lang=(zh|en)/)
    if (cookie) setLang(cookie[1] as 'zh' | 'en')
  }, [])

  function switchLanguage(newLang: 'zh' | 'en') {
    document.cookie = `lang=${newLang};path=/;max-age=31536000`
    setLang(newLang)
    setOpen(false)
    window.location.reload()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition"
      >
        <span>{lang === 'zh' ? '🇨🇳 中文' : '🇺🇸 English'}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-32 bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden z-50">
          <button
            onClick={() => switchLanguage('zh')}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 transition ${lang === 'zh' ? 'text-purple-400' : 'text-white'}`}
          >
            🇨🇳 中文
          </button>
          <button
            onClick={() => switchLanguage('en')}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 transition ${lang === 'en' ? 'text-purple-400' : 'text-white'}`}
          >
            🇺🇸 English
          </button>
        </div>
      )}
    </div>
  )
}
