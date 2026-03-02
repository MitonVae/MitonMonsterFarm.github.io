// ==================== Supabase 账号系统 ====================
// 配置区 —— 仅 anon/publishable key，可以安全地放在前端代码中
var SUPABASE_URL  = 'https://sisdrzhcjmagviliwefl.supabase.co';
var SUPABASE_ANON = 'sb_publishable_JQeHNuvFdz0BoXMzLFH7ag_Iy8UYabV';

// Supabase 客户端实例（在 supabase-js CDN 加载后初始化）
var _sb = null;
// 当前登录用户（null = 未登录）
var _currentUser = null;
// 云端同步节流 timer
var _syncTimer = null;

// ── 初始化 Supabase 客户端 ──
function initSupabase() {
    if (typeof supabase === 'undefined' || typeof supabase.createClient !== 'function') {
        console.warn('[Auth] supabase-js 未加载，云存档功能不可用');
        return false;
    }
    _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

    // 监听登录状态变化（页面刷新后自动恢复会话）
    _sb.auth.onAuthStateChange(function(event, session) {
        _currentUser = session ? session.user : null;
        _onAuthChange(event, session);
    });
    return true;
}

// ── 登录状态变化回调 ──
function _onAuthChange(event, session) {
    refreshAuthUI();
    if (event === 'SIGNED_IN') {
        showNotification('✅ 登录成功：' + (session.user.email || session.user.phone || ''), 'success');
        // 登录后拉取云端存档，比较时间戳决定用哪份（传 true 表示自动触发）
        cloudLoadSave(true);
    } else if (event === 'SIGNED_OUT') {
        showNotification('已退出登录', 'info');
    }
}

// ── 获取当前用户 ──
function getCurrentUser() {
    return _currentUser;
}

// ── 发送魔法链接 ──
window.authSendMagicLink = async function(email) {
    if (!_sb) { showNotification('云存档服务未初始化', 'error'); return; }
    if (!email || !email.includes('@')) {
        showNotification('请输入有效的邮箱地址', 'error'); return;
    }
    try {
        var redirectUrl = window.location.origin + window.location.pathname;
        var res = await _sb.auth.signInWithOtp({
            email: email,
            options: { emailRedirectTo: redirectUrl }
        });
        if (res.error) throw res.error;
        showNotification('📧 魔法链接已发送到 ' + email + '，请查收邮件并点击链接登录', 'success');
        return true;
    } catch(e) {
        showNotification('发送失败：' + e.message, 'error');
        return false;
    }
};

// ── 邮箱+密码注册 ──
window.authSignUp = async function(email, password) {
    if (!_sb) { showNotification('云存档服务未初始化', 'error'); return; }
    try {
        var redirectUrl = window.location.origin + window.location.pathname;
        var res = await _sb.auth.signUp({
            email: email,
            password: password,
            options: { emailRedirectTo: redirectUrl }
        });
        if (res.error) throw res.error;
        showNotification('📧 注册成功！请查收验证邮件后登录', 'success');
        return true;
    } catch(e) {
        showNotification('注册失败：' + e.message, 'error');
        return false;
    }
};

// ── 邮箱+密码登录 ──
window.authSignIn = async function(email, password) {
    if (!_sb) { showNotification('云存档服务未初始化', 'error'); return; }
    try {
        var res = await _sb.auth.signInWithPassword({ email: email, password: password });
        if (res.error) throw res.error;
        return true;
    } catch(e) {
        showNotification('登录失败：' + e.message, 'error');
        return false;
    }
};

// ── 退出登录 ──
window.authSignOut = async function() {
    if (!_sb) return;
    await _sb.auth.signOut();
};

// ── 云端上传存档 ──
window.cloudSaveSave = async function(silent) {
    if (!_sb || !_currentUser) return;
    try {
        var raw = localStorage.getItem('monsterFarm_v1') || '{}';
        var now = new Date().toISOString();
        var res = await _sb.from('saves').upsert({
            user_id: _currentUser.id,
            data: JSON.parse(raw),
            updated_at: now
        }, { onConflict: 'user_id' });
        if (res.error) throw res.error;
        if (!silent) showNotification('☁️ 云端存档已同步', 'success');
    } catch(e) {
        if (!silent) showNotification('云端同步失败：' + e.message, 'error');
    }
};

