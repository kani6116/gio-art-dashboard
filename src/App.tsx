import { useState, useMemo } from 'react';
import { List, AlertCircle, CheckCircle2, Clock, BarChart3, Filter, Flag } from 'lucide-react';

// --- 类型定义 ---
type Status = 'todo' | 'doing' | 'revision' | 'done';
type Priority = 'p0' | 'p1' | 'p2';

interface Character {
  id: string;
  name: string;
  role: string;
  priority: Priority;
  illustration: Status;
  chibi: Status;
  spine2d: Status;
  spineAnim: Status;
}

// --- 模拟数据 (保持原样，不删减文字) ---
const INITIAL_DATA: Character[] = [
  { id: '1002', name: '艾琳', role: '女主', priority: 'p0', illustration: 'done', chibi: 'done', spine2d: 'done', spineAnim: 'doing' },
  { id: '1011', name: '艾德里安', role: '男一', priority: 'p0', illustration: 'done', chibi: 'revision', spine2d: 'todo', spineAnim: 'todo' },
  { id: '1003', name: '卢卡斯', role: '渣男', priority: 'p0', illustration: 'done', chibi: 'revision', spine2d: 'todo', spineAnim: 'todo' },
  { id: '1004', name: '麦迪森', role: '渣女', priority: 'p0', illustration: 'done', chibi: 'revision', spine2d: 'todo', spineAnim: 'todo' },
  { id: '1012', name: '伊森', role: '男二', priority: 'p1', illustration: 'doing', chibi: 'revision', spine2d: 'todo', spineAnim: 'todo' },
  { id: '1013', name: '卡西安', role: '男三', priority: 'p0', illustration: 'doing', chibi: 'revision', spine2d: 'todo', spineAnim: 'todo' },
  { id: '1014', name: '艾薇', role: '男一未婚妻', priority: 'p1', illustration: 'done', chibi: 'done', spine2d: 'doing', spineAnim: 'todo' },
  { id: '1005', name: '史密斯', role: '管家', priority: 'p0', illustration: 'done', chibi: 'done', spine2d: 'doing', spineAnim: 'todo' },
  { id: '1006', name: '朱利安', role: '律师', priority: 'p0', illustration: 'done', chibi: 'done', spine2d: 'doing', spineAnim: 'todo' },
  { id: '1007', name: '祖丽', role: '闺蜜', priority: 'p1', illustration: 'revision', chibi: 'revision', spine2d: 'doing', spineAnim: 'todo' },
  { id: '1008', name: '小杰特', role: '豹猫', priority: 'p0', illustration: 'done', chibi: 'done', spine2d: 'done', spineAnim: 'todo' },
  { id: '1001', name: '老爷爷Revan', role: '男三老年', priority: 'p0', illustration: 'doing', chibi: 'todo', spine2d: 'todo', spineAnim: 'todo' },
  { id: '1009', name: '迦文', role: '管理员', priority: 'p0', illustration: 'doing', chibi: 'todo', spine2d: 'todo', spineAnim: 'todo' },
  { id: '1015', name: '混混A', role: 'npc', priority: 'p2', illustration: 'todo', chibi: 'todo', spine2d: 'todo', spineAnim: 'todo' },
];

const STATUS_CONFIG = {
  todo: { label: '未开始', color: 'bg-gray-100 text-gray-400 border-gray-200', icon: Clock, barColor: '#F3F4F6' },
  doing: { label: '进行中', color: 'bg-blue-50 text-blue-600 border-blue-200', icon: Clock, barColor: '#3B82F6' },
  revision: { label: '返修中', color: 'bg-red-50 text-red-600 border-red-200', icon: AlertCircle, barColor: '#EF4444' },
  done: { label: '已完成', color: 'bg-green-50 text-green-600 border-green-200', icon: CheckCircle2, barColor: '#22C55E' },
};

const PRIORITY_CONFIG = {
  p0: { label: 'P0 核心', color: 'bg-rose-600 text-white border-rose-700 shadow-sm' },
  p1: { label: 'P1 重要', color: 'bg-amber-500 text-white border-amber-600 shadow-sm' },
  p2: { label: 'P2 常规', color: 'bg-slate-500 text-white border-slate-600' },
};

const STAGES = [
  { key: 'illustration', label: '正比立绘' },
  { key: 'chibi', label: 'Q版跑图' },
  { key: 'spine2d', label: '2D拆分' },
  { key: 'spineAnim', label: 'Spine动画' },
] as const;

