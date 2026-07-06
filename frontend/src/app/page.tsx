"use client";

import React, { useState } from "react";
import { useApp } from "../components/AppContext";
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Send, 
  Sparkles, 
  UserPlus, 
  MoreHorizontal,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { User, Post, mockUsers } from "./mockDb";

export default function HomeFeedPage() {
  const { 
    posts, 
    stories, 
    toggleLike, 
    toggleSave, 
    addComment, 
    toggleFollow, 
    followingIds,
    setActiveStoryUser,
    setActivePostDetail
  } = useApp();

  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [expandedAiDrawers, setExpandedAiDrawers] = useState<{ [postId: string]: boolean }>({});

  const handleCommentChange = (postId: string, val: string) => {
    setCommentInputs(prev => ({ ...prev, [postId]: val }));
  };

  const handleCommentSubmit = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;
    addComment(postId, text);
    setCommentInputs(prev => ({ ...prev, [postId]: "" }));
  };

  const toggleAiDrawer = (postId: string) => {
    setExpandedAiDrawers(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleStoryClick = (user: User) => {
    setActiveStoryUser(user);
  };

  const handlePostImageClick = (post: Post) => {
    setActivePostDetail(post);
  };

  // Find users for suggestions panel (users we are not following)
  const suggestions = mockUsers.filter(u => u.id !== "ai_agent" && !followingIds.includes(u.id));

  return (
    <div className="flex gap-8 p-4 md:p-8 max-w-5xl mx-auto">
      {/* LEFT COLUMN: Stories & Posts */}
      <div className="flex-1 max-w-xl mx-auto md:mx-0">
        
        {/* 1. Stories Tray */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 mb-6 overflow-x-auto flex gap-4 scrollbar-hide">
          {/* Active user's own add story node */}
          <div className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" 
                alt="My story" 
                className="w-14 h-14 rounded-full object-cover p-0.5 border border-zinc-800"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-purple-600 border-2 border-zinc-950 rounded-full flex items-center justify-center font-bold text-xs text-white">
                +
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 font-medium">Your Story</span>
          </div>

          {/* Seed stories list */}
          {stories.map(story => {
            const hasViewed = story.isViewed;
            return (
              <div 
                key={story.id} 
                onClick={() => handleStoryClick(story.user)}
                className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group"
              >
                <div className={`p-0.5 rounded-full ${
                  hasViewed 
                    ? "bg-zinc-800" 
                    : "bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 animate-gradient-xy"
                }`}>
                  <div className="p-0.5 bg-black rounded-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={story.user.avatarUrl} 
                      alt={story.user.username} 
                      className="w-13 h-13 rounded-full object-cover"
                    />
                  </div>
                </div>
                <span className="text-[10px] text-zinc-400 group-hover:text-white transition-colors truncate max-w-[64px]">
                  {story.user.username}
                </span>
              </div>
            );
          })}
        </div>

        {/* 2. Posts List */}
        <div className="space-y-6">
          {posts.map(post => {
            const isLiked = post.isLiked;
            const isSaved = post.isSaved;
            const isDrawerOpen = expandedAiDrawers[post.id] || false;
            
            return (
              <article key={post.id} className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-md">
                {/* Header row */}
                <div className="p-4 flex items-center justify-between border-b border-zinc-900/50">
                  <div className="flex items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={post.user.avatarUrl} 
                      alt={post.user.username}
                      className="w-8 h-8 rounded-full border border-zinc-800 object-cover" 
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-200 hover:underline cursor-pointer">{post.user.username}</span>
                      <span className="text-[9px] text-zinc-550">{post.timestamp}</span>
                    </div>
                  </div>
                  <button className="text-zinc-500 hover:text-white transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                </div>

                {/* Main post image */}
                <div 
                  onClick={() => handlePostImageClick(post)}
                  className="aspect-square bg-black flex items-center justify-center cursor-pointer overflow-hidden border-b border-zinc-900/30"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={post.imageUrls[0]} 
                    alt="Post media" 
                    className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-500"
                  />
                </div>

                {/* Interaction buttons */}
                <div className="p-4 pb-2 flex items-center justify-between">
                  <div className="flex gap-4 text-zinc-300">
                    <button 
                      onClick={() => toggleLike(post.id)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <Heart size={20} fill={isLiked ? "red" : "none"} className={isLiked ? "text-red-500" : ""} />
                    </button>
                    <button 
                      onClick={() => handlePostImageClick(post)}
                      className="hover:text-zinc-400 transition-colors"
                    >
                      <MessageCircle size={20} />
                    </button>
                  </div>

                  <button 
                    onClick={() => toggleSave(post.id)}
                    className="hover:text-zinc-400 transition-colors"
                  >
                    <Bookmark size={20} fill={isSaved ? "white" : "none"} className={isSaved ? "text-white" : ""} />
                  </button>
                </div>

                {/* Likes tally */}
                <div className="px-4 text-xs font-bold text-zinc-250 mb-1">
                  {post.likesCount.toLocaleString()} likes
                </div>

                {/* Caption & Comments summary */}
                <div className="px-4 text-xs leading-relaxed mb-3">
                  <span className="font-bold hover:underline cursor-pointer mr-1.5">{post.user.username}</span>
                  <span className="text-zinc-300">{post.caption}</span>
                  
                  {post.comments.length > 0 && (
                    <div 
                      onClick={() => handlePostImageClick(post)}
                      className="text-zinc-550 text-[10px] mt-2 cursor-pointer hover:text-zinc-400 transition-colors"
                    >
                      View all {post.comments.length} comments
                    </div>
                  )}
                </div>

                {/* 3. Collapsible AI Dashboard */}
                <div className="border-t border-zinc-900 bg-zinc-950/60 overflow-hidden">
                  <button 
                    onClick={() => toggleAiDrawer(post.id)}
                    className="w-full px-4 py-2 text-[10px] font-bold text-purple-400 flex items-center justify-between hover:bg-zinc-900/40 transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      <Sparkles size={10} />
                      <span>AI INSIGHTS & RANKING ({post.aiScore}% RELEVANCE)</span>
                    </span>
                    {isDrawerOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                  </button>

                  {isDrawerOpen && (
                    <div className="px-4 pb-4 pt-1 space-y-3 border-t border-zinc-900/30 text-xs">
                      {/* Grid summary */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-450">
                        <div className="bg-zinc-900/60 p-2 border border-zinc-900 rounded-lg">
                          <span className="block text-[8px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">Automated Safety</span>
                          <span className="font-semibold text-green-400">PASSED ({post.aiModeration.category})</span>
                        </div>
                        <div className="bg-zinc-900/60 p-2 border border-zinc-900 rounded-lg">
                          <span className="block text-[8px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">Toxicity Score</span>
                          <span className="font-semibold text-zinc-300">{post.aiModeration.toxicityScore}%</span>
                        </div>
                      </div>

                      {/* Hashtag suggestions list */}
                      <div>
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">AI Extracted Hashtags</span>
                        <div className="flex flex-wrap gap-1">
                          {post.aiTags.map((tag, idx) => (
                            <span key={idx} className="bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded-md text-[10px] text-zinc-350">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Caption suggestions display */}
                      {post.aiCaptionIdeas && post.aiCaptionIdeas.length > 0 && (
                        <div>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Alternative AI Drafts</span>
                          <div className="bg-zinc-900/40 p-2 border border-zinc-900 rounded-lg text-[10px] italic text-zinc-450 leading-normal">
                            &ldquo;{post.aiCaptionIdeas[0]}&rdquo;
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Comment quick form */}
                <form 
                  onSubmit={(e) => handleCommentSubmit(e, post.id)}
                  className="p-4 border-t border-zinc-900/80 flex gap-2 items-center"
                >
                  <input 
                    type="text" 
                    placeholder="Add a comment..."
                    value={commentInputs[post.id] || ""}
                    onChange={(e) => handleCommentChange(post.id, e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-850 text-xs px-3 py-1.5 rounded-lg text-white focus:outline-none focus:border-zinc-700 placeholder-zinc-550 transition-colors"
                  />
                  <button 
                    type="submit"
                    disabled={!(commentInputs[post.id] || "").trim()}
                    className="p-1.5 bg-white disabled:bg-zinc-900 text-black disabled:text-zinc-650 rounded-lg transition-all"
                  >
                    <Send size={10} />
                  </button>
                </form>

              </article>
            );
          })}
        </div>

      </div>

      {/* RIGHT COLUMN: User info, Suggestions, AI Rank Widget (Desktop only) */}
      <div className="hidden lg:block w-80 shrink-0">
        
        {/* User Card */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" 
              alt=""
              className="w-12 h-12 rounded-full border border-zinc-850 object-cover" 
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-150">alex_creative</span>
              <span className="text-[10px] text-zinc-500">Alex Mercer</span>
            </div>
          </div>
          <button className="text-[10px] font-bold text-purple-400 hover:text-purple-300 transition-colors">
            Switch
          </button>
        </div>

        {/* AI Recommendations Algorithm Health Panel */}
        <div className="p-4 bg-zinc-900/50 border border-zinc-900 rounded-xl mb-6 shadow-sm">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={14} className="text-purple-400" />
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Recommender Core Health</h4>
          </div>
          <p className="text-[10px] text-zinc-450 leading-normal mb-3">
            Personalized feed is currently actively ranked based on user interests matching, follow proximity, and historical engagement scoring (WSL container synced).
          </p>

          <div className="space-y-1.5">
            <h5 className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide">Live Feed Score Index</h5>
            {posts.map((p, idx) => (
              <div key={idx} className="flex justify-between items-center text-[10px] text-zinc-350">
                <span className="truncate max-w-[140px]">@{p.user.username} post</span>
                <span className="font-semibold text-purple-400 bg-purple-950/20 px-1.5 py-0.2 rounded border border-purple-900/30">
                  {p.aiScore}% score
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* User Suggestions list */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Suggested for you</span>
              <span className="text-[10px] font-bold text-zinc-350 cursor-pointer hover:underline">See All</span>
            </div>

            <div className="space-y-3">
              {suggestions.map(sugUser => (
                <div key={sugUser.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={sugUser.avatarUrl} 
                      alt="" 
                      className="w-8 h-8 rounded-full border border-zinc-900 object-cover" 
                    />
                    <div className="flex flex-col text-[10px]">
                      <span className="font-bold text-zinc-200 hover:underline cursor-pointer">{sugUser.username}</span>
                      <span className="text-zinc-550 truncate max-w-[120px]">{sugUser.computedPersona}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleFollow(sugUser.id)}
                    className="text-[10px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-0.5 transition-colors"
                  >
                    <UserPlus size={10} />
                    <span>Follow</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
