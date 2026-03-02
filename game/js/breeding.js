// ==================== 繁殖模块 ====================

window.renderBreeding = function() {
    var breedingContainer = document.getElementById('breedingContainer');
    if (!breedingContainer) return;

    if (!gameState.technologies.breeding) {
        breedingContainer.innerHTML =
            '<div style="text-align:center;padding:60px 20px;color:#8b949e;">' +
            '<div style="font-size:48px;margin-bottom:20px;">' + createSVG('locked_tech', 48) + '</div>' +
            '<div style="font-size:16px;font-weight:600;color:#e6edf3;margin-bottom:8px;">繁殖中心</div>' +
            '<div>需要解锁「繁殖技术」才能使用</div>' +
            '<button class="btn btn-primary" style="margin-top:20px;" onclick="switchTab(\'tech\')">前往科技树</button>' +
            '</div>';
        return;
    }
    
    var slot1 = gameState.breedingSlot1;
    var slot2 = gameState.breedingSlot2;
    var canBreed = !!slot1 && !!slot2;

    function slotCard(slot, idx) {
        if (slot) {
            var ts = Object.values(slot.stats).reduce(function(a,b){return a+b;},0);
            return '<div style="background:#161b22;border:2px solid #e91e63;border-radius:12px;padding:14px;text-align:center;cursor:pointer;position:relative;" onclick="selectBreedingMonster(' + idx + ')">' +
                '<div style="position:absolute;top:6px;right:8px;font-size:11px;color:#8b949e;" title="更换">✎ 换</div>' +
                createSVG(slot.type, 44) +
                '<div style="font-weight:700;color:#e6edf3;margin-top:6px;font-size:0.9286rem;">' + slot.name + '</div>' +
                '<div style="font-size:11px;color:#8b949e;margin-top:2px;">Lv.' + slot.level + ' G' + slot.generation + ' · 综合 ' + ts + '</div>' +
                '<div style="font-size:11px;color:#8b949e;margin-top:3px;">力' + slot.stats.strength + ' 敏' + slot.stats.agility + ' 智' + slot.stats.intelligence + ' 耕' + slot.stats.farming + '</div>' +
                '<button onclick="event.stopPropagation();clearBreedingSlot(' + idx + ')" style="margin-top:8px;font-size:11px;padding:3px 10px;background:none;border:1px solid #f85149;border-radius:5px;color:#f85149;cursor:pointer;">移出</button>' +
                '</div>';
        }
        return '<div style="background:#161b22;border:2px dashed #30363d;border-radius:12px;padding:28px 14px;text-align:center;cursor:pointer;transition:border-color 0.15s;" onclick="selectBreedingMonster(' + idx + ')" onmouseover="this.style.borderColor=\'#e91e63\'" onmouseout="this.style.borderColor=\'#30363d\'">' +
            '<div style="font-size:32px;margin-bottom:8px;">+</div>' +
            '<div style="color:#8b949e;font-size:13px;">点击选择怪兽</div>' +
            '</div>';
    }

    var offspringPreview = '';
    if (canBreed) {
        var avgStr  = Math.round((slot1.stats.strength     + slot2.stats.strength)     / 2);
        var avgAgi  = Math.round((slot1.stats.agility      + slot2.stats.agility)      / 2);
        var avgInt  = Math.round((slot1.stats.intelligence + slot2.stats.intelligence) / 2);
        var avgFrm  = Math.round((slot1.stats.farming      + slot2.stats.farming)      / 2);
        var nextGen = Math.max(slot1.generation, slot2.generation) + 1;
        offspringPreview =
            '<div style="background:#161b22;border:2px solid #21262d;border-radius:12px;padding:14px;text-align:center;">' +
            createSVG('breeding', 44) +
            '<div style="color:#e91e63;font-weight:700;margin:6px 0 4px;font-size:0.9286rem;">预期后代</div>' +
            '<div style="font-size:11px;color:#8b949e;">第 ' + nextGen + ' 代</div>' +
            '<div style="font-size:11px;color:#8b949e;margin-top:4px;">~力' + avgStr + ' ~敏' + avgAgi + ' ~智' + avgInt + ' ~耕' + avgFrm + '</div>' +
            '<div style="font-size:10px;color:#8b949e;margin-top:4px;opacity:0.7;">20% 变异概率</div>' +
            '</div>';
    } else {
        offspringPreview =
            '<div style="background:#161b22;border:2px dashed #21262d;border-radius:12px;padding:28px 14px;text-align:center;">' +
            createSVG('breeding', 40) +
            '<div style="color:#8b949e;font-size:13px;margin-top:8px;">后代</div>' +
            '</div>';
    }

    var toolbarHtml = renderLayoutToolbar('breeding', '繁殖中心', [], 'renderBreeding');

    breedingContainer.innerHTML =
        '<div style="padding:0 20px 20px;">' +
        toolbarHtml +
        '<div style="display:grid;grid-template-columns:1fr auto 1fr auto 1fr;align-items:center;gap:8px;margin-bottom:16px;">' +
            slotCard(slot1, 1) +
            '<div style="font-size:22px;color:#e91e63;text-align:center;font-weight:700;">+</div>' +
            slotCard(slot2, 2) +
            '<div style="font-size:22px;color:#e91e63;text-align:center;font-weight:700;">=</div>' +
            offspringPreview +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:center;margin-bottom:16px;">' +
            '<button class="btn btn-success" onclick="startBreeding()" ' + (!canBreed ? 'disabled' : '') + ' style="font-weight:700;">' +
                '💕 开始繁殖 (消耗 🍎100 ⚡30)' +
            '</button>' +
            '<button class="btn" onclick="clearBreedingSlots()" style="font-size:13px;">清空</button>' +
        '</div>' +
        '<div style="background:#161b22;border:1px solid #30363d;border-radius:10px;padding:14px;font-size:12px;color:#8b949e;line-height:1.9;">' +
            '<div style="font-weight:700;color:#e6edf3;margin-bottom:6px;">📖 繁殖规则</div>' +
            '• 后代继承父母平均属性 &nbsp;• 20% 概率发生属性突变<br>' +
            '• 类型随机继承父母之一 &nbsp;• 特性会随机遗传<br>' +
            '• 代数 = max(父代, 母代) + 1 &nbsp;• 繁殖耗时 45 秒' +
        '</div>' +
        '</div>';
};