// --- 子组件 ---

const StatusBadge = ({ status }: { status: Status }) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon size={12} />
      {config.label}
    </div>
  );
};

const PriorityBadge = ({ priority }: { priority: Priority }) => (
  <div className={`flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold border ${PRIORITY_CONFIG[priority].color}`}>
    {priority.toUpperCase()}
  </div>
);

const ProgressBar = ({ character }: { character: Character }) => {
  const completed = [character.illustration, character.chibi, character.spine2d, character.spineAnim].filter(s => s === 'done').length;
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 mt-2 overflow-hidden">
      <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${(completed / 4) * 100}%` }} />
    </div>
  );
};

const SimplePieChart = ({ data, size = 120 }: { data: { value: number; color: string }[], size?: number }) => {
  const total = data.reduce((acc, cur) => acc + cur.value, 0);
  let currentAngle = 0;
  if (total === 0) return <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-400">无数据</div>;
  return (
    <svg width={size} height={size} viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }}>
      {data.map((slice, i) => {
        const sliceAngle = (slice.value / total) * 2 * Math.PI;
        const x1 = Math.cos(currentAngle); const y1 = Math.sin(currentAngle);
        const x2 = Math.cos(currentAngle + sliceAngle); const y2 = Math.sin(currentAngle + sliceAngle);
        const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
        const pathData = `M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
        currentAngle += sliceAngle;
        return <path d={pathData} fill={slice.color} key={i} stroke="white" strokeWidth="0.05" />;
      })}
    </svg>
  );
};

// --- 主组件 (重命名为 App 以修复部署错误) ---

