import { motion, AnimatePresence } from 'framer-motion';

const STATUS_CONFIG = {
    pending: { icon: '○', color: '#4b5563', label: 'Pending' },
    active: { icon: '▶', color: '#00FFD1', label: 'Active' },
    done: { icon: '✓', color: '#22c55e', label: 'Done' },
    error: { icon: '✕', color: '#ef4444', label: 'Error' },
};

export default function ActionLog({ steps = [] }) {
    return (
        <div className="flex flex-col h-full bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e1e2e] bg-[#0d0d14] flex-shrink-0">
                <span className="text-base">📋</span>
                <span className="font-mono text-xs text-[#FFB347] font-bold">ACTION PLAN</span>
                <span className="ml-auto font-mono text-xs text-gray-600">
                    {steps.filter(s => s.status === 'done').length}/{steps.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
                <AnimatePresence initial={false}>
                    {steps.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center h-full gap-3 text-center mt-6">
                            <div className="text-4xl opacity-30">📋</div>
                            <p className="font-mono text-xs text-gray-600">
                                Step-by-step plan will<br />appear after a command
                            </p>
                        </motion.div>
                    ) : (
                        steps.map((step, i) => {
                            const cfg = STATUS_CONFIG[step.status] || STATUS_CONFIG.pending;
                            const isActive = step.status === 'active';
                            return (
                                <motion.div
                                    key={`${step.step}-${i}`}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    className={`flex items-start gap-3 px-3 py-3 rounded-lg transition-all duration-300 ${isActive
                                            ? 'bg-[#00FFD1]/8 border border-[#00FFD1]/30'
                                            : 'border border-transparent'
                                        }`}>
                                    {/* Step number */}
                                    <span className="font-mono text-xs text-gray-600 flex-shrink-0 w-5 text-right mt-0.5">
                                        {i + 1}.
                                    </span>
                                    {/* Status icon */}
                                    <span
                                        className="font-mono text-sm flex-shrink-0"
                                        style={{ color: cfg.color }}>
                                        {cfg.icon}
                                    </span>
                                    {/* Step text */}
                                    <span
                                        className="font-mono text-xs leading-relaxed transition-colors duration-300"
                                        style={{ color: isActive ? '#00FFD1' : step.status === 'done' ? '#22c55e' : step.status === 'error' ? '#ef4444' : '#9ca3af' }}>
                                        {step.step}
                                        {isActive && (
                                            <span className="inline-block ml-1 w-1.5 h-3.5 bg-[#00FFD1] opacity-80 animate-pulse rounded" />
                                        )}
                                    </span>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
