
import React, { useState, useRef } from 'react';
import { analyzeVideo } from '../services/geminiService';
import { UploadIcon, ChatIcon } from './Icons';

const VideoAnalyzer: React.FC = () => {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [analysisResult, setAnalysisResult] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('video/')) {
            setVideoFile(file);
            setVideoUrl(URL.createObjectURL(file));
            setAnalysisResult('');
            setError(null);
        } else {
            setError('Please select a valid video file.');
        }
    };

    const handleAnalyze = async () => {
        if (!videoFile || !prompt.trim()) {
            setError('Please upload a video and enter a prompt.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult('');

        try {
            const result = await analyzeVideo(videoFile, prompt);
            setAnalysisResult(result);
        } catch (err: any) {
            setError(err.message || 'An error occurred during analysis.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold">AI Video Analyzer</h2>
                <p className="text-boticare-gray-dark dark:text-gray-400">Upload a video and ask questions about its content.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-boticare-gray-medium dark:bg-gray-800 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Video and Prompt Input */}
                    <div className="space-y-4">
                        <div 
                            className="border-2 border-dashed border-boticare-gray-medium dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:bg-boticare-gray dark:hover:bg-gray-700/50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="video/*" />
                            <UploadIcon className="w-10 h-10 mx-auto text-boticare-gray-dark dark:text-gray-500 mb-2"/>
                            <p className="font-semibold text-blue-600 dark:text-blue-400">Click to upload video</p>
                            <p className="text-xs text-boticare-gray-dark dark:text-gray-400">{videoFile ? videoFile.name : 'MP4, MOV, etc.'}</p>
                        </div>

                        {videoUrl && (
                            <video src={videoUrl} controls className="w-full rounded-lg" />
                        )}

                        <div>
                            <label htmlFor="video-prompt" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Your Question</label>
                            <textarea
                                id="video-prompt"
                                rows={3}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., 'Summarize this video' or 'What is happening at 0:15?'"
                                className="w-full bg-boticare-gray rounded-lg border-none p-4 focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none dark:bg-gray-700 dark:text-gray-200"
                            />
                        </div>
                         <button 
                            onClick={handleAnalyze} 
                            disabled={isLoading || !videoFile || !prompt.trim()}
                            className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center space-x-2 hover:bg-opacity-90 transition-colors disabled:bg-gray-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:bg-gray-500"
                        >
                            {isLoading ? 'Analyzing...' : 'Analyze Video'}
                        </button>
                    </div>

                    {/* Analysis Result */}
                    <div className="bg-boticare-gray dark:bg-gray-900 rounded-lg p-4 flex flex-col">
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><ChatIcon className="w-5 h-5"/> Analysis Result</h3>
                        <div className="flex-grow bg-white dark:bg-gray-800 rounded-md p-4 overflow-y-auto">
                            {isLoading && (
                                <div className="flex items-center justify-center h-full">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-boticare-gray-dark rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-boticare-gray-dark rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-boticare-gray-dark rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            )}
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            {analysisResult && (
                                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed dark:text-gray-300">
                                    {analysisResult}
                                </p>
                            )}
                             {!isLoading && !error && !analysisResult && (
                                <p className="text-sm text-boticare-gray-dark">Analysis will appear here.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoAnalyzer;
