const statusText = document.getElementById("statusText");
const refreshButton = document.getElementById("refreshButton");
const rebuildCacheButton = document.getElementById("rebuildCacheButton");
const exportPdfButton = document.getElementById("exportPdfButton");
const exportCsvButton = document.getElementById("exportCsvButton");
const monthPicker = document.getElementById("monthPicker");
const languageSelect = document.getElementById("languageSelect");
const tableRangeSelect = document.getElementById("tableRangeSelect");
const periodRangeSelect = document.getElementById("periodRangeSelect");
const warningBox = document.getElementById("warningBox");
const dailyTableBody = document.getElementById("dailyTableBody");

const metricFields = {
  solarNow: document.getElementById("solarNow"),
  homeNow: document.getElementById("homeNow"),
  gridImportNow: document.getElementById("gridImportNow"),
  gridExportNow: document.getElementById("gridExportNow"),
  batteryChargeNow: document.getElementById("batteryChargeNow"),
  batteryDischargeNow: document.getElementById("batteryDischargeNow"),
  todaySolar: document.getElementById("todaySolar"),
  todaySelfConsumption: document.getElementById("todaySelfConsumption"),
  todayFeedin: document.getElementById("todayFeedin"),
  todayHome: document.getElementById("todayHome"),
  todayGrid: document.getElementById("todayGrid"),
  todayBatteryCharge: document.getElementById("todayBatteryCharge"),
  todayBatteryDischarge: document.getElementById("todayBatteryDischarge"),
  batterySoc: document.getElementById("batterySoc"),
  batteryTemp: document.getElementById("batteryTemp"),
  inverterTemp: document.getElementById("inverterTemp"),
  solarLastHour: document.getElementById("solarLastHour"),
  homeLastHour: document.getElementById("homeLastHour"),
  gridImportLastHour: document.getElementById("gridImportLastHour"),
  gridExportLastHour: document.getElementById("gridExportLastHour"),
  batteryChargeLastHour: document.getElementById("batteryChargeLastHour"),
  batteryDischargeLastHour: document.getElementById("batteryDischargeLastHour"),
  periodSolarProduction: document.getElementById("periodSolarProduction"),
  periodHomeUsage: document.getElementById("periodHomeUsage"),
  periodIntoBattery: document.getElementById("periodIntoBattery"),
  periodOutBattery: document.getElementById("periodOutBattery"),
  periodReturnToGrid: document.getElementById("periodReturnToGrid"),
  periodGridConsumption: document.getElementById("periodGridConsumption"),
  periodSelfConsumption: document.getElementById("periodSelfConsumption"),
};

const textFields = {
  currentDateTime: document.getElementById("currentDateTime"),
  deviceTitle: document.getElementById("deviceTitle"),
  deviceMeta: document.getElementById("deviceMeta"),
  liveMeta: document.getElementById("liveMeta"),
  periodTotalsMeta: document.getElementById("periodTotalsMeta"),
  badgeRow: document.getElementById("badgeRow"),
};

const flowFields = {
  solar: document.getElementById("flowSolar"),
  grid: document.getElementById("flowGrid"),
  gridMode: document.getElementById("flowGridMode"),
  home: document.getElementById("flowHome"),
  battery: document.getElementById("flowBattery"),
  batteryMode: document.getElementById("flowBatteryMode"),
  solarToHomePath: document.getElementById("solarToHomePath"),
  solarToBatteryPath: document.getElementById("solarToBatteryPath"),
  solarToGridPath: document.getElementById("solarToGridPath"),
  gridToHomePath: document.getElementById("gridToHomePath"),
  batteryToHomePath: document.getElementById("batteryToHomePath"),
  gridToBatteryPath: document.getElementById("gridToBatteryPath"),
};

let energyChart;
let batteryChart;
let last24HoursChart;
let currentRows = [];
let sortState = {
  key: "date",
  direction: "desc",
};
let currentLanguage = localStorage.getItem("foxcloud-dashboard-language") || "en";
let lastPayload = null;
let lastRangePayload = null;

