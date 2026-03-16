import type {
  BusinessIdeaBrief,
  SyntheticPersona,
  SurveyQuestion,
  FocusGroupGuide,
  InterviewGuide,
  SurveyResults,
  FocusGroupOutput,
  InterviewsOutput,
  MarketValidation,
} from "@/types";

// ─────────────────────────────────────────────
// 1. BRIEF ENRICHMENT
// ─────────────────────────────────────────────

export function buildEnrichBriefPrompt(rawBrief: Partial<BusinessIdeaBrief> & { rawInput?: string }): {
  system: string;
  user: string;
} {
  return {
    system:
      "You are a senior business analyst and product strategist. Your job is to take a partial or incomplete business idea brief and enrich it with reasonable assumptions. Respond with valid JSON only. No markdown, no explanation outside the JSON.",
    user: `Analyze this business idea and produce a complete enriched brief.

RAW INPUT FROM ENTREPRENEUR:
${JSON.stringify(rawBrief, null, 2)}

Your task:
1. Fill in any missing fields with reasonable, specific assumptions based on what was provided.
2. Do NOT use vague placeholders. Make concrete, plausible assumptions.
3. Track exactly which fields you inferred (they were not provided by the user).
4. List all assumptions clearly.

Return a JSON object with this exact structure:
{
  "basics": {
    "name": "string or inferred name",
    "description": "clear concise description",
    "type": "product|service|software|marketplace|ecommerce|physical_brand|education|other",
    "category": "main category",
    "subcategory": "more specific subcategory",
    "problem": "specific problem being solved",
    "valueProposition": "clear value proposition",
    "whyItWorks": "why this can succeed in this market"
  },
  "customer": {
    "idealCustomer": "specific description of ideal customer",
    "ageRange": "e.g. 25-40",
    "customerType": "B2C|B2B|B2B2C",
    "lifestyle": "lifestyle description",
    "incomeLevel": "income level description",
    "habits": "relevant habits",
    "pains": "key pains and frustrations",
    "useContext": "when/how they would use this",
    "usageFrequency": "how often they would use/buy"
  },
  "market": {
    "country": "primary country",
    "city": "primary city if local focus",
    "region": "region",
    "launchScope": "local|national|regional|global",
    "language": "primary market language"
  },
  "channels": {
    "channels": ["channel1", "channel2"]
  },
  "pricing": {
    "estimatedPrice": "specific price estimate",
    "priceRange": "low-high range",
    "averageTicket": "average ticket value",
    "monetizationType": "one_time|recurring|subscription|fee|commission|mixed"
  },
  "projectStage": "idea|prototype|mvp|selling|exploring|launching_soon",
  "validationObjectives": ["objective1", "objective2", "objective3"],
  "founderContext": {
    "budget": "budget estimate",
    "industryExperience": "experience level",
    "contacts": "commercial access",
    "timeAvailability": "time per week",
    "teamSize": "solo|with_partners",
    "urgency": "low|medium|high"
  },
  "aiAssumptions": [
    "Assumed X because Y",
    "Inferred Z based on the business type"
  ],
  "aiInferredFields": {
    "fieldPath": "reason for inference"
  }
}

Be specific and opinionated. A good brief enables strong market research.`,
  };
}

// ─────────────────────────────────────────────
// 2. PERSONA GENERATION (batch of 10)
// ─────────────────────────────────────────────

