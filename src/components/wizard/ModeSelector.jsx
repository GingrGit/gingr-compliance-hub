import React, { useState, useEffect } from "react";
import { User, Users, ShieldCheck, X, Calendar, FileText, CreditCard, Briefcase, Globe } from "lucide-react";
import { createPageUrl } from "@/utils";

const TRANSLATIONS = {
  de: {
    title: "Legal Onboarding",
    subtitle: "Wie möchtest du das Onboarding starten?",
    selfTitle: "Ich mache es selbst",
    selfDesc: "Du wirst Schritt für Schritt durch den Prozess geführt — in deinem eigenen Tempo.",
    selfBtn: "Starten →",
    guidedTitle: "Mit gingr-Mitarbeiter",
    guidedDesc: "Ein Teammitglied von gingr begleitet dich persönlich durch das Onboarding.",
    guidedBtn: "Termin buchen →",
    admin: "Admin-Dashboard",
    modalTitle: "Termin buchen",
    modalSubtitle: "Onboarding mit gingr-Begleitung",
    modalIntro: "Bitte halte folgende Dokumente bereit, bevor du deinen Termin buchst:",
    doc1Title: "Ausweis / Pass",
    doc1Desc: "Reisepass oder Personalausweis (gültig)",
    doc2Title: "Aufenthaltsbewilligung",
    doc2Desc: "Für Nicht-Schweizer: Permit B, C, L oder ähnliches",
    doc3Title: "Selbständige: Gewerbenachweis",
    doc3Desc: "UID-Nummer und Handelsregisterauszug oder ähnliches",
    bookBtn: "Jetzt Termin buchen →",
    langLabel: "Sprache wählen",
  },
  en: {
    title: "Legal Onboarding",
    subtitle: "How would you like to start the onboarding?",
    selfTitle: "I'll do it myself",
    selfDesc: "You'll be guided step by step through the process — at your own pace.",
    selfBtn: "Get started →",
    guidedTitle: "With a gingr team member",
    guidedDesc: "A gingr team member will personally guide you through the onboarding.",
    guidedBtn: "Book appointment →",
    admin: "Admin Dashboard",
    modalTitle: "Book appointment",
    modalSubtitle: "Onboarding with gingr guidance",
    modalIntro: "Please have the following documents ready before booking your appointment:",
    doc1Title: "ID / Passport",
    doc1Desc: "Valid passport or national ID",
    doc2Title: "Residence permit",
    doc2Desc: "For non-Swiss: Permit B, C, L or similar",
    doc3Title: "Self-employed: Business proof",
    doc3Desc: "UID number and commercial register extract or similar",
    bookBtn: "Book appointment now →",
    langLabel: "Choose language",
  },
  fr: {
    title: "Onboarding Légal",
    subtitle: "Comment souhaitez-vous démarrer l'onboarding ?",
    selfTitle: "Je le fais moi-même",
    selfDesc: "Vous serez guidé pas à pas à travers le processus — à votre propre rythme.",
    selfBtn: "Commencer →",
    guidedTitle: "Avec un employé gingr",
    guidedDesc: "Un membre de l'équipe gingr vous accompagnera personnellement dans l'onboarding.",
    guidedBtn: "Prendre rendez-vous →",
    admin: "Tableau de bord Admin",
    modalTitle: "Prendre rendez-vous",
    modalSubtitle: "Onboarding avec accompagnement gingr",
    modalIntro: "Veuillez préparer les documents suivants avant de prendre rendez-vous :",
    doc1Title: "Carte d'identité / Passeport",
    doc1Desc: "Passeport ou carte d'identité valide",
    doc2Title: "Permis de séjour",
    doc2Desc: "Pour les non-Suisses : Permis B, C, L ou similaire",
    doc3Title: "Indépendants : Preuve d'activité",
    doc3Desc: "Numéro IDE et extrait du registre du commerce ou similaire",
    bookBtn: "Prendre rendez-vous maintenant →",
    langLabel: "Choisir la langue",
  },
  es: {
    title: "Incorporación Legal",
    subtitle: "¿Cómo deseas iniciar el proceso de incorporación?",
    selfTitle: "Lo hago yo mismo",
    selfDesc: "Serás guiado paso a paso por el proceso — a tu propio ritmo.",
    selfBtn: "Empezar →",
    guidedTitle: "Con un empleado de gingr",
    guidedDesc: "Un miembro del equipo de gingr te acompañará personalmente en el proceso.",
    guidedBtn: "Reservar cita →",
    admin: "Panel de Administración",
    modalTitle: "Reservar cita",
    modalSubtitle: "Incorporación con acompañamiento de gingr",
    modalIntro: "Por favor, tenga listos los siguientes documentos antes de reservar su cita:",
    doc1Title: "DNI / Pasaporte",
    doc1Desc: "Pasaporte o DNI válido",
    doc2Title: "Permiso de residencia",
    doc2Desc: "Para no suizos: Permiso B, C, L o similar",
    doc3Title: "Autónomos: Prueba de actividad",
    doc3Desc: "Número UID y extracto del registro mercantil o similar",
    bookBtn: "Reservar cita ahora →",
    langLabel: "Elegir idioma",
  },
  it: {
    title: "Onboarding Legale",
    subtitle: "Come desideri iniziare l'onboarding?",
    selfTitle: "Lo faccio da solo",
    selfDesc: "Sarai guidato passo dopo passo nel processo — ai tuoi ritmi.",
    selfBtn: "Inizia →",
    guidedTitle: "Con un membro del team gingr",
    guidedDesc: "Un membro del team gingr ti accompagnerà personalmente nell'onboarding.",
    guidedBtn: "Prenota appuntamento →",
    admin: "Dashboard Admin",
    modalTitle: "Prenota appuntamento",
    modalSubtitle: "Onboarding con accompagnamento gingr",
    modalIntro: "Si prega di avere i seguenti documenti pronti prima di prenotare:",
    doc1Title: "Documento d'identità / Passaporto",
    doc1Desc: "Passaporto o carta d'identità valida",
    doc2Title: "Permesso di soggiorno",
    doc2Desc: "Per i non svizzeri: Permesso B, C, L o simile",
    doc3Title: "Autonomi: Prova di attività",
    doc3Desc: "Numero UID ed estratto del registro commerciale o simile",
    bookBtn: "Prenota ora →",
    langLabel: "Scegli lingua",
  },
  ro: {
    title: "Onboarding Legal",
    subtitle: "Cum dorești să începi procesul de onboarding?",
    selfTitle: "Fac singur",
    selfDesc: "Vei fi ghidat pas cu pas prin proces — în propriul tău ritm.",
    selfBtn: "Începe →",
    guidedTitle: "Cu un angajat gingr",
    guidedDesc: "Un membru al echipei gingr te va însoți personal prin onboarding.",
    guidedBtn: "Programează întâlnire →",
    admin: "Panou Admin",
    modalTitle: "Programează întâlnire",
    modalSubtitle: "Onboarding cu însoțitor gingr",
    modalIntro: "Te rugăm să ai la îndemână următoarele documente înainte de programare:",
    doc1Title: "Act de identitate / Pașaport",
    doc1Desc: "Pașaport sau carte de identitate valabilă",
    doc2Title: "Permis de ședere",
    doc2Desc: "Pentru non-elvețieni: Permis B, C, L sau similar",
    doc3Title: "PFA: Dovadă de activitate",
    doc3Desc: "Număr UID și extras din registrul comerțului sau similar",
    bookBtn: "Programează acum →",
    langLabel: "Alege limba",
  },
  ru: {
    title: "Правовой онбординг",
    subtitle: "Как вы хотите начать процесс онбординга?",
    selfTitle: "Я сделаю это сам",
    selfDesc: "Вы будете проходить процесс шаг за шагом — в своём собственном темпе.",
    selfBtn: "Начать →",
    guidedTitle: "С сотрудником gingr",
    guidedDesc: "Член команды gingr лично сопроводит вас через онбординг.",
    guidedBtn: "Записаться →",
    admin: "Панель администратора",
    modalTitle: "Записаться на встречу",
    modalSubtitle: "Онбординг с сопровождением gingr",
    modalIntro: "Пожалуйста, подготовьте следующие документы перед записью:",
    doc1Title: "Удостоверение личности / Паспорт",
    doc1Desc: "Действующий паспорт или удостоверение личности",
    doc2Title: "Вид на жительство",
    doc2Desc: "Для неграждан Швейцарии: разрешение B, C, L или аналогичное",
    doc3Title: "Самозанятые: Подтверждение деятельности",
    doc3Desc: "Номер UID и выписка из торгового реестра или аналогичное",
    bookBtn: "Записаться сейчас →",
    langLabel: "Выбрать язык",
  },
  pl: {
    title: "Onboarding Prawny",
    subtitle: "Jak chcesz rozpocząć proces onboardingu?",
    selfTitle: "Zrobię to sam",
    selfDesc: "Będziesz prowadzony krok po kroku przez cały proces — we własnym tempie.",
    selfBtn: "Zacznij →",
    guidedTitle: "Z pracownikiem gingr",
    guidedDesc: "Członek zespołu gingr osobiście przeprowadzi Cię przez onboarding.",
    guidedBtn: "Zarezerwuj spotkanie →",
    admin: "Panel Administracyjny",
    modalTitle: "Zarezerwuj spotkanie",
    modalSubtitle: "Onboarding z asystą gingr",
    modalIntro: "Przygotuj następujące dokumenty przed rezerwacją spotkania:",
    doc1Title: "Dowód tożsamości / Paszport",
    doc1Desc: "Ważny paszport lub dowód osobisty",
    doc2Title: "Zezwolenie na pobyt",
    doc2Desc: "Dla osób spoza Szwajcarii: Zezwolenie B, C, L lub podobne",
    doc3Title: "Samozatrudnieni: Dowód działalności",
    doc3Desc: "Numer UID i wyciąg z rejestru handlowego lub podobne",
    bookBtn: "Zarezerwuj teraz →",
    langLabel: "Wybierz język",
  },
  cs: {
    title: "Právní onboarding",
    subtitle: "Jak chcete zahájit proces onboardingu?",
    selfTitle: "Udělám to sám",
    selfDesc: "Budete provázeni krok za krokem procesem — vlastním tempem.",
    selfBtn: "Začít →",
    guidedTitle: "S pracovníkem gingr",
    guidedDesc: "Člen týmu gingr vás osobně provede onboardingem.",
    guidedBtn: "Rezervovat schůzku →",
    admin: "Administrátorský panel",
    modalTitle: "Rezervovat schůzku",
    modalSubtitle: "Onboarding s asistencí gingr",
    modalIntro: "Před rezervací schůzky si prosím připravte následující dokumenty:",
    doc1Title: "Občanský průkaz / Pas",
    doc1Desc: "Platný cestovní pas nebo občanský průkaz",
    doc2Title: "Povolení k pobytu",
    doc2Desc: "Pro neobčany Švýcarska: Povolení B, C, L nebo podobné",
    doc3Title: "OSVČ: Doklad o činnosti",
    doc3Desc: "Číslo UID a výpis z obchodního rejstříku nebo podobné",
    bookBtn: "Rezervovat nyní →",
    langLabel: "Vybrat jazyk",
  },
  hu: {
    title: "Jogi Onboarding",
    subtitle: "Hogyan szeretné megkezdeni az onboarding folyamatot?",
    selfTitle: "Magam csinálom",
    selfDesc: "Lépésről lépésre vezet végig a folyamaton — a saját tempójában.",
    selfBtn: "Kezdés →",
    guidedTitle: "Egy gingr munkatárssal",
    guidedDesc: "A gingr csapat egyik tagja személyesen kíséri végig az onboardingon.",
    guidedBtn: "Időpont foglalása →",
    admin: "Admin irányítópult",
    modalTitle: "Időpont foglalása",
    modalSubtitle: "Onboarding gingr kísérettel",
    modalIntro: "Kérjük, készítse elő a következő dokumentumokat az időpont foglalása előtt:",
    doc1Title: "Személyi igazolvány / Útlevél",
    doc1Desc: "Érvényes útlevél vagy személyi igazolvány",
    doc2Title: "Tartózkodási engedély",
    doc2Desc: "Nem svájci állampolgároknak: B, C, L engedély vagy hasonló",
    doc3Title: "Önfoglalkoztatók: Tevékenységigazolás",
    doc3Desc: "UID szám és cégkivonát vagy hasonló",
    bookBtn: "Foglaljon most →",
    langLabel: "Nyelv kiválasztása",
  },
};

