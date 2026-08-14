// ===== Header scroll state =====
const header = document.getElementById('header');
function onScroll(){
  if(window.scrollY > 12){ header.classList.add('scrolled'); }
  else{ header.classList.remove('scrolled'); }
}
window.addEventListener('scroll', onScroll, {passive:true});
onScroll();

// ===== Scroll reveal =====
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, {threshold:0.15, rootMargin:'0px 0px -60px 0px'});
revealEls.forEach(el => io.observe(el));

// ===== Typing animation for headlines (brand-band + portfolio case studies) =====
document.querySelectorAll('.typing-headline').forEach(typingEl => {
  const fullText = typingEl.textContent.trim();
  typingEl.textContent = '';
  const typingIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        typingIO.unobserve(entry.target);
        let i = 0;
        (function type(){
          if(i <= fullText.length){
            typingEl.textContent = fullText.slice(0, i);
            i++;
            setTimeout(type, 45);
          } else {
            typingEl.classList.add('typing-done');
          }
        })();
      }
    });
  }, {threshold:0.5});
  typingIO.observe(typingEl);
});

// ===== Scroll-scrubbed SVG path drawing (homepage path-connector, marketing process-path) =====
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const drawPaths = Array.from(document.querySelectorAll('.path-trunk, .path-branch, .process-path-line'));
if(drawPaths.length && !reduceMotion){
  const tracked = drawPaths.map(path => {
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    const container = path.closest('.path-connector, .process-path');
    const arrows = container ? Array.from(container.querySelectorAll('.path-arrow')) : [];
    return {path, len, container, arrows};
  });
  let ticking = false;
  function updateDraw(){
    ticking = false;
    const vh = window.innerHeight;
    const start = vh * 0.9;
    const end = vh * 0.25;
    tracked.forEach(({path, len, container, arrows}) => {
      const target = container || path;
      const rect = target.getBoundingClientRect();
      let progress = (start - rect.top) / (start - end);
      progress = Math.max(0, Math.min(1, progress));
      path.style.strokeDashoffset = len * (1 - progress);
      arrows.forEach(a => a.classList.toggle('arrow-visible', progress > 0.9));
    });
  }
  function onDrawScroll(){
    if(!ticking){ requestAnimationFrame(updateDraw); ticking = true; }
  }
  window.addEventListener('scroll', onDrawScroll, {passive:true});
  window.addEventListener('resize', onDrawScroll);
  updateDraw();
} else if(drawPaths.length){
  drawPaths.forEach(path => { path.style.strokeDashoffset = 0; });
  document.querySelectorAll('.path-arrow').forEach(a => a.classList.add('arrow-visible'));
}

// ===== Portfolio: scroll progress bar + section dot nav =====
const caseStudies = Array.from(document.querySelectorAll('.case-study'));
const progressBar = document.querySelector('.scroll-progress-bar');
const dots = Array.from(document.querySelectorAll('.section-dot'));
if(caseStudies.length && (progressBar || dots.length)){
  let activeSection = -1;

  function updateScrollExperience(){
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;
    if(progressBar) progressBar.style.width = (progress * 100) + '%';

    const viewportCenter = window.innerHeight / 2;
    let active = 0;
    let minDist = Infinity;
    caseStudies.forEach((sec, i) => {
      const r = sec.getBoundingClientRect();
      const center = r.top + r.height / 2;
      const dist = Math.abs(center - viewportCenter);
      if(dist < minDist){ minDist = dist; active = i; }
    });
    if(active !== activeSection){
      dots.forEach((d, i) => d.classList.toggle('active', i === active));
      activeSection = active;
    }
  }
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if(!scrollTicking){
      requestAnimationFrame(() => { updateScrollExperience(); scrollTicking = false; });
      scrollTicking = true;
    }
  }, {passive:true});
  window.addEventListener('resize', updateScrollExperience);
  updateScrollExperience();

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const target = document.getElementById(dot.dataset.target);
      if(target) target.scrollIntoView({behavior:'smooth', block:'center'});
    });
  });
}

