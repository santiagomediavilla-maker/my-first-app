"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BusinessType,
  MonetizationType,
  LaunchScope,
  ProjectStage,
  CustomerType,
} from "@/types";

// ─── types ───────────────────────────────────────────────────────────────────

interface IntakeForm {
  // Step 1 — Idea
  name: string;
  description: string;
  type: BusinessType | "";
  category: string;
  problem: string;
  // Step 2 — Value
  valueProposition: string;
  whyItWorks: string;
  // Step 3 — Customer
  idealCustomer: string;
  ageRange: string;
  customerType: CustomerType | "";
  lifestyle: string;
  incomeLevel: string;
  pains: string;
  usageFrequency: string;
  // Step 4 — Market & channels
  country: string;
  city: string;
  launchScope: LaunchScope | "";
  channels: string[];
  // Step 5 — Pricing
  estimatedPrice: string;
  priceRange: string;
  monetizationType: MonetizationType | "";
  // Step 6 — Stage & goals
  projectStage: ProjectStage | "";
  validationObjectives: string[];
  // Step 7 — Context
  budget: string;
  industryExperience: string;
  teamSize: "solo" | "with_partners" | "";
  urgency: "low" | "medium" | "high" | "";
}

const initialForm: IntakeForm = {
  name: "",
  description: "",
  type: "",
  category: "",
  problem: "",
  valueProposition: "",
  whyItWorks: "",
  idealCustomer: "",
  ageRange: "",
  customerType: "",
  lifestyle: "",
  incomeLevel: "",
  pains: "",
  usageFrequency: "",
  country: "",
  city: "",
  launchScope: "",
  channels: [],
  estimatedPrice: "",
  priceRange: "",
  monetizationType: "",
  projectStage: "",
  validationObjectives: [],
  budget: "",
  industryExperience: "",
  teamSize: "",
  urgency: "",
};

const STEPS = 7;

// ─── helpers ─────────────────────────────────────────────────────────────────

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
        active
          ? "bg-gray-900 text-white border-gray-900"
          : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
      }`}
    >
      {label}
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{children}</label>
  );
}

function OptionalTag() {
  return (
    <span className="ml-1.5 text-xs text-gray-400 font-normal">optional</span>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-400 bg-white ${className}`}
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-400 bg-white resize-none"
    />
  );
}

// ─── main ────────────────────────────────────────────────────────────────────

