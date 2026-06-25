import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Check, ExternalLink, Globe, Loader2, X, RefreshCw, History, Trash2, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const LOVABLE_IP = "185.158.133.1";
const TXT_NAME = "_lovable";
const TXT_VALUE = "lovable_verify=ABC";

const PROVIDERS: Record<string, { label: string; url: string; rootName: string; wwwName: string; txtName: string; notes: string }> = {
  spaceship:   { label: "Spaceship",   url: "https://www.spaceship.com/application/login/", rootName: "@",   wwwName: "www", txtName: "_lovable", notes: "Advanced DNS → Add new record." },
  godaddy:     { label: "GoDaddy",     url: "https://dcc.godaddy.com/control/portfolio",     rootName: "@",   wwwName: "www", txtName: "_lovable", notes: "DNS Management → Add." },
  namecheap:   { label: "Namecheap",   url: "https://ap.www.namecheap.com/Domains/DomainControlPanel", rootName: "@", wwwName: "www", txtName: "_lovable", notes: "Advanced DNS tab → Add New Record." },
  cloudflare:  { label: "Cloudflare",  url: "https://dash.cloudflare.com/",                  rootName: "@",   wwwName: "www", txtName: "_lovable", notes: "Set proxy to DNS only (grey cloud). Or use Proxy Mode in Lovable." },
  google:      { label: "Google Domains / Squarespace", url: "https://domains.squarespace.com/", rootName: "@", wwwName: "www", txtName: "_lovable", notes: "DNS → Custom records." },
  hostinger:   { label: "Hostinger",   url: "https://hpanel.hostinger.com/",                 rootName: "@",   wwwName: "www", txtName: "_lovable", notes: "DNS / Nameservers → Manage DNS records." },
  bluehost:    { label: "Bluehost",    url: "https://my.bluehost.com/",                      rootName: "@",   wwwName: "www", txtName: "_lovable", notes: "Domains → DNS." },
  ionos:       { label: "IONOS",       url: "https://my.ionos.com/",                         rootName: "@",   wwwName: "www", txtName: "_lovable", notes: "Domains & SSL → DNS." },
  other:       { label: "Other registrar", url: "",                                          rootName: "@",   wwwName: "www", txtName: "_lovable", notes: "Look for 'DNS', 'Advanced DNS', or 'Manage DNS records'." },
};

