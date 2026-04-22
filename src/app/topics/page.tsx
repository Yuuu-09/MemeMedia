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
  heat_24h_ago: number | null
  total_tokens: number
  created_at?: string
}

async function getHotTopics(): Promise<Topic[]> {
  const { data, error } = await supabase
    .from('topic_overview')
    .select('id,slug,name,name_zh,name_en,display_name,description,description_zh,description_en,keywords,latest_heat,heat_24h_ago,total_tokens,status,display,created_at')
    .eq('display', true)
    .order('latest_heat', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Supabase error:', error)
    return []
  }

  // 过滤 active 状态，且把 null 热度视为 0 并排序
  return (data || [])
    .filter((t: any) => t.status?.toLowerCase?.() === 'active')
    .map((t: any) => ({ ...t, latest_heat: t.latest_heat || 0 }))
    .sort((a: any, b: any) => b.latest_heat - a.latest_heat)
    .slice(0, 50)
}

async function getRisingTopics(): Promise<Topic[]> {
  const { data, error } = await supabase
    .from('topic_overview')
    .select('id,slug,name,name_zh,name_en,display_name,description,description_zh,description_en,keywords,latest_heat,heat_24h_ago,total_tokens,status,display,created_at')
    .eq('display', true)
    .gt('heat_24h_ago', 0)
    .limit(100)

  if (error) {
    console.error('Rising topics error:', error)
    return []
  }

  return (data || [])
    .filter((t: any) => t.status?.toLowerCase?.() === 'active')
    .map((t: any) => ({
      ...t,
      latest_heat: t.latest_heat || 0,
      rise_pct: ((t.latest_heat - t.heat_24h_ago) / t.heat_24h_ago) * 100,
    }))
    .sort((a: any, b: any) => b.rise_pct - a.rise_pct)
    .slice(0, 20)
}

async function getNewestTopics(): Promise<Topic[]> {
  const { data, error } = await supabase
    .from('topic_overview')
    .select('id,slug,name,name_zh,name_en,display_name,description,description_zh,description_en,keywords,latest_heat,heat_24h_ago,total_tokens,status,display,created_at')
    .eq('display', true)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Newest topics error:', error)
    return []
  }

  return (data || []).filter((t: any) => t.status?.toLowerCase?.() === 'active')
}

