-- 更新现有配置，添加 typewriterText 字段
-- 在 Supabase SQL Editor 中执行此脚本

UPDATE site_config 
SET config_value = jsonb_set(
  config_value, 
  '{site,typewriterText}', 
  '"思维的碎片"'::jsonb
)
WHERE config_key = 'site_settings' 
AND NOT (config_value->'site' ? 'typewriterText');

-- 验证更新结果
SELECT config_key, config_value->'site'->>'typewriterText' as typewriter_text 
FROM site_config 
WHERE config_key = 'site_settings';