import { supabase } from '@/lib/supabase';

// Types for groups and users
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  member_count?: number;
  user_role?: 'admin' | 'member';
  is_member?: boolean;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  is_active: boolean;
  joined_at: string;
  // Joined data
  user?: User;
  group?: Group;
}

export interface CreateGroupData {
  name: string;
  description?: string;
  is_public: boolean;
}

export interface UpdateGroupData extends Partial<CreateGroupData> {}

export interface GroupsFilters {
  search?: string;
  is_public?: boolean;
  my_groups_only?: boolean;
}

class GroupsService {
  // Ensure user profile exists in our users table
  async ensureUserProfile(): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        return { user: null, error: 'User not authenticated' };
      }

      // Check if user profile already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new users
        console.error('Error fetching user profile:', fetchError);
        return { user: null, error: fetchError.message };
      }

      if (existingUser) {
        return { user: existingUser, error: null };
      }

      // Create user profile
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.full_name || 
                  authUser.user_metadata?.name || 
                  authUser.email?.split('@')[0] || 
                  'User',
            avatar_url: authUser.user_metadata?.avatar_url,
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user profile:', insertError);
        return { user: null, error: insertError.message };
      }

      return { user: newUser, error: null };
    } catch (error) {
      console.error('Error in ensureUserProfile:', error);
      return { user: null, error: 'Failed to ensure user profile' };
    }
  }

  // Get all groups (simplified approach)
  async getGroups(filters?: GroupsFilters): Promise<{ data: Group[] | null; error: string | null }> {
    try {
      const { user } = await this.ensureUserProfile();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      // Simplified query - just get basic group info
      let query = supabase
        .from('groups')
        .select('*');

      // Apply basic filters
      if (filters?.is_public !== undefined) {
        query = query.eq('is_public', filters.is_public);
      }

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      query = query.order('created_at', { ascending: false });

      const { data: groups, error } = await query;

      if (error) {
        console.error('Error fetching groups:', error);
        return { data: null, error: error.message };
      }

      if (!groups) {
        return { data: [], error: null };
      }

      // Get user's memberships separately
      const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id, role, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Get member counts for each group
      const { data: memberCounts } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('is_active', true);

      // Process the data
      const processedData = groups
        .map(group => {
          const membership = memberships?.find(m => m.group_id === group.id);
          const memberCount = memberCounts?.filter(m => m.group_id === group.id).length || 0;
          
          return {
            ...group,
            member_count: memberCount,
            user_role: membership?.role as 'admin' | 'member' | undefined,
            is_member: !!membership,
          };
        })
        .filter(group => {
          // Apply membership filter
          if (filters?.my_groups_only) {
            return group.is_member;
          }
          // Show public groups or groups user is member of
          return group.is_public || group.is_member;
        });

      return { data: processedData, error: null };
    } catch (error) {
      console.error('Error in getGroups:', error);
      return { data: null, error: 'Failed to fetch groups' };
    }
  }

  // Get a single group by ID
  async getGroup(id: string): Promise<{ data: Group | null; error: string | null }> {
    try {
      const { user } = await this.ensureUserProfile();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_members(role, is_active, user_id),
          member_count:group_members(count)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching group:', error);
        return { data: null, error: error.message };
      }

      // Add user role and member status
      const processedData = {
        ...data,
        member_count: data.member_count?.[0]?.count || 0,
        user_role: data.group_members?.find((m: any) => m.user_id === user.id)?.role,
        is_member: data.group_members?.some((m: any) => m.user_id === user.id && m.is_active),
      };

      return { data: processedData, error: null };
    } catch (error) {
      console.error('Error in getGroup:', error);
      return { data: null, error: 'Failed to fetch group' };
    }
  }

  // Create a new group
  async createGroup(groupData: CreateGroupData): Promise<{ data: Group | null; error: string | null }> {
    try {
      const { user } = await this.ensureUserProfile();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      // Create the group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert([
          {
            ...groupData,
            created_by: user.id,
          }
        ])
        .select()
        .single();

      if (groupError) {
        console.error('Error creating group:', groupError);
        return { data: null, error: groupError.message };
      }

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([
          {
            group_id: group.id,
            user_id: user.id,
            role: 'admin',
            is_active: true,
          }
        ]);

      if (memberError) {
        console.error('Error adding creator as admin:', memberError);
        // Try to clean up the group
        await supabase.from('groups').delete().eq('id', group.id);
        return { data: null, error: memberError.message };
      }

      return { data: { ...group, user_role: 'admin', is_member: true, member_count: 1 }, error: null };
    } catch (error) {
      console.error('Error in createGroup:', error);
      return { data: null, error: 'Failed to create group' };
    }
  }

  // Update a group
  async updateGroup(id: string, updates: UpdateGroupData): Promise<{ data: Group | null; error: string | null }> {
    try {
      const { user } = await this.ensureUserProfile();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      // Check if user is admin of the group
      const { data: membership } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', id)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!membership || membership.role !== 'admin') {
        return { data: null, error: 'You must be an admin to update this group' };
      }

      const { data, error } = await supabase
        .from('groups')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating group:', error);
        return { data: null, error: error.message };
      }

      return { data: { ...data, user_role: 'admin', is_member: true }, error: null };
    } catch (error) {
      console.error('Error in updateGroup:', error);
      return { data: null, error: 'Failed to update group' };
    }
  }

  // Delete a group
  async deleteGroup(id: string): Promise<{ error: string | null }> {
    try {
      const { user } = await this.ensureUserProfile();
      if (!user) {
        return { error: 'User not authenticated' };
      }

      // Check if user is admin of the group
      const { data: membership } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', id)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!membership || membership.role !== 'admin') {
        return { error: 'You must be an admin to delete this group' };
      }

      // Delete group (cascade will handle members)
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting group:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Error in deleteGroup:', error);
      return { error: 'Failed to delete group' };
    }
  }

  // Get group members
  async getGroupMembers(groupId: string): Promise<{ data: GroupMember[] | null; error: string | null }> {
    try {
      const { user } = await this.ensureUserProfile();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          user:users(id, name, email, avatar_url)
        `)
        .eq('group_id', groupId)
        .eq('is_active', true)
        .order('joined_at', { ascending: false });

      if (error) {
        console.error('Error fetching group members:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getGroupMembers:', error);
      return { data: null, error: 'Failed to fetch group members' };
    }
  }

  // Join a group
  async joinGroup(groupId: string): Promise<{ error: string | null }> {
    try {
      const { user } = await this.ensureUserProfile();
      if (!user) {
        return { error: 'User not authenticated' };
      }

      // Check if group exists and is public
      const { data: group } = await supabase
        .from('groups')
        .select('is_public')
        .eq('id', groupId)
        .single();

      if (!group) {
        return { error: 'Group not found' };
      }

      if (!group.is_public) {
        return { error: 'This group is private and requires an invitation' };
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('is_active')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

      if (existingMember?.is_active) {
        return { error: 'You are already a member of this group' };
      }

      // Join the group
      const { error } = await supabase
        .from('group_members')
        .upsert([
          {
            group_id: groupId,
            user_id: user.id,
            role: 'member',
            is_active: true,
          }
        ]);

      if (error) {
        console.error('Error joining group:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Error in joinGroup:', error);
      return { error: 'Failed to join group' };
    }
  }

  // Leave a group
  async leaveGroup(groupId: string): Promise<{ error: string | null }> {
    try {
      const { user } = await this.ensureUserProfile();
      if (!user) {
        return { error: 'User not authenticated' };
      }

      // Check if user is the only admin
      const { data: admins } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId)
        .eq('role', 'admin')
        .eq('is_active', true);

      if (admins?.length === 1 && admins[0].user_id === user.id) {
        return { error: 'You cannot leave as the only admin. Transfer admin rights first or delete the group.' };
      }

      // Leave the group
      const { error } = await supabase
        .from('group_members')
        .update({ is_active: false })
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error leaving group:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Error in leaveGroup:', error);
      return { error: 'Failed to leave group' };
    }
  }

  // Get current user
  async getCurrentUser(): Promise<{ data: User | null; error: string | null }> {
    return this.ensureUserProfile();
  }

  // Search users for group invitations
  async searchUsers(query: string): Promise<{ data: User[] | null; error: string | null }> {
    try {
      const { user } = await this.ensureUserProfile();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, avatar_url')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .neq('id', user.id) // Exclude current user
        .limit(10);

      if (error) {
        console.error('Error searching users:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in searchUsers:', error);
      return { data: null, error: 'Failed to search users' };
    }
  }

  // Generate invite link for group (admin only)
  async generateInviteLink(groupId: string): Promise<{ data: string | null; error: string | null }> {
    try {
      const { user } = await this.ensureUserProfile();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      // Check if current user is admin of the group
      const { data: membership } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!membership || membership.role !== 'admin') {
        return { data: null, error: 'You must be an admin to generate invite links' };
      }

      // Create invite link with group ID
      const inviteLink = `${window.location.origin}/join-group/${groupId}`;
      return { data: inviteLink, error: null };
    } catch (error) {
      console.error('Error in generateInviteLink:', error);
      return { data: null, error: 'Failed to generate invite link' };
    }
  }

  // Join group via invite link
  async joinGroupViaInvite(groupId: string): Promise<{ data: Group | null; error: string | null }> {
    try {
      const { user } = await this.ensureUserProfile();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      // Check if group exists
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError || !group) {
        return { data: null, error: 'Group not found or invite link is invalid' };
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('is_active')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

      if (existingMember?.is_active) {
        return { data: null, error: 'You are already a member of this group' };
      }

      // Join the group
      const { error } = await supabase
        .from('group_members')
        .upsert([
          {
            group_id: groupId,
            user_id: user.id,
            role: 'member',
            is_active: true,
          }
        ]);

      if (error) {
        console.error('Error joining group via invite:', error);
        return { data: null, error: error.message };
      }

      // Return group data with membership info
      return { 
        data: { 
          ...group, 
          is_member: true, 
          user_role: 'member',
          member_count: (group.member_count || 0) + 1
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error in joinGroupViaInvite:', error);
      return { data: null, error: 'Failed to join group' };
    }
  }
}

export const groupsService = new GroupsService();
