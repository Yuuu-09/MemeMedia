import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getLanguage, ui, pickName, pickDescription } from '@/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export const dynamic = 'force-dynamic'

interface Topic {
  id: number
  slug: string
  name: string
  name_zh?: string
  name_en?: string
  display_name: string | null
  description: string | null
  description_zh?: string
  description_en?: string
  keywords: string[] | null
  latest_heat: number | null
  total_tokens: number
}

async function getTopTopics(): Promise<Topic[]> {
  const { data, error } = await supabase
    .from('topic_overview')
    .select('id,slug,name,name_zh,name_en,display_name,description,description_zh,description_en,keywords,latest_heat,total_tokens,status,display')
    .eq('display', true)
    .order('latest_heat', { ascending: false })
    .limit(3)

  if (error) {
    console.error('Supabase error:', error)
    return []
  }

  return (data || []).filter((t: any) => t.status?.toLowerCase?.() === 'active')
}

export default async function Home() {
  let lang: 'zh' | 'en' = 'zh'
  let topTopics: Topic[] = []

  try {
    lang = await getLanguage()
  } catch (e) {
    console.error('Language error:', e)
  }

  try {
    topTopics = await getTopTopics()
  } catch (e) {
    console.error('Top topics error:', e)
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      {/* 背景网格 + 光效 */}
      <div className="fixed inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
        backgroundSize: '80px 80px'
      }} />
      
      {/* 顶部光晕 - 更大更柔和 */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-purple-600/10 rounded-full blur-[200px] pointer-events-none" />
      <div className="fixed top-[20%] right-0 w-[600px] h-[400px] bg-cyan-500/8 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative container mx-auto px-4 py-16">
        {/* Header */}
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>

        {/* Hero */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-6">
            <span className="text-gradient">
              MemeMedia
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-light">
            {ui.tagline[lang]}
          </p>
          <div className="mt-10">
            <Link
              href="/topics"
              className="group relative inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold btn-glow"
            >
              {ui.viewHotTopics[lang]}
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Top 3 */}
        {topTopics.length > 0 && (
          <div className="max-w-5xl mx-auto mb-20">
            <h2 className="text-lg font-medium text-gray-500 mb-6 text-center uppercase tracking-widest">
              🔥 {lang === 'zh' ? '今日热点 TOP 3' : "Today's Hot Topics TOP 3"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {topTopics.map((topic, index) => (
                <Link
                  key={topic.id}
                  href={`/topic/${topic.id}`}
                  className="group relative card-glow rounded-3xl p-6"
                >
                  <div className={`text-3xl font-black mb-4 ${
                    index === 0 ? 'text-yellow-400' :
                    index === 1 ? 'text-gray-300' :
                    'text-orange-400'
                  }`}>
                    0{index + 1}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors duration-300">
                    {pickName(lang, topic)}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-5 leading-relaxed">
                    {pickDescription(lang, topic) || ui.noDescription[lang]}
                  </p>
                  <div className="flex items-center justify-between text-sm border-t border-white/[0.06] pt-4">
                    <span className="text-gray-600">{topic.total_tokens} {ui.relatedTokens[lang]}</span>
                    <span className="text-purple-400 font-bold">🔥 {topic.latest_heat?.toFixed(0) || '0'}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-lg font-medium text-gray-500 mb-8 text-center uppercase tracking-widest">
            {ui.featuresTitle[lang]}
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: '📊', title: ui.realTimeHeat[lang], desc: ui.realTimeHeatDesc[lang], gradient: 'from-cyan-500/20 to-purple-500/20' },
              { icon: '🤖', title: ui.aiAggregation[lang], desc: ui.aiAggregationDesc[lang], gradient: 'from-purple-500/20 to-pink-500/20' },
              { icon: '📰', title: ui.contentAggregation[lang], desc: ui.contentAggregationDesc[lang], gradient: 'from-pink-500/20 to-orange-500/20' },
            ].map((f, i) => (
              <div key={i} className="group card-glow rounded-3xl p-6">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 text-2xl border border-white/[0.08]`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