export function buildPersonasBatchPrompt(
  brief: BusinessIdeaBrief,
  batchIndex: number,
  batchSize: number,
  existingPersonas: SyntheticPersona[]
): { system: string; user: string } {
  const existingNames = existingPersonas.map((p) => p.name).join(", ");
  const totalBatches = Math.ceil(30 / batchSize);

  return {
    system:
      "You are an expert qualitative researcher specializing in synthetic audience generation. Create realistic, diverse fictional personas for market research. Respond with valid JSON only.",
    user: `Create ${batchSize} synthetic personas for this market research study.

BUSINESS IDEA BRIEF:
${JSON.stringify(brief.basics, null, 2)}

TARGET CUSTOMER:
${JSON.stringify(brief.customer, null, 2)}

MARKET:
${JSON.stringify(brief.market, null, 2)}

PRICING:
${JSON.stringify(brief.pricing, null, 2)}

This is batch ${batchIndex + 1} of ${totalBatches}.
${existingNames ? `Already created personas (avoid duplicates/clones): ${existingNames}` : ""}

Requirements for this batch:
- Create ${batchSize} DISTINCT personas. No clones.
- Cover diverse demographics within the target: different ages, incomes, locations, jobs
- Include a mix of: enthusiasts, skeptics, neutral buyers, price-sensitive, convenience-seekers
- Make them feel like real people with nuanced opinions
- Each persona should have a different relationship with this category
- Locations should be realistic for the target market: ${brief.market.country || "any"} / ${brief.market.city || "various cities"}

Return a JSON array of exactly ${batchSize} personas:
[
  {
    "id": "p_${batchIndex}_N",
    "name": "Full Name",
    "age": 28,
    "gender": "female|male|non-binary",
    "location": "City, Country",
    "occupation": "Specific Job Title",
    "incomeLevel": "e.g. $35k–$50k/year or mid-level professional",
    "bio": "2-3 sentence authentic background story",
    "relevantHabits": ["habit1", "habit2", "habit3"],
    "categoryRelationship": "How they currently relate to this category/problem",
    "motivations": ["motivation1", "motivation2"],
    "objections": ["objection1", "objection2"],
    "purchaseContext": "When and how they would consider buying",
    "priceSensitivity": "low|medium|high",
    "personalityTraits": ["trait1", "trait2", "trait3"],
    "goals": ["goal1", "goal2"],
    "painPoints": ["pain1", "pain2"],
    "techAttitude": "early-adopter|mainstream|late-adopter|resistant",
    "spendingAttitude": "frugal|value-seeker|willing|premium",
    "avatarSeed": "unique_seed_string"
  }
]`,
  };
}

// ─────────────────────────────────────────────
// 3. SURVEY QUESTION GENERATION
// ─────────────────────────────────────────────

export function buildSurveyQuestionsPrompt(brief: BusinessIdeaBrief): {
  system: string;
  user: string;
} {
  return {
    system:
      "You are a market research expert. Design survey questions that uncover genuine insights about product-market fit. Respond with valid JSON only.",
    user: `Design a survey for validating this business idea.

BUSINESS IDEA:
${JSON.stringify(brief.basics, null, 2)}

VALIDATION OBJECTIVES:
${brief.validationObjectives.join("\n")}

PRICING:
${JSON.stringify(brief.pricing, null, 2)}

TARGET CUSTOMER:
${JSON.stringify(brief.customer, null, 2)}

Create 9 survey questions that:
- Are specific to THIS idea (not generic)
- Cover: problem awareness, value perception, purchase intent, pricing sensitivity, competitive comparison, usage scenarios, objections, trust, and deal-breakers
- Sound natural and conversational
- Would reveal genuine barriers and motivations
- Mix closed-ended and open-ended style

Return a JSON array of exactly 9 question strings:
["Question 1 text?", "Question 2 text?", ...]

Avoid: generic questions, leading questions, double-barreled questions.`,
  };
}

// ─────────────────────────────────────────────
// 4. SURVEY SIMULATION (per question, all personas)
// ─────────────────────────────────────────────

export function buildSurveySimulationPrompt(
  question: string,
  personas: SyntheticPersona[],
  brief: BusinessIdeaBrief
): { system: string; user: string } {
  const personaSummaries = personas
    .map(
      (p) =>
        `ID: ${p.id} | ${p.name}, ${p.age}, ${p.occupation}, ${p.location} | Income: ${p.incomeLevel} | Tech: ${p.techAttitude} | Spending: ${p.spendingAttitude} | Price sensitivity: ${p.priceSensitivity} | Category relationship: ${p.categoryRelationship} | Key objections: ${p.objections.join(", ")}`
    )
    .join("\n");

  return {
    system:
      "You are simulating authentic survey responses from realistic personas. Each persona responds from their own perspective, personality, and context. Respond with valid JSON only.",
    user: `Simulate survey responses from ${personas.length} personas for this question.

PRODUCT CONTEXT: ${brief.basics.description}
VALUE PROPOSITION: ${brief.basics.valueProposition}
PRICE: ${brief.pricing.estimatedPrice || brief.pricing.priceRange || "not specified"}

SURVEY QUESTION: "${question}"

PERSONAS:
${personaSummaries}

For each persona, write an authentic response that:
- Reflects their specific demographics, habits, and relationship with the category
- Uses their natural voice and perspective
- Is honest — not all positive
- Is 2-4 sentences, feels real
- Classify sentiment accurately

Return a JSON array:
[
  {
    "personaId": "exact_persona_id",
    "answer": "Their authentic response in their voice",
    "sentiment": "positive|neutral|negative"
  }
]

Return exactly ${personas.length} entries, one per persona, in the same order.
Persona IDs: ${personas.map((p) => p.id).join(", ")}`,
  };
}

