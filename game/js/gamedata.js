// ==================== 游戏数据扩充模块 ====================
// 本文件替换/扩充 main.js 中的 cropTypes、monsterTypes、technologies、explorationZones
// 在 index.html 中于 main.js 之前引入

// ========== 作物数据（25种，按阶段解锁）==========
// tier: 1=初始, 2=早期, 3=中期, 4=中后期, 5=后期, 6=顶级
var cropTypes = [
    // ── Tier 1：初始可用（无需科技）──
    { id:'wheat',    name:'小麦',    tier:1, growTime:15000,  yield:5,  value:8,   foodVal:5,  requiredTech:null,
      preferredMonster:'goblin', desc:'基础粮食，生长最快', icon:'plant', materialYield:0 },
    { id:'potato',   name:'土豆',    tier:1, growTime:20000,  yield:10, value:10,  foodVal:8,  requiredTech:null,
      preferredMonster:'slime',  desc:'扁豆高产，产量稳定', icon:'plant', materialYield:0 },
    { id:'corn',     name:'玉米',    tier:1, growTime:25000,  yield:8,  value:15,  foodVal:6,  requiredTech:null,
      preferredMonster:'golem',  desc:'高产作物，需较长时间', icon:'plant', materialYield:0 },

    // ── Tier 2：早期（advancedFarming）──
    { id:'berry',    name:'浆果',    tier:2, growTime:30000,  yield:12, value:25,  foodVal:10, requiredTech:'advancedFarming',
      preferredMonster:'sprite', desc:'甜美浆果，售价较高', icon:'plant', materialYield:0 },
    { id:'mushroom', name:'蘑菇',    tier:2, growTime:40000,  yield:6,  value:35,  foodVal:4,  requiredTech:'advancedFarming',
      preferredMonster:'wisp',   desc:'魔法蘑菇，单价极高', icon:'plant', materialYield:0 },
    { id:'carrot',   name:'胡萝卜',  tier:2, growTime:18000,  yield:9,  value:12,  foodVal:9,  requiredTech:'advancedFarming',
      preferredMonster:'goblin', desc:'香甜爽脆，怪兽最爱', icon:'plant', materialYield:0 },
    { id:'pumpkin',  name:'南瓜',    tier:2, growTime:35000,  yield:14, value:20,  foodVal:12, requiredTech:'advancedFarming',
      preferredMonster:'golem',  desc:'圆润饱满，产量可观', icon:'plant', materialYield:0 },

    // ── Tier 3：中期（cropT3 科技）──
    { id:'sunflower',name:'向日葵',  tier:3, growTime:45000,  yield:8,  value:50,  foodVal:5,  requiredTech:'cropT3',
      preferredMonster:'sprite', desc:'追光而生，额外产出研究点', icon:'plant', materialYield:0, researchYield:5 },
    { id:'herb',     name:'草药',    tier:3, growTime:50000,  yield:10, value:45,  foodVal:8,  requiredTech:'cropT3',
      preferredMonster:'wisp',   desc:'珍贵草药，可提炼材料', icon:'plant', materialYield:3 },
    { id:'cotton',   name:'棉花',    tier:3, growTime:40000,  yield:12, value:30,  foodVal:3,  requiredTech:'cropT3',
      preferredMonster:'slime',  desc:'柔软棉花，用于制作材料', icon:'plant', materialYield:5 },
    { id:'sugarcane',name:'甘蔗',    tier:3, growTime:55000,  yield:20, value:22,  foodVal:15, requiredTech:'cropT3',
      preferredMonster:'goblin', desc:'高糖分作物，食物产量惊人', icon:'plant', materialYield:0 },

    // ── Tier 4：中后期（cropT4 科技）──
    { id:'dragonfruit',name:'火龙果', tier:4, growTime:80000,  yield:15, value:80,  foodVal:12, requiredTech:'cropT4',
      preferredMonster:'ifrit',  desc:'火热艳丽，产自火山脚下', icon:'plant', materialYield:0 },
    { id:'icefern',  name:'冰蕨',    tier:4, growTime:90000,  yield:8,  value:100, foodVal:6,  requiredTech:'cropT4',
      preferredMonster:'crystal',desc:'深寒之地的奇草，研究价值极高', icon:'plant', materialYield:0, researchYield:15 },
    { id:'voidshroom',name:'虚空菇', tier:4, growTime:100000, yield:6,  value:120, foodVal:4,  requiredTech:'cropT4',
      preferredMonster:'shadow', desc:'神秘异空间蘑菇，材料产量惊人', icon:'plant', materialYield:10 },
    { id:'goldwheat',name:'黄金小麦', tier:4, growTime:60000,  yield:18, value:65,  foodVal:14, requiredTech:'cropT4',
      preferredMonster:'ancient',desc:'金色麦穗，高产高值', icon:'plant', materialYield:0 },

    // ── Tier 5：后期（cropT5 科技）──
    { id:'starfruit', name:'星辰果',  tier:5, growTime:150000, yield:20, value:200, foodVal:15, requiredTech:'cropT5',
      preferredMonster:'crystal',desc:'凝聚星光的果实，价值与研究点产出俱佳', icon:'plant', materialYield:5, researchYield:20 },
    { id:'moonleaf',  name:'月光叶',  tier:5, growTime:180000, yield:12, value:250, foodVal:10, requiredTech:'cropT5',
      preferredMonster:'wisp',   desc:'月夜绽放，研究点产出极为丰厚', icon:'plant', materialYield:8, researchYield:30 },
    { id:'bloodrose',  name:'血玫瑰',  tier:5, growTime:120000, yield:16, value:180, foodVal:8,  requiredTech:'cropT5',
      preferredMonster:'shadow', desc:'吸收能量而开，稀有而危险', icon:'plant', materialYield:0 },

    // ── Tier 6：顶级（cropT6 科技，需完成所有科技）──
    { id:'etherbloom', name:'以太之花', tier:6, growTime:300000, yield:25, value:500, foodVal:20, requiredTech:'cropT6',
      preferredMonster:'ancient', desc:'蕴含以太之力的神花，全资源产出皆佳', icon:'plant', materialYield:20, researchYield:50 },
    { id:'soulgrain',  name:'灵魂谷',  tier:6, growTime:240000, yield:30, value:400, foodVal:25, requiredTech:'cropT6',
      preferredMonster:'ancient', desc:'凝聚灵气的谷物，产量惊人', icon:'plant', materialYield:10, researchYield:30 },
    { id:'chaosherb',  name:'混沌草',  tier:6, growTime:360000, yield:20, value:600, foodVal:18, requiredTech:'cropT6',
      preferredMonster:'shadow',  desc:'混沌之力结晶而成，售价冠绝所有作物', icon:'plant', materialYield:30, researchYield:60 }
];

