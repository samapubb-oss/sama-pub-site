export interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface ServiceItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  iconName: string;
  platforms?: string[];
  features?: string[];
  isConfirmed: boolean;
}

export interface MetricItem {
  id: string;
  prefix?: string;
  value: string;
  suffix?: string;
  label: string;
  sublabel?: string;
  iconName: string;
  isDemo: boolean;
}

export interface PillarItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface ProcessStep {
  step: string;
  number: string;
  title: string;
  description: string;
  deliverables: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
  category: 'budget' | 'services' | 'methode' | 'contrat';
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  objective: string;
  metrics: { label: string; value: string }[];
  tag: string;
  isDemo: boolean;
  imageUrl?: string;
}
