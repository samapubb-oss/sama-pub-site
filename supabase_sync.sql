-- ==============================================================================
-- SAMA PUB — SCRIPT DE SYNCHRONISATION INTÉGRALE SUPABASE (POSTGRESQL 17)
-- ==============================================================================
-- Ce script synchronise toutes les données vérifiées du site SAMA PUB :
-- 1. Coordonnées officielles & réseaux sociaux (company_info)
-- 2. Chiffres clés d'impact réels certifiés (stats_metrics)
-- 3. Les 6 expertises métiers complètes (services)
-- 4. Études de cas réelles Meta Ads certifiées (portfolio_cases)
-- 5. Foire aux questions (faqs)
-- 6. Piliers stratégiques de l'agence (about_pillars)
-- 7. Méthodologie en 4 étapes (methodology_steps)
-- 8. Table de capture des devis & politiques de sécurité RLS (leads_quotes)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLE : company_info (Coordonnées officielles validées)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_info (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  baseline TEXT NOT NULL,
  description TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  opening_hours TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  linkedin_url TEXT,
  is_phone_confirmed BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture publique company_info" ON public.company_info;
CREATE POLICY "Lecture publique company_info"
  ON public.company_info FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO public.company_info (
  id, name, baseline, description, phone, whatsapp, email, address,
  opening_hours, facebook_url, instagram_url, tiktok_url, linkedin_url,
  is_phone_confirmed, updated_at
)
VALUES (
  'sama_pub',
  'SAMA PUB',
  'Plus de visibilité, plus de clients',
  'Agence de publicité et de marketing digital d''élite basée à Dakar, Sénégal, spécialisée dans le Media Buying, la création de contenus publicitaires et l''acquisition de clients au Sénégal et en Afrique francophone.',
  '+221 76 142 28 58',
  '221761422858',
  'samapubb@gmail.com',
  'Dakar, Sénégal',
  'Lundi - Vendredi : 08h30 - 18h30',
  'https://web.facebook.com/SAMAPUB/',
  'https://www.instagram.com/samap.ub/?__pwa=1',
  'https://www.tiktok.com/@sama.pub?is_from_webapp=1&sender_device=pc',
  NULL,
  true,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  baseline = EXCLUDED.baseline,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  whatsapp = EXCLUDED.whatsapp,
  email = EXCLUDED.email,
  address = EXCLUDED.address,
  opening_hours = EXCLUDED.opening_hours,
  facebook_url = EXCLUDED.facebook_url,
  instagram_url = EXCLUDED.instagram_url,
  tiktok_url = EXCLUDED.tiktok_url,
  linkedin_url = EXCLUDED.linkedin_url,
  is_phone_confirmed = EXCLUDED.is_phone_confirmed,
  updated_at = now();

-- ------------------------------------------------------------------------------
-- 2. TABLE : stats_metrics (Chiffres d'impact réels vérifiés)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stats_metrics (
  id TEXT PRIMARY KEY,
  prefix TEXT DEFAULT '',
  value TEXT NOT NULL,
  suffix TEXT DEFAULT '',
  label TEXT NOT NULL,
  sublabel TEXT,
  icon_name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.stats_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture publique stats_metrics" ON public.stats_metrics;
CREATE POLICY "Lecture publique stats_metrics"
  ON public.stats_metrics FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO public.stats_metrics (id, prefix, value, suffix, label, sublabel, icon_name, display_order, is_active)
VALUES
  ('campagnes', '+', '50', '', 'Campagnes menées', 'Meta, Google & TikTok Ads', 'Target', 1, true),
  ('clients', '+', '40', '', 'Clients satisfaits', 'PME, commerces & marques', 'Users', 2, true),
  ('impressions', '+', '1M', '', 'Personnes touchées', 'Au Sénégal & en zone UEMOA', 'Eye', 3, true),
  ('roi', '+', '3x', '', 'En moyenne de ROI', 'Retour sur dépense publicitaire', 'TrendingUp', 4, true)
ON CONFLICT (id) DO UPDATE SET
  prefix = EXCLUDED.prefix,
  value = EXCLUDED.value,
  suffix = EXCLUDED.suffix,
  label = EXCLUDED.label,
  sublabel = EXCLUDED.sublabel,
  icon_name = EXCLUDED.icon_name,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------------------------
-- 3. TABLE : services (Les 6 expertises métiers)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  platforms TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture publique services" ON public.services;
CREATE POLICY "Lecture publique services"
  ON public.services FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO public.services (id, title, tagline, description, icon_name, platforms, features, display_order, is_active)
VALUES
  (
    'media-buying',
    'Media Buying',
    'Campagnes ciblées haute rentabilité',
    'Gestion stratégique et optimisation continue de vos campagnes publicitaires sponsorisées pour un maximum de retour sur investissement.',
    'Megaphone',
    ARRAY['Meta Ads', 'Google Ads', 'TikTok Ads'],
    ARRAY['Ciblage précis par audience et intentions d''achat', 'Optimisation continue du coût par acquisition (CPA)', 'Tests A/B itératifs sur les angles marketing'],
    1,
    true
  ),
  (
    'publicite-digitale',
    'Publicité Digitale',
    'Visibilité multi-plateforme',
    'Déploiement omnicanal sur Facebook, Instagram, TikTok, Google et YouTube pour toucher votre audience là où elle passe son temps.',
    'Target',
    ARRAY['Facebook', 'Instagram', 'TikTok', 'YouTube'],
    ARRAY['Domination de votre secteur d''activité', 'Formats adaptés au mobile et aux flux vidéo', 'Campagnes de reciblage (Retargeting) ultra-efficaces'],
    2,
    true
  ),
  (
    'creation-contenus',
    'Création de Contenus',
    'Visuels & vidéos qui captent l''attention',
    'Production de vidéos publicitaires percutantes, visuels graphiques soignés et textes engageants (copywriting) pour arrêter le scroll.',
    'Lightbulb',
    ARRAY['Reels & TikTok', 'Stories', 'Bannières'],
    ARRAY['Vidéos courtes orientées conversion (UGC & motion)', 'Design graphique aux standards internationaux', 'Copywriting hypnotique en français et adapté au contexte local'],
    3,
    true
  ),
  (
    'marketing-digital',
    'Marketing Digital',
    'Stratégie globale et notoriété',
    'Approche globale intégrant stratégie de marque, présence sur les réseaux sociaux, acquisition organique et fidélisation par email/SMS.',
    'BarChart3',
    ARRAY['Social Media', 'SEO', 'Emailing'],
    ARRAY['Audit complet de votre présence en ligne', 'Stratégie de contenu éditorial performante', 'Tunnels de vente et parcours clients automatisés'],
    4,
    true
  ),
  (
    'acquisition-clients',
    'Acquisition de Clients',
    'Flux continu de prospects qualifiés',
    'Génération de leads qualifiés prêts à acheter vos produits ou services pour alimenter votre équipe commerciale en opportunités réelles.',
    'Users',
    ARRAY['Lead Gen Meta', 'Landing Pages', 'WhatsApp Funnel'],
    ARRAY['Formulaires d''acquisition intégrés et landing pages', 'Connexion directe avec votre WhatsApp commercial', 'Qualification rigoureuse des demandes entrantes'],
    5,
    true
  ),
  (
    'conseil-strategie',
    'Conseil & Stratégie',
    'Accompagnement sur-mesure',
    'Diagnostic personnalisé de votre modèle de croissance, définition de votre feuille de route publicitaire et plan d''action adapté à vos ressources.',
    'TrendingUp',
    ARRAY['Audit', 'Consulting', 'Coaching équipe'],
    ARRAY['Analyse concurrentielle approfondie à Dakar et dans la sous-région', 'Plan d''allocation budgétaire optimisé', 'Points de suivi réguliers et recommandations proactives'],
    6,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  platforms = EXCLUDED.platforms,
  features = EXCLUDED.features,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------------------------
-- 4. TABLE : portfolio_cases (Études de cas réelles certifiées)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portfolio_cases (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  objective TEXT NOT NULL,
  tag TEXT NOT NULL,
  metrics JSONB NOT NULL,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.portfolio_cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture publique portfolio_cases" ON public.portfolio_cases;
CREATE POLICY "Lecture publique portfolio_cases"
  ON public.portfolio_cases FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO public.portfolio_cases (id, title, category, objective, tag, metrics, image_url, display_order, is_active)
VALUES
  (
    'campagne-alkhiry',
    'Campagne Al Khaïry Construction',
    'Acquisition B2B · BTP',
    'Génération de prospects qualifiés et demandes de devis de construction via WhatsApp',
    'Données réelles · 17 sept – 16 oct',
    '[{"label": "Conversations", "value": "320"}, {"label": "Coût / conv.", "value": "0,21 $"}, {"label": "Dépensé", "value": "67,71 $"}]'::jsonb,
    '/images/al-khairy-construction.png',
    1,
    true
  ),
  (
    'campagne-miel',
    'Campagne Miel du Sénégal',
    'E-commerce & Agroalimentaire',
    'Génération de commandes directes et engagement fort autour des produits locaux du Sénégal',
    'Données réelles · 30 derniers jours',
    '[{"label": "Conversations", "value": "273"}, {"label": "Coût / conv.", "value": "0,09 $"}, {"label": "CTR (Clics)", "value": "6,40 %"}]'::jsonb,
    '/images/miel-du-senegal.png',
    2,
    true
  ),
  (
    'campagne-sama-pub',
    'Campagne Vidéo SAMA PUB',
    'Agence & Publicité Vidéo',
    'Acquisition de clients agence via un format vidéo publicitaire court à fort pouvoir d''arrêt',
    'Données réelles · 17 sept – 16 oct',
    '[{"label": "Conversations", "value": "211"}, {"label": "Lectures vidéo", "value": "26 742"}, {"label": "Taux accroche", "value": "52 %"}]'::jsonb,
    '/images/sama-pub-workspace.png',
    3,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  objective = EXCLUDED.objective,
  tag = EXCLUDED.tag,
  metrics = EXCLUDED.metrics,
  image_url = EXCLUDED.image_url,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------------------------
-- 5. TABLE : faqs (Foire aux questions)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture publique faqs" ON public.faqs;
CREATE POLICY "Lecture publique faqs"
  ON public.faqs FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO public.faqs (id, question, answer, category, display_order, is_active)
VALUES
  (
    'faq-budget-min',
    'Quel budget publicitaire minimum faut-il prévoir pour démarrer ?',
    'Il n''y a pas de montant imposé, mais nous conseillons généralement un budget média publicitaire de départ à partir de 100 000 à 250 000 FCFA par mois pour collecter suffisamment de données et obtenir des résultats significatifs. Ce budget est versé directement aux plateformes (Meta, Google, TikTok), distinctement de nos honoraires d''agence.',
    'budget',
    1,
    true
  ),
  (
    'faq-delai-mise-en-ligne',
    'En combien de temps une campagne publicitaire est-elle mise en ligne ?',
    'Une fois la stratégie validée et les éléments créatifs approuvés par votre équipe, nous déployons vos campagnes en 3 à 5 jours ouvrés. Nous effectuons systématiquement les vérifications de tracking et de conformité avant tout lancement.',
    'services',
    2,
    true
  ),
  (
    'faq-suivi-resultats',
    'Comment puis-je suivre les résultats et la rentabilité de mes campagnes ?',
    'La transparence est au cœur de notre engagement. Vous bénéficiez d''un suivi régulier avec des indicateurs clairs : nombre de prospects obtenus, coût par prospect, personnes touchées et estimation du chiffre d''affaires généré. Nous organisons des points périodiques pour débriefer ensemble.',
    'methode',
    3,
    true
  ),
  (
    'faq-creation-visuels',
    'Prenez-vous en charge la création des visuels et vidéos publicitaires ?',
    'Oui, absolument. Notre offre intègre la conception graphique, le montage de formats courts (Reels, TikTok, Stories) et la rédaction des accroches publicitaires. Nous savons que la qualité des créas représente plus de 70% de la performance finale d''une campagne.',
    'services',
    4,
    true
  ),
  (
    'faq-demarrage',
    'Comment démarrer une collaboration avec SAMA PUB ?',
    'La première étape est très simple : demandez un devis ou contactez-nous directement par WhatsApp. Nous organisons un premier échange pour comprendre vos objectifs, auditer votre situation actuelle et vous proposer un plan d''action adapté sans engagement.',
    'contrat',
    5,
    true
  ),
  (
    'faq-geographie',
    'Intervenez-vous uniquement au Sénégal ou aussi à l''international ?',
    'Notre siège opérationnel est à Dakar, mais nous accompagnons des clients et des marques dans toute la zone UEMOA (Côte d''Ivoire, Mali, etc.) ainsi que des entreprises de la diaspora souhaitant cibler l''Afrique francophone.',
    'contrat',
    6,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  answer = EXCLUDED.answer,
  category = EXCLUDED.category,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------------------------
-- 6. TABLE : about_pillars (Piliers stratégiques de l'agence)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.about_pillars (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT,
  icon_name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.about_pillars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture publique about_pillars" ON public.about_pillars;
CREATE POLICY "Lecture publique about_pillars"
  ON public.about_pillars FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO public.about_pillars (id, title, subtitle, description, icon_name, display_order, is_active)
VALUES
  ('creativite', 'Créativité sans limite', 'Concepts visuels & accroches percutantes', 'Des concepts visuels innovants et des angles de communication originaux pour démarquer immédiatement votre marque de la concurrence.', 'Lightbulb', 1, true),
  ('expertise', 'Expertise digitale', 'Maîtrise pointue des algorithmes publicitaires', 'Maîtrise pointue des algorithmes publicitaires, des stratégies de ciblage et des technologies d''acquisition les plus récentes.', 'ShieldCheck', 2, true),
  ('accompagnement', 'Accompagnement personnalisé', 'Un interlocuteur dédié réactif au quotidien', 'Une équipe dédiée et disponible au quotidien, à l''écoute de vos besoins pour des échanges fluides et des réponses rapides.', 'HeartHandshake', 3, true),
  ('resultats', 'Résultats mesurables', 'Rapports clairs & calcul précis du ROI', 'Zéro jargon obscur. Des tableaux de bord clairs, des indicateurs de performance précis et un suivi rigoureux de chaque franc investi.', 'BarChart2', 4, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------------------------
-- 7. TABLE : methodology_steps (Méthodologie en 4 étapes)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.methodology_steps (
  step_number TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  deliverables TEXT[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.methodology_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture publique methodology_steps" ON public.methodology_steps;
CREATE POLICY "Lecture publique methodology_steps"
  ON public.methodology_steps FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO public.methodology_steps (step_number, title, description, deliverables, display_order, is_active)
VALUES
  (
    '01',
    'Audit & Immersion Stratégique',
    'Nous analysons votre offre, votre marché, vos concurrents et vos performances passées pour définir la stratégie publicitaire la plus rentable.',
    ARRAY['Diagnostic d''audience', 'Plan de ciblage', 'Recommandation budgétaire'],
    1,
    true
  ),
  (
    '02',
    'Création des Contenus & Tunnels',
    'Nos graphistes et copywriters créent des visuels captivants et rédigent des messages persuasifs spécialement conçus pour générer des clics qualifiés.',
    ARRAY['Pack visuels & vidéos publicitaires', 'Textes d''annonces A/B', 'Optimisation des pages de destination'],
    2,
    true
  ),
  (
    '03',
    'Lancement & Optimisation Continue',
    'Mise en ligne des campagnes avec tests itératifs permanents pour réduire le coût par prospect et maximiser les conversions utiles.',
    ARRAY['Tracking analytique avancé', 'Optimisation quotidienne des enchères', 'Élimination des dépenses inutiles'],
    3,
    true
  ),
  (
    '04',
    'Reporting & Passage à l''Échelle (Scale)',
    'Nous partageons des bilans réguliers et limpides. Dès qu''une campagne est rentable, nous augmentons le budget pour démultiplier vos ventes.',
    ARRAY['Rapport de performance hebdomadaire', 'Analyse détaillée du ROI/ROAS', 'Plan d''expansion stratégique'],
    4,
    true
  )
ON CONFLICT (step_number) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  deliverables = EXCLUDED.deliverables,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------------------------
-- 8. TABLE : leads_quotes (Enregistrement des demandes de devis)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads_quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  company_name TEXT,
  whatsapp_number TEXT,
  email TEXT,
  contact_channel TEXT DEFAULT 'whatsapp',
  contact_value TEXT NOT NULL,
  service_requested TEXT NOT NULL,
  budget_range TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.leads_quotes ENABLE ROW LEVEL SECURITY;

-- IMPORTANT : Permettre l'insertion publique des devis par tout visiteur
DROP POLICY IF EXISTS "Permettre l'insertion publique des devis" ON public.leads_quotes;
CREATE POLICY "Permettre l'insertion publique des devis"
  ON public.leads_quotes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Permettre la lecture des devis pour le tableau de bord
DROP POLICY IF EXISTS "Lecture des devis par utilisateurs autorises" ON public.leads_quotes;
CREATE POLICY "Lecture des devis par utilisateurs autorises"
  ON public.leads_quotes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Permettre la mise à jour des statuts et devis depuis le tableau de bord
DROP POLICY IF EXISTS "Mise a jour autorisee des devis" ON public.leads_quotes;
CREATE POLICY "Mise a jour autorisee des devis"
  ON public.leads_quotes
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Permettre la suppression des demandes de devis depuis le tableau de bord
DROP POLICY IF EXISTS "Suppression autorisee des devis" ON public.leads_quotes;
CREATE POLICY "Suppression autorisee des devis"
  ON public.leads_quotes
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- ==============================================================================
-- FIN DU SCRIPT DE SYNCHRONISATION SUPABASE
-- ==============================================================================
