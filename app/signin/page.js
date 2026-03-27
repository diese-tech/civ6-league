// app/signin/page.js
"use client";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <section className="max-w-md mx-auto px-6 py-20 text-center">
      <h1 className="font-display text-3xl font-bold mb-2">Sign In</h1>
      <div className="w-10 h-0.5 bg-gold mx-auto mb-6" />
      <p className="text-sm text-[var(--text-secondary)] mb-8">
        Sign in with your Discord account to save tier lists, track your profile, and more.
      </p>
      <button
        onClick={() => signIn("discord", { callbackUrl })}
        className="px-8 py-3 bg-[#5865F2] text-white font-condensed text-sm font-semibold tracking-widest uppercase rounded-md hover:bg-[#4752C4] transition-all"
      >
        Sign in with Discord
      </button>
      <p className="text-xs text-[var(--text-muted)] mt-4">
        Your Discord account will be linked to your league profile automatically.
      </p>
    </section>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-[var(--text-muted)]">Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
