import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: topics, error } = await supabase
      .from('topic_overview')
      .select('*')
      .eq('status', 'active')
      .order('latest_heat', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching topics:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ topics: topics || [] })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
