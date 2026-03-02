// ==================== 教学引导系统（强引导·聚光灯遮罩版）====================

// 引导步骤定义
// focusSelector: CSS 选择器，指定聚光灯镂空区域（null = 无镂空，只显示遮罩+气泡）
// allowInteract:  true = 镂空区域可交互（玩家需自行操作）
//                false = 镂空区域仅高亮展示，操作由气泡按钮驱动
// onShow: 气泡出现前的回调
// onNext: 气泡消失后的回调，可传入 done 回调让引导系统等待

// ── 移动端检测（与 resizer.js 断点一致）──
function _tutIsMobile() { return window.innerWidth < 1024; }

// ── 获取有效 selector（主选择器不可见时自动回退到 fallback）──
function _tutGetSelector(primary, fallback) {
    var el = primary ? document.querySelector(primary) : null;
    if (el) {
        var r = el.getBoundingClientRect();
        if (r.width > 0 || r.height > 0) return primary;
    }
    return fallback || null;
}

var tutorialSteps = [
    // ── Step 0：欢迎 ──
    {
        id: 'welcome',
        get title()   { return T('step0_title',   'tutorial'); },
        get content() { return T('step0_content', 'tutorial'); },
        // PC：顶部 tab；移动端：底部导航栏探索按钮
        get focusSelector() {
            return _tutGetSelector(
                '.tab[onclick*="exploration"]',
                '.bottom-nav-item[data-tab="exploration"]'
            );
        },
        allowInteract: true,   // 玩家直接点击高亮的探索 tab
        btnText: null,         // 无按钮，等待玩家自行点击
        onShow: function() {
            // 监听切换到探索页面后自动推进
            window._tutWaitExploreTab = setInterval(function() {
                var exploreTab = document.getElementById('exploration-tab');
                if (exploreTab && exploreTab.classList.contains('active')) {
                    clearInterval(window._tutWaitExploreTab);
                    window._tutWaitExploreTab = null;
                    if (typeof tutorialState !== 'undefined' && tutorialState.active && tutorialState.currentStep === 0) {
                        showTutorialStep(1);
                    }
                }
            }, 200);
        },
        onNext: null
    },

    // ── Step 1：手动探索，必定捕获 ──
    {
        id: 'explore_first',
        get title()   { return T('step1_title',   'tutorial'); },
        get content() { return T('step1_content', 'tutorial'); },
        focusSelector: 'button.expl-manual-btn[onclick*="farm_edge"]',
        allowInteract: true,
        btnText: null,      // 等待系统触发
        onShow: function() {
            tutorialState.waitingForMonster = true;
            // 标记"必定捕获"
            tutorialState.guaranteeCatch = true;
            // 等 DOM 渲染完后刷新遮罩
            setTimeout(function() {
                if (tutorialState.active && tutorialState.currentStep === 1) {
                    var step = tutorialSteps[1];
                    renderOverlay(step);
                    var bubble = document.getElementById('tutorialBubble');
                    if (bubble) positionBubble(bubble, step);
                }
            }, 300);
        },
        onNext: null
    },

    // ── Step 2：捕获成功，直接引导点击「派驻农田」按钮 ──
    {
        id: 'select_monster',
        get title()   { return T('step2_title',   'tutorial'); },
        get content() { return T('step2_content', 'tutorial'); },
        // 直接高亮「派驻农田」按钮，PC侧边栏或移动端详情弹窗均适配
        get focusSelector() {
            return _tutGetSelector(
                '#monsterSidebar .msb-btn-assign',
                '.modal-content .msb-btn-assign'
            );
        },
        allowInteract: true,
        btnText: null,
        onShow: function() {
            tutorialState.waitingForMonsterSelect = true;
            // 移动端：自动打开第一只怪兽详情弹窗，让弹窗内的派驻按钮出现
            if (_tutIsMobile() && gameState.monsters && gameState.monsters.length > 0) {
                var firstId = gameState.monsters[0].id;
                if (typeof showMonsterDetailModal === 'function') {
                    showMonsterDetailModal(firstId);
                }
            }
            setTimeout(function() {
                if (tutorialState.active && tutorialState.currentStep === 2) {
                    renderOverlay(tutorialSteps[2]);
                    var b = document.getElementById('tutorialBubble');
                    if (b) positionBubble(b, tutorialSteps[2]);
                }
            }, 450);
        },
        onNext: null
    },

    // ── Step 3：点击「派驻农田」按钮 ──
    {
        id: 'assign_farm',
        get title()   { return T('step3_title',   'tutorial'); },
        get content() { return T('step3_content', 'tutorial'); },
        // PC: 侧边栏的派驻按钮；移动端: 详情弹窗里的派驻按钮
        get focusSelector() {
            return _tutGetSelector(
                '#monsterSidebar .msb-btn-assign',
                '.modal-content .msb-btn-assign'
            );
        },
        allowInteract: true,
        btnText: null,
        onShow: function() {
            tutorialState.waitingForAssign = true;
            // 移动端：自动打开第一只怪兽的详情弹窗（弹窗里有"派驻农田"按钮）
            if (_tutIsMobile() && gameState.monsters && gameState.monsters.length > 0) {
                var firstId = gameState.monsters[0].id;
                if (typeof showMonsterDetailModal === 'function') {
                    showMonsterDetailModal(firstId);
                }
            }
            setTimeout(function() {
                if (tutorialState.active && tutorialState.currentStep === 3) {
                    renderOverlay(tutorialSteps[3]);
                    var b = document.getElementById('tutorialBubble');
                    if (b) positionBubble(b, tutorialSteps[3]);
                }
            }, 500);
        },
        onNext: null
    },

    // ── Step 4：选择地块（强引导，高亮第一个地块，禁止取消）──
    {
        id: 'pick_plot',
        get title()   { return T('step4_title',   'tutorial'); },
        get content() { return T('step4_content', 'tutorial'); },
        // 高亮第一个地块格子（farm.js 在引导模式下给第一格加了 id）
        focusSelector: '#tut-first-plot',
        allowInteract: true,
        btnText: null,      // 等玩家点击地块后触发钩子推进
        onShow: function() {
            tutorialState.waitingForPlotPick = true;
            // 等弹窗 DOM 完全渲染、第一格 id 出现后再刷新遮罩
            setTimeout(function() {
                if (tutorialState.active && tutorialState.currentStep === 4) {
                    renderOverlay(tutorialSteps[4]);
                    var b = document.getElementById('tutorialBubble');
                    if (b) positionBubble(b, tutorialSteps[4]);
                }
            }, 500);
        },
        onNext: null
    },

    // ── Step 5：前往农场 ──
    {
        id: 'go_farm',
        get title()   { return T('step5_title',   'tutorial'); },
        get content() { return T('step5_content', 'tutorial'); },
        // 高亮农场Tab按钮（PC顶部tab或移动端底部导航）
        get focusSelector() {
            return _tutGetSelector(
                '.tab[onclick*="farm"]',
                '.bottom-nav-item[data-tab="farm"]'
            );
        },
        allowInteract: true,
        get btnText() { return T('step5_btn', 'tutorial'); },
        onShow: function() {
            setTimeout(function() {
                if (tutorialState.active && tutorialState.currentStep === 5) {
                    renderOverlay(tutorialSteps[5]);
                    var b = document.getElementById('tutorialBubble');
                    if (b) positionBubble(b, tutorialSteps[5]);
                }
            }, 300);
        },
        onNext: function(done) {
            switchTab('farm');
            setTimeout(done, 400);
        }
    },

    // ── Step 6：农场介绍，完成引导 ──
    {
        id: 'farm_intro',
        get title()   { return T('step6_title',   'tutorial'); },
        get content() { return T('step6_content', 'tutorial'); },
        focusSelector: '#farmGrid',
        allowInteract: true,
        get btnText() { return T('step6_btn', 'tutorial'); },
        onShow: null,
        onNext: function(done) {
            completeTutorial();
            done();
        }
    }
];

