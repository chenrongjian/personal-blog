import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSiteConfig, getSiteConfigAsync, SiteConfig } from '../config/siteConfig';
import { configApi, authApi } from '../lib/api';
import { toast } from 'sonner';

interface ConfigContextType {
  config: SiteConfig;
  updateConfig: (newConfig: Partial<SiteConfig>) => void;
  resetConfig: () => void;
  isLoading: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

interface ConfigProviderProps {
  children: ReactNode;
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // 初始化时从数据库加载配置
  useEffect(() => {
    const loadConfigFromDatabase = async () => {
      setIsLoading(true);
      try {
        const dbConfig = await getSiteConfigAsync();
        setConfig(dbConfig);
      } catch (error) {
        console.warn('Failed to load config from database:', error);
        // 使用默认配置
        setConfig(getSiteConfig());
      } finally {
        setIsLoading(false);
      }
    };

    loadConfigFromDatabase();
  }, []);

  // 监听 localStorage 变化（向后兼容）
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'siteConfig' && e.newValue) {
        try {
          const newConfig = JSON.parse(e.newValue);
          setConfig(newConfig);
        } catch {
          console.warn('Failed to parse config from storage event');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateConfig = async (newConfig: Partial<SiteConfig>) => {
    // 防止重复调用 - 使用多重检查机制
    const now = Date.now();
    if (isLoading || isUpdating || (now - lastUpdateTime < 1000)) {
      return;
    }
    
    setIsLoading(true);
    setIsUpdating(true);
    setLastUpdateTime(now);
    
    try {
      // 检查用户是否为管理员
      const isAdmin = await authApi.isAdmin();
      if (!isAdmin) {
        toast.error('只有管理员才能修改网站配置');
        throw new Error('Only administrators can modify site configuration');
      }

      // 深度合并配置
      const mergedConfig = deepMerge(config, newConfig);
      
      // 保存到数据库
      await configApi.saveSiteConfig(mergedConfig as unknown as Record<string, unknown>);
      
      // 立即更新状态
      setConfig(mergedConfig);
      
      // 触发自定义事件，通知其他组件
      window.dispatchEvent(new CustomEvent('configUpdated', {
        detail: { config: mergedConfig }
      }));
      
      // 使用防重复的toast提示
      const toastId = 'config-save-success';
      toast.success('配置保存成功！', { id: toastId });
    } catch (error) {
      console.error('Failed to update config:', error);
      toast.error('保存配置失败：' + (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
      // 延迟重置更新状态，确保防重复机制有效
      setTimeout(() => setIsUpdating(false), 500);
    }
  };

  const resetConfig = async () => {
    // 防止重复调用 - 使用多重检查机制
    const now = Date.now();
    if (isLoading || isUpdating || (now - lastUpdateTime < 1000)) {
      return;
    }
    
    setIsLoading(true);
    setIsUpdating(true);
    setLastUpdateTime(now);
    
    try {
      // 检查用户是否为管理员
      const isAdmin = await authApi.isAdmin();
      if (!isAdmin) {
        toast.error('只有管理员才能重置网站配置');
        throw new Error('Only administrators can reset site configuration');
      }

      // 重置数据库中的配置
      await configApi.resetSiteConfig();
      
      // 使用默认配置
      const defaultConfig = getSiteConfig();
      setConfig(defaultConfig);
      
      // 触发自定义事件
      window.dispatchEvent(new CustomEvent('configUpdated', {
        detail: { config: defaultConfig }
      }));
      
      // 使用防重复的toast提示
      const toastId = 'config-reset-success';
      toast.success('配置已重置为默认值', { id: toastId });
    } catch (error) {
      console.error('Failed to reset config:', error);
      toast.error('重置配置失败：' + (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
      // 延迟重置更新状态，确保防重复机制有效
      setTimeout(() => setIsUpdating(false), 500);
    }
  };

  return (
    <ConfigContext.Provider value={{
      config,
      updateConfig,
      resetConfig,
      isLoading
    }}>
      {children}
    </ConfigContext.Provider>
  );
}

// 自定义 Hook
export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

// 深度合并函数
function deepMerge(target: SiteConfig, source: Partial<SiteConfig>): SiteConfig {
  const result = { ...target };
  
  for (const key in source) {
    const sourceValue = source[key as keyof SiteConfig];
    if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
      result[key as keyof SiteConfig] = deepMerge(
        target[key as keyof SiteConfig] as SiteConfig, 
        sourceValue as Partial<SiteConfig>
      ) as any;
    } else {
      (result as any)[key] = sourceValue;
    }
  }
  
  return result;
}

// 用于非组件中使用的 Hook
export function useConfigListener(callback: (config: SiteConfig) => void) {
  useEffect(() => {
    const handleConfigUpdate = (event: CustomEvent) => {
      callback(event.detail.config);
    };

    window.addEventListener('configUpdated', handleConfigUpdate as EventListener);
    return () => window.removeEventListener('configUpdated', handleConfigUpdate as EventListener);
  }, [callback]);
}