import { options } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import React from "react";
import CalendarContent from "./CalendarContent";
import UnAuthorize from "../UnAuthorize";

const CalendarManage = async () => {
  //get the user
  const session = await getServerSession(options);
  const user = session?.user || null;

  return (
    // if user is not admin show unauthorized
    user && user.role === "admin" ? (
      <div>
        <h1>Calendar Manage</h1>
        <CalendarContent
          user={
            user
              ? {
                  name: user.name ?? "",
                  email: user.email ?? "",
                  id: user.id ?? "",
                  role: user.role ?? "",
                }
              : { name: "", email: "", id: "", role: "" }
          }
        />
      </div>
    ) : (
      <UnAuthorize user />
    )
  );
};

export default CalendarManage;