// ─────────────────────────────────────────────
// 5. SURVEY ANALYSIS
// ─────────────────────────────────────────────

export function buildSurveyAnalysisPrompt(
  questions: SurveyQuestion[],
  personas: SyntheticPersona[],
  brief: BusinessIdeaBrief
): { system: string; user: string } {
  const personaMap = Object.fromEntries(personas.map((p) => [p.id, p]));

  const qaText = questions
    .map(
      (q) =>
        `Q: ${q.text}\n${q.answers
          .map((a) => {
            const p = personaMap[a.personaId];
            return `  [${a.sentiment}] ${p?.name || a.personaId} (${p?.age}, ${p?.occupation}): ${a.answer}`;
          })
          .join("\n")}`
    )
    .join("\n\n");

  return {
    system:
      "You are a senior market researcher synthesizing survey data. Respond with valid JSON only.",
    user: `Analyze these survey results and extract actionable insights.

PRODUCT: ${brief.basics.name || brief.basics.description}
${qaText}

Return JSON:
{
  "purchaseDrivers": ["key reason people would buy", ...],
  "frictions": ["barrier or concern", ...],
  "commonDoubts": ["doubt or question", ...],
  "pricePerception": "summary of how personas perceive the price",
  "valuePerception": "summary of perceived value",
  "purchaseIntentScore": 0-100,
  "keyPatterns": ["pattern across responses", ...]
}`,
  };
}

// ─────────────────────────────────────────────
// 6. FOCUS GROUP GUIDE GENERATION
// ─────────────────────────────────────────────

export function buildFocusGroupGuidePrompt(
  brief: BusinessIdeaBrief,
  selectedPersonas: SyntheticPersona[]
): { system: string; user: string } {
  return {
    system:
      "You are an expert focus group moderator. Design a guide for a product validation focus group. Respond with valid JSON only.",
    user: `Design a focus group moderation guide for validating this business idea.

BUSINESS IDEA: ${brief.basics.name} — ${brief.basics.description}
PROBLEM SOLVED: ${brief.basics.problem}
VALUE PROPOSITION: ${brief.basics.valueProposition}
PRICE: ${brief.pricing.estimatedPrice || brief.pricing.priceRange}
VALIDATION OBJECTIVES: ${brief.validationObjectives.join(", ")}

PARTICIPANTS (${selectedPersonas.length} people):
${selectedPersonas.map((p) => `- ${p.name}: ${p.age}, ${p.occupation}, ${p.categoryRelationship}`).join("\n")}

Create a moderation guide with 5-6 topics. Each topic should have 2-3 discussion questions.
Topics should cover: first impressions, problem resonance, value perception, pricing, competitive alternatives, purchase conditions.

Return JSON:
{
  "topics": [
    {
      "topic": "Topic name",
      "questions": ["question 1", "question 2", "question 3"]
    }
  ]
}`,
  };
}

// ─────────────────────────────────────────────
// 7. FOCUS GROUP SIMULATION
// ─────────────────────────────────────────────

