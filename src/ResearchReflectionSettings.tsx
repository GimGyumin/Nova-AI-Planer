import React, { useState } from 'react';

interface ReflectionLog {
  date: string;
  taskName: string;
  completed: 'Y' | 'N';
  procrastination: string;
  focus: number;
  fatigue: number;
  notes: string;
}

interface Props {
  onClose: () => void;
}

const ResearchReflectionSettings: React.FC<Props> = ({ onClose }) => {
  const [logs, setLogs] = useState<ReflectionLog[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('research_reflection_logs') || '[]');
    } catch {
      return [];
    }
  });
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    const csv = [
      '날짜,과제명,완료여부,지연행동,집중도,피로감,기타관찰',
      ...logs.map(l => [l.date, l.taskName, l.completed, '"' + l.procrastination.replace(/"/g, '""') + '"', l.focus, l.fatigue, '"' + l.notes.replace(/"/g, '""') + '"'].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reflection_logs.csv';
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      setExporting(false);
    }, 500);
  };

  const handleDelete = (idx: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    const newLogs = logs.slice();
    newLogs.splice(idx, 1);
    setLogs(newLogs);
    localStorage.setItem('research_reflection_logs', JSON.stringify(newLogs));
  };

  return (
    <div style={{ padding: 24, minWidth: 320, maxWidth: 500 }}>
      <h3 style={{ marginBottom: 16 }}>설정 · 데이터 관리</h3>
      <button onClick={handleExport} disabled={exporting} style={{ width: '100%', marginBottom: 16, background: 'var(--primary-color)', color: '#fff', borderRadius: 8, padding: 10, border: 'none' }}>CSV로 내보내기</button>
      <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 16 }}>
        <table style={{ width: '100%', fontSize: '0.95rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f0f5' }}>
              <th>날짜</th><th>과제명</th><th>완료</th><th>집중</th><th>피로</th><th></th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#888', padding: 16 }}>저장된 기록이 없습니다.</td></tr>
            ) : logs.map((l, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td>{l.date}</td>
                <td>{l.taskName}</td>
                <td>{l.completed}</td>
                <td>{l.focus}</td>
                <td>{l.fatigue}</td>
                <td><button onClick={() => handleDelete(i)} style={{ color: 'var(--danger-color)', background: 'none', border: 'none', cursor: 'pointer' }}>삭제</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={onClose} style={{ width: '100%', background: '#eee', borderRadius: 8, padding: 10, border: 'none' }}>닫기</button>
    </div>
  );
};

export default ResearchReflectionSettings;
