'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Topic {
  id: number
  slug: string
  name: string
  name_zh: string | null
  name_en: string | null
  display_name: string | null
  description: string | null
  status: string
  display: boolean
  total_tokens: number | null
  total_content: number | null
  created_at: string
}

export default function AdminPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'visible' | 'hidden'>('all')
  const [sortBy, setSortBy] = useState<'created' | 'heat' | 'tokens' | 'content' | 'updated'>('created')

  useEffect(() => {
    fetch(`/api/admin/topics?sort=${sortBy}&filter=${filter}`)
      .then(r => r.json())
      .then(data => {
        setTopics(data.topics || [])
        setLoading(false)
      })
  }, [sortBy, filter])

  async function toggleDisplay(id: number, current: boolean) {
    const res = await fetch(`/api/admin/topics/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display: !current }),
    })
    if (res.ok) {
      setTopics(topics.map(t => t.id === id ? { ...t, display: !current } : t))
    }
  }

  const filtered = topics.filter(t => {
    if (filter === 'visible') return t.display
    if (filter === 'hidden') return !t.display
    return true
  })

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <div className="fixed inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />
      <div className="relative container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-600 hover:text-white text-sm">← 返回首页</Link>
            <h1 className="text-xl font-bold text-white">⚙️ 管理后台</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* 排序 */}
            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value as any); setLoading(true) }}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-400 focus:border-purple-500/50 focus:outline-none"
            >
              <option value="created">按创建时间</option>
              <option value="heat">按热度</option>
              <option value="tokens">按代币数</option>
              <option value="content">按内容数</option>
              <option value="updated">按更新时间</option>
            </select>

            {/* 筛选 */}
            <div className="flex gap-2">
              {(['all', 'visible', 'hidden'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setLoading(true) }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    filter === f
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-gray-500 hover:text-white'
                  }`}
                >
                  {f === 'all' ? '全部' : f === 'visible' ? '展示中' : '已隐藏'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-600 text-center py-20">加载中...</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((topic) => (
              <div
                key={topic.id}
                className={`flex items-center gap-4 p-4 card-glow rounded-xl ${
                  topic.display ? '' : 'opacity-60'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm truncate">
                      {topic.display_name || topic.name}
                    </span>
                    {!topic.display && (
                      <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded-full border border-red-500/20">
                        已隐藏
                      </span>
                    )}
                  </div>
                  <div className="text-gray-700 text-xs mt-1">
                    ID: {topic.id} · 热度: {(topic as any).latest_heat?.toFixed?.(0) || 0} · 代币: {topic.total_tokens || 0} · 内容: {topic.total_content || 0}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => toggleDisplay(topic.id, topic.display)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      topic.display
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                        : 'bg-gray-700/30 text-gray-500 border border-gray-700 hover:bg-gray-700/50'
                    }`}
                  >
                    {topic.display ? '展示中' : '已隐藏'}
                  </button>
                  <Link
                    href={`/admin/topic/${topic.id}`}
                    className="px-3 py-1.5 bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded-lg text-xs font-medium hover:bg-purple-600/30 transition"
                  >
                    编辑
                  </Link>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-gray-700 text-sm py-20 text-center">暂无话题</p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}