export default function DnsSetup() {
  const [domain, setDomain] = useState("bhiembassy.asia");
  const [provider, setProvider] = useState<string>("spaceship");
  const [copied, setCopied] = useState<string>("");

  const p = PROVIDERS[provider];

  const records = useMemo(() => ([
    { id: "a-root", type: "A",   name: p.rootName, value: LOVABLE_IP, ttl: "3600", purpose: `Root domain ${domain}` },
    { id: "a-www",  type: "A",   name: p.wwwName,  value: LOVABLE_IP, ttl: "3600", purpose: `www.${domain}` },
    { id: "txt",    type: "TXT", name: p.txtName,  value: TXT_VALUE,  ttl: "3600", purpose: "Lovable ownership verification" },
  ]), [domain, p]);

  const copy = async (id: string, val: string) => {
    await navigator.clipboard.writeText(val);
    setCopied(id);
    toast({ title: "Copied", description: val });
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <div className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground">
            <Globe className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold">DNS Setup Wizard</h1>
          <p className="text-muted-foreground">Get the exact DNS records to connect your domain to Lovable.</p>
        </div>

        <Card>
          <CardHeader><CardTitle>1. Your domain & registrar</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Domain</label>
              <Input value={domain} onChange={(e) => setDomain(e.target.value.trim().replace(/^https?:\/\//, "").replace(/^www\./, ""))} placeholder="example.com" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">DNS Provider / Registrar</label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PROVIDERS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Add these records at {p.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {p.url && (
              <Alert>
                <AlertDescription className="flex items-center justify-between gap-2">
                  <span>{p.notes}</span>
                  <a href={p.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary font-medium hover:underline whitespace-nowrap">
                    Open {p.label} <ExternalLink className="w-3 h-3" />
                  </a>
                </AlertDescription>
              </Alert>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm border rounded-lg overflow-hidden">
                <thead className="bg-muted">
                  <tr className="text-left">
                    <th className="p-3">Type</th>
                    <th className="p-3">Name / Host</th>
                    <th className="p-3">Value</th>
                    <th className="p-3">TTL</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="p-3 font-mono font-bold">{r.type}</td>
                      <td className="p-3 font-mono">
                        {r.name}
                        <button onClick={() => copy(r.id + "-n", r.name)} className="ml-2 text-muted-foreground hover:text-primary">
                          {copied === r.id + "-n" ? <Check className="inline w-3 h-3" /> : <Copy className="inline w-3 h-3" />}
                        </button>
                        <div className="text-xs text-muted-foreground font-sans">{r.purpose}</div>
                      </td>
                      <td className="p-3 font-mono break-all">
                        {r.value}
                        <button onClick={() => copy(r.id + "-v", r.value)} className="ml-2 text-muted-foreground hover:text-primary">
                          {copied === r.id + "-v" ? <Check className="inline w-3 h-3" /> : <Copy className="inline w-3 h-3" />}
                        </button>
                      </td>
                      <td className="p-3 font-mono">{r.ttl}</td>
                      <td className="p-3">
                        <Button size="sm" variant="outline" onClick={() => copy(r.id, `${r.type}  ${r.name}  ${r.value}`)}>
                          Copy row
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Alert>
              <AlertDescription className="text-xs">
                <strong>Cloudflare users:</strong> set the proxy to "DNS only" (grey cloud) OR enable "Domain uses Cloudflare or a similar proxy" in Lovable's Connect Domain → Advanced.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <VerifySection domain={domain} />

        <Card>
          <CardHeader><CardTitle>4. After verification passes</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ol className="list-decimal pl-5 space-y-2">
              <li>Open Lovable → Project Settings → Domains, click <strong>Verify</strong>. SSL provisions automatically.</li>
              <li>Once your site responds on the custom domain, submit the sitemap in Google Search Console and request indexing for key pages.</li>
              <li>If any check above still fails, wait 10–30 min for DNS propagation and re-run the check.</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

type CheckState = { status: "idle" | "checking" | "ok" | "fail"; found: string[]; expected: string; error?: string };

type HistoryEntry = {
  ts: number;
  domain: string;
  root: { ok: boolean; found: string[] };
  www: { ok: boolean; found: string[] };
  txt: { ok: boolean; found: string[] };
  aaaaRoot: { ok: boolean; found: string[] };
  aaaaWww: { ok: boolean; found: string[] };
  allOk: boolean;
};

const POLL_INTERVAL_SEC = 180; // 3 minutes
const HISTORY_KEY = "dns-check-history-v1";
const HISTORY_LIMIT = 50;
// Lovable does not currently publish an IPv6 (AAAA) endpoint, so the expected state
// is "no AAAA record present". Any stale AAAA will conflict with the IPv4 A setup.
const AAAA_EXPECTED = "(none — Lovable is IPv4 only)";

function VerifySection({ domain }: { domain: string }) {
  const [root, setRoot] = useState<CheckState>({ status: "idle", found: [], expected: LOVABLE_IP });
  const [www, setWww] = useState<CheckState>({ status: "idle", found: [], expected: LOVABLE_IP });
  const [txt, setTxt] = useState<CheckState>({ status: "idle", found: [], expected: TXT_VALUE });
  const [aaaaRoot, setAaaaRoot] = useState<CheckState>({ status: "idle", found: [], expected: AAAA_EXPECTED });
  const [aaaaWww, setAaaaWww] = useState<CheckState>({ status: "idle", found: [], expected: AAAA_EXPECTED });
  const [running, setRunning] = useState(false);
  const [autoPoll, setAutoPoll] = useState(false);
  const [nextIn, setNextIn] = useState(POLL_INTERVAL_SEC);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
    } catch { return []; }
  });
  const [showHistory, setShowHistory] = useState(false);
  const runningRef = useRef(false);

  // Parse a TXT data field returned by Google DNS. RFC 1035 allows a TXT record
  // to contain multiple character strings, each ≤255 bytes, that must be
  // concatenated. Google returns them as space-separated quoted segments
  // (e.g. `"part1" "part2"`). Some clients return a single quoted blob.
  const parseTxt = (raw: string): string => {
    const segments = raw.match(/"((?:[^"\\]|\\.)*)"/g);
    if (segments && segments.length > 0) {
      return segments
        .map((s) => s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\"))
        .join("");
    }
    return raw.replace(/^"|"$/g, "");
  };

  const query = async (name: string, type: "A" | "AAAA" | "TXT"): Promise<string[]> => {
    const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`);
    const json = await res.json();
    const answers: any[] = json.Answer || [];
    const code = type === "A" ? 1 : type === "AAAA" ? 28 : 16;
    return answers
      .filter((a) => a.type === code)
      .map((a) => (type === "TXT" ? parseTxt(String(a.data)) : String(a.data).replace(/^"|"$/g, "")));
  };


  const runAll = async () => {
    if (!domain || runningRef.current) return;
    runningRef.current = true;
    setRunning(true);
    type Target = [string, "A" | "AAAA" | "TXT", string, (s: CheckState) => void];
    const targets: Target[] = [
      [domain, "A", LOVABLE_IP, setRoot],
      [`www.${domain}`, "A", LOVABLE_IP, setWww],
      [`_lovable.${domain}`, "TXT", TXT_VALUE, setTxt],
      [domain, "AAAA", AAAA_EXPECTED, setAaaaRoot],
      [`www.${domain}`, "AAAA", AAAA_EXPECTED, setAaaaWww],
    ];
    for (const [, , expected, setter] of targets) {
      setter({ status: "checking", found: [], expected });
    }
    const checks = await Promise.all(targets.map(async ([name, type, expected, setter]) => {
      try {
        const found = await query(name, type);
        let ok: boolean;
        if (type === "A") ok = found.includes(expected);
        else if (type === "TXT") ok = found.some((v) => v.includes("lovable_verify"));
        else ok = found.length === 0; // AAAA: clean (no conflicting IPv6)
        setter({ status: ok ? "ok" : "fail", found, expected });
        return { ok, found };
      } catch (e: any) {
        setter({ status: "fail", found: [], expected, error: e?.message || "Query failed" });
        return { ok: false, found: [] as string[] };
      }
    }));
    // AAAA is advisory — don't block "all OK" on it, but record it
    const requiredOk = checks.slice(0, 3).map((c) => c.ok);
    const entry: HistoryEntry = {
      ts: Date.now(),
      domain,
      root: checks[0],
      www: checks[1],
      txt: checks[2],
      aaaaRoot: checks[3],
      aaaaWww: checks[4],
      allOk: requiredOk.every(Boolean),
    };
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, HISTORY_LIMIT);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    setLastChecked(new Date());
    setNextIn(POLL_INTERVAL_SEC);
    setRunning(false);
    runningRef.current = false;
    if (requiredOk.every(Boolean)) setAutoPoll(false);
  };

  const clearHistory = () => {
    setHistory([]);
    try { localStorage.removeItem(HISTORY_KEY); } catch {}
    toast({ title: "History cleared" });
  };

  const exportHistory = () => {
    const headers = ["timestamp", "domain", "root_ok", "root_found", "www_ok", "www_found", "txt_ok", "txt_found", "aaaa_root_ok", "aaaa_root_found", "aaaa_www_ok", "aaaa_www_found", "all_ok"];
    const rows = history.map((h) => [
      new Date(h.ts).toISOString(),
      h.domain,
      h.root.ok, `"${h.root.found.join("|")}"`,
      h.www.ok, `"${h.www.found.join("|")}"`,
      h.txt.ok, `"${h.txt.found.join("|")}"`,
      h.aaaaRoot?.ok ?? "", `"${(h.aaaaRoot?.found || []).join("|")}"`,
      h.aaaaWww?.ok ?? "", `"${(h.aaaaWww?.found || []).join("|")}"`,
      h.allOk,
    ].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `dns-history-${domain}.csv`; a.click();
    URL.revokeObjectURL(url);
  };


  // Countdown + auto re-run
  useEffect(() => {
    if (!autoPoll) return;
    const tick = setInterval(() => {
      setNextIn((n) => {
        if (n <= 1) {
          runAll();
          return POLL_INTERVAL_SEC;
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPoll, domain]);

  const Row = ({ label, name, state, optional, emptyOk }: { label: string; name: string; state: CheckState; optional?: boolean; emptyOk?: boolean }) => (
    <div className="border rounded-lg p-3 flex items-start gap-3">
      <div className="mt-0.5">
        {state.status === "idle" && <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />}
        {state.status === "checking" && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
        {state.status === "ok" && <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
        {state.status === "fail" && <div className={`w-5 h-5 rounded-full ${optional ? "bg-amber-500" : "bg-destructive"} flex items-center justify-center`}><X className="w-3 h-3 text-white" /></div>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm flex items-center gap-2 flex-wrap">
          {label} <span className="font-mono text-muted-foreground">({name})</span>
          {optional && <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-muted text-muted-foreground">optional</span>}
        </div>
        <div className="text-xs text-muted-foreground mt-1">Expected: <span className="font-mono">{state.expected}</span></div>
        {state.status !== "idle" && (
          <div className="text-xs mt-1">
            Found: {state.found.length === 0
              ? <span className={`font-mono ${emptyOk ? "text-green-600" : "text-destructive"}`}>{emptyOk ? "— none (good) —" : "— no record —"}</span>
              : <span className={`font-mono break-all ${optional && state.status === "fail" ? "text-amber-600" : ""}`}>{state.found.join(", ")}</span>}
          </div>
        )}
        {optional && state.status === "fail" && state.found.length > 0 && (
          <div className="text-xs text-amber-600 mt-1">
            A stale IPv6 address is set. Remove this AAAA record at your registrar so all traffic resolves to Lovable's IPv4 endpoint.
          </div>
        )}
        {state.error && <div className="text-xs text-destructive mt-1">{state.error}</div>}
      </div>
    </div>
  );


  const allOk = root.status === "ok" && www.status === "ok" && txt.status === "ok";
  const anyChecked = [root, www, txt].some((s) => s.status !== "idle");
  const mm = String(Math.floor(nextIn / 60)).padStart(1, "0");
  const ss = String(nextIn % 60).padStart(2, "0");
  const progress = ((POLL_INTERVAL_SEC - nextIn) / POLL_INTERVAL_SEC) * 100;

  const toggleAuto = () => {
    if (!autoPoll) {
      setAutoPoll(true);
      setNextIn(POLL_INTERVAL_SEC);
      if (!anyChecked) runAll();
    } else {
      setAutoPoll(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <span>3. Verify DNS propagation</span>
          <div className="flex items-center gap-2">
            <Button onClick={toggleAuto} disabled={!domain} size="sm" variant={autoPoll ? "secondary" : "outline"}>
              {autoPoll ? "Stop auto-check" : "Auto-check every 3 min"}
            </Button>
            <Button onClick={runAll} disabled={running || !domain} size="sm">
              {running ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              {anyChecked ? "Re-check" : "Check now"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">Queries Google Public DNS (8.8.8.8) live. Results reflect global propagation within seconds.</p>

        {autoPoll && !allOk && (
          <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Auto-checking… next run in <span className="font-mono text-primary">{mm}:{ss}</span></span>
              {lastChecked && <span className="text-muted-foreground">Last: {lastChecked.toLocaleTimeString()}</span>}
            </div>
            <div className="h-1.5 w-full bg-muted rounded overflow-hidden">
              <div className="h-full bg-primary transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <Row label="A record (root)" name={domain} state={root} />
        <Row label="A record (www)" name={`www.${domain}`} state={www} />
        <Row label="TXT record (ownership)" name={`_lovable.${domain}`} state={txt} />
        <Row label="AAAA record (IPv6, root)" name={domain} state={aaaaRoot} optional emptyOk />
        <Row label="AAAA record (IPv6, www)" name={`www.${domain}`} state={aaaaWww} optional emptyOk />


        {anyChecked && !running && (
          allOk ? (
            <Alert className="border-green-600/40 bg-green-50 dark:bg-green-950/20">
              <AlertDescription className="text-green-800 dark:text-green-300 text-sm">
                All 3 records are live{autoPoll ? " — auto-check stopped" : ""}. Go to Lovable → Project Settings → Domains → <strong>Verify</strong>, then submit your sitemap in Google Search Console.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">
                One or more records aren't propagated yet. {autoPoll ? "Auto-check is on — leave this tab open and it will keep re-checking." : "Turn on auto-check or re-check in 5–10 minutes."}
              </AlertDescription>
            </Alert>
          )
        )}

        <div className="border-t pt-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary"
            >
              <History className="w-4 h-4" />
              Check history ({history.length})
              <span className="text-xs text-muted-foreground">{showHistory ? "Hide" : "Show"}</span>
            </button>
            {history.length > 0 && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={exportHistory}>
                  <Download className="w-3 h-3 mr-1" /> CSV
                </Button>
                <Button size="sm" variant="ghost" onClick={clearHistory}>
                  <Trash2 className="w-3 h-3 mr-1" /> Clear
                </Button>
              </div>
            )}
          </div>

          {showHistory && (
            history.length === 0 ? (
              <p className="text-xs text-muted-foreground mt-3">No checks recorded yet. Run a check to start tracking propagation history.</p>
            ) : (
              <div className="mt-3 max-h-80 overflow-y-auto border rounded-lg divide-y">
                {history.map((h) => {
                  const d = new Date(h.ts);
                  const Pill = ({ ok, label }: { ok: boolean; label: string }) => (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono ${ok ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"}`}>
                      {ok ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />} {label}
                    </span>
                  );
                  return (
                    <div key={h.ts} className="p-2.5 text-xs space-y-1.5 hover:bg-muted/30">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-mono text-muted-foreground">{d.toLocaleString()}</span>
                        <span className={`font-semibold ${h.allOk ? "text-green-600" : "text-destructive"}`}>
                          {h.allOk ? "ALL PASS" : "PARTIAL / FAIL"}
                        </span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        <Pill ok={h.root.ok} label="root A" />
                        <Pill ok={h.www.ok} label="www A" />
                        <Pill ok={h.txt.ok} label="TXT" />
                      </div>
                      <div className="font-mono text-[10px] text-muted-foreground break-all space-y-0.5">
                        <div>root: {h.root.found.join(", ") || "—"}</div>
                        <div>www: {h.www.found.join(", ") || "—"}</div>
                        <div>txt: {h.txt.found.join(", ") || "—"}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}


