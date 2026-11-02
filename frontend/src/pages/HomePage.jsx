import React from 'react';
import { Link } from 'react-router-dom';

const BrandMark = () => (
  <span className="brand-mark" aria-hidden="true">
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M16 4.5c-1.6 4.2-5.8 5.2-5.8 10.1 0 3.2 2.4 5.4 5.8 5.4s5.8-2.2 5.8-5.4C21.8 9.7 17.6 8.7 16 4.5Z" />
      <path d="M8.2 20.1c1.2 4.2 4 6.4 7.8 6.4s6.6-2.2 7.8-6.4" />
    </svg>
  </span>
);

const MovementArt = () => (
  <div className="movement-art" aria-hidden="true">
    <div className="movement-orbit movement-orbit-outer" />
    <div className="movement-orbit movement-orbit-inner" />
    <div className="movement-sun" />
    <div className="movement-leaf leaf-one" />
    <div className="movement-leaf leaf-two" />
    <div className="movement-ground" />
    <div className="movement-person">
      <span className="person-head" />
      <span className="person-body" />
      <span className="person-arm person-arm-left" />
      <span className="person-arm person-arm-right" />
      <span className="person-leg person-leg-left" />
      <span className="person-leg person-leg-right" />
    </div>
    <div className="art-note art-note-top">
      <span className="art-note-icon">+</span>
      <span>MOVE AT YOUR PACE</span>
    </div>
    <div className="art-note art-note-bottom">
      <span className="art-note-dot" />
      <span>Small steps add up</span>
    </div>
  </div>
);

const steps = [
  {
    number: '01',
    title: 'Log your movement',
    description: 'Add your daily steps and keep your activity in one simple place.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7.5 4.5c1.7 0 2.5 1.4 2.5 3.2 0 1.4-.7 2.6-2 2.6S5.5 9.1 5.5 7.7s.7-3.2 2-3.2Zm8.8 6.2c1.5 0 2.2 1.2 2.2 2.8 0 1.3-.6 2.3-1.8 2.3s-2.1-1-2.1-2.3.6-2.8 1.7-2.8ZM5.2 13.4c1.2 0 1.9.9 1.9 2.1s-.6 2-1.6 2-1.8-.8-1.8-2 .6-2.1 1.5-2.1Zm11.6 4.1c1.3 0 2 .8 2 1.9 0 1-.7 1.8-1.8 1.8-1 0-1.8-.8-1.8-1.8 0-1.1.7-1.9 1.6-1.9Z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Build your reward balance',
    description: 'Earn ₹0.10 for each step you log and watch your balance grow.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3.5 14.6 9l6.1.8-4.4 4.3 1 6.1-5.3-2.9-5.4 2.9 1-6.1-4.4-4.3L9.3 9 12 3.5Z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Explore your rewards',
    description: 'Browse available rewards and choose what motivates you.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4.5 8.5h15v11h-15v-11Zm-1.5 0h18v-4h-18v4Zm9 0v11m0-15c-2.2 0-4-1.8-4-3 0-.8.6-1.3 1.4-1.3 1.5 0 2.6 2.2 2.6 4.3Zm0 0c0-2.1 1.1-4.3 2.6-4.3.8 0 1.4.5 1.4 1.3 0 1.2-1.8 3-4 3Z" />
      </svg>
    ),
  },
];

export const HomePage = () => (
  <div className="home-page">
    <header className="public-header">
      <div className="home-container public-header-content">
        <Link to="/" className="brand-lockup" aria-label="Health Rewards home">
          <BrandMark />
          <span>health<span className="brand-accent">rewards</span></span>
        </Link>
        <nav className="public-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#our-approach">Our approach</a>
          <Link to="/login" className="public-login">Sign in</Link>
          <Link to="/register" className="btn btn-primary public-cta">Get started</Link>
        </nav>
      </div>
    </header>

    <main>
      <section className="home-hero">
        <div className="home-container hero-layout">
          <div className="hero-copy">
            <div className="eyebrow"><span /> WELLNESS, WITH A LITTLE MORE PURPOSE</div>
            <h1>Make every step <span>count.</span></h1>
            <p className="hero-description">
              Turn everyday movement into rupee-denominated rewards, discover the catalog, and build a
              routine that feels good—one step at a time.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary hero-primary">
                Create your account <span aria-hidden="true">→</span>
              </Link>
              <a href="#how-it-works" className="hero-secondary">
                See how it works <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="hero-reassurance">
              <span className="reassurance-check" aria-hidden="true">✓</span>
              A simple, personal way to stay motivated
            </div>
          </div>
          <div className="hero-visual">
            <MovementArt />
            <div className="hero-visual-caption">
              <span className="caption-line" />
              <span>Progress looks different for everyone.</span>
            </div>
          </div>
        </div>
        <div className="hero-bottom-wash" aria-hidden="true" />
      </section>

      <section className="how-section" id="how-it-works">
        <div className="home-container">
          <div className="section-heading">
            <span className="section-kicker">A LITTLE MOMENTUM GOES A LONG WAY</span>
            <h2>Healthy habits, made rewarding.</h2>
            <p>Keep it simple: move, track your progress, and find your motivation.</p>
          </div>
          <div className="steps-grid">
            {steps.map((step) => (
              <article className="how-card" key={step.number}>
                <div className="how-card-top">
                  <span className="how-icon">{step.icon}</span>
                  <span className="how-number">{step.number}</span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="approach-section" id="our-approach">
        <div className="home-container approach-layout">
          <div className="approach-mark" aria-hidden="true">
            <BrandMark />
          </div>
          <div>
            <span className="section-kicker">YOUR JOURNEY, YOUR OWN</span>
            <h2>Motivation should feel encouraging, not overwhelming.</h2>
            <p>
              Health Rewards is designed to help you notice your progress and
              celebrate consistency. Start where you are, move at your own pace,
              and explore rewards when you’re ready.
            </p>
            <Link to="/register" className="text-link">Start your journey <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>
    </main>

    <footer className="public-footer">
      <div className="home-container public-footer-content">
        <Link to="/" className="brand-lockup footer-brand">
          <BrandMark />
          <span>health<span className="brand-accent">rewards</span></span>
        </Link>
        <p>Small steps. Meaningful momentum.</p>
        <div className="footer-links">
          <Link to="/login">Sign in</Link>
          <Link to="/register">Create account</Link>
        </div>
      </div>
    </footer>
  </div>
);
