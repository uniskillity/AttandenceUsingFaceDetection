import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Student } from '../types';
import { recognizeStudentFace } from '../services/geminiService';
import { CameraIcon, CheckCircleIcon, UserCircleIcon, ExclamationIcon } from './icons';

interface CameraViewProps {
  students: Student[];
  onAttendanceMarked: (student: Student) => void;
}

const CameraView: React.FC<CameraViewProps> = ({ students, onAttendanceMarked }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [showSuccess, setShowSuccess] = useState<Student | null>(null);
  const [lastRecognitionTime, setLastRecognitionTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastMarkedStudentId, setLastMarkedStudentId] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access the camera. Please check permissions and try again.");
      setIsCameraOn(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOn(false);
    }
  };

  const captureAndRecognize = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isRecognizing) return;

    setIsRecognizing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      
      try {
        const student = await recognizeStudentFace(imageDataUrl, students);
        if (student) {
          // Only show success animation for a new student
          if(student.id !== lastMarkedStudentId) {
            onAttendanceMarked(student);
            setLastMarkedStudentId(student.id);
            setShowSuccess(student);
            stopCamera(); // Automatically turn off the camera on success
            setTimeout(() => {
                setShowSuccess(null);
                setLastMarkedStudentId(null);
            }, 4000); // Show success for 4 seconds
          }
        }
      } catch (err) {
        console.error("Recognition failed:", err);
      }
    }

    setIsRecognizing(false);
    setLastRecognitionTime(Date.now());
  }, [isRecognizing, students, onAttendanceMarked, lastMarkedStudentId]);

  useEffect(() => {
    // If camera is off, or success message is showing, do nothing.
    if (!isCameraOn || showSuccess) {
      return;
    }

    const intervalId = setInterval(() => {
      if (Date.now() - lastRecognitionTime > 5000) { // 5-second interval
        captureAndRecognize();
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isCameraOn, showSuccess, lastRecognitionTime, captureAndRecognize]);
  
  // Cleanup on component unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Live Attendance Capture</h2>
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
        <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${!isCameraOn && 'hidden'}`}></video>
        {!isCameraOn && !showSuccess && (
          <div className="text-center text-gray-400">
            <CameraIcon className="w-16 h-16 mx-auto mb-2" />
            <p>Camera is off</p>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden"></canvas>

        {/* Overlay for recognition status */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 transition-opacity duration-300 p-4">
          {showSuccess ? (
            <div className="text-white text-center p-6 bg-green-600 bg-opacity-90 rounded-2xl shadow-lg max-w-sm w-full animate-fade-in-scale">
              <style>{`
                @keyframes fade-in-scale {
                  0% { opacity: 0; transform: scale(0.9); }
                  100% { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in-scale {
                  animation: fade-in-scale 0.5s ease-out forwards;
                }
              `}</style>
              <CheckCircleIcon className="w-16 h-16 mx-auto mb-3" />
              <p className="font-bold text-2xl">{showSuccess.name}</p>
              <p className="text-lg">Attendance Marked Successfully!</p>
            </div>
          ) : isRecognizing ? (
            <div className="text-white text-center p-4 bg-black bg-opacity-50 rounded-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="mt-2 font-semibold">Recognizing...</p>
            </div>
          ) : isCameraOn && (
             <div className="text-white text-center p-4">
                <UserCircleIcon className="w-16 h-16 mx-auto text-gray-300 opacity-70" />
                <p className="mt-2 font-semibold">Please face the camera</p>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
          <ExclamationIcon className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        {!isCameraOn ? (
          <button onClick={startCamera} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2">
            <CameraIcon className="w-6 h-6" />
            <span>Start Camera</span>
          </button>
        ) : (
          <button onClick={stopCamera} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2">
            <CameraIcon className="w-6 h-6" />
            <span>Stop Camera</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CameraView;