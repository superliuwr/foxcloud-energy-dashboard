const statusText = document.getElementById("statusText");
const refreshButton = document.getElementById("refreshButton");
const rebuildCacheButton = document.getElementById("rebuildCacheButton");
const exportPdfButton = document.getElementById("exportPdfButton");
const exportCsvButton = document.getElementById("exportCsvButton");
const saveTariffButton = document.getElementById("saveTariffButton");
const monthPicker = document.getElementById("monthPicker");
const languageSelect = document.getElementById("languageSelect");
const tableRangeSelect = document.getElementById("tableRangeSelect");
const periodRangeSelect = document.getElementById("periodRangeSelect");
const warningBox = document.getElementById("warningBox");
const weatherPanel = document.getElementById("weatherPanel");
const dailyTableBody = document.getElementById("dailyTableBody");
const storageKeys = {
  language: "foxcloud-dashboard-language",
  tableRange: "foxcloud-dashboard-table-range",
};

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
  batteryMaxTemp: document.getElementById("batteryMaxTemp"),
  batteryPackTemp: document.getElementById("batteryPackTemp"),
  inverterTemp: document.getElementById("inverterTemp"),
  todaySavings: document.getElementById("todaySavings"),
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
  periodSavings: document.getElementById("periodSavings"),
  kpiDailySolar: document.getElementById("kpiDailySolar"),
  kpiDailyConsumption: document.getElementById("kpiDailyConsumption"),
  kpiDailyExport: document.getElementById("kpiDailyExport"),
  kpiSelfSufficiency: document.getElementById("kpiSelfSufficiency"),
  kpiEstimatedSavings: document.getElementById("kpiEstimatedSavings"),
  gaugeSolarValue: document.getElementById("gaugeSolarValue"),
  gaugeBatteryValue: document.getElementById("gaugeBatteryValue"),
  gaugeHomeValue: document.getElementById("gaugeHomeValue"),
  gaugeGridValue: document.getElementById("gaugeGridValue"),
};

const textFields = {
  currentDateTime: document.getElementById("currentDateTime"),
  deviceTitle: document.getElementById("deviceTitle"),
  deviceMeta: document.getElementById("deviceMeta"),
  liveMeta: document.getElementById("liveMeta"),
  periodTotalsMeta: document.getElementById("periodTotalsMeta"),
  todaySavingsMeta: document.getElementById("todaySavingsMeta"),
  periodSavingsMeta: document.getElementById("periodSavingsMeta"),
  badgeRow: document.getElementById("badgeRow"),
  weatherLocation: document.getElementById("weatherLocation"),
  weatherIcon: document.getElementById("weatherIcon"),
  weatherTemperature: document.getElementById("weatherTemperature"),
  weatherCondition: document.getElementById("weatherCondition"),
  weatherSolarOutlook: document.getElementById("weatherSolarOutlook"),
  weatherRainChance: document.getElementById("weatherRainChance"),
  weatherCloudCover: document.getElementById("weatherCloudCover"),
  weatherDaily: document.getElementById("weatherDaily"),
  kpiDailySolarMeta: document.getElementById("kpiDailySolarMeta"),
  kpiDailyConsumptionMeta: document.getElementById("kpiDailyConsumptionMeta"),
  kpiSelfSufficiencyMeta: document.getElementById("kpiSelfSufficiencyMeta"),
  kpiSystemStatus: document.getElementById("kpiSystemStatus"),
  kpiInverterStatus: document.getElementById("kpiInverterStatus"),
  kpiLastUpdate: document.getElementById("kpiLastUpdate"),
  kpiDataSource: document.getElementById("kpiDataSource"),
  gaugeSolarArc: document.getElementById("gaugeSolarArc"),
  gaugeBatteryArc: document.getElementById("gaugeBatteryArc"),
  gaugeHomeArc: document.getElementById("gaugeHomeArc"),
  gaugeGridArc: document.getElementById("gaugeGridArc"),
  gaugeSolarMode: document.getElementById("gaugeSolarMode"),
  gaugeBatteryMode: document.getElementById("gaugeBatteryMode"),
  gaugeHomeMode: document.getElementById("gaugeHomeMode"),
  gaugeGridMode: document.getElementById("gaugeGridMode"),
  gaugeSolarToday: document.getElementById("gaugeSolarToday"),
  gaugeBatteryDetail: document.getElementById("gaugeBatteryDetail"),
  gaugeHomeToday: document.getElementById("gaugeHomeToday"),
  gaugeGridToday: document.getElementById("gaugeGridToday"),
  insightTariffStatus: document.getElementById("insightTariffStatus"),
  insightTariffDetail: document.getElementById("insightTariffDetail"),
  insightBatteryReadiness: document.getElementById("insightBatteryReadiness"),
  insightBatteryDetail: document.getElementById("insightBatteryDetail"),
  insightGridMode: document.getElementById("insightGridMode"),
  insightGridDetail: document.getElementById("insightGridDetail"),
  insightSmartHint: document.getElementById("insightSmartHint"),
  insightSmartHintDetail: document.getElementById("insightSmartHintDetail"),
  balancePvTotal: document.getElementById("balancePvTotal"),
  balancePvSelf: document.getElementById("balancePvSelf"),
  balancePvExport: document.getElementById("balancePvExport"),
  balanceLoadTotal: document.getElementById("balanceLoadTotal"),
  balanceLoadSelf: document.getElementById("balanceLoadSelf"),
  balanceLoadGrid: document.getElementById("balanceLoadGrid"),
  balancePvSelfBar: document.getElementById("balancePvSelfBar"),
  balancePvExportBar: document.getElementById("balancePvExportBar"),
  balanceLoadSelfBar: document.getElementById("balanceLoadSelfBar"),
  balanceLoadGridBar: document.getElementById("balanceLoadGridBar"),
  tariffStatusText: document.getElementById("tariffStatusText"),
  tariffPeakStartInput: document.getElementById("tariffPeakStartInput"),
  tariffPeakEndInput: document.getElementById("tariffPeakEndInput"),
  tariffPeakRateInput: document.getElementById("tariffPeakRateInput"),
  tariffOffPeakRateInput: document.getElementById("tariffOffPeakRateInput"),
  tariffFeedInRateInput: document.getElementById("tariffFeedInRateInput"),
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
let lastPayload = null;
let lastRangePayload = null;
let lastWeatherPayload = null;
let lastTariff = null;
const REBUILD_LIMIT_DAYS = 31;

function getSelectValues(selectElement) {
  return new Set(Array.from(selectElement.options).map((option) => option.value));
}

function getStoredSelectValue(key, selectElement, fallback) {
  try {
    const storedValue = localStorage.getItem(key);

    return storedValue && getSelectValues(selectElement).has(storedValue) ? storedValue : fallback;
  } catch {
    return fallback;
  }
}

function setStoredValue(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Some browsers disable localStorage in private or restricted modes.
  }
}

