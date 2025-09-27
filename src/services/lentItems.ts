import { supabase } from '@/lib/supabase';

// Types for Lent Items
export interface LentItem {
  id: string;
  name: string;
  description?: string;
  lent_to_name: string;
  lent_date: string;
  due_date?: string;
  returned_date?: string;
  notes?: string;
  status: 'active' | 'returned' | 'overdue';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLentItemData {
  name: string;
  description?: string;
  lent_to_name: string;
  lent_date: string;
  due_date?: string;
  notes?: string;
}

export interface UpdateLentItemData {
  name?: string;
  description?: string;
  lent_to_name?: string;
  lent_date?: string;
  due_date?: string;
  notes?: string;
  status?: 'active' | 'returned' | 'overdue';
}

export interface LentItemsFilters {
  status?: 'active' | 'returned' | 'overdue';
  search?: string;
  overdue_only?: boolean;
}

class LentItemsService {
  // Get all lent items for the current user
  async getLentItems(filters?: LentItemsFilters): Promise<{ data: LentItem[] | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      let query = supabase
        .from('lent_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,lent_to_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.overdue_only) {
        const today = new Date().toISOString().split('T')[0];
        query = query
          .eq('status', 'active')
          .not('due_date', 'is', null)
          .lt('due_date', today);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching lent items:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getLentItems:', error);
      return { data: null, error: 'Failed to fetch lent items' };
    }
  }

  // Get a single lent item by ID
  async getLentItem(id: string): Promise<{ data: LentItem | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('lent_items')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching lent item:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getLentItem:', error);
      return { data: null, error: 'Failed to fetch lent item' };
    }
  }

  // Create a new lent item
  async createLentItem(itemData: CreateLentItemData): Promise<{ data: LentItem | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      // Calculate status based on due date
      let status: 'active' | 'overdue' = 'active';
      if (itemData.due_date) {
        const today = new Date();
        const dueDate = new Date(itemData.due_date);
        if (dueDate < today) {
          status = 'overdue';
        }
      }

      const { data, error } = await supabase
        .from('lent_items')
        .insert([
          {
            ...itemData,
            user_id: user.id,
            status
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating lent item:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in createLentItem:', error);
      return { data: null, error: 'Failed to create lent item' };
    }
  }

  // Update a lent item
  async updateLentItem(id: string, updates: UpdateLentItemData): Promise<{ data: LentItem | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      // If updating due_date, recalculate status
      if (updates.due_date !== undefined && updates.status !== 'returned') {
        const today = new Date();
        const dueDate = new Date(updates.due_date);
        if (dueDate < today) {
          updates.status = 'overdue';
        } else {
          updates.status = 'active';
        }
      }

      const { data, error } = await supabase
        .from('lent_items')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating lent item:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in updateLentItem:', error);
      return { data: null, error: 'Failed to update lent item' };
    }
  }

  // Mark item as returned
  async returnLentItem(id: string): Promise<{ data: LentItem | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('lent_items')
        .update({
          status: 'returned',
          returned_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error returning lent item:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in returnLentItem:', error);
      return { data: null, error: 'Failed to return lent item' };
    }
  }

  // Delete a lent item
  async deleteLentItem(id: string): Promise<{ error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('lent_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting lent item:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Error in deleteLentItem:', error);
      return { error: 'Failed to delete lent item' };
    }
  }

  // Get statistics for lent items
  async getLentItemsStats(): Promise<{ 
    data: { 
      total: number; 
      active: number; 
      returned: number; 
      overdue: number; 
    } | null; 
    error: string | null 
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('lent_items')
        .select('status')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching lent items stats:', error);
        return { data: null, error: error.message };
      }

      const stats = {
        total: data.length,
        active: data.filter(item => item.status === 'active').length,
        returned: data.filter(item => item.status === 'returned').length,
        overdue: data.filter(item => item.status === 'overdue').length,
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error in getLentItemsStats:', error);
      return { data: null, error: 'Failed to fetch lent items statistics' };
    }
  }
}

export const lentItemsService = new LentItemsService();
export default lentItemsService;