const LANGUAGES = [
  { code: "de", name: "Deutsch", flag: "🇩🇪", tagline: "Wähle deine Sprache für das Legal Onboarding" },
  { code: "ro", name: "Română", flag: "🇷🇴", tagline: "Alege limba pentru onboardingul legal" },
  { code: "en", name: "English", flag: "🇬🇧", tagline: "Choose your language for Legal Onboarding" },
  { code: "fr", name: "Français", flag: "🇫🇷", tagline: "Choisissez votre langue pour l'onboarding légal" },
  { code: "es", name: "Español", flag: "🇪🇸", tagline: "Elige tu idioma para el onboarding legal" },
  { code: "it", name: "Italiano", flag: "🇮🇹", tagline: "Scegli la tua lingua per l'onboarding legale" },
  { code: "ru", name: "Русский", flag: "🇷🇺", tagline: "Выберите язык для правового онбординга" },
  { code: "pl", name: "Polski", flag: "🇵🇱", tagline: "Wybierz język dla onboardingu prawnego" },
  { code: "cs", name: "Čeština", flag: "🇨🇿", tagline: "Vyberte jazyk pro právní onboarding" },
  { code: "hu", name: "Magyar", flag: "🇭🇺", tagline: "Válasszon nyelvet a jogi onboardinghoz" },
];

