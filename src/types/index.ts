export interface Comment {
    id: number;
    postId: number;
    name: string;
    email: string;
    body: string;
  }
  
  export interface LoginFormData {
    username: string;
    password: string;
  }
  
  export interface CommentFormData {
    name: string;
    email: string;
    body: string;
  }