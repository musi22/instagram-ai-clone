"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../../components/AppContext";
import { Send, Sparkles } from "lucide-react";

export default function MessagesPage() {
  const { chats, sendMessage, clearUnread, currentUser } = useApp();
  const [activeChatId, setActiveChatId] = useState("chat_ai");
  const [inputText, setInputText] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  // Clear unread count when switching chats
  useEffect(() => {
    if (activeChatId) {
      clearUnread(activeChatId);
    }
  }, [activeChatId, chats]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages, isAiTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText("");
    sendMessage(activeChatId, textToSend);

    // Simulate AI Agent typing delay
    if (activeChatId === "chat_ai") {
      setIsAiTyping(true);
      setTimeout(() => {
        setIsAiTyping(false);
      }, 950);
    }
  };

  return (
    <div className="flex border-l border-r border-zinc-900 bg-zinc-950 h-[calc(100vh-64px)] md:h-screen">
      
      {/* 1. Chats Sidebar */}
      <div className="w-1/3 border-r border-zinc-900 flex flex-col">
        <div className="p-4 border-b border-zinc-900">
          <h2 className="text-lg font-extrabold text-zinc-150 flex items-center gap-2">
            <span>Direct</span>
            <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 font-normal px-2 py-0.5 rounded-full">
              2 active
            </span>
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-zinc-950">
          {chats.map(chat => {
            const lastMsg = chat.messages[chat.messages.length - 1];
            return (
              <div 
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${
                  activeChatId === chat.id ? "bg-zinc-900/60" : "hover:bg-zinc-900/30"
                }`}
              >
                {/* Avatar */}
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={chat.user.avatarUrl} 
                    alt={chat.user.username} 
                    className="w-10 h-10 rounded-full object-cover border border-zinc-800"
                  />
                  {chat.user.id === "ai_agent" && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-purple-500 border-2 border-zinc-950 rounded-full flex items-center justify-center">
                      <Sparkles className="w-1.5 h-1.5 text-white" />
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="text-xs font-bold text-zinc-200 truncate">{chat.user.fullName}</h3>
                    <span className="text-[9px] text-zinc-550 shrink-0">{lastMsg ? lastMsg.timestamp : ""}</span>
                  </div>
                  <p className={`text-xs truncate ${chat.unreadCount > 0 ? "text-white font-semibold" : "text-zinc-500"}`}>
                    {lastMsg ? lastMsg.text : "No messages yet"}
                  </p>
                </div>

                {/* Unread indicator */}
                {chat.unreadCount > 0 && (
                  <span className="w-2.5 h-2.5 bg-purple-600 rounded-full shrink-0 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Active Chat Area */}
      <div className="w-2/3 flex flex-col bg-zinc-950/20 justify-between h-full">
        {activeChat ? (
          <>
            {/* Header info */}
            <div className="p-4 border-b border-zinc-900 flex items-center gap-3 bg-zinc-950/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={activeChat.user.avatarUrl} 
                alt="" 
                className="w-9 h-9 rounded-full object-cover border border-zinc-900"
              />
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <span>{activeChat.user.fullName}</span>
                  {activeChat.user.id === "ai_agent" && (
                    <span className="text-[9px] bg-purple-500/10 text-purple-400 border border-purple-800/40 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={8} /> Agent
                    </span>
                  )}
                </h3>
                <p className="text-[10px] text-zinc-500">@{activeChat.user.username}</p>
              </div>
            </div>

            {/* Messages body scrolling container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeChat.messages.map(msg => {
                const isMine = msg.senderId === currentUser.id;
                return (
                  <div 
                    key={msg.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div 
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                        isMine 
                          ? "bg-zinc-100 text-black font-medium rounded-tr-sm" 
                          : msg.isAiResponse
                            ? "bg-purple-950/20 border border-purple-900/40 text-zinc-200 rounded-tl-sm relative"
                            : "bg-zinc-900 border border-zinc-850 text-zinc-300 rounded-tl-sm"
                      }`}
                    >
                      {msg.isAiResponse && (
                        <span className="absolute -top-2 left-2 px-1 py-0.2 bg-purple-600 text-[8px] font-extrabold rounded-md text-white uppercase tracking-wider flex items-center gap-0.5">
                          <Sparkles size={6} /> Response
                        </span>
                      )}
                      
                      {/* Formats lines for structured output */}
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      
                      <span className={`block text-[9px] text-right mt-1.5 ${
                        isMine ? "text-zinc-500" : msg.isAiResponse ? "text-purple-400" : "text-zinc-550"
                      }`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Bot typing state simulation */}
              {isAiTyping && (
                <div className="flex justify-start">
                  <div className="bg-purple-950/10 border border-purple-900/20 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input message form bar */}
            <form onSubmit={handleSend} className="p-4 border-t border-zinc-900 bg-zinc-950/20">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  placeholder={
                    activeChatId === "chat_ai" 
                      ? "Ask AI: 'suggest caption for mountain photo'..." 
                      : "Type a message..."
                  }
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 text-xs text-white pl-4 pr-12 py-3 rounded-full focus:outline-none focus:border-zinc-700 placeholder-zinc-550 transition-colors"
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim()}
                  className="absolute right-2 p-2 bg-white disabled:bg-zinc-800 text-black disabled:text-zinc-650 rounded-full transition-all shadow-md"
                >
                  <Send size={12} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-xs">
            Select a chat conversation from the sidebar.
          </div>
        )}
      </div>

    </div>
  );
}
