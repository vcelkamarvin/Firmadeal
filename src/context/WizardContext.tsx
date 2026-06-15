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
  resetWizard: () => void;
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
  resetWizard: () => {},
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
        const { _step, ...dataFields } = parsed;
        setData((prev) => ({
          ...prev,
          ...dataFields,
          images: [], // File objects can't be serialised — always start empty
          transferability_data: {
            ...prev.transferability_data,
            ...(dataFields.transferability_data ?? {}),
          },
        }));
        // Restore the wizard step (1–4) so a page refresh returns user to where they were
        if (typeof _step === "number" && _step >= 1 && _step <= 4) {
          setStep(_step);
        }
      }
    } catch {
      // Corrupt draft — ignore and start fresh
    }
  }, []);

  // Auto-save draft (data + step) whenever either changes
  useEffect(() => {
    try {
      const { images, ...rest } = data;
      void images;
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...rest, _step: step }));
    } catch {
      // localStorage unavailable (private mode, quota exceeded) — ignore
    }
  }, [data, step]);

  const updateData = (updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const resetWizard = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    setData(defaultData);
    setStep(1);
    setListingId(null);
  };

  return (
    <WizardContext.Provider
      value={{ step, setStep, data, updateData, listingId, setListingId, resetWizard }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  return useContext(WizardContext);
}
