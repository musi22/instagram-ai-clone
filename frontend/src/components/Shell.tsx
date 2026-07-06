"use client";

import React from "react";
import { useApp } from "./AppContext";
import { CreatePostModal } from "./CreatePostModal";
import { StoryViewerModal } from "./StoryViewerModal";
import { PostDetailsModal } from "./PostDetailsModal";
import { Home, MessageSquare, PlusSquare, User, Compass } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setCreateOpen } = useApp();
  const pathname = usePathname();

  // Helper to determine active link
  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { label: "Home", icon: <Home size={22} />, path: "/" },
    { label: "Explore", icon: <Compass size={22} />, path: "/explore" },
    { label: "Messages", icon: <MessageSquare size={22} />, path: "/messages" },
    { label: "Profile", icon: <User size={22} />, path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col md:flex-row">
      {/* 1. Left Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex flex-col justify-between w-64 border-r border-zinc-900 bg-zinc-950 p-6 shrink-0 fixed h-screen z-20">
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2 pl-2">
            <span className="text-xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 bg-clip-text text-transparent tracking-wide">
              InstaAI Clone
            </span>
            <span className="text-[9px] bg-purple-500/20 text-purple-400 border border-purple-800/40 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              Prod
            </span>
          </div>

          {/* Navigation links */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item, index) => (
              <Link 
                href={item.path} 
                key={index}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-zinc-900/60 group ${
                  isActive(item.path) 
                    ? "bg-zinc-900 text-white border border-zinc-850" 
                    : "text-zinc-450 hover:text-zinc-200"
                }`}
              >
                <div className={`transition-transform group-hover:scale-105 ${isActive(item.path) ? "text-purple-400" : ""}`}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Create Post Button */}
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-zinc-450 hover:text-purple-400 hover:bg-purple-950/15 group mt-4 border border-dashed border-zinc-800 hover:border-purple-900/40"
            >
              <div className="transition-transform group-hover:scale-105 group-hover:text-purple-400">
                <PlusSquare size={22} />
              </div>
              <span className="group-hover:text-purple-300">Create Post</span>
            </button>
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="flex flex-col gap-1 pl-2 text-[10px] text-zinc-600">
          <p className="font-semibold text-zinc-500">Meta Senior Staff Project</p>
          <p>© 2026 Instagram AI. Local VM v1.0</p>
        </div>
      </aside>

      {/* 2. Bottom Navigation Bar (Mobile / Tablet) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-900 flex items-center justify-around z-30 px-4">
        {navItems.map((item, index) => (
          <Link 
            href={item.path} 
            key={index}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs transition-colors ${
              isActive(item.path) ? "text-purple-400" : "text-zinc-500"
            }`}
          >
            {item.icon}
          </Link>
        ))}
        <button
          onClick={() => setCreateOpen(true)}
          className="flex flex-col items-center justify-center p-2 rounded-xl text-zinc-500 hover:text-purple-400 transition-colors"
        >
          <PlusSquare size={22} />
        </button>
      </nav>

      {/* 3. Main Workspace Container */}
      <main className="flex-1 md:pl-64 pb-16 md:pb-0 min-h-screen">
        <div className="mx-auto max-w-5xl">
          {children}
        </div>
      </main>

      {/* 4. Shared Modals Overlay */}
      <CreatePostModal />
      <StoryViewerModal />
      <PostDetailsModal />
    </div>
  );
};
