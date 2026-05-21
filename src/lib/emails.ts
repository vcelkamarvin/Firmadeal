// Production email templates for Firmadeal transactional emails.
// All styles are inline. All colored boxes use <table>/<td> — never <div> —
// because Gmail strips background-color from <div> elements.

const FONT = "Helvetica Neue, Helvetica, Arial, sans-serif";
const DARK_GREEN = "#1a3329";

function fmtEur(n: number): string {
  return n.toLocaleString("de-DE");
}

function btn(href: string, text: string, outline = false): string {
  if (outline) {
    return `<a href="${href}" style="display:inline-block;background:transparent;color:${DARK_GREEN};text-decoration:none;padding:12px 26px;border-radius:6px;font-size:14px;font-weight:600;border:2px solid ${DARK_GREEN};font-family:${FONT};">${text}</a>`;
  }
  return `<a href="${href}" style="display:inline-block;background:${DARK_GREEN};color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:6px;font-size:14px;font-weight:600;font-family:${FONT};">${text}</a>`;
}

// Stat box — uses <td> so background renders in Gmail
function statBox(value: string, label: string): string {
  return `<td style="padding:0 5px;" width="33%">
    <table cellpadding="0" cellspacing="0" width="100%">
      <tr><td style="background:#f5faf7;border:1px solid #d4eadc;border-radius:6px;padding:16px 8px;text-align:center;">
        <p style="margin:0 0 4px;font-size:22px;font-weight:800;color:${DARK_GREEN};font-family:${FONT};">${value}</p>
        <p style="margin:0;font-size:11px;color:#6b7280;line-height:1.4;font-family:${FONT};">${label}</p>
      </td></tr>
    </table>
  </td>`;
}

