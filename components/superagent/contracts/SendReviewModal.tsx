"use client";

import { Button } from "@/components/ui/button";
import { sendDocumentReview } from "@/lib/actions/document-review";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Mail, Send, X } from "lucide-react";
import { useState } from "react";

export function SendReviewModal({
  isOpen,
  onClose,
  documentTitle,
  documentData,
}: {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  documentData: Record<string, any>;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("sending");
    const result = await sendDocumentReview(email, documentTitle, documentData);

    if (result.success) {
      setStatus("success");
      setTimeout(() => {
        onClose();
        setStatus("idle");
        setEmail("");
      }, 2000);
    } else {
      setStatus("error");
      setErrorMessage(
        result.error || "Failed to send email. Please try again."
      );
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed left-1/2 top-1/2 z-[101] w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-white  border border-black/5 shadow-2xl p-8 outline-none"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-900 rounded-none">
                      <Send className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <DialogPrimitive.Title className="text-xl font-serif italic text-zinc-900">
                        Send for Review
                      </DialogPrimitive.Title>
                      <DialogPrimitive.Description className="text-xs text-zinc-500">
                        Share {documentTitle} via email
                      </DialogPrimitive.Description>
                    </div>
                  </div>
                  <DialogPrimitive.Close asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-none h-10 w-10"
                    >
                      <X className="h-5 w-5 text-zinc-500" />
                    </Button>
                  </DialogPrimitive.Close>
                </div>

                {status === "success" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 flex flex-col items-center text-center space-y-4"
                  >
                    <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-lg font-semibold text-zinc-900">
                        Document Sent!
                      </h4>
                      <p className="text-sm text-zinc-500">
                        A review copy has been sent to {email}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSend} className="space-y-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1"
                      >
                        Recipient's Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                          type="email"
                          id="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="client@example.com"
                          className="w-full h-14 pl-12 pr-4 bg-zinc-50 border border-black/[0.05] rounded-none text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all text-sm font-medium"
                        />
                      </div>
                      {status === "error" && (
                        <p className="text-xs text-red-500 font-medium ml-1">
                          {errorMessage}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={status === "sending" || !email}
                      className="w-full h-14 bg-zinc-900 hover:bg-zinc-800 text-white rounded-none shadow-xl shadow-zinc-200 uppercase tracking-widest text-[11px] font-bold"
                    >
                      {status === "sending" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Document
                          <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <p className="text-[10px] text-center text-zinc-400 leading-relaxed px-4">
                      This will send a generated PDF copy to the recipient. No
                      data is stored in the system.
                    </p>
                  </form>
                )}
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
