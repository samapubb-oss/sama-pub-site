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
- **Gestion dynamique de l'état actif (Desktop & Mobile)** :
  - Sur Desktop : Barre de surbrillance orange animée sous le lien actif (`bg-sama-orange`) et texte `font-bold text-slate-900`.
  - Sur Mobile (Drawer) : Arrière-plan pastel orange (`bg-orange-50`) et typographie `text-sama-orange font-bold shadow-sm` qui se déplace instantanément sur l'élément sélectionné et ne reste plus figé sur « Accueil ».
  - Verrouillage anti-collision lors du clic (`isClickScrollingRef`) pour empêcher le ScrollSpy d'écraser immédiatement l'état actif pendant l'animation de défilement fluide.
  - ScrollSpy basé sur `getBoundingClientRect()` calculant l'apparition réelle des sections dans le viewport sans zone morte.
  - Synchronisation bidirectionnelle avec l'ancre d'URL (`hashchange` & chargement direct).
- Défilement fluide compensé (`offset -75px`) pour éviter que le header sticky ne masque le titre de la section visée.
- Bouton CTA desktop « Demander un devis » et capsule mobile « Devis » redirigeant directement vers la page dédiée `/devis` (sans défilement ni scroll jump).
- Bouton hamburger / croix avec transition fluide et CTA Devis direct.
- **Fermeture Ergonomique au Clic Extérieur (Mobile)** : Overlay d'arrière-plan semi-transparent et flouté (`bg-slate-900/40 backdrop-blur-xs z-40`) et écouteurs d'événements (`mousedown`, `touchstart`, `Escape`) permettant à l'utilisateur de fermer instantanément le menu mobile en touchant n'importe où sur l'écran en dehors du tiroir, sans être contraint de viser le bouton « X ».

### 2. Hero Section Haute Conversion (`Hero.tsx`)
- Arrière-plan sombre immersif (`#07162C` à `#0E284F`) avec halos lumineux radiaux aux teintes orange et bleu nuit.
- Capsule d'en-tête avec micro-logo SAMA PUB.
- Titre H1 percutant avec mise en valeur orange et interligne optimisé pour mobile et desktop.
- Double Call-To-Action ergonomique :
  - CTA Principal : « Nos services » avec pastille blanche animée sur hover.
  - CTA Secondaire : « Création de site internet » avec icône globe dans un halo orange ouvrant directement la page `/creation-site-internet`.
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
- **Bannière sombre d'assurance exécutive 100% optimisée pour mobile** :
  - Sur mobile : alignement naturel des puces à gauche (`items-start text-left`), pastilles orange alignées sur la première ligne de texte sans décalage vertical, et libellé CTA court et percutant (*« Discuter avec un expert »*) tenant impeccablement sur une seule ligne sans retour à la ligne orphelin.
  - Sur desktop : disposition fluide en une rangée avec libellé complet (*« Discuter de vos objectifs avec un expert »*).

