import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const apiKey = Deno.env.get('DOCUSEAL_API_KEY');

    const response = await fetch('https://api.docuseal.com/templates', {
      headers: {
        'X-Auth-Token': apiKey,
      },
    });

    const data = await response.json();
    return Response.json({ status: response.status, data, keyPreview: apiKey?.slice(0, 8) + '...' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});