// ── 云端下载存档
// autoTriggered=true 时为登录自动调用，会在云端旧时才静默上传本地
// autoTriggered 不传/false 时为用户手动点"拉取云档"，直接弹窗让用户决定
window.cloudLoadSave = async function(autoTriggered) {
    // 区分手动（不传参/false）vs 自动（显式传 true）
    var isAuto = (autoTriggered === true);
    if (!_sb || !_currentUser) return;
    try {
        var res = await _sb.from('saves')
            .select('data, updated_at')
            .eq('user_id', _currentUser.id)
            .single();

        // 无云端存档
        if (res.error && res.error.code === 'PGRST116') {
            if (isAuto) {
                // 登录时首次上传
                await cloudSaveSave(true);
                showNotification('☁️ 首次登录，本地存档已上传云端', 'success');
            } else {
                showNotification('云端暂无存档，请先上传本地存档', 'warning');
            }
            return;
        }
        if (res.error) throw res.error;

        // res.data = { data: { ...游戏存档... }, updated_at: "..." }
        var row = res.data;
        var cloudGameData = row.data;        // 游戏存档 JSON
        var cloudUpdatedAt = row.updated_at; // 云端行更新时间

        // 优先使用存档内的 savedAt，否则退回 updated_at
        var cloudSavedAt = (cloudGameData && cloudGameData.savedAt) ? cloudGameData.savedAt : cloudUpdatedAt;
        var cloudTime = new Date(cloudSavedAt).getTime();
        if (isNaN(cloudTime)) cloudTime = 0;

        // 比较本地存档时间戳
        var localRaw = localStorage.getItem('monsterFarm_v1');
        var localTime = 0;
        if (localRaw) {
            try { localTime = new Date(JSON.parse(localRaw).savedAt || 0).getTime(); } catch(e) {}
        }

        var diff = cloudTime - localTime;

        if (!isAuto) {
            // 手动"拉取云档"：始终弹窗让用户确认，绝不自动覆盖任何一方
            _showCloudConflict(cloudGameData, cloudTime, localTime, true);
        } else if (diff > 5000) {
            // 登录自动触发 & 云端明显更新 → 弹窗询问
            _showCloudConflict(cloudGameData, cloudTime, localTime, false);
        } else {
            // 登录自动触发 & 本地更新或相同 → 静默上传本地到云端
            await cloudSaveSave(true);
            showNotification('☁️ 本地存档已同步到云端', 'success');
        }
    } catch(e) {
        showNotification('云端读取失败：' + e.message, 'error');
    }
};

// ── 存档冲突弹窗 ──
// manualPull=true 表示用户主动点"拉取云档"，弹窗措辞不同
function _showCloudConflict(cloudData, cloudTime, localTime, manualPull) {
    var cloudDate = cloudTime ? new Date(cloudTime).toLocaleString('zh-CN') : '未知';
    var localDate = localTime ? new Date(localTime).toLocaleString('zh-CN') : '未知';
    var title = manualPull ? '📥 拉取云端存档' : '☁️ 发现云端存档';
    var desc  = manualPull
        ? '请选择要保留的存档版本：'
        : '检测到云端存档比本地更新，请选择：';
    showModal(
        '<div class="modal-header">' + title + '</div>' +
        '<div style="padding:12px 0;font-size:13px;line-height:1.8;color:#c9d1d9;">' +
            '<p>' + desc + '</p>' +
            '<div style="background:#21262d;border-radius:8px;padding:10px 14px;margin:10px 0;">' +
                '<div>☁️ 云端存档时间：<strong style="color:#58a6ff;">' + cloudDate + '</strong></div>' +
                '<div>💾 本地存档时间：<strong style="color:#8b949e;">' + localDate + '</strong></div>' +
            '</div>' +
            '<p style="color:#f0883e;">⚠️ 使用云端存档会覆盖当前本地进度，操作不可撤销。</p>' +
        '</div>' +
        '<div class="modal-buttons">' +
            '<button class="btn btn-danger" onclick="window._applyCloudSave()">📥 使用云端存档</button>' +
            '<button class="btn btn-primary" onclick="cloudSaveSave();closeModal();">💾 保留本地并上传</button>' +
        '</div>'
    );
    window._pendingCloudData = cloudData;
}

// ── 应用云端存档 ──
window._applyCloudSave = function() {
    if (!window._pendingCloudData) return;
    try {
        var json = JSON.stringify(window._pendingCloudData);
        // 先移除 beforeunload 监听，防止 reload 时 autoSave 把旧数据重新写回
        window.removeEventListener('beforeunload', autoSave);
        localStorage.setItem('monsterFarm_v1', json);
        closeModal();
        showNotification('☁️ 云端存档已应用，正在重新加载…', 'success');
        setTimeout(function() { location.reload(); }, 800);
    } catch(e) {
        showNotification('应用云端存档失败：' + e.message, 'error');
    }
};

// ── 节流自动同步（存档时顺便同步云端） ──
window.triggerCloudSync = function() {
    if (!_currentUser) return;
    clearTimeout(_syncTimer);
    _syncTimer = setTimeout(function() {
        cloudSaveSave(true);
    }, 3000); // 3秒防抖，避免频繁请求
};

// ── 刷新设置面板中的账号区 UI ──
window.refreshAuthUI = function() {
    var el = document.getElementById('authSection');
    if (!el) return;
    if (_currentUser) {
        el.innerHTML = _buildLoggedInUI(_currentUser);
    } else {
        el.innerHTML = _buildLoginFormUI();
    }
};