// ========== 怪兽类型（30种，按稀有度分层）==========
var monsterTypes = {
    // ── Common（普通）──
    slime:    { name:'史莱姆',   color:'#4caf50', rarity:'common',    baseStats:{ strength:3, agility:2, intelligence:1, farming:4 }, catchZone:'farm_edge',    desc:'友善的农场助手，擅长照料土豆' },
    goblin:   { name:'哥布林',   color:'#ff9800', rarity:'common',    baseStats:{ strength:4, agility:3, intelligence:2, farming:2 }, catchZone:'shallow_forest',desc:'勤劳的小工，小麦专家' },
    sprout:   { name:'嫩芽精',   color:'#8bc34a', rarity:'common',    baseStats:{ strength:1, agility:2, intelligence:3, farming:5 }, catchZone:'farm_edge',    desc:'天生农夫，所有作物均有加成' },
    mudcrab:  { name:'泥蟹',     color:'#795548', rarity:'common',    baseStats:{ strength:5, agility:1, intelligence:1, farming:3 }, catchZone:'swamp',        desc:'强壮蟹将，擅长重体力劳动' },
    firefly:  { name:'萤火虫',   color:'#ffeb3b', rarity:'common',    baseStats:{ strength:1, agility:5, intelligence:2, farming:2 }, catchZone:'mist_forest',  desc:'速度极快，探索效率高' },
    pebble:   { name:'石子精',   color:'#9e9e9e', rarity:'common',    baseStats:{ strength:3, agility:2, intelligence:2, farming:3 }, catchZone:'rocky_hills',  desc:'普通的矿石精灵，材料产出高' },

    // ── Uncommon（稀有）──
    sprite:   { name:'精灵',     color:'#2196f3', rarity:'uncommon',  baseStats:{ strength:1, agility:4, intelligence:5, farming:3 }, catchZone:'wild_plain',   desc:'智慧精灵，研究加成优秀' },
    golem:    { name:'石像鬼',   color:'#607d8b', rarity:'uncommon',  baseStats:{ strength:5, agility:1, intelligence:1, farming:3 }, catchZone:'rocky_hills',  desc:'坚如磐石，耐久力强' },
    wisp:     { name:'幽灵',     color:'#9c27b0', rarity:'uncommon',  baseStats:{ strength:2, agility:5, intelligence:4, farming:1 }, catchZone:'mist_forest',  desc:'神秘幽灵，夜间探索效率翻倍' },
    leafkin:  { name:'叶人',     color:'#33691e', rarity:'uncommon',  baseStats:{ strength:2, agility:3, intelligence:4, farming:5 }, catchZone:'wild_plain',   desc:'与植物共鸣，农场效率+20%' },
    stoneback:{ name:'岩背龟',   color:'#8d6e63', rarity:'uncommon',  baseStats:{ strength:6, agility:1, intelligence:2, farming:3 }, catchZone:'rocky_hills',  desc:'防御大师，金币维护费减半' },
    windsprite:{ name:'风精灵',  color:'#b3e5fc', rarity:'uncommon',  baseStats:{ strength:1, agility:7, intelligence:3, farming:2 }, catchZone:'wild_plain',   desc:'速度冠军，探索速度+40%' },

    // ── Rare（珍贵）──
    ifrit:    { name:'炎魔',     color:'#ff5722', rarity:'rare',      baseStats:{ strength:7, agility:4, intelligence:3, farming:1 }, catchZone:'volcano_foot', desc:'火焰守护者，火龙果专家' },
    toxfrog:  { name:'毒液蛙',   color:'#8bc34a', rarity:'rare',      baseStats:{ strength:3, agility:6, intelligence:4, farming:2 }, catchZone:'swamp',        desc:'毒液萃取大师，草药产量+50%' },
    crystal:  { name:'冰晶',     color:'#80deea', rarity:'rare',      baseStats:{ strength:4, agility:3, intelligence:8, farming:1 }, catchZone:'snow_plateau', desc:'智力巨人，冰蕨/星辰果专家' },
    thunderbird:{ name:'雷鸟',   color:'#ffd600', rarity:'rare',      baseStats:{ strength:5, agility:8, intelligence:4, farming:1 }, catchZone:'snow_plateau', desc:'雷霆化身，能量恢复+30%' },
    deepmoss: { name:'深苔精',   color:'#1b5e20', rarity:'rare',      baseStats:{ strength:3, agility:3, intelligence:6, farming:6 }, catchZone:'mist_forest',  desc:'深林守护者，全作物产量+15%' },
    ashgolem: { name:'灰烬魔偶', color:'#546e7a', rarity:'rare',      baseStats:{ strength:8, agility:2, intelligence:3, farming:2 }, catchZone:'volcano_foot', desc:'火焰熔炼，材料产出翻倍' },

    // ── Epic（史诗）──
    shadow:   { name:'暗影',     color:'#37474f', rarity:'epic',      baseStats:{ strength:6, agility:7, intelligence:5, farming:0 }, catchZone:'dark_cave',    desc:'黑暗猎手，稀有资源+100%' },
    phoenix:  { name:'凤凰',     color:'#ff6d00', rarity:'epic',      baseStats:{ strength:6, agility:9, intelligence:7, farming:2 }, catchZone:'volcano_foot', desc:'不死鸟，死亡重生，永不消耗' },
    deepkraken:{ name:'深渊克拉肯', color:'#1a237e', rarity:'epic',   baseStats:{ strength:9, agility:5, intelligence:6, farming:1 }, catchZone:'dark_cave',    desc:'深海巨兽，探索奖励+80%' },
    voidwalker:{ name:'虚空行者', color:'#4a148c', rarity:'epic',     baseStats:{ strength:5, agility:8, intelligence:9, farming:3 }, catchZone:'dark_cave',    desc:'研究点收获翻倍' },
    ironwarden:{ name:'钢铁守卫', color:'#455a64', rarity:'epic',     baseStats:{ strength:10,agility:3, intelligence:4, farming:4 }, catchZone:'ancient_ruins',desc:'材料产出+100%，耕作力极强' },

    // ── Legendary（传说）──
    ancient:  { name:'古龙',     color:'#ffd700', rarity:'legendary', baseStats:{ strength:10,agility:8, intelligence:10,farming:5 }, catchZone:'ancient_ruins',desc:'传说级存在，全属性顶尖' },
    celestial:{ name:'天界使者', color:'#e1f5fe', rarity:'legendary', baseStats:{ strength:8, agility:10,intelligence:12,farming:4 }, catchZone:'ancient_ruins',desc:'来自天界，研究产出+200%' },
    titan:    { name:'泰坦巨人', color:'#bf360c', rarity:'legendary', baseStats:{ strength:15,agility:5, intelligence:6, farming:6 }, catchZone:'ancient_ruins',desc:'力量之神，金币产出+200%' },
    spiritking:{ name:'灵魂之王', color:'#6a1b9a', rarity:'legendary',baseStats:{ strength:8, agility:8, intelligence:10,farming:8 }, catchZone:'void_realm',   desc:'万灵之主，所有产出+50%' },
    worldtree: { name:'世界树精', color:'#2e7d32', rarity:'legendary',baseStats:{ strength:6, agility:6, intelligence:10,farming:12}, catchZone:'void_realm',   desc:'农业之神，耕作力无上限' },
    timeghost: { name:'时间幽灵', color:'#cfd8dc', rarity:'legendary',baseStats:{ strength:5, agility:12,intelligence:10,farming:5 }, catchZone:'void_realm',   desc:'时间掌控者，所有计时器-50%' }
};

