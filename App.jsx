import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const products = [
  { name: 'Solstice Vase', type: 'Sculptural vase · Sand', price: '₹2,400', image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=85', tag: 'Bestseller' },
  { name: 'Dune Dinner Set', type: 'Stoneware · Set of 2', price: '₹1,850', image: 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=900&q=85', tag: 'Hand-thrown' },
  { name: 'Moss Planter', type: 'Planter · Olive glaze', price: '₹1,200', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=85', tag: 'Small batch' },
  { name: 'Sunday Mug', type: 'Stoneware · 280 ml', price: '₹650', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fanych?auto=format&fit=crop&w=900&q=85', tag: 'Everyday ritual' }
];

function PotteryShader() {
  const mesh = useRef();
  const material = useRef();
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.22) * 0.22;
      mesh.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.06;
    }
    if (material.current) material.current.uniforms.uTime.value += delta;
  });

  const points = [];
  const profile = [
    [0.01, -1.3], [0.42, -1.28], [0.58, -1.05], [0.72, -0.62],
    [0.78, -0.18], [0.69, 0.22], [0.48, 0.55], [0.30, 0.78],
    [0.28, 1.03], [0.34, 1.12], [0.31, 1.17], [0.23, 1.14],
    [0.23, 0.98], [0.25, 0.72], [0.43, 0.47], [0.61, 0.12],
    [0.62, -0.25], [0.51, -0.72], [0.36, -1.05], [0.01, -1.08]
  ];
  profile.forEach(([x, y]) => points.push(new THREE.Vector2(x, y)));

  const vertexShader = `
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    uniform float uTime;
    void main() {
      vUv = uv;
      vec3 p = position;
      float ripple = sin(p.y * 8.0 + uTime * 0.8) * 0.009;
      p.x += normal.x * ripple;
      p.z += normal.z * ripple;
      vPosition = p;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `;
  const fragmentShader = `
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    uniform float uTime;
    void main() {
      vec3 clay = vec3(0.57, 0.25, 0.13);
      vec3 highlight = vec3(0.88, 0.58, 0.35);
      float bands = sin(vPosition.y * 46.0 + sin(vPosition.x * 10.0) * 0.7) * 0.035;
      float light = 0.45 + 0.55 * max(dot(normalize(vNormal), normalize(vec3(-0.5, 0.8, 1.0))), 0.0);
      float rim = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 2.0);
      vec3 color = mix(clay, highlight, clamp(vUv.y * 0.35 + bands + rim * 0.25, 0.0, 0.8));
      color *= light;
      gl_FragColor = vec4(color, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `;

  return (
    <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.18}>
      <mesh ref={mesh} castShadow receiveShadow>
        <latheGeometry args={[points, 96]} />
        <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader}
          uniforms={{ uTime: { value: 0 } }} />
      </mesh>
    </Float>
  );
}

function HeroScene() {
  return <Canvas camera={{ position: [0, 0.15, 5.4], fov: 38 }} dpr={[1, 1.7]} gl={{ antialias: true, alpha: true }}>
    <ambientLight intensity={1.4} />
    <directionalLight position={[3, 5, 4]} intensity={3.1} castShadow />
    <pointLight position={[-3, 1, -2]} color="#d98b52" intensity={9} distance={8} />
    <PotteryShader />
    <ContactShadows position={[0, -1.45, 0]} opacity={0.38} scale={5} blur={2.5} far={3} />
    <Environment preset="city" />
    <EffectComposer>
      <Bloom intensity={0.35} luminanceThreshold={0.72} mipmapBlur />
      <Vignette eskil={false} offset={0.2} darkness={0.35} />
    </EffectComposer>
  </Canvas>;
}

