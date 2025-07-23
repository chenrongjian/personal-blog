import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从环境变量读取配置
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('缺少Supabase配置，请检查.env文件');
  process.exit(1);
}

// 使用service role key创建客户端，具有管理员权限
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('开始执行数据库迁移...');
    
    // 读取SQL文件
    const sqlContent = fs.readFileSync(path.join(__dirname, 'site-config-migration.sql'), 'utf8');
    
    // 分割SQL语句（更智能的分割）
    const statements = sqlContent
      .split(/;\s*(?=\n|$)/)
      .map(stmt => stmt.trim())
      .filter(stmt => {
        // 过滤掉空语句和注释
        if (!stmt || stmt.length === 0) return false;
        if (stmt.startsWith('--')) return false;
        if (stmt.match(/^\s*$/)) return false;
        return true;
      });
    
    console.log(`找到 ${statements.length} 条SQL语句`);
    
    // 执行每条SQL语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`执行语句 ${i + 1}/${statements.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        });
        
        if (error) {
          // 如果是表已存在的错误，可以忽略
          if (error.message.includes('already exists')) {
            console.log(`跳过已存在的对象: ${error.message}`);
            continue;
          }
          console.error(`执行SQL语句失败:`, error);
          console.error(`语句内容:`, statement);
          // 继续执行其他语句
        } else {
          console.log(`语句执行成功`);
        }
      }
    }
    
    console.log('数据库迁移完成！');
    
    // 验证表是否创建成功
    const { data: tables, error: tableError } = await supabase
      .from('site_config')
      .select('config_key')
      .limit(1);
    
    if (tableError) {
      console.error('验证表创建失败:', tableError);
      console.log('❌ site_config表可能未创建成功');
    } else {
      console.log('✅ site_config表创建成功！');
      if (tables && tables.length > 0) {
        console.log(`表中已有 ${tables.length} 条配置记录`);
      }
    }
    
  } catch (error) {
    console.error('迁移过程中发生错误:', error);
    process.exit(1);
  }
}

// 运行迁移
runMigration();