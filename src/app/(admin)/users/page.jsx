import React from "react";
import UsersClient from "./UsersClient";
import { fetchTableData } from "@/lib/supabase/data";

export const metadata = {
  title: "Pengguna",
};

export default async function UsersPage() {
  const users = await fetchTableData("users");
  return <UsersClient initialUsers={users} />;
}