export default function ModeSelector({ onSelect }) {
  const [showGuidedInfo, setShowGuidedInfo] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const t = TRANSLATIONS[selectedLang.code] || TRANSLATIONS.de;
  const [rotatingIdx, setRotatingIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setRotatingIdx(i => (i + 1) % LANGUAGES.length);
        setFade(true);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F0F0] flex flex-col items-center justify-center px-4 relative">
      <div className="text-center mb-10">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a69aeeacd958731b1cf96e/73e94775a_GingrLogo4x.png"
          alt="gingr"
          className="h-12 object-contain mx-auto"
        />
        <h1 className="text-2xl font-bold text-gray-800 mt-4">{t.title}</h1>
        <p className="text-gray-500 mt-2 max-w-sm text-sm">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
        {/* Self mode */}
        <button
          onClick={() => onSelect("self")}
          className="group bg-white rounded-3xl border-2 border-transparent hover:border-[#FF3CAC] p-7 text-left shadow-sm hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-pink-100 group-hover:bg-pink-200 flex items-center justify-center mb-4 transition-colors">
            <User className="w-6 h-6 text-[#FF3CAC]" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">{t.selfTitle}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{t.selfDesc}</p>
          <span className="inline-block mt-5 bg-[#FF3CAC] hover:bg-[#e030a0] text-white text-sm font-semibold rounded-full px-5 py-2 transition-colors shadow-sm">
            {t.selfBtn}
          </span>
        </button>

        {/* Guided mode */}
        <button
          onClick={() => setShowGuidedInfo(true)}
          className="group bg-white rounded-3xl border-2 border-transparent hover:border-gray-300 p-7 text-left shadow-sm hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center mb-4 transition-colors">
            <Users className="w-6 h-6 text-gray-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">{t.guidedTitle}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{t.guidedDesc}</p>
          <span className="inline-block mt-5 bg-white border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-full px-5 py-2 transition-colors group-hover:border-gray-400">
            {t.guidedBtn}
          </span>
        </button>
      </div>

      {/* Language Selector Block */}
      <div className="mt-8 flex flex-col items-center gap-3 w-full max-w-xl">
        <div className="h-5 flex items-center justify-center">
          <p
            style={{ transition: "opacity 0.3s ease", opacity: fade ? 1 : 0 }}
            className="text-xs text-gray-400 text-center"
          >
            <span className="mr-1">{LANGUAGES[rotatingIdx].flag}</span>
            {LANGUAGES[rotatingIdx].tagline}
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5 shadow-sm border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all text-sm font-semibold text-gray-700"
          >
            <span className="text-base">{selectedLang.flag}</span>
            <span>{selectedLang.name}</span>
            <Globe className="w-3.5 h-3.5 text-gray-400 ml-1" />
          </button>
          {showLangMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowLangMenu(false)} />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-12 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 min-w-[200px] overflow-hidden">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-4 pt-1 pb-2">Sprache wählen</p>
                <div className="grid grid-cols-2 gap-0">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setSelectedLang(lang); setShowLangMenu(false); }}
                      className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-pink-50 transition-colors ${selectedLang.code === lang.code ? "bg-pink-50 text-[#FF3CAC] font-semibold" : "text-gray-700"}`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <a
        href={createPageUrl("AdminDashboard")}
        className="mt-6 flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#FF3CAC] transition-colors"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        Admin-Dashboard
      </a>

      {/* Guided Mode Modal */}
      {showGuidedInfo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-7 relative">
            <button
              onClick={() => setShowGuidedInfo(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#FF3CAC]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Termin buchen</h2>
                <p className="text-sm text-gray-500">Onboarding mit gingr-Begleitung</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-5">
              Bitte halte folgende Dokumente bereit, bevor du deinen Termin buchst:
            </p>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="w-4 h-4 text-[#FF3CAC]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Ausweis / Pass</p>
                  <p className="text-xs text-gray-500">Reisepass oder Personalausweis (gültig)</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CreditCard className="w-4 h-4 text-[#FF3CAC]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Aufenthaltsbewilligung</p>
                  <p className="text-xs text-gray-500">Für Nicht-Schweizer: Permit B, C, L oder ähnliches</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Briefcase className="w-4 h-4 text-[#FF3CAC]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Selbständige: Gewerbenachweis</p>
                  <p className="text-xs text-gray-500">UID-Nummer und Handelsregisterauszug oder ähnliches</p>
                </div>
              </li>
            </ul>

            <a
              href="https://calendly.com/ps-gingr/gingr-legal-onboarding"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-[#FF3CAC] hover:bg-[#e030a0] text-white font-semibold rounded-full py-3 transition-colors shadow-md"
            >
              Jetzt Termin buchen →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}