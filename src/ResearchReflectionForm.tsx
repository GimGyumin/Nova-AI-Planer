import React, { useState } from 'react';
import ResearchReflectionSettings from './ResearchReflectionSettings';

interface ReflectionLog {
  date: string;
  taskName: string;
  completed: 'Y' | 'N';
  procrastination: string;
  focus: number; // 1~5
  fatigue: number; // 1~5
  notes: string;
}

const initialLog: ReflectionLog = {
  date: new Date().toISOString().slice(0, 10),
  taskName: '',
  completed: 'N',
  procrastination: '',
  focus: 3,
  fatigue: 3,
  notes: '',
};


const ResearchReflectionForm: React.FC = () => {
  const [log, setLog] = useState<ReflectionLog>(initialLog);
  const [saved, setSaved] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLog((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // 로컬스토리지에 저장 (연구용)
    const logs = JSON.parse(localStorage.getItem('research_reflection_logs') || '[]');
    logs.push(log);
    localStorage.setItem('research_reflection_logs', JSON.stringify(logs));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    setLog({ ...initialLog, date: new Date().toISOString().slice(0, 10) });
  };

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: 24, border: '1px solid #ccc', borderRadius: 12, background: '#fafbfc', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>연구용 자기 성찰 기록지</h2>
        <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 600, fontSize: 18, cursor: 'pointer' }}>설정</button>
      </div>
      {showSettings && (
        <div className="modal-backdrop" style={{ zIndex: 2000 }}>
          <div className="modal-content modal-content-small" style={{ minWidth: 320, maxWidth: 500 }}>
            <ResearchReflectionSettings onClose={() => setShowSettings(false)} />
          </div>
        </div>
      )}
      <label>날짜<br />
        <input type="date" name="date" value={log.date} onChange={handleChange} style={{ width: '100%' }} />
      </label><br /><br />
      <label>과제명<br />
        <input type="text" name="taskName" value={log.taskName} onChange={handleChange} style={{ width: '100%' }} />
      </label><br /><br />
      <label>과제 완료 여부<br />
        <select name="completed" value={log.completed} onChange={handleChange} style={{ width: '100%' }}>
          <option value="Y">Y</option>
          <option value="N">N</option>
        </select>
      </label><br /><br />
      <label>지연 행동(서술)<br />
        <textarea name="procrastination" value={log.procrastination} onChange={handleChange} rows={2} style={{ width: '100%' }} />
      </label><br /><br />
      <label>집중도 (1~5)<br />
        <input type="number" name="focus" min={1} max={5} value={log.focus} onChange={handleChange} style={{ width: '100%' }} />
      </label><br /><br />
      <label>피로감 (1~5)<br />
        <input type="number" name="fatigue" min={1} max={5} value={log.fatigue} onChange={handleChange} style={{ width: '100%' }} />
      </label><br /><br />
      <label>기타 관찰<br />
        <textarea name="notes" value={log.notes} onChange={handleChange} rows={2} style={{ width: '100%' }} />
      </label><br /><br />
      <button onClick={handleSave} style={{ width: '100%', padding: 10, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6 }}>저장</button>
      {saved && <div style={{ color: 'green', marginTop: 10 }}>저장되었습니다!</div>}
    </div>
  );
};

export default ResearchReflectionForm;
