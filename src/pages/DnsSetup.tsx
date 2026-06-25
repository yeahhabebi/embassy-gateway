import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Check, ExternalLink, Globe } from "lucide-react";
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

        <Card>
          <CardHeader><CardTitle>3. Verify & wait</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ol className="list-decimal pl-5 space-y-2">
              <li>Delete any old A/AAAA/CNAME records for <code className="font-mono">@</code> and <code className="font-mono">www</code> that point elsewhere.</li>
              <li>Save the 3 records above at your registrar.</li>
              <li>Check propagation: <a className="text-primary hover:underline" target="_blank" rel="noreferrer" href={`https://dnschecker.org/#A/${domain}`}>dnschecker.org/{domain}</a></li>
              <li>In Lovable → Project Settings → Domains, click <strong>Verify</strong>. SSL provisions automatically (up to 72h, usually minutes).</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
