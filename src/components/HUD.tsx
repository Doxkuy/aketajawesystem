import { useEffect, useState } from 'react';
import { Shield, Compass, Cpu, Volume2, VolumeX, Activity } from 'lucide-react';


interface HUDProps {
  currentSection: number;
  setCurrentSection: (section: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
  playHover: () => void;
  playClick: () => void;
}

export const HUD = ({
  currentSection,
  setCurrentSection,
  isMuted,
  toggleMute,
  playHover,
  playClick
}: HUDProps) => {
  const [currentTime, setCurrentTime] = useState('');

  // Clock updates for realistic laboratory HUD
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const hrs = pad(d.getHours());
      const mins = pad(d.getMinutes());
      const secs = pad(d.getSeconds());
      setCurrentTime(`${hrs}:${mins}:${secs} UTC+9`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = (sectionIndex: number) => {
    playClick();
    
    // Find the section element and scroll
    const sections = document.querySelectorAll('.section');
    if (sections[sectionIndex]) {
      sections[sectionIndex].scrollIntoView({ behavior: 'smooth' });
      setCurrentSection(sectionIndex);
    }
  };

  const navItems = [
    { label: 'SYS_HERO', index: 0 },
    { label: 'SPECIES_DB', index: 1 },
    { label: 'HOLO_MAP', index: 2 },
    { label: 'CONSERV_LAB', index: 3 }
  ];

  return (
    <div className="hud-layer">
      {/* Top Header Bar */}
      <header className="hud-header hud-interactive">
        <div 
          className="hud-logo" 
          onClick={() => handleNavClick(0)}
          onMouseEnter={playHover}
        >
          <Shield className="hud-logo-icon" />
          <div>
            <span className="hud-logo-text">AKETAJAWE LOLOBATA</span>
            <span className="hud-logo-subtext">NATIONAL PARK CONSERVATION SYSTEM</span>
          </div>
        </div>

        {/* Center Section Nav Links */}
        <nav className="hud-nav">
          {navItems.map((item) => (
            <button
              key={item.index}
              onClick={() => handleNavClick(item.index)}
              onMouseEnter={playHover}
              className={`hud-nav-item hud-font-mono ${currentSection === item.index ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right side Audio & Connection Controls */}
        <div className="hud-controls">
          <div 
            className={`audio-visualizer ${isMuted ? 'muted' : ''}`} 
            onClick={toggleMute}
            onMouseEnter={playHover}
            title={isMuted ? 'Unmute Synth Audio' : 'Mute Synth Audio'}
          >
            <div className="audio-bar" />
            <div className="audio-bar" />
            <div className="audio-bar" />
            <div className="audio-bar" />
            <div className="audio-bar" />
          </div>
          <button 
            onClick={toggleMute}
            onMouseEnter={playHover}
            style={{
              background: 'none',
              border: 'none',
              color: isMuted ? 'var(--color-text-muted)' : 'var(--color-cyan)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </header>

      {/* Left-side Telemetry Readings (GPS, Compass) */}
      <div className="hud-telemetry-left">
        <div className="hud-telemetry-row">
          <Compass size={12} className="hud-telemetry-label" />
          <span className="hud-telemetry-label">POSITION_LOC:</span>
          <span className="hud-telemetry-value">01°29'08.2"N 127°39'44.1"E</span>
        </div>
        <div className="hud-telemetry-row">
          <Activity size={12} className="hud-telemetry-label" />
          <span className="hud-telemetry-label">NODE_STATUS:</span>
          <span className="hud-telemetry-value">
            <span className="hud-dot" /> ACTIVE_LINK_SYNC
          </span>
        </div>
        <div className="hud-telemetry-row">
          <span className="hud-telemetry-label">TIME_MONITOR:</span>
          <span className="hud-telemetry-value">{currentTime}</span>
        </div>
      </div>

      {/* Right-side Telemetry Readings (Lab parameters) */}
      <div className="hud-telemetry-right">
        <div className="hud-telemetry-row">
          <span className="hud-telemetry-label">ALTITUDE_MSL:</span>
          <span className="hud-telemetry-value">1,250 M</span>
        </div>
        <div className="hud-telemetry-row">
          <span className="hud-telemetry-label">TERM_ID:</span>
          <span className="hud-telemetry-value">T-AL-9026</span>
        </div>
        <div className="hud-telemetry-row">
          <Cpu size={12} className="hud-telemetry-label" />
          <span className="hud-telemetry-label">SYS_FREQ:</span>
          <span className="hud-telemetry-value">60.2 HZ</span>
        </div>
      </div>
    </div>
  );
};
export default HUD;
