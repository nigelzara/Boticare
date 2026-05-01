
import React from 'react';
import { XIcon, DownloadIcon, FilePdfIcon, FileWordIcon } from './Icons';

interface HealthReportModalProps {
  isOpen: boolean;
  isLoading: boolean;
  content: string;
  dateRange: { start: string; end: string } | null;
  onClose: () => void;
}

const HealthReportModal: React.FC<HealthReportModalProps> = ({ isOpen, isLoading, content, dateRange, onClose }) => {
  if (!isOpen) return null;

  const generatedDate = new Date().toLocaleString();

  const handleDownloadDocx = () => {
    // Basic mock of DOCX download using HTML/Blob
    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Health Report</title></head><body>
      <h1>Boticare AI Health Report</h1>
      <p><strong>Generated on:</strong> ${generatedDate}</p>
      <p><strong>Period:</strong> ${dateRange?.start} to ${dateRange?.end}</p>
      <hr/>
    `;
    const footer = "</body></html>";
    // Convert markdown-like headers to HTML for the doc
    let formattedContent = content
        .replace(/### (.*)/g, '<h3>$1</h3>')
        .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
        .replace(/- (.*)/g, '<li>$1</li>')
        .replace(/\n/g, '<br/>');
    
    const sourceHTML = header + formattedContent + footer;
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `Health_Report_${dateRange?.start}_${dateRange?.end}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const handleDownloadPdf = () => {
    // Using window.print() as a robust client-side PDF solution without libraries
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
        printWindow.document.write(`
            <html>
                <head>
                    <title>Health Report</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; line-height: 1.6; }
                        h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
                        h3 { color: #555; margin-top: 20px; }
                        .meta { color: #666; font-size: 0.9em; margin-bottom: 30px; }
                    </style>
                </head>
                <body>
                    <h1>Boticare AI Health Report</h1>
                    <div class="meta">
                        <p><strong>Generated on:</strong> ${generatedDate}</p>
                        <p><strong>Reporting Period:</strong> ${dateRange?.start} to ${dateRange?.end}</p>
                    </div>
                    <div>
                        ${content.replace(/\n/g, '<br/>').replace(/### (.*)/g, '<h3>$1</h3>').replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-3xl w-full relative transform transition-all dark:bg-gray-800" role="dialog" aria-modal="true">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close">
            <XIcon className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pr-8">
            <div>
                <h2 className="text-2xl font-bold">Your AI Health Report</h2>
                {!isLoading && (
                    <p className="text-sm text-gray-500 mt-1">
                        Report from <span className="font-semibold">{dateRange?.start}</span> to <span className="font-semibold">{dateRange?.end}</span>
                    </p>
                )}
            </div>
            
            {!isLoading && (
                <div className="flex space-x-2 mt-4 md:mt-0">
                    <button onClick={handleDownloadPdf} className="flex items-center px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <FilePdfIcon className="w-4 h-4 mr-1.5 text-red-500" />
                        PDF
                    </button>
                    <button onClick={handleDownloadDocx} className="flex items-center px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <FileWordIcon className="w-4 h-4 mr-1.5 text-blue-500" />
                        DOCX
                    </button>
                </div>
            )}
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto pr-2">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-12">
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse [animation-delay:-0.3s] dark:bg-blue-400"></div>
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse [animation-delay:-0.15s] dark:bg-blue-400"></div>
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse dark:bg-blue-400"></div>
                    </div>
                    <p className="text-sm font-medium text-boticare-gray-dark dark:text-gray-400">Generating your personalized health report...</p>
                </div>
            ) : (
                <div className="prose dark:prose-invert max-w-none text-sm md:text-base">
                    <p className="text-xs text-gray-400 mb-4 italic">Generated on: {generatedDate}</p>
                    {content.split('\n').map((paragraph, index) => {
                        if (paragraph.startsWith('###')) {
                            return <h3 key={index} className="font-bold text-lg mt-4 mb-2">{paragraph.replace('###', '').trim()}</h3>;
                        }
                        if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                            return <p key={index} className="font-semibold my-1">{paragraph.replace(/\*\*/g, '')}</p>;
                        }
                        if (paragraph.trim().startsWith('-')) {
                            return <li key={index} className="ml-4 list-disc">{paragraph.replace('-', '').trim()}</li>
                        }
                        return <p key={index} className="mb-2">{paragraph}</p>;
                    })}
                </div>
            )}
        </div>

         <div className="flex justify-end pt-6 mt-6 border-t border-boticare-gray-medium dark:border-gray-700">
            <button
                onClick={onClose}
                className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default HealthReportModal;
