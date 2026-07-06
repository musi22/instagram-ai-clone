"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "../../components/AppContext";
import { Search, Sparkles, Heart, MessageCircle } from "lucide-react";
import { simulateSemanticSearch, ExploreItem, Post, mockUsers } from "../mockDb";

export default function ExplorePage() {
  const { exploreItems, posts, setActivePostDetail } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState<ExploreItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Sync explore items initial state
  useEffect(() => {
    setFilteredItems(exploreItems);
  }, [exploreItems]);

  // Handle live query text changes and run visual search simulation
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setFilteredItems(exploreItems);
      return;
    }
    
    setIsSearching(true);
    setTimeout(() => {
      const results = simulateSemanticSearch(searchQuery, exploreItems);
      setFilteredItems(results);
      setIsSearching(false);
    }, 600);
  };

  const handleItemClick = (item: ExploreItem) => {
    // Find matching post in database by imageUrl
    const existingPost = posts.find(p => p.imageUrls.includes(item.imageUrl));
    if (existingPost) {
      setActivePostDetail(existingPost);
    } else {
      // Create temporary post object
      const tempPost: Post = {
        id: `post_temp_${item.id}`,
        user: mockUsers[Math.floor(Math.random() * 3)],
        imageUrls: [item.imageUrl],
        caption: `Exploring beautiful vibes in the city. Tagged: ${item.tags.map(t => "#" + t).join(" ")}`,
        likesCount: item.likes,
        comments: [],
        timestamp: "2d ago",
        isLiked: false,
        isSaved: false,
        aiScore: item.similarity || 85,
        aiTags: item.tags,
        aiModeration: { flag: false, toxicityScore: 2, category: "Clean" }
      };
      setActivePostDetail(tempPost);
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* 1. Header & Semantic Search Bar */}
      <div className="mb-8 max-w-xl mx-auto text-center">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-2 text-zinc-150">Discover Inspiration</h1>
        <p className="text-xs text-zinc-550 mb-6">Explore content curated by AI semantic search. Try terms like &quot;neon night&quot;, &quot;mountain sunrise&quot;, or &quot;healthy salad&quot;.</p>
        
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <input 
            type="text" 
            placeholder="Search posts with AI Natural Language..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 pl-11 pr-24 py-3 rounded-full focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all placeholder-zinc-550"
          />
          <Search className="absolute left-4 text-zinc-550" size={18} />
          
          <button 
            type="submit"
            className="absolute right-2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold rounded-full flex items-center gap-1.5 transition-all shadow-md"
          >
            <Sparkles size={12} />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* 2. Search Loading State */}
      {isSearching ? (
        <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-3">
          <svg className="animate-spin h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-medium text-zinc-400">Embedding prompt and querying Qdrant DB...</span>
        </div>
      ) : (
        /* 3. Explore Grid Layout */
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              onClick={() => handleItemClick(item)}
              className="relative aspect-square bg-zinc-900 group rounded-xl overflow-hidden cursor-pointer border border-zinc-900 hover:border-zinc-800 transition-all"
            >
              {/* Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={item.imageUrl} 
                alt="" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Hover details overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-6 text-white transition-opacity duration-300 font-semibold text-sm">
                <span className="flex items-center gap-1.5"><Heart size={18} fill="white" /> {item.likes}</span>
                <span className="flex items-center gap-1.5"><MessageCircle size={18} fill="white" /> {item.comments}</span>
              </div>

              {/* AI Relevance Tag Indicator */}
              {item.similarity !== undefined && (
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-purple-600/90 text-[10px] font-extrabold rounded-md shadow-md text-white flex items-center gap-1">
                  <Sparkles size={8} />
                  <span>Match: {item.similarity}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No results indicator */}
      {!isSearching && filteredItems.length === 0 && (
        <div className="text-center py-20 text-zinc-550 text-sm">
          No matches found. Try queries like &quot;mountain&quot;, &quot;tokyo&quot; or &quot;food&quot;.
        </div>
      )}
    </div>
  );
}
