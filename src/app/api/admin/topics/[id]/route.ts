import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - 获取话题详情（管理用，按数字ID查询）
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .select('*')
      .eq('id', id)
      .single()

    if (topicError || !topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    const { data: contents, error: contentsError } = await supabase
      .from('topic_content')
      .select('*')
      .eq('topic_id', topic.id)
      .order('fetched_at', { ascending: false })

    return NextResponse.json({
      topic,
      contents: contents || [],
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - 更新话题
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { data, error } = await supabase
      .from('topics')
      .update({
        name: body.name,
        name_zh: body.name_zh,
        name_en: body.name_en,
        display_name: body.display_name,
        description: body.description,
        description_zh: body.description_zh,
        description_en: body.description_en,
        display: body.display,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating topic:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ topic: data })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
