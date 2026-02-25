import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ScreenshotViewer({ screenshot = null }) {
    const [age, setAge] = useState(0);

    useEffect(() => {
        if (!screenshot) return;
        setAge(0);
        const t = setInterval(() => setAge(prev => prev + 1), 1000);
        return () => clearInterval(t);
    }, [screenshot]);

    return (
        <div className="flex flex-col h-full bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e1e2e] bg-[#0d0d14] flex-shrink-0">
                <span className="text-base">👁️</span>
                <span className="font-mono text-xs text-[#00FFD1] font-bold">SCREEN VIEW</span>
                {screenshot && (
                    <span className="ml-auto font-mono text-xs text-gray-600">
                        {age}s ago
                    </span>
                )}
            </div>

            {/* Image area */}
            <div className="flex-1 relative overflow-hidden min-h-0">
                {screenshot ? (
                    <>
                        <motion.img
                            key={screenshot.slice(0, 30)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            src={`data:image/png;base64,${screenshot}`}
                            alt="Screen capture"
                            className="w-full h-full object-contain"
                        />
                        {/* Scanline overlay */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background:
                                    'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
                            }}
                        />
                        {/* Corner HUD marks */}
                        <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[#00FFD1]/50" />
                        <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[#00FFD1]/50" />
                        <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[#00FFD1]/50" />
                        <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[#00FFD1]/50" />
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-4">
                        {/* Placeholder grid */}
                        <div className="w-full h-28 rounded-lg border border-[#1e1e2e] grid-bg opacity-40 flex items-center justify-center">
                            <div className="text-[#00FFD1]/30 font-mono text-xs">NO CAPTURE YET</div>
                        </div>
                        <p className="font-mono text-xs text-gray-600 leading-relaxed">
                            Screen will update when<br />the executor is running
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
