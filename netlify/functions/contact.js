const requiredFields = ['name', 'email', 'subject', 'message'];

export async function handler(event) {
  const wantsHtml = event.headers.accept?.includes('text/html');

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { Allow: 'POST' },
      body: 'Method Not Allowed',
    };
  }

  const form = new URLSearchParams(event.body || '');
  const missing = requiredFields.filter((field) => !form.get(field)?.trim());

  if (missing.length > 0) {
    if (wantsHtml) {
      return {
        statusCode: 303,
        headers: { Location: '/contact?status=error' },
        body: '',
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ ok: false, error: `Missing required fields: ${missing.join(', ')}` }),
    };
  }

  const payload = {
    to: process.env.CONTACT_TO_EMAIL || 'nikola@lazarovco.com',
    from: process.env.CONTACT_FROM_EMAIL,
    subject: `[Lazarov & Co] ${form.get('subject')}`,
    replyTo: form.get('email'),
    text: [
      `Name: ${form.get('name')}`,
      `Email: ${form.get('email')}`,
      '',
      form.get('message'),
    ].join('\n'),
  };

  if (!process.env.CONTACT_WEBHOOK_URL) {
    console.info('Contact form submission received. Configure CONTACT_WEBHOOK_URL to deliver email.', payload);
    if (wantsHtml) {
      return {
        statusCode: 303,
        headers: { Location: '/contact?status=success' },
        body: '',
      };
    }

    return {
      statusCode: 202,
      body: JSON.stringify({ ok: true }),
    };
  }

  const response = await fetch(process.env.CONTACT_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (wantsHtml) {
      return {
        statusCode: 303,
        headers: { Location: '/contact?status=error' },
        body: '',
      };
    }

    return {
      statusCode: 502,
      body: JSON.stringify({ ok: false, error: 'Email delivery failed' }),
    };
  }

  if (wantsHtml) {
    return {
      statusCode: 303,
      headers: { Location: '/contact?status=success' },
      body: '',
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true }),
  };
}
