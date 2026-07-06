const API_BASE_URL = "http://localhost:8000/api/v1";

class ApiService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("accessToken");
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", token);
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request(path: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${path}`;
    
    // Build headers
    const headers = new Headers(options.headers || {});
    if (this.token) {
      headers.set("Authorization", `Bearer ${this.token}`);
    }
    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        // If unauthorized, token might be invalid or expired. Try auto-logging in as alex_creative.
        const loginSuccess = await this.autoLogin();
        if (loginSuccess) {
          // Retry the original request
          headers.set("Authorization", `Bearer ${this.token}`);
          const retryResponse = await fetch(url, { ...options, headers });
          if (retryResponse.ok) {
            return await retryResponse.json();
          }
        }
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `API Error: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error(`Request to ${url} failed:`, error);
      throw error;
    }
  }

  async autoLogin(): Promise<boolean> {
    console.log("Attempting automatic login for alex_creative...");
    try {
      const formData = new FormData();
      formData.append("username", "alex_creative");
      formData.append("password", "password123");

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        this.setToken(data.access_token);
        console.log("Automatic login successful.");
        return true;
      }
    } catch (e) {
      console.warn("Auto-login failed:", e);
    }
    return false;
  }

  // --- Auth API ---
  async getMe() {
    return this.request("/users/me");
  }

  // --- Posts API ---
  async getFeed() {
    return this.request("/posts/");
  }

  async createPost(file: File, caption?: string, location?: string, tags?: string[], imageDesc?: string) {
    const formData = new FormData();
    formData.append("file", file);
    if (caption) formData.append("caption", caption);
    if (location) formData.append("location", location);
    if (tags) formData.append("tags", JSON.stringify(tags));
    if (imageDesc) formData.append("image_desc", imageDesc);

    return this.request("/posts/", {
      method: "POST",
      body: formData,
    });
  }

  async toggleLike(postId: string) {
    return this.request(`/posts/${postId}/like`, { method: "POST" });
  }

  async toggleSave(postId: string) {
    return this.request(`/posts/${postId}/save`, { method: "POST" });
  }

  async addComment(postId: string, text: string, parentId?: string) {
    return this.request(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ text, parent_id: parentId }),
    });
  }

  async toggleFollow(userId: string) {
    return this.request(`/posts/users/${userId}/follow`, { method: "POST" });
  }

  // --- Stories API ---
  async getStories() {
    return this.request("/stories/");
  }

  async createStory(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return this.request("/stories/", {
      method: "POST",
      body: formData,
    });
  }

  async viewStory(storyId: string) {
    return this.request(`/stories/${storyId}/view`, { method: "POST" });
  }

  // --- Chats API ---
  async getChats() {
    return this.request("/chats/");
  }

  async sendMessage(chatId: string, text: string) {
    return this.request(`/chats/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  }

  async clearUnread(chatId: string) {
    return this.request(`/chats/${chatId}/clear-unread`, { method: "POST" });
  }

  // --- Explore API ---
  async getExplore(query?: string) {
    const path = query ? `/explore/?query=${encodeURIComponent(query)}` : "/explore/";
    return this.request(path);
  }
}

export const api = new ApiService();
