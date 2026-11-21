const interests = new Map([
  ['', 'Keine Angabe'],
  ['wohn', 'Wohnmöbel'],
  ['garten', 'Gartenmöbel'],
  ['aussen', 'Außergewöhnliches'],
  ['sonstiges', 'Sonstiges'],
]);

export async function POST(request) {
  if (!/^application\/json(?:;|$)/i.test(request.headers.get('content-type') || '')) {
    return Response.json({ ok: false }, { status: 415 });
  }

  let data;
  try {
    const body = await request.text();
    if (body.length > 32_000) {
      return Response.json({ ok: false }, { status: 413 });
    }
    data = JSON.parse(body);
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const fields = ['name', 'email', 'phone', 'interest', 'message', 'website', 'submissionId'];
  if (!fields.every(field => typeof data[field] === 'string')) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const { name, email, phone, interest, message, website, submissionId } =
    Object.fromEntries(fields.map(field => [field, data[field].trim()]));
  const emailPattern = /^[^\s@,<>]+@[^\s@,<>]+\.[^\s@,<>]+$/u;
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (website || !name || name.length > 120 || email.length > 254 || !emailPattern.test(email) ||
      phone.length > 40 || !interests.has(interest) || !message || message.length > 5000 ||
      !uuidPattern.test(submissionId)) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const { RESEND_API_KEY, CONTACT_FROM_EMAIL, CONTACT_TEST_TO_EMAIL, VERCEL_ENV } = process.env;
  const isPreview = VERCEL_ENV === 'preview';
  const isProduction = VERCEL_ENV === 'production';
  const from = isPreview ? 'onboarding@resend.dev' : CONTACT_FROM_EMAIL;
  const recipient = isProduction ? 'office@hartholz.at' : CONTACT_TEST_TO_EMAIL?.trim();
  if ((!isPreview && !isProduction) || !RESEND_API_KEY || !from ||
      !recipient || !emailPattern.test(recipient)) {
    return Response.json({ ok: false }, { status: 503 });
  }

  try {
    const result = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `hartholz-contact/${submissionId}`,
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        reply_to: email,
        subject: 'Website-Anfrage | Hartholz',
        text: [
          `Name: ${name}`,
          `E-Mail: ${email}`,
          `Telefon: ${phone || 'Keine Angabe'}`,
          `Interesse: ${interests.get(interest)}`,
          '',
          message,
        ].join('\n'),
      }),
      signal: AbortSignal.timeout(8_000),
    });

    if (result.ok && (await result.json()).id) {
      return Response.json({ ok: true });
    }
    console.error('Contact email rejected by Resend:', result.status);
  } catch {
    console.error('Contact email request failed.');
  }

  return Response.json({ ok: false }, { status: 502 });
}
