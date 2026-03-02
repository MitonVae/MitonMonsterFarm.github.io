// ==================== 工具函数 ====================

function createSVG(type, size) {
    size = size || 48;
    var svgs = {
        lock: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>`,
        
        add: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>`,
        
        plant: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#4caf50" stroke-width="2">
            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
            <path d="M12 2v20"/>
        </svg>`,
        
        slime: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24">
            <ellipse cx="12" cy="16" rx="8" ry="6" fill="#4caf50" opacity="0.8"/>
            <circle cx="9" cy="14" r="1.5" fill="#fff"/>
            <circle cx="15" cy="14" r="1.5" fill="#fff"/>
            <circle cx="9" cy="14" r="0.7" fill="#000"/>
            <circle cx="15" cy="14" r="0.7" fill="#000"/>
        </svg>`,
        
        goblin: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="7" fill="#ff9800" opacity="0.8"/>
            <polygon points="8,8 9,5 11,8" fill="#ff9800"/>
            <polygon points="16,8 15,5 13,8" fill="#ff9800"/>
            <circle cx="9" cy="12" r="1.2" fill="#fff"/>
            <circle cx="15" cy="12" r="1.2" fill="#fff"/>
            <circle cx="9" cy="12" r="0.6" fill="#000"/>
            <circle cx="15" cy="12" r="0.6" fill="#000"/>
            <path d="M 9 15 Q 12 17 15 15" stroke="#000" stroke-width="1" fill="none"/>
        </svg>`,
        
        sprite: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="6" fill="#2196f3" opacity="0.6"/>
            <path d="M 8 10 L 6 8 L 8 9" stroke="#2196f3" stroke-width="1.5" fill="none"/>
            <path d="M 16 10 L 18 8 L 16 9" stroke="#2196f3" stroke-width="1.5" fill="none"/>
            <circle cx="10" cy="11" r="1" fill="#fff"/>
            <circle cx="14" cy="11" r="1" fill="#fff"/>
            <path d="M 10 14 Q 12 15 14 14" stroke="#fff" stroke-width="1" fill="none"/>
        </svg>`,
        
        golem: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24">
            <rect x="7" y="7" width="10" height="12" fill="#795548" opacity="0.8" rx="2"/>
            <rect x="8" y="10" width="2" height="2" fill="#ffeb3b"/>
            <rect x="14" y="10" width="2" height="2" fill="#ffeb3b"/>
            <rect x="10" y="15" width="4" height="1" fill="#000"/>
        </svg>`,
        
        wisp: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="6" fill="#9c27b0" opacity="0.5"/>
            <circle cx="12" cy="10" r="4" fill="#ce93d8" opacity="0.7"/>
            <circle cx="10" cy="10" r="1" fill="#fff"/>
            <circle cx="14" cy="10" r="1" fill="#fff"/>
            <path d="M 10 18 Q 12 20 14 18" stroke="#9c27b0" stroke-width="1" fill="none" opacity="0.5"/>
        </svg>`,
        
        explore: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
        </svg>`,
        
        breeding: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>`,
        
        recycle: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
            <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
            <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>`,
        
        // 资源图标
        coin: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" fill="#f0c53d" opacity="0.2"/>
            <circle cx="12" cy="12" r="7" stroke="#f0c53d" stroke-width="1.5" fill="none"/>
            <text x="12" y="16" text-anchor="middle" font-size="10" font-weight="bold" fill="#f0c53d">¥</text>
        </svg>`,
        
        food: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24">
            <path d="M12 2c3.5 0 6.5 2.5 8 6-1.5 3.5-4.5 6-8 6s-6.5-2.5-8-6c1.5-3.5 4.5-6 8-6z" fill="#46d164" opacity="0.3"/>
            <circle cx="12" cy="8" r="6" fill="none" stroke="#46d164" stroke-width="1.5"/>
            <path d="M8 8c0-2 2-4 4-4s4 2 4 4" fill="none" stroke="#46d164" stroke-width="1.5"/>
            <path d="M9 12l3 3 6-6" stroke="#46d164" stroke-width="1.5" fill="none"/>
            <circle cx="12" cy="20" r="2" fill="#8fce00"/>
            <path d="M12 18v4" stroke="#46d164" stroke-width="1"/>
        </svg>`,
        
        material: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24">
            <rect x="4" y="6" width="4" height="4" fill="#8b949e" opacity="0.6" rx="0.5"/>
            <rect x="10" y="6" width="4" height="4" fill="#8b949e" opacity="0.8" rx="0.5"/>
            <rect x="16" y="6" width="4" height="4" fill="#8b949e" opacity="0.6" rx="0.5"/>
            <rect x="4" y="12" width="4" height="4" fill="#8b949e" opacity="0.8" rx="0.5"/>
            <rect x="10" y="12" width="4" height="4" fill="#8b949e" opacity="0.6" rx="0.5"/>
            <rect x="16" y="12" width="4" height="4" fill="#8b949e" opacity="0.8" rx="0.5"/>
        </svg>`,
        
        heart: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#e91e63" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>`,
        
        trash: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#f85149" stroke-width="2">
            <polyline points="3,6 5,6 21,6"></polyline>
            <path d="m19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
        </svg>`,
        
        harvest: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#46d164" stroke-width="2">
            <path d="M6 2v20"></path>
            <path d="M20 8v13a1 1 0 0 1-1 1H9.5a1 1 0 0 1-1-1V8a4 4 0 0 1 4-4H20z"></path>
            <polyline points="6,10 9,7 11,9"></polyline>
        </svg>`,
        
        research: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24">
            <circle cx="12" cy="10" r="6" fill="none" stroke="#58a6ff" stroke-width="1.5"/>
            <path d="M15 15l4 4" stroke="#58a6ff" stroke-width="2"/>
            <circle cx="12" cy="10" r="3" fill="#58a6ff" opacity="0.2"/>
            <path d="M10 8l2 2 4-4" stroke="#58a6ff" stroke-width="1.5" fill="none"/>
            <circle cx="12" cy="10" r="1" fill="#58a6ff"/>
        </svg>`,
        
        land: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24">
            <rect x="2" y="14" width="20" height="8" fill="#8b4513" opacity="0.6"/>
            <rect x="2" y="12" width="20" height="2" fill="#228b22" opacity="0.8"/>
            <path d="M6 12c0-2 1-4 3-4s3 2 3 4" fill="none" stroke="#228b22" stroke-width="1"/>
            <path d="M12 12c0-2 1-4 3-4s3 2 3 4" fill="none" stroke="#228b22" stroke-width="1"/>
            <circle cx="8" cy="10" r="1" fill="#90EE90"/>
            <circle cx="16" cy="10" r="1" fill="#90EE90"/>
            <path d="M4 16h2m2 0h2m2 0h2m2 0h2m2 0h2" stroke="#654321" stroke-width="1"/>
        </svg>`,
        
        energy: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#f0883e" stroke-width="2">
            <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill="#f0883e" opacity="0.3"/>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#f0883e"/>
        </svg>`,
        
        // 随机事件图标
        rain: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2">
            <cloud cx="6" cy="8" r="4" fill="#58a6ff" opacity="0.3"/>
            <cloud cx="14" cy="8" r="6" fill="#58a6ff" opacity="0.3"/>
            <path d="M16 13v8m-8-6v6m4-4v8"/>
        </svg>`,
        
        bug: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#e57373" stroke-width="2">
            <ellipse cx="12" cy="14" rx="5" ry="7" fill="#e57373" opacity="0.3"/>
            <path d="M7 13c0-3.866 2.686-7 6-7s6 3.134 6 7"/>
            <path d="M7 21c0-3.866 2.686-7 6-7s6 3.134 6 7"/>
            <circle cx="10" cy="12" r="1" fill="#e57373"/>
            <circle cx="14" cy="12" r="1" fill="#e57373"/>
        </svg>`,
        
        wind: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#8b949e" stroke-width="2">
            <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/>
            <path d="M9.6 4.6A2 2 0 1 1 11 8H2"/>
            <path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
        </svg>`,
        
        map: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#f0883e" stroke-width="2">
            <polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2"/>
            <line x1="8" y1="2" x2="8" y2="18"/>
            <line x1="16" y1="6" x2="16" y2="22"/>
        </svg>`,
        
        battle: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#e57373" stroke-width="2">
            <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
        </svg>`,
        
        treasure: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#f0c53d" stroke-width="2">
            <rect x="2" y="8" width="20" height="10" rx="2" ry="2" fill="#f0c53d" opacity="0.2"/>
            <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <circle cx="12" cy="13" r="2" fill="#f0c53d" opacity="0.5"/>
        </svg>`,
        
        gift: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#46d164" stroke-width="2">
            <polyline points="20,12 20,22 4,22 4,12"/>
            <rect x="2" y="7" width="20" height="5"/>
            <line x1="12" y1="22" x2="12" y2="7"/>
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
        </svg>`,
        
        // 处理操作图标  
        sacrifice: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2">
            <polygon points="12,2 15.09,8.26 22,9 17,14.74 18.18,21.02 12,17.77 5.82,21.02 7,14.74 2,9 8.91,8.26"/>
        </svg>`,
        
        laboratory: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2">
            <path d="M9 2v6l-3 7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1l-3-7V2"/>
            <line x1="7" y1="2" x2="17" y2="2"/>
            <circle cx="12" cy="12" r="2" fill="#58a6ff" opacity="0.3"/>
        </svg>`,
        
        repair: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#8b949e" stroke-width="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>`,
        
        sell: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#46d164" stroke-width="2">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>`,
        
        release: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#46d164" stroke-width="2">
            <path d="M7 4V2a1 1 0 0 1 2 0v2h6V2a1 1 0 0 1 2 0v2h3a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2h3z"/>
            <circle cx="12" cy="16" r="6"/>
            <path d="M12 12v4m0 0l-2-2m2 2l2-2"/>
        </svg>`,
        
        warning: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#f85149" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>`,
        
        egg: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2">
            <path d="M12 22c5.523 0 8-4.477 8-10S17.523 2 12 2s-8 4.477-8 10 2.477 10 8 10z"/>
        </svg>`,
        
        breeding: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#f85149" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>`,
        
        // 工厂图标
        factory: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#8b949e" stroke-width="2">
            <rect x="2" y="12" width="20" height="10"/>
            <path d="M2 12V8a2 2 0 0 1 2-2h4"/>
            <path d="M12 12V6a2 2 0 0 1 2-2h6"/>
            <path d="M6 2v4"/>
            <path d="M10 2v4"/>
            <path d="M14 2v4"/>
            <path d="M18 2v4"/>
        </svg>`,
        
        // 状态图标
        work: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6m8.66-7.5l-5.2 3m-5.2 3l-5.2-3M1.34 16.5l5.2-3m5.2-3l5.2-3"/>
        </svg>`,
        
        unlock: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#46d164" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
        </svg>`,
        
        locked_tech: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#e57373" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            <line x1="9" y1="16" x2="15" y2="16"/>
        </svg>`,
        
        check: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#46d164" stroke-width="2">
            <polyline points="20,6 9,17 4,12"/>
        </svg>`,

        save: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17,21 17,13 7,13 7,21"/>
            <polyline points="7,3 7,8 15,8"/>
        </svg>`,

        recall: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#f0883e" stroke-width="2">
            <polyline points="1,4 1,10 7,10"/>
            <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
        </svg>`,

        tutorial: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>`,

        changelog: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#46d164" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
        </svg>`,

        settings: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>`,

        wiki: `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
        </svg>`
    };
    
    return svgs[type] || svgs.slime;
}

