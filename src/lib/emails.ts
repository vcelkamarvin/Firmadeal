// Production email templates for Firmadeal transactional emails.
// All styles are inline — required for email client compatibility.

const FONT = "Helvetica Neue, Helvetica, Arial, sans-serif";
const DARK_GREEN = "#1a3329";

function fmtEur(n: number): string {
  return n.toLocaleString("de-DE");
}

function btn(href: string, text: string, outline = false): string {
  if (outline) {
    return `<a href="${href}" style="display:inline-block;background:transparent;color:${DARK_GREEN};text-decoration:none;padding:12px 26px;border-radius:8px;font-size:14px;font-weight:600;border:1.5px solid ${DARK_GREEN};font-family:${FONT};">${text}</a>`;
  }
  return `<a href="${href}" style="display:inline-block;background:${DARK_GREEN};color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:8px;font-size:14px;font-weight:600;border:none;font-family:${FONT};">${text}</a>`;
}

function statBox(value: string, label: string): string {
  return `<td style="padding:0 4px;width:33%;">
    <div style="background:#f5faf7;border:1px solid #d4eadc;border-radius:8px;padding:18px 8px;text-align:center;">
      <p style="margin:0 0 4px;font-size:22px;font-weight:800;color:${DARK_GREEN};font-family:${FONT};">${value}</p>
      <p style="margin:0;font-size:11px;color:#6b7280;font-family:${FONT};">${label}</p>
    </div>
  </td>`;
}

