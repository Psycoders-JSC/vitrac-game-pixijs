import {
  getSupabase,
  initSupabaseClient,
  isSupabaseConfigured,
} from "../../engine/supabase/supabase";

export interface LeaderboardEntry {
  player_name: string;
  player_phone?: string;
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
    .select("player_name, player_phone, score")
    .gt("score", 0)
    .order("score", { ascending: false })
    .limit(limit);
  if (error) {
    console.warn("Failed to fetch leaderboard:", error);
    return [];
  }
  return (data ?? []).filter((e) => e.score > 0);
}

export async function saveScore(
  playerName: string,
  score: number,
  playerPhone?: string,
): Promise<boolean> {
  if (!playerName?.trim()) return false;
  if (score <= 0) return false;
  const client = initSupabaseClient();
  if (!client) {
    return false;
  }
  const payload: { player_name: string; score: number; player_phone?: string } =
    {
      player_name: playerName.trim(),
      score,
    };
  const phone = playerPhone?.trim();
  if (phone) payload.player_phone = phone;
  const { error } = await client.from("high_scores").insert(payload);
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
