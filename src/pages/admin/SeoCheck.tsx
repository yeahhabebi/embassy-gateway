import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";

const PAGES = [
  { path: "/about", label: "About" },
  { path: "/services", label: "Services" },
  { path: "/requirements", label: "Requirements" },
  { path: "/contact", label: "Contact" },
];

type Result = {
  path: string;
  status: "pending" | "running" | "ok" | "fail";
  faqCount?: number;
  questions?: number;
  error?: string;
};

export default function SeoCheck() {
  const [results, setResults] = useState<Result[]>(
    PAGES.map((p) => ({ path: p.path, status: "pending" }))
  );
  const [running, setRunning] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const checkPage = (path: string): Promise<Result> =>
    new Promise((resolve) => {
      const iframe = frameRef.current;
      if (!iframe) {
        resolve({ path, status: "fail", error: "Iframe unavailable" });
        return;
      }

      const timeout = setTimeout(() => {
        iframe.onload = null;
        resolve({ path, status: "fail", error: "Timeout loading page" });
      }, 15000);

      iframe.onload = () => {
        // Wait a beat for react-helmet to inject tags
        setTimeout(() => {
          try {
            const doc = iframe.contentDocument;
            if (!doc) throw new Error("Cannot access iframe document");
            const scripts = doc.querySelectorAll<HTMLScriptElement>(
              'script[type="application/ld+json"]'
            );
            let faqCount = 0;
            let questions = 0;
            scripts.forEach((s) => {
              try {
                const parsed = JSON.parse(s.textContent || "");
                const nodes = Array.isArray(parsed) ? parsed : [parsed];
                nodes.forEach((node: any) => {
                  if (node?.["@type"] === "FAQPage") {
                    faqCount++;
                    const entities = Array.isArray(node.mainEntity)
                      ? node.mainEntity
                      : [];
                    entities.forEach((q: any) => {
                      if (
                        q?.["@type"] === "Question" &&
                        q?.name &&
                        q?.acceptedAnswer?.text
                      ) {
                        questions++;
                      }
                    });
                  }
                });
              } catch {
                /* skip invalid JSON */
              }
            });
            clearTimeout(timeout);
            iframe.onload = null;
            if (faqCount > 0 && questions > 0) {
              resolve({ path, status: "ok", faqCount, questions });
            } else {
              resolve({
                path,
                status: "fail",
                faqCount,
                questions,
                error: "No valid FAQPage schema found",
              });
            }
          } catch (e: any) {
            clearTimeout(timeout);
            iframe.onload = null;
            resolve({ path, status: "fail", error: e.message });
          }
        }, 1200);
      };

      // Cache-bust to ensure fresh render
      iframe.src = `${path}?seo-check=${Date.now()}`;
    });

  const runAll = async () => {
    setRunning(true);
    const next: Result[] = PAGES.map((p) => ({ path: p.path, status: "pending" }));
    setResults(next);
    for (let i = 0; i < PAGES.length; i++) {
      next[i] = { ...next[i], status: "running" };
      setResults([...next]);
      const r = await checkPage(PAGES[i].path);
      next[i] = r;
      setResults([...next]);
    }
    setRunning(false);
  };

  const allOk = results.every((r) => r.status === "ok");
  const anyFail = results.some((r) => r.status === "fail");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-primary">SEO Schema Check</h1>
          <p className="text-muted-foreground mt-1">
            Validates FAQPage JSON-LD is present on key pages.
          </p>
        </div>
        <Button onClick={runAll} disabled={running}>
          {running ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {running ? "Checking..." : "Run Check"}
        </Button>
      </div>

      {!running && results.some((r) => r.status !== "pending") && (
        <Card className={`p-4 ${allOk ? "border-emerald-500" : anyFail ? "border-destructive" : ""}`}>
          <div className="flex items-center gap-2">
            {allOk ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="font-medium">All pages serve valid FAQPage schema.</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-destructive" />
                <span className="font-medium">Some pages are missing valid FAQPage schema.</span>
              </>
            )}
          </div>
        </Card>
      )}

      <div className="grid gap-3">
        {results.map((r) => {
          const page = PAGES.find((p) => p.path === r.path)!;
          return (
            <Card key={r.path} className="p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  {r.status === "ok" && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                  {r.status === "fail" && <XCircle className="h-5 w-5 text-destructive" />}
                  {r.status === "running" && (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  )}
                  {r.status === "pending" && (
                    <div className="h-5 w-5 rounded-full border-2 border-muted" />
                  )}
                  <div>
                    <div className="font-medium">
                      {page.label}{" "}
                      <span className="text-muted-foreground text-sm">{r.path}</span>
                    </div>
                    {r.status === "ok" && (
                      <div className="text-sm text-muted-foreground">
                        {r.faqCount} FAQPage block · {r.questions} questions
                      </div>
                    )}
                    {r.status === "fail" && (
                      <div className="text-sm text-destructive">{r.error}</div>
                    )}
                  </div>
                </div>
                <Badge
                  variant={
                    r.status === "ok"
                      ? "default"
                      : r.status === "fail"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {r.status.toUpperCase()}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Hidden iframe used for inspection */}
      <iframe
        ref={frameRef}
        title="seo-check-frame"
        sandbox="allow-same-origin allow-scripts"
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
