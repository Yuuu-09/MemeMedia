import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get('topicId')
    const limit = parseInt(searchParams.get('limit') || '24')

    if (!topicId) {
      return NextResponse.json({ error: 'topicId is required' }, { status: 400 })
    }

    const { data: heatData, error } = await supabase
      .from('topic_heat_hourly')
      .select('*')
      .eq('topic_id', topicId)
      .order('recorded_at', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('Error fetching heat data:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ heatData: heatData || [] })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