// ========== 探索区域（20个，分阶段解锁）==========
var explorationZones = [
    // ══════════════════════════════════════════════
    // 阶段1：新手区域 ── 无门槛 / 极低门槛
    // ══════════════════════════════════════════════
    { id:'farm_edge',      name:'农场边缘',   icon:'🌿', tier:1,
      desc:'农场周围的草地，安全且容易探索。',
      unlockCondition:null,
      energyCostManual:5, progressPerClick:[12,20],
      monsters:['slime','sprout'], catchChance:0.25,
      rewards:{ coins:[15,40], food:[10,25], materials:[0,5], research:[0,2] } },

    { id:'shallow_forest', name:'浅林',       icon:'🌲', tier:1,
      desc:'农场附近的小树林，散布着零散资源。',
      unlockCondition:{ type:'coins', value:500, label:'拥有金币 ≥ 500' },
      energyCostManual:5, progressPerClick:[10,18],
      monsters:['goblin'], catchChance:0.22,
      rewards:{ coins:[30,70], food:[5,15], materials:[10,25], research:[0,5] } },

    // ══════════════════════════════════════════════
    // 阶段2：早期区域 ── 探索次数 / 资源积累
    // ══════════════════════════════════════════════
    { id:'wild_plain',     name:'野外草原',   icon:'🏞', tier:2,
      desc:'一望无际的草原，偶尔有精灵出没。',
      unlockCondition:{ type:'totalExplorations', value:8, label:'完成探索 ≥ 8 次' },
      energyCostManual:8, progressPerClick:[8,16],
      monsters:['sprite','slime','firefly'], catchChance:0.20,
      rewards:{ coins:[20,60], food:[15,30], materials:[5,15], research:[8,20] } },

    { id:'rocky_hills',    name:'碎石丘陵',   icon:'🪨', tier:2,
      desc:'坚硬的岩石地带，石像鬼在此栖息。',
      unlockCondition:{ type:'compound', conditions:[
        { type:'materials', value:300 }, { type:'totalExplorations', value:12 }
      ], label:'材料 ≥ 300 且完成探索 ≥ 12 次' },
      energyCostManual:8, progressPerClick:[8,15],
      monsters:['golem','goblin','pebble','stoneback'], catchChance:0.18,
      rewards:{ coins:[40,90], food:[0,10], materials:[30,60], research:[5,15] } },

    { id:'mist_forest',    name:'迷雾森林',   icon:'🌫', tier:2,
      desc:'笼罩在神秘迷雾中的古老森林，幽灵在此游荡。',
      unlockCondition:{ type:'compound', conditions:[
        { type:'monsterCount', value:4 }, { type:'totalExplorations', value:18 }
      ], label:'拥有怪兽 ≥ 4 只 且完成探索 ≥ 18 次' },
      energyCostManual:10, progressPerClick:[7,14],
      monsters:['wisp','sprite','deepmoss','firefly'], catchChance:0.16,
      rewards:{ coins:[30,80], food:[0,20], materials:[10,30], research:[20,45] } },

    // ══════════════════════════════════════════════
    // 阶段3：中期区域 ── 复合条件，需要科技加持
    // ══════════════════════════════════════════════
    { id:'crystal_cave',   name:'水晶洞穴',   icon:'💎', tier:3,
      desc:'闪烁水晶的神秘洞穴，蕴含丰富矿产。',
      unlockCondition:{ type:'compound', conditions:[
        { type:'totalExplorations', value:25 }, { type:'materials', value:800 }
      ], label:'完成探索 ≥ 25 次 且材料 ≥ 800' },
      energyCostManual:10, progressPerClick:[6,13],
      monsters:['crystal','pebble','stoneback'], catchChance:0.15,
      rewards:{ coins:[60,120], food:[0,10], materials:[50,100], research:[15,40] } },

    { id:'volcano_foot',   name:'火山麓',     icon:'🌋', tier:3,
      desc:'炽热的火山脚下，危险但充满财富。',
      unlockCondition:{ type:'compound', conditions:[
        { type:'tech', value:'exploration' }, { type:'totalExplorations', value:30 },
        { type:'coins', value:3000 }
      ], label:'解锁探索科技 且 探索≥30次 且 金币≥3000' },
      energyCostManual:12, progressPerClick:[6,13],
      monsters:['ifrit','golem','ashgolem','phoenix'], catchChance:0.14,
      rewards:{ coins:[80,180], food:[0,5], materials:[20,50], research:[10,25] } },

    { id:'swamp',          name:'沼泽地带',   icon:'🌊', tier:3,
      desc:'泥泞危险的沼泽，毒液蛙在此繁衍。',
      unlockCondition:{ type:'compound', conditions:[
        { type:'totalExplorations', value:40 }, { type:'monsterCount', value:6 }
      ], label:'完成探索 ≥ 40 次 且怪兽 ≥ 6 只' },
      energyCostManual:12, progressPerClick:[6,12],
      monsters:['toxfrog','wisp','mudcrab'], catchChance:0.13,
      rewards:{ coins:[50,120], food:[5,20], materials:[40,80], research:[15,35] } },

    { id:'haunted_marsh',  name:'鬼沼',       icon:'💀', tier:3,
      desc:'古老的死亡沼泽，传说有史诗级怪兽出没。',
      unlockCondition:{ type:'compound', conditions:[
        { type:'totalExplorations', value:55 }, { type:'monsterCount', value:8 },
        { type:'research', value:500 }
      ], label:'探索≥55次 且怪兽≥8只 且研究点≥500' },
      energyCostManual:14, progressPerClick:[5,11],
      monsters:['wisp','shadow','deepkraken'], catchChance:0.12,
      rewards:{ coins:[80,160], food:[0,15], materials:[30,70], research:[30,60] } },

    // ══════════════════════════════════════════════
    // 阶段4：中后期区域 ── 高资源门槛 + 科技双重要求
    // ══════════════════════════════════════════════
    { id:'snow_plateau',   name:'雪域高原',   icon:'❄️', tier:4,
      desc:'白雪皑皑的高原，冰晶在极寒中修炼。',
      unlockCondition:{ type:'compound', conditions:[
        { type:'monsterCount', value:10 }, { type:'coins', value:8000 },
        { type:'totalExplorations', value:70 }
      ], label:'怪兽≥10只 且 金币≥8000 且 探索≥70次' },
      energyCostManual:15, progressPerClick:[5,11],
      monsters:['crystal','sprite','thunderbird','windsprite'], catchChance:0.11,
      rewards:{ coins:[60,140], food:[0,10], materials:[20,60], research:[40,80] } },

    { id:'thunder_peak',   name:'雷霆山巅',   icon:'⚡', tier:4,
      desc:'常年雷暴的山峰，雷鸟在此翱翔。',
      unlockCondition:{ type:'compound', conditions:[
        { type:'totalExplorations', value:90 }, { type:'tech', value:'cartography' },
        { type:'coins', value:15000 }
      ], label:'探索≥90次 且解锁制图学 且 金币≥15000' },
      energyCostManual:15, progressPerClick:[5,10],
      monsters:['thunderbird','windsprite','phoenix'], catchChance:0.10,
      rewards:{ coins:[100,200], food:[5,15], materials:[30,70], research:[50,100] } },

    { id:'dark_cave',      name:'暗黑洞窟',   icon:'🌑', tier:4,
      desc:'深入地下的漆黑洞窟，暗影在此沉眠。需购买探险通行证。',
      unlockCondition:{ type:'purchase', value:10000, label:'花费 10000 金币购买通行证' },
      energyCostManual:18, progressPerClick:[4,10],
      monsters:['shadow','wisp','deepkraken','voidwalker'], catchChance:0.10,
      defeatChance:0.12,
      rewards:{ coins:[100,220], food:[0,15], materials:[50,100], research:[50,100] } },

    { id:'deep_ocean',     name:'深海秘境',   icon:'🌀', tier:4,
      desc:'传说中的深海，克拉肯在此统治。',
      unlockCondition:{ type:'compound', conditions:[
        { type:'totalExplorations', value:110 }, { type:'coins', value:25000 },
        { type:'monsterCount', value:12 }
      ], label:'探索≥110次 且 金币≥25000 且怪兽≥12只' },
      energyCostManual:18, progressPerClick:[4,9],
      monsters:['deepkraken','toxfrog','mudcrab'], catchChance:0.09,
      rewards:{ coins:[150,300], food:[10,25], materials:[60,120], research:[60,120] } },

    // ══════════════════════════════════════════════
    // 阶段5：后期区域 ── 全面成长验证
    // ══════════════════════════════════════════════
    { id:'ancient_ruins',  name:'远古遗迹',   icon:'🐉', tier:5,
      desc:'传说中存在古龙的神秘遗迹。',
      unlockCondition:{ type:'compound', conditions:[
        { type:'totalExplorations', value:140 }, { type:'monsterCount', value:15 },
        { type:'coins', value:50000 }, { type:'research', value:3000 }
      ], label:'探索≥140次 且怪兽≥15只 且金币≥50000 且研究≥3000' },
      energyCostManual:20, progressPerClick:[3,8],
      monsters:['ancient','ironwarden','celestial','titan'], catchChance:0.07,
      rewards:{ coins:[200,500], food:[20,60], materials:[80,150], research:[80,150] } },

    { id:'void_rift',      name:'虚空裂缝',   icon:'🕳', tier:5,
      desc:'空间破裂之处，虚空行者在此穿梭。',
      unlockCondition:{ type:'compound', conditions:[
        { type:'totalExplorations', value:180 }, { type:'monsterCount', value:18 },
        { type:'tech', value:'explorationT5' }
      ], label:'探索≥180次 且怪兽≥18只 且解锁T5探索科技' },
      energyCostManual:20, progressPerClick:[3,7],
      monsters:['voidwalker','shadow','spiritking'], catchChance:0.06,
      rewards:{ coins:[250,550], food:[0,20], materials:[100,200], research:[100,200] } },

    { id:'celestial_isle', name:'天界之岛',   icon:'☁️', tier:5,
      desc:'漂浮云端的神圣岛屿，天界使者居住于此。',
      unlockCondition:{ type:'compound', conditions:[
        { type:'totalExplorations', value:220 }, { type:'tech', value:'explorationT5' },
        { type:'coins', value:100000 }, { type:'monstersBreed', value:15 }
      ], label:'探索≥220次 且T5探索科技 且金币≥100000 且繁殖≥15次' },
      energyCostManual:22, progressPerClick:[3,7],
      monsters:['celestial','sprite','phoenix'], catchChance:0.06,
      rewards:{ coins:[300,600], food:[10,30], materials:[80,160], research:[150,300] } },

    // ══════════════════════════════════════════════
    // 阶段6：顶级区域 ── 终局内容，条件极为苛刻
    // ══════════════════════════════════════════════
    { id:'void_realm',     name:'虚空领域',   icon:'🌌', tier:6,
      desc:'超越现实的终极区域，传说级怪兽的家园。',
      unlockCondition:{ type:'compound', conditions:[
        { type:'totalExplorations', value:280 }, { type:'monsterCount', value:25 },
        { type:'coins', value:300000 }, { type:'research', value:15000 }
      ], label:'探索≥280次 且怪兽≥25只 且金币≥300000 且研究≥15000' },
      energyCostManual:25, progressPerClick:[2,6],
      monsters:['spiritking','worldtree','timeghost','ancient'], catchChance:0.05,
      rewards:{ coins:[500,1000], food:[30,80], materials:[150,300], research:[200,400] } },

    { id:'titan_fortress', name:'泰坦要塞',   icon:'🏰', tier:6,
      desc:'泰坦巨人的古老要塞，蕴含最终的力量。',
      unlockCondition:{ type:'compound', conditions:[
        { type:'totalExplorations', value:350 }, { type:'allTech', label:'解锁全部科技' },
        { type:'coins', value:500000 }
      ], label:'探索≥350次 且解锁全部科技 且金币≥500000' },
      energyCostManual:25, progressPerClick:[2,5],
      monsters:['titan','ironwarden','ancient'], catchChance:0.04,
      rewards:{ coins:[800,1500], food:[20,60], materials:[200,400], research:[150,300] } },

    { id:'dream_garden',   name:'梦境花园',   icon:'🌸', tier:6,
      desc:'只存在于梦中的永恒花园，世界树精在此沉睡。',
      unlockCondition:{ type:'compound', conditions:[
        { type:'totalExplorations', value:400 }, { type:'monstersBreed', value:30 },
        { type:'monsterCount', value:30 }
      ], label:'探索≥400次 且繁殖≥30次 且怪兽≥30只' },
      energyCostManual:22, progressPerClick:[2,6],
      monsters:['worldtree','leafkin','deepmoss','celestial'], catchChance:0.04,
      rewards:{ coins:[400,800], food:[100,200], materials:[100,200], research:[200,400] } },

    { id:'time_labyrinth', name:'时间迷宫',   icon:'⏳', tier:6,
      desc:'时间扭曲的迷宫，时间幽灵在此游荡。',
      unlockCondition:{ type:'compound', conditions:[
        { type:'totalExplorations', value:500 }, { type:'monstersBreed', value:50 },
        { type:'research', value:50000 }, { type:'coins', value:1000000 }
      ], label:'探索≥500次 且繁殖≥50次 且研究≥50000 且金币≥1000000' },
      energyCostManual:28, progressPerClick:[2,5],
      monsters:['timeghost','voidwalker','spiritking'], catchChance:0.03,
      rewards:{ coins:[1000,2000], food:[50,150], materials:[300,600], research:[500,1000] } }
];

