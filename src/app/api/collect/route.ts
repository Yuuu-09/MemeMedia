import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 鉴权验证
function verifyAuth(request: Request): boolean {
  const authHeader = request.headers.get('authorization')
  const expectedToken = process.env.CRON_SECRET
  
  if (!expectedToken) {
    console.warn('⚠️ CRON_SECRET not set, skipping auth check')
    return true
  }
  
  return authHeader === `Bearer ${expectedToken}`
}

// 带超时的 fetch
async function fetchWithTimeout(url: string, options: RequestInit, timeout = 30000): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

// Four.meme API 采集函数（带重试）
async function fetchRankings(type: 'VOL_DAY_1' | 'Graduated', retries = 3): Promise<any[]> {
  const url = 'https://api.four.meme/public/token/ranking'
  
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Fetching ${type}, attempt ${i + 1}/${retries}...`)
      
      const res = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderBy: type,
          pageSize: 100
        })
      }, 15000) // 15秒超时
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      
      const data = await res.json()
      console.log(`✅ ${type} fetched: ${data.data?.length || 0} tokens`)
      return data.data || []
      
    } catch (error: any) {
      console.error(`❌ Attempt ${i + 1} failed:`, error.message)
      if (i === retries - 1) throw error
      // 等待 1 秒后重试
      await new Promise(r => setTimeout(r, 1000))
    }
  }
  
  return []
}

// 插入代币到数据库
async function insertToken(token: any) {
  try {
    const { error } = await supabase
      .from('fourmeme_tokens')
      .upsert({
        token_address: token.tokenAddress,
        name: token.name,
        short_name: token.shortName,
        symbol_base: token.symbol,
        created_at: token.createDate ? new Date(token.createDate).toISOString() : null,
        is_graduated: token.status === 'TRADE',
        version: token.version?.toString(),
        network_code: 'BSC',
        label: token.tag,
        metadata: {
          description: token.descr,
          twitter_url: token.twitterUrl,
          web_url: token.webUrl,
          telegram_url: token.telegramUrl,
          img: token.img
        }
      }, { onConflict: 'token_address' })
    
    return !error
  } catch (e) {
    console.error('Insert token error:', e)
    return false
  }
}

// 插入时序数据
async function insertStats(token: any, rankType: 'internal' | 'external', rank: number) {
  try {
    const { error } = await supabase
      .from('fourmeme_hourly_stats')
      .upsert({
        token_address: token.tokenAddress,
        recorded_at: new Date().toISOString(),
        price: token.price,
        market_cap: token.cap,
        volume_24h: token.day1Vol,
        volume_4h: token.hour4Vol,
        volume_1h: token.hourVol,
        holder_count: token.hold || null,
        progress: token.progress,
        increase_24h: token.day1Increase || token.increase,
        ranking_internal: rankType === 'internal' ? rank : null,
        ranking_external: rankType === 'external' ? rank : null,
        raw_data: token
      }, { 
        onConflict: 'token_address,recorded_at'
      })
    
    return !error
  } catch (e) {
    console.error('Insert stats error:', e)
    return false
  }
}

// 主采集函数
export async function GET(request: Request) {
  // 鉴权验证
  if (!verifyAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized. Missing or invalid CRON_SECRET.' },
      { status: 401 }
    )
  }

  const results = {
    internal: { tokens: 0, stats: 0 },
    external: { tokens: 0, stats: 0 },
    errors: [] as string[]
  }

  try {
    // 1. 采集内盘
    console.log('🚀 Starting collection...')
    const internalTokens = await fetchRankings('VOL_DAY_1')
    
    for (let i = 0; i < internalTokens.length; i++) {
      const token = internalTokens[i]
      
      const tokenInserted = await insertToken(token)
      if (tokenInserted) results.internal.tokens++
      
      const statsInserted = await insertStats(token, 'internal', i + 1)
      if (statsInserted) results.internal.stats++
    }

    // 2. 采集外盘
    const externalTokens = await fetchRankings('Graduated')
    
    for (let i = 0; i < externalTokens.length; i++) {
      const token = externalTokens[i]
      
      const tokenInserted = await insertToken(token)
      if (tokenInserted) results.external.tokens++
      
      const statsInserted = await insertStats(token, 'external', i + 1)
      if (statsInserted) results.external.stats++
    }

    console.log('✅ Collection completed:', results)
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    })

  } catch (error: any) {
    console.error('❌ Collection error:', error)
    results.errors.push(error.message)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      results
    }, { status: 500 })
  }
}

// 配置函数超时时间为 60 秒
export const maxDuration = 60
