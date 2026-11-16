import '@fontsource/bricolage-grotesque/700.css';
import '@fontsource/noto-sans-tc/400.css';
import '@fontsource/noto-sans-tc/700.css';
import './style.css';
import runtime from '../public/editor-runtime.js?raw';
import {inspect,compile,preview} from './source.js';
const $=id=>document.getElementById(id);let source='',items=[],changes={},selected=null,editing=false,dirty=false,saved='',name='';
function message(s){$('message').textContent=s;}
let restoreState=null,checkpointResolve=null;
function checkpoint(){return new Promise(resolve=>{checkpointResolve=resolve;$('frame').contentWindow.postMessage({type:'checkpoint'},'*');});}
function render(state=null){restoreState=state;items=inspect(source);changes={};selected=null;$('add').disabled=$('remove').disabled=true;$('frame').srcdoc=preview(source,items,runtime);}
function mode(value){editing=value;$('formatbar').hidden=!value;$('edit').textContent=value?'完成編輯':'編輯';$('add').hidden=$('remove').hidden=!value;$('frame').contentWindow.postMessage({type:'mode',enabled:value},'*');}
function changed(){dirty=true;$('download').disabled=true;message('有未儲存的修改');}
function current(){return compile(source,items,changes);}
async function open(file){if(!file)return;if(dirty&&!confirm('目前有未儲存修改，確定開啟另一份檔案？'))return;try{source=await file.text();if(!source.trim())throw Error('請選擇有內容的 HTML 檔案。');name=file.name;dirty=false;saved='';editing=false;$('edit').textContent='編輯';$('add').hidden=$('remove').hidden=true;$('filename').textContent=name;$('start').hidden=true;$('workspace').hidden=false;$('share').hidden=true;$('download').disabled=true;render();message('');}catch(e){alert(e.message);}}
$('file').onchange=e=>open(e.target.files[0]);for(const type of ['dragover','drop'])document.addEventListener(type,e=>{e.preventDefault();$('start').classList.toggle('drag',type==='dragover');if(type==='drop')open(e.dataTransfer.files[0]);});document.addEventListener('dragleave',()=> $('start').classList.remove('drag'));
addEventListener('message',e=>{if(e.source!==$('frame').contentWindow||!e.data?.ihtml)return;const d=e.data;if(d.type==='checkpoint'){checkpointResolve?.(d.viewport);checkpointResolve=null;return;}if(d.type==='ready'){mode(editing);if(restoreState){$('frame').contentWindow.postMessage({type:'restore',viewport:restoreState.viewport,focusId:items.filter(i=>i.paragraph)[restoreState.focusIndex]?.id},'*');window.scrollTo(restoreState.outerX,restoreState.outerY);restoreState=null;}return;}if(d.type==='selection'){if(d.fontSize)$('font-size').value=d.fontSize;return;}if(d.type==='notice'){message(d.message);return;}const item=items.find(i=>i.id===d.id);if(!item)return;if(d.type==='select'){selected=item.id;$('add').disabled=$('remove').disabled=!item.paragraph;}if(d.type==='change'&&Array.isArray(d.values)&&d.values.length===item.segments.length&&d.values.every(v=>typeof v==='string'||(v&&Array.isArray(v.runs)))){changes[item.id]=d.values;changed();}});
$('edit').onclick=()=>mode(!editing);
$('add').onclick=async()=>{const viewport=await checkpoint();const index=items.filter(i=>i.paragraph).findIndex(i=>i.id===selected);const outerX=scrollX,outerY=scrollY;source=compile(source,items,changes,[],[{after:selected,text:''}]);render({viewport,focusIndex:index+1,outerX,outerY});changed();};
$('remove').onclick=async()=>{const viewport=await checkpoint();const outerX=scrollX,outerY=scrollY;source=compile(source,items,changes,[selected]);render({viewport,outerX,outerY});changed();};
$('save').onclick=async()=>{const html=current();$('save').disabled=true;message('儲存中…');try{const response=await fetch('/api/share',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({html,filename:name})});const result=await response.json();if(!response.ok)throw Error(result.error||'儲存失敗，請重試。');saved=html;source=html;dirty=false;render();$('download').disabled=false;$('link').value=result.url;$('expiry').textContent='有效至 '+new Date(result.expiresAt).toLocaleString('zh-TW');$('share').hidden=false;message('已儲存');}catch(e){message(e.message+' 修改仍保留在此頁。');}finally{$('save').disabled=false;}};
$('download').onclick=()=>{const url=URL.createObjectURL(new Blob([saved],{type:'text/html;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name||'presentation.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText($('link').value);message('已複製連結');}catch{$('link').select();message('請複製已選取的連結');}};addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});

function format(command,value){$('frame').contentWindow.postMessage({type:'format',command,value},'*');}
for(const button of document.querySelectorAll('[data-format],[data-color]')){button.addEventListener('pointerdown',e=>e.preventDefault());button.onclick=()=>format(button.dataset.format||'color',button.dataset.color);}
$('font-size').addEventListener('change',()=>{const value=Number($('font-size').value);if(!Number.isInteger(value)||value<1||value>100){message('請輸入 1 至 100 px 的字號。');return;}format('size',value);});