// 当前引导状态
var tutorialState = {
    active: false,
    currentStep: 0,
    completed: false,
    waitingForMonster: false,
    guaranteeCatch: false,
    waitingForMonsterSelect: false,
    waitingForAssign: false,
    waitingForPlotPick: false
};

// ── 启动引导 ──
window.startTutorial = function() {
    tutorialState.active = true;
    tutorialState.currentStep = 0;
    tutorialState.completed = false;
    tutorialState.waitingForMonster = false;
    tutorialState.guaranteeCatch = false;
    tutorialState.waitingForMonsterSelect = false;
    tutorialState.waitingForAssign = false;
    tutorialState.waitingForPlotPick = false;
    showTutorialStep(0);
};

// ── 显示某步骤 ──
function showTutorialStep(index) {
    if (index >= tutorialSteps.length) { completeTutorial(); return; }

    var step = tutorialSteps[index];
    tutorialState.currentStep = index;
    // 重置所有等待标志
    tutorialState.waitingForMonster = false;
    tutorialState.waitingForMonsterSelect = false;
    tutorialState.waitingForAssign = false;
    tutorialState.waitingForPlotPick = false;

    // 先清旧元素，再渲染新的
    removeTutorialDOM();

    // 如果有 onShow 钩子，调用它
    if (step.onShow) step.onShow();

    // 延一帧再渲染，确保 DOM 稳定（特别是 tab 切换后）
    requestAnimationFrame(function() {
        renderOverlay(step);
        renderBubble(step);
    });
}

