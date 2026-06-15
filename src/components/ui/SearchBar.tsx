import { useState, useRef, useEffect } from 'react';
import { Search, X, History, Building2, User } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { OrgNode, Employee } from '@/types';

export default function SearchBar() {
  const {
    searchQuery,
    searchResults,
    searchHistory,
    setSearchQuery,
    addSearchHistory,
    clearSearch,
    selectNode,
    selectEmployee,
  } = useAppStore();

  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
  };

  const handleNodeClick = (node: OrgNode) => {
    selectNode(node.id);
    addSearchHistory(node.name);
    setShowDropdown(false);
  };

  const handleEmployeeClick = (employee: Employee) => {
    selectEmployee(employee);
    addSearchHistory(employee.name);
    setShowDropdown(false);
  };

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
    setShowDropdown(true);
  };

  const handleClear = () => {
    clearSearch();
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      addSearchHistory(searchQuery.trim());
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4"
    >
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl shadow-2xl shadow-nebula-purple/20">
        <div className="flex items-center gap-4 px-5 py-3">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nebula-purple to-nebula-cyan flex items-center justify-center">
              <span className="text-white font-bold text-sm">3D</span>
            </div>
            <span className="text-white font-display font-semibold text-lg hidden sm:block">
              3D 组织星云图
            </span>
          </div>

          <div className="flex-1 relative">
            <div className="flex items-center bg-white/5 rounded-xl border border-white/10 focus-within:border-nebula-purple/50 transition-all duration-300">
              <Search className="w-4 h-4 text-white/40 ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={handleKeyDown}
                placeholder="搜索部门或员工..."
                className="w-full bg-transparent px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={handleClear}
                  className="mr-2 p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-white/50" />
                </button>
              )}
            </div>

            {showDropdown && (searchResults.length > 0 || searchHistory.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 backdrop-blur-xl bg-space-900/90 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                {searchResults.length > 0 && (
                  <div className="max-h-64 overflow-y-auto">
                    <div className="px-3 py-2 text-xs text-white/40 uppercase tracking-wider bg-white/5">
                      搜索结果
                    </div>
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (result.node) handleNodeClick(result.node);
                          else if (result.employee) handleEmployeeClick(result.employee);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 transition-colors text-left"
                      >
                        {result.node ? (
                          <>
                            <div className="w-8 h-8 rounded-lg bg-nebula-purple/20 flex items-center justify-center shrink-0">
                              <Building2 className="w-4 h-4 text-nebula-purple" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-white text-sm font-medium truncate">
                                {result.node.name}
                              </div>
                              <div className="text-white/40 text-xs">
                                {result.node.type === 'company' ? '公司' : result.node.type === 'division' ? '事业部' : result.node.type === 'department' ? '部门' : '团队'}
                                {' · '}{result.node.employeeCount} 人
                              </div>
                            </div>
                          </>
                        ) : result.employee ? (
                          <>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nebula-cyan/30 to-nebula-purple/30 flex items-center justify-center shrink-0">
                              <span className="text-white text-xs font-medium">
                                {result.employee.name.charAt(0)}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-white text-sm font-medium truncate">
                                {result.employee.name}
                              </div>
                              <div className="text-white/40 text-xs">
                                {result.employee.title} · {result.employee.level}
                              </div>
                            </div>
                          </>
                        ) : null}
                      </button>
                    ))}
                  </div>
                )}

                {searchHistory.length > 0 && searchResults.length === 0 && (
                  <div>
                    <div className="px-3 py-2 text-xs text-white/40 uppercase tracking-wider bg-white/5 flex items-center gap-1">
                      <History className="w-3 h-3" />
                      搜索历史
                    </div>
                    {searchHistory.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleHistoryClick(item)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 transition-colors text-left"
                      >
                        <History className="w-4 h-4 text-white/30 shrink-0" />
                        <span className="text-white/70 text-sm">{item}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
