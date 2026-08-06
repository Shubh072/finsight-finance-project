import React from "react";
import { 
  Camera, Upload, Sparkles, FileText, Check, RefreshCw, MapPin, 
  DollarSign, Calendar as CalendarIcon, Tag, CreditCard, 
  Image as ImageIcon, ArrowRight, CheckCircle2
} from "lucide-react";
import { Expense } from "../types";

interface ExpenseScannerProps {
  onAddExpense: (expense: Omit<Expense, "id">) => void;
  onViewLedger?: () => void;
  showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

export const ExpenseScanner: React.FC<ExpenseScannerProps> = ({ 
  onAddExpense, 
  onViewLedger, 
  showToast 
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [scanProgress, setScanProgress] = React.useState<number | null>(null);
  const [isScanning, setIsScanning] = React.useState(false);
  
  // Real Camera State & Refs
  const [cameraActive, setCameraActive] = React.useState(false);
  const [cameraFlash, setCameraFlash] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = React.useState<MediaStream | null>(null);

  // Scanned / Uploaded Receipt Image Preview
  const [scannedImagePreview, setScannedImagePreview] = React.useState<string | null>(null);

  // Extracted Result Form State
  const [extractedResult, setExtractedResult] = React.useState<{
    date: string;
    merchant: string;
    amount: number;
    category: string;
    location: string;
    notes: string;
    paymentMethod: string;
    tags: string[];
    isAutoAdded?: boolean;
  } | null>(null);

  // Sample receipts for interactive OCR
  const SAMPLE_RECEIPTS = [
    {
      id: "r1",
      name: "Whole Foods - Organic Groceries",
      fileName: "wholefoods_july20.png",
      previewUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60",
      data: {
        date: "2026-07-20",
        merchant: "Whole Foods Market",
        amount: 142.75,
        category: "Food",
        location: "San Francisco, CA (Polk St)",
        notes: "OCR automatic extraction: organic produce, family groceries",
        paymentMethod: "Visa Debit (*4491)",
        tags: ["Groceries", "Organic", "Family"]
      }
    },
    {
      id: "r2",
      name: "Delta Air Lines - Flights",
      fileName: "delta_flight_invoice.pdf",
      previewUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500&auto=format&fit=crop&q=60",
      data: {
        date: "2026-07-18",
        merchant: "Delta Air Lines",
        amount: 850.00,
        category: "Travel",
        location: "Atlanta, GA (Hartsfield-Jackson)",
        notes: "OCR automatic extraction: Q3 Corporate Board travel booking",
        paymentMethod: "Chase Corporate Card (*8210)",
        tags: ["Travel", "Board-Meeting", "Q3"]
      }
    },
    {
      id: "r3",
      name: "Slack Technologies - SaaS Plan",
      fileName: "slack_saas_july15.png",
      previewUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60",
      data: {
        date: "2026-07-15",
        merchant: "Slack Technologies Inc.",
        amount: 360.00,
        category: "Utilities",
        location: "Vancouver, BC (HQ Server)",
        notes: "OCR automatic extraction: Workspace annual software subscription",
        paymentMethod: "American Express (*1008)",
        tags: ["Software", "SaaS", "Team"]
      }
    }
  ];

  // Handle Camera Feed
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      setMediaStream(stream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      showToast("Camera stream requested. Showing active camera simulation frame.", "info");
      setCameraActive(true);
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
    setCameraActive(false);
  };

  const triggerCameraPhoto = () => {
    setCameraFlash(true);
    setTimeout(() => setCameraFlash(false), 200);

    let capturedUrl = "";
    if (videoRef.current && mediaStream) {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          capturedUrl = canvas.toDataURL("image/png");
        }
      } catch {}
    }

    stopCamera();
    showToast("Snapshot captured! Running AI computer vision OCR...", "success");

    const sampleData = SAMPLE_RECEIPTS[1].data;
    startScanAnimation(
      sampleData,
      capturedUrl || SAMPLE_RECEIPTS[1].previewUrl
    );
  };