### 4. Bannière d'Impact & Chiffres Clés (`StatsCounter.tsx`)
- En-tête harmonisé avec protection contre les retours à la ligne intempestifs sur grand écran (`whitespace-nowrap` sur « parlent d'eux-mêmes »).
- 4 cartes d'impact présentées en 4 colonnes sur desktop et 2 colonnes sur mobile (données réelles vérifiées) :
  - **+50** Campagnes menées (Meta, Google & TikTok Ads).
  - **+40** Clients satisfaits (PME, commerces & marques).
  - **+1M** Personnes touchées (Au Sénégal & en zone UEMOA).
  - **+3x** En moyenne de ROI (Retour sur dépense publicitaire).

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
- **Toutes les cases obligatoires (Vérification stricte avant envoi)** :
  - *Nom complet* : Obligatoire (au moins 2 caractères).
  - *Nom de l'entreprise / marque* : Obligatoire (au moins 2 caractères), marqué d'un astérisque orange `*`.
  - *Numéro WhatsApp (Format sénégalais strict à 9 chiffres)* :
    - Badge visuel intégré fixe : Composant vectoriel `SenegalFlag.tsx` (drapeau officiel 🇸🇳 Vert, Jaune, Rouge avec étoile verte à 5 branches) suivi de l'indicatif **+221**.
    - L'utilisateur n'a pas besoin de taper `+221` : il saisit directement les 9 chiffres de son numéro.
    - Formatage fluide automatique en direct au format `XX XXX XX XX` (ex: `77 123 45 67`).
    - Nettoyage automatique des préfixes `00221` ou `221` en cas de copier-coller.
    - Contrôle strict : Minimum et maximum **exactement 9 chiffres** (rejet si différent de 9 chiffres avec compteur dynamique).
    - Contrôle de cohérence sénégalaise : Doit débuter par **7** (mobiles : Orange 77/78, Free 76, Expresso 70, Promobile 75) ou **33** (lignes fixes).
    - Stockage en base Supabase (`leads_quotes`) au standard international complet : `+221 XX XXX XX XX`.
  - *Adresse e-mail (Contrôle de forme et syntaxe)* :
    - Obligatoire, validation rigoureuse par expression régulière (RFC).
    - Rejette les adresses incomplètes ou sans structure conforme (ex : sans `@`, sans nom de domaine ou extension valide).
    - Message d'erreur ciblé avec exemple explicatif (`contact@entreprise.sn` ou `nom@gmail.com`).
  - *Service recherché* : Obligatoire, sélection parmi les expertises de l'agence.
  - *Budget mensuel indicatif* : Obligatoire, sélection parmi les 5 tranches calibrées.
  - *Description du besoin / projet* : Obligatoire (au moins 10 caractères), marquée d'un astérisque orange `*`.
- **Indicateurs d'Erreurs Visuels Riches & Responsive** :
  - En cas de saisie invalide ou d'oubli, la case concernée passe en bordure rouge (`border-rose-400 bg-rose-50/20`).
  - Message explicatif immédiat sous chaque champ en rouge avec icône d'alerte.
  - Bannière d'alerte générale en haut du formulaire avec option de secours WhatsApp directe.
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
- **Page Dédiée `/devis` & Ergonomie Mobile Sans Défilement** :
  - Sur ordinateur (desktop) : Grand en-tête immersif avec fil d'Ariane, H1 sur-mesure et 3 cartes de réassurance (*Réponse sous 24h*, *Stratégie sur-mesure*, *Zéro engagement*).
  - Sur smartphone (mobile) : L'en-tête Hero est masqué (`hidden lg:block`) et remplacé par un titre ultra-compact de 40px, plaçant les champs du formulaire (**Nom complet**, **Numéro WhatsApp**, **E-mail**) directement sous les yeux de l'utilisateur dès le chargement de la page, sans nécessiter le moindre défilement (*zero-scroll*).

### 10. Bouton Flottant WhatsApp Permanent (`WhatsAppFloat.tsx`)
- Positionné en bas à droite (`bottom-6 right-6 z-50`).
- Effet de halo clignotant (*ping animation*) pour attirer le regard avec subtilité.
- Utilise l'icône vectorielle officielle WhatsApp (`WhatsAppIcon.tsx`).
- Ouvre directement la messagerie avec le numéro officiel `221761422858` et un message d'accroche pré-rempli.

### 12. Tableau de Bord Administrateur & Gestion des Devis (`/admin` et `/dashboard`)
- Interface exécutive fidèle au modèle de référence pour la direction de SAMA PUB à Dakar.
- **Accès sécurisé épuré & Récupération de mot de passe (`AdminLockScreen.tsx`)** : Page de connexion ergonomique et 100% sécurisée. Double champ (Nom d'administrateur + Mot de passe) strictement vierge sans pré-remplissage ni placeholder suggestif, icône de profil conservée, message d'erreur générique anti-énumération (*« Identifiant ou mot de passe incorrect. »*). Identifiants officiels stricts et exclusifs du PDG : nom **« Abdou lahat »** (ou « Abdou Lahat Diop ») et mot de passe **« 360iq360iq »**. Tous les anciens identifiants (« admin », « samapub », etc.) ont été révoqués et ne fonctionnent plus. Suppression totale des codes de secours codés en dur ou dérivés du téléphone (aucun bypass résiduel). Bouton de validation pleine largeur, lien direct **« Mot de passe oublié ? »** sur une seule ligne fluide. Système de récupération par e-mail avec champ strictement vierge, suppression totale du code à l'écran, déclenchement de l'envoi d'e-mail de récupération via Supabase Auth, et saisie manuelle sécurisée du code reçu. Bouton de fermeture discret en forme de croix (`X`) en haut à droite pour revenir au site public. Suppression intégrale des encarts d'exemple de démonstration. Logo officiel SP haute définition sans aucun fond noir.
- **Données 100% Dynamiques & Réelles Supabase (`leads_quotes`)** : Suppression intégrale des fausses données de test (`DEFAULT_LEADS`). Le tableau de bord et les cartes statistiques reflètent strictement le contenu réel de la table Supabase `leads_quotes`. En l'absence de devis (compteur à 0), l'interface affiche des états vides élégants et professionnels (icône dédiée, message explicatif) sans fausse notification ni données factices.
- **Harmonisation stricte des 4 services officiels** : Suppression de l'option « Création Vidéos & Visuels ». Seuls les 4 services réels de l'agence issus du formulaire de devis sont représentés dans le formulaire et l'onglet Services (*Media Buying (Campagnes Pubs)*, *Publicité Multi-canaux*, *Acquisition de Prospects*, *Marketing Digital Global*).
- **Barre latérale dédiée (`AdminSidebar.tsx`)** : Monogramme officiel SAMA PUB sans fond noir, 5 onglets de navigation (*Vue d'ensemble*, *Demandes de devis*, *Clients*, *Services*, *Paramètres*), indicateur de statut actif orange (`bg-[#FFF7ED]` + barre latérale orange), et drawer responsive pour mobile avec fond flouté.
- **En-tête supérieur (`AdminHeader.tsx`)** : Titre *Tableau de bord*, cloche de notification dynamique (point pulsé uniquement s'il y a des demandes en attente), profil officiel du dirigeant **ABDOU LAHAT DIOP** avec monogramme SP, menu déroulant *Compte agence* indiquant **« Accès PDG SAMAPUB »**, fermeture automatique au clic extérieur (`click`, `pointerdown`, `touchstart`, `Escape`) et option de déconnexion/verrouillage.
- **Grille de 4 Cartes KPI Interactives (`AdminStatsGrid.tsx`)** :
  - *Demandes reçues* : Total des demandes (cliquer affiche tous les devis `all`).
  - *À traiter* : Demandes nécessitant une réponse sous 24h (cliquer filtre instantanément sur `a_traiter` et affiche exactement tous les devis en attente).
  - *En cours* : Demandes en cours de qualification (cliquer filtre instantanément sur `en_cours` / `won`).
  - *Devis envoyés* : Propositions transmises (cliquer filtre instantanément sur `devis_envoye` / `quote_sent`).
  - **Interactivité complète & Responsive Synchronisé** : Clic direct sur n'importe quelle carte pour filtrer le tableau et défiler en douceur. Le chiffre affiché dans la case du haut (ex: 06) correspond **exactement** au nombre de lignes listées dans le tableau (6 devis correspondants). Réinitialisation automatique du filtre textuel lors du clic sur une carte pour garantir une cohérence parfaite des chiffres. Anneau coloré de surbrillance (`ring-2`), badge pastel (*Tous*, *Filtré*), et bandeau de rappel dans le tableau avec bouton *« Tout afficher »* pour réinitialiser en 1 clic.
- **Tableau Dynamique des Devis (`LeadsTable.tsx`)** :
  - Données directes issues de la base Supabase sans aucun fallback statique.
  - **Classement Chronologique Strict (Date et Heure)** : Les devis sont systématiquement triés par date et heure d'envoi décroissante (`created_at` descendant), garantissant que les demandes les plus récentes apparaissent toujours en tête de liste.
  - **Affichage de l'Heure d'Envoi Précise** :
    - Sur Desktop : Colonne dédiée **« Date & Heure »** avec la date en gras et l'heure avec micro-icône horloge orange (`Clock`) en typographie monospace claire.
    - Sur Mobile : Badge horodaté élégant (`{date} · {heure}`) dans l'en-tête de chaque carte et ligne dédiée *« Heure d'envoi : HH:MM »*.
  - État vide soigné sur Desktop et Mobile avec icône centrale et consignes claires pour les futures arrivées de prospects.
  - Bandeau interactif indiquant le statut actif filtré avec compte dynamique des devis correspondants (*« Filtre actif : À traiter (6 devis correspondants) »*).
  - Recherche instantanée (par nom de client, entreprise, e-mail ou service).
  - **Harmonisation stricte des statuts (Suppression de « Nouveau »)** : Le terme « Nouveau » a été supprimé des statuts et remplacé par **« À traiter »** comme premier statut d'entrée (pastille bleue). Seuls 3 statuts officiels existent : *À traiter*, *En cours*, *Devis envoyé*.
  - Filtre synchronisé par statut (*Tous les statuts*, *À traiter*, *En cours*, *Devis envoyé*).
  - Bouton **Exporter** générant instantanément un fichier CSV normé RFC 4180 avec date et heure d'envoi formatées et encodage UTF-8 BOM pour ouverture directe dans Excel sans problème d'accents.
  - Avatars monogrammes bicolores, badges de statut pastel et bouton d'action d'inspection rapide (icône en forme d'œil).
- **Modale d'Inspection Détaillée du Client (`LeadInspectionModal.tsx`)** :
  - Déclenchée instantanément par un clic sur l'icône en forme d'œil (colonne *Action* sur Desktop ou bouton *Voir le détail* sur Mobile) ainsi que depuis le bouton *Voir dossier* de l'onglet Clients.
  - **Ergonomie Mobile Réactive Optimisée** : En-tête compact avec monogramme SP et badge `#REQ-XXXXXX`, bannière haute horodatée (*« Envoyé le {date} à {heure} »*), cartes d'informations à hauteur calibrée (évitant tout scroll excessif), et barre d'actions basse unifiée sur une seule ligne (bouton WhatsApp pleine largeur + bouton E-mail + bouton Fermer).
  - **Menu Déroulant de Statut Épuré** : L'option « Nouveau » a été supprimée tout en haut et remplacée directement par **« À traiter »** (pastille bleue), suivi de *« En cours »* et *« Devis envoyé »*.
  - **Cartes Dédiées Date et Heure d'Envoi** : Deux nouvelles cases spécifiques pour la *Date d'envoi* et l'*Heure d'envoi* (avec fuseau horaire de Dakar et bouton de copie rapide en 1 clic).
  - Affiche l'intégralité des informations saisies par le prospect : Nom complet, Entreprise / Marque, Numéro WhatsApp, Adresse e-mail, Service recherché, Budget mensuel estimé, Date d'envoi, Heure d'envoi, et Description détaillée intégrale du besoin.
  - Boutons de copie rapide en 1 clic pour chaque champ.
  - Sélecteur de statut interactif synchronisé en direct avec Supabase (`leads_quotes`).
  - Bouton CTA officiel orange **Contacter sur WhatsApp** (avec message pré-rempli sur mesure) et bouton **Envoyer un e-mail**.
  - Fermeture ergonomique via la touche Échap (`Escape`), la croix de fermeture ou le clic à l'extérieur.
- **Fiche de Détail Interactive (`LeadDetailCard.tsx`)** :
  - Identifiant unique `#REQ-XXXXXX` et **capsule horodatée haute** (*« Envoyé le {date} à {heure} »* avec icône `Clock` orange).
  - Grille détaillée équilibrée en 2 colonnes avec lignes dédiées **Date d'envoi** (colonne gauche) et **Heure d'envoi** (colonne droite).
  - Sélecteur de statut épuré (3 options : *À traiter*, *En cours*, *Devis envoyé*) modifiant la donnée en temps réel dans Supabase (`leads_quotes`).
  - Bloc descriptif du besoin prospect avec copie rapide en un clic.
  - **Bouton d'action directe « Générer un devis »** (ou *« Voir le devis (PDF prêt) »*) avec icône d'étincelles orange ouvrant instantanément la modale et la proposition PDF.
  - Bouton d'action directe **Contacter sur WhatsApp** ouvrant la messagerie officielle pré-remplie avec le numéro au format international.
  - Bouton **Envoyer un e-mail** ouvrant le client mail avec objet et corps de message pré-rédigés.
- **Générateur de Devis PDF Officiel & IA Commerciale (`/api/generer-devis`, `DevisPdfDocument.tsx`, `DevisPdfPreview.tsx`)** :
  - Génération de documents PDF A4 haute fidélité (`@react-pdf/renderer`) aux normes graphiques SAMA PUB (Navy `#0B192C`, Orange `#FF6B00`, Vert réassurance `#166534`).
  - **Modèle Commercial Strict SAMA PUB** :
    - *Budget Publicitaire Meta (100% diffusion)* : Le budget mensuel client est entièrement alloué aux diffusions Meta Ads (Facebook & Instagram), versé à l'agence pour dépôt sur la plateforme, distinct des honoraires.
    - *Prestation de l'Agence (15% exacts du budget Meta)* : Calcul strict et automatique de 15% du budget Meta.
    - *Modalité de paiement échelonné en 2 tranches (50% / 50%)* : 50% au lancement et 50% restant au bout de 15 jours de campagne.
    - *Mission & Déploiement Intelligent* : Remplacement des tableaux itemisés superflus par un cadre d'engagement de déploiement et placement intelligent du budget sur Meta (Ciblage chirurgical, annonces performantes, optimisation continue).
    - *Clause de Liberté & Remboursement Garanti* : Possibilité d'arrêter la campagne à tout moment avec restitution immédiate et intégrale du budget pub Meta non dépensé.
    - *Personnalisation Intelligente basée sur la description client* : Analyse sémantique de la description soumise par le prospect pour générer un titre de devis sur-mesure (mentionnant explicitement le produit ou secteur du client), une introduction personnalisée, un encart dédié « Projet & Besoin client » directement imprimé sur le devis PDF, et une contextualisation de la mission de placement du budget publicitaire sur Meta.
    - *Double espace de signature* : Encart officiel Direction SAMA PUB à gauche et espace d'approbation et signature client à droite.
  - **Route Dédiée & Permanente PDF (`/api/devis-pdf?id=...`, `route.ts`)** :
    - Route serveur Next.js générant et diffusant directement le document PDF officiel haute fidélité (`Content-Type: application/pdf`).
    - Résout définitivement l'erreur Chromium `ERR_FILE_NOT_FOUND` liée à la révocation prématurée des URL `blob:`.
    - **Compatibilité Serveur Vercel (Node.js)** : Déclaration explicite de `runtime = 'nodejs'` et passage à `renderToBuffer()` officiel de `@react-pdf/renderer` pour un streaming PDF direct et ultra-rapide.
    - **Inclusion Forcée des Polices Standard Vercel NFT** : Inclusion explicite via `require("pdfkit/standard-fonts/Helvetica")` dans `route.ts`, garantissant que le moteur de traçage de Vercel (`route.js.nft.json`) copie obligatoirement les fichiers `Helvetica.cjs` et leurs fragments de glyphes dans le bundle serveur Lambda `/var/task/node_modules/pdfkit/js/standard-fonts/`.
    - **Polices Vectorielles TrueType Roboto Intégrées** : Migration du document vers la police TrueType officielle **Roboto** (Normal, Bold, Italic) intégrée en Base64/CDN via `Font.register`, garantissant un rendu typographique haute définition parfait sans dépendance fragile aux fichiers AFM.
    - **Sécurité Anti-Crash du Logo** : Validation stricte des protocoles d'image (`data:`, `http://`, `https://`) et repli automatique sur le monogramme vectoriel officiel **SP** en l'absence de chemin local valide, éliminant totalement les erreurs système Linux `ENOENT: no such file or directory, open '/images/logo-sp.png'`.
    - Permet au client de consulter et télécharger son devis officiel en 1 clic depuis WhatsApp via une URL HTTPS stable et permanente.
  - **Visionneuse Plein Écran Immersive Intégrée (`DevisPdfPreview.tsx`)** :
    - Mode plein écran modal intégré au dashboard affichant le PDF à 100% de l'écran avec barre d'outils dédiée (Téléchargement, Envoi WhatsApp, Nouvel onglet permanent et Fermeture).
  - **Transmission WhatsApp Officielle & Élégante** :
    - Remplacement du long texte brut par un message d'accompagnement exécutif officiel avec lien direct vers le document PDF.
- **Section Dédiée « Devis Sites Web » (`website_quotes`, `WebsiteLeadsTable.tsx`, `WebsiteLeadInspectionModal.tsx`, `WebsiteDevisPdfDocument.tsx`, `WebsiteAdminStatsGrid.tsx`)** :
  - **Séparation Étanche & Onglet Dédié dans la Barre Latérale** : Nouvel onglet avec icône Globe (`Globe`) et accentuation visuelle cyan/bleu ciel (`#0284C7`), séparant strictement les demandes de création de site internet des devis publicitaires. Pastille de notification indiquant en direct les demandes de sites web en attente.
  - **Page Liste Haute Visibilité (`WebsiteLeadsTable.tsx`)** :
    - Données classées de la plus récente à la plus ancienne.
    - Badges distincts : Badge pastel "Site Web" avec icône Globe, badge thématique de formule (Basique, Vitrine, Premium E-commerce, Sur-Mesure) avec tarif en FCFA en gras, type de site demandé (vitrine, e-commerce, immo, etc.), délai souhaité et statut interactif (*À traiter*, *En cours*, *Devis envoyé*).
    - Barre de recherche instantanée (filtrage par client, entreprise, formule ou type) et filtre synchronisé par statut.
    - Bouton Export CSV spécifique aux sites web avec colonnes détaillées (Type de site, Formule, Tarif, Options sélectionnées, Délai, Statut, Date et Description).
    - **Conception 100% Mobile-First** : Sur mobile (< 768px), le tableau se transforme en cartes empilées élégantes et aérées, sans aucun défilement horizontal. Tous les boutons tactiles font au moins 44px de hauteur.
  - **Page & Modale Détail en 5 Étapes (`WebsiteLeadInspectionModal.tsx`)** :
    - Restitution claire et fidèle de l'intégralité des 5 étapes renseignées par le client dans le configurateur :
      1. *Étape 1 · Type de projet web* (Type, usage et spécificités).
      2. *Étape 2 · Formule choisie* (Nom de la formule avec son tarif officiel en FCFA et inclusions).
      3. *Étape 3 · Options & Fonctionnalités cochées* (Badges verts des options sélectionnées : paiement Wave/OM, WhatsApp direct, formulaire, etc.).
      4. *Étape 4 · Délai souhaité* (Délai contractuel sélectionné).
      5. *Étape 5 · Coordonnées complètes du client* (Nom, Entreprise, WhatsApp avec indicatif +221, E-mail) + Description libre rédigée par le prospect avec copie 1 clic.
    - Sélecteur de statut interactif synchronisé en direct avec Supabase (`leads_quotes`).
    - Boutons d'action rapide : Contacter sur WhatsApp (message pré-rempli sur-mesure) et Envoyer un e-mail.
    - **Bouton « Générer le devis » & IA Commerciale Claude Spécialisée Web** :
      - Appel à l'API serveur `/api/generer-devis` avec le prompt système dédié `WEBSITE_DEVIS_SYSTEM_PROMPT`.
      - Application stricte des règles commerciales web SAMA PUB : formule forfaitaire, modalités d'acompte échelonné (50% au démarrage, 50% à la livraison et mise en ligne), inclusions offertes la 1ère année (nom de domaine .sn ou .com, hébergement cloud SSL sécurisé, design Mobile-First, formation 1h).
      - Rendu PDF haute fidélité aux normes graphiques SAMA PUB (`WebsiteDevisPdfDocument.tsx`).
      - Téléchargement direct du PDF identique à l'aperçu et transmission WhatsApp en 1 clic.
      - **Passage Automatique du Statut à « Devis envoyé »** (`quote_sent`) dès la transmission du devis au client via WhatsApp.
- **Alias `/dashboard`** : Redirection automatique vers `/admin`.

### 13. Page Dédiée « Création de Site Internet » (`/creation-site-internet`)
- Accessible directement depuis le bouton secondaire de la Hero section (**« Création de site internet »**).
- **Hero & En-tête Immersif 100% Responsive** :
  - Fil d'Ariane (*Retour à l'accueil*).
  - **Accroche H1 Marketing Haute Conversion** : *« Créez un site web d'élite qui multiplie vos clients & vos ventes »* avec dégradé chaud orange/ambre, animation de clignotement subtile (`animate-pulse-slow`) et halo lumineux immersif.
  - **Badge Pôle Web Masqué sur Mobile** : Le badge *« Pôle Développement Web & E-commerce · Dakar »* est masqué sur smartphone (`hidden sm:inline-flex`), libérant l'espace vertical pour placer l'accroche directement en haut de l'écran.
  - **Sous-titre Orienté Bénéfices Business Locaux** : Présentation claire des atouts pour le Sénégal (*Paiements locaux Wave & Orange Money*, *WhatsApp direct*, *SEO Google garanti*) et orientation vers le configurateur en 5 étapes.
  - **3 Cartes de Réassurance Exécutives Optimisées** :
    1. *100% Mobile First* (Icône smartphone animée avec halo orange).
    2. *Wave & Orange Money* (Badges officiels bleu Wave & orange OM avec encaissement en 1 clic).
    3. *SEO Google Sénégal* (Positionnement stratégique Dakar & zone UEMOA).
  - **Centrage Absolu sur Desktop** : Disposition en grille 3 colonnes parfaitement centrée au milieu (`max-w-4xl mx-auto`), avec icônes 3D, badges et descriptifs alignés au centre de chaque carte pour une symétrie visuelle irréprochable.
  - **Défilement Automatique Continu sur Mobile (Marquee)** : Les cartes ne sont plus masquées sur smartphone ; une animation infinie fluide les fait glisser automatiquement en boucle continue avec des masques de fondu latéraux, se mettant en pause au toucher.
- **Encart d'Assistance & Coordonnées Directes** : Bloc bleu nuit exécutif avec statut en ligne (`🟢 En ligne · Dakar`), bouton WhatsApp pulsé pleine largeur, appels et e-mails directs, et encart de récapitulatif en direct mis à jour en temps réel.
- **Formulaire Interactif Restructuré en 5 Étapes Intuitives (`WebsiteOrderForm.tsx`)** :
  - **Couleurs d'icônes à fort contraste (Suppression totale du blanc)** : Toutes les icônes de choix disposent de teintes thématiques vives et contrastées (*Orange SAMA PUB, Bleu tech, Vert émeraude, Violet royal, Ambre, Cyan*) intégrées dans des boîtes 3D teintées sur mesure, garantissant une lisibilité 100% nette sur fond blanc sans aucun mélange.
  - **Barre de progression dynamique & Stepper 5 Étapes** : 5 boutons cliquables (*1. Type*, *2. Formule*, *3. Options*, *4. Délai*, *5. Contact*) avec calcul de progression à `(currentStep / 5) * 100%`.
  - **Étape 1 : Type de site (Passage automatique à l'étape 2)** :
    - Un simple clic sur une carte valide instantanément l'option et bascule vers l'étape 2 en 220ms.
  - **Étape 2 : Formule & Budget FCFA (Passage automatique à l'étape 3)** :
    - Cartes tarifaires avec bandeau supérieur intégré, prix au format `whitespace-nowrap font-mono` et basculement automatique à l'étape 3.
  - **Étape 3 : Fonctionnalités & Options (Multi-choix)** :
    - Sélection libre des options souhaitées et bouton unique vers l'étape du délai (*« Passer au choix du délai (3/5) → »*).
  - **Étape 4 : Délai de livraison souhaité (Nouvelle étape dédiée)** :
    - Étape autonome offrant 3 cartes de délai spacieuses (*⚡ Moins de 2 semaines*, *📅 2 à 4 semaines*, *🌿 Flexible & Conseil*) avec grandes icônes 3D colorées, descriptions complètes sans troncature et basculement automatique vers l'étape 5 au clic.
  - **Étape 5 : Coordonnées & Finalisation (Étape finale dédiée)** :
    - Étape finale exclusivement consacrée au formulaire de coordonnées client sans surcharge : Nom complet, Entreprise, Numéro WhatsApp sénégalais strict avec drapeau 🇸🇳 et `+221` fixe, Adresse e-mail valide et Description du projet.
    - Bouton pleine largeur d'envoi immédiat du devis.
- **Encart Latéral « Devis en direct » Interactif & Évolutif** :
  - Pastille dynamique avec halo pulsé clignotant (*« ● Devis en direct »*), compteur d'étape `Étape X / 5` et ligne de délai choisi intégrée.
  - **Tiroir d'options interactif en 1 clic** : Déploie la liste des options retenues avec pastilles « Inclus » et bouton masquer.
- **Mode Démonstration & Confirmation** :
  - Validation sans persistance en base de données (conformément au cahier des charges).
  - Écran de succès instantané avec identifiant de devis simulé (`#WEB-XXXX`).
  - Carte récapitulative complète des options et du délai choisis.
  - Bouton direct d'envoi sur WhatsApp pré-formaté et bouton pour recommencer une simulation.

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
│   │   ├── global-error.tsx                  # Gestionnaire d'erreur racine conforme Next.js 14
│   │   ├── error.tsx                         # Gestionnaire d'erreur de page client
│   │   ├── not-found.tsx                     # Page 404 personnalisée SAMA PUB
│   │   ├── page.tsx                          # Page d'accueil principale assemblant tous les blocs
│   │   ├── devis/
│   │   │   └── page.tsx                      # Page dédiée haute conversion de demande de devis
│   │   ├── admin/
│   │   │   ├── layout.tsx                    # Layout privé pour l'espace d'administration
│   │   │   └── page.tsx                      # Tableau de bord complet : stats, devis, filtres, export
│   │   └── dashboard/
│   │       └── page.tsx                      # Redirection automatique vers /admin
│   │
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminHeader.tsx               # En-tête avec profil admin, cloche alertes et menu mobile
│   │   │   ├── AdminSidebar.tsx              # Barre latérale avec logo SAMA PUB et onglets de gestion
│   │   │   ├── AdminStatsGrid.tsx            # Grille des 4 cartes KPI (Reçues, En attente, En cours, Devis envoyés)
│   │   │   ├── LeadsTable.tsx                # Tableau avec avatars, filtres de statut, recherche et export CSV
│   │   │   ├── LeadInspectionModal.tsx       # Modale d'inspection détaillée du client au clic sur l'icône œil
│   │   │   ├── LeadDetailCard.tsx            # Fiche prospect avec boutons directs WhatsApp et E-mail
│   │   │   └── AdminLockScreen.tsx           # Écran de verrouillage sécurisé par code d'accès
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
│   │   ├── DevisPdfDocument.tsx              # Document PDF haute fidélité aux couleurs SAMA PUB (@react-pdf/renderer)
│   │   ├── DevisPdfPreview.tsx               # Composant d'aperçu du PDF intégré dans le modal
│   │   └── Footer.tsx                        # Pied de page avec marge basse mobile anti-collision
│   │
│   ├── lib/
│   │   ├── devis-config.ts                   # Configuration unique : prompt système, grille tarifaire et coordonnées
│   │   ├── devis-storage.ts                  # Persistance et mise en cache du devis par identifiant de lead
│   │   ├── pdf-utils.ts                      # Formatage monétaire (espace normal sans \u202F), nommage et dates
│   │   ├── whatsapp-utils.ts                 # Partage natif mobile (File) et solution de repli ordinateur avec consigne
│   │   └── supabase.ts                       # Client Supabase typé avec clé anonyme et URL
│   │
│   ├── app/
│   │   └── api/
│   │       └── generer-devis/
│   │           └── route.ts                  # Route serveur sécurisée POST Claude (validation, rate limit, recalcul)
│   │
│   ├── types/
│   │   ├── devis.ts                          # Types stricts : DevisData, LigneDevis, ClientDevis
│   │   ├── database.types.ts                 # Types TypeScript générés automatiquement depuis Supabase
│   │   └── index.ts                          # Déclarations TypeScript (ServiceItem, MetricItem, etc.)
│   │
│   ├── data/
│   │   ├── siteConfig.ts                     # Coordonnées globales, réseaux sociaux, liens de navigation
│   │   └── mock/
│   │       ├── services.ts                   # Liste des services et détails techniques
│   │       ├── about.ts                      # Valeurs, mission et piliers de l'agence
│   │       └── faq.ts                        # Questions / réponses fréquentes et catégorisation
│   │
│   └── ...
│
├── .env.example                              # Modèle de variables d'environnement (ANTHROPIC_API_KEY, ANTHROPIC_MODEL)
├── .env.local                                # Variables d'environnement locales (strictement ignoré par Git)
├── .gitignore                                # Protection stricte contre l'envoi de secrets sur GitHub
├── GEMINI.md                                 # CE FICHIER : Guide de référence du projet
├── package.json                              # Scripts npm et dépendances du projet
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
- Ne jamais utiliser d'icônes génériques (`MessageCircle`, `MessageSquare`) pour WhatsApp.
- Utilisez toujours le composant vectoriel officiel [`WhatsAppIcon.tsx`](file:///c:/Users/360IQ/Documents/sama%20pu%20site/src/components/WhatsAppIcon.tsx).
- Supporte désormais le mode `fullColor={true}` affichant fidèlement la bulle verte officielle WhatsApp (`#25D366`) et le combiné téléphonique blanc dans le configurateur de création de site internet (Étape 3 : *Bouton WhatsApp direct*), garantissant une reconnaissance immédiate par les visiteurs.

### 5. Modification du Formulaire & Dropdowns
- N'utilisez pas de balise HTML standard `<select>` dans le formulaire de devis. Utilisez toujours [`CustomSelect.tsx`](file:///c:/Users/user/Documents/sama%20pub%20site/src/components/CustomSelect.tsx) afin de garantir la beauté du design et d'éviter les bugs d'affichage sur navigateurs mobiles Safari/Chrome.

### 6. Règles de Communication
- L'utilisateur s'exprime en français. Toutes les réponses, documentations, textes d'interface et commentaires doivent être rédigés dans un **français impeccable, soigné et orienté business/marketing**.
### 7. Intégration Meta Pixel (Facebook & Instagram Ads)
- **Pixel ID officiel** : `996650999787770`
- Composant dédié : [`MetaPixel.tsx`](file:///c:/Users/360IQ/Documents/sama%20pu%20site/src/components/MetaPixel.tsx) chargé globalement dans [`layout.tsx`](file:///c:/Users/360IQ/Documents/sama%20pu%20site/src/app/layout.tsx).
- Événements traqués :
  - `PageView` : Déclenché sur chaque chargement et changement de route SPA.
  - `Lead` : Déclenché lors de la validation des devis ([`ContactCTA.tsx`](file:///c:/Users/360IQ/Documents/sama%20pu%20site/src/components/ContactCTA.tsx) et [`WebsiteOrderForm.tsx`](file:///c:/Users/360IQ/Documents/sama%20pu%20site/src/components/website-order/WebsiteOrderForm.tsx)).
  - `Contact` : Déclenché lors du clic sur les boutons WhatsApp directs ([`WhatsAppFloat.tsx`](file:///c:/Users/360IQ/Documents/sama%20pu%20site/src/components/WhatsAppFloat.tsx), [`ContactCTA.tsx`](file:///c:/Users/360IQ/Documents/sama%20pu%20site/src/components/ContactCTA.tsx), [`WebsiteOrderForm.tsx`](file:///c:/Users/360IQ/Documents/sama%20pu%20site/src/components/website-order/WebsiteOrderForm.tsx)).

### 8. Notifications Mobiles PWA & Cloche Interactive du Dashboard
- **Cloche de notification interactive** ([`AdminHeader.tsx`](file:///c:/Users/360IQ/Documents/sama%20pu%20site/src/components/admin/AdminHeader.tsx)) :
  - Affiche le compteur de devis non traités en direct avec point orange pulsé.
  - Au clic, ouvre un tiroir déroulant responsive avec la liste des demandes en attente de réponse.
  - Permet d'ouvrir le dossier du prospect en 1 clic.
  - Intègre un bandeau d'activation des notifications push sur smartphone / ordinateur avec bouton de test immédiat.
- **Service Worker & Manifest PWA** ([`public/sw.js`](file:///c:/Users/360IQ/Documents/sama%20pu%20site/public/sw.js) et [`public/manifest.json`](file:///c:/Users/360IQ/Documents/sama%20pu%20site/public/manifest.json)) :
  - Support de l'installation de l'application sur smartphone (iOS / Android) en mode plein écran sans barre d'adresse navigateur.
  - Gestion des réceptions push et du focus sur l'application au toucher de la notification.
- **Service de Notifications & Synthèse Audio** ([`src/lib/notificationService.ts`](file:///c:/Users/360IQ/Documents/sama%20pu%20site/src/lib/notificationService.ts)) :
  - Déclenche une alerte sonore carillon executive cristalline (via Web Audio API, 0 dépendance réseau).
  - Déclenche la vibration mobile (`navigator.vibrate([200, 100, 200, 100, 200])`).
  - Déclenche la notification push système sur le téléphone (`showNotification`).
- **Synchronisation Temps Réel Supabase & Polling de secours** ([`src/app/admin/page.tsx`](file:///c:/Users/360IQ/Documents/sama%20pu%20site/src/app/admin/page.tsx)) :
  - Écoute les `INSERT` sur la table `leads_quotes` via WebSocket Supabase Realtime.
- **Correction du Chevauchement PDF & Optimisation Mobile Haute Précision** :
  - **En-tête PDF (Zéro Chevauchement)** ([`WebsiteDevisPdfDocument.tsx`](file:///c:/Users/360IQ/Documents/sama%20pu%20site/src/components/admin/website/WebsiteDevisPdfDocument.tsx) & [`DevisPdfDocument.tsx`](file:///c:/Users/360IQ/Documents/sama%20pu%20site/src/components/admin/DevisPdfDocument.tsx)) : Séparation du nom d'agence et du slogan dans des conteneurs dédiés (`brandTextCol` et `brandTitleRow`) avec `flexDirection: "row"`, `alignItems: "baseline"`, marge inférieure explicite de 4 points (`marginBottom: 4`) et hauteur de ligne normalisée (`lineHeight: 1.2`). Élimine tout écrasement ou superposition de texte entre « SAMA PUB » et « AGENCE DE CRÉATION DIGITALE & PERFORMANCE · DAKAR » généré par le moteur de rendu Yoga.
  - **Ergonomie Mobile & Lisibilité du Devis** ([`WebsiteLeadInspectionModal.tsx`](file:///c:/Users/360IQ/Documents/sama%20pu%20site/src/components/admin/website/WebsiteLeadInspectionModal.tsx)) :
    - *Numéro de devis insécable* : Le badge `#WEB-2026-XXXXXXXX` est doté de `whitespace-nowrap shrink-0` et placé sur sa propre ligne d'en-tête avec badge de statut « Prêt à envoyer », empêchant tout retour à la ligne ou écrasement vertical sur petit écran mobile (360px).
    - *Hiérarchie des titres* : Titre du projet sur sa propre ligne avec `leading-snug break-words`, lisible naturellement sans télescopage avec le badge.
    - *Boutons d'action tactiles* : Disposition en grille optimisée sur mobile (`grid grid-cols-1 sm:flex`), avec bouton « Envoyer au client (WhatsApp) » pleine largeur en haut et boutons « Télécharger PDF » + « Régénérer » côte à côte en bas, tous calibrés à `min-h-[44px]`.
    - *En-tête & Onglets compacts* : Nom du client tronqué proprement (`max-w-[120px] sm:max-w-none`), statut compact et onglets répartis équitablement (`flex-1`) pour une navigation sans débordement.

### 9. avant de pousser quelque chose sur github demande moi l'autorisation 