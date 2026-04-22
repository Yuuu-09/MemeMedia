import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('topic_content')
      .insert({
        topic_id: body.topic_id,
        title: body.title,
        url: body.url,
        source: body.source,
        content_type: body.content_type || 'news',
        display: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating content:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ content: data })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}