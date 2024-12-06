import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserEdit = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/v1/users/${userId}`);
        setUser(response.data);
      } catch (err) {
        setError(err.response ? err.response.data.message : err.message);
      }
    };

    fetchUser();
  }, [userId]);

  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>Edit User</h1>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      {/* Add form for editing user details */}
    </div>
  );
};

export default UserEdit;