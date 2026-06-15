import { create } from 'zustand';
import {
  OrgNode,
  Employee,
  ViewMode,
  TimelineEvent,
  ContextMenuState,
  HighlightState,
} from '@/types';

interface AppState {
  orgRoot: OrgNode | null;
  allEmployees: Employee[];
  timelineEvents: TimelineEvent[];

  viewMode: ViewMode;
  selectedNodeId: string | null;
  highlightedNodeIds: string[];
  selectedEmployee: Employee | null;
  highlightPulse: HighlightState;

  currentTimeIndex: number;
  isPlaying: boolean;
  playbackSpeed: 1 | 2 | 4;

  searchQuery: string;
  searchHistory: string[];
  searchResults: Array<{ node?: OrgNode; employee?: Employee }>;

  showPerformancePanel: boolean;
  contextMenu: ContextMenuState;
  renderStats: { fps: number; nodeCount: number };

  setOrgData: (root: OrgNode, employees: Employee[], events: TimelineEvent[]) => void;
  setViewMode: (mode: ViewMode) => void;
  selectNode: (nodeId: string | null) => void;
  setHighlightedNodes: (ids: string[]) => void;
  selectEmployee: (emp: Employee | null) => void;
  triggerPulse: (nodeId: string) => void;

  setTimeIndex: (idx: number) => void;
  setPlaying: (p: boolean) => void;
  setPlaybackSpeed: (s: 1 | 2 | 4) => void;

  setSearchQuery: (q: string) => void;
  addSearchHistory: (q: string) => void;
  clearSearch: () => void;

  togglePerformancePanel: () => void;
  setContextMenu: (m: ContextMenuState) => void;
  setRenderStats: (s: { fps: number; nodeCount: number }) => void;

  toggleExpandNode: (nodeId: string) => void;
  collapseSiblings: (nodeId: string) => void;
  updateNodePosition: (nodeId: string, pos: { x: number; y: number; z: number }) => void;
}

function collectDescendants(node: OrgNode): string[] {
  const ids: string[] = [node.id];
  node.children.forEach((c) => ids.push(...collectDescendants(c)));
  return ids;
}

function findNode(root: OrgNode, id: string): OrgNode | null {
  if (root.id === id) return root;
  for (const c of root.children) {
    const r = findNode(c, id);
    if (r) return r;
  }
  return null;
}

function findParent(root: OrgNode, id: string): OrgNode | null {
  for (const c of root.children) {
    if (c.id === id) return root;
    const r = findParent(c, id);
    if (r) return r;
  }
  return null;
}

export const useAppStore = create<AppState>((set, get) => ({
  orgRoot: null,
  allEmployees: [],
  timelineEvents: [],

  viewMode: 'tree',
  selectedNodeId: null,
  highlightedNodeIds: [],
  selectedEmployee: null,
  highlightPulse: { nodeId: null, pulseStartTime: 0 },

  currentTimeIndex: 0,
  isPlaying: false,
  playbackSpeed: 1,

  searchQuery: '',
  searchHistory: [],
  searchResults: [],

  showPerformancePanel: false,
  contextMenu: { visible: false, x: 0, y: 0, nodeId: null },
  renderStats: { fps: 0, nodeCount: 0 },

  setOrgData: (root, employees, events) => {
    const maxIdx = Math.max(0, events.length - 1);
    set({
      orgRoot: root,
      allEmployees: employees,
      timelineEvents: events,
      currentTimeIndex: maxIdx,
    });
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  selectNode: (nodeId) => {
    const { orgRoot } = get();
    if (!nodeId || !orgRoot) {
      set({ selectedNodeId: null, highlightedNodeIds: [] });
      return;
    }
    const node = findNode(orgRoot, nodeId);
    set({
      selectedNodeId: nodeId,
      highlightedNodeIds: node ? collectDescendants(node) : [],
      selectedEmployee: null,
    });
  },

  setHighlightedNodes: (ids) => set({ highlightedNodeIds: ids }),
  selectEmployee: (emp) => set({ selectedEmployee: emp }),
  triggerPulse: (nodeId) => set({ highlightPulse: { nodeId, pulseStartTime: Date.now() } }),

  setTimeIndex: (idx: number) => {
    const { timelineEvents } = get();
    const maxIdx = Math.max(0, timelineEvents.length - 1);
    const safeIdx = Math.max(0, Math.min(Math.floor(idx), maxIdx));
    set({ currentTimeIndex: safeIdx });
  },
  setPlaying: (p) => set({ isPlaying: p }),
  setPlaybackSpeed: (s) => set({ playbackSpeed: s }),

  setSearchQuery: (q) => {
    const { orgRoot, allEmployees } = get();
    const results: Array<{ node?: OrgNode; employee?: Employee }> = [];
    if (q && orgRoot) {
      const query = q.toLowerCase();
      const queue: OrgNode[] = [orgRoot];
      while (queue.length) {
        const n = queue.shift()!;
        if (n.name.toLowerCase().includes(query)) results.push({ node: n });
        queue.push(...n.children);
      }
      allEmployees
        .filter(
          (e) =>
            e.name.toLowerCase().includes(query) ||
            e.employeeNo.toLowerCase().includes(query),
        )
        .slice(0, 10)
        .forEach((e) => results.push({ employee: e }));
    }
    set({ searchQuery: q, searchResults: results.slice(0, 15) });
  },

  addSearchHistory: (q) => {
    const { searchHistory } = get();
    const next = [q, ...searchHistory.filter((h) => h !== q)].slice(0, 8);
    set({ searchHistory: next });
  },

  clearSearch: () => set({ searchQuery: '', searchResults: [] }),

  togglePerformancePanel: () =>
    set((s) => ({ showPerformancePanel: !s.showPerformancePanel })),

  setContextMenu: (m) => set({ contextMenu: m }),
  setRenderStats: (s) => set({ renderStats: s }),

  toggleExpandNode: (nodeId) => {
    const { orgRoot } = get();
    if (!orgRoot) return;
    const node = findNode(orgRoot, nodeId);
    if (node) node.expanded = !node.expanded;
    set({ orgRoot: { ...orgRoot } });
  },

  collapseSiblings: (nodeId) => {
    const { orgRoot } = get();
    if (!orgRoot) return;
    const parent = findParent(orgRoot, nodeId);
    if (parent) {
      parent.children.forEach((c) => {
        if (c.id !== nodeId) c.expanded = false;
      });
      set({ orgRoot: { ...orgRoot } });
    }
  },

  updateNodePosition: (nodeId, pos) => {
    const { orgRoot } = get();
    if (!orgRoot) return;
    const node = findNode(orgRoot, nodeId);
    if (node) {
      node.position = { ...pos };
      node.targetPosition = { ...pos };
      set({ orgRoot: { ...orgRoot } });
    }
  },
}));

export { findNode, findParent, collectDescendants };
