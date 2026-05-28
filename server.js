const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const https = require('https');

const app = express();
const PORT = 3001;
// Google Apps Script Web App URL - 建議透過環境變數設定，避免硬編碼
const GOOGLE_SHEETS_APPS_SCRIPT_URL = process.env.GOOGLE_SHEETS_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwFJbwFLjEqvlVP32WrDMWitTTk6ZUERysE8rR_1SusTpyj1Rw-Rg6wSvVfbZ_DK9MNgA/exec';

// 中間件
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// 伺服器首頁，避免直接開啟 http://localhost:3001/ 時出現 Cannot GET /
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '好車平台後端 API 正常運作中'
  });
});

// 準備資料夾
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 初始化 SQLite 資料庫
const dbPath = path.join(dataDir, 'users.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      created_at TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      carType TEXT NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER,
      price REAL NOT NULL,
      mileage INTEGER,
      fuel TEXT,
      transmission TEXT,
      engine TEXT,
      type TEXT,
      city TEXT,
      condition TEXT,
      colors TEXT,
      features TEXT,
      description TEXT,
      seller TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      image TEXT,
      title TEXT,
      userId INTEGER,
      posted_at TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      phone TEXT,
      subject TEXT,
      message TEXT,
      userId INTEGER,
      created_at TEXT
    )
  `);
});

// 日誌目錄（保留原有功能）
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

function getTodayLogFile() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  return path.join(logsDir, `${year}-${month}-${date}.log`);
}

function formatLogLine(log) {
  const { time, level, module, message, data } = log;
  let line = `[${time}] [${level.toUpperCase()}] [${module}] ${message}`;
  if (data && Object.keys(data).length > 0) {
    line += ` | ${JSON.stringify(data)}`;
  }
  return line;
}

function postJsonToAppsScript(url, payload) {
  // 支援自動跟隨 3xx 重導向（最多 5 次）
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const maxRedirects = 5;

    const doRequest = (targetUrl, redirectsLeft) => {
      try {
        const parsed = new URL(targetUrl);
        const lib = parsed.protocol === 'http:' ? require('http') : https;

        const options = {
          hostname: parsed.hostname,
          path: parsed.pathname + (parsed.search || ''),
          port: parsed.port || (parsed.protocol === 'http:' ? 80 : 443),
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
          },
        };

        const req = lib.request(options, (res) => {
          let responseBody = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => { responseBody += chunk; });
          res.on('end', () => {
            // 若為重導向且還可重導向，則追蹤 Location
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirectsLeft > 0) {
              return doRequest(res.headers.location, redirectsLeft - 1);
            }
            resolve({ statusCode: res.statusCode, body: responseBody });
          });
        });

        req.on('error', (err) => {
          reject(err);
        });

        req.write(body);
        req.end();
      } catch (err) {
        reject(err);
      }
    };

    doRequest(url, maxRedirects);
  });
}

/**
 * 使用者註冊 API
 * POST /api/register
 * body: { email, password, name }
 */
app.post('/api/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: '缺少 email 或 password' });
  }

  db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: '資料庫錯誤', error: err.message });
    if (row) return res.status(400).json({ success: false, message: '此電子郵件已被註冊' });

    const createdAt = new Date().toISOString();

    const stmt = db.prepare('INSERT INTO users (email, password, name, created_at) VALUES (?, ?, ?, ?)');
    stmt.run([email, password, name || null, createdAt], function (insertErr) {
      if (insertErr) return res.status(500).json({ success: false, message: '建立使用者失敗', error: insertErr.message });

      return res.json({ success: true, user: { id: this.lastID, email, name: name || null, created_at: createdAt } });
    });
    stmt.finalize();
  });
});

/**
 * 使用者登入 API
 * POST /api/login
 * body: { email, password }
 */
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: '缺少 email 或 password' });
  }

  db.get('SELECT id, email, password, name FROM users WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: '資料庫錯誤', error: err.message });
    if (!row) return res.status(400).json({ success: false, message: '帳號不存在或密碼錯誤' });

    if (password !== row.password) {
      return res.status(400).json({ success: false, message: '帳號不存在或密碼錯誤' });
    }

    return res.json({ success: true, user: { id: row.id, email: row.email, name: row.name } });
  });
});

/**
 * 使用者資料更新 API
 * PUT /api/users/:id
 * body: { email, name, password? }
 */
app.put('/api/users/:id', (req, res) => {
  const userId = Number(req.params.id);
  const { email, name, password } = req.body;

  if (!userId || Number.isNaN(userId)) {
    return res.status(400).json({ success: false, message: '無效的使用者 ID' });
  }

  if (!email) {
    return res.status(400).json({ success: false, message: '電子郵件為必填' });
  }

  db.get('SELECT id FROM users WHERE id = ?', [userId], (findErr, userRow) => {
    if (findErr) {
      return res.status(500).json({ success: false, message: '資料庫錯誤', error: findErr.message });
    }
    if (!userRow) {
      return res.status(404).json({ success: false, message: '使用者不存在' });
    }

    db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId], (emailErr, dupRow) => {
      if (emailErr) {
        return res.status(500).json({ success: false, message: '資料庫錯誤', error: emailErr.message });
      }
      if (dupRow) {
        return res.status(400).json({ success: false, message: '此電子郵件已被使用' });
      }

      const hasPassword = typeof password === 'string' && password.trim().length > 0;

      if (hasPassword) {
        db.run(
          'UPDATE users SET email = ?, name = ?, password = ? WHERE id = ?',
          [email, name || null, password, userId],
          function updateWithPassword(updateErr) {
            if (updateErr) {
              return res.status(500).json({ success: false, message: '更新失敗', error: updateErr.message });
            }
            return res.json({ success: true, user: { id: userId, email, name: name || null } });
          }
        );
      } else {
        db.run(
          'UPDATE users SET email = ?, name = ? WHERE id = ?',
          [email, name || null, userId],
          function updateWithoutPassword(updateErr) {
            if (updateErr) {
              return res.status(500).json({ success: false, message: '更新失敗', error: updateErr.message });
            }
            return res.json({ success: true, user: { id: userId, email, name: name || null } });
          }
        );
      }
    });
  });
});

/**
 * 刪除使用者 API
 * DELETE /api/users/:id
 */
app.delete('/api/users/:id', (req, res) => {
  const userId = Number(req.params.id);

  if (!userId || Number.isNaN(userId)) {
    return res.status(400).json({ success: false, message: '無效的使用者 ID' });
  }

  db.get('SELECT id FROM users WHERE id = ?', [userId], (findErr, userRow) => {
    if (findErr) {
      return res.status(500).json({ success: false, message: '資料庫錯誤', error: findErr.message });
    }
    if (!userRow) {
      return res.status(404).json({ success: false, message: '使用者不存在' });
    }

    db.serialize(() => {
      db.run('DELETE FROM cars WHERE userId = ?', [userId], (carsErr) => {
        if (carsErr) {
          return res.status(500).json({ success: false, message: '刪除使用者車源失敗', error: carsErr.message });
        }

        db.run('DELETE FROM users WHERE id = ?', [userId], (deleteErr) => {
          if (deleteErr) {
            return res.status(500).json({ success: false, message: '刪除使用者失敗', error: deleteErr.message });
          }

          return res.json({ success: true, message: '使用者已刪除', deletedUserId: userId });
        });
      });
    });
  });
});

/**
 * 聯絡訊息 API
 * POST /api/messages
 * body: { name, email, phone, subject, message, userId? }
 */
app.post('/api/messages', (req, res) => {
  const { name, email, phone, subject, message, userId } = req.body;
  if (!name || !email || !phone || !subject || !message) {
    return res.status(400).json({ success: false, message: '缺少必填欄位' });
  }

  const createdAt = new Date().toISOString();
  const payload = { name, email, phone, subject, message, userId, created_at: createdAt };

  postJsonToAppsScript(GOOGLE_SHEETS_APPS_SCRIPT_URL, payload)
    .then(({ statusCode, body }) => {
      // 記錄 Apps Script 的回應與請求內容，方便偵錯
      try {
        const asLogFile = path.join(logsDir, 'appsscript.log');
        const logEntry = `[${new Date().toISOString()}] REQUEST_TO_APPS_SCRIPT url=${GOOGLE_SHEETS_APPS_SCRIPT_URL} status=${statusCode} body=${body} payload=${JSON.stringify(payload)}\n`;
        fs.appendFileSync(asLogFile, logEntry, 'utf8');
      } catch (logErr) {
        console.error('無法寫入 appsscript.log', logErr);
      }

      let parsed = null;
      try {
        parsed = body ? JSON.parse(body) : null;
      } catch (parseErr) {
        parsed = null;
      }

      const appsScriptOk = statusCode >= 200 && statusCode < 400 && (!parsed || parsed.success !== false);

      if (!appsScriptOk) {
        // 無法寫入 Google 試算表，作為備援先寫入本地 messages 資料表
        const stmt = db.prepare('INSERT INTO messages (name,email,phone,subject,message,userId,created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
        stmt.run([name, email, phone, subject, message, userId || null, createdAt], function (insertErr) {
          if (insertErr) {
            return res.status(500).json({
              success: false,
              message: '寫入 Google 試算表失敗，且無法寫入本機備援資料庫',
              googleSheets: { statusCode, body },
              error: insertErr.message,
              created_at: createdAt,
            });
          }

          return res.json({
            success: true,
            message: '訊息已儲存到本機資料庫（Google 試算表寫入失敗）',
            googleSheets: { statusCode, body },
            created_at: createdAt,
            local_id: this.lastID,
          });
        });
        stmt.finalize();
        return;
      }

      return res.json({ success: true, message: '訊息已送出並寫入 Google 試算表', created_at: createdAt });
    })
    .catch((err) => {
      return res.status(502).json({
        success: false,
        message: '寫入 Google 試算表失敗',
        appsScriptError: err.message,
        created_at: createdAt,
      });
    });
});

/**
 * 取得所有聯絡訊息
 * GET /api/messages
 */
app.get('/api/messages', (req, res) => {
  res.json({
    success: true,
    message: '聯絡訊息已改存 Google 試算表，請從試算表或 Apps Script 讀取。',
    messages: [],
  });
});

// 管理用：取得本機備援的聯絡訊息
app.get('/api/messages/local', (req, res) => {
  db.all('SELECT id,name,email,phone,subject,message,userId,created_at FROM messages ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: '讀取本機訊息失敗', error: err.message });
    return res.json({ success: true, messages: rows });
  });
});

/**
 * 車輛刊登 API
 * POST /api/cars
 * body: { carType, brand, model, year, price, mileage, fuel, transmission, engine, type, city, condition, colors, features, description, seller, phone, email, image, title, userId }
 */
app.post('/api/cars', (req, res) => {
  const {
    carType, brand, model, year, price, mileage, fuel, transmission, engine, type, city, condition,
    colors, features, description, seller, phone, email, image, title, userId
  } = req.body;

  if (!brand || !model || !price || !seller || !phone) {
    return res.status(400).json({ success: false, message: '缺少必填欄位' });
  }

  const postedAt = new Date().toISOString();
  const colorsStr = Array.isArray(colors) ? JSON.stringify(colors) : colors;
  const featuresStr = Array.isArray(features) ? JSON.stringify(features) : features;

  const stmt = db.prepare(
    `INSERT INTO cars (carType, brand, model, year, price, mileage, fuel, transmission, engine, type, city, condition, colors, features, description, seller, phone, email, image, title, userId, posted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  stmt.run(
    [carType, brand, model, year, price, mileage, fuel, transmission, engine, type, city, condition, colorsStr, featuresStr, description, seller, phone, email, image, title, userId, postedAt],
    function (err) {
      if (err) {
        return res.status(500).json({ success: false, message: '保存車輛失敗', error: err.message });
      }
      res.json({
        success: true,
        message: '車輛刊登成功',
        car: {
          id: this.lastID,
          carType, brand, model, year, price, mileage, fuel, transmission, engine, type, city, condition,
          colors, features, description, seller, phone, email, image, title, userId, posted_at: postedAt
        }
      });
    }
  );
  stmt.finalize();
});

