import { OrgNode, Employee, EmployeeLevel, OrgNodeType, DivisionColor } from '@/types';
import { DIVISION_COLORS } from '@/utils/colorUtils';

const SURNAMES = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡'];
const GIVEN_NAMES = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀英', '霞', '平', '刚', '桂英', '文', '华'];
const TITLES: Record<EmployeeLevel, string[]> = {
  P5: ['初级工程师', '初级产品经理', '专员', '助理'],
  P6: ['工程师', '产品经理', '高级专员', '主管'],
  P7: ['高级工程师', '高级产品经理', '经理', '资深专员'],
  P8: ['技术专家', '产品总监', '高级经理', '总监'],
  P9: ['架构师', '事业部负责人', '副总裁', '首席专家'],
};

const TEAM_NAMES = [
  '前端组', '后端组', '算法组', '测试组', '运维组', '设计组',
  '用户增长组', '商业化组', '数据分析组', '客户成功组',
  '招聘组', '培训组', '财务组', '法务组', '市场推广组',
];

const DEPT_NAMES = [
  '研发中心', '产品中心', '设计中心', '数据中心',
  '用户运营部', '市场部', '销售部', '客户服务部',
  '人力资源部', '财务部', '行政部', '法务部',
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const rand = seededRandom(20240615);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function generateName(): string {
  return pick(SURNAMES) + pick(GIVEN_NAMES);
}

function generateEmployee(
  id: string,
  departmentId: string,
  minLevel: EmployeeLevel = 'P5',
  maxLevel: EmployeeLevel = 'P7',
): Employee {
  const levels: EmployeeLevel[] = ['P5', 'P6', 'P7', 'P8', 'P9'];
  const minIdx = levels.indexOf(minLevel);
  const maxIdx = levels.indexOf(maxLevel);
  const level = levels[minIdx + Math.floor(rand() * (maxIdx - minIdx + 1))];
  const tenure = Math.floor(rand() * 8) + 1;
  const joinYear = 2026 - tenure;
  const joinMonth = Math.floor(rand() * 12) + 1;
  return {
    id,
    name: generateName(),
    employeeNo: `EMP${String(10000 + parseInt(id.replace(/\D/g, '0') || '0')).slice(-5)}`,
    level,
    tenureYears: tenure,
    departmentId,
    title: pick(TITLES[level]),
    joinDate: `${joinYear}-${String(joinMonth).padStart(2, '0')}-15`,
  };
}

let nodeCounter = 0;
let empCounter = 0;

function makeNode(
  name: string,
  type: OrgNodeType,
  divisionId: string,
  parentId: string | null,
  position: { x: number; y: number; z: number },
): OrgNode {
  nodeCounter++;
  return {
    id: `node-${nodeCounter}`,
    name,
    type,
    divisionId,
    parentId,
    employeeCount: 0,
    headId: null,
    children: [],
    employees: [],
    expanded: type === 'company' || type === 'division',
    position: { ...position },
    targetPosition: { ...position },
    visible: true,
    scale: 1,
    createdAt: '2023-01-01',
  };
}

export function generateMockData(): { root: OrgNode; allEmployees: Employee[] } {
  nodeCounter = 0;
  empCounter = 0;

  const root = makeNode('星河科技集团', 'company', DIVISION_COLORS[0].id, null, { x: 0, y: 20, z: 0 });
  const allEmployees: Employee[] = [];

  const divisionConfigs: { color: DivisionColor; y: number; x: number }[] = [
    { color: DIVISION_COLORS[0], y: 5, x: -35 },
    { color: DIVISION_COLORS[1], y: 5, x: -15 },
    { color: DIVISION_COLORS[2], y: 5, x: 5 },
    { color: DIVISION_COLORS[3], y: 5, x: 25 },
    { color: DIVISION_COLORS[4], y: 5, x: 45 },
  ];

  divisionConfigs.forEach((divConfig, divIdx) => {
    const division = makeNode(divConfig.color.name, 'division', divConfig.color.id, root.id, {
      x: divConfig.x,
      y: divConfig.y,
      z: 0,
    });

    const deptCount = 3 + Math.floor(rand() * 2);
    for (let d = 0; d < deptCount; d++) {
      const deptName = DEPT_NAMES[(divIdx * 3 + d) % DEPT_NAMES.length] + (d > 2 ? ` ${d}部` : '');
      const dept = makeNode(deptName, 'department', divConfig.color.id, division.id, {
        x: divConfig.x + (d - deptCount / 2) * 7,
        y: -8,
        z: (d % 2 === 0 ? -1 : 1) * 5,
      });

      const teamCount = 2 + Math.floor(rand() * 3);
      for (let t = 0; t < teamCount; t++) {
        const teamName = TEAM_NAMES[(divIdx * 5 + d * 2 + t) % TEAM_NAMES.length];
        const team = makeNode(teamName, 'team', divConfig.color.id, dept.id, {
          x: dept.position.x + (t - teamCount / 2) * 4,
          y: -18,
          z: dept.position.z + (t % 2 === 0 ? -3 : 3),
        });

        const empCount = 8 + Math.floor(rand() * 15);
        for (let e = 0; e < empCount; e++) {
          empCounter++;
          const isHead = e === 0;
          const minL: EmployeeLevel = isHead ? 'P7' : 'P5';
          const maxL: EmployeeLevel = isHead ? 'P9' : 'P7';
          const emp = generateEmployee(`emp-${empCounter}`, team.id, minL, maxL);
          team.employees.push(emp);
          allEmployees.push(emp);
          if (isHead) team.headId = emp.id;
        }
        team.employeeCount = team.employees.length;
        dept.children.push(team);
      }

      dept.employeeCount = dept.children.reduce((sum, c) => sum + c.employeeCount, 0);
      dept.headId = dept.children[0]?.headId ?? null;
      division.children.push(dept);
    }

    division.employeeCount = division.children.reduce((sum, c) => sum + c.employeeCount, 0);
    division.headId = division.children[0]?.headId ?? null;
    root.children.push(division);
  });

  const ceo = generateEmployee('emp-ceo', root.id, 'P9', 'P9');
  ceo.title = '首席执行官 CEO';
  ceo.name = '陈星河';
  root.employees.push(ceo);
  allEmployees.push(ceo);
  root.headId = ceo.id;
  root.employeeCount = allEmployees.length;

  return { root, allEmployees };
}
