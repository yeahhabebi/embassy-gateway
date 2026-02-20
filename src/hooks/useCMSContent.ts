import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCMSContent(keys: string[]) {
  const sortedKey = keys.slice().sort().join(",");

  const { data: content = {}, isLoading: loading } = useQuery({
    queryKey: ["cms_content", sortedKey],
    queryFn: async () => {
      const { data } = await supabase
        .from("cms_content")
        .select("key, content")
        .in("key", keys);

      const map: Record<string, string> = {};
      data?.forEach((item) => {
        map[item.key] = item.content;
      });
      return map;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });

  const get = (key: string, fallback: string) => content[key] || fallback;

  return { content, get, loading };
}
