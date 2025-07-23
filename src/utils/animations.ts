// @ts-ignore
import { animate, stagger, createTimeline } from 'animejs';

// 页面加载动画
export const pageLoadAnimation = (target: string | HTMLElement, delay = 0) => {
  return animate(target, {
    translateY: [30, 0],
    opacity: [0, 1],
    duration: 800,
    delay: delay,
    easing: 'cubicBezier(0.25, 0.46, 0.45, 0.94)'
  });
};

// 卡片悬停动画
export const cardHoverAnimation = (element: HTMLElement, scale = 1.02) => {
  return animate(element, {
    scale: scale,
    duration: 300,
    easing: 'cubicBezier(0.25, 0.46, 0.45, 0.94)'
  });
};

// 卡片离开动画
export const cardLeaveAnimation = (element: HTMLElement) => {
  return animate(element, {
    scale: 1,
    duration: 300,
    easing: 'cubicBezier(0.25, 0.46, 0.45, 0.94)'
  });
};

// 按钮点击动画
export const buttonClickAnimation = (element: HTMLElement) => {
  return animate(element, {
    scale: [1, 0.95, 1],
    duration: 200,
    easing: 'cubicBezier(0.25, 0.46, 0.45, 0.94)'
  });
};

// 数字计数动画
export const countUpAnimation = (element: HTMLElement, endValue: number, duration = 1000) => {
  const obj = { value: 0 };
  
  return animate(obj, {
    value: endValue,
    duration: duration,
    easing: 'cubicBezier(0.25, 0.46, 0.45, 0.94)',
    update: () => {
      element.textContent = Math.round(obj.value).toString();
    }
  });
};

// 渐入动画
export const fadeInAnimation = (selector: string, delay = 0) => {
  return animate(selector, {
    opacity: [0, 1],
    duration: 600,
    delay: delay,
    easing: 'cubicBezier(0.25, 0.46, 0.45, 0.94)'
  });
};

// 滑入动画（从左）
export const slideInLeftAnimation = (selector: string, delay = 0) => {
  return animate(selector, {
    translateX: [-50, 0],
    opacity: [0, 1],
    duration: 700,
    delay: delay,
    easing: 'cubicBezier(0.25, 0.46, 0.45, 0.94)'
  });
};

// 滑入动画（从右）
export const slideInRightAnimation = (selector: string, delay = 0) => {
  return animate(selector, {
    translateX: [50, 0],
    opacity: [0, 1],
    duration: 700,
    delay: delay,
    easing: 'cubicBezier(0.25, 0.46, 0.45, 0.94)'
  });
};

// 弹性动画
export const bounceAnimation = (element: HTMLElement) => {
  return animate(element, {
    translateY: [0, -10, 0],
    duration: 600,
    easing: 'spring(1, 80, 10, 0)'
  });
};

// 旋转动画
export const rotateAnimation = (element: HTMLElement, rotation = 360) => {
  return animate(element, {
    rotate: rotation,
    duration: 500,
    easing: 'cubicBezier(0.25, 0.46, 0.45, 0.94)'
  });
};

// 脉冲动画
export const pulseAnimation = (element: HTMLElement) => {
  return animate(element, {
    scale: [1, 1.1, 1],
    duration: 800,
    easing: 'easeInOutSine',
    loop: true
  });
};

// 打字机效果
export const typewriterAnimation = (element: HTMLElement, text: string, speed = 50) => {
  element.textContent = '';
  let i = 0;
  
  const timer = setInterval(() => {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
    } else {
      clearInterval(timer);
    }
  }, speed);
  
  return timer;
};

// 视差滚动动画
export const parallaxAnimation = (element: HTMLElement, speed = 0.5) => {
  const handleScroll = () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -speed;
    element.style.transform = `translateY(${rate}px)`;
  };
  
  window.addEventListener('scroll', handleScroll);
  
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};

