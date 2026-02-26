import { useState, useRef, useCallback } from 'react';

/**
 * useVoiceInput — Web Speech API hook for VisionPilot
 *
 * @param {object} options
 * @param {(text: string) => void} options.onResult  - called on every transcript update (live)
 * @param {(text: string) => void} options.onAutoSend - called with final transcript when speech ends
 *
 * @returns {{ isListening, transcript, error, toggleListening, stopListening }}
 */
export function useVoiceInput({ onResult, onAutoSend }) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState(null);

    const recognitionRef = useRef(null);
    const transcriptRef = useRef('');  // sync ref so onend can read latest value
    const stoppedByUser = useRef(false); // track intentional stops

    const mapError = (code) => {
        switch (code) {
            case 'not-allowed': return 'Microphone access denied. Please allow mic permission.';
            case 'no-speech': return 'No speech detected. Try speaking louder.';
            case 'network': return 'Network error during voice recognition.';
            case 'aborted': return null; // user stopped — no error
            default: return `Voice recognition error: ${code}`;
        }
    };

    const startListening = useCallback(() => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError('Voice input not supported. Use Chrome or Edge.');
            return;
        }

        // Clean up any existing instance
        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch (_) { }
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;

        recognitionRef.current = recognition;
        stoppedByUser.current = false;
        transcriptRef.current = '';

        recognition.onstart = () => {
            setIsListening(true);
            setTranscript('');
            setError(null);
            transcriptRef.current = '';
        };

        recognition.onresult = (event) => {
            let finalText = '';
            let interimText = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const resultText = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalText += resultText;
                } else {
                    interimText += resultText;
                }
            }

            const currentText = finalText || interimText;
            transcriptRef.current = currentText;
            setTranscript(currentText);

            if (onResult) onResult(currentText);
        };

        recognition.onend = () => {
            setIsListening(false);
            const finalTranscript = transcriptRef.current;

            // Only auto-send if not stopped intentionally by the user
            if (finalTranscript && !stoppedByUser.current) {
                if (onAutoSend) onAutoSend(finalTranscript);
            }
        };

        recognition.onerror = (event) => {
            const msg = mapError(event.error);
            setError(msg);
            setIsListening(false);
        };

        try {
            recognition.start();
        } catch (err) {
            setError('Failed to start voice recognition.');
            setIsListening(false);
        }
    }, [onResult, onAutoSend]);

    const stopListening = useCallback(() => {
        stoppedByUser.current = true;
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (_) { }
        }
        setIsListening(false);
    }, []);

    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    return {
        isListening,
        transcript,
        error,
        toggleListening,
        stopListening,
    };
}
