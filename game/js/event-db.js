// ==================== 事件数据库 (event-db.js) ====================
// 事件分三类：solo（单怪兽）、pair（怪兽对）、global（全局/农场）
//
// 事件字段说明：
//   id          - 唯一标识
//   type        - bond/rival/growth/social/disaster/fortune/player/general
//   typeLabel   - 面板显示标签
//   title       - 标题（支持{m1}{m2}{player}占位符）
//   desc        - 描述文字
//   summary     - 简报/履历摘要（较短）
//   weight      - 抽取权重（越高越常见）
//   chance      - 触发概率（每次检查）
//   cooldown    - 同一怪兽触发冷却（游戏内秒）
//   condition   - fn(m1,m2) 返回bool，满足才进入候选池（内部判定，不展示给玩家）
//   silentEffect- fn(m1,m2) 静默效果（不向玩家展示），返回值传给choice.effect
//   choices     - [] 玩家选项（空则静默处理），每项含{ text, cost?, effect }
// ================================================================

var EVENT_DB = {

    // ================================================================
    // SOLO：单怪兽事件
    // ================================================================
    solo: [

        // ── 成长类 ──
        {
            id: 'solo_epiphany',
            type: 'growth',
            typeLabel: '顿悟',
            weight: 8, chance: 0.04, cooldown: 600,
            title: '{m1} 陷入沉思',
            desc: '{m1} 在农场角落安静地待了很久，仿佛在思考生命的意义。',
            summary: '{m1} 经历了一次顿悟，某项属性得到了提升。',
            condition: function(m) { return m.level >= 3; },
            silentEffect: function(m) {
                // 随机提升一项属性，偏向最低的那项
                var stats = Object.keys(m.stats);
                stats.sort(function(a,b){ return m.stats[a] - m.stats[b]; });
                var chosen = Math.random() < 0.6 ? stats[0] : stats[Math.floor(Math.random()*stats.length)];
                m.stats[chosen] += Math.floor(Math.random()*2) + 1;
                return chosen;
            },
            choices: [
                {
                    text: '让它继续思考',
                    effect: function(m, _, result) {
                        if (result) addBriefing('event', '✨ ' + m.name + ' 的【' + result + '】得到了提升！');
                    }
                },
                {
                    text: '拿零食打扰它',
                    cost: { food: 10 },
                    effect: function(m) {
                        AffinitySystem.changePlayerBond(m.id, 3, '喂食零食');
                        addBriefing('event', '💛 ' + m.name + ' 因为零食对你好感+3！');
                    }
                }
            ]
        },

        {
            id: 'solo_injury',
            type: 'disaster',
            typeLabel: '意外',
            weight: 5, chance: 0.02, cooldown: 900,
            title: '{m1} 受了轻伤',
            desc: '{m1} 在作业时不小心受了轻伤，正在舔舐伤口。',
            summary: '{m1} 受了轻伤，需要调养。',
            condition: function(m) { return m.status !== 'idle'; },
            silentEffect: function(m) {
                // 内部：降低当前任务效率（通过临时flag实现）
                m._injured = true;
                setTimeout(function(){ m._injured = false; }, 120000);
            },
            choices: [
                {
                    text: '给它治疗',
                    cost: { food: 20 },
                    effect: function(m) {
                        m._injured = false;
                        AffinitySystem.changePlayerBond(m.id, 5, '受伤时得到救治');
                        addBriefing('event', '💛 ' + m.name + ' 被你治好了，好感度+5！');
                    }
                },
                {
                    text: '让它自己恢复',
                    effect: function(m) {
                        AffinitySystem.changePlayerBond(m.id, -2, '受伤时被忽视');
                    }
                }
            ]
        },

        {
            id: 'solo_lazy_day',
            type: 'general',
            typeLabel: '日常',
            weight: 12, chance: 0.06, cooldown: 300,
            title: '{m1} 在偷懒',
            desc: '{m1} 趁你不注意在草地上打滚，完全沉浸在自己的世界里。',
            summary: '{m1} 偷懒休息了一会儿。',
            condition: function(m) { return m.status === 'idle'; },
            silentEffect: function(m) {
                // 偷懒会小幅回复"精力"（如果后续引入疲劳系统）
            },
            choices: []  // 静默，只记录履历和简报
        },

        {
            id: 'solo_nightmare',
            type: 'general',
            typeLabel: '梦魇',
            weight: 3, chance: 0.015, cooldown: 1200,
            title: '{m1} 做了噩梦',
            desc: '{m1} 在睡觉时发出奇怪的叫声，似乎梦见了什么可怕的事物。',
            summary: '{m1} 做了噩梦，情绪变得低落。',
            condition: function(m) { return m.status === 'idle'; },
            silentEffect: function(m) {
                // 内部：轻微降低接下来的工作效率
                m._mood_down = true;
                setTimeout(function(){ m._mood_down = false; }, 60000);
            },
            choices: [
                {
                    text: '轻轻安抚它',
                    effect: function(m) {
                        m._mood_down = false;
                        AffinitySystem.changePlayerBond(m.id, 4, '噩梦时被安慰');
                        addBriefing('event', '💛 你安慰了做噩梦的 ' + m.name + '，好感度+4');
                    }
                }
            ]
        },

        {
            id: 'solo_talent_bloom',
            type: 'growth',
            typeLabel: '天赋觉醒',
            weight: 2, chance: 0.008, cooldown: 3600,
            title: '{m1} 天赋觉醒！',
            desc: '一道光芒从 {m1} 身上迸发，它的眼中燃起了不可思议的光芒。',
            summary: '{m1} 天赋觉醒，获得了新特性。',
            condition: function(m) { return m.level >= 10 && m.traits.length < 3; },
            silentEffect: function(m) {
                // 新增一个随机特性
                var rare = ['green_thumb','berserker','sage','swift','titan_blood','void_touched'];
                var pool = (typeof allTraits !== 'undefined') ? allTraits.filter(function(t){
                    return !m.traits.find(function(x){return x.id===t.id;});
                }) : [];
                // 偏向稀有特性
                var candidates = pool.filter(function(t){ return rare.indexOf(t.id) !== -1; });
                var pick = candidates.length ? candidates[Math.floor(Math.random()*candidates.length)]
                                             : (pool.length ? pool[Math.floor(Math.random()*pool.length)] : null);
                if (pick) { m.traits.push(pick); return pick.name; }
                return null;
            },
            choices: [
                {
                    text: '见证它的觉醒！',
                    effect: function(m, _, result) {
                        AffinitySystem.changePlayerBond(m.id, 8, '见证天赋觉醒');
                        if (result) showNotification('✨ ' + m.name + ' 觉醒了特性【' + result + '】！', 'achievement');
                    }
                }
            ]
        },

        {
            id: 'solo_player_gift',
            type: 'player',
            typeLabel: '互动',
            weight: 6, chance: 0.03, cooldown: 400,
            title: '{m1} 向你讨要东西',
            desc: '{m1} 用期待的眼神看着你，在你的口袋边蹭来蹭去。',
            summary: '{m1} 向你讨要了礼物。',
            condition: function(m) { return AffinitySystem.getPlayerBond(m.id) >= 10; },
            silentEffect: null,
            choices: [
                {
                    text: '给它食物',
                    cost: { food: 15 },
                    effect: function(m) {
                        AffinitySystem.changePlayerBond(m.id, 6, '主动分享食物');
                        addBriefing('event', '💛 ' + m.name + ' 开心地接过了食物，好感+6！');
                    }
                },
                {
                    text: '给它金币玩（材料）',
                    cost: { materials: 8 },
                    effect: function(m) {
                        AffinitySystem.changePlayerBond(m.id, 4, '给材料玩耍');
                        m.stats.intelligence = (m.stats.intelligence || 0) + 1;
                        addBriefing('event', '✨ ' + m.name + ' 把材料当玩具研究了半天，智力+1！');
                    }
                },
                {
                    text: '假装没看见',
                    effect: function(m) {
                        AffinitySystem.changePlayerBond(m.id, -3, '讨要时被无视');
                    }
                }
            ]
        },

        {
            id: 'solo_midnight_guard',
            type: 'player',
            typeLabel: '羁绊',
            weight: 3, chance: 0.015, cooldown: 1800,
            title: '{m1} 半夜守护你',
            desc: '你发现 {m1} 整夜都守在农场入口，原来它一直在默默保护你的农场。',
            summary: '{m1} 整夜守护农场，表现出对你的深厚羁绊。',
            condition: function(m) {
                return AffinitySystem.getPlayerBond(m.id) >= 50 && m.status === 'idle';
            },
            silentEffect: function(m) {
                // 守夜效果：材料+研究点小幅奖励
                gameState.materials = (gameState.materials || 0) + 10;
                gameState.research  = (gameState.research  || 0) + 5;
                AffinitySystem.changePlayerBond(m.id, 5, '主动守护农场');
            },
            choices: [
                {
                    text: '感谢它的守护',
                    effect: function(m) {
                        AffinitySystem.changePlayerBond(m.id, 8, '感谢守护');
                        showNotification('💛 ' + m.name + ' 守护了你的农场，获得了材料×10和研究×5！', 'success');
                        updateResources();
                    }
                }
            ]
        }
    ],

    // ================================================================
    // PAIR：两怪兽互动事件
    // ================================================================
    pair: [

        // ── 社交 / 友情 ──
        {
            id: 'pair_first_meet',
            type: 'social',
            typeLabel: '初遇',
            weight: 10, chance: 0.08, cooldown: 99999,  // 每对只触发一次
            title: '{m1} 和 {m2} 初次相遇',
            desc: '{m1} 好奇地绕着 {m2} 转了一圈，{m2} 有些紧张地看着它。两只怪兽就此认识了。',
            summary: '{m1} 与 {m2} 第一次相遇。',
            condition: function(m1, m2) {
                return AffinitySystem.getPair(m1.id, m2.id) === 0;
            },
            silentEffect: function(m1, m2) {
                // 初始好感：同类型+10，高智力互相+5，低亲和类型-5
                var delta = 5;
                if (m1.type === m2.type) delta += 10;
                if ((m1.stats.intelligence || 0) > 6 && (m2.stats.intelligence || 0) > 6) delta += 5;
                // 力量悬殊时倾向于竞争
                var strDiff = Math.abs((m1.stats.strength||0) - (m2.stats.strength||0));
                if (strDiff > 4) delta -= 5;
                AffinitySystem.changePair(m1.id, m2.id, delta, '初次相遇');
            },
            choices: []
        },

        {
            id: 'pair_play_together',
            type: 'social',
            typeLabel: '玩耍',
            weight: 8, chance: 0.05, cooldown: 300,
            title: '{m1} 和 {m2} 玩到一起了',
            desc: '{m1} 和 {m2} 在农场里追逐嬉闹，玩得不亦乐乎。',
            summary: '{m1} 与 {m2} 一起玩耍，关系更近了。',
            condition: function(m1, m2) {
                return AffinitySystem.getPair(m1.id, m2.id) >= 0 &&
                       m1.status === 'idle' && m2.status === 'idle';
            },
            silentEffect: function(m1, m2) {
                AffinitySystem.changePair(m1.id, m2.id, Math.floor(Math.random()*5)+3, '一起玩耍');
                // 玩耍有几率双方各获少量经验
                if (typeof gainExp === 'function') {
                    gainExp(m1, 5);
                    gainExp(m2, 5);
                }
            },
            choices: []
        },

        {
            id: 'pair_quarrel',
            type: 'rival',
            typeLabel: '争吵',
            weight: 6, chance: 0.04, cooldown: 500,
            title: '{m1} 和 {m2} 吵架了',
            desc: '{m1} 和 {m2} 为了一个地盘大声争吵，互不相让。',
            summary: '{m1} 与 {m2} 发生了争吵。',
            condition: function(m1, m2) {
                return AffinitySystem.getPair(m1.id, m2.id) < 30;
            },
            silentEffect: function(m1, m2) {
                AffinitySystem.changePair(m1.id, m2.id, -(Math.floor(Math.random()*5)+3), '争吵');
            },
            choices: [
                {
                    text: '调解它们',
                    cost: { food: 10 },
                    effect: function(m1, m2) {
                        AffinitySystem.changePair(m1.id, m2.id, 8, '被玩家调解');
                        AffinitySystem.changePlayerBond(m1.id, 2, '调解后感谢');
                        AffinitySystem.changePlayerBond(m2.id, 2, '调解后感谢');
                        addBriefing('event', '💛 你成功调解了 ' + m1.name + ' 和 ' + m2.name + ' 的争吵！');
                    }
                },
                {
                    text: '让它们自己解决',
                    effect: function() {}  // 效果已在 silentEffect 中处理
                }
            ]
        },

        {
            id: 'pair_deep_bond',
            type: 'bond',
            typeLabel: '挚友',
            weight: 2, chance: 0.01, cooldown: 3600,
            title: '{m1} 与 {m2} 成为挚友',
            desc: '长时间相处后，{m1} 和 {m2} 建立了深厚的友谊。它们开始形影不离。',
            summary: '{m1} 与 {m2} 建立了挚友关系。',
            condition: function(m1, m2) {
                return AffinitySystem.getPair(m1.id, m2.id) >= 80;
            },
            silentEffect: function(m1, m2) {
                // 挚友效果：同工作时效率+20%（通过flag实现）
                m1._bestFriendId = m2.id;
                m2._bestFriendId = m1.id;
                AffinitySystem.changePair(m1.id, m2.id, 10, '深厚友谊');
            },
            choices: [
                {
                    text: '为它们的友情庆祝！',
                    cost: { food: 30 },
                    effect: function(m1, m2) {
                        AffinitySystem.changePlayerBond(m1.id, 5, '友情庆祝');
                        AffinitySystem.changePlayerBond(m2.id, 5, '友情庆祝');
                        showNotification('❤️ ' + m1.name + ' 和 ' + m2.name + ' 成为了一生的挚友！', 'achievement');
                    }
                }
            ]
        },

        {
            id: 'pair_rival_competition',
            type: 'rival',
            typeLabel: '竞争',
            weight: 5, chance: 0.03, cooldown: 600,
            title: '{m1} 和 {m2} 暗中较劲',
            desc: '{m1} 和 {m2} 都在努力工作，但彼此都在暗中比较，互不服气。',
            summary: '{m1} 与 {m2} 展开了竞争，双方都变得更努力。',
            condition: function(m1, m2) {
                var aff = AffinitySystem.getPair(m1.id, m2.id);
                return aff >= -30 && aff < 30 && m1.status !== 'idle' && m2.status !== 'idle';
            },
            silentEffect: function(m1, m2) {
                // 竞争让双方获得额外经验
                if (typeof gainExp === 'function') {
                    gainExp(m1, 15);
                    gainExp(m2, 15);
                }
                // 好感微降（竞争带来摩擦）
                AffinitySystem.changePair(m1.id, m2.id, -3, '竞争摩擦');
            },
            choices: []
        },

        // ── 恋爱/繁殖关联 ──
        {
            id: 'pair_mutual_crush',
            type: 'bond',
            typeLabel: '心动',
            weight: 3, chance: 0.015, cooldown: 1800,
            title: '{m1} 对 {m2} 心动了',
            desc: '{m1} 开始给 {m2} 带食物，总是找机会待在它身边，举止明显不同寻常。',
            summary: '{m1} 对 {m2} 产生了好感，关系发生了微妙变化。',
            condition: function(m1, m2) {
                return AffinitySystem.getPair(m1.id, m2.id) >= 60 &&
                       !m1._crushedOn;  // 防止同时心动多个
            },
            silentEffect: function(m1, m2) {
                m1._crushedOn = m2.id;
                AffinitySystem.changePair(m1.id, m2.id, 15, '产生好感');
            },
            choices: [
                {
                    text: '帮助它们创造相处机会',
                    cost: { food: 20 },
                    effect: function(m1, m2) {
                        AffinitySystem.changePair(m1.id, m2.id, 10, '玩家撮合');
                        AffinitySystem.changePlayerBond(m1.id, 3, '被撮合');
                        AffinitySystem.changePlayerBond(m2.id, 3, '被撮合');
                        addBriefing('event', '💕 你帮助 ' + m1.name + ' 和 ' + m2.name + ' 创造了相处机会，关系更近了！');
                    }
                },
                {
                    text: '不干涉，让感情自然发展',
                    effect: function() {}
                }
            ]
        },

        {
            id: 'pair_breed_readiness',
            type: 'bond',
            typeLabel: '情投意合',
            weight: 2, chance: 0.008, cooldown: 3600,
            title: '{m1} 和 {m2} 情投意合',
            desc: '{m1} 和 {m2} 整天形影不离，彼此之间有着无声的默契。繁殖时成功率将大幅提升！',
            summary: '{m1} 与 {m2} 情投意合，繁殖成功率提升。',
            condition: function(m1, m2) {
                return AffinitySystem.getPair(m1.id, m2.id) >= 85;
            },
            silentEffect: function(m1, m2) {
                // 标记繁殖加成（breeding.js 中读取此flag）
                m1._lovePartner = m2.id;
                m2._lovePartner = m1.id;
            },
            choices: [
                {
                    text: '为它们安排繁殖',
                    effect: function(m1, m2) {
                        addBriefing('event', '💕 ' + m1.name + ' 和 ' + m2.name + ' 情投意合，繁殖成功率×1.5！');
                        if (typeof switchTab === 'function') switchTab('breeding');
                    }
                },
                {
                    text: '先让它们继续幸福相处',
                    effect: function() {}
                }
            ]
        }
    ],

    // ================================================================
    // GLOBAL：全局农场事件
    // ================================================================
    global: [

        {
            id: 'global_bountiful_rain',
            type: 'fortune',
            typeLabel: '天降好雨',
            weight: 8, chance: 0.10,
            title: '丰收甘霖',
            desc: '夜间一场细雨滋润了大地，农场里的作物都精神抖擞。',
            summary: '一场及时雨让全场作物生长加速。',
            condition: function() {
                return gameState.plots && gameState.plots.some(function(p){ return p.crop; });
            },
            silentEffect: function() {
                // 全场作物生长加速30秒
                gameState.plots.forEach(function(p){ if (p.crop) p.growthBonus = (p.growthBonus||1) * 1.4; });
                setTimeout(function(){
                    gameState.plots.forEach(function(p){ p.growthBonus = 1; });
                }, 45000);
            },
            choices: [
                {
                    text: '顺势追加水肥（+材料消耗）',
                    cost: { materials: 20 },
                    effect: function() {
                        gameState.plots.forEach(function(p){ if (p.crop) p.growthBonus = (p.growthBonus||1) * 1.8; });
                        addBriefing('event', '🍀 施加了追肥，作物生长速度暴涨！');
                        updateResources();
                    }
                },
                {
                    text: '静待收获',
                    effect: function() {
                        addBriefing('event', '🍀 甘霖滋润农场，作物生长加速！');
                    }
                }
            ]
        },

        {
            id: 'global_pest_swarm',
            type: 'disaster',
            typeLabel: '虫害',
            weight: 5, chance: 0.06,
            title: '虫害来袭！',
            desc: '一群饥饿的害虫入侵了农场，正在蚕食作物！',
            summary: '农场遭遇了虫害，部分作物受损。',
            condition: function() {
                return gameState.plots && gameState.plots.some(function(p){ return p.crop && !p.locked; });
            },
            silentEffect: function() {
                // 随机使1-2块地块进度-20
                var activePlots = gameState.plots.filter(function(p){ return p.crop && p.progress < 100; });
                var count = Math.min(Math.floor(Math.random()*2)+1, activePlots.length);
                for (var i = 0; i < count; i++) {
                    activePlots[i].progress = Math.max(0, activePlots[i].progress - 20);
                }
                return count;
            },
            choices: [
                {
                    text: '紧急喷药（消耗材料）',
                    cost: { materials: 30 },
                    effect: function() {
                        // 恢复受损作物进度
                        gameState.plots.forEach(function(p){ if (p.crop) p.progress = Math.min(100, p.progress + 15); });
                        addBriefing('event', '💥 使用农药击退了虫害，作物得到了部分恢复！');
                        if (typeof renderFarm === 'function') renderFarm();
                    }
                },
                {
                    text: '派怪兽驱赶',
                    effect: function() {
                        var idleM = gameState.monsters.find(function(m){ return m.status==='idle'; });
                        if (idleM) {
                            addBriefing('event', '⚔️ ' + idleM.name + ' 勇敢地驱赶了害虫！虫害已解除。');
                            AffinitySystem.changePlayerBond(idleM.id, 4, '主动驱虫立功');
                        } else {
                            addBriefing('event', '💥 没有空闲怪兽，虫害继续扩散…');
                        }
                    }
                },
                {
                    text: '放任不管',
                    effect: function(_, __, count) {
                        addBriefing('event', '💥 ' + (count||1) + ' 块地作物被虫害侵蚀，进度大幅下滑！');
                    }
                }
            ]
        },

        {
            id: 'global_wandering_merchant',
            type: 'fortune',
            typeLabel: '商人路过',
            weight: 6, chance: 0.07,
            title: '神秘商人经过',
            desc: '一位背着大包的神秘商人路过你的农场，他手里有一些稀奇的货物。',
            summary: '神秘商人路过，进行了交易。',
            condition: function() { return gameState.coins >= 50; },
            silentEffect: null,
            choices: [
                {
                    text: '购买神秘材料包',
                    cost: { coins: 100 },
                    effect: function() {
                        var gain = Math.floor(Math.random()*80) + 40;
                        gameState.materials = (gameState.materials||0) + gain;
                        addBriefing('event', '🍀 神秘材料包开出了 ' + gain + ' 材料！');
                        updateResources();
                    }
                },
                {
                    text: '购买神秘食物包',
                    cost: { coins: 80 },
                    effect: function() {
                        var gain = Math.floor(Math.random()*100) + 50;
                        gameState.food = (gameState.food||0) + gain;
                        addBriefing('event', '🍀 神秘食物包开出了 ' + gain + ' 食物！');
                        updateResources();
                    }
                },
                {
                    text: '礼貌谢绝',
                    effect: function() {}
                }
            ]
        },

        {
            id: 'global_lucky_day',
            type: 'fortune',
            typeLabel: '幸运日',
            weight: 4, chance: 0.04,
            title: '今天是幸运日！',
            desc: '空气中弥漫着一种神奇的气息，农场里的一切都显得特别顺利。',
            summary: '幸运日：全场怪兽经验获取翻倍（持续60秒）。',
            condition: null,
            silentEffect: function() {
                gameState._luckyDay = true;
                setTimeout(function(){ gameState._luckyDay = false; }, 60000);
            },
            choices: [
                {
                    text: '借此机会加倍努力！',
                    effect: function() {
                        addBriefing('event', '🍀 幸运日！所有怪兽经验获取翻倍，持续60秒！');
                    }
                }
            ]
        },

        {
            id: 'global_festival',
            type: 'social',
            typeLabel: '节日',
            weight: 2, chance: 0.02,
            title: '农场节日🎉',
            desc: '今天是农场的特别节日！所有怪兽都聚集在一起庆祝，气氛热闹非凡。',
            summary: '举办了农场节日，所有怪兽好感度小幅提升。',
            condition: function() { return gameState.monsters && gameState.monsters.length >= 3; },
            silentEffect: function() {
                // 全体怪兽与玩家好感度+5，怪兽间互相+3
                var monsters = gameState.monsters || [];
                monsters.forEach(function(m){ AffinitySystem.changePlayerBond(m.id, 5, '节日庆祝'); });
                for (var i = 0; i < monsters.length; i++)
                    for (var j = i+1; j < monsters.length; j++)
                        AffinitySystem.changePair(monsters[i].id, monsters[j].id, 3, '节日同乐');
            },
            choices: [
                {
                    text: '热情参与，大摆宴席！',
                    cost: { food: 50 },
                    effect: function() {
                        var monsters = gameState.monsters || [];
                        monsters.forEach(function(m){ AffinitySystem.changePlayerBond(m.id, 8, '节日大宴'); });
                        showNotification('🎉 农场节日！所有怪兽欢天喜地，好感大幅提升！', 'achievement');
                    }
                },
                {
                    text: '随便庆祝一下',
                    effect: function() {
                        addBriefing('event', '🎉 农场节日，怪兽们互相交流，关系更近了！');
                    }
                }
            ]
        }
    ]
};
