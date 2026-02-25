import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Brain, Mouse, RefreshCw, ArrowRight } from 'lucide-react';

const features = [
    {
        icon: <Eye size={28} />,
        emoji: '👁️',
        title: 'Vision System',
        desc: 'Captures your screen and analyzes every pixel to understand what\'s visible — buttons, text, apps, and more.',
        color: '#00FFD1',
    },
    {
        icon: <Brain size={28} />,
        emoji: '🧠',
        title: 'AI Reasoning',
        desc: 'Powered by Gemini, it understands natural language commands and breaks them into precise executable steps.',
        color: '#FFB347',
    },
    {
        icon: <Mouse size={28} />,
        emoji: '🖱️',
        title: 'Action Execution',
        desc: 'Controls your mouse, keyboard, and apps autonomously — just like a human would, without any scripting.',
        color: '#a78bfa',
    },
    {
        icon: <RefreshCw size={28} />,
        emoji: '🔁',
        title: 'Live Interruption',
        desc: 'Change your mind mid-task. VisionPilot stops, re-reads the screen, and adapts instantly to new intent.',
        color: '#f472b6',
    },
];

const agentStates = [
    { name: 'Idle', color: '#6b7280', pulse: 'gray', desc: 'Agent is ready, waiting for a command.' },
    { name: 'Listening', color: '#3b82f6', pulse: 'blue', desc: 'Receiving and parsing your command.' },
    { name: 'Thinking', color: '#FFB347', pulse: 'amber', desc: 'Gemini is reasoning and planning steps.' },
    { name: 'Working', color: '#00FFD1', pulse: 'cyan', desc: 'Executing actions on your computer.' },
    { name: 'Error', color: '#ef4444', pulse: 'red', desc: 'Something went wrong. Waiting to retry.' },
    { name: 'Done', color: '#22c55e', pulse: 'green', desc: 'All steps completed successfully.' },
];

const flowSteps = ['Intent', 'Screen Capture', 'AI Analysis', 'Plan', 'Execute', 'Report'];

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
    }),
};

export default function Features() {
    return (
        <div className="min-h-screen bg-[#0A0A0F] text-white overflow-x-hidden">

            {/* NAV */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 border-b border-[#1e1e2e] bg-[#0A0A0F]/80 backdrop-blur-md">
                <Link to="/" className="font-syne font-bold text-lg text-[#00FFD1]">VisionPilot AI</Link>
                <div className="flex items-center gap-6 font-mono text-sm">
                    <Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
                    <Link to="/features" className="text-[#00FFD1]">Features</Link>
                    <Link to="/dashboard" className="px-4 py-2 bg-[#00FFD1] text-black font-bold rounded hover:bg-[#00e6bb] transition-colors">
                        Dashboard
                    </Link>
                </div>
            </nav>

            {/* HEADER */}
            <section className="pt-32 pb-16 px-6 text-center grid-bg">
                <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
                    <span className="inline-block font-mono text-xs text-[#00FFD1] border border-[#00FFD1]/30 px-4 py-2 rounded-full mb-6">
                        Capabilities
                    </span>
                </motion.div>
                <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
                    className="font-syne font-extrabold text-5xl md:text-6xl text-white mb-4">
                    What VisionPilot <span className="text-[#00FFD1]">Can Do</span>
                </motion.h1>
                <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
                    className="font-mono text-gray-400 text-lg max-w-xl mx-auto">
                    A complete loop of perception, reasoning, and action
                </motion.p>
            </section>

            {/* FEATURE CARDS */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    {features.map(({ emoji, title, desc, color }, i) => (
                        <motion.div
                            key={title}
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            custom={i * 0.5}
                            whileHover={{ scale: 1.02, borderColor: color }}
                            className="group bg-[#111118] border border-[#1e1e2e] rounded-xl p-8 cursor-default transition-all duration-300"
                            style={{ '--card-color': color }}>
                            <div className="text-4xl mb-4">{emoji}</div>
                            <h3 className="font-syne font-bold text-xl text-white mb-3 group-hover:text-[var(--card-color)] transition-colors"
                                style={{ '--card-color': color }}>
                                {title}
                            </h3>
                            <p className="font-mono text-gray-400 text-sm leading-relaxed">{desc}</p>
                            <div className="mt-6 h-px bg-gradient-to-r from-transparent transition-all duration-500"
                                style={{ background: `linear-gradient(to right, ${color}40, transparent)` }} />
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* AGENT STATES */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12">
                        <h2 className="font-syne font-bold text-3xl text-white mb-3">Agent States</h2>
                        <p className="font-mono text-gray-500 text-sm">Real-time visual feedback for every mode</p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {agentStates.map(({ name, color, desc }, i) => (
                            <motion.div
                                key={name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex items-start gap-3">
                                <div className="relative flex-shrink-0 mt-1">
                                    <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                                    <div className="absolute inset-0 w-3 h-3 rounded-full pulse-ring" style={{ background: color, opacity: 0.5 }} />
                                </div>
                                <div>
                                    <div className="font-syne font-bold text-sm text-white mb-1">{name}</div>
                                    <div className="font-mono text-xs text-gray-500 leading-relaxed">{desc}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FLOW DIAGRAM */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12">
                        <h2 className="font-syne font-bold text-3xl text-white mb-3">The Agent Loop</h2>
                        <p className="font-mono text-gray-500 text-sm">From intent to outcome in milliseconds</p>
                    </motion.div>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {flowSteps.map((step, i) => (
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-2">
                                <div className="px-4 py-3 bg-[#111118] border border-[#1e1e2e] rounded-lg font-mono text-sm text-white hover:border-[#00FFD1]/50 hover:text-[#00FFD1] transition-all cursor-default">
                                    {step}
                                </div>
                                {i < flowSteps.length - 1 && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 + 0.05 }}
                                        className="text-[#FFB347] font-bold text-lg">
                                        →
                                    </motion.span>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 text-center border-t border-[#1e1e2e]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}>
                    <h2 className="font-syne font-bold text-4xl text-white mb-4">Ready to let AI take the wheel?</h2>
                    <p className="font-mono text-gray-400 mb-8">Open the dashboard and give VisionPilot its first command.</p>
                    <Link to="/dashboard"
                        className="inline-flex items-center gap-2 px-10 py-4 bg-[#00FFD1] text-black font-bold font-mono rounded-lg hover:bg-[#00e6bb] transition-all hover:scale-105 glow-cyan">
                        Launch Agent <ArrowRight size={18} />
                    </Link>
                </motion.div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-[#1e1e2e] py-8 px-6 text-center font-mono text-sm text-gray-600">
                VisionPilot AI · Built with <span className="text-[#00FFD1]">Gemini</span> · "Not just an app — a brain."
            </footer>
        </div>
    );
}
