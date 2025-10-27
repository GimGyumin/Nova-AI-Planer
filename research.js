// research.js — standalone research logger script
const STORAGE_KEY = 'nova-research-logs-v1';

const form = document.getElementById('logForm');
const statusEl = document.getElementById('status');
const tableBody = document.querySelector('#logsTable tbody');
const pwModal = document.getElementById('pwModal');
const pwInput = document.getElementById('pwInput');
const pwSubmit = document.getElementById('pwSubmit');
const pwMsg = document.getElementById('pwMsg');

const ACCESS_PW = '1010';

function unlockIfPasswordStored(){
  const ok = sessionStorage.getItem('nova_research_pw_ok');
  if(ok === '1'){
    if(pwModal) pwModal.style.display = 'none';
    return true;
  }
  return false;
}

if(pwModal && !unlockIfPasswordStored()){
  // block form until password entered
  form.style.display = 'none';
  tableBody.parentElement.style.display = 'none';
  pwSubmit.addEventListener('click', ()=>{
    const v = (pwInput.value||'').trim();
    if(v === ACCESS_PW){
      sessionStorage.setItem('nova_research_pw_ok','1');
      pwModal.style.display = 'none';
      form.style.display = '';
      tableBody.parentElement.style.display = '';
    } else {
      pwMsg.textContent = '비밀번호가 틀렸습니다.';
    }
  });
} else {
  // already unlocked
  if(pwModal) pwModal.style.display = 'none';
}

function loadLogs(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){
    console.error(e);
    return [];
  }
}

function saveLogs(logs){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

function renderTable(){
  const logs = loadLogs();
  tableBody.innerHTML = '';
  logs.slice().reverse().forEach(log => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${log.date}</td><td>${escapeHtml(log.task||'')}</td><td>${log.completed}</td><td>${log.delay_minutes||''}</td><td>${log.focus||''}</td><td>${log.fatigue||''}</td><td>${escapeHtml(log.notes||'')}</td>`;
    tableBody.appendChild(tr);
  });
  statusEl.textContent = `총 ${logs.length}개 항목 저장됨 (로컬)`;
}

function escapeHtml(s){return (s||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const data = {
    date: document.getElementById('date').value || new Date().toISOString().split('T')[0],
    task: document.getElementById('task').value.trim(),
    completed: document.getElementById('completed').value,
    delay_desc: document.getElementById('delay_desc').value.trim(),
    delay_minutes: parseInt(document.getElementById('delay_minutes').value||'0',10) || 0,
    focus: parseInt(document.getElementById('focus').value||'0',10) || 0,
    fatigue: parseInt(document.getElementById('fatigue').value||'0',10) || 0,
    notes: document.getElementById('notes').value.trim(),
    created_at: new Date().toISOString()
  };

  const logs = loadLogs();
  logs.push(data);
  saveLogs(logs);
  renderTable();
  statusEl.textContent = '저장되었습니다.';
  setTimeout(()=>statusEl.textContent = `총 ${logs.length}개 항목 저장됨 (로컬)` ,1500);
  form.reset();
});

document.getElementById('exportBtn').addEventListener('click', ()=>{
  const logs = loadLogs();
  const blob = new Blob([JSON.stringify(logs, null, 2)], {type:'application/json;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nova_research_logs_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

document.getElementById('clearBtn').addEventListener('click', ()=>{
  if(!confirm('정말로 모든 연구 로그를 로컬에서 삭제합니까? 이 작업은 되돌릴 수 없습니다.')) return;
  localStorage.removeItem(STORAGE_KEY);
  renderTable();
  statusEl.textContent = '로그가 삭제되었습니다.';
});

document.getElementById('downloadCSV').addEventListener('click', ()=>{
  const logs = loadLogs();
  if(!logs.length) return alert('내보낼 로그가 없습니다.');
  const header = ['date','task','completed','delay_minutes','delay_desc','focus','fatigue','notes','created_at'];
  const rows = logs.map(l => header.map(h => `"${(l[h]||'').toString().replace(/"/g,'""')}"`).join(','));
  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `nova_research_logs_${new Date().toISOString().slice(0,10)}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

// initialize default date to today
document.getElementById('date').value = new Date().toISOString().slice(0,10);
renderTable();
