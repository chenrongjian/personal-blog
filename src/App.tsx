import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ConfigProvider, useConfig } from "@/contexts/ConfigContext";
import { initAnalytics } from "@/lib/analytics";
import { useEffect } from "react";
import useStore from "@/store/useStore";
import Home from "@/pages/Home";
import BackToTop from "@/components/BackToTop";
import ArticleDetail from "@/pages/ArticleDetail";
import Categories from "@/pages/Categories";
import AdminLogin from "@/pages/AdminLogin";
import ArticleManagement from "@/pages/ArticleManagement";
import CategoryManagement from "@/pages/CategoryManagement";
import ConfigManager from "@/pages/ConfigManager";
import About from "@/pages/About";
import Analytics from "@/pages/Analytics";
import AnalyticsDetails from "@/pages/AnalyticsDetails";
import AnalyticsConfig from "@/pages/AnalyticsConfig";

import ProtectedRoute from "@/components/ProtectedRoute";

// Analytics初始化组件
function AnalyticsInitializer() {
  const { config } = useConfig();

  useEffect(() => {
    // 初始化Supabase统计系统
    const analyticsConfig = {
      enabled: config.analytics?.enabled || false,
      enableDetailedTracking: config.analytics?.enableDetailedTracking || false,
      enablePublicStats: config.analytics?.enablePublicStats || false,
      showViewsOnArticles: config.analytics?.showViewsOnArticles || false,
      enableTrendCharts: config.analytics?.enableTrendCharts || false,
      dataRetentionDays: config.analytics?.dataRetentionDays || 365,
      batchSize: 10,
      batchInterval: 30000,
      trackingPrecision: 'hourly' as 'realtime' | 'hourly' | 'daily',
      enableLocalStorage: true,
      anonymizeIp: true,
      ignoreAdminVisits: false,
      respectDoNotTrack: true
    };
    

    initAnalytics(analyticsConfig);
  }, [config]);

  return null;
}

// 认证状态初始化组件
function AuthInitializer() {
  const checkAuth = useStore(state => state.checkAuth);

  useEffect(() => {
    // 应用启动时检查认证状态
    checkAuth();
  }, [checkAuth]);

  return null;
}

export default function App() {
  return (
    <ConfigProvider>
      <Router>
        <div className="App">
          <AuthInitializer />
          <AnalyticsInitializer />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:categoryId" element={<Categories />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/articles" element={
              <ProtectedRoute>
                <ArticleManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/categories" element={
              <ProtectedRoute>
                <CategoryManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/config" element={
              <ProtectedRoute>
                <ConfigManager />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics/details" element={
              <ProtectedRoute>
                <AnalyticsDetails />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics/config" element={
              <ProtectedRoute>
                <AnalyticsConfig />
              </ProtectedRoute>
            } />

          </Routes>
          <BackToTop />
          <Toaster position="top-right" richColors />
        </div>
      </Router>
    </ConfigProvider>
  );
}
