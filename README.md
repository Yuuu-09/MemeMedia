# MemeMedia

> **Track MemeCoin trading heat and discover emerging social topics.**
>
> 追踪 MemeCoin 交易热度，发现新兴社交话题。

---

MemeMedia is a real-time tracking platform for MemeCoin trading heat and emerging social topics. We aggregate data from the BNB Chain ecosystem (powered by Four.meme), use AI-driven topic clustering and content curation to help users discover trending tokens and understand the narratives behind them.

MemeMedia 是一个实时追踪 MemeCoin 交易热度与新兴社交话题的平台。我们聚合 BNB Chain 生态数据（基于 Four.meme），通过 AI 驱动的话题聚类与内容策展，帮助用户发现 trending 代币并理解其背后的叙事。



## How MemeMedia Works / MemeMedia 如何运作

### Token → Topic Mapping / 代币到话题的映射

MemeMedia uses a Large Language Model (LLM) to analyze token metadata (name, symbol, tags, and community descriptions) and group semantically similar tokens into social topics. Each token can belong to multiple topics with varying confidence scores.

MemeMedia 使用大语言模型（LLM）分析代币元数据（名称、符号、标签和社区描述），将语义相似的代币分组为社交话题。每个代币可以以不同的置信度分数属于多个话题。

### Heat Calculation / 热度计算

Topic heat is a composite score updated hourly, include token trading volume, token marketcap, holders, etc.

话题热度是每小时更新的复合评分，包含代币交易量、代币市值、代币持有者数量等维度综合计算。


The score decays over time if trading activity slows, ensuring the heat ranking reflects real-time market interest rather than historical performance.

如果交易活动放缓，评分会随时间衰减，确保热度排行反映实时市场兴趣而非历史表现。
