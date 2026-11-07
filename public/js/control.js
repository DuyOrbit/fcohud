/**
 * Controller Dashboard Logic for FC Online FVPL HUD
 */

document.addEventListener('DOMContentLoaded', () => {
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');

  // Scene Buttons
  const btnSceneIntro = document.getElementById('btnSceneIntro');
  const btnSceneIngame = document.getElementById('btnSceneIngame');
  const btnSceneNone = document.getElementById('btnSceneNone');

  // Cam Action Buttons
  const btnToggleDim = document.getElementById('btnToggleDim');
  const btnToggleHide = document.getElementById('btnToggleHide');
  const btnToggleSwap = document.getElementById('btnToggleSwap');

  // Goal Buttons
  const btnGoalP1 = document.getElementById('btnGoalP1');
  const btnGoalP2 = document.getElementById('btnGoalP2');
  const labelGoalP1 = document.getElementById('labelGoalP1');
  const labelGoalP2 = document.getElementById('labelGoalP2');
  const btnResetGoal = document.getElementById('btnResetGoal');

  // Inputs
  const inputP1Name = document.getElementById('inputP1Name');
  const inputP1Team = document.getElementById('inputP1Team');
  const inputP1Color = document.getElementById('inputP1Color');
  const textP1Color = document.getElementById('textP1Color');
  const inputP1Vdo = document.getElementById('inputP1Vdo');

  const inputP2Name = document.getElementById('inputP2Name');
  const inputP2Team = document.getElementById('inputP2Team');
  const inputP2Color = document.getElementById('inputP2Color');
  const textP2Color = document.getElementById('textP2Color');
  const inputP2Vdo = document.getElementById('inputP2Vdo');

  const inputTourStage = document.getElementById('inputTourStage');
  const inputTourGame = document.getElementById('inputTourGame');

  const inputP1PhotoFile = document.getElementById('inputP1PhotoFile');
  const inputP2PhotoFile = document.getElementById('inputP2PhotoFile');

  // Fine-tuning Controls (P1, P2, Logo)
  const inputP1Scale = document.getElementById('inputP1Scale');
  const inputP1OffsetX = document.getElementById('inputP1OffsetX');
  const inputP1OffsetY = document.getElementById('inputP1OffsetY');

  const inputP2Scale = document.getElementById('inputP2Scale');
  const inputP2OffsetX = document.getElementById('inputP2OffsetX');
  const inputP2OffsetY = document.getElementById('inputP2OffsetY');

  const inputTourLogoFile = document.getElementById('inputTourLogoFile');
  const inputTourLogoScale = document.getElementById('inputTourLogoScale');
  const inputTourLogoOffsetY = document.getElementById('inputTourLogoOffsetY');

  const btnSaveConfig = document.getElementById('btnSaveConfig');
  const btnOpenOverlay = document.getElementById('btnOpenOverlay');

  function render(state) {
    statusDot.style.background = '#00ff88';
    statusText.textContent = 'Đã kết nối (Realtime)';

    // Scene active status
    btnSceneIntro.classList.toggle('active-scene', state.activeScene === 'intro');
    btnSceneIngame.classList.toggle('active-scene', state.activeScene === 'ingame');
    btnSceneNone.classList.toggle('active-scene', state.activeScene === 'none');

    // Cam controls toggle styling
    btnToggleDim.classList.toggle('active-toggle', !!state.camControls.isDimmed);
    btnToggleHide.classList.toggle('active-toggle', !!state.camControls.isHidden);
    btnToggleSwap.classList.toggle('active-toggle', !!state.camControls.isSwapped);

    // Goal buttons label & color
    labelGoalP1.textContent = `${state.player1.name} (Phím G)`;
    labelGoalP2.textContent = `${state.player2.name} (Phím J)`;
    btnGoalP1.style.background = `linear-gradient(135deg, ${state.player1.color} 0%, #330009 100%)`;
    btnGoalP2.style.background = `linear-gradient(135deg, ${state.player2.color} 0%, #331500 100%)`;

    // Only update inputs if not actively typing
    if (document.activeElement !== inputP1Name) inputP1Name.value = state.player1.name;
    if (document.activeElement !== inputP1Team) inputP1Team.value = state.player1.team;
    if (document.activeElement !== inputP1Color) {
      inputP1Color.value = state.player1.color;
      textP1Color.textContent = state.player1.color;
    }
    if (document.activeElement !== inputP1Vdo) inputP1Vdo.value = state.player1.vdoNinjaUrl;

    if (document.activeElement !== inputP2Name) inputP2Name.value = state.player2.name;
    if (document.activeElement !== inputP2Team) inputP2Team.value = state.player2.team;
    if (document.activeElement !== inputP2Color) {
      inputP2Color.value = state.player2.color;
      textP2Color.textContent = state.player2.color;
    }
    if (document.activeElement !== inputP2Vdo) inputP2Vdo.value = state.player2.vdoNinjaUrl;

    if (document.activeElement !== inputTourStage) inputTourStage.value = state.tournament.stage;
    if (document.activeElement !== inputTourGame) inputTourGame.value = state.tournament.game;

    // Cutout & Logo Tuning Values
    if (document.activeElement !== inputP1Scale) inputP1Scale.value = state.player1.scale || 100;
    if (document.activeElement !== inputP1OffsetX) inputP1OffsetX.value = state.player1.offsetX || 0;
    if (document.activeElement !== inputP1OffsetY) inputP1OffsetY.value = state.player1.offsetY || 0;

    if (document.activeElement !== inputP2Scale) inputP2Scale.value = state.player2.scale || 100;
    if (document.activeElement !== inputP2OffsetX) inputP2OffsetX.value = state.player2.offsetX || 0;
    if (document.activeElement !== inputP2OffsetY) inputP2OffsetY.value = state.player2.offsetY || 0;

    if (document.activeElement !== inputTourLogoScale) inputTourLogoScale.value = state.tournament.logoScale || 100;
    if (document.activeElement !== inputTourLogoOffsetY) inputTourLogoOffsetY.value = state.tournament.logoOffsetY || 0;
  }

  window.hudSync.onStateChange(render);

  // Live tuning input listeners (Instantly preview changes in overlay!)
  [inputP1Scale, inputP1OffsetX, inputP1OffsetY].forEach(el => {
    el.addEventListener('input', () => {
      window.hudSync.updateState(s => {
        s.player1.scale = parseInt(inputP1Scale.value) || 100;
        s.player1.offsetX = parseInt(inputP1OffsetX.value) || 0;
        s.player1.offsetY = parseInt(inputP1OffsetY.value) || 0;
      });
    });
  });

  [inputP2Scale, inputP2OffsetX, inputP2OffsetY].forEach(el => {
    el.addEventListener('input', () => {
      window.hudSync.updateState(s => {
        s.player2.scale = parseInt(inputP2Scale.value) || 100;
        s.player2.offsetX = parseInt(inputP2OffsetX.value) || 0;
        s.player2.offsetY = parseInt(inputP2OffsetY.value) || 0;
      });
    });
  });

  [inputTourLogoScale, inputTourLogoOffsetY].forEach(el => {
    el.addEventListener('input', () => {
      window.hudSync.updateState(s => {
        s.tournament.logoScale = parseInt(inputTourLogoScale.value) || 100;
        s.tournament.logoOffsetY = parseInt(inputTourLogoOffsetY.value) || 0;
      });
    });
  });

  // Color picker live text & style update
  inputP1Color.addEventListener('input', () => {
    textP1Color.textContent = inputP1Color.value;
    btnGoalP1.style.background = `linear-gradient(135deg, ${inputP1Color.value} 0%, #330009 100%)`;
    window.hudSync.updateState(s => { s.player1.color = inputP1Color.value; });
  });
  inputP2Color.addEventListener('input', () => {
    textP2Color.textContent = inputP2Color.value;
    btnGoalP2.style.background = `linear-gradient(135deg, ${inputP2Color.value} 0%, #331500 100%)`;
    window.hudSync.updateState(s => { s.player2.color = inputP2Color.value; });
  });

  // Live player name updates
  inputP1Name.addEventListener('input', () => {
    labelGoalP1.textContent = `${inputP1Name.value || 'VĐV 1'} (Phím G)`;
    window.hudSync.updateState(s => { s.player1.name = inputP1Name.value.trim() || 'VĐV 1'; });
  });
  inputP2Name.addEventListener('input', () => {
    labelGoalP2.textContent = `${inputP2Name.value || 'VĐV 2'} (Phím J)`;
    window.hudSync.updateState(s => { s.player2.name = inputP2Name.value.trim() || 'VĐV 2'; });
  });

  // Scene triggers
  btnSceneIntro.onclick = () => {
    window.hudSync.triggerIntro();
  };

  btnSceneIngame.onclick = () => {
    window.hudSync.setScene('ingame');
  };

  btnSceneNone.onclick = () => {
    window.hudSync.setScene('none');
  };

  // Cam controls
  btnToggleDim.onclick = () => window.hudSync.toggleDim();
  btnToggleHide.onclick = () => window.hudSync.toggleHide();
  btnToggleSwap.onclick = () => window.hudSync.toggleSwap();

  // Goal triggers with live name and color
  btnGoalP1.onclick = () => {
    window.hudSync.triggerGoal(1, inputP1Name.value.trim() || 'VĐV 1', inputP1Color.value);
  };
  btnGoalP2.onclick = () => {
    window.hudSync.triggerGoal(2, inputP2Name.value.trim() || 'VĐV 2', inputP2Color.value);
  };
  btnResetGoal.onclick = () => window.hudSync.resetGoal();

  // File Upload Handlers (Uploads PNG and updates server)
  if (inputP1PhotoFile) {
    inputP1PhotoFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const dataUrl = event.target.result;
          try {
            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ player: 'p1', dataUrl })
            });
            const data = await res.json();
            if (data.success) {
              alert('Đã cập nhật ảnh PNG thật của VĐV 1 thành công!');
            }
          } catch (err) {
            console.error('Upload error:', err);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (inputP2PhotoFile) {
    inputP2PhotoFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const dataUrl = event.target.result;
          try {
            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ player: 'p2', dataUrl })
            });
            const data = await res.json();
            if (data.success) {
              alert('Đã cập nhật ảnh PNG thật của VĐV 2 thành công!');
            }
          } catch (err) {
            console.error('Upload error:', err);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Upload Tournament Logo (Image or Video)
  if (inputTourLogoFile) {
    inputTourLogoFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const dataUrl = event.target.result;
          try {
            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ player: 'logo', dataUrl, filename: file.name })
            });
            const data = await res.json();
            if (data.success) {
              alert(`Đã cập nhật Logo giải đấu thành công! (Loại: ${data.type === 'video' ? 'Video Animation' : 'Ảnh tĩnh'})`);
            }
          } catch (err) {
            console.error('Logo upload error:', err);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Save config
  btnSaveConfig.onclick = () => {
    window.hudSync.updateState(s => {
      s.player1.name = inputP1Name.value.trim() || 'NKxLHAT';
      s.player1.team = inputP1Team.value.trim() || 'NK';
      s.player1.color = inputP1Color.value;
      s.player1.vdoNinjaUrl = inputP1Vdo.value.trim();
      s.player1.scale = parseInt(inputP1Scale.value) || 100;
      s.player1.offsetX = parseInt(inputP1OffsetX.value) || 0;
      s.player1.offsetY = parseInt(inputP1OffsetY.value) || 0;

      s.player2.name = inputP2Name.value.trim() || 'TAGxLieTa';
      s.player2.team = inputP2Team.value.trim() || 'TAG';
      s.player2.color = inputP2Color.value;
      s.player2.vdoNinjaUrl = inputP2Vdo.value.trim();
      s.player2.scale = parseInt(inputP2Scale.value) || 100;
      s.player2.offsetX = parseInt(inputP2OffsetX.value) || 0;
      s.player2.offsetY = parseInt(inputP2OffsetY.value) || 0;

      s.tournament.stage = inputTourStage.value.trim() || 'FINAL';
      s.tournament.game = inputTourGame.value.trim() || 'GAME 3';
      s.tournament.logoScale = parseInt(inputTourLogoScale.value) || 100;
      s.tournament.logoOffsetY = parseInt(inputTourLogoOffsetY.value) || 0;
    });
    alert('Đã lưu và đồng bộ toàn bộ cấu hình giải đấu thành công!');
  };

  btnOpenOverlay.onclick = () => {
    window.open('/overlay', '_blank');
  };

  // Keyboard Hotkeys
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      return;
    }

    const key = e.key.toLowerCase();
    if (key === '1') {
      e.preventDefault();
      btnSceneIntro.click();
    } else if (key === '2') {
      e.preventDefault();
      btnSceneIngame.click();
    } else if (key === '3') {
      e.preventDefault();
      btnSceneNone.click();
    } else if (key === 'd') {
      e.preventDefault();
      btnToggleDim.click();
    } else if (key === 'h') {
      e.preventDefault();
      btnToggleHide.click();
    } else if (key === 's') {
      e.preventDefault();
      btnToggleSwap.click();
    } else if (key === 'g') {
      e.preventDefault();
      btnGoalP1.click();
    } else if (key === 'j') {
      e.preventDefault();
      btnGoalP2.click();
    }
  });
});

