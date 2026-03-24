import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file');
    const profile_id = formData.get('profile_id');
    const document_type = formData.get('document_type'); // "permit" | "id" | "business_proof"

    if (!file || !profile_id || !document_type) {
      return Response.json({ error: 'file, profile_id and document_type are required' }, { status: 400 });
    }

    const accessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const region = Deno.env.get('AWS_REGION');
    const bucket = Deno.env.get('AWS_S3_BUCKET_NAME');

    if (!accessKeyId || !secretAccessKey || !region || !bucket) {
      return Response.json({ error: 'AWS credentials not configured' }, { status: 500 });
    }

    const fileName = file.name || `document_${Date.now()}`;
    const s3Key = `onboarding/${profile_id}/${document_type}/${fileName}`;
    const s3Url = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;

    // Build AWS Signature V4 for PUT
    const now = new Date();
    const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, '');
    const amzDate = now.toISOString().replace(/[:-]/g, '').slice(0, 15) + 'Z';
    const service = 's3';
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

    const fileBytes = await file.arrayBuffer();
    const payloadHashBuffer = await crypto.subtle.digest('SHA-256', fileBytes);
    const payloadHash = Array.from(new Uint8Array(payloadHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    const canonicalHeaders =
      `host:${bucket}.s3.${region}.amazonaws.com\n` +
      `x-amz-content-sha256:${payloadHash}\n` +
      `x-amz-date:${amzDate}\n`;

    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';

    const canonicalRequest = [
      'PUT',
      `/${s3Key}`,
      '',
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n');

    const canonicalRequestHash = Array.from(
      new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest)))
    ).map(b => b.toString(16).padStart(2, '0')).join('');

    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      canonicalRequestHash,
    ].join('\n');

    // Derive signing key
    const sign = async (key, msg) => {
      const k = typeof key === 'string' ? new TextEncoder().encode(key) : key;
      const cryptoKey = await crypto.subtle.importKey('raw', k, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
      return new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(msg)));
    };

    const kDate = await sign(`AWS4${secretAccessKey}`, dateStamp);
    const kRegion = await sign(kDate, region);
    const kService = await sign(kRegion, service);
    const kSigning = await sign(kService, 'aws4_request');
    const signatureBytes = await sign(kSigning, stringToSign);
    const signature = Array.from(signatureBytes).map(b => b.toString(16).padStart(2, '0')).join('');

    const authorization =
      `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, ` +
      `SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const uploadResponse = await fetch(s3Url, {
      method: 'PUT',
      headers: {
        'Authorization': authorization,
        'x-amz-date': amzDate,
        'x-amz-content-sha256': payloadHash,
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: fileBytes,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      return Response.json({ error: `S3 upload failed: ${errorText}` }, { status: 500 });
    }

    return Response.json({ s3_key: s3Key, s3_url: s3Url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});