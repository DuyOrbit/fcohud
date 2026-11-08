const http = require('http');
const path = require('path');
const fs = require('fs');
const express = require('express');
const { WebSocketServer, WebSocket } = require('ws');

const app = express();

// Trust reverse proxy (Render, Cloudflare, etc.) so protocol & headers are correctly resolved
app.set('trust proxy', 1);

const server = http.createServer(app);

// Optimize keep-alive timeouts for cloud load balancers (Render proxy timeout is 60s)
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

const wss = new WebSocketServer({ server });

// Render injects PORT; fallback to 10000 (Render default) or 3000 locally
const PORT = parseInt(process.env.PORT, 10) || (process.env.NODE_ENV === 'production' ? 10000 : 3000);
const ADMIN_PIN = process.env.ADMIN_PIN || '';
const DATA_FILE = path.join(__dirname, 'hud-data.json');

const defaultState = {
  activeScene: "ingame", // "intro", "ingame", "none"
  introState: {
    isPlaying: false,
    step: 0 // 0: hidden, 1: logo, 2: banner, 3: cutouts
  },
  tournament: {
    title: "VIETNAM PRO LEAGUE",
    season: "SUMMER 2026",
    stage: "FINAL",
    game: "GAME 3",
    logoType: "image", // "image" or "video"
    logoUrl: "assets/images/fvpl-logo.svg",
    logoScale: 100,
    logoOffsetY: 0
  },
  player1: {
    name: "NKxLHAT",
    team: "NK",
    color: "#ff2244", // Red jersey / border
    photo: "assets/images/p1-cutout.svg",
    scale: 100,
    offsetX: 0,
    offsetY: 0,
    vdoNinjaUrl: "https://vdo.ninja/?view=samplep1&cleanviewer=1"
  },
  player2: {
    name: "TAGxLieTa",
    team: "TAG",
    color: "#ff7700", // Orange jersey / border
    photo: "assets/images/p2-cutout.svg",
    scale: 100,
    offsetX: 0,
    offsetY: 0,
    vdoNinjaUrl: "https://vdo.ninja/?view=samplep2&cleanviewer=1"
  },
  camControls: {
    isDimmed: false,      // Opacity ~30%
    isHidden: false,      // Fly down off-screen
    isSwapped: false      // Swap Left <-> Right
  },
  goalEffect: {
    active: false,
    scorer: 1,            // 1 or 2
    title: "VÀO!",
    playerName: "NKxLHAT",
    color: "#ff2244"
  }
};

let currentState = { ...defaultState };

// Load persistent state
if (fs.existsSync(DATA_FILE)) {
  try {
    let raw = fs.readFileSync(DATA_FILE, 'utf-8');
    if (raw.charCodeAt(0) === 0xFEFF) {
      raw = raw.slice(1);
    }
    const saved = JSON.parse(raw);
    currentState = { ...defaultState, ...saved };
  } catch (err) {
    console.error('Failed to parse hud-data.json, using defaults:', err);
  }
}

function saveState() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(currentState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save state:', err);
  }
}

