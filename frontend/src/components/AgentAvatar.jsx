import { motion, AnimatePresence } from 'framer-motion';

const STATE_CONFIG = {
    idle: { color: '#6b7280', label: 'IDLE', ring: 'ring-idle', dot: 'dot-idle', bg: '#6b728020' },
    listening: { color: '#3b82f6', label: 'LISTENING', ring: 'ring-listening', dot: 'dot-listening', bg: '#3b82f620' },
    thinking: { color: '#FFB347', label: 'THINKING', ring: 'ring-thinking', dot: 'dot-thinking', bg: '#FFB34720' },
    working: { color: '#00FFD1', label: 'WORKING', ring: 'ring-working', dot: 'dot-working', bg: '#00FFD120' },
    error: { color: '#ef4444', label: 'ERROR', ring: 'ring-error', dot: 'dot-error', bg: '#ef444420' },
    done: { color: '#22c55e', label: 'DONE', ring: 'ring-done', dot: 'dot-done', bg: '#22c55e20' },
};

export default function AgentAvatar({ state = 'idle' }) {
    const cfg = STATE_CONFIG[state] || STATE_CONFIG.idle;
    const isAnimating = ['thinking', 'working', 'listening'].includes(state);

    return (
        <div className="flex items-center gap-4">
            {/* Avatar ring */}
            <div className="relative w-14 h-14 flex-shrink-0">
                {/* Outer pulse ring */}
                {isAnimating && (
                    <div
                        className="absolute inset-0 rounded-full border-2 pulse-ring"
                        style={{ borderColor: cfg.color }}
                    />
                )}
                {/* Secondary pulse */}
                {isAnimating && (
                    <div
                        className="absolute inset-0 rounded-full border-2 pulse-ring"
                        style={{ borderColor: cfg.color, animationDelay: '0.6s' }}
                    />
                )}
                {/* Main ring */}
                <div
                    className="absolute inset-0 rounded-full border-2 transition-colors duration-500"
                    style={{ borderColor: cfg.color }}
                />
                {/* Avatar body */}
                <div
                    className="absolute inset-1 rounded-full flex items-center justify-center font-syne font-bold text-lg transition-colors duration-500"
                    style={{ background: cfg.bg, color: cfg.color }}>
                    VP
                </div>
            </div>

            {/* Name + status */}
            <div>
                <div className="font-syne font-bold text-white text-base leading-tight">VisionPilot</div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={state}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 mt-1">
                        <div
                            className="w-2 h-2 rounded-full transition-colors duration-500"
                            style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }}
                        />
                        <span className="font-mono text-xs font-bold" style={{ color: cfg.color }}>
                            {cfg.label}
                        </span>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
