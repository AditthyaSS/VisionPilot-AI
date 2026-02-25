import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function useTypewriter(text, speed = 18) {
    const [displayed, setDisplayed] = useState('');
    const indexRef = useRef(0);

    useEffect(() => {
        setDisplayed('');
        indexRef.current = 0;
        if (!text) return;
        const timer = setInterval(() => {
            setDisplayed(prev => {
                const next = text.slice(0, indexRef.current + 1);
                indexRef.current++;
                if (indexRef.current >= text.length) clearInterval(timer);
                return next;
            });
        }, speed);
        return () => clearInterval(timer);
    }, [text, speed]);

    return displayed;
}

export default function ReasoningPanel({ reasoning = '' }) {
    const typed = useTypewriter(reasoning, 15);

    return (
        <div className="flex flex-col h-full bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e1e2e] bg-[#0d0d14]">
                <span className="text-base">🧠</span>
                <span className="font-mono text-xs text-[#FFB347] font-bold">AGENT REASONING</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
                <AnimatePresence mode="wait">
                    {reasoning ? (
                        <motion.div
                            key={reasoning.slice(0, 20)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`font-mono text-xs text-gray-300 leading-relaxed whitespace-pre-wrap ${typed.length < reasoning.length ? 'cursor' : ''}`}>
                            {typed}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center h-full gap-3 text-center mt-8">
                            <div className="text-4xl opacity-30">🧠</div>
                            <p className="font-mono text-xs text-gray-600">Reasoning will appear here<br />once the agent starts thinking...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