app.use(express.json({ limit: '25mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Health check for Render / Uptime monitors (prevents spin down)
app.get('/healthz', (req, res) => res.status(200).send('OK'));
app.get('/health', (req, res) => res.status(200).send('OK'));

// Explicit root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Verify admin pin
app.get('/api/pin-required', (req, res) => {
  res.json({ required: !!ADMIN_PIN });
});
app.post('/api/verify-pin', (req, res) => {
  const { pin } = req.body;
  if (!ADMIN_PIN || pin === ADMIN_PIN) {
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, error: 'Mã PIN không đúng' });
});

// Friendly routes
app.get('/control', (req, res) => res.sendFile(path.join(__dirname, 'public', 'control.html')));
app.get('/overlay', (req, res) => res.sendFile(path.join(__dirname, 'public', 'overlay.html')));
app.get('/overlay/intro', (req, res) => res.sendFile(path.join(__dirname, 'public', 'overlay.html')));
app.get('/overlay/ingame', (req, res) => res.sendFile(path.join(__dirname, 'public', 'overlay.html')));

app.get('/api/state', (req, res) => res.json(currentState));
app.post('/api/state', (req, res) => {
  currentState = req.body;
  saveState();
  broadcast({ type: 'STATE_UPDATE', payload: currentState });
  res.json({ success: true, state: currentState });
});

// Upload endpoint for player cutouts & tournament logo (image or video)
app.post('/api/upload', (req, res) => {
  try {
    const { player, dataUrl, filename } = req.body;
    if (!dataUrl) return res.status(400).json({ error: 'No data' });
    
    // Determine mime & extension
    let ext = 'png';
    const mimeMatch = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
    const mime = mimeMatch ? mimeMatch[1] : '';
    if (mime.includes('video/mp4') || (filename && filename.endsWith('.mp4'))) ext = 'mp4';
    else if (mime.includes('video/webm') || (filename && filename.endsWith('.webm'))) ext = 'webm';
    else if (mime.includes('image/gif')) ext = 'gif';
    else if (mime.includes('image/jpeg')) ext = 'jpg';
    else if (mime.includes('image/webp')) ext = 'webp';
    else if (mime.includes('image/svg')) ext = 'svg';

    const base64Data = dataUrl.replace(/^data:[a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+;base64,/, '');
    const uploadDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    
    const fileName = `${player}-${Date.now()}.${ext}`;
    fs.writeFileSync(path.join(uploadDir, fileName), base64Data, 'base64');
    const fileUrl = `uploads/${fileName}`;

    if (player === 'p1') {
      currentState.player1.photo = fileUrl;
    } else if (player === 'p2') {
      currentState.player2.photo = fileUrl;
    } else if (player === 'logo') {
      currentState.tournament.logoUrl = fileUrl;
      currentState.tournament.logoType = (ext === 'mp4' || ext === 'webm') ? 'video' : 'image';
    }

    saveState();
    broadcast({ type: 'STATE_UPDATE', payload: currentState });
    res.json({ success: true, url: fileUrl, type: currentState.tournament.logoType });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

function broadcast(msg, sender = null) {
  const data = JSON.stringify(msg);
  wss.clients.forEach(client => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

function heartbeat() {
  this.isAlive = true;
}

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', heartbeat);
  ws.send(JSON.stringify({ type: 'STATE_INIT', payload: currentState }));

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === 'PING') {
        return ws.send(JSON.stringify({ type: 'PONG' }));
      }
      if (msg.type === 'UPDATE_STATE') {
        currentState = msg.payload;
        saveState();
        broadcast({ type: 'STATE_UPDATE', payload: currentState }, ws);
      } else if (msg.type === 'TRIGGER_GOAL') {
        const scorer = msg.scorer || 1;
        const player = scorer === 1 ? currentState.player1 : currentState.player2;
        const playerName = msg.playerName || player.name;
        const color = msg.color || player.color;
        
        currentState.goalEffect = {
          active: true,
          scorer: scorer,
          title: "VÀO!",
          playerName: playerName,
          color: color
        };
        saveState();
        broadcast({ type: 'STATE_UPDATE', payload: currentState });
      } else if (msg.type === 'RESET_GOAL') {
        currentState.goalEffect.active = false;
        saveState();
        broadcast({ type: 'STATE_UPDATE', payload: currentState });
      } else if (msg.type === 'TRIGGER_INTRO') {
        currentState.activeScene = "intro";
        currentState.introState = { isPlaying: true, step: 1 };
        saveState();
        broadcast({ type: 'STATE_UPDATE', payload: currentState });
      }
    } catch (err) {
      console.error('WS Error:', err);
    }
  });
});

// Cloud WebSocket Heartbeat: ping every 25s so cloud proxy does not close idle socket
const pingInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 25000);

wss.on('close', () => {
  clearInterval(pingInterval);
});

server.on('error', (err) => {
  console.error('Fatal Server Error:', err);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🏆 FC ONLINE FVPL TOURNAMENT HUD SYSTEM`);
  console.log(`> Control Panel:   http://localhost:${PORT}/control`);
  console.log(`> Master Overlay:  http://localhost:${PORT}/overlay`);
  console.log(`> Health Check:    http://localhost:${PORT}/healthz`);
  console.log(`=======================================================`);
});
