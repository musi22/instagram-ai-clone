"use client";

import React, { useState } from "react";
import { useApp } from "./AppContext";
import { X, Sparkles, CheckCircle, BarChart2, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  simulateGenerateHashtags, 
  simulateGenerateCaptions, 
  simulateContentModeration 
} from "../app/mockDb";

export const CreatePostModal: React.FC = () => {
  const { isCreateOpen, setCreateOpen, createPost } = useApp();
  
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [imageDesc, setImageDesc] = useState("");
  
  // AI States
  const [isAiRunning, setIsAiRunning] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    tags: string[];
    captions: string[];
    moderation: { flag: boolean; toxicityScore: number; category: string };
    engagementScore: number;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<"caption" | "tags" | "moderation" | "score">("caption");

  const sampleImages = [
    { name: "Cyberpunk Street", url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&h=800&fit=crop", desc: "cyberpunk city street at night under purple neon lights" },
    { name: "Alpine Forest Lake", url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=800&fit=crop", desc: "mountain lake reflected under orange golden hour sunset sky" },
    { name: "Decadent Sushi", url: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=800&fit=crop", desc: "wooden tray of fresh tuna and salmon sushi rolls" }
  ];

  const handleSelectPreset = (url: string, desc: string) => {
    setImageUrl(url);
    setImageDesc(desc);
  };

  const runAiAnalysis = () => {
    if (!imageUrl) return;
    setIsAiRunning(true);
    
    setTimeout(() => {
      const tags = simulateGenerateHashtags(caption, imageDesc);
      const captions = simulateGenerateCaptions(imageDesc);
      const moderation = simulateContentModeration(caption, imageDesc);
      const engagementScore = Math.floor(Math.random() * 25) + 72; // Predicts high score 72-97%

      setAiSuggestions({
        tags,
        captions,
        moderation,
        engagementScore
      });
      setIsAiRunning(false);
    }, 1200);
  };

  const handlePublish = () => {
    if (!imageUrl) return;
    
    // Fallback tag set
    const finalTags = aiSuggestions ? aiSuggestions.tags : ["instaclaude", "aiart"];
    createPost(imageUrl, caption, finalTags, imageDesc);
    
    // Reset state
    setImageUrl("");
    setCaption("");
    setImageDesc("");
    setAiSuggestions(null);
    setCreateOpen(false);
  };

  if (!isCreateOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 text-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[600px]"
        >
          {/* Close button */}
          <button 
            onClick={() => setCreateOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-zinc-800 border border-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          {/* Left: Image Upload/Preview Panel */}
          <div className="w-full md:w-1/2 bg-zinc-900 border-r border-zinc-850 flex flex-col justify-between p-6">
            <h3 className="text-lg font-semibold text-zinc-150 mb-2">Upload Visual Asset</h3>
            
            {imageUrl ? (
              <div className="relative flex-1 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={imageUrl} 
                  alt="Post preview" 
                  className="max-h-full max-w-full object-contain"
                />
                <button 
                  onClick={() => setImageUrl("")}
                  className="absolute bottom-4 right-4 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs font-semibold rounded-lg shadow-lg transition-colors"
                >
                  Change Image
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 rounded-xl bg-zinc-950 p-6 text-center">
                <BarChart2 className="w-12 h-12 text-zinc-650 mb-4 animate-pulse" />
                <p className="text-sm font-medium text-zinc-300 mb-1">Select simulated high-res preset:</p>
                <div className="flex flex-col gap-2 mt-3 w-full max-w-xs">
                  {sampleImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectPreset(img.url, img.desc)}
                      className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium rounded-lg text-left truncate transition-colors text-zinc-350 hover:text-white"
                    >
                      {img.name}
                    </button>
                  ))}
                </div>
                <div className="my-4 text-zinc-550 text-xs">or paste image URL below</div>
                <input 
                  type="text" 
                  placeholder="https://example.com/photo.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full max-w-xs px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none focus:border-purple-600 transition-colors"
                />
              </div>
            )}

            <div className="mt-4">
              <label className="block text-xs font-medium text-zinc-450 mb-1">Image Subject Description (for AI suggestions)</label>
              <input 
                type="text"
                placeholder="E.g., mountain lake sunrise, neon rainy streets, sushi"
                value={imageDesc}
                onChange={(e) => setImageDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none focus:border-zinc-700 transition-colors"
              />
            </div>
          </div>

          {/* Right: Post Details & AI Suite Panel */}
          <div className="w-full md:w-1/2 flex flex-col justify-between bg-zinc-950 p-6 overflow-y-auto">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs bg-purple-500/10 text-purple-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">AI Studio</span>
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Compose & Analyze</h2>
              </div>

              <div className="mb-4">
                <textarea 
                  placeholder="Write a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-3 text-sm text-zinc-200 focus:outline-none focus:border-purple-600 resize-none transition-colors"
                />
              </div>

              {/* Run AI Analysis trigger */}
              <button
                disabled={!imageUrl || isAiRunning}
                onClick={runAiAnalysis}
                className="w-full py-2.5 mb-6 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-zinc-900 disabled:to-zinc-900 disabled:text-zinc-650 disabled:border disabled:border-zinc-850 text-white font-semibold text-sm rounded-xl transition-all shadow-lg hover:shadow-purple-500/10"
              >
                {isAiRunning ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Meta AI is analyzing post...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Run AI Copilot Insights</span>
                  </>
                )}
              </button>

              {/* AI Suggestions Results Dashboard */}
              {aiSuggestions && (
                <div className="border border-zinc-850 rounded-xl bg-zinc-900/50 overflow-hidden">
                  <div className="flex border-b border-zinc-850 bg-zinc-900 text-xs text-zinc-400 font-medium">
                    <button 
                      onClick={() => setActiveTab("caption")}
                      className={`flex-1 py-2 text-center transition-colors ${activeTab === "caption" ? "text-purple-400 border-b border-purple-500 bg-zinc-950/40" : "hover:text-zinc-200"}`}
                    >
                      Captions
                    </button>
                    <button 
                      onClick={() => setActiveTab("tags")}
                      className={`flex-1 py-2 text-center transition-colors ${activeTab === "tags" ? "text-purple-400 border-b border-purple-500 bg-zinc-950/40" : "hover:text-zinc-200"}`}
                    >
                      Hashtags
                    </button>
                    <button 
                      onClick={() => setActiveTab("moderation")}
                      className={`flex-1 py-2 text-center transition-colors ${activeTab === "moderation" ? "text-purple-400 border-b border-purple-500 bg-zinc-950/40" : "hover:text-zinc-200"}`}
                    >
                      Safety Scan
                    </button>
                    <button 
                      onClick={() => setActiveTab("score")}
                      className={`flex-1 py-2 text-center transition-colors ${activeTab === "score" ? "text-purple-400 border-b border-purple-500 bg-zinc-950/40" : "hover:text-zinc-200"}`}
                    >
                      Feed Score
                    </button>
                  </div>

                  <div className="p-4 text-sm text-zinc-300 min-h-[120px] max-h-[180px] overflow-y-auto">
                    {activeTab === "caption" && (
                      <div className="flex flex-col gap-2">
                        {aiSuggestions.captions.map((cap, i) => (
                          <div 
                            key={i} 
                            onClick={() => setCaption(cap)}
                            className="p-2 bg-zinc-950/50 hover:bg-zinc-850/80 border border-zinc-850 rounded-lg cursor-pointer text-xs transition-colors flex items-center justify-between text-zinc-350 hover:text-white"
                          >
                            <span>&ldquo;{cap}&rdquo;</span>
                            <span className="text-[10px] text-purple-400 shrink-0 font-bold ml-2">Apply</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === "tags" && (
                      <div>
                        <p className="text-xs text-zinc-400 mb-2 font-medium">Click tags to append to caption:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {aiSuggestions.tags.map((tag, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                if (!caption.includes(`#${tag}`)) {
                                  setCaption(prev => prev + ` #${tag}`);
                                }
                              }}
                              className="px-2.5 py-1 bg-zinc-950 hover:bg-purple-950/20 border border-zinc-850 hover:border-purple-850 rounded-full text-xs text-zinc-350 hover:text-purple-400 transition-colors"
                            >
                              #{tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "moderation" && (
                      <div className="flex flex-col items-center justify-center py-2 text-center">
                        {aiSuggestions.moderation.flag ? (
                          <>
                            <ShieldAlert className="w-10 h-10 text-red-500 mb-2" />
                            <p className="text-xs font-bold text-red-400">Content Flagged for Admin Review</p>
                            <p className="text-[10px] text-zinc-450 mt-1">
                              Flag category: <span className="text-red-400 font-bold">{aiSuggestions.moderation.category}</span> (Score: {aiSuggestions.moderation.toxicityScore}%)
                            </p>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-10 h-10 text-green-500 mb-2" />
                            <p className="text-xs font-bold text-green-400">Content Moderation: Clean</p>
                            <p className="text-[10px] text-zinc-450 mt-1">
                              Safe for distribution. Safety score: {100 - aiSuggestions.moderation.toxicityScore}% (Spam/NSFW: Checked)
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    {activeTab === "score" && (
                      <div className="flex flex-col items-center justify-center py-2 text-center">
                        <div className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                          {aiSuggestions.engagementScore}%
                        </div>
                        <p className="text-xs font-bold text-zinc-200 mt-1">Predicted Feed Rank Score</p>
                        <p className="text-[10px] text-zinc-450 max-w-[280px] mt-1.5 leading-relaxed">
                          Your visual content & hashtags align with 85% of your active follower interests. Safe for organic reach.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-zinc-850 pt-4 flex gap-3 mt-6">
              <button 
                onClick={() => setCreateOpen(false)}
                className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800 text-sm font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handlePublish}
                disabled={!imageUrl || (aiSuggestions?.moderation.flag ?? false)}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-900 disabled:text-zinc-650 disabled:border disabled:border-zinc-850 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg hover:shadow-purple-500/10"
              >
                Publish Post
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
