"use client";

import { PageShell } from "@/components/superagent/shell/PageShell";
import { SectionHeader } from "@/components/superagent/shell/SectionHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendDocumentEmail } from "@/lib/actions/documents";
import { ArrowLeft, FileText, Loader2, Mail, Send } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SendEmailPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.docId as string;

  const [recipientEmail, setRecipientEmail] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // Default email body template
  useEffect(() => {
    if (!emailBody) {
      setEmailBody(`Hello,

Please find the attached document for your review. 

Please review the document and let me know if you have any questions or concerns.

Best regards`);
    }
  }, [emailBody]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientEmail || !emailBody.trim()) {
      toast.error("Please fill in both email and email body");
      return;
    }

    setIsLoading(true);
    const result = await sendDocumentEmail(docId, {
      recipientEmail,
      emailBody: emailBody.trim(),
    });
    setIsLoading(false);

    if (result.success) {
      toast.success("Email sent successfully!");
      setIsSent(true);
      setTimeout(() => {
        router.push("/dashboard/superagent");
      }, 2000);
    } else {
      toast.error(result.error || "Failed to send email");
    }
  };

  return (
    <PageShell>
      <div className="space-y-8 max-w-3xl">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/superagent">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <SectionHeader
            title="Send Document for Review"
            meta="Send the document via email with a custom message"
          />
        </div>

        {isSent ? (
          <Card className="p-12 text-center space-y-6 border-black/5 shadow-sm">
            <div className="flex justify-center">
              <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center">
                <Mail className="h-10 w-10 text-emerald-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-zinc-900">
                Email Sent Successfully!
              </h3>
              <p className="text-zinc-500">
                The document has been sent to {recipientEmail}
              </p>
            </div>
            <Button
              onClick={() => router.push("/dashboard/superagent")}
              className="mt-4"
            >
              Back to SuperAgent
            </Button>
          </Card>
        ) : (
          <Card className="p-8 border-black/5 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="recipientEmail"
                  className="text-zinc-700 font-medium"
                >
                  Recipient Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input
                    id="recipientEmail"
                    type="email"
                    placeholder="client@example.com"
                    className="pl-10 h-12"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="emailBody"
                  className="text-zinc-700 font-medium"
                >
                  Email Body
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <textarea
                    id="emailBody"
                    rows={12}
                    className="w-full pl-10 pr-4 pt-3 pb-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all text-sm font-medium resize-none"
                    placeholder="Enter your email message here..."
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <p className="text-xs text-zinc-400">
                  The document PDF will be attached automatically
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !recipientEmail || !emailBody.trim()}
                  className="flex-1 h-12 bg-zinc-900 hover:bg-zinc-800 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Email
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
