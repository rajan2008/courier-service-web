import React, { useEffect, useRef, useState } from 'react';

const GlobalCursor = () => {
    const cursorRef = useRef(null);
    const cursorInnerRef = useRef(null);
    const tagRef = useRef(null);
    const requestRef = useRef(null);
    const hoverRef = useRef(false);
    const mousePos = useRef({ x: -100, y: -100 }); // Start off-screen
    const cursorConfig = useRef({ type: 'magnetic', color: '#bc13fe', roleStr: 'User' });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Detect Mobile/Touch Device
        const checkMobile = () => {
            setIsMobile(window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);

        const loadPreferences = () => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const savedCursor = localStorage.getItem('cursorType');
            let color = '#f97316'; 
            let roleStr = 'Guest';
            if (user.role === 'admin') { color = '#bc13fe'; roleStr = 'Super Admin'; }
            else if (user.role === 'courier_admin') { color = '#ff4d00'; roleStr = 'Courier Admin'; }
            else if (user.role === 'employee') { color = '#00f2ff'; roleStr = 'Driver Pro'; }
            else if (user.role === 'customer') { color = '#39ff14'; roleStr = 'Premium Client'; }

            cursorConfig.current = { type: savedCursor || 'magnetic', color, roleStr };
        };

        loadPreferences();
        window.addEventListener('cursor-updated', loadPreferences);

        const onMouseMove = (e) => {
            mousePos.current.x = e.clientX;
            mousePos.current.y = e.clientY;
            const isInteractive = e.target.closest('button, a, input, select, [role="button"], .interactive, .cursor-pointer');
            hoverRef.current = !!isInteractive;
        };

        const spawnEffect = (x, y) => {
            const clickEl = document.createElement('div');
            const { type } = cursorConfig.current;
            clickEl.style.position = 'fixed';
            clickEl.style.left = `${x - 20}px`;
            clickEl.style.top = `${y - 20}px`;
            clickEl.style.width = '40px'; clickEl.style.height = '40px';
            clickEl.style.pointerEvents = 'none'; clickEl.style.zIndex = '9999999';
            clickEl.style.transition = 'all 0.6s cubic-bezier(0.19, 1, 0.22, 1)';
            
            const icons = { cat: '💀', amongus: '📮', crystal: '💎' };
            clickEl.innerHTML = icons[type] || '✨';
            clickEl.style.fontSize = '24px'; clickEl.style.display = 'flex';
            clickEl.style.alignItems = 'center'; clickEl.style.justifyContent = 'center';
            document.body.appendChild(clickEl);

            requestAnimationFrame(() => {
                clickEl.style.transform = 'translateY(-50px) scale(1.8) rotate(15deg)';
                clickEl.style.opacity = '0';
            });
            setTimeout(() => clickEl.remove(), 700);
        };

        const onMouseDown = (e) => spawnEffect(e.clientX, e.clientY);
        const onTouchStart = (e) => {
            const touch = e.touches[0];
            spawnEffect(touch.clientX, touch.clientY);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('touchstart', onTouchStart, { passive: true });
        
        let cursorX = 0, cursorY = 0;
        let tagX = 0, tagY = 0;

        const render = () => {
            if (isMobile) {
                const styleTag = document.getElementById('global-cursor-override');
                if (styleTag) styleTag.innerHTML = ''; // Force show system touch feedback
                return;
            }

            const { type, color, roleStr } = cursorConfig.current;
            const isHover = hoverRef.current;
            
            let styleTag = document.getElementById('global-cursor-override');
            if (!styleTag) {
                styleTag = document.createElement('style');
                styleTag.id = 'global-cursor-override';
                document.head.appendChild(styleTag);
            }

            if (type === 'system') {
                styleTag.innerHTML = '';
                document.body.style.cursor = 'auto';
            } else {
                styleTag.innerHTML = (type === 'figma') ? '* { cursor: default !important; }' : '* { cursor: none !important; }';
            }

            cursorX += (mousePos.current.x - cursorX) * 0.15;
            cursorY += (mousePos.current.y - cursorY) * 0.15;
            tagX += (mousePos.current.x - tagX) * 0.1;
            tagY += (mousePos.current.y - tagY) * 0.1;

            if (cursorRef.current && cursorInnerRef.current && tagRef.current) {
                const outRef = cursorRef.current;
                const inRef = cursorInnerRef.current;
                const tRef = tagRef.current;

                outRef.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
                tRef.style.display = 'none';

                if (['cat', 'amongus', 'crystal'].includes(type)) {
                    outRef.style.width = isHover ? '48px' : '32px';
                    outRef.style.height = isHover ? '48px' : '32px';
                    outRef.style.left = isHover ? '-12px' : '0px';
                    outRef.style.top = isHover ? '-12px' : '0px';
                    outRef.style.background = `url("/cursors/${(type==='cat')?'minimal-monster-high-pack.png':(type==='amongus')?'among-us-cyan-character-in-hoodie-pack.png':'crystal-stones-blue-coral-pack.png'}") ${isHover?'right':'left'} center / 200% 100% no-repeat`;
                    outRef.style.filter = `brightness(1.4) drop-shadow(0 0 10px ${color})`;
                    outRef.style.borderRadius = '0'; outRef.style.border = 'none';
                    inRef.style.opacity = '0';
                } 
                else if (type === 'magnetic') {
                    outRef.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
                    outRef.style.width = isHover ? '65px' : '35px'; outRef.style.height = isHover ? '65px' : '35px';
                    outRef.style.left = isHover ? '-32px' : '-17px'; outRef.style.top = isHover ? '-32px' : '-17px';
                    outRef.style.border = `2px solid ${color}`; outRef.style.borderRadius = '50%';
                    outRef.style.background = isHover ? `rgba(${parseInt(color.slice(1,3), 16)}, ${parseInt(color.slice(3,5), 16)}, ${parseInt(color.slice(5,7), 16)}, 0.1)` : 'transparent';
                    inRef.style.opacity = isHover ? '0' : '1';
                    inRef.style.width = '6px'; inRef.style.height = '6px';
                    inRef.style.left = '-3px'; inRef.style.top = '-3px';
                    inRef.style.backgroundColor = color; inRef.style.borderRadius = '50%';
                    inRef.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
                }
                else if (type === 'figma') {
                    outRef.style.opacity = '0';
                    inRef.style.opacity = '0';
                    tRef.style.display = 'flex';
                    tRef.style.transform = `translate3d(${tagX}px, ${tagY}px, 0)`;
                    tRef.style.backgroundColor = color;
                    tRef.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="white" style="margin-right: -4px"><path d="M5.5 2L19 12.5 10 14l10 8-14.5-20z"/></svg><span style="padding: 2px 8px; font-weight: 600; font-size: 11px; color: white">${roleStr}</span>`;
                }
                else if (type === 'flare') {
                    const size = isHover ? 140 : 80;
                    outRef.style.width = `${size}px`; outRef.style.height = `${size}px`;
                    outRef.style.left = `-${size/2}px`; outRef.style.top = `-${size/2}px`;
                    outRef.style.background = `radial-gradient(circle, ${color}33 0%, transparent 70%)`;
                    outRef.style.filter = 'blur(15px) brightness(1.8)';
                    outRef.style.borderRadius = '50%';
                    inRef.style.opacity = '1'; inRef.style.backgroundColor = '#fff';
                    inRef.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
                }
                else if (type === 'difference') {
                    const size = isHover ? 100 : 50;
                    outRef.style.width = `${size}px`; outRef.style.height = `${size}px`;
                    outRef.style.left = `-${size/2}px`; outRef.style.top = `-${size/2}px`;
                    outRef.style.background = '#fff'; outRef.style.mixBlendMode = 'difference';
                    outRef.style.borderRadius = '50%';
                }
            }
            requestRef.current = requestAnimationFrame(render);
        };
        requestRef.current = requestAnimationFrame(render);

        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('cursor-updated', loadPreferences);
            window.removeEventListener('resize', checkMobile);
            cancelAnimationFrame(requestRef.current);
            const styleTag = document.getElementById('global-cursor-override');
            if (styleTag) styleTag.remove();
        };
    }, [isMobile]);

    if (isMobile) return null; // Native Touch Experience for Mobile

    return (
        <div style={{ pointerEvents: 'none', zIndex: 9999999, position: 'fixed', inset: 0 }}>
            <div ref={cursorRef} style={{ position: 'absolute', pointerEvents: 'none' }} />
            <div ref={cursorInnerRef} style={{ position: 'absolute', pointerEvents: 'none' }} />
            <div ref={tagRef} style={{ 
                position: 'absolute', pointerEvents: 'none', 
                padding: '4px 8px', borderRadius: '4px 12px 12px 12px',
                display: 'none', alignItems: 'center'
            }} />
        </div>
    );
};

export default GlobalCursor;
