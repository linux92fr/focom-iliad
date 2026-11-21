const subjectLabels = {
  rights: "Question sur mes droits",
  representation: "Contacter un représentant",
  campaign: "Revendiquer ou participer à une action",
  membership: "Informations sur l’adhésion",
  other: "Autre demande",
};

export async function sendContactNotification(apiKey, { name, email, company, establishment, subject, message }) {
  const lines = [
    "Une nouvelle demande a été envoyée depuis le formulaire du portail FOCOM ILIAD.",
    "",
    `Nom : ${name}`,
    `Adresse e-mail : ${email}`,
    `Société : ${company || "Non précisée"}`,
    `Établissement : ${establishment || "Non précisé"}`,
    `Sujet : ${subjectLabels[subject]}`,
    "",
    "Message :",
    message,
  ];

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
      subject: `[FOCOM ILIAD] Nouvelle demande : ${subjectLabels[subject]}`,
      textContent: lines.join("\n"),
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
