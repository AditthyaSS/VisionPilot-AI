import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' },
    }),
};

const stats = [
    { icon: '👁️', label: 'Vision', delay: 0 },
    { icon: '🧠', label: 'Thought', delay: 0.5 },
    { icon: '🖱️', label: 'Action', delay: 1 },
];

export default function Home() {
    return (
        <div className="min-h-screen bg-[#0A0A0F] text-white overflow-x-hidden">

            {/* NAV */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 border-b border-[#1e1e2e] bg-[#0A0A0F]/80 backdrop-blur-md">
                <span className="font-syne font-bold text-lg text-[#00FFD1]">VisionPilot AI</span>
                <div className="flex items-center gap-6 font-mono text-sm">
                    <Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
                    <Link to="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link>
                    <Link to="/dashboard" className="px-4 py-2 bg-[#00FFD1] text-black font-bold rounded hover:bg-[#00e6bb] transition-colors">
                        Dashboard
                    </Link>
                </div>
            </nav>

            {/* HERO */}
            <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 grid-bg overflow-hidden">
                {/* Glow orb */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full orb pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(0,255,209,0.15) 0%, rgba(0,255,209,0.03) 50%, transparent 70%)' }} />

                <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                    {/* Badge */}
                    <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00FFD1]/30 bg-[#00FFD1]/5 font-mono text-xs text-[#00FFD1] mb-8">
                        <span className="w-2 h-2 rounded-full bg-[#00FFD1] animate-pulse" />
                        Powered by Gemini · Autonomous AI Agent
                    </motion.div>

                    {/* Heading */}
                    <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
                        className="font-syne font-extrabold text-6xl md:text-8xl leading-none mb-6 glow-text-cyan"
                        style={{ color: '#00FFD1' }}>
                        VisionPilot<span className="text-white"> AI</span>
                    </motion.h1>

                    <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
                        className="font-mono text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        An AI that <span className="text-[#00FFD1]">sees your screen</span>, understands your intent,<br />
                        and <span className="text-[#FFB347]">acts like a human</span>.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
                        className="flex flex-wrap items-center justify-center gap-4 mb-20">
                        <Link to="/dashboard"
                            className="flex items-center gap-2 px-8 py-4 bg-[#00FFD1] text-black font-bold font-mono rounded-lg hover:bg-[#00e6bb] transition-all hover:scale-105 glow-cyan">
                            Launch Agent <ArrowRight size={18} />
                        </Link>
                        <Link to="/features"
                            className="flex items-center gap-2 px-8 py-4 border border-[#1e1e2e] text-gray-300 font-mono rounded-lg hover:border-[#00FFD1]/50 hover:text-white transition-all">
                            <Play size={18} /> See How It Works
                        </Link>
                    </motion.div>

                    {/* Floating stat badges */}
                    <div className="flex flex-wrap justify-center gap-6">
                        {stats.map(({ icon, label, delay }, i) => (
                            <motion.div
                                key={label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 + delay, duration: 0.5 }}
                                className={`float${i === 0 ? '' : i === 1 ? '-delay-1' : '-delay-2'}`}>
                                <div className="flex items-center gap-3 px-5 py-3 bg-[#111118] border border-[#1e1e2e] rounded-xl font-mono text-sm hover:border-[#00FFD1]/40 transition-colors cursor-default">
                                    <span className="text-2xl">{icon}</span>
                                    <span className="text-gray-300">{label}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 font-mono text-xs text-gray-600">
                    <span>scroll</span>
                    <div className="w-px h-12 bg-gradient-to-b from-gray-600 to-transparent" />
                </div>
            </section>

            {/* ABOUT SECTION */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="border-l-4 border-[#00FFD1] pl-8 bg-[#111118] rounded-r-xl p-8">
                        <h2 className="font-syne font-bold text-3xl text-white mb-4">
                            The Future is Autonomous
                        </h2>
                        <p className="font-mono text-gray-400 text-base leading-relaxed mb-8">
                            Autonomous AI agents represent the next evolution of human-computer interaction.
                            VisionPilot doesn't just answer questions — it <span className="text-[#00FFD1]">sees</span> your screen,
                            <span className="text-[#FFB347]"> reasons</span> about what needs to happen, and <span className="text-white">acts</span> on your behalf.
                            No more clicking through menus. No more repetitive tasks. Just intent → outcome.
                        </p>

                        {/* Mini diagram */}
                        <div className="flex flex-wrap items-center gap-3 font-mono text-sm">
                            {['User Intent', 'AI Brain', 'Screen', 'Actions', 'Result'].map((step, i, arr) => (
                                <div key={step} className="flex items-center gap-3">
                                    <div className="px-3 py-2 bg-[#0A0A0F] border border-[#1e1e2e] rounded-lg text-[#00FFD1] hover:border-[#00FFD1]/50 transition-colors">
                                        {step}
                                    </div>
                                    {i < arr.length - 1 && (
                                        <span className="text-[#FFB347]">→</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* DEMO PREVIEW */}
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="text-center mb-12">
                        <h2 className="font-syne font-bold text-3xl text-white mb-3">See It In Action</h2>
                        <p className="font-mono text-gray-500">Watch the AI plan and act in real time</p>
                    </motion.div>

                    {/* Fake terminal mockup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="rounded-xl border border-[#1e1e2e] overflow-hidden bg-[#111118] scanlines relative">
                        {/* Terminal title bar */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e1e2e] bg-[#0A0A0F]">
                            <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                            <div className="w-3 h-3 rounded-full bg-[#FFB347]" />
                            <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                            <span className="ml-4 font-mono text-xs text-gray-500">VisionPilot · Dashboard · WORKING</span>
                        </div>

                        {/* Fake dashboard preview */}
                        <div className="p-6 grid grid-cols-3 gap-4 h-56">
                            <div className="bg-[#0A0A0F] rounded-lg border border-[#1e1e2e] p-4 flex flex-col gap-2">
                                <div className="font-mono text-xs text-[#00FFD1]">🧠 Reasoning</div>
                                <div className="font-mono text-xs text-gray-500 leading-relaxed">
                                    User wants to open YouTube and search for AI agent videos. I'll navigate to the browser, open youtube.com...
                                </div>
                            </div>
                            <div className="bg-[#0A0A0F] rounded-lg border border-[#1e1e2e] p-4 flex flex-col gap-2">
                                <div className="font-mono text-xs text-[#00FFD1]">👁️ Screen View</div>
                                <div className="flex-1 bg-[#1a1a2e] rounded border border-[#1e1e2e] flex items-center justify-center">
                                    <span className="font-mono text-xs text-gray-700">[ Live capture ]</span>
                                </div>
                            </div>
                            <div className="bg-[#0A0A0F] rounded-lg border border-[#1e1e2e] p-4 flex flex-col gap-2">
                                <div className="font-mono text-xs text-[#00FFD1]">📋 Steps</div>
                                {['Open browser', 'Go to youtube.com', 'Search "AI agents"'].map((s, i) => (
                                    <div key={i} className={`font-mono text-xs flex items-center gap-2 ${i === 0 ? 'text-[#22c55e]' : i === 1 ? 'text-[#00FFD1]' : 'text-gray-600'}`}>
                                        <span>{i === 0 ? '✓' : i === 1 ? '▶' : '○'}</span> {s}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <div className="text-center mt-6">
                        <Link to="/dashboard"
                            className="inline-flex items-center gap-2 font-mono text-[#00FFD1] hover:underline text-sm">
                            Open Live Dashboard <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-[#1e1e2e] py-10 px-6 text-center font-mono text-sm text-gray-600">
                <p>VisionPilot AI · Built with <span className="text-[#00FFD1]">Gemini</span> · "Not just an app — a brain."</p>
                <p className="mt-2 text-xs text-gray-700">© 2026 VisionPilot AI. All rights reserved.</p>
            </footer>
        </div>
    );
}
