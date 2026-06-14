'use client';

import { useMemo, useState } from 'react';
import samplePack from '@/data/examples/hs915_content_planning_pack.json';
import { evidenceStatusLabels, hardGates, qaVerdictLabels, sourceRoleRules } from '@/lib/rules';
import type { BriefField, ContentOutput, ContentPlanningPack, EvidenceStatus, QAVerdict, StageStatus } from '@/types/content';

const statusOptions: EvidenceStatus[] = ['verified', 'internal', 'pending', 'forbidden'];
const stageStatuses: StageStatus[] = ['not_started', 'in_progress', 'blocked', 'ready_for_ai', 'draft_ready', 'qa_passed'];
const qaOptions: QAVerdict[] = ['pass', 'needs_revision', 'fail', 'blocked'];

type Tab = 'brief' | 'workflow' | 'claims' | 'outputs' | 'qa_export';

function downloadText(filename: string, content: string, type = 'text/markdown') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function makeExport(pack: ContentPlanningPack) {
  const stageRows = pack.stages.map((stage) => `- ${stage.name}｜${stage.status}｜Owner: ${stage.ownerSkill}\n  - Gate: ${stage.gateRule}`).join('\n');
  const claimRows = pack.claimControls.map((claim) => `- ${claim.claim}｜${claim.status}\n  - Evidence: ${claim.evidence}\n  - Allowed: ${claim.allowedExpression}\n  - Forbidden: ${claim.forbiddenExpression}`).join('\n');
  const outputRows = pack.outputs.map((output) => `## ${output.label}\n\nStatus: ${output.status}\nQA: ${output.qaVerdict}\n\n${output.content}`).join('\n\n');
  return `# ${pack.projectName} Delivery Draft\n\nPack version: ${pack.packVersion}\nWorkflow mode: ${pack.workflowMode}\n\n## Workflow Stages\n\n${stageRows}\n\n## Claim Controls\n\n${claimRows}\n\n## Outputs\n\n${outputRows}\n\n## Source Pack JSON\n\n\`\`\`json\n${JSON.stringify(pack, null, 2)}\n\`\`\`\n`;
}