function getResourceIcon(resource, size) {
    size = size || 16;
    var iconMap = {
        coins: 'coin',
        food: 'food', 
        materials: 'material',
        research: 'research',
        energy: 'energy'
    };
    var iconType = iconMap[resource];
    return iconType ? createSVG(iconType, size) : '';
}

function getStatusText(status) {
    var statusMap = {
        idle:      function(){ return T('idle',      'monsterStatus'); },
        working:   function(){ return T('working',   'monsterStatus'); },
        exploring: function(){ return T('exploring', 'monsterStatus'); },
        farming:   function(){ return T('farming',   'monsterStatus'); },
        breeding:  function(){ return T('breeding',  'monsterStatus'); },
        selling:   function(){ return T('selling',   'monsterStatus'); }
    };
    return (statusMap[status] ? statusMap[status]() : status);
}

// ==================== 全局产量倍率（整合所有科技效果）====================
function calcGlobalYieldMult() {
    var mult = 1.0;
    if (!gameState || !gameState.technologies) return mult;
    var tech = gameState.technologies;
    // 依次叠加已解锁科技的 cropYield 效果
    if (typeof technologies !== 'undefined') {
        Object.keys(tech).forEach(function(key) {
            if (tech[key] && technologies[key] && technologies[key].effects && technologies[key].effects.cropYield) {
                mult *= technologies[key].effects.cropYield;
            }
        });
    }
    return mult;
}

