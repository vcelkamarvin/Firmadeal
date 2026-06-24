// The anti-slop gate (voice-firewall). Combines cheap deterministic heuristics
// with a Claude "critic" pass. An article publishes ONLY if every critical
// dimension clears the threshold AND heuristics pass. Otherwise it's held for review.

const CRITICAL = ["information_gain", "eeat_accuracy", "german_quality"]; // these must clear the bar

export async function runQualityGate({ client, model, article, niche, threshold, banned }) {
  const body = `${article.title}\n${article.bodyMdx}\n${(article.faq || []).map(f => f.q + " " + f.a).join("\n")}`;

  // 1) Heuristics — fast, deterministic, no tokens.
  const words = body.split(/\s+/).filter(Boolean).length;
  if (words < 800) return { pass: false, reason: `zu kurz (${words} Wörter)`, min: 0 };
  const lc = body.toLowerCase();
  const hit = banned.find(p => lc.includes(p.toLowerCase()));
  if (hit) return { pass: false, reason: `verbotene Phrase: "${hit}"`, min: 0 };
  if (!/\/sell/.test(body) || !/\/listings/.test(body)) return { pass: false, reason: "interne Pflichtlinks fehlen", min: 0 };
  if ((article.faq || []).length < 4) return { pass: false, reason: "zu wenige FAQ", min: 0 };
  if (!article.sources || article.sources.length < 1) return { pass: false, reason: "keine Quellen", min: 0 };

  // 2) Claude critic — scores each dimension 0–10 and flags invented figures.
  const prompt = `Bewerte diesen deutschen SEO-Ratgeber für die Nische "${niche.title}".
Gib NUR JSON zurück:
{"intent_match":0-10,"information_gain":0-10,"uniqueness":0-10,"eeat_accuracy":0-10,
"factual_safety":0-10,"german_quality":0-10,"structure":0-10,
"invented_numbers":true|false,"notes":"kurz"}
Sei streng beim Mehrwert: Rehash der Top-Ergebnisse ohne Mehrwert -> information_gain niedrig.

WICHTIG zu Zahlen — unterscheide genau:
- ERLAUBT (NICHT als erfundene Zahlen werten): klar als Beispiel, Annahme oder Szenario
  gekennzeichnete Rechenbeispiele, z. B. "Angenommen, der Umsatz beträgt 500.000 €, dann …"
  oder ein durchgerechnetes Bewertungsbeispiel mit Multiplikator. Solche illustrativen
  Beispielzahlen sind ausdrücklich gewünscht und KEIN Grund für invented_numbers=true.
- NICHT ERLAUBT: konkrete STATISTIKEN oder Marktdaten, die als Tatsache dargestellt werden,
  ohne Quelle (z. B. "73 % aller Praxen werden ohne Makler verkauft", "der Durchschnittspreis
  liegt bei 1,2 Mio. €"). Nur DAFÜR setze invented_numbers=true und factual_safety niedrig.

Im Zweifel, wenn die Zahl klar als Beispiel/Annahme erkennbar ist: invented_numbers=false.

ARTIKEL:
${body.slice(0, 12000)}`;

  const msg = await client.messages.create({ model, max_tokens: 600, temperature: 0, messages: [{ role: "user", content: prompt }] });
  const t = msg.content.map(b => b.text || "").join("");
  let s;
  try { s = JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1)); }
  catch { return { pass: false, reason: "Critic-Antwort nicht lesbar", min: 0 }; }

  if (s.invented_numbers) return { pass: false, reason: "erfundene Zahlen erkannt", min: 0, scores: s };

  const dims = ["intent_match","information_gain","uniqueness","eeat_accuracy","factual_safety","german_quality","structure"];
  const min = Math.min(...dims.map(d => Number(s[d] ?? 0)));
  const criticalFail = CRITICAL.find(d => Number(s[d] ?? 0) < threshold);
  if (criticalFail) return { pass: false, reason: `${criticalFail}=${s[criticalFail]} < ${threshold}`, min, scores: s };
  if (min < threshold - 1) return { pass: false, reason: `Dimension unter Bar (min ${min})`, min, scores: s };

  return { pass: true, min, scores: s };
}
