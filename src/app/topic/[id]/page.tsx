import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Suspense } from 'react'
import HeatChart from '@/components/HeatChart'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { getLanguage, ui, pickName, pickDescription } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

// 动态生成话题详情页的 metadata
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const numericId = parseInt(id, 10)

  let topicQuery
  if (!isNaN(numericId)) {
    const { data, error } = await supabase
      .from('topics')
      .select('name, name_en, display_name, description_en')
      .eq('id', numericId)
      .single()
    topicQuery = { data, error }
  } else {
    const { data, error } = await supabase
      .from('topics')
      .select('name, name_en, display_name, description_en')
      .eq('slug', id)
      .single()
    topicQuery = { data, error }
  }

  const topic = topicQuery.data
  const title = topic ? `MemeMedia: ${topic.name_en || topic.display_name || topic.name}` : 'MemeMedia'
  const description = topic?.description_en || 'Track MemeCoin trading heat and discover emerging social topics.'

  return {
    title,
    description,
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

function truncateAddress(addr: string) {
  return addr.length > 16 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr
}

function getTokenLogo(metadata: any): string | null {
  if (!metadata) return null
  return metadata.logo || metadata.image || metadata.icon || null
}

async function getTopicData(id: string) {
  const numericId = parseInt(id, 10)
  let topicQuery

  if (!isNaN(numericId)) {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('id', numericId)
      .single()
    topicQuery = { data, error }
  } else {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('slug', id)
      .single()
    topicQuery = { data, error }
  }

  if (topicQuery.error || !topicQuery.data) {
    console.error('Topic query error:', topicQuery.error)
    return null
  }

  const topic = topicQuery.data

  const { data: tokenTopicsRaw, error: ttError } = await supabase
    .from('token_topics')
    .select('token_address, confidence, is_primary, matched_keywords')
    .eq('topic_id', topic.id)
    .order('confidence', { ascending: false })

  if (ttError) {
    console.error('Token topics query error:', ttError)
  }

  let tokenTopics: any[] = []
  if (tokenTopicsRaw && tokenTopicsRaw.length > 0) {
    const addresses = tokenTopicsRaw.map((t) => t.token_address)
    const { data: tokensData } = await supabase
      .from('fourmeme_tokens')
      .select('token_address, name, short_name, is_graduated, label, metadata')
      .in('token_address', addresses)

    const tokenMap = new Map(tokensData?.map((t) => [t.token_address, t]) || [])

    tokenTopics = tokenTopicsRaw.map((tt) => ({
      ...tt,
      token: tokenMap.get(tt.token_address) || null,
    }))
  }

  const { data: contents, error: contentsError } = await supabase
    .from('topic_content')
    .select('*')
    .eq('topic_id', topic.id)
    .eq('display', true)
    .order('fetched_at', { ascending: false })
    .limit(10)

  if (contentsError) {
    console.error('Contents query error:', contentsError)
  }

  const { data: heatHistory, error: heatError } = await supabase
    .from('topic_heat_hourly')
    .select('*')
    .eq('topic_id', topic.id)
    .order('recorded_at', { ascending: true })
    .limit(168)

  if (heatError) {
    console.error('Heat history query error:', heatError)
  }

  return {
    topic,
    tokenTopics: tokenTopics || [],
    contents: contents || [],
    heatHistory: heatHistory || [],
  }
}

export default async function TopicDetailPage({ params }: PageProps) {
  const lang = await getLanguage()
  const { id } = await params
  const data = await getTopicData(id)

  if (!data) {
    notFound()
  }

  const { topic, tokenTopics, contents, heatHistory } = data

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
      <div className="fixed bottom-0 right-0 w-[500px] h-[300px] bg-pink-500/6 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative container mx-auto px-4 py-6 max-w-6xl">
        {/* 导航 */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/topics" className="text-gray-600 hover:text-white text-sm transition-colors">
            {ui.backToList[lang]}
          </Link>
          <LanguageSwitcher />
        </div>

        {/* 话题标题 */}
        <div className="card-glow rounded-3xl p-6 md:p-8 mb-6">
          <h1 className="text-2xl md:text-4xl font-black text-white mb-3 leading-tight tracking-tight">
            {pickName(lang, topic)}
          </h1>
          <p className="text-gray-500 text-base md:text-lg mb-5 leading-relaxed font-light">
            {pickDescription(lang, topic) || ui.noTopicDesc[lang]}
          </p>
          {topic.keywords && (
            <div className="flex flex-wrap gap-2">
              {topic.keywords.map((kw: string) => (
                <span
                  key={kw}
                  className="px-3 py-1 bg-purple-500/8 text-purple-400 border border-purple-500/15 rounded-full text-xs"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 热度趋势图 */}
        {heatHistory.length > 0 && (
          <div className="card-glow rounded-3xl p-5 md:p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full" />
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                {lang === 'zh' ? '📈 热度趋势 (7天)' : '📈 Heat Trend (7d)'}
              </h2>
            </div>
            <Suspense fallback={<div className="text-gray-600">{ui.loadingChart[lang]}</div>}>
              <HeatChart data={heatHistory} />
            </Suspense>
          </div>
        )}

        {/* 相关代币 */}
        <div className="card-glow rounded-3xl p-5 md:p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full" />
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              {ui.relatedTokensTitle[lang]} ({tokenTopics.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tokenTopics.map((tt: any, idx: number) => {
              const logo = getTokenLogo(tt.token?.metadata)
              const addr = tt.token_address || ''
              const fourUrl = addr ? `https://four.meme/token/${addr}` : '#'
              const gmgnUrl = addr ? `https://gmgn.ai/bsc/token/${addr}` : '#'
              return (
                <div
                  key={idx}
                  className="group flex flex-col p-3 bg-white/[0.02] border border-white/5 hover:border-yellow-500/20 rounded-xl transition-all hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#1a1a24] flex items-center justify-center shrink-0 overflow-hidden border border-white/5">
                      {logo ? (
                        <img src={logo} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <span className="text-gray-600 text-xs font-bold">
                          {tt.token?.short_name?.slice(0, 2) || '?'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium text-sm truncate">
                        {tt.token?.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-700 mt-0.5">
                        {truncateAddress(addr)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      tt.token?.is_graduated
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {tt.token?.is_graduated ? ui.graduated[lang] : ui.bonding[lang]}
                    </span>
                    {tt.token && (
                      <span className="text-xs text-gray-700">
                        {ui.confidence[lang]} {Math.round(tt.confidence * 100)}%
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <a
                      href={fourUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#1a1a24] border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white hover:border-yellow-500/30 transition"
                    >
                      <span className="text-[10px] font-bold">4️⃣</span>
                      Four.meme
                    </a>
                    <a
                      href={gmgnUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#1a1a24] border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white hover:border-green-500/30 transition"
                    >
                      <span className="text-[10px] font-bold">📈</span>
                      GMGN
                    </a>
                  </div>
                </div>
              )
            })}
            {tokenTopics.length === 0 && (
              <p className="text-gray-700 col-span-full">{ui.noRelatedTokens[lang]}</p>
            )}
          </div>
        </div>

        {/* 相关内容 */}
        <div className="card-glow rounded-3xl p-5 md:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              {ui.relatedContentTitle[lang]} ({contents.length})
            </h2>
          </div>
          <div className="space-y-2">
            {contents.map((content: any) => (
              <a
                key={content.id}
                href={content.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-3 bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 rounded-xl transition-all hover:bg-white/[0.04]"
              >
                <div className="text-white font-medium text-sm line-clamp-2 group-hover:text-cyan-300 transition-colors">
                  {content.title || content.url}
                </div>
                <div className="text-xs text-gray-700 mt-1">
                  {content.source} · {content.content_type}
                  {content.sentiment && (
                    <span
                      className={`ml-2 ${
                        content.sentiment === 'positive'
                          ? 'text-green-500'
                          : content.sentiment === 'negative'
                            ? 'text-red-500'
                            : 'text-gray-600'
                      }`}
                    >
                      {content.sentiment}
                    </span>
                  )}
                </div>
              </a>
            ))}
            {contents.length === 0 && (
              <p className="text-gray-700">{ui.noRelatedContent[lang]}</p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
