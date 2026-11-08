/**
 * FC Online FVPL Overlay Logic
 * Implements 4-step Intro sequence, Dual VDO.Ninja cams, & Premier League Goal animation
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements - Intro Scene
  const sceneIntro = document.getElementById('sceneIntro');
  const introBannerWrap = document.getElementById('introBannerWrap');
  const wrapCutoutP1 = document.getElementById('wrapCutoutP1');
  const wrapCutoutP2 = document.getElementById('wrapCutoutP2');
  const introLogoCenterWrap = document.getElementById('introLogoCenterWrap');
  const introCutoutP1 = document.getElementById('introCutoutP1');
  const introCutoutP2 = document.getElementById('introCutoutP2');
  const introCenterLogoImg = document.getElementById('introCenterLogoImg');
  const introCenterLogoVideo = document.getElementById('introCenterLogoVideo');
  const introNameP1 = document.getElementById('introNameP1');
  const introNameP2 = document.getElementById('introNameP2');
  const introStageTitle = document.getElementById('introStageTitle');
  const introStageSub = document.getElementById('introStageSub');

  // Elements - Ingame Scene
  const sceneIngame = document.getElementById('sceneIngame');
  const ingameCamsWrapper = document.getElementById('ingameCamsWrapper');
  const camFrameP1 = document.getElementById('camFrameP1');
  const camFrameP2 = document.getElementById('camFrameP2');
  const camNameP1 = document.getElementById('camNameP1');
  const camTeamP1 = document.getElementById('camTeamP1');
  const camNameP2 = document.getElementById('camNameP2');
  const camTeamP2 = document.getElementById('camTeamP2');
  const iframeP1 = document.getElementById('iframeP1');
  const iframeP2 = document.getElementById('iframeP2');

  // Elements - Goal Animation
  const plGoalOverlay = document.getElementById('plGoalOverlay');
  const plGoalWedge = document.getElementById('plGoalWedge');
  const plGoalTitle = document.getElementById('plGoalTitle');
  const plGoalPlayerName = document.getElementById('plGoalPlayerName');

  // Elements - Esports Impact Hero Goal Celebration (Phương án 1)
  const goalHeroOverlay = document.getElementById('goalHeroOverlay');
  const goalHeroImg = document.getElementById('goalHeroImg');
  const goalHeroShout = document.getElementById('goalHeroShout');
  const goalHeroTeamTag = document.getElementById('goalHeroTeamTag');
  const goalHeroName = document.getElementById('goalHeroName');

  let currentVdoP1 = '';
  let currentVdoP2 = '';
  let introTimer = null;
  let goalTimer = null;
  let lastGoalActive = false;

  function playEsportsWhoosh() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // 1. Deep Sub-Bass Drop
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(120, ctx.currentTime);
      subOsc.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 0.5);
      subGain.gain.setValueAtTime(0.45, ctx.currentTime);
      subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start();
      subOsc.stop(ctx.currentTime + 0.55);

      // 2. High-energy Whoosh Sweep
      const sweepOsc = ctx.createOscillator();
      const sweepGain = ctx.createGain();
      sweepOsc.type = 'sine';
      sweepOsc.frequency.setValueAtTime(260, ctx.currentTime);
      sweepOsc.frequency.exponentialRampToValueAtTime(920, ctx.currentTime + 0.12);
      sweepOsc.frequency.exponentialRampToValueAtTime(75, ctx.currentTime + 0.42);
      sweepGain.gain.setValueAtTime(0.3, ctx.currentTime);
      sweepGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      sweepOsc.connect(sweepGain);
      sweepGain.connect(ctx.destination);
      sweepOsc.start();
      sweepOsc.stop(ctx.currentTime + 0.45);
    } catch (e) {}
  }

  function runIntroSequence() {
    // Reset all elements first
    introBannerWrap.classList.remove('expand');
    wrapCutoutP1.classList.remove('slide-up');
    wrapCutoutP2.classList.remove('slide-up');
    introLogoCenterWrap.classList.remove('slide-up');

    // Step 1: Split Banner expands horizontally
    setTimeout(() => {
      introBannerWrap.classList.add('expand');
    }, 200);

    // Step 2: Player cutouts & Tournament Logo rise up together from the banner
    setTimeout(() => {
      wrapCutoutP1.classList.add('slide-up');
      introLogoCenterWrap.classList.add('slide-up');
      wrapCutoutP2.classList.add('slide-up');
    }, 850);
  }

  function render(state) {
    // 1. Manage Active Scene
    if (state.activeScene === 'intro') {
      sceneIntro.classList.add('active');
      sceneIngame.style.opacity = '0';

      introNameP1.textContent = state.player1.name;
      introNameP2.textContent = state.player2.name;
      introStageTitle.textContent = state.tournament.stage;
      introStageSub.textContent = state.tournament.game;

      // Cutout sources
      if (state.player1.photo && introCutoutP1.src !== state.player1.photo) {
        introCutoutP1.src = state.player1.photo;
      }
      if (state.player2.photo && introCutoutP2.src !== state.player2.photo) {
        introCutoutP2.src = state.player2.photo;
      }

      // Cutout positioning & scaling
      const p1Scale = (state.player1.scale || 100) / 100;
      const p1X = state.player1.offsetX || 0;
      const p1Y = state.player1.offsetY || 0;
      introCutoutP1.style.transform = `translate(${p1X}px, ${p1Y}px) scale(${p1Scale})`;

      const p2Scale = (state.player2.scale || 100) / 100;
      const p2X = state.player2.offsetX || 0;
      const p2Y = state.player2.offsetY || 0;
      introCutoutP2.style.transform = `translate(${p2X}px, ${p2Y}px) scale(${p2Scale})`;

      // Tournament Logo Media (Image vs Video)
      const lScale = (state.tournament.logoScale || 100) / 100;
      const lY = state.tournament.logoOffsetY || 0;
      if (state.tournament.logoType === 'video') {
        introCenterLogoVideo.style.display = 'block';
        introCenterLogoImg.style.display = 'none';
        introCenterLogoVideo.style.transform = `translateY(${lY}px) scale(${lScale})`;
        if (state.tournament.logoUrl && !introCenterLogoVideo.src.endsWith(state.tournament.logoUrl)) {
          introCenterLogoVideo.src = state.tournament.logoUrl;
          introCenterLogoVideo.play().catch(() => {});
        }
      } else {
        introCenterLogoImg.style.display = 'block';
        introCenterLogoVideo.style.display = 'none';
        introCenterLogoImg.style.transform = `translateY(${lY}px) scale(${lScale})`;
        if (state.tournament.logoUrl && !introCenterLogoImg.src.endsWith(state.tournament.logoUrl)) {
          introCenterLogoImg.src = state.tournament.logoUrl;
        }
      }

      const wingP1 = document.getElementById('introWingP1');
      if (wingP1 && state.player1.color) {
        wingP1.style.background = `linear-gradient(90deg, ${state.player1.color} 0%, #200008 100%)`;
      }

      if (state.introState.isPlaying && !introTimer) {
        runIntroSequence();
        introTimer = true;
      }
    } else {
      sceneIntro.classList.remove('active');
      introBannerWrap.classList.remove('expand');
      wrapCutoutP1.classList.remove('slide-up');
      wrapCutoutP2.classList.remove('slide-up');
      introLogoCenterWrap.classList.remove('slide-up');
      introTimer = null;

      sceneIngame.style.opacity = state.activeScene === 'ingame' ? '1' : '0';
    }

    // 2. In-Game Cams Customization
    camNameP1.textContent = state.player1.name;
    camTeamP1.textContent = state.player1.team;
    camFrameP1.style.borderColor = state.player1.color || '#ff2244';

    camNameP2.textContent = state.player2.name;
    camTeamP2.textContent = state.player2.team;
    camFrameP2.style.borderColor = state.player2.color || '#ff7700';

    // VDO.Ninja Iframes with &cover=1 to eliminate black bars
    function formatVdo(url) {
      if (!url) return 'about:blank';
      let res = url.trim();
      if (res.includes('vdo.ninja') && !res.includes('cover=')) {
        res += (res.includes('?') ? '&' : '?') + 'cover=1&cleanviewer=1&transparent=1';
      }
      return res;
    }

    if (state.player1.vdoNinjaUrl && state.player1.vdoNinjaUrl !== currentVdoP1) {
      currentVdoP1 = state.player1.vdoNinjaUrl;
      iframeP1.src = formatVdo(currentVdoP1);
    }
    if (state.player2.vdoNinjaUrl && state.player2.vdoNinjaUrl !== currentVdoP2) {
      currentVdoP2 = state.player2.vdoNinjaUrl;
      iframeP2.src = formatVdo(currentVdoP2);
    }

    // Cam Controls: Dim, Hide, Swap
    ingameCamsWrapper.classList.toggle('dimmed', !!state.camControls.isDimmed);
    ingameCamsWrapper.classList.toggle('hidden', !!state.camControls.isHidden);
    ingameCamsWrapper.classList.toggle('swapped', !!state.camControls.isSwapped);

    // 3. Goal Celebration (Phối hợp cả Scoreboard Wipe & Esports Impact Hero Phương Án 1)
    if (state.goalEffect && state.goalEffect.active) {
      const scorer = state.goalEffect.scorer || 1;
      const player = scorer === 1 ? state.player1 : state.player2;
      const goalColor = state.goalEffect.color || player.color || (scorer === 1 ? '#ff2244' : '#ff7700');
      const goalName = state.goalEffect.playerName || player.name || (scorer === 1 ? 'VĐV 1' : 'VĐV 2');
      const goalTeam = player.team || (scorer === 1 ? 'NK' : 'TAG');
      const goalPhoto = player.photo || (scorer === 1 ? 'assets/images/p1-cutout.svg' : 'assets/images/p2-cutout.svg');
      const goalTitle = state.goalEffect.title || 'VÀO!';

      // Set CSS variable for neon aura & glow
      document.documentElement.style.setProperty('--hero-color', goalColor);

      // Scoreboard bar overlay
      plGoalWedge.style.backgroundColor = goalColor;
      plGoalTitle.textContent = goalTitle;
      plGoalPlayerName.textContent = goalName;

      // Phương án 1: Esports Impact Hero Overlay
      goalHeroOverlay.classList.remove('side-p1', 'side-p2');
      goalHeroOverlay.classList.add(scorer === 1 ? 'side-p1' : 'side-p2');
      goalHeroImg.src = goalPhoto;
      goalHeroShout.textContent = goalTitle;
      goalHeroTeamTag.textContent = goalTeam;
      goalHeroName.textContent = goalName;

      if (!lastGoalActive) {
        lastGoalActive = true;
        plGoalOverlay.classList.add('active');
        goalHeroOverlay.classList.add('active');

        // Play broadcast whoosh + deep sub-bass impact
        playEsportsWhoosh();

        // Auto retract after 5.5 seconds
        if (goalTimer) clearTimeout(goalTimer);
        goalTimer = setTimeout(() => {
          window.hudSync.resetGoal();
        }, 5500);
      }
    } else {
      lastGoalActive = false;
      plGoalOverlay.classList.remove('active');
      goalHeroOverlay.classList.remove('active');
      if (goalTimer) {
        clearTimeout(goalTimer);
        goalTimer = null;
      }
    }
  }

  window.hudSync.onStateChange(render);
});