let currentLanguage = getStoredSelectValue(storageKeys.language, languageSelect, "en");

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
    rebuildSummary: "{processed} days checked, {rebuilt} recalculated, {skipped} kept unchanged.",
    rebuildLimited: " Limited to the most recent {limit} days; {omitted} older days were not rebuilt.",
    rebuildCacheConfirm: "Rebuild the selected range using FoxCloud 5-minute history data? This may call the FoxCloud API many times and is limited to the most recent {limit} days.",
    rebuildCacheConfirmPreview: "Rebuild selected range? This will recalculate up to {days} day(s), estimate {calls} FoxCloud history API call(s), and is limited to the most recent {limit} days.",
    rebuildCacheConfirmLocal: "Refresh the selected range from local Modbus/SQLite data? This will not call FoxCloud.",
    rebuildCacheConfirmDemo: "Demo mode is enabled. Rebuild will not call FoxCloud or change live data. Continue?",
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
    estimatedSavings: "Estimated savings",
    todaySavings: "Estimated savings today",
    savingsMeta: "{kwh} kWh avoided grid import at about {rate}/kWh",
    tariffSettings: "Electricity tariff",
    tariffSettingsTitle: "Savings settings",
    tariffSettingsHelp: "Edit your import and feed-in rates here. Settings are saved in SQLite and survive container rebuilds.",
    peakStart: "Peak start",
    peakEnd: "Peak end",
    peakRate: "Peak rate",
    offPeakRate: "Off-peak rate",
    feedInRate: "Feed-in rate",
    saveTariff: "Save tariff",
    tariffLoaded: "Tariff loaded.",
    tariffSaved: "Tariff saved. Savings updated.",
    tariffSaveFailed: "Unable to save tariff",
    kpiDailySolar: "Daily solar",
    kpiDailyConsumption: "Daily consumption",
    kpiDailyExport: "Daily export",
    kpiSelfSufficiency: "Self sufficiency",
    kpiEstimatedSavings: "Est. savings",
    exportedToGrid: "Exported to grid",
    ofYesterday: "{percent}% of yesterday",
    noYesterdayData: "No yesterday data",
    excellentStatus: "Excellent",
    goodStatus: "Good",
    needsGridSupport: "Needs grid support",
    systemStatus: "System status",
    inverter: "Inverter",
    lastUpdate: "Last update",
    dataSource: "Data source",
    gaugeSolarPower: "Solar power",
    gaugeBattery: "Battery",
    gaugeHouseLoad: "House load",
    gaugeGrid: "Grid",
    producing: "Producing",
    consuming: "Consuming",
    idle: "Idle",
    todayPrefix: "Today",
    chargePower: "{value} charging",
    dischargePower: "{value} discharging",
    netExportToday: "{value} exported today",
    netImportToday: "{value} imported today",
    tariffWindow: "Tariff window",
    batteryReadiness: "Battery readiness",
    gridModeNow: "Grid mode now",
    smartHint: "Smart hint",
    peakNow: "Peak now",
    offPeakNow: "Off-peak now",
    peakStartsIn: "Peak starts in {time}",
    peakEndsIn: "Peak ends in {time}",
    peakWindowDetail: "Peak {window} at {rate}/kWh",
    batteryReadyHigh: "Ready for peak",
    batteryReadyMedium: "Watch evening usage",
    batteryReadyLow: "Low for peak",
    batteryReadinessDetail: "Battery is {soc}; peak window is {window}",
    gridExportHint: "Exporting surplus solar",
    gridImportHint: "Importing from grid",
    gridNeutralHint: "Grid nearly balanced",
    gridDetail: "Import {importKw}, export {exportKw}",
    smartHintExporting: "Good time to run flexible loads or keep charging battery.",
    smartHintPeak: "Peak tariff is active; battery support is most valuable now.",
    smartHintLowBattery: "Battery is below 50%; consider saving stored energy for peak hours.",
    smartHintNormal: "System looks steady. Keep an eye on weather and peak tariff window.",
    energyBalance: "Energy balance",
    pvDistribution: "PV distribution",
    loadCoverage: "Load coverage",
    homeUsageSource: "Home usage source",
    solarBatteryCovered: "Solar + battery",
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
    batteryTemp: "Min battery temp",
    batteryMaxTemp: "Max battery temp",
    batteryPackTemp: "Battery pack temp",
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
    weather: "Weather",
    solarForecast: "Solar forecast",
    solarOutlook: "Solar outlook",
    rainChance: "Rain chance",
    cloudCover: "Cloud cover",
    weatherDisabled: "Weather forecast is not configured.",
    clear: "Clear",
    partly_cloudy: "Partly cloudy",
    cloudy: "Cloudy",
    fog: "Fog",
    drizzle: "Showers",
    rain: "Rain",
    snow: "Snow",
    storm: "Storm",
    unknown: "Unknown",
    excellent: "Excellent",
    good: "Good",
    fair: "Fair",
    poor: "Poor",
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
    rebuildSummary: "已检查 {processed} 天，成功重算 {rebuilt} 天，保留原值 {skipped} 天。",
    rebuildLimited: " 本次限制为最近 {limit} 天；较早的 {omitted} 天没有重算。",
    rebuildCacheConfirm: "确定要用 FoxCloud 5 分钟历史数据重算所选范围吗？这可能会调用较多 FoxCloud API，并且最多只重算最近 {limit} 天。",
    rebuildCacheConfirmPreview: "确定要重算所选范围吗？本次最多重算 {days} 天，预计调用 {calls} 次 FoxCloud history API，并限制为最近 {limit} 天。",
    rebuildCacheConfirmLocal: "确定要用本地 Modbus/SQLite 数据刷新所选范围吗？这不会调用 FoxCloud。",
    rebuildCacheConfirmDemo: "当前是演示模式。重算不会调用 FoxCloud，也不会改变真实数据。是否继续？",
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
    estimatedSavings: "预估节省电费",
    todaySavings: "今日预估节省",
    savingsMeta: "约 {kwh} kWh 未从电网取电，按约 {rate}/kWh 估算",
    tariffSettings: "电价设置",
    tariffSettingsTitle: "节省金额设置",
    tariffSettingsHelp: "在这里修改用电电价和回馈电价。设置会保存到 SQLite，重建容器后仍会保留。",
    peakStart: "高峰开始",
    peakEnd: "高峰结束",
    peakRate: "高峰电价",
    offPeakRate: "非高峰电价",
    feedInRate: "回馈电价",
    saveTariff: "保存电价",
    tariffLoaded: "电价设置已加载。",
    tariffSaved: "电价已保存，节省金额已更新。",
    tariffSaveFailed: "无法保存电价",
    kpiDailySolar: "今日太阳能",
    kpiDailyConsumption: "今日用电",
    kpiDailyExport: "今日回馈",
    kpiSelfSufficiency: "自给率",
    kpiEstimatedSavings: "预估节省",
    exportedToGrid: "已回馈电网",
    ofYesterday: "相当于昨天 {percent}%",
    noYesterdayData: "暂无昨天数据",
    excellentStatus: "优秀",
    goodStatus: "良好",
    needsGridSupport: "需要电网补充",
    systemStatus: "系统状态",
    inverter: "逆变器",
    lastUpdate: "最后更新",
    dataSource: "数据来源",
    gaugeSolarPower: "太阳能功率",
    gaugeBattery: "电池",
    gaugeHouseLoad: "家庭负载",
    gaugeGrid: "电网",
    producing: "发电中",
    consuming: "用电中",
    idle: "待机",
    todayPrefix: "今日",
    chargePower: "{value} 充电",
    dischargePower: "{value} 放电",
    netExportToday: "今日回馈 {value}",
    netImportToday: "今日取电 {value}",
    tariffWindow: "电价时段",
    batteryReadiness: "电池晚高峰准备度",
    gridModeNow: "当前电网状态",
    smartHint: "智能建议",
    peakNow: "正在高峰电价",
    offPeakNow: "当前非高峰",
    peakStartsIn: "距离高峰还有 {time}",
    peakEndsIn: "距离高峰结束 {time}",
    peakWindowDetail: "高峰 {window}，约 {rate}/kWh",
    batteryReadyHigh: "适合应对晚高峰",
    batteryReadyMedium: "注意晚间用电",
    batteryReadyLow: "晚高峰电量偏低",
    batteryReadinessDetail: "当前电池 {soc}；高峰时段 {window}",
    gridExportHint: "正在输出多余太阳能",
    gridImportHint: "正在从电网取电",
    gridNeutralHint: "电网接近平衡",
    gridDetail: "输入 {importKw}，输出 {exportKw}",
    smartHintExporting: "现在适合运行可延后的用电设备，或继续给电池充电。",
    smartHintPeak: "当前是高峰电价，电池支撑最有价值。",
    smartHintLowBattery: "电池低于 50%，建议尽量把电留给高峰时段。",
    smartHintNormal: "系统状态稳定，继续关注天气和高峰电价时段。",
    energyBalance: "能源平衡",
    pvDistribution: "光伏去向",
    loadCoverage: "用电来源",
    homeUsageSource: "家庭用电来源",
    solarBatteryCovered: "太阳能 + 电池",
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
    batteryTemp: "最低电池温度",
    batteryMaxTemp: "最高电池温度",
    batteryPackTemp: "电池包温度",
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
    weather: "天气",
    solarForecast: "太阳能天气预报",
    solarOutlook: "发电天气",
    rainChance: "下雨概率",
    cloudCover: "云量",
    weatherDisabled: "天气预报尚未配置。",
    clear: "晴天",
    partly_cloudy: "局部多云",
    cloudy: "多云",
    fog: "有雾",
    drizzle: "阵雨",
    rain: "下雨",
    snow: "下雪",
    storm: "雷暴",
    unknown: "未知",
    excellent: "非常适合",
    good: "适合",
    fair: "一般",
    poor: "较差",
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
    rebuildSummary: "ตรวจสอบ {processed} วัน คำนวณใหม่ {rebuilt} วัน เก็บค่าเดิม {skipped} วัน",
    rebuildLimited: " จำกัดเฉพาะ {limit} วันล่าสุด; ไม่ได้สร้างใหม่ {omitted} วันเก่ากว่านั้น",
    rebuildCacheConfirm: "ต้องการสร้างแคชของช่วงที่เลือกใหม่ด้วยข้อมูลประวัติทุก 5 นาทีจาก FoxCloud หรือไม่? การทำงานนี้อาจเรียก API หลายครั้งและจำกัดเฉพาะ {limit} วันล่าสุด",
    rebuildCacheConfirmPreview: "ต้องการสร้างแคชช่วงที่เลือกใหม่หรือไม่? จะคำนวณใหม่ได้สูงสุด {days} วัน เรียก FoxCloud history API ประมาณ {calls} ครั้ง และจำกัดเฉพาะ {limit} วันล่าสุด",
    rebuildCacheConfirmLocal: "ต้องการรีเฟรชช่วงที่เลือกจากข้อมูล Modbus/SQLite ในเครื่องหรือไม่? จะไม่เรียก FoxCloud",
    rebuildCacheConfirmDemo: "กำลังใช้โหมดตัวอย่าง การสร้างใหม่จะไม่เรียก FoxCloud หรือเปลี่ยนข้อมูลจริง ต้องการดำเนินการต่อหรือไม่?",
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
    estimatedSavings: "เงินที่ประหยัดโดยประมาณ",
    todaySavings: "ประหยัดวันนี้โดยประมาณ",
    savingsMeta: "หลีกเลี่ยงการใช้ไฟจากกริด {kwh} kWh ที่ประมาณ {rate}/kWh",
    tariffSettings: "อัตราค่าไฟ",
    tariffSettingsTitle: "ตั้งค่าการประหยัด",
    tariffSettingsHelp: "แก้ไขอัตราค่าไฟนำเข้าและรับซื้อไฟคืนได้ที่นี่ ข้อมูลจะบันทึกใน SQLite และไม่หายเมื่อสร้างคอนเทนเนอร์ใหม่",
    peakStart: "เริ่มช่วงพีค",
    peakEnd: "จบช่วงพีค",
    peakRate: "ค่าไฟช่วงพีค",
    offPeakRate: "ค่าไฟนอกพีค",
    feedInRate: "อัตรารับซื้อไฟคืน",
    saveTariff: "บันทึกค่าไฟ",
    tariffLoaded: "โหลดค่าไฟแล้ว",
    tariffSaved: "บันทึกค่าไฟแล้ว อัปเดตเงินที่ประหยัดแล้ว",
    tariffSaveFailed: "ไม่สามารถบันทึกค่าไฟได้",
    kpiDailySolar: "โซลาร์วันนี้",
    kpiDailyConsumption: "ใช้ไฟวันนี้",
    kpiDailyExport: "ส่งออกวันนี้",
    kpiSelfSufficiency: "พึ่งพาตนเอง",
    kpiEstimatedSavings: "ประหยัดโดยประมาณ",
    exportedToGrid: "ส่งออกเข้ากริด",
    ofYesterday: "{percent}% ของเมื่อวาน",
    noYesterdayData: "ไม่มีข้อมูลเมื่อวาน",
    excellentStatus: "ยอดเยี่ยม",
    goodStatus: "ดี",
    needsGridSupport: "ต้องพึ่งกริด",
    systemStatus: "สถานะระบบ",
    inverter: "อินเวอร์เตอร์",
    lastUpdate: "อัปเดตล่าสุด",
    dataSource: "แหล่งข้อมูล",
    gaugeSolarPower: "กำลังโซลาร์",
    gaugeBattery: "แบตเตอรี่",
    gaugeHouseLoad: "โหลดบ้าน",
    gaugeGrid: "กริด",
    producing: "กำลังผลิต",
    consuming: "กำลังใช้",
    idle: "นิ่ง",
    todayPrefix: "วันนี้",
    chargePower: "ชาร์จ {value}",
    dischargePower: "คายประจุ {value}",
    netExportToday: "ส่งออกวันนี้ {value}",
    netImportToday: "นำเข้าวันนี้ {value}",
    tariffWindow: "ช่วงค่าไฟ",
    batteryReadiness: "ความพร้อมแบตเตอรี่",
    gridModeNow: "สถานะกริดตอนนี้",
    smartHint: "คำแนะนำ",
    peakNow: "ช่วงพีคตอนนี้",
    offPeakNow: "นอกช่วงพีค",
    peakStartsIn: "พีคเริ่มใน {time}",
    peakEndsIn: "พีคจบใน {time}",
    peakWindowDetail: "พีค {window} ที่ {rate}/kWh",
    batteryReadyHigh: "พร้อมสำหรับช่วงพีค",
    batteryReadyMedium: "เฝ้าดูการใช้ช่วงเย็น",
    batteryReadyLow: "แบตต่ำสำหรับช่วงพีค",
    batteryReadinessDetail: "แบตเตอรี่ {soc}; ช่วงพีค {window}",
    gridExportHint: "กำลังส่งโซลาร์ส่วนเกิน",
    gridImportHint: "กำลังใช้ไฟจากกริด",
    gridNeutralHint: "กริดเกือบสมดุล",
    gridDetail: "นำเข้า {importKw}, ส่งออก {exportKw}",
    smartHintExporting: "เหมาะกับการใช้โหลดที่ยืดหยุ่น หรือชาร์จแบตเตอรี่ต่อ",
    smartHintPeak: "ช่วงค่าไฟพีคกำลังทำงาน แบตเตอรี่ช่วยคุ้มที่สุดตอนนี้",
    smartHintLowBattery: "แบตเตอรี่ต่ำกว่า 50%; ควรเก็บไว้ใช้ช่วงพีค",
    smartHintNormal: "ระบบค่อนข้างนิ่ง ติดตามอากาศและช่วงค่าไฟพีคต่อไป",
    energyBalance: "สมดุลพลังงาน",
    pvDistribution: "การกระจาย PV",
    loadCoverage: "แหล่งจ่ายโหลด",
    homeUsageSource: "แหล่งพลังงานของบ้าน",
    solarBatteryCovered: "โซลาร์ + แบตเตอรี่",
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
    batteryTemp: "อุณหภูมิแบตเตอรี่ต่ำสุด",
    batteryMaxTemp: "อุณหภูมิแบตเตอรี่สูงสุด",
    batteryPackTemp: "อุณหภูมิแพ็กแบตเตอรี่",
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
    weather: "อากาศ",
    solarForecast: "พยากรณ์โซลาร์",
    solarOutlook: "แนวโน้มโซลาร์",
    rainChance: "โอกาสฝน",
    cloudCover: "เมฆปกคลุม",
    weatherDisabled: "ยังไม่ได้ตั้งค่าพยากรณ์อากาศ",
    clear: "ฟ้าใส",
    partly_cloudy: "มีเมฆบางส่วน",
    cloudy: "มีเมฆมาก",
    fog: "หมอก",
    drizzle: "ฝนปรอย",
    rain: "ฝน",
    snow: "หิมะ",
    storm: "พายุ",
    unknown: "ไม่ทราบ",
    excellent: "ยอดเยี่ยม",
    good: "ดี",
    fair: "พอใช้",
    poor: "ไม่ดี",
  },
};