/**
 * 统一的"推进步骤"辅助函数：
 * 立即移除当前遮罩/气泡（避免高亮框残留），
 * 等待 delay ms 后再渲染下一步。
 * @param {number} nextIndex  - 目标步骤下标
 * @param {number} [delay=0]  - 等待时长（ms）
 */
function _advanceStep(nextIndex, delay) {
    // ① 立刻撤掉旧引导 DOM，页面切换期间不留残影
    removeTutorialDOM();
    var ms = (typeof delay === 'number' && delay > 0) ? delay : 0;
    if (ms > 0) {
        setTimeout(function() {
            if (tutorialState.active) showTutorialStep(nextIndex);
        }, ms);
    } else {
        if (tutorialState.active) showTutorialStep(nextIndex);
    }
}

// ── 清除引导 DOM ──
function removeTutorialDOM() {
    var o = document.getElementById('tutorialOverlay');
    var b = document.getElementById('tutorialBubble');
    if (o) o.remove();
    if (b) b.remove();
}

// ── 渲染聚光灯遮罩（四块拼接法）──
function renderOverlay(step) {
    var old = document.getElementById('tutorialOverlay');
    if (old) old.remove();

    var overlay = document.createElement('div');
    overlay.id = 'tutorialOverlay';
    document.body.appendChild(overlay);

    if (!step.focusSelector) {
        overlay.innerHTML = '<div class="tut-mask" style="top:0;left:0;right:0;bottom:0;position:fixed;"></div>';
        return;
    }

    var target = document.querySelector(step.focusSelector);
    if (!target) {
        overlay.innerHTML = '<div class="tut-mask" style="top:0;left:0;right:0;bottom:0;position:fixed;"></div>';
        return;
    }

    var rect = target.getBoundingClientRect();

    if (rect.width === 0 && rect.height === 0) {
        overlay.innerHTML = '<div class="tut-mask" style="top:0;left:0;right:0;bottom:0;position:fixed;"></div>';
        return;
    }

    var pad = 8;
    var top    = Math.max(0, rect.top    - pad);
    var left   = Math.max(0, rect.left   - pad);
    var bottom = rect.bottom + pad;
    var right  = rect.right  + pad;
    var w      = rect.width  + pad * 2;
    var h      = rect.height + pad * 2;

    overlay.innerHTML =
        '<div class="tut-mask" style="top:0;left:0;right:0;height:' + top + 'px;position:fixed;"></div>' +
        '<div class="tut-mask" style="top:' + bottom + 'px;left:0;right:0;bottom:0;position:fixed;"></div>' +
        '<div class="tut-mask" style="top:' + top + 'px;left:0;width:' + left + 'px;height:' + h + 'px;position:fixed;"></div>' +
        '<div class="tut-mask" style="top:' + top + 'px;left:' + right + 'px;right:0;height:' + h + 'px;position:fixed;"></div>' +
        '<div class="tut-focus-border" style="top:' + top + 'px;left:' + left + 'px;width:' + w + 'px;height:' + h + 'px;position:fixed;pointer-events:none;"></div>';

    if (!step.allowInteract) {
        overlay.innerHTML +=
            '<div style="position:fixed;top:' + top + 'px;left:' + left + 'px;width:' + w + 'px;height:' + h + 'px;z-index:4050;cursor:not-allowed;"></div>';
    }
}

