const app = document.querySelector("#app");

const state = {
  screen: "login",
  view: "day",
  drawer: false,
  toast: "",
  detailStatus: "reserved",
  modal: null,
  reportMode: "checkin",
  waitingSelection: "wang",
  petTab: "history",
  contractStep: 1,
  petPhoneQuery: "09",
  selectedDate: "16",
  selectedSlot: "09:30",
  reportBaseFee: 1500,
  reportItems: [{ id: 1, item: "拆結費", amount: 300, note: "嚴重打結" }],
};

const statusMap = {
  reserved: { label: "預約成立", color: "var(--orange)", actions: ["取消預約", "編輯內容", "寵物報到"] },
  grooming: { label: "美容中", color: "var(--yellow)", actions: ["取消預約", "編輯內容", "美容完成LINE通知"] },
  pickup: { label: "待接回", color: "var(--ink)", actions: ["取消預約", "編輯內容", "接回寵物"] },
  done: { label: "已完成", color: "var(--green)", actions: [] },
  cancelled: { label: "已取消", color: "#888", actions: [] },
  waiting: { label: "候補中", color: "var(--lavender)", actions: ["取消預約", "修改時間", "一鍵轉正"] },
};

const petBreeds = [
  "其他",
  "吉娃娃",
  "八哥",
  "短毛臘腸",
  "迷你杜賓",
  "傑克羅素梗（短毛）",
  "貴賓",
  "馬爾濟斯",
  "博美",
  "比熊",
  "西施",
  "約克夏",
  "雪納瑞",
  "法門",
  "米格魯",
  "波士頓梗",
  "台灣犬",
  "柴犬",
  "柯基",
  "喜樂蒂",
  "日本狐狸犬",
  "拉不拉多",
  "杜賓",
  "羅威那",
  "威瑪獵犬",
  "黃金獵犬",
  "哈士奇",
  "邊境牧羊犬",
  "古代牧羊犬",
  "鬆獅",
  "薩摩耶",
  "伯恩山",
  "聖伯納",
  "大丹",
  "米克斯",
  "英短",
  "美短",
  "曼赤肯（短腿）",
  "暹羅",
  "豹貓",
  "俄羅斯藍貓",
  "波斯",
  "布偶",
  "緬因貓",
  "金吉拉",
  "挪威森林貓",
  "伯曼貓",
];

const surchargePairs = [
  { item: "拆結費", note: "嚴重打結" },
  { item: "除廢毛費", note: "廢毛過多" },
  { item: "環境消毒費", note: "寄生蟲" },
  { item: "藥浴/護理費", note: "特殊皮膚狀況" },
  { item: "重洗/特殊清潔費", note: "沾染排泄物" },
  { item: "逾時費", note: "延遲接" },
  { item: "急件費", note: "急件費" },
  { item: "其他", note: "其他" },
];

const waitingCandidates = [
  { id: "wang", name: "王皮皮", pet: "dog", breed: "哈士奇", age: "8歲", service: "小美容", date: "2026/04/16 (六)", time: "14:30" },
  { id: "douhua", name: "豆花", pet: "dog", breed: "哈士奇", age: "8歲", service: "小美容", date: "2026/04/16 (六)", time: "14:30" },
  { id: "maomao", name: "毛毛", pet: "cat", breed: "布偶貓", age: "8歲", service: "小美容", date: "2026/04/16 (六)", time: "10:30" },
  { id: "miqiu", name: "米球", pet: "dog", breed: "哈士奇", age: "8歲", service: "小美容", date: "2026/04/18 (一)", time: "14:30" },
  { id: "doudou", name: "豆漿", pet: "cat", breed: "布偶貓", age: "8歲", service: "小美容", date: "2026/04/16 (六)", time: "10:30" },
  { id: "maomao2", name: "毛毛", pet: "cat", breed: "布偶貓", age: "8歲", service: "小美容", date: "2026/04/16 (六)", time: "10:30" },
];

function setState(next) {
  Object.assign(state, next);
  render();
}

function showToast(text) {
  setState({ toast: text, modal: null });
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => setState({ toast: "" }), 2200);
}

function icon(name) {
  const icons = {
    calendar: "▣",
    list: "☷",
    plus: "+",
    user: "●",
    back: "‹",
    close: "×",
    clock: "◷",
    check: "✓",
    edit: "✎",
    car: "▰",
    note: "▤",
    camera: "▣",
    trash: "⌫",
    message: "▤",
  };
  return icons[name] || name;
}

function shell(content, active = "schedule") {
  return `
    <div class="app-shell">
      <aside class="side-nav">
        <button class="brand-dot" data-screen="schedule">精算獅</button>
        ${navItem("schedule", "預約清單", "☰", active === "schedule")}
        ${navItem("waiting", "待確認", "✓", active === "waiting", "9+")}
        ${navItem("pets", "寵物資料", "▦", active === "pets")}
      </aside>
      <main class="main main-${active}">${content}</main>
      ${state.toast ? `<div class="toast"><span>${icon("check")}　${state.toast}</span><button class="icon-btn" data-close-toast>${icon("close")}</button></div>` : ""}
      ${state.modal ? modalTemplate() : ""}
    </div>
  `;
}

function navItem(screen, label, mark, active, badge = "") {
  return `
    <button class="nav-item ${active ? "active" : ""}" data-nav="${screen}">
      <span class="nav-icon">${mark}</span>
      <span class="nav-label">${label}</span>
      ${badge ? `<span class="badge">${badge}</span>` : ""}
    </button>
  `;
}

function topbar(title, dateText = "2026/04/16 (四)") {
  return `
    <div class="topbar">
      <div class="topbar-main">
        <h1 class="title">${title}</h1>
        <div class="date-row">
          <button class="icon-btn">${icon("back")}</button>
          <span>${dateText}</span>
          <button class="icon-btn">›</button>
          <button class="outline-btn">今天</button>
        </div>
      </div>
      <div class="topbar-side">
        ${headerMeta()}
        <div class="actions">
          <div class="segmented">
            <button class="${state.view === "day" ? "active" : ""}" data-view="day">日視圖</button>
            <button class="${state.view === "week" ? "active" : ""}" data-view="week">週視圖</button>
          </div>
          <button class="primary-btn" data-screen="new-pet">${icon("plus")} 新增預約</button>
        </div>
      </div>
    </div>
  `;
}

function headerMeta() {
  return `
    <div class="header-meta">
      <span>最後更新時間: yyyy/mm/dd HH:MM:SS</span>
      <span class="user-circle" aria-label="使用者"></span>
    </div>
  `;
}

function loginScreen() {
  return `
    <section class="login-screen">
      <div class="login-wrap">
        <p class="login-logo"><span>精算獅</span> 寵物美容智慧產能預約系統</p>
        <div class="login-card">
          <div class="login-art">
            <img src="./assets/login-dog.png" alt="精算獅登入插圖" />
          </div>
          <div class="login-form">
            <h1>會員登入</h1>
            <div class="field">
              <label>帳號</label>
              <input class="input" placeholder="請輸入帳號" />
            </div>
            <div class="field">
              <label>密碼</label>
              <input class="input" placeholder="請輸入密碼" type="password" />
            </div>
            <div class="login-actions">
              <button class="dark-btn" data-screen="schedule">登入系統　›</button>
              <a href="#" style="color:#888;">忘記密碼</a>
            </div>
          </div>
        </div>
        <div class="version">Version: 1.0.0.0</div>
      </div>
    </section>
  `;
}

