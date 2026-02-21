import { useState, useRef } from "react";
import {
  UploadCloud,
  FileImage,
  X,
  Loader2,
  Utensils,
  Zap,
  Flame,
  Droplet,
} from "lucide-react";
import "./index.css";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setResult(null);
      setError(null);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      // In production, configure proxy or use absolute URL
      const response = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          "Failed to analyze image. Make sure the backend limit is not exceeded and the API key is valid.",
        );
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-10 mt-8">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl shadow-lg mb-4 text-white animate-float">
          <Utensils size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 tracking-tight mb-2">
          NutriLens
        </h1>
        <p className="text-lg text-slate-600 max-w-xl mx-auto">
          Snap a photo of your food and let AI reveal its nutritional secrets
          instantly.
        </p>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Upload Section */}
        <div className="glass-panel p-8 w-full transition-all duration-300 hover:shadow-2xl">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
            <UploadCloud className="mr-2 text-indigo-500" />
            Upload Image
          </h2>

          <div
            className={`border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${preview ? "border-indigo-300 bg-indigo-50/50" : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"} cursor-pointer`}
            onClick={() => !preview && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />

            {preview ? (
              <div className="relative group">
                <img
                  src={preview}
                  alt="Food preview"
                  className="max-h-64 mx-auto rounded-lg shadow-md object-cover w-full"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="absolute top-2 right-2 bg-white/90 text-slate-700 p-1.5 rounded-full shadow-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="bg-indigo-100 text-indigo-500 p-4 rounded-full mb-4">
                  <FileImage size={40} />
                </div>
                <p className="text-slate-600 font-medium text-lg">
                  Click to browse or drag image here
                </p>
                <p className="text-slate-400 text-sm mt-2">
                  Supports JPG, PNG, WEBP (max 5MB)
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            className={`w-full mt-6 py-3.5 rounded-xl font-bold text-lg flex items-center justify-center transition-all duration-200 shadow-md
              ${
                !file || loading
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:shadow-lg hover:from-indigo-600 hover:to-blue-700 hover:-translate-y-0.5"
              }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={24} />
                Analyzing with Gemini AI...
              </>
            ) : (
              <>
                <Zap className="mr-2" size={24} />
                Analyze Nutrition
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="glass-panel p-8 w-full min-h-[400px] flex flex-col transition-all duration-300">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
            <Utensils className="mr-2 text-indigo-500" />
            Nutritional Facts
          </h2>

          {!result && !loading ? (
            <div className="flex-1 flex items-center justify-center flex-col text-slate-400">
              <div className="w-24 h-24 mb-4 rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
                <Utensils size={32} className="opacity-50" />
              </div>
              <p>Upload a food image to see the breakdown here.</p>
            </div>
          ) : loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-indigo-400">
              <Loader2 size={48} className="animate-spin mb-4" />
              <p className="animate-pulse font-medium">
                Extracting nutrients...
              </p>
            </div>
          ) : result ? (
            <div className="flex-1 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 font-bold mb-4">
                  Identified Food
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 mb-2 capitalize">
                  {result.foodName}
                </h3>
                <p className="text-slate-500 italic mb-8">
                  "{result.description}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 p-4 rounded-2xl flex items-center shadow-sm">
                  <div className="bg-orange-500/20 p-2 rounded-lg text-orange-600 mr-3">
                    <Flame size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">
                      Calories
                    </p>
                    <p className="text-2xl font-extrabold text-slate-800">
                      {result.calories}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-4 rounded-2xl flex items-center shadow-sm">
                  <div className="bg-blue-500/20 p-2 rounded-lg text-blue-600 mr-3">
                    <Droplet size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">
                      Proteins
                    </p>
                    <p className="text-2xl font-extrabold text-slate-800">
                      {result.proteins}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-4 rounded-2xl flex items-center shadow-sm">
                  <div className="bg-green-500/20 p-2 rounded-lg text-green-600 mr-3">
                    <Zap size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-green-600 font-bold uppercase tracking-wider">
                      Carbs
                    </p>
                    <p className="text-2xl font-extrabold text-slate-800">
                      {result.carbs}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 p-4 rounded-2xl flex items-center shadow-sm">
                  <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-600 mr-3">
                    <Droplet size={24} className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-yellow-600 font-bold uppercase tracking-wider">
                      Fats
                    </p>
                    <p className="text-2xl font-extrabold text-slate-800">
                      {result.fats}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default App;