export function buildFocusGroupSimulationPrompt(
  guide: FocusGroupGuide,
  participants: SyntheticPersona[],
  brief: BusinessIdeaBrief
): { system: string; user: string } {
  const participantProfiles = participants
    .map(
      (p) =>
        `${p.name} (${p.age}, ${p.occupation}, ${p.location}): ${p.bio} Motivations: ${p.motivations.join(", ")}. Objections: ${p.objections.join(", ")}. Price sensitivity: ${p.priceSensitivity}.`
    )
    .join("\n\n");

  const topicsText = guide.topics
    .map((t) => `Topic: ${t.topic}\nQuestions: ${t.questions.join(" / ")}`)
    .join("\n\n");

  return {
    system:
      "You are simulating a real focus group discussion. Make participants sound distinct and authentic. Generate genuine group dynamics — agreements, disagreements, unexpected insights. Respond with valid JSON only.",
    user: `Simulate a focus group discussion for this product validation.

PRODUCT: ${brief.basics.name} — ${brief.basics.description}
PRICE: ${brief.pricing.estimatedPrice || brief.pricing.priceRange}
CHANNEL: ${brief.channels.channels.join(", ")}

PARTICIPANTS:
${participantProfiles}

DISCUSSION GUIDE:
${topicsText}

Simulate the group discussion and extract structured insights.

Return JSON:
{
  "topicSummaries": [
    {
      "topic": "topic name",
      "agreements": ["point of consensus", ...],
      "disagreements": ["point of tension", ...],
      "keyInsight": "the most important thing that came up on this topic"
    }
  ],
  "representativeQuotes": [
    {
      "personaId": "exact_id",
      "quote": "verbatim-style quote",
      "topic": "which topic"
    }
  ],
  "overallAgreements": ["what everyone agreed on", ...],
  "tensions": ["where group was divided", ...],
  "objections": ["recurring objection", ...],
  "purchaseConditions": ["condition under which they would buy", ...],
  "pricingPerceptions": ["pricing comment or pattern", ...]
}

Participant IDs: ${participants.map((p) => `${p.name}=${p.id}`).join(", ")}`,
  };
}

// ─────────────────────────────────────────────
// 8. INTERVIEW GUIDE GENERATION
// ─────────────────────────────────────────────

export function buildInterviewGuidePrompt(
  brief: BusinessIdeaBrief,
  selectedPersonas: SyntheticPersona[]
): { system: string; user: string } {
  return {
    system:
      "You are an expert user researcher specializing in depth interviews. Create an interview guide that uncovers deep motivations and behavioral patterns. Respond with valid JSON only.",
    user: `Design a 1:1 interview guide for validating this business idea.

PRODUCT: ${brief.basics.name} — ${brief.basics.description}
PROBLEM: ${brief.basics.problem}
VALUE PROP: ${brief.basics.valueProposition}
TARGET CUSTOMER: ${brief.customer.idealCustomer}
VALIDATION OBJECTIVES: ${brief.validationObjectives.join(", ")}

INTERVIEWEES:
${selectedPersonas.map((p) => `- ${p.name}: ${p.occupation}, ${p.categoryRelationship}`).join("\n")}

Create 10 depth interview questions that:
- Start with context and current behavior
- Explore the problem deeply before the solution
- Uncover emotional context and language
- Understand current alternatives
- Reveal real triggers for change
- Explore price sensitivity and conditions for purchase

Return JSON:
{
  "questions": ["question 1", "question 2", ..., "question 10"]
}`,
  };
}

// ─────────────────────────────────────────────
// 9. INTERVIEW SIMULATION (per persona)
// ─────────────────────────────────────────────

export function buildInterviewSimulationPrompt(
  persona: SyntheticPersona,
  guide: InterviewGuide,
  brief: BusinessIdeaBrief
): { system: string; user: string } {
  return {
    system:
      "You are simulating a realistic depth interview. The persona responds thoughtfully, with nuance, using their own language and perspective. Respond with valid JSON only.",
    user: `Simulate a depth interview with this person about a product idea.

PRODUCT BEING VALIDATED:
Name: ${brief.basics.name || "Unnamed product"}
Description: ${brief.basics.description}
Problem it solves: ${brief.basics.problem}
Price: ${brief.pricing.estimatedPrice || brief.pricing.priceRange}

PERSONA BEING INTERVIEWED:
Name: ${persona.name}
Age: ${persona.age}, ${persona.occupation}, ${persona.location}
Bio: ${persona.bio}
Income: ${persona.incomeLevel}
Category relationship: ${persona.categoryRelationship}
Habits: ${persona.relevantHabits.join(", ")}
Motivations: ${persona.motivations.join(", ")}
Objections: ${persona.objections.join(", ")}
Price sensitivity: ${persona.priceSensitivity}
Spending attitude: ${persona.spendingAttitude}

INTERVIEW QUESTIONS ASKED:
${guide.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Based on the full interview, extract deep insights:

Return JSON:
{
  "personaId": "${persona.id}",
  "deepPurchaseReasons": ["specific reason to buy", ...],
  "nonPurchaseReasons": ["specific reason NOT to buy", ...],
  "currentAlternatives": ["what they currently use/do instead", ...],
  "emotionalContext": "the emotional layer behind their relationship with this problem",
  "functionalBarriers": ["practical barrier", ...],
  "userLanguage": ["phrase or word they would actually use", ...],
  "triggersToPurchase": ["specific trigger that would make them buy", ...],
  "summary": "2-3 sentence summary of this persona's position on this idea"
}`,
  };
}

