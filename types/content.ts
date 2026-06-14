export type EvidenceStatus = 'verified' | 'internal' | 'pending' | 'forbidden';
export type StageStatus = 'not_started' | 'in_progress' | 'blocked' | 'ready_for_ai' | 'draft_ready' | 'qa_passed';
export type QAVerdict = 'pass' | 'needs_revision' | 'fail' | 'blocked';

export interface BriefField {
  id: string;
  label: string;
  value: string;
  status?: EvidenceStatus;
  source?: string;
}

export interface PlanningStage {
  id: string;
  name: string;
  ownerSkill: string;
  status: StageStatus;
  inputNeeded: string[];
  outputContract: string[];
  gateRule: string;
}

export interface ClaimControl {
  claim: string;
  evidence: string;
  status: EvidenceStatus;
  allowedExpression: string;
  forbiddenExpression: string;
}

export interface SellingPoint {
  priority: 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
  userPain: string;
  productSolution: string;
  userBenefit: string;
  evidence: string;
  status: EvidenceStatus;
}

export interface ContentOutput {
  id: string;
  label: string;
  type: 'listing' | 'image_plan' | 'premium_aplus' | 'brand_story' | 'strategy_report';
  status: StageStatus;
  content: string;
  qaVerdict: QAVerdict;
}

export interface ContentPlanningPack {
  projectName: string;
  packVersion: string;
  workflowMode: 'content_planning_brief_driven';
  metadata: BriefField[];
  productFacts: BriefField[];
  visualTruthLocks: BriefField[];
  userFields: BriefField[];
  constraints: BriefField[];
  materialChecklist: BriefField[];
  sellingPoints: SellingPoint[];
  claimControls: ClaimControl[];
  stages: PlanningStage[];
  outputs: ContentOutput[];
}