export default function NewSessionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<IntakeForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof IntakeForm) => (value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const toggleChannel = (ch: string) =>
    setForm((f) => ({
      ...f,
      channels: f.channels.includes(ch)
        ? f.channels.filter((c) => c !== ch)
        : [...f.channels, ch],
    }));

  const toggleObjective = (obj: string) =>
    setForm((f) => ({
      ...f,
      validationObjectives: f.validationObjectives.includes(obj)
        ? f.validationObjectives.filter((o) => o !== obj)
        : [...f.validationObjectives, obj],
    }));

  const next = () => setStep((s) => Math.min(s + 1, STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const brief = {
      basics: {
        name: form.name || undefined,
        description: form.description || undefined,
        type: (form.type as BusinessType) || undefined,
        category: form.category || undefined,
        problem: form.problem || undefined,
        valueProposition: form.valueProposition || undefined,
        whyItWorks: form.whyItWorks || undefined,
      },
      customer: {
        idealCustomer: form.idealCustomer || undefined,
        ageRange: form.ageRange || undefined,
        customerType: (form.customerType as CustomerType) || undefined,
        lifestyle: form.lifestyle || undefined,
        incomeLevel: form.incomeLevel || undefined,
        pains: form.pains || undefined,
        usageFrequency: form.usageFrequency || undefined,
      },
      market: {
        country: form.country || undefined,
        city: form.city || undefined,
        launchScope: (form.launchScope as LaunchScope) || undefined,
      },
      channels: { channels: form.channels },
      pricing: {
        estimatedPrice: form.estimatedPrice || undefined,
        priceRange: form.priceRange || undefined,
        monetizationType: (form.monetizationType as MonetizationType) || undefined,
      },
      projectStage: (form.projectStage as ProjectStage) || undefined,
      validationObjectives: form.validationObjectives,
      founderContext: {
        budget: form.budget || undefined,
        industryExperience: form.industryExperience || undefined,
        teamSize: (form.teamSize as "solo" | "with_partners") || undefined,
        urgency: (form.urgency as "low" | "medium" | "high") || undefined,
      },
      aiAssumptions: [],
      aiInferredFields: {},
    };

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(`Error ${res.status}: ${data.detail || data.error || "Failed to create session"}`);
        setLoading(false);
        return;
      }
      if (!data.id) {
        setError("Session created but missing ID. Check server logs.");
        setLoading(false);
        return;
      }
      router.push(`/sessions/${data.id}`);
    } catch (err) {
      setError(`Something went wrong: ${String(err)}`);
      setLoading(false);
    }
  };

  // ─── steps ─────────────────────────────────────────────────────────────────

  const stepContent = {
    1: (
      <div className="space-y-5">
        <div>
          <Label>What&apos;s the name of your idea? <OptionalTag /></Label>
          <Input value={form.name} onChange={set("name")} placeholder="e.g. QuickMeds, Rento, BoltBrew" />
        </div>
        <div>
          <Label>Describe your idea in 1-2 sentences <OptionalTag /></Label>
          <Textarea
            value={form.description}
            onChange={set("description")}
            placeholder="e.g. An app that connects independent coffee roasters directly with offices for weekly subscription deliveries"
            rows={3}
          />
        </div>
        <div>
          <Label>What type of business is it? <OptionalTag /></Label>
          <div className="flex flex-wrap gap-2">
            {(
              ["product", "service", "software", "marketplace", "ecommerce", "physical_brand", "education", "other"] as BusinessType[]
            ).map((t) => (
              <Chip
                key={t}
                label={t.replace("_", " ")}
                active={form.type === t}
                onClick={() => setForm((f) => ({ ...f, type: t }))}
              />
            ))}
          </div>
        </div>
        <div>
          <Label>Category / industry <OptionalTag /></Label>
          <Input
            value={form.category}
            onChange={set("category")}
            placeholder="e.g. Food & beverage, HR tech, Healthcare, Fashion"
          />
        </div>
      </div>
    ),

    2: (
      <div className="space-y-5">
        <div>
          <Label>What problem does it solve?</Label>
          <Textarea
            value={form.problem}
            onChange={set("problem")}
            placeholder="e.g. Small businesses spend hours a week managing invoices manually and lose revenue from late payments"
            rows={3}
          />
        </div>
        <div>
          <Label>What&apos;s your value proposition? <OptionalTag /></Label>
          <Textarea
            value={form.valueProposition}
            onChange={set("valueProposition")}
            placeholder="e.g. The only invoice tool that automatically chases payments and integrates with WhatsApp — without needing an accountant"
            rows={3}
          />
        </div>
        <div>
          <Label>Why do you think this can work? <OptionalTag /></Label>
          <Textarea
            value={form.whyItWorks}
            onChange={set("whyItWorks")}
            placeholder="e.g. Competitors are too complex and expensive for small businesses. I've seen firsthand how painful this problem is working with 3 SMBs"
            rows={3}
          />
        </div>
      </div>
    ),

    3: (
      <div className="space-y-5">
        <div>
          <Label>Who is your ideal customer? <OptionalTag /></Label>
          <Textarea
            value={form.idealCustomer}
            onChange={set("idealCustomer")}
            placeholder="e.g. Independent freelance designers, 28-38, who manage 5-10 clients and currently use spreadsheets or nothing"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Age range <OptionalTag /></Label>
            <Input value={form.ageRange} onChange={set("ageRange")} placeholder="e.g. 25–40" />
          </div>
          <div>
            <Label>Customer type <OptionalTag /></Label>
            <div className="flex gap-2 mt-0.5">
              {(["B2C", "B2B", "B2B2C"] as CustomerType[]).map((t) => (
                <Chip
                  key={t}
                  label={t}
                  active={form.customerType === t}
                  onClick={() => setForm((f) => ({ ...f, customerType: t }))}
                />
              ))}
            </div>
          </div>
        </div>
        <div>
          <Label>Income level / ability to pay <OptionalTag /></Label>
          <Input
            value={form.incomeLevel}
            onChange={set("incomeLevel")}
            placeholder="e.g. Mid-range professional, $40k–$80k/year, willing to pay for tools that save time"
          />
        </div>
        <div>
          <Label>Key pains and frustrations <OptionalTag /></Label>
          <Textarea
            value={form.pains}
            onChange={set("pains")}
            placeholder="e.g. Current tools are too complex, expensive, or not built for their context"
            rows={2}
          />
        </div>
        <div>
          <Label>How often would they buy or use this? <OptionalTag /></Label>
          <Input
            value={form.usageFrequency}
            onChange={set("usageFrequency")}
            placeholder="e.g. Daily, weekly subscription, once per season"
          />
        </div>
      </div>
    ),

    4: (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Country <OptionalTag /></Label>
            <Input value={form.country} onChange={set("country")} placeholder="e.g. Argentina, USA, Spain" />
          </div>
          <div>
            <Label>City or region <OptionalTag /></Label>
            <Input value={form.city} onChange={set("city")} placeholder="e.g. Buenos Aires, New York" />
          </div>
        </div>
        <div>
          <Label>Launch scope <OptionalTag /></Label>
          <div className="flex flex-wrap gap-2">
            {(["local", "national", "regional", "global"] as LaunchScope[]).map((s) => (
              <Chip
                key={s}
                label={s.charAt(0).toUpperCase() + s.slice(1)}
                active={form.launchScope === s}
                onClick={() => setForm((f) => ({ ...f, launchScope: s }))}
              />
            ))}
          </div>
        </div>
        <div>
          <Label>Where would you sell? <OptionalTag /></Label>
          <div className="flex flex-wrap gap-2">
            {[
              "Physical retail",
              "Ecommerce",
              "Instagram / social",
              "Marketplace",
              "Wholesale / B2B",
              "Direct sales",
              "Subscription",
              "App / SaaS",
              "Outbound sales",
            ].map((ch) => (
              <Chip
                key={ch}
                label={ch}
                active={form.channels.includes(ch)}
                onClick={() => toggleChannel(ch)}
              />
            ))}
          </div>
        </div>
      </div>
    ),

    5: (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Estimated price <OptionalTag /></Label>
            <Input
              value={form.estimatedPrice}
              onChange={set("estimatedPrice")}
              placeholder="e.g. $29/mo, $150 one-time"
            />
          </div>
          <div>
            <Label>Price range <OptionalTag /></Label>
            <Input
              value={form.priceRange}
              onChange={set("priceRange")}
              placeholder="e.g. $20–$50"
            />
          </div>
        </div>
        <div>
          <Label>Monetization model <OptionalTag /></Label>
          <div className="flex flex-wrap gap-2">
            {(
              ["one_time", "recurring", "subscription", "fee", "commission", "mixed"] as MonetizationType[]
            ).map((m) => (
              <Chip
                key={m}
                label={m.replace("_", " ")}
                active={form.monetizationType === m}
                onClick={() => setForm((f) => ({ ...f, monetizationType: m }))}
              />
            ))}
          </div>
        </div>
        <div>
          <Label>Current stage</Label>
          <div className="flex flex-wrap gap-2">
            {(
              ["idea", "exploring", "prototype", "mvp", "selling", "launching_soon"] as ProjectStage[]
            ).map((s) => (
              <Chip
                key={s}
                label={s.replace("_", " ")}
                active={form.projectStage === s}
                onClick={() => setForm((f) => ({ ...f, projectStage: s }))}
              />
            ))}
          </div>
        </div>
      </div>
    ),

    6: (
      <div className="space-y-5">
        <div>
          <Label>What do you want to validate? <OptionalTag /></Label>
          <p className="text-xs text-gray-400 mb-2">Select all that apply</p>
          <div className="flex flex-wrap gap-2">
            {[
              "Is there real demand?",
              "Would people pay for this?",
              "What price makes sense?",
              "Which target has the most fit?",
              "Is the value proposition clear?",
              "How saturated is the market?",
              "What's the best positioning?",
              "What improvements are needed before launch?",
            ].map((obj) => (
              <Chip
                key={obj}
                label={obj}
                active={form.validationObjectives.includes(obj)}
                onClick={() => toggleObjective(obj)}
              />
            ))}
          </div>
        </div>
      </div>
    ),

    7: (
      <div className="space-y-5">
        <div>
          <Label>Approximate budget available <OptionalTag /></Label>
          <Input
            value={form.budget}
            onChange={set("budget")}
            placeholder="e.g. $2,000, limited, bootstrapped"
          />
        </div>
        <div>
          <Label>Industry experience <OptionalTag /></Label>
          <Input
            value={form.industryExperience}
            onChange={set("industryExperience")}
            placeholder="e.g. 3 years in retail, none, worked in marketing agencies"
          />
        </div>
        <div>
          <Label>Team <OptionalTag /></Label>
          <div className="flex gap-2">
            {(["solo", "with_partners"] as ("solo" | "with_partners")[]).map((t) => (
              <Chip
                key={t}
                label={t === "solo" ? "Going solo" : "With partners"}
                active={form.teamSize === t}
                onClick={() => setForm((f) => ({ ...f, teamSize: t }))}
              />
            ))}
          </div>
        </div>
        <div>
          <Label>Launch urgency <OptionalTag /></Label>
          <div className="flex gap-2">
            {(["low", "medium", "high"] as ("low" | "medium" | "high")[]).map((u) => (
              <Chip
                key={u}
                label={u.charAt(0).toUpperCase() + u.slice(1)}
                active={form.urgency === u}
                onClick={() => setForm((f) => ({ ...f, urgency: u }))}
              />
            ))}
          </div>
        </div>
      </div>
    ),
  };

  const stepTitles = [
    "Your idea",
    "Problem & value",
    "Target customer",
    "Market & channels",
    "Pricing & stage",
    "What to validate",
    "Your context",
  ];

  const stepDescriptions = [
    "Tell us what you want to launch.",
    "What problem does it solve and why will it work?",
    "Who is this for?",
    "Where will you compete and how?",
    "How will you make money?",
    "What do you want to learn from this validation?",
    "Give us some context about your situation.",
  ];

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Validate your idea</h1>
        <p className="text-gray-500 text-sm">
          Answer a few questions — all fields are optional. AI fills the gaps.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">
            Step {step} of {STEPS} — {stepTitles[step - 1]}
          </span>
          <span className="text-xs text-gray-400">{Math.round((step / STEPS) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-gray-900 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(step / STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* Step card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{stepTitles[step - 1]}</h2>
          <p className="text-sm text-gray-400 mt-0.5">{stepDescriptions[step - 1]}</p>
        </div>

        {stepContent[step as keyof typeof stepContent]}

        {error && (
          <div className="mt-4 text-red-600 text-sm p-3 bg-red-50 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          {step > 1 ? (
            <button
              type="button"
              onClick={back}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < STEPS ? (
            <button
              type="button"
              onClick={next}
              className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing…
                </>
              ) : (
                "Start validation →"
              )}
            </button>
          )}
        </div>
      </div>

      {/* AI note */}
      <p className="text-center text-xs text-gray-400 mt-5">
        AI will fill in any missing fields and make assumptions transparent.
      </p>
    </div>
  );
}
