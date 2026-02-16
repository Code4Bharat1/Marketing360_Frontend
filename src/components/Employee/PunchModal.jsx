'use client';

import { useState, useEffect, useRef } from 'react';
import { IoClose, IoLocationSharp, IoCheckmarkCircle } from 'react-icons/io5';
import { MdAccessTime } from 'react-icons/md';
import { HiDocumentText } from 'react-icons/hi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { BiCamera } from 'react-icons/bi';

export default function PunchModal({ type, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    location: '',
    notes: '',
    photo: null
  });
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [showCamera, setShowCamera] = useState(true);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-detect location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Auto-open camera on mount
  useEffect(() => {
    openCamera();
    
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`
            );
            const data = await response.json();
            const address = data.display_name || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
            
            setFormData(prev => ({
              ...prev,
              location: address
            }));
          } catch (error) {
            setFormData(prev => ({
              ...prev,
              location: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
            }));
          }
          
          setLoadingLocation(false);
        },
        (error) => {
          setFormData(prev => ({
            ...prev,
            location: 'Location unavailable'
          }));
          setLoadingLocation(false);
        }
      );
    }
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setCameraStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('Camera access is required for attendance.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      // Flip horizontally for selfie
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const photoData = canvas.toDataURL('image/jpeg', 0.9);
      setFormData(prev => ({
        ...prev,
        photo: photoData
      }));
      
      setShowCamera(false);
      
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const retakePhoto = () => {
    setFormData(prev => ({
      ...prev,
      photo: null
    }));
    setShowCamera(true);
    openCamera();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onSubmit({
      ...formData,
      timestamp: new Date(),
      location: currentLocation || formData.location
    });
    
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 md:p-6">
      {/* Modal Container - Responsive Width */}
      <div className="bg-white w-full max-w-[95vw] sm:max-w-md md:max-w-lg lg:max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        
        {/* Header - Minimal */}
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-4 flex items-center justify-between flex-shrink-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">
              Mark Attendance
            </h3>
            <p className="text-[10px] sm:text-xs md:text-sm text-slate-300 mt-0.5">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit'
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0 ml-2"
            aria-label="Close"
          >
            <IoClose className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          {/* Camera View - Full Width Responsive */}
          <div className="relative bg-black">
            {showCamera ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full aspect-[3/4] sm:aspect-[9/12] md:aspect-[3/4] object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                
                {/* Location Overlay at Top - Responsive */}
                <div className="absolute top-0 left-0 right-0 p-2 sm:p-3 md:p-4">
                  <div className="bg-black/60 backdrop-blur-md rounded-lg sm:rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 flex items-start gap-1.5 sm:gap-2">
                    <IoLocationSharp className="w-3 h-3 sm:w-4 sm:h-4 text-white mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      {loadingLocation ? (
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <AiOutlineLoading3Quarters className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white animate-spin" />
                          <p className="text-[10px] sm:text-xs text-white">Detecting location...</p>
                        </div>
                      ) : (
                        <p className="text-[10px] sm:text-xs md:text-sm text-white leading-relaxed line-clamp-2">
                          {formData.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Capture Button at Bottom - Responsive */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-xs sm:text-sm font-medium text-white px-2 py-1.5 sm:px-4 sm:py-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="relative flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full"
                      aria-label="Capture photo"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center shadow-lg">
                        <div className="w-[56px] h-[56px] sm:w-[68px] sm:h-[68px] md:w-[84px] md:h-[84px] rounded-full bg-blue-500 flex items-center justify-center hover:bg-blue-600 active:scale-95 transition-all">
                          <BiCamera className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                        </div>
                      </div>
                    </button>

                    <div className="w-16 sm:w-20 md:w-24"></div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <img
                  src={formData.photo}
                  alt="Captured"
                  className="w-full aspect-[3/4] sm:aspect-[9/12] md:aspect-[3/4] object-cover"
                />
                
                {/* Location Overlay - Responsive */}
                <div className="absolute top-0 left-0 right-0 p-2 sm:p-3 md:p-4">
                  <div className="bg-black/60 backdrop-blur-md rounded-lg sm:rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 flex items-start gap-1.5 sm:gap-2">
                    <IoLocationSharp className="w-3 h-3 sm:w-4 sm:h-4 text-white mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] sm:text-xs md:text-sm text-white leading-relaxed line-clamp-2 flex-1">
                      {formData.location}
                    </p>
                  </div>
                </div>

                {/* Action Buttons - Responsive */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <div className="flex gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={retakePhoto}
                      className="flex-1 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold text-white bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl hover:bg-white/30 active:bg-white/40 transition-colors"
                    >
                      Retake
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSubmit({ preventDefault: () => {} });
                      }}
                      disabled={isSubmitting}
                      className="flex-1 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold text-white bg-blue-500 rounded-lg sm:rounded-xl hover:bg-blue-600 active:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <AiOutlineLoading3Quarters className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <IoCheckmarkCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>Confirm</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </form>
      </div>

      <style jsx>{`
        /* Smooth transitions */
        * {
          -webkit-tap-highlight-color: transparent;
        }

        /* Prevent scroll on background */
        @media (max-width: 640px) {
          body {
            overflow: hidden;
          }
        }

        /* Better touch targets */
        button {
          min-height: 44px;
          min-width: 44px;
        }

        @media (max-width: 640px) {
          button {
            min-height: 40px;
            min-width: 40px;
          }
        }

        /* Optimize for notch/safe areas on mobile */
        @supports (padding: max(0px)) {
          .fixed {
            padding-left: max(0.75rem, env(safe-area-inset-left));
            padding-right: max(0.75rem, env(safe-area-inset-right));
          }
        }
      `}</style>
    </div>
  );
}