import { useEffect } from 'react';
import { useVoiceInput } from '../hooks/useVoiceInput';

/**
 * VoiceMicButton — Self-contained mic button for VisionPilot voice input
 *
 * Props:
 *   inputRef   — ref to the existing <input> element (for syncing transcript)
 *   onResult   — called with live transcript text
 *   onAutoSend — called with final text when speech ends naturally
 */
export default function VoiceMicButton({ inputRef, onResult, onAutoSend }) {
    const { isListening, transcript, error, toggleListening } = useVoiceInput({
        onResult: (text) => {
            // Sync text into the React controlled input via native setter
            if (inputRef?.current) {
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype,
                    'value'
                ).set;
                nativeInputValueSetter.call(inputRef.current, text);
                inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (onResult) onResult(text);
        },
        onAutoSend,
    });

    // Auto-dismiss error after 4 seconds
    useEffect(() => {
        // Error state is managed inside the hook; expose a local clear if needed
        // The hook already clears errors on new start, this handles UI dismissal
    }, [error]);

    /* ─── Styles ─────────────────────────────────────────────── */
    const btnIdle = {
        width: 42,
        height: 42,
        borderRadius: '50%',
        border: '2px solid #00FFD1',
        background: 'rgba(0,255,209,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        flexShrink: 0,
        outline: 'none',
        padding: 0,
    };

    const btnListening = {
        ...btnIdle,
        border: '2px solid #FF4444',
        background: 'rgba(255,68,68,0.15)',
    };

    const pulseRing = {
        position: 'absolute',
        inset: -6,
        borderRadius: '50%',
        border: '2px solid rgba(255,68,68,0.5)',
        animation: 'vp-pulse 1s ease-in-out infinite',
        pointerEvents: 'none',
    };

    const transcriptPill = {
        position: 'absolute',
        bottom: '110%',
        right: 0,
        background: '#0A0A0F',
        border: '1px solid #00FFD1',
        color: '#00FFD1',
        borderRadius: 20,
        padding: '6px 12px',
        fontFamily: '"Space Mono", monospace',
        fontSize: 12,
        maxWidth: 300,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        boxShadow: '0 0 20px rgba(0,255,209,0.15)',
        animation: 'vp-fadein 0.2s ease forwards',
        zIndex: 100,
        pointerEvents: 'none',
    };

    const errorToast = {
        position: 'absolute',
        bottom: '110%',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#FF4444',
        color: '#fff',
        borderRadius: 20,
        padding: '6px 14px',
        fontFamily: '"Space Mono", monospace',
        fontSize: 12,
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 20px rgba(255,68,68,0.4)',
        animation: 'vp-fadein 0.2s ease forwards',
        zIndex: 100,
        pointerEvents: 'none',
    };

    const iconColor = isListening ? '#FF4444' : '#00FFD1';

    return (
        <>
            {/* CSS keyframes injected once */}
            <style>{`
                @keyframes vp-pulse {
                    0%, 100% { transform: scale(1);   opacity: 0.8; }
                    50%       { transform: scale(1.3); opacity: 0;   }
                }
                @keyframes vp-fadein {
                    from { opacity: 0; transform: translateY(4px); }
                    to   { opacity: 1; transform: translateY(0);   }
                }
            `}</style>

            {/* Wrapper for absolute-positioned overlays */}
            <div style={{ position: 'relative', display: 'inline-flex' }}>

                {/* Mic button */}
                <button
                    onClick={toggleListening}
                    style={isListening ? btnListening : btnIdle}
                    title={isListening ? 'Stop listening' : 'Click to speak'}
                    aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                    type="button"
                >
                    {/* Pulsing ring — only while listening */}
                    {isListening && <span style={pulseRing} />}

                    {/* Microphone SVG icon */}
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={iconColor}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ transition: 'stroke 0.2s ease' }}
                    >
                        <path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                        <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                </button>

                {/* Live transcript pill */}
                {isListening && transcript && (
                    <div style={transcriptPill}>
                        🎤 {transcript}
                    </div>
                )}

                {/* Error toast */}
                {error && (
                    <ErrorToast message={error} />
                )}
            </div>
        </>
    );
}

/* ── Error toast with auto-dismiss ──────────────────────────── */
function ErrorToast({ message }) {
    // We use opacity fade-out via CSS instead of unmounting,
    // because the parent re-renders when error clears in the hook.
    // The hook clears error on next startListening call.
    // For visual auto-dismiss we use a CSS animation with delay.
    const toastStyle = {
        position: 'absolute',
        bottom: '110%',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#FF4444',
        color: '#fff',
        borderRadius: 20,
        padding: '6px 14px',
        fontFamily: '"Space Mono", monospace',
        fontSize: 12,
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 20px rgba(255,68,68,0.4)',
        animation: 'vp-fadein 0.2s ease forwards, vp-fadein 0.4s ease 3.6s reverse forwards',
        zIndex: 100,
        pointerEvents: 'none',
    };

    return <div style={toastStyle}>{message}</div>;
}
