import { useState } from 'react';
import { Heart } from 'lucide-react';


interface LabProps {
  playHover: () => void;
  playClick: () => void;
  playSuccess: () => void;
}

export const ConservationLab = ({ playHover, playClick, playSuccess }: LabProps) => {
  const [treeCount, setTreeCount] = useState(1289304);
  const [hasDonated, setHasDonated] = useState(false);

  const handleDonate = () => {
    if (hasDonated) return;
    playSuccess();
    setHasDonated(true);
    setTreeCount(prev => prev + 125); // Add 125 saplings!
  };

  const threatLogs = [
    { area: 'LOB_BLOCK_NORTH', type: 'Intrusion Detection', status: 'MITIGATED', level: 'Low' },
    { area: 'AKE_BLOCK_CENTRAL', type: 'Acoustic Anomaly', status: 'AVIAN_DANCE', level: 'Low' },
    { area: 'LOB_BLOCK_EAST', type: 'Thermal Signature', status: 'TUGUTIL_CAMP', level: 'Low' },
    { area: 'AKE_BLOCK_SOUTH', type: 'Canopy Thinning', status: 'MONITORING', level: 'Moderate' }
  ];

  return (
    <div className="lab-container">
      {/* Left Column: Technical Diagnostic Widgets */}
      <div className="lab-telemetry-grid">
        {/* Widget 1: Canopy Cover */}
        <div className="telemetry-widget glass-panel" onMouseEnter={playHover}>
          <div className="widget-header">
            <span className="widget-title">CANOPY_DENSITY_INDEX</span>
            <span className="widget-status active">STABLE</span>
          </div>
          <div className="canopy-visualizer">
            <div className="canopy-progress-bar">
              <div className="canopy-progress-fill" style={{ width: '94.8%' }} />
            </div>
            <div className="canopy-stats">
              <span>PRIMARY FORESTRY COVER:</span>
              <span className="canopy-val">94.82%</span>
            </div>
            <div className="canopy-stats" style={{ marginTop: '0.25rem' }}>
              <span>ANNUAL CHANGE RATIO:</span>
              <span className="canopy-val" style={{ color: 'var(--color-cyan)' }}>+0.04%</span>
            </div>
          </div>
        </div>

        {/* Widget 2: Bio-Acoustic Monitoring */}
        <div className="telemetry-widget glass-panel" onMouseEnter={playHover}>
          <div className="widget-header">
            <span className="widget-title">AUDIO_SPECTRUM_MONITOR</span>
            <span className="widget-status">STREAMING</span>
          </div>
          <div className="audio-frequency-container">
            <div className="frequency-bar" />
            <div className="frequency-bar" />
            <div className="frequency-bar" />
            <div className="frequency-bar" />
            <div className="frequency-bar" />
            <div className="frequency-bar" />
            <div className="frequency-bar" />
            <div className="frequency-bar" />
          </div>
          <div className="soundscape-label">
            <span>RAINFOREST SOUNDSCAPE:</span>
            <span className="soundscape-val">42.8 DB</span>
          </div>
        </div>

        {/* Widget 3: Reforestation Counter */}
        <div className="telemetry-widget glass-panel" onMouseEnter={playHover}>
          <div className="widget-header">
            <span className="widget-title">REFOREST_METER</span>
            <span className="widget-status active">GROWING</span>
          </div>
          <div className="reforestation-metric">
            <div className="reforestation-num">
              {treeCount.toLocaleString()}
            </div>
            <div className="reforestation-lbl">ACTIVE SAPLINGS MONITORED</div>
          </div>
        </div>

        {/* Widget 4: Threat Logging */}
        <div className="telemetry-widget glass-panel" onMouseEnter={playHover}>
          <div className="widget-header">
            <span className="widget-title">RISK_THREAT_REGISTRY</span>
            <span className="widget-status" style={{ backgroundColor: 'rgba(255, 170, 0, 0.1)', color: 'var(--color-amber)', borderColor: 'rgba(255, 170, 0, 0.3)' }}>WARNING</span>
          </div>
          <div className="threat-monitor">
            {threatLogs.map((log, i) => (
              <div key={i} className="threat-row">
                <span style={{ color: 'var(--color-text-muted)' }}>{log.area}</span>
                <span>{log.type}</span>
                <span className={`threat-level ${log.level === 'Moderate' ? 'high' : ''}`}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Mission Statement & Call to Action */}
      <div className="lab-info">
        <div className="glass-panel conservation-card" onMouseEnter={playHover}>
          <span className="section-num">TELEMETRY SYSTEM OVERVIEW</span>
          <h2 className="card-title" style={{ borderBottom: '1px solid rgba(57, 255, 20, 0.15)', paddingBottom: '0.75rem' }}>
            CONSERVING WALLACEA
          </h2>
          <p className="lab-desc">
            The Aketajawe Lolobata National Park Office manages **167,300 hectares** of pristine rainforests on Halmahera Island. 
            By fusing traditional preservation values alongside advanced telemetry systems, we monitor endemic fauna and protect ancient trees.
          </p>
          <p className="lab-desc" style={{ fontSize: '0.8rem', marginTop: '-0.5rem', marginBottom: '2rem' }}>
            Our mission is supported by the indigenous **Tobelo Dalam (Tugutil)** tribe, who serve as nomadic guardians. Together, we blend human heritage with technological conservation.
          </p>

          <div className="lab-button-wrapper">
            <button
              onClick={handleDonate}
              onMouseEnter={playHover}
              className="cyber-button lab-btn-green"
              disabled={hasDonated}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Heart size={14} style={{ fill: hasDonated ? 'var(--color-neon-green)' : 'none' }} />
                <span>{hasDonated ? 'RANGERS_SUPPORTED' : 'SUPPORT_RANGERS'}</span>
              </div>
            </button>
            <button
              onClick={playClick}
              onMouseEnter={playHover}
              className="cyber-button"
              style={{ padding: '0.75rem 1.2rem', borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }}
            >
              <span>ACCESS_DB</span>
            </button>
          </div>
          
          {hasDonated && (
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'var(--color-neon-green)',
              marginTop: '1.25rem',
              textAlign: 'center',
              letterSpacing: '1px',
              animation: 'blink 1.5s infinite'
            }}>
              ▲ TRANS_VERIFIED: +125 CANOPY SAPLINGS ALLOCATED
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ConservationLab;
