import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useCMSContent(keys: string[]) {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("cms_content")
        .select("key, content")
        .in("key", keys);

      if (data) {
        const map: Record<string, string> = {};
        data.forEach((item) => {
          map[item.key] = item.content;
        });
        setContent(map);
      }
      setLoading(false);
    };
    load();
  }, []);

  const get = (key: string, fallback: string) => content[key] || fallback;

  return { content, get, loading };
}
