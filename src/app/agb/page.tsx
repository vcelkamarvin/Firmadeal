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
          Stand: Juni 2026 — Firmadeal.de
        </p>

        <div className="space-y-10">

          <Section num="1" title="Geltungsbereich">
            <p>
              Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Leistungen der Plattform
              Firmadeal.de (nachfolgend „Firmadeal&quot; oder „Plattform&quot;). Firmadeal betreibt einen
              vertraulichen Online-Marktplatz und ein Käufer-Matching für Unternehmensnachfolgen und
              -verkäufe im deutschsprachigen Raum (Deutschland, Österreich, Schweiz).
            </p>
            <p>
              Durch die Registrierung, die Einreichung eines Unternehmens oder die sonstige Nutzung der
              Plattform stimmen Sie diesen AGB zu.
            </p>
          </Section>

          <Section num="2" title="Leistungsbeschreibung">
            <p>
              Firmadeal stellt Unternehmensinhabern (nachfolgend „Inserent&quot; oder „Verkäufer&quot;) einen
              Dienst zur vertraulichen Einreichung ihres Unternehmens zur Verfügung. Der Leistungsumfang
              umfasst insbesondere:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Aufnahme des Unternehmens in das private Investoren- und Käufer-Netzwerk von Firmadeal;</li>
              <li>gezielte, diskrete Ansprache passender Käufer (u. a. Private Equity, Family Offices, Search Funds / ETA, MBI-Kandidaten und strategische Käufer);</li>
              <li>ein anonymes Unternehmensprofil, das die Identität des Verkäufers bis zu einer beidseitig gewünschten Kontaktaufnahme schützt;</li>
              <li>eine automatische, indikative Unternehmensbewertung;</li>
              <li>optional eine kuratierte öffentliche Listung zur Erhöhung der Reichweite.</li>
            </ul>
            <p>
              Firmadeal ist <strong className="text-[var(--ink)]">kein Makler</strong> im Sinne des § 652 BGB
              und nicht Partei des Kaufvertrags zwischen Verkäufer und Käufer. Firmadeal erhebt
              <strong className="text-[var(--ink)]"> keine Provision (0 %)</strong> auf abgeschlossene
              Transaktionen. Die indikative Bewertung dient ausschließlich der Orientierung und stellt kein
              verbindliches Wertgutachten dar.
            </p>
          </Section>

          <Section num="3" title="Registrierung & Nutzerkonto">
            <p>
              Die Einreichung eines Unternehmens setzt eine Registrierung voraus. Sie verpflichten sich,
              wahrheitsgemäße Angaben zu machen und diese aktuell zu halten. Pro Person bzw. pro
              vertretungsberechtigter Stelle ist ein Konto zulässig.
            </p>
            <p>
              Sie sind für die Vertraulichkeit Ihrer Zugangsdaten verantwortlich. Bei Anzeichen einer
              unbefugten Nutzung Ihres Kontos informieren Sie uns unverzüglich unter{" "}
              <a href="mailto:info@firmadeal.de" className="text-[var(--accent)] hover:underline">
                info@firmadeal.de
              </a>.
            </p>
          </Section>

          <Section num="4" title="Preis & Zahlung">
            <p>
              Die vertrauliche Einreichung erfolgt gegen eine einmalige Zahlung (zzgl. der gesetzlichen
              Mehrwertsteuer):
            </p>
            <div className="bg-[var(--surface2)] rounded-xl overflow-hidden border border-[var(--border)]">
              <div className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <span className="font-sans text-[13px] font-semibold text-[var(--ink)]">Vertrauliche Einreichung</span>
                  <span className="font-sans text-[12px] text-[var(--muted)] ml-2">Einmalzahlung · Kein Abo · 0 % Provision</span>
                </div>
                <span className="font-sans text-[13px] font-bold text-[var(--ink)]">€87 einmalig</span>
              </div>
            </div>
            <p>
              Es handelt sich um eine Einmalzahlung — kein Abonnement, keine wiederkehrende Belastung und
              keine versteckten Kosten. Die Zahlung wird über den Zahlungsanbieter Stripe abgewickelt; mit
              Abschluss des Bezahlvorgangs kommt der Vertrag über die Einreichung zustande. Über die einmalige
              Einreichungsgebühr hinaus fallen keine Provisionen auf einen späteren Verkaufspreis an.
            </p>
          </Section>

          <Section num="5" title="Leistungserbringung & Widerrufsrecht">
            <p>
              Das eingereichte Profil wird nach Zahlungseingang unverzüglich live geschaltet und in das
              Käufer-Matching aufgenommen. Mit der Bestellung verlangen Sie ausdrücklich, dass Firmadeal mit
              der Leistung vor Ablauf der Widerrufsfrist beginnt.
            </p>
            <p>
              Soweit der Nutzer Verbraucher im Sinne des § 13 BGB ist, besteht ein gesetzliches
              Widerrufsrecht. Dieses erlischt, wenn Firmadeal die Dienstleistung vollständig erbracht hat und
              mit der Ausführung erst begonnen wurde, nachdem der Verbraucher hierzu seine ausdrückliche
              Zustimmung gegeben und seine Kenntnis vom Erlöschen des Widerrufsrechts bestätigt hat
              (§ 356 Abs. 4 BGB). Für Unternehmer im Sinne des § 14 BGB besteht kein gesetzliches Widerrufsrecht.
            </p>
          </Section>

          <Section num="6" title="Laufzeit & Beendigung der Einreichung">
            <p>
              Da es sich um eine Einmalleistung handelt, ist keine Kündigung eines Abonnements erforderlich —
              es entstehen keine Folgekosten.
            </p>
            <p>
              Der Inserent kann die Veröffentlichung bzw. das aktive Matching seines Profils jederzeit per
              E-Mail an{" "}
              <a href="mailto:info@firmadeal.de" className="text-[var(--accent)] hover:underline">
                info@firmadeal.de
              </a>{" "}
              oder über das Nutzerdashboard beenden. Firmadeal nimmt das Profil daraufhin innerhalb
              angemessener Frist aus der aktiven Ansprache und der optionalen öffentlichen Listung. Die
              einmalige Einreichungsgebühr wird bei einer vom Inserenten veranlassten vorzeitigen Beendigung
              nicht anteilig erstattet, soweit die Leistung bereits erbracht wurde.
            </p>
          </Section>

          <Section num="7" title="Vertraulichkeit, Anonymität & Datenschutz">
            <p>
              Firmadeal behandelt eingereichte Unternehmensdaten vertraulich. Das im Netzwerk bzw. öffentlich
              sichtbare Profil ist so gestaltet, dass die Identität des Verkäufers anonym bleibt, bis Verkäufer
              und Interessent einer Kontaktaufnahme zustimmen.
            </p>
            <p>
              Die Verarbeitung personenbezogener Daten richtet sich nach der{" "}
              <a href="/datenschutz" className="text-[var(--accent)] hover:underline">
                Datenschutzerklärung
              </a>. Eine Weitergabe identifizierender Daten an Dritte erfolgt nur mit Zustimmung des Verkäufers
              oder soweit gesetzlich erforderlich.
            </p>
          </Section>

          <Section num="8" title="Pflichten des Inserenten">
            <p>
              Der Inserent ist allein verantwortlich für die Richtigkeit, Vollständigkeit und Aktualität der
              von ihm eingestellten Angaben. Firmadeal übernimmt keine Gewähr für die Richtigkeit der
              eingestellten Unternehmensdaten.
            </p>
            <p>Untersagt sind insbesondere:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>falsche oder irreführende Angaben;</li>
              <li>Einreichungen für nicht existierende oder nicht zum Verkauf berechtigte Unternehmen;</li>
              <li>Inhalte, die gegen geltendes Recht oder Rechte Dritter verstoßen;</li>
              <li>Mehrfacheinreichungen desselben Unternehmens.</li>
            </ul>
          </Section>

          <Section num="9" title="Käufer-Matching & kein Erfolgsversprechen">
            <p>
              Firmadeal gleicht das Profil des Inserenten nach bestem Bemühen mit potenziell passenden Käufern
              ab. Firmadeal schuldet ein Bemühen um Ansprache und Vermittlung von Kontakten, jedoch keinen
              Verkaufserfolg. Ein Anspruch auf das Zustandekommen eines Verkaufs, auf eine bestimmte Anzahl von
              Käuferkontakten oder auf einen bestimmten Verkaufspreis besteht nicht.
            </p>
          </Section>

          <Section num="10" title="Haftungsbeschränkung">
            <p>
              Firmadeal haftet nicht für den Inhalt von Einreichungen sowie für den Verlauf oder das Ergebnis
              von Unternehmenstransaktionen zwischen Nutzern. Firmadeal ist kein Vermittler im rechtlichen
              Sinne und schließt keine Transaktionsverträge im Namen der Nutzer ab.
            </p>
            <p>
              Die Haftung von Firmadeal ist — soweit gesetzlich zulässig — auf Vorsatz und grobe Fahrlässigkeit
              beschränkt. Bei der Verletzung wesentlicher Vertragspflichten (Kardinalpflichten) haftet Firmadeal
              auch für einfache Fahrlässigkeit, jedoch begrenzt auf den vertragstypischen, vorhersehbaren
              Schaden. Die Haftung für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit
              sowie nach dem Produkthaftungsgesetz bleibt unberührt.
            </p>
          </Section>

          <Section num="11" title="Änderungen der AGB">
            <p>
              Firmadeal behält sich vor, diese AGB mit einer Ankündigungsfrist von 30 Tagen zu ändern.
              Änderungen werden per E-Mail mitgeteilt. Widerspricht der Nutzer nicht innerhalb von 30 Tagen,
              gelten die neuen AGB als akzeptiert. Auf das Widerspruchsrecht und die Folgen des Schweigens wird
              in der Mitteilung gesondert hingewiesen.
            </p>
          </Section>

          <Section num="12" title="Anwendbares Recht & Gerichtsstand">
            <p>
              Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Ist der Nutzer Kaufmann, juristische
              Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen, ist Gerichtsstand —
              soweit gesetzlich zulässig — der Sitz von Firmadeal.de.
            </p>
          </Section>

          <Section num="13" title="Kontakt">
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
