export interface LigneDevis {
  designation: string;
  description: string;
  quantite: number;
  prix_unitaire: number;
  total: number;
}

export interface ClientDevis {
  nom: string;
  entreprise: string;
  whatsapp: string;
  email: string;
}

export interface DevisData {
  fiable: boolean;
  alertes_internes: string[];
  client: ClientDevis;
  service: string;
  titre_devis: string;
  introduction: string;
  description_projet?: string; // Synthèse fidèle du besoin/projet exprimé par le client
  lignes: LigneDevis[];
  mission_description?: string; // Description de la mission et du placement intelligent sur Meta
  total_honoraires: number; // Prestation de l'agence (15% du budget Meta)
  budget_publicitaire_recommande: number; // Budget publicitaire Meta (100% alloué à Meta)
  tranche_1_prestation?: number; // 50% de la prestation au démarrage
  tranche_2_prestation?: number; // 50% de la prestation à 15 jours
  total_general?: number; // Total opérationnel : Budget Meta + Prestation
  notes: string;
  validite: string;
  conditions_paiement: string;
  message_whatsapp: string;
  email_objet: string;
  email_corps: string;
  // Métadonnées système rattachées
  id_demande?: string;
  numero_devis?: string;
  date_generation?: string;
  type_devis?: "ads" | "website";
  type_site?: string;
  formule_site?: string;
  options_site?: string[];
  delai_site?: string;
}

export interface DevisGenerationRequest {
  id: string;
  nom_complet: string;
  entreprise: string;
  whatsapp: string;
  email: string;
  service: string;
  budget_mensuel: string;
  description: string;
  date_envoi: string;
  heure_envoi: string;
  type_devis?: "ads" | "website";
  type_site?: string;
  formule_site?: string;
  options_site?: string[];
  delai_site?: string;
}
