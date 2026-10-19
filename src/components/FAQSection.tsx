"use client";

import React, { useState, useEffect } from "react";
import { mockFAQ } from "@/data/mock/faq";
import { FAQItem } from "@/types";
import { ChevronDown, HelpCircle } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { supabase } from "@/lib/supabase";

export const FAQSection: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>(mockFAQ);
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Open first item by default

  useEffect(() => {
    async function fetchFaqs() {
      try {
        const { data, error } = await supabase
          .from("faqs")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (!error && data && data.length > 0) {
          setFaqs(
            data.map((item) => ({
              category: item.category as any,
              question: item.question,
              answer: item.answer,
            }))
          );
        }
      } catch (err) {
        console.warn("Utilisation de la FAQ locale suite à:", err);
      }
    }
    fetchFaqs();
  }, []);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 md:py-28 bg-white relative">
      {/* Anchor for blog navigation */}
      <div id="blog" className="absolute -top-20 pointer-events-none" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-6 h-0.5 bg-sama-orange rounded-full" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-sama-orange">
              Foire aux questions
            </span>
            <span className="w-6 h-0.5 bg-sama-orange rounded-full" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-snug sm:leading-normal md:leading-[1.25] mb-4">
            Tout ce que vous devez savoir{" "}
            <span className="text-sama-orange">avant de vous lancer</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Des réponses transparentes et concrètes sur nos forfaits, le budget publicitaire et notre accompagnement au quotidien.
          </p>
        </div>

        {/* Accordions List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-colors duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className={`w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-bold text-slate-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sama-orange ${
                    isOpen ? "bg-slate-50 text-sama-orange" : "bg-white hover:bg-slate-50/70"
                  }`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="text-base sm:text-lg">{faq.question}</span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-sama-orange text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${index}`}
                    className="px-6 pb-6 pt-2 bg-slate-50 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in-50 duration-200"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions CTA card */}
        <div className="mt-12 text-center p-6 sm:p-8 rounded-2xl bg-orange-50/60 border border-orange-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="text-base font-bold text-slate-900">
              Vous avez une question spécifique sur votre secteur d'activité ?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600">
              Nos consultants répondent directement à vos interrogations sans engagement.
            </p>
          </div>

          <a
            href={`https://wa.me/${siteConfig.contact.whatsapp}?text=Bonjour%20SAMA%20PUB,%20j'ai%20une%20question%20sur%20vos%20services`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-sama-orange hover:bg-sama-orange-hover rounded-full shadow-sm transition-colors"
          >
            <WhatsAppIcon className="w-4 h-4" />
            <span>Poser ma question sur WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
};
