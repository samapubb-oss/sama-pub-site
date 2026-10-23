export interface WebsiteFormula {
  id: string;
  name: string;
  subtitle: string;
  priceFCFA: number;
  formattedPrice: string;
  period?: string;
  isPopular?: boolean;
  description: string;
  inclusions: string[];
  iconName: string;
  iconGradient: string;
  iconColor: string;
  iconBg: string;
  badge: string;
  badgeClass: string;
  cardAccent?: string;
}

export interface WebsiteTypeOption {
  id: string;
  title: string;
  description: string;
  iconName: string;
  badge?: string;
  iconGradient: string;
  iconColor: string;
  iconBg: string;
  badgeClass: string;
  tagline: string;
}

export interface WebsiteFeatureOption {
  id: string;
  label: string;
  description: string;
  iconName: string;
  popular?: boolean;
  badge?: string;
  badgeClass?: string;
  iconGradient: string;
  iconColor: string;
  iconBg: string;
}

export interface ProjectDeadlineOption {
  id: string;
  label: string;
  tag: string;
  description: string;
  emoji: string;
  iconName: string;
  iconGradient: string;
  iconColor: string;
  iconBg: string;
  badge: string;
  badgeClass: string;
}

/**
 * CONFIGURATION FACILE DES PRIX ET OFFRES POUR LA CRÉATION DE SITE INTERNET
 * Modifiez les montants en FCFA et les inclusions directement dans cet objet.
 */
export const websiteFormulas: WebsiteFormula[] = [
  {
    id: "basique",
    name: "Site Basique",
    subtitle: "One-page moderne pour démarrer rapidement",
    priceFCFA: 150000,
    formattedPrice: "150 000 FCFA",
    iconName: "Zap",
    iconColor: "text-cyan-600",
    iconBg: "bg-cyan-50 border-cyan-200/90 shadow-[0_4px_14px_rgba(6,182,212,0.18)]",
    iconGradient: "from-blue-500 to-cyan-500 shadow-[0_6px_20px_rgba(6,182,212,0.35)]",
    badge: "Lancement express",
    badgeClass: "text-cyan-700 bg-cyan-50 border-cyan-200/80",
    description: "La solution express pour lancer votre présence en ligne avec une page unique percutante et professionnelle.",
    inclusions: [
      "Page unique (One-page) moderne & responsive",
      "Bouton WhatsApp flottant direct pour vos commandes",
      "Formulaire de contact rapide anti-spam",
      "Hébergement & Nom de domaine (.sn ou .com) inclus 1 an",
      "Livraison accélérée : 5 à 7 jours",
    ],
    cardAccent: "border-slate-200 hover:border-cyan-400",
  },
  {
    id: "vitrine",
    name: "Site Vitrine",
    subtitle: "Présentation complète de votre entreprise",
    priceFCFA: 300000,
    formattedPrice: "300 000 FCFA",
    isPopular: true,
    iconName: "Sparkles",
    iconColor: "text-sama-orange",
    iconBg: "bg-orange-50 border-orange-200/90 shadow-[0_4px_14px_rgba(255,107,0,0.2)]",
    iconGradient: "from-orange-500 to-amber-500 shadow-[0_6px_20px_rgba(255,107,0,0.4)]",
    badge: "Recommandé PME",
    badgeClass: "text-orange-700 bg-orange-50 border-orange-200/80",
    description: "Une vitrine digitale prestigieuse pour valoriser vos services, rassurer vos prospects et dominer vos concurrents.",
    inclusions: [
      "Jusqu'à 5 pages sur-mesure (Accueil, Services, À propos, Contact)",
      "Référencement SEO Google Dakar & Sénégal",
      "Intégration WhatsApp Business & Google Maps",
      "Design haute fidélité aux couleurs officielles de votre marque",
      "Hébergement ultra-rapide sécurisé SSL offert 1 an",
      "Livraison clé en main : 10 à 14 jours",
    ],
    cardAccent: "border-sama-orange ring-1 ring-sama-orange/20",
  },
  {
    id: "premium",
    name: "Site Premium E-commerce",
    subtitle: "Ventes en ligne & paiements Wave / Orange Money",
    priceFCFA: 650000,
    formattedPrice: "650 000 FCFA",
    iconName: "TrendingUp",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50 border-purple-200/90 shadow-[0_4px_14px_rgba(124,58,237,0.18)]",
    iconGradient: "from-purple-600 to-indigo-600 shadow-[0_6px_20px_rgba(124,58,237,0.4)]",
    badge: "E-commerce & Scaling",
    badgeClass: "text-purple-700 bg-purple-50 border-purple-200/80",
    description: "Plateforme interactive complète avec catalogue de produits, gestion des commandes et encaissement direct au Sénégal.",
    inclusions: [
      "Boutique e-commerce ou catalogue interactif complet",
      "Paiements mobiles locaux intégrés : Wave, Orange Money & Carte",
      "Espace administrateur intuitif pour gérer produits & stocks",
      "Moteur de recherche & filtres avancés par catégorie",
      "Formation personnalisée de votre équipe (1h)",
      "Livraison complète : 15 à 20 jours",
    ],
    cardAccent: "border-purple-300 hover:border-purple-500",
  },
  {
    id: "sur-mesure",
    name: "Site Sur-Mesure",
    subtitle: "Architecture complexe, portail ou application web",
    priceFCFA: 0,
    formattedPrice: "Sur devis",
    iconName: "ShieldCheck",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50 border-emerald-200/90 shadow-[0_4px_14px_rgba(5,150,105,0.18)]",
    iconGradient: "from-emerald-600 to-teal-600 shadow-[0_6px_20px_rgba(5,150,105,0.4)]",
    badge: "Projet complexe & App",
    badgeClass: "text-emerald-700 bg-emerald-50 border-emerald-200/80",
    description: "Solution personnalisée pour les projets d'envergure nécessitant des tunnels sur-mesure, API ou espace membre.",
    inclusions: [
      "Architecture web 100% sur-mesure (SaaS, immobilier, portail)",
      "Espace membres, intranet ou tableau de bord client",
      "Connexion API externes & synchronisation CRM / WhatsApp",
      "Tracking Pixel Meta, TikTok & Google Analytics pré-configuré",
      "Accompagnement stratégique & support prioritaire 24/7",
    ],
    cardAccent: "border-emerald-300 hover:border-emerald-500",
  },
];