function listingCard(
  title: string,
  location?: string | null,
  category?: string | null,
  price?: number | null,
  ebitda?: number | null,
): string {
  const multiple =
    price && ebitda && ebitda > 0 ? (price / ebitda).toFixed(1) : null;
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5faf7;border:1.5px solid #d4eadc;border-radius:8px;margin-bottom:24px;">
    <tr><td style="padding:20px 24px;">
      <p style="margin:0 0 4px;font-size:11px;color:#6b7280;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;font-family:${FONT};">INSERAT</p>
      <p style="margin:0 0 10px;font-size:17px;font-weight:700;color:#111827;font-family:${FONT};">${title}</p>
      <table cellpadding="0" cellspacing="0"><tr>
        ${location ? `<td style="padding-right:10px;"><span style="font-size:12px;color:#4b5563;font-family:${FONT};">&#128205; ${location}</span></td>` : ""}
        ${category ? `<td><span style="background:#e8f0ea;color:${DARK_GREEN};font-size:11px;font-weight:600;padding:3px 8px;border-radius:4px;font-family:${FONT};">${category}</span></td>` : ""}
      </tr></table>
      ${price ? `<p style="margin:10px 0 0;font-size:16px;font-weight:700;color:${DARK_GREEN};font-family:${FONT};">&#8364;${fmtEur(price)}${multiple ? ` <span style="font-size:12px;font-weight:400;color:#6b7280;">&middot; ${multiple}x EBITDA</span>` : ""}</p>` : ""}
    </td></tr>
  </table>`;
}

// ─── Shell ────────────────────────────────────────────────────────────────────

export function buildEmailWrapper(
  headerBg: string,
  eyebrow: string,
  title: string,
  bodyHtml: string,
  footerHtml: string,
): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:${FONT};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:32px 16px;">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr><td style="background:${headerBg};padding:32px 40px;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="width:32px;height:32px;background:#ffffff;border-radius:6px;text-align:center;vertical-align:middle;line-height:32px;">
              <span style="color:${headerBg};font-size:18px;font-weight:800;font-family:${FONT};">F</span>
            </td>
            <td style="padding-left:10px;vertical-align:middle;">
              <span style="color:#ffffff;font-size:15px;font-weight:600;font-family:${FONT};">Firmadeal.de</span>
            </td>
          </tr></table>
          <p style="margin:20px 0 6px;color:rgba(255,255,255,0.65);font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;font-family:${FONT};">${eyebrow}</p>
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;line-height:1.3;font-family:${FONT};">${title}</h1>
        </td></tr>

        <!-- BODY -->
        <tr><td style="padding:36px 40px;background:#ffffff;">
          ${bodyHtml}
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="background:#f9f9f7;border-top:1px solid #ebebeb;padding:20px 40px;">
          ${footerHtml}
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Email 1 — Seller inquiry notification ────────────────────────────────────

export interface SellerInquiryParams {
  listingTitle: string;
  listingLocation?: string | null;
  listingCategory?: string | null;
  listingPrice?: number | null;
  listingEbitda?: number | null;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string | null;
  message: string;
  listingUrl: string;
}

export function buildSellerInquiryEmail(p: SellerInquiryParams): string {
  const phoneRow = p.buyerPhone
    ? `<p style="margin:0 0 4px;font-size:13px;color:#4b5563;font-family:${FONT};">&#128222; ${p.buyerPhone}</p>`
    : `<p style="margin:0 0 4px;font-size:13px;color:#9ca3af;font-family:${FONT};">Telefon: nicht angegeben</p>`;

  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;font-family:${FONT};">
      Sie haben eine neue Kaufanfrage f&uuml;r Ihr Inserat erhalten. Hier sind alle Details:
    </p>
    ${listingCard(p.listingTitle, p.listingLocation, p.listingCategory, p.listingPrice, p.listingEbitda)}
    <div style="background:#f5faf7;border-left:3px solid #2d5a3d;border-radius:0 6px 6px 0;padding:18px 20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#111827;font-family:${FONT};">${p.buyerName}</p>
      <p style="margin:0 0 4px;font-size:13px;color:#4b5563;font-family:${FONT};">&#9993; ${p.buyerEmail}</p>
      ${phoneRow}
      <hr style="border:none;border-top:1px solid #d4eadc;margin:12px 0;">
      <p style="margin:0;font-size:14px;color:#374151;font-style:italic;line-height:1.6;font-family:${FONT};">&ldquo;${p.message}&rdquo;</p>
    </div>
    <hr style="border:none;border-top:1px solid #ebebeb;margin:24px 0;">
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;font-family:${FONT};">
      Antworten Sie direkt an <a href="mailto:${p.buyerEmail}" style="color:${DARK_GREEN};font-weight:600;">${p.buyerEmail}</a> &mdash; kein Login erforderlich.
    </p>
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="padding-right:12px;">${btn(`mailto:${p.buyerEmail}`, "Anfrage beantworten &#8594;")}</td>
      <td>${btn(p.listingUrl, "Inserat ansehen", true)}</td>
    </tr></table>
  `;

  const footer = `<p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;font-family:${FONT};">
    Sie erhalten diese E-Mail, weil Sie ein aktives Inserat auf <a href="https://www.firmadeal.de" style="color:#6b7280;">Firmadeal.de</a> haben.
    Anfragen werden direkt weitergeleitet &mdash; 0% Provision.
  </p>`;

  return buildEmailWrapper(
    DARK_GREEN,
    "NEUE K\u00c4UFERANFRAGE",
    "Jemand interessiert sich f\u00fcr Ihr Unternehmen",
    body,
    footer,
  );
}

// ─── Email 2 — Buyer confirmation ────────────────────────────────────────────

export interface BuyerConfirmationParams {
  listingTitle: string;
  listingLocation?: string | null;
  listingPrice?: number | null;
  siteUrl: string;
}

export function buildBuyerConfirmationEmail(p: BuyerConfirmationParams): string {
  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;font-family:${FONT};">
      Ihre Anfrage wurde erfolgreich &uuml;bermittelt. Der Anbieter wurde benachrichtigt.
    </p>
    ${listingCard(p.listingTitle, p.listingLocation, null, p.listingPrice)}
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5faf7;border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:18px 20px;">
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;font-family:${FONT};">
          &#9200; Der Anbieter meldet sich in der Regel <strong>innerhalb von 24&ndash;48 Stunden</strong> bei Ihnen.
        </p>
      </td></tr>
    </table>
    <hr style="border:none;border-top:1px solid #ebebeb;margin:24px 0;">
    ${btn(`${p.siteUrl}/listings`, "Weitere Inserate durchsuchen", true)}
  `;

  const footer = `<p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;font-family:${FONT};">
    Firmadeal.de &middot; 0% Provision &middot; Direkte Kontaktaufnahme mit Unternehmensverkäufern
  </p>`;

  return buildEmailWrapper(
    DARK_GREEN,
    "ANFRAGE GESENDET \u2713",
    "Ihre Anfrage wurde erfolgreich \u00fcbermittelt",
    body,
    footer,
  );
}

// ─── Email 3 — Trial welcome ──────────────────────────────────────────────────

export interface TrialWelcomeParams {
  price: string;
  dashboardUrl: string;
}

function timelineStep(day: string, title: string, desc: string, last = false): string {
  return `<tr><td style="padding-bottom:${last ? 0 : 16}px;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="width:36px;height:36px;min-width:36px;background:${DARK_GREEN};border-radius:50%;text-align:center;vertical-align:middle;">
        <span style="color:#ffffff;font-size:11px;font-weight:700;font-family:${FONT};">${day}</span>
      </td>
      <td style="padding-left:14px;vertical-align:middle;">
        <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#111827;font-family:${FONT};">${title}</p>
        <p style="margin:0;font-size:13px;color:#6b7280;font-family:${FONT};">${desc}</p>
      </td>
    </tr></table>
  </td></tr>`;
}

