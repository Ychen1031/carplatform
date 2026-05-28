/**
 * 日志系統
 * 用於記錄應用中的各種事件
 * 日志會即時顯示在瀏覽器 console 和服務器終端
 */

const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  CLICK: 'CLICK'
};

const COLORS = {
  DEBUG: '\x1b[36m',    // 青色
  INFO: '\x1b[32m',     // 綠色
  WARN: '\x1b[33m',     // 黃色
  ERROR: '\x1b[31m',    // 紅色
  CLICK: '\x1b[35m',    // 紫色
  RESET: '\x1b[0m'      // 重置顏色
};

// 存儲待發送的日志（批量發送以提高性能）
let logQueue = [];
let sendTimeout = null;

const getTimestamp = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  
  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}.${ms}`;
};

const formatLog = (level, message, data) => {
  const timestamp = getTimestamp();
  const color = COLORS[level] || '';
  const reset = COLORS.RESET;
  
  let logMessage = `${color}[${timestamp}] [${level}] ${message}${reset}`;
  
  if (data !== undefined) {
    logMessage += ` ${JSON.stringify(data, null, 2)}`;
  }
  
  return logMessage;
};

/**
 * 批量發送日志到服務器
 */
const flushLogs = async () => {
  if (logQueue.length === 0) return;
  
  const logsToSend = logQueue;
  logQueue = [];
  
  try {
    const response = await fetch('http://localhost:3001/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(logsToSend)
    });
    
    if (!response.ok) {
      console.warn('⚠️ 日誌發送失敗:', response.statusText);
    }
  } catch (error) {
    console.warn('⚠️ 無法連接到日志服務器:', error.message);
  }
};

/**
 * 安排日志發送（延遲 1 秒批量發送）
 */
const scheduleSendLogs = () => {
  if (sendTimeout) clearTimeout(sendTimeout);
  sendTimeout = setTimeout(flushLogs, 1000);
};

/**
 * 記錄日志到隊列
 */
const queueLog = (level, message, data) => {
  const timestamp = getTimestamp();
  logQueue.push({
    time: timestamp,
    level: level,
    module: 'FRONTEND',
    message: message,
    data: data || {}
  });
  scheduleSendLogs();
};

const logger = {
  debug: (message, data) => {
    console.log(formatLog(LOG_LEVELS.DEBUG, message, data));
    queueLog(LOG_LEVELS.DEBUG, message, data);
  },
  
  info: (message, data) => {
    console.log(formatLog(LOG_LEVELS.INFO, message, data));
    queueLog(LOG_LEVELS.INFO, message, data);
  },
  
  warn: (message, data) => {
    console.warn(formatLog(LOG_LEVELS.WARN, message, data));
    queueLog(LOG_LEVELS.WARN, message, data);
  },
  
  error: (message, data) => {
    console.error(formatLog(LOG_LEVELS.ERROR, message, data));
    queueLog(LOG_LEVELS.ERROR, message, data);
  },
  
  // 記錄按鈕點擊事件
  click: (buttonName, additionalData) => {
    const data = {
      event: 'BUTTON_CLICK',
      button: buttonName,
      ...additionalData
    };
    console.log(formatLog(LOG_LEVELS.CLICK, `按鈕被點擊: ${buttonName}`, data));
    queueLog(LOG_LEVELS.CLICK, `按鈕被點擊: ${buttonName}`, data);
  },
  
  // 記錄頁面導航
  navigate: (pageName, fromPage) => {
    const data = {
      event: 'PAGE_NAVIGATE',
      from: fromPage || '未知',
      to: pageName
    };
    console.log(formatLog(LOG_LEVELS.INFO, `跳轉到頁面: ${pageName}`, data));
    queueLog(LOG_LEVELS.INFO, `跳轉到頁面: ${pageName}`, data);
  },
  
  // 記錄表單提交
  formSubmit: (formName, formData) => {
    const data = {
      event: 'FORM_SUBMIT',
      form: formName,
      timestamp: new Date().toISOString()
    };
    console.log(formatLog(LOG_LEVELS.INFO, `表單提交: ${formName}`, data));
    queueLog(LOG_LEVELS.INFO, `表單提交: ${formName}`, data);
  },
  
  // 記錄API調用
  apiCall: (method, url, status = null) => {
    const data = {
      event: 'API_CALL',
      method,
      url,
      status
    };
    console.log(formatLog(LOG_LEVELS.INFO, `API 調用: ${method} ${url}`, data));
    queueLog(LOG_LEVELS.INFO, `API 調用: ${method} ${url}`, data);
  },
  
  // 立即發送所有待発送的日誌
  flush: flushLogs
};

export default logger;

