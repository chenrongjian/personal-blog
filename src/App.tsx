import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ConfigProvider } from "@/contexts/ConfigContext";
import Home from "@/pages/Home";
import BackToTop from "@/components/BackToTop";
import ArticleDetail from "@/pages/ArticleDetail";
import Categories from "@/pages/Categories";
import AdminLogin from "@/pages/AdminLogin";
import ArticleManagement from "@/pages/ArticleManagement";
import CategoryManagement from "@/pages/CategoryManagement";
import ConfigManager from "@/pages/ConfigManager";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function App() {
  return (
    <ConfigProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:categoryId" element={<Categories />} />
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