export const websiteTypes: WebsiteTypeOption[] = [
  {
    id: "ecommerce",
    title: "Site e-commerce",
    tagline: "Ventes & Catalogue",
    description: "Vente en ligne, catalogue produits, paniers et encaissement Wave/Orange Money.",
    iconName: "ShoppingBag",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50 border-blue-200/90 shadow-[0_4px_14px_rgba(37,99,235,0.18)]",
    badge: "Ventes directes",
    iconGradient: "from-blue-600 to-indigo-600 shadow-[0_6px_20px_rgba(37,99,235,0.4)]",
    badgeClass: "text-blue-700 bg-blue-50 border-blue-200/80",
  },
  {
    id: "immobilier",
    title: "Site immobilier",
    tagline: "Biens & Terrains",
    description: "Affichage d'annonces de biens, filtres géographiques et fiches détaillées.",
    iconName: "Building2",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50 border-emerald-200/90 shadow-[0_4px_14px_rgba(5,150,105,0.18)]",
    badge: "BTP & Immo",
    iconGradient: "from-emerald-600 to-teal-600 shadow-[0_6px_20px_rgba(5,150,105,0.4)]",
    badgeClass: "text-emerald-700 bg-emerald-50 border-emerald-200/80",
  },
  {
    id: "vitrine",
    title: "Site vitrine",
    tagline: "Notoriété & Clients",
    description: "Présentation professionnelle de votre activité, crédibilité et contacts entrants.",
    iconName: "Layout",
    iconColor: "text-sama-orange",
    iconBg: "bg-orange-50 border-orange-200/90 shadow-[0_4px_14px_rgba(255,107,0,0.2)]",
    badge: "Recommandé PME",
    iconGradient: "from-orange-500 to-amber-500 shadow-[0_6px_20px_rgba(255,107,0,0.4)]",
    badgeClass: "text-orange-700 bg-orange-50 border-orange-200/80",
  },
  {
    id: "institutionnel",
    title: "Site institutionnel / entreprise",
    tagline: "Grandes PME & Corporate",
    description: "Communication corporate, gouvernance, PME structurée ou organisation.",
    iconName: "Briefcase",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50 border-purple-200/90 shadow-[0_4px_14px_rgba(124,58,237,0.18)]",
    badge: "Corporate",
    iconGradient: "from-purple-600 to-indigo-600 shadow-[0_6px_20px_rgba(124,58,237,0.4)]",
    badgeClass: "text-purple-700 bg-purple-50 border-purple-200/80",
  },
  {
    id: "portfolio",
    title: "Portfolio / personnel",
    tagline: "Consultant & Créatif",
    description: "Mise en avant de vos réalisations, personal branding, consultant ou artiste.",
    iconName: "User",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50 border-amber-200/90 shadow-[0_4px_14px_rgba(217,119,6,0.18)]",
    badge: "Personal Brand",
    iconGradient: "from-amber-500 to-orange-500 shadow-[0_6px_20px_rgba(217,119,6,0.4)]",
    badgeClass: "text-amber-700 bg-amber-50 border-amber-200/80",
  },
  {
    id: "autre",
    title: "Autre projet spécifique",
    tagline: "Sur-mesure",
    description: "Plateforme web personnalisée, SaaS ou besoin technique sur-mesure.",
    iconName: "Sparkles",
    iconColor: "text-cyan-600",
    iconBg: "bg-cyan-50 border-cyan-200/90 shadow-[0_4px_14px_rgba(8,145,178,0.18)]",
    badge: "Sur-mesure",
    iconGradient: "from-cyan-600 to-blue-600 shadow-[0_6px_20px_rgba(8,145,178,0.4)]",
    badgeClass: "text-cyan-700 bg-cyan-50 border-cyan-200/80",
  },
];