// ========== 科技树（55项，6大类目）==========
var technologies = {

    // ══ 农业类（16项）══
    advancedFarming:{ name:'高级农业',   category:'farming', tier:2,
        desc:'解锁Tier2作物（浆果/蘑菇/胡萝卜/南瓜）',
        cost:{ research:50, coins:200 }, prereq:[],
        effects:{ cropYield:1.2, unlockCropTier:2 } },
    irrigation:     { name:'灌溉系统',   category:'farming', tier:2,
        desc:'作物生长速度+25%',
        cost:{ research:30, materials:50 }, prereq:[],
        effects:{ growthSpeed:1.25 } },
    fertilizerT1:   { name:'基础肥料',   category:'farming', tier:2,
        desc:'所有作物产量+15%',
        cost:{ research:40, food:100 }, prereq:['advancedFarming'],
        effects:{ cropYield:1.15 } },
    cropT3:         { name:'中级农艺',   category:'farming', tier:3,
        desc:'解锁Tier3作物（向日葵/草药/棉花/甘蔗）',
        cost:{ research:150, coins:500, materials:100 }, prereq:['advancedFarming','irrigation'],
        effects:{ unlockCropTier:3 } },
    fertilizerT2:   { name:'复合肥料',   category:'farming', tier:3,
        desc:'所有作物产量再+20%，食物消耗-10%',
        cost:{ research:120, materials:200 }, prereq:['fertilizerT1'],
        effects:{ cropYield:1.20, foodConsume:0.9 } },
    greenhouse:     { name:'温室种植',   category:'farming', tier:3,
        desc:'生长不受天气事件影响，生长速度再+10%',
        cost:{ research:200, coins:800, materials:300 }, prereq:['irrigation','cropT3'],
        effects:{ growthSpeed:1.10, weatherImmune:true } },
    cropT4:         { name:'高阶栽培',   category:'farming', tier:4,
        desc:'解锁Tier4作物（火龙果/冰蕨/虚空菇/黄金小麦）',
        cost:{ research:500, coins:2000, materials:500 }, prereq:['cropT3','fertilizerT2'],
        effects:{ unlockCropTier:4 } },
    hydroponics:    { name:'水培技术',   category:'farming', tier:4,
        desc:'生长速度+15%，额外解锁2块地',
        cost:{ research:400, coins:1500, materials:400 }, prereq:['greenhouse'],
        effects:{ growthSpeed:1.15, extraPlots:2 } },
    autoharvest:    { name:'自动收割机', category:'farming', tier:4,
        desc:'成熟作物30秒内自动收获（即使无怪兽）',
        cost:{ research:600, coins:3000 }, prereq:['cropT4'],
        effects:{ autoHarvestDelay:30000 } },
    cropT5:         { name:'顶级农业学', category:'farming', tier:5,
        desc:'解锁Tier5作物（星辰果/月光叶/血玫瑰）',
        cost:{ research:1500, coins:8000, materials:1500 }, prereq:['cropT4','hydroponics'],
        effects:{ unlockCropTier:5 } },
    soilMastery:    { name:'土壤精通',   category:'farming', tier:5,
        desc:'所有作物产量+30%，优质率+15%',
        cost:{ research:1200, materials:800 }, prereq:['fertilizerT2'],
        effects:{ cropYield:1.30, qualityBonus:0.15 } },
    seasonalFarming:{ name:'季节性种植', category:'farming', tier:5,
        desc:'每轮收获10%概率触发丰收季，本次产量×3',
        cost:{ research:1800, food:2000 }, prereq:['greenhouse','soilMastery'],
        effects:{ harvestBonusChance:0.10, harvestBonusMult:3 } },
    cropT6:         { name:'神圣农业秘典',category:'farming',tier:6,
        desc:'解锁Tier6顶级作物（以太之花/灵魂谷/混沌草）',
        cost:{ research:5000, coins:20000, materials:5000 }, prereq:['cropT5','soilMastery'],
        effects:{ unlockCropTier:6 } },
    cosmicFertilizer:{ name:'宇宙肥料', category:'farming', tier:6,
        desc:'Tier5/6作物产量+50%，并产生稀有材料',
        cost:{ research:8000, coins:30000 }, prereq:['cropT6'],
        effects:{ highTierCropBonus:1.50 } },
    worldTreeBlessing:{ name:'世界树祝福',category:'farming',tier:6,
        desc:'所有农场地块同时生长速度翻倍',
        cost:{ research:10000, coins:50000 }, prereq:['cropT6','cosmicFertilizer'],
        effects:{ globalGrowthMult:2.0 } },
    eternalHarvest: { name:'永恒丰收',   category:'farming', tier:6,
        desc:'每次收获永久+1%产量（最高累计+100%）',
        cost:{ research:15000, coins:80000 }, prereq:['worldTreeBlessing'],
        effects:{ harvestAccumBonus:true } },

    // ══ 探索类（11项）══
    exploration:    { name:'探索技术',   category:'exploration', tier:2,
        desc:'解锁火山麓区域，探索奖励+50%',
        cost:{ research:60, materials:100 }, prereq:[],
        effects:{ explorationBonus:1.5 } },
    cartography:    { name:'地图学',     category:'exploration', tier:2,
        desc:'探索进度增长+20%',
        cost:{ research:80, coins:300 }, prereq:['exploration'],
        effects:{ exploreProgress:1.20 } },
    campcraft:      { name:'野营技术',   category:'exploration', tier:3,
        desc:'派遣怪兽探索时，能量消耗归零',
        cost:{ research:200, materials:150 }, prereq:['cartography'],
        effects:{ autoExploreCost:0 } },
    survivalKit:    { name:'求生装备',   category:'exploration', tier:3,
        desc:'怪兽探索时捕获率+30%',
        cost:{ research:250, coins:600 }, prereq:['exploration'],
        effects:{ catchChanceBonus:0.30 } },
    expeditionT4:   { name:'远征队编组', category:'exploration', tier:4,
        desc:'探索队最大编制+2，可同时探索2个区域',
        cost:{ research:800, coins:3000, materials:500 }, prereq:['campcraft'],
        effects:{ maxExpedition:5, simultaneousZones:2 } },
    treasureHunting:{ name:'寻宝术',     category:'exploration', tier:4,
        desc:'探索发现宝箱概率+40%，宝箱奖励×2',
        cost:{ research:600, coins:2000 }, prereq:['survivalKit'],
        effects:{ treasureChance:0.40, treasureMult:2 } },
    explorationT5:  { name:'星际探索',   category:'exploration', tier:5,
        desc:'解锁天界之岛，所有探索奖励+100%',
        cost:{ research:2000, coins:10000, materials:2000 }, prereq:['expeditionT4','treasureHunting'],
        effects:{ explorationBonus:2.0 } },
    monsterTracker: { name:'怪兽追踪',   category:'exploration', tier:5,
        desc:'指定类型怪兽捕获率提升至2倍',
        cost:{ research:1500, materials:1000 }, prereq:['survivalKit'],
        effects:{ targetedCatchMult:2.0 } },
    voidMapping:    { name:'虚空测绘',   category:'exploration', tier:6,
        desc:'解锁虚空领域，探索稀有资源率+200%',
        cost:{ research:8000, coins:40000, materials:8000 }, prereq:['explorationT5'],
        effects:{ rareRewardMult:3.0 } },
    parallelExpedition:{ name:'平行探险',category:'exploration',tier:6,
        desc:'最多同时进行4支探索队',
        cost:{ research:12000, coins:60000 }, prereq:['voidMapping'],
        effects:{ simultaneousZones:4 } },
    dimensionalGate:{ name:'次元门',     category:'exploration', tier:6,
        desc:'随机传送至任意已解锁区域，探索进度×3',
        cost:{ research:20000, coins:100000 }, prereq:['parallelExpedition'],
        effects:{ dimensionalGate:true } },

    // ══ 怪兽类（8项）══
    monsterTraining:{ name:'怪兽训练',   category:'monster', tier:2,
        desc:'怪兽属性成长×1.3',
        cost:{ research:80, coins:300 }, prereq:[],
        effects:{ statGrowth:1.3 } },
    monsterDiet:    { name:'营养配餐',   category:'monster', tier:2,
        desc:'怪兽食物消耗-20%，经验获取+15%',
        cost:{ research:60, food:200 }, prereq:[],
        effects:{ foodConsume:0.8, expGain:1.15 } },
    advancedTraining:{ name:'高级训练营',category:'monster', tier:3,
        desc:'怪兽等级上限提升至40，经验获取×1.5',
        cost:{ research:300, coins:1000, materials:200 }, prereq:['monsterTraining'],
        effects:{ maxLevel:40, expGain:1.5 } },
    skillSystem:    { name:'技能觉醒',   category:'monster', tier:3,
        desc:'怪兽Lv10/20/30时各觉醒一项主动技能',
        cost:{ research:400, coins:1500 }, prereq:['advancedTraining'],
        effects:{ skillUnlock:true } },
    eliteTraining:  { name:'精英训练',   category:'monster', tier:4,
        desc:'怪兽等级上限提升至60，满级时所有属性额外+20',
        cost:{ research:1000, coins:5000, materials:1000 }, prereq:['advancedTraining'],
        effects:{ maxLevel:60, maxLevelBonus:20 } },
    monsterSynergy: { name:'群体共鸣',   category:'monster', tier:4,
        desc:'同类型怪兽每增加1只，同类全员属性+5%',
        cost:{ research:800, coins:3000 }, prereq:['monsterDiet','skillSystem'],
        effects:{ synergyBonus:0.05 } },
    legendaryTraining:{ name:'传说调教', category:'monster', tier:5,
        desc:'怪兽等级上限提升至100，每级属性成长×2',
        cost:{ research:3000, coins:15000, materials:3000 }, prereq:['eliteTraining'],
        effects:{ maxLevel:100, statGrowth:2.0 } },
    divineAwakening:{ name:'神性觉醒',   category:'monster', tier:6,
        desc:'史诗/传说级怪兽觉醒神性形态，所有属性翻倍',
        cost:{ research:10000, coins:50000 }, prereq:['legendaryTraining'],
        effects:{ divineAwakenBonus:2.0 } },

    // ══ 繁殖类（6项）══
    breeding:       { name:'繁殖技术',   category:'breeding', tier:2,
        desc:'允许怪兽繁殖，培育更强后代',
        cost:{ research:100, coins:500 }, prereq:[],
        effects:{ breedingEnabled:true } },
    geneticEnhancement:{ name:'基因强化',category:'breeding', tier:3,
        desc:'繁殖后代属性继承率+20%，变异概率×1.5',
        cost:{ research:250, food:500, coins:1000 }, prereq:['breeding'],
        effects:{ inheritBonus:0.20, mutationRate:1.5 } },
    rapidBreeding:  { name:'快速繁殖',   category:'breeding', tier:3,
        desc:'繁殖冷却时间-30%，孵化时间-20%',
        cost:{ research:200, food:300 }, prereq:['breeding'],
        effects:{ breedCooldown:0.7, hatchTime:0.8 } },
    traitInheritance:{ name:'特性遗传学',category:'breeding', tier:4,
        desc:'后代继承双亲最优特性概率提升至80%',
        cost:{ research:600, food:1000 }, prereq:['geneticEnhancement'],
        effects:{ traitInheritRate:0.80 } },
    crossBreeding:  { name:'跨种繁殖',   category:'breeding', tier:5,
        desc:'允许不同类型怪兽繁殖，有概率产出混血新怪兽',
        cost:{ research:2000, coins:8000, food:2000 }, prereq:['traitInheritance','rapidBreeding'],
        effects:{ crossBreedEnabled:true } },
    divineBreeding: { name:'神圣繁殖',   category:'breeding', tier:6,
        desc:'传说级怪兽繁殖时，有5%概率产出「神话」级怪兽',
        cost:{ research:15000, coins:80000, food:10000 }, prereq:['crossBreeding'],
        effects:{ mythicBreedChance:0.05 } },

    // ══ 扩建类（8项）══
    expansion:      { name:'农场扩建',   category:'expansion', tier:2,
        desc:'解锁3块额外农田（共12块）',
        cost:{ coins:500, materials:200 }, prereq:[],
        effects:{ extraPlots:3, totalPlots:12 } },
    megaFarm:       { name:'大型农场',   category:'expansion', tier:3,
        desc:'再解锁4块农田（共16块）',
        cost:{ coins:2000, materials:800 }, prereq:['expansion'],
        effects:{ extraPlots:4, totalPlots:16 } },
    industrialFarm: { name:'工业化农场', category:'expansion', tier:4,
        desc:'再解锁5块农田（共21块），解锁批量收获功能',
        cost:{ coins:8000, materials:3000, research:500 }, prereq:['megaFarm'],
        effects:{ extraPlots:5, totalPlots:21, batchHarvest:true } },
    cosmicFarm:     { name:'宇宙农场',   category:'expansion', tier:5,
        desc:'再解锁6块农田（共27块）',
        cost:{ coins:30000, materials:10000, research:2000 }, prereq:['industrialFarm'],
        effects:{ extraPlots:6, totalPlots:27 } },
    monsterBarracks:{ name:'怪兽营房',   category:'expansion', tier:3,
        desc:'怪兽容量从15提升至30',
        cost:{ coins:1500, materials:500 }, prereq:['expansion'],
        effects:{ maxMonsters:30 } },
    grandBarracks:  { name:'大型营房',   category:'expansion', tier:5,
        desc:'怪兽容量提升至60',
        cost:{ coins:10000, materials:3000 }, prereq:['monsterBarracks'],
        effects:{ maxMonsters:60 } },
    legendaryStables:{ name:'传奇马厩',  category:'expansion', tier:6,
        desc:'怪兽容量提升至100，传说级额外存放位+5',
        cost:{ coins:50000, materials:15000 }, prereq:['grandBarracks'],
        effects:{ maxMonsters:100 } },
    infiniteExpansion:{ name:'无限扩张', category:'expansion', tier:6,
        desc:'每消耗5000金币可永久解锁1块额外农田（无上限）',
        cost:{ coins:100000, research:20000 }, prereq:['cosmicFarm'],
        effects:{ unlimitedPlots:true } }
};