function scheduleScreen() {
  const title = state.view === "day" ? "預約清單" : "預約清單";
  const date = state.view === "day" ? "2026/04/16 (四)" : "2026/04/13(一) - 2026/04/19(日)";
  return shell(`
    ${topbar(title, date)}
    <section class="panel schedule-panel">
      <div class="schedule-head">
        <h2 class="section-title">${icon("calendar")} 預約清單</h2>
        ${state.view === "week" ? weekLegend() : `<button class="outline-btn" data-drawer>${icon("list")} 候補名單</button>`}
      </div>
      ${state.view === "day" ? dayView() : weekView()}
    </section>
    ${state.drawer ? waitDrawer() : ""}
  `, "schedule");
}

function waitingScreen() {
  const selected = waitingCandidates.find(item => item.id === state.waitingSelection) || waitingCandidates[0];
  return shell(`
    <div class="page-head waiting-top">
      <h1 class="title">待確認管理模組</h1>
      <div class="page-head-side">${headerMeta()}</div>
    </div>
    <div class="waiting-layout">
      <section class="panel waiting-schedule-panel">
        <div class="schedule-head">
          <h2 class="section-title">${icon("calendar")} ${selected.id === "miqiu" ? "2026/04/18(一)" : "2026/04/16(六)"}</h2>
        </div>
        ${waitingDayView(selected.id)}
      </section>
      <aside class="waiting-list-panel">
        ${waitingCandidates.map(candidate => waitingListCard(candidate, selected.id === candidate.id)).join("")}
      </aside>
    </div>
  `, "waiting");
}

function waitingDayView(selectedId) {
  const cards = selectedId === "miqiu"
    ? [
      ["已預約", "09:00", "王皮皮", "小美容　哈士奇　8歲<br>王曉美　0913579845", "tone-orange", 72, ""],
      ["已預約", "11:00", "毛毛", "小美容　布偶貓　8歲<br>王曉美　0913579845", "tone-orange", 228, "cat"],
      ["已預約", "15:00", "毛毛", "小美容　布偶貓　8歲<br>王曉美　0913579845", "tone-orange", 510, "cat"],
    ]
    : [
      ["已預約", "08:00", "王皮皮", "小美容　哈士奇　8歲<br>王曉美　0913579845", "tone-orange", 0, ""],
      ["已預約", "08:00", "王皮皮", "小美容　哈士奇　8歲<br>王曉美　0913579845", "tone-orange", 108, ""],
      ["已預約", "08:00", "毛毛", "小美容　布偶貓　8歲<br>王曉美　0913579845", "tone-orange", 290, "cat"],
      ["已預約", "15:00", "毛毛", "小美容　布偶貓　8歲<br>王曉美　0913579845", "tone-orange", 432, "cat"],
      ["已取消", "14:30", "毛毛", "小美容　布偶貓<br>王曉美　0913579845", "cancelled", 468, "cat", "compact"],
      ["已預約", "15:00", "毛毛", "小美容　布偶貓　8歲<br>王曉美　0913579845", "tone-orange", 540, "cat"],
    ];
  return `
    <div class="day-grid waiting-day-grid">
      <div class="time-rail">
        ${["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:30"].map(t => `<div class="time-mark">${t}</div>`).join("")}
      </div>
      <div class="day-lane">
        ${cards.map(args => appointment(...args)).join("")}
      </div>
    </div>
  `;
}

function waitingListCard(candidate, active) {
  const petKind = candidate.pet === "cat" ? "cat" : "dog";
  return `
    <div class="waiting-list-card ${active ? "active" : ""}" data-waiting-select="${candidate.id}" role="button" tabindex="0">
      <span class="status-chip">候補中</span>
      <span class="waiting-list-time">${icon("clock")} ${candidate.date}　${candidate.time}</span>
      <span class="pet-avatar ${candidate.pet === "cat" ? "cat" : ""}"><img src="./assets/pet-${petKind}-card.png" alt="${petKind === "cat" ? "貓" : "狗"}" /></span>
      <span class="waiting-list-info"><strong>${candidate.name}</strong><br>${candidate.breed}　${candidate.age}　${candidate.service}</span>
      <button class="arrow-square" data-detail="候補中" aria-label="查看候補資料">›</button>
    </div>
  `;
}

function dayView() {
  return `
    <div class="day-grid">
      <div class="time-rail">
        ${["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00"].map(t => `<div class="time-mark">${t}</div>`).join("")}
        <span class="now-marker">11:18</span>
      </div>
      <div class="day-lane">
        ${appointment("已完成", "08:00", "王皮皮", "小美容　哈士奇<br>王曉美　0913579845", "tone-green", 0)}
        ${appointment("待接回", "09:30", "毛毛", "小美容　布偶貓<br>王曉美　0913579845", "tone-blue", 108, "cat")}
        ${appointment("已取消", "09:00", "毛毛", "小美容　布偶貓<br>王曉美　0913579845", "cancelled", 72, "cat", "compact")}
        ${appointment("美容中", "11:00", "王皮皮", "小美容　哈士奇<br>王曉美　0913579845", "tone-yellow", 216)}
        ${appointment("已預約", "12:30", "毛毛", "小美容　布偶貓<br>王曉美　0913579845", "tone-orange", 324, "cat")}
        ${appointment("已預約", "11:30", "王皮皮", "小美容　哈士奇<br>王曉美　0913579845", "tone-orange", 252, "", "compact")}
        ${appointment("已預約", "13:00", "王皮皮", "小美容　哈士奇<br>王曉美　0913579845", "tone-orange", 360, "", "compact")}
        ${appointment("已預約", "15:00", "毛毛", "小美容　布偶貓<br>王曉美　0913579845", "tone-orange", 432, "cat")}
        ${appointment("已預約", "14:30", "毛毛", "小美容　布偶貓<br>王曉美　0913579845", "tone-orange", 468, "cat", "compact")}
      </div>
    </div>
  `;
}

function appointment(status, time, name, detail, tone, top, pet = "", extra = "") {
  const petKind = pet === "cat" ? "cat" : "dog";
  return `
    <button class="appt ${tone} ${extra}" style="top:${top}px" data-detail="${status}">
      <span class="status-chip">${status}</span>
      <span class="appt-time">${icon("clock")} ${time}　${name}</span>
      <span class="pet-avatar ${pet}"><img src="./assets/pet-${petKind}-card.png" alt="${petKind === "cat" ? "貓" : "狗"}" /></span>
      <span class="appt-name">${detail}</span>
    </button>
  `;
}