export default function App() {
  const [viewMode, setViewMode] = useState<'dashboard' | 'list'>('dashboard');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');

  const stats = useMemo(() => {
    let totalItems = 0;
    let doneCount = 0;
    let doingCount = 0;
    let revisionCount = 0;
    let todoCount = 0;
    const filteredData = filterPriority === 'all' ? INITIAL_DATA : INITIAL_DATA.filter(c => c.priority === filterPriority);
    filteredData.forEach(char => {
      STAGES.forEach(stage => {
        const status = char[stage.key];
        totalItems++;
        if (status === 'done') doneCount++;
        else if (status === 'doing') doingCount++;
        else if (status === 'revision') revisionCount++;
        else todoCount++;
      });
    });
    return {
      totalCharacters: filteredData.length,
      progress: totalItems > 0 ? Math.round((doneCount / totalItems) * 100) : 0,
      counts: { done: doneCount, doing: doingCount, revision: revisionCount, todo: todoCount },
      data: filteredData
    };
  }, [filterPriority]);

  const stageStats = useMemo(() => {
    return STAGES.map(stage => {
      let revision = 0; let doing = 0;
      stats.data.forEach(char => {
        if (char[stage.key] === 'revision') revision++;
        if (char[stage.key] === 'doing') doing++;
      });
      return { name: stage.label, revision, doing };
    });
  }, [stats.data]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-slate-800">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">角色资产进度看板</h1>
          <p className="text-slate-500 text-sm mt-1">项目代号: Project Gio | 更新时间: 2026-01-9</p>
        </div>
        <div className="flex bg-white p-1 rounded-lg shadow-sm border border-gray-200">
          <button onClick={() => setViewMode('dashboard')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-gray-50'}`}><BarChart3 size={16} /> 仪表盘</button>
          <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-gray-50'}`}><List size={16} /> 详细列表</button>
        </div>
      </header>

      <div className="mb-6 flex items-center gap-4 overflow-x-auto pb-2 border-b border-gray-100">
        <span className="text-sm font-medium text-slate-500 shrink-0 flex items-center gap-1"><Filter size={14}/> 筛选:</span>
        <button onClick={() => setFilterPriority('all')} className={`px-3 py-1.5 rounded-full text-xs font-medium border shrink-0 ${filterPriority === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-gray-200'}`}>全部角色</button>
        {(['p0', 'p1', 'p2'] as const).map(p => (
          <button key={p} onClick={() => setFilterPriority(p)} className={`px-3 py-1.5 rounded-full text-xs font-medium border shrink-0 ${filterPriority === p ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-200'}`}>{p.toUpperCase()}</button>
        ))}
      </div>

      {viewMode === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="text-slate-500 text-sm font-medium mb-1">{filterPriority === 'all' ? '总完工率' : `P${filterPriority.slice(1)} 完工率`}</div>
              <div className="flex items-end gap-2">
                <div className="text-3xl font-bold text-slate-900">{stats.progress}%</div>
                <div className="text-xs text-slate-400 mb-1.5">基于当前筛选</div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3"><div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${stats.progress}%` }} /></div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-red-100 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 p-4 opacity-10"><AlertCircle size={64} className="text-red-500" /></div>
              <div className="text-red-600 text-sm font-medium mb-1">需关注 (返修中)</div>
              <div className="text-3xl font-bold text-red-700">{stats.counts.revision} <span className="text-sm font-normal text-red-400">个环节</span></div>
              <p className="text-xs text-red-400 mt-2">阻碍流程推进</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm">
              <div className="text-blue-600 text-sm font-medium mb-1">制作中</div>
              <div className="text-3xl font-bold text-blue-700">{stats.counts.doing} <span className="text-sm font-normal text-blue-400">个环节</span></div>
              <p className="text-xs text-blue-400 mt-2">正常流转中</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-green-100 shadow-sm">
              <div className="text-green-600 text-sm font-medium mb-1">已交付</div>
              <div className="text-3xl font-bold text-green-700">{stats.counts.done} <span className="text-sm font-normal text-blue-400">个环节</span></div>
              <p className="text-xs text-green-400 mt-2">等待下一步</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-6">任务状态分布</h3>
              <div className="flex items-center gap-8 justify-center">
                <SimplePieChart size={160} data={[{ value: stats.counts.done, color: STATUS_CONFIG.done.barColor },{ value: stats.counts.doing, color: STATUS_CONFIG.doing.barColor },{ value: stats.counts.revision, color: STATUS_CONFIG.revision.barColor },{ value: stats.counts.todo, color: STATUS_CONFIG.todo.barColor }]} />
                <div className="space-y-3">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-sm text-slate-600">已完成 ({stats.counts.done})</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-sm text-slate-600">进行中 ({stats.counts.doing})</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-sm text-slate-600">返修中 ({stats.counts.revision})</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-200" /><span className="text-sm text-slate-600">未开始 ({stats.counts.todo})</span></div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
              <h3 className="font-bold text-slate-800 mb-4 text-center">各阶段积压与返修情况</h3>
              <div className="space-y-4">
                {stageStats.map((stage) => (
                  <div key={stage.name} className="flex items-center gap-4">
                    <div className="w-24 text-sm font-medium text-slate-600">{stage.name}</div>
                    <div className="flex-1 h-8 bg-gray-50 rounded-md flex overflow-hidden">
                      {stage.revision > 0 && <div className="h-full bg-red-400 flex items-center justify-center text-white text-xs font-bold" style={{ width: `${(stage.revision / (stats.totalCharacters || 1)) * 100}%` }}>{stage.revision} 返修</div>}
                      {stage.doing > 0 && <div className="h-full bg-blue-400 flex items-center justify-center text-white text-xs font-bold border-l border-white/20" style={{ width: `${(stage.doing / (stats.totalCharacters || 1)) * 100}%` }}>{stage.doing} 进行</div>}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-4 text-center">*此图表展示当前筛选下，哪个制作环节是瓶颈</p>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-700">角色信息</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">整体进度</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 w-32 text-center">正比立绘</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 w-32 text-center">Q版小人</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 w-32 text-center">2D拆分</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 w-32 text-center">Spine动画</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.data.map((char) => (
                  <tr key={char.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-slate-900 flex items-center gap-2">{char.name}<PriorityBadge priority={char.priority} /></div>
                        <div className="text-xs text-slate-400 mt-0.5 uppercase tracking-tighter">{char.role}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 w-48"><ProgressBar character={char} /></td>
                    <td className="px-6 py-4 text-center"><div className="flex justify-center"><StatusBadge status={char.illustration} /></div></td>
                    <td className="px-6 py-4 text-center"><div className="flex justify-center"><StatusBadge status={char.chibi} /></div></td>
                    <td className="px-6 py-4 text-center"><div className="flex justify-center"><StatusBadge status={char.spine2d} /></div></td>
                    <td className="px-6 py-4 text-center"><div className="flex justify-center"><StatusBadge status={char.spineAnim} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
