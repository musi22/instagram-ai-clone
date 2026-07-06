export interface User {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
  computedPersona?: string;
}

export interface Comment {
  id: string;
  username: string;
  userAvatar: string;
  content: string;
  timestamp: string;
}

export interface Post {
  id: string;
  user: User;
  imageUrls: string[];
  caption: string;
  likesCount: number;
  comments: Comment[];
  timestamp: string;
  isLiked: boolean;
  isSaved: boolean;
  aiScore: number; // Personalized Feed Score %
  aiTags: string[];
  aiModeration: {
    flag: boolean;
    toxicityScore: number; // 0-100
    category: string; // "Clean", "NSFW", "Violence", "Harassment"
  };
  aiCaptionIdeas?: string[];
}

export interface Story {
  id: string;
  user: User;
  imageUrl: string;
  isViewed: boolean;
  timestamp: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isAiResponse?: boolean;
}

export interface Chat {
  id: string;
  user: User;
  messages: Message[];
  unreadCount: number;
}

export interface ExploreItem {
  id: string;
  imageUrl: string;
  tags: string[];
  likes: number;
  comments: number;
  similarity?: number; // Calculated dynamic similarity
}

// -------------------------------------------------------------
// Seed Data
// -------------------------------------------------------------

export const activeUser: User = {
  id: "alex_creative",
  username: "alex_creative",
  fullName: "Alex Mercer",
  avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop",
  bio: "Digital Creator | Exploring AI Art & Photography 📸 | Based in SF 🌌",
  followersCount: 1420,
  followingCount: 482,
  postsCount: 4,
  computedPersona: "Creative / Tech Explorer"
};

export const mockUsers: User[] = [
  {
    id: "elena_travels",
    username: "elena_travels",
    fullName: "Elena Rostova",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    bio: "Adventure Seeker 🏔️ | Travel Blogger | Capturing the wild world 🏕️",
    followersCount: 12400,
    followingCount: 891,
    postsCount: 184,
    isFollowing: true,
    computedPersona: "Outdoor / Nomad Adventurer"
  },
  {
    id: "chef_takahashi",
    username: "chef_takahashi",
    fullName: "Kenji Takahashi",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    bio: "Sushi master 🍣 | Culinary Art & Gastronomy | SF based 🌉",
    followersCount: 8900,
    followingCount: 312,
    postsCount: 92,
    isFollowing: false,
    computedPersona: "Gourmet Food Enthusiast"
  },
  {
    id: "neon_vibes",
    username: "neon_vibes",
    fullName: "Marcus Vance",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    bio: "Cyberpunk street photography 🌆 | Neon lights & rainy nights 🌃",
    followersCount: 22400,
    followingCount: 154,
    postsCount: 311,
    isFollowing: true,
    computedPersona: "Urban / Cyberpunk Aesthetic"
  },
  {
    id: "ai_helper",
    username: "ai_agent",
    fullName: "AI Creative Assistant",
    avatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&h=150&fit=crop",
    bio: "System Co-Pilot 🤖 | Ask me for caption suggestions, moderation scans, or aesthetic reviews!",
    followersCount: 999999,
    followingCount: 1,
    postsCount: 0,
    computedPersona: "Technical Assistant Model"
  }
];

export const initialStories: Story[] = [
  {
    id: "story_1",
    user: mockUsers[0], // elena_travels
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=1000&fit=crop",
    isViewed: false,
    timestamp: "2h ago"
  },
  {
    id: "story_2",
    user: mockUsers[1], // chef_takahashi
    imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=1000&fit=crop",
    isViewed: false,
    timestamp: "4h ago"
  },
  {
    id: "story_3",
    user: mockUsers[2], // neon_vibes
    imageUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&h=1000&fit=crop",
    isViewed: false,
    timestamp: "6h ago"
  }
];