// ── 已登录状态 UI ──
function _buildLoggedInUI(user) {
    return '<div style="background:#21262d;border-radius:8px;padding:12px 14px;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">' +
            '<div>' +
                '<div style="font-size:13px;color:#e6edf3;">👤 ' + (user.email || user.phone || '已登录') + '</div>' +
                '<div style="font-size:11px;color:#8b949e;margin-top:2px;">ID: ' + user.id.slice(0,8) + '…</div>' +
            '</div>' +
            '<button class="btn btn-primary" style="font-size:11px;padding:4px 10px;" ' +
                'onclick="authSignOut()">退出</button>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">' +
            '<button class="btn btn-success" style="font-size:12px;padding:6px 0;" ' +
                'onclick="cloudSaveSave()">☁️ 立即同步</button>' +
            '<button class="btn btn-primary" style="font-size:12px;padding:6px 0;" ' +
                'onclick="cloudLoadSave()">📥 拉取云档</button>' +
        '</div>' +
    '</div>';
}

// ── 未登录状态 UI（两种登录方式可切换） ──
function _buildLoginFormUI() {
    return '<div id="loginFormWrap">' + _loginTabHtml('magic') + '</div>';
}

window._loginTabHtml = function(mode) {
    var magicActive  = mode === 'magic'    ? 'background:#1f6feb;color:#fff;' : 'background:#21262d;color:#8b949e;';
    var passActive   = mode === 'password' ? 'background:#1f6feb;color:#fff;' : 'background:#21262d;color:#8b949e;';
    var signupActive = mode === 'signup'   ? 'background:#1f6feb;color:#fff;' : 'background:#21262d;color:#8b949e;';
    var formHtml = '';
    if (mode === 'magic') {
        formHtml =
            '<input id="authEmail" type="email" placeholder="输入邮箱地址" ' +
                'style="width:100%;box-sizing:border-box;padding:7px 10px;border-radius:6px;border:1px solid #30363d;background:#0d1117;color:#e6edf3;font-size:13px;margin-bottom:8px;">' +
            '<button class="btn btn-success" style="width:100%;font-size:13px;" ' +
                'onclick="authSendMagicLink(document.getElementById(\'authEmail\').value)">📧 发送魔法链接</button>' +
            '<div style="font-size:11px;color:#8b949e;margin-top:6px;">点击邮件中的链接即可免密登录</div>';
    } else if (mode === 'password') {
        formHtml =
            '<input id="authEmail" type="email" placeholder="邮箱" ' +
                'style="width:100%;box-sizing:border-box;padding:7px 10px;border-radius:6px;border:1px solid #30363d;background:#0d1117;color:#e6edf3;font-size:13px;margin-bottom:6px;">' +
            '<input id="authPass" type="password" placeholder="密码" ' +
                'style="width:100%;box-sizing:border-box;padding:7px 10px;border-radius:6px;border:1px solid #30363d;background:#0d1117;color:#e6edf3;font-size:13px;margin-bottom:8px;">' +
            '<button class="btn btn-success" style="width:100%;font-size:13px;" ' +
                'onclick="authSignIn(document.getElementById(\'authEmail\').value,document.getElementById(\'authPass\').value)">🔑 登录</button>';
    } else {
        formHtml =
            '<input id="authEmail" type="email" placeholder="邮箱" ' +
                'style="width:100%;box-sizing:border-box;padding:7px 10px;border-radius:6px;border:1px solid #30363d;background:#0d1117;color:#e6edf3;font-size:13px;margin-bottom:6px;">' +
            '<input id="authPass" type="password" placeholder="密码（至少6位）" ' +
                'style="width:100%;box-sizing:border-box;padding:7px 10px;border-radius:6px;border:1px solid #30363d;background:#0d1117;color:#e6edf3;font-size:13px;margin-bottom:8px;">' +
            '<button class="btn btn-success" style="width:100%;font-size:13px;" ' +
                'onclick="authSignUp(document.getElementById(\'authEmail\').value,document.getElementById(\'authPass\').value)">✨ 注册账号</button>';
    }
    return '<div style="display:flex;gap:4px;margin-bottom:10px;">' +
        '<button style="flex:1;padding:5px;border-radius:6px;border:none;cursor:pointer;font-size:12px;' + magicActive + '" ' +
            'onclick="document.getElementById(\'loginFormWrap\').innerHTML=window._loginTabHtml(\'magic\')">魔法链接</button>' +
        '<button style="flex:1;padding:5px;border-radius:6px;border:none;cursor:pointer;font-size:12px;' + passActive + '" ' +
            'onclick="document.getElementById(\'loginFormWrap\').innerHTML=window._loginTabHtml(\'password\')">密码登录</button>' +
        '<button style="flex:1;padding:5px;border-radius:6px;border:none;cursor:pointer;font-size:12px;' + signupActive + '" ' +
            'onclick="document.getElementById(\'loginFormWrap\').innerHTML=window._loginTabHtml(\'signup\')">注册</button>' +
    '</div>' + formHtml;
}