// ==================== 里程碑（游戏阶段）检测 ====================
var _milestonesGranted = {};

function checkMilestones() {
    if (typeof gameStages === 'undefined') return;
    gameStages.forEach(function(stage) {
        if (_milestonesGranted[stage.id]) return;
        var cond = stage.conditions;
        var met = true;
        if (cond.totalHarvests    && gameState.totalHarvests    < cond.totalHarvests)    met = false;
        if (cond.monsterCount     && gameState.monsters.length  < cond.monsterCount)     met = false;
        if (cond.totalExplorations&& gameState.totalExplorations< cond.totalExplorations)met = false;
        if (cond.monstersBreed    && gameState.monstersBreed    < cond.monstersBreed)    met = false;
        if (!met) return;

        _milestonesGranted[stage.id] = true;
        // 发放奖励
        var r = stage.rewards;
        if (r.coins)          gameState.coins += r.coins;
        if (r.maxEnergyBonus) gameState.maxEnergy += r.maxEnergyBonus;
        updateResources();

        // 公告
        var msg = '🎉 达成阶段「' + stage.icon + ' ' + stage.name + '」！\n' +
                  (r.coins          ? '+ ' + r.coins + ' 金币\n' : '') +
                  (r.maxEnergyBonus ? '+ 能量上限 ' + r.maxEnergyBonus + '\n' : '') +
                  (r.unlockMsg      ? r.unlockMsg : '');
        showNotification(msg, 'achievement');
        if (typeof briefLog === 'function') briefLog('🏆 ' + stage.icon + ' ' + stage.name, 'achievement');
    });
}