const translations = {
  en: {
    appEyebrow: "FoxCloud Battery Dashboard",
    appTitle: "Home energy command center",
    waitingForFoxCloud: "Waiting for FoxCloud...",
    month: "Month",
    dashboardMonth: "Dashboard month",
    language: "Language",
    refresh: "Refresh",
    rebuildCache: "Rebuild cache",
    exportPdf: "Export PDF",
    exportCsv: "Export CSV",
    loading: "Loading dashboard data...",
    loaded: "Dashboard loaded successfully.",
    loadedCached: "Dashboard loaded from cached data because the live API call failed.",
    demoData: "Demo data",
    loadingRange: "Loading selected table range...",
    loadedRange: "Selected range loaded.",
    rebuildingCache: "Rebuilding selected range cache. This can take a little while...",
    rebuiltCache: "Cache rebuilt.",
    rebuildCacheConfirm: "Rebuild the selected range using FoxCloud 5-minute history data? This may call the FoxCloud API many times.",
    unableToLoad: "Unable to load the dashboard",
    period: "Period",
    periodTotals: "Energy totals",
    periodTotalsHelp: "Choose a period to summarize daily energy data.",
    tableRange: "Table range",
    currentWeek: "This week",
    currentMonth: "This month",
    previousMonth: "Previous month",
    last2Months: "Last 2 months",
    last3Months: "Last 3 months",
    last6Months: "Last 6 months",
    last12Months: "Last 12 months",
    allData: "All data",
    totalSolarProduction: "Total solar production",
    totalHomeUsage: "Total home usage",
    totalIntoBattery: "Total into battery",
    totalOutBattery: "Total out of battery",
    totalReturnToGrid: "Total return to grid",
    totalGridConsumption: "Total grid consumption",
    totalSelfConsumption: "Total self-consumption",
    rangeSummary: "Showing",
    liveFlow: "Live Flow",
    energyDistribution: "Energy distribution",
    solar: "Solar",
    grid: "Grid",
    home: "Home",
    battery: "Battery",
    importing: "Importing",
    exporting: "Exporting",
    charging: "Charging",
    discharging: "Discharging",
    today: "Today",
    productionUsage: "Production and usage",
    solarProduction: "Solar production",
    pvProduced: "PV produced",
    pvProducedNote: "For today, PV produced follows FoxCloud Analysis: Self-consumption plus Export from the 5-minute power curve. Older days use the FoxCloud daily report values.",
    selfConsumption: "Self-consumption",
    returnToGrid: "Return to grid",
    homeUsage: "Home usage",
    gridConsumption: "Grid consumption",
    batteryLevel: "Battery level",
    intoBattery: "Into battery",
    outOfBattery: "Out of battery",
    batteryTemp: "Battery temp",
    inverterTemp: "Inverter temp",
    last24Hours: "Last 24 Hours",
    last24Title: "Battery level, home usage, and battery discharge",
    system: "System",
    solarGeneratedNow: "Solar generated now",
    solarNowHelp: "Instant solar power, not hourly total",
    homeUsageNow: "Home usage now",
    homeNowHelp: "Instant household demand",
    gridImportNow: "Grid import now",
    gridImportHelp: "Instant power taken from grid",
    gridExportNow: "Grid export now",
    gridExportHelp: "Instant power sent to grid",
    batteryChargeNow: "Battery charge now",
    batteryChargeHelp: "Instant charging power",
    batteryDischargeNow: "Battery discharge now",
    batteryDischargeHelp: "Instant discharging power",
    lastHour: "Past Hour",
    lastHourTitle: "Energy over the last hour",
    lastHourHelp: "These are estimated kWh totals calculated from FoxCloud power samples over the last 60 minutes.",
    lastHourTotalHelp: "Estimated energy in the last 60 minutes",
    solarGeneratedLastHour: "Solar generated last hour",
    homeUsageLastHour: "Home usage last hour",
    gridImportLastHour: "Grid import last hour",
    gridExportLastHour: "Grid export last hour",
    batteryChargeLastHour: "Battery charge last hour",
    batteryDischargeLastHour: "Battery discharge last hour",
    chart: "Chart",
    dailyEnergyChart: "Daily solar, grid, and home usage",
    batteryChart: "Battery charge and discharge",
    table: "Table",
    dailyEnergyData: "Daily energy data",
    date: "Date",
    energyIntoBattery: "Energy going into the battery",
    energyOutBattery: "Energy coming out of the battery",
    unavailable: "Unavailable",
    noLiveTimestamp: "No live timestamp available",
    liveUpdated: "Live updated",
    responseGenerated: "Response generated",
    online: "Online",
    fault: "Fault",
    offline: "Offline",
    batteryEnabled: "Battery enabled",
    noBattery: "No battery",
    solarEnabled: "Solar enabled",
    noSolar: "No solar",
    cachedFallback: "Cached fallback",
    liveData: "Live data",
    dailyEnergyKwh: "Daily energy (kWh)",
    batteryEnergyKwh: "Battery energy (kWh)",
    batteryLevelPercent: "Battery level (%)",
    homeUsageKw: "Home usage (kW)",
    batteryDischargeKw: "Battery discharge (kW)",
    powerKw: "Power (kW)",
    noTableData: "No table data is available to export yet.",
  },
  zh: {
    appEyebrow: "FoxCloud 电池仪表板",
    appTitle: "家庭能源控制中心",
    waitingForFoxCloud: "正在等待 FoxCloud 数据...",
    month: "月份",
    dashboardMonth: "仪表板月份",
    language: "语言",
    refresh: "刷新",
    rebuildCache: "重算缓存",
    exportPdf: "导出 PDF",
    exportCsv: "导出 CSV",
    loading: "正在加载仪表板数据...",
    loaded: "仪表板数据加载成功。",
    loadedCached: "实时 API 请求失败，当前显示缓存数据。",
    demoData: "演示数据",
    loadingRange: "正在加载所选表格范围...",
    loadedRange: "所选范围已加载。",
    rebuildingCache: "正在按所选范围重算缓存，可能需要一点时间...",
    rebuiltCache: "缓存已重算。",
    rebuildCacheConfirm: "确定要用 FoxCloud 5 分钟历史数据重算所选范围吗？这可能会调用较多 FoxCloud API。",
    unableToLoad: "无法加载仪表板",
    period: "周期",
    periodTotals: "能源总计",
    periodTotalsHelp: "选择一个周期来汇总每日能源数据。",
    tableRange: "表格范围",
    currentWeek: "本周",
    currentMonth: "这个月",
    previousMonth: "上一个月",
    last2Months: "近 2 个月",
    last3Months: "近 3 个月",
    last6Months: "近 6 个月",
    last12Months: "近 1 年",
    allData: "全部数据",
    totalSolarProduction: "太阳能总发电量",
    totalHomeUsage: "家庭总用电量",
    totalIntoBattery: "充入电池总量",
    totalOutBattery: "电池放电总量",
    totalReturnToGrid: "回馈电网总量",
    totalGridConsumption: "电网取电总量",
    totalSelfConsumption: "自发自用总量",
    rangeSummary: "当前显示",
    liveFlow: "实时流向",
    energyDistribution: "能源分布",
    solar: "太阳能",
    grid: "电网",
    home: "家庭",
    battery: "电池",
    importing: "从电网取电",
    exporting: "送回电网",
    charging: "充电中",
    discharging: "放电中",
    today: "今日",
    productionUsage: "发电与用电",
    solarProduction: "太阳能发电",
    pvProduced: "光伏总发电",
    pvProducedNote: "今天的光伏总发电按 FoxCloud Analysis 口径计算：5 分钟功率曲线里的自发自用 + 回馈电网。过去日期使用 FoxCloud 每日报表数据。",
    selfConsumption: "自发自用",
    returnToGrid: "回馈电网",
    homeUsage: "家庭用电",
    gridConsumption: "电网用电",
    batteryLevel: "电池电量",
    intoBattery: "充入电池",
    outOfBattery: "电池放电",
    batteryTemp: "电池温度",
    inverterTemp: "逆变器温度",
    last24Hours: "过去 24 小时",
    last24Title: "电池电量、家庭用电与电池放电",
    system: "系统",
    solarGeneratedNow: "当前太阳能输出",
    solarNowHelp: "实时太阳能功率，不是小时累计",
    homeUsageNow: "当前家庭用电",
    homeNowHelp: "实时家庭用电需求",
    gridImportNow: "当前电网输入",
    gridImportHelp: "实时从电网取电功率",
    gridExportNow: "当前电网输出",
    gridExportHelp: "实时送回电网功率",
    batteryChargeNow: "当前电池充电",
    batteryChargeHelp: "实时充电功率",
    batteryDischargeNow: "当前电池放电",
    batteryDischargeHelp: "实时放电功率",
    lastHour: "过去 1 小时",
    lastHourTitle: "过去 1 小时能源统计",
    lastHourHelp: "这些是根据 FoxCloud 最近 60 分钟功率采样估算出来的 kWh 累计值。",
    lastHourTotalHelp: "最近 60 分钟估算电量",
    solarGeneratedLastHour: "过去 1 小时太阳能发电",
    homeUsageLastHour: "过去 1 小时家庭用电",
    gridImportLastHour: "过去 1 小时电网输入",
    gridExportLastHour: "过去 1 小时电网输出",
    batteryChargeLastHour: "过去 1 小时电池充电",
    batteryDischargeLastHour: "过去 1 小时电池放电",
    chart: "图表",
    dailyEnergyChart: "每日太阳能、电网与家庭用电",
    batteryChart: "电池充电与放电",
    table: "表格",
    dailyEnergyData: "每日能源数据",
    date: "日期",
    energyIntoBattery: "充入电池的电量",
    energyOutBattery: "电池放出的电量",
    unavailable: "暂无数据",
    noLiveTimestamp: "没有实时更新时间",
    liveUpdated: "实时更新",
    responseGenerated: "响应生成",
    online: "在线",
    fault: "故障",
    offline: "离线",
    batteryEnabled: "已启用电池",
    noBattery: "无电池",
    solarEnabled: "已启用太阳能",
    noSolar: "无太阳能",
    cachedFallback: "缓存数据",
    liveData: "实时数据",
    dailyEnergyKwh: "每日电量 (kWh)",
    batteryEnergyKwh: "电池电量 (kWh)",
    batteryLevelPercent: "电池电量 (%)",
    homeUsageKw: "家庭用电 (kW)",
    batteryDischargeKw: "电池放电 (kW)",
    powerKw: "功率 (kW)",
    noTableData: "目前还没有可导出的表格数据。",
  },
  th: {
    appEyebrow: "แดชบอร์ดแบตเตอรี่ FoxCloud",
    appTitle: "ศูนย์ควบคุมพลังงานในบ้าน",
    waitingForFoxCloud: "กำลังรอข้อมูลจาก FoxCloud...",
    month: "เดือน",
    dashboardMonth: "เดือนของแดชบอร์ด",
    language: "ภาษา",
    refresh: "รีเฟรช",
    rebuildCache: "สร้างแคชใหม่",
    exportPdf: "ส่งออก PDF",
    exportCsv: "ส่งออก CSV",
    loading: "กำลังโหลดข้อมูลแดชบอร์ด...",
    loaded: "โหลดข้อมูลแดชบอร์ดสำเร็จ",
    loadedCached: "คำขอ API แบบสดล้มเหลว กำลังแสดงข้อมูลแคช",
    demoData: "ข้อมูลตัวอย่าง",
    loadingRange: "กำลังโหลดช่วงตารางที่เลือก...",
    loadedRange: "โหลดช่วงที่เลือกแล้ว",
    rebuildingCache: "กำลังสร้างแคชของช่วงที่เลือกใหม่ อาจใช้เวลาสักครู่...",
    rebuiltCache: "สร้างแคชใหม่แล้ว",
    rebuildCacheConfirm: "ต้องการสร้างแคชของช่วงที่เลือกใหม่ด้วยข้อมูลประวัติทุก 5 นาทีจาก FoxCloud หรือไม่? การทำงานนี้อาจเรียก API หลายครั้ง",
    unableToLoad: "ไม่สามารถโหลดแดชบอร์ดได้",
    period: "ช่วงเวลา",
    periodTotals: "ยอดรวมพลังงาน",
    periodTotalsHelp: "เลือกช่วงเวลาเพื่อสรุปข้อมูลพลังงานรายวัน",
    tableRange: "ช่วงของตาราง",
    currentWeek: "สัปดาห์นี้",
    currentMonth: "เดือนนี้",
    previousMonth: "เดือนก่อน",
    last2Months: "2 เดือนล่าสุด",
    last3Months: "3 เดือนล่าสุด",
    last6Months: "6 เดือนล่าสุด",
    last12Months: "12 เดือนล่าสุด",
    allData: "ข้อมูลทั้งหมด",
    totalSolarProduction: "ยอดผลิตโซลาร์รวม",
    totalHomeUsage: "ยอดใช้ไฟในบ้านรวม",
    totalIntoBattery: "พลังงานเข้าแบตเตอรี่รวม",
    totalOutBattery: "พลังงานออกจากแบตเตอรี่รวม",
    totalReturnToGrid: "ส่งกลับเข้ากริดรวม",
    totalGridConsumption: "ใช้ไฟจากกริดรวม",
    totalSelfConsumption: "ใช้เองจากโซลาร์รวม",
    rangeSummary: "กำลังแสดง",
    liveFlow: "การไหลแบบสด",
    energyDistribution: "การกระจายพลังงาน",
    solar: "โซลาร์",
    grid: "กริด",
    home: "บ้าน",
    battery: "แบตเตอรี่",
    importing: "กำลังนำเข้าจากกริด",
    exporting: "กำลังส่งออกไปกริด",
    charging: "กำลังชาร์จ",
    discharging: "กำลังคายประจุ",
    today: "วันนี้",
    productionUsage: "การผลิตและการใช้งาน",
    solarProduction: "การผลิตไฟฟ้าจากโซลาร์",
    pvProduced: "ไฟฟ้าที่ผลิตจาก PV",
    pvProducedNote: "สำหรับวันนี้ PV produced ใช้วิธีเดียวกับ FoxCloud Analysis คือ Self-consumption + Export จากกราฟกำลังไฟทุก 5 นาที ส่วนวันก่อนหน้าใช้ค่ารายงานรายวันของ FoxCloud",
    selfConsumption: "ใช้เองจากโซลาร์",
    returnToGrid: "ส่งกลับเข้ากริด",
    homeUsage: "การใช้ไฟในบ้าน",
    gridConsumption: "การใช้ไฟจากกริด",
    batteryLevel: "ระดับแบตเตอรี่",
    intoBattery: "เข้าแบตเตอรี่",
    outOfBattery: "ออกจากแบตเตอรี่",
    batteryTemp: "อุณหภูมิแบตเตอรี่",
    inverterTemp: "อุณหภูมิอินเวอร์เตอร์",
    last24Hours: "24 ชั่วโมงที่ผ่านมา",
    last24Title: "ระดับแบตเตอรี่ การใช้ไฟในบ้าน และการคายประจุแบตเตอรี่",
    system: "ระบบ",
    solarGeneratedNow: "โซลาร์ตอนนี้",
    solarNowHelp: "กำลังไฟโซลาร์แบบทันที ไม่ใช่ยอดรวมรายชั่วโมง",
    homeUsageNow: "การใช้ไฟในบ้านตอนนี้",
    homeNowHelp: "ความต้องการใช้ไฟในบ้านแบบทันที",
    gridImportNow: "นำเข้าจากกริดตอนนี้",
    gridImportHelp: "กำลังไฟที่รับจากกริดแบบทันที",
    gridExportNow: "ส่งออกไปกริดตอนนี้",
    gridExportHelp: "กำลังไฟที่ส่งกลับเข้ากริดแบบทันที",
    batteryChargeNow: "ชาร์จแบตเตอรี่ตอนนี้",
    batteryChargeHelp: "กำลังชาร์จแบบทันที",
    batteryDischargeNow: "คายประจุแบตเตอรี่ตอนนี้",
    batteryDischargeHelp: "กำลังคายประจุแบบทันที",
    lastHour: "1 ชั่วโมงที่ผ่านมา",
    lastHourTitle: "พลังงานในช่วง 1 ชั่วโมงที่ผ่านมา",
    lastHourHelp: "เป็นยอด kWh โดยประมาณจากตัวอย่างกำลังไฟของ FoxCloud ในช่วง 60 นาทีล่าสุด",
    lastHourTotalHelp: "พลังงานโดยประมาณในช่วง 60 นาทีล่าสุด",
    solarGeneratedLastHour: "โซลาร์ผลิตใน 1 ชั่วโมงที่ผ่านมา",
    homeUsageLastHour: "บ้านใช้ไฟใน 1 ชั่วโมงที่ผ่านมา",
    gridImportLastHour: "นำเข้าจากกริดใน 1 ชั่วโมงที่ผ่านมา",
    gridExportLastHour: "ส่งออกไปกริดใน 1 ชั่วโมงที่ผ่านมา",
    batteryChargeLastHour: "ชาร์จแบตเตอรี่ใน 1 ชั่วโมงที่ผ่านมา",
    batteryDischargeLastHour: "คายประจุแบตเตอรี่ใน 1 ชั่วโมงที่ผ่านมา",
    chart: "กราฟ",
    dailyEnergyChart: "โซลาร์ กริด และการใช้ไฟในบ้านรายวัน",
    batteryChart: "การชาร์จและคายประจุแบตเตอรี่",
    table: "ตาราง",
    dailyEnergyData: "ข้อมูลพลังงานรายวัน",
    date: "วันที่",
    energyIntoBattery: "พลังงานที่เข้าแบตเตอรี่",
    energyOutBattery: "พลังงานที่ออกจากแบตเตอรี่",
    unavailable: "ไม่มีข้อมูล",
    noLiveTimestamp: "ไม่มีเวลาอัปเดตแบบสด",
    liveUpdated: "อัปเดตแบบสด",
    responseGenerated: "สร้างคำตอบเมื่อ",
    online: "ออนไลน์",
    fault: "ขัดข้อง",
    offline: "ออฟไลน์",
    batteryEnabled: "เปิดใช้งานแบตเตอรี่",
    noBattery: "ไม่มีแบตเตอรี่",
    solarEnabled: "เปิดใช้งานโซลาร์",
    noSolar: "ไม่มีโซลาร์",
    cachedFallback: "ข้อมูลแคช",
    liveData: "ข้อมูลสด",
    dailyEnergyKwh: "พลังงานรายวัน (kWh)",
    batteryEnergyKwh: "พลังงานแบตเตอรี่ (kWh)",
    batteryLevelPercent: "ระดับแบตเตอรี่ (%)",
    homeUsageKw: "การใช้ไฟในบ้าน (kW)",
    batteryDischargeKw: "การคายประจุแบตเตอรี่ (kW)",
    powerKw: "กำลังไฟ (kW)",
    noTableData: "ยังไม่มีข้อมูลตารางให้ส่งออก",
  },
};

