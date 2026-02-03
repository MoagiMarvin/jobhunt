"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Video, Play, Square, RefreshCw, Send, AlertCircle, Loader2, Sparkles, Volume2, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Step 2: Interview Mode & Feedback **/
function InterviewScreen({ config, onComplete }: { config: any, onComplete: (results: any) => void }) {
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
    const [hasPermission, setHasPermission] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [feedback, setFeedback] = useState<any>(null); // Store analysis result
    const [results, setResults] = useState<any[]>([]); // Store all results

    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // Load Questions on Mount
    useEffect(() => {
        const loadQuestions = async () => {
            try {
                const res = await fetch('/api/interview/generate-questions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(config)
                });
                const data = await res.json();
                if (data.questions) {
                    setQuestions(data.questions);

                    // Welcome greeting before first question
                    const welcomeMsg = `Welcome to your practice interview for the ${config.jobTitle} position. Let's start with the first question.`;
                    speakQuestion(welcomeMsg);

                    // Small delay before speaking the actual first question
                    setTimeout(() => {
                        speakQuestion(data.questions[0].text);
                    }, 4000);
                }
            } catch (err) {
                console.error("Failed to load questions", err);
                alert("Failed to generate questions. Please try again.");
            }
        };
        loadQuestions();
        initCamera();
    }, []);

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRecording) {
            handleStopRecording();
        }
        return () => clearInterval(interval);
    }, [isRecording, timeLeft]);

    // Attach stream to video element when ready
    useEffect(() => {
        if (hasPermission && stream && videoRef.current) {
            console.log("Attaching stream to video element");
            videoRef.current.srcObject = stream;
            // Force play to ensure it doesn't stay black
            videoRef.current.play().catch(err => console.error("Video play failed:", err));
        }
    }, [hasPermission, stream, questions.length, feedback]);

    // Camera Init
    const initCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(mediaStream);
            setHasPermission(true);
        } catch (err) {
            console.error("Camera denied:", err);
            alert("Camera access is required for practice mode.");
        }
    };

    // Text to Speech
    const speakQuestion = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleStartRecording = () => {
        if (!videoRef.current?.srcObject) {
            console.error("No stream found on video element");
            alert("Camera not ready. Please wait a moment or refresh.");
            return;
        }

        const stream = videoRef.current.srcObject as MediaStream;
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.start();
        setIsRecording(true);
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsAnalyzing(true); // Start loading state

            // Wait for stop event to ensure we have all chunks
            mediaRecorderRef.current.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                await analyzeAnswer(blob);
            };
        }
    };

    const analyzeAnswer = async (audioBlob: Blob) => {
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob);
            formData.append('question', questions[currentIndex].text);

            const res = await fetch('/api/interview/analyze-answer', {
                method: 'POST',
                body: formData
            });
            const analysis = await res.json();

            setFeedback(analysis); // Show feedback screen
        } catch (err) {
            console.error("Analysis failed:", err);
            alert("Failed to analyze answer. Please try again.");
            setIsAnalyzing(false);
        }
    };

    const handleNext = () => {
        // Save result
        const result = {
            question: questions[currentIndex],
            feedback: feedback
        };
        const newResults = [...results, result];
        setResults(newResults);
        setFeedback(null); // Clear feedback
        setIsAnalyzing(false);
        setIsRecording(false);
        setTimeLeft(120);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => {
                const next = prev + 1;
                setTimeout(() => {
                    speakQuestion(questions[next].text);
                }, 500);
                return next;
            });
        } else {
            onComplete({ results: newResults, date: new Date() });
        }
    };

    const currentQuestion = questions[currentIndex];

    if (!questions.length) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">AI is crafting your interview questions...</p>
        </div>
    );

    // FEEDBACK VIEW
    if (feedback) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white p-8 rounded-2xl border-2 border-slate-100 shadow-xl">
                    <div className="flex items-center justify-center mb-6">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Sparkles className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Answer Analysis</h2>
                    <p className="text-center text-slate-500 mb-8 italic">"{currentQuestion.text}"</p>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                            <div className="text-3xl font-black text-blue-600 mb-1">{feedback.contentScore}%</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Content</div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                            <div className="text-3xl font-black text-purple-600 mb-1">{feedback.confidenceScore}%</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Confidence</div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                            <div className="text-3xl font-black text-emerald-600 mb-1">{feedback.deliveryScore}%</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Delivery</div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                <span className="text-xl">💡</span> AI Feedback
                            </h3>
                            <p className="text-blue-900 leading-relaxed">{feedback.feedback}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" /> Strengths
                                </h4>
                                <ul className="space-y-2">
                                    {feedback.strengths?.map((s: string, i: number) => (
                                        <li key={i} className="text-sm text-slate-600 pl-2 border-l-2 border-green-200">{s}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                    <RefreshCw className="w-5 h-5 text-amber-500" /> Improvements
                                </h4>
                                <ul className="space-y-2">
                                    {feedback.improvements?.map((s: string, i: number) => (
                                        <li key={i} className="text-sm text-slate-600 pl-2 border-l-2 border-amber-200">{s}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                        <button
                            onClick={handleNext}
                            className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
                        >
                            {currentIndex < questions.length - 1 ? "Next Question" : "Finish Session"}
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // INTERVIEW VIEW
    return (
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Left: Question & Status */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">
                            Question {currentIndex + 1} of {questions.length}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                            {currentQuestion.type === 'behavioral' ? 'Behavioral' : 'Technical'}
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 leading-relaxed">
                        {currentQuestion.text}
                    </h2>
                    <button
                        onClick={() => speakQuestion(currentQuestion.text)}
                        className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
                    >
                        <Volume2 className="w-4 h-4" />
                        Replay Question
                    </button>

                    <button
                        onClick={handleNext}
                        className="mt-2 w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors border-t border-slate-50 pt-4"
                    >
                        Skip this question
                        <ChevronRight className="w-3 h-3" />
                    </button>
                </div>

                {/* Coming Up List */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Session Progress</h3>
                    <div className="space-y-3">
                        {questions.map((q, idx) => (
                            <div key={q.id} className={cn("flex items-center gap-3 text-sm p-2 rounded-lg transition-all",
                                idx === currentIndex ? "bg-white shadow-sm border border-slate-100" :
                                    idx < currentIndex ? "opacity-50" : "opacity-40"
                            )}>
                                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold",
                                    idx === currentIndex ? "bg-blue-600 text-white" :
                                        idx < currentIndex ? "bg-green-100 text-green-600" : "bg-slate-200 text-slate-500"
                                )}>
                                    {idx < currentIndex ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                                </div>
                                <p className="truncate font-medium text-slate-700">{q.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Camera & Controls */}
            <div className="bg-black rounded-2xl overflow-hidden relative aspect-[3/4] md:aspect-auto shadow-2xl flex flex-col">
                <div className="flex-1 relative bg-slate-900 border-b border-white/10">
                    {hasPermission ? (
                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white/50">
                            <p>Camera access required</p>
                        </div>
                    )}

                    {/* Recording Indicator */}
                    {isRecording && (
                        <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                            <div className="w-2 h-2 bg-white rounded-full" />
                            RECORDING
                        </div>
                    )}

                    {/* Analyzing overlay */}
                    {isAnalyzing && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                            <p className="font-bold text-lg">Analyzing Answer...</p>
                            <p className="text-sm text-white/50">Checking confidence & content</p>
                        </div>
                    )}

                    {/* Timer */}
                    <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-mono backdrop-blur-md">
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                </div>

                {/* Control Bar */}
                <div className="p-6 bg-slate-900 border-t border-white/10">
                    {!isRecording ? (
                        <button
                            onClick={handleStartRecording}
                            disabled={isAnalyzing || !hasPermission}
                            className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all"
                        >
                            {!hasPermission ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Starting Camera...
                                </>
                            ) : (
                                <>
                                    <Mic className="w-4 h-4" />
                                    Start Recording Answer
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={handleStopRecording}
                            className="w-full py-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold flex items-center justify-center gap-3 transition-all"
                        >
                            <Square className="w-4 h-4 fill-current" />
                            Stop & Submit
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

/** Step 1: Configuration Screen **/
function SetupScreen({ onStart }: { onStart: (config: any) => void }) {
    const [jobTitle, setJobTitle] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [questionCount, setQuestionCount] = useState<3 | 5 | 10>(5);

    const handleStart = async () => {
        if (!jobTitle || !jobDescription) {
            alert("Please enter a job title and description");
            return;
        }

        onStart({ jobTitle, jobDescription, questionCount });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Mic className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-3xl font-black text-slate-900">AI Interview Coach</h1>
                <p className="text-slate-500 text-lg">Practice with an AI that listens, analyzes, and gives you instant feedback.</p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-slate-100 shadow-xl space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="font-bold text-slate-700">Target Job Title</label>
                        <input
                            type="text"
                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-semibold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                            placeholder="e.g. Senior Frontend Developer"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="font-bold text-slate-700">Job Description</label>
                        <textarea
                            className="w-full h-32 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none"
                            placeholder="Paste the job requirements here..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="font-bold text-slate-700">Practice Intensity</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {[
                                { count: 3, label: "Screening", detail: "15 min" },
                                { count: 5, label: "Full Interview", detail: "30 min" },
                                { count: 10, label: "Hardcore", detail: "60 min" }
                            ].map(({ count, label, detail }) => (
                                <button
                                    key={count}
                                    onClick={() => setQuestionCount(count as any)}
                                    className={cn(
                                        "py-3 px-2 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-0.5",
                                        questionCount === count
                                            ? "bg-blue-50 border-blue-600 text-blue-700"
                                            : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                                    )}
                                >
                                    <span className="font-bold text-sm">{label}</span>
                                    <span className="text-[10px] opacity-60">{count} Questions • {detail}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleStart}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <Sparkles className="w-5 h-5" />
                    Start Practice Session
                </button>
            </div>
        </div>
    );
}

/** Step 3: Final Report **/
function ReportScreen({ results, onRestart }: { results: any[], onRestart: () => void }) {
    // Calculate Averages (only including answered questions)
    const answeredResults = results.filter(r => r.feedback);
    const resultsCount = answeredResults.length || 1;

    const avgContent = Math.round(answeredResults.reduce((acc, r) => acc + (r.feedback?.contentScore || 0), 0) / resultsCount);
    const avgConfidence = Math.round(answeredResults.reduce((acc, r) => acc + (r.feedback?.confidenceScore || 0), 0) / resultsCount);
    const avgDelivery = Math.round(answeredResults.reduce((acc, r) => acc + (r.feedback?.deliveryScore || 0), 0) / resultsCount);
    const overallScore = Math.round((avgContent + avgConfidence + avgDelivery) / 3);

    // Aggregate Strengths & Improvements (take unique ones)
    const allStrengths = Array.from(new Set(answeredResults.flatMap(r => r.feedback?.strengths || []))).slice(0, 5);
    const allImprovements = Array.from(new Set(answeredResults.flatMap(r => r.feedback?.improvements || []))).slice(0, 5);

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-white p-8 rounded-2xl border-2 border-slate-100 shadow-xl text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">🎓</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">Practice Session Complete!</h1>
                <p className="text-slate-500 text-lg mb-8">Here's how you performed across {results.length} questions.</p>

                <div className="flex items-center justify-center mb-8">
                    <div className="relative w-40 h-40">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#E2E8F0"
                                strokeWidth="3"
                            />
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#2563EB"
                                strokeWidth="3"
                                strokeDasharray={`${overallScore}, 100`}
                                className="animate-[spin_1s_ease-out_reverse]"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-slate-900">{overallScore}%</span>
                            <span className="text-xs font-bold text-slate-400 uppercase">Overall</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-2xl font-black text-blue-600 mb-1">{avgContent}%</div>
                        <div className="text-xs font-bold text-slate-400 uppercase">Content</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-2xl font-black text-purple-600 mb-1">{avgConfidence}%</div>
                        <div className="text-xs font-bold text-slate-400 uppercase">Confidence</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-2xl font-black text-emerald-600 mb-1">{avgDelivery}%</div>
                        <div className="text-xs font-bold text-slate-400 uppercase">Delivery</div>
                    </div>
                </div>

                <div className="text-left grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <span className="text-xl">🔥</span> Top Strengths
                        </h3>
                        <ul className="space-y-3">
                            {allStrengths.map((s: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <span className="text-xl">💡</span> Focus Areas
                        </h3>
                        <ul className="space-y-3">
                            {allImprovements.map((s: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <button
                    onClick={onRestart}
                    className="mt-10 w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg text-lg flex items-center justify-center gap-2"
                >
                    <RefreshCw className="w-5 h-5" />
                    Start New Session
                </button>
            </div>
        </div>
    );
}

export default function InterviewPracticePage() {
    const [step, setStep] = useState<"setup" | "interview" | "report">("setup");
    const [config, setConfig] = useState<any>(null);
    const [sessionResults, setSessionResults] = useState<any[]>([]);

    return (
        <main className="min-h-screen bg-slate-50 py-12 px-4">
            {step === "setup" && (
                <SetupScreen onStart={(cfg) => { setConfig(cfg); setStep("interview"); }} />
            )}

            {step === "interview" && config && (
                <InterviewScreen
                    config={config}
                    onComplete={(results) => {
                        setSessionResults(results.results);
                        setStep("report");
                    }}
                />
            )}

            {step === "report" && (
                <ReportScreen
                    results={sessionResults}
                    onRestart={() => {
                        setConfig(null);
                        setSessionResults([]);
                        setStep("setup");
                    }}
                />
            )}
        </main>
    );
}