// ========== 游戏阶段（6阶段，里程碑系统）==========
var gameStages = [
    { id:1, name:'新手农夫',   icon:'🌱',
      conditions:{ totalHarvests:10, monsterCount:1 },
      rewards:{ coins:500, unlockMsg:'已解锁：初级科技研究' } },
    { id:2, name:'初级牧主',   icon:'🏡',
      conditions:{ totalHarvests:50, monsterCount:3, totalExplorations:5 },
      rewards:{ coins:2000, maxEnergyBonus:50, unlockMsg:'已解锁：中期区域探索' } },
    { id:3, name:'中级领主',   icon:'🏰',
      conditions:{ totalHarvests:200, monsterCount:8, totalExplorations:20, monstersBreed:3 },
      rewards:{ coins:8000, maxEnergyBonus:100, unlockMsg:'已解锁：高阶作物与稀有区域' } },
    { id:4, name:'高级庄主',   icon:'⚔',
      conditions:{ totalHarvests:1000, monsterCount:15, totalExplorations:50, monstersBreed:10 },
      rewards:{ coins:30000, maxEnergyBonus:200, unlockMsg:'已解锁：顶级科技与传说区域' } },
    { id:5, name:'传奇主宰',   icon:'👑',
      conditions:{ totalHarvests:5000, monsterCount:25, totalExplorations:100, monstersBreed:30 },
      rewards:{ coins:100000, maxEnergyBonus:400, unlockMsg:'已解锁：虚空与终极区域' } },
    { id:6, name:'神话农场主', icon:'🌌',
      conditions:{ totalHarvests:20000, monsterCount:50, totalExplorations:200, monstersBreed:100 },
      rewards:{ coins:500000, maxEnergyBonus:900, unlockMsg:'恭喜达成终极成就！' } }
];

