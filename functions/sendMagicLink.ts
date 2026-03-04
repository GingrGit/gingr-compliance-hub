import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function generateToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { profile_id, phone, email, app_url } = await req.json();

    if (!profile_id) {
      return Response.json({ error: 'profile_id is required' }, { status: 400 });
    }

    const token = generateToken();
    const expires_at = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year

    await base44.asServiceRole.entities.MagicLink.create({
      token,
      profile_id,
      phone: phone || '',
      expires_at,
      used: false
    });

    const dashboardUrl = `${app_url}/magic-dashboard?token=${token}`;

    const results = {};

    // Send SMS via Twilio if phone provided
    if (phone) {
      const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

      const credentials = btoa(`${accountSid}:${authToken}`);
      const smsResponse = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            From: fromNumber,
            To: phone,
            Body: `Dein gingr-Dashboard-Link: ${dashboardUrl}`
          })
        }
      );

      results.sms = smsResponse.ok ? 'sent' : 'failed';
    }

    // Send Email via Resend if email provided
    if (email) {
      const resendKey = Deno.env.get('RESEND_API_KEY');
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'gingr <onboarding@gingr.ch>',
          to: [email],
          subject: 'Dein persönlicher gingr-Dashboard-Link',
          text: `Hallo!\n\nHier ist dein persönlicher Link zu deinem gingr-Dashboard:\n\n${dashboardUrl}\n\nDu kannst diesen Link jederzeit verwenden, um deinen Status und deine Dokumente einzusehen.\n\nBei Fragen stehen wir dir gerne zur Verfügung.\n\nDein gingr-Team`
        })
      });
      results.email = emailResponse.ok ? 'sent' : 'failed';
      if (!emailResponse.ok) {
        const err = await emailResponse.json();
        results.email_error = err;
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});