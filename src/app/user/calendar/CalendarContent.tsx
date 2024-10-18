"user client";
import React from "react";

const CalendarContent = ({
  user: { name, email, id, role },
}: {
  user: {
    name: string;
    email: string;
    id: string;
    role: string;
  };
}) => {
  return (
    <div>
      <p>Name: {name}</p>
      <p>Email: {email}</p>
      <p>ID: {id}</p>
      <p>Role: {role}</p>
    </div>
  );
};

export default CalendarContent;