// ========== 怪兽特性库（扩充至25种）==========
var allTraits = [
    { id:'fast',         name:'敏捷',     rarity:'common',    effect:{ agility:2 },                 desc:'行动迅速' },
    { id:'strong',       name:'强壮',     rarity:'common',    effect:{ strength:2 },                desc:'力大无穷' },
    { id:'smart',        name:'聪慧',     rarity:'common',    effect:{ intelligence:2 },            desc:'智慧超群' },
    { id:'farmer',       name:'农夫',     rarity:'common',    effect:{ farming:3 },                 desc:'天生农耕专家' },
    { id:'lucky',        name:'幸运',     rarity:'uncommon',  effect:{ luck:2 },                    desc:'总能带来好运' },
    { id:'hardy',        name:'顽强',     rarity:'common',    effect:{ strength:1, agility:1 },     desc:'坚韧不拔' },
    { id:'explorer',     name:'探险家',   rarity:'uncommon',  effect:{ agility:3 },                 desc:'探索速度+30%' },
    { id:'researcher',   name:'学者',     rarity:'uncommon',  effect:{ intelligence:4 },            desc:'研究点获取+20%' },
    { id:'green_thumb',  name:'绿手指',   rarity:'rare',      effect:{ farming:5 },                 desc:'所有作物生长+20%' },
    { id:'berserker',    name:'狂战士',   rarity:'rare',      effect:{ strength:5, agility:3 },     desc:'战斗力爆表' },
    { id:'sage',         name:'贤者',     rarity:'rare',      effect:{ intelligence:6 },            desc:'研究点获取+35%' },
    { id:'swift',        name:'疾风',     rarity:'rare',      effect:{ agility:6 },                 desc:'探索速度+50%' },
    { id:'titan_blood',  name:'泰坦之血', rarity:'epic',      effect:{ strength:8, farming:4 },     desc:'力量属性上限+20' },
    { id:'void_touched', name:'虚空触碰', rarity:'epic',      effect:{ intelligence:8 },            desc:'稀有资源获取+50%' },
    { id:'divine_grace', name:'神圣恩典', rarity:'legendary', effect:{ farming:10, intelligence:5 },desc:'全农场产量+25%' },
    { id:'time_warp',    name:'时间扭曲', rarity:'legendary', effect:{ agility:10 },                desc:'所有计时器额外-20%' },
    { id:'lazy',         name:'懒惰',     rarity:'common',    effect:{ farming:-1, agility:-1 },    desc:'工作效率低下' },
    { id:'clumsy',       name:'笨拙',     rarity:'common',    effect:{ agility:-2 },                desc:'动作总是慢半拍' },
    { id:'dim',          name:'迟钝',     rarity:'common',    effect:{ intelligence:-2 },           desc:'反应迟钝' },
    { id:'glutton',      name:'贪食',     rarity:'uncommon',  effect:{ farming:2 },                 desc:'效率不错但食量惊人（消耗×1.5）' },
    { id:'nocturnal',    name:'夜行',     rarity:'rare',      effect:{ agility:4, farming:-2 },     desc:'夜间效率翻倍，白天减半' },
    { id:'hoarder',      name:'囤积狂',   rarity:'rare',      effect:{ materialBonus:0.3 },         desc:'材料获取+30%' },
    { id:'coin_lover',   name:'财迷',     rarity:'rare',      effect:{ coinBonus:0.3 },             desc:'金币获取+30%' },
    { id:'soul_eater',   name:'噬魂者',   rarity:'epic',      effect:{ researchBonus:0.5 },         desc:'研究点获取+50%' },
    { id:'berserker_weak',name:'鲁莽',    rarity:'uncommon',  effect:{ strength:4, intelligence:-2 },desc:'力大但不用脑' }
];

