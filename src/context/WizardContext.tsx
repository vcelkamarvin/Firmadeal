"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { WizardData } from "@/lib/types";

const DRAFT_KEY = "firmadeal_wizard_draft";

interface WizardContextType {
  step: number;
  setStep: (step: number) => void;
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
  listingId: string | null;
  setListingId: (id: string) => void;
}

const defaultData: WizardData = {
  type_of_operation: "",
  category: "",
  city: "",
  region: "",
  country: "DE",
  vat_number: "",
  company_name: "",
  founded_year: "",
  title: "",
  asking_price: "",
  price_confidential: false,
  description: "",
  images: [],
  phone: "",
  show_phone: false,
  reason_for_sale: "",
  status_business: "",
  business_model: "",
  business_model_chips: [],
  competition: "",
  competition_chips: [],
  assets_included: "",
  assets_checklist: [],
  reason_for_sale_notes: "",
  transferability_data: { independence: 5, customers: 5, stability: 5, costs: 5, processes: 5 },
  annual_revenue: "",
  ebitda: "",
  employees: "",
  plan: "",
};

const WizardContext = createContext<WizardContextType>({
  step: 1,
  setStep: () => {},
  data: defaultData,
  updateData: () => {},
  listingId: null,
  setListingId: () => {},
});

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(defaultData);
  const [listingId, setListingId] = useState<string | null>(null);

  // Restore draft from localStorage on mount (client-only via useEffect)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setData((prev) => ({
          ...prev,
          ...parsed,
          images: [], // File objects can't be serialised — always start empty
          transferability_data: {
            ...prev.transferability_data,
            ...(parsed.transferability_data ?? {}),
          },
        }));
      }
    } catch {
      // Corrupt draft — ignore and start fresh
    }
  }, []);

  // Auto-save draft whenever form data changes (excluding images)
  useEffect(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { images, ...rest } = data;
      localStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
    } catch {
      // localStorage unavailable (private mode, quota exceeded) — ignore
    }
  }, [data]);

  const updateData = (updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <WizardContext.Provider
      value={{ step, setStep, data, updateData, listingId, setListingId }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  return useContext(WizardContext);
}