// ==================== 稀有度颜色工具 ====================
function getRarityColor(rarity) {
    var colors = {
        common:    '#8b949e',
        uncommon:  '#2196f3',
        rare:      '#9c27b0',
        epic:      '#ff6d00',
        legendary: '#ffd700'
    };
    return colors[rarity] || '#8b949e';
}

function getRarityLabel(rarity) {
    return T(rarity, 'rarity') || rarity;
}

// ==================== 布局偏好工具（大卡/小卡切换）====================
// key: 'monsters' | 'exploration' | 'disposal' | 'breeding' | 'tech'
// value: 'large' | 'compact'
window.getLayoutPref = function(key) {
    try { return localStorage.getItem('mf_layout_' + key) || 'large'; } catch(e) { return 'large'; }
};
window.setLayoutPref = function(key, val) {
    try { localStorage.setItem('mf_layout_' + key, val); } catch(e) {}
};

/**
 * 渲染布局切换工具栏 HTML（插入到各界面顶部）
 * @param {string} key      - 界面标识（'monsters' 等）
 * @param {string} title    - 左侧标题文字（可含 HTML）
 * @param {Array}  extras   - 额外工具栏按钮 [{label, onclick, cls}]
 * @param {string} rerenderFn - 切换后调用的全局渲染函数名（字符串）
 */
window.renderLayoutToolbar = function(key, title, extras, rerenderFn) {
    var cur = getLayoutPref(key);
    var extrasHtml = (extras || []).map(function(e) {
        return '<button class="toolbar-quick-btn ' + (e.cls || '') + '" onclick="' + e.onclick + '">' + e.label + '</button>';
    }).join('');

    return '<div class="layout-toolbar">' +
        '<div class="layout-toolbar-left">' +
            (title ? '<span style="font-weight:700;font-size:1.0714rem;color:#e6edf3;">' + title + '</span>' : '') +
            extrasHtml +
        '</div>' +
        '<div class="layout-toolbar-right">' +
            '<div class="layout-toggle">' +
                '<button class="layout-toggle-btn' + (cur === 'large'   ? ' active' : '') + '" ' +
                    'onclick="setLayoutPref(\'' + key + '\',\'large\');' + rerenderFn + '();" ' +
                    'title="大卡片">⊞ 大卡</button>' +
                '<button class="layout-toggle-btn' + (cur === 'compact' ? ' active' : '') + '" ' +
                    'onclick="setLayoutPref(\'' + key + '\',\'compact\');' + rerenderFn + '();" ' +
                    'title="紧凑列表">☰ 小卡</button>' +
            '</div>' +
        '</div>' +
    '</div>';
};
