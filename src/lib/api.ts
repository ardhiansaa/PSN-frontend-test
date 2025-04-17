import axios from 'axios';
import { Comment, CommentFormData } from '@/types';

const API_URL = 'https://jsonplaceholder.typicode.com';

export const fetchComments = async (): Promise<Comment[]> => {
  const response = await axios.get(`${API_URL}/comments`);
  return response.data;
};

export const createComment = async (data: CommentFormData): Promise<Comment> => {
  const response = await axios.post(`${API_URL}/comments`, data);
  return response.data;
};

export const deleteComment = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/comments/${id}`);
};