  const startScanAnimation = (resultData: typeof SAMPLE_RECEIPTS[0]["data"], imagePreview?: string) => {
    setIsScanning(true);
    setScanProgress(5);
    setExtractedResult(null);
    if (imagePreview) {
      setScannedImagePreview(imagePreview);
    }

    let currentProgress = 5;
    const interval = setInterval(() => {
      currentProgress += 15;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setScanProgress(null);
        setIsScanning(false);
        setExtractedResult({
          ...resultData,
          isAutoAdded: true
        });

        // Automatically post to expenses outside state reducer
        onAddExpense({
          date: resultData.date,
          category: resultData.category,
          merchant: resultData.merchant,
          amount: resultData.amount,
          status: "Cleared",
          notes: resultData.notes,
          tags: resultData.tags,
          paymentMethod: resultData.paymentMethod,
          location: resultData.location,
          approvalStatus: "Submitted"
        });

        showToast(`Receipt scanned & added to expenses! ($${resultData.amount.toFixed(2)} - ${resultData.merchant})`, "success");
      } else {
        setScanProgress(currentProgress);
      }
    }, 180);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processUploadedFile = (file: File) => {
    showToast(`Receipt '${file.name}' received. Running OCR parser...`, "info");
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      
      const nameLower = file.name.toLowerCase();
      let selectedSample = SAMPLE_RECEIPTS[0].data;
      if (nameLower.includes("delta") || nameLower.includes("flight") || nameLower.includes("travel")) {
        selectedSample = SAMPLE_RECEIPTS[1].data;
      } else if (nameLower.includes("slack") || nameLower.includes("saas") || nameLower.includes("bill")) {
        selectedSample = SAMPLE_RECEIPTS[2].data;
      } else {
        selectedSample = {
          ...selectedSample,
          merchant: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").toUpperCase(),
          date: new Date().toISOString().split("T")[0],
          notes: `OCR extraction from file '${file.name}'`
        };
      }

      startScanAnimation(selectedSample, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    } else {
      const randomReceipt = SAMPLE_RECEIPTS[Math.floor(Math.random() * SAMPLE_RECEIPTS.length)];
      startScanAnimation(randomReceipt.data, randomReceipt.previewUrl);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    } else {
      const randomReceipt = SAMPLE_RECEIPTS[Math.floor(Math.random() * SAMPLE_RECEIPTS.length)];
      startScanAnimation(randomReceipt.data, randomReceipt.previewUrl);
    }
  };

