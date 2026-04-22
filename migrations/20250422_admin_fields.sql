-- MemeMedia 管理后台字段迁移
-- 在 Supabase Dashboard → SQL Editor 中执行

-- 1. topics 表添加多语言字段和显示控制
ALTER TABLE topics
  ADD COLUMN IF NOT EXISTS name_en TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS display BOOLEAN DEFAULT TRUE;

-- 2. topic_content 表添加显示控制
ALTER TABLE topic_content
  ADD COLUMN IF NOT EXISTS display BOOLEAN DEFAULT TRUE;

-- 3. 更新现有数据：全部默认显示
UPDATE topics SET display = TRUE WHERE display IS NULL;
UPDATE topic_content SET display = TRUE WHERE display IS NULL;

-- 4. 确认字段
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'topics' 
ORDER BY ordinal_position;

SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'topic_content' 
ORDER BY ordinal_position;
