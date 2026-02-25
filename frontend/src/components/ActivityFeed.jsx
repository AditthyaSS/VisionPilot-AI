import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_STYLE = {
    info: { color: '#9ca3af', icon: 'ℹ️' },
    action: { color: '#00FFD1', icon: '⚡' },
    thinking: { color: '#FFB347', icon: '🧠' },
    error: { color: '#ef4444', icon: '❌' },
    done: { color: '#22c55e', icon: '✅' },
    warning: { color: '#FFB347', icon: '⚠️' },
};

function formatTime(iso) {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function ActivityFeed({ logs = [] }) {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e1e2e] flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-[#00FFD1] animate-pulse" />
                <span className="font-mono text-xs text-[#00FFD1] font-bold">LIVE ACTIVITY FEED</span>
                <span className="ml-auto font-mono text-xs text-gray-600">{logs.length} entries</span>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0">
                <AnimatePresence initial={false}>
                    {logs.map((log) => {
                        const style = TYPE_STYLE[log.type] || TYPE_STYLE.info;
                        return (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, y: 10, x: -8 }}
                                animate={{ opacity: 1, y: 0, x: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="flex items-start gap-3 group">
                                <span className="font-mono text-xs text-gray-600 flex-shrink-0 pt-0.5 w-20">
                                    {formatTime(log.timestamp)}
                                </span>
                                <span className="flex-shrink-0 text-sm">{log.icon || style.icon}</span>
                                <span
                                    className="font-mono text-xs leading-relaxed"
                                    style={{ color: style.color }}>
                                    {log.message}
                                </span>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