// ── 渲染引导气泡 ──
function renderBubble(step) {
    var old = document.getElementById('tutorialBubble');
    if (old) old.remove();

    // btnText 为 null 时显示等待提示
    var waitingLabel = '';
    if (step.btnText === null) {
        if (step.id === 'welcome')             waitingLabel = T('wait_click_tab',    'tutorial');
        else if (step.id === 'explore_first')  waitingLabel = T('wait_explore',      'tutorial');
        else if (step.id === 'select_monster') waitingLabel = T('wait_select',       'tutorial');
        else if (step.id === 'assign_farm')    waitingLabel = T('wait_assign',       'tutorial');
        else if (step.id === 'pick_plot')      waitingLabel = T('wait_plot',         'tutorial');
        else                                   waitingLabel = T('wait_generic',      'tutorial');
    }

    var bubble = document.createElement('div');
    bubble.id = 'tutorialBubble';
    bubble.innerHTML =
        '<div class="tut-header">' +
            '<span class="tut-title">' + step.title + '</span>' +
            '<button class="tut-skip" onclick="skipTutorial()">' + T('skip_btn','tutorial') + '</button>' +
        '</div>' +
        '<div class="tut-body">' + step.content + '</div>' +
        '<div class="tut-footer">' +
            '<span class="tut-progress">' + (tutorialState.currentStep + 1) + ' / ' + tutorialSteps.length + '</span>' +
            (step.btnText === null
                ? '<span class="tut-waiting-label">' + waitingLabel + '</span>'
                : '<button class="tut-btn" onclick="tutorialNext()">' + step.btnText + '</button>'
            ) +
        '</div>';

    document.body.appendChild(bubble);
    positionBubble(bubble, step);

    requestAnimationFrame(function() {
        bubble.classList.add('tut-show');
    });
}

// ── 气泡智能定位 ──
function positionBubble(bubble, step) {
    bubble.style.cssText = 'bottom:24px;left:50%;transform:translateX(-50%) translateY(30px);';

    if (!step.focusSelector) return;
    var target = document.querySelector(step.focusSelector);
    if (!target) return;

    var rect = target.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    var BW = 370, BH = 240;
    var vw = window.innerWidth, vh = window.innerHeight;
    var mg = 16;

    function setPos(top, cx) {
        cx = Math.max(mg, Math.min(vw - BW - mg, cx));
        bubble.style.cssText =
            'position:fixed;' +
            'top:' + top + 'px;' +
            'left:' + cx + 'px;' +
            'transform:translateY(20px);' +
            'width:' + BW + 'px;';
        bubble.style.setProperty('--tut-show-transform', 'translateY(0)');
    }

    var cx0 = rect.left + rect.width / 2 - BW / 2;
    if (rect.bottom + BH + mg < vh) { setPos(rect.bottom + mg, cx0); return; }
    if (rect.top - BH - mg > 0)     { setPos(rect.top - BH - mg, cx0); return; }
    if (rect.right + BW + mg < vw)  {
        bubble.style.cssText =
            'position:fixed;top:' + Math.max(mg, rect.top) + 'px;' +
            'left:' + (rect.right + mg) + 'px;' +
            'transform:translateY(20px);width:' + BW + 'px;';
        bubble.style.setProperty('--tut-show-transform', 'translateY(0)');
        return;
    }
    bubble.style.setProperty('--tut-show-transform', 'translateX(-50%) translateY(0)');
}

