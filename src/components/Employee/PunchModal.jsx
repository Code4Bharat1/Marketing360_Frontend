'use client';

import { useState, useEffect } from 'react';
import { IoClose, IoLocationSharp, IoCamera, IoCheckmarkCircle } from 'react-icons/io5';
import { MdAccessTime } from 'react-icons/md';
import { HiDocumentText } from 'react-icons/hi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

export default function PunchModal({ type, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    location: '',
    notes: '',
    photo: null
  });
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Get current location and convert to address
  const getCurrentLocation = () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          
          // Convert coordinates to address using reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`
            );
            const data = await response.json();
            
            // Format address nicely
            const address = data.display_name || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
            
            setFormData({
              ...formData,
              location: address
            });
          } catch (error) {
            console.error('Error getting address:', error);
            setFormData({
              ...formData,
              location: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
            });
          }
          
          setLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setFormData({
            ...formData,
            location: 'Location unavailable'
          });
          setLoadingLocation(false);
        }
      );
    } else {
      setFormData({
        ...formData,
        location: 'Geolocation not supported'
      });
      setLoadingLocation(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          photo: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Direct camera capture
  const capturePhoto = async () => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      
      // Trigger file input which will open camera
      document.getElementById('photo-upload').click();
      
      // Stop the stream after a moment
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
      }, 100);
    } catch (error) {
      console.error('Camera access denied:', error);
      // Fallback to file picker
      document.getElementById('photo-upload').click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onSubmit({
      ...formData,
      timestamp: new Date(),
      location: currentLocation || formData.location
    });
    
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-auto transform animate-slideUp">
        {/* Header */}
        <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 flex items-center justify-between ${
          type === 'in' 
            ? 'bg-emerald-500' 
            : 'bg-red-500'
        }`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <MdAccessTime className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {type === 'in' ? 'Punch In' : 'Punch Out'}
              </h3>
              <p className="text-xs sm:text-sm text-white/90">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
          >
            <IoClose className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[calc(100vh-120px)] overflow-y-auto">
          {/* Current Date & Time Display */}
          <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <p className="text-xs sm:text-sm font-semibold text-slate-600">Current Date & Time</p>
              <MdAccessTime className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-800">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit'
              })}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
              Location
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative min-w-0">
                <IoLocationSharp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter location or use GPS"
                  className="w-full pl-10 sm:pl-11 text-black pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                  required
                />
              </div>
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={loadingLocation}
                className="px-3 sm:px-4 py-2.5 sm:py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px] sm:min-w-[48px] flex-shrink-0"
              >
                {loadingLocation ? (
                  <AiOutlineLoading3Quarters className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                ) : (
                  <IoLocationSharp className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </button>
            </div>
            {currentLocation && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <IoCheckmarkCircle className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Location captured successfully</span>
              </p>
            )}
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
              Take Photo <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
                required
              />
              <button
                type="button"
                onClick={capturePhoto}
                className="flex items-center justify-center gap-2 w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <IoCamera className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-slate-600">
                  {formData.photo ? 'Photo captured - Tap to retake' : 'Tap to capture photo'}
                </span>
              </button>
            </div>
            {formData.photo && (
              <div className="mt-3 relative rounded-lg overflow-hidden">
                <img
                  src={formData.photo}
                  alt="Captured"
                  className="w-full h-32 sm:h-40 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, photo: null })}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <IoClose className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            )}
            {!formData.photo && (
              <p className="text-xs text-red-500 mt-2">Photo is required for attendance</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-black mb-2">
              Notes (Optional)
            </label>
            <div className="relative">
              <HiDocumentText className="absolute left-3 top-3 w-5 h-5 sm:w-6 sm:h-6 text-black" />
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={type === 'in' ? 'Starting my shift...' : 'Completed all tasks...'}
                rows="3"
                className="w-full pl-10 sm:pl-11 text-black pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.location || !formData.photo}
              className={`w-full sm:flex-1 px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2 ${
                type === 'in'
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600'
                  : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600'
              }`}
            >
              {isSubmitting ? (
                <>
                  <AiOutlineLoading3Quarters className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                  <span className="text-sm sm:text-base">Processing...</span>
                </>
              ) : (
                <>
                  <IoCheckmarkCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-sm sm:text-base">{type === 'in' ? 'Punch In' : 'Punch Out'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}