import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { X } from 'lucide-react';

export default function WhatsAppPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already seen the popup
    const hasSeenPopup = localStorage.getItem('hasSeenWhatsAppPopup');
    if (!hasSeenPopup) {
      // Small delay to ensure the page has loaded
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Remember that user has seen the popup
    localStorage.setItem('hasSeenWhatsAppPopup', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
        
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h5v-2h-5c-4.34 0-7.89-3.52-8-7.85C3.11 7.52 6.66 4 11 4c4.41 0 8 3.59 8 8v1.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V12c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5c1.38 0 2.64-.56 3.54-1.47.59.36 1.26.57 1.97.57 1.93 0 3.5-1.57 3.5-3.5V12c0-5.52-4.48-10-10-10zm0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Join Our WhatsApp Group!</h3>
          <p className="text-gray-600 mb-6">
            Stay updated with the latest news and updates by joining our official WhatsApp group.
          </p>
          <div className="flex flex-col space-y-2">
            <a
              href="https://chat.whatsapp.com/F3sU8mKgOD9JJbb2K2XkTH"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              onClick={handleClose}
            >
              Join Now
            </a>
            <Button
              variant="outline"
              onClick={handleClose}
              className="mt-2"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
