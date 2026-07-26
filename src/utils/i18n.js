import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "welcome": "Hello",
      "focus_session": "Focus Session",
      "streak": "Streak",
      "points": "Points",
      "my_profile": "My Profile",
      "the_tribe": "The Tribe",
      "journal": "Journal",
      "roadmap": "Your Goals & Roadmaps",
      "ai_coach": "AI Coach",
      "ambient_sound": "Ambient Focus Audio",
      "streak_freeze": "Streak Freeze / Rest Day",
      "habit_stacking": "Habit Stacking & Routine Chain",
    }
  },
  hi: {
    translation: {
      "welcome": "नमस्ते",
      "focus_session": "फोकस सत्र",
      "streak": "लगातार दिन",
      "points": "अंक",
      "my_profile": "मेरी प्रोफ़ाइल",
      "the_tribe": "दल (Tribe)",
      "journal": "डायरी (Journal)",
      "roadmap": "आपके लक्ष्य और रोडमैप",
      "ai_coach": "एआई कोच",
      "ambient_sound": "फोकस ऑडियो sound",
      "streak_freeze": "स्ट्रिक फ्रीज / विश्राम दिवस",
      "habit_stacking": "आदत श्रृंखला (Habit Stacking)",
    }
  },
  es: {
    translation: {
      "welcome": "Hola",
      "focus_session": "Sesión de Enfoque",
      "streak": "Racha",
      "points": "Puntos",
      "my_profile": "Mi Perfil",
      "the_tribe": "La Tribu",
      "journal": "Diario",
      "roadmap": "Tus Metas y Hoja de Ruta",
      "ai_coach": "Coach IA",
      "ambient_sound": "Sonido Ambiental",
      "streak_freeze": "Congelar Racha",
      "habit_stacking": "Encadenamiento de Hábitos",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
