import { UserRole } from "@/lib/constants/roles";
import { auth, currentUser } from "@clerk/nextjs/server";

import { redirect } from "next/navigation";
import {
  Header,
  Hero,
  ProblemSection,
  SolutionSection,
  FeaturesSection,
  DifferenceSection,
  WhoItsForSection,
  SecuritySection,
  SocialProofSection,
  CTASection,
  Footer,
} from "@/components/landing";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    const user = await currentUser();
    const role = (user?.publicMetadata?.role as string) || "";
    const status = (user?.publicMetadata?.status as string) || "";

    const userEmail =
      user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
        ?.emailAddress || user?.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      redirect("/");
    }

    // If user doesn't have role/status yet, send them to callback to set it up
    if (!role || !status) {
      redirect("/callback");
    }

    // If user has role and status, they were already validated during onboarding
    // No need to re-check invitations on every page load
    // Route based on role
    if (role === UserRole.ADMIN) {
      // Admins don't need onboarding - redirect directly to admin dashboard
      redirect("/admin/dashboard");
    } else if (role === UserRole.AGENT) {
      // Check if agent is active
      if (status === "DEACTIVATED" || status === "BANNED" || user?.banned) {
        redirect("/");
      }

      // Check onboarding status
      const onboarded = !!(user?.publicMetadata?.onboarded as boolean);
      if (!onboarded) {
        redirect("/onboarding");
      } else {
        redirect("/dashboard");
      }
    } else {
      // Unknown role - redirect to callback to handle edge cases
      redirect("/callback");
    }
  }
  // If NOT logged in, show the landing page
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Header />
      <main>
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <DifferenceSection />
        <WhoItsForSection />
        <SocialProofSection />
        <SecuritySection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
