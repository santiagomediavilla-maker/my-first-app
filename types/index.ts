// ============================================================
// BUSINESS IDEA BRIEF
// ============================================================

export type BusinessType =
  | "product"
  | "service"
  | "software"
  | "marketplace"
  | "ecommerce"
  | "physical_brand"
  | "education"
  | "other";

export type LaunchScope = "local" | "national" | "regional" | "global";

export type MonetizationType =
  | "one_time"
  | "recurring"
  | "subscription"
  | "fee"
  | "commission"
  | "mixed";

export type ProjectStage =
  | "idea"
  | "prototype"
  | "mvp"
  | "selling"
  | "exploring"
  | "launching_soon";

export type CustomerType = "B2C" | "B2B" | "B2B2C";

export interface IdeaBasics {
  name?: string;
  description?: string;
  type?: BusinessType;
  category?: string;
  subcategory?: string;
  problem?: string;
  valueProposition?: string;
  whyItWorks?: string;
}

export interface CustomerProfile {
  idealCustomer?: string;
  ageRange?: string;
  customerType?: CustomerType;
  lifestyle?: string;
  incomeLevel?: string;
  habits?: string;
  pains?: string;
  useContext?: string;
  usageFrequency?: string;
}

export interface MarketGeography {
  country?: string;
  city?: string;
  region?: string;
  launchScope?: LaunchScope;
  language?: string;
}

export interface SalesChannels {
  channels: string[];
}

export interface PricingModel {
  estimatedPrice?: string;
  priceRange?: string;
  averageTicket?: string;
  monetizationType?: MonetizationType;
}

export interface FounderContext {
  budget?: string;
  industryExperience?: string;
  contacts?: string;
  timeAvailability?: string;
  teamSize?: "solo" | "with_partners";
  urgency?: "low" | "medium" | "high";
}

export interface BusinessIdeaBrief {
  basics: IdeaBasics;
  customer: CustomerProfile;
  market: MarketGeography;
  channels: SalesChannels;
  pricing: PricingModel;
  projectStage?: ProjectStage;
  validationObjectives: string[];
  founderContext: FounderContext;
  aiAssumptions: string[];
  aiInferredFields: Record<string, string>;
  enrichedAt?: string;
}

// ============================================================
// SYNTHETIC PERSONAS
// ============================================================

export type PriceSensitivity = "low" | "medium" | "high";
export type TechAttitude = "early-adopter" | "mainstream" | "late-adopter" | "resistant";
export type SpendingAttitude = "frugal" | "value-seeker" | "willing" | "premium";

export interface SyntheticPersona {
  id: string;
  name: string;
  age: number;
  gender?: string;
  location: string;
  occupation: string;
  incomeLevel: string;
  bio: string;
  relevantHabits: string[];
  categoryRelationship: string;
  motivations: string[];
  objections: string[];
  purchaseContext: string;
  priceSensitivity: PriceSensitivity;
  personalityTraits: string[];
  goals: string[];
  painPoints: string[];
  techAttitude: TechAttitude;
  spendingAttitude: SpendingAttitude;
  avatarSeed: string;
}

// ============================================================
// SURVEY
// ============================================================

export interface SurveyAnswer {
  personaId: string;
  answer: string;
  sentiment: "positive" | "neutral" | "negative";
}

export interface SurveyQuestion {
  id: string;
  text: string;
  createdAt: string;
  answers: SurveyAnswer[];
}

export interface SurveyAnalysis {
  purchaseDrivers: string[];
  frictions: string[];
  commonDoubts: string[];
  pricePerception: string;
  valuePerception: string;
  purchaseIntentScore: number;
  keyPatterns: string[];
}

export interface SurveyResults {
  questions: SurveyQuestion[];
  analysis?: SurveyAnalysis;
}

// ============================================================
// FOCUS GROUP
// ============================================================

export interface FocusGroupTopic {
  topic: string;
  questions: string[];
}