// Listing card — full table structure, no divs
function listingCard(
  title: string,
  location?: string | null,
  category?: string | null,
  price?: number | null,
  ebitda?: number | null,
): string {
  const multiple =
    price && ebitda && ebitda > 0 ? (price / ebitda).toFixed(1) : null;
  return `
  <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
    <tr><td style="background:#f5faf7;border:2px solid #d4eadc;border-radius:8px;padding:20px 24px;">
      <p style="margin:0 0 4px;font-size:10px;color:#6b7280;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;font-family:${FONT};">INSERAT</p>
      <p style="margin:0 0 10px;font-size:18px;font-weight:700;color:#111827;line-height:1.3;font-family:${FONT};">${title}</p>
      <table cellpadding="0" cellspacing="0"><tr>
        ${location ? `<td style="padding-right:12px;"><span style="font-size:12px;color:#4b5563;font-family:${FONT};">&#128205; ${location}</span></td>` : ""}
        ${category ? `<td><table cellpadding="0" cellspacing="0"><tr><td style="background:#e8f0ea;border-radius:4px;padding:3px 8px;"><span style="color:${DARK_GREEN};font-size:11px;font-weight:700;font-family:${FONT};">${category}</span></td></tr></table></td>` : ""}
      </tr></table>
      ${price ? `<p style="margin:10px 0 0;font-size:17px;font-weight:700;color:${DARK_GREEN};font-family:${FONT};">&#8364;${fmtEur(price)}${multiple ? ` <span style="font-size:12px;font-weight:400;color:#6b7280;">&middot; ${multiple}x EBITDA</span>` : ""}</p>` : ""}
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
<body style="margin:0;padding:0;background:#f0f0ec;">
  <table cellpadding="0" cellspacing="0" width="100%" style="background:#f0f0ec;padding:32px 0;">
    <tr><td align="center" style="padding:0 16px;">

      <!-- Card wrapper -->
      <table cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr><td style="background:${headerBg};padding:28px 40px 24px;border-radius:10px 10px 0 0;">
          <!-- Logo row -->
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:34px;height:34px;background:#ffffff;border-radius:6px;text-align:center;vertical-align:middle;">
                <span style="color:${headerBg};font-size:19px;font-weight:900;line-height:34px;font-family:${FONT};">F</span>
              </td>
              <td style="padding-left:10px;vertical-align:middle;">
                <span style="color:#ffffff;font-size:15px;font-weight:700;letter-spacing:0.02em;font-family:${FONT};">Firmadeal.de</span>
              </td>
            </tr>
          </table>
          <!-- Eyebrow + title -->
          <p style="margin:22px 0 6px;color:rgba(255,255,255,0.6);font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;font-family:${FONT};">${eyebrow}</p>
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;line-height:1.35;font-family:${FONT};">${title}</h1>
        </td></tr>

        <!-- BODY -->
        <tr><td style="background:#ffffff;padding:36px 40px;">
          ${bodyHtml}
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="background:#f6f6f3;border-top:1px solid #e8e8e4;padding:20px 40px;border-radius:0 0 10px 10px;">
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
    ? `<p style="margin:0 0 4px;font-size:13px;color:#374151;font-family:${FONT};">&#128222;&nbsp; ${p.buyerPhone}</p>`
    : `<p style="margin:0 0 4px;font-size:13px;color:#9ca3af;font-family:${FONT};">Telefon nicht angegeben</p>`;

  // Inquiry quote box — uses <table>/<td> so background shows in Gmail
  const inquiryBox = `
  <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
    <tr>
      <!-- Left green bar -->
      <td width="4" style="background:#2d5a3d;border-radius:3px 0 0 3px;">&nbsp;</td>
      <!-- Content -->
      <td style="background:#f5faf7;padding:18px 20px;border-radius:0 6px 6px 0;">
        <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#111827;font-family:${FONT};">${p.buyerName}</p>
        <p style="margin:0 0 4px;font-size:13px;color:#374151;font-family:${FONT};">&#9993;&nbsp; ${p.buyerEmail}</p>
        ${phoneRow}
        <!-- Divider -->
        <table cellpadding="0" cellspacing="0" width="100%" style="margin:12px 0;">
          <tr><td style="border-top:1px solid #d4eadc;font-size:0;">&nbsp;</td></tr>
        </table>
        <p style="margin:0;font-size:14px;color:#374151;font-style:italic;line-height:1.6;font-family:${FONT};">&ldquo;${p.message}&rdquo;</p>
      </td>
    </tr>
  </table>`;

  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;font-family:${FONT};">
      Sie haben eine neue Kaufanfrage f&uuml;r Ihr Inserat erhalten:
    </p>
    ${listingCard(p.listingTitle, p.listingLocation, p.listingCategory, p.listingPrice, p.listingEbitda)}
    ${inquiryBox}
    <!-- Divider -->
    <table cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0;">
      <tr><td style="border-top:1px solid #e8e8e4;font-size:0;">&nbsp;</td></tr>
    </table>
    <p style="margin:0 0 22px;font-size:14px;color:#6b7280;line-height:1.6;font-family:${FONT};">
      Antworten Sie direkt an <a href="mailto:${p.buyerEmail}" style="color:${DARK_GREEN};font-weight:600;">${p.buyerEmail}</a> &mdash; kein Login erforderlich.
    </p>
    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-right:12px;">${btn(`mailto:${p.buyerEmail}`, "Anfrage beantworten &#8594;")}</td>
        <td>${btn(p.listingUrl, "Inserat ansehen", true)}</td>
      </tr>
    </table>
  `;

  const footer = `
  <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;font-family:${FONT};">
    Sie erhalten diese E-Mail, weil Sie ein aktives Inserat auf
    <a href="https://www.firmadeal.de" style="color:#6b7280;text-decoration:none;">Firmadeal.de</a> haben.
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
    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
      <tr><td style="background:#f5faf7;border:1px solid #d4eadc;border-radius:6px;padding:18px 20px;">
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;font-family:${FONT};">
          &#128337;&nbsp; Der Anbieter meldet sich in der Regel <strong>innerhalb von 24&ndash;48 Stunden</strong> bei Ihnen.
        </p>
      </td></tr>
    </table>
    <!-- Divider -->
    <table cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0;">
      <tr><td style="border-top:1px solid #e8e8e4;font-size:0;">&nbsp;</td></tr>
    </table>
    ${btn(`${p.siteUrl}/listings`, "Weitere Inserate durchsuchen", true)}
  `;

  const footer = `
  <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;font-family:${FONT};">
    Firmadeal.de &middot; 0% Provision &middot; Direktkontakt mit Unternehmensverkäufern
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
  return `<tr><td style="padding-bottom:${last ? "0" : "14px"};">
    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="width:36px;height:36px;min-width:36px;background:${DARK_GREEN};border-radius:18px;text-align:center;vertical-align:middle;">
          <span style="color:#ffffff;font-size:12px;font-weight:800;font-family:${FONT};">${day}</span>
        </td>
        <td style="padding-left:14px;vertical-align:top;padding-top:4px;">
          <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#111827;font-family:${FONT};">${title}</p>
          <p style="margin:0;font-size:12px;color:#6b7280;font-family:${FONT};">${desc}</p>
        </td>
      </tr>
    </table>
  </td></tr>`;
}