function weekLegend() {
  return `
    <div class="legend">
      <span><i class="dot" style="background:var(--green)"></i>小美容</span>
      <span><i class="dot" style="background:var(--yellow)"></i>大美容</span>
      <span><i class="dot" style="background:var(--lavender)"></i>其他服務</span>
    </div>
  `;
}

function weekView() {
  const days = ["04/13(一)", "04/14(二)", "04/15(三)", "04/16(四)", "04/17(五)", "04/18(六)", "04/19(日)"];
  const cards = [
    [["08:00", "王皮皮", "大美容", "tone-yellow", 0], ["09:30", "陳小胖", "小美容", "tone-green", 108], ["12:30", "王皮皮", "大美容", "tone-yellow", 324]],
    [["08:00", "陳小胖", "小美容", "tone-green", 0], ["09:30", "王皮皮", "大美容", "tone-yellow", 216], ["12:30", "陳小胖", "其他服務", "tone-purple", 324]],
    [["08:00", "陳小胖", "小美容", "tone-green", 0], ["09:30", "王皮皮", "大美容", "tone-yellow", 108], ["12:30", "陳小胖", "小美容", "tone-green", 216]],
    [["08:00", "王皮皮", "大美容", "tone-yellow", 0], ["09:30", "王皮皮", "大美容", "tone-yellow", 108], ["11:00", "陳...", "其...", "tone-purple", 216], ["12:30", "陳小胖", "小美容", "tone-green", 324]],
    [["08:00", "王皮皮", "大美容", "tone-yellow", 0], ["09:30", "陳小胖", "其他服務", "tone-purple", 108], ["11:30", "王皮皮", "大美容", "tone-yellow", 216], ["13:30", "陳小胖", "小美容", "tone-green", 432]],
    [["08:00", "陳小胖", "小美容", "tone-green", 0], ["09:30", "陳小胖", "小美容", "tone-green", 108], ["11:30", "陳小胖", "小美容", "tone-green", 216], ["13:30", "陳小胖", "其他服務", "tone-purple", 432]],
    [["08:00", "王皮皮", "大美容", "tone-yellow", 0], ["09:00", "陳...", "其...", "tone-purple", 216], ["13:30", "陳小胖", "小美容", "tone-green", 432]],
  ];
  return `
    <div class="week-wrap">
      <div class="time-rail" style="padding-top:42px;">
        ${["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00"].map(t => `<div class="time-mark">${t}</div>`).join("")}
      </div>
      ${days.map((day, i) => `
        <div class="week-col ${i < 3 ? "past" : ""} ${i === 3 ? "current" : ""}">
          <div class="week-day-label ${i === 3 ? "today" : ""}">${day}</div>
          ${cards[i].map(([time, name, service, tone, top]) => `<button class="week-card ${tone}" style="top:${top + 42}px" data-detail="${service}"><strong>${time}</strong><b>${name}</b><span>${service}</span></button>`).join("")}
        </div>
      `).join("")}
    </div>
  `;
}

function waitDrawer() {
  return `
    <aside class="drawer">
      <div class="drawer-head"><span>${icon("list")} 候補名單 (3)</span><button class="icon-btn" data-close-drawer>${icon("close")}</button></div>
      ${waitCard("11:00", "王皮皮", "小美容　哈士奇<br>王曉美　0913579845")}
      ${waitCard("11:00", "毛毛", "小美容　布偶貓<br>王曉美　0913579845", "cat")}
      ${waitCard("17:30", "毛毛", "小美容　布偶貓<br>王曉美　0913579845", "cat")}
    </aside>
  `;
}

function waitCard(time, name, detail, pet = "") {
  const petKind = pet === "cat" ? "cat" : "dog";
  return `
    <button class="wait-card" data-detail="候補中">
      <div class="wait-line">${icon("clock")} ${time}　${name}</div>
      <span class="pet-avatar ${pet}"><img src="./assets/pet-${petKind}-card.png" alt="${petKind === "cat" ? "貓" : "狗"}" /></span>
      <div class="appt-name">${detail}</div>
    </button>
  `;
}

function newPetScreen() {
  return shell(`
    ${simpleHead("選擇寵物")}
    <section class="form-card">
      <div class="field"><label>聯絡電話</label><input class="input" value="091812" /></div>
      <div class="field"><label>寵物名稱</label><input class="input" placeholder="請輸入寵物名稱" /></div>
      <div class="field"><label>寵物品種</label><select class="select"><option>請選擇</option>${petBreeds.map(breed => `<option>${breed}</option>`).join("")}</select></div>
    </section>
    <div class="result-head">
      <h2 class="subhead">${icon("list")} 搜尋結果(8)</h2>
      <button class="outline-btn">${icon("plus")} 新增寵物</button>
    </div>
    <section>
      ${petRow("布丁", "布偶貓　5歲", "次要", "李宇昌　0918054635", "cat")}
      ${petRow("王皮皮", "哈士奇　8歲", "主要", "王小美　0918120635")}
      ${petRow("糰球", "布偶貓　5歲", "次要", "孫小美　0918054635", "cat")}
      ${petRow("蔡桃桂", "布偶貓　5歲", "次要", "陳大明　0918054635", "cat")}
      ${petRow("陳美琪", "米克斯　12歲", "主要", "王小美　0918120635")}
    </section>
  `, "schedule");
}

function petsScreen() {
  const pets = [
    { name: "布丁", detail: "布偶貓　5歲", tag: "次要", owner: "李宇昌　0918054635", pet: "cat" },
    { name: "王皮皮", detail: "哈士奇　8歲", tag: "主要", owner: "王小美　0918120635", pet: "" },
    { name: "陳美琪", detail: "米克斯　12歲", tag: "主要", owner: "王小美　0918120635", pet: "" },
    { name: "蔡桃桂", detail: "布偶貓　5歲", tag: "次要", owner: "李宇昌　0918054635", pet: "cat" },
    { name: "王皮皮", detail: "布偶貓　5歲", tag: "次要", owner: "李宇昌　0918054635", pet: "cat" },
  ];
  const phoneQuery = state.petPhoneQuery || "";
  const filteredPets = phoneQuery
    ? pets.filter(pet => pet.owner.replace(/\D/g, "").includes(phoneQuery.replace(/\D/g, "")))
    : pets;
  return shell(`
    <div class="page-head">
      <h1 class="title">寵物資料</h1>
      <div class="page-head-side">${headerMeta()}</div>
    </div>
    <section class="form-card">
      <div class="field"><label>聯絡電話</label><input class="input" value="${state.petPhoneQuery}" data-pet-phone-search inputmode="numeric" /></div>
      <div class="field"><label>寵物名稱</label><input class="input" placeholder="請輸入寵物名稱" /></div>
      <div class="field"><label>寵物品種</label><select class="select"><option>請選擇</option>${petBreeds.map(breed => `<option>${breed}</option>`).join("")}</select></div>
    </section>
    <div class="result-head">
      <h2 class="subhead">${icon("list")} 搜尋結果(${filteredPets.length})</h2>
      <button class="outline-btn">${icon("plus")} 新增寵物</button>
    </div>
    <section class="pet-search-results">
      ${filteredPets.length
        ? filteredPets.map(pet => petRow(pet.name, pet.detail, pet.tag, pet.owner, pet.pet, "pet-detail")).join("")
        : `<div class="empty-results">找不到符合的寵物資料</div>`}
    </section>
  `, "pets");
}

