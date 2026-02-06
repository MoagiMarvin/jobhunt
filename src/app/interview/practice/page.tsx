"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { Mic, Video, Play, Square, RefreshCw, Send, AlertCircle, Loader2, Sparkles, Volume2, ChevronRight, CheckCircle2, Search, MapPin, Briefcase, ExternalLink, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

/** Voice Waveform Component **/
function VoiceWaveform({ isActive }: { isActive: boolean }) {
    return (
        <div className="flex items-center justify-center gap-1 h-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                    key={i}
                    className={cn(
                        "w-1 bg-blue-500 rounded-full transition-all duration-300",
                        isActive ? "animate-bounce" : "h-1 opacity-30"
                    )}
                    style={{
                        height: isActive ? `${Math.random() * 100 + 20}%` : "4px",
                        animationDelay: `${i * 0.1}s`
                    }}
                />
            ))}
        </div>
    );
}

/** Step 2: Interview Mode & Feedback **/
function InterviewScreen({ config, profileData, onComplete }: { config: any, profileData: any, onComplete: (results: any) => void }) {
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
                    body: JSON.stringify({
                        ...config,
                        userProfile: profileData
                    })
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

            // Speak the feedback summary
            if (analysis.feedback) {
                setTimeout(() => {
                    speakQuestion("Analysis ready. " + analysis.feedback);
                }, 500);
            }
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

                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                        <button
                            onClick={() => speakQuestion(feedback.feedback)}
                            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
                        >
                            <Volume2 className="w-5 h-5" />
                            Read Analysis Aloud
                        </button>
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

            {/* Right: Dual View (Side-by-Side) */}
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[350px] sm:h-[400px]">
                    {/* Local Camera View */}
                    <div className="bg-black rounded-2xl overflow-hidden relative border-2 border-slate-100 shadow-lg">
                        {hasPermission ? (
                            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-white/50 text-xs">
                                Camera Off
                            </div>
                        )}
                        <div className="absolute top-3 left-3 bg-black/60 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">REHEARSAL VIEW</div>

                        {isRecording && (
                            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">
                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                REC
                            </div>
                        )}
                    </div>

                    {/* AI Avatar View */}
                    <div className="bg-slate-50 rounded-2xl overflow-hidden relative border-2 border-slate-100 shadow-lg">
                        <Image
                            src="/ai_recruiter_avatar_1770340592984.png"
                            alt="AI Recruiter"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">RECRUITER</div>

                        {/* Speech Bubble (When speaking) */}
                        {!isRecording && !isAnalyzing && (
                            <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-200 animate-in fade-in slide-in-from-top-2">
                                <p className="text-[10px] font-bold text-blue-600 mb-1 uppercase tracking-widest">Speaking...</p>
                                <p className="text-sm font-medium text-slate-700 leading-tight">
                                    {currentQuestion.text}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Control Panel */}
                <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-lg overflow-hidden">
                    {/* Analyzing overlay */}
                    {isAnalyzing && (
                        <div className="p-12 absolute inset-0 bg-blue-600/90 backdrop-blur-sm flex flex-col items-center justify-center text-white z-50 rounded-2xl">
                            <Loader2 className="w-12 h-12 animate-spin text-white mb-4" />
                            <p className="font-black text-xl">Evaluating your answer...</p>
                        </div>
                    )}

                    <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={cn("w-2 h-2 rounded-full", isRecording ? "bg-red-500 animate-pulse" : "bg-slate-300")} />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    {isRecording ? "Listening" : "System Ready"}
                                </span>
                            </div>
                            <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-mono font-black text-slate-600">
                                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                            </div>
                        </div>

                        <VoiceWaveform isActive={isRecording} />

                        {!isRecording ? (
                            <button
                                onClick={handleStartRecording}
                                disabled={isAnalyzing || !hasPermission}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-black text-sm tracking-widest shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3"
                            >
                                <Mic className="w-5 h-5" />
                                START ANSWERING
                            </button>
                        ) : (
                            <button
                                onClick={handleStopRecording}
                                className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-black text-sm tracking-widest shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 border-b-4 border-slate-700"
                            >
                                <Square className="w-4 h-4 fill-white" />
                                STOP & SUBMIT
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/** Step 1: Configuration Screen **/
function SetupScreen({ onStart }: { onStart: (config: any) => void }) {
    const searchParams = useSearchParams();
    const initialTitle = searchParams.get("title") || "";
    const initialLink = searchParams.get("link") || "";

    const [jobTitle, setJobTitle] = useState(initialTitle);
    const [jobDescription, setJobDescription] = useState("");
    const [questionCount, setQuestionCount] = useState<3 | 5 | 10>(5);
    const [isScraping, setIsScraping] = useState(false);

    // Auto-scrape if link is provided
    useEffect(() => {
        if (initialLink && !jobDescription) {
            handleScrape(initialLink);
        }
    }, [initialLink]);

    const handleScrape = async (url: string) => {
        setIsScraping(true);
        try {
            const res = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            if (data.requirements) {
                setJobDescription(data.requirements);
            }
        } catch (err) {
            console.error("Scrape failed:", err);
        } finally {
            setIsScraping(false);
        }
    };
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
                        <div className="relative">
                            <textarea
                                className="w-full h-32 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none"
                                placeholder="Paste the job requirements here..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                            {isScraping && (
                                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
                                    <div className="flex items-center gap-2 text-blue-600 font-bold">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>AI is reading the job link...</span>
                                    </div>
                                </div>
                            )}
                        </div>
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
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        }>
            <InterviewPracticeContent />
        </Suspense>
    );
}

function InterviewPracticeContent() {
    const [step, setStep] = useState<"setup" | "interview" | "report">("setup");
    const [config, setConfig] = useState<any>(null);
    const [sessionResults, setSessionResults] = useState<any[]>([]);
    const [profileData, setProfileData] = useState<any>(null);

    // Load Profile Data from localStorage (same as Generate page)
    useEffect(() => {
        const basicInfo = localStorage.getItem("user_basic_info");
        const skills = localStorage.getItem("user_skills_list");
        const experience = localStorage.getItem("user_experience_list");
        const credentials = localStorage.getItem("user_credentials_list");
        const projects = localStorage.getItem("user_projects_list");
        const languages = localStorage.getItem("user_languages_list");
        const references = localStorage.getItem("user_references_list");
        const matric = localStorage.getItem("user_matric_data");

        const safeParse = (item: string | null, fallback: any) => {
            if (!item) return fallback;
            try {
                const parsed = JSON.parse(item);
                return (Array.isArray(parsed) && parsed.length === 0) ? fallback : parsed;
            } catch { return fallback; }
        };

        const data = {
            user: safeParse(basicInfo, null),
            skills: safeParse(skills, []),
            experiences: safeParse(experience, []),
            credentials: safeParse(credentials, []),
            projectsList: safeParse(projects, []),
            languages: safeParse(languages, []),
            references: safeParse(references, []),
            matricData: safeParse(matric, null),
        };

        setProfileData(data);
    }, []);

    return (
        <main className="min-h-screen bg-slate-50 py-12 px-4">
            {step === "setup" && (
                <SetupScreen onStart={(cfg) => { setConfig(cfg); setStep("interview"); }} />
            )}

            {step === "interview" && config && (
                <InterviewScreen
                    config={config}
                    profileData={profileData}
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