/**
 * 獲取所有已刊登的車輛 API
 * GET /api/cars
 */
app.get('/api/cars', (req, res) => {
  db.all('SELECT * FROM cars ORDER BY posted_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: '獲取車輛失敗', error: err.message });
    }

    const cars = rows.map(car => ({
      ...car,
      colors: car.colors ? JSON.parse(car.colors) : [],
      features: car.features ? JSON.parse(car.features) : []
    }));

    res.json({
      success: true,
      cars
    });
  });
});

/**
 * 獲取用戶已發佈的車源列表 API
 * GET /api/users/:userId/cars
 */
app.get('/api/users/:userId/cars', (req, res) => {
  const { userId } = req.params;

  db.all('SELECT * FROM cars WHERE userId = ? ORDER BY posted_at DESC', [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: '獲取使用者車輛失敗', error: err.message });
    }

    const cars = rows.map(car => ({
      ...car,
      colors: car.colors ? JSON.parse(car.colors) : [],
      features: car.features ? JSON.parse(car.features) : []
    }));

    res.json({
      success: true,
      cars
    });
  });
});

/**
 * 獲取單個車輛詳情 API
 * GET /api/cars/:carId
 */
app.get('/api/cars/:carId', (req, res) => {
  const { carId } = req.params;

  db.get('SELECT * FROM cars WHERE id = ?', [carId], (err, car) => {
    if (err) {
      return res.status(500).json({ success: false, message: '獲取車輛失敗', error: err.message });
    }

    if (!car) {
      return res.status(404).json({ success: false, message: '車輛不存在' });
    }

    const carData = {
      ...car,
      colors: car.colors ? JSON.parse(car.colors) : [],
      features: car.features ? JSON.parse(car.features) : []
    };

    res.json({
      success: true,
      car: carData
    });
  });
});

