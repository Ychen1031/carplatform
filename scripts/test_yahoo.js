const https = require('https');

function fetchTextWithRedirects(url, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    try {
      const req = https.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
        },
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirectsLeft > 0) {
          res.resume();
          const nextUrl = new URL(res.headers.location, url).toString();
          resolve(fetchTextWithRedirects(nextUrl, redirectsLeft - 1));
          return;
        }

        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => resolve({ statusCode: res.statusCode, body }));
      });

      req.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}

function stripHtml(value = '') {
  return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}

function extractXmlTag(block, tagName) {
  const normal = new RegExp(`<${tagName}(?: [^>]*)?>([\s\S]*?)<\/${tagName}>`, 'i');
  let match = block.match(normal);
  if (match) return stripHtml(match[1]);

  // Fallback: allow whitespace/newline inside closing tag letters (e.g. </tit\nle>)
  const chars = tagName.split('').map((c) => `\s*${c}`).join('');
  const flex = new RegExp(`<${tagName}(?: [^>]*)?>([\s\S]*?)<\/?${chars}\s*>`, 'i');
  match = block.match(flex);
  return match ? stripHtml(match[1]) : '';
}
// 另外提供簡易且容錯的 tag 抽取（只取第一個 '<' 之前的文字），用於非常破碎的 XML
function extractXmlTagLoose(block, tagName) {
  const m = block.match(new RegExp(`<${tagName}(?: [^>]*)?>([^<]*)`, 'i'));
  return m ? stripHtml(m[1]) : '';
}

function parseRssItems(xml, maxItems = 10) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < maxItems) {
    const block = match[1];
    if (items.length === 0) {
      console.log('--- DEBUG first item raw block (200 chars) ---');
      console.log(block.slice(0, 200));
      console.log('title match:', extractXmlTag(block, 'title'));
      console.log('link match:', extractXmlTag(block, 'link'));
      console.log('pubDate match:', extractXmlTag(block, 'pubDate'));
      console.log('--- END DEBUG ---');
    }
    // 容錯：先用嚴格解析，若取不到就用寬鬆解析
    let title = extractXmlTag(block, 'title');
    if (!title) title = extractXmlTagLoose(block, 'title');
    let desc = extractXmlTag(block, 'description');
    if (!desc) desc = extractXmlTagLoose(block, 'description');
    let link = extractXmlTag(block, 'link');
    if (!link) link = extractXmlTagLoose(block, 'link');
    let pub = extractXmlTag(block, 'pubDate');
    if (!pub) pub = extractXmlTagLoose(block, 'pubDate');
    items.push({ title, summary: desc || title, link, date: pub });
  }
  return items;
}

async function test(query = '汽車') {
  try {
    const url = `https://news.search.yahoo.com/rss?p=${encodeURIComponent(query)}`;
    console.log('Fetching', url);
    const { statusCode, body } = await fetchTextWithRedirects(url);
    console.log('Status:', statusCode);
    if (statusCode < 200 || statusCode >= 300) {
      console.error('Bad status code', statusCode);
      return;
    }
    const items = parseRssItems(body, 8);
    console.log('Found', items.length, 'items');
    items.forEach((it, idx) => {
      console.log(`\n#${idx+1}: ${it.title}\nDate: ${it.date}\nLink: ${it.link}\nSummary: ${it.summary.slice(0,200)}\n`);
    });
  } catch (err) {
    console.error('Error fetching Yahoo RSS:', err.message);
  }
}

if (require.main === module) {
  const arg = process.argv[2] || '汽車';
  // 如果傳入的是完整 URL，直接使用它
  if (/^https?:\/\//i.test(arg)) {
    (async () => {
      try {
        const { statusCode, body } = await fetchTextWithRedirects(arg);
        if (statusCode < 200 || statusCode >= 300) {
          console.error('Bad status code', statusCode);
          return;
        }
        console.log('--- RAW SNIPPET ---');
        console.log(body.slice(0, 800));
        console.log('--- END SNIPPET ---');

        // Normalize: 將 tag 內的換行移除（有時 RSS 供應端會把 closing tag 換行或斷行，造成解析失敗）
        let normalized = body.replace(/<[^>]*>/g, (m) => m.replace(/\n/g, ''));

        const items = parseRssItems(normalized, 8);
        console.log('Found', items.length, 'items from', arg);
        items.forEach((it, idx) => {
          console.log(`\n#${idx+1}: ${it.title}\nDate: ${it.date}\nLink: ${it.link}\nSummary: ${it.summary.slice(0,200)}\n`);
        });
      } catch (err) {
        console.error('Error fetching URL:', err.message);
      }
    })();
  } else {
    test(arg);
  }
}
