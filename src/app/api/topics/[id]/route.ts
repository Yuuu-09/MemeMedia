import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 获取话题详情
    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .select('*')
      .eq('slug', id)
      .single()

    if (topicError || !topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    // 获取关联的代币
    const { data: tokens, error: tokensError } = await supabase
      .from('token_topics')
      .select(`
        confidence,
        is_primary,
        matched_keywords,
        fourmeme_tokens!inner(token_address, name, short_name, is_graduated, label, metadata)
      `)
      .eq('topic_id', topic.id)
      .order('confidence', { ascending: false })

    // 获取内容链接
    const { data: contents, error: contentsError } = await supabase
      .from('topic_content')
      .select('*')
      .eq('topic_id', topic.id)
      .order('fetched_at', { ascending: false })
      .limit(20)

    // 获取最新热度
    const { data: heat, error: heatError } = await supabase
      .from('topic_heat_hourly')
      .select('*')
      .eq('topic_id', topic.id)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({
      topic,
      tokens: tokens || [],
      contents: contents || [],
      latestHeat: heat || null
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
