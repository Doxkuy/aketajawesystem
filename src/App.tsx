import React, { useState, useRef, useEffect } from 'react';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { HUD } from './components/HUD';
import { ConservationLab } from './components/ConservationLab';
import { useSynthesizedAudio } from './hooks/useSynthesizedAudio';
import type { BiodiversityItem, MapBlock } from './types';
import { Play, Terminal } from 'lucide-react';


const biodiversityItems: BiodiversityItem[] = [
  {
    id: 'bidadari',
    name: "Wallace's Standardwing (Bidadari)",
    latinName: "Semioptera wallacii",
    description: "The flagship avian of Halmahera. Notable for two pairs of long white plumes extending from the male's wing joints, used in spectacular airborne mating dances.",
    ecosystem: "Wallacea Primary Canopy",
    status: "PROTECTED_FAUNA",
    rarity: "CRITICAL_ENDEMIC",
    glowColor: "#ffaa00"
  },
  {
    id: 'tugutil',
    name: "Tobelo Dalam Tribe (Tugutil)",
    latinName: "Nomadic Forest Guardians",
    description: "The indigenous nomadic hunter-gatherer communities residing inside Aketajawe. They live in absolute symbiosis, serving as organic conservation guardians.",
    ecosystem: "Jungle Harmonization",
    status: "CULTURAL_HERITAGE",
    rarity: "INDIGENOUS_TRUST",
    glowColor: "#39ff14"
  },
  {
    id: 'damar',
    name: "Damar & Ebony Giants",
    latinName: "Agathis dammara & Diospyros",
    description: "Giant evergreen forest trees reaching heights of 60 meters. These ancient trunks anchor the limestone soil structure, forming the dense high canopy layers.",
    ecosystem: "Limestone Rainforest",
    status: "PRIMARY_FLORA",
    rarity: "ANCIENT_CANOPY",
    glowColor: "#00f0ff"
  },
  {
    id: 'nuri',
    name: "Moluccan King Parrot",
    latinName: "Alisterus amboinensis",
    description: "A striking, vibrant parrot with bright red and blue plumage. Found in primary forest zones, feeding on local fruits, seeds, and buds in canopy layers.",
    ecosystem: "Mid-Canopy Sub-Montane",
    status: "PROTECTED_AVIAN",
    rarity: "REGIONAL_ENDEMIC",
    glowColor: "#ffaa00"
  },
  {
    id: 'cuscus',
    name: "Blue-eyed Cuscus",
    latinName: "Phalanger ornatus",
    description: "A rare nocturnal marsupial endemic to Halmahera. Features thick ornate fur and striking pale blue eyes, nesting in hollow branches of primary giants.",
    ecosystem: "Montane Oak Forests",
    status: "VULNERABLE_MAMMAL",
    rarity: "REGIONAL_ENDEMIC",
    glowColor: "#00f0ff"
  }
];

const mapBlocks: MapBlock[] = [
  {
    id: 'aketajawe',
    name: 'Aketajawe',
    area: '77,135 Hectares',
    ecosystem: 'Limestone & Sub-Montane Forest',
    features: ["Wallace's Standardwing Lek Sites", 'Tugutil Nomadic Zones', 'Ak Lamo Cave Systems'],
    coordinates: '00°45\'N 127°52\'E',
    threatLevel: 'Low',
    description: 'The southern block of the national park, characterized by steep karst mountains, expansive cave systems, and high densities of endemic standardwings.'
  },
  {
    id: 'lolobata',
    name: 'Lolobata',
    area: '90,265 Hectares',
    ecosystem: 'Lowland Forest & Coastal Mangroves',
    features: ['Moluccan King Parrot Nesting', 'Riverine Lowland Corridors', 'Boli River Telemetry Sensor'],
    coordinates: '01°40\'N 128°02\'E',
    threatLevel: 'Moderate',
    description: 'The northern block of the national park, composed of lowland ecosystems, dense river corridors, and borders with coastal mangrove swamps.'
  }
];