window.clearBreedingSlot = function(slotNumber) {
    if (slotNumber === 1 && gameState.breedingSlot1) {
        gameState.breedingSlot1.status = 'idle';
        gameState.breedingSlot1 = null;
    } else if (slotNumber === 2 && gameState.breedingSlot2) {
        gameState.breedingSlot2.status = 'idle';
        gameState.breedingSlot2 = null;
    }
    renderBreeding();
    renderMonsterSidebar();
};

window.selectBreedingMonster = function(slotNumber) {
    var currentSlotId1 = gameState.breedingSlot1 ? gameState.breedingSlot1.id : null;
    var currentSlotId2 = gameState.breedingSlot2 ? gameState.breedingSlot2.id : null;
    var excludeIds = [currentSlotId1, currentSlotId2].filter(function(x){ return x != null; });

    showMonsterPickModal({
        ctx:         'breeding_' + slotNumber,
        title:       '💕 繁殖选怪（槽位 ' + slotNumber + '）',
        excludeIds:  excludeIds,
        showLineage: true,
        extraInfo: function(m) {
            // 在繁殖场景下额外显示血统简介
            return '<div style="font-size:11px;color:#8b949e;margin-top:2px;">' +
                getMonsterLineage(m) + '</div>';
        },
        onSelect: function(monsterId) {
            assignBreedingMonster(slotNumber, monsterId);
        }
    });
};

window.assignBreedingMonster = function(slotNumber, monsterId) {
    var monster = gameState.monsters.find(function(m) { return m.id === monsterId; });
    
    if (slotNumber === 1) {
        gameState.breedingSlot1 = monster;
    } else {
        gameState.breedingSlot2 = monster;
    }
    
    monster.status = 'preparing';
    
    closeModal();
    renderBreeding();
    // 槽位操作静默，由 UI 渲染直接体现
};

window.clearBreedingSlots = function() {
    if (gameState.breedingSlot1) {
        gameState.breedingSlot1.status = 'idle';
        gameState.breedingSlot1 = null;
    }
    if (gameState.breedingSlot2) {
        gameState.breedingSlot2.status = 'idle';
        gameState.breedingSlot2 = null;
    }
    renderBreeding();
};

window.startBreeding = function() {
    if (!gameState.breedingSlot1 || !gameState.breedingSlot2) {
        showNotification('请选择两只怪兽！', 'warning');
        return;
    }
    
    if (gameState.food < 100) {
        showNotification('食物不足！需要100食物', 'error');
        return;
    }
    
    if (gameState.energy < 30) {
        showNotification('能量不足！需要30点能量', 'error');
        return;
    }
    
    gameState.food -= 100;
    gameState.energy -= 30;
    
    var parent1 = gameState.breedingSlot1;
    var parent2 = gameState.breedingSlot2;
    
    parent1.status = 'breeding';
    parent2.status = 'breeding';
    
    // 繁殖开始静默（简报将在完成时记录）
    updateResources();
    renderBreeding();
    renderMonsterSidebar();
    
    setTimeout(function() {
        var childType = Math.random() < 0.5 ? parent1.type : parent2.type;
        
        var child = createMonster(childType, parent1, parent2);
        
        parent1.status = 'idle';
        parent2.status = 'idle';
        
        gameState.breedingSlot1 = null;
        gameState.breedingSlot2 = null;
        gameState.monstersBreed++;
        
        showNotification('繁殖成功！获得新怪兽：' + child.name, 'success');
        if (typeof briefBreed === 'function') briefBreed(child.name, parent1.name + ' × ' + parent2.name);
        renderBreeding();
        renderMonsters();
    }, 45000);
};