export const websiteFeatures: WebsiteFeatureOption[] = [
  {
    id: "paiement-local",
    label: "Paiement en ligne (Wave, Orange Money, carte)",
    description: "Encaissez instantanément vos clients via les solutions mobiles incontournables au Sénégal.",
    iconName: "CreditCard",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50 border-blue-200/90 shadow-[0_4px_14px_rgba(24,119,242,0.18)]",
    popular: true,
    badge: "Encaissement 1 clic",
    badgeClass: "text-blue-700 bg-blue-50 border-blue-200/80",
    iconGradient: "from-[#1877F2] to-[#FF6B00] shadow-[0_6px_20px_rgba(24,119,242,0.35)]",
  },
  {
    id: "bouton-whatsapp",
    label: "Bouton WhatsApp direct",
    description: "Bulle de discussion flottante pour transformer vos visiteurs en prospects WhatsApp en 1 clic.",
    iconName: "WhatsApp",
    iconColor: "text-[#25D366]",
    iconBg: "bg-emerald-50 border-emerald-200/90 shadow-[0_4px_14px_rgba(37,211,102,0.18)]",
    popular: true,
    badge: "Conversion directe",
    badgeClass: "text-emerald-700 bg-emerald-50 border-emerald-200/80",
    iconGradient: "from-[#25D366] to-[#128C7E] shadow-[0_6px_20px_rgba(37,211,102,0.35)]",
  },
  {
    id: "blog-actualites",
    label: "Blog & Espace actualités",
    description: "Publiez des articles et actualités pour attirer du trafic organique Google en continu.",
    iconName: "BookOpen",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50 border-purple-200/90 shadow-[0_4px_14px_rgba(124,58,237,0.18)]",
    badge: "SEO Google",
    badgeClass: "text-purple-700 bg-purple-50 border-purple-200/80",
    iconGradient: "from-purple-600 to-indigo-600 shadow-[0_6px_20px_rgba(124,58,237,0.35)]",
  },
  {
    id: "formulaire-contact",
    label: "Formulaire de devis & contact qualifié",
    description: "Capturez les coordonnées complètes et besoins détaillés de vos clients 24h/24.",
    iconName: "FileText",
    iconColor: "text-sama-orange",
    iconBg: "bg-orange-50 border-orange-200/90 shadow-[0_4px_14px_rgba(255,107,0,0.18)]",
    popular: true,
    badge: "Leads qualifiés",
    badgeClass: "text-orange-700 bg-orange-50 border-orange-200/80",
    iconGradient: "from-orange-500 to-amber-500 shadow-[0_6px_20px_rgba(255,107,0,0.35)]",
  },
  {
    id: "multilingue",
    label: "Multilingue (Français / Anglais)",
    description: "Sélecteur de langues fluide pour capter la clientèle internationale et la diaspora.",
    iconName: "Languages",
    iconColor: "text-cyan-600",
    iconBg: "bg-cyan-50 border-cyan-200/90 shadow-[0_4px_14px_rgba(8,145,178,0.18)]",
    badge: "International",
    badgeClass: "text-cyan-700 bg-cyan-50 border-cyan-200/80",
    iconGradient: "from-cyan-600 to-blue-600 shadow-[0_6px_20px_rgba(8,145,178,0.35)]",
  },
  {
    id: "espace-admin",
    label: "Espace d'administration simple",
    description: "Tableau de bord sécurisé pour modifier vos textes, tarifs ou produits sans coder.",
    iconName: "ShieldCheck",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50 border-emerald-200/90 shadow-[0_4px_14px_rgba(5,150,105,0.18)]",
    badge: "Autonomie 100%",
    badgeClass: "text-emerald-700 bg-emerald-50 border-emerald-200/80",
    iconGradient: "from-emerald-600 to-teal-600 shadow-[0_6px_20px_rgba(5,150,105,0.35)]",
  },
];

