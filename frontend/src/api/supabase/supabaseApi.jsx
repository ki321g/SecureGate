/*
 * Name: supabaseApi.jsx
 * 
 * Description: This file is the Supabase API used to get data from the Supabase database.
 * 
 * Video Tutorial: 
*/

/*
import { usersApi, devicesApi } from './api/supabase/supabaseApi'
const allUsers = await usersApi.getAll()
// Example usage:
const { data: users, error } = await usersApi.getAll()
*/

import supabase from './supabase'


/*
 * Supabase Users Table API Functions
 */
export const usersApi = {
    create: async (userData) => {
      const { data: user, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
      return { data: user, error }
    },
    getAll: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*, roles(*)')
      return { data, error }
    },
    getById: async (uid) => {
      const { data, error } = await supabase
        .from('users')
        .select('*, roles(*)')
        .eq('uid', uid)
        .single()
      return { data, error }
    },
    getByCardId: async (card_id) => {
      console.log('getByCardId card_id:', card_id)
      const { data, error } = await supabase
        .from('users')
        .select('*, roles(*)')
        .eq('card_id', card_id)
        .single()
      console.log('getByCardId data:', data)
      return { data, error }
    },
    update: async (uid, updates) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('uid', uid)
        .select()
      return { data, error }
    },
    delete: async (uid) => {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('uid', uid)
      return { error }
    }
  }

/*
 *  Supabase Roles Table API Functions
 */
export const rolesApi = {
  create: async (data) => {
    const { data: role, error } = await supabase
      .from('roles')
      .insert([data])
      .select()
    return { data: role, error }
  },
  getAll: async () => {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
    return { data, error }
  },
  getById: async (roleId) => {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('role_id', roleId)
      .single()
    return { data, error }
  },
  update: async (roleId, updates) => {
    const { data, error } = await supabase
      .from('roles')
      .update(updates)
      .eq('role_id', roleId)
      .select()
    return { data, error }
  },
  delete: async (roleId) => {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('role_id', roleId)
    return { error }
  }
}

/*
 *  Supabase Devices Table API Functions
 */
export const devicesApi = {
  create: async (data) => {
    const { data: device, error } = await supabase
      .from('devices')
      .insert([data])
      .select()
    return { data: device, error }
  },
  getAll: async () => {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
    return { data, error }
  },
  getById: async (deviceId) => {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('device_id', deviceId)
      .single()
    return { data, error }
  },
  update: async (deviceId, updates) => {
    const { data, error } = await supabase
      .from('devices')
      .update(updates)
      .eq('device_id', deviceId)
      .select()
    return { data, error }
  },
  delete: async (deviceId) => {
    const { error } = await supabase
      .from('devices')
      .delete()
      .eq('device_id', deviceId)
    return { error }
  }
}

/*
 * Supabase Role to Device Table API Functions
 */
export const roleToDeviceApi = {
  assign: async (roleId, deviceId) => {
    const { data, error } = await supabase
      .from('role_to_device')
      .insert([{ role_id: roleId, device_id: deviceId }])
      .select()
    return { data, error }
  },
  getDevicesByRole: async (roleId) => {
    const { data, error } = await supabase
      .from('role_to_device')
      .select('devices(*)')
      .eq('role_id', roleId)
    return { data, error }
  },
  unassign: async (roleId, deviceId) => {
    const { error } = await supabase
      .from('role_to_device')
      .delete()
      .match({ role_id: roleId, device_id: deviceId })
    return { error }
  }
}

/*
 * Supabase Access Logs Table API Functions
 */
export const accessLogsApi = {
  create: async (logData) => {
    const { data, error } = await supabase
      .from('access_logs')
      .insert([logData])
      .select()
    return { data, error }
  },
  getAll: async () => {
    const { data, error } = await supabase
      .from('access_logs')
      .select('*, users(*)')
      .order('created_at', { ascending: false })
    return { data, error }
  },
  getByUserId: async (userId) => {
    const { data, error } = await supabase
      .from('access_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  }
}

/*
 * Supabase Device Logs Table API Functions
 */
export const deviceLogsApi = {
  create: async (logData) => {
    const { data, error } = await supabase
      .from('device_logs')
      .insert([logData])
      .select()
    return { data, error }
  },
  getAll: async () => {
    const { data, error } = await supabase
      .from('device_logs')
      .select('*, devices(*), users(*)')
      .order('created_at', { ascending: false })
    return { data, error }
  },
  getByDeviceId: async (deviceId) => {
    const { data, error } = await supabase
      .from('device_logs')
      .select('*, users(*)')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false })
    return { data, error }
  },
  getByUserId: async (userId) => {
    const { data, error } = await supabase
      .from('device_logs')
      .select('*, devices(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  }
}
