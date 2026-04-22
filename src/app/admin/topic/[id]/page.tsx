'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Topic {
  id: number
  slug: string
  name: string
  name_zh: string | null
  name_en: string | null
  display_name: string | null
  description: string | null
  description_zh: string | null
  description_en: string | null
  display: boolean
}

interface Content {
  id: number
  title: string | null
  url: string
  source: string | null
  content_type: string | null
  display: boolean
  fetched_at: string
}

export default function AdminTopicEditPage() {
  const params = useParams()
  const id = params.id as string

  const [topic, setTopic] = useState<Topic | null>(null)
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [newContent, setNewContent] = useState({ title: '', url: '', source: '', content_type: 'news' })
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/admin/topics/${id}`)
      .then(r => r.json())
      .then(data => {
        setTopic(data.topic)
        setContents(data.contents || [])
        setLoading(false)
      })
  }, [id])

  async function saveTopic() {
    if (!topic) return
    setSaving(true)
    const res = await fetch(`/api/admin/topics/${topic.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: topic.name,
        name_zh: topic.name_zh,
        name_en: topic.name_en,
        display_name: topic.display_name,
        description: topic.description,
        description_zh: topic.description_zh,
        description_en: topic.description_en,
        display: topic.display,
      }),
    })
    setSaving(false)
    setMessage(res.ok ? '✅ 保存成功' : '❌ 保存失败')
    setTimeout(() => setMessage(''), 2000)
  }

  async function toggleContentDisplay(contentId: number, current: boolean) {
    const res = await fetch(`/api/admin/content/${contentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display: !current }),
    })
    if (res.ok) {
      setContents(contents.map(c => c.id === contentId ? { ...c, display: !current } : c))
    }
  }

  async function deleteContent(contentId: number) {
    if (!confirm('确定删除这条内容？')) return
    const res = await fetch(`/api/admin/content/${contentId}`, { method: 'DELETE' })
    if (res.ok) {
      setContents(contents.filter(c => c.id !== contentId))
    }
  }

  async function addContent() {
    if (!topic || !newContent.url) return
    const res = await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic_id: topic.id,
        title: newContent.title,
        url: newContent.url,
        source: newContent.source,
        content_type: newContent.content_type,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      setContents([data.content, ...contents])
      setNewContent({ title: '', url: '', source: '', content_type: 'news' })
      setShowAddForm(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-[#0a0a0f] text-gray-600 text-center py-20">加载中...</div>
  if (!topic) return <div className="min-h-screen bg-[#0a0a0f] text-gray-600 text-center py-20">话题不存在</div>

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <div className="fixed inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />
      <div className="relative container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-600 hover:text-white text-sm">← 返回管理</Link>
            <h1 className="text-xl font-bold text-white">编辑话题</h1>
          </div>
          {message && <span className="text-sm text-green-400">{message}</span>}
        </div>

        {/* 话题编辑 */}
        <div className="card-glow rounded-3xl p-5 md:p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">话题信息</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">名称（中文）</label>
                <input
                  value={topic.name_zh || ''}
                  onChange={e => setTopic({ ...topic, name_zh: e.target.value })}
                  placeholder={topic.name}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-700 focus:border-purple-500/50 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">名称（英文）</label>
                <input
                  value={topic.name_en || ''}
                  onChange={e => setTopic({ ...topic, name_en: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-700 focus:border-purple-500/50 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1.5">显示名称</label>
              <input
                value={topic.display_name || ''}
                onChange={e => setTopic({ ...topic, display_name: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-700 focus:border-purple-500/50 focus:outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">描述（中文）</label>
                <textarea
                  value={topic.description_zh || ''}
                  onChange={e => setTopic({ ...topic, description_zh: e.target.value })}
                  rows={3}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-700 focus:border-purple-500/50 focus:outline-none transition resize-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">描述（英文）</label>
                <textarea
                  value={topic.description_en || ''}
                  onChange={e => setTopic({ ...topic, description_en: e.target.value })}
                  rows={3}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-700 focus:border-purple-500/50 focus:outline-none transition resize-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={topic.display}
                  onChange={e => setTopic({ ...topic, display: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-white/[0.03] text-purple-500 focus:ring-purple-500/20"
                />
                <span className="text-sm text-gray-400">展示此话题</span>
              </label>
            </div>

            <button
              onClick={saveTopic}
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-semibold hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存话题'}
            </button>
          </div>
        </div>

        {/* 内容管理 */}
        <div className="card-glow rounded-3xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">相关内容 ({contents.length})</h2>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded-lg text-xs font-medium hover:bg-purple-600/30 transition"
            >
              + 添加内容
            </button>
          </div>

          {showAddForm && (
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 mb-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  value={newContent.title}
                  onChange={e => setNewContent({ ...newContent, title: e.target.value })}
                  placeholder="标题"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-700 focus:border-purple-500/50 focus:outline-none transition"
                />
                <input
                  value={newContent.source}
                  onChange={e => setNewContent({ ...newContent, source: e.target.value })}
                  placeholder="来源"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-700 focus:border-purple-500/50 focus:outline-none transition"
                />
              </div>
              <input
                value={newContent.url}
                onChange={e => setNewContent({ ...newContent, url: e.target.value })}
                placeholder="URL *"
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-700 focus:border-purple-500/50 focus:outline-none transition"
              />
              <div className="flex gap-2">
                <button
                  onClick={addContent}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-500 transition"
                >
                  添加
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-white/5 text-gray-500 rounded-lg text-sm font-medium hover:text-white transition"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {contents.map(content => (
              <div
                key={content.id}
                className={`flex items-center gap-3 p-3 border rounded-xl transition ${
                  content.display ? 'border-white/5 bg-white/[0.02]' : 'border-red-500/10 bg-red-500/[0.02] opacity-60'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{content.title || content.url}</div>
                  <div className="text-xs text-gray-700 mt-0.5">{content.source} · {content.content_type}</div>
                </div>
                <button
                  onClick={() => toggleContentDisplay(content.id, content.display)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition shrink-0 ${
                    content.display
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-gray-700/30 text-gray-500 border border-gray-700'
                  }`}
                >
                  {content.display ? '展示' : '隐藏'}
                </button>
                <button
                  onClick={() => deleteContent(content.id)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-red-400 border border-red-500/20 hover:bg-red-500/10 transition shrink-0"
                >
                  删除
                </button>
              </div>
            ))}
            {contents.length === 0 && (
              <p className="text-gray-700 text-sm py-6 text-center">暂无内容</p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}