// ========== 变异词条（Mutation Traits）数据表 ==========
// 通过捕获随机获得，不可通过重铸获取
// mutationType: 'farm'|'explore'|'passive'|'cost'（影响方向分类）
// trigger: 触发机制描述
// feedMult: 食物消耗倍率（叠乘，默认1.0）
// maintMult: 金币维护费倍率（叠乘，默认1.0）
var MUTATION_TRAITS = [
    // ══════════════════════════════════════════
    // 普通变异（common）── 捕获概率约 5%
    // ══════════════════════════════════════════
    {
        id: 'green_soul',
        name: '绿色灵魂',
        icon: '🌿',
        rarity: 'common',
        mutationType: 'farm',
        desc: '农田产量永久+30%',
        flavor: '它的双手总是带着泥土的气息',
        effect: { farmYield: 0.30 },
        feedMult: 1.0,
        maintMult: 1.0
    },
    {
        id: 'iron_will',
        name: '钢铁意志',
        icon: '🔩',
        rarity: 'common',
        mutationType: 'passive',
        desc: '维护金币消耗-30%',
        flavor: '粗茶淡饭，照样生龙活虎',
        effect: { maintMult: -0.30 },
        feedMult: 1.0,
        maintMult: 0.70
    },
    {
        id: 'swift_paws',
        name: '疾行爪',
        icon: '💨',
        rarity: 'common',
        mutationType: 'explore',
        desc: '探索进度+40%',
        flavor: '永远走在最前面',
        effect: { exploreProgress: 0.40 },
        feedMult: 1.1,
        maintMult: 1.0
    },
    {
        id: 'forager',
        name: '觅食者',
        icon: '🍃',
        rarity: 'common',
        mutationType: 'passive',
        desc: '食物消耗-25%',
        flavor: '总能在角落找到食物',
        effect: { feedMult: -0.25 },
        feedMult: 0.75,
        maintMult: 1.0
    },

    // ══════════════════════════════════════════
    // 稀有变异（uncommon）── 捕获概率约 2.5%
    // ══════════════════════════════════════════
    {
        id: 'golden_touch',
        name: '黄金之触',
        icon: '✨',
        rarity: 'uncommon',
        mutationType: 'farm',
        desc: '每次收获额外+50%金币',
        flavor: '它碰过的庄稼都闪着金光',
        effect: { harvestCoinBonus: 0.50 },
        feedMult: 1.2,
        maintMult: 1.1
    },
    {
        id: 'treasure_nose',
        name: '寻宝嗅觉',
        icon: '💎',
        rarity: 'uncommon',
        mutationType: 'explore',
        desc: '探索奖励数值+60%',
        flavor: '它能闻到两公里外的金币气味',
        effect: { exploreRewardMult: 0.60 },
        feedMult: 1.15,
        maintMult: 1.0
    },
    {
        id: 'marathon',
        name: '马拉松体质',
        icon: '🏃',
        rarity: 'uncommon',
        mutationType: 'explore',
        desc: '探索不积累疲劳值',
        flavor: '永远不知疲倦地奔跑',
        effect: { noFatigue: true },
        feedMult: 1.3,
        maintMult: 1.0
    },
    {
        id: 'bulwark',
        name: '坚不可摧',
        icon: '🛡',
        rarity: 'uncommon',
        mutationType: 'explore',
        desc: '探索战败时免疫属性惩罚',
        flavor: '就算是石头砸下来也只是打个哈欠',
        effect: { defeatImmune: true },
        feedMult: 1.0,
        maintMult: 1.2
    },

    // ══════════════════════════════════════════
    // 珍贵变异（rare）── 捕获概率约 1.2%
    // ══════════════════════════════════════════
    {
        id: 'eternal_flame',
        name: '永久瀛火',
        icon: '🔥',
        rarity: 'rare',
        mutationType: 'explore',
        desc: '探索奖励+100%，但每次探索额外消耗8食物',
        flavor: '内心燃烧着永不熄灭的火焰',
        effect: { exploreRewardMult: 1.00, exploreExtraFood: 8 },
        feedMult: 1.0,
        maintMult: 1.0
    },
    {
        id: 'dual_nature',
        name: '双重天赋',
        icon: '⚡',
        rarity: 'rare',
        mutationType: 'passive',
        desc: '所有属性计算时视为×1.5，维护金币消耗×2',
        flavor: '双重人格，双重力量',
        effect: { allStatMult: 1.50 },
        feedMult: 1.0,
        maintMult: 2.0
    },
    {
        id: 'harvest_soul',
        name: '丰收之魂',
        icon: '🌾',
        rarity: 'rare',
        mutationType: 'farm',
        desc: '该地块产量+80%，不受过劳影响',
        flavor: '每一株庄稼都感受到了它的爱',
        effect: { farmYield: 0.80, farmingNoFatigue: true },
        feedMult: 1.4,
        maintMult: 1.0
    },
    {
        id: 'phantom_step',
        name: '幽灵步伐',
        icon: '👣',
        rarity: 'rare',
        mutationType: 'explore',
        desc: '探索速度+100%（进度加倍）',
        flavor: '来去如风，根本看不到身影',
        effect: { exploreProgress: 1.00 },
        feedMult: 1.5,
        maintMult: 1.2
    },

    // ══════════════════════════════════════════
    // 史诗变异（epic）── 捕获概率约 0.5%
    // ══════════════════════════════════════════
    {
        id: 'parasite',
        name: '寄生共生',
        icon: '🕸',
        rarity: 'epic',
        mutationType: 'cost',
        desc: '食物消耗为0，但每tick从其他怪兽各偷取0.3食物',
        flavor: '生存之道：让别人为我服务',
        effect: { feedMult: 0, parasitic: true },
        feedMult: 0,
        maintMult: 1.5
    },
    {
        id: 'void_sight',
        name: '虚空洞察',
        icon: '🌌',
        rarity: 'epic',
        mutationType: 'passive',
        desc: '探索和农耕中稀有资源（材料/研究）获取×2',
        flavor: '它的眼睛能看见普通人看不见的东西',
        effect: { rareResourceMult: 2.0 },
        feedMult: 1.2,
        maintMult: 1.5
    },

    // ══════════════════════════════════════════
    // 传说变异（legendary）── 捕获概率约 0.1%
    // ══════════════════════════════════════════
    {
        id: 'world_will',
        name: '世界意志',
        icon: '🌍',
        rarity: 'legendary',
        mutationType: 'passive',
        desc: '所有产出+50%，食物和金币消耗+50%，属于游戏最强变异',
        flavor: '它不仅仅是一只怪兽，它是这片土地的守护神',
        effect: { allYieldMult: 0.50, feedMult: 1.50 },
        feedMult: 1.50,
        maintMult: 1.50
    }
];

