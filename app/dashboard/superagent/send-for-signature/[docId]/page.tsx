"use client";

import { PageShell } from "@/components/superagent/shell/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDocument, sendDocumentForSignature } from "@/lib/actions/documents";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileSignature,
  Loader2,
  Mail,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SendForSignaturePage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.docId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [step, setStep] = useState(1);
  const [documentTitle, setDocumentTitle] = useState("");

  const [buyer, setBuyer] = useState({ name: "", email: "" });
  const [seller, setSeller] = useState({ name: "", email: "" });

  // Fetch document details to pre-fill names
  useEffect(() => {
    async function fetchDoc() {
      try {
        const result = await getDocument(docId);
        if (result.success && result.document) {
          setDocumentTitle(result.document.title);

          // Parse data to find names
          let data = result.document.data;
          if (typeof data === "string") {
            try {
              data = JSON.parse(data);
            } catch (e) {
              /* ignore */
            }
          }

          if (data) {
            if (data["Buyer Name"])
              setBuyer((prev) => ({ ...prev, name: data["Buyer Name"] }));
            if (data["Seller Name"])
              setSeller((prev) => ({ ...prev, name: data["Seller Name"] }));
          }
        } else {
          toast.error("Failed to load document details");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDoc();
  }, [docId]);

  const handleSend = async () => {
    if (!buyer.email || !seller.email) {
      toast.error("Please enter emails for both parties");
      return;
    }

    setIsSending(true);

    // Construct the payload hiding technical details from user
    const signers = [
      {
        // Buyer
        name: buyer.name,
        email: buyer.email,
        role: "buyer",
        routingOrder: 1,
        anchorStrings: ["{{sig_buyer}}", "{{date_buyer}}"], // or /s1/ /d1/ handled by backend logic/adapter
      },
      {
        // Seller
        name: seller.name,
        email: seller.email,
        role: "seller",
        routingOrder: 2, // Sequential signing
        anchorStrings: ["{{sig_seller}}", "{{date_seller}}"],
      },
    ];

    const result = await sendDocumentForSignature(docId, {
      signers,
      emailSubject: `Please Sign: ${documentTitle}`,
      emailBody: "Please review and sign the attached purchase agreement.",
    });

    setIsSending(false);

    if (result.success) {
      toast.success("Sent for signature!");
      setStep(3); // Success step
    } else {
      toast.error(result.error || "Failed to send");
    }
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/superagent">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Finalize Agreement
            </h1>
            <p className="text-zinc-500">Prepare {documentTitle} for signing</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 text-sm font-medium text-zinc-500">
          <div
            className={cn(
              "flex items-center gap-2",
              step >= 1 && "text-zinc-900"
            )}
          >
            <div
              className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center border",
                step >= 1
                  ? "bg-zinc-900 border-zinc-900 text-white"
                  : "border-zinc-300"
              )}
            >
              1
            </div>
            Signer Details
          </div>
          <div className="h-px w-8 bg-zinc-200" />
          <div
            className={cn(
              "flex items-center gap-2",
              step >= 2 && "text-zinc-900"
            )}
          >
            <div
              className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center border",
                step >= 2
                  ? "bg-zinc-900 border-zinc-900 text-white"
                  : "border-zinc-300"
              )}
            >
              2
            </div>
            Review & Send
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid gap-6 md:grid-cols-2">
                {/* Buyer Card */}
                <Card className="p-6 border-zinc-200/60 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900">Buyer</h3>
                      <p className="text-xs text-zinc-500">Signer 1</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label>Full Name</Label>
                      <Input
                        value={buyer.name}
                        onChange={(e) =>
                          setBuyer({ ...buyer, name: e.target.value })
                        }
                        placeholder="Enter buyer's name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                        <Input
                          value={buyer.email}
                          onChange={(e) =>
                            setBuyer({ ...buyer, email: e.target.value })
                          }
                          placeholder="buyer@example.com"
                          className="pl-9 mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Seller Card */}
                <Card className="p-6 border-zinc-200/60 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
                      <User className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900">Seller</h3>
                      <p className="text-xs text-zinc-500">Signer 2</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label>Full Name</Label>
                      <Input
                        value={seller.name}
                        onChange={(e) =>
                          setSeller({ ...seller, name: e.target.value })
                        }
                        placeholder="Enter seller's name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                        <Input
                          value={seller.email}
                          onChange={(e) =>
                            setSeller({ ...seller, email: e.target.value })
                          }
                          placeholder="seller@example.com"
                          className="pl-9 mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  size="lg"
                  onClick={() => setStep(2)}
                  disabled={
                    !buyer.name || !seller.name || !buyer.email || !seller.email
                  }
                  className="bg-zinc-900 hover:bg-zinc-800"
                >
                  Continue to Review
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card className="p-8 border-zinc-200/60 shadow-sm">
                <h3 className="text-lg font-semibold text-zinc-900 mb-6">
                  Summary
                </h3>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900">
                          {buyer.name}
                        </p>
                        <p className="text-sm text-zinc-500">{buyer.email}</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      Buyer
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="w-0.5 h-4 bg-zinc-300" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900">
                          {seller.name}
                        </p>
                        <p className="text-sm text-zinc-500">{seller.email}</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                      Seller
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-900 text-sm">
                  <p className="flex items-center gap-2">
                    <FileSignature className="h-4 w-4" />
                    This will send a legally binding {documentTitle} via our
                    eSignature provider.
                  </p>
                </div>
              </Card>

              <div className="flex justify-between pt-4">
                <Button variant="outline" size="lg" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  size="lg"
                  onClick={handleSend}
                  disabled={isSending}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white min-w-[200px]"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Documents
                      <FileSignature className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8 py-12"
            >
              <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-emerald-50 mb-4">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-zinc-900">
                  Documents Sent successfully!
                </h2>
                <p className="text-zinc-500 max-w-md mx-auto">
                  We've sent the signature requests to both parties. You can
                  track the status in your dashboard.
                </p>
              </div>

              <Button
                size="lg"
                onClick={() => router.push("/dashboard/superagent")}
                className="bg-[#0F766E] hover:bg-[#115E59] text-white min-w-[200px]"
              >
                Back to Workspace
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  );
}
