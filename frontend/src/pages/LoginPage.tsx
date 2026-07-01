import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { TextField } from "@/components/TextField";
import { api } from "@/lib/api";

interface Profile {
  name: string;
  region: string;
  bucket_name: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);

  const [accessKey, setAccessKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [region, setRegion] = useState("");
  const [bucket, setBucket] = useState("");
  const [basePath, setBasePath] = useState("");
  const [connectionName, setConnectionName] = useState("");

  useEffect(() => {
    api.getProfiles().then((data) => {
      if (data.profiles?.length) setProfiles(data.profiles);
    }).catch(() => {});
  }, []);

  const handleProfileConnect = (profileName: string) => {
    setSelectedProfile(profileName);
    setLoading(true);
    api.connectProfile(profileName).then(() => {
      sessionStorage.setItem("s3_connection_name", profileName);
      toast.success(`Connected via profile: ${profileName}`);
      navigate("/");
    }).catch((err: any) => {
      toast.error(err.message);
    }).finally(() => setLoading(false));
  };

  const handleManualConnect = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.connect({
        access_key: accessKey.trim(),
        secret_key: secretKey,
        region: region.trim(),
        bucket_name: bucket.trim(),
        base_path: basePath.trim(),
      });
      sessionStorage.setItem("s3_connection_name", connectionName.trim() || bucket.trim());
      toast.success(`Connected to ${bucket}`);
      navigate("/");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasProfiles = profiles.length > 0;

  return (
    <main
      className="min-h-screen flex"
      style={{ background: "var(--gradient-hero)" }}
    >
      {/* Left hero text — hidden on mobile */}
      <section className="relative overflow-hidden p-12 hidden lg:flex flex-col justify-between flex-1">
        <div className="absolute -left-20 -top-20 h-[420px] w-[420px] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-[320px] w-[320px] rounded-full bg-tertiary/30 blur-3xl" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-elev-2">
              <Icon name="cloud" />
            </div>
            <div>
              <div className="text-sm font-semibold">S3 Explorer</div>
              <div className="text-xs text-muted-foreground">v3.0</div>
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-[56px] font-bold leading-[1.05] tracking-tight text-foreground">
              Your buckets,
              <br />
              <span className="text-primary">beautifully</span> organized.
            </h1>
            <p className="max-w-md text-base text-muted-foreground">
              Browse, preview, edit, and ship — the entire S3 surface in a clean
              interface that feels native on every screen.
            </p>
            <div className="flex flex-wrap gap-2">
              <Chip tone="primary" icon="bolt">Instant connect</Chip>
              <Chip tone="secondary" icon="lock">End-to-end</Chip>
              <Chip tone="tertiary" icon="auto_awesome">Live preview</Chip>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Icon name="folder_open" size={16} /> Browse
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="edit" size={16} /> Edit
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="upload" size={16} /> Upload
            </span>
          </div>
        </div>
      </section>

      {/* Right side — cards side by side */}
      <section className="flex-1 flex items-center justify-center p-6 sm:p-10 overflow-auto">
        <div className="w-full max-w-[900px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden mb-6">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-elev-1">
              <Icon name="cloud" />
            </div>
            <div>
              <div className="text-sm font-semibold">S3 Explorer</div>
              <div className="text-xs text-muted-foreground">Connect to your bucket</div>
            </div>
          </div>

          <div className={`flex flex-col ${hasProfiles ? "md:flex-row" : "max-w-[440px] mx-auto"} gap-6`}>
            {/* Saved Profiles card */}
            {hasProfiles && (
              <div className="flex-1 rounded-2xl bg-surface-container-low p-6 shadow-elev-3">
                <div className="mb-4 space-y-1">
                  <div className="text-xs font-medium uppercase tracking-wider text-primary">Quick Connect</div>
                  <h2 className="text-xl font-semibold text-foreground">Saved Profiles</h2>
                </div>

                <div className="space-y-2 max-h-[320px] overflow-auto">
                  {profiles.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleProfileConnect(p.name)}
                      disabled={loading}
                      className={`w-full flex items-center gap-3 rounded-2xl p-3 text-left transition-colors ${
                        selectedProfile === p.name
                          ? "bg-primary-container text-on-primary-container"
                          : "bg-secondary-container text-on-secondary-container hover:shadow-elev-1"
                      }`}
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary-foreground shrink-0">
                        <Icon name="badge" size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{p.name} · {p.region}</div>
                        <div className="truncate text-[11px] opacity-80">{p.bucket_name}</div>
                      </div>
                      {loading && selectedProfile === p.name && (
                        <span className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* OR divider */}
            {hasProfiles && (
              <div className="flex md:flex-col items-center justify-center gap-3 shrink-0">
                <span className="h-px w-full md:h-full md:w-px bg-outline-variant" />
                <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">OR</span>
                <span className="h-px w-full md:h-full md:w-px bg-outline-variant" />
              </div>
            )}

            {/* Manual Entry card */}
            <form
              onSubmit={handleManualConnect}
              className="flex-1 rounded-2xl bg-surface-container-low p-6 shadow-elev-3"
            >
            <div className="mb-4 space-y-1">
              <div className="text-xs font-medium uppercase tracking-wider text-primary">Manual</div>
              <h2 className="text-xl font-semibold text-foreground">Enter Credentials</h2>
            </div>

            <div className="space-y-3">
              <TextField
                label="Connection Name"
                icon="label"
                value={connectionName}
                onChange={(e) => setConnectionName(e.target.value.slice(0, 12))}
                maxLength={12}
              />
              <TextField
                label="Access Key"
                icon="key"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                required
              />
              <TextField
                label="Secret Key"
                icon="vpn_key"
                trailing={showSecret ? "visibility_off" : "visibility"}
                onTrailingClick={() => setShowSecret((s) => !s)}
                type={showSecret ? "text" : "password"}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Region"
                  icon="public"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  required
                />
                <TextField
                  label="Bucket"
                  icon="inventory_2"
                  value={bucket}
                  onChange={(e) => setBucket(e.target.value)}
                  required
                />
              </div>
              <TextField
                label="Base path (optional)"
                icon="folder_open"
                value={basePath}
                onChange={(e) => setBasePath(e.target.value)}
              />
            </div>

            <div className="mt-6">
              <Button icon="bolt" full type="submit" disabled={loading} loading={loading}>
                Connect bucket
              </Button>
            </div>
          </form>
          </div>
        </div>
      </section>
    </main>
  );
}