// ── 变异词条按稀有度的捕获权重（基础，乘以怪兽自身稀有度系数）──
var MUTATION_CATCH_WEIGHTS = {
    common:    0.05,   // 5%
    uncommon:  0.025,  // 2.5%
    rare:      0.012,  // 1.2%
    epic:      0.005,  // 0.5%
    legendary: 0.001   // 0.1%
};

// ── 怪兽稀有度对变异概率的加成系数 ──
var MUTATION_RARITY_BONUS = {
    common:    1.0,
    uncommon:  1.2,
    rare:      1.5,
    epic:      2.0,
    legendary: 3.0
};

// ── 每只怪兽的稀有度决定维护费用（每tick扣除）──
var MONSTER_UPKEEP = {
    common:    { food: 0.08, coins: 0    },  // ~5食/分钟
    uncommon:  { food: 0.15, coins: 0.05 },  // ~9食/分钟
    rare:      { food: 0.25, coins: 0.15 },  // ~15食/分钟
    epic:      { food: 0.40, coins: 0.40 },  // ~24食/分钟
    legendary: { food: 0.60, coins: 1.00 }   // ~36食/分钟
};

// ========== 成就系统（16项）==========
var achievements = [
    { id:'first_harvest',   name:'初次收获',  icon:'🌾', desc:'完成你的第一次收获',       condition:{ totalHarvests:1 } },
    { id:'first_monster',   name:'新伙伴',     icon:'👾', desc:'捕获第一只怪兽',            condition:{ monsterCount:1 } },
    { id:'first_explore',   name:'探索者',     icon:'🗺', desc:'完成第一次探索',            condition:{ totalExplorations:1 } },
    { id:'first_breed',     name:'繁殖先驱',   icon:'💕', desc:'完成第一次繁殖',            condition:{ monstersBreed:1 } },
    { id:'harvest_100',     name:'百次丰收',   icon:'🏆', desc:'完成100次收获',             condition:{ totalHarvests:100 } },
    { id:'harvest_1000',    name:'千收之主',   icon:'👑', desc:'完成1000次收获',            condition:{ totalHarvests:1000 } },
    { id:'explore_50',      name:'冒险家',     icon:'⚔', desc:'完成50次探索',              condition:{ totalExplorations:50 } },
    { id:'monsters_10',     name:'怪兽军团',   icon:'🐉', desc:'同时拥有10只怪兽',          condition:{ monsterCount:10 } },
    { id:'monsters_30',     name:'万兽之主',   icon:'🌌', desc:'同时拥有30只怪兽',          condition:{ monsterCount:30 } },
    { id:'breed_10',        name:'繁殖大师',   icon:'🧬', desc:'完成10次繁殖',              condition:{ monstersBreed:10 } },
    { id:'all_basic_tech',  name:'科技先锋',   icon:'🔬', desc:'解锁全部基础科技（Tier2）', condition:{ techCount:6 } },
    { id:'coins_10000',     name:'万金富翁',   icon:'💰', desc:'同时持有10000金币',         condition:{ coins:10000 } },
    { id:'coins_100000',    name:'巨富庄主',   icon:'💎', desc:'同时持有100000金币',        condition:{ coins:100000 } },
    { id:'legendary_catch', name:'传说猎手',   icon:'⚡', desc:'捕获第一只传说级怪兽',     condition:{ legendaryMonster:1 } },
    { id:'all_crops',       name:'百作俱全',   icon:'🌈', desc:'种植过全部20种作物',        condition:{ cropsGrown:20 } },
    { id:'max_plots',       name:'无边农场',   icon:'🌍', desc:'解锁全部农田（27块）',      condition:{ plotsUnlocked:27 } }
];