export function buildTrialWelcomeEmail(p: TrialWelcomeParams): string {
  const body = `
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;font-family:${FONT};">
      Ihr Unternehmen ist ab sofort f&uuml;r <strong>4.102 aktive Kaufinteressenten</strong> sichtbar.
      Hier ist, was in den n&auml;chsten 7 Tagen passiert:
    </p>
    <!-- Timeline -->
    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
      ${timelineStep("1", "Tag 1 &mdash; Inserat ist live", "Ihr Unternehmen erscheint sofort in der K&auml;uferdatenbank")}
      ${timelineStep("2", "Tag 2 &mdash; Matching startet", "Passende Interessenten werden automatisch benachrichtigt")}
      ${timelineStep("3", "Tag 3 &mdash; Newsletter-Versand", "Ihr Inserat im w&ouml;chentlichen K&auml;ufer-Newsletter (8.000+)")}
      ${timelineStep("7", "Tag 7 &mdash; Markttest-Bericht", "Sie erhalten Ihren pers&ouml;nlichen Bericht mit Views &amp; Anfragen", true)}
    </table>
    <!-- Stat boxes — all td, no divs -->
    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
      <tr>
        ${statBox("4.102", "Kaufinteressenten")}
        ${statBox("8.000+", "Newsletter-Abonnenten")}
        ${statBox("0%", "Provision")}
      </tr>
    </table>
    <!-- Divider -->
    <table cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0;">
      <tr><td style="border-top:1px solid #e8e8e4;font-size:0;">&nbsp;</td></tr>
    </table>
    ${btn(p.dashboardUrl, "Inserat vervollst\u00e4ndigen &#8594;")}
  `;

  const footer = `
  <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;font-family:${FONT};">
    Ab Tag 8 wird <strong style="color:#6b7280;">&euro;${p.price}/Monat</strong> berechnet.
    Jederzeit k&uuml;ndbar &mdash; direkt in Ihrem
    <a href="${p.dashboardUrl}" style="color:#6b7280;">Dashboard</a>.
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
    <!-- Amber warning box — td, not div -->
    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
      <tr><td style="background:#fef3cd;border:1px solid #f6c644;border-radius:6px;padding:16px 20px;">
        <p style="margin:0;font-size:14px;color:#92600a;font-weight:700;font-family:${FONT};">
          &#9888;&nbsp; Testzeitraum endet in 3 Tagen
          &middot; Ab ${p.trialEndDate} wird &euro;${p.price}/Monat berechnet
        </p>
      </td></tr>
    </table>
    <p style="margin:0 0 10px;font-size:15px;font-weight:700;color:#111827;font-family:${FONT};">Ihr Markttest-Bericht</p>
    <!-- Stat boxes -->
    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
      <tr>
        ${statBox(String(p.viewsCount), "K\u00e4ufer haben Ihr Inserat gesehen")}
        ${statBox(String(p.inquiriesCount), "Anfragen eingegangen")}
        ${statBox(scoreDisplay, "\u00dcbertragbarkeits-Score")}
      </tr>
    </table>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;font-family:${FONT};">
      Das Interesse ist da &mdash; setzen Sie den Verkaufsprozess fort.
      Ihr Abo verl&auml;ngert sich automatisch, Sie k&ouml;nnen jederzeit in Ihrem Dashboard k&uuml;ndigen.
    </p>
    <!-- Divider -->
    <table cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0;">
      <tr><td style="border-top:1px solid #e8e8e4;font-size:0;">&nbsp;</td></tr>
    </table>
    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-right:12px;">${btn(p.dashboardUrl, "Weiter &mdash; Abo fortsetzen")}</td>
        <td>${btn(`${p.dashboardUrl}?cancel=1`, "K\u00fcndigen", true)}</td>
      </tr>
    </table>
  `;

  const footer = `
  <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;font-family:${FONT};">
    Keine K&uuml;ndigung n&ouml;tig wenn Sie fortfahren m&ouml;chten &mdash;
    das Abo verl&auml;ngert sich automatisch f&uuml;r &euro;${p.price}/Monat.
    Zum K&uuml;ndigen: <a href="${p.dashboardUrl}" style="color:#6b7280;">Dashboard</a>.
  </p>`;

  return buildEmailWrapper(
    "#92600a",
    "IHR TESTZEITRAUM ENDET BALD",
    "Noch 3 Tage kostenlos \u2014 Ihr Markttest-Bericht",
    body,
    footer,
  );
}
