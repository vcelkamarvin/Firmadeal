"use client";

import React, { createContext, useContext, useState } from "react";
import { WizardData } from "@/lib/types";

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
  competition: "",
  assets_included: "",
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
