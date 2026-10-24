import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type { DevisData } from "@/types/devis";
import { formatFcfa, formatDateFr } from "@/lib/pdf-utils";
import { SAMA_AGENCY_INFO } from "@/lib/devis-config";

// Palette officielle SAMA PUB
const COLORS = {
  navy: "#0B192C",
  navySurface: "#10233A",
  orange: "#FF6B00",
  orangeLight: "#FFF7ED",
  orangeBorder: "#FED7AA",
  slate900: "#0F172A",
  slate800: "#1E293B",
  slate700: "#334155",
  slate600: "#475569",
  slate500: "#64748B",
  slate400: "#94A3B8",
  slate300: "#CBD5E1",
  slate200: "#E2E8F0",
  slate100: "#F1F5F9",
  slate50: "#F8FAFC",
  white: "#FFFFFF",
  greenBg: "#F0FDF4",
  greenBorder: "#86EFAC",
  greenText: "#166534",
  greenDark: "#14532D",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 28,
    fontSize: 8,
    fontFamily: "Helvetica",
    color: COLORS.slate900,
    backgroundColor: COLORS.white,
    lineHeight: 1.25,
  },
  // En-tête officiel
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.slate200,
  },
  agencyBrand: {
    width: 290,
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  agencyTitle: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    letterSpacing: 0.5,
  },
  agencyOrangeText: {
    color: COLORS.orange,
  },
  agencyBaseline: {
    fontSize: 7,
    color: COLORS.slate500,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  // Badge Devis & Numéro (boîtes distinctes avec padding : ZÉRO chevauchement)
  devisBadgeBlock: {
    width: 220,
    alignItems: "flex-end",
  },
  devisPill: {
    backgroundColor: COLORS.navy,
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginBottom: 3,
  },
  devisTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    lineHeight: 1,
  },
  devisNumberBadge: {
    backgroundColor: COLORS.orangeLight,
    borderWidth: 1,
    borderColor: COLORS.orangeBorder,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 7,
    marginBottom: 3,
  },
  devisNumber: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.orange,
    lineHeight: 1,
  },
  dateText: {
    fontSize: 7,
    color: COLORS.slate500,
    lineHeight: 1,
  },

  // 2 Blocs Info : Client & Modalités
  infoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  clientCard: {
    width: 260,
    backgroundColor: COLORS.slate50,
    borderRadius: 5,
    padding: 7,
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  metaCard: {
    width: 260,
    backgroundColor: COLORS.orangeLight,
    borderRadius: 5,
    padding: 7,
    borderWidth: 1,
    borderColor: COLORS.orangeBorder,
  },
  cardHeader: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  clientCardHeader: {
    color: COLORS.slate600,
  },
  metaCardHeader: {
    color: COLORS.orange,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  cardLabelCol: {
    width: 65,
  },
  cardValueCol: {
    width: 175,
  },
  cardLabel: {
    fontSize: 7,
    color: COLORS.slate500,
  },
  cardValue: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.slate900,
  },

  // Objet du devis
  subjectBanner: {
    marginTop: 8,
    padding: 6,
    backgroundColor: COLORS.slate50,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.orange,
  },
  subjectTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
  },
  subjectIntro: {
    fontSize: 7.5,
    color: COLORS.slate700,
    marginTop: 2,
    lineHeight: 1.25,
  },
  clientNeedBox: {
    marginTop: 3.5,
    paddingTop: 3,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate200,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  clientNeedLabel: {
    fontSize: 6.8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.orange,
    width: 95,
  },
  clientNeedText: {
    fontSize: 6.8,
    fontFamily: "Helvetica-Oblique",
    color: COLORS.slate800,
    width: 430,
    lineHeight: 1.25,
  },

  // Cadre Mission & Placement Intelligent sur Meta (remplace l'ancien tableau pour clarté maximale)
  missionCard: {
    marginTop: 8,
    backgroundColor: COLORS.slate50,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    padding: 7,
  },
  missionCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate200,
  },
  missionCardTitle: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  missionCardBadge: {
    fontSize: 6.8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.orange,
    backgroundColor: COLORS.orangeLight,
    borderWidth: 1,
    borderColor: COLORS.orangeBorder,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  missionCardText: {
    fontSize: 7.2,
    color: COLORS.slate700,
    lineHeight: 1.3,
  },
  missionPillarsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    gap: 5,
  },
  missionPillar: {
    width: 170,
    backgroundColor: COLORS.white,
    borderRadius: 4,
    padding: 5,
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  pillarTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 2,
  },
  pillarDesc: {
    fontSize: 6.5,
    color: COLORS.slate600,
    lineHeight: 1.2,
  },

  // Cadre Récapitulatif Financier (largeurs fixes garanties : ZÉRO chevauchement)
  financeBreakdownSection: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    borderRadius: 5,
    overflow: "hidden",
  },
  financeHeader: {
    backgroundColor: COLORS.slate100,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate200,
  },
  financeHeaderText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.slate700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  financeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4.5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
  },
  financeRowHighlight: {
    backgroundColor: COLORS.orangeLight,
  },
  financeRowDark: {
    backgroundColor: COLORS.navy,
  },
  financeColLabel: {
    width: 360,
  },
  financeColValue: {
    width: 150,
    alignItems: "flex-end",
  },
  financeMainLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.slate900,
  },
  financeSubLabel: {
    fontSize: 6.8,
    color: COLORS.slate500,
    marginTop: 1,
  },
  financeMainValue: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.slate900,
  },
  financePrestationLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.orange,
  },
  financePrestationValue: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.orange,
  },
  financeTotalLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
  },
  financeTotalValue: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.orange,
  },

  // Modalités d'échelonnement (2 tranches de 50%)
  tranchesBanner: {
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    backgroundColor: COLORS.slate50,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate200,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tranchesText: {
    fontSize: 6.8,
    color: COLORS.slate600,
  },
  tranchesValues: {
    fontSize: 6.8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.slate800,
  },

  // Clause de Liberté & Remboursement Garanti
  freedomBanner: {
    marginTop: 8,
    padding: 6,
    backgroundColor: COLORS.greenBg,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.greenBorder,
  },
  freedomHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  freedomBadge: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.greenText,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  freedomText: {
    fontSize: 6.8,
    color: COLORS.greenDark,
    lineHeight: 1.25,
  },

  // Zone de Signatures (2 colonnes élégantes)
  signatureSection: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    width: 260,
    height: 64,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    borderRadius: 4,
    padding: 5,
    backgroundColor: COLORS.slate50,
    justifyContent: "space-between",
  },
  signatureBoxHeader: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.slate700,
    textTransform: "uppercase",
  },
  signatureSubText: {
    fontSize: 6.5,
    color: COLORS.slate500,
    marginTop: 1,
  },
  signatureAgencyStamp: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 3,
  },
  agencyStampBadge: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
  },
  agencyStampStatus: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.orange,
    borderWidth: 1,
    borderColor: COLORS.orange,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  clientSignatureLine: {
    borderTopWidth: 1,
    borderTopColor: COLORS.slate300,
    paddingTop: 3,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  clientDatePlaceholder: {
    fontSize: 6.5,
    color: COLORS.slate400,
  },

  // Pied de page fixe
  footer: {
    position: "absolute",
    bottom: 12,
    left: 28,
    right: 28,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate200,
    textAlign: "center",
  },
  footerText: {
    fontSize: 6.5,
    color: COLORS.slate500,
    textAlign: "center",
  },
  footerBold: {
    fontFamily: "Helvetica-Bold",
    color: COLORS.slate700,
  },
});

