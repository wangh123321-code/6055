export interface User {
  _id: string;
  username: string;
  role: 'artisan' | 'learner' | 'lover' | 'admin';
  avatar: string;
  bio: string;
  location: {
    type: string;
    coordinates: number[];
  };
  tags: string[];
  createdAt: string;
}

export interface Post {
  _id: string;
  author: User;
  title: string;
  content: string;
  images: string[];
  tags: string[];
  postType: 'work' | 'apprentice' | 'seeker';
  teachingMode: 'online' | 'offline' | 'both';
  style: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

export interface Comment {
  _id: string;
  author: User;
  post: string;
  content: string;
  createdAt: string;
}

export interface Match {
  _id: string;
  artisan: User;
  learner: User;
  score: number;
  status: 'pending' | 'interested' | 'not_suitable';
  createdAt: string;
  expiresAt: string;
}

export interface PaginatedResponse<T> {
  posts: T[];
  total: number;
}
