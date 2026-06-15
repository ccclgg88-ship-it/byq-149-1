import { X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

function getDepartmentName(departmentId: string, orgRoot: any): string {
  if (!orgRoot) return '—';
  const queue: any[] = [orgRoot];
  while (queue.length) {
    const n = queue.shift()!;
    if (n.id === departmentId) return n.name;
    queue.push(...n.children);
  }
  return '—';
}

const fieldLabels: Record<string, string> = {
  employeeNo: '工号',
  level: '职级',
  tenureYears: '司龄',
  title: '职位',
  joinDate: '入职日期',
  departmentId: '所属部门',
};

export default function EmployeePanel() {
  const { selectedEmployee, selectEmployee, orgRoot } = useAppStore();

  if (!selectedEmployee) return null;

  const fields = [
    { key: 'employeeNo', value: selectedEmployee.employeeNo },
    { key: 'level', value: selectedEmployee.level },
    { key: 'tenureYears', value: `${selectedEmployee.tenureYears} 年` },
    { key: 'title', value: selectedEmployee.title },
    { key: 'joinDate', value: selectedEmployee.joinDate },
    {
      key: 'departmentId',
      value: getDepartmentName(selectedEmployee.departmentId, orgRoot),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        className={`absolute top-0 right-0 h-full w-full sm:w-[420px] pointer-events-auto
          transform transition-transform duration-300 ease-out
          ${selectedEmployee ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="h-full backdrop-blur-xl bg-space-900/80 border-l border-white/10 shadow-2xl">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-white font-display font-semibold text-lg">员工详情</h2>
              <button
                onClick={() => selectEmployee(null)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-nebula-purple via-nebula-violet to-nebula-cyan flex items-center justify-center shadow-2xl shadow-nebula-purple/30 mb-4">
                  <span className="text-white font-display font-bold text-3xl">
                    {selectedEmployee.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-white font-display font-semibold text-2xl">
                  {selectedEmployee.name}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-nebula-purple/20 text-nebula-purple text-xs font-medium">
                    {selectedEmployee.level}
                  </span>
                  <span className="text-white/50 text-sm">{selectedEmployee.title}</span>
                </div>
              </div>

              <div className="space-y-4">
                {fields.map((field) => (
                  <div
                    key={field.key}
                    className="flex items-start justify-between gap-4 py-2 border-b border-white/5"
                  >
                    <span className="text-white/40 text-sm shrink-0">
                      {fieldLabels[field.key]}
                    </span>
                    <span className="text-white text-sm text-right break-all">
                      {field.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-xs pointer-events-auto cursor-pointer"
        onClick={() => selectEmployee(null)}
      />
    </div>
  );
}
