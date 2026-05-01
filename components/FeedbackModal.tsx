
import React, { useState } from 'react';
import { XIcon, StarIcon } from './Icons';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  source: 'video_call' | 'general';
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit, source }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(rating, comment);
    setRating(0);
    setComment('');
  };

  const title = source === 'video_call' ? 'How was your call?' : 'Rate your experience';
  const placeholder = source === 'video_call' 
    ? 'How was the audio/video quality? Any issues?' 
    : 'Tell us what you like or how we can improve...';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full relative transform transition-all dark:bg-gray-800" role="dialog" aria-modal="true">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XIcon className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-boticare-gray-dark dark:text-gray-400">Your feedback helps us improve.</p>
        </div>

        <div className="flex justify-center space-x-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                >
                    <StarIcon className={`w-10 h-10 ${star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                </button>
            ))}
        </div>

        <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-boticare-gray rounded-lg border-none p-4 focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none mb-6 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
            rows={4}
        />

        <div className="flex flex-col space-y-3">
             <button
                onClick={handleSubmit}
                disabled={rating === 0}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:bg-gray-600"
            >
                Submit Feedback
            </button>
            <button
                onClick={onClose}
                className="w-full text-gray-500 font-medium hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
                Skip
            </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