export const initialPosts: Post[] = [
  {
    id: "post_1",
    user: mockUsers[2], // neon_vibes
    imageUrls: ["https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=800&h=800&fit=crop"],
    caption: "Lost in the neon currents of Tokyo. Standing under the rainy billboard glow. 🌧️✨",
    likesCount: 1245,
    comments: [
      {
        id: "c1",
        username: "elena_travels",
        userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop",
        content: "This cyberpunk aesthetic is incredible! 🌌",
        timestamp: "2h ago"
      },
      {
        id: "c2",
        username: "chef_takahashi",
        userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop",
        content: "Lighting is masterclass.",
        timestamp: "1h ago"
      }
    ],
    timestamp: "3h ago",
    isLiked: false,
    isSaved: false,
    aiScore: 94,
    aiTags: ["neon", "cyberpunk", "tokyo", "rain", "street", "night"],
    aiModeration: {
      flag: false,
      toxicityScore: 2,
      category: "Clean"
    },
    aiCaptionIdeas: [
      "Staring into the electric future of Tokyo nights. ⚡🌃",
      "Neon rain makes the concrete shine. 🌧️✨",
      "When the city dreams in cyan and magenta."
    ]
  },
  {
    id: "post_2",
    user: mockUsers[0], // elena_travels
    imageUrls: ["https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=800&fit=crop"],
    caption: "Morning gold hitting the peaks. Waking up above the cloud deck is a feeling that never gets old. 🏔️☀️",
    likesCount: 892,
    comments: [
      {
        id: "c3",
        username: "alex_creative",
        userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop",
        content: "Adding this peak to my travel bucket list immediately! Gorgeous shot.",
        timestamp: "5h ago"
      }
    ],
    timestamp: "6h ago",
    isLiked: true,
    isSaved: true,
    aiScore: 88,
    aiTags: ["mountain", "sunrise", "gold", "clouds", "hiking", "landscape", "nature"],
    aiModeration: {
      flag: false,
      toxicityScore: 1,
      category: "Clean"
    },
    aiCaptionIdeas: [
      "Above the clouds, below the stars. 🏔️✨",
      "Golden hour at 10,000 feet. ☀️⛰️",
      "Chasing peaks and morning light."
    ]
  },
  {
    id: "post_3",
    user: mockUsers[1], // chef_takahashi
    imageUrls: ["https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800&h=800&fit=crop"],
    caption: "The art of simplicity. Fresh bluefin otoro nigiri, cured lightly with aged tamari. 🍣🥢",
    likesCount: 521,
    comments: [
      {
        id: "c4",
        username: "neon_vibes",
        userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop",
        content: "Looks absolutely mouthwatering! Need to visit your spot next time in SF.",
        timestamp: "8h ago"
      }
    ],
    timestamp: "10h ago",
    isLiked: false,
    isSaved: false,
    aiScore: 79,
    aiTags: ["sushi", "food", "chef", "japan", "seafood", "minimalist"],
    aiModeration: {
      flag: false,
      toxicityScore: 1,
      category: "Clean"
    },
    aiCaptionIdeas: [
      "Precision, balance, flavor. The sushi craft. 🍣🍶",
      "Bluefin otoro cured with tamari. Perfection on rice.",
      "Less is more when ingredients speak for themselves."
    ]
  }
];

