import { useEffect, useRef } from 'react';
import { Users, Navigation, Minimize2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function ContextMenu() {
  const {
    contextMenu,
    setContextMenu,
    selectNode,
    collapseSiblings,
    orgRoot,
  } = useAppStore();

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu({ visible: false, x: 0, y: 0, nodeId: null });
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu({ visible: false, x: 0, y: 0, nodeId: null });
      }
    };
    if (contextMenu.visible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [contextMenu.visible, setContextMenu]);

  if (!contextMenu.visible || !contextMenu.nodeId) return null;

  const close = () => setContextMenu({ visible: false, x: 0, y: 0, nodeId: null });

  const handleViewEmployees = () => {
    selectNode(contextMenu.nodeId);
    close();
  };

  const handleLocateHead = () => {
    if (!orgRoot) {
      close();
      return;
    }
    const findNode = (node: any): any => {
      if (node.id === contextMenu.nodeId) return node;
      for (const c of node.children) {
        const r = findNode(c);
        if (r) return r;
      }
      return null;
    };
    const node = findNode(orgRoot);
    if (node && node.headId) {
      const head = useAppStore.getState().allEmployees.find((e) => e.id === node.headId);
      if (head) {
        useAppStore.getState().selectEmployee(head);
      }
    }
    close();
  };

  const handleCollapseSiblings = () => {
    collapseSiblings(contextMenu.nodeId!);
    close();
  };

  const menuItems = [
    { icon: Users, label: '查看员工列表', onClick: handleViewEmployees },
    { icon: Navigation, label: '定位到负责人', onClick: handleLocateHead },
    { icon: Minimize2, label: '折叠同级', onClick: handleCollapseSiblings },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50"
      style={{ left: contextMenu.x, top: contextMenu.y }}
    >
      <div className="backdrop-blur-xl bg-space-900/95 border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[180px]">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={item.onClick}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors text-left"
            >
              <Icon className="w-4 h-4 text-white/50" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