function petRow(name, detail, tag, owner, pet = "", target = "new-service") {
  const petKind = pet === "cat" ? "cat" : "dog";
  return `
    <button class="pet-row" data-screen="${target}">
      <span class="pet-avatar ${pet}"><img src="./assets/pet-${petKind}-card.png" alt="${petKind === "cat" ? "貓" : "狗"}" /></span>
      <span class="pet-row-main"><strong>${name}</strong><span>${detail}</span></span>
      <span class="pet-row-owner"><span class="owner-tag ${tag === "次要" ? "secondary" : ""}">${tag}</span><span>${owner}</span></span>
    </button>
  `;
}

function serviceIcon(kind, tone = "") {
  const srcMap = {
    small: "./assets/service-small.png",
    large: "./assets/service-large.png",
    custom: "./assets/service-custom.png",
  };
  const labelMap = {
    small: "小美容",
    large: "大美容",
    custom: "客製化服務",
  };
  return `<span class="service-icon ${tone}"><img src="${srcMap[kind] || srcMap.small}" alt="${labelMap[kind] || "美容服務"}" /></span>`;
}

function petDetailScreen() {
  return shell(`
    <div class="page-head fixed-detail-head">
      <div class="back-title"><button class="icon-btn" data-screen="pets">${icon("back")}</button>寵物資料_王皮皮</div>
      <div class="page-head-side">
        ${headerMeta()}
        <div class="actions"><button class="icon-btn">...</button><button class="dark-btn">${icon("edit")} 編輯內容</button><button class="primary-btn">${icon("plus")} 新增預約</button></div>
      </div>
    </div>
    ${petDetailContent()}
  `, "pets");
}

function petDetailContent() {
  return `
    <div class="detail-grid pet-data-grid">
      <aside>
        ${petProfileCard()}
        <div class="owners-head"><span>${icon("user")} 照護人 (2)</span><span>＋ 新增照護人</span></div>
        ${ownerRow("Annie Yang", "楊芷慧", "0912772275", "主要")}
        ${ownerRow("Sandy Yang", "楊美鳳", "0933255468", "次要", true)}
      </aside>
      <section class="content-stack">
        ${petInfo("pet")}
        ${noteInfo("pet")}
        ${reviewInfo()}
        ${petRecordTabs()}
      </section>
    </div>
  `;
}

function petProfileCard() {
  return `
    <section class="detail-card pet-profile">
      <div class="profile-name"><span class="pet-avatar"><img src="./assets/pet-dog-card.png" alt="狗" /></span>王皮皮</div>
      <div class="facts">
        <strong>年齡</strong><span>15歲 <span style="color:var(--orange)">高齡</span></span>
        <strong>性別</strong><span>公</span>
        <strong>絕育狀況</strong><span>--</span>
        <strong>種類</strong><span>狗狗</span>
        <strong>品種</strong><span>貴賓狗</span>
        <strong>體重</strong><span>6kg</span>
        <strong>晶片</strong><span>A820394024</span>
      </div>
    </section>
  `;
}

function newServiceScreen() {
  return shell(`
    ${simpleHead("選擇美容項目")}
    <h2 class="subhead">已選寵物</h2>
    <div class="pet-row">
      <span class="pet-avatar"><img src="./assets/pet-dog-card.png" alt="狗" /></span>
      <span class="pet-row-main"><strong>王皮皮</strong><span>米克斯　12歲</span></span>
      <span class="pet-row-owner"><span class="owner-tag">主要</span><span>王小美　0918120635</span></span>
    </div>
    <h2 class="subhead">美容項目</h2>
    <button class="service-row tone-green" data-service-select="new-time">${serviceIcon("small")}<strong>小美容</strong><span class="price"><span>預估金額</span>$ 950</span></button>
    <button class="service-row tone-yellow" data-service-select="new-time">${serviceIcon("large")}<strong>大美容</strong><span class="price"><span>預估金額</span>$ 1450</span></button>
    <button class="service-row tone-purple" data-service-select="new-time">${serviceIcon("custom")}<strong>其他服務</strong><span class="price"><span>預估金額</span>請到店評估</span></button>
  `, "schedule");
}

function newTimeScreen() {
  const slots = [
    { time: "09:00", status: "green" },
    { time: "09:30", status: "" },
    { time: "10:00", status: "green" },
    { time: "10:30", status: "yellow" },
  ];
  return shell(`
    ${simpleHead("選擇時間")}
    <div class="booking-layout">
      <section class="panel schedule-panel" style="height:712px; min-height:0;">
        <div class="schedule-head">
          <h2 class="section-title">${icon("calendar")} 2026/04/16(四)</h2>
          <button class="outline-btn" data-drawer>${icon("list")} 候補名單(3)</button>
        </div>
        ${dayView()}
      </section>
      <aside>
        ${calendar()}
        <div class="slot-list">
          ${slots.map(slot => `<button class="slot ${state.selectedSlot === slot.time ? "active" : ""} ${slot.status}" data-slot="${slot.time}"><span>${slot.time}</span></button>`).join("")}
        </div>
        <button class="primary-btn confirm-wide" data-confirm-booking>確定 ${icon("check")}</button>
      </aside>
    </div>
    ${state.drawer ? waitDrawer() : ""}
  `, "schedule");
}

function calendar() {
  const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const dayCells = ["", "", "", ...Array.from({ length: 30 }, (_, index) => String(index + 1))];
  const dotMap = {
    17: "green",
    18: "yellow",
    19: "green",
    20: "green",
    21: "yellow",
    22: "green",
    23: "green",
    24: "green",
    25: "green",
    26: "green",
    27: "green",
    28: "green",
    29: "yellow",
    30: "green",
  };
  return `
    <div class="calendar-card">
      <div class="calendar-title">
        <span>June 2026</span>
        <span class="calendar-arrows"><button type="button">‹</button><button type="button">›</button></span>
      </div>
      <div class="calendar-weekdays">
        ${weekdays.map(day => `<span>${day}</span>`).join("")}
      </div>
      <div class="calendar-days">
        ${dayCells.map(day => {
          if (!day) return `<span class="cal-day blank"></span>`;
          const active = state.selectedDate === day ? "active" : "";
          const past = Number(day) < 16 ? "past" : "";
          const dot = dotMap[day] ? `has-dot ${dotMap[day]}` : "";
          return `<button type="button" class="cal-day ${active} ${past} ${dot}" data-calendar-day="${day}">${day}</button>`;
        }).join("")}
      </div>
    </div>
    <div class="calendar-legend">
      <span><i class="today-dot"></i>今日</span>
      <span><i class="selected-dot"></i>選中日期</span>
      <span><i class="green-dot"></i>建議預約</span>
      <span><i class="yellow-dot"></i>鄰近額滿</span>
    </div>
  `;
}

