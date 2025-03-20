import React from 'react';

const VideoModal = ({ isOpen, closeModal }: { isOpen: boolean; closeModal: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-4xl p-4">
        <button
          onClick={closeModal}
          className="absolute top-2 right-2 z-10 p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75"
        >
          ×
        </button>
        <div className="w-full aspect-video relative rounded-lg overflow-hidden shadow-lg bg-white">
          <iframe 
            className="absolute top-0 left-0 w-full h-full"
            src="https://www.youtube.com/embed/your-video-id?rel=0&showinfo=1&controls=1"
            title="Video Tutorial"
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" 
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
