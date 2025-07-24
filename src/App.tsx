import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ConfigProvider, useConfig } from "@/contexts/ConfigContext";
import { initAnalytics } from "@/lib/analytics";
import { useEffect } from "react";
import Home from "@/pages/Home";
import BackToTop from "@/components/BackToTop";
import ArticleDetail from "@/pages/ArticleDetail";
import Categories from "@/pages/Categories";
import AdminLogin from "@/pages/AdminLogin";
import ArticleManagement from "@/pages/ArticleManagement";
import CategoryManagement from "@/pages/CategoryManagement";
import ConfigManager from "@/pages/ConfigManager";
import About from "@/pages/About";
import ProtectedRoute from "@/components/ProtectedRoute";

// Analytics初始化组件
function AnalyticsInitializer() {
  const { config } = useConfig();

  useEffect(() => {
    if (config.analytics?.gaTrackingId) {
      initAnalytics({
        gaTrackingId: config.analytics.gaTrackingId,
        ga4PropertyId: config.analytics.ga4PropertyId,
        enableGAReportingAPI: config.analytics.enableGAReportingAPI,
        enableLocalStats: config.analytics.enableLocalStats
      });
    }
  }, [config.analytics]);

  return null;
}

export default function App() {
  return (
    <ConfigProvider>
      <Router>
        <div className="App">
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
          </Routes>
          <BackToTop />
          <Toaster position="top-right" richColors />
        </div>
      </Router>
    </ConfigProvider>
  );
}