function detailScreen(status = state.detailStatus) {
  const data = statusMap[status] || statusMap.reserved;
  const isHistory = status === "done";
  const isReport = status === "report";
  const reportTitle = state.reportMode === "quote" ? "寵物計價單_編輯" : "寵物報到__王皮皮";
  return shell(`
    <div class="page-head fixed-detail-head">
      <div>
        <div class="back-title"><button class="icon-btn" data-screen="${isReport ? "detail" : "schedule"}">${icon("back")}</button>${isHistory ? "歷史預約紀錄" : isReport ? reportTitle : "寵物資料__王皮皮"}</div>
        <div class="status-line"><i class="dot" style="background:${data.color}"></i>案件狀態:${data.label}</div>
      </div>
      <div class="page-head-side">
        ${headerMeta()}
        <div class="actions">${detailActions(status)}</div>
      </div>
    </div>
    ${status === "report" ? reportContent() : detailContent(status)}
  `, status === "waiting" ? "waiting" : "pets");
}

function detailActions(status) {
  if (status === "report") {
    if (state.reportMode === "quote") {
      return `
        <button class="outline-btn" data-screen="detail">✖ 關閉</button>
        <button class="primary-btn" data-open-modal="quote-notice">▣ 更新報價</button>
      `;
    }
    return `<button class="primary-btn" data-status-next="grooming">${icon("check")} 進入美容</button>`;
  }
  const actions = statusMap[status]?.actions || [];
  return actions.map(action => {
    if (action === "取消預約") return `<button class="outline-btn" data-open-modal="cancel-confirm">▣ ${action}</button>`;
    if (action === "寵物報到") return `<button class="primary-btn" data-screen="report" data-report-mode="checkin">${icon("check")} ${action}</button>`;
    if (action === "美容完成LINE通知") return `<button class="green-btn" data-open-modal="complete">${icon("message")} ${action}</button>`;
    if (action === "接回寵物") return `<button class="primary-btn" data-status-next="done">${icon("car")} ${action}</button>`;
    if (action === "一鍵轉正") return `<button class="primary-btn" data-open-modal="transfer-confirm">${icon("check")} ${action}</button>`;
    return `<button class="dark-btn">${icon("edit")} ${action}</button>`;
  }).join("");
}

function detailContent(status) {
  return `
    <div class="detail-grid">
      <aside>
        ${petProfileCard()}
        <div class="owners-head"><span>${icon("user")} 照護人 (2)</span><span>＋ 新增照護人</span></div>
        ${ownerRow("Annie Yang", "楊芷慧", "0912772275", "主要")}
        ${ownerRow("Sandy Yang", "楊美鳳", "0933255468", "次要", true)}
      </aside>
      <section class="content-stack">
        ${bookingInfo()}
        ${petInfo(status)}
        ${noteInfo(status)}
        ${reviewInfo()}
        ${contractInfo(status)}
        ${quoteInfo(status)}
        ${status === "done" ? sentInfo() : ""}
      </section>
    </div>
  `;
}

function petRecordTabs() {
  const history = state.petTab === "history";
  return `
    <div class="info-card pet-record-card">
      <div class="pet-tabs">
        <button class="${history ? "active" : ""}" data-pet-tab="history">歷史預約紀錄</button>
        <button class="${!history ? "active" : ""}" data-pet-tab="contract">主合約簽署紀錄</button>
      </div>
      ${history ? petHistoryRecords() : petContractRecords()}
    </div>
  `;
}

function petHistoryRecords() {
  return `
    <h3>${icon("calendar")} 預約紀錄(24)</h3>
    <div class="record-list">
      ${historyRow("large", "大美容", "07/05 (四)　09:00", "已完成", "$1200", "tone-yellow")}
      ${historyRow("small", "小美容", "04/17 (六)　12:30", "已完成", "$1800", "tone-green")}
      ${historyRow("custom", "客製化服務", "02/09 (四)　09:00", "已取消", "請到店評估", "tone-purple")}
      ${historyRow("large", "大美容", "02/05 (四)　09:00", "已完成", "$1200", "tone-yellow")}
      ${historyRow("custom", "客製化服務", "02/09 (四)　09:00", "已完成", "$2000", "tone-purple")}
    </div>
  `;
}

function historyRow(mark, service, date, status, price, tone) {
  return `
    <button class="history-row" data-detail="已完成">
      ${serviceIcon(mark, tone)}
      <strong>${service}</strong>
      <span>${date}</span>
      <b>${status}</b>
      <em>${price}</em>
    </button>
  `;
}

function petContractRecords() {
  return `
    <h3>${icon("list")} 合約紀錄(2)</h3>
    <div class="record-list">
      ${contractHistoryRow("主合約", "簽署時間　2024/05/27")}
      ${contractHistoryRow("主合約", "簽署時間　2021/01/10")}
    </div>
  `;
}

function contractHistoryRow(title, sub) {
  return `
    <button class="contract-history-row" data-contract-open>
      <span class="check-circle">${icon("check")}</span>
      <span><strong>${title}</strong><br><small>${sub}</small></span>
      <span class="arrow-square">›</span>
    </button>
  `;
}

function contractFlowScreen() {
  const step = state.contractStep || 1;
  return shell(`
    <div class="page-head fixed-detail-head contract-flow-head">
      <div class="back-title"><button class="icon-btn" data-screen="pet-detail" data-pet-tab="contract">${icon("back")}</button>犬、貓美容服務定型化契約</div>
      <div class="page-head-side">${headerMeta()}</div>
    </div>
    <section class="contract-card ${step === 4 ? "signature-card" : ""}">
      ${contractStepContent(step)}
    </section>
    <div class="contract-footer">
      ${step < 4
        ? `<button class="primary-btn contract-next" data-contract-next>下一步 (${step}/4)　›</button>`
        : `<button class="primary-btn contract-next" data-screen="pet-detail" data-pet-tab="contract">查看完畢　${icon("check")}</button>`}
    </div>
  `, "pets");
}

