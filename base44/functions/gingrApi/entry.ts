import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  // Validate API key
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || apiKey !== Deno.env.get("GINGR_API_KEY")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const base44 = createClientFromRequest(req);
  const body = await req.json().catch(() => ({}));
  const { action, escort_email, document_uri } = body;

  if (!action) {
    return Response.json({ error: "Missing 'action' parameter" }, { status: 400 });
  }

  // Action: get_profile
  if (action === "get_profile") {
    if (!escort_email) {
      return Response.json({ error: "Missing 'escort_email'" }, { status: 400 });
    }

    const profiles = await base44.asServiceRole.entities.OnboardingProfile.filter({ escort_email });
    if (!profiles || profiles.length === 0) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    const p = profiles[0];
    return Response.json({
      id: p.id,
      escort_email: p.escort_email,
      status: p.status,
      work_model: p.work_model,
      first_name: p.first_name,
      last_name: p.last_name,
      date_of_birth: p.date_of_birth,
      nationality: p.nationality,
      citizenship_group: p.citizenship_group,
      address: p.address,
      city: p.city,
      postal_code: p.postal_code,
      phone: p.phone,
      permit_type: p.permit_type,
      permit_status: p.permit_status,
      contract_signed: p.contract_signed,
      contract_signed_at: p.contract_signed_at,
      submitted_at: p.submitted_at,
      employment_start_date: p.employment_start_date,
      prostitution_permit_status: p.prostitution_permit_status,
    });
  }

  // Action: get_documents
  if (action === "get_documents") {
    if (!escort_email) {
      return Response.json({ error: "Missing 'escort_email'" }, { status: 400 });
    }

    const profiles = await base44.asServiceRole.entities.OnboardingProfile.filter({ escort_email });
    if (!profiles || profiles.length === 0) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    const profile_id = profiles[0].id;
    const docs = await base44.asServiceRole.entities.EscortDocument.filter({ profile_id });

    return Response.json({
      profile_id,
      documents: docs.map(d => ({
        id: d.id,
        type: d.type,
        label: d.label,
        period: d.period,
        status: d.status,
        file_url: d.file_url,
        uploaded_by_admin: d.uploaded_by_admin,
        created_date: d.created_date,
      }))
    });
  }

  // Action: get_signed_url
  if (action === "get_signed_url") {
    if (!document_uri) {
      return Response.json({ error: "Missing 'document_uri'" }, { status: 400 });
    }

    const { signed_url } = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
      file_uri: document_uri,
      expires_in: 300,
    });

    return Response.json({ signed_url, expires_in: 300 });
  }

  return Response.json({ error: `Unknown action '${action}'` }, { status: 400 });
});