function ScratchReveal({ onComplete }) {
  const canvasRef = useRef(null);
  const [active, setActive] = useState(true);
  const drawing = useRef(false);
  const scratched = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#30241d';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.fillStyle = '#eadbca';
      ctx.textAlign = 'center';
      ctx.font = 'italic 16px "DM Sans", sans-serif';
      ctx.fillText('A little patience reveals something beautiful', window.innerWidth / 2, window.innerHeight / 2 + 72);
      ctx.font = '600 11px "DM Sans", sans-serif';
      ctx.letterSpacing = '3px';
      ctx.fillText('SCRATCH TO ENTER  ✳', window.innerWidth / 2, window.innerHeight / 2 + 105);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const scratch = (event) => {
    if (!drawing.current || !canvasRef.current || !active) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(event.clientX - rect.left, event.clientY - rect.top, 42, 0, Math.PI * 2);
    ctx.fill();
    scratched.current += 1;
    if (scratched.current > 26) {
      setActive(false);
      onComplete?.();
    }
  };

  if (!active) return null;
  return <div className="scratch-wrap">
    <div className="scratch-copy"><span className="scratch-eyebrow">TERRACOTTA STUDIO · EST. 2024</span><h2>Made slowly.<br/><i>Kept forever.</i></h2><span className="scratch-hint">SCRATCH ANYWHERE TO DISCOVER</span></div>
    <canvas ref={canvasRef} className="scratch-canvas"
      onPointerDown={(e) => { drawing.current = true; e.currentTarget.setPointerCapture(e.pointerId); scratch(e); }}
      onPointerMove={scratch}
      onPointerUp={() => { drawing.current = false; }}
      onPointerCancel={() => { drawing.current = false; }} />
    <button className="skip-scratch" onClick={() => { setActive(false); onComplete?.(); }}>Skip intro ↗</button>
  </div>;
}

function Cursor() {
  const cursor = useRef(null);
  useEffect(() => {
    const el = cursor.current;
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;
    const move = (e) => gsap.to(el, { x: e.clientX, y: e.clientY, duration: 0.18, ease: 'power3.out' });
    const hover = () => el.classList.add('cursor-hover');
    const leave = () => el.classList.remove('cursor-hover');
    window.addEventListener('pointermove', move);
    const links = document.querySelectorAll('a, button, .product-card');
    links.forEach((link) => { link.addEventListener('mouseenter', hover); link.addEventListener('mouseleave', leave); });
    return () => {
      window.removeEventListener('pointermove', move);
      links.forEach((link) => { link.removeEventListener('mouseenter', hover); link.removeEventListener('mouseleave', leave); });
    };
  }, []);
  return <div className="custom-cursor" ref={cursor}><span>✳</span></div>;
}