function contractStepContent(step) {
  if (step === 1) {
    return `
      <div class="contract-text">
        <h3>第一條（契約目的與範圍）</h3>
        <p>犬、貓美容服務，指提供犬、貓外表部位清洗或清潔、吹乾梳毛、毛髮修剪及造型設計等美容服務之行為。但不得涉及動物醫療行為及宣稱醫療療效。</p>
        <h3>第二條（寵物、甲方及乙方相關資料）</h3>
        <p>本契約應記載寵物、甲方及乙方之下列基本資料</p>
        <div class="contract-divider"></div>
        <h3>第一部分:飼主基本資料 <span>（甲方）</span></h3>
        <div class="contract-grid">
          <div class="contract-field"><strong>姓名</strong><p>楊芷慧</p></div>
          <div></div>
          <div class="contract-field"><strong>身分證字號/居留證號</strong><p>A228937892</p></div>
          <div></div>
          <div class="contract-field"><strong>聯絡電話*</strong><p>0912772275</p></div>
          <div></div>
          <div class="contract-field"><strong>通訊地址</strong><p>231新北市新店區中興路一段000號</p></div>
          <div></div>
          <div class="contract-field"><strong>緊急聯絡人</strong><p>王大明</p></div>
          <div class="contract-field"><strong>緊急聯絡人電話</strong><p>095846582</p></div>
        </div>
      </div>
    `;
  }
  if (step === 2) {
    return `
      <div class="contract-text">
        <h3>第二部分:寵物基本資料</h3>
        <div class="contract-grid pet-contract-grid">
          <div class="contract-field"><strong>寵物名字</strong><p>王皮皮</p></div>
          <div></div>
          <div class="contract-field"><strong>物種/品種</strong><p><span class="fake-radio on"></span> 狗狗　<span class="fake-radio"></span> 貓咪</p></div>
          <div class="contract-field"><strong>品種名稱</strong><p>哈士奇</p></div>
          <div class="contract-field"><strong>性別</strong><p><span class="fake-radio on"></span> 公　<span class="fake-radio"></span> 母</p></div>
          <div class="contract-field"><strong>絕育狀況</strong><p><span class="fake-radio"></span> 未絕育　<span class="fake-radio on"></span> 已絕育</p></div>
          <div class="contract-field"><strong>年齡</strong><p>2歲</p></div>
          <div class="contract-field"><strong>出生年份</strong><p>2024</p></div>
          <div class="contract-field"><strong>體重</strong><p>大型犬 (25~45kg )</p></div>
          <div class="contract-field"><strong>晶片號碼</strong><p>A820394024</p></div>
        </div>
      </div>
    `;
  }
  if (step === 3) {
    return `
      <div class="contract-text dense">
        <p>甲方及其授權之代理人(包括但不限於父母、配偶、同居人或其他家庭成員)代為送取寵物或進行相關確認時，該代理人之簽名或電子簽名之確認行為，其法律效力直接及於甲方本人。</p>
        <h3>第三條（服務內容之說明及確認）</h3>
        <p>1. 乙方應將實施之犬、貓美容服務內容製作紀錄，經甲方簽名確認後，提供電子檔予甲方留存。</p>
        <p>2. 前項紀錄之提供及甲方確認之方式，乙方得以書面、電子或其他適當之方式為之。</p>
        <h3>第四條（乙方詢問及照護義務）</h3>
        <p>1. 甲方於接受服務前，應主動填寫乙方提供之「寵物美容服務報價確認單」，誠實告知犬、貓之個性、攻擊性、疾病史或特殊注意事項。</p>
        <p>2. 前項紀錄應由甲方或其現場代理人簽名確認。雙方同意，任一代理人之簽署行為即代表甲方全體，其確認效力歸屬於甲方本人。</p>
        <p>3. 乙方得於美容過程中實施全程錄影及錄音，以維護服務品質並作為爭議發生時之佐證。</p>
        <h3>第五條（犬、貓美容服務期間有異常狀況或死亡情形之處理）</h3>
        <p>1. 於美容服務期間，乙方發現犬、貓實施美容部位或生理健康有異常狀況時，應立即妥善處理，並通知甲方或其指定之緊急聯絡人。</p>
        <p>2. 犬、貓有緊急就醫必要時，除立即通知甲方或其指定之緊急聯絡人外，乙方應優先將犬、貓送往指定之獸醫診療機構。</p>
        <p>3. 犬、貓美容服務期間死亡或有經乙方送往獸醫診療機構後死亡之情形，乙方應即通知甲方並善盡保管義務。</p>
        <h3>第六條（犬、貓美容服務實施前，甲方解除契約之退費規定）</h3>
        <p>雙方應依約定方式辦理變更、取消與退費，並以保障寵物安全與服務品質為原則。</p>
      </div>
    `;
  }
  return `
    <div class="contract-text signature-flow">
      <h3>立契約書人簽名</h3>
      <div class="signature-pad">陳小豪</div>
    </div>
  `;
}

function ownerRow(en, name, phone, tag, trash = false) {
  return `
    <div class="owner-row">
      <span class="owner-photo"></span>
      <span><span class="owner-tag ${tag === "次要" ? "secondary" : ""}">${tag}</span><br><strong>${en}</strong><br>${name}<br><span style="color:#888">${phone}</span></span>
      <span>${trash ? icon("trash") : ""}</span>
    </div>
  `;
}

function bookingInfo() {
  return `
    <div class="info-card">
      <h3>${icon("calendar")} 預約內容</h3>
      <div class="info-row"><div style="display:flex; align-items:center; gap:18px;">${serviceIcon("small", "tone-green")}<strong>小美容</strong></div><div><strong style="color:var(--orange)">▣</strong>　2026/04/17 (五)<br><strong style="color:var(--orange)">${icon("clock")}</strong>　12:30~15:30</div></div>
    </div>
  `;
}

function petInfo(status) {
  return `
    <div class="info-card">
      <h3>${icon("list")} 寵物資料</h3>
      <div class="info-row">
        <div>
          <div class="toggle-row"><strong>需雙人協力作業</strong><span class="switch"></span><span>否</span></div>
          <div class="toggle-row"><strong>${status === "waiting" ? "開放線上預約" : status === "grooming" || status === "pickup" ? "是否開放預約" : "接受線上預約"}</strong><span class="switch on"></span><span>是</span></div>
        </div>
        <div>
          <strong>美容作業困難度 (影響美容時長)</strong><span style="float:right; font-weight:900;">3/5</span>
          <div class="difficulty" style="margin-top:14px;"><span class="bar fill"></span><span class="bar fill"></span><span class="bar fill"></span><span class="bar"></span><span class="bar"></span></div>
        </div>
      </div>
    </div>
  `;
}

function noteInfo(status) {
  const note = status === "grooming" ? "狗狗年紀較大，關節活動稍慢，洗澡吹毛時容易緊張，耳朵偶爾敏感、皮膚偏乾，長時間站立會有點不舒服，需要美容時多留意休息與安撫。" : "狗狗年紀較大，關節活動稍慢，洗澡吹毛時容易緊張，耳朵偶爾敏感、皮膚偏乾，長時間站立會有點不舒服，需要美容時多留意休息與安撫。";
  return `<div class="info-card"><h3>${icon("note")} 店家備註(僅店家可見)</h3><div class="muted-box">${note}</div></div>`;
}

function reviewInfo() {
  return `
    <div class="info-card">
      <h3>${icon("message")} 客戶自評(顧客填寫資訊)</h3>
      <div class="gray-box">個性與行為評估<br>1. 個性傾向:親近人,護食/護物<br>2. 美容特殊反應/敏感區:怕吹風機(大風/聲音)<br>不喜歡被觸碰部位:頭部,下巴<br>其他特殊行為備註:無<br><br>生理狀況與病史調查<br>既往病史:白內障,脫臼<br>食物過敏:無<br><br>指定獸醫院:無</div>
    </div>
  `;
}

function contractInfo(status) {
  return `
    <div class="info-card">
      <h3>${icon("list")} 合約狀態</h3>
      ${contractRow("主合約", "簽署時間　2025/11/15", true)}
      ${contractRow("副合約_預約", "簽署時間　未簽屬", false)}
      ${status === "done" ? contractRow("副合約_加價1", "簽署時間　未簽屬", false) : ""}
    </div>
  `;
}

