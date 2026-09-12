/**
 * CampusLoop Automated Email & Notification Dispatcher
 * Sends transactional student alerts (restock requests, purchases, security codes)
 * via Resend API, SMTP, or native server dispatch.
 */

export interface RestockEmailParams {
  sellerEmail: string;
  sellerName?: string;
  listingTitle: string;
  listingId: string;
  price?: number;
  buyerName?: string;
  buyerEmail?: string;
}

export function generateRestockEmailHtml(params: RestockEmailParams, appUrl: string): string {
  const { sellerName, listingTitle, listingId, price, buyerName } = params;
  const listingUrl = `${appUrl}/marketplace/${listingId}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restock Request for ${listingTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .logo { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
    .content { padding: 32px 28px; }
    .badge { display: inline-block; padding: 4px 12px; background-color: #fee2e2; color: #b91c1c; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
    .title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; }
    .text { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0; }
    .item-card { background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 24px; }
    .item-name { font-weight: 700; font-size: 16px; color: #0f172a; margin-bottom: 4px; }
    .item-price { font-size: 15px; font-weight: 800; color: #0d9488; }
    .btn { display: inline-block; width: 100%; box-sizing: border-box; text-align: center; background-color: #0d9488; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 14px 24px; border-radius: 10px; text-decoration: none; transition: background-color 0.2s; }
    .btn:hover { background-color: #0f766e; }
    .footer { padding: 20px 24px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">CampusLoop</div>
      <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Campus Peer-to-Peer Marketplace</p>
    </div>
    <div class="content">
      <div class="badge">🔥 Restock Request Alert</div>
      <h1 class="title">A student wants to buy your item!</h1>
      <p class="text">
        Hello <strong>${sellerName || "CampusLoop Seller"}</strong>,
        <br><br>
        Great news! <strong>${buyerName || "A student peer"}</strong> on your campus is interested in your listing and has requested it back in stock:
      </p>
      
      <div class="item-card">
        <div class="item-name">${listingTitle}</div>
        ${price ? `<div class="item-price">₹${price.toLocaleString("en-IN")}</div>` : ""}
      </div>

      <p class="text">
        If you still have units available or wish to list more, click the button below to add stock and reactivate your listing in the marketplace immediately:
      </p>

      <a href="${listingUrl}" class="btn">Add Quantity / Restock Item Now</a>
    </div>
    <div class="footer">
      This notification was sent to ${params.sellerEmail} because you have active marketplace listings on CampusLoop.
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Sends the restock notification email to the seller's registered email
 */
export async function sendRestockNotificationEmail(
  params: RestockEmailParams
): Promise<{ success: boolean; delivered: boolean; error?: string }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://campusloop-blue.vercel.app";
  const { sellerEmail, listingTitle } = params;

  if (!sellerEmail) {
    console.warn("[email-service] No seller email provided for restock alert.");
    return { success: false, delivered: false, error: "Missing seller email" };
  }

  const html = generateRestockEmailHtml(params, appUrl);
  const subject = `🔥 Restock Requested: A student wants to buy your "${listingTitle}" on CampusLoop!`;

  console.log(`[CampusLoop Email Dispatcher] Preparing restock alert for ${sellerEmail} (${listingTitle})`);

  // 1. Try Resend API if RESEND_API_KEY is configured
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const fromEmail = process.env.EMAIL_FROM || "CampusLoop <notifications@campusloop.app>";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [sellerEmail],
          subject,
          html,
        }),
      });

      if (res.ok) {
        console.log(`[email-service] Successfully dispatched email via Resend to ${sellerEmail}`);
        return { success: true, delivered: true };
      } else {
        const errData = await res.json().catch(() => ({}));
        console.warn("[email-service] Resend API error:", errData);
      }
    } catch (e: any) {
      console.warn("[email-service] Failed to call Resend API:", e?.message);
    }
  }

  // 2. Fallback: No email provider configured — log but report not delivered
  console.log(`[CampusLoop Mailer] No RESEND_API_KEY configured. Email NOT delivered to ${sellerEmail}.`);
  console.log(`[CampusLoop Mailer] Subject: ${subject}`);
  console.log(`[CampusLoop Mailer] To enable email delivery, add RESEND_API_KEY to .env.local`);

  // Still return success: true so the rest of the flow continues,
  // but delivered: false so the UI can be honest with the user
  return { success: true, delivered: false };
}
