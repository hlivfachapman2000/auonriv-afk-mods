import React, { useState, useRef } from 'react';
import { analyzeImage, analyzeVideo } from '../services/geminiService';
import { Upload, FileVideo, Image as ImageIcon, Loader2, CheckCircle, AlertTriangle, MonitorPlay } from 'lucide-react';
import { AnalysisResult } from '../types';

export const Analyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoStreamRef = useRef<HTMLVideoElement>(document.createElement('video'));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      
      // Basic validation
      if (selected.size > 20 * 1024 * 1024) {
        setError("File too large. Max 20MB for browser demo.");
        return;
      }
      
      setFile(selected);
      setError(null);
      setAnalysis(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleLiveCapture = async () => {
     try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false
        });
        
        // Setup hidden video element to capture frame
        const video = videoStreamRef.current;
        video.srcObject = stream;
        video.onloadedmetadata = async () => {
            video.play();
            // Wait a moment for stream to stabilize
            await new Promise(r => setTimeout(r, 500));
            
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0);
            
            // Stop stream immediately after capture
            stream.getTracks().forEach(t => t.stop());
            
            const dataUrl = canvas.toDataURL('image/png');
            setPreview(dataUrl);
            
            // Create a file object for consistency
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            setFile(new File([blob], "live_capture.png", { type: "image/png" }));
            setAnalysis(null);
            setError(null);
        };

     } catch (err) {
         setError("Live capture cancelled.");
     }
  };

  const handleAnalyze = async () => {
    if (!file || !preview) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64Data = preview.split(',')[1];
      const mimeType = file.type;

      let resultText = '';

      if (mimeType.startsWith('image/')) {
        resultText = await analyzeImage(base64Data, mimeType);
      } else if (mimeType.startsWith('video/')) {
        resultText = await analyzeVideo(base64Data, mimeType);
      } else {
        throw new Error("Unsupported file type.");
      }

      setAnalysis({
        text: resultText,
        timestamp: new Date()
      });
    } catch (err: any) {
      setError(err.message || "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Upload Section */}
      <div className="space-y-6">
        <div className="bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-cyan-500/50 transition-colors relative group min-h-[300px]">
          <input 
            type="file" 
            accept="image/*,video/mp4,video/webm" 
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          
          {!preview ? (
            <>
              <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="text-gray-400 group-hover:text-cyan-400" size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-200 mb-2">Upload Intel</h3>
              <p className="text-sm text-gray-400 max-w-xs mb-4">
                Drop screenshots or gameplay clips (MP4).
              </p>
              
              <div className="relative z-20">
                  <span className="text-xs text-gray-500 uppercase tracking-widest mb-2 block">- OR -</span>
                  <button 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation(); // Prevent triggering file input
                        handleLiveCapture();
                    }}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-cyan-400 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border border-slate-600"
                  >
                      <MonitorPlay size={14} />
                      Live Screen Snip
                  </button>
              </div>
            </>
          ) : (
            <div className="w-full relative z-20">
              {file?.type.startsWith('video/') ? (
                <video src={preview} controls className="max-h-64 mx-auto rounded-lg border border-slate-600" />
              ) : (
                <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg border border-slate-600 object-contain" />
              )}
              <div className="mt-4 flex flex-col items-center justify-center gap-2 text-sm text-cyan-400">
                <div className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    <span>{file?.name} ready for scanning</span>
                </div>
                <button 
                    onClick={() => { setFile(null); setPreview(null); }}
                    className="text-xs text-red-400 hover:text-red-300 underline"
                >
                    Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!file || isAnalyzing}
          className={`w-full py-4 rounded-xl font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2
            ${!file || isAnalyzing 
              ? 'bg-slate-700 text-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/20'
            }`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="animate-spin" /> Processing Intel...
            </>
          ) : (
            <>
              {file?.type.startsWith('video') ? <FileVideo /> : <ImageIcon />} Analyze Media
            </>
          )}
        </button>
        
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-start gap-3 text-red-200">
            <AlertTriangle className="flex-shrink-0 mt-1" size={18} />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700 p-6 flex flex-col h-full min-h-[400px]">
        <h3 className="font-bold gamer-font text-xl text-gray-100 mb-4 flex items-center gap-2">
          <span className="w-2 h-6 bg-orange-500 rounded-sm"></span>
          ANALYSIS LOG
        </h3>
        
        <div className="flex-1 bg-black/40 rounded-lg p-6 overflow-y-auto font-mono text-sm leading-relaxed border border-slate-800">
          {analysis ? (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-xs text-cyan-500 mb-4 border-b border-slate-800 pb-2">
                <span>TIMESTAMP: {analysis.timestamp.toLocaleTimeString()}</span>
                <span>//</span>
                <span>STATUS: COMPLETE</span>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">{analysis.text}</p>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-4">
              <div className="w-12 h-12 border-2 border-slate-700 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-slate-700 rounded-full animate-pulse"></div>
              </div>
              <p>Awaiting media input for Gemini Pro Analysis...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};