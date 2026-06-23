import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum von Firmadeal.de gemäß § 5 TMG",
};

export default function ImpressumPage() {
  return (
    <div className="bg-[var(--bg)] min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="font-sans text-[32px] font-bold text-[var(--ink)] tracking-tight mb-2">
          Impressum
        </h1>
        <p className="font-sans text-[13px] text-[var(--muted)] mb-10">
          Angaben gemäß § 5 TMG
        </p>

        <div className="space-y-8 font-sans text-[14px] text-[var(--ink)] leading-relaxed">

          <section>
            <h2 className="font-bold text-[11px] uppercase tracking-widest text-[var(--muted)] mb-3">
              Angaben gemäß § 5 TMG
            </h2>
            <p>
              Firmadeal<br />
              Albert Laurin<br />
              02763 Zittau<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="font-bold text-[11px] uppercase tracking-widest text-[var(--muted)] mb-3">
              Kontakt
            </h2>
            <p>
              E-Mail:{" "}
              <a href="mailto:info@firmadeal.de" className="text-[var(--accent)] hover:underline">
                info@firmadeal.de
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-bold text-[11px] uppercase tracking-widest text-[var(--muted)] mb-3">
              Online-Streitbeilegung
            </h2>
            <p className="text-[var(--muted)]">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline break-all"
              >
                https://ec.europa.eu/consumers/odr
              </a>
              <br />
              Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht bereit oder
              verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
              teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-[11px] uppercase tracking-widest text-[var(--muted)] mb-3">
              Haftung für Inhalte
            </h2>
            <p className="text-[var(--muted)]">
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten
              nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
              Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
              Tätigkeit hinweisen.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-[11px] uppercase tracking-widest text-[var(--muted)] mb-3">
              Urheberrecht
            </h2>
            <p className="text-[var(--muted)]">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
              dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
              der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
              Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