function t(key) {
  return translations[currentLanguage][key] ?? translations.en[key] ?? key;
}

function interpolate(template, values) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function formatKwh(value) {
  return `${Number(value ?? 0).toFixed(2)} kWh`;
}

function formatMoney(value, currency = "AUD") {
  const normalizedCurrency = currency || "AUD";

  try {
    return new Intl.NumberFormat(currentLanguage === "zh" ? "zh-CN" : currentLanguage === "th" ? "th-TH" : "en-AU", {
      style: "currency",
      currency: normalizedCurrency,
      currencyDisplay: "narrowSymbol",
    }).format(Number(value ?? 0));
  } catch {
    return `${normalizedCurrency} ${Number(value ?? 0).toFixed(2)}`;
  }
}

function formatRate(value, currency = "AUD") {
  return `${formatMoney(value, currency)}`;
}

function formatSavingsMeta(savings) {
  if (!savings) {
    return "--";
  }

  return interpolate(t("savingsMeta"), {
    kwh: Number(savings.avoidedGridImportKwh ?? 0).toFixed(2),
    rate: formatRate(savings.blendedImportRate, savings.currency),
  });
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

function formatOptionalPercent(value) {
  if (value === null || value === undefined) {
    return "--";
  }

  return `${Number(value).toFixed(0)}%`;
}

function formatYesterdayComparison(todayValue, yesterdayValue) {
  const baseline = Number(yesterdayValue ?? 0);

  if (!Number.isFinite(baseline) || baseline <= 0) {
    return t("noYesterdayData");
  }

  const percent = Math.round((Number(todayValue ?? 0) / baseline) * 100);
  return interpolate(t("ofYesterday"), { percent });
}

function getLatestDailyRows(rows) {
  return [...(rows ?? [])]
    .filter((row) => row?.date)
    .sort((first, second) => first.date.localeCompare(second.date));
}

function getSelfSufficiencyStatus(percent) {
  if (percent >= 90) {
    return t("excellentStatus");
  }

  if (percent >= 70) {
    return t("goodStatus");
  }

  return t("needsGridSupport");
}

function setGauge(arcElement, value, max) {
  const normalized = Math.max(0, Math.min(1, Number(value ?? 0) / max));
  arcElement.style.setProperty("--gauge-degrees", `${Math.round(normalized * 180)}deg`);
}

function parseClockMinutes(time) {
  const [hours, minutes] = String(time ?? "00:00").split(":").map(Number);
  return (Number(hours) || 0) * 60 + (Number(minutes) || 0);
}

function formatDurationMinutes(minutes) {
  const normalized = Math.max(0, Math.round(minutes));
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;

  if (hours === 0) {
    return `${mins}m`;
  }

  return `${hours}h ${String(mins).padStart(2, "0")}m`;
}

function getTariffStatus(savings) {
  const [peakStart = "15:00", peakEnd = "20:59"] = String(savings?.peakWindow ?? "15:00-20:59").split("-");
  const start = parseClockMinutes(peakStart);
  const end = parseClockMinutes(peakEnd);
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const isPeak = start <= end
    ? current >= start && current <= end
    : current >= start || current <= end;
  const minutesUntilStart = current <= start ? start - current : 24 * 60 - current + start;
  const minutesUntilEnd = current <= end && current >= start ? end - current : 0;

  return {
    isPeak,
    peakWindow: `${peakStart}-${peakEnd}`,
    detailKey: isPeak ? "peakEndsIn" : "peakStartsIn",
    detailMinutes: isPeak ? minutesUntilEnd : minutesUntilStart,
  };
}

function renderGaugeCards(payload) {
  const live = payload.live ?? {};
  const today = payload.today ?? {};
  const solarKw = Number(live.solarGeneratedKw ?? 0);
  const homeKw = Number(live.homeUsageKw ?? 0);
  const batteryChargeKw = Number(live.batteryChargeKw ?? 0);
  const batteryDischargeKw = Number(live.batteryDischargeKw ?? 0);
  const batteryFlowKw = Math.max(batteryChargeKw, batteryDischargeKw);
  const gridImportKw = Number(live.gridImportKw ?? 0);
  const gridExportKw = Number(live.gridExportKw ?? 0);
  const gridFlowKw = Math.max(gridImportKw, gridExportKw);
  const batterySoc = live.batterySocPercent;

  setGauge(textFields.gaugeSolarArc, solarKw, 10);
  setGauge(textFields.gaugeBatteryArc, batterySoc ?? batteryFlowKw, batterySoc === null || batterySoc === undefined ? 8 : 100);
  setGauge(textFields.gaugeHomeArc, homeKw, 8);
  setGauge(textFields.gaugeGridArc, gridFlowKw, 8);

  metricFields.gaugeSolarValue.textContent = formatKw(solarKw);
  metricFields.gaugeBatteryValue.textContent = batterySoc === null || batterySoc === undefined
    ? formatKw(batteryFlowKw)
    : formatPercent(batterySoc);
  metricFields.gaugeHomeValue.textContent = formatKw(homeKw);
  metricFields.gaugeGridValue.textContent = formatKw(gridFlowKw);

  textFields.gaugeSolarMode.textContent = solarKw > 0.05 ? t("producing") : t("idle");
  textFields.gaugeBatteryMode.textContent = batteryChargeKw >= batteryDischargeKw
    ? t("charging")
    : t("discharging");
  textFields.gaugeHomeMode.textContent = t("consuming");
  textFields.gaugeGridMode.textContent = gridExportKw >= gridImportKw ? t("exporting") : t("importing");

  textFields.gaugeSolarToday.textContent = `${t("todayPrefix")}: ${formatKwh(today.solarProductionKwh)}`;
  textFields.gaugeBatteryDetail.textContent = interpolate(
    batteryChargeKw >= batteryDischargeKw ? t("chargePower") : t("dischargePower"),
    { value: formatKw(batteryFlowKw) },
  );
  textFields.gaugeHomeToday.textContent = `${t("todayPrefix")}: ${formatKwh(today.homeUsageKwh)}`;
  textFields.gaugeGridToday.textContent = interpolate(
    gridExportKw >= gridImportKw ? t("netExportToday") : t("netImportToday"),
    { value: formatKwh(gridExportKw >= gridImportKw ? today.returnToGridKwh : today.gridConsumptionKwh) },
  );
}

function renderEnergyInsights(payload) {
  const live = payload.live ?? {};
  const savings = payload.todaySavings ?? {};
  const tariff = getTariffStatus(savings);
  const batterySoc = Number(live.batterySocPercent ?? 0);
  const gridImportKw = Number(live.gridImportKw ?? 0);
  const gridExportKw = Number(live.gridExportKw ?? 0);

  textFields.insightTariffStatus.textContent = tariff.isPeak ? t("peakNow") : t("offPeakNow");
  textFields.insightTariffDetail.textContent = `${interpolate(t(tariff.detailKey), {
    time: formatDurationMinutes(tariff.detailMinutes),
  })} · ${interpolate(t("peakWindowDetail"), {
    window: tariff.peakWindow,
    rate: formatRate(savings.peakRate, savings.currency),
  })}`;

  const batteryKey = batterySoc >= 80
    ? "batteryReadyHigh"
    : batterySoc >= 50
      ? "batteryReadyMedium"
      : "batteryReadyLow";
  textFields.insightBatteryReadiness.textContent = t(batteryKey);
  textFields.insightBatteryDetail.textContent = interpolate(t("batteryReadinessDetail"), {
    soc: formatPercent(live.batterySocPercent),
    window: tariff.peakWindow,
  });

  const gridModeKey = gridExportKw > gridImportKw + 0.05
    ? "gridExportHint"
    : gridImportKw > gridExportKw + 0.05
      ? "gridImportHint"
      : "gridNeutralHint";
  textFields.insightGridMode.textContent = t(gridModeKey);
  textFields.insightGridDetail.textContent = interpolate(t("gridDetail"), {
    importKw: formatKw(gridImportKw),
    exportKw: formatKw(gridExportKw),
  });

  const smartHintKey = tariff.isPeak
    ? "smartHintPeak"
    : batterySoc < 50
      ? "smartHintLowBattery"
      : gridExportKw > 1
        ? "smartHintExporting"
        : "smartHintNormal";
  textFields.insightSmartHint.textContent = t(smartHintKey);
  textFields.insightSmartHintDetail.textContent = formatSavingsMeta(savings);
}

function setBarWidth(element, value, total) {
  const percent = total > 0 ? Math.max(0, Math.min(100, (Number(value ?? 0) / total) * 100)) : 0;
  element.style.width = `${percent.toFixed(1)}%`;
}

function renderBalanceBars(payload) {
  const today = payload.today ?? {};
  const pvTotal = Number(today.solarProductionKwh ?? 0);
  const pvSelf = Math.max(Number(today.selfConsumptionKwh ?? 0), 0);
  const pvExport = Math.max(Number(today.returnToGridKwh ?? 0), 0);
  const homeTotal = Number(today.homeUsageKwh ?? 0);
  const gridConsumption = Math.max(Number(today.gridConsumptionKwh ?? 0), 0);
  const selfCovered = Math.max(homeTotal - gridConsumption, 0);

  textFields.balancePvTotal.textContent = formatKwh(pvTotal);
  textFields.balancePvSelf.textContent = formatKwh(pvSelf);
  textFields.balancePvExport.textContent = formatKwh(pvExport);
  textFields.balanceLoadTotal.textContent = formatKwh(homeTotal);
  textFields.balanceLoadSelf.textContent = formatKwh(selfCovered);
  textFields.balanceLoadGrid.textContent = formatKwh(gridConsumption);

  setBarWidth(textFields.balancePvSelfBar, pvSelf, pvTotal || pvSelf + pvExport);
  setBarWidth(textFields.balancePvExportBar, pvExport, pvTotal || pvSelf + pvExport);
  setBarWidth(textFields.balanceLoadSelfBar, selfCovered, homeTotal);
  setBarWidth(textFields.balanceLoadGridBar, gridConsumption, homeTotal);
}

function renderTariffSettings(tariff) {
  if (!tariff) {
    return;
  }

  lastTariff = tariff;
  textFields.tariffPeakStartInput.value = tariff.peakStart ?? "15:00";
  textFields.tariffPeakEndInput.value = tariff.peakEnd ?? "20:59";
  textFields.tariffPeakRateInput.value = tariff.peakRate ?? 0;
  textFields.tariffOffPeakRateInput.value = tariff.offPeakRate ?? 0;
  textFields.tariffFeedInRateInput.value = tariff.feedInRate ?? 0;
  textFields.tariffStatusText.textContent = interpolate(t("peakWindowDetail"), {
    window: `${tariff.peakStart ?? "15:00"}-${tariff.peakEnd ?? "20:59"}`,
    rate: formatRate(tariff.peakRate, tariff.currency),
  });
}

async function loadTariffSettings() {
  const response = await fetch("/api/tariff");
  const payload = await response.json();

  if (!response.ok || payload.error) {
    throw new Error(payload.error || "Tariff request failed.");
  }

  renderTariffSettings(payload.tariff);
}

function collectTariffSettings() {
  return {
    currency: lastTariff?.currency ?? "AUD",
    peakStart: textFields.tariffPeakStartInput.value,
    peakEnd: textFields.tariffPeakEndInput.value,
    peakRate: Number(textFields.tariffPeakRateInput.value),
    offPeakRate: Number(textFields.tariffOffPeakRateInput.value),
    feedInRate: Number(textFields.tariffFeedInRateInput.value),
  };
}

async function saveTariffSettings() {
  saveTariffButton.disabled = true;
  textFields.tariffStatusText.textContent = t("loading");

  try {
    const response = await fetch("/api/tariff", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(collectTariffSettings()),
    });
    const payload = await response.json();

    if (!response.ok || payload.error) {
      throw new Error(payload.error || "Tariff save failed.");
    }

    renderTariffSettings(payload.tariff);
    await loadDashboard();
    textFields.tariffStatusText.textContent = t("tariffSaved");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    textFields.tariffStatusText.textContent = `${t("tariffSaveFailed")}: ${message}`;
  } finally {
    saveTariffButton.disabled = false;
  }
}

