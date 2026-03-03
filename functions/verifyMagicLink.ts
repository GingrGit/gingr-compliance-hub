import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
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

    return Response.json({ 
      success: true,
      profile_id: link.profile_id,
      phone: link.phone
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});