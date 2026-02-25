import { useState, useRef, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useAgent() {
    const [agentState, setAgentState] = useState('idle');
    const [activityLog, setActivityLog] = useState([
        { id: 1, timestamp: new Date().toISOString(), icon: '🤖', message: 'VisionPilot initialized and ready.', type: 'info' },
    ]);
    const [reasoning, setReasoning] = useState('');
    const [screenshot, setScreenshot] = useState(null);
    const [actionPlan, setActionPlan] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const pollRef = useRef(null);
    const logIdRef = useRef(2);

    const addLog = useCallback((message, type = 'info', icon = null) => {
        const icons = { info: 'ℹ️', action: '⚡', thinking: '🧠', error: '❌', done: '✅', warning: '⚠️' };
        setActivityLog(prev => {
            const newEntry = {
                id: logIdRef.current++,
                timestamp: new Date().toISOString(),
                icon: icon || icons[type] || 'ℹ️',
                message,
                type,
            };
            return [...prev.slice(-49), newEntry];
        });
    }, []);

    const stopPolling = useCallback(() => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    }, []);

    const startPolling = useCallback(() => {
        stopPolling();
        pollRef.current = setInterval(async () => {
            try {
                const res = await axios.get(`${API_URL}/status`);
                const data = res.data;
                setAgentState(data.state);
                setReasoning(data.reasoning || '');
                setScreenshot(data.screenshot || null);
                setActionPlan((data.steps || []).map(s => ({
                    step: s.step,
                    status: s.status,
                })));

                // Sync new backend logs
                if (data.logs && data.logs.length > 0) {
                    data.logs.slice(-3).forEach(log => {
                        if (log.message) addLog(log.message, log.type || 'info');
                    });
                }

                // Stop polling when done or errored
                if (data.state === 'done' || data.state === 'error' || data.state === 'idle') {
                    stopPolling();
                    setIsLoading(false);
                }
            } catch (err) {
                addLog('Connection error — retrying...', 'error');
            }
        }, 2000);
    }, [stopPolling, addLog]);

    const sendCommand = useCallback(async (text) => {
        if (!text.trim()) return;
        setIsLoading(true);
        addLog(`Command: "${text}"`, 'action', '📤');
        setAgentState('listening');
        setActionPlan([]);
        setReasoning('');

        try {
            await axios.post(`${API_URL}/execute`, { command: text });
            addLog('Agent activated — analyzing...', 'thinking', '🧠');
            startPolling();
        } catch (err) {
            addLog('Failed to reach backend. Make sure the server is running.', 'error');
            setAgentState('error');
            setIsLoading(false);
        }
    }, [addLog, startPolling]);

    const interrupt = useCallback(async () => {
        stopPolling();
        try {
            await axios.post(`${API_URL}/interrupt`);
            addLog('⛔ Agent interrupted by user', 'warning');
        } catch {
            addLog('Could not reach backend to interrupt', 'error');
        }
        setAgentState('idle');
        setIsLoading(false);
    }, [stopPolling, addLog]);

    return {
        agentState,
        activityLog,
        reasoning,
        screenshot,
        actionPlan,
        isLoading,
        sendCommand,
        interrupt,
        addLog,
    };
}