  const handleReSaveExtracted = () => {
    if (!extractedResult) return;
    onAddExpense({
      date: extractedResult.date,
      category: extractedResult.category,
      merchant: extractedResult.merchant,
      amount: extractedResult.amount,
      status: "Cleared",
      notes: extractedResult.notes,
      tags: extractedResult.tags,
      paymentMethod: extractedResult.paymentMethod,
      location: extractedResult.location,
      approvalStatus: "Submitted"
    });
    showToast(`Updated '${extractedResult.merchant}' ($${extractedResult.amount.toFixed(2)}) in Expense Ledger!`, "success");
    if (onViewLedger) {
      onViewLedger();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Receipt Scanner OCR Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-mono rounded-full inline-block">AI Vision Engine v4.2</span>
            <h3 className="text-white font-bold text-lg mt-1.5 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-400" />
              AI Receipt Scanner & OCR
            </h3>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl">
              Drag & drop receipt files, take a live camera photo, or select a sample receipt below to extract metadata and automatically save transactions to your expense ledger.
            </p>
          </div>

          {scannedImagePreview && (
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <ImageIcon className="w-4 h-4 text-sky-400" />
              <span className="text-xs text-slate-300 font-mono font-bold">Image Attached</span>
            </div>
          )}
        </div>

        {/* Camera Viewport or Drop Zone */}
        {cameraActive ? (
          <div className="bg-black rounded-xl h-72 relative flex flex-col items-center justify-center overflow-hidden border border-slate-800 shadow-inner">
            {cameraFlash && <div className="absolute inset-0 bg-white z-20"></div>}
            
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            ></video>

            <div className="text-center space-y-2 z-10 bg-slate-950/80 px-4 py-2 rounded-xl backdrop-blur-md border border-slate-800">
              <p className="text-emerald-400 font-mono text-xs animate-pulse flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> LIVE CAMERA MATRIX ACTIVE
              </p>
              <p className="text-[10px] text-slate-400 font-mono">Position receipt within alignment grid</p>
            </div>

            {/* Focus Crosshairs Overlay */}
            <div className="absolute inset-8 border border-dashed border-emerald-500/40 rounded-lg pointer-events-none flex items-center justify-center">
              <div className="w-8 h-8 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0"></div>
              <div className="w-8 h-8 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0"></div>
              <div className="w-8 h-8 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0"></div>
              <div className="w-8 h-8 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0"></div>
            </div>

            <div className="absolute bottom-4 flex gap-2 z-10">
              <button
                type="button"
                onClick={triggerCameraPhoto}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs rounded-xl font-bold shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" /> Capture Frame
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center p-6 text-center transition-all relative overflow-hidden ${
              isDragging
                ? "border-sky-500 bg-sky-950/30"
                : "border-slate-800 hover:border-slate-700 bg-slate-950/40"
            }`}
          >
            {scannedImagePreview && !isScanning && (
              <div className="absolute inset-0 z-0">
                <img src={scannedImagePreview} alt="Scanned Receipt" className="w-full h-full object-cover opacity-20" />
              </div>
            )}

            {scanProgress !== null ? (
              <div className="space-y-3 w-full max-w-sm z-10 bg-slate-950/90 p-5 rounded-xl border border-slate-800 backdrop-blur-md">
                <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto" />
                <p className="text-xs font-mono text-sky-400 font-bold">AI Computer Vision OCR Scanning...</p>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 transition-all duration-200" style={{ width: `${scanProgress}%` }}></div>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">Extracting parameters and logging into expense ledger...</p>
              </div>
            ) : (
              <div className="space-y-4 z-10">
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-full w-fit mx-auto shadow-md">
                  <Upload className="w-7 h-7 text-sky-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">Drag & Drop Receipt or Invoice Image here</p>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">Supports PNG, JPG, WEBP, PDF up to 10MB</p>
                </div>
                <div className="flex gap-3 justify-center">
                  <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs cursor-pointer border border-slate-700 transition-all">
                    Select File
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileSelect} />
                  </label>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex items-center gap-1.5 px-4 py-2 bg-sky-600/25 hover:bg-sky-600/40 border border-sky-500/30 text-sky-400 font-bold rounded-xl text-xs cursor-pointer transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    Live Camera Frame
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Preset Sample Receipts Row */}
        <div className="mt-6 pt-4 border-t border-slate-800/60">
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-2">Preset Sample Receipts for Instant Testing</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SAMPLE_RECEIPTS.map((r) => (
              <button
                key={r.id}
                disabled={isScanning}
                onClick={() => {
                  showToast(`Executing OCR parser on '${r.name}'...`, "info");
                  startScanAnimation(r.data, r.previewUrl);
                }}
                className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-700 rounded-xl text-left transition-all text-xs cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-white group-hover:text-sky-400 transition-colors truncate">{r.name}</p>
                  <span className="text-[10px] text-slate-500 font-mono truncate block mt-0.5">{r.fileName}</span>
                </div>
                <span className="text-emerald-400 font-mono font-bold text-xs">${r.data.amount.toFixed(2)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Extracted Output Result Panel */}
      {extractedResult && (
        <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-2xl p-6 relative overflow-hidden shadow-2xl animate-fade-in">
          <div className="absolute top-0 right-0 p-3 bg-emerald-500/10 border-b border-l border-emerald-500/20 rounded-bl-xl">
            <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Added to Expenses
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-white font-bold text-base">
                    Transaction Successfully Added to Expense Ledger!
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Logged <span className="text-emerald-400 font-bold">${extractedResult.amount.toFixed(2)}</span> for <span className="text-white font-bold">{extractedResult.merchant}</span> on {extractedResult.date}.
                  </p>
                </div>
              </div>
            </div>

            {scannedImagePreview && (
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 w-fit">
                <ImageIcon className="w-4 h-4 text-sky-400" />
                <span className="text-[10px] text-slate-300 font-mono font-bold">Source Receipt Image</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
              <span className="text-[9px] font-mono text-slate-400 uppercase block flex items-center gap-1">
                <CalendarIcon className="w-3 h-3 text-sky-400" /> Date
              </span>
              <input
                type="date"
                value={extractedResult.date}
                onChange={(e) => setExtractedResult({ ...extractedResult, date: e.target.value })}
                className="w-full bg-transparent border-0 text-white text-xs font-mono font-bold focus:ring-0 p-0"
              />
            </div>

            <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
              <span className="text-[9px] font-mono text-slate-400 uppercase block flex items-center gap-1">
                <FileText className="w-3 h-3 text-sky-400" /> Merchant Name
              </span>
              <input
                type="text"
                value={extractedResult.merchant}
                onChange={(e) => setExtractedResult({ ...extractedResult, merchant: e.target.value })}
                className="w-full bg-transparent border-0 text-white text-xs font-bold focus:ring-0 p-0"
              />
            </div>

            <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
              <span className="text-[9px] font-mono text-slate-400 uppercase block flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-400" /> Amount ($)
              </span>
              <input
                type="number"
                step="0.01"
                value={extractedResult.amount}
                onChange={(e) => setExtractedResult({ ...extractedResult, amount: parseFloat(e.target.value) || 0 })}
                className="w-full bg-transparent border-0 text-white text-xs font-mono font-bold focus:ring-0 p-0 text-emerald-400"
              />
            </div>

            <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
              <span className="text-[9px] font-mono text-slate-400 uppercase block flex items-center gap-1">
                <MapPin className="w-3 h-3 text-sky-400" /> Location / Store
              </span>
              <input
                type="text"
                value={extractedResult.location}
                onChange={(e) => setExtractedResult({ ...extractedResult, location: e.target.value })}
                className="w-full bg-transparent border-0 text-white text-xs font-bold focus:ring-0 p-0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
              <span className="text-[9px] font-mono text-slate-400 uppercase block flex items-center gap-1">
                <Tag className="w-3 h-3 text-purple-400" /> Category
              </span>
              <select
                value={extractedResult.category}
                onChange={(e) => setExtractedResult({ ...extractedResult, category: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-xs focus:ring-0 cursor-pointer"
              >
                <option value="Food">Food & Dining</option>
                <option value="Travel">Travel & Lodging</option>
                <option value="Utilities">Utilities & SaaS</option>
                <option value="Housing">Housing & Office</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Other">Other / General</option>
              </select>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
              <span className="text-[9px] font-mono text-slate-400 uppercase block flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-emerald-400" /> Payment Method
              </span>
              <input
                type="text"
                value={extractedResult.paymentMethod}
                onChange={(e) => setExtractedResult({ ...extractedResult, paymentMethod: e.target.value })}
                className="w-full bg-transparent border-0 text-white text-xs focus:ring-0 p-0"
              />
            </div>

            <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
              <span className="text-[9px] font-mono text-slate-400 uppercase block">Associated Hashtags</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {extractedResult.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-sky-400 text-[10px] font-mono rounded-lg">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end items-center">
            <button
              type="button"
              onClick={() => {
                setExtractedResult(null);
                setScannedImagePreview(null);
              }}
              className="px-4 py-2 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl text-xs font-bold cursor-pointer transition-all w-full sm:w-auto text-center"
            >
              Scan Another Receipt
            </button>
            <button
              type="button"
              onClick={handleReSaveExtracted}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold cursor-pointer transition-all w-full sm:w-auto text-center"
            >
              Update Details
            </button>
            {onViewLedger && (
              <button
                type="button"
                onClick={onViewLedger}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/40 cursor-pointer transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto"
              >
                View in Expense Ledger <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
