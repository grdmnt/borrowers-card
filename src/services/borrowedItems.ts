import { supabase } from '@/lib/supabase';
import { groupsService } from './groups';

// Types for borrowed items (shared by both borrower and lender)
export interface BorrowedItem {
  id: string;
  user_id: string;          // The person who borrowed the item
  lender_user_id: string;   // The person who lent the item
  group_id?: string;
  name: string;
  description?: string;
  status: 'active' | 'returned' | 'overdue';
  borrowed_from_name: string;  // Display name of lender
  borrowed_date: string;
  due_date?: string;
  returned_date?: string;
  notes?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBorrowedItemData {
  name: string;
  description?: string;
  borrowed_from_name: string;
  borrowed_date: string;
  due_date?: string;
  notes?: string;
  group_id?: string;
}

export interface UpdateBorrowedItemData extends Partial<CreateBorrowedItemData> {
  status?: BorrowedItem['status'];
  returned_date?: string;
}

export interface BorrowedItemsFilters {
  status?: BorrowedItem['status'][];
  search?: string;
  overdue?: boolean;
  group_id?: string;
}

export interface BorrowedItemsSort {
  field: keyof BorrowedItem;
  direction: 'asc' | 'desc';
}

class BorrowedItemsService {
  // Helper method to determine user's perspective on an item
  getUserPerspective(item: BorrowedItem, userId: string): 'borrower' | 'lender' | null {
    if (item.user_id === userId) return 'borrower';
    if (item.lender_user_id === userId) return 'lender';
    return null;
  }
  // Get all borrowed items for the current user (as borrower or lender)
  async getBorrowedItems(filters?: BorrowedItemsFilters, sort?: BorrowedItemsSort): Promise<{ data: BorrowedItem[] | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      let query = supabase
        .from('borrowed_items')
        .select('*')
        .or(`user_id.eq.${user.id},lender_user_id.eq.${user.id}`);

      // Apply filters
      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,borrowed_from_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.overdue) {
        const today = new Date().toISOString().split('T')[0];
        query = query
          .eq('status', 'active')
          .not('due_date', 'is', null)
          .lt('due_date', today);
      }

      if (filters?.group_id) {
        query = query.eq('group_id', filters.group_id);
      }

      // Apply sorting
      if (sort?.field && sort?.direction) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching borrowed items:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getBorrowedItems:', error);
      return { data: null, error: 'Failed to fetch borrowed items' };
    }
  }

  // Get a single borrowed item by ID
  async getBorrowedItem(id: string): Promise<{ data: BorrowedItem | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('borrowed_items')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching borrowed item:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getBorrowedItem:', error);
      return { data: null, error: 'Failed to fetch borrowed item' };
    }
  }

  // Create a new borrowed item
  async createBorrowedItem(itemData: CreateBorrowedItemData): Promise<{ data: BorrowedItem | null; error: string | null }> {
    try {
      // Ensure user profile exists first
      const { user, error: profileError } = await groupsService.ensureUserProfile();
      if (profileError || !user) {
        return { data: null, error: profileError || 'User not authenticated' };
      }

      // Find the lender's user ID by name from group members
      const { data: groupMembers } = await groupsService.getAllGroupMembers();
      const lender = groupMembers?.find(member => member.name === itemData.borrowed_from_name);
      
      if (!lender) {
        return { data: null, error: 'Lender not found in your groups' };
      }

      // Create the borrowed item
      const { data: borrowedItem, error } = await supabase
        .from('borrowed_items')
        .insert([
          {
            ...itemData,
            user_id: user.id,
            lender_user_id: lender.id,
            status: 'active' as const,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating borrowed item:', error);
        return { data: null, error: error.message };
      }


      return { data: borrowedItem, error: null };
    } catch (error) {
      console.error('Error in createBorrowedItem:', error);
      return { data: null, error: 'Failed to create borrowed item' };
    }
  }

  // Update a borrowed item
  async updateBorrowedItem(id: string, updates: UpdateBorrowedItemData): Promise<{ data: BorrowedItem | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('borrowed_items')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating borrowed item:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in updateBorrowedItem:', error);
      return { data: null, error: 'Failed to update borrowed item' };
    }
  }

  // Delete a borrowed item
  async deleteBorrowedItem(id: string): Promise<{ error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('borrowed_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting borrowed item:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Error in deleteBorrowedItem:', error);
      return { error: 'Failed to delete borrowed item' };
    }
  }

  // Mark item as returned
  async returnBorrowedItem(id: string): Promise<{ data: BorrowedItem | null; error: string | null }> {
    return this.updateBorrowedItem(id, {
      status: 'returned',
      returned_date: new Date().toISOString().split('T')[0]
    });
  }

  // Mark item as lost
  async markItemAsLost(id: string): Promise<{ data: BorrowedItem | null; error: string | null }> {
    return this.updateBorrowedItem(id, {
      status: 'lost'
    });
  }

  // Get overdue items count
  async getOverdueCount(): Promise<{ count: number; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { count: 0, error: 'User not authenticated' };
      }

      const today = new Date().toISOString().split('T')[0];
      
      const { count, error } = await supabase
        .from('borrowed_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active')
        .lt('due_date', today);

      if (error) {
        console.error('Error getting overdue count:', error);
        return { count: 0, error: error.message };
      }

      return { count: count || 0, error: null };
    } catch (error) {
      console.error('Error in getOverdueCount:', error);
      return { count: 0, error: 'Failed to get overdue count' };
    }
  }

  // Get items by status
  async getItemsByStatus(status: BorrowedItem['status']): Promise<{ data: BorrowedItem[] | null; error: string | null }> {
    return this.getBorrowedItems({ status: [status] });
  }

  // Get items due soon (within next 7 days)
  async getItemsDueSoon(): Promise<{ data: BorrowedItem[] | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const { data, error } = await supabase
        .from('borrowed_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('due_date', today.toISOString().split('T')[0])
        .lte('due_date', nextWeek.toISOString().split('T')[0])
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching items due soon:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getItemsDueSoon:', error);
      return { data: null, error: 'Failed to fetch items due soon' };
    }
  }
}

export const borrowedItemsService = new BorrowedItemsService();
