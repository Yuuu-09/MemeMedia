import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // 查询数据库统计
    const { data: tokenCount } = await supabase
      .from('fourmeme_tokens')
      .select('*', { count: 'exact', head: true })
    
    const { data: statsCount } = await supabase
      .from('fourmeme_hourly_stats')
      .select('*', { count: 'exact', head: true })
    
    // 查询最新采集时间
    const { data: latestStats } = await supabase
      .from('fourmeme_hourly_stats')
      .select('recorded_at')
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({
      status: 'ok',
      stats: {
        totalTokens: tokenCount?.length || 0,
        totalStats: statsCount?.length || 0,
        lastCollection: latestStats?.recorded_at || null
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message
    }, { status: 500 })
  }
}
