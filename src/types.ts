export interface UserSession {
  username: string;
  name: string;
  group: string;
  role: "guest" | "author" | "student";
  avatarUrl: string;
  interests: string[];
}

export interface SharedFile {
  id: string;
  filename: string;
  description: string;
  content?: string;
  fileSize: number;
  passwordProtected: boolean;
  author: string;
  downloads: number;
  uploadedAt: string;
}

export interface Comment {
  id: string;
  author: string;
  avatarUrl: string;
  text: string;
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  category: "programming" | "guides" | "lessons" | "development";
  author: string;
  group?: string;
  rating: number;
  votedUsers: Record<string, "up" | "down">;
  comments: Comment[];
  createdAt: string;
  readTime: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  chapters: { title: string; text: string }[];
}

export interface ForumReply {
  id: string;
  author: string;
  avatarUrl: string;
  text: string;
  createdAt: string;
}

export interface ForumProject {
  id: string;
  title: string;
  description: string;
  creator: string;
  requiredSkills: string[];
  contacts: string;
  teamMembers: string[];
  replies: ForumReply[];
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  linkUrl: string;
  type: "info" | "new_article" | "new_file" | "forum_match";
  createdAt: string;
  readBy: string[];
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  timestamp: string;
}