/**
 * 編輯車輛資訊 API
 * PUT /api/cars/:carId
 * body: { carType, brand, model, year, price, mileage, fuel, transmission, engine, type, city, condition, colors, features, description, seller, phone, email, image, title }
 */
app.put('/api/cars/:carId', (req, res) => {
  const { carId } = req.params;
  const {
    carType, brand, model, year, price, mileage, fuel, transmission, engine, type, city, condition,
    colors, features, description, seller, phone, email, image, title
  } = req.body;

  // 先檢查車輛是否存在
  db.get('SELECT id, userId FROM cars WHERE id = ?', [carId], (err, car) => {
    if (err) {
      return res.status(500).json({ success: false, message: '查詢車輛失敗', error: err.message });
    }

    if (!car) {
      return res.status(404).json({ success: false, message: '車輛不存在' });
    }

    const colorsStr = Array.isArray(colors) ? JSON.stringify(colors) : colors;
    const featuresStr = Array.isArray(features) ? JSON.stringify(features) : features;

    const stmt = db.prepare(
      `UPDATE cars SET carType=?, brand=?, model=?, year=?, price=?, mileage=?, fuel=?, transmission=?, engine=?, type=?, city=?, condition=?, colors=?, features=?, description=?, seller=?, phone=?, email=?, image=?, title=? WHERE id=?`
    );

    stmt.run(
      [carType, brand, model, year, price, mileage, fuel, transmission, engine, type, city, condition, colorsStr, featuresStr, description, seller, phone, email, image, title, carId],
      (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ success: false, message: '更新車輛失敗', error: updateErr.message });
        }

        res.json({
          success: true,
          message: '車輛資訊已更新',
          car: {
            id: parseInt(carId),
            carType, brand, model, year, price, mileage, fuel, transmission, engine, type, city, condition,
            colors, features, description, seller, phone, email, image, title, userId: car.userId
          }
        });
      }
    );
    stmt.finalize();
  });
});

