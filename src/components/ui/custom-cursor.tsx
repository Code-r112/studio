
'use client';

import { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursorDot = cursorDotRef.current;
    const cursorWrapper = cursorWrapperRef.current;
    if (!cursorDot || !cursorWrapper) return;
    
    document.body.style.cursor = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      cursorDot.style.left = `${clientX - cursorDot.offsetWidth / 2}px`;
      cursorDot.style.top = `${clientY - cursorDot.offsetHeight / 2}px`;

      const target = e.target as HTMLElement;
      if (target.closest('footer')) {
          cursorWrapper.classList.add('on-dark-bg');
      } else {
          cursorWrapper.classList.remove('on-dark-bg');
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const interactiveTarget = target.closest('a, button, input[type="submit"], [role="button"]');
        
        if (interactiveTarget) {
            cursorWrapper.classList.add('pointer');
        }
    };

    const handleMouseOut = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const interactiveTarget = target.closest('a, button, input[type="submit"], [role="button"]');

        if (interactiveTarget) {
            cursorWrapper.classList.remove('pointer');
        }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.body.style.cursor = 'default';
    };
  }, []);

  return (
    <div id="cursor-wrapper" ref={cursorWrapperRef} className="custom-cursor">
      <div ref={cursorDotRef} className="cursor-dot"></div>
    </div>
  );
};

export default CustomCursor;
