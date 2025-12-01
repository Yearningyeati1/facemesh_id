import React, { useRef, useState, useCallback } from 'react';
import { CaptureMode } from '../types';

interface ImageInputProps {
  onImageSelected: (file: File) => void;
  isLoading?: boolean;
}

const ImageInput: React.FC<ImageInputProps> = ({ onImageSelected, isLoading = false }) => {
  const [mode, setMode] = useState<CaptureMode>(CaptureMode.UPLOAD);
  const [preview, setPreview] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please ensure permissions are granted.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const toggleMode = (newMode: CaptureMode) => {
    if (newMode === CaptureMode.CAMERA) {
      startCamera();
    } else {
      stopCamera();
    }
    setMode(newMode);
    setPreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreview(URL.createObjectURL(file));
      onImageSelected(file);
    }
  };

  const capturePhoto = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
            setPreview(URL.createObjectURL(file));
            onImageSelected(file);
            // Optionally stop camera after capture
            // stopCamera(); 
          }
        }, 'image/jpeg');
      }
    }
  }, [onImageSelected]);

  // Clean up stream on unmount
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
      <div className="flex space-x-4 mb-6 justify-center">
        <button
          onClick={() => toggleMode(CaptureMode.UPLOAD)}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            mode === CaptureMode.UPLOAD ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <i className="fa-solid fa-upload mr-2"></i> Upload File
        </button>
        <button
          onClick={() => toggleMode(CaptureMode.CAMERA)}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            mode === CaptureMode.CAMERA ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <i className="fa-solid fa-camera mr-2"></i> Use Camera
        </button>
      </div>

      <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden border-2 border-dashed border-slate-700 flex items-center justify-center relative">
        {mode === CaptureMode.CAMERA ? (
          !preview ? (
            <div className="relative w-full h-full">
               {/* Video Feed */}
               <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
               <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                 <button 
                    onClick={capturePhoto}
                    type="button"
                    className="bg-white/90 hover:bg-white text-slate-900 rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
                 >
                   <i className="fa-solid fa-camera text-xl"></i>
                 </button>
               </div>
            </div>
          ) : (
            <div className="relative w-full h-full group">
               <img src={preview} alt="Capture" className="w-full h-full object-contain" />
               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => setPreview(null)}
                    className="bg-slate-800 text-white px-4 py-2 rounded-lg"
                  >
                    Retake
                  </button>
               </div>
            </div>
          )
        ) : (
           preview ? (
             <div className="relative w-full h-full group">
                <img src={preview} alt="Upload" className="w-full h-full object-contain" />
                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => {
                        setPreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="bg-slate-800 text-white px-4 py-2 rounded-lg"
                    >
                      Clear
                    </button>
                 </div>
             </div>
           ) : (
             <div className="text-center p-8">
               <i className="fa-solid fa-cloud-arrow-up text-4xl text-slate-500 mb-3"></i>
               <p className="text-slate-400 text-sm mb-4">Click below to select an image</p>
               <input
                 type="file"
                 ref={fileInputRef}
                 onChange={handleFileChange}
                 accept="image/*"
                 className="block w-full text-sm text-slate-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-600 file:text-white
                   hover:file:bg-blue-700
                   cursor-pointer
                 "
               />
             </div>
           )
        )}
        
        {isLoading && (
            <div className="absolute inset-0 bg-slate-900/80 z-20 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
                <span className="text-blue-400 font-medium animate-pulse">Processing Face...</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default ImageInput;