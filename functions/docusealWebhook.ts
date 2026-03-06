import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    // DocuSeal sends event_type in the webhook payload
    const eventType = payload?.event_type;
    const submission = payload?.data;

    if (!submission) {
      return Response.json({ ok: true });
    }

    // We only care about fully completed submissions (all parties signed)
    if (eventType !== 'submission.completed') {
      return Response.json({ ok: true });
    }

    // Find the profile by submission ID stored in external_id or by email
    const submitters = submission.submitters || [];
    const escortSubmitter = submitters.find(s => s.role === 'Escort') || submitters[0];
    const escortEmail = escortSubmitter?.email;

    if (!escortEmail) {
      return Response.json({ error: 'No escort email found in submission' }, { status: 400 });
    }

    // Find the OnboardingProfile by escort_email
    const profiles = await base44.asServiceRole.entities.OnboardingProfile.filter({ escort_email: escortEmail });
    if (!profiles || profiles.length === 0) {
      return Response.json({ error: 'Profile not found for email: ' + escortEmail }, { status: 404 });
    }

    const profile = profiles[0];
    const profileId = profile.id;

    // Get the document URL (DocuSeal provides it in the submission)
    const documentUrl = submission.documents?.[0]?.url || submission.audit_log_url || null;

    // Update profile: contract_signed = true, status = approved
    await base44.asServiceRole.entities.OnboardingProfile.update(profileId, {
      contract_signed: true,
      contract_signed_at: new Date().toISOString(),
      status: 'approved',
    });

    // Save the signed document as EscortDocument
    if (documentUrl) {
      await base44.asServiceRole.entities.EscortDocument.create({
        profile_id: profileId,
        type: 'contract',
        label: 'Arbeitsvertrag (unterzeichnet)',
        file_url: documentUrl,
        status: 'available',
        uploaded_by_admin: false,
        notes: `DocuSeal Submission ID: ${submission.id}`,
      });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});