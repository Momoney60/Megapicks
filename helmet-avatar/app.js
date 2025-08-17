(() => {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const toHex = (n) => n.toString(16).padStart(2, '0');
  const randColor = () => `#${toHex(randInt(0,255))}${toHex(randInt(0,255))}${toHex(randInt(0,255))}`;
  const encodeState = (s) => btoa(unescape(encodeURIComponent(JSON.stringify(s))));
  const decodeState = (t) => JSON.parse(decodeURIComponent(escape(atob(t))));

  const svg = $('#helmetSvg');
  const backgroundGroup = $('#backgroundGroup');
  const shellFill = $('#shellFill');
  const shellGradient = $('#shellGradient');
  const glossOverlay = $('#glossOverlay');
  const flakeOverlay = $('#flakeOverlay');
  const flakePattern = $('#flakePattern');
  const shellOutline = $('#shellOutline');
  const earRing = $('#earRing');

  const stripeGroup = $('#stripeGroup');
  const stripe1 = $('#stripe1');
  const stripe2 = $('#stripe2');
  const stripe3 = $('#stripe3');

  const decalGroup = $('#decalGroup');
  const decalVector = $('#decalVector');
  const decalVectorUse = $('#decalVector use');
  const decalImage = $('#decalImage');

  const numberText = $('#numberText');

  const visorGroup = $('#visorGroup');
  const visorPath = $('#visor');

  const facemaskGroup = $('#facemaskGroup');
  const facemaskUse = $('#facemaskUse');

  const liveUsername = $('#liveUsername');

  const SHELL_BBOX = { x: 70, y: 70, width: 250, height: 200 };
  const centerX = SHELL_BBOX.x + SHELL_BBOX.width * 0.45;
  const centerY = SHELL_BBOX.y + SHELL_BBOX.height * 0.45;

  const defaultState = {
    username: 'guest',
    background: { type: 'transparent', color1: '#0b1f2a', color2: '#063d5e' },
    shell: {
      color1: '#c41e3a',
      useGradient: true,
      color2: '#6a0d21',
      gradientAngle: 30,
      outlineColor: '#101418',
      outlineWidth: 3,
      gloss: true,
      metallicFlake: true,
      flakeDensity: 0.35,
    },
    stripes: {
      mode: 'single',
      color1: '#ffffff',
      color2: '#000000',
      color3: '#ffffff',
      angle: -15,
      width: 18,
      spacing: 10,
    },
    decal: {
      type: 'star',
      color: '#ffffff',
      letter: 'A',
      size: 0.5, // relative (0.2..1.2)
      x: 0.1, // -0.5..0.5
      y: 0.0, // -0.5..0.5
      flip: false,
      imageDataUrl: '',
    },
    number: {
      value: 22,
      color: '#ffffff',
      outlineColor: '#000000',
      outlineWidth: 2,
      font: 'varsity',
      x: -0.1,
      y: 0.15,
      scale: 0.8,
    },
    facemask: { color: '#333333', style: 'standard' },
    chinstrap: { color: '#ffffff' },
    visor: { enabled: false, color: '#222222', opacity: 0.35 },
    effects: { shadow: true },
  };

  let state = JSON.parse(localStorage.getItem('helmet.avatar.state') || 'null') || defaultState;

  function saveLocal() {
    localStorage.setItem('helmet.avatar.state', JSON.stringify(state));
  }

  function saveUserProfile() {
    const key = `helmet.avatar.user.${(state.username || '').trim()}`;
    if (!state.username) return;
    localStorage.setItem(key, JSON.stringify(state));
  }

  function loadUserProfile(name) {
    const key = `helmet.avatar.user.${(name || '').trim()}`;
    const s = localStorage.getItem(key);
    if (!s) return false;
    state = JSON.parse(s);
    saveLocal();
    hydrateControls();
    render();
    return true;
  }

  function setGradientAngle(grad, deg) {
    const rad = (deg * Math.PI) / 180;
    const x = Math.cos(rad);
    const y = Math.sin(rad);
    grad.setAttribute('x1', `${50 - x * 50}%`);
    grad.setAttribute('y1', `${50 - y * 50}%`);
    grad.setAttribute('x2', `${50 + x * 50}%`);
    grad.setAttribute('y2', `${50 + y * 50}%`);
  }

  function applyBackground() {
    while (backgroundGroup.firstChild) backgroundGroup.removeChild(backgroundGroup.firstChild);
    const t = state.background.type;
    if (t === 'transparent') return;
    if (t === 'solid') {
      const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      r.setAttribute('x', '0'); r.setAttribute('y', '0'); r.setAttribute('width', '400'); r.setAttribute('height', '300');
      r.setAttribute('fill', state.background.color1);
      backgroundGroup.appendChild(r);
    } else if (t === 'gradient') {
      const lg = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      const id = `bgGrad-${Date.now()}`;
      lg.setAttribute('id', id);
      lg.setAttribute('x1', '0'); lg.setAttribute('y1', '0'); lg.setAttribute('x2', '1'); lg.setAttribute('y2', '1');
      const s1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop'); s1.setAttribute('offset', '0%'); s1.setAttribute('stop-color', state.background.color1);
      const s2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop'); s2.setAttribute('offset', '100%'); s2.setAttribute('stop-color', state.background.color2);
      const defs = svg.querySelector('defs'); defs.appendChild(lg); lg.appendChild(s1); lg.appendChild(s2);
      const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      r.setAttribute('x', '0'); r.setAttribute('y', '0'); r.setAttribute('width', '400'); r.setAttribute('height', '300');
      r.setAttribute('fill', `url(#${id})`);
      backgroundGroup.appendChild(r);
    } else if (t === 'badge') {
      const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      r.setAttribute('x', '0'); r.setAttribute('y', '0'); r.setAttribute('width', '400'); r.setAttribute('height', '300');
      r.setAttribute('fill', 'transparent');
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', '200'); c.setAttribute('cy', '150'); c.setAttribute('r', '135');
      c.setAttribute('fill', state.background.color1);
      backgroundGroup.appendChild(r);
      backgroundGroup.appendChild(c);
    }
  }

  function applyShell() {
    if (state.shell.useGradient) {
      shellGradient.querySelector('stop[offset="0%"]').setAttribute('stop-color', state.shell.color1);
      shellGradient.querySelector('stop[offset="100%"]').setAttribute('stop-color', state.shell.color2);
      setGradientAngle(shellGradient, state.shell.gradientAngle);
      shellFill.setAttribute('fill', 'url(#shellGradient)');
    } else {
      shellFill.setAttribute('fill', state.shell.color1);
    }
    glossOverlay.setAttribute('opacity', state.shell.gloss ? '0.8' : '0');

    flakeOverlay.setAttribute('opacity', state.shell.metallicFlake ? String(state.shell.flakeDensity) : '0');

    shellOutline.setAttribute('stroke', state.shell.outlineColor);
    shellOutline.setAttribute('stroke-width', String(state.shell.outlineWidth));
    earRing.setAttribute('stroke', state.shell.outlineColor);
    earRing.setAttribute('stroke-width', String(Math.max(0, state.shell.outlineWidth - 0.5)));
  }

  function applyStripes() {
    const mode = state.stripes.mode;
    const angle = state.stripes.angle;
    const width = state.stripes.width;
    const spacing = state.stripes.spacing;

    const yTop = centerY - SHELL_BBOX.height * 0.28;
    const L = 600;

    function placeStripe(r, y, color, w) {
      r.setAttribute('x', String(centerX - L / 2));
      r.setAttribute('y', String(y - w / 2));
      r.setAttribute('width', String(L));
      r.setAttribute('height', String(w));
      r.setAttribute('fill', color);
      r.setAttribute('transform', `rotate(${angle} ${centerX} ${y})`);
    }

    stripe1.style.display = 'none';
    stripe2.style.display = 'none';
    stripe3.style.display = 'none';

    if (mode === 'single') {
      placeStripe(stripe1, yTop, state.stripes.color1, width);
      stripe1.style.display = '';
    } else if (mode === 'double') {
      placeStripe(stripe1, yTop - spacing, state.stripes.color1, width);
      placeStripe(stripe2, yTop + spacing, state.stripes.color2, width);
      stripe1.style.display = '';
      stripe2.style.display = '';
    } else if (mode === 'triple') {
      placeStripe(stripe1, yTop - spacing * 1.2, state.stripes.color1, width);
      placeStripe(stripe2, yTop, state.stripes.color2, Math.max(2, width * 0.6));
      placeStripe(stripe3, yTop + spacing * 1.2, state.stripes.color3, width);
      stripe1.style.display = '';
      stripe2.style.display = '';
      stripe3.style.display = '';
    }
  }

  function applyDecal() {
    const bboxW = SHELL_BBOX.width;
    const bboxH = SHELL_BBOX.height;
    const px = centerX + state.decal.x * bboxW;
    const py = centerY + state.decal.y * bboxH;
    const scale = clamp(state.decal.size, 0.2, 1.2) * 1.2 * (bboxW / 250);

    if (state.decal.type === 'upload' && state.decal.imageDataUrl) {
      decalVector.setAttribute('visibility', 'hidden');
      decalImage.setAttribute('href', state.decal.imageDataUrl);
      const size = 120 * scale;
      decalImage.setAttribute('x', String(px - size / 2));
      decalImage.setAttribute('y', String(py - size / 2));
      decalImage.setAttribute('width', String(size));
      decalImage.setAttribute('height', String(size));
      decalImage.setAttribute('visibility', 'visible');
      decalImage.removeAttribute('transform');
    } else {
      decalImage.setAttribute('visibility', 'hidden');
      decalVector.setAttribute('visibility', 'visible');

      const use = decalVectorUse;
      if (state.decal.type === 'star') {
        use.setAttribute('href', '#vectorStar');
      } else if (state.decal.type === 'bolt') {
        use.setAttribute('href', '#vectorBolt');
      } else if (state.decal.type === 'letter') {
        // Replace with text node
        const existing = decalVector.querySelector('text');
        if (!existing) {
          const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          t.setAttribute('id', 'decalLetterText');
          t.setAttribute('text-anchor', 'middle');
          t.setAttribute('dominant-baseline', 'middle');
          t.textContent = state.decal.letter || 'A';
          decalVector.appendChild(t);
        }
      }

      decalVector.setAttribute('transform', `translate(${px},${py}) scale(${scale * (state.decal.flip ? -1 : 1)}, ${scale})`);
      // Fill color
      decalVector.querySelectorAll('path').forEach(p => p.setAttribute('fill', state.decal.color));
      const t = decalVector.querySelector('#decalLetterText');
      if (t) {
        t.textContent = (state.decal.letter || 'A').toUpperCase();
        t.setAttribute('fill', state.decal.color);
        t.setAttribute('font-size', String(120));
        t.setAttribute('font-family', 'Graduate, Bebas Neue, Inter, Arial, sans-serif');
      }

      // Ensure vector <use> visibility when not letter
      if (state.decal.type === 'letter') {
        use.setAttribute('visibility', 'hidden');
      } else {
        use.setAttribute('visibility', 'visible');
      }
    }
  }

  function applyNumber() {
    const bboxW = SHELL_BBOX.width;
    const bboxH = SHELL_BBOX.height;
    const px = centerX + state.number.x * bboxW;
    const py = centerY + state.number.y * bboxH;
    const scale = clamp(state.number.scale, 0.5, 1.2) * 1.0 * (bboxW / 250);

    numberText.textContent = String(state.number.value).padStart(2, '0');
    numberText.setAttribute('x', String(px));
    numberText.setAttribute('y', String(py));
    numberText.setAttribute('fill', state.number.color);
    numberText.setAttribute('stroke', state.number.outlineColor);
    numberText.setAttribute('stroke-width', String(state.number.outlineWidth));
    numberText.setAttribute('transform', `translate(${px},${py}) scale(${scale}) translate(${-px},${-py})`);

    let fontFamily = 'Graduate';
    if (state.number.font === 'block') fontFamily = 'Bebas Neue';
    if (state.number.font === 'rounded') fontFamily = 'Inter';
    numberText.setAttribute('font-family', `${fontFamily}, Inter, Arial, sans-serif`);
  }

  function applyGear() {
    facemaskGroup.setAttribute('stroke', state.facemask.color);
    facemaskUse.setAttribute('href', state.facemask.style === 'cage' ? '#facemaskCage' : '#facemaskStd');

    const chin = $('#chinstrapGroup');
    chin.setAttribute('stroke', state.chinstrap.color);

    visorGroup.setAttribute('opacity', state.visor.enabled ? String(clamp(state.visor.opacity, 0, 1)) : '0');
    visorPath.setAttribute('fill', state.visor.color);
  }

  function applyEffects() {
    const rootGroup = $('#helmetGroup');
    rootGroup.setAttribute('filter', state.effects.shadow ? 'url(#dropShadow)' : 'none');
  }

  function render() {
    liveUsername.textContent = state.username || 'guest';
    applyBackground();
    applyShell();
    applyStripes();
    applyDecal();
    applyNumber();
    applyGear();
    applyEffects();
    saveLocal();
  }

  function hydrateControls() {
    $('#usernameInput').value = state.username || '';

    $('#bgType').value = state.background.type;
    $('#bgColor1').value = state.background.color1;
    $('#bgColor2').value = state.background.color2;

    $('#shellColor1').value = state.shell.color1;
    $('#shellUseGradient').checked = !!state.shell.useGradient;
    $('#shellColor2').value = state.shell.color2;
    $('#shellGradAngle').value = String(state.shell.gradientAngle);
    $('#outlineColor').value = state.shell.outlineColor;
    $('#outlineWidth').value = String(state.shell.outlineWidth);
    $('#glossEnabled').checked = !!state.shell.gloss;
    $('#flakeEnabled').checked = !!state.shell.metallicFlake;
    $('#flakeDensity').value = String(state.shell.flakeDensity);

    $('#stripeMode').value = state.stripes.mode;
    $('#stripeColor1').value = state.stripes.color1;
    $('#stripeColor2').value = state.stripes.color2;
    $('#stripeColor3').value = state.stripes.color3;
    $('#stripeAngle').value = String(state.stripes.angle);
    $('#stripeWidth').value = String(state.stripes.width);
    $('#stripeSpacing').value = String(state.stripes.spacing);

    $('#decalType').value = state.decal.type;
    $('#decalColor').value = state.decal.color;
    $('#decalLetter').value = state.decal.letter;
    $('#decalSize').value = String(state.decal.size);
    $('#decalX').value = String(state.decal.x);
    $('#decalY').value = String(state.decal.y);
    $('#decalFlip').checked = !!state.decal.flip;

    $('#numValue').value = String(state.number.value);
    $('#numFont').value = state.number.font;
    $('#numColor').value = state.number.color;
    $('#numOutlineColor').value = state.number.outlineColor;
    $('#numOutlineWidth').value = String(state.number.outlineWidth);
    $('#numX').value = String(state.number.x);
    $('#numY').value = String(state.number.y);
    $('#numScale').value = String(state.number.scale);

    $('#maskColor').value = state.facemask.color;
    $('#maskStyle').value = state.facemask.style;
    $('#chinColor').value = state.chinstrap.color;

    $('#visorEnabled').checked = !!state.visor.enabled;
    $('#visorColor').value = state.visor.color;
    $('#visorOpacity').value = String(state.visor.opacity);

    $('#shadowEnabled').checked = !!state.effects.shadow;
  }

  function bindControls() {
    $('#usernameInput').addEventListener('input', (e) => { state.username = e.target.value.trim(); render(); });

    $('#bgType').addEventListener('change', (e) => { state.background.type = e.target.value; render(); });
    $('#bgColor1').addEventListener('input', (e) => { state.background.color1 = e.target.value; render(); });
    $('#bgColor2').addEventListener('input', (e) => { state.background.color2 = e.target.value; render(); });

    $('#shellColor1').addEventListener('input', (e) => { state.shell.color1 = e.target.value; render(); });
    $('#shellUseGradient').addEventListener('change', (e) => { state.shell.useGradient = e.target.checked; render(); });
    $('#shellColor2').addEventListener('input', (e) => { state.shell.color2 = e.target.value; render(); });
    $('#shellGradAngle').addEventListener('input', (e) => { state.shell.gradientAngle = parseInt(e.target.value, 10); render(); });
    $('#outlineColor').addEventListener('input', (e) => { state.shell.outlineColor = e.target.value; render(); });
    $('#outlineWidth').addEventListener('input', (e) => { state.shell.outlineWidth = parseInt(e.target.value, 10); render(); });
    $('#glossEnabled').addEventListener('change', (e) => { state.shell.gloss = e.target.checked; render(); });
    $('#flakeEnabled').addEventListener('change', (e) => { state.shell.metallicFlake = e.target.checked; render(); });
    $('#flakeDensity').addEventListener('input', (e) => { state.shell.flakeDensity = parseFloat(e.target.value); render(); });

    $('#stripeMode').addEventListener('change', (e) => { state.stripes.mode = e.target.value; render(); });
    $('#stripeColor1').addEventListener('input', (e) => { state.stripes.color1 = e.target.value; render(); });
    $('#stripeColor2').addEventListener('input', (e) => { state.stripes.color2 = e.target.value; render(); });
    $('#stripeColor3').addEventListener('input', (e) => { state.stripes.color3 = e.target.value; render(); });
    $('#stripeAngle').addEventListener('input', (e) => { state.stripes.angle = parseInt(e.target.value, 10); render(); });
    $('#stripeWidth').addEventListener('input', (e) => { state.stripes.width = parseInt(e.target.value, 10); render(); });
    $('#stripeSpacing').addEventListener('input', (e) => { state.stripes.spacing = parseInt(e.target.value, 10); render(); });

    $('#decalType').addEventListener('change', (e) => { state.decal.type = e.target.value; render(); });
    $('#decalColor').addEventListener('input', (e) => { state.decal.color = e.target.value; render(); });
    $('#decalLetter').addEventListener('input', (e) => { state.decal.letter = e.target.value.replace(/[^a-zA-Z]/g, '').slice(0,1) || 'A'; render(); });
    $('#decalSize').addEventListener('input', (e) => { state.decal.size = parseFloat(e.target.value); render(); });
    $('#decalX').addEventListener('input', (e) => { state.decal.x = parseFloat(e.target.value); render(); });
    $('#decalY').addEventListener('input', (e) => { state.decal.y = parseFloat(e.target.value); render(); });
    $('#decalFlip').addEventListener('change', (e) => { state.decal.flip = e.target.checked; render(); });
    $('#decalUpload').addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => { state.decal.imageDataUrl = String(reader.result); state.decal.type = 'upload'; hydrateControls(); render(); };
      reader.readAsDataURL(file);
    });

    $('#numValue').addEventListener('input', (e) => { state.number.value = clamp(parseInt(e.target.value || '0', 10), 0, 99); render(); });
    $('#numFont').addEventListener('change', (e) => { state.number.font = e.target.value; render(); });
    $('#numColor').addEventListener('input', (e) => { state.number.color = e.target.value; render(); });
    $('#numOutlineColor').addEventListener('input', (e) => { state.number.outlineColor = e.target.value; render(); });
    $('#numOutlineWidth').addEventListener('input', (e) => { state.number.outlineWidth = parseInt(e.target.value, 10); render(); });
    $('#numX').addEventListener('input', (e) => { state.number.x = parseFloat(e.target.value); render(); });
    $('#numY').addEventListener('input', (e) => { state.number.y = parseFloat(e.target.value); render(); });
    $('#numScale').addEventListener('input', (e) => { state.number.scale = parseFloat(e.target.value); render(); });

    $('#maskColor').addEventListener('input', (e) => { state.facemask.color = e.target.value; render(); });
    $('#maskStyle').addEventListener('change', (e) => { state.facemask.style = e.target.value; render(); });
    $('#chinColor').addEventListener('input', (e) => { state.chinstrap.color = e.target.value; render(); });

    $('#visorEnabled').addEventListener('change', (e) => { state.visor.enabled = e.target.checked; render(); });
    $('#visorColor').addEventListener('input', (e) => { state.visor.color = e.target.value; render(); });
    $('#visorOpacity').addEventListener('input', (e) => { state.visor.opacity = parseFloat(e.target.value); render(); });

    $('#shadowEnabled').addEventListener('change', (e) => { state.effects.shadow = e.target.checked; render(); });

    $('#randomizeBtn').addEventListener('click', () => { randomize(); hydrateControls(); render(); });
    $('#resetBtn').addEventListener('click', () => { state = JSON.parse(JSON.stringify(defaultState)); hydrateControls(); render(); });

    $('#saveProfileBtn').addEventListener('click', () => { saveUserProfile(); });
    $('#loadProfileBtn').addEventListener('click', () => {
      const name = prompt('Load username:');
      if (!name || !loadUserProfile(name)) alert('No saved profile for that username');
    });

    $('#exportPngBtn').addEventListener('click', exportPNG);
    $('#copySvgBtn').addEventListener('click', copySVG);
    $('#shareLinkBtn').addEventListener('click', shareLink);
    $('#importJsonBtn').addEventListener('click', importJSON);
  }

  function randomize() {
    state.shell.color1 = randColor();
    state.shell.color2 = randColor();
    state.shell.useGradient = Math.random() > 0.3;
    state.shell.gradientAngle = randInt(0, 180);
    state.shell.outlineColor = '#101418';
    state.shell.outlineWidth = randInt(1, 5);
    state.shell.gloss = Math.random() > 0.2;
    state.shell.metallicFlake = Math.random() > 0.4;
    state.shell.flakeDensity = Math.random() * 0.5;

    const modes = ['none','single','double','triple'];
    state.stripes.mode = randPick(modes);
    state.stripes.color1 = randColor();
    state.stripes.color2 = randColor();
    state.stripes.color3 = randColor();
    state.stripes.angle = randInt(-30, 30);
    state.stripes.width = randInt(6, 28);
    state.stripes.spacing = randInt(4, 20);

    const decals = ['none','star','bolt','letter','upload'];
    state.decal.type = randPick(decals.filter(d => d !== 'upload'));
    state.decal.color = randColor();
    state.decal.letter = String.fromCharCode(randInt(65, 90));
    state.decal.size = Math.random() * 0.9 + 0.25;
    state.decal.x = Math.random() * 0.8 - 0.2;
    state.decal.y = Math.random() * 0.6 - 0.3;
    state.decal.flip = Math.random() > 0.5;

    state.number.value = randInt(0, 99);
    state.number.color = randColor();
    state.number.outlineColor = randColor();
    state.number.outlineWidth = randInt(0, 5);
    state.number.font = randPick(['varsity','block','rounded']);
    state.number.x = Math.random() * 0.5 - 0.3;
    state.number.y = Math.random() * 0.5 - 0.1;
    state.number.scale = Math.random() * 0.6 + 0.5;

    state.facemask.color = randColor();
    state.facemask.style = Math.random() > 0.5 ? 'standard' : 'cage';
    state.chinstrap.color = randColor();
    state.visor.enabled = Math.random() > 0.5;
    state.visor.color = randColor();
    state.visor.opacity = Math.random() * 0.6;

    state.effects.shadow = Math.random() > 0.3;
  }

  function exportPNG() {
    const clone = svg.cloneNode(true);
    clone.removeAttribute('style');

    const xml = new XMLSerializer().serializeToString(clone);
    const svg64 = btoa(unescape(encodeURIComponent(xml)));
    const image64 = `data:image/svg+xml;base64,${svg64}`;

    const img = new Image();
    img.onload = () => {
      const scale = 2.0;
      const canvas = document.createElement('canvas');
      canvas.width = 400 * scale; canvas.height = 300 * scale;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement('a');
      a.download = `${(state.username || 'helmet')}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = image64;
  }

  async function copySVG() {
    const xml = new XMLSerializer().serializeToString(svg);
    try {
      await navigator.clipboard.writeText(xml);
      alert('SVG copied to clipboard');
    } catch (e) {
      alert('Copy failed');
    }
  }

  function shareLink() {
    const token = encodeState(state);
    const url = `${location.origin}${location.pathname}#${token}`;
    navigator.clipboard.writeText(url).then(() => alert('Shareable link copied to clipboard')); 
  }

  function importJSON() {
    const text = prompt('Paste JSON state:');
    if (!text) return;
    try {
      const s = JSON.parse(text);
      state = s; hydrateControls(); render();
    } catch (e) {
      alert('Invalid JSON');
    }
  }

  function initFromHash() {
    if (location.hash && location.hash.length > 1) {
      try {
        const s = decodeState(location.hash.slice(1));
        state = s; hydrateControls(); render();
      } catch (e) {}
    }
  }

  function init() {
    // Wire controls
    bindControls();
    hydrateControls();
    initFromHash();
    render();
  }

  window.addEventListener('DOMContentLoaded', init);
})();