/**
 * 刪除車輛 API
 * DELETE /api/cars/:carId
 */
app.delete('/api/cars/:carId', (req, res) => {
  const { carId } = req.params;

  db.get('SELECT id FROM cars WHERE id = ?', [carId], (err, car) => {
    if (err) {
      return res.status(500).json({ success: false, message: '查詢車輛失敗', error: err.message });
    }

    if (!car) {
      return res.status(404).json({ success: false, message: '車輛不存在' });
    }

    db.run('DELETE FROM cars WHERE id = ?', [carId], (deleteErr) => {
      if (deleteErr) {
        return res.status(500).json({ success: false, message: '刪除車輛失敗', error: deleteErr.message });
      }

      res.json({
        success: true,
        message: '車輛已刪除',
        deletedCarId: parseInt(carId)
      });
    });
  });
});

/**
 * API 端點：接收日誌
 */
app.post('/api/logs', (req, res) => {
  try {
    const logs = req.body;

    if (!Array.isArray(logs) || logs.length === 0) {
      return res.json({ success: false, message: '無有效的日誌' });
    }

    const logFile = getTodayLogFile();

    // 將日誌寫入檔案
    const logLines = logs.map(formatLogLine).join('\n') + '\n';

    fs.appendFileSync(logFile, logLines, 'utf8');

    res.json({
      success: true,
      message: `已保存 ${logs.length} 條日誌`,
      file: logFile
    });
  } catch (error) {
    console.error('保存日誌錯誤:', error);
    res.status(500).json({
      success: false,
      message: '保存日誌失敗',
      error: error.message
    });
  }
});

/**
 * API 端點：獲取日誌列表
 */
app.get('/api/logs', (req, res) => {
  try {
    const files = fs.readdirSync(logsDir)
      .filter(file => file.endsWith('.log'))
      .sort()
      .reverse();

    res.json({
      success: true,
      files,
      directory: logsDir
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '獲取日誌列表失敗',
      error: error.message
    });
  }
});

/**
 * API 端點：獲取特定日期的日誌內容
 */
app.get('/api/logs/:filename', (req, res) => {
  try {
    const filename = req.params.filename;

    // 防止目錄穿越攻擊
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ success: false, message: '無效的檔名' });
    }

    const filepath = path.join(logsDir, filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ success: false, message: '檔案不存在' });
    }

    const content = fs.readFileSync(filepath, 'utf8');
    res.json({
      success: true,
      filename,
      content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '讀取日誌失敗',
      error: error.message
    });
  }
});

/**
 * 啟動服務器
 */
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
