import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import useStore from '@/store/useStore';
import { useConfig } from '@/contexts/ConfigContext';
import type { Category } from '@/lib/api';

export default function CategoryManagement() {
  const { config: siteConfig } = useConfig();
  const { categories, articles, addCategory, updateCategory, deleteCategory, fetchCategories, fetchArticles } = useStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchCategories(), fetchArticles()]);
      setIsLoaded(true);
    };
    
    loadData();
  }, [fetchCategories, fetchArticles]);
  
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getArticleCount = (categoryId: string) => {
    return articles.filter(article => article.category_id === categoryId).length;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await addCategory(formData);
      }
      resetForm();
    } catch (error) {
      console.error('操作失败:', error);
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
    });
    setEditingCategory(null);
    setShowModal(false);
  };
  
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description
    });
    setShowModal(true);
  };
  
  const handleDelete = (id: string) => {
    const articleCount = getArticleCount(id);
    
    if (articleCount > 0) {
      setWarningMessage(`无法删除该分类，因为还有 ${articleCount} 篇文章属于此分类。请先移动或删除这些文章。`);
      setShowWarningModal(true);
      return;
    }
    
    setDeletingCategoryId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deletingCategoryId) {
      try {
        await deleteCategory(deletingCategoryId);
        setShowDeleteModal(false);
        setDeletingCategoryId(null);
      } catch (error) {
        console.error('删除失败:', error);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingCategoryId(null);
  };

  const closeWarning = () => {
    setShowWarningModal(false);
    setWarningMessage('');
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
                  分类管理
                </h1>
                <p className="text-gray-600">管理文章分类和标签</p>
              </div>
              
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <Link
                  to="/admin/articles"
                  className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <i className="fas fa-file-alt mr-2"></i>
                  文章管理
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
                  新建分类
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Search */}
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="搜索分类名称或描述..."
              />
            </div>
          </div>
        </div>
        
        {/* Categories Grid */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category, index) => (
              <div
                key={category.id}
                className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 ${
                  isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
                style={{ 
                  transitionDelay: `${index * 100}ms` 
                }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full mr-3 bg-blue-500"></div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {category.name}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                        title="编辑"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="删除"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <i className="fas fa-file-alt mr-1"></i>
                      <span>{getArticleCount(category.id)} 篇文章</span>
                    </div>
                    
                    <Link
                      to={`/categories/${category.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                    >
                      查看文章 →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-folder text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">暂无分类</h3>
              <p className="text-gray-500">还没有创建任何分类</p>
            </div>
          )}
        </div>
        
        {/* Statistics */}
        <div className="max-w-7xl mx-auto px-6 mt-12">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">分类统计</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {categories.length}
                </div>
                <div className="text-sm text-gray-600">总分类数</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {categories.filter(cat => getArticleCount(cat.id) > 0).length}
                </div>
                <div className="text-sm text-gray-600">有文章的分类</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {Math.round(articles.length / Math.max(categories.length, 1) * 10) / 10}
                </div>
                <div className="text-sm text-gray-600">平均每分类文章数</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingCategory ? '编辑分类' : '新建分类'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分类名称
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入分类名称"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分类描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="请输入分类描述"
                  required
                />
              </div>
              

              
              <div className="flex items-center justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  取消
                </button>
                
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCategory ? '更新分类' : '创建分类'}
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
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">确认删除</h3>
                  <p className="text-gray-600 text-sm">此操作无法撤销</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                确定要删除这个分类吗？
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
                  className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                  <i className="fas fa-exclamation-triangle text-yellow-600 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">无法删除</h3>
                  <p className="text-gray-600 text-sm">该分类正在使用中</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                {warningMessage}
              </p>
              
              <div className="flex items-center justify-end">
                <button
                  onClick={closeWarning}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  我知道了
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