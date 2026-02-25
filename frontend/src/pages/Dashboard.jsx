import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAgent } from '../hooks/useAgent';
import AgentAvatar from '../components/AgentAvatar';
import ActivityFeed from '../components/ActivityFeed';
import ReasoningPanel from '../components/ReasoningPanel';
import ScreenshotViewer from '../components/ScreenshotViewer';
import ActionLog from '../components/ActionLog';
import CommandInput from '../components/CommandInput';

const STATE_BORDER = {
    idle: 'border-[#6b7280]/30',
    listening: 'border-[#3b82f6]/50',
    thinking: 'border-[#FFB347]/50',
    working: 'border-[#00FFD1]/50',
    error: 'border-[#ef4444]/50',
    done: 'border-[#22c55e]/50',
};

export default function Dashboard() {
    const {
        agentState,
        activityLog,
        reasoning,
        screenshot,
        actionPlan,
        isLoading,
        sendCommand,
        interrupt,
    } = useAgent();

    return (
        <div
            className="h-screen flex flex-col bg-[#0A0A0F] overflow-hidden"
            style={{ fontFamily: "'Space Mono', monospace" }}>

            {/* ─── TOP BAR ─── */}
            <header className="flex items-center justify-between px-5 py-3 border-b border-[#1e1e2e] flex-shrink-0 bg-[#0A0A0F]">
                <div className="flex items-center gap-6">
                    <Link to="/" className="font-syne font-bold text-[#00FFD1] text-lg hover:opacity-80 transition-opacity">
                        VisionPilot<span className="text-white">AI</span>
                    </Link>
                    <div className="h-5 w-px bg-[#1e1e2e]" />
                    <AgentAvatar state={agentState} />
                </div>

                <div className="flex items-center gap-3">
                    {/* Uptime-style status pill */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors duration-500 ${STATE_BORDER[agentState] || 'border-[#1e1e2e]'}`}>
                        <div
                            className="w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{
                                background: { idle: '#6b7280', listening: '#3b82f6', thinking: '#FFB347', working: '#00FFD1', error: '#ef4444', done: '#22c55e' }[agentState] || '#6b7280'
                            }}
                        />
                        <span className="text-gray-400">
                            {agentState === 'idle' ? 'Awaiting command' :
                                agentState === 'listening' ? 'Receiving input…' :
                                    agentState === 'thinking' ? 'Reasoning with Gemini…' :
                                        agentState === 'working' ? 'Executing steps…' :
                                            agentState === 'done' ? 'Task complete' :
                                                agentState === 'error' ? 'Error encountered' : ''}
                        </span>
                    </div>

                    <Link to="/features" className="font-mono text-xs text-gray-600 hover:text-gray-400 transition-colors">
                        Docs
                    </Link>
                </div>
            </header>

            {/* ─── ACTIVITY FEED ─── */}
            <div className="flex-shrink-0 h-40 border-b border-[#1e1e2e] overflow-hidden">
                <ActivityFeed logs={activityLog} />
            </div>

            {/* ─── BOTTOM PANELS (3-column) ─── */}
            <div className="flex-1 grid grid-cols-3 gap-3 p-3 overflow-hidden min-h-0">
                {/* Reasoning Panel */}
                <motion.div
                    layout
                    className="overflow-hidden rounded-xl min-h-0">
                    <ReasoningPanel reasoning={reasoning} />
                </motion.div>

                {/* Screenshot Viewer */}
                <motion.div
                    layout
                    className="overflow-hidden rounded-xl min-h-0">
                    <ScreenshotViewer screenshot={screenshot} />
                </motion.div>

                {/* Action Plan */}
                <motion.div
                    layout
                    className="overflow-hidden rounded-xl min-h-0">
                    <ActionLog steps={actionPlan} />
                </motion.div>
            </div>

            {/* ─── COMMAND INPUT ─── */}
            <CommandInput
                onSend={sendCommand}
                onInterrupt={interrupt}
                isLoading={isLoading}
                agentState={agentState}
            />
        </div>
    );
}
