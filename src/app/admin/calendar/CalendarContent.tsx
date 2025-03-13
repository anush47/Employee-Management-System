"user client";
import React, { useEffect } from "react";

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
  useEffect(() => {
    const fetchHolidays = async () => {
      const response = await fetch("/api/holidays");
      const data = await response.json();
      console.log(data);
    };
  }, []);

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
