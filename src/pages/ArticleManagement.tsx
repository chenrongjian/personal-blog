import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import useStore from '@/store/useStore';
import { useConfig } from '@/contexts/ConfigContext';
import type { Article } from '@/lib/api';

export default function ArticleManagement() {
  const { articles, categories, addArticle, updateArticle, deleteArticle, fetchArticles, fetchCategories } = useStore();
  const { config: siteConfig } = useConfig();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingArticleId, setDeletingArticleId] = useState<string | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category_id: '',
    is_published: false,
    read_time: 5
  });
  
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchArticles(), fetchCategories()]);
      setIsLoaded(true);
    };
    
    loadData();
  }, [fetchArticles, fetchCategories]);
  
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || article.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const articleData = {
      ...formData,
      published_at: formData.is_published ? new Date().toISOString() : new Date().toISOString()
    };
    
    try {
      if (editingArticle) {
        await updateArticle(editingArticle.id, articleData);
      } else {
        await addArticle(articleData);
      }
      resetForm();
    } catch (error) {
      console.error('操作失败:', error);
    }
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      category_id: '',
      is_published: false,
      read_time: 5
    });
    setEditingArticle(null);
    setShowModal(false);
  };
  
  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      category_id: article.category_id,
      is_published: article.is_published,
      read_time: article.read_time
    });
    setShowModal(true);
  };
  
  const handleDelete = (id: string) => {
    setDeletingArticleId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deletingArticleId) {
      try {
        await deleteArticle(deletingArticleId);
        setShowDeleteModal(false);
        setDeletingArticleId(null);
      } catch (error) {
        console.error('删除失败:', error);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingArticleId(null);
  };
  
  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || '未分类';
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-24 pb-16">
        {/* Header */}
        <header className="max-w-7xl mx-auto px-6 mb-8">
          <div className={`transform transition-all duration-1000 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div>
                <h1 
                  className="text-4xl font-bold text-gray-800 mb-2"
                  style={{ fontFamily: 'Noto Serif SC, serif' }}
                >
                  文章管理
                </h1>
                <p className="text-gray-600">管理所有文章内容</p>
              </div>
              
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <Link
                  to="/admin/categories"
                  className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <i className="fas fa-folder mr-2"></i>
                  分类管理
                </Link>
                
                <Link
                  to="/admin/analytics"
                  className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <i className="fas fa-chart-bar mr-2"></i>
                  统计分析
                </Link>
                
                <Link
                  to="/admin/config"
                  className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <i className="fas fa-cog mr-2"></i>
                  配置管理
                </Link>
                
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                >
                  <i className="fas fa-plus mr-2"></i>
                  新建文章
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Filters */}
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-search text-gray-400"></i>
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="搜索文章标题或内容..."
                  />
                </div>
              </div>
              
              <div className="md:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">所有分类</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Articles Table */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      标题
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      分类
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      发布时间
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredArticles.map((article, index) => (
                    <tr 
                      key={article.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        isLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{ 
                        transitionDelay: `${index * 50}ms` 
                      }}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {article.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {article.excerpt}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                          {article.categories?.name || getCategoryName(article.category_id)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          article.is_published 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {article.is_published ? '已发布' : '草稿'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(article.published_at).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/article/${article.id}`}
                            className="text-blue-600 hover:text-blue-700 transition-colors"
                            title="查看"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                          
                          <button
                            onClick={() => handleEdit(article)}
                            className="text-green-600 hover:text-green-700 transition-colors"
                            title="编辑"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          
                          <button
                            onClick={() => handleDelete(article.id)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                            title="删除"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredArticles.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-file-alt text-2xl text-gray-400"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">暂无文章</h3>
                  <p className="text-gray-500">还没有创建任何文章</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingArticle ? '编辑文章' : '新建文章'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    文章标题
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入文章标题"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分类
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">选择分类</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    阅读时间（分钟）
                  </label>
                  <input
                    type="number"
                    value={formData.read_time}
                    onChange={(e) => setFormData({ ...formData, read_time: parseInt(e.target.value) || 5 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="60"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    文章摘要
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="请输入文章摘要"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    文章内容
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={12}
                    placeholder="请输入文章内容（支持 Markdown 格式）"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">立即发布</span>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  取消
                </button>
                
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingArticle ? '更新文章' : '创建文章'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
                确认删除
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                确定要删除这篇文章吗？此操作无法撤销。
              </p>
              
              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  取消
                </button>
                
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}