export const mockExploreItems: ExploreItem[] = [
  { id: "e1", imageUrl: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=600&h=600&fit=crop", tags: ["neon", "cyberpunk", "city", "tokyo", "night", "street"], likes: 452, comments: 22 },
  { id: "e2", imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=600&fit=crop", tags: ["mountain", "sunrise", "clouds", "nature", "landscape", "hiking"], likes: 312, comments: 14 },
  { id: "e3", imageUrl: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=600&h=600&fit=crop", tags: ["sushi", "food", "chef", "fish", "japanese"], likes: 211, comments: 8 },
  { id: "e4", imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop", tags: ["shoes", "neon", "red", "sneakers", "product"], likes: 890, comments: 64 },
  { id: "e5", imageUrl: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&h=600&fit=crop", tags: ["mountain", "snow", "peak", "climbing", "winter", "nature"], likes: 524, comments: 18 },
  { id: "e6", imageUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&h=600&fit=crop", tags: ["forest", "lake", "green", "bridge", "nature", "trees"], likes: 622, comments: 25 },
  { id: "e7", imageUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&h=600&fit=crop", tags: ["dog", "golden", "retriever", "pet", "animal", "nature"], likes: 1040, comments: 82 },
  { id: "e8", imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=600&fit=crop", tags: ["car", "muscle", "chevrolet", "vintage", "garage"], likes: 785, comments: 41 },
  { id: "e9", imageUrl: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=600&h=600&fit=crop", tags: ["food", "salad", "healthy", "vegan", "vegetables"], likes: 410, comments: 12 },
  { id: "e10", imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&h=600&fit=crop", tags: ["forest", "sunlight", "trees", "woodlands", "path"], likes: 388, comments: 9 },
  { id: "e11", imageUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&h=600&fit=crop", tags: ["cyberpunk", "hologram", "future", "neon", "science-fiction"], likes: 923, comments: 55 },
  { id: "e12", imageUrl: "https://images.unsplash.com/photo-1472214222541-d510753a4907?w=600&h=600&fit=crop", tags: ["lake", "sunset", "nature", "water", "landscape", "dusk"], likes: 733, comments: 33 }
];

export const initialChats: Chat[] = [
  {
    id: "chat_ai",
    user: mockUsers[3], // ai_agent
    unreadCount: 1,
    messages: [
      {
        id: "m_ai_init",
        senderId: "ai_agent",
        text: "Hi Alex! I am your AI Creative Assistant. 🤖 You can ask me to write captions for you, suggest trending hashtags, run safety check simulations on photos, or perform analysis of your post engagement score. Let's create something awesome!",
        timestamp: "9:00 AM",
        isAiResponse: true
      }
    ]
  },
  {
    id: "chat_elena",
    user: mockUsers[0],
    unreadCount: 0,
    messages: [
      { id: "m_e1", senderId: "elena_travels", text: "Hey Alex! Love your latest AI render.", timestamp: "Yesterday" },
      { id: "m_e2", senderId: "alex_creative", text: "Thanks Elena! Really appreciate it.", timestamp: "Yesterday" }
    ]
  }
];

// -------------------------------------------------------------
// AI Engine Simulators
// -------------------------------------------------------------

/**
 * Simulates Personalized Feed Ranking.
 * Calculates score based on:
 * - Follow status (adds 20 pts)
 * - User interest matching (adds up to 40 pts depending on matching tags with user's favorite topics: e.g. "cyberpunk", "nature")
 * - Historic engagement (adds up to 20 pts)
 * - Freshness/Recency factor (random variance 0-20 pts)
 */
export function simulateFeedRanking(posts: Post[], followingUserIds: string[]): Post[] {
  const favoriteTags = ["cyberpunk", "nature", "neon", "landscape", "hiking"];
  
  return posts.map(post => {
    let score = 40; // Base baseline score
    
    // Follow relationship match (+20 pts)
    if (followingUserIds.includes(post.user.id)) {
      score += 20;
    }
    
    // Tags match with favorite tags (up to +30 pts)
    const matchingTags = post.aiTags.filter(t => favoriteTags.includes(t));
    score += Math.min(matchingTags.length * 10, 30);
    
    // Safety check deduction (if flagged, penalty of 50 points)
    if (post.aiModeration.flag) {
      score -= 50;
    }
    
    // Normalize between 10 and 99
    score = Math.max(10, Math.min(score + Math.floor(Math.random() * 10), 99));
    
    return { ...post, aiScore: score };
  }).sort((a, b) => b.aiScore - a.aiScore); // Sort highest score first
}

/**
 * Simulates Automatic Hashtag Generation.
 */
export function simulateGenerateHashtags(caption: string, imageDesc: string): string[] {
  const normalized = (caption + " " + imageDesc).toLowerCase();
  const tagsSet = new Set<string>();
  
  // Keyword mapping
  if (normalized.includes("tokyo") || normalized.includes("neon") || normalized.includes("cyberpunk") || normalized.includes("street")) {
    ["cyberpunk", "neonaesthetic", "tokyonights", "streetphotography", "citylights", "rainyday"].forEach(t => tagsSet.add(t));
  }
  if (normalized.includes("mountain") || normalized.includes("hike") || normalized.includes("climb") || normalized.includes("nature") || normalized.includes("landscape")) {
    ["naturelovers", "mountainpeak", "hikingadventures", "wanderlust", "wilderness", "scenicviews"].forEach(t => tagsSet.add(t));
  }
  if (normalized.includes("sushi") || normalized.includes("food") || normalized.includes("cook") || normalized.includes("delicious") || normalized.includes("chef")) {
    ["sushitime", "foodphotography", "gourmetchef", "instafood", "culinaryart", "foodiegram"].forEach(t => tagsSet.add(t));
  }
  if (normalized.includes("car") || normalized.includes("drive") || normalized.includes("engine") || normalized.includes("vintage")) {
    ["carlifestyle", "vintagecars", "classicrides", "autoenthusiast", "supercars"].forEach(t => tagsSet.add(t));
  }
  if (normalized.includes("dog") || normalized.includes("cat") || normalized.includes("pet") || normalized.includes("animal")) {
    ["petsofinstagram", "doglovers", "goldens", "cuteanimals", "furryfriends"].forEach(t => tagsSet.add(t));
  }
  
  // Fallbacks
  if (tagsSet.size === 0) {
    ["creatorsgonnacreate", "visualarts", "picoftheday", "aipower", "instadaily"].forEach(t => tagsSet.add(t));
  }
  
  return Array.from(tagsSet);
}

/**
 * Simulates AI Caption Generator.
 */
export function simulateGenerateCaptions(imageDesc: string): string[] {
  const desc = imageDesc.toLowerCase();
  
  if (desc.includes("cyberpunk") || desc.includes("city") || desc.includes("neon")) {
    return [
      "Staring into the electric grid of the future. ⚡🌃 #cyberpunk",
      "Neon raindrops and city skylines. The night is young. 🌧️💜",
      "Lost in translation, found in the neon. 🏮🏙️"
    ];
  }
  
  if (desc.includes("mountain") || desc.includes("lake") || desc.includes("nature")) {
    return [
      "Breathing in the mountain air. Peace found. 🏔️🌲 #outdoorlife",
      "Where the trail ends, the adventure begins. 🥾⛰️",
      "Reflecting on peaceful mornings above the clouds. ☀️💧"
    ];
  }
  
  if (desc.includes("food") || desc.includes("sushi") || desc.includes("eat")) {
    return [
      "Plated perfection. Fresh flavors that tell a story. 🍣🥢 #culinary",
      "Gastronomic dreams on a plate. Satisfying the soul. ✨🍶",
      "First we eat, then we do everything else. 😉🍽️"
    ];
  }
  
  // Generic fallbacks
  return [
    `Chasing moments and light. ✨ ${imageDesc ? `Featuring: ${imageDesc}` : ""}`,
    "Simplicity is the ultimate sophistication. 💎",
    "Focus on the good, and the good gets better. 🌟"
  ];
}

/**
 * Simulates Content Moderation Scan.
 */
export function simulateContentModeration(caption: string, imageDesc: string): Post["aiModeration"] {
  const combined = (caption + " " + imageDesc).toLowerCase();
  
  // Custom checks for unsafe words
  if (combined.includes("violence") || combined.includes("blood") || combined.includes("fight")) {
    return { flag: true, toxicityScore: 82, category: "Violence" };
  }
  if (combined.includes("nsfw") || combined.includes("nude") || combined.includes("explicit")) {
    return { flag: true, toxicityScore: 95, category: "NSFW" };
  }
  if (combined.includes("hate") || combined.includes("slur") || combined.includes("harass")) {
    return { flag: true, toxicityScore: 88, category: "Harassment" };
  }
  
  // Safe
  const score = Math.floor(Math.random() * 5) + 1; // 1-5% baseline
  return { flag: false, toxicityScore: score, category: "Clean" };
}

/**
 * Simulates AI Semantic Visual Search.
 * Matches user text string to tags using simple scoring.
 */
export function simulateSemanticSearch(query: string, items: ExploreItem[]): ExploreItem[] {
  if (!query || query.trim() === "") {
    return items.map(item => ({ ...item, similarity: undefined }));
  }
  
  const searchTerms = query.toLowerCase().split(/\s+/);
  
  const scoredItems = items.map(item => {
    let score = 0;
    
    // Count exact tag matches
    searchTerms.forEach(term => {
      // Direct matches
      if (item.tags.includes(term)) {
        score += 30;
      }
      
      // Partial prefix/substring match
      item.tags.forEach(tag => {
        if (tag.includes(term) && tag !== term) {
          score += 15;
        }
      });
      
      // Synonyms expansions
      if (term === "water" || term === "sunset" || term === "dusk" || term === "lake") {
        const waterTags = ["lake", "sunset", "nature", "water", "landscape"];
        const matchCount = item.tags.filter(t => waterTags.includes(t)).length;
        score += matchCount * 8;
      }
      if (term === "city" || term === "tokyo" || term === "neon" || term === "cyberpunk") {
        const cityTags = ["neon", "cyberpunk", "tokyo", "street", "night", "city"];
        const matchCount = item.tags.filter(t => cityTags.includes(t)).length;
        score += matchCount * 8;
      }
      if (term === "food" || term === "sushi" || term === "fish" || term === "delicious") {
        const foodTags = ["food", "sushi", "chef", "fish", "salad", "vegan", "vegetables", "japanese"];
        const matchCount = item.tags.filter(t => foodTags.includes(t)).length;
        score += matchCount * 8;
      }
    });
    
    // Cap score at 98, set baseline
    const similarity = score > 0 ? Math.min(score + Math.floor(Math.random() * 10), 98) : 5 + Math.floor(Math.random() * 8);
    
    return { ...item, similarity };
  });
  
  // Sort items that match query first, others below
  return scoredItems.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
}

// -------------------------------------------------------------
// Interactive State Helper Class (In-Memory Database)
// -------------------------------------------------------------

export class MockDatabase {
  private posts: Post[] = [...initialPosts];
  private stories: Story[] = [...initialStories];
  private chats: Chat[] = [...initialChats];
  private exploreItems: ExploreItem[] = [...mockExploreItems];
  private followingUserIds: string[] = mockUsers.filter(u => u.isFollowing).map(u => u.id);
  private listeners: (() => void)[] = [];

  constructor() {
    this.recalculateRanking();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  private recalculateRanking() {
    this.posts = simulateFeedRanking(this.posts, this.followingUserIds);
  }

  public getPosts(): Post[] {
    return this.posts;
  }

  public getStories(): Story[] {
    return this.stories;
  }

  public getChats(): Chat[] {
    return this.chats;
  }

  public getExploreItems(): ExploreItem[] {
    return this.exploreItems;
  }

  public getFollowingUserIds(): string[] {
    return this.followingUserIds;
  }

  public toggleLike(postId: string) {
    this.posts = this.posts.map(post => {
      if (post.id === postId) {
        const isLiked = !post.isLiked;
        return {
          ...post,
          isLiked,
          likesCount: post.likesCount + (isLiked ? 1 : -1)
        };
      }
      return post;
    });
    this.notify();
  }

  public toggleSave(postId: string) {
    this.posts = this.posts.map(post => {
      if (post.id === postId) {
        return { ...post, isSaved: !post.isSaved };
      }
      return post;
    });
    this.notify();
  }

  public addComment(postId: string, text: string) {
    if (!text.trim()) return;
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      username: activeUser.username,
      userAvatar: activeUser.avatarUrl,
      content: text,
      timestamp: "Just now"
    };

    this.posts = this.posts.map(post => {
      if (post.id === postId) {
        return { ...post, comments: [...post.comments, newComment] };
      }
      return post;
    });
    this.notify();
  }

  public toggleFollow(userId: string) {
    if (this.followingUserIds.includes(userId)) {
      this.followingUserIds = this.followingUserIds.filter(id => id !== userId);
    } else {
      this.followingUserIds.push(userId);
    }
    
    mockUsers.forEach(u => {
      if (u.id === userId) {
        u.isFollowing = !u.isFollowing;
        u.followersCount += u.isFollowing ? 1 : -1;
      }
    });

    this.recalculateRanking();
    this.notify();
  }

  public viewStory(storyId: string) {
    this.stories = this.stories.map(s => {
      if (s.id === storyId) {
        return { ...s, isViewed: true };
      }
      return s;
    });
    this.notify();
  }

  public createPost(imageUrl: string, caption: string, tags: string[], imageDesc: string) {
    const mod = simulateContentModeration(caption, imageDesc);
    const captionIdeas = simulateGenerateCaptions(imageDesc);
    
    const newPost: Post = {
      id: `post_${Date.now()}`,
      user: activeUser,
      imageUrls: [imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=800&fit=crop"],
      caption,
      likesCount: 0,
      comments: [],
      timestamp: "Just now",
      isLiked: false,
      isSaved: false,
      aiScore: 90, // Will be recalculated
      aiTags: tags.length > 0 ? tags : ["creativity", "newpost"],
      aiModeration: mod,
      aiCaptionIdeas: captionIdeas
    };

    // Add to explore list too
    const newExploreItem: ExploreItem = {
      id: `explore_${Date.now()}`,
      imageUrl: newPost.imageUrls[0],
      tags: newPost.aiTags,
      likes: 0,
      comments: 0
    };

    this.exploreItems = [newExploreItem, ...this.exploreItems];
    this.posts = [newPost, ...this.posts];
    activeUser.postsCount += 1;
    this.recalculateRanking();
    this.notify();
  }

  public sendMessage(chatId: string, text: string) {
    if (!text.trim()) return;
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: activeUser.id,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.chats = this.chats.map(c => {
      if (c.id === chatId) {
        return { ...c, messages: [...c.messages, newMessage] };
      }
      return c;
    });
    this.notify();

    // Trigger AI Chat response if chatting with AI Agent
    if (chatId === "chat_ai") {
      setTimeout(() => {
        this.triggerAiAgentReply(text);
      }, 1000);
    }
  }

  private triggerAiAgentReply(userMsg: string) {
    const cleanMsg = userMsg.toLowerCase();
    let replyText = "I processed your request, but I'm not sure how to assist. Try saying 'caption', 'moderation', 'ranking' or 'search' for custom walkthroughs! 🤖";

    if (cleanMsg.includes("hello") || cleanMsg.includes("hi")) {
      replyText = "Hello Alex! I am your AI assistant. Need some hashtags, caption ideas, or engagement predictions? Just ask! 🎨✨";
    } else if (cleanMsg.includes("caption") || cleanMsg.includes("write")) {
      replyText = "Sure! Tell me what is in your image. E.g. 'sunset at mountain lake'. I will write 3 caption drafts with matching hashtags! 📝";
    } else if (cleanMsg.includes("moderation") || cleanMsg.includes("toxic") || cleanMsg.includes("safe")) {
      replyText = "I automatically scan uploaded images and text. If any violence or NSFW contents are found, I flag it immediately. Try writing 'violence' or 'nude' in a new post caption to see my safety filter activate! 🛡️";
    } else if (cleanMsg.includes("ranking") || cleanMsg.includes("algorithm")) {
      replyText = "Our ranking algorithms score feeds using interest tags, active follow status, and historical engagement. Look at the right sidebar in your Feed panel to see a live breakdown of scores! 📈";
    } else if (cleanMsg.includes("search") || cleanMsg.includes("explore")) {
      replyText = "Head over to the Explore tab! Type concepts like 'lake', 'neon', or 'sushi' into the search box. I simulate cosine vector calculations to sort matching posts semantically. 🔍";
    } else if (cleanMsg.includes("sunset") || cleanMsg.includes("mountain") || cleanMsg.includes("lake") || cleanMsg.includes("cyberpunk") || cleanMsg.includes("sushi")) {
      // Generate dynamically
      const capIdeas = simulateGenerateCaptions(cleanMsg);
      const tagIdeas = simulateGenerateHashtags("", cleanMsg);
      replyText = `🤖 AI Suggestion for "${userMsg}":\n\n1. "${capIdeas[0]}"\n2. "${capIdeas[1]}"\n\nGenerated tags: ${tagIdeas.map(t => "#" + t).join(" ")}`;
    }

    const aiMessage: Message = {
      id: `msg_ai_${Date.now()}`,
      senderId: "ai_agent",
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAiResponse: true
    };

    this.chats = this.chats.map(c => {
      if (c.id === "chat_ai") {
        return {
          ...c,
          messages: [...c.messages, aiMessage],
          unreadCount: c.unreadCount + 1
        };
      }
      return c;
    });
    this.notify();
  }

  public clearUnread(chatId: string) {
    this.chats = this.chats.map(c => {
      if (c.id === chatId) {
        return { ...c, unreadCount: 0 };
      }
      return c;
    });
    this.notify();
  }
}

// Global Singleton for in-memory Database State
export const db = new MockDatabase();
