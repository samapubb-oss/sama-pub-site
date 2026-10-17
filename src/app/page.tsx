import React from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ServicesGrid } from "@/components/ServicesGrid";
import { StatsCounter } from "@/components/StatsCounter";
import { AboutSection } from "@/components/AboutSection";
import { MethodologySection } from "@/components/MethodologySection";
import { PortfolioPreview } from "@/components/PortfolioPreview";
import { FAQSection } from "@/components/FAQSection";
import { ContactCTA } from "@/components/ContactCTA";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

export default function HomePage() {
  return (
    <>
      {/* Sticky Navigation Header */}
      <Header />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <Hero />

        {/* 2. Services Grid */}
        <ServicesGrid />

        {/* 3. Impact Stats Banner */}
        <StatsCounter />

        {/* 4. About & Pillars Section */}
        <AboutSection />

        {/* 5. 4-Step Methodology */}
        <MethodologySection />

        {/* 6. Portfolio & Cases Showcase */}
        <PortfolioPreview />

        {/* 7. FAQ Section */}
        <FAQSection />

        {/* 8. Conversion Quote & Contact Section */}
        <ContactCTA />
      </main>

      {/* Footer */}
      <Footer />

      {/* Permanent WhatsApp Floating Button */}
      <WhatsAppFloat />
    </>
  );
}
