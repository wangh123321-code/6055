import axios from 'axios';

const api = axios.create({
  baseURL: '',
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
  getCurrentProfile: () => api.get('/api/users/profile/me'),
  updateProfile: (id: string, data: FormData | Record<string, unknown>) =>
    api.put(`/api/users/${id}`, data),
};

export const postsAPI = {
  getPosts: (params?: { page?: number; limit?: number; tag?: string; postType?: string; author?: string; coAuthor?: string; collection?: string }) =>
    api.get('/api/posts', { params }),
  getHotPosts: () => api.get('/api/posts/hot'),
  getPost: (id: string) => api.get(`/api/posts/${id}`),
  createPost: (data: Record<string, unknown>) => api.post('/api/posts', data),
  updatePost: (id: string, data: Record<string, unknown>) => api.put(`/api/posts/${id}`, data),
  deletePost: (id: string) => api.delete(`/api/posts/${id}`),
  inviteCoAuthor: (postId: string, userId: string) =>
    api.post(`/api/posts/${postId}/invite-coauthor`, { userId }),
  confirmCoAuthor: (postId: string) =>
    api.post('/api/posts/confirm-coauthor', { postId }),
  removeCoAuthor: (postId: string, userId: string) =>
    api.delete(`/api/posts/${postId}/coauthor/${userId}`),
  getMyInvitations: () => api.get('/api/posts/invitations/me'),
};

export const collectionsAPI = {
  getCollections: (params?: { page?: number; limit?: number; owner?: string }) =>
    api.get('/api/collections', { params }),
  getMyCollections: () => api.get('/api/collections/me'),
  getCollection: (id: string) => api.get(`/api/collections/${id}`),
  getCollectionWithPosts: (id: string, params?: { page?: number; limit?: number }) =>
    api.get(`/api/collections/${id}/posts`, { params }),
  createCollection: (data: Record<string, unknown>) => api.post('/api/collections', data),
  updateCollection: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/collections/${id}`, data),
  deleteCollection: (id: string) => api.delete(`/api/collections/${id}`),
  addPostToCollection: (collectionId: string, postId: string) =>
    api.post(`/api/collections/${collectionId}/posts`, { postId }),
  removePostFromCollection: (collectionId: string, postId: string) =>
    api.delete(`/api/collections/${collectionId}/posts`, { data: { postId } }),
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