export const App = () => {
  const [hasEntered, setHasEntered] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isCarouselDragging, setIsCarouselDragging] = useState(false);
  const [activeBlock, setActiveBlock] = useState<MapBlock | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const {
    isMuted,
    toggleMute,
    playHover,
    playClick,
    playSuccess,
    startBackgroundHum
  } = useSynthesizedAudio();

  // Simulated cyber-preloader loading screen
  useEffect(() => {
    if (hasEntered) return;
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 8) + 4;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [hasEntered]);

  const handleEnterExperience = () => {
    if (loadingProgress < 100) return;
    playSuccess();
    startBackgroundHum();
    setHasEntered(true);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const height = window.innerHeight;
    const nextSection = Math.round(scrollTop / height);
    if (nextSection !== currentSection) {
      setCurrentSection(nextSection);
      playClick();
    }
  };

  const selectBlock = (block: MapBlock) => {
    playClick();
    setActiveBlock(block);
  };

  const handleExploreMapBtn = () => {
    playClick();
    // Scroll to section index 2 (HOLO_MAP)
    const sections = document.querySelectorAll('.section');
    if (sections[2] && scrollContainerRef.current) {
      sections[2].scrollIntoView({ behavior: 'smooth' });
      setCurrentSection(2);
    }
  };

  return (
    <>
      {/* Background Cybernetic scanlines */}
      <div className="scanlines" />

      {/* Pre-Experience Loader Screen (Bypasses Browser Audio Restrictions) */}
      {!hasEntered && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#05080c',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'var(--font-mono)',
          padding: '2rem'
        }}>
          {/* Futuristic grid background decoration */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(rgba(0, 240, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.02) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            pointerEvents: 'none'
          }} />

          <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center', zIndex: 10 }}>
            <h2 style={{
              fontFamily: 'var(--font-title)',
              color: '#fff',
              fontSize: '1.2rem',
              letterSpacing: '3px',
              marginBottom: '2rem'
            }}>
              AKETAJAWE_SYS_INIT
            </h2>
            
            {/* Holographic Radar graphic */}
            <div style={{
              width: '120px',
              height: '120px',
              border: '1px solid rgba(0, 240, 255, 0.15)',
              borderRadius: '50%',
              margin: '0 auto 2.5rem auto',
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                border: '1px dashed rgba(57, 255, 20, 0.25)',
                borderRadius: '50%',
                animation: 'spin-radar 12s linear infinite'
              }} />
              <Terminal style={{
                position: 'absolute',
                color: 'var(--color-cyan)',
                filter: 'drop-shadow(0 0 5px var(--color-cyan))',
                width: '24px',
                height: '24px'
              }} />
            </div>

            {/* Preloader stats */}
            <div style={{ fontSize: '9px', color: 'var(--color-text-muted)', marginBottom: '0.5rem', textAlign: 'left' }}>
              <div>SYS_LOAD_MATRIX: {Math.min(loadingProgress, 100)}%</div>
              <div style={{ color: 'var(--color-cyan)', marginTop: '4px' }}>
                {loadingProgress < 50 ? '▶ ACCESSING WALLACEA CORE LAB...' : 
                 loadingProgress < 100 ? '▶ CALIBRATING SHADERS & BIO_CHIRPS...' : 
                 '▶ TERMINAL ONLINE. CONNECTIVITY SECURED.'}
              </div>
            </div>

            {/* Preloader progress bar */}
            <div style={{
              height: '4px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(0, 240, 255, 0.15)',
              borderRadius: '2px',
              marginBottom: '2.5rem',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, var(--color-cyan), var(--color-neon-green))',
                width: `${Math.min(loadingProgress, 100)}%`,
                boxShadow: '0 0 10px var(--color-cyan)',
                transition: 'width 0.1s ease-out'
              }} />
            </div>

            <button
              onClick={handleEnterExperience}
              onMouseEnter={playHover}
              disabled={loadingProgress < 100}
              className="cyber-button"
              style={{
                width: '100%',
                opacity: loadingProgress < 100 ? 0.3 : 1,
                cursor: loadingProgress < 100 ? 'not-allowed' : 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <Play size={12} fill="currentColor" />
                <span>ENTER CONSOLE EXPERIENCE</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Main HUD overlay - Rendered once loaded */}
      {hasEntered && (
        <HUD
          currentSection={currentSection}
          setCurrentSection={setCurrentSection}
          isMuted={isMuted}
          toggleMute={toggleMute}
          playHover={playHover}
          playClick={playClick}
        />
      )}

      {/* 3D WebGL Canvas Layer - Rendered once loaded */}
      {hasEntered && (
        <BackgroundCanvas
          currentSection={currentSection}
          biodiversityItems={biodiversityItems}
          carouselActiveIndex={carouselIndex}
          setCarouselActiveIndex={setCarouselIndex}
          onCarouselDrag={setIsCarouselDragging}
          isCarouselDragging={isCarouselDragging}
          mapBlocks={mapBlocks}
          activeMapBlock={activeBlock}
          onBlockSelect={selectBlock}
        />
      )}

      {/* HTML Content Slides (absolute overlaid over canvas, snapping vertically) */}
      {hasEntered && (
        <div 
          className="scroll-container" 
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {/* Section 0: Hero Splash Screen */}
          <section className="section">
            <div className="hero-content">
              <span className="hero-sub">WALLACEA FOREST TELEMETRY</span>
              <h1 className="hero-title">AKETAJAWE LOLOBATA</h1>
              <h2 className="hero-title" style={{ color: 'var(--color-cyan)', marginTop: '-1.5rem', fontSize: 'clamp(1.8rem, 4.5vw, 3.2rem)' }}>
                THE LAST WILDERNESS
              </h2>
              <p className="hero-desc">
                Deploying high-fidelity neural grids across North Maluku's primary jungle to monitor, analyze, and preserve Indonesia's rare, endemic biodiversity.
              </p>
              <div className="hero-actions">
                <button 
                  onClick={handleExploreMapBtn} 
                  onMouseEnter={playHover}
                  className="cyber-button"
                >
                  INITIALIZE TELEMETRY MAP
                </button>
              </div>
            </div>

            {/* Scroll instruction indicator */}
            <div className="scroll-indicator">
              <span className="scroll-indicator-text">DRAG OR SCROLL DOWN</span>
              <div className="scroll-indicator-mouse">
                <div className="scroll-indicator-wheel" />
              </div>
            </div>
          </section>

          {/* Section 1: Biodiversity Explorer */}
          <section className="section">
            <div className="biodiversity-container">
              <div className="section-header">
                <span className="section-num">ARCHIVE // LAYER_01</span>
                <h2 className="section-title">ENDEMIC BIODIVERSITY</h2>
                <div className="carousel-instructions">◀ DRAG MOUSE TO ROTATE SYSTEM SPECIES DB ▶</div>
              </div>

              {/* Data panel showing details of the highlighted item */}
              <div className="carousel-ui-overlay">
                <div className="carousel-data-card glass-panel" onMouseEnter={playHover}>
                  <div className="card-latin">{biodiversityItems[carouselIndex].latinName}</div>
                  <h3 className="card-title">{biodiversityItems[carouselIndex].name}</h3>
                  <p className="card-desc">{biodiversityItems[carouselIndex].description}</p>
                  
                  <div className="card-meta">
                    <div>
                      <span className="card-meta-label">HABITAT_ZONE: </span>
                      <span className="card-meta-val">{biodiversityItems[carouselIndex].ecosystem}</span>
                    </div>
                    <div>
                      <span className="card-meta-label">LEGAL_VAL: </span>
                      <span className="card-meta-val" style={{ color: 'var(--color-cyan)' }}>PROTECTED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Interactive Holographic Map */}
          <section className="section">
            <div className="map-container">
              {/* Map Info Sidebar */}
              <div className="map-info">
                <div className="glass-panel map-control-panel" onMouseEnter={playHover}>
                  <span className="section-num">MAP // LAYER_02</span>
                  <h2 className="section-title" style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>
                    HOLO_MAP REGION
                  </h2>
                  <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--color-text-muted)' }}>
                    Visualizing the North Maluku landscape. Halmahera Island is split into dual preservation blocks managed by the park office.
                  </p>

                  <div className="map-buttons-grid">
                    {mapBlocks.map((block) => (
                      <button
                        key={block.id}
                        onClick={() => selectBlock(block)}
                        onMouseEnter={playHover}
                        className={`map-btn ${activeBlock?.id === block.id ? 'active' : ''}`}
                      >
                        {block.name.toUpperCase()} BLOCK
                      </button>
                    ))}
                    <button
                      onClick={() => { playClick(); setActiveBlock(null); }}
                      onMouseEnter={playHover}
                      className={`map-btn ${!activeBlock ? 'active' : ''}`}
                      style={{ gridColumn: 'span 2', textAlign: 'center' }}
                    >
                      RESET COMPASS ZOOM
                    </button>
                  </div>

                  {/* Dynamic specs based on clicked block */}
                  {activeBlock ? (
                    <div className="map-specs" style={{ animation: 'blink 0.8s ease 1' }}>
                      <div className="map-spec-row">
                        <span className="map-spec-lbl">BLOCK SPECIFICATION:</span>
                        <span className="map-spec-val" style={{ color: '#ffd700' }}>{activeBlock.name.toUpperCase()}</span>
                      </div>
                      <div className="map-spec-row">
                        <span className="map-spec-lbl">SURFACE AREA:</span>
                        <span className="map-spec-val">{activeBlock.area}</span>
                      </div>
                      <div className="map-spec-row">
                        <span className="map-spec-lbl">GPS_COORD:</span>
                        <span className="map-spec-val">{activeBlock.coordinates}</span>
                      </div>
                      <div className="map-spec-row" style={{ flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
                        <span className="map-spec-lbl">ECOSYSTEM TYPE:</span>
                        <span style={{ color: '#fff', fontSize: '0.7rem' }}>{activeBlock.ecosystem}</span>
                      </div>
                      <div className="map-spec-row" style={{ flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
                        <span className="map-spec-lbl">MONITORED FEATURES:</span>
                        <span style={{ color: '#fff', fontSize: '0.7rem' }}>
                          {activeBlock.features.join(' | ')}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="map-specs" style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--color-text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                      ◀ SELECT MARKER IN 3D OR CLICK BUTTON ABOVE TO INTERACT ▶
                    </div>
                  )}
                </div>
              </div>
              
              {/* Empty placeholder grid cell since the 3D canvas renders the map on the right side of the screen! */}
              <div style={{ pointerEvents: 'none' }} />
            </div>
          </section>

          {/* Section 3: Telemetry Control Center (Conservation Lab) */}
          <section className="section">
            <ConservationLab
              playHover={playHover}
              playClick={playClick}
              playSuccess={playSuccess}
            />
          </section>
        </div>
      )}
    </>
  );
};
export default App;
