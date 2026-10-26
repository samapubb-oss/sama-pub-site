import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import type { DevisData } from "@/types/devis";
import { formatFcfa, formatDateFr } from "@/lib/pdf-utils";
import { SAMA_AGENCY_INFO } from "@/lib/devis-config";

// URLs CDN stables pour polices TrueType
const ROBOTO_REGULAR_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf";
const ROBOTO_MEDIUM_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf";
const ROBOTO_ITALIC_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf";

try {
  let regularSrc: string = ROBOTO_REGULAR_URL;
  let boldSrc: string = ROBOTO_MEDIUM_URL;
  let italicSrc: string = ROBOTO_ITALIC_URL;

  if (typeof window === "undefined") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fs = require("fs");
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const path = require("path");
      const regPath = path.join(process.cwd(), "public", "fonts", "Roboto-Regular.ttf");
      const boldPath = path.join(process.cwd(), "public", "fonts", "Roboto-Medium.ttf");
      const itaPath = path.join(process.cwd(), "public", "fonts", "Roboto-Italic.ttf");

      if (fs.existsSync(regPath) && fs.existsSync(boldPath)) {
        regularSrc = `data:font/truetype;base64,${fs.readFileSync(regPath).toString("base64")}`;
        boldSrc = `data:font/truetype;base64,${fs.readFileSync(boldPath).toString("base64")}`;
        italicSrc = fs.existsSync(itaPath)
          ? `data:font/truetype;base64,${fs.readFileSync(itaPath).toString("base64")}`
          : regularSrc;
      }
    } catch {
      // CDN fallback
    }
  }

  Font.register({
    family: "Roboto",
    fonts: [
      { src: regularSrc, fontWeight: "normal" },
      { src: boldSrc, fontWeight: "bold" },
      { src: italicSrc, fontStyle: "italic" },
    ],
  });
} catch {
  // Déjà enregistré
}