export default function HomePage() {
  const [pack, setPack] = useState<ContentPlanningPack>(samplePack as ContentPlanningPack);
  const [packText, setPackText] = useState(JSON.stringify(samplePack, null, 2));
  const [importStatus, setImportStatus] = useState('已加载 HS-915 内容策划样例包。');
  const [tab, setTab] = useState<Tab>('brief');
  const [selectedStageId, setSelectedStageId] = useState(pack.stages[0]?.id ?? '');

  const selectedStage = useMemo(() => pack.stages.find((stage) => stage.id === selectedStageId) ?? pack.stages[0], [pack, selectedStageId]);
  const completion = useMemo(() => pack.stages.filter((stage) => stage.status === 'qa_passed' || stage.status === 'draft_ready').length, [pack.stages]);

  function loadSample() {
    const next = samplePack as ContentPlanningPack;
    setPack(next);
    setPackText(JSON.stringify(next, null, 2));
    setSelectedStageId(next.stages[0]?.id ?? '');
    setImportStatus('已加载 HS-915 内容策划样例包。');
  }

  function importPack() {
    try {
      const parsed = JSON.parse(packText) as ContentPlanningPack;
      if (parsed.workflowMode !== 'content_planning_brief_driven') throw new Error('workflowMode must be content_planning_brief_driven.');
      if (!Array.isArray(parsed.stages) || parsed.stages.length === 0) throw new Error('stages is required.');
      if (!Array.isArray(parsed.outputs)) throw new Error('outputs is required.');
      setPack(parsed);
      setSelectedStageId(parsed.stages[0]?.id ?? '');
      setImportStatus('企划包已验证并导入。');
    } catch (error) {
      setImportStatus(error instanceof Error ? `导入失败：${error.message}` : '导入失败。');
    }
  }

  function updateField(section: keyof Pick<ContentPlanningPack, 'metadata' | 'productFacts' | 'visualTruthLocks' | 'userFields' | 'constraints' | 'materialChecklist'>, id: string, patch: Partial<BriefField>) {
    setPack((current) => ({ ...current, [section]: current[section].map((field) => field.id === id ? { ...field, ...patch } : field) }));
  }

  function updateStage(status: StageStatus) {
    if (!selectedStage) return;
    setPack((current) => ({ ...current, stages: current.stages.map((stage) => stage.id === selectedStage.id ? { ...stage, status } : stage) }));
  }

  function updateOutput(id: string, patch: Partial<ContentOutput>) {
    setPack((current) => ({ ...current, outputs: current.outputs.map((output) => output.id === id ? { ...output, ...patch } : output) }));
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#1f1a2e]">
      <section className="bg-[#2b2334] px-6 py-10 text-white md:px-10">
        <p className="text-sm uppercase tracking-[0.22em] text-orange-200">Meng Amazon Content Studio MVP</p>
        <h1 className="mt-3 max-w-5xl text-4xl font-bold md:text-5xl">AI 文描策划工作台：从新品企划书到 Listing / 主副图内容 / A+ / QA / 交付包</h1>
        <p className="mt-4 max-w-4xl text-white/85">这是策划侧工作台，不生成图片，不写生图 Prompt。它把 Amazon Brief、产品真值、Claim 边界、Skill 流程和 QA Gate 变成可操作前台。</p>
      </section>

      <section className="grid gap-4 px-6 py-6 md:grid-cols-4 md:px-10">
        <Metric label="Project" value={pack.projectName} />
        <Metric label="Stages" value={`${completion}/${pack.stages.length}`} />
        <Metric label="Outputs" value={String(pack.outputs.length)} />
        <Metric label="Mode" value="Planning" />
      </section>

      <section className="px-6 pb-10 md:px-10">
        <div className="mb-5 flex flex-wrap gap-2">
          {[
            ['brief', '1. Brief Intake'],
            ['workflow', '2. Skill Workflow'],
            ['claims', '3. Truth & Claim Gates'],
            ['outputs', '4. Planning Outputs'],
            ['qa_export', '5. QA & Export']
          ].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key as Tab)} className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === key ? 'bg-[#2b2334] text-white' : 'border border-zinc-300 bg-white'}`}>{label}</button>
          ))}
        </div>

        {tab === 'brief' ? (
          <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <Panel title="Amazon Brief Import">
              <textarea className="h-80 w-full rounded-xl border border-zinc-200 p-3 text-xs" value={packText} onChange={(event) => setPackText(event.target.value)} />
              <div className="mt-3 flex gap-2">
                <button className="rounded-xl bg-[#2b2334] px-4 py-2 text-sm font-semibold text-white" onClick={importPack}>Validate & Import</button>
                <button className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold" onClick={loadSample}>Load Sample</button>
              </div>
              <p className="mt-3 text-sm text-zinc-600">{importStatus}</p>
            </Panel>
            <div className="space-y-6">
              <FieldSection title="0. 元信息" section="metadata" fields={pack.metadata} updateField={updateField} />
              <FieldSection title="1. 产品事实" section="productFacts" fields={pack.productFacts} updateField={updateField} />
              <FieldSection title="1.2 视觉真值" section="visualTruthLocks" fields={pack.visualTruthLocks} updateField={updateField} />
              <FieldSection title="2. 用户" section="userFields" fields={pack.userFields} updateField={updateField} />
              <FieldSection title="4. 约束与禁区" section="constraints" fields={pack.constraints} updateField={updateField} />
              <FieldSection title="5. 素材清单" section="materialChecklist" fields={pack.materialChecklist} updateField={updateField} />
            </div>
          </div>
        ) : null}

        {tab === 'workflow' ? (
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <Panel title="Skill Stage Map">
              <div className="space-y-2">
                {pack.stages.map((stage) => (
                  <button key={stage.id} onClick={() => setSelectedStageId(stage.id)} className={`w-full rounded-2xl border p-3 text-left ${selectedStageId === stage.id ? 'border-[#d78b2f] bg-orange-50' : 'border-zinc-200 bg-white'}`}>
                    <div className="font-semibold">{stage.name}</div>
                    <div className="mt-1 text-xs text-zinc-600">{stage.ownerSkill}</div>
                    <div className="mt-2 text-xs font-semibold text-[#7b4a1d]">{stage.status}</div>
                  </button>
                ))}
              </div>
            </Panel>
            {selectedStage ? (
              <Panel title="Stage Workspace">
                <div className="grid gap-4 md:grid-cols-2">
                  <Info label="Stage" value={selectedStage.name} />
                  <Info label="Owner Skill" value={selectedStage.ownerSkill} />
                  <Info label="Gate Rule" value={selectedStage.gateRule} />
                  <label className="text-sm font-semibold">Status
                    <select className="mt-2 w-full rounded-xl border border-zinc-300 p-2" value={selectedStage.status} onChange={(event) => updateStage(event.target.value as StageStatus)}>
                      {stageStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </label>
                </div>
                <TwoColumnList titleA="Input Needed" itemsA={selectedStage.inputNeeded} titleB="Output Contract" itemsB={selectedStage.outputContract} />
                <div className="mt-5 rounded-2xl bg-red-50 p-4">
                  <h3 className="font-semibold text-red-900">Hard Gates</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-800">{hardGates.map((gate) => <li key={gate}>{gate}</li>)}</ul>
                </div>
              </Panel>
            ) : null}
          </div>
        ) : null}

        {tab === 'claims' ? (
          <div className="space-y-6">
            <Panel title="Source Role Rules">
              <div className="grid gap-3 md:grid-cols-2">
                {sourceRoleRules.map((rule) => (
                  <div key={rule.role} className="rounded-2xl border border-zinc-200 bg-white p-4">
                    <div className="font-semibold">{rule.role}</div>
                    <div className="mt-2 text-sm text-green-700">Allowed: {rule.allowed}</div>
                    <div className="mt-1 text-sm text-red-700">Forbidden: {rule.forbidden}</div>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="Claim Evidence Control">
              <div className="grid gap-4">
                {pack.claimControls.map((claim) => (
                  <div key={claim.claim} className="rounded-2xl border border-zinc-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold">{claim.claim}</h3>
                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold">{evidenceStatusLabels[claim.status]}</span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-700">Evidence: {claim.evidence}</p>
                    <p className="mt-2 text-sm text-green-700">Allowed: {claim.allowedExpression}</p>
                    <p className="mt-1 text-sm text-red-700">Forbidden: {claim.forbiddenExpression}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        ) : null}

        {tab === 'outputs' ? (
          <Panel title="Planning Outputs">
            <div className="space-y-5">
              {pack.outputs.map((output) => (
                <div key={output.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <Info label="Output" value={output.label} />
                    <label className="text-sm font-semibold">Status
                      <select className="mt-2 w-full rounded-xl border border-zinc-300 p-2" value={output.status} onChange={(event) => updateOutput(output.id, { status: event.target.value as StageStatus })}>
                        {stageStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </label>
                    <label className="text-sm font-semibold">QA Verdict
                      <select className="mt-2 w-full rounded-xl border border-zinc-300 p-2" value={output.qaVerdict} onChange={(event) => updateOutput(output.id, { qaVerdict: event.target.value as QAVerdict })}>
                        {qaOptions.map((verdict) => <option key={verdict} value={verdict}>{qaVerdictLabels[verdict]}</option>)}
                      </select>
                    </label>
                  </div>
                  <textarea className="mt-3 h-36 w-full rounded-xl border border-zinc-300 p-3 text-sm" value={output.content} onChange={(event) => updateOutput(output.id, { content: event.target.value })} />
                </div>
              ))}
            </div>
          </Panel>
        ) : null}

        {tab === 'qa_export' ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="QA Rubric Reminder">
              <div className="space-y-3 text-sm text-zinc-700">
                <p><strong>Pass：</strong>所有 Must 检查通过，输出契约完整，无阻塞矛盾。</p>
                <p><strong>Needs Revision：</strong>方向可用，但存在明确局部返修问题。</p>
                <p><strong>Fail：</strong>建立在错误产品身份、错误竞品或未锁定真值上。</p>
                <p><strong>Blocked：</strong>缺少必要上游输入或 Human Gate。</p>
              </div>
            </Panel>
            <Panel title="Delivery Export">
              <p className="text-sm text-zinc-600">导出 Markdown，包含当前 Brief、Workflow、Claim Controls、Outputs 和完整 JSON。后续可扩展 ZIP、飞书同步或执行日志。</p>
              <button className="mt-4 rounded-xl bg-[#2b2334] px-4 py-2 text-sm font-semibold text-white" onClick={() => downloadText('amazon_content_planning_delivery.md', makeExport(pack))}>Export Planning Delivery Markdown</button>
            </Panel>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="text-lg font-bold text-[#6d4776] md:text-2xl">{value}</div>
      <div className="mt-1 text-sm text-zinc-600">{label}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-4">
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function FieldSection({ title, section, fields, updateField }: { title: string; section: keyof Pick<ContentPlanningPack, 'metadata' | 'productFacts' | 'visualTruthLocks' | 'userFields' | 'constraints' | 'materialChecklist'>; fields: BriefField[]; updateField: (section: keyof Pick<ContentPlanningPack, 'metadata' | 'productFacts' | 'visualTruthLocks' | 'userFields' | 'constraints' | 'materialChecklist'>, id: string, patch: Partial<BriefField>) => void }) {
  return (
    <Panel title={title}>
      <div className="grid gap-3">
        {fields.map((field) => (
          <div key={field.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-sm font-semibold">{field.label}</label>
              <select className="rounded-lg border border-zinc-300 p-1 text-xs" value={field.status ?? 'internal'} onChange={(event) => updateField(section, field.id, { status: event.target.value as EvidenceStatus })}>
                {statusOptions.map((status) => <option key={status} value={status}>{evidenceStatusLabels[status]}</option>)}
              </select>
            </div>
            <textarea className="mt-2 h-20 w-full rounded-xl border border-zinc-300 p-2 text-sm" value={field.value} onChange={(event) => updateField(section, field.id, { value: event.target.value })} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

function TwoColumnList({ titleA, itemsA, titleB, itemsB }: { titleA: string; itemsA: string[]; titleB: string; itemsB: string[] }) {
  return (
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl bg-zinc-50 p-4">
        <h3 className="font-semibold">{titleA}</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">{itemsA.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
      <div className="rounded-2xl bg-zinc-50 p-4">
        <h3 className="font-semibold">{titleB}</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">{itemsB.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
    </div>
  );
}
