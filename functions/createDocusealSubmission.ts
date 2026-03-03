import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { template_id, email, name } = await req.json();

    if (!template_id) {
      return Response.json({ error: 'template_id is required' }, { status: 400 });
    }

    const signerEmail = email || user.email;

    const response = await fetch('https://api.docuseal.com/submissions', {
      method: 'POST',
      headers: {
        'X-Auth-Token': Deno.env.get('DOCUSEAL_API_KEY'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template_id,
        send_email: false,
        submitters: [
          {
            email: signerEmail,
            role: 'Escort',
            name: name || signerEmail,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return Response.json({ error: `DocuSeal error: ${err}` }, { status: response.status });
    }

    const data = await response.json();
    // data is an array of submitters; get the slug of the first one
    const slug = Array.isArray(data) ? data[0]?.slug : data?.submitters?.[0]?.slug;

    return Response.json({ slug });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});