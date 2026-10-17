import { FAQItem, PortfolioItem } from "@/types";

export const mockFAQ: FAQItem[] = [
  {
    category: "budget",
    question: "Quel budget publicitaire minimum faut-il prévoir pour démarrer ?",
    answer: "Il n'y a pas de montant imposé, mais nous conseillons généralement un budget média publicitaire de départ à partir de 150 000 à 300 000 FCFA par mois pour collecter suffisamment de données et obtenir des résultats significatifs. Ce budget est versé directement aux plateformes (Meta, Google, TikTok), distinctement de nos honoraires d'agence.",
  },
  {
    category: "services",
    question: "En combien de temps une campagne publicitaire est-elle mise en ligne ?",
    answer: "Une fois la stratégie validée et les éléments créatifs approuvés par votre équipe, nous déployons vos campagnes en 3 à 5 jours ouvrés. Nous effectuons systématiquement les vérifications de tracking et de conformité avant tout lancement.",
  },
  {
    category: "methode",
    question: "Comment puis-je suivre les résultats et la rentabilité de mes campagnes ?",
    answer: "La transparence est au cœur de notre engagement. Vous bénéficiez d'un suivi régulier avec des indicateurs clairs : nombre de prospects obtenus, coût par prospect, personnes touchées et estimation du chiffre d'affaires généré. Nous organisons des points périodiques pour débriefer ensemble.",
  },
  {
    category: "services",
    question: "Prenez-vous en charge la création des visuels et vidéos publicitaires ?",
    answer: "Oui, absolument. Notre offre intègre la conception graphique, le montage de formats courts (Reels, TikTok, Stories) et la rédaction des accroches publicitaires. Nous savons que la qualité des créas représente plus de 70% de la performance finale d'une campagne.",
  },
  {
    category: "contrat",
    question: "Comment démarrer une collaboration avec SAMA PUB ?",
    answer: "La première étape est très simple : demandez un devis ou contactez-nous directement par WhatsApp. Nous organisons un premier échange pour comprendre vos objectifs, auditer votre situation actuelle et vous proposer un plan d'action adapté sans engagement.",
  },
  {
    category: "contrat",
    question: "Intervenez-vous uniquement au Sénégal ou aussi à l'international ?",
    answer: "Notre siège opérationnel est à Dakar, mais nous accompagnons des clients et des marques dans toute la zone UEMOA (Côte d'Ivoire, Mali, etc.) ainsi que des entreprises de la diaspora souhaitant cibler l'Afrique francophone.",
  },
];

export const mockPortfolio: PortfolioItem[] = [
  {
    id: "campagne-alkhiry",
    title: "Campagne Al Khaïry Construction",
    category: "Acquisition B2B · BTP",
    objective: "Génération de prospects qualifiés et demandes de devis de construction via WhatsApp",
    metrics: [
      { label: "Conversations", value: "320" },
      { label: "Coût / conv.", value: "0,21 $" },
      { label: "Dépensé", value: "67,71 $" },
    ],
    tag: "Données réelles · 17 sept – 16 oct",
    isDemo: false,
    imageUrl: "/images/al-khairy-construction.png",
  },
  {
    id: "campagne-miel",
    title: "Campagne Miel du Sénégal",
    category: "E-commerce & Agroalimentaire",
    objective: "Génération de commandes directes et engagement fort autour des produits locaux du Sénégal",
    metrics: [
      { label: "Conversations", value: "273" },
      { label: "Coût / conv.", value: "0,09 $" },
      { label: "CTR (Clics)", value: "6,40 %" },
    ],
    tag: "Données réelles · 30 derniers jours",
    isDemo: false,
    imageUrl: "/images/miel-du-senegal.png",
  },
  {
    id: "campagne-sama-pub",
    title: "Campagne Vidéo SAMA PUB",
    category: "Agence & Publicité Vidéo",
    objective: "Acquisition de clients agence via un format vidéo publicitaire court à fort pouvoir d'arrêt",
    metrics: [
      { label: "Conversations", value: "211" },
      { label: "Lectures vidéo", value: "26 742" },
      { label: "Taux accroche", value: "52 %" },
    ],
    tag: "Données réelles · 17 sept – 16 oct",
    isDemo: false,
    imageUrl: "/images/sama-pub-workspace.png",
  },
];
