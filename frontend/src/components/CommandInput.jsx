import { useState, useRef } from 'react';
import { Send, Square, Mic } from 'lucide-react';

export default function CommandInput({ onSend, onInterrupt, isLoading, agentState }) {
    const [value, setValue] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const inputRef = useRef(null);

    const handleSend = () => {
        if (!value.trim() || isLoading) return;
        onSend(value.trim());
        setValue('');
        inputRef.current?.focus();
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const toggleRecording = () => setIsRecording(prev => !prev);
    const isWorking = ['listening', 'thinking', 'working'].includes(agentState);

    return (
        <div className="flex items-center gap-3 p-4 border-t border-[#1e1e2e] bg-[#0A0A0F]">
            {/* Text input */}
            <div className="flex-1 relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Tell VisionPilot what to do..."
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-[#111118] border border-[#1e1e2e] rounded-xl font-mono text-sm text-white placeholder-gray-600 outline-none transition-all duration-200 focus:border-[#00FFD1]/60 focus:shadow-[0_0_0_2px_rgba(0,255,209,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {/* Char counter */}
                {value.length > 0 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-gray-600">
                        {value.length}
                    </span>
                )}
            </div>

            {/* Voice button */}
            <button
                onClick={toggleRecording}
                className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all duration-200 ${isRecording
                        ? 'border-[#FFB347] bg-[#FFB347]/10 text-[#FFB347]'
                        : 'border-[#1e1e2e] bg-[#111118] text-gray-400 hover:border-[#FFB347]/40 hover:text-[#FFB347]'
                    }`}
                title="Voice input (visual only)">
                <Mic size={16} className={isRecording ? 'animate-pulse' : ''} />
            </button>

            {/* Send button */}
            <button
                onClick={handleSend}
                disabled={!value.trim() || isLoading}
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#00FFD1] text-black font-bold transition-all duration-200 hover:bg-[#00e6bb] hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                title="Send command">
                <Send size={16} />
            </button>

            {/* Interrupt button */}
            <button
                onClick={onInterrupt}
                disabled={!isWorking}
                className="flex items-center gap-2 px-4 h-11 rounded-xl border border-[#ef4444]/40 bg-[#ef4444]/8 text-[#ef4444] font-mono text-xs font-bold transition-all duration-200 hover:bg-[#ef4444]/20 hover:border-[#ef4444]/60 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Stop agent">
                <Square size={14} />
                <span>STOP</span>
            </button>
        </div>
    );
}
