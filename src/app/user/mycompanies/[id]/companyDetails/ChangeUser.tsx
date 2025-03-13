import { Autocomplete, TextField } from "@mui/material";
import { useEffect, useState } from "react";

const ChangeUser = ({
  isEditing,
  user,
  setUser,
}: {
  isEditing: boolean;
  user: string;
  setUser: (user: string) => void;
}) => {
  const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        data.users.forEach((_user: any) => {
          _user.id = _user._id;
        });
        setUsers(
          data.users.map((user: any) => ({
            value: user.id,
            label: user.name + " - " + user.email,
          }))
        );
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e: any, newValue: any) => {
    if (newValue !== null && newValue.value !== null) setUser(newValue.value);
  };

  return (
    <Autocomplete
      disablePortal
      autoComplete
      options={users}
      onChange={handleChange}
      value={users.find((_user) => _user.value === user) || null}
      clearIcon={null}
      readOnly={!isEditing}
      renderInput={(params) => <TextField {...params} label="User" />}
    />
  );
};

export default ChangeUser;
