/**
 * FC Online FVPL HUD Real-time Sync Client
 * Supports WebSocket + BroadcastChannel + LocalStorage
 */

class HudSync {
  constructor() {
    this.state = null;
    this.listeners = [];
    this.ws = null;
    this.bc = null;
    this.reconnectTimer = null;

    this.init();
  }

  init() {
    if (typeof BroadcastChannel !== 'undefined') {
      this.bc = new BroadcastChannel('fconline_fvpl_hud');
      this.bc.onmessage = (e) => {
        if (e.data && e.data.type === 'STATE_UPDATE') {
          this.setState(e.data.payload, false);
        }
      };
    }
    this.connectWs();
  }

  connectWs() {
    const loc = window.location;
    if (loc.protocol !== 'http:' && loc.protocol !== 'https:') {
      console.warn('Running outside HTTP/HTTPS, using BroadcastChannel.');
      this.loadStorage();
      return;
    }

    const wsUrl = `${loc.protocol === 'https:' ? 'wss:' : 'ws:'}//${loc.host}`;
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[HudSync] Connected to WS Server');
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'PING' }));
          }
        }, 20000);
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'PONG') return;
          if (msg.type === 'STATE_INIT' || msg.type === 'STATE_UPDATE') {
            this.setState(msg.payload, false);
          }
        } catch (e) {
          console.error('[HudSync] Parse error:', e);
        }
      };

      this.ws.onclose = () => {
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.ws.close();
      };
    } catch (e) {
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (!this.reconnectTimer) {
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        this.connectWs();
      }, 1500);
    }
  }

  loadStorage() {
    try {
      const data = localStorage.getItem('fconline_fvpl_state');
      if (data) this.setState(JSON.parse(data), false);
    } catch (e) {}
  }

  onStateChange(cb) {
    this.listeners.push(cb);
    if (this.state) cb(this.state);
  }

  setState(newState, broadcast = true) {
    this.state = newState;
    try {
      localStorage.setItem('fconline_fvpl_state', JSON.stringify(newState));
    } catch (e) {}

    this.listeners.forEach(fn => {
      try { fn(this.state); } catch (err) { console.error(err); }
    });

    if (broadcast) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'UPDATE_STATE', payload: this.state }));
      }
      if (this.bc) {
        this.bc.postMessage({ type: 'STATE_UPDATE', payload: this.state });
      }
    }
  }

  updateState(fn) {
    if (!this.state) return;
    const copy = JSON.parse(JSON.stringify(this.state));
    fn(copy);
    this.setState(copy, true);
  }

  triggerGoal(scorer, customName = null, customColor = null) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ 
        type: 'TRIGGER_GOAL', 
        scorer: scorer, 
        playerName: customName, 
        color: customColor 
      }));
    } else {
      this.updateState(s => {
        const player = scorer === 1 ? s.player1 : s.player2;
        s.goalEffect = {
          active: true,
          scorer: scorer,
          title: "VÀO!",
          playerName: customName || player.name,
          color: customColor || player.color
        };
      });
    }
  }

  resetGoal() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'RESET_GOAL' }));
    } else {
      this.updateState(s => { s.goalEffect.active = false; });
    }
  }

  triggerIntro() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'TRIGGER_INTRO' }));
    } else {
      this.updateState(s => {
        s.activeScene = "intro";
        s.introState = { isPlaying: true, step: 1 };
      });
    }
  }

  setScene(scene) {
    this.updateState(s => {
      s.activeScene = scene;
      if (scene !== 'intro') s.introState.isPlaying = false;
    });
  }

  toggleDim() {
    this.updateState(s => {
      s.camControls.isDimmed = !s.camControls.isDimmed;
    });
  }

  toggleHide() {
    this.updateState(s => {
      s.camControls.isHidden = !s.camControls.isHidden;
    });
  }

  toggleSwap() {
    this.updateState(s => {
      s.camControls.isSwapped = !s.camControls.isSwapped;
    });
  }
}

window.hudSync = new HudSync();

