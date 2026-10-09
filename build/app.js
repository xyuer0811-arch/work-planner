/* IELTS_WORDS injected above; fallback if missing */
if (typeof IELTS_WORDS === 'undefined') { window.IELTS_WORDS = []; }
var WORDS = (typeof IELTS_WORDS !== 'undefined' ? IELTS_WORDS : window.IELTS_WORDS) || [];

(function () {
  'use strict';

  var STORAGE_KEY = 'wb_v2';
  var BACKUP_KEY = STORAGE_KEY + '_bak';
  var SYNC_META_KEY = STORAGE_KEY + '_sync';
  var SUPABASE_CFG_KEY = STORAGE_KEY + '_supabase';
  var CLOUD_PUSH_DELAY_MS = 1500;

  var COMMON_CATS = ['餐饮', '娱乐', '交通', '旅行', '购物', '学习', '家教', '实习'];
  var ACCOUNT_KEYS = ['wechat', 'bank', 'yuebao', 'xiaohebao'];
  var ACCOUNT_LABELS = {
    wechat: '微信', bank: '银行卡', yuebao: '余额宝', xiaohebao: '小荷包',
    credit: '信用卡', alipay: '支付宝', cash: '现金'
  };
  var WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

  var LOCAL_FOODS = [
    { name: '米饭', kcal: 116, p: 2.6, c: 25.9, f: 0.3 },
    { name: '馒头', kcal: 221, p: 7, c: 47, f: 1.1 },
    { name: '鸡蛋', kcal: 144, p: 13.3, c: 2.8, f: 8.8 },
    { name: '牛奶', kcal: 54, p: 3, c: 3.4, f: 3.2 },
    { name: '苹果', kcal: 52, p: 0.3, c: 13.8, f: 0.2 },
    { name: '香蕉', kcal: 89, p: 1.1, c: 22.8, f: 0.3 },
    { name: '鸡胸肉', kcal: 133, p: 19.4, c: 2.5, f: 5 },
    { name: '牛肉', kcal: 250, p: 26, c: 0, f: 15 },
    { name: '猪肉', kcal: 242, p: 17, c: 0, f: 19 },
    { name: '豆腐', kcal: 81, p: 8.1, c: 4.2, f: 3.7 },
    { name: '西兰花', kcal: 34, p: 2.8, c: 6.6, f: 0.4 },
    { name: '番茄炒蛋', kcal: 120, p: 6, c: 8, f: 7 },
    { name: '宫保鸡丁', kcal: 280, p: 18, c: 12, f: 18 },
    { name: '麻婆豆腐', kcal: 220, p: 12, c: 8, f: 16 },
    { name: '饺子(10个)', kcal: 420, p: 16, c: 52, f: 16 }
  ];

  var TAG_KEYWORDS = {
    schedule: ['日程', '会议', '课', 'ddl', 'deadline', '待办', 'todo', '计划', '安排', '日历'],
    money: ['钱', '账', '消费', '支出', '收入', '报销', '转账', '支付', '记账'],
    health: ['健康', '运动', '体重', '饮食', '经期', '睡眠', '锻炼', '卡路里'],
    hobby: ['爱好', '兴趣', '打卡', '习惯', '阅读', '画画'],
    study: ['学习', '课程', '作业', '考试', '笔记', '复习', '论文'],
    work: ['工作', '备课', '教学', '学生', '教案', '办公'],
    lang: ['英语', '单词', '雅思', 'ielts', '口语', '听力'],
    shopping: ['购物', '采购', 'shopping', '清单', '买菜'],
    xuegong: ['学工', '宣传', '文体', '旅游系', 'sop']
  };

  var PIE_COLORS = ['#7aada0', '#e8a87c', '#85cdca', '#c38d9e', '#41b3a3', '#e27d60', '#659dbd', '#f7b733', '#fc4a1a', '#6b5b95'];

  var DAILY_QUOTES = [
    '慢慢来，也比较快呀',
    '今天也要对自己温柔一点',
    '小鱼也在为你加油哦',
    '完成一件小事，就算赢了',
    '允许自己休息，也是一种力量',
    '你已经比昨天更靠近目标了',
    '把焦虑换成一小步行动',
    '可爱的人值得被好好对待，包括你',
    '阳光会迟到，但不会缺席',
    '今日份好运已装进口袋',
    '不必完美，认真就很美',
    '喝口水，深呼吸，继续游',
    '小小的坚持，会变成大大的温柔',
    '世界很大，你慢慢探索就好',
    '把今天过成喜欢的样子',
    '累了就靠岸，歇好再出发',
    '你的节奏，就是最好的节奏',
    '星星不说话，但一直在发光',
    '做自己的小太阳吧',
    '好运藏在认真生活的缝隙里',
    '今天也辛苦啦，摸摸头',
    '把喜欢的事，一点点做完',
    '温柔地前进，也是前进',
    '你比自己想象的更有力量',
    '泡一杯茶，开启新的一页',
    '愿你被岁月温柔以待',
    '小事做成了，心情也会变好',
    '风会吹走烦恼，留下勇气',
    '今天的你，值得被夸奖',
    '慢慢发光，也是一种璀璨'
  ];

  var state = null;
  var flashTimer = null;

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function flash(msg) {
    var el = document.getElementById('flash');
    if (!el) return;
    el.innerHTML = '<div class="flash show"></div>';
    el.querySelector('.flash').textContent = msg;
    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(function () {
      var f = el.querySelector('.flash');
      if (f) f.classList.remove('show');
      setTimeout(function () { el.innerHTML = ''; }, 280);
    }, 1800);
  }

  function defaultState() {
    return {
      v: 2,
      scraps: [],
      schedule: {
        events: [], todos: [], classes: [], weekPlans: [], weeks: {},
        dayTypes: [
          { name: '课程', color: '#7aada0' },
          { name: '学习', color: '#659dbd' },
          { name: '工作', color: '#e8a090' },
          { name: '生活', color: '#c4a574' },
          { name: '运动', color: '#7EB8A8' },
          { name: '其他', color: '#9a958c' }
        ]
      },
      money: {
        accounts: { wechat: 0, bank: 0, yuebao: 0, xiaohebao: 0 },
        records: []
      },
      health: {
        weight: [],
        exercise: [],
        diet: [],
        period: { lastStart: '', cycleLen: 28, periodLen: 5, cycles: [], logs: [] }
      },
      hobby: { items: [], moments: [] },
      study: { courses: [], tasks: [], notes: [] },
      work: { projects: [], tutoring: [], prep: [], items: [], inbox: [] },
      lang: { day: 0, dailyGoal: 10, plan: [], progress: {}, practiced: {}, weak: [], mastered: [], quizLog: {} },
      shopping: { modules: [] },
      xuegong: {
        history: { propaganda: { sops: [] }, culture: { sops: [] } },
        tourism: { rows: [] }
      },
      settings: { name: '小鱼' }
    };
  }

  function migrate(s) {
    try {
      if (!s || typeof s !== 'object') return defaultState();
      var out = Object.assign(defaultState(), s);
      out.v = 2;
      if (!Array.isArray(out.scraps)) out.scraps = [];
      out.scraps.forEach(function (item) {
        if (typeof item.done !== 'boolean') item.done = false;
        if (item.done && !item.doneAt) item.doneAt = todayStr();
        if (!item.done) item.doneAt = '';
      });
      // 已完成且完成日早于今天 → 隔日清理
      out.scraps = out.scraps.filter(function (item) {
        if (!item.done) return true;
        return item.doneAt === todayStr();
      });
      if (!out.schedule || typeof out.schedule !== 'object') out.schedule = defaultState().schedule;
      if (!Array.isArray(out.schedule.events)) out.schedule.events = [];
      if (!Array.isArray(out.schedule.todos)) out.schedule.todos = [];
      if (!Array.isArray(out.schedule.classes)) out.schedule.classes = [];
      if (!Array.isArray(out.schedule.weekPlans)) out.schedule.weekPlans = [];
      if (!out.schedule.weeks || typeof out.schedule.weeks !== 'object') out.schedule.weeks = {};
      Object.keys(out.schedule.weeks).forEach(function (k) {
        out.schedule.weeks[k] = normalizeWeekMeta(out.schedule.weeks[k]);
      });
      out.schedule.dayTypes = normalizeDayTypes(out.schedule.dayTypes);
      out.schedule.events.forEach(function (e) {
        if (!e.urgency) e.urgency = 'normal';
        if (e.kind == null) e.kind = '';
      });
      if (!out.money || typeof out.money !== 'object') out.money = defaultState().money;
      if (!out.money.accounts) out.money.accounts = defaultState().money.accounts;
      if (!Array.isArray(out.money.records)) out.money.records = [];
      if (!out.health || typeof out.health !== 'object') out.health = defaultState().health;
      if (!Array.isArray(out.health.weight)) out.health.weight = [];
      if (!Array.isArray(out.health.exercise)) out.health.exercise = [];
      if (!Array.isArray(out.health.diet)) out.health.diet = [];
      if (!out.health.period) out.health.period = defaultState().health.period;
      if (!Array.isArray(out.health.period.logs)) out.health.period.logs = [];
      if (!Array.isArray(out.health.period.cycles)) out.health.period.cycles = [];
      if (!out.hobby || typeof out.hobby !== 'object') out.hobby = { items: [], moments: [] };
      if (!Array.isArray(out.hobby.items)) out.hobby.items = [];
      if (!Array.isArray(out.hobby.moments)) out.hobby.moments = [];
      if (!out.study || typeof out.study !== 'object') out.study = defaultState().study;
      if (!Array.isArray(out.study.courses)) out.study.courses = [];
      if (!Array.isArray(out.study.tasks)) out.study.tasks = [];
      if (!Array.isArray(out.study.notes)) out.study.notes = [];
      if (!out.work || typeof out.work !== 'object') out.work = defaultState().work;
      if (!Array.isArray(out.work.projects)) out.work.projects = [];
      if (!Array.isArray(out.work.tutoring)) out.work.tutoring = [];
      if (!Array.isArray(out.work.items)) out.work.items = [];
      if (!Array.isArray(out.work.prep)) out.work.prep = [];
      if (!Array.isArray(out.work.inbox)) out.work.inbox = [];
      if (!out.lang || typeof out.lang !== 'object') out.lang = defaultState().lang;
      if (typeof out.lang.practiced !== 'object' || !out.lang.practiced) out.lang.practiced = {};
      if (!Array.isArray(out.lang.weak)) out.lang.weak = [];
      if (!Array.isArray(out.lang.mastered)) {
        out.lang.mastered = Array.isArray(out.lang.completed) ? out.lang.completed.slice() : [];
      }
      if (typeof out.lang.progress !== 'object' || !out.lang.progress) out.lang.progress = {};
      if (!Array.isArray(out.lang.plan)) out.lang.plan = [];
      if (typeof out.lang.quizLog !== 'object' || !out.lang.quizLog) out.lang.quizLog = {};
      if (!out.shopping || typeof out.shopping !== 'object') out.shopping = defaultState().shopping;
      if (!Array.isArray(out.shopping.modules)) out.shopping.modules = [];
      if (!out.xuegong || typeof out.xuegong !== 'object') out.xuegong = defaultState().xuegong;
      if (!out.xuegong.history) out.xuegong.history = defaultState().xuegong.history;
      if (!out.xuegong.history.propaganda) out.xuegong.history.propaganda = { sops: [] };
      if (!out.xuegong.history.culture) out.xuegong.history.culture = { sops: [] };
      if (!Array.isArray(out.xuegong.history.propaganda.sops)) out.xuegong.history.propaganda.sops = [];
      if (!Array.isArray(out.xuegong.history.culture.sops)) out.xuegong.history.culture.sops = [];
      if (!out.xuegong.tourism) out.xuegong.tourism = { rows: [] };
      if (!Array.isArray(out.xuegong.tourism.rows)) out.xuegong.tourism.rows = [];
      if (!out.settings || typeof out.settings !== 'object') out.settings = { name: '小鱼' };
      return out;
    } catch (e) {
      return s && typeof s === 'object' ? s : defaultState();
    }
  }

  function ensureScraps(s) {
    if (!Array.isArray(s.scraps)) s.scraps = [];
    var today = todayStr();
    s.scraps.forEach(function (item) {
      if (typeof item.done !== 'boolean') item.done = false;
      if (!Array.isArray(item.tags)) item.tags = [];
      if (item.done && !item.doneAt) item.doneAt = today;
      if (!item.done) item.doneAt = '';
    });
    // 未完成永久保留；已完成仅保留「今天完成」的，隔天自动删除
    s.scraps = s.scraps.filter(function (item) {
      if (!item.done) return true;
      return item.doneAt === today;
    });
  }

  function normalizeWeekMeta(meta) {
    var m = meta && typeof meta === 'object' ? meta : {};
    var goals = [];
    if (Array.isArray(m.goals)) {
      goals = m.goals.map(function (g) {
        if (typeof g === 'string') return { id: uid(), text: g };
        return { id: g.id || uid(), text: String(g.text || '').trim() };
      }).filter(function (g) { return g.text; });
    } else if (typeof m.goal === 'string' && m.goal.trim()) {
      // 旧版单段目标 → 按行拆成多条
      goals = m.goal.split(/\n+/).map(function (line) { return line.trim(); }).filter(Boolean).map(function (text) {
        return { id: uid(), text: text };
      });
    }
    return { goals: goals, summary: typeof m.summary === 'string' ? m.summary : '' };
  }

  function slotDefaultTime(slot) {
    if (slot === 'noon') return '13:00';
    if (slot === 'pm') return '19:00';
    return '09:00';
  }

  function isPlanEvent(e) {
    return e && e.type !== 'ddl' && e.type !== 'special';
  }

  function mergeWeekPlansIntoEvents(s) {
    if (!s.schedule || !Array.isArray(s.schedule.weekPlans) || !s.schedule.weekPlans.length) return;
    s.schedule.weekPlans.forEach(function (p) {
      var exists = s.schedule.events.some(function (e) {
        return e._fromWeekPlan === p.id || (e.title === p.title && e.date === p.date && isPlanEvent(e));
      });
      if (exists) return;
      s.schedule.events.push({
        id: p.id || uid(),
        title: p.title || '',
        date: p.date || todayStr(),
        time: p.time || slotDefaultTime(p.slot || 'am'),
        endTime: p.endTime || '',
        type: 'event',
        kind: p.kind || '其他',
        urgency: p.urgency === 'urgent' ? 'urgent' : 'normal',
        note: p.note || '',
        _fromWeekPlan: p.id || ''
      });
    });
    s.schedule.weekPlans = [];
  }

  function ensureSchedule(s) {
    if (!s.schedule) s.schedule = defaultState().schedule;
    if (!Array.isArray(s.schedule.events)) s.schedule.events = [];
    if (!Array.isArray(s.schedule.todos)) s.schedule.todos = [];
    if (!Array.isArray(s.schedule.classes)) s.schedule.classes = [];
    if (!Array.isArray(s.schedule.weekPlans)) s.schedule.weekPlans = [];
    if (!s.schedule.weeks || typeof s.schedule.weeks !== 'object') s.schedule.weeks = {};
    Object.keys(s.schedule.weeks).forEach(function (k) {
      s.schedule.weeks[k] = normalizeWeekMeta(s.schedule.weeks[k]);
    });
    s.schedule.dayTypes = normalizeDayTypes(s.schedule.dayTypes);
    mergeWeekPlansIntoEvents(s);
    s.schedule.events.forEach(function (e) {
      if (!e.urgency) e.urgency = 'normal';
      if (e.kind == null) e.kind = '';
    });
    s.schedule.todos.forEach(function (t) {
      if (typeof t.important !== 'boolean') t.important = true;
      if (typeof t.urgent !== 'boolean') t.urgent = false;
      if (typeof t.done !== 'boolean') t.done = false;
    });
    s.schedule.classes.forEach(normalizeRoutine);
  }

  function ensureMoney(s) {
    if (!s.money) s.money = defaultState().money;
    if (!s.money.accounts || typeof s.money.accounts !== 'object') {
      s.money.accounts = { wechat: 0, bank: 0, yuebao: 0, xiaohebao: 0 };
    }
    var a = s.money.accounts;
    if (typeof a.yuebao !== 'number') a.yuebao = typeof a.alipay === 'number' ? a.alipay : 0;
    if (typeof a.xiaohebao !== 'number') a.xiaohebao = 0;
    if (typeof a.wechat !== 'number') a.wechat = 0;
    if (typeof a.bank !== 'number') a.bank = 0;
    ACCOUNT_KEYS.forEach(function (k) { if (typeof a[k] !== 'number') a[k] = 0; });
    if (!Array.isArray(s.money.records)) s.money.records = [];
  }

  function ensureHealth(s) {
    if (!s.health) s.health = defaultState().health;
    if (!Array.isArray(s.health.weight)) s.health.weight = [];
    if (!Array.isArray(s.health.exercise)) s.health.exercise = [];
    if (!Array.isArray(s.health.diet)) s.health.diet = [];
    if (!s.health.period) s.health.period = { lastStart: '', cycleLen: 28, periodLen: 5, cycles: [], logs: [] };
    if (!Array.isArray(s.health.period.logs)) s.health.period.logs = [];
    if (!Array.isArray(s.health.period.cycles)) s.health.period.cycles = [];
    migratePeriodData(s.health.period);
  }

  var FLOW_OPTS = [
    { id: 'none', label: '无', level: 0 },
    { id: 'spotting', label: '点滴', level: 1 },
    { id: 'light', label: '少', level: 2 },
    { id: 'medium', label: '中', level: 3 },
    { id: 'heavy', label: '多', level: 4 }
  ];
  var SYMPTOM_OPTS = ['腹痛', '腰酸', '头痛', '乳房胀痛', '情绪波动', '疲劳', '恶心', '失眠', '水肿'];
  var RELIEF_OPTS = ['热敷', '休息', '轻度运动', '喝热水', '按摩', '止痛药', '其他'];

  function flowLabel(id) {
    for (var i = 0; i < FLOW_OPTS.length; i++) {
      if (FLOW_OPTS[i].id === id) return FLOW_OPTS[i].label;
    }
    return id || '—';
  }

  function flowLevel(id) {
    for (var i = 0; i < FLOW_OPTS.length; i++) {
      if (FLOW_OPTS[i].id === id) return FLOW_OPTS[i].level;
    }
    return 0;
  }

  function migratePeriodData(p) {
    p.cycles.forEach(function (c) {
      if (!Array.isArray(c.days)) c.days = [];
      if (c.summary == null) c.summary = '';
      if (c.end == null) c.end = '';
      c.days.forEach(function (d) {
        if (!Array.isArray(d.symptoms)) {
          d.symptoms = d.symptoms ? String(d.symptoms).split(/[,，、]/).map(function (x) { return x.trim(); }).filter(Boolean) : [];
        }
        if (typeof d.meds !== 'boolean') d.meds = !!d.meds;
        if (d.relief == null) d.relief = '';
        if (d.medNote == null) d.medNote = '';
        if (d.note == null) d.note = '';
        if (!d.flow) d.flow = 'medium';
      });
    });
    if (p._logsMigrated || !p.logs.length) return;
    var logs = p.logs.slice().sort(function (a, b) { return (a.date || '').localeCompare(b.date || ''); });
    var cur = null;
    logs.forEach(function (l) {
      if (l.type === 'start') {
        cur = { id: l.id || uid(), start: l.date, end: '', summary: '', days: [] };
        p.cycles.push(cur);
        p.lastStart = l.date;
      } else if (l.type === 'end') {
        if (!cur) {
          cur = { id: uid(), start: l.date, end: l.date, summary: l.note || '', days: [] };
          p.cycles.push(cur);
        } else {
          cur.end = l.date;
          if (l.note) cur.summary = (cur.summary ? cur.summary + '；' : '') + l.note;
        }
      } else if (cur) {
        cur.days.push({
          id: l.id || uid(),
          date: l.date,
          flow: 'medium',
          symptoms: [],
          meds: false,
          medNote: '',
          relief: '',
          note: l.note || ''
        });
      }
    });
    p._logsMigrated = true;
  }

  function getOpenCycle() {
    var cycles = (state.health.period && state.health.period.cycles) || [];
    for (var i = cycles.length - 1; i >= 0; i--) {
      if (cycles[i].start && !cycles[i].end) return cycles[i];
    }
    return null;
  }

  function findCycleForDate(date) {
    var cycles = (state.health.period && state.health.period.cycles) || [];
    var hit = null;
    cycles.forEach(function (c) {
      if (!c.start) return;
      if (date >= c.start && (!c.end || date <= c.end)) hit = c;
    });
    return hit || getOpenCycle();
  }

  function latestPeriodStart() {
    var p = state.health.period;
    var latest = p.lastStart || '';
    (p.cycles || []).forEach(function (c) {
      if (c.start && (!latest || c.start > latest)) latest = c.start;
    });
    return latest;
  }

  function cyclePeriodDays(c) {
    if (!c || !c.start) return 0;
    if (!c.end) return daysBetween(c.start, todayStr()) + 1;
    return daysBetween(c.start, c.end) + 1;
  }

  function avgRecent(arr, n) {
    if (!arr || !arr.length) return null;
    var slice = arr.slice(-(n || 6));
    var sum = 0;
    for (var i = 0; i < slice.length; i++) sum += slice[i];
    return sum / slice.length;
  }

  /** 根据过往经期动态计算平均周期 / 平均经期天数，并写回 period.cycleLen / periodLen */
  function computePeriodStats() {
    ensureHealth(state);
    var p = state.health.period;
    var chrono = (p.cycles || []).filter(function (c) { return c && c.start; })
      .slice()
      .sort(function (a, b) { return (a.start || '').localeCompare(b.start || ''); });

    var periodLens = [];
    chrono.forEach(function (c) {
      if (!c.end || c.end < c.start) return;
      var len = daysBetween(c.start, c.end) + 1;
      if (len >= 1 && len <= 15) periodLens.push(len);
    });

    var gaps = [];
    for (var i = 1; i < chrono.length; i++) {
      var g = daysBetween(chrono[i - 1].start, chrono[i].start);
      if (g >= 15 && g <= 60) gaps.push(g);
    }

    var avgCycle = avgRecent(gaps, 6);
    var avgPeriod = avgRecent(periodLens, 6);
    if (avgCycle != null) p.cycleLen = Math.max(15, Math.min(60, Math.round(avgCycle)));
    if (avgPeriod != null) p.periodLen = Math.max(1, Math.min(15, Math.round(avgPeriod)));

    return {
      cycleLen: p.cycleLen || 28,
      periodLen: p.periodLen || 5,
      cycleSamples: gaps.length,
      periodSamples: periodLens.length,
      recentGaps: gaps.slice(-6),
      recentPeriods: periodLens.slice(-6),
      avgCycle: avgCycle,
      avgPeriod: avgPeriod,
      cycleCount: chrono.length
    };
  }

  function ensureHobby(s) {
    if (!s.hobby) s.hobby = { items: [], moments: [] };
    if (!Array.isArray(s.hobby.items)) s.hobby.items = [];
    if (!Array.isArray(s.hobby.moments)) s.hobby.moments = [];
    s.hobby.items.forEach(function (it) {
      if (!Array.isArray(it.checkins)) it.checkins = [];
      if (!Array.isArray(it.records)) it.records = [];
      if (it.summary == null) it.summary = '';
      if (Array.isArray(it.checks) && it.checks.length) {
        it.checks.forEach(function (d) {
          var date = typeof d === 'string' ? d : (d && d.date);
          if (!date) return;
          var exists = it.checkins.some(function (c) { return c.date === date; });
          if (!exists) {
            it.checkins.push({
              id: (d && d.id) || uid(),
              date: date,
              done: d && typeof d.done === 'boolean' ? d.done : true
            });
          }
        });
        it.checks = [];
      }
      it.checkins.forEach(function (c) {
        if (typeof c.done !== 'boolean') c.done = true;
        if (!c.id) c.id = uid();
      });
      // 旧版挂在项目下的 records → 顶层 moments
      if (it.records && it.records.length) {
        it.records.forEach(function (r) {
          s.hobby.moments.push({
            id: r.id || uid(),
            date: r.date || todayStr(),
            title: it.title || '',
            itemId: it.id || '',
            withWhom: r.withWhom || r.with || '',
            place: r.place || '',
            what: r.what || '',
            feeling: r.feeling || '',
            spend: r.spend || null,
            moneyId: r.moneyId || ''
          });
        });
        it.records = [];
      }
    });
    s.hobby.moments.forEach(function (m) {
      if (!m.id) m.id = uid();
      if (!m.date) m.date = todayStr();
      if (m.title == null) m.title = '';
      if (m.itemId == null) m.itemId = '';
      if (m.withWhom == null) m.withWhom = '';
      if (m.place == null) m.place = '';
      if (m.what == null) m.what = '';
      if (m.feeling == null) m.feeling = '';
      if (m.moneyId == null) m.moneyId = '';
      if (m.spend && typeof m.spend !== 'object') m.spend = null;
    });
  }

  function hobbyStreak(it) {
    var map = {};
    (it.checkins || []).forEach(function (c) {
      if (c.done) map[c.date] = 1;
    });
    var streak = 0;
    var d = todayStr();
    while (map[d]) { streak++; d = addDays(d, -1); }
    return streak;
  }

  function hobbyTodayCheck(it) {
    var today = todayStr();
    var list = it.checkins || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].date === today) return list[i];
    }
    return null;
  }

  function addMoneyRecord(opts) {
    ensureMoney(state);
    var amt = Math.abs(parseFloat(opts.amount) || 0);
    if (!amt) return '';
    var account = opts.account || 'wechat';
    if (ACCOUNT_KEYS.indexOf(account) < 0) account = ACCOUNT_KEYS[0];
    var io = opts.io === 'in' ? 'in' : 'out';
    var rec = {
      id: uid(),
      account: account,
      io: io,
      amount: amt,
      cat: opts.cat || (io === 'in' ? '家教' : '娱乐'),
      note: opts.note || '',
      date: opts.date || todayStr()
    };
    if (opts.fromHobby) rec.fromHobby = true;
    if (opts.fromTutor) rec.fromTutor = true;
    if (opts.fromShopping) rec.fromShopping = true;
    rec.sig = moneySig(rec);
    state.money.records.push(rec);
    var delta = io === 'in' ? amt : -amt;
    state.money.accounts[account] = (state.money.accounts[account] || 0) + delta;
    return rec.id;
  }

  function addMoneyFromHobby(opts) {
    opts = opts || {};
    opts.io = 'out';
    opts.fromHobby = true;
    if (!opts.cat) opts.cat = '娱乐';
    return addMoneyRecord(opts);
  }

  function removeMoneyById(moneyId) {
    if (!moneyId) return;
    ensureMoney(state);
    var rec = state.money.records.find(function (r) { return r.id === moneyId; });
    if (!rec) return;
    var delta = rec.io === 'in' ? -rec.amount : rec.amount;
    if (state.money.accounts[rec.account] != null) state.money.accounts[rec.account] += delta;
    state.money.records = state.money.records.filter(function (r) { return r.id !== moneyId; });
  }

  function renderHobby() {
    ensureHobby(state);
    var tab = state._hobbyTab || 'check';
    var tabs = [
      { id: 'check', label: '打卡' },
      { id: 'record', label: '记录' }
    ];
    var tabHtml = tabs.map(function (t) {
      return '<button class="tab' + (tab === t.id ? ' active' : '') + '" onclick="App.setHobbyTab(\'' + t.id + '\')">' + t.label + '</button>';
    }).join('');
    var body = tab === 'record' ? renderHobbyRecords() : renderHobbyCheck();
    document.getElementById('page').innerHTML =
      '<h2>兴趣</h2><div class="tabs">' + tabHtml + '</div>' + body;
  }

  function hobbyFishCount(it) {
    return (it.checkins || []).filter(function (c) { return c.done; }).length;
  }

  function renderHobbyTankFish(count) {
    var colors = [
      '#5f9e8e', '#e8a87c', '#6a9fc2', '#d4a5c0', '#c4b06a',
      '#7aada0', '#e27d60', '#8e9cc9', '#b8a07a', '#5eb0a8',
      '#d4b5a8', '#7eb8a8', '#c98a9a', '#85a88a', '#c9a070'
    ];
    var maxShow = 16;
    var n = Math.min(count, maxShow);
    var html = '';
    var i;
    for (i = 0; i < n; i++) {
      var c = colors[i % colors.length];
      var c2 = colors[(i + 3) % colors.length];
      var top = 12 + ((i * 29) % 58);
      var x1 = 6 + ((i * 13) % 20);
      var x2 = 55 + ((i * 17) % 28);
      var dur = 7 + (i % 6) * 1.4;
      var delay = -(i * 1.1);
      var bob = 1.6 + (i % 4) * 0.35;
      var scale = 0.75 + ((i % 5) * 0.1);
      html += '<span class="tank-fish" style="' +
        '--top:' + top + '%;--x1:' + x1 + '%;--x2:' + x2 + '%;' +
        '--dur:' + dur + 's;--delay:' + delay + 's;--bob:' + bob + 's;--scale:' + scale + '">' +
        '<span class="tank-fish-bob">' +
        '<svg viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<ellipse cx="16" cy="14" rx="11" ry="7.2" fill="' + c + '"/>' +
        '<ellipse cx="14" cy="14" rx="5" ry="4" fill="' + c2 + '" opacity="0.35"/>' +
        '<path d="M27 14 L37 7.5 L37 20.5 Z" fill="' + c + '"/>' +
        '<path d="M27 14 L35 14 L37 7.5 Z" fill="' + c2 + '" opacity="0.45"/>' +
        '<circle cx="12" cy="12.2" r="1.7" fill="#fff"/>' +
        '<circle cx="12.6" cy="12.2" r="0.85" fill="#3d4a45"/>' +
        '<path d="M8 16 Q11 19 15 17" fill="none" stroke="' + c2 + '" stroke-width="1" opacity="0.5"/>' +
        '</svg></span></span>';
    }
    if (count > maxShow) {
      html += '<span class="tank-fish-more">+' + (count - maxShow) + '</span>';
    }
    return html;
  }

  function renderHobbyCheck() {
    var items = state.hobby.items;
    var cards = items.map(function (it) {
      var today = hobbyTodayCheck(it);
      var fishCount = hobbyFishCount(it);
      var streak = hobbyStreak(it);
      var status = !today
        ? '<span class="muted">今日未打卡</span>'
        : (today.done
          ? '<span class="hobby-done-tag">今日已做</span>'
          : '<span class="hobby-skip-tag">今日未做</span>');
      var emptyHint = fishCount
        ? ''
        : '<p class="tank-empty-hint">完成打卡，鱼缸会游进小鱼</p>';

      return '<div class="hobby-tank">' +
        '<div class="hobby-tank-top">' +
        '<div><h3>' + esc(it.title) + '</h3>' +
        (it.plan ? '<p class="muted hobby-plan">' + esc(it.plan) + '</p>' : '') + '</div>' +
        '<button type="button" class="btn-ghost wk-clear" onclick="App.delHobby(\'' + it.id + '\')">清除</button></div>' +
        '<div class="tank-bowl" aria-label="' + esc(it.title) + ' 的鱼缸，' + fishCount + ' 条小鱼">' +
        '<div class="tank-rim"></div>' +
        '<div class="tank-glass">' +
        '<div class="tank-water">' +
        '<span class="tank-bubble b1"></span><span class="tank-bubble b2"></span><span class="tank-bubble b3"></span>' +
        '<div class="tank-fish-school">' + renderHobbyTankFish(fishCount) + emptyHint + '</div>' +
        '<div class="tank-sand"></div></div></div></div>' +
        '<p class="hobby-meta">鱼缸里有 <strong>' + fishCount + '</strong> 条小鱼 · 连续 ' + streak + ' 天 · ' + status + '</p>' +
        '<div class="hobby-check-actions">' +
        '<button type="button" class="btn' + (today && today.done ? ' is-on' : '') +
        '" onclick="App.hobbyCheckIn(\'' + it.id + '\',1)">做了 · 游进小鱼</button>' +
        '<button type="button" class="btn btn-ghost' + (today && today.done === false ? ' is-on-skip' : '') +
        '" onclick="App.hobbyCheckIn(\'' + it.id + '\',0)">没做</button></div></div>';
    }).join('') || '<p class="muted wk-view-empty">还没有打卡项目，想坚持的兴趣可以加在这里</p>';

    return '<div class="hobby-wrap">' +
      '<section class="card">' +
      '<h3>添加打卡项目</h3>' +
      '<p class="muted ex-sync-hint">每完成一次「做了」，对应鱼缸里就会多一条小鱼</p>' +
      '<div class="form-row">' +
      '<input id="hobby-title" class="input" placeholder="项目名称，如吉他 / 跑步">' +
      '<input id="hobby-plan" class="input" placeholder="想怎么坚持（可选）">' +
      '<button type="button" class="btn" onclick="App.addHobby()">添加</button></div></section>' +
      '<div class="hobby-check-list">' + cards + '</div></div>';
  }

  function renderHobbyRecords() {
    ensureMoney(state);
    var moments = (state.hobby.moments || []).slice().sort(function (a, b) {
      return (b.date || '').localeCompare(a.date || '');
    });
    var items = state.hobby.items || [];
    var itemOpts = '<option value="">不关联打卡项目</option>' + items.map(function (it) {
      return '<option value="' + it.id + '">' + esc(it.title) + '</option>';
    }).join('');
    var acctOpts = ACCOUNT_KEYS.map(function (k) {
      return '<option value="' + k + '">' + ACCOUNT_LABELS[k] + '</option>';
    }).join('');
    var catOpts = COMMON_CATS.map(function (c) {
      return '<option' + (c === '娱乐' ? ' selected' : '') + '>' + c + '</option>';
    }).join('');

    var form = '<section class="card hobby-moment-form">' +
      '<h3>记一件小事</h3>' +
      '<p class="muted ex-sync-hint">随手记下和谁、在哪、做了什么、心情如何；有花销可一并记入记账</p>' +
      '<div class="hobby-moment-fields">' +
      '<input id="hr-date" class="input" type="date" value="' + todayStr() + '">' +
      '<input id="hr-title" class="input" placeholder="标题，如周末看电影">' +
      '<select id="hr-item" class="input">' + itemOpts + '</select>' +
      '<input id="hr-with" class="input" placeholder="和谁一起">' +
      '<input id="hr-place" class="input" placeholder="在哪里">' +
      '<input id="hr-what" class="input" placeholder="做了什么">' +
      '<textarea id="hr-feeling" class="textarea" rows="2" placeholder="此刻的感受…"></textarea></div>' +
      '<div class="hobby-spend-box">' +
      '<div class="hobby-spend-head"><strong>支出（可选）</strong>' +
      '<span class="muted">填写金额后会自动同步到记账</span></div>' +
      '<div class="form-row">' +
      '<input id="hr-amt" class="input" type="number" step="0.01" min="0" placeholder="金额">' +
      '<select id="hr-acct" class="input">' + acctOpts + '</select>' +
      '<select id="hr-cat" class="input">' + catOpts + '</select></div></div>' +
      '<div class="row mt"><button type="button" class="btn" onclick="App.addHobbyRecord()">记下这一刻</button></div></section>';

    var cards = moments.map(function (m) {
      var linked = items.find(function (it) { return it.id === m.itemId; });
      var spendHtml = m.spend && m.spend.amount
        ? '<p class="hobby-spend-line">花了 <strong>' + Number(m.spend.amount).toFixed(2) + '</strong> · ' +
          esc(ACCOUNT_LABELS[m.spend.account] || m.spend.account || '') + ' · ' + esc(m.spend.cat || '') +
          ' <span class="muted">已入账</span></p>'
        : '';
      var meta = [];
      if (m.withWhom) meta.push('和 ' + m.withWhom);
      if (m.place) meta.push('在 ' + m.place);
      return '<article class="hobby-moment-card">' +
        '<div class="hobby-moment-top">' +
        '<time>' + esc(m.date) + '</time>' +
        (m.title ? '<h4>' + esc(m.title) + '</h4>' : '') +
        (linked ? '<span class="hobby-link-pill">' + esc(linked.title) + '</span>' : '') +
        '<button type="button" class="btn-ghost wk-clear" onclick="App.delHobbyRecord(\'' + m.id + '\')">清除</button></div>' +
        (meta.length ? '<p class="hobby-moment-meta">' + esc(meta.join(' · ')) + '</p>' : '') +
        (m.what ? '<p class="hobby-moment-what">' + esc(m.what) + '</p>' : '') +
        (m.feeling ? '<blockquote class="hobby-feeling">「' + esc(m.feeling) + '」</blockquote>' : '') +
        spendHtml + '</article>';
    }).join('') || '<p class="muted wk-view-empty">还没有记录，去记下最近一件开心的小事吧</p>';

    // 按关联打卡项目做轻松小结（非工作表格）
    var byItem = items.map(function (it) {
      var list = moments.filter(function (m) { return m.itemId === it.id; });
      if (!list.length) return '';
      var spendSum = list.reduce(function (s, m) {
        return s + (m.spend && m.spend.amount ? +m.spend.amount : 0);
      }, 0);
      var bits = list.slice(0, 5).map(function (m) {
        return '<li><span class="muted">' + esc(m.date) + '</span> ' +
          esc(m.title || m.what || '一条记录') +
          (m.feeling ? ' · <em>' + esc(m.feeling) + '</em>' : '') + '</li>';
      }).join('');
      return '<section class="card hobby-soft-sum">' +
        '<h3>' + esc(it.title) + ' 的小记</h3>' +
        '<p class="muted hobby-meta">' + list.length + ' 条记录' +
        (spendSum ? ' · 相关支出 ' + spendSum.toFixed(2) : '') + '</p>' +
        '<ul class="hobby-soft-list">' + bits +
        (list.length > 5 ? '<li class="muted">…还有 ' + (list.length - 5) + ' 条</li>' : '') +
        '</ul>' +
        '<textarea class="textarea" id="hobby-sum-' + it.id + '" rows="2" placeholder="关于这个兴趣的一点总结…">' +
        esc(it.summary || '') + '</textarea>' +
        '<div class="row mt"><button type="button" class="btn" onclick="App.saveHobbySummary(\'' + it.id + '\')">保存</button></div>' +
        '</section>';
    }).join('');

    return '<div class="hobby-wrap">' + form +
      '<section class="hobby-moment-feed"><h3 class="hobby-feed-title">足迹</h3>' + cards + '</section>' +
      (byItem ? '<div class="hobby-soft-sums">' + byItem + '</div>' : '') +
      '</div>';
  }

  function ensureStudy(s) {
    if (!s.study) s.study = defaultState().study;
    if (!Array.isArray(s.study.courses)) s.study.courses = [];
    if (!Array.isArray(s.study.tasks)) s.study.tasks = [];
    if (!Array.isArray(s.study.notes)) s.study.notes = [];
    s.study.notes.forEach(function (n) {
      if (!Array.isArray(n.files)) n.files = [];
      n.files.forEach(function (f) {
        if (!f.id) f.id = uid();
        if (f.name == null) f.name = '附件';
        if (f.type == null) f.type = '';
        if (f.size == null) f.size = 0;
        if (f.data == null) f.data = '';
      });
    });
    s.study.tasks.forEach(function (t) {
      if (t.eventId == null) t.eventId = '';
      if (t.syncType == null) t.syncType = '';
    });
  }

  function pushStudyTaskToSchedule(task, courseName, sync, date, time, endTime) {
    ensureSchedule(state);
    var eid = uid();
    if (sync === 'ddl') {
      state.schedule.events.push({
        id: eid,
        title: task.title,
        date: date || todayStr(),
        time: '',
        endTime: '',
        type: 'ddl',
        note: '来自学习' + (courseName ? ' · ' + courseName : ''),
        _fromStudy: task.id
      });
    } else if (sync === 'sched') {
      state.schedule.events.push({
        id: eid,
        title: task.title,
        date: date || todayStr(),
        time: time || '09:00',
        endTime: endTime || '',
        type: 'event',
        kind: '学习',
        urgency: 'normal',
        note: '来自学习' + (courseName ? ' · ' + courseName : ''),
        _fromStudy: task.id
      });
    } else {
      return '';
    }
    task.eventId = eid;
    task.syncType = sync;
    return eid;
  }

  function normalizeRoutine(c) {
    if (!c || typeof c !== 'object') return;
    if (c.mode !== 'daily' && c.mode !== 'weekdays' && c.mode !== 'weekly') c.mode = 'weekly';
    c.weekday = Math.max(0, Math.min(6, +c.weekday || 0));
    if (c.rangeStart == null) c.rangeStart = '';
    if (c.rangeEnd == null) c.rangeEnd = '';
    if (c.kind == null || c.kind === '') c.kind = '课程';
    if (c.place == null) c.place = '';
    if (c.start == null) c.start = '';
    if (c.end == null) c.end = '';
  }

  function routineModeLabel(mode) {
    if (mode === 'daily') return '每天';
    if (mode === 'weekdays') return '工作日';
    return '每周';
  }

  function routineOccursOnDate(c, dateStr) {
    if (!c || !dateStr) return false;
    normalizeRoutine(c);
    if (c.rangeStart && dateStr < c.rangeStart) return false;
    if (c.rangeEnd && dateStr > c.rangeEnd) return false;
    var p = dateStr.split('-');
    var wd = new Date(+p[0], +p[1] - 1, +p[2]).getDay();
    if (c.mode === 'daily') return true;
    if (c.mode === 'weekdays') return wd >= 1 && wd <= 5;
    return (+c.weekday) === wd;
  }

  function pushPlanFromModule(opts) {
    ensureSchedule(state);
    var eid = uid();
    state.schedule.events.push({
      id: eid,
      title: opts.title,
      date: opts.date || todayStr(),
      time: opts.time || '09:00',
      endTime: opts.endTime || '',
      type: 'event',
      kind: opts.kind || '其他',
      urgency: 'normal',
      note: opts.note || '',
      _fromWork: opts.fromWork || '',
      _fromXuegong: opts.fromXuegong || ''
    });
    return eid;
  }

  function resolvePlanSyncSource(key) {
    var parts = String(key || '').split(':');
    if (parts[0] === 'work') {
      ensureWork(state);
      if (parts[1] === 'proj') {
        var proj = (state.work.projects || []).find(function (x) { return x.id === parts[2]; });
        if (!proj) return null;
        return { title: proj.title, kind: '工作', note: '来自工作 · 项目', fromWork: key };
      }
      if (parts[1] === 'task') {
        var wp = (state.work.projects || []).find(function (x) { return x.id === parts[2]; });
        if (!wp) return null;
        var task = (wp.tasks || []).find(function (x) { return x.id === parts[3]; });
        if (!task) return null;
        return {
          title: task.title,
          kind: '工作',
          note: '来自工作 · ' + wp.title,
          date: task.ddl || '',
          fromWork: key
        };
      }
      if (parts[1] === 'sub') {
        var wp2 = (state.work.projects || []).find(function (x) { return x.id === parts[2]; });
        if (!wp2) return null;
        var task2 = (wp2.tasks || []).find(function (x) { return x.id === parts[3]; });
        if (!task2) return null;
        var sub = (task2.subs || []).find(function (x) { return x.id === parts[4]; });
        if (!sub) return null;
        return {
          title: sub.title,
          kind: '工作',
          note: '来自工作 · ' + wp2.title + ' · ' + task2.title,
          fromWork: key
        };
      }
      if (parts[1] === 'tutor') {
        var tp = (state.work.tutoring || []).find(function (x) { return x.id === parts[2]; });
        if (!tp) return null;
        return { title: tp.title, kind: '工作', note: '来自家教 · 项目', fromWork: key };
      }
      if (parts[1] === 'lesson') {
        var tp2 = (state.work.tutoring || []).find(function (x) { return x.id === parts[2]; });
        if (!tp2) return null;
        var lesson = (tp2.lessons || []).find(function (x) { return x.id === parts[3]; });
        if (!lesson) return null;
        var lessonTitle = tp2.title + (lesson.prep ? ' · ' + String(lesson.prep).slice(0, 24) : ' · 课时');
        return {
          title: lessonTitle,
          kind: '工作',
          note: '来自家教课时',
          date: lesson.date || '',
          time: lesson.time || '',
          endTime: lesson.endTime || '',
          fromWork: key
        };
      }
    }
    if (parts[0] === 'xg') {
      ensureXuegong(state);
      if (parts[1] === 'sop') {
        var sop = findSop(parts[2], parts[3]);
        if (!sop) return null;
        return { title: sop.title, kind: '学工', note: '来自学工 · SOP 项目', date: sop.date || '', fromXuegong: key };
      }
      if (parts[1] === 'step') {
        var sop2 = findSop(parts[2], parts[3]);
        if (!sop2) return null;
        var step = findSopStep(sop2, parts[4]);
        if (!step) return null;
        return {
          title: step.title || '步骤',
          kind: '学工',
          note: '来自学工 · ' + sop2.title,
          fromXuegong: key
        };
      }
      if (parts[1] === 'task') {
        var sop3 = findSop(parts[2], parts[3]);
        if (!sop3) return null;
        var step2 = findSopStep(sop3, parts[4]);
        if (!step2) return null;
        var st = findSopTask(step2, parts[5]);
        if (!st) return null;
        return {
          title: st.text || '小任务',
          kind: '学工',
          note: '来自学工 · ' + sop3.title + ' · ' + (step2.title || '步骤'),
          fromXuegong: key
        };
      }
      if (parts[1] === 'tour') {
        var row = ((state.xuegong.tourism && state.xuegong.tourism.rows) || []).find(function (x) { return x.id === parts[2]; });
        if (!row) return null;
        return {
          title: row.topic || '旅游系项目',
          kind: '学工',
          note: '来自旅游系' + (row.slot ? ' · ' + row.slot : ''),
          date: row.date || '',
          fromXuegong: key
        };
      }
    }
    return null;
  }

  function planSyncActionsHtml(key) {
    var draft = state._planSync;
    var open = draft && draft.key === key;
    var html = '<span class="plan-sync-actions">' +
      '<button type="button" class="btn-ghost" onclick="event.stopPropagation();App.beginPlanSync(\'week\',\'' + key + '\')">→周计划</button>' +
      '<button type="button" class="btn-ghost" onclick="event.stopPropagation();App.beginPlanSync(\'day\',\'' + key + '\')">→日计划</button>' +
      '</span>';
    if (!open) return html;
    var isWeek = draft.target === 'week';
    html += '<div class="study-sync-picker plan-sync-picker" onclick="event.stopPropagation()">' +
      '<span class="study-sync-picker-label">' + (isWeek ? '加入周计划' : '加入日计划') + '</span>' +
      '<input id="plan-sync-date" class="input" type="date" value="' + esc(draft.date || todayStr()) + '">' +
      (isWeek
        ? '<select id="plan-sync-slot" class="input">' +
          '<option value="am"' + (draft.slot === 'am' ? ' selected' : '') + '>上午</option>' +
          '<option value="noon"' + (draft.slot === 'noon' ? ' selected' : '') + '>中午</option>' +
          '<option value="pm"' + (draft.slot === 'pm' ? ' selected' : '') + '>晚上</option></select>'
        : '<input id="plan-sync-time" class="input" type="time" value="' + esc(draft.time || '09:00') + '" title="开始">' +
          '<span class="muted">–</span>' +
          '<input id="plan-sync-end" class="input" type="time" value="' + esc(draft.endTime || '10:00') + '" title="结束">') +
      '<button type="button" class="btn" onclick="App.confirmPlanSync()">确认</button>' +
      '<button type="button" class="btn-ghost" onclick="App.cancelPlanSync()">取消</button></div>';
    return html;
  }

  function studyFmtSize(n) {
    n = +n || 0;
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function studyFileOpenable(type) {
    type = String(type || '');
    return /^image\//.test(type) || type === 'application/pdf' || /^text\//.test(type);
  }

  function readFilesAsDataURLs(fileList, maxBytes, cb) {
    var files = Array.prototype.slice.call(fileList || [], 0);
    if (!files.length) { cb([]); return; }
    var out = [];
    var pending = files.length;
    var skipped = 0;
    files.forEach(function (file) {
      if (maxBytes && file.size > maxBytes) {
        skipped++;
        pending--;
        if (!pending) cb(out, skipped);
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        out.push({
          id: uid(),
          name: file.name || '附件',
          type: file.type || '',
          size: file.size || 0,
          data: reader.result
        });
        pending--;
        if (!pending) cb(out, skipped);
      };
      reader.onerror = function () {
        skipped++;
        pending--;
        if (!pending) cb(out, skipped);
      };
      reader.readAsDataURL(file);
    });
  }

  function ensureWork(s) {
    if (!s.work) s.work = defaultState().work;
    if (!Array.isArray(s.work.projects)) s.work.projects = [];
    if (!Array.isArray(s.work.tutoring)) s.work.tutoring = [];
    if (!Array.isArray(s.work.items)) s.work.items = [];
    if (!Array.isArray(s.work.prep)) s.work.prep = [];
    if (!Array.isArray(s.work.inbox)) s.work.inbox = [];

    // 旧版扁平事项 / 收件箱 → 迁入项目结构（只迁一次）
    if (!s.work._migratedProjects) {
      var legacy = [];
      (s.work.items || []).forEach(function (it) { legacy.push(it); });
      (s.work.inbox || []).forEach(function (it) { legacy.push(it); });
      if (legacy.length && !s.work.projects.length) {
        s.work.projects.push({
          id: uid(),
          title: '历史事项',
          note: '由旧版事项/收件箱自动迁移',
          tasks: legacy.map(function (it) {
            return {
              id: it.id || uid(),
              title: it.title || '未命名',
              content: it.note || '',
              ddl: it.ddl || '',
              done: !!it.done,
              subs: [],
              at: it.at || ''
            };
          })
        });
        s.work.items = [];
        s.work.inbox = [];
      }
      s.work._migratedProjects = true;
    }

    // 旧版备课 → 家教项目
    if (!s.work._migratedTutoring) {
      if ((s.work.prep || []).length && !s.work.tutoring.length) {
        s.work.tutoring.push({
          id: uid(),
          title: '历史备课',
          note: '由旧版备课自动迁移',
          lessons: (s.work.prep || []).map(function (it) {
            return {
              id: it.id || uid(),
              date: (it.at || '').slice(0, 10) || todayStr(),
              time: '09:00',
              endTime: '',
              income: 0,
              account: 'wechat',
              moneyId: '',
              prep: it.note || it.title || '',
              feedback: ''
            };
          })
        });
        s.work.prep = [];
      }
      s.work._migratedTutoring = true;
    }

    s.work.projects.forEach(function (p) {
      if (!Array.isArray(p.tasks)) p.tasks = [];
      if (p.title == null) p.title = '未命名项目';
      if (p.note == null) p.note = '';
      p.tasks.forEach(function (t) {
        if (!t.id) t.id = uid();
        if (t.title == null) t.title = '';
        if (t.content == null) t.content = t.note || '';
        if (t.ddl == null) t.ddl = '';
        if (typeof t.done !== 'boolean') t.done = false;
        if (!Array.isArray(t.subs)) t.subs = [];
        t.subs.forEach(function (sub) {
          if (!sub.id) sub.id = uid();
          if (sub.title == null) sub.title = '';
          if (typeof sub.done !== 'boolean') sub.done = false;
        });
      });
    });

    s.work.tutoring.forEach(function (proj) {
      if (!Array.isArray(proj.lessons)) proj.lessons = [];
      if (proj.title == null) proj.title = '未命名家教';
      if (proj.note == null) proj.note = '';
      proj.lessons.forEach(function (L) {
        if (!L.id) L.id = uid();
        if (!L.date) L.date = todayStr();
        if (L.time == null) L.time = '';
        if (L.endTime == null) L.endTime = '';
        if (typeof L.income !== 'number') L.income = +L.income || 0;
        if (!L.account) L.account = 'wechat';
        if (L.moneyId == null) L.moneyId = '';
        if (L.prep == null) L.prep = '';
        if (L.feedback == null) L.feedback = '';
      });
    });
  }

  function workTaskSubStats(t) {
    var subs = (t && t.subs) || [];
    var done = 0;
    subs.forEach(function (s) { if (s.done) done++; });
    return { total: subs.length, done: done };
  }

  function ensureLang(s) {
    if (!s.lang) s.lang = defaultState().lang;
    if (typeof s.lang.practiced !== 'object' || !s.lang.practiced) s.lang.practiced = {};
    if (!Array.isArray(s.lang.weak)) s.lang.weak = [];
    if (!Array.isArray(s.lang.mastered)) {
      s.lang.mastered = Array.isArray(s.lang.completed) ? s.lang.completed.slice() : [];
    }
    if (typeof s.lang.progress !== 'object' || !s.lang.progress) s.lang.progress = {};
    if (!Array.isArray(s.lang.plan)) s.lang.plan = [];
    if (typeof s.lang.quizLog !== 'object' || !s.lang.quizLog) s.lang.quizLog = {};
    // Deduplicate mastered
    var mSeen = {};
    s.lang.mastered = s.lang.mastered.filter(function (id) {
      if (!id || mSeen[id]) return false;
      mSeen[id] = true;
      return true;
    });
    normalizeLangWeak(s);
    s.lang.weak = (s.lang.weak || []).filter(function (entry) {
      return entry && entry.id && !mSeen[entry.id] && (entry.zh || entry.en);
    });
    // Deduplicate word ids across the whole plan (no repeats between lessons)
    var seen = {};
    s.lang.mastered.forEach(function (id) { seen[id] = true; });
    s.lang.plan = s.lang.plan.map(function (lesson) {
      if (!Array.isArray(lesson)) return [];
      var clean = [];
      lesson.forEach(function (id) {
        if (!id || seen[id]) return;
        seen[id] = true;
        clean.push(id);
      });
      return clean;
    });
  }

  function normalizeLangWeak(s) {
    var raw = s.lang.weak;
    if (!Array.isArray(raw)) { s.lang.weak = []; return; }
    var map = {};
    raw.forEach(function (item) {
      if (typeof item === 'string') {
        if (!item) return;
        // Legacy entries: mark both until specified
        map[item] = map[item] || { id: item, zh: false, en: false };
        map[item].zh = true;
        map[item].en = true;
      } else if (item && item.id) {
        map[item.id] = map[item.id] || { id: item.id, zh: false, en: false };
        if (item.zh) map[item.id].zh = true;
        if (item.en) map[item.id].en = true;
      }
    });
    s.lang.weak = Object.keys(map).map(function (k) { return map[k]; });
  }

  function ensureXuegong(s) {
    if (!s.xuegong) s.xuegong = defaultState().xuegong;
    if (!s.xuegong.history) s.xuegong.history = defaultState().xuegong.history;
    if (!s.xuegong.history.propaganda) s.xuegong.history.propaganda = { sops: [] };
    if (!s.xuegong.history.culture) s.xuegong.history.culture = { sops: [] };
    if (!Array.isArray(s.xuegong.history.propaganda.sops)) s.xuegong.history.propaganda.sops = [];
    if (!Array.isArray(s.xuegong.history.culture.sops)) s.xuegong.history.culture.sops = [];
    if (!s.xuegong.tourism) s.xuegong.tourism = { rows: [] };
    if (!Array.isArray(s.xuegong.tourism.rows)) s.xuegong.tourism.rows = [];
    ['propaganda', 'culture'].forEach(function (dept) {
      (s.xuegong.history[dept].sops || []).forEach(normalizeSop);
    });
  }

  /**
   * SOP shape: project → steps[] → tasks[]
   * Each step/task can have note; progress at every level.
   */
  function normalizeSop(sop) {
    if (!sop || typeof sop !== 'object') return;
    if (!Array.isArray(sop.steps) || sop._sopV < 2) {
      var migrated = [];
      if (Array.isArray(sop.blocks) && sop.blocks.length) {
        sop.blocks.forEach(function (block) {
          var tasks = (block.steps || []).map(function (st) {
            return {
              id: st.id || uid(),
              text: st.text || '',
              note: st.note || '',
              done: !!st.done
            };
          });
          migrated.push({
            id: block.id || uid(),
            title: block.title || '步骤',
            note: block.detail || '',
            tasks: tasks
          });
          (block.children || []).forEach(function (child) {
            migrated.push({
              id: child.id || uid(),
              title: child.title || '步骤',
              note: child.detail || '',
              tasks: (child.steps || []).map(function (st) {
                return {
                  id: st.id || uid(),
                  text: st.text || '',
                  note: st.note || '',
                  done: !!st.done
                };
              })
            });
          });
        });
      } else if (Array.isArray(sop.steps) && sop.steps.length && sop.steps[0] && sop.steps[0].text && !sop.steps[0].tasks) {
        // legacy flat checkbox steps
        migrated.push({
          id: uid(),
          title: '步骤',
          note: '',
          tasks: sop.steps.map(function (st) {
            return {
              id: st.id || uid(),
              text: st.text || '',
              note: st.note || '',
              done: !!st.done
            };
          })
        });
      } else if (Array.isArray(sop.steps)) {
        migrated = sop.steps;
      }
      sop.steps = migrated;
      sop._sopV = 2;
    }
    if (!Array.isArray(sop.steps)) sop.steps = [];
    if (typeof sop.note !== 'string') sop.note = '';
    sop.steps.forEach(function (step) {
      if (!step.id) step.id = uid();
      if (typeof step.title !== 'string') step.title = '步骤';
      if (typeof step.note !== 'string') step.note = '';
      if (!Array.isArray(step.tasks)) step.tasks = [];
      step.tasks.forEach(function (task) {
        if (!task.id) task.id = uid();
        if (typeof task.text !== 'string') task.text = '';
        if (typeof task.note !== 'string') task.note = '';
        task.done = !!task.done;
      });
    });
  }

  function findSop(dept, sopId) {
    return (state.xuegong.history[dept].sops || []).find(function (s) { return s.id === sopId; });
  }

  function findSopStep(sop, stepId) {
    if (!sop || !sop.steps) return null;
    return sop.steps.find(function (s) { return s.id === stepId; }) || null;
  }

  function findSopTask(step, taskId) {
    if (!step || !step.tasks) return null;
    return step.tasks.find(function (t) { return t.id === taskId; }) || null;
  }

  function collectSopTasks(sop) {
    var all = [];
    (sop.steps || []).forEach(function (step) {
      (step.tasks || []).forEach(function (t) { all.push(t); });
    });
    return all;
  }

  function pctOf(done, total) {
    if (!total) return 0;
    return Math.round(done / total * 100);
  }

  function sopStepProgress(step) {
    var tasks = step.tasks || [];
    var done = tasks.filter(function (t) { return t.done; }).length;
    return { done: done, total: tasks.length, pct: pctOf(done, tasks.length) };
  }

  function sopProjectProgress(sop) {
    normalizeSop(sop);
    var tasks = collectSopTasks(sop);
    var done = tasks.filter(function (t) { return t.done; }).length;
    return { done: done, total: tasks.length, pct: pctOf(done, tasks.length) };
  }

  function renderProgressBar(pct, label) {
    return '<div class="sop-progress-row">' +
      '<div class="progress-bar"><div style="width:' + pct + '%"></div></div>' +
      '<span class="muted sop-progress-label">' + (label || (pct + '%')) + '</span></div>';
  }

  function ensureShopping(s) {
    if (!s.shopping || typeof s.shopping !== 'object') s.shopping = { modules: [] };
    if (!Array.isArray(s.shopping.modules)) s.shopping.modules = [];
    s.shopping.modules.forEach(function (mod) {
      if (!mod.id) mod.id = uid();
      if (typeof mod.title !== 'string') mod.title = '模块';
      if (typeof mod.note !== 'string') mod.note = '';
      if (!Array.isArray(mod.lists)) mod.lists = [];
      mod.lists.forEach(function (list) {
        if (!list.id) list.id = uid();
        if (typeof list.title !== 'string') list.title = '清单';
        if (typeof list.note !== 'string') list.note = '';
        if (!Array.isArray(list.items)) list.items = [];
        list.items.forEach(function (it) {
          if (!it.id) it.id = uid();
          if (typeof it.name !== 'string') it.name = '';
          if (it.qty == null) it.qty = '';
          if (it.unit == null) it.unit = '';
          if (typeof it.price !== 'number') it.price = parseFloat(it.price) || 0;
          it.bought = !!it.bought;
          if (it.moneyId == null) it.moneyId = '';
          if (it.note == null) it.note = '';
        });
      });
    });
  }

  function findShopModule(modId) {
    ensureShopping(state);
    return (state.shopping.modules || []).find(function (m) { return m.id === modId; }) || null;
  }

  function findShopList(modId, listId) {
    var mod = findShopModule(modId);
    if (!mod) return null;
    return (mod.lists || []).find(function (l) { return l.id === listId; }) || null;
  }

  function findShopItem(modId, listId, itemId) {
    var list = findShopList(modId, listId);
    if (!list) return null;
    return (list.items || []).find(function (i) { return i.id === itemId; }) || null;
  }

  function isWorkProjectComplete(p) {
    var tasks = (p && p.tasks) || [];
    if (!tasks.length) return false;
    return tasks.every(function (t) { return !!t.done; });
  }

  function isSopProjectComplete(sop) {
    normalizeSop(sop);
    var prog = sopProjectProgress(sop);
    return prog.total > 0 && prog.done >= prog.total;
  }

  function ensureAll(s) {
    ensureScraps(s);
    ensureSchedule(s);
    ensureMoney(s);
    ensureHealth(s);
    ensureHobby(s);
    ensureStudy(s);
    ensureWork(s);
    ensureLang(s);
    ensureShopping(s);
    ensureXuegong(s);
    if (!s.settings) s.settings = { name: '小鱼' };
  }

  function save(opts) {
    opts = opts || {};
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      flash('保存失败');
      return;
    }
    if (opts.skipCloud) return;
    if (_cloudSkipPush) {
      _cloudSkipPush = false;
      return;
    }
    if (_sbUser) {
      var meta = loadSyncMeta();
      meta.dirty = true;
      meta.updatedAt = new Date().toISOString();
      meta.lastError = '';
      saveSyncMeta(meta);
      scheduleCloudPush();
    }
  }

  var _sbClient = null;
  var _sbUser = null;
  var _cloudPushTimer = null;
  var _cloudBusy = false;
  var _cloudSkipPush = false;

  function loadSupabaseConfig() {
    try {
      var raw = localStorage.getItem(SUPABASE_CFG_KEY);
      if (raw) {
        var c = JSON.parse(raw);
        if (c && c.url && c.anonKey) return { url: String(c.url), anonKey: String(c.anonKey) };
      }
    } catch (e) { /* ignore */ }
    var d = window.SUPABASE_DEFAULTS || {};
    return { url: d.url || '', anonKey: d.anonKey || '' };
  }

  function saveSupabaseConfigObj(cfg) {
    localStorage.setItem(SUPABASE_CFG_KEY, JSON.stringify({
      url: (cfg.url || '').trim(),
      anonKey: (cfg.anonKey || '').trim()
    }));
    _sbClient = null;
  }

  function loadSyncMeta() {
    try {
      var raw = localStorage.getItem(SYNC_META_KEY);
      if (raw) {
        var m = JSON.parse(raw);
        if (m && typeof m === 'object') return m;
      }
    } catch (e) { /* ignore */ }
    return {
      dirty: false,
      updatedAt: '',
      remoteUpdatedAt: '',
      revision: 0,
      lastPushAt: '',
      lastPullAt: '',
      lastError: '',
      userEmail: '',
      conflict: null
    };
  }

  function saveSyncMeta(meta) {
    try {
      localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
    } catch (e) { /* ignore */ }
  }

  function getSupabaseClient() {
    if (_sbClient) return _sbClient;
    var cfg = loadSupabaseConfig();
    if (!cfg.url || !cfg.anonKey) return null;
    if (!window.supabase || typeof window.supabase.createClient !== 'function') return null;
    try {
      _sbClient = window.supabase.createClient(cfg.url, cfg.anonKey);
    } catch (e) {
      return null;
    }
    return _sbClient;
  }

  function getSyncPayload() {
    var copy = JSON.parse(JSON.stringify(state));
    Object.keys(copy).forEach(function (k) {
      if (k.charAt(0) === '_') delete copy[k];
    });
    return copy;
  }

  function applySyncedPayload(data) {
    var mod = (state && state._mod) || 'home';
    state = migrate(data);
    state._mod = mod;
    ensureAll(state);
  }

  function scheduleCloudPush() {
    if (_cloudPushTimer) clearTimeout(_cloudPushTimer);
    _cloudPushTimer = setTimeout(function () {
      _cloudPushTimer = null;
      pushCloud({}).then(function (r) {
        if (r && r.reason === 'conflict' && state._mod === 'settings') render();
        else if (r && !r.ok && r.reason === 'error') flash('云同步失败：' + (r.message || ''));
      });
    }, CLOUD_PUSH_DELAY_MS);
  }

  function pushCloud(opts) {
    opts = opts || {};
    var client = getSupabaseClient();
    if (!client || !_sbUser) {
      return Promise.resolve({ ok: false, reason: 'not_ready' });
    }
    if (_cloudBusy && !opts.force) {
      return Promise.resolve({ ok: false, reason: 'busy' });
    }
    _cloudBusy = true;
    var meta = loadSyncMeta();
    return client.from('app_snapshots')
      .select('updated_at,revision')
      .eq('user_id', _sbUser.id)
      .maybeSingle()
      .then(function (remoteRes) {
        if (remoteRes.error) throw remoteRes.error;
        var remote = remoteRes.data;
        if (remote && meta.dirty && meta.remoteUpdatedAt && !opts.resolve) {
          var remoteT = Date.parse(remote.updated_at);
          var baseT = Date.parse(meta.remoteUpdatedAt);
          if (!isNaN(remoteT) && !isNaN(baseT) && remoteT > baseT) {
            meta.conflict = {
              remoteUpdatedAt: remote.updated_at,
              localUpdatedAt: meta.updatedAt || ''
            };
            saveSyncMeta(meta);
            return { ok: false, reason: 'conflict', meta: meta };
          }
        }
        if (opts.resolve === 'remote') {
          return { ok: false, reason: 'use_pull' };
        }
        var payload = getSyncPayload();
        var now = new Date().toISOString();
        var newRev = ((remote && remote.revision) || meta.revision || 0) + 1;
        return client.from('app_snapshots').upsert({
          user_id: _sbUser.id,
          data: payload,
          updated_at: now,
          revision: newRev
        }, { onConflict: 'user_id' }).then(function (up) {
          if (up.error) throw up.error;
          meta.dirty = false;
          meta.updatedAt = now;
          meta.remoteUpdatedAt = now;
          meta.revision = newRev;
          meta.lastPushAt = now;
          meta.lastError = '';
          meta.conflict = null;
          meta.userEmail = (_sbUser.email || meta.userEmail || '');
          saveSyncMeta(meta);
          return { ok: true, revision: newRev };
        });
      })
      .catch(function (e) {
        var m = loadSyncMeta();
        m.lastError = (e && e.message) || String(e);
        saveSyncMeta(m);
        return { ok: false, reason: 'error', message: m.lastError };
      })
      .then(function (result) {
        _cloudBusy = false;
        return result;
      });
  }

  function pullCloud(opts) {
    opts = opts || {};
    var client = getSupabaseClient();
    if (!client || !_sbUser) {
      return Promise.resolve({ ok: false, reason: 'not_ready' });
    }
    if (_cloudBusy && !opts.force) {
      return Promise.resolve({ ok: false, reason: 'busy' });
    }
    _cloudBusy = true;
    var meta = loadSyncMeta();
    return client.from('app_snapshots')
      .select('data,updated_at,revision')
      .eq('user_id', _sbUser.id)
      .maybeSingle()
      .then(function (res) {
        if (res.error) throw res.error;
        if (!res.data) {
          _cloudBusy = false;
          return pushCloud({ force: true }).then(function (r) {
            return r.ok ? { ok: true, action: 'seeded' } : r;
          });
        }
        var remoteAt = res.data.updated_at;
        var remoteT = Date.parse(remoteAt);
        var localT = Date.parse(meta.updatedAt || 0);
        var baseT = Date.parse(meta.remoteUpdatedAt || 0);

        if (meta.dirty && !isNaN(remoteT) && !isNaN(baseT) && remoteT > baseT && !opts.resolve) {
          meta.conflict = {
            remoteUpdatedAt: remoteAt,
            localUpdatedAt: meta.updatedAt || ''
          };
          saveSyncMeta(meta);
          return { ok: false, reason: 'conflict', meta: meta };
        }

        if (opts.resolve === 'local') {
          _cloudBusy = false;
          return pushCloud({ force: true, resolve: 'local' });
        }

        var shouldApply = opts.resolve === 'remote' || opts.forceApply ||
          isNaN(localT) || remoteT >= localT || !meta.dirty;

        if (shouldApply) {
          _cloudSkipPush = true;
          applySyncedPayload(res.data.data);
          save({ skipCloud: true });
          meta.dirty = false;
          meta.updatedAt = remoteAt;
          meta.remoteUpdatedAt = remoteAt;
          meta.revision = res.data.revision || 0;
          meta.lastPullAt = new Date().toISOString();
          meta.lastError = '';
          meta.conflict = null;
          meta.userEmail = (_sbUser.email || meta.userEmail || '');
          saveSyncMeta(meta);
          return { ok: true, action: 'applied' };
        }

        scheduleCloudPush();
        return { ok: true, action: 'kept_local' };
      })
      .catch(function (e) {
        var m = loadSyncMeta();
        m.lastError = (e && e.message) || String(e);
        saveSyncMeta(m);
        return { ok: false, reason: 'error', message: m.lastError };
      })
      .then(function (result) {
        _cloudBusy = false;
        return result;
      });
  }

  function initCloudSync() {
    var client = getSupabaseClient();
    if (!client) return Promise.resolve();
    return client.auth.getSession().then(function (sess) {
      _sbUser = (sess.data && sess.data.session && sess.data.session.user) || null;
      if (_sbUser) {
        var meta = loadSyncMeta();
        meta.userEmail = _sbUser.email || meta.userEmail || '';
        saveSyncMeta(meta);
        return pullCloud({ force: true }).then(function (r) {
          if (r && r.ok && r.action === 'applied') render();
          else if (r && r.reason === 'conflict') render();
          else if (r && !r.ok && r.reason === 'error') flash('拉取云端失败：' + (r.message || ''));
        });
      }
    }).catch(function () { /* offline / misconfig */ });
  }

  function cloudStatusText() {
    var cfg = loadSupabaseConfig();
    if (!cfg.url || !cfg.anonKey) return '未配置 Supabase';
    if (!window.supabase) return '同步库未加载（检查网络）';
    if (!_sbUser) return '未登录';
    var meta = loadSyncMeta();
    if (meta.conflict) return '存在冲突，请选择保留哪一侧';
    if (meta.dirty) return '有未上传的本地更改…';
    if (meta.lastError) return '上次出错：' + meta.lastError;
    if (meta.lastPushAt || meta.lastPullAt) {
      return '已同步 · 修订 ' + (meta.revision || 0);
    }
    return '已登录，等待首次同步';
  }

  function load() {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      var bakEmpty = localStorage.getItem(BACKUP_KEY);
      if (bakEmpty) {
        try {
          var fromBak = JSON.parse(bakEmpty);
          state = migrate(fromBak);
          state._mod = state._mod || 'home';
          ensureAll(state);
          save();
          flash('已从备份恢复数据');
          return state;
        } catch (e2) { /* fall through to empty */ }
      }
      state = defaultState();
      state._mod = 'home';
      ensureAll(state);
      save();
      return state;
    }
    try {
      localStorage.setItem(BACKUP_KEY, raw);
    } catch (e) { /* ignore backup failure */ }
    var parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      var bak = localStorage.getItem(BACKUP_KEY);
      if (bak && bak !== raw) {
        try {
          parsed = JSON.parse(bak);
          flash('主数据损坏，已从备份读取');
        } catch (e2) {
          flash('数据解析失败，请用设置页导入备份 JSON');
          state = { __corrupt: true, _raw: raw, _mod: 'settings' };
          return state;
        }
      } else {
        flash('数据解析失败，请用设置页导入备份 JSON');
        state = { __corrupt: true, _raw: raw, _mod: 'settings' };
        return state;
      }
    }
    var before = parsed;
    try {
      state = migrate(parsed);
    } catch (e) {
      state = before && typeof before === 'object' ? before : parsed;
      flash('迁移异常，已保留原始数据');
    }
    state._mod = state._mod || 'home';
    ensureAll(state);
    save();
    return state;
  }

  function parseImportLines(text) {
    if (!text) return [];
    var lines = text.split(/\r?\n/);
    if (lines.length && /title|weekday|date|name|account|amount|cat|header|标题|日期/i.test(lines[0])) {
      lines = lines.slice(1);
    }
    return lines.map(function (l) { return l.trim(); }).filter(Boolean);
  }

  function autoTags(text) {
    var tags = [];
    var lower = text.toLowerCase();
    Object.keys(TAG_KEYWORDS).forEach(function (mod) {
      TAG_KEYWORDS[mod].forEach(function (kw) {
        if (lower.indexOf(kw.toLowerCase()) >= 0 && tags.indexOf(mod) < 0) tags.push(mod);
      });
    });
    return tags;
  }

  function addDays(dateStr, n) {
    var p = dateStr.split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    d.setDate(d.getDate() + n);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function daysBetween(a, b) {
    var pa = a.split('-'), pb = b.split('-');
    var da = new Date(+pa[0], +pa[1] - 1, +pa[2]);
    var db = new Date(+pb[0], +pb[1] - 1, +pb[2]);
    return Math.round((db - da) / 86400000);
  }

  function navigate(mod) {
    if (state && state.__corrupt) {
      state._mod = 'settings';
      render();
      return;
    }
    state._mod = mod;
    if (mod === 'schedule') state._schedTab = state._schedTab || 'month';
    if (mod === 'health') state._healthTab = state._healthTab || 'exercise';
    if (mod === 'hobby') state._hobbyTab = state._hobbyTab || 'check';
    if (mod === 'work') state._workTab = state._workTab || 'items';
    if (mod === 'xuegong') state._xgTab = state._xgTab || 'propaganda';
    if (mod === 'money') state._moneyView = state._moneyView || 'records';
    save();
    render();
  }

  function renderImportBlock(id, placeholder) {
    return '<div class="import-block">' +
      '<p class="muted">📥 导入（选 CSV 文件 或 粘贴文本）</p>' +
      '<input type="file" accept=".csv,.txt,.json" id="' + id + '-file" style="display:none">' +
      '<button type="button" onclick="App.pickImportFile(\'' + id + '\')">选 CSV 文件</button> ' +
      '<textarea id="' + id + '-ta" rows="3" placeholder="' + esc(placeholder) + '"></textarea> ' +
      '<button type="button" onclick="App.doImport(\'' + id + '\')">导入</button></div>';
  }

  function getUpcomingDdls(days) {
    var today = todayStr();
    var end = addDays(today, days || 14);
    return state.schedule.events.filter(function (e) {
      return e.type === 'ddl' && e.date >= today && e.date <= end;
    }).sort(function (a, b) { return a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''); });
  }

  function predictNextPeriod() {
    var stats = computePeriodStats();
    var last = latestPeriodStart();
    if (!last) return null;
    var next = addDays(last, stats.cycleLen || 28);
    var daysUntil = daysBetween(todayStr(), next);
    return {
      next: next,
      daysUntil: daysUntil,
      last: last,
      cycleLen: stats.cycleLen,
      periodLen: stats.periodLen,
      stats: stats
    };
  }

  function daySeed(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  function getDailyQuotes(count) {
    var n = count || 5;
    var seed = daySeed(todayStr());
    var pool = DAILY_QUOTES.slice();
    var picked = [];
    var i;
    for (i = 0; i < n && pool.length; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      var idx = seed % pool.length;
      picked.push(pool.splice(idx, 1)[0]);
    }
    return picked;
  }

  function renderHome() {
    var ddls = getUpcomingDdls(14);
    var period = predictNextPeriod();
    var scraps = state.scraps.slice().sort(function (a, b) { return (b.at || '').localeCompare(a.at || ''); });
    var ddlHtml = ddls.length ? ddls.slice(0, 2).map(function (e) {
      return '<li>' + esc(e.date) + ' ' + esc(e.title) + '</li>';
    }).join('') : '<li>暂无近14天</li>';
    var periodHtml = period
      ? '<p>预计下次：' + esc(period.next) + '（' + period.daysUntil + '天后）</p>'
      : '<p>请设置上次经期开始日</p>';
    var scrapList = scraps.map(function (s) {
      var tagStr = (s.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('');
      return '<label class="scrap-item' + (s.done ? ' is-done' : '') + '" data-id="' + s.id + '">' +
        '<input type="checkbox" class="scrap-check" ' + (s.done ? 'checked' : '') +
        ' onchange="App.toggleScrapDone(\'' + s.id + '\')">' +
        '<span class="scrap-body"><span class="scrap-text">' + esc(s.text) + '</span>' +
        (tagStr ? '<span class="meta">' + tagStr + '</span>' : '') + '</span></label>';
    }).join('') || '<p class="empty scrap-empty">暂无碎片</p>';
    var studyLeft = ((state.study && state.study.tasks) || []).filter(function (t) { return !t.done; }).length;
    var quotes = getDailyQuotes(6);
    var quoteTrack = quotes.concat(quotes).map(function (q) {
      return '<span class="quote-item">✦ ' + esc(q) + '</span>';
    }).join('');
    document.getElementById('page').innerHTML =
      '<div class="home-page">' +
      '<div class="home-head">' +
      '<h2 class="home-title">你好，' + esc((state.settings && state.settings.name) || '小鱼') + '</h2>' +
      '<div class="quote-marquee" aria-label="今日寄语"><div class="quote-track">' + quoteTrack + '</div></div>' +
      '</div>' +
      '<section class="card scrap-bar">' +
      '<h3 class="scrap-title">💡 碎片·随手记</h3>' +
      '<div class="scrap-input">' +
      '<input class="input" id="scrap-text" placeholder="随手记一件事…" autocomplete="off">' +
      '<button type="button" class="btn scrap-add" onclick="App.addScrap()">记下</button></div>' +
      '<div class="scrap-list">' + scrapList + '</div></section>' +
      '<div class="cards-agg">' +
      '<button type="button" class="card clickable agg-card" onclick="App.navigate(\'schedule\')">' +
      '<h3>ddl提醒</h3><div class="agg-body"><ul class="agg-list">' + ddlHtml + '</ul></div></button>' +
      '<button type="button" class="card clickable agg-card" onclick="App.navigate(\'health\')">' +
      '<h3>经期提醒</h3><div class="agg-body">' + periodHtml + '</div></button>' +
      '<button type="button" class="card clickable agg-card" onclick="App.navigate(\'study\')">' +
      '<h3>今日学习</h3><div class="agg-body"><p>待办 ' + studyLeft + ' · 课程 ' +
      ((state.study && state.study.courses) || []).length + '</p></div></button></div>' +
      '<section class="home-todos"><h3>待办列表</h3>' + renderSchedTodos(true) + '</section></div>';
  }

  function renderSchedule() {
    var tab = state._schedTab || 'month';
    var pinTabs = [
      { id: 'month', label: '月计划' },
      { id: 'week', label: '周计划' },
      { id: 'day', label: '日计划' }
    ];
    var moreTabs = [
      { id: 'classes', label: '循环日常' },
      { id: 'todos', label: '待办' }
    ];
    var pinHtml = pinTabs.map(function (t) {
      return '<button type="button" class="sched-pin' + (tab === t.id ? ' active' : '') + '" onclick="App.setSchedTab(\'' + t.id + '\')">' + t.label + '</button>';
    }).join('');
    if (tab === 'day') {
      pinHtml += '<button type="button" class="btn sched-today-btn" onclick="App.goSchedToday()">回到今天</button>';
    }
    var moreHtml = moreTabs.map(function (t) {
      return '<button type="button" class="tab' + (tab === t.id ? ' active' : '') + '" onclick="App.setSchedTab(\'' + t.id + '\')">' + t.label + '</button>';
    }).join('');
    var body = '';
    if (tab === 'month') body = renderSchedMonth();
    else if (tab === 'week') body = renderSchedWeek();
    else if (tab === 'day') body = renderSchedDay();
    else if (tab === 'classes') body = renderSchedClasses();
    else body = renderSchedTodos();
    document.getElementById('page').innerHTML =
      '<div class="sched-page">' +
      '<div class="sched-sticky">' +
      '<h2>日程</h2>' +
      '<div class="sched-pin-row">' + pinHtml + '</div>' +
      '<div class="tabs sched-more-tabs">' + moreHtml + '</div>' +
      '</div>' + body + '</div>';
    if (tab === 'day') { wireDayTimeline(); if (dayViewMode === 'timeline') scrollDayTimelineToFocus(); }
  }

  var dayViewMode = 'timeline';
  function renderDayControls(ds, events, routines) {
    var first=mondayOf(ds), dates=weekDates(first);
    var strip=dates.map(function(d){
      return '<button type="button" class="day-date-chip'+(d===ds?' selected':'')+'" onclick="App.setSchedDay(\''+d+'\')"><span>周'+WEEKDAYS[new Date(d+'T12:00:00').getDay()]+'</span><strong>'+Number(d.slice(-2))+'</strong></button>';
    }).join('');
    var entries=events.map(function(e){return {id:e.id,title:e.title,time:e.time,end:e.endTime,kind:e.kind,urgent:e.urgency==='urgent',source:'delEvent'};})
      .concat(routines.map(function(c){return {id:c.id,title:c.title,time:c.start,end:c.end,kind:c.kind,source:'delClass'};}))
      .sort(function(a,b){return (a.time||'99').localeCompare(b.time||'99');});
    var allDay=state.schedule.events.filter(function(e){return e.date===ds&&(e.type==='ddl'||e.type==='special');});
    var list=entries.map(function(e){
      return '<button type="button" class="day-agenda-entry" onclick="App.editScheduleRecord(\''+e.source+'\',\''+e.id+'\')"><span class="agenda-time">'+esc(e.time||'未定时')+(e.end?'<small>'+esc(e.end)+'</small>':'')+'</span><span><strong>'+esc(e.title)+'</strong><small>'+esc(e.kind||'其他')+(e.urgent?' · 紧急':'')+'</small></span><span class="agenda-edit">编辑 ›</span></button>';
    }).join('')||'<p class="empty">今天还没有安排，点「添加」开始吧</p>';
    return '<div class="day-date-strip">'+strip+'</div><div class="day-view-controls"><span class="muted">'+entries.length+' 项安排</span><button type="button" onclick="App.setDayView(\'timeline\')" aria-pressed="'+(dayViewMode==='timeline')+'">时间轴</button><button type="button" onclick="App.setDayView(\'agenda\')" aria-pressed="'+(dayViewMode==='agenda')+'">清单</button><button type="button" onclick="App.focusDayNow()">现在</button><button type="button" onclick="App.quickAddDay()">＋ 添加</button></div>'+
      (allDay.length?'<div class="day-all-day">'+allDay.map(function(e){return '<button type="button" onclick="App.editScheduleRecord(\'delEvent\',\''+e.id+'\')">'+(e.type==='ddl'?'DDL · ':'特殊日期 · ')+esc(e.title)+'</button>';}).join('')+'</div>':'')+
      '<section class="card day-agenda"'+(dayViewMode==='agenda'?'':' hidden')+'>'+list+'</section>';
  }
  function wireDayTimeline() {
    var board=document.querySelector('.tl-board'); if(board) board.hidden=dayViewMode!=='timeline';
    var track=document.querySelector('.tl-track');
    if (!track) return;
    track.addEventListener('click',function(e){
      var block=e.target.closest('.tl-block');
      if(block){
        if(e.target.closest('button')) return;
        App.editScheduleRecord(block.dataset.recordSource === 'class' ? 'delClass' : 'delEvent',block.dataset.recordId); return;
      }
      var rect=track.getBoundingClientRect();
      var mins=Math.min(1410,Math.max(360,Math.round((e.clientY-rect.top)/rect.height*1080/30)*30+360));
      App.quickAddDay(mins);
    });
    if((state._schedDay||todayStr())===todayStr()){
      var now=new Date(), m=now.getHours()*60+now.getMinutes();
      if(m>=360&&m<=1440){var line=document.createElement('div');line.className='day-now-line';line.style.top=((m-360)/1080*100)+'%';line.textContent='现在 '+minsToLabel(m);track.appendChild(line);}
    }
  }
  function currentSchedMonth() {
    if (state._schedMonth && /^\d{4}-\d{2}$/.test(state._schedMonth)) return state._schedMonth;
    var t = todayStr();
    return t.slice(0, 7);
  }

  function renderSchedMonth() {
    var monthStr = currentSchedMonth();
    var parts = monthStr.split('-');
    var y = +parts[0], m = +parts[1] - 1;
    var first = new Date(y, m, 1);
    var startWd = (first.getDay() + 6) % 7; // 周一为首
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var eventsByDate = {};
    state.schedule.events.forEach(function (e) {
      if (!e.date || e.date.indexOf(monthStr) !== 0) return;
      if (e.type !== 'ddl' && e.type !== 'special') return;
      if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
      eventsByDate[e.date].push(e);
    });
    var wdHeads = ['一', '二', '三', '四', '五', '六', '日'].map(function (w) {
      return '<div class="cal-wd">' + w + '</div>';
    }).join('');
    var cells = '';
    for (var i = 0; i < startWd; i++) cells += '<div class="cal-empty"></div>';
    for (var d = 1; d <= daysInMonth; d++) {
      var ds = monthStr + '-' + String(d).padStart(2, '0');
      var evs = eventsByDate[ds] || [];
      var ddls = evs.filter(function (e) { return e.type === 'ddl'; });
      var specs = evs.filter(function (e) { return e.type === 'special'; });
      var hasDdl = ddls.length > 0;
      var hasSpec = specs.length > 0;
      var cls = 'cal-day' + (ds === todayStr() ? ' today' : '') +
        (hasDdl ? ' has-ddl' : '') + (hasSpec ? ' has-special' : '');
      var chips = '';
      ddls.slice(0, 2).forEach(function (e) {
        chips += '<span class="cal-chip ddl" title="' + esc(e.title) + '">' + esc(e.title) + '</span>';
      });
      specs.slice(0, 2).forEach(function (e) {
        chips += '<span class="cal-chip special" title="' + esc(e.title) + '">' + esc(e.title) + '</span>';
      });
      cells += '<div class="' + cls + '" data-date="' + ds + '" onclick="App.setMonthPick(\'' + ds + '\')">' +
        '<span class="num">' + d + '</span><div class="cal-chips">' + chips + '</div></div>';
    }
    var pick = state._monthPick || todayStr();
    if (pick.indexOf(monthStr) !== 0) pick = monthStr + '-01';
    var monthItems = state.schedule.events.filter(function (e) {
      return e.date && e.date.indexOf(monthStr) === 0 && (e.type === 'ddl' || e.type === 'special');
    }).sort(function (a, b) { return a.date.localeCompare(b.date); });
    var listHtml = monthItems.map(function (e) {
      var label = e.type === 'ddl' ? 'DDL' : '特殊';
      return '<div class="month-item"><span class="pill ' + (e.type === 'ddl' ? 'ddl' : 'accent2') + '">' + label + '</span> ' +
        esc(e.date) + ' · ' + esc(e.title) +
        ' <button type="button" class="btn-ghost" onclick="App.delEvent(\'' + e.id + '\')">移除</button></div>';
    }).join('') || '<p class="empty scrap-empty">本月还没有 DDL / 特殊日期</p>';

    return '<div class="month-wrap">' +
      '<div class="cal-fish-deco" aria-hidden="true">' +
      '<span class="swim-fish f1">🐟</span><span class="swim-fish f2">🐠</span><span class="swim-fish f3">🐟</span>' +
      '</div>' +
      '<div class="cal-toolbar">' +
      '<button type="button" class="btn-ghost" onclick="App.shiftMonth(-1)">‹ 上月</button>' +
      '<div class="cal-head">' + y + '年' + (m + 1) + '月</div>' +
      '<button type="button" class="btn-ghost" onclick="App.shiftMonth(1)">下月 ›</button></div>' +
      '<div class="cal-board card">' +
      '<div class="cal-grid">' + wdHeads + cells + '</div></div>' +
      '<section class="card month-add">' +
      '<h3>添加 DDL / 特殊日期</h3>' +
      '<div class="form-row">' +
      '<input id="mon-title" class="input" placeholder="内容标题">' +
      '<input id="mon-date" class="input" type="date" value="' + pick + '">' +
      '<select id="mon-type" class="input">' +
      '<option value="ddl">DDL</option><option value="special">特殊日期</option></select>' +
      '<input id="mon-note" class="input" placeholder="备注（可选）">' +
      '<button type="button" class="btn" onclick="App.addMonthItem()">添加</button></div>' +
      '<p class="muted month-hint">日历格内仅展示这两类：DDL 与特殊日期</p>' +
      '<div class="month-list">' + listHtml + '</div></section></div>';
  }

  function mondayOf(dateStr) {
    var p = (dateStr || todayStr()).split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    var wd = d.getDay();
    d.setDate(d.getDate() - ((wd + 6) % 7));
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function weekDates(mondayStr) {
    var p = mondayStr.split('-');
    var mon = new Date(+p[0], +p[1] - 1, +p[2]);
    var out = [];
    for (var i = 0; i < 7; i++) {
      var d = new Date(mon);
      d.setDate(mon.getDate() + i);
      out.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'));
    }
    return out;
  }

  function slotFromTime(t) {
    var h = parseInt(String(t || '0').split(':')[0], 10);
    if (isNaN(h)) h = 0;
    if (h < 12) return 'am';
    if (h < 18) return 'noon';
    return 'pm';
  }

  var SLOT_LABELS = { am: '上午', noon: '中午', pm: '晚上' };
  var SLOT_ORDER = ['am', 'noon', 'pm'];

  var DEFAULT_DAY_TYPES = [
    { name: '课程', color: '#A8C5B8' },
    { name: '学习', color: '#A3B8C8' },
    { name: '工作', color: '#D4B5A8' },
    { name: '生活', color: '#C9B896' },
    { name: '运动', color: '#7EB8A8' },
    { name: '其他', color: '#B5B0A8' }
  ];

  var MORANDI_PALETTE = [
    { hex: '#A8C5B8', name: '豆青' },
    { hex: '#A3B8C8', name: '雾蓝' },
    { hex: '#D4B5A8', name: '藕粉' },
    { hex: '#C9B896', name: '浅卡其' },
    { hex: '#C4A8B8', name: '淡紫灰' },
    { hex: '#B8B5C9', name: '雾紫' },
    { hex: '#B5C9A8', name: '抹茶' },
    { hex: '#C8C3A3', name: '沙色' },
    { hex: '#D4A8A8', name: '豆沙' },
    { hex: '#A8C4C4', name: '青灰' },
    { hex: '#C9B8A8', name: '奶茶' },
    { hex: '#B5A8C4', name: '藕紫' },
    { hex: '#A8B8A3', name: '鼠尾草' },
    { hex: '#C4C8B5', name: '亚麻' },
    { hex: '#D4C4A8', name: '香槟' },
    { hex: '#A8B5C4', name: '烟灰蓝' },
    { hex: '#C8A8B5', name: '玫瑰灰' },
    { hex: '#B8C4C8', name: '浅天蓝' },
    { hex: '#C4B5A3', name: '燕麦' },
    { hex: '#A3C4B8', name: '薄荷绿' },
    { hex: '#B8A8A3', name: '暖灰' },
    { hex: '#C8B5C4', name: '丁香' },
    { hex: '#A8A3B5', name: '蓝灰紫' },
    { hex: '#B5C4A8', name: '嫩芽' }
  ];

  function selectedTypeColor() {
    var cur = state._dayTypeColor || MORANDI_PALETTE[0].hex;
    for (var i = 0; i < MORANDI_PALETTE.length; i++) {
      if (MORANDI_PALETTE[i].hex.toLowerCase() === String(cur).toLowerCase()) return MORANDI_PALETTE[i].hex;
    }
    return MORANDI_PALETTE[0].hex;
  }

  function selectedTypeColorName() {
    var hex = selectedTypeColor().toLowerCase();
    for (var i = 0; i < MORANDI_PALETTE.length; i++) {
      if (MORANDI_PALETTE[i].hex.toLowerCase() === hex) return MORANDI_PALETTE[i].name;
    }
    return MORANDI_PALETTE[0].name;
  }

  function normalizeDayTypes(list) {
    var out = [];
    var seen = {};
    (Array.isArray(list) ? list : []).forEach(function (t) {
      var name = '';
      var color = '#7aada0';
      if (typeof t === 'string') {
        name = t.trim();
      } else if (t && typeof t === 'object') {
        name = String(t.name || '').trim();
        color = t.color || color;
      }
      if (!name || seen[name]) return;
      seen[name] = 1;
      out.push({ name: name, color: color });
    });
    if (!out.length) {
      out = DEFAULT_DAY_TYPES.map(function (t) { return { name: t.name, color: t.color }; });
      seen = { '课程': 1 };
    }
    if (!seen['课程']) out.unshift({ name: '课程', color: '#A8C5B8' });
    if (!seen['运动']) out.push({ name: '运动', color: '#7EB8A8' });
    if (!seen['学工']) out.push({ name: '学工', color: '#98A8B8' });
    return out;
  }

  function typeColor(name) {
    var types = normalizeDayTypes(state.schedule && state.schedule.dayTypes);
    for (var i = 0; i < types.length; i++) {
      if (types[i].name === name) return types[i].color;
    }
    if (name === '课程') return '#A8C5B8';
    return '#B5B0A8';
  }

  function softBg(hex, alpha) {
    var h = String(hex || '#7aada0').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var r = parseInt(h.slice(0, 2), 16) || 122;
    var g = parseInt(h.slice(2, 4), 16) || 173;
    var b = parseInt(h.slice(4, 6), 16) || 160;
    var a = alpha == null ? 0.22 : alpha;
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }

  function to2hNode(h) {
    if (h < 0) return -1;
    if (h <= 6) return 6;
    if (h >= 24) return 24;
    return h - ((h - 6) % 2);
  }

  function renderSchedWeek() {
    ensureSchedule(state);
    var weekKey = state._weekKey || mondayOf(todayStr());
    state._weekKey = weekKey;
    var allDates = weekDates(weekKey);
    var today = todayStr();
    var futureOrToday = allDates.filter(function (ds) { return ds >= today; });
    var pastDates = allDates.filter(function (ds) { return ds < today; });
    var autoDefault = futureOrToday.length ? futureOrToday.length : allDates.length;
    var want = parseInt(state._weekDays, 10);
    if (!want || want < 1) want = autoDefault;
    if (want > allDates.length) want = allDates.length;
    state._weekDays = want;

    var dates;
    var includedPast = 0;
    if (!futureOrToday.length) {
      // 整周已过：从周一开始取 want 天，便于回顾
      dates = allDates.slice(0, want);
      includedPast = dates.length;
    } else if (want <= futureOrToday.length) {
      // 默认：只看今天及以后
      dates = futureOrToday.slice(0, want);
    } else {
      // 选的天数超过剩余 → 把已隐藏的过往天补回来（从最近的昨天往前补）
      includedPast = want - futureOrToday.length;
      var pastPart = pastDates.slice(pastDates.length - includedPast);
      dates = pastPart.concat(futureOrToday);
    }

    var weekMeta = normalizeWeekMeta(state.schedule.weeks[weekKey]);
    state.schedule.weeks[weekKey] = weekMeta;
    var hiddenNow = pastDates.length - includedPast;
    if (hiddenNow < 0) hiddenNow = 0;

    var dayOpts = '';
    for (var n = 1; n <= allDates.length; n++) {
      var extra = '';
      if (futureOrToday.length && n > futureOrToday.length) {
        extra = '（含已过 ' + (n - futureOrToday.length) + ' 天）';
      } else if (!futureOrToday.length) {
        extra = '（回顾）';
      }
      dayOpts += '<option value="' + n + '"' + (n === want ? ' selected' : '') + '>看 ' + n + ' 天' + extra + '</option>';
    }

    var head = '<th class="wk-slot-h">时段</th>' + dates.map(function (ds) {
      var d = new Date(ds.split('-')[0], +ds.split('-')[1] - 1, +ds.split('-')[2]);
      var isToday = ds === today;
      var isPast = ds < today;
      return '<th class="' + (isToday ? 'is-today' : '') + (isPast ? ' is-past' : '') + '">周' + WEEKDAYS[d.getDay()] +
        '<br><span class="wk-date">' + ds.slice(5) + (isPast ? ' ·已过' : '') + '</span></th>';
    }).join('');

    var rows = SLOT_ORDER.map(function (slot) {
      var cells = dates.map(function (ds) {
        var dObj = new Date(ds.split('-')[0], +ds.split('-')[1] - 1, +ds.split('-')[2]);
        var wd = dObj.getDay();
        var classItems = state.schedule.classes.filter(function (c) {
          return routineOccursOnDate(c, ds) && slotFromTime(c.start) === slot;
        }).map(function (c) {
          var tip = routineModeLabel(c.mode) + ' · ' + (c.start || '') + (c.end ? '-' + c.end : '') + (c.place ? ' · ' + c.place : '');
          var kind = c.kind || '课程';
          var col = typeColor(kind);
          return '<div class="wk-chip class" title="' + esc(tip) + '" style="background:' + softBg(col) + ';color:' + col + ';border:1px dashed ' + col + '">' +
            '<span class="wk-k">' + esc(kind) + '</span> ' + esc(c.title) +
            (c.start ? '<span class="wk-time">' + esc(c.start) + '</span>' : '') + '</div>';
        }).join('');
        var planItems = state.schedule.events.filter(function (e) {
          return isPlanEvent(e) && e.date === ds && slotFromTime(e.time || '09:00') === slot;
        }).map(function (e) {
          var col = typeColor(e.kind || '其他');
          var border = e.urgency === 'urgent' ? ('2px solid ' + col) : ('2px dashed ' + col);
          return '<div class="wk-chip plan" style="background:' + softBg(col) + ';color:' + col + ';border:' + border + '">' +
            '<span class="wk-k">' + esc(e.kind || '计划') + '</span> ' + esc(e.title) +
            (e.time ? '<span class="wk-time">' + esc(e.time) + '</span>' : '') +
            '<button type="button" class="wk-x" onclick="event.stopPropagation();App.delEvent(\'' + e.id + '\')">×</button></div>';
        }).join('');
        return '<td class="' + (ds === today ? 'is-today' : '') + (ds < today ? ' is-past' : '') + '"><div class="wk-cell">' +
          (classItems + planItems || '<span class="wk-empty">·</span>') + '</div></td>';
      }).join('');
      return '<tr><th class="wk-slot">' + SLOT_LABELS[slot] + '</th>' + cells + '</tr>';
    }).join('');

    var typeOptsWeek = normalizeDayTypes(state.schedule.dayTypes).map(function (t) {
      return '<option value="' + esc(t.name) + '">' + esc(t.name) + '</option>';
    }).join('');

    var rangeLabel = dates.length
      ? (dates[0].slice(5) + (dates.length > 1 ? ' ～ ' + dates[dates.length - 1].slice(5) : ''))
      : '';
    var tipBits = [];
    if (hiddenNow) tipBits.push('已隐藏今天以前 ' + hiddenNow + ' 天');
    if (includedPast && futureOrToday.length) tipBits.push('已展开已过 ' + includedPast + ' 天');
    tipBits.push('当前 ' + dates.length + ' 天（' + rangeLabel + '）');
    tipBits.push('与日计划数据互通');

    return '<div class="week-wrap">' +
      '<div class="cal-toolbar week-toolbar">' +
      '<button type="button" class="btn-ghost" onclick="App.shiftWeek(-1)">‹ 上周</button>' +
      '<div class="cal-head">本周 ' + allDates[0].slice(5) + ' ～ ' + allDates[6].slice(5) + '</div>' +
      '<button type="button" class="btn-ghost" onclick="App.shiftWeek(1)">下周 ›</button></div>' +
      '<div class="week-view-bar">' +
      '<label class="week-days-pick">显示 <select id="week-days" class="input" onchange="App.setWeekDays(this.value)">' + dayOpts + '</select></label>' +
      '<span class="muted week-tip">' + tipBits.join(' · ') + '</span></div>' +
      '<div class="week-scroll card">' +
      '<table class="week-table" style="min-width:' + (120 + dates.length * 100) + 'px"><thead><tr>' + head + '</tr></thead><tbody>' + rows + '</tbody></table></div>' +

      '<section class="card week-add">' +
      '<h3>添加计划（同步到日计划）</h3>' +
      '<p class="muted month-hint">类型与紧急程度与日计划一致，一处添加两处可见。</p>' +
      '<div class="form-row">' +
      '<select id="wp-date" class="input">' + dates.map(function (ds) {
        var d = new Date(ds.split('-')[0], +ds.split('-')[1] - 1, +ds.split('-')[2]);
        return '<option value="' + ds + '"' + (ds === today ? ' selected' : '') + '>周' + WEEKDAYS[d.getDay()] + ' ' + ds + (ds < today ? ' ·已过' : '') + '</option>';
      }).join('') + '</select>' +
      '<select id="wp-slot" class="input">' +
      '<option value="am">上午</option><option value="noon">中午</option><option value="pm">晚上</option></select>' +
      '<select id="wp-kind" class="input">' + typeOptsWeek + '</select>' +
      '<select id="wp-urgency" class="input">' +
      '<option value="normal">普通</option><option value="urgent">紧急</option></select>' +
      '<input id="wp-title" class="input" placeholder="计划内容">' +
      '<button type="button" class="btn" onclick="App.addWeekPlan()">添加计划</button></div></section>' +

      '<section class="card week-reflect-view">' +
      '<h3>本周目标与总结</h3>' +
      '<div class="wk-view-block">' +
      '<div class="wk-view-head"><span class="wk-lab">本周目标</span></div>' +
      (weekMeta.goals.length
        ? '<ul class="wk-goal-list">' + weekMeta.goals.map(function (g) {
          return '<li class="wk-goal-item">' +
            '<span class="wk-goal-text">' + esc(g.text) + '</span>' +
            '<button type="button" class="btn-ghost wk-clear" onclick="App.removeWeekGoal(\'' + g.id + '\')">清除</button></li>';
        }).join('') + '</ul>'
        : '<p class="muted wk-view-empty">还没有目标，请在下方逐条添加</p>') +
      '</div>' +
      '<div class="wk-view-block">' +
      '<div class="wk-view-head"><span class="wk-lab">本周总结</span>' +
      (weekMeta.summary ? '<button type="button" class="btn-ghost wk-clear" onclick="App.clearWeekField(\'summary\')">清除</button>' : '') +
      '</div>' +
      (weekMeta.summary
        ? '<p class="wk-view-text">' + esc(weekMeta.summary).replace(/\n/g, '<br>') + '</p>'
        : '<p class="muted wk-view-empty">还没有总结</p>') +
      '</div></section>' +

      '<section class="card week-reflect-edit">' +
      '<h3>添加本周目标</h3>' +
      '<p class="muted month-hint">每次添加一条，保存后出现在上方列表，可逐条清除。</p>' +
      '<div class="form-row">' +
      '<input id="week-goal-one" class="input" placeholder="一条目标…">' +
      '<button type="button" class="btn" onclick="App.addWeekGoal()">添加目标</button></div>' +
      '<h3 class="wk-edit-sub">添加 / 修改本周总结</h3>' +
      '<textarea id="week-summary" class="textarea" rows="3" placeholder="写下本周总结…"></textarea>' +
      '<button type="button" class="btn" onclick="App.saveWeekSummary()">保存总结到上方</button></section></div>';
  }

  function hourKey(t) {
    var raw = String(t || '').trim();
    if (raw === '24:00' || raw === '24') return 24;
    var h = parseInt(raw.split(':')[0], 10);
    if (isNaN(h)) return -1;
    if (h < 0) return -1;
    if (h > 24) return 24;
    return h;
  }

  function formatHourLabel(h) {
    if (h === 24) return '24:00';
    return String(h).padStart(2, '0') + ':00';
  }

  function minsToLabel(mins) {
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    if (h >= 24 && m === 0) return '24:00';
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  }

  /** Clamp event into 6:00–24:00 day axis; default duration 60m when end missing. */
  function dayAxisSpan(startStr, endStr) {
    var DAY_START = 6 * 60;
    var DAY_END = 24 * 60;
    var a = timeToMins(startStr);
    if (a < 0) a = 9 * 60;
    var b = timeToMins(endStr);
    if (b < 0 || b <= a) b = a + 60;
    a = Math.max(DAY_START, Math.min(a, DAY_END - 15));
    b = Math.max(a + 15, Math.min(b, DAY_END));
    return { start: a, end: b, topPct: ((a - DAY_START) / (DAY_END - DAY_START)) * 100, heightPct: ((b - a) / (DAY_END - DAY_START)) * 100 };
  }

  function assignTimelineLanes(blocks) {
    var sorted = blocks.slice().sort(function (x, y) {
      if (x.start !== y.start) return x.start - y.start;
      return y.end - x.end;
    });
    var laneEnds = [];
    sorted.forEach(function (b) {
      var lane = 0;
      while (lane < laneEnds.length && laneEnds[lane] > b.start) lane++;
      b.lane = lane;
      laneEnds[lane] = b.end;
    });
    sorted.forEach(function (b) {
      var members = [b];
      var changed = true;
      while (changed) {
        changed = false;
        sorted.forEach(function (c) {
          var hit = members.some(function (m) { return c.start < m.end && c.end > m.start; });
          if (hit && members.indexOf(c) < 0) {
            members.push(c);
            changed = true;
          }
        });
      }
      var cm = 0;
      members.forEach(function (m) { if (m.lane > cm) cm = m.lane; });
      b.laneCount = cm + 1;
    });
    return sorted;
  }

  function scrollDayTimelineToFocus() {
    setTimeout(function () {
      var board = document.querySelector('.tl-board');
      var wrap = document.querySelector('.tl-scale-wrap');
      var canvas = document.querySelector('.tl-canvas');
      if (board) {
        try {
          board.scrollIntoView({ block: 'nearest', behavior: 'auto' });
        } catch (e) { /* ignore */ }
      }
      if (!wrap || !canvas) return;
      var DAY_START = 6 * 60;
      var DAY_END = 24 * 60;
      var first = wrap.querySelector('.tl-block');
      var topPx = 0;
      if (first) {
        var pct = parseFloat(String(first.style.top || '').replace('%', '')) || 0;
        topPx = (pct / 100) * canvas.offsetHeight;
      } else if ((state._schedDay || todayStr()) === todayStr()) {
        var now = new Date();
        var mins = now.getHours() * 60 + now.getMinutes();
        mins = Math.max(DAY_START, Math.min(mins, DAY_END));
        topPx = ((mins - DAY_START) / (DAY_END - DAY_START)) * canvas.offsetHeight;
      } else {
        return;
      }
      wrap.scrollTop = Math.max(0, topPx - 16);
    }, 50);
  }

  function buildDayTimelineHtml(blocks) {
    var DAY_START = 6 * 60;
    var DAY_END = 24 * 60;
    var hours = [];
    // 时间轴刻度按 2 小时一格（6, 8, …, 24）
    for (var h = 6; h <= 24; h += 2) {
      var top = ((h * 60 - DAY_START) / (DAY_END - DAY_START)) * 100;
      hours.push('<div class="tl-hour-mark major" style="top:' + top + '%">' +
        '<span class="tl-hour-lab">' + formatHourLabel(h) + '</span></div>');
    }
    var packed = assignTimelineLanes(blocks);
    var chips = packed.map(function (it) {
      var col = typeColor(it.kind);
      var border = it.urgency === 'urgent' ? ('2px solid ' + col) : ('2px dashed ' + col);
      var w = 100 / it.laneCount;
      var left = it.lane * w;
      var del = it.source === 'event'
        ? '<button type="button" class="wk-x" onclick="event.stopPropagation();App.delEvent(\'' + it.id + '\')">×</button>'
        : '';
      var timeLab = minsToLabel(it.start) + '–' + minsToLabel(it.end);
      return '<div data-record-source="' + it.source + '" data-record-id="' + esc(it.source === 'class' ? it.id.replace(/^c-/, '') : it.id) + '" class="tl-block' + (it.urgency === 'urgent' ? ' urgent' : '') + '" style="' +
        'top:' + it.topPct + '%;height:' + Math.max(it.heightPct, 2.2) + '%;' +
        'left:calc(' + left + '% + 2px);width:calc(' + w + '% - 4px);' +
        'background:' + softBg(col) + ';color:' + col + ';border:' + border + '">' +
        del +
        '<strong>' + esc(it.title) + '</strong>' +
        '<span class="tl-meta">' + esc(it.kind) + ' · ' + esc(timeLab) + '</span>' +
        '</div>';
    }).join('');

    return '<div class="tl-scale-wrap">' +
      '<div class="tl-canvas">' +
      '<div class="tl-hours">' + hours.join('') + '</div>' +
      '<div class="tl-track">' + (chips || '<p class="muted tl-empty">这一天还没有安排，添加事件后会按时间段显示在轴上</p>') + '</div>' +
      '</div></div>';
  }

  function renderSchedDay() {
    ensureSchedule(state);
    var ds = state._schedDay || todayStr();
    var wd = new Date(ds.split('-')[0], +ds.split('-')[1] - 1, +ds.split('-')[2]).getDay();
    var types = normalizeDayTypes(state.schedule.dayTypes);
    state.schedule.dayTypes = types;

    var dayEvents = state.schedule.events.filter(function (e) {
      return e.date === ds && e.type !== 'ddl' && e.type !== 'special';
    });
    var dayClasses = state.schedule.classes.filter(function (c) { return routineOccursOnDate(c, ds); });

    var classAsCards = dayClasses.map(function (c) {
      return {
        id: 'class:' + c.id,
        title: c.title,
        time: c.start || '',
        endTime: c.end || '',
        kind: c.kind || '课程',
        urgency: 'normal',
        note: [
          routineModeLabel(c.mode),
          c.place ? ('地点：' + c.place) : '',
          (c.rangeStart || c.rangeEnd) ? ('周期 ' + (c.rangeStart || '…') + '～' + (c.rangeEnd || '…')) : ''
        ].filter(Boolean).join(' · '),
        source: 'class'
      };
    });

    var timelineBlocks = [];
    dayClasses.forEach(function (c) {
      if (!c.start) return;
      var span = dayAxisSpan(c.start, c.end || '');
      timelineBlocks.push({
        id: 'c-' + c.id,
        source: 'class',
        title: c.title,
        kind: c.kind || '课程',
        urgency: 'normal',
        start: span.start,
        end: span.end,
        topPct: span.topPct,
        heightPct: span.heightPct
      });
    });
    dayEvents.forEach(function (e) {
      if (!e.time) return;
      var span = dayAxisSpan(e.time, e.endTime || '');
      timelineBlocks.push({
        id: e.id,
        source: 'event',
        title: e.title,
        kind: e.kind || '其他',
        urgency: e.urgency === 'urgent' ? 'urgent' : 'normal',
        start: span.start,
        end: span.end,
        topPct: span.topPct,
        heightPct: span.heightPct
      });
    });

    var typeOpts = types.filter(function (t) { return t.name !== '课程'; }).map(function (t) {
      return '<option value="' + esc(t.name) + '">' + esc(t.name) + '</option>';
    }).join('') + '<option value="课程">课程</option>';

    var typeList = types.map(function (t) {
      var locked = t.name === '课程';
      return '<span class="day-type-tag" style="background:' + softBg(t.color) + ';color:' + t.color + ';border:1px solid ' + t.color + '">' +
        '<span class="day-type-dot" style="background:' + t.color + '"></span>' + esc(t.name) +
        (locked ? '' : ' <button type="button" class="wk-x" onclick=\'App.removeDayType(' + JSON.stringify(t.name) + ')\'>×</button>') +
        '</span>';
    }).join('');

    var urgentList = dayEvents.filter(function (e) { return e.urgency === 'urgent'; })
      .sort(function (a, b) { return (a.time || '').localeCompare(b.time || ''); });
    var normalList = dayEvents.filter(function (e) { return e.urgency !== 'urgent'; })
      .concat(classAsCards)
      .sort(function (a, b) { return (a.time || '').localeCompare(b.time || ''); });

    function urgencyCards(list, label, tone) {
      if (!list.length) {
        return '<div class="urg-col ' + tone + '"><h4>' + label + '</h4><p class="muted wk-view-empty">暂无</p></div>';
      }
      return '<div class="urg-col ' + tone + '"><h4>' + label + ' · ' + list.length + '</h4><div class="urg-grid">' +
        list.map(function (e) {
          var col = typeColor(e.kind || '其他');
          var border = tone === 'urgent' ? ('2px solid ' + col) : ('2px dashed ' + col);
          var clearBtn = e.source === 'class'
            ? ''
            : '<button type="button" class="btn-ghost wk-clear" onclick="App.delEvent(\'' + e.id + '\')">清除</button>';
          return '<div class="urg-card ' + tone + '" style="background:' + softBg(col, 0.14) + ';border:' + border + '">' +
            '<div class="urg-card-top"><span class="pill" style="background:' + softBg(col) + ';color:' + col + '">' +
            esc(e.kind || '未分类') + '</span>' + clearBtn + '</div>' +
            '<strong style="color:' + col + '">' + esc(e.title) + '</strong>' +
            '<div class="muted">' + esc(e.time || '未定时') +
            (e.endTime ? ' – ' + esc(e.endTime) : '') + '</div>' +
            (e.note ? '<p class="urg-note">' + esc(e.note) + '</p>' : '') +
            '</div>';
        }).join('') + '</div></div>';
    }

    var isToday = ds === todayStr();

    return '<div class="day-wrap">' +
      '<div class="cal-toolbar">' +
      '<button type="button" class="btn-ghost" onclick="App.shiftDay(-1)" aria-label="前一天">‹</button>' +
      '<div class="day-nav"><input type="date" id="sched-day-pick" value="' + ds + '" onchange="App.setSchedDay(this.value)">' +
      '<span class="muted">周' + WEEKDAYS[wd] + (isToday ? ' · 今天' : '') + ' · 按开始–结束时间占位</span></div>' +
      '<button type="button" class="btn-ghost" onclick="App.shiftDay(1)" aria-label="后一天">›</button></div>' +
      renderDayControls(ds, dayEvents, dayClasses) +
      (!isToday ? '<div class="day-today-bar"><button type="button" class="btn" onclick="App.goSchedToday()">一键回到今天</button></div>' : '') +
      '<p class="muted week-tip">循环日常会按设定的循环方式与时段出现在时间轴；未填结束时间时默认占 1 小时</p>' +

      '<div class="card tl-board">' +
      '<h3 class="tl-title">当日时间轴 <span class="muted">6:00–24:00 · 每格 2 小时</span></h3>' +
      buildDayTimelineHtml(timelineBlocks) + '</div>' +

      '<details class="card day-add" id="day-compose"><summary>＋ 添加日程</summary>' +
      '<h3>添加事件 / 计划（同步到周计划）</h3>' +
      '<p class="muted month-hint">与周计划共用同一份数据；请选择开始与结束时间，事件会占据时间轴对应高度。</p>' +
      '<div class="form-row">' +
      '<input id="day-title" class="input" placeholder="标题">' +
      '<input id="day-time" class="input" type="time" value="09:00" title="开始">' +
      '<input id="day-end" class="input" type="time" value="10:00" title="结束">' +
      '<select id="day-kind" class="input">' + typeOpts + '</select>' +
      '<select id="day-urgency" class="input">' +
      '<option value="normal">普通（虚线）</option><option value="urgent">紧急（实线）</option></select>' +
      '<input id="day-note" class="input" placeholder="备注（可选）">' +
      '<button type="button" class="btn" onclick="App.addDayItem()">添加</button></div>' +
      '<details class="day-type-manage"><summary>管理类型与颜色</summary>' +
      '<span class="wk-lab">事件类型与颜色</span>' +
      '<div class="form-row day-type-row">' +
      '<input id="day-type-new" class="input" placeholder="新类型名称">' +
      '<div class="color-pick" id="day-color-pick">' +
      '<button type="button" class="color-pick-btn" onclick="App.toggleColorPick()">' +
      '<span class="color-preview" id="day-color-preview" style="background:' + selectedTypeColor() + '"></span>' +
      '<span class="color-pick-name" id="day-color-name">' + esc(selectedTypeColorName()) + '</span>' +
      '<span class="color-pick-caret">▾</span></button>' +
      '<div class="color-pick-menu" id="day-color-menu" hidden>' +
      MORANDI_PALETTE.map(function (c) {
        var on = selectedTypeColor().toLowerCase() === c.hex.toLowerCase();
        return '<button type="button" class="color-pick-item' + (on ? ' on' : '') + '" onclick="App.pickTypeColor(\'' + c.hex + '\')">' +
          '<span class="color-preview" style="background:' + c.hex + '"></span>' +
          '<span>' + esc(c.name) + '</span></button>';
      }).join('') + '</div>' +
      '<input type="hidden" id="day-type-color" value="' + selectedTypeColor() + '">' +
      '</div>' +
      '<button type="button" class="btn-ghost" onclick="App.addDayType()">添加类型</button></div>' +
      '<div class="day-type-list">' + typeList + '</div></details></details>' +

      '<section class="card day-urgency">' +
      '<h3>按紧急程度</h3>' +
      '<div class="urg-boards">' +
      urgencyCards(urgentList, '紧急', 'urgent') +
      urgencyCards(normalList, '普通', 'normal') +
      '</div></section></div>';
  }

  function renderSchedClasses() {
    ensureSchedule(state);
    var typeOpts = normalizeDayTypes(state.schedule.dayTypes).map(function (t) {
      return '<option value="' + esc(t.name) + '">' + esc(t.name) + '</option>';
    }).join('');
    var list = state.schedule.classes.slice().sort(function (a, b) {
      return String(a.rangeStart || '').localeCompare(String(b.rangeStart || '')) ||
        (a.weekday - b.weekday) || String(a.start || '').localeCompare(String(b.start || ''));
    }).map(function (c) {
      normalizeRoutine(c);
      var when = routineModeLabel(c.mode);
      if (c.mode === 'weekly') when += '周' + WEEKDAYS[c.weekday];
      var range = (c.rangeStart || c.rangeEnd)
        ? ((c.rangeStart || '…') + '～' + (c.rangeEnd || '…'))
        : '长期';
      return '<div class="class-item">' +
        '<span class="pill ok">' + esc(when) + '</span> ' +
        '<strong>' + esc(c.title) + '</strong> ' +
        '<span class="muted">' + esc(c.kind || '课程') + '</span> ' +
        esc(c.start) + (c.end ? '-' + esc(c.end) : '') +
        (c.place ? ' · ' + esc(c.place) : '') +
        ' <span class="muted">· ' + esc(range) + '</span>' +
        (c.start ? ' <span class="muted">→ ' + SLOT_LABELS[slotFromTime(c.start)] + '</span>' : '') +
        ' <button type="button" class="btn-ghost" onclick="App.delClass(\'' + c.id + '\')">移除</button></div>';
    }).join('') || '<p class="empty scrap-empty">还没有循环日常，添加后会显示在周计划与日计划中</p>';

    return '<div class="classes-wrap">' +
      '<section class="card">' +
      '<h3>添加循环日常</h3>' +
      '<p class="muted month-hint">设置循环方式与起止日期后，周计划 / 日计划会在有效期内自动展示，无需重复填写。</p>' +
      '<div class="form-row">' +
      '<input id="cls-title" class="input" placeholder="名称，如早读 / 跑步">' +
      '<select id="cls-mode" class="input" title="循环方式">' +
      '<option value="weekly">每周（指定星期）</option>' +
      '<option value="weekdays">工作日（周一至五）</option>' +
      '<option value="daily">每天</option></select>' +
      '<select id="cls-wd" class="input" title="星期（仅「每周」生效）">' +
      WEEKDAYS.map(function (w, i) { return '<option value="' + i + '"' + (i === 1 ? ' selected' : '') + '>周' + w + '</option>'; }).join('') +
      '</select></div>' +
      '<div class="form-row">' +
      '<input id="cls-start" class="input" type="time" value="08:00" title="开始时间">' +
      '<input id="cls-end" class="input" type="time" value="09:00" title="结束时间">' +
      '<input id="cls-from" class="input" type="date" title="循环开始日期" placeholder="开始日期">' +
      '<input id="cls-to" class="input" type="date" title="循环结束日期" placeholder="结束日期">' +
      '</div>' +
      '<div class="form-row">' +
      '<select id="cls-kind" class="input">' + typeOpts + '</select>' +
      '<input id="cls-place" class="input" placeholder="地点 / 备注（可选）">' +
      '<button type="button" class="btn" onclick="App.addClass()">添加</button></div>' +
      '<p class="muted">循环起止日期可留空表示长期有效；「每周」时请选择星期。</p>' +
      renderImportBlock('cls-import', 'title,weekday,start,end,place[,mode,from,to,kind]  （weekday: 0日～6六；mode: weekly/weekdays/daily）') +
      '</section>' +
      '<section class="card"><h3>已添加日常</h3><div class="class-list">' + list + '</div></section></div>';
  }

  function renderSchedTodos(homeOnly) {
    ensureSchedule(state);
    var open = state.schedule.todos.filter(function (t) { return !t.done; });
    var done = state.schedule.todos.filter(function (t) { return t.done; });

    function quad(list, title, hint, cls) {
      var body = list.map(function (t) {
        return '<div class="todo-item' + (t.done ? ' done' : '') + '">' +
          '<input type="checkbox"' + (t.done ? ' checked' : '') + ' onclick="App.toggleTodo(\'' + t.id + '\')">' +
          '<div class="todo-body"><span class="todo-text">' + esc(t.text) + '</span>' +
          '<small class="muted">' + esc(t.date || '') + '</small></div>' +
          '<button type="button" class="btn-ghost wk-clear" onclick="App.delTodo(\'' + t.id + '\')">清除</button></div>';
      }).join('') || '<p class="muted wk-view-empty">暂无</p>';
      return '<div class="todo-quad ' + cls + '"><h4>' + title + '</h4><p class="muted todo-hint">' + hint + '</p><div class="todo-quad-list">' + body + '</div></div>';
    }

    var q1 = open.filter(function (t) { return t.important && t.urgent; });
    var q2 = open.filter(function (t) { return t.important && !t.urgent; });
    var q3 = open.filter(function (t) { return !t.important && t.urgent; });
    var q4 = open.filter(function (t) { return !t.important && !t.urgent; });

    var doneList = done.map(function (t) {
      return '<div class="todo-item done">' +
        '<input type="checkbox" checked onclick="App.toggleTodo(\'' + t.id + '\')">' +
        '<div class="todo-body"><span class="todo-text">' + esc(t.text) + '</span>' +
        '<small class="muted">' + esc(t.date || '') + '</small></div>' +
        '<button type="button" class="btn-ghost wk-clear" onclick="App.delTodo(\'' + t.id + '\')">清除</button></div>';
    }).join('') || '<p class="muted wk-view-empty">暂无已完成</p>';

    return '<div class="todo-wrap">' +
      (homeOnly ? '' : '<section class="card">' +
      '<h3>添加待办</h3>' +
      '<div class="form-row">' +
      '<input id="todo-text" class="input" placeholder="待办内容">' +
      '<input id="todo-date" class="input" type="date" value="' + todayStr() + '">' +
      '<select id="todo-important" class="input">' +
      '<option value="1">重要</option><option value="0">不重要</option></select>' +
      '<select id="todo-urgent" class="input">' +
      '<option value="1">紧急</option><option value="0" selected>不紧急</option></select>' +
      '<button type="button" class="btn" onclick="App.addTodo()">添加</button></div></section>') +
      '<div class="todo-matrix">' +
      quad(q1, '重要 · 紧急', '立刻做', 'q-do') +
      quad(q2, '重要 · 不紧急', '计划做', 'q-plan') +
      quad(q3, '不重要 · 紧急', '委托 / 尽快处理', 'q-delegate') +
      quad(q4, '不重要 · 不紧急', '可延后', 'q-later') +
      '</div>' +
      '<section class="card todo-done-box"><h3>已完成</h3><div class="todo-quad-list">' + doneList + '</div></section></div>';
  }

  function parseClassesImport(text) {
    var lines = parseImportLines(text);
    var n = 0;
    var mapCN = { '日': 0, '天': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6 };
    lines.forEach(function (line) {
      var p = line.split(',').map(function (x) { return x.trim(); });
      if (p.length < 4) return;
      var wd = +p[1];
      if (isNaN(wd)) {
        var raw = p[1].replace('周', '').replace('星期', '');
        if (mapCN[raw] != null) wd = mapCN[raw];
        else wd = WEEKDAYS.indexOf(raw);
      }
      if (wd < 0 || wd > 6) wd = 1;
      var mode = (p[5] || 'weekly').toLowerCase();
      if (mode !== 'daily' && mode !== 'weekdays' && mode !== 'weekly') mode = 'weekly';
      var item = {
        id: uid(),
        title: p[0],
        weekday: wd,
        start: p[2],
        end: p[3],
        place: p[4] || '',
        mode: mode,
        rangeStart: p[6] || '',
        rangeEnd: p[7] || '',
        kind: p[8] || '课程'
      };
      normalizeRoutine(item);
      var sig = [item.title, item.mode, item.weekday, item.start, item.end, item.place, item.rangeStart, item.rangeEnd].join('|');
      var dup = state.schedule.classes.some(function (c) {
        normalizeRoutine(c);
        return [c.title, c.mode, c.weekday, c.start, c.end, c.place || '', c.rangeStart || '', c.rangeEnd || ''].join('|') === sig;
      });
      if (dup) return;
      state.schedule.classes.push(item);
      n++;
    });
    return n;
  }

  function moneySig(r) {
    return [r.date, r.account, r.amount, r.io, r.cat, r.note].join('|');
  }

  var MONEY_QUOTES = [
    '少买一点没用的，多留一点心安',
    '记账不是抠门，是对自己负责',
    '钱会流动，心要清醒',
    '今天省下的，是明天的底气',
    '花得明白，才花得心安',
    '小钱管好了，大钱才听你的',
    '冲动消费前，先深呼吸三秒',
    '真正的富足，是花得其所',
    '记录每一笔，看见自己的选择',
    '会花钱，也是一种温柔的能力',
    '存下的不只是钱，还有选择权',
    '消费降级不可耻，盲目跟风才累'
  ];

  function getMoneyQuote() {
    var seed = daySeed(todayStr() + '-money');
    return MONEY_QUOTES[seed % MONEY_QUOTES.length];
  }

  function drawPieChart(canvasId, data) {
    var canvas = document.getElementById(canvasId);
    if (!canvas || !data.length) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width, h = canvas.height;
    var cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 10;
    ctx.clearRect(0, 0, w, h);
    var total = data.reduce(function (s, d) { return s + d.value; }, 0);
    if (!total) {
      ctx.fillStyle = '#999';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('暂无数据', cx, cy);
      return;
    }
    var start = -Math.PI / 2;
    data.forEach(function (d, i) {
      var slice = (d.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + slice);
      ctx.closePath();
      ctx.fillStyle = PIE_COLORS[i % PIE_COLORS.length];
      ctx.fill();
      start += slice;
    });
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }

  function drawBarChart(canvasId, data) {
    var canvas = document.getElementById(canvasId);
    if (!canvas || !data.length) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width, h = canvas.height;
    var pad = 28, gap = 8;
    ctx.clearRect(0, 0, w, h);
    var max = 0;
    data.forEach(function (d) { if (d.value > max) max = d.value; });
    if (!max) max = 1;
    var barW = (w - pad * 2 - gap * (data.length - 1)) / data.length;
    data.forEach(function (d, i) {
      var bh = Math.max(2, (d.value / max) * (h - pad * 2));
      var x = pad + i * (barW + gap);
      var y = h - pad - bh;
      ctx.fillStyle = PIE_COLORS[i % PIE_COLORS.length];
      ctx.globalAlpha = 0.55;
      ctx.fillRect(x, y, barW, bh);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#8a837a';
      ctx.font = '10px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.label, x + barW / 2, h - 10);
      if (d.value > 0) {
        ctx.fillStyle = '#4a4540';
        ctx.fillText(String(Math.round(d.value)), x + barW / 2, y - 4);
      }
    });
  }

  function drawLineChart(canvasId, data) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width, h = canvas.height;
    var padL = 40, padR = 16, padT = 20, padB = 32;
    ctx.clearRect(0, 0, w, h);
    if (!data.length) {
      ctx.fillStyle = '#999';
      ctx.font = '13px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('暂无体重数据', w / 2, h / 2);
      return;
    }
    var min = data[0].value, max = data[0].value;
    data.forEach(function (d) {
      if (d.value < min) min = d.value;
      if (d.value > max) max = d.value;
    });
    var span = max - min;
    if (span < 1) {
      min -= 0.5;
      max += 0.5;
      span = max - min;
    } else {
      min -= span * 0.12;
      max += span * 0.12;
      span = max - min;
    }
    var plotW = w - padL - padR;
    var plotH = h - padT - padB;
    var n = data.length;
    var xAt = function (i) {
      return padL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
    };
    var yAt = function (v) {
      return padT + (1 - (v - min) / span) * plotH;
    };

    // grid
    ctx.strokeStyle = 'rgba(122,173,160,0.18)';
    ctx.lineWidth = 1;
    var ticks = 4;
    for (var t = 0; t <= ticks; t++) {
      var gv = min + (span * t) / ticks;
      var gy = yAt(gv);
      ctx.beginPath();
      ctx.moveTo(padL, gy);
      ctx.lineTo(w - padR, gy);
      ctx.stroke();
      ctx.fillStyle = '#8a837a';
      ctx.font = '10px Nunito, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(gv.toFixed(1), padL - 6, gy + 3);
    }

    // area fill
    ctx.beginPath();
    data.forEach(function (d, i) {
      var x = xAt(i), y = yAt(d.value);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(xAt(n - 1), padT + plotH);
    ctx.lineTo(xAt(0), padT + plotH);
    ctx.closePath();
    ctx.fillStyle = 'rgba(126,184,168,0.18)';
    ctx.fill();

    // line
    ctx.beginPath();
    data.forEach(function (d, i) {
      var x = xAt(i), y = yAt(d.value);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#5f9e8e';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // points + labels
    data.forEach(function (d, i) {
      var x = xAt(i), y = yAt(d.value);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = '#5f9e8e';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#4a4540';
      ctx.font = '10px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.value.toFixed(1), x, y - 10);
      var label = d.label || '';
      if (n > 10 && i % Math.ceil(n / 8) !== 0 && i !== n - 1) return;
      ctx.fillStyle = '#8a837a';
      ctx.fillText(label, x, h - 10);
    });
  }

  function renderMoney() {
    ensureMoney(state);
    var now = new Date();
    var monthPrefix = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    var today = todayStr();
    var monthOut = state.money.records.filter(function (r) {
      return r.io === 'out' && r.date && r.date.indexOf(monthPrefix) === 0;
    });
    var todayOut = state.money.records.filter(function (r) {
      return r.io === 'out' && r.date === today;
    });
    var todayIn = state.money.records.filter(function (r) {
      return r.io === 'in' && r.date === today;
    });
    var todaySpend = todayOut.reduce(function (s, r) { return s + r.amount; }, 0);
    var todayIncome = todayIn.reduce(function (s, r) { return s + r.amount; }, 0);
    var monthSpend = monthOut.reduce(function (s, r) { return s + r.amount; }, 0);

    var catMap = {};
    monthOut.forEach(function (r) {
      catMap[r.cat] = (catMap[r.cat] || 0) + r.amount;
    });
    var catData = Object.keys(catMap).map(function (k) { return { label: k, value: catMap[k] }; });
    catData.sort(function (a, b) { return b.value - a.value; });

    var dayBars = [];
    for (var i = 6; i >= 0; i--) {
      var ds = addDays(today, -i);
      var sum = state.money.records.filter(function (r) {
        return r.io === 'out' && r.date === ds;
      }).reduce(function (s, r) { return s + r.amount; }, 0);
      dayBars.push({ label: ds.slice(5), value: sum });
    }

    var acctHtml = ACCOUNT_KEYS.map(function (k) {
      return '<div class="acct"><span>' + ACCOUNT_LABELS[k] + '</span><strong>' + (state.money.accounts[k] || 0).toFixed(2) + '</strong></div>';
    }).join('');
    var catOpts = COMMON_CATS.map(function (c) { return '<option>' + c + '</option>'; }).join('');
    var acctOpts = ACCOUNT_KEYS.map(function (k) {
      return '<option value="' + k + '">' + ACCOUNT_LABELS[k] + '</option>';
    }).join('');

    var todayRecs = state.money.records.filter(function (r) { return r.date === today; })
      .sort(function (a, b) { return (b.io === 'out' ? 1 : 0) - (a.io === 'out' ? 1 : 0); });
    var todayHtml = todayRecs.map(function (r) {
      return '<div class="money-day-item">' +
        '<div class="money-day-left"><span class="pill">' + esc(r.cat) + '</span>' +
        '<span>' + esc(ACCOUNT_LABELS[r.account] || r.account) + '</span>' +
        (r.note ? '<span class="muted"> · ' + esc(r.note) + '</span>' : '') + '</div>' +
        '<div class="money-day-right"><span class="' + r.io + '">' + (r.io === 'in' ? '+' : '-') + r.amount.toFixed(2) + '</span>' +
        '<button type="button" class="btn-ghost wk-clear" onclick="App.delRecord(\'' + r.id + '\')">清除</button></div></div>';
    }).join('') || '<p class="muted wk-view-empty">今天还没有记账</p>';

    var legend = catData.slice(0, 8).map(function (d, i) {
      var pct = monthSpend ? Math.round(d.value / monthSpend * 100) : 0;
      return '<div class="money-leg-item"><span class="money-leg-dot" style="background:' + PIE_COLORS[i % PIE_COLORS.length] + '"></span>' +
        '<span class="money-leg-name">' + esc(d.label) + '</span>' +
        '<span class="money-leg-val">' + d.value.toFixed(0) + ' · ' + pct + '%</span></div>';
    }).join('') || '<p class="muted">本月暂无支出分类</p>';

    var topCat = catData.length ? catData[0].label : '—';
    var avg7 = dayBars.reduce(function (s, d) { return s + d.value; }, 0) / 7;

    document.getElementById('page').innerHTML =
      '<div class="money-wrap">' +
      '<div class="money-head">' +
      '<h2 class="money-title">记账</h2>' +
      '<p class="money-quote">「' + esc(getMoneyQuote()) + '」</p></div>' +
      '<div class="acct-grid">' + acctHtml + '</div>' +

      '<section class="card money-add">' +
      '<h3>记一笔</h3>' +
      '<div class="form-row">' +
      '<select id="rec-acct" class="input">' + acctOpts + '</select>' +
      '<select id="rec-io" class="input"><option value="out">支出</option><option value="in">收入</option></select>' +
      '<input id="rec-amt" class="input" type="number" step="0.01" placeholder="金额">' +
      '<select id="rec-cat" class="input">' + catOpts + '</select>' +
      '<input id="rec-note" class="input" placeholder="备注">' +
      '<input id="rec-date" class="input" type="date" value="' + today + '">' +
      '<button type="button" class="btn" onclick="App.addRecord()">记一笔</button></div></section>' +

      '<section class="card money-daily">' +
      '<div class="money-daily-head">' +
      '<h3>今日花费</h3>' +
      '<div class="money-daily-stats">' +
      '<div class="money-stat out"><span class="muted">今日支出</span><strong>' + todaySpend.toFixed(2) + '</strong></div>' +
      '<div class="money-stat in"><span class="muted">今日收入</span><strong>' + todayIncome.toFixed(2) + '</strong></div>' +
      '<div class="money-stat"><span class="muted">本月支出</span><strong>' + monthSpend.toFixed(2) + '</strong></div>' +
      '</div></div>' +
      '<div class="money-day-list">' + todayHtml + '</div></section>' +

      '<section class="card money-analysis">' +
      '<h3>花费分析</h3>' +
      '<div class="money-insight">' +
      '<p>近 7 日日均支出 <strong>' + avg7.toFixed(1) + '</strong>，本月支出最高分类：<strong>' + esc(topCat) + '</strong>。</p>' +
      (todaySpend > avg7 && avg7 > 0
        ? '<p class="muted">今天比近一周均值略高，记得核对一下非必要开销。</p>'
        : '<p class="muted">保持记录，消费画像会越来越清晰。</p>') +
      '</div>' +
      '<div class="money-charts">' +
      '<div class="money-chart-block">' +
      '<h4>近 7 日支出</h4>' +
      '<canvas id="money-bars" width="360" height="160"></canvas></div>' +
      '<div class="money-chart-block">' +
      '<h4>本月分类</h4>' +
      '<div class="money-pie-row">' +
      '<canvas id="money-pie" width="180" height="180"></canvas>' +
      '<div class="money-legend">' + legend + '</div></div></div></div></section></div>';

    setTimeout(function () {
      drawBarChart('money-bars', dayBars);
      drawPieChart('money-pie', catData);
    }, 50);
  }

  function renderHealth() {
    var tab = state._healthTab || 'exercise';
    var tabs = [
      { id: 'exercise', label: '运动' }, { id: 'period', label: '经期' }, { id: 'diet', label: '饮食' }
    ];
    var tabHtml = tabs.map(function (t) {
      return '<button class="tab' + (tab === t.id ? ' active' : '') + '" onclick="App.setHealthTab(\'' + t.id + '\')">' + t.label + '</button>';
    }).join('');
    var body = tab === 'diet' ? renderHealthDiet() : tab === 'period' ? renderHealthPeriod() : renderHealthExercise();
    document.getElementById('page').innerHTML = '<h2>健康</h2><div class="tabs">' + tabHtml + '</div>' + body;
  }

  function timeToMins(t) {
    var raw = String(t || '').trim();
    if (raw === '24:00' || raw === '24') return 24 * 60;
    var parts = raw.split(':');
    var h = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10) || 0;
    if (isNaN(h)) return -1;
    return h * 60 + m;
  }

  function eventDurationMins(e) {
    if (!e) return 0;
    var a = timeToMins(e.time);
    var b = timeToMins(e.endTime);
    if (a < 0 || b < 0 || b <= a) return 0;
    return b - a;
  }

  function isSportEvent(e) {
    return e && e.type !== 'ddl' && e.type !== 'special' && String(e.kind || '').trim() === '运动';
  }

  function exerciseFromEvent(e) {
    var mins = eventDurationMins(e);
    var timeNote = '';
    if (e.time) timeNote = e.time + (e.endTime ? '–' + e.endTime : '');
    var noteParts = [];
    if (e.note) noteParts.push(e.note);
    if (timeNote) noteParts.push(timeNote);
    return {
      id: uid(),
      date: e.date || todayStr(),
      type: e.title || '运动',
      mins: mins,
      note: noteParts.join(' · '),
      fromEventId: e.id
    };
  }

  function pendingSportEvents() {
    ensureSchedule(state);
    ensureHealth(state);
    var synced = {};
    state.health.exercise.forEach(function (ex) {
      if (ex.fromEventId) synced[ex.fromEventId] = 1;
    });
    return state.schedule.events
      .filter(function (e) { return isSportEvent(e) && e.id && !synced[e.id]; })
      .slice()
      .sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
  }

  function renderHealthExercise() {
    var exList = state.health.exercise.slice().sort(function (a, b) {
      var d = (b.date || '').localeCompare(a.date || '');
      if (d) return d;
      return (b.type || '').localeCompare(a.type || '');
    });
    var wtList = state.health.weight.slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
    var pending = pendingSportEvents();
    var totalMins = exList.reduce(function (s, e) { return s + (e.mins || 0); }, 0);

    var exRows = exList.map(function (e) {
      return '<tr>' +
        '<td>' + esc(e.date) + '</td>' +
        '<td><span class="ex-type-pill">' + esc(e.type || '—') + '</span></td>' +
        '<td class="ex-mins">' + (e.mins || 0) + '<span class="muted"> 分</span></td>' +
        '<td class="ex-note">' + esc(e.note || '—') + '</td>' +
        '<td class="ex-src">' + (e.fromEventId ? '日程' : '手动') + '</td>' +
        '<td><button type="button" class="btn-ghost wk-clear" onclick="App.delExercise(\'' + e.id + '\')">清除</button></td>' +
        '</tr>';
    }).join('');

    var exTable = exList.length
      ? '<div class="ex-table-wrap"><table class="simple ex-table"><thead><tr>' +
        '<th>日期</th><th>运动</th><th>时长</th><th>备注</th><th>来源</th><th></th>' +
        '</tr></thead><tbody>' + exRows + '</tbody></table></div>' +
        '<p class="ex-total muted">共 ' + exList.length + ' 条 · 合计 ' + totalMins + ' 分钟</p>'
      : '<p class="empty">暂无运动记录</p>';

    var syncRows = pending.map(function (e) {
      var mins = eventDurationMins(e);
      var timeLabel = e.time ? (e.time + (e.endTime ? '–' + e.endTime : '')) : '—';
      return '<tr>' +
        '<td>' + esc(e.date) + '</td>' +
        '<td>' + esc(e.title || '运动') + '</td>' +
        '<td>' + esc(timeLabel) + '</td>' +
        '<td class="ex-mins">' + (mins ? mins + ' 分' : '—') + '</td>' +
        '<td><button type="button" class="btn" onclick="App.syncOneExercise(\'' + e.id + '\')">添加</button></td>' +
        '</tr>';
    }).join('');

    var syncBlock = '<section class="card ex-sync">' +
      '<div class="ex-sync-head">' +
      '<div><h3>从日程同步</h3>' +
      '<p class="muted ex-sync-hint">读取日程中类型为「运动」的事项</p></div>' +
      (pending.length
        ? '<button type="button" class="btn" onclick="App.syncAllExercises()">全部添加（' + pending.length + '）</button>'
        : '') +
      '</div>' +
      (pending.length
        ? '<div class="ex-table-wrap"><table class="simple ex-table"><thead><tr>' +
          '<th>日期</th><th>标题</th><th>时段</th><th>时长</th><th></th>' +
          '</tr></thead><tbody>' + syncRows + '</tbody></table></div>'
        : '<p class="muted wk-view-empty">暂无待同步的运动日程（可在日程里把事项类型设为「运动」）</p>') +
      '</section>';

    var wtHtml = wtList.map(function (w) {
      return '<tr>' +
        '<td>' + esc(w.date) + '</td>' +
        '<td class="ex-mins">' + Number(w.kg).toFixed(1) + ' <span class="muted">kg</span></td>' +
        '<td><button type="button" class="btn-ghost wk-clear" onclick="App.delWeight(\'' + w.id + '\')">清除</button></td>' +
        '</tr>';
    }).join('');
    var wtTable = wtList.length
      ? '<div class="ex-table-wrap"><table class="simple ex-table"><thead><tr>' +
        '<th>日期</th><th>体重</th><th></th></tr></thead><tbody>' + wtHtml + '</tbody></table></div>'
      : '<p class="empty">暂无体重记录</p>';

    var wtAsc = state.health.weight.slice().sort(function (a, b) {
      return (a.date || '').localeCompare(b.date || '');
    });
    var wtChartData = wtAsc.map(function (w) {
      return { label: (w.date || '').slice(5), value: +w.kg || 0 };
    });
    var wtDelta = '';
    if (wtAsc.length >= 2) {
      var diff = wtAsc[wtAsc.length - 1].kg - wtAsc[0].kg;
      var sign = diff > 0 ? '+' : '';
      wtDelta = '<p class="ex-total muted">首末对比：' + sign + diff.toFixed(1) + ' kg（' +
        esc(wtAsc[0].date) + ' → ' + esc(wtAsc[wtAsc.length - 1].date) + '）</p>';
    }

    setTimeout(function () { drawLineChart('wt-line', wtChartData); }, 40);

    return '<div class="ex-wrap">' +
      '<section class="card ex-add">' +
      '<h3>添加运动</h3>' +
      '<div class="form-row">' +
      '<input id="ex-date" class="input" type="date" value="' + todayStr() + '">' +
      '<input id="ex-type" class="input" placeholder="运动项目，如跑步">' +
      '<input id="ex-mins" class="input" type="number" min="0" placeholder="分钟">' +
      '<input id="ex-note" class="input" placeholder="备注">' +
      '<button type="button" class="btn" onclick="App.addExercise()">添加</button></div></section>' +
      syncBlock +
      '<section class="card ex-list-card">' +
      '<h3>运动记录</h3>' + exTable + '</section>' +
      '<section class="card wt-card">' +
      '<h3>体重</h3>' +
      '<div class="form-row">' +
      '<input id="wt-date" class="input" type="date" value="' + todayStr() + '">' +
      '<input id="wt-kg" class="input" type="number" step="0.1" placeholder="kg">' +
      '<button type="button" class="btn" onclick="App.addWeight()">添加</button></div>' +
      wtTable +
      '<div class="wt-chart-block">' +
      '<h4>体重变化</h4>' +
      '<canvas id="wt-line" width="520" height="220"></canvas>' +
      wtDelta +
      '</div></section>' +
      '<section class="card ex-import-card">' +
      '<h3>导入</h3>' +
      '<p class="muted ex-sync-hint">运动：date,type,mins,note</p>' +
      renderImportBlock('ex-import', 'date,type,mins,note') +
      '<p class="muted ex-sync-hint">体重：date,kg</p>' +
      renderImportBlock('wt-import', 'date,kg') +
      '</section></div>';
  }

  function renderHealthDiet() {
    var foods = LOCAL_FOODS.map(function (f, i) {
      return '<button type="button" class="food-btn" onclick="App.fillDiet(' + i + ')">' + esc(f.name) + ' ' + f.kcal + 'kcal</button>';
    }).join('');
    var list = state.health.diet.slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
    var dietHtml = list.map(function (d) {
      return '<div class="row">' + esc(d.date) + ' [' + esc(d.meal) + '] ' + esc(d.name) + ' ' + d.kcal + 'kcal P' + d.p + ' C' + d.c + ' F' + d.f +
        ' <button onclick="App.delDiet(\'' + d.id + '\')">删</button></div>';
    }).join('') || '<p class="empty">暂无饮食记录</p>';
    return '<div class="form-row"><input id="diet-date" type="date" value="' + todayStr() + '">' +
      '<input id="diet-name" placeholder="食物名"><input id="diet-kcal" type="number" placeholder="kcal">' +
      '<input id="diet-p" type="number" step="0.1" placeholder="P"><input id="diet-c" type="number" step="0.1" placeholder="C">' +
      '<input id="diet-f" type="number" step="0.1" placeholder="F">' +
      '<select id="diet-meal"><option>早餐</option><option>午餐</option><option>晚餐</option><option>加餐</option></select>' +
      '<button onclick="App.searchFood()">🔍查热量</button><button onclick="App.addDiet()">添加</button></div>' +
      '<div id="food-search-results"></div><div class="local-foods">' + foods + '</div>' +
      renderImportBlock('diet-import', 'date,name,kcal,p,c,f,meal') +
      '<div class="list">' + dietHtml + '</div>';
  }

  function renderHealthPeriod() {
    ensureHealth(state);
    var p = state.health.period;
    var stats = computePeriodStats();
    var pred = predictNextPeriod();
    var open = getOpenCycle();
    var cycles = (p.cycles || []).slice().sort(function (a, b) {
      return (b.start || '').localeCompare(a.start || '');
    });

    var flowOpts = FLOW_OPTS.map(function (f) {
      return '<option value="' + f.id + '"' + (f.id === 'medium' ? ' selected' : '') + '>' + f.label + '</option>';
    }).join('');
    var symptomChecks = SYMPTOM_OPTS.map(function (s) {
      return '<label class="per-chip"><input type="checkbox" class="per-sym" value="' + esc(s) + '"> ' + esc(s) + '</label>';
    }).join('');
    var reliefOpts = RELIEF_OPTS.map(function (r) {
      return '<option value="' + esc(r) + '">' + esc(r) + '</option>';
    }).join('');

    var statusHtml = open
      ? '<p class="per-status is-on">当前经期进行中：自 <strong>' + esc(open.start) + '</strong> 起（第 ' +
        (daysBetween(open.start, todayStr()) + 1) + ' 天）</p>'
      : '<p class="per-status">当前不在经期，可记录「开始」开启新周期</p>';
    var predHtml = pred
      ? '<p class="muted">预计下次开始：' + esc(pred.next) + '（' + pred.daysUntil + ' 天后 · 按平均周期 ' +
        stats.cycleLen + ' 天推算）</p>'
      : '<p class="muted">记录至少一次经期开始后即可预测下次</p>';

    var cycleHint = stats.cycleSamples
      ? '基于近 ' + Math.min(6, stats.cycleSamples) + ' 次开始日间隔（共 ' + stats.cycleSamples + ' 个间隔）'
      : '至少记录 2 次「经期开始」后自动计算';
    var periodHint = stats.periodSamples
      ? '基于近 ' + Math.min(6, stats.periodSamples) + ' 次已结束经期（共 ' + stats.periodSamples + ' 次）'
      : '至少完整记录 1 次「开始→结束」后自动计算';
    var gapDetail = stats.recentGaps.length
      ? '<p class="muted per-stat-detail">近期间隔：' + stats.recentGaps.map(function (g) { return g + '天'; }).join('、') + '</p>'
      : '';
    var lenDetail = stats.recentPeriods.length
      ? '<p class="muted per-stat-detail">近期经期：' + stats.recentPeriods.map(function (g) { return g + '天'; }).join('、') + '</p>'
      : '';

    var settingsHtml = '<section class="card">' +
      '<h3>基础数据</h3>' +
      '<p class="muted ex-sync-hint">根据过往经期自动计算，随新记录动态更新</p>' +
      '<div class="per-stats-grid">' +
      '<div class="per-stat"><span class="muted">平均周期</span>' +
      '<strong>' + (stats.cycleSamples ? stats.cycleLen : '—') + '</strong>' +
      '<span class="muted">天</span>' +
      '<p class="muted per-stat-hint">' + cycleHint + '</p></div>' +
      '<div class="per-stat"><span class="muted">平均经期</span>' +
      '<strong>' + (stats.periodSamples ? stats.periodLen : '—') + '</strong>' +
      '<span class="muted">天</span>' +
      '<p class="muted per-stat-hint">' + periodHint + '</p></div></div>' +
      gapDetail + lenDetail +
      statusHtml + predHtml + '</section>';

    var cycleListHtml = cycles.length
      ? '<div class="ex-table-wrap"><table class="simple ex-table"><thead><tr>' +
        '<th>开始</th><th>结束</th><th>天数</th><th>状态</th><th></th></tr></thead><tbody>' +
        cycles.map(function (c) {
          var days = cyclePeriodDays(c);
          var st = c.end ? '已结束' : '进行中';
          return '<tr>' +
            '<td>' + esc(c.start) + '</td>' +
            '<td>' + esc(c.end || '—') + '</td>' +
            '<td class="ex-mins">' + days + '</td>' +
            '<td><span class="ex-type-pill' + (c.end ? '' : ' per-pill-on') + '">' + st + '</span></td>' +
            '<td><button type="button" class="btn-ghost wk-clear" onclick="App.delPeriodCycle(\'' + c.id + '\')">清除</button></td>' +
            '</tr>';
        }).join('') + '</tbody></table></div>'
      : '<p class="muted wk-view-empty">暂无经期周期</p>';

    var allDays = [];
    cycles.forEach(function (c) {
      (c.days || []).forEach(function (d) {
        allDays.push({ cycle: c, day: d });
      });
    });
    allDays.sort(function (a, b) { return (b.day.date || '').localeCompare(a.day.date || ''); });

    var dayRows = allDays.map(function (item) {
      var d = item.day;
      var sym = (d.symptoms || []).join('、') || '—';
      return '<tr>' +
        '<td>' + esc(d.date) + '</td>' +
        '<td>' + esc(flowLabel(d.flow)) + '</td>' +
        '<td class="ex-note">' + esc(sym) + '</td>' +
        '<td>' + (d.meds ? '是' + (d.medNote ? '（' + esc(d.medNote) + '）' : '') : '否') + '</td>' +
        '<td class="ex-note">' + esc(d.relief || '—') + '</td>' +
        '<td class="ex-note">' + esc(d.note || '—') + '</td>' +
        '<td><button type="button" class="btn-ghost wk-clear" onclick="App.delPeriodDay(\'' + item.cycle.id + '\',\'' + d.id + '\')">清除</button></td>' +
        '</tr>';
    }).join('');

    var dayTable = allDays.length
      ? '<div class="ex-table-wrap"><table class="simple ex-table"><thead><tr>' +
        '<th>日期</th><th>出血量</th><th>症状</th><th>用药</th><th>缓解</th><th>备注</th><th></th>' +
        '</tr></thead><tbody>' + dayRows + '</tbody></table></div>'
      : '<p class="muted wk-view-empty">暂无每日记录</p>';

    // cycle summaries + charts
    var chartQueue = [];
    var summaryHtml = cycles.map(function (c, idx) {
      var daysSorted = (c.days || []).slice().sort(function (a, b) {
        return (a.date || '').localeCompare(b.date || '');
      });
      var flowData = daysSorted.map(function (d, i) {
        return { label: 'D' + (i + 1), value: flowLevel(d.flow) };
      });
      if (!flowData.length && c.start) {
        var n = Math.min(cyclePeriodDays(c), 10);
        for (var i = 0; i < n; i++) flowData.push({ label: 'D' + (i + 1), value: 0 });
      }
      var symCount = {};
      daysSorted.forEach(function (d) {
        (d.symptoms || []).forEach(function (s) {
          symCount[s] = (symCount[s] || 0) + 1;
        });
      });
      var pieData = Object.keys(symCount).map(function (k) {
        return { label: k, value: symCount[k] };
      }).sort(function (a, b) { return b.value - a.value; });
      var medDays = daysSorted.filter(function (d) { return d.meds; }).length;
      var flowId = 'per-flow-' + idx;
      var pieId = 'per-pie-' + idx;
      chartQueue.push({ flowId: flowId, flowData: flowData, pieId: pieId, pieData: pieData });

      var legend = pieData.slice(0, 6).map(function (d, i) {
        return '<div class="money-leg-item"><span class="money-leg-dot" style="background:' +
          PIE_COLORS[i % PIE_COLORS.length] + '"></span><span>' + esc(d.label) +
          '</span><span class="money-leg-val">' + d.value + ' 次</span></div>';
      }).join('') || '<p class="muted">本周期暂无症状记录</p>';

      return '<div class="card per-cycle-card">' +
        '<div class="per-cycle-head">' +
        '<h4>' + esc(c.start) + (c.end ? ' → ' + esc(c.end) : '（进行中）') + '</h4>' +
        '<span class="muted">经期 ' + cyclePeriodDays(c) + ' 天 · 用药 ' + medDays + ' 天</span></div>' +
        '<label class="muted">周期总结</label>' +
        '<textarea class="textarea" id="per-sum-' + c.id + '" rows="2" placeholder="写下本周期感受、疼痛程度、需要改进的地方…">' +
        esc(c.summary || '') + '</textarea>' +
        '<div class="row mt"><button type="button" class="btn" onclick="App.saveCycleSummary(\'' + c.id + '\')">保存总结</button></div>' +
        '<div class="money-charts per-charts">' +
        '<div class="money-chart-block"><h4>出血量趋势</h4>' +
        '<canvas id="' + flowId + '" width="320" height="150"></canvas>' +
        '<p class="muted per-chart-hint">纵轴：0无 → 4多</p></div>' +
        '<div class="money-chart-block"><h4>症状分布</h4>' +
        '<div class="money-pie-row">' +
        '<canvas id="' + pieId + '" width="140" height="140"></canvas>' +
        '<div class="money-legend">' + legend + '</div></div></div></div></div>';
    }).join('') || '<p class="muted wk-view-empty">完成经期记录后，这里会显示各周期总结与图表</p>';

    // overview chart: period length per cycle (oldest → newest)
    var chrono = cycles.slice().sort(function (a, b) { return (a.start || '').localeCompare(b.start || ''); });
    var lenData = chrono.map(function (c, i) {
      return { label: (c.start || '').slice(5) || String(i + 1), value: cyclePeriodDays(c) };
    });
    var gapData = [];
    for (var g = 1; g < chrono.length; g++) {
      gapData.push({
        label: (chrono[g].start || '').slice(5),
        value: daysBetween(chrono[g - 1].start, chrono[g].start)
      });
    }

    setTimeout(function () {
      drawBarChart('per-len-bars', lenData);
      drawBarChart('per-gap-bars', gapData.length ? gapData : [{ label: '—', value: 0 }]);
      chartQueue.forEach(function (q) {
        drawBarChart(q.flowId, q.flowData.length ? q.flowData : [{ label: '—', value: 0 }]);
        drawPieChart(q.pieId, q.pieData);
      });
    }, 50);

    return '<div class="per-wrap">' +
      '<section class="card">' +
      '<h3>经期开始 / 结束</h3>' +
      '<div class="form-row">' +
      '<input id="per-mark-date" class="input" type="date" value="' + todayStr() + '">' +
      '<button type="button" class="btn" onclick="App.markPeriodStart()">开始</button>' +
      '<button type="button" class="btn" onclick="App.markPeriodEnd()">结束</button></div>' +
      cycleListHtml + '</section>' +

      '<section class="card">' +
      '<h3>每日记录</h3>' +
      '<p class="muted ex-sync-hint">记录出血量、症状、是否用药与缓解方式</p>' +
      '<div class="form-row">' +
      '<input id="pd-date" class="input" type="date" value="' + todayStr() + '">' +
      '<select id="pd-flow" class="input">' + flowOpts + '</select>' +
      '<select id="pd-meds" class="input"><option value="0">未用药</option><option value="1">已用药</option></select>' +
      '<input id="pd-med-note" class="input" placeholder="药名/剂量（可选）">' +
      '<select id="pd-relief" class="input"><option value="">缓解方式</option>' + reliefOpts + '</select>' +
      '<input id="pd-note" class="input" placeholder="备注"></div>' +
      '<div class="per-sym-grid">' + symptomChecks + '</div>' +
      '<div class="row mt"><button type="button" class="btn" onclick="App.addPeriodDay()">保存今日记录</button></div>' +
      dayTable + '</section>' +

      settingsHtml +

      '<section class="card">' +
      '<h3>周期对比</h3>' +
      '<div class="money-charts per-charts">' +
      '<div class="money-chart-block"><h4>各周期经期天数</h4>' +
      '<canvas id="per-len-bars" width="360" height="160"></canvas></div>' +
      '<div class="money-chart-block"><h4>周期间隔（天）</h4>' +
      '<canvas id="per-gap-bars" width="360" height="160"></canvas></div></div></section>' +

      '<section class="per-summary-sec">' +
      '<h3>各周期总结与图表</h3>' +
      summaryHtml + '</section>' +

      '<section class="card ex-import-card">' +
      '<h3>导入</h3>' +
      '<p class="muted ex-sync-hint">格式：date,type,note（type: start / end / note）</p>' +
      renderImportBlock('period-import', 'date,type,note') +
      '</section></div>';
  }

  function renderStudy() {
    ensureStudy(state);
    ensureSchedule(state);
    if (!state._studyOpen || typeof state._studyOpen !== 'object') state._studyOpen = {};

    var cards = state.study.courses.map(function (c) {
      var tasks = state.study.tasks.filter(function (t) { return t.courseId === c.id; });
      var done = tasks.filter(function (t) { return t.done; }).length;
      var progress = tasks.length ? Math.round(done / tasks.length * 100) : (c.progress || 0);
      c.progress = progress;
      var isOpen = !!state._studyOpen[c.id];

      var draft = state._studySync;
      var taskList = tasks.map(function (t) {
        var syncTag = '';
        if (t.syncType === 'ddl') syncTag = '<span class="study-sync-tag is-ddl">DDL</span>';
        else if (t.syncType === 'sched') syncTag = '<span class="study-sync-tag is-sched">日程</span>';
        var syncBtns = !t.eventId
          ? '<button type="button" class="btn-ghost" onclick="App.beginStudySync(\'' + t.id + '\',\'sched\')">→日程</button>' +
            '<button type="button" class="btn-ghost" onclick="App.beginStudySync(\'' + t.id + '\',\'ddl\')">→DDL</button>'
          : '';
        var picker = '';
        if (draft && draft.taskId === t.id) {
          var label = draft.sync === 'ddl' ? '同步到 DDL' : '同步到日程';
          picker = '<div class="study-sync-picker">' +
            '<span class="study-sync-picker-label">' + label + '</span>' +
            '<input id="study-sync-date" class="input" type="date" value="' + esc(draft.date || todayStr()) + '">' +
            (draft.sync === 'ddl'
              ? ''
              : '<input id="study-sync-time" class="input" type="time" value="' + esc(draft.time || '09:00') + '" title="开始">' +
                '<span class="muted">–</span>' +
                '<input id="study-sync-end" class="input" type="time" value="' + esc(draft.endTime || '10:00') + '" title="结束">') +
            '<button type="button" class="btn" onclick="App.confirmStudySync()">确认</button>' +
            '<button type="button" class="btn-ghost" onclick="App.cancelStudySync()">取消</button></div>';
        }
        return '<div class="study-task-wrap">' +
          '<div class="study-task' + (t.done ? ' is-done' : '') + '">' +
          '<label class="study-task-main">' +
          '<input type="checkbox"' + (t.done ? ' checked' : '') +
          ' onchange="App.toggleStudyTask(\'' + t.id + '\')">' +
          '<span>' + esc(t.title) + '</span>' + syncTag + '</label>' +
          '<div class="study-task-actions">' + syncBtns +
          '<button type="button" class="btn-ghost wk-clear" onclick="App.delStudyTask(\'' + t.id + '\')">清除</button></div></div>' +
          picker + '</div>';
      }).join('') || '<p class="muted wk-view-empty">暂无任务</p>';

      var notes = state.study.notes.filter(function (n) { return n.courseId === c.id; })
        .slice().sort(function (a, b) { return (b.at || '').localeCompare(a.at || ''); });
      var noteList = notes.map(function (n) {
        var files = (n.files || []).map(function (f) {
          return '<div class="study-file-row">' +
            '<span class="study-file-name" title="' + esc(f.name) + '">' + esc(f.name) + '</span>' +
            '<span class="muted">' + studyFmtSize(f.size) + '</span>' +
            '<button type="button" class="btn" onclick="App.openStudyFile(\'' + n.id + '\',\'' + f.id + '\')">打开</button>' +
            '<button type="button" class="btn-ghost" onclick="App.downloadStudyFile(\'' + n.id + '\',\'' + f.id + '\')">下载</button>' +
            '<button type="button" class="btn-ghost wk-clear" onclick="App.delStudyFile(\'' + n.id + '\',\'' + f.id + '\')">清除</button></div>';
        }).join('');
        return '<article class="study-note">' +
          '<div class="study-note-head"><time>' + esc(n.at || '') + '</time>' +
          '<button type="button" class="btn-ghost wk-clear" onclick="App.delNote(\'' + n.id + '\')">清除</button></div>' +
          (n.text ? '<p class="study-note-text">' + esc(n.text) + '</p>' : '') +
          (files ? '<div class="study-files">' + files + '</div>' : '') +
          '<div class="study-attach-row">' +
          '<input type="file" id="note-attach-' + n.id + '" class="study-file-input" multiple>' +
          '<button type="button" class="btn-ghost" onclick="App.attachStudyFiles(\'' + n.id + '\')">追加附件</button></div></article>';
      }).join('') || '<p class="muted wk-view-empty">暂无笔记</p>';

      return '<section class="card study-course' + (isOpen ? ' is-open' : '') + '" data-course="' + c.id + '">' +
        '<div class="study-course-head" onclick="App.toggleStudyCourse(\'' + c.id + '\')" role="button" tabindex="0">' +
        '<span class="study-chevron" aria-hidden="true"></span>' +
        '<div class="study-course-title">' +
        '<h3>' + esc(c.name) + '</h3>' +
        (c.note ? '<p class="muted study-course-desc">' + esc(c.note) + '</p>' : '') +
        '<p class="muted study-progress">进度 ' + progress + '% · 任务 ' + done + '/' + tasks.length +
        ' · 笔记 ' + notes.length + (isOpen ? '' : ' · 点击展开') + '</p></div>' +
        '<button type="button" class="btn-ghost wk-clear" onclick="event.stopPropagation();App.delCourse(\'' + c.id + '\')">清除课程</button></div>' +
        '<div class="study-progress-bar"><span style="width:' + progress + '%"></span></div>' +

        '<div class="study-course-body"' + (isOpen ? '' : ' hidden') + '>' +
        '<div class="study-block">' +
        '<h4>任务</h4>' +
        '<div class="form-row study-inline-form">' +
        '<input id="task-title-' + c.id + '" class="input" placeholder="添加任务…" ' +
        'onkeydown="if(event.key===\'Enter\'){event.preventDefault();App.addStudyTask(\'' + c.id + '\')}">' +
        '<button type="button" class="btn" onclick="App.addStudyTask(\'' + c.id + '\')">添加</button></div>' +
        '<div class="study-task-list">' + taskList + '</div></div>' +

        '<div class="study-block">' +
        '<h4>笔记</h4>' +
        '<div class="study-note-compose">' +
        '<textarea id="note-text-' + c.id + '" class="textarea" rows="2" placeholder="写点笔记、要点或摘录…"></textarea>' +
        '<div class="form-row">' +
        '<input type="file" id="note-file-' + c.id + '" class="study-file-input" multiple>' +
        '<button type="button" class="btn" onclick="App.addNote(\'' + c.id + '\')">添加笔记</button></div>' +
        '<p class="muted study-file-hint">可上传课件/图片/PDF 等，单文件建议不超过 1.5MB（保存在本机）</p></div>' +
        '<div class="study-note-list">' + noteList + '</div></div></div></section>';
    }).join('') || '<p class="muted wk-view-empty">还没有课程，先添加一门吧</p>';

    document.getElementById('page').innerHTML =
      '<div class="study-wrap">' +
      '<div class="study-top">' +
      '<h2>学习</h2>' +
      '<button type="button" class="btn-ghost" onclick="App.pinSelection()">标记选中文字为笔记</button></div>' +
      '<section class="card">' +
      '<h3>添加课程</h3>' +
      '<div class="form-row">' +
      '<input id="course-name" class="input" placeholder="课程名">' +
      '<input id="course-note" class="input" placeholder="简介（可选）">' +
      '<button type="button" class="btn" onclick="App.addCourse()">添加</button></div></section>' +
      '<div class="study-course-list">' + cards + '</div></div>';
  }

  function renderWork() {
    ensureWork(state);
    ensureMoney(state);
    if (!state._workOpen || typeof state._workOpen !== 'object') state._workOpen = {};
    if (!state._tutorOpen || typeof state._tutorOpen !== 'object') state._tutorOpen = {};
    var tab = state._workTab || 'items';
    if (tab === 'inbox') tab = state._workTab = 'items';
    var tabs = [
      { id: 'items', label: '事项' },
      { id: 'prep', label: '家教' }
    ];
    var tabHtml = tabs.map(function (t) {
      return '<button class="tab' + (tab === t.id ? ' active' : '') + '" onclick="App.setWorkTab(\'' + t.id + '\')">' + t.label + '</button>';
    }).join('');
    var body = tab === 'prep' ? renderWorkTutoring() : renderWorkProjects();
    document.getElementById('page').innerHTML =
      '<div class="work-wrap"><h2>工作</h2><div class="tabs">' + tabHtml + '</div>' + body + '</div>';
  }

  function renderWorkTutoring() {
    var projects = state.work.tutoring || [];
    var acctOpts = ACCOUNT_KEYS.map(function (k) {
      return '<option value="' + k + '">' + ACCOUNT_LABELS[k] + '</option>';
    }).join('');

    var cards = projects.map(function (proj) {
      var isOpen = !!state._tutorOpen[proj.id];
      var lessons = (proj.lessons || []).slice().sort(function (a, b) {
        var da = (a.date || '') + (a.time || '');
        var db = (b.date || '') + (b.time || '');
        return db.localeCompare(da);
      });
      var incomeSum = lessons.reduce(function (s, L) { return s + (+L.income || 0); }, 0);

      var lessonHtml = lessons.map(function (L) {
        var timeLabel = L.time
          ? (L.time + (L.endTime ? '–' + L.endTime : ''))
          : '未填时间';
        return '<article class="tutor-lesson">' +
          '<div class="tutor-lesson-head">' +
          '<strong>' + esc(L.date || '') + '</strong>' +
          '<span class="muted">' + esc(timeLabel) + '</span>' +
          (L.income
            ? '<span class="tutor-income">+' + Number(L.income).toFixed(2) +
              ' · ' + esc(ACCOUNT_LABELS[L.account] || L.account || '') +
              (L.moneyId ? ' · 已入账' : '') + '</span>'
            : '<span class="muted">无收入</span>') +
          '<button type="button" class="btn-ghost wk-clear" onclick="App.delTutorLesson(\'' + proj.id + '\',\'' + L.id + '\')">清除</button></div>' +
          (L.prep ? '<div class="tutor-block"><span class="muted">备课</span><p>' + esc(L.prep) + '</p></div>' : '') +
          (L.feedback ? '<div class="tutor-block"><span class="muted">反馈</span><p>' + esc(L.feedback) + '</p></div>' : '') +
          planSyncActionsHtml('work:lesson:' + proj.id + ':' + L.id) +
          '</article>';
      }).join('') || '<p class="muted wk-view-empty">还没有课时</p>';

      return '<section class="card tutor-project' + (isOpen ? ' is-open' : '') + '">' +
        '<div class="work-project-head" onclick="App.toggleTutorProject(\'' + proj.id + '\')" role="button" tabindex="0">' +
        '<span class="study-chevron" aria-hidden="true"></span>' +
        '<div class="work-project-title">' +
        '<h3>' + esc(proj.title) + '</h3>' +
        (proj.note ? '<p class="muted">' + esc(proj.note) + '</p>' : '') +
        '<p class="muted study-progress">课时 ' + lessons.length +
        (incomeSum ? ' · 累计收入 ' + incomeSum.toFixed(2) : '') +
        (isOpen ? '' : ' · 点击展开') + '</p>' +
        '<div onclick="event.stopPropagation()">' + planSyncActionsHtml('work:tutor:' + proj.id) + '</div></div>' +
        '<button type="button" class="btn-ghost wk-clear" onclick="event.stopPropagation();App.delTutorProject(\'' + proj.id + '\')">清除项目</button></div>' +
        '<div class="work-project-body"' + (isOpen ? '' : ' hidden') + '>' +
        '<div class="tutor-lesson-compose">' +
        '<h4>添加课时</h4>' +
        '<div class="form-row">' +
        '<input id="tl-date-' + proj.id + '" class="input" type="date" value="' + todayStr() + '">' +
        '<input id="tl-time-' + proj.id + '" class="input" type="time" value="09:00" title="开始">' +
        '<input id="tl-end-' + proj.id + '" class="input" type="time" value="10:00" title="结束">' +
        '<input id="tl-income-' + proj.id + '" class="input" type="number" step="0.01" min="0" placeholder="收入">' +
        '<select id="tl-acct-' + proj.id + '" class="input">' + acctOpts + '</select></div>' +
        '<textarea id="tl-prep-' + proj.id + '" class="textarea" rows="2" placeholder="备课内容…"></textarea>' +
        '<textarea id="tl-fb-' + proj.id + '" class="textarea" rows="2" placeholder="课程反馈…"></textarea>' +
        '<div class="row mt"><button type="button" class="btn" onclick="App.addTutorLesson(\'' + proj.id + '\')">添加课时</button>' +
        '<span class="muted tutor-hint">填写收入后会自动记入记账（家教 · 收入）</span></div></div>' +
        '<div class="tutor-lesson-list">' + lessonHtml + '</div></div></section>';
    }).join('') || '<p class="muted wk-view-empty">还没有家教项目，先添加一个吧</p>';

    return '<section class="card">' +
      '<h3>添加家教项目</h3>' +
      '<p class="muted ex-sync-hint">按学生/科目建项目，再在里面添加每次课时</p>' +
      '<div class="form-row">' +
      '<input id="tp-title" class="input" placeholder="项目名称，如小明 · 数学">' +
      '<input id="tp-note" class="input" placeholder="备注（可选）">' +
      '<button type="button" class="btn" onclick="App.addTutorProject()">添加</button></div></section>' +
      '<div class="tutor-project-list">' + cards + '</div>';
  }

  function renderWorkProjects() {
    var projects = state.work.projects || [];
    if (!state._workTaskOpen || typeof state._workTaskOpen !== 'object') state._workTaskOpen = {};
    var cards = projects.map(function (p) {
      var isOpen = !!state._workOpen[p.id];
      var tasks = (p.tasks || []).slice().sort(function (a, b) {
        var ad = a.ddl || '9999';
        var bd = b.ddl || '9999';
        if (ad !== bd) return ad.localeCompare(bd);
        return (a.title || '').localeCompare(b.title || '');
      });
      var taskDone = tasks.filter(function (t) { return t.done; }).length;

      var taskHtml = tasks.map(function (t) {
        var subStats = workTaskSubStats(t);
        var subsOpen = !!state._workTaskOpen[t.id];
        var ddlSoon = t.ddl && daysBetween(todayStr(), t.ddl) <= 3 && daysBetween(todayStr(), t.ddl) >= 0;
        var ddlOver = t.ddl && t.ddl < todayStr() && !t.done;
        var subList = (t.subs || []).map(function (s) {
          var subKey = 'work:sub:' + p.id + ':' + t.id + ':' + s.id;
          return '<div class="work-sub-row">' +
            '<label class="work-sub' + (s.done ? ' is-done' : '') + '">' +
            '<input type="checkbox"' + (s.done ? ' checked' : '') +
            ' onchange="App.toggleWorkSub(\'' + p.id + '\',\'' + t.id + '\',\'' + s.id + '\')">' +
            '<span>' + esc(s.title) + '</span>' +
            '<button type="button" class="work-sub-del" title="清除" onclick="event.preventDefault();App.delWorkSub(\'' + p.id + '\',\'' + t.id + '\',\'' + s.id + '\')">×</button></label>' +
            planSyncActionsHtml(subKey) +
            '</div>';
        }).join('');

        var taskKey = 'work:task:' + p.id + ':' + t.id;
        return '<article class="work-task' + (t.done ? ' is-done' : '') + (subsOpen ? ' is-subs-open' : '') + '">' +
          '<div class="work-task-head">' +
          '<input type="checkbox" class="work-task-check"' + (t.done ? ' checked' : '') +
          ' title="完成" onchange="App.toggleWorkTaskDone(\'' + p.id + '\',\'' + t.id + '\')">' +
          '<div class="work-task-main">' +
          '<div class="work-task-title-row">' +
          '<h4>' + esc(t.title) + '</h4>' +
          (t.ddl
            ? '<span class="work-ddl-tag' + (ddlOver ? ' is-over' : ddlSoon ? ' is-soon' : '') + '">' + esc(t.ddl) + '</span>'
            : '') +
          '</div>' +
          (t.content ? '<p class="work-task-content">' + esc(t.content) + '</p>' : '') +
          planSyncActionsHtml(taskKey) +
          '<button type="button" class="work-sub-toggle" onclick="App.toggleWorkTaskSubs(\'' + t.id + '\')">' +
          '子项' + (subStats.total ? ' ' + subStats.done + '/' + subStats.total : '') +
          (subsOpen ? ' ▴' : ' ▾') + '</button></div>' +
          '<button type="button" class="btn-ghost wk-clear work-task-del" onclick="App.delWorkTask(\'' + p.id + '\',\'' + t.id + '\')">清除</button></div>' +
          '<div class="work-sub-panel"' + (subsOpen ? '' : ' hidden') + '>' +
          (subList ? '<div class="work-sub-list">' + subList + '</div>' : '') +
          '<div class="work-sub-add">' +
          '<input id="ws-title-' + t.id + '" class="input" placeholder="子项，回车添加"' +
          ' onkeydown="if(event.key===\'Enter\'){event.preventDefault();App.addWorkSub(\'' + p.id + '\',\'' + t.id + '\')}">' +
          '<button type="button" class="btn btn-ghost work-sub-add-btn" onclick="App.addWorkSub(\'' + p.id + '\',\'' + t.id + '\')">+</button></div></div></article>';
      }).join('') || '<p class="muted wk-view-empty">还没有任务</p>';

      var projKey = 'work:proj:' + p.id;
      var html = '<section class="card work-project' + (isOpen ? ' is-open' : '') + (isWorkProjectComplete(p) ? ' is-complete' : '') + '">' +
        '<div class="work-project-head" onclick="App.toggleWorkProject(\'' + p.id + '\')" role="button" tabindex="0">' +
        '<span class="study-chevron" aria-hidden="true"></span>' +
        '<div class="work-project-title">' +
        '<h3>' + esc(p.title) + '</h3>' +
        (p.note ? '<p class="muted">' + esc(p.note) + '</p>' : '') +
        '<p class="muted study-progress">任务 ' + taskDone + '/' + tasks.length +
        (isWorkProjectComplete(p) ? ' · 已完成' : '') +
        (isOpen ? '' : ' · 点击展开') + '</p>' +
        '<div onclick="event.stopPropagation()">' + planSyncActionsHtml(projKey) + '</div></div>' +
        '<button type="button" class="btn-ghost wk-clear" onclick="event.stopPropagation();App.delWorkProject(\'' + p.id + '\')">清除项目</button></div>' +
        '<div class="work-project-body"' + (isOpen ? '' : ' hidden') + '>' +
        '<div class="work-task-compose">' +
        '<div class="form-row">' +
        '<input id="wt-title-' + p.id + '" class="input" placeholder="任务标题">' +
        '<input id="wt-ddl-' + p.id + '" class="input" type="date" title="DDL">' +
        '<button type="button" class="btn" onclick="App.addWorkTask(\'' + p.id + '\')">添加</button></div>' +
        '<input id="wt-content-' + p.id + '" class="input work-task-content-input" placeholder="内容说明（可选）"></div>' +
        '<div class="work-task-list">' + taskHtml + '</div></div></section>';
      return { done: isWorkProjectComplete(p), html: html };
    });
    var activeHtml = cards.filter(function (r) { return !r.done; }).map(function (r) { return r.html; }).join('')
      || (cards.length ? '' : '<p class="muted wk-view-empty">还没有项目，先创建一个吧</p>');
    var doneRows = cards.filter(function (r) { return r.done; });
    var doneHtml = doneRows.map(function (r) { return r.html; }).join('');
    var showDone = !!state._workShowDone;
    var doneSection = doneRows.length
      ? '<section class="card done-fold-card">' +
        '<button type="button" class="done-fold-toggle" onclick="App.toggleWorkDoneFold()">' +
        (showDone ? '▾' : '▸') + ' 已完成项目（' + doneRows.length + '）</button>' +
        '<div class="done-fold-body work-project-list"' + (showDone ? '' : ' hidden') + '>' + doneHtml + '</div></section>'
      : '';

    return '<section class="card">' +
      '<h3>添加项目</h3>' +
      '<div class="form-row">' +
      '<input id="wp-title" class="input" placeholder="项目名称">' +
      '<input id="wp-note" class="input" placeholder="简介（可选）">' +
      '<button type="button" class="btn" onclick="App.addWorkProject()">添加</button></div></section>' +
      '<div class="work-project-list">' + activeHtml + '</div>' + doneSection;
  }

  function langPerDay() {
    var n = parseInt(state.lang.dailyGoal, 10);
    // 仅用于拆分后续课程时避免除零；本课词数本身不再设上下限
    if (isNaN(n) || n < 1) return 1;
    return n;
  }

  function langMasteredSet() {
    var used = {};
    (state.lang.mastered || []).forEach(function (id) { used[id] = true; });
    return used;
  }

  function langIsMastered(id) {
    return (state.lang.mastered || []).indexOf(id) >= 0;
  }

  function langWordProgress(id) {
    var p = (state.lang.progress || {})[id];
    return p && typeof p === 'object' ? p : { zh: false, en: false };
  }

  function langWeakEntry(id) {
    var list = state.lang.weak || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].id === id) return list[i];
    }
    return null;
  }

  function langModePassed(id, mode) {
    var p = langWordProgress(id);
    return mode === 'zh' ? !!p.zh : !!p.en;
  }

  function langModeWeak(id, mode) {
    var entry = langWeakEntry(id);
    if (!entry) return false;
    return mode === 'zh' ? !!entry.zh : !!entry.en;
  }

  /** tested = passed or marked 我不会/答错 for this mode in current lesson */
  function langLessonModeStats(words, mode) {
    var total = (words || []).length;
    var correct = 0;
    var wrong = 0;
    (words || []).forEach(function (w) {
      var passed = langModePassed(w.id, mode);
      var weak = langModeWeak(w.id, mode);
      if (passed) correct++;
      else if (weak) wrong++;
    });
    return { total: total, tested: correct + wrong, correct: correct, wrong: wrong };
  }

  function langQuizProgressText(mode, stats) {
    var day = state.lang.day || 0;
    var carryN = getLessonCarryoverIds(day).length;
    var extra = carryN ? (' · 含前课带入 ' + carryN) : '';
    if (mode === 'en') {
      return '英文拼写 · 对 ' + stats.correct + ' · 错 ' + stats.wrong + ' · 已测 ' + stats.tested + '/' + stats.total + extra;
    }
    return '中文掌握 · 对 ' + stats.correct + ' · 错 ' + stats.wrong + ' · 已测 ' + stats.tested + '/' + stats.total + extra;
  }

  /**
   * Quiz pool for a mode (includes 本课新词 + 前课带入).
   * - Fresh start: all not-yet-passed words (weak first, then untested)
   * - Continue: finish untested first, then drill weak until all correct
   */
  function langQuizPool(mode, continueRun) {
    var words = getDailyWords().filter(function (w) {
      return w && !langIsMastered(w.id) && !langModePassed(w.id, mode);
    });
    var untested = words.filter(function (w) { return !langModeWeak(w.id, mode); });
    var weakOnes = words.filter(function (w) { return langModeWeak(w.id, mode); });

    if (continueRun) {
      if (untested.length) return untested;
      return weakOnes;
    }
    // Fresh enter: keep both 未掌握 and 未测（含前课带入）, weak first
    return weakOnes.concat(untested);
  }

  function langPendingIds() {
    var progress = state.lang.progress || {};
    var mastered = langMasteredSet();
    return Object.keys(progress).filter(function (id) {
      var p = progress[id];
      return p && p.zh && p.en && !mastered[id];
    });
  }

  /** Unmastered bank words in stable order — used to (re)build lesson plan. */
  function langStudyPool() {
    var mastered = langMasteredSet();
    return (WORDS || []).filter(function (w) { return w && w.id && !mastered[w.id]; });
  }

  function langAssignedSet() {
    var used = langMasteredSet();
    (state.lang.plan || []).forEach(function (lesson) {
      (lesson || []).forEach(function (id) { used[id] = true; });
    });
    return used;
  }

  function langRemainingWords() {
    var used = langAssignedSet();
    return (WORDS || []).filter(function (w) { return w && w.id && !used[w.id]; });
  }

  /** Pull word ids from lessons after `day` (mutates plan). */
  function takeIdsFromFutureLessons(day, need) {
    var taken = [];
    if (need <= 0) return taken;
    var plan = state.lang.plan || [];
    for (var i = day + 1; i < plan.length && taken.length < need; i++) {
      var lesson = (plan[i] || []).slice();
      var keep = [];
      for (var k = 0; k < lesson.length; k++) {
        if (taken.length < need) taken.push(lesson[k]);
        else keep.push(lesson[k]);
      }
      plan[i] = keep;
    }
    var head = plan.slice(0, day + 1);
    var tail = plan.slice(day + 1).filter(function (les) { return les && les.length; });
    state.lang.plan = head.concat(tail);
    return taken;
  }

  /** Put unused ids back into the lesson right after `day`. */
  function returnIdsToFutureLessons(day, ids) {
    if (!ids || !ids.length) return;
    var plan = state.lang.plan || [];
    while (plan.length <= day) plan.push([]);
    if (plan.length === day + 1) plan.push([]);
    plan[day + 1] = ids.concat(plan[day + 1] || []);
    state.lang.plan = plan;
  }

  /** Rebuild lessons after `day` using current dailyGoal chunk size. */
  function rebalanceLangPlanTail(day) {
    ensureLang(state);
    day = Math.max(0, day || 0);
    var plan = state.lang.plan || [];
    var head = plan.slice(0, day + 1);
    var seen = langMasteredSet();
    head.forEach(function (lesson) {
      (lesson || []).forEach(function (id) { if (id) seen[id] = true; });
    });
    var pool = langStudyPool().filter(function (w) { return !seen[w.id]; });
    var per = langPerDay();
    var tail = [];
    for (var i = 0; i < pool.length; i += per) {
      tail.push(pool.slice(i, i + per).map(function (w) { return w.id; }));
    }
    state.lang.plan = head.concat(tail);
  }

  /**
   * Resize the current lesson in place.
   * Always keeps words already practiced today in this lesson.
   * Expanding can pull words from later lessons (plan was pre-split).
   */
  function resizeCurrentLangLesson(n) {
    ensureLang(state);
    n = parseInt(n, 10);
    if (isNaN(n) || n < 0) n = 0;
    var day = state.lang.day || 0;
    ensureLangLesson(day);
    var lesson = ((state.lang.plan || [])[day] || []).slice();
    var today = todayStr();
    var practiced = state.lang.practiced[today] || [];
    var mustKeep = [];
    var optional = [];
    lesson.forEach(function (id) {
      if (practiced.indexOf(id) >= 0) mustKeep.push(id);
      else optional.push(id);
    });
    if (n < mustKeep.length) {
      n = mustKeep.length;
      flash('本课今日已学 ' + mustKeep.length + ' 词，词数不能再少');
    }

    var next;
    var returned = [];
    if (n <= lesson.length) {
      next = mustKeep.concat(optional.filter(function (id) {
        return mustKeep.indexOf(id) < 0;
      })).slice(0, n);
      mustKeep.forEach(function (id) {
        if (next.indexOf(id) < 0) next.unshift(id);
      });
      next = next.slice(0, Math.max(n, mustKeep.length));
      var keepSet = {};
      next.forEach(function (id) { keepSet[id] = true; });
      lesson.forEach(function (id) {
        if (id && !keepSet[id]) returned.push(id);
      });
    } else {
      next = lesson.slice();
      var need = n - next.length;
      var fromRemain = langRemainingWords().slice(0, need).map(function (w) { return w.id; });
      next = next.concat(fromRemain);
      need = n - next.length;
      if (need > 0) {
        var fromFuture = takeIdsFromFutureLessons(day, need);
        next = next.concat(fromFuture);
      }
    }

    state.lang.plan[day] = next;
    if (returned.length) returnIdsToFutureLessons(day, returned);
    state.lang.dailyGoal = next.length > 0 ? next.length : n;
    rebalanceLangPlanTail(day);
    return (state.lang.plan[day] || next).length;
  }

  function langWeakReason(entry) {
    var parts = [];
    if (entry && entry.zh) parts.push('中文未掌握');
    if (entry && entry.en) parts.push('英文未掌握');
    return parts.join(' · ') || '未掌握';
  }

  function langWeakIds() {
    return (state.lang.weak || []).map(function (e) {
      return typeof e === 'string' ? e : e.id;
    }).filter(Boolean);
  }

  /**
   * Rebuild only the unscheduled tail (or full plan if empty).
   * Mastered words are never put back into lessons.
   */
  function rebuildLangPlan(fromScratch) {
    ensureLang(state);
    var pool = langStudyPool();
    var per = langPerDay();
    if (fromScratch || !state.lang.plan || !state.lang.plan.length) {
      var plan = [];
      for (var i = 0; i < pool.length; i += per) {
        plan.push(pool.slice(i, i + per).map(function (w) { return w.id; }));
      }
      state.lang.plan = plan.length ? plan : [];
    } else {
      // Keep already generated lessons, only strip mastered; refill future from remaining
      var seen = langMasteredSet();
      state.lang.plan = state.lang.plan.map(function (lesson) {
        return (lesson || []).filter(function (id) {
          if (!id || seen[id]) return false;
          seen[id] = true;
          return true;
        });
      }).filter(function (lesson) { return lesson.length > 0; });
      var remaining = pool.filter(function (w) { return !seen[w.id]; });
      for (var j = 0; j < remaining.length; j += per) {
        state.lang.plan.push(remaining.slice(j, j + per).map(function (w) { return w.id; }));
      }
    }
    if ((state.lang.day || 0) >= state.lang.plan.length) {
      state.lang.day = Math.max(0, state.lang.plan.length - 1);
    }
  }

  function langLessonCount() {
    ensureLang(state);
    if (!state.lang.plan || !state.lang.plan.length) rebuildLangPlan(true);
    var planned = (state.lang.plan || []).length;
    var remaining = langRemainingWords().length;
    var future = remaining > 0 ? Math.ceil(remaining / langPerDay()) : 0;
    var total = planned + future;
    if (!total) return 1;
    return Math.max(total, (state.lang.day || 0) + 1);
  }

  function ensureLangLesson(dayIndex) {
    ensureLang(state);
    if (!state.lang.plan || !state.lang.plan.length) rebuildLangPlan(true);
    dayIndex = Math.max(0, dayIndex || 0);
    while (state.lang.plan.length <= dayIndex) {
      var remaining = langRemainingWords();
      if (!remaining.length) break;
      var chunk = remaining.slice(0, langPerDay()).map(function (w) { return w.id; });
      if (!chunk.length) break;
      state.lang.plan.push(chunk);
    }
    if (state.lang.plan.length && dayIndex >= state.lang.plan.length) {
      state.lang.day = state.lang.plan.length - 1;
    }
  }

  function getLessonBaseIds(day) {
    day = Math.max(0, day || 0);
    ensureLangLesson(day);
    return ((state.lang.plan || [])[day] || []).slice();
  }

  /**
   * Unconfirmed (not yet 确认掌握) words from the previous 1–2 lessons.
   * They appear in the current lesson as extras, outside 本课词数.
   * For lesson D: include unmastered words from D-1 and D-2
   * (because each lesson's words roll into the next two lessons).
   */
  function getLessonCarryoverIds(day) {
    ensureLang(state);
    day = Math.max(0, day || 0);
    var mastered = langMasteredSet();
    var baseSet = {};
    getLessonBaseIds(day).forEach(function (id) { baseSet[id] = true; });
    var seen = {};
    var out = [];
    for (var prev = day - 2; prev <= day - 1; prev++) {
      if (prev < 0) continue;
      var lesson = ((state.lang.plan || [])[prev]) || [];
      lesson.forEach(function (id) {
        if (!id || mastered[id] || baseSet[id] || seen[id]) return;
        seen[id] = true;
        out.push(id);
      });
    }
    return out;
  }

  function getDailyWords() {
    var day = state.lang.day || 0;
    var ids = getLessonBaseIds(day).concat(getLessonCarryoverIds(day));
    // Stable non-alphabetical display order; lesson assignments and progress stay intact.
    return ids.map(wordById).filter(Boolean).sort(function (a, b) {
      function rank(w) {
        var h = 2166136261;
        for (var i = 0; i < w.id.length; i++) h = Math.imul(h ^ w.id.charCodeAt(i), 16777619);
        return h >>> 0;
      }
      return rank(a) - rank(b);
    });
  }

  function wordById(id) {
    for (var i = 0; i < WORDS.length; i++) {
      if (WORDS[i].id === id) return WORDS[i];
    }
    return null;
  }

  function renderLangWordList(ids, emptyText, actionsFn) {
    if (!ids.length) return '<p class="empty">' + emptyText + '</p>';
    return '<ul class="lang-word-list">' + ids.map(function (id) {
      var w = wordById(id);
      var label = w ? ('<strong>' + esc(w.en) + '</strong> · ' + esc(w.zh)) : ('<span class="muted">' + esc(id) + '</span>');
      var actions = actionsFn ? actionsFn(id, w) : '';
      return '<li class="lang-word-row"><span>' + label + '</span>' + actions + '</li>';
    }).join('') + '</ul>';
  }

  function buildDialogPanelHtml(words) {
    if (!words || !words.length) return '<p class="empty">本课暂无单词</p>';
    var blocks = words.map(function (w, i) {
      var lines = [];
      if (w.sentence) {
        lines.push({ role: 'A', en: w.sentence, zh: w.sentenceZh || '' });
      }
      if (w.sentence2) {
        lines.push({ role: 'B', en: w.sentence2, zh: w.sentenceZh2 || '' });
      }
      if (!lines.length) {
        lines.push({
          role: '',
          en: w.sentence || ('Example with "' + w.en + '".'),
          zh: w.sentenceZh || (w.zh || '')
        });
      }
      var showRoles = lines.length >= 2;
      var linesHtml = lines.map(function (line) {
        var safe = String(line.en).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        return '<div class="dialog-turn">' +
          '<div class="dialog-line row">' +
          (showRoles && line.role ? '<strong class="dialog-role">' + line.role + '</strong>' : '') +
          '<span>' + esc(line.en) + '</span>' +
          '<button class="btn btn-ghost" type="button" onclick="App.speakWord(\'' + safe + '\')">🔊</button></div>' +
          (line.zh ? '<p class="dialog-zh muted">' + esc(line.zh) + '</p>' : '') +
          '</div>';
      }).join('');
      return '<div class="dialog-scene">' +
        '<h4>' + (i + 1) + '. ' + esc(w.en) + ' <span class="muted">' + esc(w.pos || '') + ' · ' + esc(w.zh || '') + '</span></h4>' +
        linesHtml + '</div>';
    }).join('');
    return '<p class="muted">情景对话 · 依据词典例句改编，可逐句跟读</p>' +
      '<button type="button" class="btn" onclick="App.readDialog()">🔊 朗读全部对话</button>' +
      blocks;
  }

  function buildMasterPanelHtml() {
    ensureLang(state);
    var pending = langPendingIds();
    var mastered = state.lang.mastered || [];
    var weak = state.lang.weak || [];
    var weakHtml = !weak.length ? '<p class="empty">暂无未掌握单词</p>' : '<ul class="lang-word-list">' + weak.map(function (entry) {
      var id = entry.id;
      var w = wordById(id);
      var label = w ? ('<strong>' + esc(w.en) + '</strong> · ' + esc(w.zh)) : ('<span class="muted">' + esc(id) + '</span>');
      return '<li class="lang-word-row"><span>' + label +
        '<br><span class="weak-tag">' + esc(langWeakReason(entry)) + '</span></span>' +
        '<button type="button" class="btn btn-ghost" onclick="App.removeWeak(\'' + id + '\')">移除</button></li>';
    }).join('') + '</ul>';
    return '<div class="master-panel-inner">' +
      '<p class="muted">需先完成「中文掌握」和「英文拼写」，再到本列表确认，才算真正掌握。</p>' +
      '<div class="lang-list-grid">' +
      '<div><h4>待确认（' + pending.length + '）</h4>' +
      renderLangWordList(pending, '暂无待确认单词', function (id) {
        return '<button type="button" class="btn" onclick="App.confirmMaster(\'' + id + '\')">确认掌握</button>';
      }) + '</div>' +
      '<div><h4>已掌握（' + mastered.length + '）</h4>' +
      renderLangWordList(mastered, '暂无已掌握单词') + '</div>' +
      '<div><h4>未掌握（' + weak.length + '）</h4>' + weakHtml + '</div>' +
      '</div></div>';
  }

  function speak(text, cb) {
    if (!window.speechSynthesis) { if (cb) cb(); return; }
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.95;
    u.onend = function () { if (cb) setTimeout(cb, 100); };
    window.speechSynthesis.speak(u);
  }

  function speakSequence(texts, gap) {
    var i = 0;
    function next() {
      if (i >= texts.length) return;
      speak(texts[i], function () { i++; setTimeout(next, gap || 1700); });
    }
    next();
  }

  function renderLangQuizPanel(quiz) {
    var lessonWords = getDailyWords();
    var stats = langLessonModeStats(lessonWords, quiz.mode);
    var progressLine = '<p class="muted quiz-progress">' + langQuizProgressText(quiz.mode, stats) + '</p>';

    if (quiz.feedback) {
      var fw = wordById(quiz.wordId);
      var ok = !!quiz.ok;
      var title = ok ? '回答正确 ✓' : '回答错误 ✗';
      var detail = '';
      if (quiz.mode === 'zh') {
        detail = '<p>你的选择：<strong>' + esc(quiz.picked || '（我不会）') + '</strong></p>' +
          '<p>正确答案：<strong>' + esc(quiz.correct || (fw ? fw.zh : '')) + '</strong></p>' +
          (fw ? '<p class="muted">单词：' + esc(fw.en) + '</p>' : '');
      } else {
        detail = '<p>你的拼写：<strong>' + esc(quiz.picked || '（我不会）') + '</strong></p>' +
          '<p>正确答案：<strong>' + esc(quiz.correct || (fw ? fw.en : '')) + '</strong></p>' +
          (fw ? '<p class="muted">释义：' + esc(fw.zh) + '</p>' : '');
      }
      return '<div class="quiz quiz-blind">' + progressLine +
        '<div class="quiz-result ' + (ok ? 'quiz-ok' : 'quiz-bad') + '">' +
        '<p class="quiz-prompt">' + title + '</p>' + detail +
        '<button type="button" class="btn" onclick="App.quizContinue(\'' + quiz.mode + '\')">下一题</button> ' +
        '<button type="button" class="btn btn-ghost" onclick="App.endLangQuiz()">结束测验</button>' +
        '</div></div>';
    }

    var w = wordById(quiz.wordId);
    if (!w) return '<p class="empty">单词不存在</p><button type="button" class="btn" onclick="App.endLangQuiz()">返回</button>';
    var safeEn = String(w.en).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    if (quiz.mode === 'zh') {
      var opts = quiz.opts || [w.zh];
      return '<div class="quiz quiz-blind">' + progressLine +
        '<p class="quiz-prompt">听音选义（不显示原词）</p>' +
        '<button type="button" class="btn" onclick="App.speakWord(\'' + safeEn + '\')">🔊 再听一遍</button>' +
        '<div class="quiz-opts">' + opts.map(function (o) {
          var safeO = String(o).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
          var safeZh = String(w.zh).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
          return '<button type="button" onclick="App.quizAnswer(\'zh\',\'' + w.id + '\',\'' + safeO + '\',\'' + safeZh + '\')">' + esc(o) + '</button>';
        }).join('') +
        '<button type="button" class="btn quiz-unknown" onclick="App.quizDontKnow(\'zh\',\'' + w.id + '\')">我不会</button>' +
        '</div>' +
        '<button type="button" class="btn btn-ghost" onclick="App.endLangQuiz()">结束测验</button></div>';
    }
    return '<div class="quiz quiz-blind">' + progressLine +
      '<p class="quiz-prompt">根据中文拼写英文（不显示原词）</p>' +
      '<p class="quiz-zh">' + esc(w.zh) + (w.pos ? ' <span class="muted">' + esc(w.pos) + '</span>' : '') + '</p>' +
      '<div class="form-row"><input id="quiz-spell" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="输入英文" ' +
      'onkeydown="if(event.key===\'Enter\'){event.preventDefault();App.quizSpell(\'' + w.id + '\',\'' + safeEn + '\');}">' +
      '<button type="button" class="btn" onclick="App.quizSpell(\'' + w.id + '\',\'' + safeEn + '\')">提交</button></div>' +
      '<button type="button" class="btn quiz-unknown" onclick="App.quizDontKnow(\'en\',\'' + w.id + '\')">我不会</button>' +
      '<button type="button" class="btn btn-ghost" onclick="App.endLangQuiz()">结束测验</button></div>';
  }

  function renderLang() {
    ensureLang(state);
    ensureLangLesson(state.lang.day || 0);
    var day = state.lang.day || 0;
    var baseIds = getLessonBaseIds(day);
    var carryIds = getLessonCarryoverIds(day);
    var carrySet = {};
    carryIds.forEach(function (id) { carrySet[id] = true; });
    var words = getDailyWords();
    var lessons = langLessonCount();
    day = Math.max(0, Math.min(day, Math.max(0, (state.lang.plan || []).length - 1)));
    state.lang.day = day;
    var today = todayStr();
    var practiced = state.lang.practiced[today] || [];
    var quiz = state._langQuiz;
    var mastered = state.lang.mastered || [];
    var pending = langPendingIds();
    var lessonDone = words.filter(function (w) { return langIsMastered(w.id); }).length;
    var lessonOpts = '';
    for (var i = 0; i < lessons; i++) {
      var frozen = state.lang.plan[i] ? ' · ' + state.lang.plan[i].length + '词' : '';
      lessonOpts += '<option value="' + (i + 1) + '"' + (i === day ? ' selected' : '') + '>第 ' + (i + 1) + ' 课' + frozen + '</option>';
    }
    var body;
    if (quiz && quiz.wordId) {
      body = renderLangQuizPanel(quiz);
    } else {
      var wordHtml = words.map(function (w) {
        var prog = langWordProgress(w.id);
        var done = langIsMastered(w.id);
        var tag = done ? ' · 已掌握' : (prog.zh && prog.en ? ' · 待确认' : (prog.zh || prog.en ? ' · 练习中' : ''));
        if (carrySet[w.id]) tag += ' · 前课带入';
        return '<div class="word-card' + (done ? ' done' : '') + (carrySet[w.id] ? ' carryover' : '') + '"><strong>' + esc(w.en) + '</strong> ' + esc(w.pos || '') +
          '<span class="muted">' + tag + '</span>' +
          '<br>' + esc(w.zh) + '<p class="sent">' + esc(w.sentence) + '</p>' +
          '<button type="button" onclick="App.speakWord(\'' + esc(w.en).replace(/'/g, "\\'") + '\')">🔊</button></div>';
      }).join('') || '<p class="empty">本课暂无单词（词库已学完或尚未分配）</p>';
      var showDialog = !!state._langShowDialog;
      var showMaster = !!state._langShowMaster;
      var zhStats = langLessonModeStats(words, 'zh');
      var enStats = langLessonModeStats(words, 'en');
      body =
        '<div class="lang-actions">' +
        '<button type="button" class="' + (showDialog ? 'btn' : '') + '" onclick="App.toggleDialog()">💬情景对话</button>' +
        '<button type="button" class="' + (showMaster ? 'btn' : '') + '" onclick="App.toggleMasterList()">📋掌握列表' +
        (pending.length ? '（' + pending.length + '待确认）' : '') + '</button>' +
        '<button type="button" onclick="App.startQuiz(\'zh\')">中文掌握 对' + zhStats.correct + ' 错' + zhStats.wrong + '（' + zhStats.tested + '/' + zhStats.total + '）</button>' +
        '<button type="button" onclick="App.startQuiz(\'en\')">英文拼写 对' + enStats.correct + ' 错' + enStats.wrong + '（' + enStats.tested + '/' + enStats.total + '）</button>' +
        '<div class="lang-goal-row">' +
        '<span class="muted">本课词数</span>' +
        '<button type="button" class="btn btn-ghost lang-goal-btn" onclick="App.bumpLangGoal(-1)" aria-label="减少">−</button>' +
        '<input id="lang-goal" class="input lang-goal-input" type="number" inputmode="numeric" value="' + baseIds.length +
        '" onchange="App.setLangGoal()" onkeydown="if(event.key===\'Enter\'){event.preventDefault();App.setLangGoal();}" title="本课新词数量，无上下限；前课未确认带入不计入">' +
        '<button type="button" class="btn btn-ghost lang-goal-btn" onclick="App.bumpLangGoal(1)" aria-label="增加">+</button>' +
        '<button type="button" class="btn" onclick="App.setLangGoal()">应用</button>' +
        '</div>' +
        '</div>' +
        '<div id="dialog-panel" class="dialog-panel" style="display:' + (showDialog ? 'block' : 'none') + '">' +
        (showDialog ? buildDialogPanelHtml(words) : '') + '</div>' +
        '<div id="master-panel" class="dialog-panel master-panel" style="display:' + (showMaster ? 'block' : 'none') + '">' +
        (showMaster ? buildMasterPanelHtml() : '') + '</div>' +
        '<p class="muted">词库 ' + (WORDS.length || 0) + ' · 已掌握 ' + mastered.length + ' · 剩余可学 ' + langStudyPool().length +
        ' · 本课新词 ' + baseIds.length + (carryIds.length ? ' + 前课带入 ' + carryIds.length : '') + '</p>' +
        '<p class="muted">本课测验 · 中文 对' + zhStats.correct + ' 错' + zhStats.wrong + '（' + zhStats.tested + '/' + zhStats.total +
        '） · 英文 对' + enStats.correct + ' 错' + enStats.wrong + '（' + enStats.tested + '/' + enStats.total + '）</p>' +
        '<div class="word-grid">' + wordHtml + '</div>';
    }
    var maxDay = Math.max(0, lessons - 1);
    document.getElementById('page').innerHTML =
      '<h2>语言 · 雅思基础</h2>' +
      '<div class="lang-lesson-bar">' +
      '<button type="button" class="btn btn-ghost" onclick="App.prevLangDay()"' + (day <= 0 ? ' disabled' : '') + '>← 上一课</button>' +
      '<label>回到 <select id="lang-lesson" onchange="App.gotoLangLesson()">' + lessonOpts + '</select></label>' +
      '<button type="button" class="btn btn-ghost" onclick="App.nextLangDay()"' + (day >= maxDay ? ' disabled' : '') + '>下一课 →</button>' +
      '<span class="muted">共 ' + lessons + ' 课 · 新词 ' + baseIds.length +
      (carryIds.length ? ' + 带入 ' + carryIds.length : '') +
      ' · 已掌握 ' + lessonDone + '/' + words.length + '</span>' +
      '</div>' + body;
    if (quiz && quiz.mode === 'zh' && quiz.wordId && !quiz.feedback) {
      var qw = wordById(quiz.wordId);
      if (qw) setTimeout(function () { speak(qw.en); }, 80);
    }
    if (quiz && quiz.mode === 'en' && quiz.wordId && !quiz.feedback) {
      setTimeout(function () {
        var input = document.getElementById('quiz-spell');
        if (input) input.focus();
      }, 40);
    }
  }

  function renderXuegong() {
    var tab = state._xgTab || 'propaganda';
    var tabs = [
      { id: 'propaganda', label: '历史系宣传部' },
      { id: 'culture', label: '历史系文体部' },
      { id: 'tourism', label: '旅游系' }
    ];
    var tabHtml = tabs.map(function (t) {
      return '<button class="tab' + (tab === t.id ? ' active' : '') + '" onclick="App.setXgTab(\'' + t.id + '\')">' + t.label + '</button>';
    }).join('');
    var body = tab === 'tourism' ? renderXgTourism() : renderXgSop(tab);
    document.getElementById('page').innerHTML = '<h2>学工</h2><div class="tabs">' + tabHtml + '</div>' + body;
  }

  function renderXgSop(dept) {
    ensureXuegong(state);
    var open = state._sopOpen || {};
    var sops = state.xuegong.history[dept].sops.slice().sort(function (a, b) {
      return String(b.date || '').localeCompare(String(a.date || ''));
    });
    var list = sops.map(function (s) {
      normalizeSop(s);
      var proj = sopProjectProgress(s);
      var isOpen = !!open[s.id];
      var stepsHtml = '';
      if (isOpen) {
        stepsHtml = (s.steps || []).map(function (step, si) {
          var sp = sopStepProgress(step);
          var tasksHtml = (step.tasks || []).map(function (task) {
            var taskEditing = state._sopEditTask &&
              state._sopEditTask.sopId === s.id &&
              state._sopEditTask.stepId === step.id &&
              state._sopEditTask.taskId === task.id;
            var taskEditPanel = '';
            if (taskEditing) {
              taskEditPanel = '<div class="sop-task-edit">' +
                '<input id="sop-task-edit-text-' + task.id + '" class="input" value="' + esc(task.text).replace(/"/g, '&quot;') + '" placeholder="小任务内容">' +
                '<textarea id="sop-task-edit-note-' + task.id + '" class="textarea" rows="2" placeholder="任务备注（可选）">' + esc(task.note || '') + '</textarea>' +
                '<div class="form-row" style="margin-top:8px">' +
                '<button type="button" class="btn" onclick="App.saveSopTaskEdit(\'' + dept + '\',\'' + s.id + '\',\'' + step.id + '\',\'' + task.id + '\')">保存</button>' +
                '<button type="button" class="btn btn-ghost" onclick="App.cancelSopTaskEdit()">取消</button>' +
                '</div></div>';
            }
            return '<div class="sop-task-row' + (task.done ? ' is-done' : '') + (taskEditing ? ' is-editing' : '') + '">' +
              '<label class="sop-task-check"><input type="checkbox"' + (task.done ? ' checked' : '') +
              ' onchange="App.toggleSopTask(\'' + dept + '\',\'' + s.id + '\',\'' + step.id + '\',\'' + task.id + '\')">' +
              '<span>' + esc(task.text) + '</span></label>' +
              '<span class="muted sop-task-pct">' + (task.done ? '100%' : '0%') + '</span>' +
              (task.note && !taskEditing ? '<p class="sop-task-note muted">' + esc(task.note) + '</p>' : '') +
              '<div class="sop-task-actions">' +
              '<button type="button" class="btn' + (taskEditing ? '' : ' btn-ghost') + '" onclick="App.editSopTask(\'' + dept + '\',\'' + s.id + '\',\'' + step.id + '\',\'' + task.id + '\')">' +
              (taskEditing ? '收起' : '编辑') + '</button>' +
              '<button type="button" class="btn btn-ghost" onclick="App.delSopTask(\'' + dept + '\',\'' + s.id + '\',\'' + step.id + '\',\'' + task.id + '\')">删</button>' +
              '</div>' +
              planSyncActionsHtml('xg:task:' + dept + ':' + s.id + ':' + step.id + ':' + task.id) +
              taskEditPanel +
              '</div>';
          }).join('') || '<p class="empty muted">本步骤还没有小任务</p>';

          var editing = state._sopEditStep && state._sopEditStep.sopId === s.id && state._sopEditStep.stepId === step.id;
          var editPanel = '';
          if (editing) {
            editPanel = '<div class="sop-step-edit">' +
              '<p class="muted">编辑步骤</p>' +
              '<div class="form-row">' +
              '<input id="sop-edit-title-' + step.id + '" class="input" value="' + esc(step.title).replace(/"/g, '&quot;') + '" placeholder="步骤名称">' +
              '</div>' +
              '<textarea id="sop-edit-note-' + step.id + '" class="textarea" rows="2" placeholder="步骤内容备注">' + esc(step.note || '') + '</textarea>' +
              '<div class="form-row" style="margin-top:8px">' +
              '<button type="button" class="btn" onclick="App.saveSopStepEdit(\'' + dept + '\',\'' + s.id + '\',\'' + step.id + '\')">保存步骤</button>' +
              '<button type="button" class="btn btn-ghost" onclick="App.cancelSopStepEdit()">取消</button>' +
              '</div>' +
              '<div class="sop-add-task">' +
              '<p class="muted">添加小任务</p>' +
              '<div class="form-row">' +
              '<input id="sop-task-text-' + step.id + '" class="input" placeholder="输入小任务内容">' +
              '<button type="button" class="btn" onclick="App.addSopTask(\'' + dept + '\',\'' + s.id + '\',\'' + step.id + '\')">添加小任务</button>' +
              '</div>' +
              '<input id="sop-task-note-' + step.id + '" class="input" placeholder="小任务备注（可选）" style="width:100%;margin-top:6px">' +
              '</div></div>';
          }

          return '<div class="sop-step-card' + (editing ? ' is-editing' : '') + '">' +
            '<div class="sop-step-head">' +
            '<div><h5>步骤 ' + (si + 1) + ' · ' + esc(step.title) + '</h5>' +
            (step.note ? '<div class="sop-step-note">' + esc(step.note).replace(/\n/g, '<br>') + '</div>' : '') +
            '</div>' +
            '<div class="sop-step-actions">' +
            '<button type="button" class="btn' + (editing ? '' : ' btn-ghost') + '" onclick="App.editSopStep(\'' + dept + '\',\'' + s.id + '\',\'' + step.id + '\')">' +
            (editing ? '收起编辑' : '编辑步骤') + '</button>' +
            '<button type="button" class="btn btn-ghost" onclick="App.delSopStep(\'' + dept + '\',\'' + s.id + '\',\'' + step.id + '\')">删步骤</button>' +
            planSyncActionsHtml('xg:step:' + dept + ':' + s.id + ':' + step.id) +
            '</div></div>' +
            renderProgressBar(sp.pct, '步骤进度 ' + sp.done + '/' + sp.total + '（' + sp.pct + '%）') +
            '<div class="sop-tasks">' + tasksHtml + '</div>' +
            editPanel +
            '</div>';
        }).join('') || '<p class="empty muted">还没有步骤，请先在下方添加步骤</p>';

        stepsHtml += '<div class="sop-add-step form-row">' +
          '<input id="sop-step-title-' + s.id + '" class="input" placeholder="新步骤名称">' +
          '<button type="button" class="btn" onclick="App.addSopStep(\'' + dept + '\',\'' + s.id + '\')">添加步骤</button></div>' +
          '<textarea id="sop-step-note-' + s.id + '" class="textarea" rows="2" placeholder="步骤内容备注（可选）"></textarea>';
      }

      return {
        done: isSopProjectComplete(s),
        html: '<div class="sop-item card' + (isSopProjectComplete(s) ? ' is-complete' : '') + '">' +
          '<div class="sop-item-head">' +
          '<div><h4>' + esc(s.title) + ' <small class="muted">' + esc(s.date || '') + '</small></h4>' +
          (s.note ? '<p class="muted sop-overall-note">' + esc(s.note) + '</p>' : '') +
          '</div>' +
          '<div class="sop-item-actions">' +
          '<button type="button" class="btn btn-ghost" onclick="App.toggleSopOpen(\'' + s.id + '\')">' + (isOpen ? '收起' : '展开') + '</button>' +
          '<button type="button" class="btn btn-ghost" onclick="App.delSop(\'' + dept + '\',\'' + s.id + '\')">删项目</button>' +
          planSyncActionsHtml('xg:sop:' + dept + ':' + s.id) +
          '</div></div>' +
          renderProgressBar(proj.pct, '项目进度 ' + proj.done + '/' + proj.total + '（' + proj.pct + '%）' + (isSopProjectComplete(s) ? ' · 已完成' : '')) +
          (isOpen ? '<div class="sop-steps-wrap">' + stepsHtml + '</div>' : '') +
          '</div>'
      };
    });

    var activeHtml = list.filter(function (r) { return !r.done; }).map(function (r) { return r.html; }).join('')
      || (list.length ? '' : '<p class="empty">暂无 SOP 项目</p>');
    var doneRows = list.filter(function (r) { return r.done; });
    var doneHtml = doneRows.map(function (r) { return r.html; }).join('');
    var showDone = !!state._xgShowDone;
    var doneSection = doneRows.length
      ? '<section class="card done-fold-card">' +
        '<button type="button" class="done-fold-toggle" onclick="App.toggleXgDoneFold()">' +
        (showDone ? '▾' : '▸') + ' 已完成项目（' + doneRows.length + '）</button>' +
        '<div class="done-fold-body sop-list"' + (showDone ? '' : ' hidden') + '>' + doneHtml + '</div></section>'
      : '';

    return '<section class="card sop-create">' +
      '<h3>添加 SOP 项目</h3>' +
      '<div class="form-row">' +
      '<input id="sop-title" class="input" placeholder="项目名称">' +
      '<input id="sop-date" class="input" type="date" value="' + todayStr() + '">' +
      '<button type="button" class="btn" onclick="App.addSop(\'' + dept + '\')">添加项目</button></div>' +
      '<textarea id="sop-note" class="textarea" rows="2" placeholder="项目备注（可选）"></textarea>' +
      '<p class="muted">项目 → 添加步骤 → 点「编辑步骤」可改备注并添加小任务；项目 / 步骤 / 任务都会显示进度。</p>' +
      '</section><div class="sop-list">' + activeHtml + '</div>' + doneSection;
  }

  function renderXgTourism() {
    ensureXuegong(state);
    var rows = state.xuegong.tourism.rows.slice().sort(function (a, b) {
      return String(b.date || '').localeCompare(String(a.date || ''));
    });
    var trs = rows.map(function (r, i) {
      return '<tr>' +
        '<td class="tour-num">' + (i + 1) + '</td>' +
        '<td class="tour-date">' + esc(r.date || '') + '</td>' +
        '<td>' + esc(r.slot || '') + '</td>' +
        '<td class="tour-topic">' + esc(r.topic || '') + '</td>' +
        '<td>' + esc(r.progress || '') + '</td>' +
        '<td>' + esc(r.owner || '') + '</td>' +
        '<td>' + esc(r.req || '') + '</td>' +
        '<td>' + esc(r.feedback || '') + '</td>' +
        '<td class="tour-actions">' +
        '<button type="button" class="btn btn-ghost" onclick="App.editTourism(\'' + r.id + '\')">编辑</button> ' +
        '<button type="button" class="btn btn-ghost wk-clear" onclick="App.delTourism(\'' + r.id + '\')">删除</button> ' +
        planSyncActionsHtml('xg:tour:' + r.id) +
        '</td></tr>';
    }).join('');
    return '<section class="card tourism-card">' +
      '<h3>添加项目</h3>' +
      '<div class="tourism-form">' +
      '<label>日期<input id="tour-date" class="input" type="date" value="' + todayStr() + '"></label>' +
      '<label>时段<input id="tour-slot" class="input" placeholder="如上午 / 14:00-16:00"></label>' +
      '<label>主题<input id="tour-topic" class="input" placeholder="活动主题"></label>' +
      '<label>进度<input id="tour-progress" class="input" placeholder="如筹备中 / 已完成"></label>' +
      '<label>负责人<input id="tour-owner" class="input" placeholder="姓名"></label>' +
      '<label>要求<input id="tour-req" class="input" placeholder="任务要求"></label>' +
      '<label class="tourism-span2">反馈<input id="tour-fb" class="input" placeholder="反馈或备注"></label>' +
      '<div class="tourism-form-actions"><button type="button" class="btn" onclick="App.addTourism()">添加项目</button></div>' +
      '</div></section>' +
      '<section class="card tourism-list-card">' +
      '<h3>项目列表 <span class="muted">共 ' + rows.length + ' 条</span></h3>' +
      '<div class="table-wrap tourism-table-wrap">' +
      '<table class="data-table tourism-table">' +
      '<thead><tr>' +
      '<th>#</th><th>日期</th><th>时段</th><th>主题</th><th>进度</th><th>负责人</th><th>要求</th><th>反馈</th><th>操作</th>' +
      '</tr></thead>' +
      '<tbody>' + (trs || '<tr><td colspan="9" class="empty-cell">暂无项目，请在上方添加</td></tr>') + '</tbody></table>' +
      '</div></section>';
  }

  function isIosDevice() {
    var ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua)) return true;
    return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  }

  function isStandaloneApp() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator.standalone === true;
  }

  function renderA2hsBlock() {
    if (isStandaloneApp()) {
      return '<section class="card a2hs-card">' +
        '<h3>添加到主屏幕</h3>' +
        '<p class="muted">当前已是主屏幕 / 独立窗口模式，可像 App 一样使用。</p></section>';
    }
    if (isIosDevice()) {
      return '<section class="card a2hs-card">' +
        '<h3>添加到主屏幕（iPhone / iPad）</h3>' +
        '<ol class="a2hs-steps">' +
        '<li>用 <strong>Safari</strong> 打开本站（不要用微信内置浏览器）</li>' +
        '<li>点底部分享按钮 <strong>□↑</strong></li>' +
        '<li>下滑找到并点 <strong>添加到主屏幕</strong></li>' +
        '<li>点右上角<strong>添加</strong></li>' +
        '</ol>' +
        '<p class="muted">添加后主屏幕会出现「小鱼台」图标，全屏打开、更跟手。</p></section>';
    }
    return '<section class="card a2hs-card">' +
      '<h3>添加到主屏幕 / 桌面</h3>' +
      '<ol class="a2hs-steps">' +
      '<li><strong>Android Chrome</strong>：右上角 ⋮ →「添加到主屏幕」或「安装应用」</li>' +
      '<li><strong>电脑 Chrome / Edge</strong>：地址栏右侧「安装」图标，或 ⋮ →「安装小鱼生活台」</li>' +
      '</ol>' +
      '<div class="form-row"><button type="button" class="btn" id="a2hs-install-btn" onclick="App.promptA2hs()">尝试一键安装</button></div>' +
      '<p class="muted">若按钮无反应，请用上方菜单手动添加。</p></section>';
  }

  function renderShopping() {
    ensureShopping(state);
    ensureMoney(state);
    if (!state._shopOpen || typeof state._shopOpen !== 'object') state._shopOpen = {};
    if (!state._shopListOpen || typeof state._shopListOpen !== 'object') state._shopListOpen = {};
    var acctOpts = ACCOUNT_KEYS.map(function (k) {
      return '<option value="' + k + '">' + ACCOUNT_LABELS[k] + '</option>';
    }).join('');

    var mods = state.shopping.modules || [];
    var modHtml = mods.map(function (mod) {
      var modOpen = !!state._shopOpen[mod.id];
      var lists = mod.lists || [];
      var openCount = 0;
      var boughtCount = 0;
      lists.forEach(function (L) {
        (L.items || []).forEach(function (it) {
          if (it.bought) boughtCount++;
          else openCount++;
        });
      });

      var listsHtml = lists.map(function (list) {
        var listOpen = state._shopListOpen[list.id] !== false;
        var items = list.items || [];
        var pendingMoney = items.filter(function (it) { return it.bought && !it.moneyId; });
        var itemsHtml = items.map(function (it) {
          var qtyLab = (it.qty || it.unit) ? (' · ' + esc(String(it.qty || '') + (it.unit || ''))) : '';
          var priceLab = it.price ? (' ¥' + Number(it.price).toFixed(2)) : '';
          var moneyTag = it.moneyId ? '<span class="shop-money-tag">已记账</span>' : '';
          return '<div class="shop-item' + (it.bought ? ' is-bought' : '') + '">' +
            '<label class="shop-item-main">' +
            '<input type="checkbox"' + (it.bought ? ' checked' : '') +
            ' onchange="App.toggleShopItem(\'' + mod.id + '\',\'' + list.id + '\',\'' + it.id + '\')">' +
            '<span>' + esc(it.name) + qtyLab + priceLab + '</span>' + moneyTag +
            '</label>' +
            '<div class="shop-item-actions">' +
            (it.bought && !it.moneyId
              ? '<button type="button" class="btn-ghost" onclick="App.beginShopCharge(\'' + mod.id + '\',\'' + list.id + '\',\'' + it.id + '\')">记账</button>'
              : '') +
            '<button type="button" class="btn-ghost wk-clear" onclick="App.delShopItem(\'' + mod.id + '\',\'' + list.id + '\',\'' + it.id + '\')">删</button>' +
            '</div></div>';
        }).join('') || '<p class="muted wk-view-empty">清单还是空的</p>';

        var chargeDraft = state._shopCharge;
        var chargePanel = '';
        if (chargeDraft && chargeDraft.modId === mod.id && chargeDraft.listId === list.id && !chargeDraft.itemId) {
          chargePanel = '<div class="study-sync-picker shop-charge-picker">' +
            '<span class="study-sync-picker-label">批量记入支出</span>' +
            '<input id="shop-charge-amt" class="input" type="number" step="0.01" min="0" value="' + esc(String(chargeDraft.amount || '')) + '" placeholder="金额">' +
            '<select id="shop-charge-acct" class="input">' + acctOpts + '</select>' +
            '<button type="button" class="btn" onclick="App.confirmShopCharge()">确认</button>' +
            '<button type="button" class="btn-ghost" onclick="App.cancelShopCharge()">取消</button></div>';
        } else if (chargeDraft && chargeDraft.modId === mod.id && chargeDraft.listId === list.id && chargeDraft.itemId) {
          chargePanel = '<div class="study-sync-picker shop-charge-picker">' +
            '<span class="study-sync-picker-label">记入支出</span>' +
            '<input id="shop-charge-amt" class="input" type="number" step="0.01" min="0" value="' + esc(String(chargeDraft.amount || '')) + '" placeholder="金额">' +
            '<select id="shop-charge-acct" class="input">' + acctOpts + '</select>' +
            '<button type="button" class="btn" onclick="App.confirmShopCharge()">确认</button>' +
            '<button type="button" class="btn-ghost" onclick="App.cancelShopCharge()">取消</button></div>';
        }

        return '<div class="shop-list card' + (listOpen ? ' is-open' : '') + '">' +
          '<div class="shop-list-head">' +
          '<button type="button" class="btn-ghost" onclick="App.toggleShopList(\'' + list.id + '\')">' + (listOpen ? '▾' : '▸') + '</button>' +
          '<div class="shop-list-title"><strong>' + esc(list.title) + '</strong>' +
          '<span class="muted"> ' + items.length + ' 项 · 待购 ' + items.filter(function (i) { return !i.bought; }).length + '</span></div>' +
          '<button type="button" class="btn-ghost wk-clear" onclick="App.delShopList(\'' + mod.id + '\',\'' + list.id + '\')">删清单</button></div>' +
          '<div class="shop-list-body"' + (listOpen ? '' : ' hidden') + '>' +
          '<div class="shop-item-list">' + itemsHtml + '</div>' +
          '<div class="form-row shop-item-add">' +
          '<input id="si-name-' + list.id + '" class="input" placeholder="物品名">' +
          '<input id="si-qty-' + list.id + '" class="input" placeholder="数量" style="max-width:72px">' +
          '<input id="si-price-' + list.id + '" class="input" type="number" step="0.01" min="0" placeholder="预估¥" style="max-width:88px">' +
          '<button type="button" class="btn" onclick="App.addShopItem(\'' + mod.id + '\',\'' + list.id + '\')">添加</button></div>' +
          (pendingMoney.length
            ? '<div class="form-row"><button type="button" class="btn" onclick="App.beginShopCharge(\'' + mod.id + '\',\'' + list.id + '\',\'\')">把已购未记账（' + pendingMoney.length + '）记入支出</button></div>'
            : '') +
          chargePanel +
          '</div></div>';
      }).join('') || '<p class="muted wk-view-empty">还没有清单，在下方添加</p>';

      return '<section class="card shop-module' + (modOpen ? ' is-open' : '') + '">' +
        '<div class="work-project-head" onclick="App.toggleShopModule(\'' + mod.id + '\')" role="button" tabindex="0">' +
        '<span class="study-chevron" aria-hidden="true"></span>' +
        '<div class="work-project-title">' +
        '<h3>' + esc(mod.title) + '</h3>' +
        (mod.note ? '<p class="muted">' + esc(mod.note) + '</p>' : '') +
        '<p class="muted">清单 ' + lists.length + ' · 待购 ' + openCount + ' · 已购 ' + boughtCount +
        (modOpen ? '' : ' · 点击展开') + '</p></div>' +
        '<button type="button" class="btn-ghost wk-clear" onclick="event.stopPropagation();App.delShopModule(\'' + mod.id + '\')">删模块</button></div>' +
        '<div class="work-project-body"' + (modOpen ? '' : ' hidden') + '>' +
        listsHtml +
        '<div class="form-row" style="margin-top:10px">' +
        '<input id="sl-title-' + mod.id + '" class="input" placeholder="新清单名称，如周末采购">' +
        '<button type="button" class="btn" onclick="App.addShopList(\'' + mod.id + '\')">添加清单</button></div>' +
        '</div></section>';
    }).join('') || '<p class="muted wk-view-empty">还没有购物模块，先创建一个吧</p>';

    document.getElementById('page').innerHTML =
      '<div class="shop-wrap"><h2>购物清单</h2>' +
      '<p class="muted month-hint">自定义模块（如超市 / 网购），模块下建清单，勾选已购后可记入支出（分类：购物）。</p>' +
      '<section class="card">' +
      '<h3>添加模块</h3>' +
      '<div class="form-row">' +
      '<input id="sm-title" class="input" placeholder="模块名，如超市">' +
      '<input id="sm-note" class="input" placeholder="备注（可选）">' +
      '<button type="button" class="btn" onclick="App.addShopModule()">添加</button></div></section>' +
      '<div class="shop-module-list">' + modHtml + '</div></div>';
  }

  function renderSettings() {
    var cfg = loadSupabaseConfig();
    var meta = loadSyncMeta();
    var loggedIn = !!_sbUser;
    var cloudHtml = '<section class="card cloud-sync-card">' +
      '<p class="muted">登录后自动上传/下载整包数据；多设备用同一邮箱即可同步。</p>' +
      '<div class="form-row"><label>Project URL</label>' +
      '<input id="cloud-url" class="input" type="url" placeholder="https://xxxx.supabase.co" value="' + esc(cfg.url).replace(/"/g, '&quot;') + '"></div>' +
      '<div class="form-row"><label>anon key</label>' +
      '<input id="cloud-anon" class="input" type="text" autocomplete="off" spellcheck="false" placeholder="eyJ... 或 sb_publishable_..." value="' + esc(cfg.anonKey).replace(/"/g, '&quot;') + '"></div>' +
      '<div class="form-row"><button type="button" class="btn" onclick="App.saveCloudConfig()">保存云配置</button></div>';

    if (!loggedIn) {
      cloudHtml += '<div class="cloud-auth">' +
        '<div class="form-row"><label>邮箱</label><input id="cloud-email" class="input" type="email" autocomplete="username" placeholder="you@example.com"></div>' +
        '<div class="form-row"><label>密码</label><input id="cloud-pass" class="input" type="password" autocomplete="current-password" placeholder="至少 6 位"></div>' +
        '<div class="form-row">' +
        '<button type="button" class="btn" onclick="App.cloudSignIn()">登录</button>' +
        '<button type="button" class="btn btn-ghost" onclick="App.cloudSignUp()">注册</button>' +
        '</div></div>';
    } else {
      cloudHtml += '<div class="cloud-auth">' +
        '<p>已登录：<strong>' + esc(_sbUser.email || meta.userEmail || '') + '</strong></p>' +
        '<p class="muted">' + esc(cloudStatusText()) + '</p>' +
        (meta.lastPushAt ? '<p class="muted">上次上传：' + esc(meta.lastPushAt) + '</p>' : '') +
        (meta.lastPullAt ? '<p class="muted">上次下载：' + esc(meta.lastPullAt) + '</p>' : '') +
        (meta.conflict
          ? '<div class="cloud-conflict">' +
            '<p>云端与本机都有较新更改。</p>' +
            '<p class="muted">云端：' + esc(meta.conflict.remoteUpdatedAt || '') + ' · 本机：' + esc(meta.conflict.localUpdatedAt || '') + '</p>' +
            '<div class="form-row">' +
            '<button type="button" class="btn" onclick="App.resolveCloudConflict(\'remote\')">用云端覆盖本机</button>' +
            '<button type="button" class="btn btn-ghost" onclick="App.resolveCloudConflict(\'local\')">用本机覆盖云端</button>' +
            '</div></div>'
          : '') +
        '<div class="form-row">' +
        '<button type="button" class="btn" onclick="App.syncNow()">立即同步</button>' +
        '<button type="button" class="btn btn-ghost" onclick="App.cloudSignOut()">退出登录</button>' +
        '</div></div>';
    }
    cloudHtml += '</section>';

    document.getElementById('page').innerHTML =
      '<h2>设置</h2>' +
      '<div class="form-row"><label>昵称</label><input id="set-name" value="' + esc((state.settings && state.settings.name) || '小鱼') + '">' +
      '<button type="button" onclick="App.saveSettings()">保存</button></div>' +
      '<h3>云同步</h3>' +
      cloudHtml +
      '<h3>添加到主屏幕</h3>' +
      renderA2hsBlock() +
      '<h3>数据</h3><button type="button" onclick="App.exportData()">导出 JSON</button>' +
      '<div class="import-block"><input type="file" id="settings-import-file" accept=".json" style="display:none">' +
      '<button type="button" onclick="App.pickImportFile(\'settings-import\')">选择文件导入</button>' +
      '<textarea id="settings-import-ta" rows="4" placeholder="粘贴 JSON"></textarea>' +
      '<button type="button" onclick="App.importSettings()">导入</button></div>' +
      '<button type="button" onclick="App.clearData()" class="danger">清空全部数据</button>' +
      '<div class="tips"><p>💡 数据默认在本机 localStorage；配置云同步并登录后，多设备自动对齐。</p>' +
      '<p>📱 iPhone 请用 Safari「分享 → 添加到主屏幕」；安卓 / 电脑见上方说明。</p>' +
      '<p>☁ 导出 JSON 仍建议偶尔做额外备份。</p></div>';
  }

  function render() {
    if (state && state.__corrupt) {
      document.getElementById('page').innerHTML =
        '<h2>数据异常</h2><p class="muted">本地 JSON 无法解析，未清空以免丢数据。请在下方粘贴备份 JSON 导入，或从设置导出前的备份恢复。</p>' +
        '<textarea class="textarea" id="settings-import-ta" rows="8" placeholder="粘贴完整 JSON"></textarea>' +
        '<div class="row mt"><button class="btn" onclick="App.importSettings()">尝试导入</button></div>';
      return;
    }
    var mod = state._mod || 'home';
    if (mod === 'home') renderHome();
    else if (mod === 'schedule') renderSchedule();
    else if (mod === 'money') renderMoney();
    else if (mod === 'health') renderHealth();
    else if (mod === 'hobby') renderHobby();
    else if (mod === 'study') renderStudy();
    else if (mod === 'work') renderWork();
    else if (mod === 'shopping') renderShopping();
    else if (mod === 'lang') renderLang();
    else if (mod === 'xuegong') renderXuegong();
    else if (mod === 'settings') renderSettings();
    else renderHome();
    document.querySelectorAll('[data-mod]').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-mod') === mod);
    });
    attachScheduleEditors();
  }

  var App = {
    navigate: navigate,
    addScrap: function () {
      var text = (document.getElementById('scrap-text').value || '').trim();
      if (!text) return;
      state.scraps.push({
        id: uid(), text: text, tags: autoTags(text), mod: state._mod,
        at: new Date().toISOString(), done: false, doneAt: ''
      });
      save(); render(); flash('已添加 ✓');
    },
    toggleScrapDone: function (id) {
      var item = state.scraps.find(function (s) { return s.id === id; });
      if (!item) return;
      item.done = !item.done;
      item.doneAt = item.done ? todayStr() : '';
      save();
      var lab = document.querySelector('.scrap-item[data-id="' + id + '"]');
      if (lab) {
        lab.classList.toggle('is-done', item.done);
        var box = lab.querySelector('.scrap-check');
        if (box) box.checked = item.done;
      }
    },
    delScrap: function (id) {
      state.scraps = state.scraps.filter(function (s) { return s.id !== id; });
      save(); render();
    },
    setSchedTab: function (t) { state._schedTab = t; save(); render(); },
    setSchedDay: function (d) { state._schedDay = d; save(); render(); },
    goSchedToday: function () {
      state._schedDay = todayStr();
      state._schedTab = 'day';
      save(); render();
      flash('已回到今天');
    },
    shiftDay: function (delta) {
      var cur = state._schedDay || todayStr();
      state._schedDay = addDays(cur, delta);
      save(); render();
    },
    shiftMonth: function (delta) {
      var cur = currentSchedMonth().split('-');
      var d = new Date(+cur[0], +cur[1] - 1 + delta, 1);
      state._schedMonth = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      state._monthPick = state._schedMonth + '-01';
      save(); render();
    },
    setMonthPick: function (ds) {
      state._monthPick = ds;
      save(); render();
    },
    addMonthItem: function () {
      var title = (document.getElementById('mon-title').value || '').trim();
      if (!title) { flash('请填写标题'); return; }
      var type = document.getElementById('mon-type').value || 'ddl';
      if (type !== 'ddl' && type !== 'special') type = 'ddl';
      state.schedule.events.push({
        id: uid(),
        title: title,
        date: document.getElementById('mon-date').value || todayStr(),
        time: '',
        endTime: '',
        type: type,
        note: document.getElementById('mon-note').value || ''
      });
      save(); render();
      flash(type === 'ddl' ? 'DDL 已添加 ✓' : '特殊日期已添加 ✓');
    },
    delEvent: function (id) {
      state.schedule.events = state.schedule.events.filter(function (e) { return e.id !== id; });
      save(); render(); flash('已移除 ✓');
    },
    addDayItem: function () {
      var title = (document.getElementById('day-title').value || '').trim();
      if (!title) { flash('请填写标题'); return; }
      var time = document.getElementById('day-time').value || '09:00';
      var endTime = document.getElementById('day-end').value || '';
      var hk = hourKey(time);
      if (hk < 6 || hk > 24) { flash('时间请在 6:00–24:00'); return; }
      if (endTime) {
        var ek = hourKey(endTime);
        if (ek < 6 || (ek === 0 && endTime.indexOf('00:') === 0)) { /* allow */ }
        if (timeToMins(endTime) <= timeToMins(time)) {
          flash('结束时间需晚于开始时间');
          return;
        }
      }
      var kind = document.getElementById('day-kind').value || '';
      if (!kind) { flash('请先添加事件类型'); return; }
      state.schedule.events.push({
        id: uid(),
        title: title,
        date: state._schedDay || todayStr(),
        time: time,
        endTime: endTime,
        type: 'event',
        kind: kind,
        urgency: document.getElementById('day-urgency').value === 'urgent' ? 'urgent' : 'normal',
        note: document.getElementById('day-note').value || ''
      });
      save(); render(); flash('已添加 ✓');
    },
    addDayType: function () {
      var name = (document.getElementById('day-type-new').value || '').trim();
      if (!name) { flash('请填写类型名'); return; }
      ensureSchedule(state);
      var sel = document.getElementById('day-type-color');
      var color = (sel && sel.value) || selectedTypeColor();
      state._dayTypeColor = color;
      var exists = state.schedule.dayTypes.some(function (t) { return t.name === name; });
      if (exists) { flash('类型已存在'); return; }
      state.schedule.dayTypes.push({ name: name, color: color });
      state.schedule.dayTypes = normalizeDayTypes(state.schedule.dayTypes);
      save(); render(); flash('类型已添加 ✓');
    },
    toggleColorPick: function () {
      var menu = document.getElementById('day-color-menu');
      if (!menu) return;
      menu.hidden = !menu.hidden;
    },
    pickTypeColor: function (hex) {
      state._dayTypeColor = hex;
      var hidden = document.getElementById('day-type-color');
      if (hidden) hidden.value = hex;
      var preview = document.getElementById('day-color-preview');
      if (preview) preview.style.background = hex;
      var nameEl = document.getElementById('day-color-name');
      if (nameEl) {
        var label = hex;
        for (var i = 0; i < MORANDI_PALETTE.length; i++) {
          if (MORANDI_PALETTE[i].hex.toLowerCase() === String(hex).toLowerCase()) {
            label = MORANDI_PALETTE[i].name;
            break;
          }
        }
        nameEl.textContent = label;
      }
      var menu = document.getElementById('day-color-menu');
      if (menu) menu.hidden = true;
      var items = document.querySelectorAll('.color-pick-item');
      for (var j = 0; j < items.length; j++) {
        var bg = items[j].querySelector('.color-preview');
        var isOn = bg && bg.style.background.replace(/\s/g, '').toLowerCase() === String(hex).toLowerCase();
        // compare via onclick hex is reliable
        items[j].classList.toggle('on', items[j].getAttribute('onclick').indexOf(hex) >= 0);
      }
    },
    removeDayType: function (name) {
      if (name === '课程') { flash('「课程」为系统类型，不可删除'); return; }
      if (!confirm('确定删除日程类型「' + name + '」？此操作不可恢复。')) return;
      ensureSchedule(state);
      state.schedule.dayTypes = state.schedule.dayTypes.filter(function (t) { return t.name !== name; });
      state.schedule.dayTypes = normalizeDayTypes(state.schedule.dayTypes);
      save(); render(); flash('类型已移除 ✓');
    },
    addTodo: function () {
      var text = (document.getElementById('todo-text').value || '').trim();
      if (!text) { flash('请填写待办'); return; }
      state.schedule.todos.push({
        id: uid(),
        text: text,
        done: false,
        date: document.getElementById('todo-date').value || todayStr(),
        important: document.getElementById('todo-important').value !== '0',
        urgent: document.getElementById('todo-urgent').value === '1'
      });
      save(); render(); flash('待办已添加 ✓');
    },
    toggleTodo: function (id) {
      var t = state.schedule.todos.find(function (x) { return x.id === id; });
      if (t) t.done = !t.done;
      save(); render();
    },
    delTodo: function (id) {
      state.schedule.todos = state.schedule.todos.filter(function (t) { return t.id !== id; });
      save(); render();
    },
    shiftWeek: function (delta) {
      var cur = state._weekKey || mondayOf(todayStr());
      var p = cur.split('-');
      var d = new Date(+p[0], +p[1] - 1, +p[2]);
      d.setDate(d.getDate() + delta * 7);
      state._weekKey = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      state._weekDays = null;
      save(); render();
    },
    setWeekDays: function (n) {
      state._weekDays = Math.max(1, parseInt(n, 10) || 1);
      save(); render();
    },
    addWeekPlan: function () {
      var title = (document.getElementById('wp-title').value || '').trim();
      if (!title) { flash('请填写计划内容'); return; }
      var slot = document.getElementById('wp-slot').value || 'am';
      var kind = document.getElementById('wp-kind').value || '其他';
      var urgency = document.getElementById('wp-urgency').value === 'urgent' ? 'urgent' : 'normal';
      state.schedule.events.push({
        id: uid(),
        title: title,
        date: document.getElementById('wp-date').value || todayStr(),
        time: slotDefaultTime(slot),
        endTime: '',
        type: 'event',
        kind: kind,
        urgency: urgency,
        note: ''
      });
      save(); render(); flash('已添加，日计划同步可见 ✓');
    },
    delWeekPlan: function (id) {
      App.delEvent(id);
    },
    addWeekGoal: function () {
      var text = (document.getElementById('week-goal-one').value || '').trim();
      if (!text) { flash('请填写目标'); return; }
      var key = state._weekKey || mondayOf(todayStr());
      if (!state.schedule.weeks) state.schedule.weeks = {};
      state.schedule.weeks[key] = normalizeWeekMeta(state.schedule.weeks[key]);
      state.schedule.weeks[key].goals.push({ id: uid(), text: text });
      save(); render(); flash('目标已添加 ✓');
    },
    removeWeekGoal: function (id) {
      var key = state._weekKey || mondayOf(todayStr());
      if (!state.schedule.weeks || !state.schedule.weeks[key]) return;
      state.schedule.weeks[key] = normalizeWeekMeta(state.schedule.weeks[key]);
      state.schedule.weeks[key].goals = state.schedule.weeks[key].goals.filter(function (g) { return g.id !== id; });
      save(); render(); flash('已清除 ✓');
    },
    saveWeekSummary: function () {
      var key = state._weekKey || mondayOf(todayStr());
      if (!state.schedule.weeks) state.schedule.weeks = {};
      state.schedule.weeks[key] = normalizeWeekMeta(state.schedule.weeks[key]);
      var summary = (document.getElementById('week-summary').value || '').trim();
      if (!summary) { flash('请填写总结'); return; }
      state.schedule.weeks[key].summary = summary;
      save(); render(); flash('总结已保存 ✓');
    },
    clearWeekField: function (field) {
      var key = state._weekKey || mondayOf(todayStr());
      if (!state.schedule.weeks) state.schedule.weeks = {};
      state.schedule.weeks[key] = normalizeWeekMeta(state.schedule.weeks[key]);
      if (field === 'summary') state.schedule.weeks[key].summary = '';
      save(); render(); flash('已清除 ✓');
    },
    addClass: function () {
      var title = (document.getElementById('cls-title').value || '').trim();
      if (!title) { flash('请填写名称'); return; }
      var mode = (document.getElementById('cls-mode') || {}).value || 'weekly';
      var rangeStart = (document.getElementById('cls-from') || {}).value || '';
      var rangeEnd = (document.getElementById('cls-to') || {}).value || '';
      if (rangeStart && rangeEnd && rangeEnd < rangeStart) {
        flash('循环结束日期不能早于开始日期');
        return;
      }
      var item = {
        id: uid(),
        title: title,
        mode: mode,
        weekday: +((document.getElementById('cls-wd') || {}).value || 1),
        start: (document.getElementById('cls-start') || {}).value || '',
        end: (document.getElementById('cls-end') || {}).value || '',
        place: (document.getElementById('cls-place') || {}).value || '',
        kind: (document.getElementById('cls-kind') || {}).value || '课程',
        rangeStart: rangeStart,
        rangeEnd: rangeEnd
      };
      normalizeRoutine(item);
      state.schedule.classes.push(item);
      save(); render(); flash('已添加循环日常 ✓');
    },
    delClass: function (id) {
      state.schedule.classes = state.schedule.classes.filter(function (c) { return c.id !== id; });
      save(); render();
    },
    beginPlanSync: function (target, key) {
      var src = resolvePlanSyncSource(key);
      if (!src) { flash('未找到该项'); return; }
      var parts = String(key).split(':');
      if (parts[0] === 'work') {
        if (!state._workOpen) state._workOpen = {};
        if (parts[1] === 'proj' || parts[1] === 'task' || parts[1] === 'sub') state._workOpen[parts[2]] = true;
        if (parts[1] === 'task' || parts[1] === 'sub') {
          if (!state._workTaskOpen) state._workTaskOpen = {};
          state._workTaskOpen[parts[3]] = true;
        }
        if (parts[1] === 'tutor' || parts[1] === 'lesson') {
          if (!state._tutorOpen) state._tutorOpen = {};
          state._tutorOpen[parts[2]] = true;
        }
      }
      if (parts[0] === 'xg') {
        if (!state._sopOpen) state._sopOpen = {};
        if (parts[1] === 'sop' || parts[1] === 'step' || parts[1] === 'task') state._sopOpen[parts[3]] = true;
      }
      state._planSync = {
        target: target === 'week' ? 'week' : 'day',
        key: key,
        date: src.date || todayStr(),
        time: src.time || '09:00',
        endTime: src.endTime || '10:00',
        slot: src.time ? slotFromTime(src.time) : 'am'
      };
      save(); render();
    },
    cancelPlanSync: function () {
      state._planSync = null;
      save(); render();
    },
    confirmPlanSync: function () {
      var draft = state._planSync;
      if (!draft) return;
      var src = resolvePlanSyncSource(draft.key);
      if (!src) { state._planSync = null; save(); render(); return; }
      var dateEl = document.getElementById('plan-sync-date');
      var date = dateEl && dateEl.value ? dateEl.value : (draft.date || todayStr());
      if (!date) { flash('请选择日期'); return; }
      var time = '09:00';
      var endTime = '';
      if (draft.target === 'week') {
        var slotEl = document.getElementById('plan-sync-slot');
        var slot = slotEl && slotEl.value ? slotEl.value : (draft.slot || 'am');
        time = slotDefaultTime(slot);
        endTime = '';
      } else {
        var timeEl = document.getElementById('plan-sync-time');
        var endEl = document.getElementById('plan-sync-end');
        time = timeEl && timeEl.value ? timeEl.value : (draft.time || '09:00');
        endTime = endEl && endEl.value ? endEl.value : (draft.endTime || '');
        if (!time) { flash('请选择开始时间'); return; }
        if (endTime && endTime <= time) { flash('结束时间需晚于开始时间'); return; }
      }
      pushPlanFromModule({
        title: src.title,
        date: date,
        time: time,
        endTime: endTime,
        kind: src.kind,
        note: src.note,
        fromWork: src.fromWork || '',
        fromXuegong: src.fromXuegong || ''
      });
      state._planSync = null;
      save(); render();
      flash(draft.target === 'week' ? '已加入周计划 ✓' : '已加入日计划 ✓');
    },
    addRecord: function () {
      var amt = parseFloat(document.getElementById('rec-amt').value) || 0;
      if (!amt) return;
      var rec = {
        id: uid(),
        account: document.getElementById('rec-acct').value,
        io: document.getElementById('rec-io').value,
        amount: amt,
        cat: document.getElementById('rec-cat').value,
        note: document.getElementById('rec-note').value || '',
        date: document.getElementById('rec-date').value || todayStr()
      };
      rec.sig = moneySig(rec);
      state.money.records.push(rec);
      var delta = rec.io === 'in' ? amt : -amt;
      state.money.accounts[rec.account] = (state.money.accounts[rec.account] || 0) + delta;
      save(); render(); flash('已记账 ✓');
    },
    delRecord: function (id) {
      var rec = state.money.records.find(function (r) { return r.id === id; });
      if (rec) {
        var delta = rec.io === 'in' ? -rec.amount : rec.amount;
        if (state.money.accounts[rec.account] != null) state.money.accounts[rec.account] += delta;
      }
      state.money.records = state.money.records.filter(function (r) { return r.id !== id; });
      save(); render();
    },
    addExercise: function () {
      state.health.exercise.push({
        id: uid(),
        date: document.getElementById('ex-date').value || todayStr(),
        type: document.getElementById('ex-type').value || '',
        mins: +document.getElementById('ex-mins').value || 0,
        note: document.getElementById('ex-note').value || ''
      });
      save(); render();
    },
    syncOneExercise: function (eventId) {
      ensureSchedule(state);
      ensureHealth(state);
      var ev = state.schedule.events.find(function (e) { return e.id === eventId; });
      if (!ev || !isSportEvent(ev)) { flash('未找到该运动日程'); return; }
      var already = state.health.exercise.some(function (ex) { return ex.fromEventId === eventId; });
      if (already) { flash('已添加过这条'); return; }
      state.health.exercise.push(exerciseFromEvent(ev));
      save(); render(); flash('已从日程添加 ✓');
    },
    syncAllExercises: function () {
      var pending = pendingSportEvents();
      if (!pending.length) { flash('没有待同步的运动'); return; }
      pending.forEach(function (ev) {
        state.health.exercise.push(exerciseFromEvent(ev));
      });
      save(); render(); flash('已同步 ' + pending.length + ' 条运动 ✓');
    },
    delExercise: function (id) {
      state.health.exercise = state.health.exercise.filter(function (e) { return e.id !== id; });
      save(); render();
    },
    addWeight: function () {
      var kg = parseFloat(document.getElementById('wt-kg').value);
      if (!kg) return;
      state.health.weight.push({
        id: uid(),
        date: document.getElementById('wt-date').value || todayStr(),
        kg: kg
      });
      save(); render();
    },
    delWeight: function (id) {
      state.health.weight = state.health.weight.filter(function (w) { return w.id !== id; });
      save(); render();
    },
    addDiet: function () {
      state.health.diet.push({
        id: uid(),
        date: document.getElementById('diet-date').value || todayStr(),
        name: document.getElementById('diet-name').value || '',
        kcal: +document.getElementById('diet-kcal').value || 0,
        p: +document.getElementById('diet-p').value || 0,
        c: +document.getElementById('diet-c').value || 0,
        f: +document.getElementById('diet-f').value || 0,
        meal: document.getElementById('diet-meal').value || '午餐'
      });
      save(); render();
    },
    delDiet: function (id) {
      state.health.diet = state.health.diet.filter(function (d) { return d.id !== id; });
      save(); render();
    },
    fillDiet: function (i) {
      var f = LOCAL_FOODS[i];
      if (!f) return;
      document.getElementById('diet-name').value = f.name;
      document.getElementById('diet-kcal').value = f.kcal;
      document.getElementById('diet-p').value = f.p;
      document.getElementById('diet-c').value = f.c;
      document.getElementById('diet-f').value = f.f;
    },
    searchFood: function () {
      var q = (document.getElementById('diet-name').value || '').trim();
      var el = document.getElementById('food-search-results');
      if (!q) { el.innerHTML = '<p>请输入食物名</p>'; return; }
      el.innerHTML = '<p>搜索中…</p>';
      var ctrl = new AbortController();
      var timer = setTimeout(function () { ctrl.abort(); }, 6000);
      var url = 'https://world.openfoodfacts.org/cgi/search.pl?search_terms=' + encodeURIComponent(q) +
        '&search_simple=1&action=process&json=1&page_size=6';
      fetch(url, { signal: ctrl.signal }).then(function (r) { return r.json(); }).then(function (data) {
        clearTimeout(timer);
        var products = (data && data.products) || [];
        if (!products.length) {
          el.innerHTML = '<p>未找到，试试下方本地食物</p>';
          return;
        }
        el.innerHTML = products.slice(0, 6).map(function (p, idx) {
          var n = p.product_name || p.product_name_zh || '未知';
          var kcal = p.nutriments && p.nutriments['energy-kcal_100g'] ? Math.round(p.nutriments['energy-kcal_100g']) : 0;
          var prot = p.nutriments && p.nutriments.proteins_100g ? p.nutriments.proteins_100g : 0;
          var carb = p.nutriments && p.nutriments.carbohydrates_100g ? p.nutriments.carbohydrates_100g : 0;
          var fat = p.nutriments && p.nutriments.fat_100g ? p.nutriments.fat_100g : 0;
          return '<button type="button" class="food-btn" onclick="App.applySearchFood(' + idx + ')" data-kcal="' + kcal +
            '" data-p="' + prot + '" data-c="' + carb + '" data-f="' + fat + '" data-name="' + esc(n).replace(/"/g, '&quot;') + '">' +
            esc(n) + ' ~' + kcal + 'kcal/100g</button>';
        }).join('');
        el._products = products;
      }).catch(function () {
        clearTimeout(timer);
        el.innerHTML = '<p>搜索失败，请用本地食物或手动输入</p>';
      });
    },
    applySearchFood: function (idx) {
      var el = document.getElementById('food-search-results');
      var p = el._products && el._products[idx];
      if (!p) return;
      document.getElementById('diet-name').value = p.product_name || p.product_name_zh || '';
      var nut = p.nutriments || {};
      document.getElementById('diet-kcal').value = nut['energy-kcal_100g'] ? Math.round(nut['energy-kcal_100g']) : 0;
      document.getElementById('diet-p').value = nut.proteins_100g || 0;
      document.getElementById('diet-c').value = nut.carbohydrates_100g || 0;
      document.getElementById('diet-f').value = nut.fat_100g || 0;
    },
    setHealthTab: function (t) { state._healthTab = t; save(); render(); },
    savePeriodSettings: function () {
      computePeriodStats();
      save(); render(); flash('已按过往经期重新计算 ✓');
    },
    markPeriodStart: function () {
      ensureHealth(state);
      var date = document.getElementById('per-mark-date').value || todayStr();
      var open = getOpenCycle();
      if (open) { flash('请先结束当前经期'); return; }
      state.health.period.cycles.push({
        id: uid(), start: date, end: '', summary: '', days: []
      });
      state.health.period.lastStart = date;
      computePeriodStats();
      save(); render(); flash('经期已开始 ✓');
    },
    markPeriodEnd: function () {
      ensureHealth(state);
      var date = document.getElementById('per-mark-date').value || todayStr();
      var open = getOpenCycle();
      if (!open) { flash('当前没有进行中的经期'); return; }
      if (date < open.start) { flash('结束日不能早于开始日'); return; }
      open.end = date;
      computePeriodStats();
      save(); render(); flash('经期已结束 ✓');
    },
    addPeriodDay: function () {
      ensureHealth(state);
      var date = document.getElementById('pd-date').value || todayStr();
      var cycle = findCycleForDate(date);
      if (!cycle) { flash('请先标记经期开始'); return; }
      if (date < cycle.start) { flash('日期不能早于经期开始'); return; }
      if (cycle.end && date > cycle.end) { flash('日期已超出该经期结束日'); return; }
      var symptoms = [];
      var boxes = document.querySelectorAll('.per-sym:checked');
      for (var si = 0; si < boxes.length; si++) symptoms.push(boxes[si].value);
      var existing = (cycle.days || []).find(function (d) { return d.date === date; });
      var payload = {
        date: date,
        flow: document.getElementById('pd-flow').value || 'medium',
        symptoms: symptoms,
        meds: document.getElementById('pd-meds').value === '1',
        medNote: (document.getElementById('pd-med-note').value || '').trim(),
        relief: document.getElementById('pd-relief').value || '',
        note: (document.getElementById('pd-note').value || '').trim()
      };
      if (existing) {
        Object.assign(existing, payload);
      } else {
        payload.id = uid();
        if (!cycle.days) cycle.days = [];
        cycle.days.push(payload);
      }
      save(); render(); flash(existing ? '已更新当日记录 ✓' : '已保存每日记录 ✓');
    },
    delPeriodDay: function (cycleId, dayId) {
      ensureHealth(state);
      var cycle = state.health.period.cycles.find(function (c) { return c.id === cycleId; });
      if (!cycle) return;
      cycle.days = (cycle.days || []).filter(function (d) { return d.id !== dayId; });
      save(); render();
    },
    delPeriodCycle: function (id) {
      ensureHealth(state);
      state.health.period.cycles = state.health.period.cycles.filter(function (c) { return c.id !== id; });
      var latest = latestPeriodStart();
      state.health.period.lastStart = latest || '';
      save(); render();
    },
    saveCycleSummary: function (id) {
      ensureHealth(state);
      var cycle = state.health.period.cycles.find(function (c) { return c.id === id; });
      if (!cycle) return;
      var ta = document.getElementById('per-sum-' + id);
      cycle.summary = ta ? ta.value : '';
      save(); flash('总结已保存 ✓');
    },
    addPeriodLog: function () {
      // 兼容旧导入：转为周期数据
      ensureHealth(state);
      var date = document.getElementById('plog-date') ? document.getElementById('plog-date').value : todayStr();
      var type = document.getElementById('plog-type') ? document.getElementById('plog-type').value : 'note';
      var note = document.getElementById('plog-note') ? document.getElementById('plog-note').value : '';
      if (type === 'start') {
        document.getElementById('per-mark-date') && (document.getElementById('per-mark-date').value = date);
        App.markPeriodStart();
        return;
      }
      if (type === 'end') {
        document.getElementById('per-mark-date') && (document.getElementById('per-mark-date').value = date);
        App.markPeriodEnd();
        return;
      }
      var cycle = findCycleForDate(date) || getOpenCycle();
      if (!cycle) { flash('请先标记经期开始'); return; }
      cycle.days.push({
        id: uid(), date: date, flow: 'medium', symptoms: [], meds: false, medNote: '', relief: '', note: note || ''
      });
      save(); render();
    },
    delPeriodLog: function (id) {
      ensureHealth(state);
      state.health.period.logs = (state.health.period.logs || []).filter(function (l) { return l.id !== id; });
      state.health.period.cycles.forEach(function (c) {
        c.days = (c.days || []).filter(function (d) { return d.id !== id; });
      });
      save(); render();
    },
    addHobby: function () {
      ensureHobby(state);
      var title = (document.getElementById('hobby-title').value || '').trim();
      if (!title) { flash('请填写项目名称'); return; }
      state.hobby.items.push({
        id: uid(),
        title: title,
        plan: (document.getElementById('hobby-plan').value || '').trim(),
        checkins: [],
        records: [],
        summary: ''
      });
      save(); render(); flash('项目已添加 ✓');
    },
    setHobbyTab: function (t) {
      state._hobbyTab = t;
      save(); render();
    },
    hobbyCheckIn: function (id, done) {
      ensureHobby(state);
      var it = state.hobby.items.find(function (x) { return x.id === id; });
      if (!it) return;
      var today = todayStr();
      var existing = hobbyTodayCheck(it);
      var wasDone = !!(existing && existing.done);
      if (existing) {
        existing.done = !!done;
      } else {
        it.checkins.push({ id: uid(), date: today, done: !!done });
      }
      save(); render();
      if (done && !wasDone) flash('打卡成功，鱼缸里多了一条小鱼 🐟');
      else if (done) flash('今日已打卡 ✓');
      else if (wasDone && !done) flash('已取消今日打卡，小鱼游走了');
      else flash('已标记：没做');
    },
    hobbyCheck: function (id) {
      App.hobbyCheckIn(id, 1);
    },
    addHobbyRecord: function () {
      ensureHobby(state);
      var date = document.getElementById('hr-date').value || todayStr();
      var title = (document.getElementById('hr-title').value || '').trim();
      var what = (document.getElementById('hr-what').value || '').trim();
      var feeling = (document.getElementById('hr-feeling').value || '').trim();
      var withWhom = (document.getElementById('hr-with').value || '').trim();
      var place = (document.getElementById('hr-place').value || '').trim();
      if (!title && !what && !feeling && !withWhom && !place) {
        flash('写一点内容再记下吧');
        return;
      }
      var itemId = document.getElementById('hr-item').value || '';
      var amt = parseFloat(document.getElementById('hr-amt').value) || 0;
      var account = document.getElementById('hr-acct').value || 'wechat';
      var cat = document.getElementById('hr-cat').value || '娱乐';
      var spend = null;
      var moneyId = '';
      if (amt > 0) {
        var noteParts = [];
        if (title) noteParts.push(title);
        if (what) noteParts.push(what);
        noteParts.push('兴趣记录');
        moneyId = addMoneyFromHobby({
          amount: amt,
          account: account,
          cat: cat,
          date: date,
          note: noteParts.join(' · ')
        });
        spend = { amount: amt, account: account, cat: cat };
      }
      state.hobby.moments.push({
        id: uid(),
        date: date,
        title: title,
        itemId: itemId,
        withWhom: withWhom,
        place: place,
        what: what,
        feeling: feeling,
        spend: spend,
        moneyId: moneyId
      });
      save(); render();
      flash(amt > 0 ? '已记下，并同步记账 ✓' : '已记下这一刻 ✓');
    },
    delHobbyRecord: function (mid) {
      ensureHobby(state);
      var m = state.hobby.moments.find(function (x) { return x.id === mid; });
      if (m && m.moneyId) removeMoneyById(m.moneyId);
      state.hobby.moments = state.hobby.moments.filter(function (x) { return x.id !== mid; });
      save(); render();
    },
    saveHobbySummary: function (id) {
      ensureHobby(state);
      var it = state.hobby.items.find(function (x) { return x.id === id; });
      if (!it) return;
      var ta = document.getElementById('hobby-sum-' + id);
      it.summary = ta ? ta.value : '';
      save(); flash('总结已保存 ✓');
    },
    delHobby: function (id) {
      ensureHobby(state);
      state.hobby.items = state.hobby.items.filter(function (x) { return x.id !== id; });
      state.hobby.moments.forEach(function (m) {
        if (m.itemId === id) m.itemId = '';
      });
      save(); render();
    },
    addCourse: function () {
      ensureStudy(state);
      var name = (document.getElementById('course-name').value || '').trim();
      if (!name) { flash('请填写课程名'); return; }
      var id = uid();
      state.study.courses.push({
        id: id,
        name: name,
        progress: 0,
        note: (document.getElementById('course-note').value || '').trim()
      });
      if (!state._studyOpen) state._studyOpen = {};
      state._studyOpen[id] = true;
      save(); render(); flash('课程已添加 ✓');
    },
    toggleStudyCourse: function (id) {
      if (!state._studyOpen) state._studyOpen = {};
      state._studyOpen[id] = !state._studyOpen[id];
      save(); render();
    },
    delCourse: function (id) {
      ensureStudy(state);
      ensureSchedule(state);
      var taskIds = {};
      state.study.tasks.forEach(function (t) {
        if (t.courseId === id) {
          taskIds[t.id] = 1;
          if (t.eventId) {
            state.schedule.events = state.schedule.events.filter(function (e) { return e.id !== t.eventId; });
          }
        }
      });
      state.schedule.events = state.schedule.events.filter(function (e) { return !e._fromStudy || !taskIds[e._fromStudy]; });
      state.study.courses = state.study.courses.filter(function (c) { return c.id !== id; });
      state.study.tasks = state.study.tasks.filter(function (t) { return t.courseId !== id; });
      state.study.notes = state.study.notes.filter(function (n) { return n.courseId !== id; });
      if (state._studyOpen) delete state._studyOpen[id];
      save(); render();
    },
    addStudyTask: function (courseId) {
      ensureStudy(state);
      var cid = courseId || (document.getElementById('task-course') && document.getElementById('task-course').value);
      var input = document.getElementById('task-title-' + cid) || document.getElementById('task-title');
      var title = (input && input.value || '').trim();
      if (!cid) { flash('请先添加课程'); return; }
      if (!title) { flash('请填写任务'); return; }
      state.study.tasks.push({
        id: uid(), title: title, done: false, courseId: cid,
        eventId: '', syncType: ''
      });
      if (!state._studyOpen) state._studyOpen = {};
      state._studyOpen[cid] = true;
      save(); render();
    },
    syncStudyTask: function (taskId, sync) {
      App.beginStudySync(taskId, sync);
    },
    beginStudySync: function (taskId, sync) {
      ensureStudy(state);
      var task = state.study.tasks.find(function (t) { return t.id === taskId; });
      if (!task) return;
      if (task.eventId) { flash('该任务已同步过'); return; }
      if (!state._studyOpen) state._studyOpen = {};
      state._studyOpen[task.courseId] = true;
      state._studySync = {
        taskId: taskId,
        sync: sync === 'ddl' ? 'ddl' : 'sched',
        date: todayStr(),
        time: '09:00',
        endTime: '10:00'
      };
      save(); render();
    },
    cancelStudySync: function () {
      state._studySync = null;
      save(); render();
    },
    confirmStudySync: function () {
      ensureStudy(state);
      var draft = state._studySync;
      if (!draft) return;
      var task = state.study.tasks.find(function (t) { return t.id === draft.taskId; });
      if (!task) { state._studySync = null; save(); render(); return; }
      if (task.eventId) { flash('该任务已同步过'); state._studySync = null; save(); render(); return; }
      var dateEl = document.getElementById('study-sync-date');
      var date = dateEl && dateEl.value ? dateEl.value : (draft.date || todayStr());
      if (!date) { flash('请选择日期'); return; }
      var sync = draft.sync === 'ddl' ? 'ddl' : 'sched';
      var time = '';
      var endTime = '';
      if (sync === 'sched') {
        var timeEl = document.getElementById('study-sync-time');
        var endEl = document.getElementById('study-sync-end');
        time = timeEl && timeEl.value ? timeEl.value : (draft.time || '09:00');
        endTime = endEl && endEl.value ? endEl.value : (draft.endTime || '');
        if (!time) { flash('请选择开始时间'); return; }
        if (endTime && endTime <= time) { flash('结束时间需晚于开始时间'); return; }
      }
      var course = state.study.courses.find(function (c) { return c.id === task.courseId; });
      pushStudyTaskToSchedule(task, course ? course.name : '', sync, date, time, endTime);
      state._studySync = null;
      save(); render();
      flash(sync === 'ddl' ? '已同步到 DDL ✓' : '已同步到日程 ✓');
    },
    toggleStudyTask: function (id) {
      ensureStudy(state);
      var t = state.study.tasks.find(function (x) { return x.id === id; });
      if (t) t.done = !t.done;
      save(); render();
    },
    delStudyTask: function (id) {
      ensureStudy(state);
      ensureSchedule(state);
      var t = state.study.tasks.find(function (x) { return x.id === id; });
      if (t && t.eventId) {
        state.schedule.events = state.schedule.events.filter(function (e) { return e.id !== t.eventId; });
      }
      state.schedule.events = state.schedule.events.filter(function (e) { return e._fromStudy !== id; });
      state.study.tasks = state.study.tasks.filter(function (x) { return x.id !== id; });
      save(); render();
    },
    addNote: function (courseId) {
      ensureStudy(state);
      var cid = courseId || (document.getElementById('note-course') && document.getElementById('note-course').value);
      if (!cid) { flash('请先添加课程'); return; }
      var ta = document.getElementById('note-text-' + cid) || document.getElementById('note-text');
      var text = (ta && ta.value || '').trim();
      var fileInput = document.getElementById('note-file-' + cid);
      var fileList = fileInput && fileInput.files ? fileInput.files : [];
      if (!text && (!fileList || !fileList.length)) { flash('请写笔记或选择文件'); return; }
      readFilesAsDataURLs(fileList, 1.5 * 1024 * 1024, function (files, skipped) {
        state.study.notes.push({
          id: uid(),
          text: text,
          courseId: cid,
          at: new Date().toISOString().slice(0, 16).replace('T', ' '),
          files: files || []
        });
        save(); render();
        if (skipped) flash('笔记已添加（有 ' + skipped + ' 个文件因过大未上传）');
        else flash('笔记已添加 ✓');
      });
    },
    attachStudyFiles: function (noteId) {
      ensureStudy(state);
      var note = state.study.notes.find(function (n) { return n.id === noteId; });
      if (!note) return;
      var input = document.getElementById('note-attach-' + noteId);
      if (!input || !input.files || !input.files.length) { flash('请先选择文件'); return; }
      readFilesAsDataURLs(input.files, 1.5 * 1024 * 1024, function (files, skipped) {
        if (!note.files) note.files = [];
        (files || []).forEach(function (f) { note.files.push(f); });
        save(); render();
        if (skipped) flash('已追加（有 ' + skipped + ' 个过大未上传）');
        else flash('附件已添加 ✓');
      });
    },
    openStudyFile: function (noteId, fileId) {
      ensureStudy(state);
      var note = state.study.notes.find(function (n) { return n.id === noteId; });
      if (!note) return;
      var f = (note.files || []).find(function (x) { return x.id === fileId; });
      if (!f || !f.data) { flash('文件不可用'); return; }
      if (studyFileOpenable(f.type)) {
        var w = window.open();
        if (!w) { flash('请允许弹窗以打开文件'); return; }
        if (/^image\//.test(f.type)) {
          w.document.write('<!doctype html><title>' + esc(f.name) + '</title><body style="margin:0;background:#111;display:flex;justify-content:center;align-items:center;min-height:100vh">' +
            '<img src="' + f.data + '" alt="' + esc(f.name) + '" style="max-width:100%;max-height:100vh;object-fit:contain"></body>');
        } else if (f.type === 'application/pdf') {
          w.location.href = f.data;
        } else {
          w.document.write('<!doctype html><title>' + esc(f.name) + '</title><pre style="white-space:pre-wrap;padding:16px;font:14px/1.5 sans-serif"></pre>');
          try {
            var raw = f.data.split(',')[1] || '';
            w.document.querySelector('pre').textContent = decodeURIComponent(escape(atob(raw)));
          } catch (e) {
            w.document.querySelector('pre').textContent = '无法预览，请下载查看';
          }
        }
      } else {
        App.downloadStudyFile(noteId, fileId);
      }
    },
    downloadStudyFile: function (noteId, fileId) {
      ensureStudy(state);
      var note = state.study.notes.find(function (n) { return n.id === noteId; });
      if (!note) return;
      var f = (note.files || []).find(function (x) { return x.id === fileId; });
      if (!f || !f.data) { flash('文件不可用'); return; }
      var a = document.createElement('a');
      a.href = f.data;
      a.download = f.name || '附件';
      document.body.appendChild(a);
      a.click();
      a.remove();
    },
    delStudyFile: function (noteId, fileId) {
      ensureStudy(state);
      var note = state.study.notes.find(function (n) { return n.id === noteId; });
      if (!note) return;
      note.files = (note.files || []).filter(function (f) { return f.id !== fileId; });
      save(); render();
    },
    delNote: function (id) {
      ensureStudy(state);
      state.study.notes = state.study.notes.filter(function (n) { return n.id !== id; });
      save(); render();
    },
    pinSelection: function () {
      ensureStudy(state);
      var sel = window.getSelection();
      var text = sel ? sel.toString().trim() : '';
      if (!text) { flash('请先选中文字'); return; }
      var courseId = state.study.courses.length ? state.study.courses[0].id : '';
      if (!courseId) { flash('请先添加一门课程'); return; }
      state.study.notes.push({
        id: uid(), text: text, courseId: courseId,
        at: new Date().toISOString().slice(0, 16).replace('T', ' '),
        files: []
      });
      save(); render(); flash('已标记到「' + state.study.courses[0].name + '」✓');
    },
    setWorkTab: function (t) {
      state._workTab = t === 'prep' ? 'prep' : 'items';
      save(); render();
    },
    toggleWorkDoneFold: function () {
      state._workShowDone = !state._workShowDone;
      save(); render();
    },
    toggleXgDoneFold: function () {
      state._xgShowDone = !state._xgShowDone;
      save(); render();
    },
    addShopModule: function () {
      ensureShopping(state);
      var title = (document.getElementById('sm-title').value || '').trim();
      if (!title) { flash('请填写模块名'); return; }
      var id = uid();
      state.shopping.modules.push({
        id: id,
        title: title,
        note: (document.getElementById('sm-note').value || '').trim(),
        lists: []
      });
      if (!state._shopOpen) state._shopOpen = {};
      state._shopOpen[id] = true;
      save(); render(); flash('模块已添加 ✓');
    },
    delShopModule: function (modId) {
      ensureShopping(state);
      var mod = findShopModule(modId);
      if (mod) {
        (mod.lists || []).forEach(function (list) {
          (list.items || []).forEach(function (it) {
            if (it.moneyId) removeMoneyById(it.moneyId);
          });
        });
      }
      state.shopping.modules = state.shopping.modules.filter(function (m) { return m.id !== modId; });
      save(); render();
    },
    toggleShopModule: function (modId) {
      if (!state._shopOpen) state._shopOpen = {};
      state._shopOpen[modId] = !state._shopOpen[modId];
      save(); render();
    },
    addShopList: function (modId) {
      var mod = findShopModule(modId);
      if (!mod) return;
      var title = ((document.getElementById('sl-title-' + modId) || {}).value || '').trim();
      if (!title) { flash('请填写清单名'); return; }
      var id = uid();
      mod.lists.push({ id: id, title: title, note: '', items: [] });
      if (!state._shopListOpen) state._shopListOpen = {};
      state._shopListOpen[id] = true;
      if (!state._shopOpen) state._shopOpen = {};
      state._shopOpen[modId] = true;
      save(); render(); flash('清单已添加 ✓');
    },
    delShopList: function (modId, listId) {
      var mod = findShopModule(modId);
      if (!mod) return;
      var list = (mod.lists || []).find(function (l) { return l.id === listId; });
      if (list) {
        (list.items || []).forEach(function (it) {
          if (it.moneyId) removeMoneyById(it.moneyId);
        });
      }
      mod.lists = (mod.lists || []).filter(function (l) { return l.id !== listId; });
      save(); render();
    },
    toggleShopList: function (listId) {
      if (!state._shopListOpen) state._shopListOpen = {};
      var cur = state._shopListOpen[listId];
      state._shopListOpen[listId] = cur === false;
      save(); render();
    },
    addShopItem: function (modId, listId) {
      var list = findShopList(modId, listId);
      if (!list) return;
      var name = ((document.getElementById('si-name-' + listId) || {}).value || '').trim();
      if (!name) { flash('请填写物品名'); return; }
      var qty = ((document.getElementById('si-qty-' + listId) || {}).value || '').trim();
      var price = parseFloat((document.getElementById('si-price-' + listId) || {}).value) || 0;
      list.items.push({
        id: uid(), name: name, qty: qty, unit: '', price: price, bought: false, moneyId: '', note: ''
      });
      if (!state._shopListOpen) state._shopListOpen = {};
      state._shopListOpen[listId] = true;
      save(); render();
    },
    delShopItem: function (modId, listId, itemId) {
      var list = findShopList(modId, listId);
      if (!list) return;
      var item = (list.items || []).find(function (i) { return i.id === itemId; });
      if (item && item.moneyId) removeMoneyById(item.moneyId);
      list.items = (list.items || []).filter(function (i) { return i.id !== itemId; });
      save(); render();
    },
    toggleShopItem: function (modId, listId, itemId) {
      var item = findShopItem(modId, listId, itemId);
      if (!item) return;
      item.bought = !item.bought;
      save(); render();
    },
    beginShopCharge: function (modId, listId, itemId) {
      ensureShopping(state);
      var amount = 0;
      if (itemId) {
        var item = findShopItem(modId, listId, itemId);
        if (!item || !item.bought || item.moneyId) { flash('该项无需记账'); return; }
        amount = item.price || 0;
      } else {
        var list = findShopList(modId, listId);
        if (!list) return;
        (list.items || []).forEach(function (it) {
          if (it.bought && !it.moneyId) amount += (+it.price || 0);
        });
      }
      state._shopCharge = { modId: modId, listId: listId, itemId: itemId || '', amount: amount };
      if (!state._shopOpen) state._shopOpen = {};
      state._shopOpen[modId] = true;
      if (!state._shopListOpen) state._shopListOpen = {};
      state._shopListOpen[listId] = true;
      save(); render();
    },
    cancelShopCharge: function () {
      state._shopCharge = null;
      save(); render();
    },
    confirmShopCharge: function () {
      var draft = state._shopCharge;
      if (!draft) return;
      var amtEl = document.getElementById('shop-charge-amt');
      var acctEl = document.getElementById('shop-charge-acct');
      var amount = parseFloat(amtEl && amtEl.value) || 0;
      var account = (acctEl && acctEl.value) || 'wechat';
      if (!amount) { flash('请填写金额'); return; }
      var mod = findShopModule(draft.modId);
      var list = findShopList(draft.modId, draft.listId);
      if (!mod || !list) { state._shopCharge = null; save(); render(); return; }
      var noteBase = '购物 · ' + mod.title + ' · ' + list.title;
      if (draft.itemId) {
        var one = findShopItem(draft.modId, draft.listId, draft.itemId);
        if (!one || one.moneyId) { flash('该项已记账或不存在'); return; }
        one.moneyId = addMoneyRecord({
          io: 'out', amount: amount, account: account, cat: '购物',
          note: noteBase + ' · ' + one.name, fromShopping: true
        });
        one.bought = true;
        if (!one.price) one.price = amount;
      } else {
        var targets = (list.items || []).filter(function (it) { return it.bought && !it.moneyId; });
        if (!targets.length) { flash('没有待记账项'); return; }
        var mid = addMoneyRecord({
          io: 'out', amount: amount, account: account, cat: '购物',
          note: noteBase + ' · ' + targets.map(function (t) { return t.name; }).join('、'),
          fromShopping: true
        });
        targets.forEach(function (it) { it.moneyId = mid; });
      }
      state._shopCharge = null;
      save(); render();
      flash('已记入支出 ✓');
    },
    addWorkProject: function () {
      ensureWork(state);
      var title = (document.getElementById('wp-title').value || '').trim();
      if (!title) { flash('请填写项目名称'); return; }
      var id = uid();
      state.work.projects.push({
        id: id,
        title: title,
        note: (document.getElementById('wp-note').value || '').trim(),
        tasks: []
      });
      if (!state._workOpen) state._workOpen = {};
      state._workOpen[id] = true;
      save(); render(); flash('项目已添加 ✓');
    },
    toggleWorkProject: function (id) {
      if (!state._workOpen) state._workOpen = {};
      state._workOpen[id] = !state._workOpen[id];
      save(); render();
    },
    delWorkProject: function (id) {
      ensureWork(state);
      state.work.projects = state.work.projects.filter(function (p) { return p.id !== id; });
      if (state._workOpen) delete state._workOpen[id];
      save(); render();
    },
    addWorkTask: function (projectId) {
      ensureWork(state);
      var p = state.work.projects.find(function (x) { return x.id === projectId; });
      if (!p) return;
      var titleEl = document.getElementById('wt-title-' + projectId);
      var contentEl = document.getElementById('wt-content-' + projectId);
      var ddlEl = document.getElementById('wt-ddl-' + projectId);
      var title = (titleEl && titleEl.value || '').trim();
      if (!title) { flash('请填写任务标题'); return; }
      p.tasks.push({
        id: uid(),
        title: title,
        content: (contentEl && contentEl.value || '').trim(),
        ddl: ddlEl && ddlEl.value ? ddlEl.value : '',
        done: false,
        subs: [],
        at: new Date().toISOString().slice(0, 16).replace('T', ' ')
      });
      if (!state._workOpen) state._workOpen = {};
      state._workOpen[projectId] = true;
      save(); render(); flash('任务已添加 ✓');
    },
    toggleWorkTaskSubs: function (taskId) {
      if (!state._workTaskOpen) state._workTaskOpen = {};
      state._workTaskOpen[taskId] = !state._workTaskOpen[taskId];
      save(); render();
    },
    addWorkSub: function (projectId, taskId) {
      ensureWork(state);
      var p = state.work.projects.find(function (x) { return x.id === projectId; });
      if (!p) return;
      var t = p.tasks.find(function (x) { return x.id === taskId; });
      if (!t) return;
      var input = document.getElementById('ws-title-' + taskId);
      var title = (input && input.value || '').trim();
      if (!title) { flash('请填写子项'); return; }
      if (!t.subs) t.subs = [];
      t.subs.push({ id: uid(), title: title, done: false });
      if (!state._workTaskOpen) state._workTaskOpen = {};
      state._workTaskOpen[taskId] = true;
      save(); render();
    },
    toggleWorkSub: function (projectId, taskId, subId) {
      ensureWork(state);
      var p = state.work.projects.find(function (x) { return x.id === projectId; });
      if (!p) return;
      var t = p.tasks.find(function (x) { return x.id === taskId; });
      if (!t || !t.subs) return;
      var s = t.subs.find(function (x) { return x.id === subId; });
      if (!s) return;
      s.done = !s.done;
      save(); render();
    },
    delWorkSub: function (projectId, taskId, subId) {
      ensureWork(state);
      var p = state.work.projects.find(function (x) { return x.id === projectId; });
      if (!p) return;
      var t = p.tasks.find(function (x) { return x.id === taskId; });
      if (!t || !t.subs) return;
      t.subs = t.subs.filter(function (x) { return x.id !== subId; });
      save(); render();
    },
    toggleWorkTaskDone: function (projectId, taskId) {
      ensureWork(state);
      var p = state.work.projects.find(function (x) { return x.id === projectId; });
      if (!p) return;
      var t = p.tasks.find(function (x) { return x.id === taskId; });
      if (!t) return;
      t.done = !t.done;
      save(); render();
    },
    delWorkTask: function (projectId, taskId) {
      ensureWork(state);
      var p = state.work.projects.find(function (x) { return x.id === projectId; });
      if (!p) return;
      p.tasks = p.tasks.filter(function (t) { return t.id !== taskId; });
      if (state._workTaskOpen) delete state._workTaskOpen[taskId];
      save(); render();
    },
    addWork: function () {},
    toggleWork: function () {},
    delWork: function () {},
    addTutorProject: function () {
      ensureWork(state);
      var title = (document.getElementById('tp-title').value || '').trim();
      if (!title) { flash('请填写项目名称'); return; }
      var id = uid();
      state.work.tutoring.push({
        id: id,
        title: title,
        note: (document.getElementById('tp-note').value || '').trim(),
        lessons: []
      });
      if (!state._tutorOpen) state._tutorOpen = {};
      state._tutorOpen[id] = true;
      save(); render(); flash('家教项目已添加 ✓');
    },
    toggleTutorProject: function (id) {
      if (!state._tutorOpen) state._tutorOpen = {};
      state._tutorOpen[id] = !state._tutorOpen[id];
      save(); render();
    },
    delTutorProject: function (id) {
      ensureWork(state);
      var proj = state.work.tutoring.find(function (p) { return p.id === id; });
      if (proj) {
        (proj.lessons || []).forEach(function (L) {
          if (L.moneyId) removeMoneyById(L.moneyId);
        });
      }
      state.work.tutoring = state.work.tutoring.filter(function (p) { return p.id !== id; });
      if (state._tutorOpen) delete state._tutorOpen[id];
      save(); render();
    },
    addTutorLesson: function (projectId) {
      ensureWork(state);
      var proj = state.work.tutoring.find(function (p) { return p.id === projectId; });
      if (!proj) return;
      var date = (document.getElementById('tl-date-' + projectId) || {}).value || todayStr();
      var time = (document.getElementById('tl-time-' + projectId) || {}).value || '';
      var endTime = (document.getElementById('tl-end-' + projectId) || {}).value || '';
      var income = parseFloat((document.getElementById('tl-income-' + projectId) || {}).value) || 0;
      var account = (document.getElementById('tl-acct-' + projectId) || {}).value || 'wechat';
      var prep = ((document.getElementById('tl-prep-' + projectId) || {}).value || '').trim();
      var feedback = ((document.getElementById('tl-fb-' + projectId) || {}).value || '').trim();
      if (!date) { flash('请选择日期'); return; }
      if (endTime && time && endTime <= time) { flash('结束时间需晚于开始时间'); return; }
      if (!prep && !feedback && !income && !time) {
        flash('请至少填写时间、收入、备课或反馈中的一项');
        return;
      }
      var moneyId = '';
      if (income > 0) {
        moneyId = addMoneyRecord({
          io: 'in',
          amount: income,
          account: account,
          cat: '家教',
          date: date,
          note: '家教 · ' + proj.title + (time ? ' · ' + time : ''),
          fromTutor: true
        });
      }
      proj.lessons.push({
        id: uid(),
        date: date,
        time: time,
        endTime: endTime,
        income: income,
        account: account,
        moneyId: moneyId,
        prep: prep,
        feedback: feedback
      });
      if (!state._tutorOpen) state._tutorOpen = {};
      state._tutorOpen[projectId] = true;
      save(); render();
      flash(income > 0 ? '课时已添加，并记入收入 ✓' : '课时已添加 ✓');
    },
    delTutorLesson: function (projectId, lessonId) {
      ensureWork(state);
      var proj = state.work.tutoring.find(function (p) { return p.id === projectId; });
      if (!proj) return;
      var lesson = (proj.lessons || []).find(function (L) { return L.id === lessonId; });
      if (lesson && lesson.moneyId) removeMoneyById(lesson.moneyId);
      proj.lessons = (proj.lessons || []).filter(function (L) { return L.id !== lessonId; });
      save(); render();
    },
    speakWord: function (en) { speak(en); },
    setLangGoal: function () {
      var el = document.getElementById('lang-goal');
      var n = el ? parseInt(el.value, 10) : 10;
      if (isNaN(n) || n < 0) n = 0;
      state._langQuiz = null;
      var wanted = n;
      var finalN = resizeCurrentLangLesson(n);
      if (el) el.value = finalN;
      save();
      if (finalN < wanted) {
        flash('本课已调整为 ' + finalN + ' 词（可调度单词不足 ' + wanted + '）');
      } else {
        flash('本课现为 ' + finalN + ' 词（今日已学单词已保留）');
      }
      render();
    },
    bumpLangGoal: function (delta) {
      var el = document.getElementById('lang-goal');
      var cur = el ? parseInt(el.value, 10) : (state.lang && state.lang.dailyGoal);
      if (isNaN(cur)) cur = 10;
      cur = cur + (delta || 0);
      if (cur < 0) cur = 0;
      if (el) el.value = cur;
      App.setLangGoal();
    },
    readDialog: function () {
      var words = getDailyWords();
      var texts = [];
      words.forEach(function (w) {
        if (w.sentence) texts.push(w.sentence);
        if (w.sentence2) texts.push(w.sentence2);
      });
      if (!texts.length) { flash('本课暂无对话'); return; }
      speakSequence(texts, 1600);
    },
    toggleDialog: function () {
      state._langShowDialog = !state._langShowDialog;
      if (state._langShowDialog) state._langShowMaster = false;
      render();
    },
    toggleMasterList: function () {
      state._langShowMaster = !state._langShowMaster;
      if (state._langShowMaster) state._langShowDialog = false;
      render();
    },
    confirmMaster: function (wordId) {
      ensureLang(state);
      var prog = langWordProgress(wordId);
      if (!prog.zh || !prog.en) {
        flash('请先完成中文掌握和英文拼写');
        return;
      }
      if (!Array.isArray(state.lang.mastered)) state.lang.mastered = [];
      if (state.lang.mastered.indexOf(wordId) < 0) state.lang.mastered.push(wordId);
      state.lang.weak = (state.lang.weak || []).filter(function (w) {
        var id = typeof w === 'string' ? w : w.id;
        return id !== wordId;
      });
      state.lang.plan = (state.lang.plan || []).map(function (lesson) {
        return (lesson || []).filter(function (id) { return id !== wordId; });
      }).filter(function (lesson) { return lesson.length > 0; });
      if ((state.lang.day || 0) >= state.lang.plan.length) {
        state.lang.day = Math.max(0, state.lang.plan.length - 1);
      }
      state._langShowMaster = true;
      save();
      flash('已确认掌握 ✓');
      render();
    },
    prevLangDay: function () {
      state._langQuiz = null;
      state.lang.day = Math.max(0, (state.lang.day || 0) - 1);
      save(); render();
    },
    nextLangDay: function () {
      state._langQuiz = null;
      var next = (state.lang.day || 0) + 1;
      ensureLangLesson(next);
      var max = Math.max(0, (state.lang.plan || []).length - 1);
      if (next > max && langRemainingWords().length) {
        ensureLangLesson(next);
        max = Math.max(0, (state.lang.plan || []).length - 1);
      }
      state.lang.day = Math.min(max, next);
      save(); render();
    },
    gotoLangLesson: function () {
      var el = document.getElementById('lang-lesson');
      var n = el ? +el.value : 1;
      var target = Math.max(0, (n || 1) - 1);
      state._langQuiz = null;
      ensureLangLesson(target);
      var max = Math.max(0, (state.lang.plan || []).length - 1);
      state.lang.day = Math.min(max, target);
      save(); render();
    },
    endLangQuiz: function () {
      state._langQuiz = null;
      save(); render();
    },
    markQuizPass: function (wordId, mode) {
      var today = todayStr();
      if (!state.lang.practiced[today]) state.lang.practiced[today] = [];
      if (state.lang.practiced[today].indexOf(wordId) < 0) state.lang.practiced[today].push(wordId);
      if (!state.lang.progress || typeof state.lang.progress !== 'object') state.lang.progress = {};
      if (!state.lang.progress[wordId]) state.lang.progress[wordId] = { zh: false, en: false };
      if (mode === 'zh') state.lang.progress[wordId].zh = true;
      if (mode === 'en') state.lang.progress[wordId].en = true;
      App.clearWeakMode(wordId, mode);
      var p = state.lang.progress[wordId];
      if (p.zh && p.en && !langIsMastered(wordId)) return 'pending';
      return 'ok';
    },
    addWeak: function (wordId, mode) {
      if (langIsMastered(wordId)) return;
      ensureLang(state);
      var list = state.lang.weak || [];
      var entry = null;
      for (var i = 0; i < list.length; i++) {
        if (list[i] && list[i].id === wordId) { entry = list[i]; break; }
      }
      if (!entry) {
        entry = { id: wordId, zh: false, en: false };
        list.push(entry);
      }
      if (mode === 'zh') entry.zh = true;
      else if (mode === 'en') entry.en = true;
      else { entry.zh = true; entry.en = true; }
      state.lang.weak = list;
    },
    clearWeakMode: function (wordId, mode) {
      ensureLang(state);
      state.lang.weak = (state.lang.weak || []).map(function (entry) {
        if (!entry || entry.id !== wordId) return entry;
        var next = { id: entry.id, zh: !!entry.zh, en: !!entry.en };
        if (mode === 'zh') next.zh = false;
        if (mode === 'en') next.en = false;
        return next;
      }).filter(function (entry) {
        return entry && entry.id && (entry.zh || entry.en);
      });
    },
    removeWeak: function (wordId) {
      state.lang.weak = (state.lang.weak || []).filter(function (w) {
        var id = typeof w === 'string' ? w : w.id;
        return id !== wordId;
      });
      save(); render();
    },
    startQuiz: function (mode, continueRun) {
      var pool = langQuizPool(mode, !!continueRun);
      if (!pool.length) {
        state._langQuiz = null;
        var stats = langLessonModeStats(getDailyWords(), mode);
        if (stats.correct >= stats.total && stats.total > 0) {
          flash((mode === 'zh' ? '中文' : '英文') + '本课已全部答对（' + stats.correct + '/' + stats.total + '）');
        } else if (continueRun) {
          flash('本轮暂无题目。还有未掌握 ' + stats.wrong + ' 个，可再点开始继续练');
        } else if (stats.tested >= stats.total) {
          flash((mode === 'zh' ? '中文' : '英文') + '还有未掌握 ' + stats.wrong + ' 个，请再进入测验直到全部答对');
        } else {
          flash('暂时没有可测单词');
        }
        save(); render();
        return;
      }
      var w = pool[Math.floor(Math.random() * pool.length)];
      var quiz = { mode: mode, wordId: w.id };
      if (mode === 'zh') {
        var opts = [w.zh];
        while (opts.length < 4 && WORDS.length > opts.length) {
          var r = WORDS[Math.floor(Math.random() * WORDS.length)];
          if (opts.indexOf(r.zh) < 0) opts.push(r.zh);
        }
        opts.sort(function () { return Math.random() - 0.5; });
        quiz.opts = opts;
      }
      state._langQuiz = quiz;
      save(); render();
    },
    quizContinue: function (mode) {
      state._langQuiz = null;
      save();
      App.startQuiz(mode, true);
    },
    quizDontKnow: function (mode, wordId) {
      var w = wordById(wordId);
      App.addWeak(wordId, mode);
      state._langQuiz = {
        mode: mode,
        wordId: wordId,
        feedback: true,
        ok: false,
        picked: '（我不会）',
        correct: mode === 'zh' ? (w ? w.zh : '') : (w ? w.en : '')
      };
      save(); render();
    },
    quizAnswer: function (mode, wordId, picked, correct) {
      var today = todayStr();
      if (!state.lang.quizLog[today]) state.lang.quizLog[today] = { zh: 0, en: 0 };
      var ok = picked === correct;
      if (ok) {
        state.lang.quizLog[today].zh++;
        App.markQuizPass(wordId, 'zh');
      } else {
        App.addWeak(wordId, 'zh');
      }
      state._langQuiz = {
        mode: 'zh',
        wordId: wordId,
        feedback: true,
        ok: ok,
        picked: picked,
        correct: correct
      };
      save(); render();
    },
    quizSpell: function (wordId, correct) {
      var input = document.getElementById('quiz-spell');
      var val = (input ? input.value : '').trim();
      var today = todayStr();
      if (!state.lang.quizLog[today]) state.lang.quizLog[today] = { zh: 0, en: 0 };
      var ok = val.toLowerCase() === String(correct).toLowerCase();
      if (ok) {
        state.lang.quizLog[today].en++;
        App.markQuizPass(wordId, 'en');
      } else {
        App.addWeak(wordId, 'en');
      }
      state._langQuiz = {
        mode: 'en',
        wordId: wordId,
        feedback: true,
        ok: ok,
        picked: val || '（空白）',
        correct: correct
      };
      save(); render();
    },
    setXgTab: function (t) { state._xgTab = t; save(); render(); },
    toggleSopOpen: function (sopId) {
      if (!state._sopOpen) state._sopOpen = {};
      state._sopOpen[sopId] = !state._sopOpen[sopId];
      save(); render();
    },
    addSop: function (dept) {
      ensureXuegong(state);
      var title = (document.getElementById('sop-title').value || '').trim();
      if (!title) { flash('请填写项目名称'); return; }
      var sop = {
        id: uid(),
        title: title,
        date: (document.getElementById('sop-date') || {}).value || todayStr(),
        note: ((document.getElementById('sop-note') || {}).value || '').trim(),
        steps: [],
        _sopV: 2
      };
      state.xuegong.history[dept].sops.push(sop);
      if (!state._sopOpen) state._sopOpen = {};
      state._sopOpen[sop.id] = true;
      save(); render();
      flash('项目已添加，请依次添加步骤');
    },
    addSopStep: function (dept, sopId) {
      var sop = findSop(dept, sopId);
      if (!sop) return;
      normalizeSop(sop);
      var title = ((document.getElementById('sop-step-title-' + sopId) || {}).value || '').trim();
      if (!title) { flash('请填写步骤名称'); return; }
      var note = ((document.getElementById('sop-step-note-' + sopId) || {}).value || '').trim();
      sop.steps.push({
        id: uid(),
        title: title,
        note: note,
        tasks: []
      });
      save(); render();
      flash('步骤已添加');
    },
    editSopStep: function (dept, sopId, stepId) {
      if (state._sopEditStep && state._sopEditStep.sopId === sopId && state._sopEditStep.stepId === stepId) {
        state._sopEditStep = null;
      } else {
        state._sopEditStep = { dept: dept, sopId: sopId, stepId: stepId };
      }
      save(); render();
    },
    cancelSopStepEdit: function () {
      state._sopEditStep = null;
      save(); render();
    },
    saveSopStepEdit: function (dept, sopId, stepId) {
      var sop = findSop(dept, sopId);
      if (!sop) return;
      normalizeSop(sop);
      var step = findSopStep(sop, stepId);
      if (!step) return;
      var title = ((document.getElementById('sop-edit-title-' + stepId) || {}).value || '').trim();
      if (!title) { flash('步骤名称不能为空'); return; }
      var note = ((document.getElementById('sop-edit-note-' + stepId) || {}).value || '').trim();
      step.title = title;
      step.note = note;
      state._sopEditStep = null;
      save(); render();
      flash('步骤已保存');
    },
    delSopStep: function (dept, sopId, stepId) {
      var sop = findSop(dept, sopId);
      if (!sop) return;
      normalizeSop(sop);
      sop.steps = sop.steps.filter(function (s) { return s.id !== stepId; });
      if (state._sopEditStep && state._sopEditStep.stepId === stepId) state._sopEditStep = null;
      save(); render();
    },
    addSopTask: function (dept, sopId, stepId) {
      var sop = findSop(dept, sopId);
      if (!sop) return;
      normalizeSop(sop);
      var step = findSopStep(sop, stepId);
      if (!step) return;
      var textEl = document.getElementById('sop-task-text-' + stepId);
      var noteEl = document.getElementById('sop-task-note-' + stepId);
      var text = (textEl ? textEl.value : '').trim();
      if (!text) { flash('请填写小任务内容'); return; }
      var note = (noteEl ? noteEl.value : '').trim();
      step.tasks.push({
        id: uid(),
        text: text,
        note: note,
        done: false
      });
      state._sopEditStep = { dept: dept, sopId: sopId, stepId: stepId };
      save(); render();
      flash('小任务已添加');
    },
    editSopTask: function (dept, sopId, stepId, taskId) {
      if (state._sopEditTask &&
          state._sopEditTask.sopId === sopId &&
          state._sopEditTask.stepId === stepId &&
          state._sopEditTask.taskId === taskId) {
        state._sopEditTask = null;
      } else {
        state._sopEditTask = { dept: dept, sopId: sopId, stepId: stepId, taskId: taskId };
      }
      save(); render();
    },
    cancelSopTaskEdit: function () {
      state._sopEditTask = null;
      save(); render();
    },
    saveSopTaskEdit: function (dept, sopId, stepId, taskId) {
      var sop = findSop(dept, sopId);
      if (!sop) return;
      var step = findSopStep(sop, stepId);
      if (!step) return;
      var task = findSopTask(step, taskId);
      if (!task) return;
      var text = ((document.getElementById('sop-task-edit-text-' + taskId) || {}).value || '').trim();
      if (!text) { flash('任务内容不能为空'); return; }
      var note = ((document.getElementById('sop-task-edit-note-' + taskId) || {}).value || '').trim();
      task.text = text;
      task.note = note;
      state._sopEditTask = null;
      save(); render();
      flash('小任务已保存');
    },
    delSopTask: function (dept, sopId, stepId, taskId) {
      var sop = findSop(dept, sopId);
      if (!sop) return;
      var step = findSopStep(sop, stepId);
      if (!step) return;
      step.tasks = (step.tasks || []).filter(function (t) { return t.id !== taskId; });
      if (state._sopEditTask && state._sopEditTask.taskId === taskId) state._sopEditTask = null;
      save(); render();
    },
    toggleSopTask: function (dept, sopId, stepId, taskId) {
      var sop = findSop(dept, sopId);
      if (!sop) return;
      normalizeSop(sop);
      var step = findSopStep(sop, stepId);
      if (!step) return;
      var task = findSopTask(step, taskId);
      if (!task) return;
      task.done = !task.done;
      save(); render();
    },
    delSop: function (dept, id) {
      state.xuegong.history[dept].sops = state.xuegong.history[dept].sops.filter(function (s) { return s.id !== id; });
      if (state._sopOpen) delete state._sopOpen[id];
      save(); render();
    },
    addTourism: function () {
      var topic = (document.getElementById('tour-topic').value || '').trim();
      if (!topic) { flash('请填写主题'); return; }
      state.xuegong.tourism.rows.push({
        id: uid(),
        date: document.getElementById('tour-date').value || todayStr(),
        slot: document.getElementById('tour-slot').value || '',
        topic: topic,
        progress: document.getElementById('tour-progress').value || '',
        owner: document.getElementById('tour-owner').value || '',
        req: document.getElementById('tour-req').value || '',
        feedback: document.getElementById('tour-fb').value || ''
      });
      save(); render(); flash('项目已添加 ✓');
    },
    editTourism: function (id) {
      var r = state.xuegong.tourism.rows.find(function (x) { return x.id === id; });
      if (!r) return;
      var slot = prompt('时段', r.slot); if (slot === null) return;
      var topic = prompt('主题', r.topic); if (topic === null) return;
      var progress = prompt('进度', r.progress); if (progress === null) return;
      var owner = prompt('负责人', r.owner); if (owner === null) return;
      var req = prompt('要求', r.req); if (req === null) return;
      var feedback = prompt('反馈', r.feedback); if (feedback === null) return;
      r.slot = slot; r.topic = topic; r.progress = progress; r.owner = owner; r.req = req; r.feedback = feedback;
      save(); render();
    },
    delTourism: function (id) {
      state.xuegong.tourism.rows = state.xuegong.tourism.rows.filter(function (r) { return r.id !== id; });
      save(); render();
    },
    saveSettings: function () {
      state.settings.name = document.getElementById('set-name').value || '小鱼';
      save(); render(); flash('已保存 ✓');
    },
    promptA2hs: function () {
      if (window._a2hsDeferred) {
        window._a2hsDeferred.prompt();
        window._a2hsDeferred.userChoice.then(function () {
          window._a2hsDeferred = null;
          flash('请按系统提示完成安装');
        });
        return;
      }
      if (isIosDevice()) {
        flash('请点 Safari 底部分享 → 添加到主屏幕');
        return;
      }
      flash('请用浏览器菜单「添加到主屏幕 / 安装应用」');
    },
    saveCloudConfig: function () {
      var url = ((document.getElementById('cloud-url') || {}).value || '').trim();
      var anonKey = ((document.getElementById('cloud-anon') || {}).value || '').trim();
      if (!url || !anonKey) { flash('请填写 URL 与 anon key'); return; }
      saveSupabaseConfigObj({ url: url, anonKey: anonKey });
      flash('云配置已保存');
      render();
    },
    cloudSignUp: function () {
      var urlEl = document.getElementById('cloud-url');
      var keyEl = document.getElementById('cloud-anon');
      if (urlEl && keyEl && urlEl.value.trim() && keyEl.value.trim()) {
        saveSupabaseConfigObj({ url: urlEl.value, anonKey: keyEl.value });
      }
      var client = getSupabaseClient();
      if (!client) { flash('请先保存有效的云配置'); return; }
      var email = ((document.getElementById('cloud-email') || {}).value || '').trim();
      var pass = ((document.getElementById('cloud-pass') || {}).value || '');
      if (!email || pass.length < 6) { flash('请填写邮箱和至少 6 位密码'); return; }
      flash('注册中…');
      client.auth.signUp({ email: email, password: pass }).then(function (res) {
        if (res.error) { flash(res.error.message || '注册失败'); return; }
        _sbUser = (res.data && res.data.user) || null;
        if (!_sbUser && res.data && res.data.session) _sbUser = res.data.session.user;
        if (!_sbUser) {
          flash('注册成功，请查收确认邮件后再登录（若项目开启了邮箱确认）');
          render();
          return;
        }
        var meta = loadSyncMeta();
        meta.userEmail = _sbUser.email || email;
        saveSyncMeta(meta);
        return pushCloud({ force: true }).then(function (r) {
          if (r && r.ok) flash('注册成功，已上传本机数据');
          else if (r && r.reason === 'conflict') flash('注册成功，请处理同步冲突');
          else flash('注册成功' + (r && r.message ? '，上传：' + r.message : ''));
          render();
        });
      }).catch(function (e) {
        flash((e && e.message) || '注册失败');
      });
    },
    cloudSignIn: function () {
      var urlEl = document.getElementById('cloud-url');
      var keyEl = document.getElementById('cloud-anon');
      if (urlEl && keyEl && urlEl.value.trim() && keyEl.value.trim()) {
        saveSupabaseConfigObj({ url: urlEl.value, anonKey: keyEl.value });
      }
      var client = getSupabaseClient();
      if (!client) { flash('请先保存有效的云配置'); return; }
      var email = ((document.getElementById('cloud-email') || {}).value || '').trim();
      var pass = ((document.getElementById('cloud-pass') || {}).value || '');
      if (!email || !pass) { flash('请填写邮箱和密码'); return; }
      flash('登录中…');
      client.auth.signInWithPassword({ email: email, password: pass }).then(function (res) {
        if (res.error) { flash(res.error.message || '登录失败'); return; }
        _sbUser = (res.data && res.data.session && res.data.session.user) || null;
        if (!_sbUser) { flash('登录失败'); return; }
        var meta = loadSyncMeta();
        meta.userEmail = _sbUser.email || email;
        saveSyncMeta(meta);
        return pullCloud({ force: true }).then(function (r) {
          if (r && r.ok) {
            flash(r.action === 'applied' ? '已登录并下载云端数据' :
              r.action === 'seeded' ? '已登录，已上传本机数据' : '已登录');
          } else if (r && r.reason === 'conflict') {
            flash('已登录，存在冲突请在下方选择');
          } else {
            flash('已登录' + (r && r.message ? '：' + r.message : ''));
          }
          render();
        });
      }).catch(function (e) {
        flash((e && e.message) || '登录失败');
      });
    },
    cloudSignOut: function () {
      var client = getSupabaseClient();
      var done = function () {
        _sbUser = null;
        var meta = loadSyncMeta();
        meta.userEmail = '';
        meta.conflict = null;
        saveSyncMeta(meta);
        flash('已退出登录');
        render();
      };
      if (!client) { done(); return; }
      client.auth.signOut().then(done).catch(done);
    },
    syncNow: function () {
      if (!_sbUser) { flash('请先登录'); return; }
      flash('同步中…');
      pullCloud({ force: true }).then(function (r) {
        if (r && r.reason === 'conflict') {
          flash('存在冲突，请选择保留哪一侧');
          render();
          return;
        }
        if (r && r.ok && (r.action === 'kept_local' || loadSyncMeta().dirty)) {
          return pushCloud({ force: true }).then(function (p) {
            if (p && p.ok) flash('已同步 ✓');
            else if (p && p.reason === 'conflict') flash('存在冲突，请选择');
            else flash('同步失败' + (p && p.message ? '：' + p.message : ''));
            render();
          });
        }
        if (r && r.ok) flash('已同步 ✓');
        else flash('同步失败' + (r && r.message ? '：' + r.message : ''));
        render();
      });
    },
    resolveCloudConflict: function (side) {
      if (!_sbUser) return;
      flash('处理冲突中…');
      if (side === 'remote') {
        pullCloud({ force: true, resolve: 'remote' }).then(function (r) {
          if (r && r.ok) flash('已用云端覆盖本机');
          else flash('失败' + (r && r.message ? '：' + r.message : ''));
          render();
        });
      } else {
        pushCloud({ force: true, resolve: 'local' }).then(function (r) {
          if (r && r.ok) flash('已用本机覆盖云端');
          else flash('失败' + (r && r.message ? '：' + r.message : ''));
          render();
        });
      }
    },
    exportData: function () {
      var copy = getSyncPayload();
      var blob = new Blob([JSON.stringify(copy, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'xiaoyu-planner-' + todayStr() + '.json';
      a.click();
      flash('已导出 ✓');
    },
    importSettings: function () {
      var ta = document.getElementById('settings-import-ta');
      if (!ta || !ta.value.trim()) { flash('请粘贴 JSON'); return; }
      try {
        var parsed = JSON.parse(ta.value);
        state = migrate(parsed);
        state._mod = 'settings';
        ensureAll(state);
        save(); render(); flash('导入成功 ✓');
      } catch (e) { flash('JSON 格式错误'); }
    },
    clearData: function () {
      if (!confirm('确定清空全部数据？此操作不可恢复（备份在 wb_v2_bak）')) return;
      state = defaultState();
      state._mod = 'settings';
      save(); render(); flash('已清空');
    },
    pickImportFile: function (id) {
      var input = document.getElementById(id + '-file');
      if (input) input.click();
    },
    doImport: function (id) {
      var ta = document.getElementById(id + '-ta');
      var text = ta ? ta.value : '';
      var n = 0;
      if (id === 'cls-import') n = parseClassesImport(text);
      else if (id === 'ex-import') {
        parseImportLines(text).forEach(function (line) {
          var p = line.split(',').map(function (x) { return x.trim(); });
          if (p.length < 3) return;
          state.health.exercise.push({ id: uid(), date: p[0], type: p[1], mins: +p[2] || 0, note: p[3] || '' });
          n++;
        });
      } else if (id === 'wt-import') {
        parseImportLines(text).forEach(function (line) {
          var p = line.split(',').map(function (x) { return x.trim(); });
          if (p.length < 2) return;
          state.health.weight.push({ id: uid(), date: p[0], kg: +p[1] || 0 });
          n++;
        });
      } else if (id === 'period-import') {
        ensureHealth(state);
        parseImportLines(text).forEach(function (line) {
          var p = line.split(',').map(function (x) { return x.trim(); });
          if (p.length < 2) return;
          var date = p[0];
          var type = p[1] || 'note';
          var note = p[2] || '';
          if (type === 'start') {
            state.health.period.cycles.push({ id: uid(), start: date, end: '', summary: note, days: [] });
            state.health.period.lastStart = date;
          } else if (type === 'end') {
            var open = getOpenCycle();
            if (open) open.end = date;
            else state.health.period.cycles.push({ id: uid(), start: date, end: date, summary: note, days: [] });
          } else {
            var cyc = findCycleForDate(date) || getOpenCycle();
            if (!cyc) {
              cyc = { id: uid(), start: date, end: '', summary: '', days: [] };
              state.health.period.cycles.push(cyc);
              state.health.period.lastStart = date;
            }
            cyc.days.push({
              id: uid(), date: date, flow: 'medium', symptoms: [], meds: false, medNote: '', relief: '', note: note
            });
          }
          n++;
        });
      } else if (id === 'diet-import') {
        var seenDiet = {};
        state.health.diet.forEach(function (d) {
          seenDiet[d.date + '|' + d.name + '|' + d.kcal] = 1;
        });
        parseImportLines(text).forEach(function (line) {
          var p = line.split(',').map(function (x) { return x.trim(); });
          if (p.length < 3) return;
          var sig = p[0] + '|' + p[1] + '|' + p[2];
          if (seenDiet[sig]) return;
          seenDiet[sig] = 1;
          state.health.diet.push({
            id: uid(), date: p[0], name: p[1], kcal: +p[2] || 0,
            p: +p[3] || 0, c: +p[4] || 0, f: +p[5] || 0, meal: p[6] || '午餐'
          });
          n++;
        });
      }
      save(); render(); flash('已导入 ' + n + ' 条 ✓');
    }
  };

  (function wrapDestructiveActions() {
    var labels = {
      delScrap: '这条碎片',
      delEvent: '这个日程',
      delTodo: '这个待办',
      delWeekPlan: '这个周计划',
      delClass: '这条循环日常',
      delRecord: '这条记账',
      delExercise: '这条运动记录',
      delWeight: '这条体重记录',
      delDiet: '这条饮食记录',
      delPeriodDay: '这条经期日志',
      delPeriodCycle: '这个周期记录',
      delPeriodLog: '这条经期记录',
      delHobby: '这个爱好项目',
      delHobbyRecord: '这条足迹',
      delCourse: '这门课程及其任务笔记',
      delStudyTask: '这个学习任务',
      delStudyFile: '这个附件',
      delNote: '这条笔记',
      delWorkProject: '这个工作项目',
      delWorkTask: '这个工作任务',
      delWorkSub: '这个子任务',
      delTutorProject: '这个家教项目',
      delTutorLesson: '这节课时',
      delSop: '这个 SOP 项目',
      delSopStep: '这个步骤',
      delSopTask: '这个小任务',
      delTourism: '这条旅游系项目',
      delShopModule: '这个购物模块',
      delShopList: '这份购物清单',
      delShopItem: '这个购物项',
      removeDayType: '这个日程类型',
      removeWeekGoal: '这条周目标',
      clearWeekField: '这段周总结'
    };
    var skip = { delWeekPlan: true, delWork: true, removeDayType: true };
    Object.keys(App).forEach(function (key) {
      if (skip[key]) return;
      if (!labels[key] && key.indexOf('del') !== 0) return;
      var orig = App[key];
      if (typeof orig !== 'function') return;
      App[key] = function () {
        var tip = labels[key] || '该项';
        if (!confirm('确定删除' + tip + '？此操作不可恢复。')) return;
        return orig.apply(App, arguments);
      };
    });
  })();

  function attachScheduleEditors() {
    document.querySelectorAll('#page button[onclick]').forEach(function (button) {
      var match = button.getAttribute('onclick').match(/App\.(delEvent|delClass|delTodo)\('([^']+)'\)/);
      if (!match) return;
      var edit = document.createElement('button');
      edit.type = 'button'; edit.className = 'schedule-edit-button'; edit.textContent = '编辑';
      edit.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation(); App.editScheduleRecord(match[1], match[2]);
      });
      button.parentNode.insertBefore(edit, button);
    });
  }

  App.editScheduleRecord = function (kind, id) {
    var collection = kind === 'delClass' ? state.schedule.classes : kind === 'delTodo' ? state.schedule.todos : state.schedule.events;
    var record = collection.find(function (r) { return r.id === id; });
    if (!record) return;
    var previous = document.getElementById('schedule-editor'); if (previous) previous.remove();
    var dialog = document.createElement('dialog'); dialog.id = 'schedule-editor';
    var fields = kind === 'delClass'
      ? [['title','名称'],['mode','循环方式','weekly|每周,weekdays|工作日,daily|每天'],['weekday','星期','0|周日,1|周一,2|周二,3|周三,4|周四,5|周五,6|周六'],['start','开始时间','time'],['end','结束时间','time'],['rangeStart','循环开始日期','date'],['rangeEnd','循环结束日期','date'],['kind','类型'],['place','地点 / 备注']]
      : kind === 'delTodo'
      ? [['text','待办内容'],['date','日期','date'],['important','重要程度','true|重要,false|不重要'],['urgent','紧急程度','true|紧急,false|不紧急']]
      : [['title','标题'],['date','日期','date'],['time','开始时间','time'],['endTime','结束时间','time'],['type','日程类别','event|事件,plan|计划,ddl|DDL,special|特殊日期'],['kind','类型'],['urgency','紧急程度','normal|普通,urgent|紧急'],['note','内容备注']];
    dialog.innerHTML = '<form><h3>编辑日程</h3><div class="schedule-editor-fields"></div><p class="editor-error" role="alert"></p><div class="schedule-editor-actions"><button type="submit">保存修改</button><button type="button" class="cancel-edit">取消</button></div></form>';
    fields.forEach(function (f) {
      var label = document.createElement('label'); label.textContent = f[1];
      var input = document.createElement(f[2] && f[2].includes('|') ? 'select' : 'input');
      input.name=f[0];
      if (input.tagName === 'SELECT') {
        f[2].split(',').forEach(function (o) { var parts=o.split('|'); var option=document.createElement('option'); option.value=parts[0]; option.textContent=parts[1]; input.appendChild(option); });
      } else input.type=f[2] || 'text';
      input.value=record[f[0]] == null ? '' : String(record[f[0]]);
      label.appendChild(input); dialog.querySelector('.schedule-editor-fields').appendChild(label);
    });
    dialog.querySelector('.cancel-edit').onclick=function () { dialog.close(); dialog.remove(); };
    dialog.querySelector('form').onsubmit=function (e) {
      e.preventDefault(); var values={};
      fields.forEach(function (f) { values[f[0]]=dialog.querySelector('[name="'+f[0]+'"]').value.trim(); });
      var error = !values[fields[0][0]] ? '请填写内容' : '';
      var start=values.start || values.time, end=values.end || values.endTime;
      if (start && end && end <= start) error='结束时间须晚于开始时间';
      if (values.rangeStart && values.rangeEnd && values.rangeEnd < values.rangeStart) error='循环结束日期不能早于开始日期';
      if (error) { dialog.querySelector('.editor-error').textContent=error; return; }
      if (kind==='delClass') values.weekday=Number(values.weekday);
      if (kind==='delTodo') { values.important=values.important==='true'; values.urgent=values.urgent==='true'; }
      Object.assign(record,values); save(); dialog.close(); dialog.remove(); render(); flash('已修改 ✓');
    };
    document.body.appendChild(dialog); dialog.showModal();
  };
  App.setDayView=function(mode){dayViewMode=mode;render();};
  App.quickAddDay=function(mins){
    var form=document.getElementById('day-compose');if(!form)return;form.open=true;
    if(typeof mins==='number') { document.getElementById('day-time').value=minsToLabel(mins);document.getElementById('day-end').value=minsToLabel(Math.min(1439,mins+60)); }
    form.scrollIntoView({block:'center'});document.getElementById('day-title').focus();
  };
  App.focusDayNow=function(){
    if((state._schedDay||todayStr())!==todayStr()){state._schedDay=todayStr();dayViewMode='timeline';render();}
    var wrap=document.querySelector('.tl-scale-wrap'),canvas=document.querySelector('.tl-canvas'),now=new Date();
    if(wrap&&canvas) wrap.scrollTop=Math.max(0,(Math.max(360,now.getHours()*60+now.getMinutes())-360)/1080*canvas.offsetHeight-60);
  };
  window.App = App;

  document.addEventListener('DOMContentLoaded', function () {
    load();
    document.querySelectorAll('[data-mod]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        navigate(btn.getAttribute('data-mod'));
      });
    });
    document.body.addEventListener('change', function (e) {
      var t = e.target;
      if (t.id === 'cls-import-file' && t.files && t.files[0]) {
        var reader = new FileReader();
        reader.onload = function () {
          document.getElementById('cls-import-ta').value = reader.result;
        };
        reader.readAsText(t.files[0]);
      } else if (t.id === 'ex-import-file' && t.files && t.files[0]) {
        var r3 = new FileReader();
        r3.onload = function () { document.getElementById('ex-import-ta').value = r3.result; };
        r3.readAsText(t.files[0]);
      } else if (t.id === 'wt-import-file' && t.files && t.files[0]) {
        var r4 = new FileReader();
        r4.onload = function () { document.getElementById('wt-import-ta').value = r4.result; };
        r4.readAsText(t.files[0]);
      } else if (t.id === 'period-import-file' && t.files && t.files[0]) {
        var r5 = new FileReader();
        r5.onload = function () { document.getElementById('period-import-ta').value = r5.result; };
        r5.readAsText(t.files[0]);
      } else if (t.id === 'diet-import-file' && t.files && t.files[0]) {
        var rDiet = new FileReader();
        rDiet.onload = function () { document.getElementById('diet-import-ta').value = rDiet.result; };
        rDiet.readAsText(t.files[0]);
      } else if (t.id === 'settings-import-file' && t.files && t.files[0]) {
        var r6 = new FileReader();
        r6.onload = function () {
          document.getElementById('settings-import-ta').value = r6.result;
          App.importSettings();
        };
        r6.readAsText(t.files[0]);
      }
    });
    render();
    initCloudSync();
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      window._a2hsDeferred = e;
    });
  });
})();
