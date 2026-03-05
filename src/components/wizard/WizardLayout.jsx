import React, { useState } from "react";
import { CheckCircle2, Save, ShieldCheck, Info } from "lucide-react";

export default function WizardLayout({ steps, currentStep, onStepClick, mode, saving, children, currentStepId, profile }) {
  return (
    <div className="min-h-screen bg-[#F0F0F0]">
      {/* Top Header */}
      <div className="bg-white border-b border-pink-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo centered */}
          <div className="flex-1 flex justify-center">
            <div className="flex flex-col items-center">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a69aeeacd958731b1cf96e/e355eb65f_GingrLogo4x.png"
                alt="Gingr"
                className="h-10 object-contain"
              />
              <span className="text-xs text-gray-400 font-medium">Legal Onboarding</span>
            </div>
          </div>
          {/* Save indicator right */}
          <div className="w-24 flex justify-end">
            {saving && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Save className="w-3 h-3" /> Speichert…
              </span>
            )}
            {!saving && (
              <span className="text-xs text-gray-300 flex items-center gap-1">
                {mode === "guided" ? "👤 Geführt" : "🧍 Selbst"}
              </span>
            )}
          </div>
        </div>

        {/* Step Progress */}
        <div className="max-w-5xl mx-auto px-3 sm:px-4 pb-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>
            {steps.map((step, idx) => {
              const done = idx < currentStep;
              const active = idx === currentStep;
              const clickable = done && onStepClick;
              return (
                <React.Fragment key={step.id}>
                  <div
                    className={`flex items-center gap-1 flex-shrink-0 ${clickable ? "cursor-pointer" : ""}`}
                    onClick={() => clickable && onStepClick(idx)}
                  >
                    {done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00CC44]" />
                    ) : (
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${active ? "border-[#FF3CAC] bg-[#FF3CAC]" : "border-gray-300"}`}>
                        {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    )}
                    <span className={`text-[10px] sm:text-xs font-medium whitespace-nowrap ${active ? "text-[#6B0064]" : done ? "text-[#00AA33]" : "text-gray-300"}`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`h-0.5 w-3 sm:w-4 flex-shrink-0 ${idx < currentStep ? "bg-[#00CC44]" : "bg-gray-200"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Schritt {currentStep + 1} von {steps.length} · Wird automatisch gespeichert
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
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
        accordions: [
          { title: "Was du bereit haben solltest", content: "Ausweis / Pass, Aufenthaltsbewilligung (falls zutreffend), Bankverbindung (IBAN)." },
          { title: "Wie lange dauert es?", content: "Ca. 10–15 Minuten. Alle Schritte werden automatisch gespeichert." },
        ]
      };

    case "work_model":
      if (isSelfEmployed) return {
        icon: "💼",
        title: "Selbstständig-Modus",
        body: "Du bleibst vollständig in Kontrolle über Preise und Verfügbarkeit. Du kümmerst dich selbst um Steuern, AHV und Versicherungen.",
        accordions: [
          { title: "Was du selbst regelst", content: "AHV/AVS-Registrierung als Selbstständige, eigene Steuererklärung, Kranken- & Unfallversicherung, Vorsorge (3. Säule)." },
          { title: "Wer kann wählen?", content: "CH-Bürgerinnen (wenn wohnhaft in CH), EU/EFTA-Bürgerinnen mit CH-Wohnsitz und Nachweis. Nicht verfügbar für Non-EU/EFTA." },
          { title: "Vergleich: Angestellt vs. Selbstständig", content: "Angestellt: volle Versicherung, Lohnabrechnung via QUITT, keine Buchhaltung nötig.\nSelbstständig: volle Kontrolle, eigene Steuern & Versicherungen, Nachweis erforderlich." },
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
        title: "Angestellt — Unbefristet",
        body: "Die sicherste Option. Vollständig versichert und rechtlich geschützt. Monatlicher Lohn auf dein Konto, basierend auf deinen eigenen Preisen.",
        accordions: [
          { title: "Was alles inbegriffen ist", content: "✔ Vollkasko-Unfallversicherung (NBU)\n✔ Sozialversicherungen (AHV/ALV/IV/EO)\n✔ BVG-Pensionsbeiträge (wenn berechtigt)\n✔ Steuern werden automatisch abgehandelt\n✔ Professionelle Lohnabrechnung via QUITT.ch\n✔ Garantierte Auszahlungen" },
          { title: "Wer kann wählen?", content: "CH-Bürgerinnen: ✅ Ja\nEU/EFTA-Bürgerinnen: ✅ Ja (ggf. Bewilligung B/C)\nNon-EU/EFTA: ✅ Nur mit gültiger Bewilligung B/C" },
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
    <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-5 sticky top-28">
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