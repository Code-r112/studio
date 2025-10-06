
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
    };

    const handleMouseOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const interactiveTarget = target.closest('a, button, input[type="submit"], [role="button"]');
        
        if (interactiveTarget) {
            cursorWrapper.classList.add('pointer');
            const computedStyle = window.getComputedStyle(interactiveTarget);
            const textColor = computedStyle.getPropertyValue('color');
            const bgColor = computedStyle.getPropertyValue('background-color');

            if(cursorDot) {
                cursorDot.style.borderColor = textColor;
                const isTransparent = !bgColor || bgColor === 'transparent' || bgColor.startsWith('rgba(0, 0, 0, 0)');
                 
                // Only change background for non-dark backgrounds to avoid it getting lost
                if (isTransparent) {
                    cursorDot.style.backgroundColor = 'hsl(var(--foreground) / 0.1)';
                } else {
                    const rgb = bgColor.match(/\d+/g);
                    if (rgb) {
                        const brightness = Math.round(((parseInt(rgb[0]) * 299) + (parseInt(rgb[1]) * 587) + (parseInt(rgb[2]) * 114)) / 1000);
                        if (brightness > 125) { // It's a light background
                             cursorDot.style.backgroundColor = bgColor;
                        } else { // It's a dark background, keep it transparent
                             cursorDot.style.backgroundColor = 'transparent';
                        }
                    } else {
                         cursorDot.style.backgroundColor = 'hsl(var(--foreground) / 0.1)';
                    }
                }
            }
        }
    };

    const handleMouseOut = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const interactiveTarget = target.closest('a, button, input[type="submit"], [role="button"]');

        if (interactiveTarget) {
            cursorWrapper.classList.remove('pointer');
             if(cursorDot) {
                cursorDot.style.borderColor = ''; 
                cursorDot.style.backgroundColor = '';
            }
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