interface DevisPdfDocumentProps {
  devis: DevisData;
  logoUrl?: string;
}

export const DevisPdfDocument: React.FC<DevisPdfDocumentProps> = ({
  devis,
  logoUrl = "",
}) => {
  const dateEmission = formatDateFr(devis.date_generation);
  const numeroDevis = devis.numero_devis || "DEV-" + new Date().getFullYear() + "-0001";

  // Montants stricts : Meta Budget (100%), Prestation SAMA PUB (15%), Tranches (50%)
  const metaBudget = devis.budget_publicitaire_recommande || 200000;
  const prestation = devis.total_honoraires || Math.round(metaBudget * 0.15);
  const tranche1 = devis.tranche_1_prestation || Math.round(prestation * 0.5);
  const tranche2 = devis.tranche_2_prestation || prestation - tranche1;
  const totalGeneral = metaBudget + prestation;

  const hasValidLogo =
    Boolean(logoUrl) &&
    (logoUrl.startsWith("data:") ||
      logoUrl.startsWith("http://") ||
      logoUrl.startsWith("https://"));

  return (
    <Document title={`${devis.titre_devis || "Devis"} - SAMA PUB`} author="SAMA PUB Dakar">
      <Page size="A4" style={styles.page}>
        {/* 1. En-tête officiel */}
        <View style={styles.headerContainer}>
          <View style={styles.agencyBrand}>
            {hasValidLogo ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={logoUrl} style={styles.logoImage} />
            ) : (
              <View
                style={[
                  styles.logoImage,
                  {
                    backgroundColor: COLORS.navy,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Helvetica-Bold",
                    color: COLORS.orange,
                  }}
                >
                  SP
                </Text>
              </View>
            )}
            <View>
              <Text style={styles.agencyTitle}>
                SAMA <Text style={styles.agencyOrangeText}>PUB</Text>
              </Text>
              <Text style={styles.agencyBaseline}>{SAMA_AGENCY_INFO.slogan}</Text>
            </View>
          </View>

          {/* Badge Devis & Numéro avec boîtes distinctes anti-chevauchement */}
          <View style={styles.devisBadgeBlock}>
            <View style={styles.devisPill}>
              <Text style={styles.devisTitle}>DEVIS OFFICIEL</Text>
            </View>
            <View style={styles.devisNumberBadge}>
              <Text style={styles.devisNumber}>N° {numeroDevis}</Text>
            </View>
            <Text style={styles.dateText}>Émis le {dateEmission}</Text>
          </View>
        </View>

        {/* 2. Deux Blocs Info : Destinataire & Modalités */}
        <View style={styles.infoSection}>
          {/* Bloc Destinataire */}
          <View style={styles.clientCard}>
            <Text style={[styles.cardHeader, styles.clientCardHeader]}>Destinataire</Text>
            <View style={styles.cardRow}>
              <View style={styles.cardLabelCol}>
                <Text style={styles.cardLabel}>Client :</Text>
              </View>
              <View style={styles.cardValueCol}>
                <Text style={styles.cardValue}>{devis.client.nom || "Client SAMA PUB"}</Text>
              </View>
            </View>
            {devis.client.entreprise ? (
              <View style={styles.cardRow}>
                <View style={styles.cardLabelCol}>
                  <Text style={styles.cardLabel}>Entreprise :</Text>
                </View>
                <View style={styles.cardValueCol}>
                  <Text style={styles.cardValue}>{devis.client.entreprise}</Text>
                </View>
              </View>
            ) : null}
            <View style={styles.cardRow}>
              <View style={styles.cardLabelCol}>
                <Text style={styles.cardLabel}>WhatsApp :</Text>
              </View>
              <View style={styles.cardValueCol}>
                <Text style={styles.cardValue}>{devis.client.whatsapp || "Non renseigné"}</Text>
              </View>
            </View>
            {devis.client.email ? (
              <View style={styles.cardRow}>
                <View style={styles.cardLabelCol}>
                  <Text style={styles.cardLabel}>E-mail :</Text>
                </View>
                <View style={styles.cardValueCol}>
                  <Text style={styles.cardValue}>{devis.client.email}</Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Bloc Modalités */}
          <View style={styles.metaCard}>
            <Text style={[styles.cardHeader, styles.metaCardHeader]}>Modalités du devis</Text>
            <View style={styles.cardRow}>
              <View style={styles.cardLabelCol}>
                <Text style={styles.cardLabel}>Service :</Text>
              </View>
              <View style={styles.cardValueCol}>
                <Text style={styles.cardValue}>{devis.service || "Media Buying (Meta Ads)"}</Text>
              </View>
            </View>
            <View style={styles.cardRow}>
              <View style={styles.cardLabelCol}>
                <Text style={styles.cardLabel}>Validité :</Text>
              </View>
              <View style={styles.cardValueCol}>
                <Text style={styles.cardValue}>{devis.validite || "15 jours"}</Text>
              </View>
            </View>
            <View style={styles.cardRow}>
              <View style={styles.cardLabelCol}>
                <Text style={styles.cardLabel}>Prestation :</Text>
              </View>
              <View style={styles.cardValueCol}>
                <Text style={styles.cardValue}>15% (Option 2 tranches 50/50)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3. Objet & Présentation */}
        <View style={styles.subjectBanner}>
          <Text style={styles.subjectTitle}>{devis.titre_devis || "Campagne Publicitaire Meta Ads — Visibilité & Ventes"}</Text>
          {devis.introduction ? (
            <Text style={styles.subjectIntro}>{devis.introduction}</Text>
          ) : null}
          {devis.description_projet ? (
            <View style={styles.clientNeedBox}>
              <Text style={styles.clientNeedLabel}>Projet & Besoin client :</Text>
              <Text style={styles.clientNeedText}>« {devis.description_projet} »</Text>
            </View>
          ) : null}
        </View>

        {/* 4. Cadre Mission & Placement Intelligent sur Meta */}
        <View style={styles.missionCard}>
          <View style={styles.missionCardHeader}>
            <Text style={styles.missionCardTitle}>DÉPLOIEMENT & PLACEMENT STRATÉGIQUE DU BUDGET</Text>
            <Text style={styles.missionCardBadge}>Expertise SAMA PUB</Text>
          </View>
          <Text style={styles.missionCardText}>
            {devis.mission_description ||
              "L'agence SAMA PUB prend en charge le déploiement et le placement intelligent de l'intégralité de votre budget publicitaire sur la plateforme Meta (Facebook & Instagram). Nos experts configurent une stratégie d'acquisition sur-mesure afin de cibler avec précision vos clients idéaux au Sénégal, de rentabiliser chaque franc investi et d'optimiser continuellement les résultats (contacts qualifiés, visibilité et chiffre d'affaires)."}
          </Text>
          <View style={styles.missionPillarsRow}>
            <View style={styles.missionPillar}>
              <Text style={styles.pillarTitle}>1. Ciblage Chirurgical</Text>
              <Text style={styles.pillarDesc}>
                Identification et ciblage précis des acheteurs qualifiés à Dakar et au Sénégal.
              </Text>
            </View>
            <View style={styles.missionPillar}>
              <Text style={styles.pillarTitle}>2. Annonces Performantes</Text>
              <Text style={styles.pillarDesc}>
                Conception des visuels et messages persuasifs adaptés aux habitudes d'achat locales.
              </Text>
            </View>
            <View style={styles.missionPillar}>
              <Text style={styles.pillarTitle}>3. Optimisation Continue</Text>
              <Text style={styles.pillarDesc}>
                Pilotage quotidien des enchères et réallocation dynamique sur les meilleures pubs.
              </Text>
            </View>
          </View>
        </View>

        {/* 5. Récapitulatif Financier Distingué (zéro chevauchement de texte) */}
        <View style={styles.financeBreakdownSection}>
          <View style={styles.financeHeader}>
            <Text style={styles.financeHeaderText}>Détail et répartition des investissements</Text>
          </View>

          {/* Ligne 1 : Budget Publicitaire Meta (100% alloué aux annonces) */}
          <View style={styles.financeRow}>
            <View style={styles.financeColLabel}>
              <Text style={styles.financeMainLabel}>1. BUDGET PUBLICITAIRE META (100% DIFFUSION)</Text>
              <Text style={styles.financeSubLabel}>
                Versé intégralement à SAMA PUB pour être crédité directement sur votre compte publicitaire Meta Ads
              </Text>
            </View>
            <View style={styles.financeColValue}>
              <Text style={styles.financeMainValue}>{formatFcfa(metaBudget)}</Text>
            </View>
          </View>

          {/* Ligne 2 : Prestation Agence SAMA PUB (Exactement 15% du budget Meta) */}
          <View style={[styles.financeRow, styles.financeRowHighlight]}>
            <View style={styles.financeColLabel}>
              <Text style={styles.financePrestationLabel}>2. PRESTATION DE L'AGENCE SAMA PUB (15% DU BUDGET META)</Text>
              <Text style={styles.financeSubLabel}>
                Honoraires de gestion, placement intelligent du budget, création des annonces et pilotage continu
              </Text>
            </View>
            <View style={styles.financeColValue}>
              <Text style={styles.financePrestationValue}>{formatFcfa(prestation)}</Text>
            </View>
          </View>

          {/* Option échelonnée pour la prestation */}
          <View style={styles.tranchesBanner}>
            <Text style={styles.tranchesText}>
              Facilité de règlement de la prestation en 2 tranches :
            </Text>
            <Text style={styles.tranchesValues}>
              1ère tranche (50%) au lancement : {formatFcfa(tranche1)} • 2ème tranche (50%) à 15 jours : {formatFcfa(tranche2)}
            </Text>
          </View>

          {/* Ligne 3 : Total Général de l'opération */}
          <View style={[styles.financeRow, styles.financeRowDark]}>
            <View style={styles.financeColLabel}>
              <Text style={styles.financeTotalLabel}>TOTAL GLOBAL DE L'OPÉRATION (BUDGET META + PRESTATION)</Text>
            </View>
            <View style={styles.financeColValue}>
              <Text style={styles.financeTotalValue}>{formatFcfa(totalGeneral)}</Text>
            </View>
          </View>
        </View>

        {/* 6. Clause de Liberté Totale & Remboursement Garanti */}
        <View style={styles.freedomBanner}>
          <View style={styles.freedomHeader}>
            <Text style={styles.freedomBadge}>Clause de liberté & Remboursement garanti :</Text>
          </View>
          <Text style={styles.freedomText}>
            Vous avez le droit d'arrêter votre campagne publicitaire à tout moment si les résultats ne vous conviennent pas. L'intégralité du budget publicitaire Meta restant non dépensé vous sera immédiatement et intégralement restituée sur votre compte bancaire ou Wave / Orange Money.
          </Text>
        </View>

        {/* 7. Zone de Signatures (Pour l'Agence & Pour le Client) */}
        <View style={styles.signatureSection}>
          {/* Bloc Agence SAMA PUB */}
          <View style={styles.signatureBox}>
            <View>
              <Text style={styles.signatureBoxHeader}>Pour SAMA PUB (L'Agence)</Text>
              <Text style={styles.signatureSubText}>Bon pour accord et exécution de la prestation</Text>
            </View>
            <View style={styles.signatureAgencyStamp}>
              <Text style={styles.agencyStampBadge}>Direction SAMA PUB Dakar</Text>
              <Text style={styles.agencyStampStatus}>Validé officiel</Text>
            </View>
          </View>

          {/* Bloc Client */}
          <View style={styles.signatureBox}>
            <View>
              <Text style={styles.signatureBoxHeader}>Pour le Client ({devis.client.nom || "Client"})</Text>
              <Text style={styles.signatureSubText}>Mention manuscrite « Lu et approuvé, bon pour accord »</Text>
            </View>
            <View style={styles.clientSignatureLine}>
              <Text style={styles.clientDatePlaceholder}>Date : ..............................</Text>
              <Text style={styles.clientDatePlaceholder}>Signature :</Text>
            </View>
          </View>
        </View>

        {/* 8. Pied de page officiel */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            <Text style={styles.footerBold}>{SAMA_AGENCY_INFO.nom}</Text> — Agence de publicité et marketing digital d'élite à Dakar
          </Text>
          <Text style={styles.footerText}>
            Site web : {SAMA_AGENCY_INFO.site} • Téléphone : {SAMA_AGENCY_INFO.telephone} • E-mail : {SAMA_AGENCY_INFO.email}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
