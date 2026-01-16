import { useLocation } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Legal() {
    const { pathname } = useLocation();
    const isPrivacy = pathname.includes("privacy");

    return (
        <div className="container py-12 max-w-4xl">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        {isPrivacy ? "Privacy Policy" : "Terms of Service"}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                </div>

                <ScrollArea className="h-[60vh] rounded-xl border p-6 bg-muted/20">
                    <div className="space-y-6 text-sm leading-relaxed">
                        {isPrivacy ? (
                            <>
                                <section>
                                    <h3 className="font-semibold text-lg mb-2">1. Data Collection</h3>
                                    <p>
                                        MindPalace collects minimal data to function. We store your institution code
                                        and encrypted messages. We do NOT track your physical location or share data
                                        with third-party advertisers.
                                    </p>
                                </section>
                                <section>
                                    <h3 className="font-semibold text-lg mb-2">2. Anonymity</h3>
                                    <p>
                                        Your identity is hidden from peers. Only authorized counselors at your
                                        institution can see your Student ID in cases of emergency intervention.
                                    </p>
                                </section>
                                <section>
                                    <h3 className="font-semibold text-lg mb-2">3. Data Retention</h3>
                                    <p>
                                        Chat messages are retaining for moderation purposes but may be cleared periodically.
                                    </p>
                                </section>
                            </>
                        ) : (
                            <>
                                <section>
                                    <h3 className="font-semibold text-lg mb-2">1. Acceptable Use</h3>
                                    <p>
                                        By using MindPalace, you agree to be kind, respectful, and supportive.
                                        Bullying, harassment, or hate speech will result in an immediate ban.
                                    </p>
                                </section>
                                <section>
                                    <h3 className="font-semibold text-lg mb-2">2. Liability</h3>
                                    <p>
                                        MindPalace is a peer support tool, not a replacement for professional medical advice.
                                        In a crisis, please contact emergency services immediately.
                                    </p>
                                </section>
                                <section>
                                    <h3 className="font-semibold text-lg mb-2">3. Moderation</h3>
                                    <p>
                                        All conversations are subject to automated and human moderation to ensure safety.
                                    </p>
                                </section>
                            </>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
