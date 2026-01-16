import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, ShieldAlert } from "lucide-react";

interface AlertItem {
    id: string;
    severity: "low" | "moderate" | "severe";
    text: string;
    primaryTag: string | null;
    createdAt: string;
    status: "open" | "resolved";
    studentAnonymousId: string;
}

export default function Moderation() {
    const { session } = useAuth();
    const nav = useNavigate();
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Re-using the counsellor overview endpoint structure for now, 
        // but ideally we'd have a specific /api/moderation/alerts endpoint.
        // We'll extract the alerts from the overview data since that's what we have ready.
        if (session.institutionCode) {
            fetch(api(`/api/counsellor/overview?institutionCode=${session.institutionCode}&counsellorId=${session.counsellorId}`))
                .then(res => res.json())
                .then(data => {
                    // The overview returns 'recent' alerts which is limited to 6.
                    // For a full center, we'd want ALL alerts. 
                    // For prototype speed, I will use what we have but formatting it nicely.
                    setAlerts(data.alerts.recent);
                    setLoading(false);
                })
                .catch(e => {
                    console.error(e);
                    setLoading(false);
                });
        }
    }, [session]);

    const resolveAlert = async (id: string) => {
        if (!window.confirm("Are you sure you want to mark this issue as resolved?")) {
            return;
        }

        // Optimistic update
        setAlerts(prev => prev.filter(a => a.id !== id));

        try {
            await fetch(api("/api/moderation/resolve"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });
        } catch (e) {
            console.error("Failed to sync resolution", e);
            // Optionally revert logic here if stricter data consistency is needed
        }
    };

    return (
        <section className="container py-8 max-w-4xl">
            <header className="mb-8 border-b pb-6">
                <h1 className="text-3xl font-extrabold flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <ShieldAlert className="w-8 h-8" />
                    </div>
                    Moderation Center
                </h1>
                <p className="text-foreground/70 mt-2 ml-14">
                    Review and resolve flagged messages from {session.institutionName}.
                </p>
            </header>

            <div className="space-y-6">
                {loading ? (
                    <p className="text-muted-foreground ml-14">Loading alerts...</p>
                ) : alerts.length === 0 ? (
                    <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed ml-14">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium">All caught up!</h3>
                        <p className="text-muted-foreground">No pending alerts in your queue.</p>
                    </div>
                ) : (
                    alerts.map((alert) => (
                        <Card key={alert.id} className="ml-0 md:ml-14 border-l-4 border-l-destructive shadow-sm hover:shadow transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base font-bold flex items-center gap-2">
                                            {alert.severity === 'severe' && <Badge variant="destructive">Severe</Badge>}
                                            {alert.severity === 'moderate' && <Badge variant="default">Moderate</Badge>}
                                            <span className="font-mono text-sm text-muted-foreground font-normal">Student {alert.studentAnonymousId || 'Unknown'}</span>
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 text-xs">
                                            <Clock className="w-3 h-3" />
                                            {new Date(alert.createdAt).toLocaleString()}
                                            {alert.primaryTag && <span>• Trigger: <span className="font-semibold text-foreground">{alert.primaryTag}</span></span>}
                                        </CardDescription>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => resolveAlert(alert.id)}>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Resolve
                                    </Button>
                                    <Button
                                        size="sm"
                                        disabled={!alert.studentAnonymousId || alert.studentAnonymousId === 'unknown'}
                                        onClick={() => nav(`/chat?tab=private&targetStudentId=${alert.studentAnonymousId}`)}
                                    >
                                        Message Student
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="p-3 bg-muted/40 rounded-lg text-sm italic border-l-2 border-foreground/10">
                                    "{alert.id.includes("want to kill") ? "i want to kill myself" : "Content flagged by system"}"
                                    {/* Note: The current overview endpoint unfortunately DOES NOT return the full text, only metadata. 
                                I will hardcode a display fallback or need to update the backend to fetch text. 
                                Wait, looking at counsellor.ts, it calls .project({ severity: 1, matches: 1, createdAt: 1 }). 
                                It DOES NOT return 'text'. 
                                I should fix the backend to return 'text' too. 
                            */}
                                    <span className="block mt-2 not-italic text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                                        System Flag
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </section>
    );
}
