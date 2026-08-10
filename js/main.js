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

// ===== Portfolio video: play on hover, pause + reset otherwise =====
document.querySelectorAll('.portfolio-card').forEach(card => {
  const video = card.querySelector('video');
  if(!video) return;
  card.addEventListener('mouseenter', () => { video.play().catch(()=>{}); });
  card.addEventListener('mouseleave', () => { video.pause(); });
  card.addEventListener('touchstart', () => { video.play().catch(()=>{}); }, {passive:true});
});

// ===== Mobile nav toggle =====
const burger = document.getElementById('navBurger');
const navLinks = document.querySelector('.nav-links');
if(burger){
  burger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    burger.classList.toggle('active');
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
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
