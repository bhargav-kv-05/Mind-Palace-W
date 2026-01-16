import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartHandshake, BookOpen, MessageCircle } from "lucide-react";

export default function DashboardVolunteer() {
    const { session } = useAuth();

    return (
        <div className="container py-8 space-y-8">
            <header className="space-y-4 text-center md:text-left">
                <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl text-foreground">
                    Welcome back, <span className="text-primary">Volunteer</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                    Thank you for supporting your peers at {session.institutionName || session.institutionCode}.
                    Your empathy makes a difference.
                </p>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Peer Support Chat */}
                <Card className="shadow-md hover:shadow-lg transition-all border-l-4 border-l-primary/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <MessageCircle className="w-24 h-24 text-primary" />
                    </div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-primary" />
                            Peer Support Chat
                        </CardTitle>
                        <CardDescription>
                            Connect with students seeking peer guidance.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full bg-primary/90 hover:bg-primary">
                            <Link to="/chat?tab=peer_support">Enter Support Channel</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Training & Resources */}
                <Card className="shadow-sm hover:shadow-md transition-all">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-muted-foreground" />
                            Training Resources
                        </CardTitle>
                        <CardDescription>
                            Guidelines for effective peer counseling.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full" asChild>
                            <Link to="/library?training=true">View Resources</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Wellness Check */}
                <Card className="shadow-sm hover:shadow-md transition-all">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HeartHandshake className="w-5 h-5 text-muted-foreground" />
                            Your Wellness
                        </CardTitle>
                        <CardDescription>
                            Remember to take care of yourself too.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="ghost" className="w-full justify-start" disabled>
                            Coming Soon
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-muted/30 p-6 rounded-xl border border-dashed">
                <h3 className="font-semibold mb-2">Volunteer Guidelines</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Listen without judgment.</li>
                    <li>Maintain confidentiality unless someone is in danger.</li>
                    <li>Direct students to professional counselors for serious issues.</li>
                    <li>Report any concerning behavior immediately.</li>
                </ul>
            </div>
        </div>
    );
}