function formatOptionalMillimetres(value) {
  if (value === null || value === undefined) {
    return "--";
  }

  return `${Number(value).toFixed(1)} mm`;
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

  if (lastWeatherPayload) {
    renderWeather(lastWeatherPayload);
  }

  if (lastTariff) {
    renderTariffSettings(lastTariff);
  }

  if (!lastPayload) {
    statusText.textContent = t("loading");
  }
}

function getWeatherIcon(conditionKey) {
  const icons = {
    clear: "☀",
    partly_cloudy: "⛅",
    cloudy: "☁",
    fog: "🌫",
    drizzle: "🌦",
    rain: "🌧",
    snow: "❄",
    storm: "⛈",
    unknown: "○",
  };

  return icons[conditionKey] ?? icons.unknown;
}

function formatWeatherDate(dateKey) {
  const parsed = new Date(`${dateKey}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return dateKey;
  }

  return new Intl.DateTimeFormat(
    { en: "en-AU", zh: "zh-CN", th: "th-TH" }[currentLanguage] ?? "en-AU",
    { weekday: "short", day: "numeric" },
  ).format(parsed);
}

function renderWeather(payload) {
  lastWeatherPayload = payload;

  if (!payload?.enabled || !payload.current) {
    weatherPanel.classList.add("hidden");
    return;
  }

  const current = payload.current;
  const locationName = payload.location?.name
    || [payload.location?.latitude?.toFixed(3), payload.location?.longitude?.toFixed(3)].filter(Boolean).join(", ");

  weatherPanel.classList.remove("hidden");
  textFields.weatherLocation.textContent = locationName || t("weather");
  textFields.weatherIcon.textContent = getWeatherIcon(current.conditionKey);
  textFields.weatherTemperature.textContent = formatTemperature(current.temperatureCelsius);
  textFields.weatherCondition.textContent = t(current.conditionKey);
  textFields.weatherSolarOutlook.textContent = t(current.solarOutlook);
  textFields.weatherSolarOutlook.dataset.outlook = current.solarOutlook;
  textFields.weatherRainChance.textContent = formatOptionalPercent(current.precipitationProbabilityPercent);
  textFields.weatherCloudCover.textContent = formatOptionalPercent(current.cloudCoverPercent);

  const forecastCards = (payload.daily ?? []).slice(0, 5).map((day) => {
    const card = document.createElement("article");
    const date = document.createElement("strong");
    const icon = document.createElement("span");
    const condition = document.createElement("span");
    const temperature = document.createElement("span");
    const rain = document.createElement("small");

    card.className = "weather-day";
    icon.className = "weather-day-icon";
    date.textContent = formatWeatherDate(day.date);
    icon.textContent = getWeatherIcon(day.conditionKey);
    condition.textContent = t(day.conditionKey);
    temperature.textContent = `${formatTemperature(day.temperatureMinCelsius)} / ${formatTemperature(day.temperatureMaxCelsius)}`;
    rain.textContent = `${t("rainChance")}: ${formatOptionalPercent(day.precipitationProbabilityMaxPercent)} · ${formatOptionalMillimetres(day.precipitationSumMm)}`;
    card.append(date, icon, condition, temperature, rain);

    return card;
  });

  textFields.weatherDaily.replaceChildren(...forecastCards);
}

async function loadWeather() {
  try {
    const response = await fetch("/api/weather");
    const payload = await response.json();

    if (!response.ok || payload.error) {
      throw new Error(payload.error || "Weather request failed.");
    }

    renderWeather(payload);
  } catch (error) {
    lastWeatherPayload = null;
    weatherPanel.classList.add("hidden");
  }
}

function getBadgeTone(tone) {
  const allowedTones = new Set(["online", "offline", "warning", "battery", "solar", "neutral", "live"]);

  return allowedTones.has(tone) ? tone : "neutral";
}

function buildBadge(label, tone) {
  const badge = document.createElement("span");
  badge.classList.add("badge", `badge-${getBadgeTone(tone)}`);
  badge.textContent = label;

  return badge;
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

  textFields.badgeRow.replaceChildren(...badges);
}

function renderWarnings(warnings) {
  if (!warnings || warnings.length === 0) {
    warningBox.classList.add("hidden");
    warningBox.replaceChildren();
    return;
  }

  warningBox.classList.remove("hidden");
  warningBox.replaceChildren(
    ...warnings.map((item) => {
      const warning = document.createElement("p");
      warning.textContent = item;
      return warning;
    }),
  );
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

  const tableRows = sortedRows.map((row) => {
    const tableRow = document.createElement("tr");
    const cells = [
      { value: row.date },
      { key: "pv_production", value: formatKwh(row.pv_production), rawValue: row.pv_production },
      { key: "self_consumption", value: formatKwh(row.self_consumption), rawValue: row.self_consumption },
      { key: "daily_feedin", value: formatKwh(row.daily_feedin), rawValue: row.daily_feedin },
      { key: "home_usage", value: formatKwh(row.home_usage), rawValue: row.home_usage },
      { key: "grid_consumption", value: formatKwh(row.grid_consumption), rawValue: row.grid_consumption },
      {
        key: "daily_charged_energy_total",
        value: formatKwh(row.daily_charged_energy_total),
        rawValue: row.daily_charged_energy_total,
      },
      {
        key: "daily_discharged_energy_total",
        value: formatKwh(row.daily_discharged_energy_total),
        rawValue: row.daily_discharged_energy_total,
      },
    ];

    cells.forEach((cell) => {
      const tableCell = document.createElement("td");

      if (cell.key) {
        tableCell.className = valueClass(cell.key, cell.rawValue);
      }

      tableCell.textContent = cell.value;
      tableRow.append(tableCell);
    });

    return tableRow;
  });

  dailyTableBody.replaceChildren(...tableRows);
  renderSortButtons();
}

function escapeCsvValue(value) {
  return window.FoxCloudCsv.escapeCsvValue(value);
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
  metricFields.periodSavings.textContent = formatMoney(
    payload.savings?.estimatedTotalBenefit,
    payload.savings?.currency,
  );
  textFields.periodSavingsMeta.textContent = formatSavingsMeta(payload.savings);

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
  const [year, month] = monthPicker.value.split("-");
  let preview = null;

  try {
    const previewResponse = await fetch(
      `/api/rebuild-cache/preview?year=${year}&month=${Number(month)}&range=${encodeURIComponent(tableRangeSelect.value)}`,
    );
    preview = await previewResponse.json();

    if (!previewResponse.ok || preview.error) {
      preview = null;
    }
  } catch {
    preview = null;
  }

  if (!window.confirm(FoxCloudRebuild.formatRebuildConfirm(t, REBUILD_LIMIT_DAYS, preview))) {
    return;
  }

  rebuildCacheButton.disabled = true;
  refreshButton.disabled = true;
  statusText.textContent = t("rebuildingCache");

  try {
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
    statusText.textContent = FoxCloudRebuild.formatRebuildStatus(payload, t);
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

function renderVisualKpis(payload) {
  const today = payload.today ?? {};
  const rows = getLatestDailyRows(payload.dailyTable);
  const latestRow = rows.at(-1) ?? {};
  const previousRow = rows.length > 1 ? rows.at(-2) : null;
  const homeUsage = Number(today.homeUsageKwh ?? latestRow.home_usage ?? 0);
  const gridConsumption = Number(today.gridConsumptionKwh ?? latestRow.grid_consumption ?? 0);
  const selfSufficiency = homeUsage > 0
    ? Math.max(0, Math.min(100, ((homeUsage - gridConsumption) / homeUsage) * 100))
    : 0;

  metricFields.kpiDailySolar.textContent = formatKwh(today.solarProductionKwh);
  metricFields.kpiDailyConsumption.textContent = formatKwh(homeUsage);
  metricFields.kpiDailyExport.textContent = formatKwh(today.returnToGridKwh);
  metricFields.kpiSelfSufficiency.textContent = formatOptionalPercent(selfSufficiency);
  metricFields.kpiEstimatedSavings.textContent = formatMoney(
    payload.todaySavings?.estimatedTotalBenefit,
    payload.todaySavings?.currency,
  );

  textFields.kpiDailySolarMeta.textContent = formatYesterdayComparison(
    today.solarProductionKwh,
    previousRow?.pv_production,
  );
  textFields.kpiDailyConsumptionMeta.textContent = formatYesterdayComparison(
    homeUsage,
    previousRow?.home_usage,
  );
  textFields.kpiSelfSufficiencyMeta.textContent = getSelfSufficiencyStatus(selfSufficiency);
  textFields.kpiSystemStatus.textContent = t(payload.device?.status ?? "unknown");
  textFields.kpiInverterStatus.textContent = payload.device?.status === "online" ? t("online") : t(payload.device?.status ?? "unknown");
  textFields.kpiLastUpdate.textContent = formatTimestamp(payload.live?.updatedAt ?? payload.generatedAt);
  textFields.kpiDataSource.textContent = payload.source ?? "--";
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
  metricFields.todaySavings.textContent = formatMoney(
    payload.todaySavings?.estimatedTotalBenefit,
    payload.todaySavings?.currency,
  );
  textFields.todaySavingsMeta.textContent = formatSavingsMeta(payload.todaySavings);
  metricFields.batterySoc.textContent = formatPercent(payload.live.batterySocPercent);
  metricFields.batterySoc.classList.toggle(
    "battery-level-low",
    Number(payload.live.batterySocPercent ?? 100) < 50,
  );
  metricFields.batterySoc.classList.toggle(
    "battery-level-good",
    payload.live.batterySocPercent !== null && payload.live.batterySocPercent !== undefined && Number(payload.live.batterySocPercent) >= 50,
  );
  metricFields.batteryTemp.textContent = formatTemperature(payload.live.batteryMinTemperatureCelsius ?? payload.live.batteryTemperatureCelsius);
  metricFields.batteryMaxTemp.textContent = formatTemperature(payload.live.batteryMaxTemperatureCelsius);
  metricFields.batteryPackTemp.textContent = formatTemperature(payload.live.batteryPackTemperatureCelsius);
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
  renderVisualKpis(payload);
  renderGaugeCards(payload);
  renderEnergyInsights(payload);
  renderBalanceBars(payload);
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
    await loadTariffSettings();
    await loadWeather();
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

function applyStoredPreferences() {
  tableRangeSelect.value = getStoredSelectValue(
    storageKeys.tableRange,
    tableRangeSelect,
    tableRangeSelect.value,
  );
  periodRangeSelect.value = tableRangeSelect.value;
}

refreshButton.addEventListener("click", loadDashboard);
rebuildCacheButton.addEventListener("click", rebuildSelectedCache);
exportPdfButton.addEventListener("click", exportDashboardToPdf);
exportCsvButton.addEventListener("click", exportTableToCsv);
saveTariffButton.addEventListener("click", saveTariffSettings);
monthPicker.addEventListener("change", loadDashboard);
tableRangeSelect.addEventListener("change", () => {
  setStoredValue(storageKeys.tableRange, tableRangeSelect.value);
  loadEnergyRange().catch((error) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    statusText.textContent = `${t("unableToLoad")}: ${message}`;
    renderWarnings([message]);
  });
});
periodRangeSelect.addEventListener("change", () => {
  tableRangeSelect.value = periodRangeSelect.value;
  setStoredValue(storageKeys.tableRange, tableRangeSelect.value);
  loadEnergyRange().catch((error) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    statusText.textContent = `${t("unableToLoad")}: ${message}`;
    renderWarnings([message]);
  });
});
languageSelect.addEventListener("change", () => {
  currentLanguage = languageSelect.value;
  setStoredValue(storageKeys.language, currentLanguage);
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
applyStoredPreferences();
applyLanguage();
loadDashboard();
