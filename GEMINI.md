# SAMA PUB — Documentation Technique & Guide de Référence du Projet

> **Fichier de référence permanent pour les développeurs et agents IA.**  
> Ce document synthétise l'architecture, les fonctionnalités, les choix techniques, les normes graphiques et les règles de développement du site vitrine et d'acquisition de **SAMA PUB**.

---

## 1. Ce que le site fait (Vision & Objectifs)

### Identité & Métier
**SAMA PUB** est une agence de publicité et de marketing digital d'élite basée à **Dakar, Sénégal**, spécialisée dans l'acquisition de clients, le **Media Buying** (Meta Ads, Google Ads, TikTok Ads) et la création de contenus publicitaires à fort impact pour le marché sénégalais et ouest-africain.

### Slogan & Promesse
- **Baseline** : *« Plus de visibilité, plus de clients »*
- **Accroche Hero** : *« Votre succès digital commence ici ! »*
- **Proposition de valeur** : Transformer les dépenses publicitaires des entreprises en investissements mesurables avec un fort retour sur investissement (ROAS).

### Public Cible
1. **PME et grandes entreprises sénégalaises** cherchant à structurer leur communication digitale.
2. **E-commerçants et marques D2C locales** (mode, cosmétique, agroalimentaire tel que le cas réel *Miel du Sénégal*).
3. **Entreprises de services B2B** en quête de prospects qualifiés (immobilier, formation, finance, santé).

### Objectifs Business du Site
- **Conversion immédiate** : Génération de devis qualifiés via un formulaire ergonomique en 1 minute.
- **Canal direct WhatsApp** : Prise de contact instantanée adaptée aux habitudes d'affaires en Afrique de l'Ouest.
- **Crédibilité & Réassurance** : Présentation d'études de cas chiffrées, témoignages et méthodologie transparente.

---

## 2. Fonctionnalités Implémentées

### 1. Navigation & Header Sticky (`Header.tsx`)
- Barre de navigation fixe avec détection dynamique du défilement (`isScrolled > 20px` ajoute ombre et compacte la hauteur).
- Logo officiel SAMA PUB (`Logo.tsx`) avec monogramme circulaire SP haute fidélité.
- Menu de navigation desktop avec indicateur actif orange (`bg-sama-orange`).
- Bouton CTA desktop « Demander un devis » avec icône SVG d'envoi.
- Menu Drawer Mobile interactif accessible via bouton hamburger / croix avec transition fluide.

### 2. Hero Section Haute Conversion (`Hero.tsx`)
- Arrière-plan sombre immersif (`#07162C` à `#0E284F`) avec halos lumineux radiaux aux teintes orange et bleu nuit.
- Capsule d'en-tête avec micro-logo SAMA PUB.
- Titre H1 percutant avec mise en valeur orange et interligne optimisé pour mobile et desktop.
- Double Call-To-Action ergonomique :
  - CTA Principal : « Nos services » avec pastille blanche animée sur hover.
  - CTA Secondaire : « Voir notre présentation » avec icône Play dans un halo orange.
- Barre de réassurance exécutive sur une seule ligne (desktop) : *Stratégie sur-mesure*, *Équipe d'experts*, *Résultats mesurables*.
- Visuel immersif ancré dans l'économie locale : Photo haute résolution `/images/miel-du-senegal.png` (récolte de miel au Sénégal).
- Badges flottants de preuve sociale et métriques :
  - Badge supérieur : « Campagne Miel du Sénégal : +340% de ventes ».
  - Badge métrique : « 4.8% CTR moyen » (vs 1.2% moyenne marché).
  - Badge satisfaction : « 98% Clients satisfaits ».

### 3. Grille d'Expertises Métiers (`ServicesGrid.tsx`)
- Disposition en grille 3 colonnes sur desktop (2 rangées de 3 cartes) et 1 colonne fluide sur mobile.
- En-tête centré avec signature visuelle SAMA PUB (doubles barres orange symétriques).
- 6 services complets détaillés :
  1. **Media Buying & Publicité En Ligne** (Meta Ads, Google Ads, TikTok Ads)
  2. **Création de Contenus & Vidéos Publicitaires** (Reels, TikToks, visuels haute conversion)
  3. **Stratégie & Acquisition de Prospects** (Tunnels de vente, formulaires, leads qualifiés)
  4. **Branding & Identité Visuelle** (Logos, chartes graphiques, direction artistique)
  5. **Audit & Optimisation de Campagnes** (Analyse de comptes publicitaires, optimisation ROAS)
  6. **Stratégie Réseaux Sociaux & Community Management** (Planning éditorial, gestion de communauté)
