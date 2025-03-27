import React, { useEffect, useState } from 'react';
import { usersApi } from '../api/supabase/supabaseApi';

const TestPage = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const uid = "2acc7f56-469b-4b71-94ec-4620e94415f9";
        console.log('Fetching user with UID:', uid);
        
        const { data, error } = await usersApi.getById(uid);
        
        
        if (error) {
          console.error('Error fetching user:', error);
          setError(error);
        } else {
          console.log('User data returned:', data);
          setUser(data);

          
          // // Display alert with user's role name
          // if (data && data.roles && data.roles.role_name) {
          //   alert(`User Role: ${data.roles.role_name}`);
          // } else {
          //   alert('User role information not available');
          // }
        }
      } catch (err) {
        console.error('Exception when fetching user:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <div>
      <h2>User Fetcher</h2>
      {loading && <p>Loading user data...</p>}
      {error && <p>Error: {error.message}</p>}
      {user && (
        <div>
          <p>User found! Check console for details.</p>
          {user.roles && <p><strong>Role:</strong> {user.roles.role_name}</p>}
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </div>
      )}
    </div>
    // <div>
    //   <h2>User Fetcher</h2>
    //   {loading && <p>Loading user data...</p>}
    //   {error && <p>Error: {error.message}</p>}
    //   {user && (
    //     <div>
    //       <p>User found! Check console for details.</p>
    //       <pre>{JSON.stringify(user, null, 2)}</pre>
    //     </div>
    //   )}
    // </div>
  );
};

export default TestPage;
