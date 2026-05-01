
import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';
import { UploadIcon, PenIcon } from './Icons';

const ImageEditor: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<{ b64: string; mime: string; url: string; } | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setOriginalImage({
                    b64: result.split(',')[1],
                    mime: file.type,
                    url: URL.createObjectURL(file),
                });
                setEditedImage(null);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!originalImage || !prompt.trim()) {
            setError('Please upload an image and provide a prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setEditedImage(null);

        const result = await editImage(originalImage.b64, originalImage.mime, prompt);

        if (result) {
            setEditedImage(`data:image/png;base64,${result}`);
        } else {
            setError('Failed to edit the image. Please try again.');
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold">AI Image Editor</h2>
                <p className="text-boticare-gray-dark dark:text-gray-400">Upload an image and use text prompts to edit it with AI.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-boticare-gray-medium dark:bg-gray-800 dark:border-gray-700 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Input Area */}
                    <div className="space-y-4">
                        <div 
                            className="border-2 border-dashed border-boticare-gray-medium dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:bg-boticare-gray dark:hover:bg-gray-700/50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                            <UploadIcon className="w-10 h-10 mx-auto text-boticare-gray-dark dark:text-gray-500 mb-2"/>
                            <p className="font-semibold text-blue-600 dark:text-blue-400">Click to upload image</p>
                            <p className="text-xs text-boticare-gray-dark dark:text-gray-400">PNG, JPG, or WEBP</p>
                        </div>
                        
                        <div>
                            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Editing Prompt</label>
                            <div className="relative">
                                <PenIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    id="prompt"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder='e.g., "Add a retro filter" or "Make the sky blue"'
                                    className="w-full bg-boticare-gray rounded-lg border-none pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none dark:bg-gray-700 dark:text-gray-200"
                                />
                            </div>
                        </div>

                         <button 
                            onClick={handleGenerate} 
                            disabled={isLoading || !originalImage || !prompt.trim()}
                            className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center space-x-2 hover:bg-opacity-90 transition-colors disabled:bg-gray-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:bg-gray-500"
                        >
                            {isLoading ? 'Generating...' : 'Generate Edit'}
                        </button>
                    </div>

                    {/* Image Display */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <h3 className="font-semibold mb-2">Original</h3>
                            <div className="aspect-square bg-boticare-gray dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                {originalImage ? <img src={originalImage.url} alt="Original" className="max-h-full max-w-full rounded-lg object-contain" /> : <p className="text-sm text-boticare-gray-dark">No image</p>}
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="font-semibold mb-2">Edited</h3>
                            <div className="aspect-square bg-boticare-gray dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                {isLoading && <div className="w-5 h-5 border-2 border-t-transparent border-blue-600 dark:border-blue-400 rounded-full animate-spin"></div>}
                                {error && <p className="text-sm text-red-500 px-2">{error}</p>}
                                {editedImage && <img src={editedImage} alt="Edited" className="max-h-full max-w-full rounded-lg object-contain" />}
                                {!isLoading && !error && !editedImage && <p className="text-sm text-boticare-gray-dark">Awaiting edit</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;
