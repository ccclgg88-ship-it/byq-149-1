export type OrgNodeType = 'company' | 'division' | 'department' | 'team';
export type ViewMode = 'tree' | 'nebula' | 'flat';
export type EmployeeLevel = 'P5' | 'P6' | 'P7' | 'P8' | 'P9';
export type TimelineEventType = 'create' | 'dissolve' | 'transfer';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Employee {
  id: string;
  name: string;
  employeeNo: string;
  level: EmployeeLevel;
  tenureYears: number;
  departmentId: string;
  title: string;
  joinDate: string;
}

export interface OrgNode {
  id: string;
  name: string;
  type: OrgNodeType;
  divisionId: string;
  parentId: string | null;
  employeeCount: number;
  headId: string | null;
  children: OrgNode[];
  employees: Employee[];
  expanded: boolean;
  position: Vec3;
  targetPosition: Vec3;
  visible: boolean;
  scale: number;
  createdAt: string;
  dissolvedAt?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  dateIndex: number;
  type: TimelineEventType;
  targetNodeId: string;
  payload: Record<string, unknown>;
  description: string;
}

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  nodeId: string | null;
}

export interface DivisionColor {
  id: string;
  name: string;
  primary: string;
  secondary: string;
}

export interface HighlightState {
  nodeId: string | null;
  pulseStartTime: number;
}
