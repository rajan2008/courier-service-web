import React, { useState } from 'react';
import { Settings as SettingsIcon, MousePointer2, Shield, Bell } from 'lucide-react';
import '../index.css';

const Settings = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [cursorType, setCursorType] = useState(localStorage.getItem('cursorType') || 'magnetic');

    const handleCursorChange = (type) => {
        setCursorType(type);
        localStorage.setItem('cursorType', type);
        window.dispatchEvent(new Event('cursor-updated'));
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 0', color: 'var(--text-main)' }}>
            <div style={{ marginBottom: '3rem' }} className="animate-fade-in">
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <SettingsIcon size={36} color="var(--accent)" /> System Preferences
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>Configure your personalized logistics workspace.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                {/* Global Settings */}
                <div className="card" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-main)' }}>
                        <MousePointer2 size={22} color="var(--accent)" /> Interaction Engine
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Select a high-fidelity cursor style for your session.</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <CursorOption name="Awwwards (Default)" type="magnetic" curr={cursorType} onClick={handleCursorChange} />
                        <CursorOption name="Figma Collab" type="figma" curr={cursorType} onClick={handleCursorChange} />
                        <CursorOption name="Cinematic Flare" type="flare" curr={cursorType} onClick={handleCursorChange} />
                        <CursorOption name="Inversion Halo" type="difference" curr={cursorType} onClick={handleCursorChange} />
                        <CursorOption name="Monster Packs" type="cat" curr={cursorType} onClick={handleCursorChange} />
                        <CursorOption name="Among Us Hoodie" type="amongus" curr={cursorType} onClick={handleCursorChange} />
                        <CursorOption name="Magic Crystal" type="crystal" curr={cursorType} onClick={handleCursorChange} />
                        <CursorOption name="System Native" type="system" curr={cursorType} onClick={handleCursorChange} />
                    </div>
                </div>

                {/* Role Specific Settings */}
                <div className="card" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-main)' }}>
                        <Shield size={22} color="var(--accent)" /> Security Policies
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <SettingToggle title="Strict Audit Logging" desc="Trace all sub-admin actions" active={true} />
                        <SettingToggle title="2FA Authentication" desc="Require OTP for sensitive data" active={false} />
                        <SettingToggle title="Email Alerts" desc="Ping for critical shipments" active={true} />
                        <SettingToggle title="Dark Theme Enforce" desc="Force dark site globally" active={true} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const CursorOption = ({ name, type, curr, onClick }) => (
    <div 
        onClick={() => onClick(type)}
        style={{ 
            padding: '1rem', 
            borderRadius: '16px', 
            border: curr === type ? '2px solid var(--accent)' : '1px solid var(--border)', 
            background: curr === type ? 'var(--surface-hover)' : 'var(--input-bg)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: 'center'
        }}
    >
        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: curr === type ? 'var(--accent)' : 'var(--text-muted)' }}>{name}</span>
    </div>
);

const SettingToggle = ({ title, desc, active }) => {
    const [isOn, setIsOn] = useState(active);
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem', background: 'var(--glass)', borderRadius: '16px', marginBottom: '0.8rem', border: '1px solid var(--border)' }}>
            <div>
                <p style={{ margin: '0 0 4px 0', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{title}</p>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{desc}</p>
            </div>
            <div 
                onClick={() => setIsOn(!isOn)}
                style={{
                    width: '48px', height: '26px', borderRadius: '100px', 
                    background: isOn ? '#22c55e' : 'var(--text-muted)',
                    position: 'relative', cursor: 'pointer',
                    transition: 'background 0.3s'
                }}
            >
                <div style={{
                    width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: '3px', left: isOn ? '24px' : '4px',
                    transition: 'left 0.3s', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}/>
            </div>
        </div>
    );
};

export default Settings;
