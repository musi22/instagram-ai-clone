"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { db, User, Post, Story, Chat, ExploreItem, activeUser } from "../app/mockDb";
import { api } from "../services/api";

export type ViewType = "feed" | "explore" | "messages" | "profile";

interface AppContextProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  currentUser: User;
  
  // Database States
  posts: Post[];
  stories: Story[];
  chats: Chat[];
  exploreItems: ExploreItem[];
  followingIds: string[];
  
  // Database Operations
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  toggleFollow: (userId: string) => void;
  viewStory: (storyId: string) => void;
  createPost: (imageUrl: string, caption: string, tags: string[], imageDesc: string) => void;
  sendMessage: (chatId: string, text: string) => void;
  clearUnread: (chatId: string) => void;
  
  // Modals state
  isCreateOpen: boolean;
  setCreateOpen: (open: boolean) => void;
  activeStoryUser: User | null;
  setActiveStoryUser: (user: User | null) => void;
  activePostDetail: Post | null;
  setActivePostDetail: (post: Post | null) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// --- Mapper utilities from API Responses to Frontend Types ---

const mapUser = (apiUser: any): User => {
  if (!apiUser) return activeUser;
  return {
    id: apiUser.id || apiUser.username,
    username: apiUser.username,
    fullName: apiUser.full_name || apiUser.username,
    avatarUrl: apiUser.profile_pic_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop",
    bio: apiUser.bio || "",
    followersCount: apiUser.followersCount || 1420,
    followingCount: apiUser.followingCount || 482,
    postsCount: apiUser.postsCount || 4,
    isFollowing: apiUser.isFollowing || false,
    computedPersona: apiUser.computedPersona || "Creative"
  };
};

const mapComment = (apiComment: any): any => {
  return {
    id: apiComment.id,
    username: apiComment.user?.username || "anonymous",
    userAvatar: apiComment.user?.profile_pic_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop",
    content: apiComment.text || "",
    timestamp: formatTime(apiComment.created_at)
  };
};

const mapPost = (apiPost: any): Post => {
  return {
    id: apiPost.id,
    user: mapUser(apiPost.owner),
    imageUrls: apiPost.media && apiPost.media.length > 0 
      ? apiPost.media.map((m: any) => m.media_url)
      : ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=800&fit=crop"],
    caption: apiPost.caption || "",
    likesCount: apiPost.likes_count || 0,
    comments: apiPost.comments ? apiPost.comments.map(mapComment) : [],
    timestamp: formatTime(apiPost.created_at),
    isLiked: apiPost.is_liked || false,
    isSaved: apiPost.is_saved || false,
    aiScore: apiPost.ai_score || 90,
    aiTags: apiPost.ai_tags || [],
    aiModeration: {
      flag: apiPost.ai_moderation?.flag || false,
      toxicityScore: apiPost.ai_moderation?.toxicityScore || 2.0,
      category: apiPost.ai_moderation?.category || "Clean"
    },
    aiCaptionIdeas: apiPost.ai_caption_ideas || []
  };
};

const mapStory = (apiStory: any): Story => {
  return {
    id: apiStory.id,
    user: mapUser(apiStory.user),
    imageUrl: apiStory.media_url,
    isViewed: apiStory.is_viewed || false,
    timestamp: formatTime(apiStory.created_at)
  };
};

const mapMessage = (apiMsg: any): any => {
  return {
    id: apiMsg.id,
    senderId: apiMsg.sender_id,
    text: apiMsg.text,
    timestamp: formatTime(apiMsg.timestamp),
    isAiResponse: apiMsg.is_ai_response || false
  };
};

const mapChat = (apiChat: any): Chat => {
  return {
    id: apiChat.id,
    user: mapUser(apiChat.user),
    messages: apiChat.messages ? apiChat.messages.map(mapMessage) : [],
    unreadCount: apiChat.unread_count || 0
  };
};

