"use client";

import React, { useState } from "react";
import { useApp } from "../../components/AppContext";
import { Grid, Bookmark, Sparkles, Heart, MessageCircle } from "lucide-react";
import { Post } from "../mockDb";

export default function ProfilePage() {
  const { currentUser, posts, setActivePostDetail } = useApp();
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");

  // Filters posts belonging to active user
  const userPosts = posts.filter(p => p.user.id === currentUser.id);

  // Filters posts that active user has saved
  const savedPosts = posts.filter(p => p.isSaved);

  const mockHighlights = [
    { name: "Generative", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop" },
    { name: "Outdoors", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=100&h=100&fit=crop" },
    { name: "Urban Nights", img: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=100&h=100&fit=crop" }
  ];

  const handlePostClick = (post: Post) => {
    setActivePostDetail(post);
  };

  const renderedGridItems = activeTab === "posts" ? userPosts : savedPosts;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* 1. Header Row */}
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start border-b border-zinc-900 pb-8 mb-8">
        {/* Avatar */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={currentUser.avatarUrl} 
          alt={currentUser.username} 
          className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-zinc-800 object-cover p-1 shadow-lg"
        />

        {/* Stats and Info */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <h2 className="text-xl font-extrabold text-zinc-150">@{currentUser.username}</h2>
            <button className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-xs font-semibold rounded-lg border border-zinc-800 transition-colors">
              Edit Profile
            </button>
          </div>

          {/* Counts */}
          <div className="flex gap-6 mb-4 text-sm font-medium">
            <span><strong className="text-white">{userPosts.length}</strong> posts</span>
            <span><strong className="text-white">{currentUser.followersCount.toLocaleString()}</strong> followers</span>
            <span><strong className="text-white">{currentUser.followingCount.toLocaleString()}</strong> following</span>
          </div>

          {/* Bio info */}
          <div className="text-xs text-zinc-350 leading-relaxed max-w-md mb-4">
            <h3 className="font-bold text-zinc-100 text-sm mb-1">{currentUser.fullName}</h3>
            <p>{currentUser.bio}</p>
          </div>

          {/* AI Persona Analysis Dashboard */}
          <div className="p-3.5 bg-gradient-to-r from-purple-950/15 via-pink-950/5 to-zinc-900/50 border border-purple-900/30 rounded-xl max-w-md w-full text-left shadow-md">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">AI Calculated Persona</span>
            </div>
            <p className="text-xs font-bold text-zinc-150">{currentUser.computedPersona}</p>
            <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
              Calculated by indexing visual semantics in your uploaded pictures, hashtag usage density, and interest scores.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Highlights Circles */}
      <div className="flex gap-6 overflow-x-auto pb-6 mb-4 justify-start">
        {mockHighlights.map((hl, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1.5 cursor-pointer group shrink-0">
            <div className="p-0.5 bg-zinc-900 rounded-full border border-zinc-800 group-hover:border-zinc-700 transition-colors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={hl.img} 
                alt="" 
                className="w-14 h-14 rounded-full object-cover p-0.5" 
              />
            </div>
            <span className="text-[10px] font-medium text-zinc-450 group-hover:text-zinc-250 transition-colors">
              {hl.name}
            </span>
          </div>
        ))}
      </div>

      {/* 3. Grid View Switche Tab Header */}
      <div className="flex justify-center border-t border-zinc-900 text-xs font-bold mb-6">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-2 px-8 py-3.5 transition-colors border-t-2 ${
            activeTab === "posts" ? "border-white text-white" : "border-transparent text-zinc-500 hover:text-zinc-350"
          }`}
        >
          <Grid size={14} />
          <span>POSTS</span>
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={`flex items-center gap-2 px-8 py-3.5 transition-colors border-t-2 ${
            activeTab === "saved" ? "border-white text-white" : "border-transparent text-zinc-500 hover:text-zinc-350"
          }`}
        >
          <Bookmark size={14} />
          <span>SAVED</span>
        </button>
      </div>

      {/* 4. Grid Display items */}
      {renderedGridItems.length === 0 ? (
        <div className="text-center py-20 text-zinc-550 text-xs">
          {activeTab === "posts" 
            ? "You haven't posted anything yet." 
            : "No saved posts yet."}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 md:gap-4">
          {renderedGridItems.map((post) => (
            <div
              key={post.id}
              onClick={() => handlePostClick(post)}
              className="relative aspect-square bg-zinc-900 group rounded-lg overflow-hidden cursor-pointer border border-zinc-900 hover:border-zinc-850 transition-all"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={post.imageUrls[0]} 
                alt="" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 text-white transition-opacity font-bold text-xs">
                <span className="flex items-center gap-1"><Heart size={14} fill="white" /> {post.likesCount}</span>
                <span className="flex items-center gap-1"><MessageCircle size={14} fill="white" /> {post.comments.length}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