const COLORS = {
  navy: "#0B192C",
  navySurface: "#10233A",
  orange: "#FF6B00",
  orangeLight: "#FFF7ED",
  orangeBorder: "#FED7AA",
  cyan: "#0284C7",
  cyanLight: "#F0F9FF",
  cyanBorder: "#BAE6FD",
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
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 28,
    fontSize: 8,
    fontFamily: "Roboto",
    color: COLORS.slate900,
    backgroundColor: COLORS.white,
    lineHeight: 1.25,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.orange,
    marginBottom: 10,
  },
  logoBrandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 38,
    height: 38,
    marginRight: 8,
  },
  logoFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.orange,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  logoFallbackText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: "Roboto",
    fontWeight: "bold",
  },
  brandTextCol: {
    flexDirection: "column",
    justifyContent: "center",
  },
  brandTitleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  brandNameNavy: {
    fontSize: 16,
    lineHeight: 1.2,
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: COLORS.navy,
    letterSpacing: -0.2,
  },
  brandNameOrange: {
    fontSize: 16,
    lineHeight: 1.2,
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: COLORS.orange,
    letterSpacing: -0.2,
  },
  brandBaseline: {
    fontSize: 7,
    lineHeight: 1.2,
    color: COLORS.slate500,
    fontFamily: "Roboto",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  agencyDetails: {
    alignItems: "flex-end",
  },
  agencyAddress: {
    fontSize: 7.5,
    color: COLORS.slate600,
    marginTop: 1,
  },
  agencyHighlight: {
    fontSize: 7.5,
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: COLORS.navy,
  },
  titleBar: {
    backgroundColor: COLORS.navy,
    borderRadius: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  titleBarLeft: {
    flex: 1,
  },
  docTypeTag: {
    fontSize: 7,
    color: "#38BDF8", // Cyan clair
    fontFamily: "Roboto",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  titleBarHeading: {
    fontSize: 11,
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: COLORS.white,
    marginTop: 1,
  },
  devisRefBox: {
    alignItems: "flex-end",
    backgroundColor: COLORS.navySurface,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#1E3A5F",
  },
  devisNum: {
    fontSize: 8.5,
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: COLORS.orange,
  },
  devisDate: {
    fontSize: 6.8,
    color: COLORS.slate300,
    marginTop: 1,
  },
  grid2Col: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  clientBox: {
    flex: 1,
    backgroundColor: COLORS.slate50,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    padding: 8,
  },
  projectBox: {
    flex: 1,
    backgroundColor: COLORS.cyanLight,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.cyanBorder,
    padding: 8,
  },
  boxHeader: {
    fontSize: 7,
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: COLORS.navy,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
    paddingBottom: 3,
    borderBottomWidth: 0.8,
    borderBottomColor: COLORS.slate200,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 2,
    fontSize: 7.2,
  },
  infoLabel: {
    width: 65,
    color: COLORS.slate500,
  },
  infoValue: {
    flex: 1,
    color: COLORS.slate800,
    fontFamily: "Roboto",
    fontWeight: "bold",
  },
  descriptionBanner: {
    backgroundColor: COLORS.orangeLight,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.orange,
    padding: 7,
    borderRadius: 4,
    marginBottom: 8,
  },
  descriptionHeading: {
    fontSize: 7,
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: COLORS.orange,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  descriptionText: {
    fontSize: 7.2,
    color: COLORS.slate700,
    lineHeight: 1.3,
  },
  table: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    overflow: "hidden",
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.navy,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  thCell: {
    color: COLORS.white,
    fontSize: 7,
    fontFamily: "Roboto",
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 0.8,
    borderBottomColor: COLORS.slate100,
    backgroundColor: COLORS.white,
    alignItems: "center",
  },
  tdDesc: {
    flex: 1,
  },
  tdItemTitle: {
    fontSize: 7.8,
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: COLORS.slate900,
  },
  tdItemSubtitle: {
    fontSize: 6.8,
    color: COLORS.slate500,
    marginTop: 1.5,
    lineHeight: 1.25,
  },
  tdPrice: {
    width: 90,
    textAlign: "right",
    fontSize: 8,
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: COLORS.navy,
  },
  inclusionsBox: {
    backgroundColor: COLORS.greenBg,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.greenBorder,
    padding: 7,
    marginBottom: 8,
  },
  inclusionsTitle: {
    fontSize: 7.2,
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: COLORS.greenText,
    marginBottom: 3,
  },
  inclusionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  inclusionTag: {
    backgroundColor: COLORS.white,
    borderRadius: 3,
    borderWidth: 0.8,
    borderColor: COLORS.greenBorder,
    paddingVertical: 2,
    paddingHorizontal: 5,
    fontSize: 6.5,
    color: COLORS.greenText,
    fontFamily: "Roboto",
    fontWeight: "bold",
  },
  financialSummary: {
    backgroundColor: COLORS.slate50,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    padding: 8,
    marginBottom: 8,
  },
  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2.5,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.slate200,
  },
  financialRowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 5,
    marginTop: 2,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.orange,
  },
  financialLabel: {
    fontSize: 7.2,
    color: COLORS.slate600,
  },
  financialValue: {
    fontSize: 7.5,
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: COLORS.slate900,
  },
  totalLabel: {
    fontSize: 8.5,
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: COLORS.navy,
  },
  totalValue: {
    fontSize: 11,
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: COLORS.orange,
  },
  termsBox: {
    backgroundColor: COLORS.slate50,
    borderRadius: 4,
    borderWidth: 0.8,
    borderColor: COLORS.slate200,
    padding: 6,
    marginBottom: 10,
  },
  termsTitle: {
    fontSize: 6.8,
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: COLORS.navy,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  termsText: {
    fontSize: 6.5,
    color: COLORS.slate600,
    lineHeight: 1.3,
  },
  signatureRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: "auto",
  },
  signatureBox: {
    flex: 1,
    height: 60,
    backgroundColor: COLORS.white,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    padding: 6,
    justifyContent: "space-between",
  },
  signTitle: {
    fontSize: 6.8,
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: COLORS.slate700,
    textTransform: "uppercase",
  },
  signSub: {
    fontSize: 6,
    color: COLORS.slate400,
    marginTop: 1,
  },
  signAgencyName: {
    fontSize: 7.2,
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: COLORS.navy,
  },
  footer: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 0.8,
    borderTopColor: COLORS.slate200,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 6,
    color: COLORS.slate400,
  },
});

interface WebsiteDevisPdfDocumentProps {
  devis: DevisData;
  logoUrl?: string;
}

