
import React, { useState } from 'react';
import { SearchIcon, ChevronRightIcon, ChatIcon } from './Icons';
import Toast from './Toast';

const faqs = [
  {
    category: 'General',
    questions: [
      { q: 'What is Boticare?', a: 'Boticare is a comprehensive healthcare management app designed to help you track your health metrics, manage medications, and connect with healthcare professionals seamlessly.' },
      { q: 'Is my data secure?', a: 'Yes, absolutely. We are HIPAA compliant and use industry-standard encryption to protect all your personal and health information.' },
    ],
  },
  {
    category: 'Appointments',
    questions: [
      { q: 'How do I schedule a new appointment?', a: 'Navigate to the "Appointments" section from the sidebar, and click the "Schedule New Appointment" button. You can then select a professional, date, and time that works for you.' },
      { q: 'Can I reschedule or cancel an appointment?', a: 'Yes. On the appointment card for any upcoming appointment, you will find options to either "Reschedule" or "Cancel". Follow the on-screen prompts to complete the action.' },
    ],
  },
  {
    category: 'Technical Support',
    questions: [
      { q: 'The video call is not working. What should I do?', a: 'Please ensure you have granted camera and microphone permissions to your browser and this application. If the problem persists, try refreshing the page or contact our support team.' },
      { q: 'I forgot my password. How can I reset it?', a: 'On the login screen, click the "Forgot Password" link and follow the instructions sent to your registered email address to reset your password.' },
    ],
  },
];

interface AccordionItemProps {
  question: string;
  answer: string;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-boticare-gray-medium dark:border-gray-700">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left py-4">
        <span className="font-semibold text-gray-800 dark:text-gray-100">{question}</span>
        <ChevronRightIcon className={`w-5 h-5 text-boticare-gray-dark transition-transform dark:text-gray-400 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && (
        <div className="pb-4 pr-6 text-boticare-gray-dark dark:text-gray-400">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};


const HelpSupport: React.FC = () => {
    const [feedback, setFeedback] = useState('');
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const handleFeedbackSubmit = () => {
        if (!feedback.trim()) return;

        // Store feedback locally
        const entry = {
            id: Date.now().toString(),
            rating: 5, // Default for text-only feedback
            comment: feedback,
            date: new Date().toISOString(),
            source: 'general'
        };
        const existing = JSON.parse(localStorage.getItem('boticare-feedback') || '[]');
        localStorage.setItem('boticare-feedback', JSON.stringify([...existing, entry]));

        setFeedback('');
        setToastMessage('Thank you for your feedback!');
    };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {toastMessage && <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />}
      <div>
        <h2 className="text-2xl font-bold">Help & Support</h2>
        <p className="text-boticare-gray-dark dark:text-gray-400">We're here to help. Find answers to your questions below.</p>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
            type="text"
            placeholder="Search for help..."
            className="w-full bg-white rounded-lg border border-boticare-gray-medium pl-12 pr-4 py-3 focus:ring-2 focus:ring-boticare-blue-dark focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
        />
      </div>

      <div className="bg-white p-8 rounded-xl border border-boticare-gray-medium dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-xl font-bold mb-4">Frequently Asked Questions</h3>
        {faqs.map(category => (
            <div key={category.category} className="mb-6">
                <h4 className="text-lg font-semibold text-boticare-primary dark:text-blue-400 mb-2">{category.category}</h4>
                {category.questions.map((faq, index) => (
                    <AccordionItem key={index} question={faq.q} answer={faq.a} />
                ))}
            </div>
        ))}
      </div>
      
       <div className="bg-white p-8 rounded-xl border border-boticare-gray-medium dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-xl font-bold mb-4">Contact Us</h3>
        <p className="text-boticare-gray-dark dark:text-gray-400 mb-4">
            Can't find the answer you're looking for? Our support team is here to assist you.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-boticare-gray p-4 rounded-lg dark:bg-gray-700">
                <p className="font-semibold dark:text-gray-200">Email Support</p>
                <a href="mailto:support@boticare.com" className="text-boticare-blue-dark hover:underline dark:text-blue-400">support@boticare.com</a>
                <p className="text-xs text-boticare-gray-dark mt-1 dark:text-gray-400">We typically respond within 24 hours.</p>
            </div>
            <div className="bg-boticare-gray p-4 rounded-lg dark:bg-gray-700">
                <p className="font-semibold dark:text-gray-200">Phone Support</p>
                <a href="tel:+1-800-555-1234" className="text-boticare-blue-dark hover:underline dark:text-blue-400">+1 (800) 555-1234</a>
                <p className="text-xs text-boticare-gray-dark mt-1 dark:text-gray-400">Available Mon-Fri, 9am-5pm EST.</p>
            </div>
        </div>
      </div>

      {/* General Feedback Form */}
      <div className="bg-white p-8 rounded-xl border border-boticare-gray-medium dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-2">Send Feedback</h3>
          <p className="text-sm text-boticare-gray-dark mb-4 dark:text-gray-400">Let us know how we can improve your experience.</p>
          <div className="relative">
              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Type your feedback here..." 
                className="w-full bg-boticare-gray rounded-lg border-none p-4 focus:ring-2 focus:ring-boticare-blue-dark focus:outline-none resize-none dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
                rows={3}
              />
              <button 
                onClick={handleFeedbackSubmit}
                disabled={!feedback.trim()}
                className="absolute bottom-3 right-3 bg-boticare-primary text-white p-2 rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-400 dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:bg-gray-600"
              >
                  <ChatIcon className="w-5 h-5" />
              </button>
          </div>
      </div>

    </div>
  );
};

export default HelpSupport;
