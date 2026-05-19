import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AGB",
  description: "Allgemeine Geschäftsbedingungen von Firmadeal.de",
};

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-sans font-bold text-[15px] text-[var(--ink)] mb-3">
        § {num} {title}
      </h2>
      <div className="font-sans text-[14px] text-[var(--muted)] leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

export default function AgbPage() {
  return (
    <div className="bg-[var(--bg)] min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="font-sans text-[32px] font-bold text-[var(--ink)] tracking-tight mb-2">
          Allgemeine Geschäftsbedingungen
        </h1>
        <p className="font-sans text-[13px] text-[var(--muted)] mb-10">
          Stand: Mai 2026 — Firmadeal.de
        </p>

        <div className="space-y-10">

          <Section num="1" title="Geltungsbereich">
            <p>
              Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Leistungen der Plattform
              Firmadeal.de (nachfolgend „Firmadeal" oder „Plattform"). Firmadeal betreibt einen
              Online-Marktplatz für Unternehmensverkäufe im DACH-Raum (Deutschland, Österreich, Schweiz).
            </p>
            <p>
              Durch die Registrierung oder Nutzung der Plattform stimmen Sie diesen AGB zu.
            </p>
          </Section>

          <Section num="2" title="Leistungsbeschreibung">
            <p>
              Firmadeal stellt eine Plattform bereit, auf der Unternehmensverkäufer (Inserenten)
              Inserate für Unternehmensverkäufe, -verpachtungen oder -übertragungen einstellen können.
              Interessenten können diese Inserate einsehen und direkt Kontakt aufnehmen.
            </p>
            <p>
              Firmadeal ist kein Partei des Kaufvertrags zwischen Verkäufer und Käufer und erhebt
              <strong className="text-[var(--ink)]"> keine Provision</strong> auf abgeschlossene Transaktionen.
            </p>
          </Section>

          <Section num="3" title="Registrierung & Nutzerkonto">
            <p>
              Die Nutzung kostenpflichtiger Funktionen setzt eine Registrierung voraus. Sie verpflichten
              sich, wahrheitsgemäße Angaben zu machen und diese aktuell zu halten. Pro Person ist ein
              Konto zulässig.
            </p>
            <p>
              Sie sind für die Sicherheit Ihres Passworts verantwortlich. Bei unbefugter Nutzung Ihres
              Kontos informieren Sie uns unverzüglich unter{" "}
              <a href="mailto:info@firmadeal.de" className="text-[var(--accent)] hover:underline">
                info@firmadeal.de
              </a>.
            </p>
          </Section>

          <Section num="4" title="Abonnement & Preise">
            <p>
              Inserenten buchen ein monatlich laufendes Abonnement. Es stehen folgende Pläne zur
              Verfügung:
            </p>
            <div className="bg-[var(--surface2)] rounded-xl overflow-hidden border border-[var(--border)]">
              {[
                { plan: "Basic",    price: "€39/Monat",  desc: "1 aktives Inserat" },
                { plan: "Advanced", price: "€79/Monat",  desc: "3 aktive Inserate · Featured" },
                { plan: "Premium",  price: "€199/Monat", desc: "Unbegrenzt · Top-Placement · Beratung" },
              ].map((row, i, arr) => (
                <div key={row.plan} className={`flex items-center justify-between px-5 py-3.5 ${i < arr.length - 1 ? "border-b border-[var(--border)]" : ""}`}>
                  <div>
                    <span className="font-sans text-[13px] font-semibold text-[var(--ink)]">{row.plan}</span>
                    <span className="font-sans text-[12px] text-[var(--muted)] ml-2">{row.desc}</span>
                  </div>
                  <span className="font-sans text-[13px] font-bold text-[var(--ink)]">{row.price}</span>
                </div>
              ))}
            </div>
            <p>
              Alle Preise verstehen sich zzgl. der gesetzlichen Mehrwertsteuer. Die Abrechnung erfolgt
              monatlich im Voraus über den Zahlungsanbieter Stripe.
            </p>
          </Section>

          <Section num="5" title="7-Tage-Testphase">
            <p>
              Neue Abonnenten erhalten eine kostenlose Testphase von 7 Tagen. Das Inserat wird sofort
              nach Auswahl des Plans veröffentlicht. Die Kreditkarte wird erst nach Ablauf der 7 Tage
              belastet. Eine Kündigung innerhalb der Testphase ist jederzeit kostenfrei möglich.
            </p>
          </Section>

          <Section num="6" title="Kündigung">
            <p>
              Das Abonnement kann jederzeit zum Ende des laufenden Abrechnungszeitraums gekündigt werden.
              Nach Kündigung bleibt das Inserat bis zum Ende der bezahlten Periode aktiv, danach wird
              es deaktiviert.
            </p>
            <p>
              Eine Kündigung ist per E-Mail an{" "}
              <a href="mailto:info@firmadeal.de" className="text-[var(--accent)] hover:underline">
                info@firmadeal.de
              </a>{" "}
              oder über das Nutzerdashboard möglich.
            </p>
          </Section>

          <Section num="7" title="Pflichten des Inserenten">
            <p>
              Der Inserent ist allein verantwortlich für die Richtigkeit, Vollständigkeit und
              Aktualität seiner Inserat-Inhalte. Firmadeal übernimmt keine Gewähr für die Richtigkeit
              der eingestellten Unternehmensdaten.
            </p>
            <p>Folgende Inhalte sind untersagt:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Falsche oder irreführende Angaben</li>
              <li>Inserate für nicht existierende Unternehmen</li>
              <li>Inhalte, die gegen geltendes Recht verstoßen</li>
              <li>Mehrfache Inserate für dasselbe Unternehmen</li>
            </ul>
          </Section>

          <Section num="8" title="Haftungsbeschränkung">
            <p>
              Firmadeal haftet nicht für den Inhalt von Inseraten, den Verlauf oder das Ergebnis von
              Unternehmenstransaktionen zwischen Nutzern. Firmadeal ist kein Vermittler im
              rechtlichen Sinne und schließt keine Transaktionsverträge im Namen der Nutzer ab.
            </p>
            <p>
              Die Haftung von Firmadeal ist auf Vorsatz und grobe Fahrlässigkeit beschränkt, soweit
              gesetzlich zulässig.
            </p>
          </Section>

          <Section num="9" title="Änderungen der AGB">
            <p>
              Firmadeal behält sich vor, diese AGB mit einer Ankündigungsfrist von 30 Tagen zu ändern.
              Änderungen werden per E-Mail mitgeteilt. Widerspricht der Nutzer nicht innerhalb von 30
              Tagen, gelten die neuen AGB als akzeptiert.
            </p>
          </Section>

          <Section num="10" title="Anwendbares Recht & Gerichtsstand">
            <p>
              Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Gerichtsstand ist, soweit
              gesetzlich zulässig, der Sitz von Firmadeal.de.
            </p>
          </Section>

          <Section num="11" title="Kontakt">
            <p>
              Bei Fragen zu diesen AGB wenden Sie sich an:{" "}
              <a href="mailto:info@firmadeal.de" className="text-[var(--accent)] hover:underline">
                info@firmadeal.de
              </a>
            </p>
          </Section>

        </div>
      </div>
    </div>
  );
}
