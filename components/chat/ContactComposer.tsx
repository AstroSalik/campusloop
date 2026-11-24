"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ContactComposerProps {
  title: string;
  recipient: string;
  context?: string;
  draft: string;
  onDismiss: () => void;
  onSend: (message: string) => Promise<void>;
}

export function ContactComposer({ title, recipient, context, draft, onDismiss, onSend }: ContactComposerProps) {
  const [message, setMessage] = useState(draft);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current || !message.trim()) return;
    pending.current = true;
    setSending(true);
    setError("");
    try {
      await onSend(message.trim());
      onDismiss();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your message could not be sent. Try again.");
    } finally {
      pending.current = false;
      setSending(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !pending.current) onDismiss(); }}>
      <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl p-5 sm:p-6">
        <DialogHeader className="text-left">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{context}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-muted px-3 py-2.5 text-sm">
            <span className="mr-2 text-muted-foreground">To</span>
            <span className="font-medium">{recipient}</span>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="contact-message" className="text-sm font-medium">Message</label>
            <textarea
              id="contact-message"
              rows={4}
              maxLength={2000}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              disabled={sending}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
            />
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onDismiss} disabled={sending}>Cancel</Button>
            <Button type="submit" disabled={sending || !message.trim()}>{sending ? "Sending…" : "Send message"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