export interface FocusGroupGuide {
  participantIds: string[];
  topics: FocusGroupTopic[];
  acceptedAt?: string;
}

export interface FocusGroupQuote {
  personaId: string;
  quote: string;
  topic: string;
}

export interface FocusGroupTopicSummary {
  topic: string;
  agreements: string[];
  disagreements: string[];
  keyInsight: string;
}

export interface FocusGroupOutput {
  topicSummaries: FocusGroupTopicSummary[];
  representativeQuotes: FocusGroupQuote[];
  overallAgreements: string[];
  tensions: string[];
  objections: string[];
  purchaseConditions: string[];
  pricingPerceptions: string[];
  generatedAt: string;
}

// ============================================================
// 1:1 INTERVIEWS
// ============================================================

export interface InterviewGuide {
  participantIds: string[];
  questions: string[];
  acceptedAt?: string;
}

export interface InterviewResult {
  personaId: string;
  deepPurchaseReasons: string[];
  nonPurchaseReasons: string[];
  currentAlternatives: string[];
  emotionalContext: string;
  functionalBarriers: string[];
  userLanguage: string[];
  triggersToPurchase: string[];
  summary: string;
}

export interface InterviewsOutput {
  interviews: InterviewResult[];
  globalSynthesis: string;
  generatedAt: string;
}

// ============================================================
// MARKET VALIDATION
// ============================================================

export type SaturationLevel = "low" | "medium" | "high";

export interface MarketValidation {
  competitiveLandscape: string;
  saturationLevel: SaturationLevel;
  referencePrice?: string;
  comparablePositioning: string[];
  demandSignals: string[];
  marketTrends: string[];
  marketAppetite: string;
  potentialNiches: string[];
  competitiveRisks: string[];
  generatedAt: string;
}

// ============================================================
// SCORING & RECOMMENDATION
// ============================================================

export type Verdict = "GO" | "GO_WITH_CHANGES" | "NO_GO";

export interface DimensionScore {
  dimension: string;
  score: number;
  weight: number;
  explanation: string;
}

export interface ScoringResult {
  dimensions: DimensionScore[];
  totalScore: number;
  verdict: Verdict;
  verdictExplanation: string;
  suggestedImprovements: string[];
  generatedAt: string;
}

// ============================================================
// CROSS-METHOD SYNTHESIS
// ============================================================

export interface CrossMethodSynthesis {
  repeatedPatterns: string[];
  contradictions: string[];
  strongSignals: string[];
  warnings: string[];
  hypothesesToValidate: string[];
  solidFindings: string[];
  uncertainFindings: string[];
  generatedAt: string;
}

// ============================================================
// ACTION PLAN
// ============================================================

export type ActionPriority = "high" | "medium" | "low";
export type ActionStatus = "pending" | "in_progress" | "done";

export interface ActionStep {
  id: string;
  title: string;
  description: string;
  priority: ActionPriority;
  category: string;
  status: ActionStatus;
  rationale?: string;
}

export interface ActionPlan {
  steps: ActionStep[];
  generatedAt: string;
}

// ============================================================
// SESSION
// ============================================================

export type SessionPhase =
  | "intake"
  | "enriching"
  | "brief"
  | "personas"
  | "survey"
  | "focus_group"
  | "interviews"
  | "market"
  | "scoring"
  | "synthesis"
  | "action_plan"
  | "complete";

export interface Session {
  id: string;
  createdAt: string;
  updatedAt: string;
  phase: SessionPhase;
  brief?: BusinessIdeaBrief;
  personas?: SyntheticPersona[];
  surveyQuestions?: string[];
  surveyResults?: SurveyResults;
  focusGroupGuide?: FocusGroupGuide;
  focusGroupOutput?: FocusGroupOutput;
  interviewGuide?: InterviewGuide;
  interviewsOutput?: InterviewsOutput;
  marketValidation?: MarketValidation;
  scoring?: ScoringResult;
  synthesis?: CrossMethodSynthesis;
  actionPlan?: ActionPlan;
}
