const RECENT_LIMIT = 10;

export async function fetchNotifications(client, userId) {
  if (!userId) return { items: [], unread: 0, error: null };

  const [list, unread] = await Promise.all([
    client
      .from("notifications")
      .select("id, title, message, is_read, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(RECENT_LIMIT),
    client
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false),
  ]);

  return {
    items: list.data ?? [],
    unread: unread.count ?? 0,
    error: list.error ?? unread.error ?? null,
  };
}
