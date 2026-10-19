import { MetricItem, PillarItem, ProcessStep } from "@/types";

export const mockStats: MetricItem[] = [
  {
    id: "campagnes",
    prefix: "+",
    value: "50",
    label: "Campagnes menées",
    sublabel: "Sur Meta, TikTok & Google Ads",
    iconName: "Target",
    isDemo: false,
  },
  {
    id: "clients",
    prefix: "+",
    value: "40",
    label: "Clients satisfaits",
    sublabel: "Entreprises, commerces et PME",
    iconName: "Users",
    isDemo: false,
  },
  {
    id: "impressions",
    prefix: "+",
    value: "1M",
    label: "Personnes touchées",
    sublabel: "Au Sénégal et en Afrique de l'Ouest",
    iconName: "Eye",
    isDemo: false,
  },
  {
    id: "roi",
    prefix: "+",
    value: "3x",
    label: "En moyenne de ROI",
    sublabel: "Sur les investissements publicitaires",
    iconName: "TrendingUp",
    isDemo: true,
  },
];

export const aboutPillars: PillarItem[] = [
  {
    id: "creativite",
    title: "Créativité sans limite",
    description: "Des concepts visuels innovants et des angles de communication originaux pour démarquer immédiatement votre marque de la concurrence.",
    iconName: "Sparkles",
  },
  {
    id: "expertise",
    title: "Expertise digitale",
    description: "Maîtrise pointue des algorithmes publicitaires, des stratégies de ciblage et des technologies d'acquisition les plus récentes.",
    iconName: "ShieldCheck",
  },
  {
    id: "accompagnement",
    title: "Accompagnement personnalisé",
    description: "Une équipe dédiée et disponible au quotidien, à l'écoute de vos besoins pour des échanges fluides et des réponses rapides.",
    iconName: "HeartHandshake",
  },
  {
    id: "resultats",
    title: "Résultats mesurables",
    description: "Zéro jargon obscur. Des tableaux de bord clairs, des indicateurs de performance précis et un suivi rigoureux de chaque franc investi.",
    iconName: "BarChart4",
  },
];

export const methodologySteps: ProcessStep[] = [
  {
    step: "01",
    number: "1",
    title: "Audit & Immersion Stratégique",
    description: "Nous analysons votre offre, votre marché, vos concurrents et vos performances passées pour définir la stratégie publicitaire la plus rentable.",
    deliverables: ["Diagnostic d'audience", "Plan de ciblage", "Recommandation budgétaire"],
  },
  {
    step: "02",
    number: "2",
    title: "Création des Contenus & Tunnels",
    description: "Nos graphistes et copywriters créent des visuels captivants et rédigent des messages persuasifs spécialement conçus pour générer des clics qualifiés.",
    deliverables: ["Pack visuels & vidéos publicitaires", "Textes d'annonces A/B", "Optimisation des pages de destination"],
  },
  {
    step: "03",
    number: "3",
    title: "Lancement & Optimisation Continue",
    description: "Mise en ligne des campagnes avec tests itératifs permanents pour réduire le coût par prospect et maximiser les conversions utiles.",
    deliverables: ["Tracking analytique avancé", "Optimisation quotidienne des enchères", "Élimination des dépenses inutiles"],
  },
  {
    step: "04",
    number: "4",
    title: "Reporting & Passage à l'Échelle (Scale)",
    description: "Nous partageons des bilans réguliers et limpides. Dès qu'une campagne est rentable, nous augmentons le budget pour démultiplier vos ventes.",
    deliverables: ["Rapport de performance hebdomadaire", "Analyse détaillée du ROI/ROAS", "Plan d'expansion stratégique"],
  },
];
