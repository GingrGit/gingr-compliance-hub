import React, { useState } from "react";
import { CheckCircle2, Save, ShieldCheck, Info, Sparkles, Briefcase, Calendar, Lightbulb, Lock, Home, CircleDollarSign, BarChart2, FileText, Building2, PenLine, Trophy, User } from "lucide-react";

const FIXED_PHASES = [
  { label: "Start" },
  { label: "Modell" },
  { label: "Daten" },
  { label: "Berechtigung" },
  { label: "Setup" },
  { label: "Abschluss" },
];

const STEP_TO_PHASE = {
  welcome: 0,
  work_model: 1,
  core_data: 2,
  residency: 2,
  eligibility: 3,
  earnings: 4,
  source_tax: 4,
  self_employed: 4,
  summary: 4,
  self_employed_agreement: 4,
  congratulations: 5,
};

export default function WizardLayout({ steps, currentStep, onStepClick, mode, saving, children, currentStepId, profile }) {
  const currentPhase = STEP_TO_PHASE[currentStepId] ?? 0;

  return (
    <div className="min-h-screen bg-[#F0F0F0]">
      {/* Top Header */}
      <div className="bg-white/90 backdrop-blur-md border border-gray-100 shadow-lg overflow-hidden sticky top-0 z-30 sm:sticky sm:top-4 sm:mx-4 sm:rounded-2xl">
        {/* Gradient progress bar at very top */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-[#FF3CAC] to-[#6B0064] transition-all duration-500 ease-out"
            style={{ width: `${((currentPhase + 1) / FIXED_PHASES.length) * 100}%` }}
          />
        </div>

        {/* Logo row */}
        <div className="max-w-5xl mx-auto px-4 pt-4 pb-2 flex flex-col items-center justify-center relative">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a69aeeacd958731b1cf96e/e355eb65f_GingrLogo4x.png"
            alt="Gingr"
            className="h-7 object-contain"
          />
          <span className="text-xs text-gray-400 font-medium mt-1">Legal Onboarding</span>
          {saving && (
            <span className="absolute right-4 top-0 text-xs text-gray-400 flex items-center gap-1">
              <Save className="w-3 h-3" /> Speichert…
            </span>
          )}
        </div>

        {/* Step indicators — Desktop (fixed phases) */}
        <div className="hidden sm:block max-w-5xl mx-auto px-4 pb-3">
          <div className="flex items-start justify-center">
            {FIXED_PHASES.map((phase, idx) => {
              const done = idx < currentPhase;
              const active = idx === currentPhase;
              return (
                <React.Fragment key={idx}>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0 px-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                      done ? "bg-green-500" : active ? "bg-[#FF3CAC] shadow-sm shadow-pink-300" : "bg-gray-200"
                    }`}>
                      {done
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        : <span className={`text-[10px] font-bold ${active ? "text-white" : "text-gray-400"}`}>{idx + 1}</span>
                      }
                    </div>
                    <span className={`text-[9px] font-medium whitespace-nowrap transition-colors w-16 text-center ${
                      active ? "text-[#FF3CAC]" : done ? "text-green-600" : "text-gray-300"
                    }`}>
                      {phase.label}
                    </span>
                  </div>
                  {idx < FIXED_PHASES.length - 1 && (
                    <div className={`h-px w-8 flex-shrink-0 mt-3 mx-0.5 transition-colors duration-300 ${idx < currentPhase ? "bg-green-400" : "bg-gray-200"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step indicators — Mobile compact */}
        <div className="sm:hidden max-w-5xl mx-auto px-4 pb-2.5 flex items-center justify-between">
          <span className="text-sm font-semibold text-[#6B0064]">{FIXED_PHASES[currentPhase]?.label}</span>
          <span className="text-xs text-gray-400">Phase {currentPhase + 1} / {FIXED_PHASES.length}</span>
        </div>
      </div>

      {/* Main Content */}

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            {children}
          </div>
          <div className="hidden lg:block">
            <GuidancePanel mode={mode} stepId={currentStepId} profile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
}



function AccordionItem({ title, children }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border border-pink-100 rounded-xl overflow-hidden mt-3">
      <button
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#6B0064] hover:bg-pink-50 transition-colors text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5" />{title}</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="px-3 pb-3 pt-1 text-xs text-gray-600 leading-relaxed">{children}</div>}
    </div>
  );
}

function getStepContent(stepId, profile) {
  const workModel = profile?.work_model;
  const isEmployee = workModel === "employee_unlimited" || workModel === "employee_90days";
  const isSelfEmployed = workModel === "self_employed";
  const is90days = workModel === "employee_90days";

  switch (stepId) {
    case "welcome":
      return {
        icon: "👋",
        title: "Willkommen beim Onboarding",
        body: "Dieser Assistent führt dich Schritt für Schritt durch dein rechtliches Setup. Du kannst jederzeit pausieren und später weitermachen.",
        accordions: []
      };

    case "work_model":
      if (isSelfEmployed) return {
        icon: "💼",
        title: "Selbstständig",
        body: "Dieses Modell ist für erfahrene Selbstständige, die ihre Tätigkeit eigenverantwortlich führen möchten. Du behältst die volle Kontrolle über deine Preise, deine Verfügbarkeit und darüber, welche Buchungen du annimmst. Die Auszahlungen erfolgen über Secure Payment auf Gingr. Für Steuern, Versicherungen und deine soziale Absicherung bist du selbst verantwortlich.",
        accordions: [
          { title: "Inbegriffen", content: "✔ Secure Payment auf Gingr inklusive Stornoschutz\n✔ Klare Plattformregeln und ein sichereres Buchungsumfeld\n✔ Datenschutzfreundliches Setup mit öffentlichem Nickname und verifizierter Identität im Hintergrund\n✔ Dokumentenablage für Bestätigungen, Nachweise und Abrechnungen an einem Ort\n✔ Entwickelt für selbstständiges Arbeiten" },
          { title: "Du bist selbst verantwortlich für", content: "✔ AHV/AVS-Anmeldung bzw. Bestätigung der Selbstständigkeit oder ein belastbares Nachweispaket\n✔ Deine Steuern\n✔ Deine Versicherungen, insbesondere Unfall- und Krankenversicherung\n✔ Deine Vorsorge und Pensionsplanung" },
          { title: "Für wen ist das passend?", content: "Am besten für Escorts, die bereits selbstständig arbeiten und ihre Tätigkeit professionell organisiert haben – zum Beispiel mit mehreren Kanälen oder Kunden, einer bestehenden Struktur und den nötigen Nachweisen zur Selbstständigkeit." },
          { title: "Verfügbarkeit", content: "✅ Schweizer Staatsbürgerinnen: Ja, wenn du in der Schweiz wohnst\n✅ EU-/EFTA-Staatsbürgerinnen: Ja, aber nur wenn du in der Schweiz wohnst, hier legal arbeiten darfst und einen klaren Schweiz-Bezug sowie entsprechende Nachweise hast\n❌ Nicht-EU-/EFTA-Staatsbürgerinnen: Nicht verfügbar\n❌ EU-/EFTA-Staatsbürgerinnen ohne bestehende selbstständige Struktur oder ohne ausreichende Nachweise: Nicht verfügbar" },
        ]
      };
      if (isEmployee && is90days) return {
        icon: "📋",
        title: "Angestellt — bis 90 Tage",
        body: "Kurzzeit-Anstellung für EU/EFTA-Bürgerinnen ohne Schweizer Aufenthaltsbewilligung. Volle Absicherung für die Dauer.",
        accordions: [
          { title: "Inbegriffen", content: "✔ Secure Payment + Stornoschutz\n✔ Lohnabrechnung via QUITT.ch\n✔ Rechtlicher Schutz für 90 Tage\n✔ Klare Regeln & sicherere Buchungen" },
          { title: "Wichtige Einschränkung", content: "Dieses Modell ist auf maximal 90 Tage begrenzt. Danach ist eine Bewilligung oder ein Wechsel des Modells nötig." },
        ]
      };
      if (isEmployee) return {
        icon: "🛡️",
        title: "Angestellt (unbefristet)",
        body: "Das ist die einfachste und sicherste Lösung. Du bist rechtlich abgesichert, vollständig versichert und bekommst deinen Lohn jeden Monat direkt auf dein Bankkonto – basierend auf deinen eigenen Preisen. Du kannst dieses Arbeitsverhältnis jederzeit beenden und gehst keine Verpflichtungen ein, setzt deine eigenen Preise und bestimmst komplett frei, wann und wie viel du arbeiten möchtest.",
        accordions: [
          { title: "Inbegriffen", content: "✔ Vollständige Unfallversicherung (NBU)\n✔ Sozialversicherungen (AHV/ALV/IV/EO)\n✔ Pensionskasse (BVG), falls du die Voraussetzungen erfüllst\n✔ G-IT AG (Gingr) ist deine Arbeitgeberin\n✔ Lohn- und Vertragsabwicklung über QUITT.ch\n✔ Sichere und garantierte Auszahlungen\n✔ Keine eigene Firma nötig\n✔ In allen Schweizer Kantonen legal" },
          { title: "Für wen ist das passend?", content: "Ideal für die meisten Escorts, die eine sichere, legale und unkomplizierte Lösung ohne Papierkram möchten." },
        ]
      };
      return {
        icon: "💡",
        title: "Arbeitsmodell wählen",
        body: "Deine Wahl bestimmt, welche rechtlichen Dokumente du unterzeichnest und wie deine Auszahlungen verarbeitet werden.",
        accordions: [
          { title: "Unsicher, welches passt?", content: "Für 90% der Escorts ist das Angestellt-Modell die einfachere und sicherere Wahl. Wähle Selbstständig nur, wenn du bereits als unabhängige Unternehmerin tätig bist und einen Nachweis erbringen kannst." },
        ]
      };

    case "core_data":
      return {
        icon: "🔒",
        title: "Deine Daten sind sicher",
        body: "Deine Adresse und persönlichen Daten werden verschlüsselt gespeichert und niemals öffentlich angezeigt — nicht auf deinem Profil, nicht für Kunden.",
        accordions: [
          { title: "Wozu brauchen wir die Adresse?", content: "Die Adresse wird für deinen Arbeitsvertrag und die Lohnabrechnung benötigt. Sie erscheint nicht öffentlich." },
          { title: "Was ist ein Nationalitätsgate?", content: "Deine Staatsbürgerschaft bestimmt, welche Arbeitsmodelle für dich verfügbar sind." },
        ]
      };

    case "residency":
      return {
        icon: "🏠",
        title: "Warum die Aufenthaltsbewilligung?",
        body: "Wir müssen deinen Aufenthaltsstatus bestätigen, um dein Setup legal zu machen. Das Dokument wird nicht öffentlich angezeigt.",
        accordions: [
          { title: "Was passiert nach dem Upload?", content: "Wir prüfen dein Dokument manuell innerhalb von 24 Stunden. Du kannst den Wizard sofort fortsetzen — wir bestätigen im Hintergrund." },
          { title: "Welche Dokumente werden akzeptiert?", content: "PDF, JPG oder PNG. Alle Ecken sichtbar, Text lesbar, nicht abgelaufen. Bewilligungen B, C und L." },
          { title: "Warum ist das wichtig?", content: "Erforderlich für Secure Payment, nicht öffentlich sichtbar, Bestätigung innerhalb 24h, bei Problemen erfährst du genau was fehlt." },
        ]
      };

    case "eligibility":
      return {
        icon: "✅",
        title: "Deine verfügbaren Optionen",
        body: "Basierend auf deinen verifizierten Daten zeigen wir dir genau, welche Modelle für dich verfügbar sind.",
        accordions: [
          { title: "Was bedeutet 'Ausstehende Prüfung'?", content: "Wenn deine Bewilligung noch geprüft wird, kannst du trotzdem fortfahren. Die Aktivierung bleibt bis zur Bestätigung ausstehend." },
          { title: "Kann ich das Modell später wechseln?", content: "Ja, du kannst dein Arbeitsmodell ändern. Wende dich an den Support." },
        ]
      };

    case "earnings":
      return {
        icon: "💰",
        title: "Einkommens-Rechner",
        body: "Gib deinen Stundenpreis ein und sieh, wie sich dein Nettolohn zusammensetzt — inklusive Sozialversicherungen und Plattformgebühr.",
        accordions: [
          { title: "Wie berechnet sich mein Lohn?", content: "Kundenpreis\n- Arbeitnehmer-Sozial- & Pensionsbeiträge (10.98%)\n- Plattform + Arbeitgeber-Kosten (15%)\n= Bruttolohn (vor Quellensteuer)" },
          { title: "Was ist die QUITT-Gebühr?", content: "CHF 50/Monat für Lohnadministration und Compliance. Wird von deinem monatlichen Auszahlungslohn abgezogen." },
          { title: "Quellensteuer — Voreinstellung", content: "CH-Bürgerinnen & Permit C → Quellensteuer = Nein (editierbar)\nPermit B/L & 90-Tage-Modell → Quellensteuer = Ja (editierbar)" },
        ]
      };

    case "source_tax":
      return {
        icon: "📊",
        title: "Quellensteuer (Quellensteuer)",
        body: "Diese Angaben helfen uns, deine Auszahlung korrekt zu schätzen. Der finale Tarif wird von QUITT vor der Lohnabrechnung bestätigt.",
        accordions: [
          { title: "Was ist die Quellensteuer?", content: "Die Quellensteuer wird direkt vom Lohn abgezogen, bevor du es erhältst. Sie gilt für Personen ohne C-Bewilligung oder Schweizer Staatsbürgerschaft." },
          { title: "Was beeinflusst den Tarif?", content: "Kanton, Zivilstand, Wohnsituation mit Partner/in, Anzahl Kinder. Jeder Kanton hat eigene Tarife." },
          { title: "Gespeichert & verschlüsselt", content: "Alle Angaben werden verschlüsselt gespeichert und nie auf deinem Profil angezeigt." },
        ]
      };

    case "employment_setup":
      return {
        icon: "✍️",
        title: is90days ? "Vertrag — bis 90 Tage" : "Arbeitsvertrag",
        body: "Überprüfe deine Daten und unterzeichne deinen Arbeitsvertrag. Nach der Unterzeichnung wird Secure Payment aktiviert.",
        accordions: [
          { title: "Was passiert nach der Unterzeichnung?", content: "Dein Vertrag wird gespeichert. Secure Payment und Buchungsschutz werden aktiviert (bei ausstehenden Dokumenten nach Prüfung)." },
          { title: "QUITT-Gebühr — CHF 50/Monat", content: "Diese Gebühr deckt Lohnadministration und Compliance-Setup ab. Sie wird von deiner monatlichen Auszahlung abgezogen." },
          { title: "Kann ich den Vertrag kündigen?", content: "Ja, du kannst jederzeit kündigen — keine negativen Konsequenzen. Gültig gemäß Kündigungsfrist im Vertrag." },
        ]
      };

    case "self_employed":
      return {
        icon: "🏢",
        title: "Selbstständig-Setup",
        body: "Wir brauchen ein paar Details und einen Nachweis. Du kannst nach dem Upload sofort weitermachen — wir prüfen innerhalb von 24 Stunden.",
        accordions: [
          { title: "Welche Nachweise werden akzeptiert?", content: "Option A (Freelancer): externe Profil-Links (mind. 1) + AHV/AVS-Bestätigung (empfohlen)\nOption B (Unternehmen): Handelsregisterauszug + UID-Nummer" },
          { title: "Was ist falsche Selbstständigkeit?", content: "Behörden beurteilen den Status anhand des tatsächlichen Verhaltens, nicht nur des Vertrags. Deshalb brauchen wir einen Nachweis, dass du wirklich unabhängig arbeitest." },
          { title: "Was ist die AHV/AVS-Bestätigung?", content: "Die offizielle Bestätigung der Ausgleichskasse, dass du als Selbstständige eingetragen bist. Wenn du sie noch nicht hast, kannst du trotzdem fortfahren." },
        ]
      };

    case "self_employed_agreement":
      return {
        icon: "✍️",
        title: "Selbstständigen-Vereinbarung",
        body: "Unterzeichne deine Vereinbarung und bestätige, dass du selbstständig tätig bist.",
        accordions: [
          { title: "Warum brauchen wir diese Bestätigung?", content: "Um das Risiko von 'falscher Selbstständigkeit' zu vermeiden, müssen wir dokumentieren, dass du wirklich unabhängig arbeitest und nicht als Angestellte behandelt wirst." },
          { title: "Was passiert nach der Unterzeichnung?", content: "Deine Uploads werden innerhalb von 24 Stunden geprüft. Secure Payment wird nach Bestätigung aktiviert." },
        ]
      };

    case "congratulations":
      return {
        icon: "🎉",
        title: "Fast geschafft!",
        body: "Dein Onboarding ist abgeschlossen. Hier findest du, was als nächstes passiert.",
        accordions: [
          { title: "Was ist jetzt freigeschaltet?", content: "✔ Secure Payment + Stornoschutz\n✔ Strukturierter Buchungsablauf\n✔ Sozialschutz (Angestellt) oder Dokumentenvault (Selbstständig)" },
          { title: "Wo finde ich meine Dokumente?", content: "Unter 'Dokumente' in deinem Dashboard findest du deinen Vertrag und alle rechtlichen Unterlagen." },
        ]
      };

    default:
      return {
        icon: "💡",
        title: "Hilfe & Infos",
        body: "Alle deine Daten werden sicher gespeichert. Du kannst jederzeit unterbrechen und später weitermachen.",
        accordions: []
      };
  }
}

function GuidancePanel({ mode, stepId, profile }) {
  const content = getStepContent(stepId, profile);

  return (
    <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-5 sticky top-24">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
          <span className="text-lg">{mode === "guided" ? "👤" : content.icon}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {mode === "guided" ? "Mitarbeiter-Hinweise" : content.title}
          </p>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">
        {mode === "guided"
          ? "Du begleitest die Escort durch das Onboarding. Alle Eingaben werden automatisch gespeichert."
          : content.body}
      </p>

      {!mode || mode !== "guided" ? (
        content.accordions?.map((acc, i) => (
          <AccordionItem key={i} title={acc.title}>
            {acc.content.split('\n').map((line, j) => <p key={j} className="mb-1">{line}</p>)}
          </AccordionItem>
        ))
      ) : null}

      <div className="mt-4 p-3 bg-pink-50 rounded-xl border border-pink-100">
        <p className="text-xs font-medium text-[#6B0064] flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Datenschutz</p>
        <p className="text-xs text-[#6B0064] opacity-80 mt-1">Deine Angaben sind vertraulich und werden nur für rechtliche Zwecke verwendet.</p>
      </div>
    </div>
  );
}