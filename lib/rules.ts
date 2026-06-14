export const evidenceStatusLabels = {
  verified: '✅ 已验证',
  internal: '🔶 内部认定',
  pending: '❓ 待确认',
  forbidden: '⛔ 禁用'
};

export const qaVerdictLabels = {
  pass: 'Pass',
  needs_revision: 'Needs Revision',
  fail: 'Fail',
  blocked: 'Blocked'
};

export const hardGates = [
  '未完成 Intake，不进入事实抽取。',
  '未锁定产品真值，不生成最终前台文案。',
  'Claim 证据边界先于 Listing / A+ / Brand Story 文案。',
  '最终文案转化审计不混入 Claim 风险审计。',
  '图片内容策划只决定每张图说什么，不生成图片，不写生图 prompt。',
  'QA 未通过，不进入最终交付。'
];

export const sourceRoleRules = [
  { role: 'product_brief', allowed: '填写产品会变的信息：产品是什么、卖给谁、主打什么、不能写什么。', forbidden: '不要把执行规则重复塞进 Brief。' },
  { role: 'product_truth', allowed: '锁定产品事实、视觉真值、配件、参数和不可改变元素。', forbidden: '不得用竞品事实替代本产品真值。' },
  { role: 'claim_evidence', allowed: '约束可写 claim、限定语和禁用表达。', forbidden: '无证据不得放行功效、安全、认证、数字或竞品对比。' },
  { role: 'competitor_reference', allowed: '理解页面结构、类目标配、差异点和风险边界。', forbidden: '不得把竞品 claim 当成本产品证明。' },
  { role: 'review_voc', allowed: '提取用户痛点、疑虑、语言和购买动机。', forbidden: '评论只能证明需求，不能证明本产品性能。' },
  { role: 'keyword_data', allowed: '决定主关键词、长尾词和 Search Terms 候选。', forbidden: '不要凭直觉强塞关键词。' },
  { role: 'brand_material', allowed: '支持 Brand Story 和品牌语气。', forbidden: '资料不足时不得虚构品牌故事。' }
];