function HotTopicItem({ topic, index, lang }: { topic: Topic; index: number; lang: 'zh' | 'en' }) {
  return (
    <Link
      href={`/topic/${topic.id}`}
      className="group block card-glow rounded-2xl p-3.5"
    >
      <div className="flex items-start gap-3">
        <div className={`text-lg font-black w-8 text-center shrink-0 mt-0.5 ${
          index === 0 ? 'text-yellow-400' :
          index === 1 ? 'text-gray-300' :
          index === 2 ? 'text-orange-400' :
          'text-gray-600'
        }`}>
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white leading-snug group-hover:text-purple-300 transition-colors duration-300">
            {pickName(lang, topic)}
          </h3>
          <p className="text-gray-600 text-xs line-clamp-1 mt-1">
            {pickDescription(lang, topic) || ui.noDescription[lang]}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-700">{topic.total_tokens} {ui.relatedTokens[lang]}</span>
            <span className="text-sm font-bold text-purple-400">🔥 {topic.latest_heat?.toFixed(0) || '0'}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function RisingTopicItem({ topic, index, lang, risePct }: { topic: Topic; index: number; lang: 'zh' | 'en'; risePct: number }) {
  return (
    <Link
      href={`/topic/${topic.id}`}
      className="group block card-glow rounded-2xl p-3"
    >
      <div className="flex items-center gap-3">
        <div className={`text-sm font-black w-6 text-center shrink-0 ${
          index === 0 ? 'text-yellow-400' :
          index === 1 ? 'text-gray-300' :
          index === 2 ? 'text-orange-400' :
          'text-gray-600'
        }`}>
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-white leading-snug group-hover:text-green-300 transition-colors duration-300">
            {pickName(lang, topic)}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-700">{topic.total_tokens} {ui.relatedTokens[lang]}</span>
            <span className={`text-sm font-bold ${risePct > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {risePct > 0 ? '+' : ''}{risePct.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function NewestTopicItem({ topic, index, lang }: { topic: Topic; index: number; lang: 'zh' | 'en' }) {
  return (
    <Link
      href={`/topic/${topic.id}`}
      className="group block card-glow rounded-2xl p-3"
    >
      <div className="flex items-center gap-3">
        <div className="text-sm font-black w-6 text-center shrink-0 text-gray-600">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-white leading-snug group-hover:text-cyan-300 transition-colors duration-300">
            {pickName(lang, topic)}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-700">{topic.total_tokens} {ui.relatedTokens[lang]}</span>
            <span className="text-sm font-bold text-purple-400">🔥 {topic.latest_heat?.toFixed(0) || '0'}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default async function TopicsPage() {
  let hotTopics: Topic[] = []
  let risingTopics: Topic[] = []
  let newestTopics: Topic[] = []
  let lang: 'zh' | 'en' = 'zh'

  try {
    lang = await getLanguage()
  } catch (e) {
    console.error('Language error:', e)
  }

  try {
    [hotTopics, risingTopics, newestTopics] = await Promise.all([
      getHotTopics(),
      getRisingTopics(),
      getNewestTopics(),
    ])
  } catch (e: any) {
    console.error('Topics fetch error:', e)
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      {/* 背景网格 - 更细腻 */}
      <div className="fixed inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
        backgroundSize: '80px 80px'
      }} />
      
      {/* 背景光晕 */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[400px] bg-purple-600/8 rounded-full blur-[180px] pointer-events-none" />
      <div className="fixed top-1/3 right-0 w-[500px] h-[300px] bg-cyan-500/6 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-600 hover:text-white text-sm transition-colors">
              {ui.back[lang]}
            </Link>
            <h1 className="text-xl font-bold text-white">📋 Topic Lists</h1>
          </div>
          <LanguageSwitcher />
        </div>

        {/* 三栏 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hot */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                🔥 {lang === 'zh' ? '热度总榜' : 'Hot Topics'}
              </h2>
            </div>
            <div className="space-y-2 max-h-[45vh] md:max-h-[calc(100vh-200px)] overflow-y-auto pr-1 scrollbar-thin">
              {hotTopics.map((topic, index) => (
                <HotTopicItem key={topic.id} topic={topic} index={index} lang={lang} />
              ))}
              {hotTopics.length === 0 && (
                <div className="text-center text-gray-700 py-10">
                  {ui.noTopicData[lang]}
                </div>
              )}
            </div>
          </div>

          {/* Rising */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full" />
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                📈 {lang === 'zh' ? '24h 飙升' : '24h Rising'}
              </h2>
            </div>
            <div className="space-y-2 max-h-[45vh] md:max-h-[calc(100vh-200px)] overflow-y-auto pr-1 scrollbar-thin">
              {risingTopics.map((topic: any, index) => (
                <RisingTopicItem
                  key={topic.id}
                  topic={topic}
                  index={index}
                  lang={lang}
                  risePct={topic.rise_pct}
                />
              ))}
              {risingTopics.length === 0 && (
                <p className="text-gray-700 text-sm py-10 text-center">{lang === 'zh' ? '暂无数据' : 'No data'}</p>
              )}
            </div>
          </div>

          {/* Newest */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                🆕 {lang === 'zh' ? '最新话题' : 'Newest'}
              </h2>
            </div>
            <div className="space-y-2 max-h-[45vh] md:max-h-[calc(100vh-200px)] overflow-y-auto pr-1 scrollbar-thin">
              {newestTopics.map((topic, index) => (
                <NewestTopicItem key={topic.id} topic={topic} index={index} lang={lang} />
              ))}
              {newestTopics.length === 0 && (
                <p className="text-gray-700 text-sm py-10 text-center">{lang === 'zh' ? '暂无数据' : 'No data'}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
