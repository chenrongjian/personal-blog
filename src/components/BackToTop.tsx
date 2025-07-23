import { useState, useEffect, useRef } from 'react';
import { ChevronUp } from 'lucide-react';
import { buttonClickAnimation, backToTopAnimation } from '@/utils/animations';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
      const toggleVisibility = () => {
        const shouldShow = window.pageYOffset > 300;
        if (shouldShow !== isVisible) {
          setIsVisible(shouldShow);
          if (buttonRef.current) {
            backToTopAnimation(buttonRef.current, shouldShow);
          }
        }
      };
  
      window.addEventListener('scroll', toggleVisibility);
  
      return () => {
        window.removeEventListener('scroll', toggleVisibility);
      };
    }, [isVisible]);

  const scrollToTop = () => {
    const button = document.querySelector('.back-to-top-btn') as HTMLElement;
    if (button) {
      buttonClickAnimation(button);
    }
    
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      ref={buttonRef}
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-50 bg-white/90 backdrop-blur-sm hover:bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-label="回到顶部"
    >
      <ChevronUp className="w-5 h-5 group-hover:animate-bounce" />
    </button>
  );
}