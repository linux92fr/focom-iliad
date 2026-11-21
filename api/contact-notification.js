const subjectLabels = {
  rights: "Question sur mes droits",
  representation: "Contacter un représentant",
  campaign: "Revendiquer ou participer à une action",
  membership: "Informations sur l’adhésion",
  other: "Autre demande",
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

export async function sendContactNotification(apiKey, { name, email, company, establishment, subject, message }) {
  const subjectLabel = subjectLabels[subject] || subjectLabels.other;
  const receivedAt = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).format(new Date());
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeCompany = escapeHtml(company || "Non précisée");
  const safeEstablishment = escapeHtml(establishment || "Non précisé");
  const safeSubject = escapeHtml(subjectLabel);
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br>");
  const safeReceivedAt = escapeHtml(receivedAt);

  const lines = [
    "Une nouvelle demande a été envoyée depuis le formulaire du portail FOCOM ILIAD.",
    "",
    `Nom : ${name}`,
    `Adresse e-mail : ${email}`,
    `Société : ${company || "Non précisée"}`,
    `Établissement : ${establishment || "Non précisé"}`,
    `Sujet : ${subjectLabel}`,
    `Reçu le : ${receivedAt}`,
    "",
    "Message :",
    message,
    "",
    "Répondre directement à l'expéditeur : " + email,
  ];

  const htmlContent = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Nouvelle demande de contact – FOCOM ILIAD</title>
</head>
<body style="margin:0;padding:0;background:#f1f4f8;font-family:Arial,Helvetica,sans-serif;color:#172033;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f1f4f8;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-collapse:separate;border-spacing:0;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="background:#142b4a;padding:24px 30px;text-align:left;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td width="76" valign="middle">
                  <img src="https://focom-iliad.fr/focom-logo.jpg" width="64" alt="FOCOM" style="display:block;width:64px;max-width:64px;height:auto;border:0;">
                </td>
                <td valign="middle" style="color:#ffffff;">
                  <div style="font-size:20px;line-height:26px;font-weight:bold;letter-spacing:.5px;">FOCOM ILIAD</div>
                  <div style="font-size:11px;line-height:17px;color:#d8e3f1;letter-spacing:1.2px;">PORTAIL SYNDICAL DU GROUPE</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:30px 30px 12px;">
            <div style="font-size:11px;line-height:16px;font-weight:bold;letter-spacing:1.3px;color:#c32630;text-transform:uppercase;">Nouvelle notification</div>
            <h1 style="margin:8px 0 10px;font-size:24px;line-height:31px;color:#142b4a;">Nouvelle demande de contact</h1>
            <p style="margin:0;font-size:14px;line-height:22px;color:#586579;">Un message vient d’être envoyé depuis le formulaire de contact du site FOCOM ILIAD.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 30px 8px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f6f8fb;border:1px solid #e2e8f0;border-radius:8px;">
              <tr><td style="padding:18px 20px;">
                <div style="font-size:11px;line-height:16px;font-weight:bold;color:#718096;text-transform:uppercase;letter-spacing:1px;">Coordonnées de l’expéditeur</div>
                <div style="padding-top:12px;font-size:15px;line-height:22px;color:#172033;"><strong>Nom :</strong> ${safeName}</div>
                <div style="padding-top:5px;font-size:14px;line-height:21px;color:#172033;"><strong>E-mail :</strong> <a href="mailto:${safeEmail}" style="color:#1d5fa7;text-decoration:underline;">${safeEmail}</a></div>
                <div style="padding-top:5px;font-size:14px;line-height:21px;color:#172033;"><strong>Société :</strong> ${safeCompany}</div>
                <div style="padding-top:5px;font-size:14px;line-height:21px;color:#172033;"><strong>Établissement :</strong> ${safeEstablishment}</div>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 30px 8px;">
            <div style="font-size:11px;line-height:16px;font-weight:bold;color:#718096;text-transform:uppercase;letter-spacing:1px;">Sujet de la demande</div>
            <div style="padding-top:7px;font-size:16px;line-height:23px;font-weight:bold;color:#142b4a;">${safeSubject}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 30px 8px;">
            <div style="font-size:11px;line-height:16px;font-weight:bold;color:#718096;text-transform:uppercase;letter-spacing:1px;">Message</div>
            <div style="margin-top:9px;padding:18px 20px;background:#ffffff;border:1px solid #e2e8f0;border-left:4px solid #c32630;border-radius:6px;font-size:14px;line-height:23px;color:#263449;overflow-wrap:anywhere;">${safeMessage}</div>
          </td>
        </tr>
        <tr>
          <td align="left" style="padding:22px 30px 12px;">
            <a href="mailto:${safeEmail}" style="display:inline-block;padding:13px 21px;background:#c32630;color:#ffffff;text-decoration:none;font-size:14px;line-height:18px;font-weight:bold;border-radius:6px;">Répondre à cette demande</a>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 30px 26px;">
            <div style="font-size:12px;line-height:19px;color:#718096;">Reçu le ${safeReceivedAt} (heure de Paris)</div>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 30px;background:#142b4a;text-align:center;">
            <div style="font-size:12px;line-height:19px;color:#ffffff;font-weight:bold;">FOCOM ILIAD</div>
            <div style="font-size:11px;line-height:18px;color:#d8e3f1;">Informer · Défendre · Agir</div>
            <a href="https://focom-iliad.fr" style="font-size:11px;line-height:20px;color:#ffffff;text-decoration:underline;">focom-iliad.fr</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: "contact@focom-iliad.fr", name: "FOCOM ILIAD" },
      to: [{ email: "contact@focom-iliad.fr", name: "FOCOM ILIAD" }],
      replyTo: { email, name },
      subject: `[FOCOM ILIAD] Nouvelle demande : ${subjectLabel}`,
      textContent: lines.join("\n"),
      htmlContent,
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    let details = "";
    try {
      const error = JSON.parse(responseBody);
      details = [error.code, error.message].filter(value => typeof value === "string" && value.trim()).join(": ");
    } catch {
      details = responseBody.replace(/\s+/g, " ").trim().slice(0, 300);
    }
    throw new Error(`Brevo returned HTTP ${response.status}${details ? `: ${details.slice(0, 500)}` : ""}`);
  }
}