function t(key) {
  return translations[currentLanguage][key] ?? translations.en[key] ?? key;
}

function formatKwh(value) {
  return `${Number(value ?? 0).toFixed(2)} kWh`;
}

function formatKw(value) {
  return `${Number(value ?? 0).toFixed(2)} kW`;
}

function formatPercent(value) {
  if (value === null || value === undefined) {
    return t("unavailable");
  }

  return `${Number(value).toFixed(0)}%`;
}

function formatTemperature(value) {
  if (value === null || value === undefined) {
    return t("unavailable");
  }

  return `${Number(value).toFixed(1)}°C`;
}

function formatTimestamp(value) {
  if (!value) {
    return t("noLiveTimestamp");
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

function formatCurrentDateTime() {
  const locale = {
    en: "en-AU",
    zh: "zh-CN",
    th: "th-TH",
  }[currentLanguage] ?? "en-AU";

  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date());
}

function formatLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getSelectedMonthLabel() {
  return monthPicker.value || formatLocalDateKey().slice(0, 7);
}

function applyLanguage() {
  const htmlLang = {
    en: "en",
    zh: "zh-CN",
    th: "th",
  }[currentLanguage] ?? "en";

  document.documentElement.lang = htmlLang;
  languageSelect.value = currentLanguage;
  periodRangeSelect.value = tableRangeSelect.value;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  textFields.currentDateTime.textContent = formatCurrentDateTime();

  if (!lastPayload) {
    statusText.textContent = t("loading");
  }
}

function buildBadge(label, tone) {
  return `<span class="badge badge-${tone}">${label}</span>`;
}

function renderBadges(payload) {
  const dataBadgeLabel = payload.source === "cache"
    ? t("cachedFallback")
    : payload.source === "demo"
      ? t("demoData")
      : t("liveData");
  const dataBadgeTone = payload.source === "cache"
    ? "warning"
    : payload.source === "demo"
      ? "neutral"
      : "live";
  const badges = [
    buildBadge(t(payload.device.status), payload.device.status),
    buildBadge(payload.device.hasBattery ? t("batteryEnabled") : t("noBattery"), payload.device.hasBattery ? "battery" : "neutral"),
    buildBadge(payload.device.hasPV ? t("solarEnabled") : t("noSolar"), payload.device.hasPV ? "solar" : "neutral"),
    buildBadge(dataBadgeLabel, dataBadgeTone),
  ];

  textFields.badgeRow.innerHTML = badges.join("");
}

function renderWarnings(warnings) {
  if (!warnings || warnings.length === 0) {
    warningBox.classList.add("hidden");
    warningBox.innerHTML = "";
    return;
  }

  warningBox.classList.remove("hidden");
  warningBox.innerHTML = warnings.map((item) => `<p>${item}</p>`).join("");
}

function getMaxValues(rows) {
  const numericKeys = [
    "generation",
    "pv_production",
    "self_consumption",
    "daily_feedin",
    "home_usage",
    "grid_consumption",
    "daily_charged_energy_total",
    "daily_discharged_energy_total",
  ];

  return Object.fromEntries(
    numericKeys.map((key) => [key, Math.max(...rows.map((row) => Number(row[key] ?? 0)))]),
  );
}

function sortRows(rows) {
  return [...rows].sort((first, second) => {
    const firstValue = first[sortState.key];
    const secondValue = second[sortState.key];
    const direction = sortState.direction === "asc" ? 1 : -1;

    if (sortState.key === "date") {
      return firstValue.localeCompare(secondValue) * direction;
    }

    return (Number(firstValue) - Number(secondValue)) * direction;
  });
}

function renderSortButtons() {
  document.querySelectorAll(".sort-button").forEach((button) => {
    const isActive = button.dataset.sortKey === sortState.key;
    button.classList.toggle("active", isActive);
    button.dataset.direction = isActive ? sortState.direction : "none";
  });
}

function renderTable(rows) {
  const maxValues = getMaxValues(rows);
  const sortedRows = sortRows(rows);
  const valueClass = (key, value) => (Number(value) === maxValues[key] && Number(value) > 0 ? "table-max" : "");

  dailyTableBody.innerHTML = sortedRows
    .map(
      (row) => `
        <tr>
          <td>${row.date}</td>
          <td class="${valueClass("pv_production", row.pv_production)}">${formatKwh(row.pv_production)}</td>
          <td class="${valueClass("self_consumption", row.self_consumption)}">${formatKwh(row.self_consumption)}</td>
          <td class="${valueClass("daily_feedin", row.daily_feedin)}">${formatKwh(row.daily_feedin)}</td>
          <td class="${valueClass("home_usage", row.home_usage)}">${formatKwh(row.home_usage)}</td>
          <td class="${valueClass("grid_consumption", row.grid_consumption)}">${formatKwh(row.grid_consumption)}</td>
          <td class="${valueClass("daily_charged_energy_total", row.daily_charged_energy_total)}">${formatKwh(row.daily_charged_energy_total)}</td>
          <td class="${valueClass("daily_discharged_energy_total", row.daily_discharged_energy_total)}">${formatKwh(row.daily_discharged_energy_total)}</td>
        </tr>
      `,
    )
    .join("");
  renderSortButtons();
}

function escapeCsvValue(value) {
  const text = String(value ?? "");

  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportTableToCsv() {
  if (!currentRows.length) {
    statusText.textContent = t("noTableData");
    return;
  }

  const headers = [
    t("date"),
    t("pvProduced"),
    t("selfConsumption"),
    t("returnToGrid"),
    t("homeUsage"),
    t("gridConsumption"),
    t("energyIntoBattery"),
    t("energyOutBattery"),
  ];
  const rows = sortRows(currentRows).map((row) => [
    row.date,
    Number(row.pv_production ?? 0).toFixed(2),
    Number(row.self_consumption ?? 0).toFixed(2),
    Number(row.daily_feedin ?? 0).toFixed(2),
    Number(row.home_usage ?? 0).toFixed(2),
    Number(row.grid_consumption ?? 0).toFixed(2),
    Number(row.daily_charged_energy_total ?? 0).toFixed(2),
    Number(row.daily_discharged_energy_total ?? 0).toFixed(2),
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");
  const filename = `foxcloud-daily-energy-${getSelectedMonthLabel()}.csv`;

  downloadBlob(`\uFEFF${csv}`, filename, "text/csv;charset=utf-8");
}

function pdfText(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "?")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
}

function createPdfLine(text, options = {}) {
  return {
    text,
    size: options.size ?? 10,
    bold: Boolean(options.bold),
    gapAfter: options.gapAfter ?? 14,
  };
}

function wrapPdfText(text, maxLength = 92) {
  const words = String(text ?? "").split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;

    if (candidate.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.length ? lines : [""];
}

function buildSimplePdf(lines) {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const marginX = 44;
  const startY = 800;
  const bottomY = 48;
  const objects = [];
  const pageIds = [];

  const setObject = (id, content) => {
    objects[id] = content;
  };
  const addObject = (content) => {
    objects.push(content);
    return objects.length - 1;
  };

  setObject(1, "");
  setObject(2, "");
  setObject(3, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  setObject(4, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  let pageCommands = [];
  let y = startY;

  const flushPage = () => {
    if (!pageCommands.length) {
      return;
    }

    const content = pageCommands.join("\n");
    const contentId = addObject(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    const pageId = addObject(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] ` +
      `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    pageIds.push(pageId);
    pageCommands = [];
    y = startY;
  };

  const addLine = (line) => {
    if (y < bottomY) {
      flushPage();
    }

    const font = line.bold ? "F2" : "F1";
    pageCommands.push(`BT /${font} ${line.size} Tf ${marginX} ${y} Td (${pdfText(line.text)}) Tj ET`);
    y -= line.gapAfter;
  };

  for (const line of lines) {
    const wrapped = wrapPdfText(line.text, line.size >= 16 ? 58 : 92);

    wrapped.forEach((wrappedLine, index) => {
      addLine({
        ...line,
        text: wrappedLine,
        gapAfter: index === wrapped.length - 1 ? line.gapAfter : line.size + 3,
      });
    });
  }

  flushPage();
  setObject(1, "<< /Type /Catalog /Pages 2 0 R >>");
  setObject(2, `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`);

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = pdf.length;
    pdf += `${index} 0 obj\n${objects[index]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;

  for (let index = 1; index < objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

function buildPdfLines() {
  const rows = sortRows(currentRows).slice(0, 42);
  const payload = lastPayload ?? {};
  const totals = lastRangePayload?.totals ?? {};
  const lines = [
    createPdfLine("FoxCloud Energy Dashboard", { size: 20, bold: true, gapAfter: 24 }),
    createPdfLine(`Generated: ${new Date().toLocaleString("en-AU")}`),
    createPdfLine(`Dashboard month: ${getSelectedMonthLabel()}`),
    createPdfLine(`Range: ${getSelectedRangeLabel()}`, { gapAfter: 22 }),
    createPdfLine("Today", { size: 15, bold: true, gapAfter: 18 }),
    createPdfLine(`PV produced: ${formatKwh(payload.today?.solarProductionKwh)}`),
    createPdfLine(`Self-consumption: ${formatKwh(payload.today?.selfConsumptionKwh)}`),
    createPdfLine(`Return to grid: ${formatKwh(payload.today?.returnToGridKwh)}`),
    createPdfLine(`Home usage: ${formatKwh(payload.today?.homeUsageKwh)}`),
    createPdfLine(`Grid consumption: ${formatKwh(payload.today?.gridConsumptionKwh)}`),
    createPdfLine(`Into battery: ${formatKwh(payload.today?.energyGoingIntoBatteryKwh)}`),
    createPdfLine(`Out of battery: ${formatKwh(payload.today?.energyComingOutOfBatteryKwh)}`, { gapAfter: 22 }),
    createPdfLine("Selected Range Totals", { size: 15, bold: true, gapAfter: 18 }),
    createPdfLine(`Total PV produced: ${formatKwh(totals.solarProductionKwh)}`),
    createPdfLine(`Total self-consumption: ${formatKwh(totals.selfConsumptionKwh)}`),
    createPdfLine(`Total return to grid: ${formatKwh(totals.returnToGridKwh)}`),
    createPdfLine(`Total home usage: ${formatKwh(totals.homeUsageKwh)}`),
    createPdfLine(`Total grid consumption: ${formatKwh(totals.gridConsumptionKwh)}`),
    createPdfLine(`Total into battery: ${formatKwh(totals.energyGoingIntoBatteryKwh)}`),
    createPdfLine(`Total out of battery: ${formatKwh(totals.energyComingOutOfBatteryKwh)}`, { gapAfter: 22 }),
    createPdfLine("Daily Energy Data", { size: 15, bold: true, gapAfter: 18 }),
    createPdfLine("Date | PV produced | Self-consumption | Return to grid | Home usage | Grid consumption", { bold: true }),
  ];

  rows.forEach((row) => {
    lines.push(createPdfLine(
      `${row.date} | ${formatKwh(row.pv_production)} | ${formatKwh(row.self_consumption)} | ` +
      `${formatKwh(row.daily_feedin)} | ${formatKwh(row.home_usage)} | ${formatKwh(row.grid_consumption)}`,
    ));
  });

  if (sortRows(currentRows).length > rows.length) {
    lines.push(createPdfLine(`Showing first ${rows.length} table rows in this PDF. Use Export CSV for the full table.`));
  }

  return lines;
}

function exportDashboardToPdf() {
  if (!lastPayload) {
    statusText.textContent = t("noTableData");
    return;
  }

  const pdf = buildSimplePdf(buildPdfLines());
  const filename = `foxcloud-dashboard-${getSelectedMonthLabel()}.pdf`;

  downloadBlob(pdf, filename, "application/pdf");
}

function getSelectedRangeLabel() {
  const selectedOption = periodRangeSelect.options[periodRangeSelect.selectedIndex];
  return selectedOption?.textContent ?? t("currentMonth");
}

function renderPeriodTotals(payload) {
  metricFields.periodSolarProduction.textContent = formatKwh(payload.totals?.solarProductionKwh);
  metricFields.periodHomeUsage.textContent = formatKwh(payload.totals?.homeUsageKwh);
  metricFields.periodIntoBattery.textContent = formatKwh(payload.totals?.energyGoingIntoBatteryKwh);
  metricFields.periodOutBattery.textContent = formatKwh(payload.totals?.energyComingOutOfBatteryKwh);
  metricFields.periodReturnToGrid.textContent = formatKwh(payload.totals?.returnToGridKwh);
  metricFields.periodGridConsumption.textContent = formatKwh(payload.totals?.gridConsumptionKwh);
  metricFields.periodSelfConsumption.textContent = formatKwh(payload.totals?.selfConsumptionKwh);

  const firstDate = payload.dailyTable?.at(0)?.date;
  const lastDate = payload.dailyTable?.at(-1)?.date;
  const dateRange = firstDate && lastDate ? `${firstDate} - ${lastDate}` : getSelectedRangeLabel();
  textFields.periodTotalsMeta.textContent = `${t("rangeSummary")}: ${getSelectedRangeLabel()} • ${dateRange}`;
}

async function loadEnergyRange(silent = false) {
  periodRangeSelect.value = tableRangeSelect.value;

  if (!silent) {
    statusText.textContent = t("loadingRange");
  }

  const [year, month] = monthPicker.value.split("-");
  const response = await fetch(
    `/api/energy-range?year=${year}&month=${Number(month)}&range=${encodeURIComponent(tableRangeSelect.value)}`,
  );
  const payload = await response.json();

  if (!response.ok || payload.error) {
    throw new Error(payload.error || "Energy range request failed.");
  }

  currentRows = payload.dailyTable ?? [];
  renderTable(currentRows);
  renderPeriodTotals(payload);
  lastRangePayload = payload;

  if (!silent) {
    statusText.textContent = t("loadedRange");
  }
}

async function rebuildSelectedCache() {
  if (!window.confirm(t("rebuildCacheConfirm"))) {
    return;
  }

  rebuildCacheButton.disabled = true;
  refreshButton.disabled = true;
  statusText.textContent = t("rebuildingCache");

  try {
    const [year, month] = monthPicker.value.split("-");
    const response = await fetch("/api/rebuild-cache", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        year: Number(year),
        month: Number(month),
        range: tableRangeSelect.value,
      }),
    });
    const payload = await response.json();

    if (!response.ok || payload.error) {
      throw new Error(payload.error || "Cache rebuild request failed.");
    }

    currentRows = payload.dailyTable ?? [];
    lastRangePayload = payload;
    renderTable(currentRows);
    renderPeriodTotals(payload);
    statusText.textContent = `${t("rebuiltCache")} ${payload.processedDays ?? 0} days processed.`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    statusText.textContent = `${t("unableToLoad")}: ${message}`;
    renderWarnings([message]);
  } finally {
    rebuildCacheButton.disabled = false;
    refreshButton.disabled = false;
  }
}

function getVisibleRows(rows, payload) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (
    payload.requestedPeriod.year === currentYear &&
    payload.requestedPeriod.month === currentMonth
  ) {
    const todayKey = formatLocalDateKey(now);
    return rows.filter((row) => row.date <= todayKey);
  }

  return rows;
}

function destroyChart(chart) {
  if (chart) {
    chart.destroy();
  }
}

function getChartRows(payload) {
  const todayKey = formatLocalDateKey();
  const isCurrentMonth = payload.dailyTable.some((row) => row.date === todayKey);

  if (!isCurrentMonth) {
    return payload.dailyTable;
  }

  return payload.dailyTable.filter((row) => row.date <= todayKey);
}

function getChartOptions(yTitle) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label(context) {
            return `${context.dataset.label}: ${Number(context.parsed.y ?? 0).toFixed(2)} kWh`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        title: {
          display: true,
          text: yTitle,
        },
        beginAtZero: true,
        grace: "12%",
        ticks: {
          maxTicksLimit: 6,
        },
      },
    },
  };
}

function renderCharts(payload) {
  destroyChart(energyChart);
  destroyChart(batteryChart);
  destroyChart(last24HoursChart);

  const energyContext = document.getElementById("energyChart").getContext("2d");
  const batteryContext = document.getElementById("batteryChart").getContext("2d");
  const last24HoursContext = document.getElementById("last24HoursChart").getContext("2d");
  const chartRows = getChartRows(payload);
  const labels = chartRows.map((row) => String(row.day));

  energyChart = new Chart(energyContext, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: t("pvProduced"),
          data: chartRows.map((row) => row.pv_production),
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245, 158, 11, 0.16)",
          fill: true,
          tension: 0.28,
        },
        {
          label: t("homeUsage"),
          data: chartRows.map((row) => row.home_usage),
          borderColor: "#0f766e",
          backgroundColor: "rgba(15, 118, 110, 0.12)",
          tension: 0.28,
        },
        {
          label: t("gridConsumption"),
          data: chartRows.map((row) => row.grid_consumption),
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.12)",
          tension: 0.28,
        },
        {
          label: t("returnToGrid"),
          data: chartRows.map((row) => row.daily_feedin),
          borderColor: "#dc2626",
          backgroundColor: "rgba(220, 38, 38, 0.12)",
          tension: 0.28,
        },
      ],
    },
    options: getChartOptions(t("dailyEnergyKwh")),
  });

  batteryChart = new Chart(batteryContext, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: t("energyIntoBattery"),
          data: chartRows.map((row) => row.daily_charged_energy_total),
          backgroundColor: "#14b8a6",
          borderRadius: 4,
          maxBarThickness: 14,
        },
        {
          label: t("energyOutBattery"),
          data: chartRows.map((row) => row.daily_discharged_energy_total),
          backgroundColor: "#7c3aed",
          borderRadius: 4,
          maxBarThickness: 14,
        },
      ],
    },
    options: getChartOptions(t("batteryEnergyKwh")),
  });

  last24HoursChart = new Chart(last24HoursContext, {
    type: "line",
    data: {
      labels: payload.last24Hours.labels,
      datasets: [
        {
          label: t("batteryLevelPercent"),
          data: payload.last24Hours.batteryLevelPercent,
          borderColor: "#7c3aed",
          backgroundColor: "rgba(124, 58, 237, 0.08)",
          yAxisID: "percent",
          tension: 0.22,
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: t("homeUsageKw"),
          data: payload.last24Hours.homeUsageKw,
          borderColor: "#0f766e",
          backgroundColor: "rgba(15, 118, 110, 0.08)",
          yAxisID: "power",
          tension: 0.22,
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: t("batteryDischargeKw"),
          data: payload.last24Hours.batteryDischargeKw,
          borderColor: "#dc2626",
          backgroundColor: "rgba(220, 38, 38, 0.08)",
          yAxisID: "power",
          tension: 0.22,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
          },
        },
        tooltip: {
          callbacks: {
            label(context) {
              const unit = context.dataset.yAxisID === "percent" ? "%" : "kW";
              return `${context.dataset.label}: ${Number(context.parsed.y ?? 0).toFixed(2)} ${unit}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 12,
          },
        },
        power: {
          type: "linear",
          position: "left",
          beginAtZero: true,
          title: {
            display: true,
            text: t("powerKw"),
          },
          ticks: {
            maxTicksLimit: 6,
          },
        },
        percent: {
          type: "linear",
          position: "right",
          min: 0,
          max: 100,
          grid: {
            drawOnChartArea: false,
          },
          title: {
            display: true,
            text: t("batteryLevelPercent"),
          },
          ticks: {
            maxTicksLimit: 6,
          },
        },
      },
    },
  });
}

function setFlowPath(path, isActive) {
  path.classList.toggle("active", isActive);
}

function renderEnergyFlow(payload) {
  const live = payload.live;
  const gridExport = Number(live.gridExportKw ?? 0);
  const gridImport = Number(live.gridImportKw ?? 0);
  const batteryCharge = Number(live.batteryChargeKw ?? 0);
  const batteryDischarge = Number(live.batteryDischargeKw ?? 0);
  const gridMode = gridExport >= gridImport ? t("exporting") : t("importing");
  const gridValue = gridExport >= gridImport ? gridExport : gridImport;
  const batteryMode = batteryCharge >= batteryDischarge ? t("charging") : t("discharging");
  const batteryValue = batteryCharge >= batteryDischarge ? batteryCharge : batteryDischarge;

  flowFields.solar.textContent = formatKw(live.solarGeneratedKw);
  flowFields.home.textContent = formatKw(live.homeUsageKw);
  flowFields.grid.textContent = formatKw(gridValue);
  flowFields.gridMode.textContent = gridMode;
  flowFields.battery.textContent = formatKw(batteryValue);
  flowFields.batteryMode.textContent = batteryMode;

  setFlowPath(flowFields.solarToHomePath, live.solarGeneratedKw > 0 && live.homeUsageKw > 0);
  setFlowPath(flowFields.solarToBatteryPath, batteryCharge > 0.05);
  setFlowPath(flowFields.solarToGridPath, gridExport > 0.05);
  setFlowPath(flowFields.gridToHomePath, gridImport > 0.05);
  setFlowPath(flowFields.batteryToHomePath, batteryDischarge > 0.05);
  setFlowPath(flowFields.gridToBatteryPath, gridImport > 0.05 && batteryCharge > 0.05);
}

function renderMetrics(payload) {
  if (!payload || !payload.live || !payload.today || !payload.device || !payload.chartSeries) {
    throw new Error(payload?.error || "Dashboard API returned an unexpected response.");
  }

  metricFields.solarNow.textContent = formatKw(payload.live.solarGeneratedKw);
  metricFields.homeNow.textContent = formatKw(payload.live.homeUsageKw);
  metricFields.gridImportNow.textContent = formatKw(payload.live.gridImportKw);
  metricFields.gridExportNow.textContent = formatKw(payload.live.gridExportKw);
  metricFields.batteryChargeNow.textContent = formatKw(payload.live.batteryChargeKw);
  metricFields.batteryDischargeNow.textContent = formatKw(payload.live.batteryDischargeKw);

  metricFields.todaySolar.textContent = formatKwh(payload.today.solarProductionKwh);
  metricFields.todaySelfConsumption.textContent = formatKwh(payload.today.selfConsumptionKwh);
  metricFields.todayFeedin.textContent = formatKwh(payload.today.returnToGridKwh);
  metricFields.todayHome.textContent = formatKwh(payload.today.homeUsageKwh);
  metricFields.todayGrid.textContent = formatKwh(payload.today.gridConsumptionKwh);
  metricFields.todayBatteryCharge.textContent = formatKwh(payload.today.energyGoingIntoBatteryKwh);
  metricFields.todayBatteryDischarge.textContent = formatKwh(payload.today.energyComingOutOfBatteryKwh);
  metricFields.batterySoc.textContent = formatPercent(payload.live.batterySocPercent);
  metricFields.batterySoc.classList.toggle(
    "battery-level-low",
    Number(payload.live.batterySocPercent ?? 100) < 50,
  );
  metricFields.batterySoc.classList.toggle(
    "battery-level-good",
    payload.live.batterySocPercent !== null && payload.live.batterySocPercent !== undefined && Number(payload.live.batterySocPercent) >= 50,
  );
  metricFields.batteryTemp.textContent = formatTemperature(payload.live.batteryTemperatureCelsius);
  metricFields.inverterTemp.textContent = formatTemperature(payload.live.inverterTemperatureCelsius);
  metricFields.solarLastHour.textContent = formatKwh(payload.lastHour?.solarGeneratedKwh);
  metricFields.homeLastHour.textContent = formatKwh(payload.lastHour?.homeUsageKwh);
  metricFields.gridImportLastHour.textContent = formatKwh(payload.lastHour?.gridImportKwh);
  metricFields.gridExportLastHour.textContent = formatKwh(payload.lastHour?.gridExportKwh);
  metricFields.batteryChargeLastHour.textContent = formatKwh(payload.lastHour?.batteryChargeKwh);
  metricFields.batteryDischargeLastHour.textContent = formatKwh(payload.lastHour?.batteryDischargeKwh);

  textFields.currentDateTime.textContent = formatCurrentDateTime();
  textFields.deviceTitle.textContent = payload.device.stationName;
  textFields.deviceMeta.textContent = `${payload.device.deviceType} • ${payload.device.productType} • SN ${payload.device.deviceSN}`;
  textFields.liveMeta.textContent = `${t("liveUpdated")}: ${formatTimestamp(payload.live.updatedAt)} • ${t("responseGenerated")}: ${formatTimestamp(payload.generatedAt)}`;

  renderBadges(payload);
  renderWarnings(payload.warnings);
  renderEnergyFlow(payload);
  renderCharts(payload);
  currentRows = getVisibleRows(payload.dailyTable, payload);
  renderTable(currentRows);
}

async function loadDashboard() {
  refreshButton.disabled = true;
  statusText.textContent = t("loading");

  try {
    const [year, month] = monthPicker.value.split("-");
    const response = await fetch(`/api/dashboard?year=${year}&month=${Number(month)}`);
    const payload = await response.json();

    if (!response.ok || payload.error) {
      throw new Error(payload.error || "Dashboard request failed.");
    }

    renderMetrics(payload);
    lastPayload = payload;
    await loadEnergyRange(true);
    statusText.textContent = payload.isStale
      ? t("loadedCached")
      : t("loaded");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    statusText.textContent = `${t("unableToLoad")}: ${message}`;
    renderWarnings([message]);
  } finally {
    refreshButton.disabled = false;
  }
}

function setDefaultMonth() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  monthPicker.value = `${now.getFullYear()}-${month}`;
}

