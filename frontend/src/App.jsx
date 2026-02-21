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
  AlertTriangle,
  RotateCcw,
  History,
  Info,
  CheckCircle2,
  Coffee,
  Sun,
  Moon,
  Apple,
  Activity,
  Dumbbell,
  Scale,
  ShieldPlus,
} from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import "./index.css";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [mealType, setMealType] = useState("Unspecified");
  const [dietGoal, setDietGoal] = useState("General Health");
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
    setMealType("Unspecified");
    setDietGoal("General Health");
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
    formData.append("mealType", mealType);
    formData.append("dietGoal", dietGoal);

    try {
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
      setScanHistory((prev) =>
        [
          {
            ...data,
            id: Date.now(),
            imagePreview: preview,
            mealContext: mealType,
            goalContext: dietGoal,
          },
          ...prev,
        ].slice(0, 10),
      ); // Keep last 10 scans for better daily tracking
    } catch (err) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate Daily Totals
  const todayCalories = scanHistory.reduce((acc, scan) => {
    const cal = parseInt(scan.calories) || 0;
    return acc + cal;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-500 rounded-2xl shadow-lg mb-4 text-white animate-float">
          <Utensils size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 tracking-tight mb-2">
          NutriLens
        </h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto">
          Snap a photo of your food and let AI reveal its nutritional secrets
          instantly.
        </p>
      </div>

      {/* Main Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8">
        {/* LEFT COLUMN: Upload & History */}
        <div className="space-y-8 w-full">
          {/* Upload Section */}
          <div className="glass-panel p-8 w-full transition-all duration-300 shadow-xl border border-white">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <UploadCloud className="mr-2 text-emerald-500" />
              Upload Image
            </h2>

            <div
              className={`border-3 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${
                preview
                  ? "border-emerald-300 bg-emerald-50/50"
                  : "border-slate-300 hover:border-emerald-400 hover:bg-slate-50"
              } cursor-pointer`}
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
                    className="max-h-56 mx-auto rounded-lg shadow-md object-cover w-full"
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
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="bg-emerald-100 text-emerald-500 p-4 rounded-full mb-4">
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

            {/* Context Selection Grids */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                  1. When are you eating this?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setMealType("Breakfast")}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-all ${
                      mealType === "Breakfast"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-500 hover:border-emerald-300 hover:bg-slate-50"
                    }`}
                  >
                    <Coffee size={18} className="mb-1" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Breakfast
                    </span>
                  </button>
                  <button
                    onClick={() => setMealType("Lunch")}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-all ${
                      mealType === "Lunch"
                        ? "border-amber-500 bg-amber-50 text-amber-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-500 hover:border-amber-300 hover:bg-slate-50"
                    }`}
                  >
                    <Sun size={18} className="mb-1" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Lunch
                    </span>
                  </button>
                  <button
                    onClick={() => setMealType("Dinner")}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-all ${
                      mealType === "Dinner"
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:bg-slate-50"
                    }`}
                  >
                    <Moon size={18} className="mb-1" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Dinner
                    </span>
                  </button>
                  <button
                    onClick={() => setMealType("Snack")}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-all ${
                      mealType === "Snack"
                        ? "border-rose-500 bg-rose-50 text-rose-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-500 hover:border-rose-300 hover:bg-slate-50"
                    }`}
                  >
                    <Apple size={18} className="mb-1" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Snack
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 mt-4">
                  2. What is your primary diet goal?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setDietGoal("Weight Loss")}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-all ${
                      dietGoal === "Weight Loss"
                        ? "border-teal-500 bg-teal-50 text-teal-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-500 hover:border-teal-300 hover:bg-slate-50"
                    }`}
                  >
                    <Scale size={18} className="mb-1" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-center leading-tight">
                      Weight
                      <br />
                      Loss
                    </span>
                  </button>
                  <button
                    onClick={() => setDietGoal("Muscle Gain")}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-all ${
                      dietGoal === "Muscle Gain"
                        ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-500 hover:border-orange-300 hover:bg-slate-50"
                    }`}
                  >
                    <Dumbbell size={18} className="mb-1" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-center leading-tight">
                      Muscle
                      <br />
                      Gain
                    </span>
                  </button>
                  <button
                    onClick={() => setDietGoal("Keto / Low Carb")}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-all ${
                      dietGoal === "Keto / Low Carb"
                        ? "border-purple-500 bg-purple-50 text-purple-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-500 hover:border-purple-300 hover:bg-slate-50"
                    }`}
                  >
                    <Activity size={18} className="mb-1" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-center leading-tight">
                      Keto
                      <br />
                      Low Carb
                    </span>
                  </button>
                  <button
                    onClick={() => setDietGoal("General Health")}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-all ${
                      dietGoal === "General Health"
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:bg-slate-50"
                    }`}
                  >
                    <ShieldPlus size={18} className="mb-1" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-center leading-tight">
                      General
                      <br />
                      Health
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAnalyze}
                disabled={!file || loading}
                className={`flex-1 py-3.5 rounded-xl font-bold text-lg flex items-center justify-center transition-all duration-200 shadow-md ${
                  !file || loading
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-emerald-500 text-white hover:shadow-lg hover:bg-emerald-600 hover:-translate-y-0.5"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={24} />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2" size={24} />
                    Analyze Nutrition
                  </>
                )}
              </button>

              {result && (
                <button
                  onClick={handleClear}
                  className="px-5 py-3.5 rounded-xl font-bold text-lg flex items-center justify-center transition-all duration-200 bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                  title="Scan Another Item"
                >
                  <RotateCcw size={24} />
                </button>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start">
                <AlertTriangle className="mr-2 flex-shrink-0" size={18} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* History Section with Daily Tracker */}
          {scanHistory.length > 0 && (
            <div className="glass-panel p-6 w-full shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center">
                  <History className="mr-2 text-indigo-500" size={20} />
                  My Food Log
                </h3>
                <div className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center shadow-inner">
                  <Flame className="text-orange-500 mr-2" size={16} />
                  <span className="text-sm font-bold text-slate-700">
                    Daily Total:{" "}
                    <span className="text-orange-600 font-extrabold text-base">
                      {todayCalories}
                    </span>{" "}
                    kcal
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {scanHistory.map((scan) => (
                  <div
                    key={scan.id}
                    className="flex items-center p-3 bg-white/50 rounded-lg border border-slate-100 shadow-sm cursor-pointer hover:bg-white transition"
                    onClick={() => {
                      setResult(scan);
                      setPreview(scan.imagePreview);
                      setMealType(scan.mealContext || "Unspecified");
                      if (scan.goalContext) setDietGoal(scan.goalContext);
                      setFile(new File([], "history_image.jpg")); // mock file so it doesn't break logic
                    }}
                  >
                    <img
                      src={scan.imagePreview}
                      alt={scan.foodName}
                      className="w-12 h-12 rounded-md object-cover border border-slate-200 mr-4 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate">
                        {scan.foodName}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        <span className="font-bold text-orange-500">
                          {scan.calories}
                        </span>{" "}
                        • {scan.proteins}
                      </p>
                    </div>
                    {scan.mealContext && scan.mealContext !== "Unspecified" && (
                      <div className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider ml-2 shrink-0">
                        {scan.mealContext}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Results & Guidelines */}
        <div className="space-y-8 w-full">
          {/* Results Section */}
          <div className="glass-panel p-8 w-full min-h-[480px] flex flex-col transition-all duration-300 shadow-xl border border-white">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <Utensils className="mr-2 text-indigo-500" />
              Nutritional Facts
            </h2>

            {!result && !loading ? (
              <div className="flex-1 flex items-center justify-center flex-col text-slate-400">
                <div className="w-24 h-24 mb-4 rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
                  <Utensils size={32} className="opacity-40" />
                </div>
                <p>Upload a food image to see the breakdown here.</p>
              </div>
            ) : loading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-emerald-400">
                <Loader2 size={48} className="animate-spin mb-4" />
                <p className="animate-pulse font-medium">
                  Extracting nutrients...
                </p>
              </div>
            ) : result ? (
              <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Warnings Section */}
                {result.warnings && result.warnings.length > 0 && (
                  <div className="mb-6 bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl shadow-sm">
                    <div className="flex items-center text-rose-700 font-bold mb-2">
                      <AlertTriangle size={18} className="mr-2" />
                      Dietary Warnings
                      {mealType !== "Unspecified" && (
                        <span className="ml-2 text-rose-500 text-[10px] bg-rose-200/50 px-2 py-0.5 rounded uppercase tracking-wider">
                          For {mealType} / {dietGoal}
                        </span>
                      )}
                    </div>
                    <ul className="list-disc pl-5 text-sm text-rose-600 space-y-1">
                      {result.warnings.map((warning, idx) => (
                        <li key={idx}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mb-6">
                  <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                    Identified Food
                  </div>
                  <h3 className="text-3xl font-extrabold text-slate-900 mb-2 capitalize leading-tight">
                    {result.foodName}
                  </h3>
                  <p className="text-slate-500 italic">
                    "{result.description}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-auto">
                  <div className="bg-white border text-center p-5 rounded-2xl shadow-sm">
                    <div className="inline-flex bg-orange-100 p-2 rounded-lg text-orange-500 mb-2">
                      <Flame size={24} />
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Calories
                    </p>
                    <p
                      className="text-2xl font-extrabold text-slate-800"
                      title={result.calories}
                    >
                      {parseInt(result.calories) || result.calories}
                    </p>
                  </div>

                  <div className="bg-white border text-center p-5 rounded-2xl shadow-sm">
                    <div className="inline-flex bg-blue-100 p-2 rounded-lg text-blue-500 mb-2">
                      <Droplet size={24} />
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Proteins
                    </p>
                    <p
                      className="text-2xl font-extrabold text-slate-800"
                      title={result.proteins}
                    >
                      {parseInt(result.proteins) || result.proteins}g
                    </p>
                  </div>

                  <div className="bg-white border text-center p-5 rounded-2xl shadow-sm">
                    <div className="inline-flex bg-green-100 p-2 rounded-lg text-green-500 mb-2">
                      <Zap size={24} />
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Carbs
                    </p>
                    <p
                      className="text-2xl font-extrabold text-slate-800"
                      title={result.carbs}
                    >
                      {parseInt(result.carbs) || result.carbs}g
                    </p>
                  </div>

                  <div className="bg-white border text-center p-5 rounded-2xl shadow-sm">
                    <div className="inline-flex bg-yellow-100 p-2 rounded-lg text-yellow-500 mb-2">
                      <Droplet size={24} className="text-yellow-500" />
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Fats
                    </p>
                    <p
                      className="text-2xl font-extrabold text-slate-800"
                      title={result.fats}
                    >
                      {parseInt(result.fats) || result.fats}g
                    </p>
                  </div>
                </div>

                {/* Macro Pie Chart */}
                <div className="mt-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm h-[300px]">
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">
                    Macro Split
                  </h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Proteins",
                            value: parseInt(result.proteins) || 0,
                            color: "#3b82f6",
                          }, // blue-500
                          {
                            name: "Carbs",
                            value: parseInt(result.carbs) || 0,
                            color: "#22c55e",
                          }, // green-500
                          {
                            name: "Fats",
                            value: parseInt(result.fats) || 0,
                            color: "#eab308",
                          }, // yellow-500
                        ]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={5}
                      >
                        {[
                          { name: "Proteins", color: "#3b82f6" },
                          { name: "Carbs", color: "#22c55e" },
                          { name: "Fats", color: "#eab308" },
                        ].map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            strokeWidth={0}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value, name) => [`${value}g`, name]}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow:
                            "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Alternatives Section */}
                {result.healthierAlternatives &&
                  result.healthierAlternatives.length > 0 && (
                    <div className="mt-6 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm">
                      <div className="flex items-center text-emerald-700 font-bold mb-3">
                        <ShieldPlus
                          size={20}
                          className="mr-2 text-emerald-500"
                        />
                        Alternative Ideas for {dietGoal}
                      </div>
                      <ul className="space-y-2.5">
                        {result.healthierAlternatives.map((alt, idx) => (
                          <li
                            key={idx}
                            className="flex items-start text-sm text-emerald-800 leading-snug"
                          >
                            <CheckCircle2
                              size={16}
                              className="mr-2.5 mt-0.5 text-emerald-500 shrink-0"
                            />
                            <span>{alt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            ) : null}
          </div>

          {/* Dietary Guidelines Section */}
          <div className="glass-panel p-8 w-full shadow-lg">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <Info className="mr-2 text-blue-500" />
              Standard Dietary Guidelines
            </h2>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 border-b pb-2">
                  Healthy Meal Targets
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                    <span className="block font-bold text-slate-800 mb-1">
                      Breakfast
                    </span>
                    <span className="text-slate-500 text-xs">
                      300-400 kcal
                      <br />
                      15g+ Protein
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                    <span className="block font-bold text-slate-800 mb-1">
                      Lunch
                    </span>
                    <span className="text-slate-500 text-xs">
                      500-700 kcal
                      <br />
                      25g+ Protein
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                    <span className="block font-bold text-slate-800 mb-1">
                      Dinner
                    </span>
                    <span className="text-slate-500 text-xs">
                      500-700 kcal
                      <br />
                      Lower carbs
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 border-b pb-2">
                  Examples of Healthy Foods
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm p-2 hover:bg-white/50 rounded-md transition border border-transparent hover:border-slate-200">
                    <div className="flex items-center">
                      <CheckCircle2
                        size={16}
                        className="text-emerald-500 mr-2"
                      />{" "}
                      <span className="font-bold text-slate-700">
                        Avocado (1 whole)
                      </span>
                    </div>
                    <div className="text-slate-500 text-right text-xs">
                      240 kcal • 2g Protein
                      <br />
                      22g Fats (Healthy)
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm p-2 hover:bg-white/50 rounded-md transition border border-transparent hover:border-slate-200">
                    <div className="flex items-center">
                      <CheckCircle2
                        size={16}
                        className="text-emerald-500 mr-2"
                      />{" "}
                      <span className="font-bold text-slate-700">
                        Grilled Chicken (100g)
                      </span>
                    </div>
                    <div className="text-slate-500 text-right text-xs">
                      165 kcal • 31g Protein
                      <br />
                      0g Carbs
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm p-2 hover:bg-white/50 rounded-md transition border border-transparent hover:border-slate-200">
                    <div className="flex items-center">
                      <CheckCircle2
                        size={16}
                        className="text-emerald-500 mr-2"
                      />{" "}
                      <span className="font-bold text-slate-700">
                        Oatmeal (1 cup cooked)
                      </span>
                    </div>
                    <div className="text-slate-500 text-right text-xs">
                      158 kcal • 6g Protein
                      <br />
                      27g Carbs (Complex)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
