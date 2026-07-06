"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "./AppContext";
import { X, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { AnimatePresence } from "framer-motion";

export const StoryViewerModal: React.FC = () => {
  const { activeStoryUser, setActiveStoryUser, stories, viewStory, sendMessage } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState("");

  // Filter stories for the active user
  const activeUserStories = stories.filter(s => s.user.id === activeStoryUser?.id);
  const currentStory = activeUserStories[currentIndex];

  // Auto-progress timer for the current story
  useEffect(() => {
    if (!activeStoryUser || !currentStory) return;
    
    // Mark story as viewed
    viewStory(currentStory.id);

    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          handleNextStory();
          return 100;
        }
        return prev + 2; // Increments to 100 over 5 seconds
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStoryUser, currentIndex]);

  const handleNextStory = () => {
    if (currentIndex < activeUserStories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Find next user's story
      const currentUserIndex = stories.findIndex(s => s.user.id === activeStoryUser?.id);
      const nextStory = stories.slice(currentUserIndex + 1).find(s => s.user.id !== activeStoryUser?.id);
      
      if (nextStory) {
        setActiveStoryUser(nextStory.user);
        setCurrentIndex(0);
      } else {
        handleClose();
      }
    }
  };

  const handlePrevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      // Find previous user's story
      const currentUserIndex = stories.findIndex(s => s.user.id === activeStoryUser?.id);
      const prevStories = stories.slice(0, currentUserIndex);
      const prevStory = prevStories.reverse().find(s => s.user.id !== activeStoryUser?.id);
      
      if (prevStory) {
        setActiveStoryUser(prevStory.user);
        setCurrentIndex(0);
      }
    }
  };

  const handleClose = () => {
    setActiveStoryUser(null);
    setCurrentIndex(0);
    setProgress(0);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeStoryUser) return;
    
    // Find active chat or create one
    // Send story reply as message
    const targetChatId = activeStoryUser.id === "elena_travels" ? "chat_elena" : "chat_ai";
    sendMessage(targetChatId, `Replied to your story: "${replyText}"`);
    setReplyText("");
    
    // Toast notification simulation
    alert(`Sent reply to @${activeStoryUser.username}!`);
  };

  if (!activeStoryUser || !currentStory) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-md">
        
        {/* Background image blur reflection */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10 filter blur-3xl pointer-events-none"
          style={{ backgroundImage: `url(${currentStory.imageUrl})` }}
        />

        {/* Global Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 text-zinc-400 hover:text-white hover:bg-zinc-900/60 rounded-full transition-all"
        >
          <X size={24} />
        </button>

        {/* Story Viewer Interface Container */}
        <div className="relative w-full max-w-md h-[90vh] max-h-[800px] bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between border border-zinc-900">
          
          {/* Header Indicators and Profile Info */}
          <div className="absolute top-0 left-0 right-0 z-10 p-3 bg-gradient-to-b from-black/80 to-transparent">
            {/* Timeline Progress Bars */}
            <div className="flex gap-1 mb-3">
              {activeUserStories.map((_, i) => (
                <div key={i} className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-75"
                    style={{ 
                      width: i < currentIndex ? "100%" : i === currentIndex ? `${progress}%` : "0%" 
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Profile Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={activeStoryUser.avatarUrl} 
                  alt={activeStoryUser.username}
                  className="w-8 h-8 rounded-full border border-white/40 object-cover"
                />
                <span className="text-sm font-semibold text-white">{activeStoryUser.username}</span>
                <span className="text-xs text-zinc-450">{currentStory.timestamp}</span>
              </div>
            </div>
          </div>

          {/* Navigation Overlay Buttons (Left/Right) */}
          <button 
            onClick={handlePrevStory}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-black/35 hover:bg-zinc-900/50 rounded-full text-white transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={handleNextStory}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-black/35 hover:bg-zinc-900/50 rounded-full text-white transition-all"
          >
            <ChevronRight size={20} />
          </button>

          {/* Main Story Image */}
          <div className="flex-1 flex items-center justify-center bg-zinc-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={currentStory.imageUrl} 
              alt="Story Content"
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {/* Reply Bar */}
          <div className="p-4 bg-gradient-to-t from-black to-black/30 z-10">
            <form onSubmit={handleSendReply} className="flex gap-2 items-center">
              <input 
                type="text" 
                placeholder={`Reply to ${activeStoryUser.username}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 bg-zinc-900/80 border border-zinc-800 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:border-zinc-700 placeholder-zinc-550 transition-colors"
              />
              <button 
                type="submit"
                disabled={!replyText.trim()}
                className="p-2 bg-white disabled:bg-zinc-800 text-black disabled:text-zinc-650 rounded-full transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </div>

        </div>
      </div>
    </AnimatePresence>
  );
};