// ── 点击「下一步」按钮 ──
window.tutorialNext = function() {
    var step = tutorialSteps[tutorialState.currentStep];
    if (!step) return;
    if (step.btnText === null) return; // 等待型步骤不响应

    if (step.onNext) {
        step.onNext(function() {
            var nextIdx = tutorialState.currentStep + 1;
            if (tutorialState.active) showTutorialStep(nextIdx);
        });
    } else {
        showTutorialStep(tutorialState.currentStep + 1);
    }
};

// ── 捕获事件钩子（exploration.js 调用）── Step1 → Step2
window.onTutorialMonsterCaught = function() {
    if (!tutorialState.active || !tutorialState.waitingForMonster) return;
    tutorialState.waitingForMonster = false;
    tutorialState.guaranteeCatch = false;
    // ① 立刻清除旧遮罩，避免捕获通知弹出期间高亮框悬浮在错误位置
    // ② 延迟 900ms 让通知显示完后再展示下一步
    _advanceStep(2, 900);
};

// ── 点击怪兽卡片钩子（monster.js 中 selectMonster 调用）── Step2 → Step3
window.onTutorialMonsterSelected = function() {
    if (!tutorialState.active || !tutorialState.waitingForMonsterSelect) return;
    tutorialState.waitingForMonsterSelect = false;
    // 立刻撤掉当前遮罩，等 DOM 重绘（卡片展开、派驻按钮出现）后再渲染下一步
    _advanceStep(3, 320);
};

// ── 点击耕作按钮钩子（farm.js 中 showAssignPlotPicker 调用）── Step3→Step4，或 Step2 直接跳 Step4
window.onTutorialAssignFarm = function() {
    if (!tutorialState.active) return;
    // 玩家在 Step2 时直接点了"派驻农田"，跳过 Step3，直接进 Step4
    if (tutorialState.waitingForMonsterSelect) {
        tutorialState.waitingForMonsterSelect = false;
        tutorialState.waitingForAssign = false;
        // ★ 同步设置，确保 showAssignPlotPicker 生成 HTML 时已为 true
        tutorialState.waitingForPlotPick = true;
        // 立刻清遮罩，等地块弹窗渲染完毕再显示下一步
        _advanceStep(4, 320);
        return;
    }
    if (!tutorialState.waitingForAssign) return;
    tutorialState.waitingForAssign = false;
    // ★ 同步设置，确保 showAssignPlotPicker 生成 HTML 时已为 true
    tutorialState.waitingForPlotPick = true;
    // 立刻清遮罩，等 showAssignPlotPicker 模态框渲染完毕再显示下一步
    _advanceStep(4, 320);
};

// ── 选择地块钩子（farm.js 中 assignMonsterToPlot 调用）── Step4 → Step5
window.onTutorialPlotPicked = function() {
    if (!tutorialState.active || !tutorialState.waitingForPlotPick) return;
    tutorialState.waitingForPlotPick = false;
    // 立刻清遮罩（地块选择弹窗会关闭，UI 会切换），延迟后再显示引导气泡
    _advanceStep(5, 350);
};

// ── 完成引导 ──
window.completeTutorial = function() {
    tutorialState.active = false;
    tutorialState.completed = true;
    removeTutorialDOM();
    showNotification(T('complete_notify', 'tutorial'), 'success');
    try { localStorage.setItem('mf_tutorial_done', '1'); } catch(e) {}
};

// ── 跳过引导 ──
window.skipTutorial = function() {
    completeTutorial();
};

// ── 是否已完成引导 ──
window.checkTutorialDone = function() {
    try { return localStorage.getItem('mf_tutorial_done') === '1'; } catch(e) { return false; }
};

// ── resize 时刷新遮罩 ──
window.addEventListener('resize', function() {
    if (!tutorialState.active) return;
    var step = tutorialSteps[tutorialState.currentStep];
    if (!step) return;
    renderOverlay(step);
    var bubble = document.getElementById('tutorialBubble');
    if (bubble) positionBubble(bubble, step);
});