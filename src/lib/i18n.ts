import { cookies } from 'next/headers'

export type Lang = 'zh' | 'en'

export async function getLanguage(): Promise<Lang> {
  const cookieStore = await cookies()
  const lang = cookieStore.get('lang')?.value
  return lang === 'zh' || lang === 'en' ? lang : 'zh'
}

export function t(lang: Lang, dict: Record<string, string>) {
  return dict[lang] || dict['zh'] || ''
}

// 产品文案翻译表
export const ui = {
  brand: {
    zh: 'MemeMedia',
    en: 'MemeMedia',
  },
  tagline: {
    zh: '追踪 MemeCoin 交易热度，发现正在发酵的社会话题',
    en: 'Track MemeCoin trading heat and discover emerging social topics',
  },
  viewHotTopics: {
    zh: '查看话题',
    en: 'View Topics',
  },
  realTimeHeat: {
    zh: '实时热度追踪',
    en: 'Real-time Heat Tracking',
  },
  realTimeHeatDesc: {
    zh: '每小时采集 Four.meme 交易数据，计算话题热度值',
    en: 'Hourly data collection from Four.meme, computing topic heat scores',
  },
  aiAggregation: {
    zh: 'AI 智能聚合',
    en: 'AI Smart Aggregation',
  },
  aiAggregationDesc: {
    zh: '自动归类同一话题的多个代币，生成话题摘要',
    en: 'Auto-categorize multiple tokens under the same topic with summaries',
  },
  contentAggregation: {
    zh: '内容聚合',
    en: 'Content Aggregation',
  },
  contentAggregationDesc: {
    zh: '汇集相关新闻报道和社交讨论，呈现多元视角',
    en: 'Aggregate related news and social discussions from multiple angles',
  },
  back: {
    zh: '← 返回',
    en: '← Back',
  },
  backToList: {
    zh: '← 返回列表',
    en: '← Back to List',
  },
  hotTopicsRank: {
    zh: '📋 Topic Lists',
    en: '📋 Topic Lists',
  },
  rising: {
    zh: '↗ 热度上升',
    en: '↗ Rising',
  },
  noDescription: {
    zh: '暂无描述',
    en: 'No description',
  },
  relatedTokens: {
    zh: '个相关代币',
    en: 'related tokens',
  },
  heatValue: {
    zh: '热度值',
    en: 'Heat Score',
  },
  noTopicData: {
    zh: '暂无话题数据，请先创建话题并计算热度',
    en: 'No topic data yet. Create topics and compute heat first.',
  },
  noTopicDesc: {
    zh: '暂无话题描述',
    en: 'No topic description',
  },
  relatedTokensTitle: {
    zh: '💰 相关代币',
    en: '💰 Related Tokens',
  },
  graduated: {
    zh: '✅ 已毕业',
    en: '✅ Graduated',
  },
  bonding: {
    zh: '🚀 内盘',
    en: '🚀 Bonding',
  },
  confidence: {
    zh: '置信度',
    en: 'Confidence',
  },
  noRelatedTokens: {
    zh: '暂无关联代币',
    en: 'No related tokens',
  },
  relatedContentTitle: {
    zh: '📰 相关内容',
    en: '📰 Related Content',
  },
  noRelatedContent: {
    zh: '暂无关联内容',
    en: 'No related content',
  },
  featuresTitle: {
    zh: '✨ 核心能力',
    en: '✨ Key Features',
  },
  loadingChart: {
    zh: '加载图表中...',
    en: 'Loading chart...',
  },
  dataMissing: {
    zh: '⚠️ 数据缺失',
    en: '⚠️ Data missing',
  },
} as const

export function pickName(lang: Lang, item: { name?: string | null; name_zh?: string | null; name_en?: string | null; display_name?: string | null }) {
  if (lang === 'en' && item.name_en) return item.name_en
  if (lang === 'zh' && item.name_zh) return item.name_zh
  return item.display_name || item.name || ''
}

export function pickDescription(lang: Lang, item: { description?: string | null; description_zh?: string | null; description_en?: string | null }) {
  if (lang === 'en' && item.description_en) return item.description_en
  if (lang === 'zh' && item.description_zh) return item.description_zh
  return item.description || ''
}
