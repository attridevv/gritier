import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-surface border border-border shadow-xl",
            headerTitle: "text-ink font-display",
            headerSubtitle: "text-ink-muted",
            socialButtonsBlockButton: "bg-surface-elevated border-border text-ink",
            formFieldLabel: "text-ink-muted",
            formFieldInput: "bg-surface-elevated border-border text-ink",
            footerActionText: "text-ink-muted",
            footerActionLink: "text-accent",
          },
        }}
      />
    </div>
  );
}