export const projectDeadlines: ProjectDeadlineOption[] = [
  {
    id: "urgent",
    label: "Moins de 2 semaines",
    tag: "Planning prioritaire",
    description: "Mobilisation immédiate et équipe dédiée pour un lancement express.",
    emoji: "⚡",
    iconName: "Zap",
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50 border-amber-200/90 shadow-[0_4px_14px_rgba(245,158,11,0.2)]",
    iconGradient: "from-amber-500 to-orange-500 shadow-[0_6px_20px_rgba(245,158,11,0.35)]",
    badge: "Prioritaire",
    badgeClass: "text-amber-700 bg-amber-50 border-amber-200",
  },
  {
    id: "standard",
    label: "2 à 4 semaines",
    tag: "Recommandé SAMA PUB",
    description: "Délai optimal pour un design soigné, rédactions et tests complets.",
    emoji: "📅",
    iconName: "Clock",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50 border-blue-200/90 shadow-[0_4px_14px_rgba(37,99,235,0.2)]",
    iconGradient: "from-blue-600 to-indigo-600 shadow-[0_6px_20px_rgba(37,99,235,0.35)]",
    badge: "Idéal PME",
    badgeClass: "text-blue-700 bg-blue-50 border-blue-200",
  },
  {
    id: "flexible",
    label: "Flexible & Conseil",
    tag: "Rythme libre",
    description: "Pas de date limite stricte, priorité à la maturation de votre projet.",
    emoji: "🌿",
    iconName: "Sparkles",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50 border-emerald-200/90 shadow-[0_4px_14px_rgba(5,150,105,0.2)]",
    iconGradient: "from-emerald-600 to-teal-600 shadow-[0_6px_20px_rgba(5,150,105,0.35)]",
    badge: "Économique",
    badgeClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
];