// ===== Process tracking steps (mobile order-tracking style) =====
const ptSteps = document.querySelectorAll('.process-tracking .process-step');
if(ptSteps.length){
  const ptIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('pt-done');
        ptIO.unobserve(entry.target);
      }
    });
  }, {threshold:0, rootMargin:'0px 0px -35% 0px'});
  ptSteps.forEach(step => ptIO.observe(step));
}

// ===== Portfolio video: play on hover, pause + reset otherwise =====
document.querySelectorAll('.portfolio-card').forEach(card => {
  const video = card.querySelector('video');
  if(!video) return;
  card.addEventListener('mouseenter', () => { video.play().catch(()=>{}); });
  card.addEventListener('mouseleave', () => { video.pause(); });
  card.addEventListener('touchstart', () => { video.play().catch(()=>{}); }, {passive:true});
});

// ===== Portfolio: draggable stacked video carousel =====
document.querySelectorAll('.stack-carousel').forEach(root => {
  const cards = Array.from(root.querySelectorAll('.stack-card'));
  const total = cards.length;
  if(!total) return;
  const dots = Array.from(root.querySelectorAll('.stack-dot'));
  const prevBtn = root.querySelector('.stack-prev');
  const nextBtn = root.querySelector('.stack-next');
  const dragEl = root.querySelector('.stack-drag');
  const stage = root.querySelector('.stack-stage');

  let progress = 0;
  let dragging = false;
  let startX = 0;
  let startProgress = 0;
  let activeIndex = -1;

  function getConfig(){
    const w = window.innerWidth;
    if(w <= 480) return {x:58, y:12, rot:6, scale:0.09, sensitivity:130, distanceDivisor:85};
    if(w <= 860) return {x:78, y:16, rot:7, scale:0.09, sensitivity:160, distanceDivisor:105};
    if(w <= 1100) return {x:110, y:22, rot:8, scale:0.09, sensitivity:200, distanceDivisor:135};
    return {x:140, y:28, rot:9, scale:0.1, sensitivity:225, distanceDivisor:165};
  }

  function shortestDiff(index, p){
    let diff = (index - p) % total;
    if(diff > total/2) diff -= total;
    if(diff < -total/2) diff += total;
    return diff;
  }

  function render(){
    const cfg = getConfig();
    cards.forEach((card, i) => {
      const diff = shortestDiff(i, progress);
      const abs = Math.abs(diff);
      const x = diff * cfg.x;
      const y = abs < 0.05 ? 0 : abs * cfg.y;
      const rot = abs < 0.05 ? 0 : diff * cfg.rot;
      const scale = 1 - abs * cfg.scale;
      const fadeStart = total/2 - 0.4;
      const opacity = abs > fadeStart ? Math.max(0, 1 - (abs - fadeStart)/0.5) : 1;
      card.style.transform = `translate(-50%,-50%) translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`;
      card.style.opacity = opacity;
      card.style.zIndex = String(Math.round(100 - abs*10));
    });
    const active = ((Math.round(progress) % total) + total) % total;
    dots.forEach((d,i) => d.classList.toggle('active', i === active));
    if(active !== activeIndex){
      cards.forEach((card,i) => {
        const v = card.querySelector('video');
        if(!v) return;
        if(i === active){ v.play().catch(()=>{}); }
        else{ v.pause(); }
      });
      activeIndex = active;
    }
  }

  function settleTo(target){
    cards.forEach(c => c.classList.remove('dragging'));
    progress = target;
    render();
  }

  function goTo(index){
    settleTo(progress + shortestDiff(index, progress));
  }

  dragEl.addEventListener('pointerdown', (e) => {
    dragging = true;
    startX = e.clientX;
    startProgress = progress;
    cards.forEach(c => c.classList.add('dragging'));
    dragEl.setPointerCapture(e.pointerId);
  });
  dragEl.addEventListener('pointermove', (e) => {
    if(!dragging) return;
    const cfg = getConfig();
    const delta = (e.clientX - startX) / cfg.sensitivity;
    progress = startProgress - delta;
    render();
  });
  function endDrag(e){
    if(!dragging) return;
    dragging = false;
    const cfg = getConfig();
    const dragDistance = e.clientX - startX;
    if(Math.abs(dragDistance) < 6){
      const rect = stage.getBoundingClientRect();
      const clickX = e.clientX - (rect.left + rect.width/2);
      let bestIndex = 0, bestDist = Infinity;
      cards.forEach((card, i) => {
        const diff = shortestDiff(i, progress);
        const cardX = diff * cfg.x;
        const d = Math.abs(cardX - clickX);
        if(d < bestDist){ bestDist = d; bestIndex = i; }
      });
      goTo(bestIndex);
      return;
    }
    let shift = Math.round(-dragDistance / cfg.distanceDivisor);
    shift = Math.max(-(total-1), Math.min(total-1, shift));
    settleTo(Math.round(startProgress) + shift);
  }
  dragEl.addEventListener('pointerup', endDrag);
  dragEl.addEventListener('pointercancel', endDrag);

  if(prevBtn) prevBtn.addEventListener('click', () => goTo(Math.round(progress) - 1));
  if(nextBtn) nextBtn.addEventListener('click', () => goTo(Math.round(progress) + 1));
  dots.forEach((d,i) => d.addEventListener('click', () => goTo(i)));

  let wheelAccum = 0;
  let wheelTimer = null;
  let wheelCooldown = false;
  root.addEventListener('wheel', (e) => {
    if(Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    if(wheelCooldown) return;
    wheelAccum += e.deltaX;
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { wheelAccum = 0; }, 200);
    if(Math.abs(wheelAccum) > 45){
      const dir = wheelAccum > 0 ? 1 : -1;
      wheelAccum = 0;
      wheelCooldown = true;
      goTo(Math.round(progress) + dir);
      setTimeout(() => { wheelCooldown = false; }, 450);
    }
  }, {passive:false});

  window.addEventListener('resize', render);
  render();
});