// 交错动画
export const staggerAnimation = (selector: string, delay = 100) => {
  return animate(selector, {
    translateY: [30, 0],
    opacity: [0, 1],
    duration: 600,
    delay: stagger(delay),
    easing: 'cubicBezier(0.25, 0.46, 0.45, 0.94)'
  });
};

// 路径动画
export const pathAnimation = (selector: string, path: string) => {
  // 简化路径动画，animejs 4.0 API有变化
  return animate(selector, {
    translateX: [0, 100],
    translateY: [0, 50],
    duration: 2000,
    easing: 'cubicBezier(0.25, 0.46, 0.45, 0.94)'
  });
};

// 加载动画
export const loadingAnimation = (element: HTMLElement) => {
  return animate(element, {
    rotate: '360deg',
    duration: 1000,
    easing: 'linear',
    loop: true
  });
};

// 成功动画
export const successAnimation = (element: HTMLElement) => {
  const timeline = createTimeline();
  timeline.add(element, {
    scale: [1, 1.2],
    duration: 200,
    easing: 'cubicBezier(0.25, 0.46, 0.45, 0.94)'
  });
  timeline.add(element, {
    scale: [1.2, 1],
    duration: 300,
    easing: 'spring(1, 80, 10, 0)'
  });
  return timeline;
};

// 错误动画
export const errorAnimation = (element: HTMLElement) => {
  return animate(element, {
    translateX: [-10, 10, -10, 10, 0],
    duration: 400,
    easing: 'cubicBezier(0.25, 0.46, 0.45, 0.94)'
  });
};

// 模态框动画
export const modalAnimation = (element: HTMLElement, show = true) => {
  if (show) {
    return animate(element, {
      scale: [0.8, 1],
      opacity: [0, 1],
      duration: 300,
      easing: 'cubicBezier(0.25, 0.46, 0.45, 0.94)'
    });
  } else {
    return animate(element, {
      scale: [1, 0.8],
      opacity: [1, 0],
      duration: 200,
      easing: 'cubicBezier(0.25, 0.46, 0.45, 0.94)'
    });
  }
};

// 导航栏滚动动画
export const navScrollAnimation = (element: HTMLElement, scrolled: boolean) => {
  return animate(element, {
    backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0)',
    backdropFilter: scrolled ? 'blur(10px)' : 'blur(0px)',
    duration: 300,
    easing: 'cubicBezier(0.25, 0.46, 0.45, 0.94)'
  });
};

// 文字高亮动画
export const highlightAnimation = (element: HTMLElement) => {
  return animate(element, {
    backgroundColor: ['rgba(59, 130, 246, 0)', 'rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0)'],
    duration: 1000,
    easing: 'cubicBezier(0.25, 0.46, 0.45, 0.94)'
  });
};

// 回到顶部按钮动画
export const backToTopAnimation = (element: HTMLElement, show = true) => {
  if (show) {
    return animate(element, {
      opacity: [0, 1],
      scale: [0.8, 1],
      translateY: [20, 0],
      duration: 300,
      easing: 'cubicBezier(0.25, 0.46, 0.45, 0.94)'
    });
  } else {
    return animate(element, {
      opacity: [1, 0],
      scale: [1, 0.8],
      translateY: [0, 20],
      duration: 200,
      easing: 'cubicBezier(0.25, 0.46, 0.45, 0.94)'
    });
  }
};

export default {
  pageLoadAnimation,
  cardHoverAnimation,
  cardLeaveAnimation,
  buttonClickAnimation,
  countUpAnimation,
  fadeInAnimation,
  slideInLeftAnimation,
  slideInRightAnimation,
  bounceAnimation,
  rotateAnimation,
  pulseAnimation,
  typewriterAnimation,
  parallaxAnimation,
  staggerAnimation,
  pathAnimation,
  loadingAnimation,
  successAnimation,
  errorAnimation,
  modalAnimation,
  navScrollAnimation,
  highlightAnimation,
  backToTopAnimation
};