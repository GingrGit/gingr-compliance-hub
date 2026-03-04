import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  // Allow unauthenticated calls — magic link users are not logged in
  try {
    const base44 = createClientFromRequest(req);
    const { token } = await req.json();

    if (!token) {
      return Response.json({ error: 'token is required' }, { status: 400 });
    }

    const links = await base44.asServiceRole.entities.MagicLink.filter({ token });

    if (!links || links.length === 0) {
      return Response.json({ error: 'Invalid token' }, { status: 404 });
    }

    const link = links[0];

    if (new Date(link.expires_at) < new Date()) {
      return Response.json({ error: 'Token expired' }, { status: 410 });
    }

    // Fetch the profile so the dashboard can render without auth
    const profiles = await base44.asServiceRole.entities.OnboardingProfile.filter({ id: link.profile_id });
    const profile = profiles?.[0] || null;

    const documents = await base44.asServiceRole.entities.EscortDocument.filter({ profile_id: link.profile_id });

    return Response.json({
      success: true,
      profile_id: link.profile_id,
      profile,
      documents: documents || [],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});