const formatTime = (isoString: string): string => {
  if (!isoString) return "Just now";
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    
    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "Some time ago";
  }
};

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setView] = useState<ViewType>("feed");
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [exploreItems, setExploreItems] = useState<ExploreItem[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  
  // Modal states
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [activeStoryUser, setActiveStoryUser] = useState<User | null>(null);
  const [activePostDetail, setActivePostDetail] = useState<Post | null>(null);

  const mountedRef = useRef(false);

  // Sync operations from backend API with mock fallback
  const refreshFeed = async () => {
    try {
      const apiFeed = await api.getFeed();
      setPosts(apiFeed.map(mapPost));
    } catch (e) {
      console.warn("Failed to fetch feed from API, using mock:", e);
      setPosts(db.getPosts());
    }
  };

  const refreshStories = async () => {
    try {
      const apiStories = await api.getStories();
      setStories(apiStories.map(mapStory));
    } catch (e) {
      console.warn("Failed to fetch stories from API, using mock:", e);
      setStories(db.getStories());
    }
  };

  const refreshChats = async () => {
    try {
      const apiChats = await api.getChats();
      setChats(apiChats.map(mapChat));
    } catch (e) {
      console.warn("Failed to fetch chats from API, using mock:", e);
      setChats(db.getChats());
    }
  };

  const refreshExplore = async (query?: string) => {
    try {
      const apiExplore = await api.getExplore(query);
      setExploreItems(apiExplore.map((item: any) => ({
        id: item.id,
        imageUrl: item.imageUrl,
        tags: item.tags || [],
        likes: item.likes || 0,
        comments: item.comments || 0,
        similarity: item.similarity
      })));
    } catch (e) {
      console.warn("Failed to fetch explore from API, using mock:", e);
      setExploreItems(db.getExploreItems());
    }
  };

  const refreshAll = async () => {
    // Attempt auto-login if token is missing
    if (!api.getToken()) {
      await api.autoLogin();
    }
    
    await Promise.all([
      refreshFeed(),
      refreshStories(),
      refreshChats(),
      refreshExplore()
    ]);
  };

  useEffect(() => {
    mountedRef.current = true;
    refreshAll();

    // Also subscribe to in-memory DB updates for robust local UI interaction
    const unsubscribe = db.subscribe(() => {
      // If backend is not active, updates fallback immediately to local mock database
      if (!api.getToken()) {
        setPosts(db.getPosts());
        setStories(db.getStories());
        setChats(db.getChats());
        setExploreItems(db.getExploreItems());
        setFollowingIds(db.getFollowingUserIds());
      }
    });

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, []);

  // Update followingIds from posts user states
  useEffect(() => {
    const ids = posts.filter(p => p.user.isFollowing).map(p => p.user.id);
    // Unique list
    setFollowingIds(Array.from(new Set(ids)));
  }, [posts]);

  // Operations
  const toggleLike = async (postId: string) => {
    // Optimistic UI update
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          isLiked: !p.isLiked,
          likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1
        };
      }
      return p;
    }));

    try {
      await api.toggleLike(postId);
      await refreshFeed();
    } catch (e) {
      console.warn("API toggleLike failed, using mock:", e);
      db.toggleLike(postId);
    }
  };

  const toggleSave = async (postId: string) => {
    // Optimistic UI update
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          isSaved: !p.isSaved
        };
      }
      return p;
    }));

    try {
      await api.toggleSave(postId);
      await refreshFeed();
    } catch (e) {
      console.warn("API toggleSave failed, using mock:", e);
      db.toggleSave(postId);
    }
  };

  const addComment = async (postId: string, text: string) => {
    try {
      await api.addComment(postId, text);
      await refreshFeed();
    } catch (e) {
      console.warn("API addComment failed, using mock:", e);
      db.addComment(postId, text);
    }
  };

  const toggleFollow = async (userId: string) => {
    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p.user.id === userId) {
        return {
          ...p,
          user: {
            ...p.user,
            isFollowing: !p.user.isFollowing
          }
        };
      }
      return p;
    }));

    try {
      await api.toggleFollow(userId);
      await refreshFeed();
    } catch (e) {
      console.warn("API toggleFollow failed, using mock:", e);
      db.toggleFollow(userId);
    }
  };

  const viewStory = async (storyId: string) => {
    // Optimistic update
    setStories(prev => prev.map(s => {
      if (s.id === storyId) {
        return { ...s, isViewed: true };
      }
      return s;
    }));

    try {
      await api.viewStory(storyId);
      await refreshStories();
    } catch (e) {
      console.warn("API viewStory failed, using mock:", e);
      db.viewStory(storyId);
    }
  };

  const createPost = async (imageUrl: string, caption: string, tags: string[], imageDesc: string) => {
    try {
      // Convert image URL to Blob/File object to upload
      let file: File;
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        file = new File([blob], "image.jpg", { type: blob.type || "image/jpeg" });
      } catch (err) {
        console.warn("Could not fetch image preset as blob, using empty fallback file:", err);
        const emptyBlob = new Blob([new Uint8Array([47,47])], { type: "image/jpeg" });
        file = new File([emptyBlob], "empty.jpg", { type: "image/jpeg" });
      }

      await api.createPost(file, caption, "San Francisco", tags, imageDesc);
      await refreshFeed();
      setCreateOpen(false);
    } catch (e) {
      console.warn("API createPost failed, using mock:", e);
      db.createPost(imageUrl, caption, tags, imageDesc);
      setCreateOpen(false);
    }
  };

  const sendMessage = async (chatId: string, text: string) => {
    try {
      await api.sendMessage(chatId, text);
      await refreshChats();
    } catch (e) {
      console.warn("API sendMessage failed, using mock:", e);
      db.sendMessage(chatId, text);
    }
  };

  const clearUnread = async (chatId: string) => {
    // Optimistic update
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        return { ...c, unreadCount: 0 };
      }
      return c;
    }));

    try {
      await api.clearUnread(chatId);
      await refreshChats();
    } catch (e) {
      console.warn("API clearUnread failed, using mock:", e);
      db.clearUnread(chatId);
    }
  };

  // Keep activePostDetail updated if its details change in database
  useEffect(() => {
    if (activePostDetail) {
      const updated = posts.find(p => p.id === activePostDetail.id);
      if (updated) {
        setActivePostDetail(updated);
      }
    }
  }, [posts, activePostDetail]);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setView,
        currentUser: activeUser,
        posts,
        stories,
        chats,
        exploreItems,
        followingIds,
        toggleLike,
        toggleSave,
        addComment,
        toggleFollow,
        viewStory,
        createPost,
        sendMessage,
        clearUnread,
        isCreateOpen,
        setCreateOpen,
        activeStoryUser,
        setActiveStoryUser,
        activePostDetail,
        setActivePostDetail
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppContextProvider");
  }
  return context;
};
