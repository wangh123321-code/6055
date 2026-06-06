import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: { username: string; password: string; role: string }) =>
    api.post('/api/auth/register', data),
  login: (data: { username: string; password: string }) =>
    api.post('/api/auth/login', data),
};

export const usersAPI = {
  getProfile: (id: string) => api.get(`/api/users/${id}`),
  updateProfile: (id: string, data: FormData | Record<string, unknown>) =>
    api.put(`/api/users/${id}`, data),
};

export const postsAPI = {
  getPosts: (params?: { page?: number; limit?: number; tag?: string; postType?: string; author?: string }) =>
    api.get('/api/posts', { params }),
  getHotPosts: () => api.get('/api/posts/hot'),
  getPost: (id: string) => api.get(`/api/posts/${id}`),
  createPost: (data: Record<string, unknown>) => api.post('/api/posts', data),
  updatePost: (id: string, data: Record<string, unknown>) => api.put(`/api/posts/${id}`, data),
  deletePost: (id: string) => api.delete(`/api/posts/${id}`),
};

export const commentsAPI = {
  getComments: (postId: string) => api.get(`/api/comments/post/${postId}`),
  createComment: (postId: string, data: { content: string }) =>
    api.post('/api/comments', { postId, content: data.content }),
  deleteComment: (postId: string, commentId: string) =>
    api.delete(`/api/comments/${commentId}`),
};

export const likesAPI = {
  toggleLike: (postId: string) => api.post(`/api/likes/toggle/${postId}`),
  getLikeCount: (postId: string) => api.get(`/api/likes/post/${postId}`),
};

export const bookmarksAPI = {
  toggleBookmark: (postId: string) => api.post(`/api/bookmarks/toggle/${postId}`),
  getMyBookmarks: () => api.get('/api/bookmarks/me'),
};

export const matchingAPI = {
  getRecommendations: () => api.get('/api/matching/recommendations'),
  submitFeedback: (matchId: string, data: { status: string }) =>
    api.post(`/api/matching/feedback/${matchId}`, data),
  runMatching: () => api.post('/api/matching/run'),
};

export default api;
