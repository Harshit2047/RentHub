export interface CommentUser {
  id: string;
  fullName: string;
  role: string;
}

export interface CommentItem {
  id: string;
  content: string;
  apartmentId: string;
  userId: string;
  parentCommentId?: string | null;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
  replies?: CommentItem[];
}

