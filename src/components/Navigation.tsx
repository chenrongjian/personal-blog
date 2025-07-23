import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import useStore from '@/store/useStore';
import { navScrollAnimation } from '@/utils/animations';
import { useConfig } from '@/contexts/ConfigContext';

export default function Navigation() {
  const location = useLocation();
  const { isAuthenticated, logout } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { config: siteConfig } = useConfig();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
      
      if (navRef.current) {
        navScrollAnimation(navRef.current, scrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav 
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0)',
        backdropFilter: isScrolled ? 'blur(10px)' : 'blur(0px)',
        boxShadow: isScrolled ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)' : 'none'
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {siteConfig.site.title}
            <span className="text-sm font-normal text-gray-500 ml-2" style={{ fontFamily: 'Source Sans Pro, sans-serif' }}>
              {siteConfig.site.titleEn}
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                isActive('/') ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              <i className="fas fa-home mr-2"></i>
              {siteConfig.navigation.home}
            </Link>
            
            <Link
              to="/categories"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                isActive('/categories') ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              <i className="fas fa-folder mr-2"></i>
              {siteConfig.navigation.categories}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/admin/articles"
                  className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                    location.pathname.startsWith('/admin') ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  <i className="fas fa-cog mr-2"></i>
                  {siteConfig.navigation.admin}
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  {siteConfig.navigation.logout}
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                <i className="fas fa-user mr-2"></i>
                {siteConfig.navigation.login}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden text-gray-700 hover:text-blue-600 transition-colors"
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-lg`}></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4 pt-4">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${isActive('/') ? 'text-blue-600' : 'text-gray-700'}`}
              >
                <i className="fas fa-home mr-2"></i>
                {siteConfig.navigation.home}
              </Link>
              
              <Link
                to="/categories"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${isActive('/categories') ? 'text-blue-600' : 'text-gray-700'}`}
              >
                <i className="fas fa-folder mr-2"></i>
                {siteConfig.navigation.categories}
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/admin/articles"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-sm font-medium transition-colors hover:text-blue-600 ${location.pathname.startsWith('/admin') ? 'text-blue-600' : 'text-gray-700'}`}
                  >
                    <i className="fas fa-cog mr-2"></i>
                    {siteConfig.navigation.admin}
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="text-left text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    {siteConfig.navigation.logout}
                  </button>
                </>
              ) : (
                <Link
                  to="/admin/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <i className="fas fa-user mr-2"></i>
                  {siteConfig.navigation.login}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}