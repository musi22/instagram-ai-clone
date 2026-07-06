"use client";

import React, { useState } from "react";
import { useApp } from "./AppContext";
import { X, Heart, MessageCircle, Bookmark, Send, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const PostDetailsModal: React.FC = () => {
  const { activePostDetail, setActivePostDetail, toggleLike, toggleSave, addComment, followingIds, toggleFollow } = useApp();
  const [commentText, setCommentText] = useState("");
  const [showAiDiag, setShowAiDiag] = useState(false);

  if (!activePostDetail) return null;

  const isFollowing = followingIds.includes(activePostDetail.user.id);
  const isSelf = activePostDetail.user.id === "alex_creative";

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(activePostDetail.id, commentText);
    setCommentText("");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        
        {/* Close Button */}
        <button 
          onClick={() => setActivePostDetail(null)}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-zinc-800 border border-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {/* Main Details Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-5xl bg-zinc-950 border border-zinc-800 text-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[650px]"
        >
          {/* Left panel: Post Image */}
          <div className="w-full md:w-3/5 bg-black flex items-center justify-center border-r border-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={activePostDetail.imageUrls[0]} 
              alt="Post visual"
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {/* Right panel: Details & Comments */}
          <div className="w-full md:w-2/5 flex flex-col justify-between bg-zinc-950 h-full">
            
            {/* Top row: Profile & Follow */}
            <div className="p-4 border-b border-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={activePostDetail.user.avatarUrl} 
                  alt={activePostDetail.user.username}
                  className="w-8 h-8 rounded-full border border-zinc-800 object-cover"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold hover:underline cursor-pointer">{activePostDetail.user.username}</span>
                  <span className="text-[10px] text-zinc-450">{activePostDetail.user.fullName}</span>
                </div>
              </div>

              {!isSelf && (
                <button 
                  onClick={() => toggleFollow(activePostDetail.user.id)}
                  className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-all ${
                    isFollowing 
                      ? "border-zinc-800 bg-zinc-900 text-zinc-350 hover:bg-zinc-850 hover:text-white" 
                      : "border-purple-600 bg-purple-600/10 text-purple-400 hover:bg-purple-600 hover:text-white"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>

            {/* Middle panel: Comments & Caption (Switchable to AI Diagnostics) */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
              
              {/* Tabs header */}
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-450">
                  {showAiDiag ? "AI Diagnostics Analysis" : "Comments Feed"}
                </h4>
                <button
                  onClick={() => setShowAiDiag(prev => !prev)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border transition-all ${
                    showAiDiag 
                      ? "border-purple-500 bg-purple-950/20 text-purple-400 font-bold" 
                      : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Sparkles size={12} />
                  <span>{showAiDiag ? "Close AI View" : "AI Insights"}</span>
                </button>
              </div>

              {showAiDiag ? (
                /* AI Diagnostic View */
                <div className="flex-1 flex flex-col gap-4 text-sm text-zinc-300 pr-1 py-1">
                  
                  {/* Persona aesthetic */}
                  <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-lg">
                    <span className="block text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">Author Persona</span>
                    <p className="font-semibold text-zinc-150">{activePostDetail.user.computedPersona || "Creative Artist"}</p>
                    <span className="text-[10px] text-zinc-450">Analyzed aesthetic alignment score based on posting history</span>
                  </div>

                  {/* Semantic Tags */}
                  <div>
                    <span className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider mb-1.5">Simulated AI Classification Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {activePostDetail.aiTags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-xs rounded-md text-zinc-350">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Content moderation check */}
                  <div className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider mb-0.5">Automated Content Safety</span>
                      <p className="text-xs text-zinc-200">
                        Category: <span className="font-bold text-green-400">{activePostDetail.aiModeration.category}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-green-500/10 text-green-400 border border-green-800/40 text-[10px] font-bold px-2 py-1 rounded-full">
                      <CheckCircle2 size={10} />
                      Passed
                    </div>
                  </div>

                  {/* Feed ranking score details */}
                  <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider">Feed Relevance Score</span>
                      <span className="text-xs bg-purple-500/10 text-purple-400 font-bold px-2 py-0.5 rounded-full">
                        {activePostDetail.aiScore}%
                      </span>
                    </div>
                    <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${activePostDetail.aiScore}%` }} />
                    </div>
                    <span className="text-[10px] text-zinc-450 block mt-2">
                      Weighted by: Follow status (+20%), Tag matching (+30%), Freshness (+15%)
                    </span>
                  </div>

                </div>
              ) : (
                /* Standard Comments List */
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  
                  {/* Original Caption */}
                  <div className="flex gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={activePostDetail.user.avatarUrl} 
                      alt="" 
                      className="w-7 h-7 rounded-full object-cover shrink-0" 
                    />
                    <div className="text-xs text-zinc-300">
                      <span className="font-bold hover:underline cursor-pointer mr-1.5">{activePostDetail.user.username}</span>
                      <span>{activePostDetail.caption}</span>
                      <div className="text-[10px] text-zinc-550 mt-1">{activePostDetail.timestamp}</div>
                    </div>
                  </div>

                  {/* Comment list items */}
                  {activePostDetail.comments.length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-zinc-550 text-xs">
                      No comments yet. Start the conversation!
                    </div>
                  ) : (
                    activePostDetail.comments.map(c => (
                      <div key={c.id} className="flex gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={c.userAvatar} 
                          alt="" 
                          className="w-7 h-7 rounded-full object-cover shrink-0" 
                        />
                        <div className="text-xs text-zinc-300">
                          <span className="font-bold hover:underline cursor-pointer mr-1.5">{c.username}</span>
                          <span>{c.content}</span>
                          <div className="text-[10px] text-zinc-550 mt-1">{c.timestamp}</div>
                        </div>
                      </div>
                    ))
                  )}

                </div>
              )}

            </div>

            {/* Bottom panel: Action buttons & Add comment */}
            <div className="p-4 border-t border-zinc-900 bg-zinc-950">
              
              {/* Interaction row */}
              <div className="flex items-center justify-between mb-3 text-zinc-300">
                <div className="flex gap-4">
                  <button 
                    onClick={() => toggleLike(activePostDetail.id)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <Heart size={20} fill={activePostDetail.isLiked ? "red" : "none"} className={activePostDetail.isLiked ? "text-red-500" : ""} />
                  </button>
                  <button className="hover:text-zinc-400 transition-colors">
                    <MessageCircle size={20} />
                  </button>
                </div>
                <button 
                  onClick={() => toggleSave(activePostDetail.id)}
                  className="hover:text-zinc-400 transition-colors"
                >
                  <Bookmark size={20} fill={activePostDetail.isSaved ? "white" : "none"} className={activePostDetail.isSaved ? "text-white" : ""} />
                </button>
              </div>

              {/* Likes counter */}
              <div className="text-xs font-semibold text-zinc-200 mb-4">
                {activePostDetail.likesCount.toLocaleString()} likes
              </div>

              {/* Add Comment Input form */}
              <form onSubmit={handlePostComment} className="flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-700 placeholder-zinc-550 transition-colors"
                />
                <button 
                  type="submit"
                  disabled={!commentText.trim()}
                  className="p-1.5 bg-white disabled:bg-zinc-900 text-black disabled:text-zinc-650 rounded-lg transition-all"
                >
                  <Send size={12} />
                </button>
              </form>

            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
