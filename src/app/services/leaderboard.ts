import {
  getSupabase,
  initSupabaseClient,
  isSupabaseConfigured,
} from "../../engine/supabase/supabase";

export interface LeaderboardEntry {
  player_name: string;
  score: number;
}

export async function fetchLeaderboard(
  limit = 100,
): Promise<LeaderboardEntry[]> {
  const client = initSupabaseClient();
  if (!client) {
    return [];
  }
  const { data, error } = await client
    .from("high_scores")
    .select("player_name, score")
    .order("score", { ascending: false })
    .limit(limit);
  if (error) {
    console.warn("Failed to fetch leaderboard:", error);
    return [];
  }
  return data ?? [];
}

export async function saveScore(
  playerName: string,
  score: number,
): Promise<boolean> {
  if (!playerName?.trim()) return false;
  const client = initSupabaseClient();
  if (!client) {
    return false;
  }
  const { error } = await client.from("high_scores").insert({
    player_name: playerName.trim(),
    score,
  });
  if (error) {
    console.warn("Failed to save score:", error);
    return false;
  }
  return true;
}

export function isLeaderboardAvailable(): boolean {
  return isSupabaseConfigured();
}

export function getSupabaseClient() {
  return getSupabase();
}
