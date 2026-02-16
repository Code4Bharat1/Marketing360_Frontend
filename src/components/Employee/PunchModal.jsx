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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-sm mx-4 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header - Minimal */}
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 px-4 py-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">
              Mark Attendance
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit'
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <IoClose className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-0">
          {/* Camera View - Full Width */}
          <div className="relative bg-black">
            {showCamera ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full aspect-[3/4] object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                
                {/* Location Overlay at Top */}
                <div className="absolute top-0 left-0 right-0 p-4">
                  <div className="bg-black/60 backdrop-blur-md rounded-xl px-3 py-2 flex items-start gap-2">
                    <IoLocationSharp className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      {loadingLocation ? (
                        <div className="flex items-center gap-2">
                          <AiOutlineLoading3Quarters className="w-3 h-3 text-white animate-spin" />
                          <p className="text-xs text-white">Detecting location...</p>
                        </div>
                      ) : (
                        <p className="text-xs text-white leading-relaxed line-clamp-2">
                          {formData.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Capture Button at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      className="text-sm font-medium text-white px-4 py-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="relative flex items-center justify-center"
                    >
                      <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
                        <div className="w-[68px] h-[68px] rounded-full bg-blue-500 flex items-center justify-center hover:bg-blue-600 transition-colors">
                          <BiCamera className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </button>

                    <div className="w-20"></div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <img
                  src={formData.photo}
                  alt="Captured"
                  className="w-full aspect-[3/4] object-cover"
                />
                
                {/* Location Overlay */}
                <div className="absolute top-0 left-0 right-0 p-4">
                  <div className="bg-black/60 backdrop-blur-md rounded-xl px-3 py-2 flex items-start gap-2">
                    <IoLocationSharp className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-white leading-relaxed line-clamp-2 flex-1">
                      {formData.location}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={retakePhoto}
                      className="flex-1 py-3 text-sm font-semibold text-white bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
                    >
                      Retake
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Proceed to next step - could expand form here
                        handleSubmit({ preventDefault: () => {} });
                      }}
                      className="flex-1 py-3 text-sm font-semibold text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <IoCheckmarkCircle className="w-5 h-5" />
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

          {/* Optional Notes Section - Collapsible */}
          {/* {!showCamera && (
            <div className="p-4 border-t border-slate-100">
              <div className="relative">
                <HiDocumentText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add notes (optional)..."
                  rows="2"
                  className="w-full pl-10 pr-3 py-2.5 text-sm text-slate-700 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 resize-none"
                />
              </div>
            </div>
          )} */}
        </form>
      </div>
    </div>
  );
}