function contractRow(title, sub, on) {
  return `<div class="contract-row"><span class="check-circle ${on ? "" : "off"}">${icon("check")}</span><span><strong>${title}</strong><br><span style="color:#888">${sub}</span></span><button class="arrow-square">›</button></div>`;
}

function quoteInfo(status) {
  const photos = status === "waiting" ? "" : `<h3 style="margin-top:18px;">${icon("camera")} 影像記錄</h3><div class="photos"><span class="photo"></span><span class="photo"></span><span class="photo"></span><span class="photo"></span></div>`;
  const rows = state.reportItems.map(item => `<tr><td>${item.item}</td><td>${item.note}</td><td>NT$${item.amount}</td></tr>`).join("");
  return `
    <div class="info-card">
      <h3>${icon("message")} 計價 <span style="color:#999; font-size:14px; font-weight:500;">最後更新時間: yyyy/mm/dd HH:MM:SS</span>${status !== "done" && status !== "cancelled" ? `<button class="outline-btn" style="float:right;" data-screen="report" data-report-mode="quote">調整報價</button>` : ""}</h3>
      <table class="quote-table">
        <thead><tr><th>項目</th><th>內容說明</th><th>費用</th></tr></thead>
        <tbody><tr><td>基礎服務</td><td>小美容</td><td>NT$${state.reportBaseFee}</td></tr>${rows}</tbody>
        <tfoot><tr><td>總計費用</td><td></td><td>NT$${reportTotal()}</td></tr></tfoot>
      </table>
      ${photos}
    </div>
  `;
}

function sentInfo() {
  return `<div class="info-card"><h3>${icon("message")} 發送對象 <span style="color:#999; font-size:14px;">最後更新時間: yyyy/mm/dd HH:MM:SS</span></h3><p><strong style="color:var(--orange)">已發送</strong>　楊芷慧　楊美鳳</p><div class="muted-box">您的{寵物名稱} 已完成美容囉! 請到店接回!</div></div>`;
}

function reportTotal() {
  return state.reportBaseFee + state.reportItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}