export function buildTrialWelcomeEmail(p: TrialWelcomeParams): string {
  const body = `
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;font-family:${FONT};">
      Ihr Unternehmen ist ab sofort f&uuml;r <strong>4.102 aktive Kaufinteressenten</strong> sichtbar.
      Hier ist, was in den n&auml;chsten Tagen passiert:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${timelineStep("1", "Tag 1 &mdash; Inserat ist live", "Ihr Unternehmen erscheint in der K&auml;uferdatenbank")}
      ${timelineStep("2", "Tag 2 &mdash; Matching l&auml;uft", "Passende Interessenten werden automatisch benachrichtigt")}
      ${timelineStep("3", "Tag 3 &mdash; Newsletter-Versand", "Ihr Inserat erscheint im w&ouml;chentlichen K&auml;ufer-Newsletter (8.000+)")}
      ${timelineStep("7", "Tag 7 &mdash; Markttest-Bericht", "Sie erhalten einen Bericht mit Views, Anfragen und Bewertung", true)}
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;"><tr>
      ${statBox("4.102", "Kaufinteressenten")}
      ${statBox("8.000+", "Newsletter-Abonnenten")}
      ${statBox("0%", "Provision")}
    </tr></table>
    <hr style="border:none;border-top:1px solid #ebebeb;margin:24px 0;">
    ${btn(p.dashboardUrl, "Inserat vervollst\u00e4ndigen &#8594;")}
  `;

  const footer = `<p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;font-family:${FONT};">
    Ab Tag 8 wird <strong style="color:#6b7280;">&euro;${p.price}/Monat</strong> berechnet. Jederzeit k&uuml;ndbar &mdash;
    direkt in Ihrem <a href="${p.dashboardUrl}" style="color:#6b7280;">Dashboard</a>.
  </p>`;

  return buildEmailWrapper(
    DARK_GREEN,
    "IHR MARKTTEST STARTET JETZT",
    "Ihr Inserat ist live \u2014 7 Tage kostenlos",
    body,
    footer,
  );
}

// ─── Email 4 — Trial ending ───────────────────────────────────────────────────

export interface TrialEndingParams {
  price: string;
  trialEndDate: string;
  viewsCount: number;
  inquiriesCount: number;
  transferabilityScore?: number | null;
  dashboardUrl: string;
}

export function buildTrialEndingEmail(p: TrialEndingParams): string {
  const scoreDisplay =
    p.transferabilityScore != null ? `${p.transferabilityScore}/10` : "N/A";

  const body = `
    <div style="background:#fef3cd;border:1px solid #f59e0b;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#92600a;font-weight:600;font-family:${FONT};">
        &#9888; Testzeitraum endet in 3 Tagen &middot; Ab ${p.trialEndDate} wird &euro;${p.price}/Monat berechnet
      </p>
    </div>
    <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#111827;font-family:${FONT};">Ihr Markttest-Bericht</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;"><tr>
      ${statBox(String(p.viewsCount), "K\u00e4ufer haben Ihr Inserat gesehen")}
      ${statBox(String(p.inquiriesCount), "Anfragen eingegangen")}
      ${statBox(scoreDisplay, "\u00dcbertragbarkeits-Score")}
    </tr></table>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;font-family:${FONT};">
      Das Interesse ist da &mdash; setzen Sie den Verkaufsprozess fort. Ihr Abo verl&auml;ngert sich
      automatisch und Sie k&ouml;nnen jederzeit in Ihrem Dashboard k&uuml;ndigen.
    </p>
    <hr style="border:none;border-top:1px solid #ebebeb;margin:24px 0;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="padding-right:12px;">${btn(p.dashboardUrl, "Weiter &mdash; Abo fortsetzen")}</td>
      <td>${btn(`${p.dashboardUrl}?cancel=1`, "K\u00fcndigen", true)}</td>
    </tr></table>
  `;

  const footer = `<p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;font-family:${FONT};">
    Keine K&uuml;ndigung n&ouml;tig, wenn Sie fortfahren m&ouml;chten &mdash; das Abo verl&auml;ngert sich automatisch f&uuml;r &euro;${p.price}/Monat.
    Zum K&uuml;ndigen besuchen Sie Ihr <a href="${p.dashboardUrl}" style="color:#6b7280;">Dashboard</a>.
  </p>`;

  return buildEmailWrapper(
    "#92600a",
    "IHR TESTZEITRAUM ENDET BALD",
    "Noch 3 Tage kostenlos \u2014 Ihr Markttest-Bericht",
    body,
    footer,
  );
}
