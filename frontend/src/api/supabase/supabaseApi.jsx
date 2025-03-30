/*
 * Name: supabaseApi.jsx
 * 
 * Description: This file is the Supabase API used to get data from the Supabase database.
 * 
 * Video Tutorial: 
*/

import supabase from './supabase'

/*
 * Supabase Users Table API Functions
 */
export const usersApi = {
  // Create a new user
    create: async (userData) => {
      const { data: user, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
      return { data: user, error }
    },
    // Get all users
    getAll: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*, roles(*)')
      return { data, error }
    },
    // Get a user by ID
    getById: async (uid) => {
      const { data, error } = await supabase
        .from('users')
        .select('*, roles(*)')
        .eq('uid', uid)
        .single()
      return { data, error }
    },
    // Get a user by card ID
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
    // Update a user
    update: async (uid, updates) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('uid', uid)
        .select()
      return { data, error }
    },
    // Delete a user
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
  // Create a new role
  create: async (data) => {
    const { data: role, error } = await supabase
      .from('roles')
      .insert([data])
      .select()
    return { data: role, error }
  },
  // Get all roles
  getAll: async () => {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
    return { data, error }
  },
  // Get a role by ID
  getById: async (roleId) => {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('role_id', roleId)
      .single()
    return { data, error }
  },
  // Update a role
  update: async (roleId, updates) => {
    const { data, error } = await supabase
      .from('roles')
      .update(updates)
      .eq('role_id', roleId)
      .select()
    return { data, error }
  },
  // Delete a role
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
  // Create a new device
  create: async (data) => {
    const { data: device, error } = await supabase
      .from('devices')
      .insert([data])
      .select()
    return { data: device, error }
  },
  // Get all devices
  getAll: async () => {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
    return { data, error }
  },
  // Get a device by ID
  getById: async (deviceId) => {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('device_id', deviceId)
      .single()
    return { data, error }
  },
  // Update a device
  update: async (deviceId, updates) => {
    const { data, error } = await supabase
      .from('devices')
      .update(updates)
      .eq('device_id', deviceId)
      .select()
    return { data, error }
  },
  // Delete a device
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
  // Get all records
  getAll: async () => {
    const { data, error } = await supabase
      .from('role_to_device')
      .select('*')
    return { data, error }
  },
  // Assign a device to a role
  assign: async (roleId, deviceId) => {
    const { data, error } = await supabase
      .from('role_to_device')
      .insert([{ role_id: roleId, device_id: deviceId }])
      .select()
    return { data, error }
  },
  // Get all devices assigned to a role
  getDevicesByRole: async (roleId) => {
    const { data, error } = await supabase
      .from('role_to_device')
      .select('devices(*)')
      .eq('role_id', roleId)
    return { data, error }
  },
  // Get all roles assigned to a device
  getRolesByDevice: async (deviceId) => {
    const { data, error } = await supabase
      .from('role_to_device')
      .select('roles(*)')
      .eq('device_id', deviceId)
    return { data, error }
  },
  // Unassign a device from a role
  unassign: async (roleId, deviceId) => {
    const { error } = await supabase
      .from('role_to_device')
      .delete()
      .match({ role_id: roleId, device_id: deviceId })
    return { error }
  }
}

/*
 * Supabase Function API Functions
 */
export const functionApi = {
  // Invoke a function with the given name and parameters
  invoke: async (functionName, params) => {
    const { data: response, error } = await supabase
      .rpc(functionName, params)
    return { data: response, error }
  }
}


/*
 * Supabase Access Logs Table API Functions
 */
export const accessLogsApi = {
  // Create a new record
  create: async (logData) => {
    const { data, error } = await supabase
      .from('access_logs')
      .insert([logData])
      .select()
    return { data, error }
  },
  // Get all access logs
  getAll: async () => {
    const { data, error } = await supabase
      .from('access_logs')
      .select('*, users(*)')
      .order('created_at', { ascending: false })
    return { data, error }
  },
  // Get access logs for a specific user
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
  // Create a new record
  create: async (logData) => {
    const { data, error } = await supabase
      .from('device_logs')
      .insert([logData])
      .select()
    return { data, error }
  },
  // Get all device logs
  getAll: async () => {
    const { data, error } = await supabase
      .from('device_logs')
      .select('*, devices(*), users(*)')
      .order('created_at', { ascending: false })
    return { data, error }
  },
  // Get device logs for a specific device
  getByDeviceId: async (deviceId) => {
    const { data, error } = await supabase
      .from('device_logs')
      .select('*, users(*)')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false })
    return { data, error }
  },
  // Get device logs for a specific user
  getByUserId: async (userId) => {
    const { data, error } = await supabase
      .from('device_logs')
      .select('*, devices(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  }
}

/*
 * Supabase Failed Attempts Table API Functions
 */
export const failedAttemptsApi = {
  // Create a new record for a user
  create: async (userId) => {
    const { data, error } = await supabase
      .from('failed_attempts')
      .insert([{ user_id: userId, failed: 1 }])
      .select()
    return { data, error }
  },  
  // Get all failed attempts records
  getAll: async () => {
    const { data, error } = await supabase
      .from('failed_attempts')
      .select('*, users(*)')
    return { data, error }
  },  
  // Get failed attempts for a specific user
  getByUserId: async (userId) => {
    const { data, error } = await supabase
      .from('failed_attempts')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    return { data, error }
  },  
  // Update failed attempts for a user (increment by 1)
  incrementFailedAttempts: async (userId) => {
    // First check if the user already has a record
    const { data: existingRecord, error: checkError } = await supabase
      .from('failed_attempts')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        // Record not found, create a new one
        return await failedAttemptsApi.create(userId)
      }
      return { data: null, error: checkError }
    }
    
    // Record exists, increment the failed count
    const newFailedCount = existingRecord.failed + 1

    const { data, error } = await supabase
      .from('failed_attempts')
      .update({ failed: newFailedCount })
      .eq('user_id', userId)
      .select()

    // If failed attempts reach 3, disable the user
    if (newFailedCount >= 3) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .update({ status: 'Disabled' })
        .eq('uid', userId)
        .select()
      
      if (userError) {
        console.error('Error disabling user:', userError)
      }
    }
    
    return { data, error }
  },  
  // Reset failed attempts for a user
  resetFailedAttempts: async (userId) => {
    const { data, error } = await supabase
      .from('failed_attempts')
      .update({ failed: 0 })
      .eq('user_id', userId)
      .select()
    
    return { data, error }
  },  
  // Update with a specific value
  update: async (userId, failedCount) => {
    const { data, error } = await supabase
      .from('failed_attempts')
      .update({ failed: failedCount })
      .eq('user_id', userId)
      .select()
    
    return { data, error }
  },
  // Delete failed attempts record for a user
  delete: async (userId) => {
    const { error } = await supabase
      .from('failed_attempts')
      .delete()
      .eq('user_id', userId)
    
    return { error }
  }
}