// ===== Mobile nav toggle =====
const burger = document.getElementById('navBurger');
const navLinks = document.querySelector('.nav-links');
if(burger){
  let savedScrollY = 0;
  function openNav(){
    savedScrollY = window.scrollY;
    navLinks.classList.add('open');
    burger.classList.add('active');
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  }
  function closeNav(){
    navLinks.classList.remove('open');
    burger.classList.remove('active');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, savedScrollY);
  }
  burger.addEventListener('click', () => {
    if(navLinks.classList.contains('open')) closeNav(); else openNav();
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', closeNav);
  });
}

// ===== Active nav link on scroll =====
const sections = ['top','services'].map(id => document.getElementById(id)).filter(Boolean);
const navA = document.querySelectorAll('.nav-links a');
const navIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      const id = entry.target.id;
      navA.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#'+id));
    }
  });
}, {rootMargin:'-40% 0px -50% 0px'});
sections.forEach(s => navIO.observe(s));

// ===== Subtle hero parallax on mousemove (desktop only) =====
const heroRight = document.querySelector('.hero-right');
if(heroRight && window.matchMedia('(hover:hover)').matches){
  document.querySelector('.hero').addEventListener('mousemove', (e) => {
    const r = heroRight.getBoundingClientRect();
    const relX = (e.clientX - r.left - r.width/2) / r.width;
    const relY = (e.clientY - r.top - r.height/2) / r.height;
    heroRight.style.transform = `perspective(1000px) rotateY(${relX*3}deg) rotateX(${-relY*3}deg)`;
  });
  document.querySelector('.hero').addEventListener('mouseleave', () => {
    heroRight.style.transform = 'none';
  });
}

// ===== Contact page: project-type chips + mailto compose =====
const chips = document.querySelectorAll('.chip[data-choice]');
if(chips.length){
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });
}
const contactForm = document.getElementById('contactForm');
if(contactForm){
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = id => (document.getElementById(id)?.value || '').trim();
    const name = val('cf-name');
    const email = val('cf-email');
    const company = val('cf-company');
    const budget = val('cf-budget');
    const message = val('cf-message');
    const project = document.querySelector('.chip.active')?.dataset.choice || '';
    const subject = encodeURIComponent(`Angebotsanfrage von ${name || 'Website'}`);
    const body = encodeURIComponent(
      [`Name: ${name}`,`E-Mail: ${email}`,`Unternehmen: ${company}`,`Projektart: ${project}`,`Budget-Rahmen: ${budget}`,'',message].join('\n')
    );
    window.location.href = `mailto:nikita@schewzmedia.de?subject=${subject}&body=${body}`;
  });
}
