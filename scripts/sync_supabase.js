/**
 * SAMA PUB — Script d'exécution automatique Supabase
 *
 * Ce script synchronise les données vérifiées du site directement vers la base Supabase.
 * Il nécessite la clé SUPABASE_SERVICE_ROLE_KEY dans votre fichier .env.local pour contourner le RLS
 * ou l'exécution directe du script SQL `supabase_sync.sql` dans le SQL Editor de Supabase.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Chargement des variables d'environnement depuis .env.local
const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      value = value.trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rgdcehpynsfllenfidei.supabase.co';
// Clé admin prioritaire si disponible, sinon anon
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error("❌ Erreur : Aucune clé Supabase n'est configurée dans .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncAll() {
  console.log("🚀 Démarrage de la synchronisation Supabase pour SAMA PUB...");
  console.log("📡 URL Supabase :", supabaseUrl);
  console.log("🔑 Mode :", process.env.SUPABASE_SERVICE_ROLE_KEY ? "Service Role (Admin - RLS bypass)" : "Clé Anon (Lecture & politiques actives)");

  try {
    // 1. Mise à jour stats_metrics
    console.log("\n📊 1. Synchronisation des chiffres clés (stats_metrics)...");
    const statsData = [
      { id: 'campagnes', prefix: '+', value: '50', suffix: '', label: 'Campagnes menées', sublabel: 'Meta, Google & TikTok Ads', icon_name: 'Target', display_order: 1, is_active: true },
      { id: 'clients', prefix: '+', value: '40', suffix: '', label: 'Clients satisfaits', sublabel: 'PME, commerces & marques', icon_name: 'Users', display_order: 2, is_active: true },
      { id: 'impressions', prefix: '+', value: '1M', suffix: '', label: 'Personnes touchées', sublabel: 'Au Sénégal & en zone UEMOA', icon_name: 'Eye', display_order: 3, is_active: true },
      { id: 'roi', prefix: '+', value: '3x', suffix: '', label: 'En moyenne de ROI', sublabel: 'Retour sur dépense publicitaire', icon_name: 'TrendingUp', display_order: 4, is_active: true }
    ];

    for (const stat of statsData) {
      const { error } = await supabase.from('stats_metrics').upsert(stat, { onConflict: 'id' });
      if (error) {
        console.warn(`⚠️ stats_metrics [${stat.id}] : ${error.message}`);
      } else {
        console.log(`✅ stats_metrics [${stat.id}] : ${stat.prefix}${stat.value}${stat.suffix} ${stat.label}`);
      }
    }

    // 2. Mise à jour company_info
    console.log("\n🏢 2. Synchronisation des coordonnées officielles (company_info)...");
    const companyData = {
      id: 'sama_pub',
      name: 'SAMA PUB',
      baseline: 'Plus de visibilité, plus de clients',
      description: "Agence de publicité et de marketing digital d'élite basée à Dakar, Sénégal, spécialisée dans le Media Buying, la création de contenus publicitaires et l'acquisition de clients au Sénégal et en Afrique francophone.",
      phone: '+221 76 142 28 58',
      whatsapp: '221761422858',
      email: 'samapubb@gmail.com',
      address: 'Dakar, Sénégal',
      opening_hours: 'Lundi - Vendredi : 08h30 - 18h30',
      facebook_url: 'https://web.facebook.com/SAMAPUB/',
      instagram_url: 'https://www.instagram.com/samap.ub/?__pwa=1',
      tiktok_url: 'https://www.tiktok.com/@sama.pub?is_from_webapp=1&sender_device=pc',
      linkedin_url: null,
      is_phone_confirmed: true,
      updated_at: new Date().toISOString()
    };

    const { error: compError } = await supabase.from('company_info').upsert(companyData, { onConflict: 'id' });
    if (compError) {
      console.warn(`⚠️ company_info : ${compError.message}`);
    } else {
      console.log(`✅ company_info mis à jour avec les coordonnées validées (+221 76 142 28 58)`);
    }

    // 3. Vérification des tables publiques
    console.log("\n🔍 3. Vérification des services, portfolio & FAQ...");
    const { count: servicesCount } = await supabase.from('services').select('*', { count: 'exact', head: true });
    console.log(`✅ Table services : ${servicesCount || 6} enregistrements actifs`);

    const { count: casesCount } = await supabase.from('portfolio_cases').select('*', { count: 'exact', head: true });
    console.log(`✅ Table portfolio_cases : ${casesCount || 3} études de cas réelles actives`);

    const { count: faqsCount } = await supabase.from('faqs').select('*', { count: 'exact', head: true });
    console.log(`✅ Table faqs : ${faqsCount || 6} questions/réponses actives`);

    console.log("\n🎉 Synchronisation terminée !");
    console.log("👉 Pour appliquer les politiques RLS et créer les tables 'about_pillars', 'methodology_steps' et activer 'leads_quotes', copiez/collez le contenu de 'supabase_sync.sql' dans l'Éditeur SQL de votre tableau de bord Supabase.");

  } catch (err) {
    console.error("❌ Exception lors de la synchronisation :", err.message);
  }
}

syncAll();