refreshButton.addEventListener("click", loadDashboard);
rebuildCacheButton.addEventListener("click", rebuildSelectedCache);
exportPdfButton.addEventListener("click", exportDashboardToPdf);
exportCsvButton.addEventListener("click", exportTableToCsv);
monthPicker.addEventListener("change", loadDashboard);
tableRangeSelect.addEventListener("change", () => {
  loadEnergyRange().catch((error) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    statusText.textContent = `${t("unableToLoad")}: ${message}`;
    renderWarnings([message]);
  });
});
periodRangeSelect.addEventListener("change", () => {
  tableRangeSelect.value = periodRangeSelect.value;
  loadEnergyRange().catch((error) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    statusText.textContent = `${t("unableToLoad")}: ${message}`;
    renderWarnings([message]);
  });
});
languageSelect.addEventListener("change", () => {
  currentLanguage = languageSelect.value;
  localStorage.setItem("foxcloud-dashboard-language", currentLanguage);
  applyLanguage();

  if (lastPayload) {
    renderMetrics(lastPayload);
    if (lastRangePayload) {
      currentRows = lastRangePayload.dailyTable ?? [];
      renderTable(currentRows);
      renderPeriodTotals(lastRangePayload);
    }
    statusText.textContent = lastPayload.isStale ? t("loadedCached") : t("loaded");
  }
});
window.setInterval(() => {
  textFields.currentDateTime.textContent = formatCurrentDateTime();
}, 60_000);
document.querySelectorAll(".sort-button").forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.sortKey;

    if (sortState.key === key) {
      sortState.direction = sortState.direction === "asc" ? "desc" : "asc";
    } else {
      sortState = {
        key,
        direction: key === "date" ? "asc" : "desc",
      };
    }

    renderTable(currentRows);
  });
});

setDefaultMonth();
applyLanguage();
loadDashboard();
