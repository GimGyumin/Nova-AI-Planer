import React, { useState, useEffect } from 'react';
import { initFirebase, saveLogToFirestore } from './firebase';

type LogEntry = {
  id: string;
  date: string;
  task: string;
  completed: 'Y' | 'N';
  delay_desc: string;
  delay_minutes: number;
  focus: number;
  fatigue: number;
  notes: string;
  created_at: string;
};

const STORAGE_KEY = 'nova-research-logs-v2';
const ACCESS_PASSWORD = '1010';

const ResearchReflectionForm: React.FC = () => {
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [pw, setPw] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [cloudSave, setCloudSave] = useState<boolean>(false);
  const [cloudStatus, setCloudStatus] = useState<string>('');

  // form state
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [task, setTask] = useState('');
  const [completed, setCompleted] = useState<'Y'|'N'>('Y');
  const [delay_desc, setDelayDesc] = useState('');
  const [delay_minutes, setDelayMinutes] = useState<number>(0);
  const [focus, setFocus] = useState<number>(3);
  const [fatigue, setFatigue] = useState<number>(2);
  const [notes, setNotes] = useState('');

  useEffect(()=>{ const raw = localStorage.getItem(STORAGE_KEY); if(raw) setLogs(JSON.parse(raw)); }, []);
  useEffect(()=>{
    // Try to initialize firebase (noop if env not set)
    try{ initFirebase(); }catch(e){ /* ignore */ }
  }, []);

  // Nova 전체 localStorage 데이터 수집
  function getAllNovaData() {
    const result: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('nova-')) {
        try { result[k] = JSON.parse(localStorage.getItem(k) || 'null'); } catch { result[k] = localStorage.getItem(k); }
      }
    }
    return result;
  }

  const saveLogs = (next: LogEntry[]) => { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setLogs(next); };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const entry: LogEntry & { nova_data?: any } = {
      id: String(Date.now()),
      date, task, completed, delay_desc, delay_minutes, focus, fatigue, notes, created_at: new Date().toISOString(),
      nova_data: getAllNovaData()
    };
    const next = [...logs, entry];
    saveLogs(next);
    // If cloudSave enabled, attempt upload (fire-and-forget with feedback)
    if (cloudSave) {
      setCloudStatus('업로드 중...');
      saveLogToFirestore('research_logs', entry)
        .then(res => {
          setCloudStatus(`업로드 성공 (id: ${res.id})`);
          setTimeout(()=>setCloudStatus(''),3000);
        })
        .catch(err => {
          console.error(err);
          setCloudStatus('업로드 실패 (환경변수/네트워크 확인)');
        });
    }
    // reset some fields
    setTask(''); setDelayDesc(''); setDelayMinutes(0); setNotes('');
    alert('저장되었습니다.');
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], {type:'application/json;charset=utf-8'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `nova_research_logs_${new Date().toISOString().slice(0,10)}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if(!logs.length){ alert('내보낼 데이터가 없습니다.'); return; }
    const header = ['id','date','task','completed','delay_minutes','delay_desc','focus','fatigue','notes','created_at'];
    const rows = logs.map(l => header.map(h => `"${String((l as any)[h]||'').replace(/"/g,'""')}"`).join(','));
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `nova_research_logs_${new Date().toISOString().slice(0,10)}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  const handleClearAll = () => { if(!confirm('모든 연구 로그를 삭제하시겠습니까?')) return; saveLogs([]); };
  const handleDelete = (id:string) => { if(!confirm('이 항목을 삭제하시겠습니까?')) return; saveLogs(logs.filter(l=>l.id!==id)); };

  if(!authorized){
    return (
      <div style={{padding:24,fontFamily:'system-ui'}}>
        <h2>연구용 기록지 접근</h2>
        <p>연구용 기록지는 별도 보호되어 있습니다. 비밀번호를 입력하세요.</p>
        <div style={{maxWidth:360}}>
          <input placeholder="비밀번호" type="password" value={pw} onChange={e=>setPw(e.target.value)} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ccc'}} />
          <div style={{marginTop:12,display:'flex',gap:8}}>
            <button onClick={()=>{ if(pw===ACCESS_PASSWORD) { setAuthorized(true); } else alert('비밀번호가 틀렸습니다.'); }}>입력</button>
            <button className="secondary" onClick={()=>{ window.location.hash=''; window.location.href=window.location.pathname; }}>취소</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:20,fontFamily:'system-ui',maxWidth:900,margin:'0 auto'}}>
      <h2>연구용 자기 성찰 기록지</h2>
      <form onSubmit={handleSubmit} style={{display:'grid',gap:10}}>
        <div style={{display:'flex',gap:8}}>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{flex:1}} />
          <input placeholder="과제명" value={task} onChange={e=>setTask(e.target.value)} style={{flex:2}} />
          <select value={completed} onChange={e=>setCompleted(e.target.value as any)} style={{width:90}}>
            <option value="Y">Y</option><option value="N">N</option>
          </select>
        </div>
        <textarea placeholder="지연 행동(서술)" value={delay_desc} onChange={e=>setDelayDesc(e.target.value)} rows={2} />
        <div style={{display:'flex',gap:8}}>
          <input type="number" min={0} placeholder="시작 지연(분)" value={delay_minutes} onChange={e=>setDelayMinutes(parseInt(e.target.value||'0',10)||0)} style={{width:160}} />
          <input type="number" min={1} max={5} placeholder="집중도(1-5)" value={focus} onChange={e=>setFocus(parseInt(e.target.value||'0',10)||0)} style={{width:160}} />
          <input type="number" min={1} max={5} placeholder="피로감(1-5)" value={fatigue} onChange={e=>setFatigue(parseInt(e.target.value||'0',10)||0)} style={{width:160}} />
        </div>
        <textarea placeholder="기타 관찰 / Nova 사용 여부" value={notes} onChange={e=>setNotes(e.target.value)} rows={2} />
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button type="submit">저장</button>
          <button type="button" onClick={handleExportJSON} className="secondary">JSON 내보내기</button>
          <button type="button" onClick={handleExportCSV} className="secondary">CSV 내보내기</button>
          <button type="button" onClick={handleClearAll} className="secondary">전체 삭제</button>
          <label style={{marginLeft:8,fontSize:13}}>
            <input type="checkbox" checked={cloudSave} onChange={e=>setCloudSave(e.target.checked)} /> 클라우드 저장
          </label>
          {cloudStatus && <div style={{marginLeft:8,color:'#374151'}}>{cloudStatus}</div>}
        </div>
      </form>

      <h3 style={{marginTop:20}}>저장된 기록 ({logs.length})</h3>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr><th style={{borderBottom:'1px solid #ddd',padding:8}}>날짜</th><th style={{borderBottom:'1px solid #ddd',padding:8}}>과제</th><th style={{borderBottom:'1px solid #ddd',padding:8}}>완료</th><th style={{borderBottom:'1px solid #ddd',padding:8}}>지연분</th><th style={{borderBottom:'1px solid #ddd',padding:8}}>집중</th><th style={{borderBottom:'1px solid #ddd',padding:8}}>피로</th><th style={{borderBottom:'1px solid #ddd',padding:8}}>메모</th><th style={{borderBottom:'1px solid #ddd',padding:8}}>행동</th></tr></thead>
        <tbody>
          {logs.slice().reverse().map(l=> (
            <tr key={l.id}>
              <td style={{padding:8,borderTop:'1px solid #f0f0f0'}}>{l.date}</td>
              <td style={{padding:8}}>{l.task}</td>
              <td style={{padding:8}}>{l.completed}</td>
              <td style={{padding:8}}>{l.delay_minutes}</td>
              <td style={{padding:8}}>{l.focus}</td>
              <td style={{padding:8}}>{l.fatigue}</td>
              <td style={{padding:8}}>{l.notes}</td>
              <td style={{padding:8}}><button className="secondary" onClick={()=>handleDelete(l.id)}>삭제</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResearchReflectionForm;
