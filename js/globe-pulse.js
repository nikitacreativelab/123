// Interaktiver, ziehbarer 3D-Globus mit pulsierenden Standort-Markern (Portfolio-Seite).
// Nutzt die "cobe" WebGL-Bibliothek direkt per ESM-CDN-Import (kein Build-Schritt noetig).
import createGlobe from 'https://cdn.jsdelivr.net/npm/cobe@2.0.1/dist/index.esm.js';

const canvas = document.getElementById('globePulseCanvas');

if (canvas) {
  const markers = [
    { location: [52.3676, 4.9041], baseSize: 0.05, delay: 0 },     // Amsterdam
    { location: [50.9375, 6.9603], baseSize: 0.06, delay: 0.4 },   // Koeln
    { location: [50.8503, 4.3517], baseSize: 0.05, delay: 0.8 },   // Bruessel
    { location: [46.9480, 7.4474], baseSize: 0.05, delay: 1.2 },   // Schweiz
    { location: [48.8566, 2.3522], baseSize: 0.05, delay: 1.6 },   // Frankreich
    { location: [51.5074, -0.1278], baseSize: 0.05, delay: 2.0 },  // London
    { location: [40.7128, -74.006], baseSize: 0.05, delay: 2.4 },  // New York
    { location: [35.6762, 139.6503], baseSize: 0.05, delay: 2.8 }, // Tokio
    { location: [-33.8688, 151.2093], baseSize: 0.05, delay: 3.2 },// Sydney
  ];

  let phi = 0;
  let theta = 0.28;
  let width = 0;
  let pointerInteracting = null;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let dragPhi = 0;
  let dragTheta = 0;

  function onResize() {
    if (canvas.offsetWidth) width = canvas.offsetWidth;
  }
  window.addEventListener('resize', onResize);
  onResize();

  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const globe = createGlobe(canvas, {
    devicePixelRatio: dpr,
    width: width * dpr,
    height: width * dpr,
    phi: 0,
    theta,
    dark: 1,
    diffuse: 1.3,
    mapSamples: 14000,
    mapBrightness: 9,
    baseColor: [0.35, 0.4, 0.58],
    markerColor: [0.3, 0.43, 1],
    glowColor: [0.16, 0.2, 0.38],
    opacity: 0.92,
    markers: markers.map((m) => ({ location: m.location, size: m.baseSize })),
  });

  function frame() {
    if (pointerInteracting === null) {
      phi += 0.0032;
    }
    const t = performance.now() / 1000;
    globe.update({
      phi: phi + dragPhi,
      theta: Math.max(-0.35, Math.min(0.6, theta + dragTheta)),
      width: width * dpr,
      height: width * dpr,
      markers: markers.map((m) => {
        const pulse = 0.5 + 0.5 * Math.sin((t - m.delay) * 2.1);
        return { location: m.location, size: m.baseSize + pulse * 0.035 };
      }),
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  setTimeout(() => canvas.classList.add('visible'), 50);

  canvas.addEventListener('pointerdown', (e) => {
    pointerInteracting = e.pointerId;
    pointerStartX = e.clientX;
    pointerStartY = e.clientY;
    canvas.classList.add('dragging');
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (pointerInteracting === null) return;
    dragPhi = (e.clientX - pointerStartX) / 220;
    dragTheta = (e.clientY - pointerStartY) / 500;
  });
  function releasePointer() {
    if (pointerInteracting === null) return;
    phi += dragPhi;
    theta = Math.max(-0.35, Math.min(0.6, theta + dragTheta));
    dragPhi = 0;
    dragTheta = 0;
    pointerInteracting = null;
    canvas.classList.remove('dragging');
  }
  canvas.addEventListener('pointerup', releasePointer);
  canvas.addEventListener('pointercancel', releasePointer);
}