// ─────────────────────────────────────────────
// 10. MARKET VALIDATION
// ─────────────────────────────────────────────

export function buildMarketValidationPrompt(brief: BusinessIdeaBrief): {
  system: string;
  user: string;
} {
  return {
    system:
      "You are a senior market analyst. Provide a realistic, evidence-based market validation snapshot. Be specific and opinionated. Respond with valid JSON only.",
    user: `Provide a market validation snapshot for this business idea.

IDEA: ${brief.basics.name} — ${brief.basics.description}
TYPE: ${brief.basics.type}
CATEGORY: ${brief.basics.category}
MARKET: ${brief.market.country}, scope: ${brief.market.launchScope}
PRICE: ${brief.pricing.estimatedPrice || brief.pricing.priceRange}
CHANNELS: ${brief.channels.channels.join(", ")}
CUSTOMER: ${brief.customer.idealCustomer}

Provide a realistic market assessment based on your knowledge of this type of business.

Return JSON:
{
  "competitiveLandscape": "2-3 sentence description of the competitive landscape",
  "saturationLevel": "low|medium|high",
  "referencePrice": "what comparable offerings charge",
  "comparablePositioning": ["comparable brand or product type", ...],
  "demandSignals": ["signal that demand exists", ...],
  "marketTrends": ["relevant trend", ...],
  "marketAppetite": "1-2 sentence assessment of whether the market is receptive",
  "potentialNiches": ["specific niche to target first", ...],
  "competitiveRisks": ["specific competitive risk", ...]
}`,
  };
}

// ─────────────────────────────────────────────
// 11. SCORING & RECOMMENDATION
// ─────────────────────────────────────────────

export function buildScoringPrompt(
  brief: BusinessIdeaBrief,
  surveyResults: SurveyResults,
  focusGroupOutput: FocusGroupOutput,
  interviewsOutput: InterviewsOutput,
  marketValidation: MarketValidation
): { system: string; user: string } {
  return {
    system:
      "You are a senior venture analyst scoring a business idea based on multi-source research. Be rigorous and honest. Respond with valid JSON only.",
    user: `Score this business idea using all available research data.

IDEA: ${brief.basics.name} — ${brief.basics.description}
VALUE PROPOSITION: ${brief.basics.valueProposition}
PRICE: ${brief.pricing.estimatedPrice || brief.pricing.priceRange}
MARKET: ${brief.market.country}, ${brief.market.launchScope}

SURVEY DATA:
- Purchase intent score from survey: ${surveyResults.analysis?.purchaseIntentScore ?? "N/A"}/100
- Key drivers: ${surveyResults.analysis?.purchaseDrivers.join(", ") ?? "none"}
- Key frictions: ${surveyResults.analysis?.frictions.join(", ") ?? "none"}
- Price perception: ${surveyResults.analysis?.pricePerception ?? "N/A"}

FOCUS GROUP HIGHLIGHTS:
- Overall agreements: ${focusGroupOutput.overallAgreements.join(", ")}
- Tensions: ${focusGroupOutput.tensions.join(", ")}
- Objections: ${focusGroupOutput.objections.join(", ")}
- Purchase conditions: ${focusGroupOutput.purchaseConditions.join(", ")}

INTERVIEW INSIGHTS:
${interviewsOutput.globalSynthesis}

MARKET:
- Saturation: ${marketValidation.saturationLevel}
- Market appetite: ${marketValidation.marketAppetite}
- Competitive risks: ${marketValidation.competitiveRisks.join(", ")}

Score across these 8 dimensions (0-100 each):
1. Clarity of value proposition (weight: 15)
2. Perceived attractiveness (weight: 15)
3. Purchase intent (weight: 20)
4. Target-market fit (weight: 15)
5. Differentiation (weight: 10)
6. Competitive risk (weight: 10, higher score = lower risk)
7. Price viability (weight: 10)
8. Consistency across research methods (weight: 5)

Return JSON:
{
  "dimensions": [
    {
      "dimension": "Clarity of value proposition",
      "score": 0-100,
      "weight": 15,
      "explanation": "specific explanation based on research data"
    }
  ],
  "totalScore": 0-100,
  "verdict": "GO|GO_WITH_CHANGES|NO_GO",
  "verdictExplanation": "2-3 sentence explanation of the verdict with specific evidence",
  "suggestedImprovements": ["specific improvement", ...]
}

Verdict guide: 70+ = GO, 45-69 = GO_WITH_CHANGES, <45 = NO_GO`,
  };
}

