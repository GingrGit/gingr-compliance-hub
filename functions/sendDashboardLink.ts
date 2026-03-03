import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function generateToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { profile_id, phone, app_url } = await req.json();

    if (!profile_id || !phone) {
      return Response.json({ error: 'profile_id and phone are required' }, { status: 400 });
    }

    const token = generateToken();
    const expires_at = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year

    await base44.asServiceRole.entities.MagicLink.create({
      token,
      profile_id,
      phone,
      expires_at,
      used: false
    });

    // Dashboard link points to /magic-dashboard page
    const dashboardUrl = `${app_url}/magic-dashboard?token=${token}`;

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
          Body: `Herzlichen Glückwunsch! 🎉 Dein gingr-Onboarding wurde genehmigt. Hier ist dein persönlicher Dashboard-Link: ${dashboardUrl}`
        })
      }
    );

    if (!smsResponse.ok) {
      const err = await smsResponse.json();
      return Response.json({ error: 'SMS failed', details: err }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});