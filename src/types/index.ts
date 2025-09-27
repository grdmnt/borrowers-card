// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Borrowed Item Types
export interface BorrowedItem {
  id: string;
  title: string;
  description?: string;
  category: ItemCategory;
  borrowed_from: string;
  borrowed_date: string;
  due_date?: string;
  returned_date?: string;
  status: BorrowStatus;
  notes?: string;
  image_url?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Lent Item Types
export interface LentItem {
  id: string;
  title: string;
  description?: string;
  category: ItemCategory;
  lent_to: string;
  lent_date: string;
  due_date?: string;
  returned_date?: string;
  status: LentStatus;
  notes?: string;
  image_url?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Group Types
export interface Group {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  members: GroupMember[];
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: GroupRole;
  joined_at: string;
}

// Enums
export enum ItemCategory {
  BOOK = 'book',
  MOVIE = 'movie',
  GAME = 'game',
  TOOL = 'tool',
  CLOTHING = 'clothing',
  ELECTRONICS = 'electronics',
  SPORTS = 'sports',
  MUSIC = 'music',
  OTHER = 'other'
}

export enum BorrowStatus {
  ACTIVE = 'active',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  LOST = 'lost'
}

export enum LentStatus {
  ACTIVE = 'active',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  LOST = 'lost'
}

export enum GroupRole {
  ADMIN = 'admin',
  MEMBER = 'member'
}

// Form Types
export interface BorrowedItemForm {
  title: string;
  description?: string;
  category: ItemCategory;
  borrowed_from: string;
  borrowed_date: string;
  due_date?: string;
  notes?: string;
  image_url?: string;
}

export interface LentItemForm {
  title: string;
  description?: string;
  category: ItemCategory;
  lent_to: string;
  lent_date: string;
  due_date?: string;
  notes?: string;
  image_url?: string;
}

export interface GroupForm {
  name: string;
  description?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Auth Types
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

// Filter and Sort Types
export interface ItemFilters {
  category?: ItemCategory;
  status?: BorrowStatus | LentStatus;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface SortOptions {
  field: 'title' | 'borrowed_date' | 'lent_date' | 'due_date' | 'created_at';
  direction: 'asc' | 'desc';
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Database Types (for Supabase)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      borrowed_items: {
        Row: BorrowedItem;
        Insert: Omit<BorrowedItem, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BorrowedItem, 'id' | 'created_at' | 'updated_at'>>;
      };
      lent_items: {
        Row: LentItem;
        Insert: Omit<LentItem, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<LentItem, 'id' | 'created_at' | 'updated_at'>>;
      };
      groups: {
        Row: Group;
        Insert: Omit<Group, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Group, 'id' | 'created_at' | 'updated_at'>>;
      };
      group_members: {
        Row: GroupMember;
        Insert: Omit<GroupMember, 'id'>;
        Update: Partial<Omit<GroupMember, 'id'>>;
      };
    };
  };
}
