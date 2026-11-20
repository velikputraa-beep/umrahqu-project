import { createClient } from "./server";

export async function fetchTableData(tableName) {
  const supabase = await createClient();
  const { data, error } = await supabase.from(tableName).select("*");
  if (error) {
    throw new Error(`Supabase query failed [${tableName}]: ${error.message}`);
  }
  return data ?? [];
}

export async function fetchSingleRecord(tableName, column, value) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .eq(column, value)
    .maybeSingle();
  if (error) {
    throw new Error(`Supabase query failed [${tableName}]: ${error.message}`);
  }
  return data;
}
