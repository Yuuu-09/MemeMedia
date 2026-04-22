import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 获取所有话题（管理用，包含隐藏的）
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get('sort') || 'created_at'
    const filterStatus = searchParams.get('filter') || 'all'

    // 基础查询
    let query = supabase
      .from('topics')
      .select('id, slug, name, name_zh, name_en, display_name, description, description_zh, description_en, status, display, total_tokens, total_content, created_at, updated_at')

    // 筛选状态
    if (filterStatus === 'visible') {
      query = query.eq('display', true)
    } else if (filterStatus === 'hidden') {
      query = query.eq('display', false)
    }

    // 排序
    if (sortBy === 'heat') {
      // 按最新热度排序（子查询获取最新热度）
      query = query.order('total_tokens', { ascending: false }) // fallback
    } else if (sortBy === 'tokens') {
      query = query.order('total_tokens', { ascending: false })
    } else if (sortBy === 'content') {
      query = query.order('total_content', { ascending: false })
    } else if (sortBy === 'updated') {
      query = query.order('updated_at', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data: topics, error } = await query

    if (error) {
      console.error('Error fetching topics:', error)
      return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }

    // 如果需要按热度排序，额外获取热度数据
    let result = topics || []
    if (sortBy === 'heat' && result.length > 0) {
      const topicIds = result.map(t => t.id)
      const { data: heatData } = await supabase
        .from('topic_heat_hourly')
        .select('topic_id, heat_score')
        .in('topic_id', topicIds)
        .order('recorded_at', { ascending: false })

      // 取每个话题的最新热度
      const latestHeat: Record<number, number> = {}
      if (heatData) {
        for (const h of heatData) {
          if (latestHeat[h.topic_id] === undefined) {
            latestHeat[h.topic_id] = h.heat_score
          }
        }
      }

      // 附加热度并排序
      result = result.map(t => ({
        ...t,
        latest_heat: latestHeat[t.id] || 0,
      })).sort((a, b) => (b.latest_heat || 0) - (a.latest_heat || 0))
    }

    return NextResponse.json({ topics: result })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 })
  }
}
