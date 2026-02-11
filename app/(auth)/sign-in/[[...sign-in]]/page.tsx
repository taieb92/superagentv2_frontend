import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-linear-to-b from-zinc-50 to-slate-50">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary:
              "bg-zinc-900 border-none hover:bg-zinc-800 text-sm normal-case",
            card: "border border-black/5 shadow-xl rounded-2xl",
            headerTitle: "font-serif italic text-2xl",
            headerSubtitle: "text-zinc-500",
            footer: "hidden",
          },
        }}
      />
    </div>
  );
}