// ─────────────────────────────────────────────
// 12. CROSS-METHOD SYNTHESIS
// ─────────────────────────────────────────────

export function buildSynthesisPrompt(
  brief: BusinessIdeaBrief,
  surveyResults: SurveyResults,
  focusGroupOutput: FocusGroupOutput,
  interviewsOutput: InterviewsOutput
): { system: string; user: string } {
  return {
    system:
      "You are a senior researcher synthesizing findings across multiple research methodologies. Identify what converges and what diverges. Be specific and intellectually honest. Respond with valid JSON only.",
    user: `Synthesize findings across survey, focus group, and depth interviews for this business idea.

IDEA: ${brief.basics.name} — ${brief.basics.description}

SURVEY FINDINGS:
- Drivers: ${surveyResults.analysis?.purchaseDrivers.join(", ") ?? "none"}
- Frictions: ${surveyResults.analysis?.frictions.join(", ") ?? "none"}
- Patterns: ${surveyResults.analysis?.keyPatterns.join(", ") ?? "none"}
- Intent score: ${surveyResults.analysis?.purchaseIntentScore ?? "N/A"}/100

FOCUS GROUP FINDINGS:
- Agreements: ${focusGroupOutput.overallAgreements.join(", ")}
- Tensions: ${focusGroupOutput.tensions.join(", ")}
- Objections: ${focusGroupOutput.objections.join(", ")}
- Purchase conditions: ${focusGroupOutput.purchaseConditions.join(", ")}

INTERVIEW SYNTHESIS:
${interviewsOutput.globalSynthesis}

Return JSON:
{
  "repeatedPatterns": ["pattern that appeared in 2+ methods", ...],
  "contradictions": ["finding that differed between methods", ...],
  "strongSignals": ["high-confidence insight", ...],
  "warnings": ["concern worth addressing before launch", ...],
  "hypothesesToValidate": ["hypothesis that needs real-world testing", ...],
  "solidFindings": ["conclusion we're confident about", ...],
  "uncertainFindings": ["conclusion that's still unclear", ...]
}`,
  };
}

// ─────────────────────────────────────────────
// 13. ACTION PLAN
// ─────────────────────────────────────────────

export function buildActionPlanPrompt(
  brief: BusinessIdeaBrief,
  scoring: { verdict: string; suggestedImprovements: string[] },
  synthesis: { strongSignals: string[]; warnings: string[]; hypothesesToValidate: string[] }
): { system: string; user: string } {
  return {
    system:
      "You are a startup advisor creating a concrete execution plan. Make it specific, actionable, and tailored to this exact idea. Respond with valid JSON only.",
    user: `Create a post-validation action plan for this business idea.

IDEA: ${brief.basics.name} — ${brief.basics.description}
VERDICT: ${scoring.verdict}
STAGE: ${brief.projectStage || "idea"}
BUDGET: ${brief.founderContext.budget || "not specified"}
TEAM: ${brief.founderContext.teamSize || "solo"}
URGENCY: ${brief.founderContext.urgency || "medium"}

IMPROVEMENTS NEEDED: ${scoring.suggestedImprovements.join(", ")}
STRONG SIGNALS: ${synthesis.strongSignals.join(", ")}
WARNINGS: ${synthesis.warnings.join(", ")}
HYPOTHESES TO TEST: ${synthesis.hypothesesToValidate.join(", ")}

Create 8-10 specific, prioritized next steps. Each step should:
- Be concrete and actionable (not vague advice)
- Be specific to this idea and context
- Have a clear category: research, product, commercial, financial, marketing, legal, operations
- Be ordered by priority

Return JSON:
{
  "steps": [
    {
      "id": "step_1",
      "title": "Short action title",
      "description": "Specific description of what to do and why",
      "priority": "high|medium|low",
      "category": "research|product|commercial|financial|marketing|legal|operations",
      "status": "pending",
      "rationale": "Why this step matters for this specific idea"
    }
  ]
}`,
  };
}