function reportItemRow(item, index) {
  return `
    <div class="report-row" data-report-row="${item.id}">
      <div class="field">
        <label>${index === 0 ? "追加項目" : "&nbsp;"}</label>
        <select class="select" data-report-field="item" data-report-id="${item.id}">
          ${surchargePairs.map(pair => `<option ${item.item === pair.item ? "selected" : ""}>${pair.item}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label>${index === 0 ? "追加費用" : "&nbsp;"}</label>
        <input class="input" inputmode="numeric" value="${item.amount}" data-report-field="amount" data-report-id="${item.id}" />
      </div>
      <div class="field">
        <label>${index === 0 ? "加價說明 (選填)" : "&nbsp;"}</label>
        <input class="input" value="${item.note}" data-report-field="note" data-report-id="${item.id}" data-report-note-input />
      </div>
      <button class="trash-btn" data-delete-report-item="${item.id}" aria-label="刪除追加項目"><img src="./assets/trash-icon.png" alt="" /></button>
    </div>
  `;
}

function reportContent() {
  const photoBlock = state.reportMode === "quote"
    ? `
      <h2 class="subhead">${icon("camera")} 影像記錄 (3)</h2>
      <div class="report-photos">
        ${Array.from({ length: 4 }, () => `<span class="report-photo"><button class="photo-delete" aria-label="刪除照片"><img src="./assets/trash-icon.png" alt="" /></button></span>`).join("")}
        <div class="camera-box">${icon("camera")}<br>點擊拍攝照片</div>
      </div>
    `
    : `
      <h2 class="subhead">${icon("camera")} 影像記錄 (0)</h2>
      <div class="camera-box">${icon("camera")}<br>點擊拍攝照片</div>
    `;
  return `
    <section class="report-card">
      <h3>${icon("message")} 計價_小美容</h3>
      <div class="field"><label>原先費用</label><input class="input" inputmode="numeric" value="${state.reportBaseFee}" data-report-base-fee></div>
      <div class="report-grid">
        ${state.reportItems.map(reportItemRow).join("")}
        <button class="add-row-btn" data-add-report-item>＋ 新增追加項目</button>
      </div>
      <div class="total" data-report-total>總計　NT$${reportTotal()}</div>
    </section>
    ${photoBlock}
  `;
}

function modalTemplate() {
  const waiting = state.modal === "waiting";
  const cancelling = state.modal === "cancel-notice";
  const quoteNotice = state.modal === "quote-notice";
  const quoteItems = state.reportItems.map(item => item.item).join("、") || "項目";
  const message = waiting
    ? "{寵物名稱}的 {時間}{項目}店家已確認，非常期待您的到來!"
    : cancelling
      ? "{寵物名稱}的 {時間}{項目}已取消。"
      : quoteNotice
        ? `您的 {寵物名稱} 因${quoteItems}新增費用 此次費用共為:${reportTotal()}\n更新的合約連結:{連結}`
        : "您的{寵物名稱} 已完成美容囉!請到店接回!";
  if (state.modal === "cancel-confirm" || state.modal === "transfer-confirm") {
    const transfer = state.modal === "transfer-confirm";
    return `
      <div class="modal-backdrop">
        <section class="confirm-modal">
          <h2>${transfer ? "確定要轉正?" : "確定要取消預約?"}</h2>
          <p>${transfer ? "此操作將會發送訊息給客戶" : "請再次確認是否取消預約"}</p>
          <div class="modal-actions">
            <button class="outline-btn" data-close-modal>${transfer ? "取消" : "關閉"}</button>
            <button class="primary-btn" ${transfer ? "data-confirm-transfer" : "data-confirm-cancel"}>確定</button>
          </div>
        </section>
      </div>
    `;
  }
  return `
    <div class="modal-backdrop">
      <section class="modal">
        <div class="modal-head"><span>選擇發送對象</span><button class="icon-btn" data-close-modal>${icon("close")}</button></div>
        <div class="recipient-row"><span class="checkbox"></span><strong>照護人 (4)</strong></div>
        <div class="recipient-row"><span class="checkbox on">${icon("check")}</span><div class="recipient-card"><span class="owner-tag">主要</span><strong>楊芷慧</strong><span>0912123987</span></div></div>
        <div class="recipient-row"><span class="checkbox on">${icon("check")}</span><div class="recipient-card"><span class="owner-tag secondary">次要</span><strong>楊美鳳</strong><span>0912123987</span></div></div>
        <div class="field"><label>送出訊息</label><textarea class="textarea">${message}</textarea></div>
        <div class="modal-actions">
          ${waiting ? "" : `<button class="outline-btn" ${cancelling ? "data-skip-cancel-notice" : quoteNotice ? "data-skip-quote-notice" : "data-status-next=\"pickup\""}>略過不發送</button>`}
          <button class="primary-btn" data-send-notice>${icon("message")} 發送通知</button>
        </div>
      </section>
    </div>
  `;
}

function simpleHead(title) {
  return `
    <div class="page-head">
      <div class="back-title"><button class="icon-btn" data-screen="schedule">${icon("back")}</button>${title}</div>
      <div class="page-head-side">${headerMeta()}</div>
    </div>
  `;
}

function render() {
  if (state.screen === "login") app.innerHTML = loginScreen();
  if (state.screen === "schedule") app.innerHTML = scheduleScreen();
  if (state.screen === "waiting") app.innerHTML = waitingScreen();
  if (state.screen === "new-pet") app.innerHTML = newPetScreen();
  if (state.screen === "new-service") app.innerHTML = newServiceScreen();
  if (state.screen === "new-time") app.innerHTML = newTimeScreen();
  if (state.screen === "pets") app.innerHTML = petsScreen();
  if (state.screen === "pet-detail") app.innerHTML = petDetailScreen();
  if (state.screen === "contract-flow") app.innerHTML = contractFlowScreen();
  if (state.screen === "detail") app.innerHTML = detailScreen();
  if (state.screen === "report") app.innerHTML = detailScreen("report");
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button, a, [data-waiting-select]");
  if (!target) return;
  const screen = target.dataset.screen || target.dataset.nav;
  const detail = target.dataset.detail;
  const view = target.dataset.view;

  if (screen) {
    event.preventDefault();
    setState({ screen, drawer: false, modal: null, ...(target.dataset.reportMode ? { reportMode: target.dataset.reportMode } : {}) });
  }
  if (view) setState({ view, drawer: false });
  if (target.dataset.drawer !== undefined) setState({ drawer: true });
  if (target.dataset.closeDrawer !== undefined) setState({ drawer: false });
  if (target.dataset.closeToast !== undefined) setState({ toast: "" });
  if (target.dataset.closeModal !== undefined) setState({ modal: null });
  if (target.dataset.calendarDay) {
    setState({ selectedDate: target.dataset.calendarDay });
  }
  if (target.dataset.slot) {
    setState({ selectedSlot: target.dataset.slot });
  }
  if (target.dataset.confirmBooking !== undefined) {
    setState({ screen: "schedule", view: "day", drawer: false });
    window.setTimeout(() => showToast("預約成功"), 0);
  }
  if (detail) {
    event.preventDefault();
    const nextStatus = detail === "候補中" ? "waiting" : detail === "美容中" ? "grooming" : detail === "待接回" ? "pickup" : detail === "已完成" ? "done" : detail === "已取消" ? "cancelled" : "reserved";
    setState({ screen: "detail", detailStatus: nextStatus, drawer: false });
    return;
  }
  if (target.dataset.statusNext) {
    const next = target.dataset.statusNext;
    setState({ screen: "detail", detailStatus: next, modal: null });
    if (next === "grooming") window.setTimeout(() => showToast("已進入美容"), 0);
    if (next === "done") window.setTimeout(() => showToast("此次美容已完成"), 0);
  }
  if (target.dataset.openModal) setState({ modal: target.dataset.openModal });
  if (target.dataset.confirmCancel !== undefined) {
    setState({ modal: "cancel-notice" });
  }
  if (target.dataset.confirmTransfer !== undefined) {
    setState({ modal: "waiting" });
  }
  if (target.dataset.waitingSelect) {
    setState({ waitingSelection: target.dataset.waitingSelect });
  }
  if (target.dataset.petTab) {
    setState({ petTab: target.dataset.petTab });
  }
  if (target.dataset.contractOpen !== undefined) {
    event.preventDefault();
    setState({ screen: "contract-flow", contractStep: 1, petTab: "contract", drawer: false, modal: null });
  }
  if (target.dataset.contractNext !== undefined) {
    event.preventDefault();
    setState({ contractStep: Math.min(4, (state.contractStep || 1) + 1) });
  }
  if (target.dataset.skipCancelNotice !== undefined) {
    setState({ screen: "detail", detailStatus: "cancelled", modal: null });
    window.setTimeout(() => showToast("預約已取消"), 0);
  }
  if (target.dataset.skipQuoteNotice !== undefined) {
    setState({ screen: "detail", detailStatus: "grooming", modal: null, reportMode: "checkin" });
    window.setTimeout(() => showToast("報價更新成功"), 0);
  }
  if (target.dataset.sendNotice !== undefined) {
    const waiting = state.modal === "waiting";
    const cancelling = state.modal === "cancel-notice";
    const quoteNotice = state.modal === "quote-notice";
    setState({ screen: "detail", detailStatus: cancelling ? "cancelled" : waiting ? "reserved" : quoteNotice ? "grooming" : "pickup", modal: null, reportMode: "checkin" });
    window.setTimeout(() => showToast(cancelling ? "取消通知已發送" : waiting ? "轉正成功" : quoteNotice ? "報價更新成功，通知已發送" : "通知發送成功"), 0);
  }
  if (target.dataset.serviceSelect) {
    event.preventDefault();
    document.querySelectorAll(".service-row").forEach(row => row.classList.remove("selected-service"));
    target.classList.add("selected-service");
    window.setTimeout(() => setState({ screen: target.dataset.serviceSelect, drawer: false, modal: null }), 140);
  }
  if (target.dataset.addReportItem !== undefined) {
    state.reportItems.push({ id: Date.now(), item: surchargePairs[0].item, amount: 0, note: surchargePairs[0].note });
    render();
  }
  if (target.dataset.deleteReportItem) {
    const id = Number(target.dataset.deleteReportItem);
    state.reportItems = state.reportItems.filter(item => item.id !== id);
    render();
  }
});

document.addEventListener("input", (event) => {
  const target = event.target;
  if (target.matches("[data-pet-phone-search]")) {
    state.petPhoneQuery = target.value;
    render();
    const phoneInput = document.querySelector("[data-pet-phone-search]");
    if (phoneInput) {
      phoneInput.focus();
      const end = phoneInput.value.length;
      phoneInput.setSelectionRange(end, end);
    }
    return;
  }
  if (target.matches("[data-report-base-fee]")) {
    state.reportBaseFee = Number(target.value) || 0;
  }
  if (target.matches("[data-report-field]")) {
    const id = Number(target.dataset.reportId);
    const item = state.reportItems.find(row => row.id === id);
    if (item) {
      const field = target.dataset.reportField;
      item[field] = field === "amount" ? Number(target.value) || 0 : target.value;
    }
  }
  const total = document.querySelector("[data-report-total]");
  if (total) total.textContent = `總計　NT$${reportTotal()}`;
});

document.addEventListener("change", (event) => {
  const target = event.target;
  if (!target.matches("[data-report-field]")) return;
  const id = Number(target.dataset.reportId);
  const item = state.reportItems.find(row => row.id === id);
  if (!item) return;
  item[target.dataset.reportField] = target.value;
  if (target.dataset.reportField === "item") {
    const pair = surchargePairs.find(row => row.item === target.value);
    if (pair) {
      item.note = pair.note;
      const noteInput = document.querySelector(`[data-report-field="note"][data-report-id="${id}"]`);
      if (noteInput) noteInput.value = pair.note;
    }
  }
});

render();
