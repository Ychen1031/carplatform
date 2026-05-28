# 日志系統文檔

## 概述
本項目使用自定義日志系統，用於記錄應用中的各類事件，如按鈕點擊、頁面導航、表單提交等。

## 日志級別

- **DEBUG**: 用於調試信息（青色）
- **INFO**: 一般信息（綠色）
- **WARN**: 警告信息（黃色）
- **ERROR**: 錯誤信息（紅色）
- **CLICK**: 按鈕點擊事件（紫色）

## 使用方法

### 導入日志系統
```javascript
import logger from './utils/logger';
```

### 基本用法

#### 記錄通用日志
```javascript
logger.debug('調試信息', { key: 'value' });
logger.info('信息', { detail: 'data' });
logger.warn('警告', { warning: 'data' });
logger.error('錯誤', { error: 'data' });
```

#### 記錄按鈕點擊
```javascript
logger.click('登入按鈕', { userId: 123 });
logger.click('免費刊登');
```

#### 記錄頁面導航
```javascript
logger.navigate('新車頁面', '首頁');
logger.navigate('關於我們', '首頁');
```

#### 記錄表單提交
```javascript
logger.formSubmit('車輛刊登表單', { carBrand: 'Toyota' });
```

#### 記錄API調用
```javascript
logger.apiCall('GET', '/api/cars', 200);
logger.apiCall('POST', '/api/listings', 201);
```

## 日志輸出格式

所有日志都會輸出到終端/控制台，格式為：
```
[時間戳] [日志級別] 消息 {額外數據}
```

例如：
```
[2026-03-23 14:30:45.123] [CLICK] 按鈕被點擊: 登入按鈕 {"event":"BUTTON_CLICK","button":"登入按鈕"}
[2026-03-23 14:30:46.456] [INFO] 跳轉到頁面: 新車 {"event":"PAGE_NAVIGATE","from":"首頁","to":"新車"}
```

## 集成到組件

### 在Header組件中
```javascript
import logger from '../utils/logger';

function Header() {
  const handleLogin = () => {
    logger.click('登入按鈕');
    // 執行登入邏輯
  };
  
  return (
    <button className="btn-login" onClick={handleLogin}>
      登入
    </button>
  );
}
```

### 在導航中
```javascript
import logger from '../utils/logger';

const handleNavigation = (pageNames) => {
  logger.navigate('新車頁面', '首頁');
};
```
