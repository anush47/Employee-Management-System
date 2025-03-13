"use client";
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
      const response = await fetch(
        "/api/calendar/holidays?startDate=2025-01-01&endDate=2025-12-31"
      );
      const data = await response.json();
      console.log(data);
    };

    fetchHolidays();
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