- Bannière sombre d'assurance exécutive avec CTA direct « Demander un devis sur-mesure ».

### 4. Bannière d'Impact & Chiffres Clés (`StatsCounter.tsx`)
- En-tête harmonisé avec protection contre les retours à la ligne intempestifs sur grand écran (`whitespace-nowrap` sur « parlent d'eux-mêmes »).
- 4 cartes d'impact présentées en 4 colonnes sur desktop et 2 colonnes sur mobile :
  - **+250M FCFA** de chiffre d'affaires généré pour nos clients.
  - **4.2x** ROAS moyen constaté sur les campagnes actives.
  - **+150K** Prospects qualifiés livrés directement aux équipes commerciales.
  - **98%** Taux de satisfaction et de fidélisation client.

### 5. Section À Propos & Piliers Stratégiques (`AboutSection.tsx`)
- Présentation de la mission de l'agence à Dakar.
- Les 3 piliers SAMA PUB :
  - *Performance mesurable* (chiffres réels, pas de vanité).
  - *Créativité ancrée dans la culture locale* (maîtrise des codes et usages au Sénégal).
  - *Transparence & Réactivité* (tableaux de bord clairs, équipe joignable en continu).

### 6. Méthodologie en 4 Étapes (`MethodologySection.tsx`)
- Processus clair et rassurant pour tout nouveau client :
  - **Étape 01** : Immersion & Diagnostic stratégique.
  - **Étape 02** : Création & Paramétrage technique (Pixel, tracking, assets créatifs).
  - **Étape 03** : Lancement des campagnes & A/B Testing rigoureux.
  - **Étape 04** : Analyse, Scaling et accélération de la croissance.

### 7. Réalisations & Études de Cas (`PortfolioPreview.tsx`)
- Données réelles certifiées extraites directement de **Meta Ads Manager** avec visuels de campagne intégrés :
  1. **Campagne Al Khaïry Construction** (Acquisition B2B · BTP) : Visuel `/images/al-khairy-construction.png`, 320 conversations, 0,21 $ / message, 67,71 $ de budget investi.
  2. **Campagne Miel du Sénégal** (E-commerce & Agroalimentaire) : Visuel `/images/miel-du-senegal.png`, 273 conversations, 0,09 $ / message, 6,40 % de CTR (vs 1-2% moyenne marché).
  3. **Campagne Vidéo SAMA PUB** (Agence & Publicité Vidéo) : Visuel `/images/sama-pub-workspace.png`, 211 conversations, 26 742 lectures vidéo, 52 % de taux d'accroche.
- Badges de période dynamiques (*« Données réelles · 17 sept – 16 oct »* et *« Données réelles · 30 derniers jours »*) remplaçant le badge "Démonstration".
- Cadres visuels haute fidélité (`Next/Image`) avec zoom progressif au survol et gradient d'ambiance.
- Sous-grille fluide 3 colonnes responsive (`grid-cols-3 gap-2 sm:gap-2.5`) sans retour intempestif ni débordement d'écran sur mobile 360 px.

### 8. Foire Aux Questions Interactive (`FAQSection.tsx`)
- Système d'accordéon dynamique avec ouverture/fermeture fluide.
- Filtre thématique par onglets (*Toutes*, *Budget*, *Services*, *Méthode*, *Contrat*).
- Encart latéral d'assistance directe avec lien WhatsApp officiel.

### 9. Formulaire de Devis & Contact Haute Conversion (`ContactCTA.tsx`)
- **Champs de saisie stricts et obligatoires** :
  - *Nom complet* (obligatoire).
  - *Nom de l'entreprise / marque* (facultatif).
  - *Numéro WhatsApp* (obligatoire, format international ou local ex: `+221 76 142 28 58`).
  - *Adresse e-mail* (obligatoire, validation de format e-mail).
- **Tranches de Budget Calibrées (100 000 FCFA à 1 000 000 FCFA)** :
  - `100 000 - 250 000 FCFA` (Budget minimum)
  - `250 000 - 500 000 FCFA`
  - `500 000 - 750 000 FCFA`
  - `750 000 - 1 000 000 FCFA` (Budget maximum)
  - `Plus de 1 000 000 FCFA` (Scaling)
- **Composant Dropdown Sur-Mesure (`CustomSelect.tsx`)** :
  - Remplace les balises `<select>` natives peu esthétiques et instables sur mobile.
  - Menus déroulants strictement dimensionnés à `w-full` (100% de la largeur du parent) empêchant tout débordement d'écran sur mobile.
  - Gestion du clic extérieur (`handleClickOutside`), fermeture sur touche `Escape`, indicateur visuel de coche.
- **Sécurité Anti-Spam** : Champ honeypot masqué invisible pour les humains qui bloque les robots malveillants.
- **Gestion d'état complète** : États `idle`, `submitting`, `success`, `error` avec persistance Supabase dans `leads_quotes`.
- **Ergonomie Mobile Réfléchie** : Sur mobile, le formulaire est affiché en priorité, suivi de la carte bleue d'informations coordonnées, garantissant une friction minimale à la saisie.
- **Bouton WhatsApp Officiel** : Intégration du composant vectoriel `WhatsAppIcon` et lien direct pré-formaté vers le numéro vérifié `+221 76 142 28 58`.
- **Coordonnées Validées** : Badges temporaires « À confirmer » et « À valider » supprimés suite à la confirmation client.

### 10. Bouton Flottant WhatsApp Permanent (`WhatsAppFloat.tsx`)
- Positionné en bas à droite (`bottom-6 right-6 z-50`).
- Effet de halo clignotant (*ping animation*) pour attirer le regard avec subtilité.
- Utilise l'icône vectorielle officielle WhatsApp (`WhatsAppIcon.tsx`).
- Ouvre directement la messagerie avec le numéro officiel `221761422858` et un message d'accroche pré-rempli.

### 11. Footer Institutionnel (`Footer.tsx`)
- Design sombre (`#0B192C`) épuré et moderne.
- Navigation complète, réseaux sociaux officiels avec vraies icônes vectorielles SVG (Facebook, Instagram, TikTok — LinkedIn retiré).
- Liens directs vers les pages officielles de l'agence.
- Coordonnées physiques et numériques vérifiées à Dakar sans badge temporaire.
- Protection mobile dédiée : classe `pb-24 sm:pb-12` pour éviter que le bouton flottant WhatsApp ne chevauche les liens du bas de page.

---

## 3. Structure des Fichiers du Projet

```
sama pub site/
├── public/
│   ├── images/
│   │   ├── logo-sp.png                       # Monogramme officiel SP SAMA PUB
│   │   ├── miel-du-senegal.png               # Visuel haute qualité de la Hero section & campagne Miel
│   │   ├── al-khairy-construction.png        # Visuel haute qualité campagne Al Khaïry Construction
│   │   └── sama-pub-workspace.png            # Visuel haute qualité campagne Vidéo SAMA PUB
│   └── Miel du Sénégal en pleine récolte.png # Fichier source original
│
├── src/
│   ├── app/
│   │   ├── globals.css                       # Variables CSS, import Tailwind, reset scrollbar
│   │   ├── layout.tsx                        # Root layout, métadonnées SEO, OpenGraph, viewport
│   │   └── page.tsx                          # Page d'accueil principale assemblant tous les blocs
│   │
│   ├── components/
│   │   ├── Header.tsx                        # Navigation fixe, barre sticky, menu drawer mobile
│   │   ├── Logo.tsx                          # Composant Logo vectoriel et image avec gestion des thèmes
│   │   ├── Hero.tsx                          # Hero section complète avec photo locale et badges
│   │   ├── ServicesGrid.tsx                  # Grille des 6 expertises métiers en 3 colonnes desktop
│   │   ├── StatsCounter.tsx                  # Chiffres d'impact avec protection nowrap anti-chevauchement
│   │   ├── AboutSection.tsx                  # Présentation de l'agence et des piliers de valeur
│   │   ├── MethodologySection.tsx            # Processus d'accompagnement en 4 étapes
│   │   ├── PortfolioPreview.tsx              # Études de cas, avant/après et filtres
│   │   ├── FAQSection.tsx                    # Accordéon FAQ interactif par catégorie
│   │   ├── ContactCTA.tsx                    # Formulaire de devis, coordonnées Dakar et liens directs
│   │   ├── CustomSelect.tsx                  # Composant Select accessible et 100% responsive mobile
│   │   ├── WhatsAppIcon.tsx                  # Icône SVG vectorielle officielle de WhatsApp (#25D366)
│   │   ├── WhatsAppFloat.tsx                 # Bouton flottant permanent en bas d'écran
│   │   └── Footer.tsx                        # Pied de page avec marge basse mobile anti-collision
│   │
│   ├── lib/
│   │   └── supabase.ts                       # Client Supabase typé avec clé anonyme et URL
│   │
│   ├── data/
│   │   ├── siteConfig.ts                     # Coordonnées globales, réseaux sociaux, liens de navigation
│   │   └── mock/
│   │       ├── services.ts                   # Liste des services et détails techniques
│   │       ├── about.ts                      # Valeurs, mission et piliers de l'agence
│   │       └── faq.ts                        # Questions / réponses fréquentes et catégorisation
│   │
│   └── types/
│       ├── database.types.ts                 # Types TypeScript générés automatiquement depuis Supabase
│       └── index.ts                          # Déclarations TypeScript (ServiceItem, MetricItem, etc.)
│
├── .env.local                                # Variables d'environnement Supabase (URL + clé publique)
├── .gitignore                                # Protection stricte contre l'envoi de secrets sur GitHub
├── GEMINI.md                                 # CE FICHIER : Guide de référence du projet
├── next.config.js                            # Configuration Next.js (optimisation images, compression)
├── package.json                              # Scripts npm et dépendances du projet
├── postcss.config.js                         # Configuration PostCSS pour Tailwind CSS
├── tailwind.config.ts                        # Configuration Tailwind, palettes sama-*, animations
└── tsconfig.json                             # Configuration TypeScript stricte
```

---

## 4. Technologies Utilisées

| Domaine | Technologie | Rôle dans le projet |
|---|---|---|
| **Framework Web** | **Next.js 14.2.35** | App Router, Server/Client Components, optimisation d'images (`next/image`) |
| **Backend & Base de données** | **Supabase (PostgreSQL 17)** | Stockage dynamique du contenu, capture des devis, sécurité RLS, client SDK `@supabase/supabase-js` |
| **Moteur de dev** | **Turbopack** (`--turbo`) | Compilation instantanée (~100-300ms) via `next dev --turbo` |
| **Bibliothèque UI** | **React 18.3.1** | Gestion d'état locale, hooks (`useState`, `useEffect`, `useRef`) |
| **Langage** | **TypeScript 5.4.5** | Typage strict pour les composants, les types Supabase générés et la configuration |
| **Styling** | **Tailwind CSS 3.4.17** | Système de classes utilitaires, design responsive mobile-first |
| **Iconographie** | **Lucide React 1.57.0** | Icônes modernes, légères et cohérentes pour l'interface |
| **Icone WhatsApp** | **SVG Path Officiel** (`siWhatsapp`) | Tracé vectoriel officiel fidèle à la marque WhatsApp |
| **Polices** | Inter & Plus Jakarta Sans | Typographies modernes sans-serif professionnelles |

---

## 5. Décisions de Design & Charte Graphique

### Palette de Couleurs Officielles (`tailwind.config.ts`)

```typescript
colors: {
  sama: {
    navy: {
      DEFAULT: "#0B192C",  // Bleu nuit signature SAMA PUB
      deep: "#060E18",     // Fond ultra-sombre pour contrastes extrêmes
      surface: "#10233A",  // Surface de cartes sur fond sombre
      card: "#0F2642",     // Cartes d'action
      border: "#1E3A5F",   // Bordures discrètes sur surfaces sombres
      muted: "#8EA8C3",    // Texte secondaire sur surfaces sombres
    },
    orange: {
      DEFAULT: "#FF6B00",  // Orange vibrant de conversion & identité
      hover: "#E05E00",    // État survol des boutons
      dark: "#C75000",     // Accentuation sombre
      light: "#FF8C38",    // Éléments d'accentuation légers
      soft: "#FFF3E8",     // Arrière-plan pastel pour badges clairs
      glow: "rgba(255, 107, 0, 0.25)", // Halos lumineux
    },
    amber: "#FF9F1C",      // Complément chaleureux
    dark: "#0F172A",       // Slate très sombre
    bg: "#F8FAFC",         // Arrière-plan gris clair doux pour sections alternées
  }
}
```

- **Couleur officielle WhatsApp** : `#25D366` (utilisée systématiquement pour l'icône et les boutons d'action WhatsApp).

### Règle Signature des En-Têtes de Section
Chaque section du site respecte **obligatoirement** la même hiérarchie visuelle centrée :
1. **Ligne 1 (Sur-titre)** : Badge centré encadré par deux traits arrondis orange :
   ```tsx
   <div className="inline-flex items-center gap-2 mb-3">
     <span className="w-6 h-0.5 bg-sama-orange rounded-full" />
     <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-sama-orange">
       TITRE DE SECTION
     </span>
     <span className="w-6 h-0.5 bg-sama-orange rounded-full" />
   </div>
   ```
2. **Ligne 2 (Titre principal H2)** : Titre fort avec la dernière expression colorée en orange et protégée contre les retours à la ligne intempestifs :
   ```tsx
   <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-snug sm:leading-normal md:leading-[1.25] mb-4">
     Texte du titre <span className="text-sama-orange whitespace-nowrap">en orange ici</span>
   </h2>
   ```
3. **Ligne 3 (Descriptif)** : Paragraphe équilibré et aéré :
   ```tsx
   <p className="text-base sm:text-lg text-slate-600 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed">
     Description claire et concise...
   </p>
   ```

### Règles d'Ergonomie & Responsivité Mobile
- **Aucun débordement horizontal** : Tout composant déroulant (`CustomSelect`) utilise `w-full` et `overflow-hidden` sur son conteneur parent.
- **Zones tactiles adaptées** : Boutons de 44px de hauteur minimum sur mobile.
- **Protection du bouton WhatsApp flottant** : Tout pied de page ou élément inférieur doit conserver une marge basse suffisante (`pb-24 sm:pb-12`) pour éviter de masquer des informations importantes.
- **Anti-chevauchement sur ordinateur** : Utiliser systématiquement `whitespace-nowrap` sur les expressions courtes stratégiques pour empêcher un retour à la ligne isolé d'un seul mot.

---

## 6. Instructions pour un Futur Modèle d'IA ou Développeur

Lorsque vous intervenez sur ce projet, suivez **scrupuleusement** les règles ci-dessous :

### 1. Démarrage & Exécution du Serveur Local
- Ce projet tourne sous **Windows** avec **Node.js** et **Next.js 14**.
- La commande pour démarrer le serveur de développement est **`npm run dev`** (qui appelle en interne `next dev --turbo`).
- **NE PAS** supprimer le drapeau `--turbo` car Turbopack assure une compilation ultra-rapide sur cet environnement.
- L'URL de développement locale est : `http://localhost:3000`.

### 2. Intégrité des Données & Validation Client
- Les coordonnées officielles ont été confirmées et validées par le client SAMA PUB :
  - **Téléphone & WhatsApp** : `+221 76 142 28 58` (lien international `wa.me/221761422858`)
  - **Email officiel** : `samapubb@gmail.com`
  - **Réseaux sociaux** : Facebook (`/SAMAPUB/`), Instagram (`/samap.ub/`), TikTok (`/@sama.pub`)
  - Le flag `isConfirmed` est défini à `true` et les badges temporaires ont été supprimés.

### 3. Préservation des Visuels Locaux
- **Ne jamais remplacer les visuels locaux validés par des liens Unsplash arbitraires.**
- Le visuel principal de la Hero section est stocké localement dans [`public/images/miel-du-senegal.png`](file:///c:/Users/user/Documents/sama%20pub%20site/public/images/miel-du-senegal.png). Il symbolise la réussite concrète d'une campagne publicitaire au Sénégal.
- Le logo officiel est stocké dans [`public/images/logo-sp.png`](file:///c:/Users/user/Documents/sama%20pub%20site/public/images/logo-sp.png).

### 4. Utilisation de l'Icône WhatsApp
- Ne pas utiliser l'icône générique `MessageSquare` pour WhatsApp.
- Utilisez toujours le composant dédié [`WhatsAppIcon.tsx`](file:///c:/Users/user/Documents/sama%20pub%20site/src/components/WhatsAppIcon.tsx) avec sa couleur officielle `#25D366` ou `text-white` selon le fond.

### 5. Modification du Formulaire & Dropdowns
- N'utilisez pas de balise HTML standard `<select>` dans le formulaire de devis. Utilisez toujours [`CustomSelect.tsx`](file:///c:/Users/user/Documents/sama%20pub%20site/src/components/CustomSelect.tsx) afin de garantir la beauté du design et d'éviter les bugs d'affichage sur navigateurs mobiles Safari/Chrome.

### 6. Règles de Communication
- L'utilisateur s'exprime en français. Toutes les réponses, documentations, textes d'interface et commentaires doivent être rédigés dans un **français impeccable, soigné et orienté business/marketing**.
