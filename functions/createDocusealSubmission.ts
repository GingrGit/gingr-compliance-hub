import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const TEMPLATE_ID_EMPLOYEE = 439619;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profile } = await req.json();
    if (!profile) {
      return Response.json({ error: 'profile is required' }, { status: 400 });
    }

    const templateId = TEMPLATE_ID_EMPLOYEE;

    // Map work_model to German label for "Variante" field
    const varianteMap = {
      employee_unlimited: 'Unbefristete Anstellung',
      employee_90days: 'Anstellung 90 Tage',
    };

    // Map permit_type to German label for "Aufenthaltsstatus" field
    const aufenthaltsstatusMap = {
      none: 'Keine Bewilligung erforderlich',
      B: 'Ausweis B',
      C: 'Ausweis C',
      L: 'Ausweis L',
      other: 'Andere',
    };

    const submitterEmail = profile.escort_email || user.email;
    const submitterName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || submitterEmail;

    const body = {
      template_id: templateId,
      send_email: false,
      submitters: [
        {
          email: submitterEmail,
          name: submitterName,
          role: 'Escort',
          fields: [
            { name: 'Name', default_value: profile.last_name || '' },
            { name: 'Vorname', default_value: profile.first_name || '' },
            { name: 'Geburtsdatum', default_value: profile.date_of_birth || '' },
            { name: 'Adresse / Strasse', default_value: [profile.address, profile.postal_code, profile.city].filter(Boolean).join(', ') },
            { name: 'Staatsangehörigkeit', default_value: profile.nationality || '' },
            { name: 'Aufenthaltsstatus', default_value: aufenthaltsstatusMap[profile.permit_type] || '' },
            { name: 'Variante', default_value: varianteMap[profile.work_model] || '' },
          ],
        },
      ],
    };

    const response = await fetch('https://api.docuseal.eu/submissions', {
      method: 'POST',
      headers: {
        'X-Auth-Token': Deno.env.get('DOCUSEAL_API_KEY'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      return Response.json({ error: `DocuSeal error: ${err}` }, { status: response.status });
    }

    const data = await response.json();
    const submitter = Array.isArray(data) ? data[0] : data?.submitters?.[0];
    const slug = submitter?.slug;
    const submissionId = submitter?.submission_id;

    return Response.json({ slug, submissionId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});