function App() {
  const [showScratch, setShowScratch] = useState(true);
  const [cart, setCart] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    const tick = (time) => lenis.raf(time * 1000);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      gsap.from('.hero-kicker, .hero-title, .hero-bottom', { y: 32, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.2 });
      gsap.utils.toArray('.reveal-up').forEach((el) => gsap.fromTo(el, { y: 48, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      }));
      gsap.utils.toArray('.product-card').forEach((el, i) => gsap.fromTo(el, { y: 38, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7, delay: i * 0.08, ease: 'power2.out',
        scrollTrigger: { trigger: '.shop-grid', start: 'top 82%', once: true }
      }));
      gsap.to('.story-orbit', { rotation: 360, duration: 34, repeat: -1, ease: 'none' });
      gsap.to('.marquee-track', { xPercent: -35, duration: 24, repeat: -1, ease: 'none' });
    });
    return () => { ctx.revert(); gsap.ticker.remove(tick); lenis.destroy(); };
  }, []);

  const addToCart = () => setCart((n) => n + 1);

  return <>
    <Cursor />
    <div className="announcement">A slower kind of everyday luxury <span>✳</span> Free shipping on orders over ₹2,500</div>
    <header className="site-header">
      <a className="brand" href="#home" aria-label="Terracotta Studio home"><span className="brand-mark">t.</span><span>TERRACOTTA<small>STUDIO & OBJECTS</small></span></a>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? 'CLOSE −' : 'MENU +'}</button>
      <nav className={menuOpen ? 'nav nav-open' : 'nav'}>
        <a href="#shop" onClick={() => setMenuOpen(false)}>Shop</a><a href="#story" onClick={() => setMenuOpen(false)}>Our story</a><a href="#process" onClick={() => setMenuOpen(false)}>The process</a><a href="#journal" onClick={() => setMenuOpen(false)}>Journal</a>
      </nav>
      <div className="header-actions"><a className="search-link" href="#shop">Explore ↘</a><button className="cart-button" onClick={() => alert(`Your bag has ${cart} item${cart === 1 ? '' : 's'}. Connect checkout to accept orders.`)}>Bag ({cart})</button></div>
    </header>

    <main>
      <section className="hero" id="home">
        <div className="hero-text">
          <p className="eyebrow hero-kicker"><span className="eyebrow-dot"></span> OBJECTS MADE BY HAND, MADE TO LAST</p>
          <h1 className="hero-title">The beauty of<br/><em>being imperfect.</em></h1>
          <p className="hero-description">Thoughtful pottery for slow mornings, shared tables, and all the little rituals that make a life.</p>
          <div className="hero-ctas"><a className="button button-dark" href="#shop">Discover the collection <span>↗</span></a><a className="text-link" href="#story">Our philosophy <span>↓</span></a></div>
          <div className="hero-bottom"><span>HAND-THROWN IN SMALL BATCHES</span><span>26° 54' N · JAIPUR, INDIA</span></div>
        </div>
        <div className="hero-art" aria-label="Interactive 3D handmade pottery vase">
          <div className="art-halo"></div><div className="art-label label-top">FORM STUDY Nº 01 <span>—</span></div>
          <div className="three-canvas"><HeroScene /></div>
          <div className="art-label label-bottom"><span>01 / 04</span> EARTHENWARE · MATTE CLAY</div>
          <div className="art-stamp">MADE<br/>BY HAND<br/><b>✳</b></div>
        </div>
        <div className="hero-side-note">FORM FOLLOWS FEELING — EST. MMXXIV</div>
      </section>

      <div className="ticker"><div className="marquee-track">{Array.from({length: 5}).map((_, i) => <span key={i}>MADE WITH INTENTION <b>✳</b> ROOTED IN EARTH <b>✳</b> DESIGNED FOR DAILY LIFE <b>✳</b></span>)}</div></div>

      <section className="shop-section section-pad" id="shop">
        <div className="section-heading reveal-up"><div><p className="eyebrow">THE OBJECTS</p><h2>Small things.<br/><em>Lasting meaning.</em></h2></div><div className="heading-right"><p>Every piece is shaped by hand, finished with care, and made to find its way into your everyday.</p><a className="text-link" href="#shop">Shop all objects ↗</a></div></div>
        <div className="shop-grid">
          {products.map((p, i) => <article className="product-card" key={p.name}>
            <div className="product-image-wrap"><img src={p.image} alt={p.name} loading="lazy" /><span className="product-tag">{p.tag}</span><button className="quick-add" onClick={addToCart} aria-label={`Add ${p.name} to bag`}>＋</button><span className="product-index">0{i + 1}</span></div>
            <div className="product-info"><div><h3>{p.name}</h3><p>{p.type}</p></div><span className="price">{p.price}</span></div>
          </article>)}
        </div>
      </section>

      <section className="story-section section-pad" id="story">
        <div className="story-image reveal-up"><img src="https://images.unsplash.com/photo-1565193298595-6e8a7b3f3d80?auto=format&fit=crop&w=1200&q=85" alt="Hands shaping clay on a pottery wheel" loading="lazy"/><span className="image-caption">A HUMAN TOUCH IN EVERY CURVE</span><div className="story-orbit"><span>CLAY · CRAFT · CONNECTION · </span></div></div>
        <div className="story-copy reveal-up"><p className="eyebrow">A NOTE FROM THE STUDIO</p><h2>Not perfect.<br/><em>Perfectly human.</em></h2><p>We believe the things we live with should carry a little bit of life in them. A thumbprint. A soft uneven edge. A glaze that settles differently every time.</p><p>Made in small batches with local artisans, our ceramics celebrate the beauty of the hand-made and the joy of using something made with care.</p><a className="button button-outline" href="#process">Get to know us <span>↗</span></a><div className="signature">Made slowly, <i>with love.</i></div></div>
      </section>

      <section className="process-section section-pad" id="process">
        <div className="process-heading reveal-up"><p className="eyebrow">FROM EARTH TO EVERYDAY</p><h2>Good things take<br/><em>a little time.</em></h2><p>Four thoughtful steps. One object you'll reach for every day.</p></div>
        <div className="process-grid">
          {[['01','Gather','Locally sourced clay, chosen for its character and strength.','◌'],['02','Shape','Every form is thrown, trimmed, and finished by skilled hands.','↗'],['03','Fire','Kiln-fired slowly to bring out the depth of every earthy glaze.','♨'],['04','Live with it','Packed with care and ready to become part of your rituals.','✳']].map(([n,t,d,s]) => <div className="process-step reveal-up" key={n}><span className="step-symbol">{s}</span><span className="step-number">{n} / THE PROCESS</span><h3>{t}</h3><p>{d}</p><span className="step-line"></span></div>)}
        </div>
      </section>

      <section className="quote-section"><div className="quote-mark">“</div><blockquote className="reveal-up">A home isn't made in a day.<br/>It's <em>collected, slowly.</em></blockquote><p>OBJECTS WITH A STORY TO TELL</p></section>

      <section className="journal-section section-pad" id="journal">
        <div className="section-heading reveal-up"><div><p className="eyebrow">NOTES FROM OUR WORLD</p><h2>The art of <em>everyday.</em></h2></div><a className="text-link" href="#journal">Read the journal ↗</a></div>
        <div className="journal-grid">
          <a className="journal-card reveal-up" href="#story"><img src="https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=900&q=85" alt="Quiet minimal interior" loading="lazy"/><span className="eyebrow">SLOW LIVING · 5 MIN READ</span><h3>Making room for the everyday ritual</h3><span className="journal-arrow">↗</span></a>
          <a className="journal-card reveal-up" href="#process"><img src="https://images.unsplash.com/photo-1565193298595-6e8a7b3f3d80?auto=format&fit=crop&w=900&q=85" alt="Pottery craftsmanship" loading="lazy"/><span className="eyebrow">IN THE STUDIO · 3 MIN READ</span><h3>Why we choose to make things slowly</h3><span className="journal-arrow">↗</span></a>
        </div>
      </section>

      <section className="newsletter-section"><p className="eyebrow">A LETTER FROM THE STUDIO</p><h2>Good things, <em>occasionally.</em></h2><p>New collections, studio notes, and little reminders to slow down.</p><form onSubmit={(e) => { e.preventDefault(); alert('Thanks for joining our studio letter! Connect this form to your email service before launch.'); }}><input type="email" placeholder="Your email address" required aria-label="Email address"/><button type="submit">Count me in ↗</button></form><small>Only the good stuff. No noise.</small></section>
    </main>

    <footer className="site-footer"><div className="footer-top"><a className="brand footer-brand" href="#home"><span className="brand-mark">t.</span><span>TERRACOTTA<small>STUDIO & OBJECTS</small></span></a><p>Made with earth.<br/><em>Meant for living.</em></p><a href="#home" className="back-top">BACK TO TOP ↑</a></div><div className="footer-bottom"><span>© 2026 TERRACOTTA STUDIO</span><span>HANDMADE IN INDIA WITH CARE</span><div><a href="#shop">SHOP</a><a href="#story">INSTAGRAM ↗</a><a href="#story">CONTACT ↗</a></div></div></footer>
    {showScratch && <ScratchReveal onComplete={() => setShowScratch(false)} />}
  </>;
}

export default App;