export const WebsiteDevisPdfDocument: React.FC<WebsiteDevisPdfDocumentProps> = ({
  devis,
  logoUrl,
}) => {
  const clientName = devis.client?.nom || "Client";
  const clientCompany = devis.client?.entreprise || "";
  const clientPhone = devis.client?.whatsapp || "";
  const clientEmail = devis.client?.email || "";

  const totalHon = devis.total_honoraires || devis.total_general || 300000;
  const tranche1 = devis.tranche_1_prestation || Math.round(totalHon * 0.5);
  const tranche2 = devis.tranche_2_prestation || (totalHon - tranche1);

  const formuleName = devis.formule_site || "Site Vitrine";
  const typeLabel = devis.type_site || "Site vitrine";
  const delaiLabel = devis.delai_site || "Standard (10 à 14 jours)";

  return (
    <Document title={`Devis SAMA PUB — ${devis.numero_devis || "Web"}`} author="SAMA PUB Dakar">
      <Page size="A4" style={styles.page}>
        {/* 1. En-tête officiel SAMA PUB */}
        <View style={styles.headerContainer}>
          <View style={styles.logoBrandRow}>
            {logoUrl ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={logoUrl} style={styles.logoImage} />
            ) : (
              <View style={styles.logoFallback}>
                <Text style={styles.logoFallbackText}>SP</Text>
              </View>
            )}
            <View style={styles.brandTextCol}>
              <View style={styles.brandTitleRow}>
                <Text style={styles.brandNameNavy}>SAMA </Text>
                <Text style={styles.brandNameOrange}>PUB</Text>
              </View>
              <Text style={styles.brandBaseline}>
                AGENCE DE CRÉATION DIGITALE & PERFORMANCE · DAKAR
              </Text>
            </View>
          </View>

          <View style={styles.agencyDetails}>
            <Text style={styles.agencyHighlight}>SAMA PUB SARL · DAKAR</Text>
            <Text style={styles.agencyAddress}>WhatsApp : {SAMA_AGENCY_INFO.telephone}</Text>
            <Text style={styles.agencyAddress}>E-mail : {SAMA_AGENCY_INFO.email}</Text>
            <Text style={styles.agencyAddress}>Web : {SAMA_AGENCY_INFO.site}</Text>
          </View>
        </View>

        {/* 2. Titre et référence du document */}
        <View style={styles.titleBar}>
          <View style={styles.titleBarLeft}>
            <Text style={styles.docTypeTag}>PROPOSITION COMMERCIALE · CONCEPTION WEB</Text>
            <Text style={styles.titleBarHeading}>
              {devis.titre_devis || `Création de ${formuleName}`}
            </Text>
          </View>
          <View style={styles.devisRefBox}>
            <Text style={styles.devisNum}>{devis.numero_devis || "WEB-2026-0001"}</Text>
            <Text style={styles.devisDate}>
              Date : {formatDateFr(devis.date_generation)}
            </Text>
          </View>
        </View>

        {/* 3. Deux blocs : Informations Client & Spécifications Projet */}
        <View style={styles.grid2Col}>
          {/* Bloc Client */}
          <View style={styles.clientBox}>
            <Text style={styles.boxHeader}>Destinataire / Client</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nom complet :</Text>
              <Text style={styles.infoValue}>{clientName}</Text>
            </View>
            {clientCompany ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Entreprise :</Text>
                <Text style={styles.infoValue}>{clientCompany}</Text>
              </View>
            ) : null}
            {clientPhone ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>WhatsApp :</Text>
                <Text style={styles.infoValue}>{clientPhone}</Text>
              </View>
            ) : null}
            {clientEmail ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>E-mail :</Text>
                <Text style={styles.infoValue}>{clientEmail}</Text>
              </View>
            ) : null}
          </View>

          {/* Bloc Projet Web */}
          <View style={styles.projectBox}>
            <Text style={styles.boxHeader}>Spécifications Techniques</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Formule :</Text>
              <Text style={styles.infoValue}>{formuleName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type de site :</Text>
              <Text style={styles.infoValue}>{typeLabel}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Délai estimé :</Text>
              <Text style={styles.infoValue}>{delaiLabel}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Validité :</Text>
              <Text style={styles.infoValue}>{devis.validite || "15 jours"}</Text>
            </View>
          </View>
        </View>

        {/* 4. Synthèse du projet et du besoin exprimé */}
        <View style={styles.descriptionBanner}>
          <Text style={styles.descriptionHeading}>Projet & Objectif Commercial</Text>
          <Text style={styles.descriptionText}>
            {devis.description_projet || devis.introduction || "Conception d'une présence web haut de gamme conçue pour valoriser votre marque et générer des prises de contact directes."}
          </Text>
        </View>

        {/* 5. Tableau des prestations */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.thCell, { flex: 1 }]}>DÉSIGNATION DE LA PRESTATION WEB</Text>
            <Text style={[styles.thCell, styles.tdPrice]}>TOTAL NET</Text>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tdDesc}>
              <Text style={styles.tdItemTitle}>
                {formuleName} — Conception, Design UX/UI & Développement
              </Text>
              <Text style={styles.tdItemSubtitle}>
                {devis.mission_description || "Architecture responsive Mobile-First, intégration graphique sur-mesure, boutons WhatsApp direct, formulaire anti-spam, référencement Google Dakar & Sénégal, sécurisation SSL et formation 1h."}
              </Text>
            </View>
            <Text style={styles.tdPrice}>{formatFcfa(totalHon)}</Text>
          </View>
        </View>

        {/* 6. Inclusions Offertes la première année */}
        <View style={styles.inclusionsBox}>
          <Text style={styles.inclusionsTitle}>
            ✓ Inclusions officielles offertes par SAMA PUB (Valeur 90 000 FCFA offerte) :
          </Text>
          <View style={styles.inclusionsRow}>
            <Text style={styles.inclusionTag}>Nom de domaine (.sn ou .com) inclus 1 an</Text>
            <Text style={styles.inclusionTag}>Hébergement cloud haute performance SSL inclus 1 an</Text>
            <Text style={styles.inclusionTag}>Design Mobile-First ultra-rapide</Text>
            <Text style={styles.inclusionTag}>Formation personnalisée 1h offerte</Text>
            <Text style={styles.inclusionTag}>Garantie technique & Support 30 jours</Text>
          </View>
        </View>

        {/* 7. Récapitulatif financier et échéancier de paiement */}
        <View style={styles.financialSummary}>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Montant forfaitaire de la création web :</Text>
            <Text style={styles.financialValue}>{formatFcfa(totalHon)}</Text>
          </View>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>1ère tranche — Acompte au démarrage (50%) :</Text>
            <Text style={[styles.financialValue, { color: COLORS.cyan }]}>
              {formatFcfa(tranche1)}
            </Text>
          </View>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>2ème tranche — Solde à la mise en ligne (50%) :</Text>
            <Text style={[styles.financialValue, { color: COLORS.cyan }]}>
              {formatFcfa(tranche2)}
            </Text>
          </View>
          <View style={styles.financialRowTotal}>
            <Text style={styles.totalLabel}>TOTAL À RÉGLER (FCFA) :</Text>
            <Text style={styles.totalValue}>{formatFcfa(totalHon)}</Text>
          </View>
        </View>

        {/* 8. Conditions de règlement & Cession de propriété */}
        <View style={styles.termsBox}>
          <Text style={styles.termsTitle}>Modalités de Paiement & Propriété du Site</Text>
          <Text style={styles.termsText}>
            Paiement accepté via Wave Business, Orange Money ou Virement bancaire. Dès la validation finale et le règlement du solde, le client devient l&apos;unique et entier propriétaire du nom de domaine, des codes sources et de l&apos;intégralité des accès administrateurs.
          </Text>
        </View>

        {/* 9. Signatures */}
        <View style={styles.signatureRow}>
          <View style={styles.signatureBox}>
            <View>
              <Text style={styles.signTitle}>Pour l&apos;Agence SAMA PUB</Text>
              <Text style={styles.signSub}>Direction Technique & Commerciale</Text>
            </View>
            <Text style={styles.signAgencyName}>ABDOU LAHAT DIOP · Fondateur</Text>
          </View>

          <View style={styles.signatureBox}>
            <View>
              <Text style={styles.signTitle}>Pour le Client (Bon pour accord)</Text>
              <Text style={styles.signSub}>Date, signature & mention « Lu et approuvé »</Text>
            </View>
            <Text style={[styles.signAgencyName, { color: COLORS.slate400, fontStyle: "italic" }]}>
              {clientCompany || clientName}
            </Text>
          </View>
        </View>

        {/* 10. Pied de page */}
        <View style={styles.footer}>
          <Text>SAMA PUB Dakar · SARL au capital de 1 000 000 FCFA · NINEA Dakar Sénégal</Text>
          <Text>Proposition officielle générée le {formatDateFr(devis.date_generation)}</Text>
        </View>
      </Page>
    </Document>
  );
};
