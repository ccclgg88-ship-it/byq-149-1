import { TimelineEvent } from '@/types';

export function generateTimelineEvents(rootNodeId: string, divisionIds: string[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const dates = [];
  for (let year = 2023; year <= 2025; year++) {
    for (let q = 0; q < 4; q++) {
      const month = q * 3 + 1;
      dates.push(`${year}-${String(month).padStart(2, '0')}-01`);
    }
  }
  dates.push('2026-01-01');
  dates.push('2026-06-01');

  const eventDescriptions: Array<{ type: 'create' | 'dissolve' | 'transfer'; desc: string }> = [
    { type: 'create', desc: '新部门成立：AI 创新实验室' },
    { type: 'dissolve', desc: '部门撤销：传统业务线' },
    { type: 'transfer', desc: '大规模调动：技术中台重组' },
    { type: 'create', desc: '新成立：海外事业部' },
    { type: 'transfer', desc: '人员调动：20人转岗至增长团队' },
    { type: 'create', desc: '新设：数据安全合规部' },
    { type: 'dissolve', desc: '撤销：区域销售三组' },
    { type: 'transfer', desc: '组织调整：产品与设计合并' },
    { type: 'create', desc: '新成立：用户体验研究中心' },
    { type: 'transfer', desc: '核心骨干调动：CTO 线重组' },
  ];

  dates.forEach((date, idx) => {
    if (idx === 0 || idx === dates.length - 1) return;
    const ev = eventDescriptions[idx % eventDescriptions.length];
    const targetIdx = idx % divisionIds.length;
    events.push({
      id: `evt-${idx}`,
      date,
      dateIndex: idx,
      type: ev.type,
      targetNodeId: divisionIds[targetIdx] || rootNodeId,
      payload: { scale: 1 + (idx % 3) * 0.1 },
      description: ev.desc,
    });
  });

  return events;
}

export const TIMELINE_DATES = (() => {
  const d: string[] = [];
  for (let y = 2023; y <= 2025; y++) {
    for (let q = 0; q < 4; q++) {
      d.push(`${y} Q${q + 1}`);
    }
  }
  d.push('2026 Q1', '2026 Q2');
  return d;
})();
