'use strict';
// «Склепы: Защита подземелья» — ядро TD. Ассеты из «Багровых Склепов» (s/, a/, f/). Почта пользователя нигде не показывается.
(function(){
const cv=document.getElementById('c'),cx=cv.getContext('2d');
const PL=window.Platform||{},WEB=PL.id=='vk'||PL.id=='fs',B=window.AdBridge,AP=window.AppBridge,Q=new URLSearchParams(location.search);
let SLOT=56;try{if(B&&B.slotDp)SLOT=B.slotDp()||56}catch(e){}if(Q.has('scr'))SLOT=0;
let K=1,LH=640,FULL=640,T=0;
const IM={},NAMES='heroA heroW candle staff e_rats e_skel e_bat e_ghoul e_dknight e_golem b_bone t0_0 t0_4 t2_0 door coin gem ic_2 ui_nova logo_ru worldmap.jpg chest ic_0 ic_1 e_plague e_ghost e_necro ui_fire ui_ice tw_ballista tw_cauldron tw_totem tw_catapult tw_priest e_beetle e_cseg e_spider e_mage e_imp e_worm e_archer e_vamp e_hound e_leech e_garg b_abbot b_arch b_countess b_demon b_garg boss bg_floor1.jpg bg_path1.jpg map_bg.jpg e_chead b_spider b_plague b_lich'.split(' ');
let loaded=0;
function ld(key,src){const i=new Image();i.onload=i.onerror=()=>loaded++;i.src=src;IM[key]=i}
NAMES.forEach(n=>ld(n.split('.')[0],'s/'+(n.includes('.')?n:n+'.png')));
const CP=((window.CP_DATA||{}).games||[]).filter(g=>g.enabled||g.package=='ru.crypts.game').map(g=>Object.assign({},g,g.package=='ru.crypts.game'?{enabled:true}:{}));
CP.forEach(g=>ld('cp_'+g.package,'crosspromo/'+g.package+'.png'));
// ---------- save ----------
const DEF={stars:[],gems:0,up:{a:0,f:0,i:0,k:0,b:0,p:0,l:0,h:0,c:0},consent:null,pers:true,an:true,energy:5,enT:0,daily:0,chestAt:0,upT:{},mt:{gold:0,lives:0,nova:0,bounty:0},cats:{timers:true,rating:true,tournament:true,comeback:true,news:true},pAsked:0,nick:'',prov:'',snd:true,mus:true,kills:0,built:0,maxed:0,boss:0,wins:0};
let S;try{S=Object.assign({},DEF,JSON.parse(localStorage.getItem('td_save')||'{}'))}catch(e){S=Object.assign({},DEF)}
function save(){try{localStorage.setItem('td_save',JSON.stringify(S))}catch(e){}pushRem()}
// ---------- audio ----------
const SND={},sl={};const IMP={f:'fireHit',burn:0,i:'shield',l:'novaHit',p:'blood',pois:0,a:'hit1',b:'wallhit',h:'heal',c:'wallhit',k:'hit0',n:'novaHit'};
function snd(n,v){if(!S.snd)return;const t=performance.now();if(sl[n]&&t-sl[n]<70)return;sl[n]=t;try{const b=SND[n]||(SND[n]=new Audio('a/'+n+'.ogg'));const a=b.cloneNode();a.volume=v||.5;a.play().catch(()=>{})}catch(e){}}
let mus=null,musN='';function music(n){n=n||musN||'mus1';if(!S.mus){mus&&mus.pause();return}if(mus&&musN!=n){mus.pause();mus=null}musN=n;if(!mus){mus=new Audio('a/'+n+'.ogg');mus.loop=true;mus.volume=.3}mus.play().catch(()=>{})}
function ev(n,o){if(!S.an)return;try{AP&&AP.event&&AP.event(n,JSON.stringify(o||{}))}catch(e){}}
// ---------- ads: постоянный баннер в резервной полосе под полем + rewarded по желанию; interstitial только через RC ----------
function bannerOn(){try{if(B&&B.enabled()&&S.consent!=null&&!Q.has('noads'))B.banner(true)}catch(e){}}
const rcb={};window.__adPause=function(v){if(!v)setTimeout(bannerOn,300)};window.__adRewReady=function(){};
window.__adResult=function(k,ok){const c=rcb[k];delete rcb[k];if(c)c(!!ok);if(!ok)toast('Видео сейчас недоступно')};
function rewarded(k,cb){if(!B){toast('Демо: видео просмотрено');cb(true);return}try{if(!B.enabled()){cb(false);toast('Видео сейчас недоступно');return}rcb[k]=cb;B.showRewarded(k)}catch(e){cb(false)}}
function maybeInter(){try{if(B&&B.interstitialEnabled&&B.interstitialEnabled()&&S.wins%3==0)B.showInterstitial()}catch(e){}}

// ---------- онлайн (game_backend, game=sklepy_td): конверт {p,s}, HMAC игрока; регистрация подписывается натив-ключом ----------
const BASE='https://d5dkao4fh5oe83poui3n.d8epmcec.apigw.yandexcloud.net',GAME='sklepy_td';let ACC=null,OFF=0;try{ACC=JSON.parse(localStorage.getItem('td_onl')||'null')}catch(e){}
const now=()=>Math.floor(Date.now()/1000)+OFF,U8=x=>new TextEncoder().encode(x),hx=a=>Array.from(new Uint8Array(a),x=>x.toString(16).padStart(2,'0')).join('');
async function hmac(k,m){const key=await crypto.subtle.importKey('raw',U8(k),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hx(await crypto.subtle.sign('HMAC',key,U8(m)))}
async function call(a,d,gk,retry){const pl={a,g:GAME,pid:gk?'':ACC.pid,ts:now(),n:hx(crypto.getRandomValues(new Uint8Array(12))),d:d||{}},p=JSON.stringify(pl);
 const sg=gk?(WEB?'':String(AP.gsig(p)||'')):await hmac(ACC.sec,p);if(!sg&&!(gk&&WEB))throw new Error('nosig');
 const r=await fetch(BASE+'/v2/'+a,{method:'POST',body:JSON.stringify({p,s:sg}),headers:{'Content-Type':'text/plain'},cache:'no-store'});const j=await r.json().catch(()=>({}));
 if(r.status==401&&typeof j.now=='number'&&!retry&&Math.abs(j.now-now())>200){OFF+=j.now-now();return call(a,d,gk,1)}return{st:r.status,j}}
async function ensure(){if(ACC)return ACC;if(!WEB&&(!AP||!AP.gsig))throw new Error('offline');const r=await call('register',WEB?PL.reg():{},1);if(r.st!=200)throw new Error('reg '+r.st);
 ACC={pid:r.j.player_id,sec:r.j.secret};S.nick=r.j.nickname||'';save();localStorage.setItem('td_onl',JSON.stringify(ACC));return ACC}
// покупки VK/OK/ФС: валюту начисляет сервер (платёжный callback) подарком, клиент забирает его на sync
function shopCfg(c){try{const o=typeof c==='string'?JSON.parse(c):c;if(o&&o.shop&&PL.applyShop)PL.applyShop(o.shop)}catch(e){}}
async function loadShop(){if(!PL.social)return;try{const r=await fetch(BASE+'/v2/config?game='+GAME,{cache:'no-store'});const j=await r.json();shopCfg(j.config)}catch(e){}}
async function gifts(){if(!WEB)return;const r=await onl('sync',{lang:'ru'});shopCfg(r.j&&r.j.config);S.gids=S.gids||[];for(const g of(r.j&&r.j.gifts)||[]){if(S.gids.includes(g.gid))continue;const c=await onl('claim',{kind:'gift',id:g.gid});
 let gr=null;try{gr=JSON.parse(c.j.grant)}catch(e){}if(c.st==200&&gr&&gr.reward){const n=gr.reward.gems|0;S.gems+=n;S.gids.push(g.gid);save();if(n){toast('+'+n+' 💎 — спасибо за покупку!');snd('gem',.6)}}}}
if(WEB)setTimeout(gifts,4000);
const AN={play_sec:0,ads_watched:0,kills:0,waves:0,levels_won:0,bosses:0,towers_built:0,gold_earned:0};let anT=0;
window.__adImp=function(t){AN.ads_watched++};
function anFlush(){const st={};let any=0;for(const k in AN){if(AN[k]>0){st[k]=Math.round(AN[k]);any=1}AN[k]=0}if(!any)return;if(st.play_sec)ev('play_time',{sec:st.play_sec});onl('progress',{stats:st})}
setInterval(()=>{if(document.hidden)return;AN.play_sec++;if(++anT>=60){anT=0;anFlush()}if(typeof scr!='undefined'&&scr!='play'&&musN&&musN!='mus1'&&!first)music('mus1')},1000);
async function onl(a,d){try{await ensure();return await call(a,d)}catch(e){return{st:0,j:{}}}}
loadShop();
let LB=null;async function loadLB(){try{const r=await fetch(BASE+'/v2/top?game='+GAME+'&board=stars&period=all&limit=20',{cache:'no-store'});const j=await r.json();LB=j.top||j.rows||j.items||[]}catch(e){}}
function sendScore(){if(AP&&AP.gsig)onl('score',{board:'stars',score:starsTotal(),duration:0})}
// VK ID: нативный OneTap → код (PKCE) → vk_link на сервере; клиент знает только ник
window.__vkResult=async function(js){let r={};try{r=JSON.parse(js)}catch(e){}if(!r.ok){if(r.err!='cancel')toast('Не удалось войти');return}
 const x=await onl('vk_link',{code:r.code,code_verifier:r.code_verifier,device_id:r.device_id,state:r.state});
 if(x.st!=200||!x.j.ok){toast('Ошибка входа — попробуйте позже');return}if(x.j.switched&&x.j.secret){ACC={pid:x.j.player_id,sec:x.j.secret};localStorage.setItem('td_onl',JSON.stringify(ACC))}
 S.nick=x.j.nickname||S.nick;S.prov='vk';save();ev('vk_login',{switched:!!x.j.switched});toast('Вход выполнен');sendScore();sendToken();loadLB()};
async function vkOut(){await onl('vk_unlink',{});S.prov='';save();toast('Вы вышли')}
// ---------- пуши ----------
const PB=window.PushBridge;const CATN=[['timers','Таймеры'],['rating','Рейтинг'],['tournament','Турниры'],['comeback','Напоминания'],['news','Новости']];
function perm(){try{return PB?PB.perm():'denied'}catch(e){return'denied'}}
function sendToken(){if(!PB||!AP||!AP.gsig)return;const tok=PB.token();if(!tok)return;const any=CATN.some(c=>S.cats[c[0]])&&perm()=='granted';
 onl('push_token',any?{token:tok,on:true,tz:-new Date().getTimezoneOffset(),cats:S.cats}:{token:tok,on:false})}
window.__pushToken=()=>sendToken();
window.__pushPerm=function(g){ev('push_permission',{granted:!!g});if(g)sendToken()};
window.__pushOpen=function(js){let o={};try{o=JSON.parse(js)}catch(e){}if(!o.type)return;ev('push_open',{type:o.type,source:o.source||'local'});onl('push_open',{type:o.type,source:o.source||'local'});
 if(o.type=='chest'||o.type=='daily'||o.type=='energy')scr='menu';else if(o.type=='upgrade')scr='up';else if(o.type=='rating')scr='lb'};
const RT={energy:['⚡ Энергия восстановлена','Новая волна у ворот — защита ждёт командира.'],chest:['Склепы: Защита подземелья','Сундук трофеев готов.'],daily:['Склепы: Защита подземелья','Ежедневная награда ждёт 🎁'],upgrade:['Склепы: Защита подземелья','🛡 Улучшение башни готово!']};
function pushRem(){if(!PB)return;try{const n=Date.now(),L=[];const add=(type,at)=>{if(at>n)L.push({type,at,title:RT[type][0],text:RT[type][1],ch:'timers'})};
 if(S.energy<MAXE)add('energy',S.enT+(MAXE-S.energy)*EREG);add('chest',S.chestAt);add('daily',S.daily);for(const k in S.upT)add('upgrade',S.upT[k]);PB.setReminders(JSON.stringify(L));PB.setCats(JSON.stringify(S.cats))}catch(e){}}
// ---------- таймеры: энергия, сундук трофеев, ежедневный подарок, улучшения ----------
const MAXE=5,EREG=20*60e3,CHEST=3*3600e3;
function tick(){const n=Date.now();if(S.energy<MAXE){if(!S.enT)S.enT=n;const g=Math.floor((n-S.enT)/EREG);if(g>0){S.energy=Math.min(MAXE,S.energy+g);S.enT=S.energy>=MAXE?0:S.enT+g*EREG;save()}}
 for(const k in S.upT)if(n>=S.upT[k]){S.up[k]++;delete S.upT[k];toast('Улучшение готово: '+TT[k].n);save()}}
function mmss(ms){ms=Math.max(0,ms);const m=Math.floor(ms/60e3),h=Math.floor(m/60);return h?h+'ч '+(m%60)+'м':m+':'+String(Math.floor(ms/1e3)%60).padStart(2,'0')}
// ---------- layout: поле на весь экран над полосой баннера, камера (пан/зум) ----------
let OX=0,OY=0,CW=0;function resize(){const d=devicePixelRatio||1,vw=innerWidth,h=innerHeight,w=window.AppBridge?vw:Math.min(vw,Math.floor(h*9/16));CW=w;OX=Math.floor((vw-w)/2);OY=0;cv.width=Math.round(w*d);cv.height=Math.round(h*d);cv.style.width=w+'px';cv.style.height=h+'px';cv.style.marginLeft=OX+'px';K=w*d/360;FULL=h*360/w;LH=(h-SLOT)*360/w;if(typeof G!='undefined'&&G)clampCam()}
addEventListener('resize',resize);
if(B&&B.slotDp)setInterval(()=>{try{const v=B.slotDp();if(v>0&&v!=SLOT){SLOT=v;resize()}}catch(e){}},1000);
// ---------- content ----------
const MW=11,CS0=360/MW;
const REG=[['Склепы Пепла','#2b1b1a','#6b5a4c','rgba(255,70,30,.35)'],['Костяные галереи','#26201c','#7a6e5c','rgba(230,220,190,.3)'],['Затопленные катакомбы','#16222a','#4c5e66','rgba(80,170,220,.35)'],['Паучьи норы','#1e1a22','#5a5260','rgba(200,200,220,.3)'],['Чумные погреба','#1c2416','#5a6644','rgba(140,220,60,.35)'],
 ['Ледяная гробница','#1a2230','#7088a0','rgba(160,220,255,.4)'],['Огненная бездна','#2c120c','#7a4430','rgba(255,120,20,.45)'],['Обитель некромантов','#1a1426','#56486c','rgba(170,90,255,.4)'],['Кровавый собор','#2a0c12','#6c3a40','rgba(255,30,60,.45)'],['Трон Тьмы','#0e0a10','#4a4048','rgba(255,215,90,.35)']].map(r=>{const sh=(c,k)=>'#'+c.slice(1).match(/../g).map(h=>Math.max(0,Math.min(255,parseInt(h,16)+k)).toString(16).padStart(2,'0')).join('');return{n:r[0],g:[r[1],sh(r[1],8),sh(r[1],-6)],p:[r[2],sh(r[2],-9),sh(r[2],8)],crack:r[3]}});
// враги: порядок появления по кампании (уровень, 0-based)
const ET={skel:{n:'Скелет',img:'e_skel',hp:30,sp:1,g:6,sz:.95,at:0},rats:{n:'Крысы',ab:'быстрые',img:'e_rats',hp:14,sp:1.6,g:4,sz:.75,dumb:1,at:1},
 bat:{n:'Мышь',ab:'летает',img:'e_bat',hp:20,sp:1.35,g:6,sz:.75,fly:1,dumb:1,at:3},plague:{n:'Чумной',ab:'делится',img:'e_plague',hp:55,sp:.8,g:8,sz:1,split:'rats',at:6},
 spider:{n:'Паук',ab:'опутывает башни',img:'e_spider',hp:40,sp:1.5,g:7,sz:.85,web:1,at:8},knight:{n:'Щитоносец',ab:'щит',img:'e_dknight',hp:100,sp:.7,g:14,sz:1.05,ar:2,sh:.6,at:11},
 beetle:{n:'Жук-рогач',ab:'ломает башни',img:'e_beetle',hp:120,sp:.6,g:14,sz:.95,ar:3,melee:9,at:14},ghost:{n:'Призрак',ab:'летает, мерцает',img:'e_ghost',hp:70,sp:.9,g:10,sz:1,fly:1,phase:1,at:17},
 cent:{n:'Многоножка',ab:'сегменты',img:'e_cseg',hp:32,sp:.85,g:5,sz:.8,cent:5,at:20},necro:{n:'Некромант',ab:'лечит',img:'e_necro',hp:80,sp:.75,g:14,sz:1,heal:1,at:24},
 mage:{n:'Чародей',ab:'бьёт башни издали',img:'e_mage',hp:75,sp:.75,g:14,sz:1,ranged:[2.6,14,3],at:28},golem:{n:'Голем',ab:'броня, ломает',img:'e_golem',hp:260,sp:.5,g:22,ar:5,sz:1.2,melee:10,at:33},
 imp:{n:'Бес',ab:'быстрый летун',img:'e_imp',hp:35,sp:1.9,g:7,sz:.8,fly:1,dumb:1,at:38},worm:{n:'Червь',ab:'зарывается',img:'e_worm',hp:110,sp:.8,g:13,sz:1,burrow:1,at:44},
 archer:{n:'Стрелок',ab:'обстрел башен',img:'e_archer',hp:65,sp:.85,g:12,sz:1,ranged:[3.2,7,1.8],at:50},vamp:{n:'Вампир',ab:'пьёт башни',img:'e_vamp',hp:140,sp:.9,g:18,sz:1,melee:10,drain:1,at:57},
 hound:{n:'Гончие',ab:'стая',img:'e_hound',hp:50,sp:1.7,g:6,sz:.85,pack:3,dumb:1,at:64},leech:{n:'Пиявка',ab:'крадёт золото',img:'e_leech',hp:90,sp:1,g:10,sz:.85,steal:15,at:71},
 garg:{n:'Горгулья',ab:'каменный летун',img:'e_garg',hp:180,sp:.8,g:20,sz:1.1,fly:1,ar:4,at:79},
 boss:{n:'Босс',img:'b_bone',hp:1300,sp:.4,g:150,ar:4,sz:1.9,boss:1}};
const EORD=Object.keys(ET).filter(k=>k!='boss').sort((a,b)=>ET[a].at-ET[b].at);
const BOSS=[['Костяной Привратник','b_bone',['stomp','summon']],['Аббат-отступник','b_abbot',['heal','summon']],['Утопленный Архонт','b_arch',['shield','stomp']],['Мать пауков','b_spider',['summon','web']],['Чумной Лорд','b_plague',['split','heal']],
 ['Ледяная Графиня','b_countess',['freeze','shield']],['Огненный Демон','b_demon',['stomp','rage']],['Король-Лич','b_lich',['summon','teleport']],['Каменная Горгулья','b_garg',['fly','stomp']],['Владыка Тьмы','b_countess',['summon','teleport','rage','shield']]];
const TT={a:{n:'Лучник',img:'heroA',c:50,r:2.6,d:9,rt:.55,col:'#f0e2b0',air:1,ds:'Быстро, бьёт летающих',u:0},k:{n:'Рыцарь',img:'heroW',c:90,r:1.45,d:26,rt:1.3,st:.45,col:'#d4a62a',ds:'Удар и оглушение',u:0},
 f:{n:'Жаровня',img:'candle',c:70,r:1.9,d:13,rt:1.2,sp:.9,col:'#ff7a20',ds:'Огонь по площади',u:2},i:{n:'Лёд',img:'staff',c:60,r:2.2,d:4,rt:.9,sl:1.6,col:'#8fdcff',air:1,ds:'Замедляет, по летающим',u:4},
 b:{n:'Баллиста',img:'tw_ballista',c:85,r:3.3,d:24,rt:1.6,col:'#e8c890',air:1,ds:'Болт пронзает всех на линии',u:9},p:{n:'Котёл яда',img:'tw_cauldron',c:75,r:1.8,d:5,rt:1,sp:.9,col:'#7cff4a',ds:'Ядовитая лужа',u:13},
 l:{n:'Тотем молний',img:'tw_totem',c:100,r:2.4,d:15,rt:1.1,col:'#7ab8ff',air:1,ds:'Цепная молния',u:19},h:{n:'Жрец',img:'tw_priest',c:90,r:2.2,d:0,rt:1,col:'#fff2a0',ds:'Чинит башни рядом',u:26},
 c:{n:'Катапульта',img:'tw_catapult',c:120,r:4.4,d:42,rt:2.7,sp:1.1,col:'#c8a070',ds:'Дальний залп, не близко',u:36}};
const TB={a:[{n:'Снайпер',ds:'дальше, ×2.6 урона',c:'#ffe08a'},{n:'Залп',ds:'3 цели сразу',c:'#ffb060'}],f:[{n:'Пекло',ds:'поджог, шире',c:'#ff4020'},{n:'Метеор',ds:'дальний взрыв',c:'#ffa020'}],
 i:[{n:'Мерзлота',ds:'заморозка',c:'#a0f0ff'},{n:'Буран',ds:'аура замедления',c:'#60a8ff'}],k:[{n:'Паладин',ds:'+25% башням рядом',c:'#ffd75a'},{n:'Берсерк',ds:'быстро по всем',c:'#ff4040'}],
 b:[{n:'Скорпион',ds:'×2 урон, сквозь броню',c:'#ffd090'},{n:'Многозарядная',ds:'3 болта веером',c:'#e0b070'}],p:[{n:'Мор',ds:'яд перекидывается',c:'#a0ff40'},{n:'Кислота',ds:'снимает броню',c:'#d0ff70'}],
 l:[{n:'Гроза',ds:'цепь на 6 целей',c:'#a0d0ff'},{n:'Шторм',ds:'оглушает',c:'#5090ff'}],h:[{n:'Святой',ds:'лечит вдвое, снимает оглушение',c:'#fff8c0'},{n:'Инквизитор',ds:'свет жжёт врагов',c:'#ffd040'}],
 c:[{n:'Валуны',ds:'шире, оглушает',c:'#d0b080'},{n:'Горшки огня',ds:'горящая земля',c:'#ff7030'}]};
const TK=['a','k','f','i','b','p','l','h','c'];
const tUnl=i=>TK.filter(k=>TT[k].u<=i);
// 100 уровней: 10 регионов × 10, раскладки процедурные (seed), каждый 10-й — босс
function genLevel(n){const rg=n/10|0,k=n%10,rnd=rng(n*7919+17),R=x=>rnd()*x|0,H=16+Math.min(8,rg)+(k%3)*2,boss=k==9;
 const ne=n<2?1:n<5?(1+(k%2)):Math.min(3,1+R(3)),routes=[];const ents=[];
 for(let e=0;e<ne;e++){let st;if(e>0&&n>=10&&rnd()<.4)st=rnd()<.5?[-1,2+R(H/3|0)]:[MW,2+R(H/3|0)];else st=[[5,2,8][e%3]+R(2)-(e?0:0),-1];ents.push(st)}
 const walk=(st,seed)=>{const r2=rng(seed),P=[st];let c=st[0],r=st[1];if(c<0||c>=MW){c=c<0?1+(r2()*3|0):MW-2-(r2()*3|0);P.push([c,r])}
  while(r<H-6){const nr=Math.min(H-5,r+3+(r2()*3|0));P.push([c,nr]);let nc=c;while(Math.abs(nc-c)<2||Math.abs(nc-c)>5)nc=1+(r2()*(MW-2)|0);P.push([nc,nr]);c=nc;r=nr}
  P.push([c,H-3]);P.push([5,H-3]);P.push([5,H-1]);return P.filter((p,i)=>!i||p[0]!=P[i-1][0]||p[1]!=P[i-1][1])};
 ents.forEach((st,e)=>{routes.push(walk(st,n*131+e*977+3))});if(n>=3&&ne<3&&k%3==1)routes.push(walk(ents[0],n*313+51));
 const waves=Math.min(16,7+Math.floor(n/12)+(k>6?1:0))+(boss?1:0);
 return{n:REG[rg].n+' '+(k+1),H,waves,hpm:(routes.length>1?.85:1)*(1+.3*Math.max(0,1-Math.abs(n-1.5)/1.2)-.18*Math.max(0,1-Math.abs(n-4)/1.5)-.15*Math.max(0,1-Math.abs(n-34)/4))*(1+n*.04+rg*.04+Math.max(0,n-40)*.03+.3*Math.max(0,1-n/4)+.3*Math.max(0,1-Math.abs(n-2)/1.5)-.12*Math.max(0,1-Math.abs(n-28)/14)),gold:Math.round((routes.length>1?1.35:1)*150*(1+n*.04+rg*.04)**.6*(.85+.15*Math.min(1,n/15))*(1+.2*Math.max(0,1-Math.abs(n-22)/18))),routes,boss,rg,bi:boss?rg:-1}}
const LV=Array.from({length:100},(_,n)=>genLevel(n));
// уровень 1 — вручную, простой
LV[0].routes=[[[5,-1],[5,3],[2,3],[2,8],[8,8],[8,13],[5,13],[5,17]]];LV[0].H=18;
function newAt(i){return{en:EORD.filter(k=>ET[k].at==i&&i>0),tw:TK.filter(k=>TT[k].u==i&&i>0)}}
function mt(k){return (S.mt&&S.mt[k])||0}
function tst(t){const b=TT[t.k],L=Math.min(t.l,2),m=(1+.1*(S.up[t.k]||0))*(t.buff||1);const o={r:(b.r+.25*L)*(zN(t,'rune')?1.2:1),d:b.d*(1+.55*L)*(t.l>=3?1.35:1)*m,rt:b.rt*(1-.08*L),sp:b.sp||0,air:b.air};
 if(t.l>=3){const q=t.k+t.br;if(q=='a0'){o.r*=1.6;o.d*=2.6;o.rt*=1.6;o.strong=1}if(q=='a1')o.multi=3;if(q=='f0'){o.burn=1;o.sp*=1.3}if(q=='f1'){o.r*=1.5;o.d*=2.2;o.sp=1.6;o.rt*=1.7;o.meteor=1}
  if(q=='i0'){o.d*=1.5;o.freeze=.25}if(q=='i1')o.aura=1;if(q=='k0'){o.d*=1.3;o.pal=1}if(q=='k1'){o.rt*=.55;o.cleave=1}
  if(q=='b0'){o.d*=2;o.apierce=1}if(q=='b1')o.fan=3;if(q=='p0')o.spread=1;if(q=='p1')o.acid=1;if(q=='l0')o.chain=6;if(q=='l1')o.stun=.5;if(q=='h0')o.heal2=1;if(q=='h1')o.holy=1;if(q=='c0'){o.sp*=1.5;o.stun=.6}if(q=='c1')o.fire=1}
 if(t.k=='l'&&!o.chain)o.chain=3;return o}
function upCost(t){return t.l>=2?Math.round(TT[t.k].c*2.2):Math.round(TT[t.k].c*.8*(t.l+1))}

// ---------- draw helpers ----------
let BT=[],toastT=0,toastS='';function toast(s){toastS=s;toastT=2.2}
function rr(x,y,w,h,r){cx.beginPath();if(cx.roundRect)cx.roundRect(x,y,w,h,r);else cx.rect(x,y,w,h)}
function txt(s,x,y,sz,col,al){cx.font=sz+'px AlegreyaSC, Georgia, serif';cx.fillStyle=col||'#ecd9a3';cx.textAlign=al||'center';cx.textBaseline='middle';cx.fillText(s,x,y)}
function wrap(s,x,y,mw,sz,lh,col){cx.font=sz+'px AlegreyaSC, Georgia, serif';const w=s.split(' ');let l='',n=0;for(const q of w){const t=l?l+' '+q:q;if(cx.measureText(t).width>mw&&l){txt(l,x,y+n*lh,sz,col);n++;l=q}else l=t}if(l)txt(l,x,y+n*lh,sz,col);return n+1}
function btn(x,y,w,h,label,fn,o){o=o||{};BT.push({x,y,w,h,fn});const g=cx.createLinearGradient(0,y,0,y+h);
 if(o.dis){g.addColorStop(0,'#3a2a2a');g.addColorStop(1,'#1e1414')}else if(o.alt){g.addColorStop(0,'#4a3420');g.addColorStop(1,'#24160e')}else{g.addColorStop(0,'#a3202f');g.addColorStop(1,'#4a0e1e')}
 cx.fillStyle=g;rr(x,y,w,h,7);cx.fill();cx.strokeStyle=o.dis?'#6a5a40':'#d4a62a';cx.lineWidth=2;cx.stroke();cx.strokeStyle='rgba(255,220,150,.18)';cx.lineWidth=1;rr(x+3,y+3,w-6,h-6,5);cx.stroke();
 txt(label,x+w/2,y+h/2+1,o.sz||18,o.dis?'#8a7a66':'#f6e0a8')}
function link(x,y,label,fn){txt(label,x,y,14,'#8d8780');const w=cx.measureText(label).width;cx.fillStyle='#8d8780';cx.fillRect(x-w/2,y+8,w,1);BT.push({x:x-w/2-14,y:y-14,w:w+28,h:28,fn})}
function panel(x,y,w,h){cx.fillStyle='rgba(22,9,12,.95)';rr(x,y,w,h,10);cx.fill();cx.strokeStyle='#d4a62a';cx.lineWidth=2;cx.stroke();cx.strokeStyle='rgba(212,166,42,.35)';cx.lineWidth=1;rr(x+6,y+6,w-12,h-12,7);cx.stroke()}
function fit(n,cx0,cy0,w,h,a){const i=IM[n];if(!i||!i.naturalWidth)return;const k=Math.min(w/i.naturalWidth,h/i.naturalHeight),W=i.naturalWidth*k,H=i.naturalHeight*k;if(a!=null)cx.globalAlpha=a;cx.drawImage(i,cx0-W/2,cy0-H/2,W,H);cx.globalAlpha=1}
const MAPN=[[338,890],[480,895],[193,786],[430,652],[484,580],[90,448],[485,448],[154,192],[428,222],[288,150]],RHUE=[[0,1,1],[25,.5,1.05],[180,1,1],[250,.9,.95],[80,1.1,1],[170,.6,1.15],[330,1.3,1],[240,1,.9],[320,1.4,.9],[0,.4,.7]],MC={};
function mapCv(r){if(MC[r])return MC[r];const i=IM.map_bg;if(!i||!i.naturalWidth)return null;const c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;const x=c.getContext('2d'),h=RHUE[r];x.filter='hue-rotate('+h[0]+'deg) saturate('+h[1]+') brightness('+h[2]+')';x.drawImage(i,0,0);return MC[r]=c}
function spr(n,x,y,h,a){const i=IM[n];if(!i||!i.naturalWidth)return;const w=h*i.naturalWidth/i.naturalHeight;if(a!=null)cx.globalAlpha=a;cx.drawImage(i,x-w/2,y-h,w,h);cx.globalAlpha=1}
function icon(n,x,y,s){const i=IM[n];if(i&&i.naturalWidth)cx.drawImage(i,x-s/2,y-s/2,s,s)}
function tog(x,y,w,label,val,fn){txt(label,x,y,16,'#ecd9a3','left');const sx=x+w-48;cx.fillStyle=val?'#7a1020':'#2a2224';rr(sx,y-12,48,24,12);cx.fill();cx.strokeStyle='#d4a62a';cx.lineWidth=1.5;cx.stroke();
 cx.fillStyle=val?'#f6e0a8':'#7a7068';cx.beginPath();cx.arc(val?sx+36:sx+12,y,9,0,7);cx.fill();BT.push({x,y:y-16,w,h:32,fn})}
function bg(dim){cx.fillStyle='#120609';cx.fillRect(0,0,360,FULL);const i=IM.t0_0;if(i&&i.naturalWidth){const w=72,h=w*i.naturalHeight/i.naturalWidth;for(let y=0;y<FULL;y+=h)for(let x=(Math.floor(y/h)%2)*-36;x<360;x+=w)cx.drawImage(i,x,y,w,h)}
 cx.fillStyle='rgba(8,2,4,'+(dim==null?.7:dim)+')';cx.fillRect(0,0,360,FULL);const g=cx.createRadialGradient(180,LH*.45,30,180,LH*.45,LH*.7);g.addColorStop(0,'rgba(122,16,32,.28)');g.addColorStop(1,'rgba(0,0,0,.55)');cx.fillStyle=g;cx.fillRect(0,0,360,FULL)}
function logo(y,sc){sc=sc||1;cx.save();cx.shadowColor='rgba(180,10,30,.9)';cx.shadowBlur=18;const g=cx.createLinearGradient(0,y-40*sc,0,y+50*sc);g.addColorStop(0,'#fff0b8');g.addColorStop(.5,'#e0a83a');g.addColorStop(1,'#8a5a14');
 cx.font=(54*sc)+'px AlegreyaSC, Georgia, serif';cx.textAlign='center';cx.textBaseline='middle';cx.fillStyle=g;cx.fillText('Склепы:',180,y-18*sc);cx.font=(29*sc)+'px AlegreyaSC, Georgia, serif';cx.fillText('Защита подземелья',180,y+30*sc);cx.restore();
 cx.strokeStyle='rgba(212,166,42,.7)';cx.lineWidth=1.5;cx.beginPath();cx.moveTo(60,y+56*sc);cx.lineTo(300,y+56*sc);cx.stroke();txt('◆',180,y+56*sc,12,'#c0182c')}
function title(s,y){txt(s,180,y||40,26,'#e9c46a')}
function back(fn){btn(10,12,44,36,'←',fn||(()=>scr='menu'),{alt:1,sz:20})}
function gemBox(){icon('gem',300,30,22);txt(''+S.gems,316,31,17,'#bfe3ff','left')}
function starsTotal(){return S.stars.reduce((a,b)=>a+(b||0),0)}
// ---------- game ----------
let selRg=0,notifNext=null,scr='splash',G=null,paused=false,spd=1,selLv=0,resetAsk=0;const cam={x:0,y:0,z:1};let shX=0,shY=0;
const HT=34;let HB=66,scrT=0,prevScr='';
const W2S=(x,y)=>[(x*CS0-cam.x)*cam.z+shX,(y*CS0-cam.y)*cam.z+shY];
function zMin(){return Math.max(1,LH/(G.H*CS0))}
function clampCam(){if(!G)return;cam.z=Math.min(2.2,Math.max(zMin(),cam.z));const vw=360/cam.z,vh=LH/cam.z;cam.x=Math.min(Math.max(0,cam.x),MW*CS0-vw);cam.y=Math.min(Math.max(-HT/cam.z,cam.y),G.H*CS0-vh+HB/cam.z)}
function expand(P){const out=[];for(let k=0;k<P.length-1;k++){let[c,r]=P[k];const[c2,r2]=P[k+1],dc=Math.sign(c2-c),dr=Math.sign(r2-r);while(c!=c2||r!=r2){if(r>=0&&c>=0&&c<MW)out.push([c,r]);c+=dc;r+=dr}}out.push(P[P.length-1]);return out}
function rng(s){return()=>(s=(s*16807)%2147483647)/2147483647}
function buildMap(){const L=G.L,pc=new Set();G.rc=L.routes.map(R=>{const cl=expand(R);cl.forEach(([c,r])=>pc.add(c+','+r));return cl});G.pc=pc;const h=L.routes[0];G.heart=h[h.length-1];
 G.ents=[...new Set(L.routes.map(R=>R[0].join(',')))];const rnd=rng(G.i*977+131),R=REG[L.rg||0],Z=48;
 G.block=new Set();G.deco=[];for(let k=0;k<G.H*.7;k++){const c=rnd()*MW|0,r=rnd()*G.H|0,key=c+','+r;let adj=0;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)if(pc.has((c+a)+','+(r+b)))adj=1;if(adj||G.block.has(key))continue;G.block.add(key);G.deco.push({c,r,k:rnd()<.5?'candle':rnd()<.5?'t0_4':'bones'})}
 const m=document.createElement('canvas');m.width=MW*Z;m.height=G.H*Z;const c=m.getContext('2d');
 for(let r=0;r<G.H;r++)for(let q=0;q<MW;q++){const x=q*Z,y=r*Z;if(pc.has(q+','+r)){c.fillStyle=R.p[(q*3+r*7)%3];c.fillRect(x,y,Z,Z);c.strokeStyle='rgba(40,26,20,.55)';c.lineWidth=2;
   for(const[a,b]of[[0,0],[1,0],[0,1],[1,1]])c.strokeRect(x+2+a*Z/2,y+2+b*Z/2,Z/2-3,Z/2-3);if(rnd()<.2){c.fillStyle='rgba(235,225,205,.75)';c.fillRect(x+rnd()*34+5,y+rnd()*34+5,9,3)}
   if(rnd()<.2){c.strokeStyle=R.crack;c.lineWidth=1.5;c.beginPath();c.moveTo(x+rnd()*Z,y+rnd()*Z);c.lineTo(x+rnd()*Z,y+rnd()*Z);c.stroke()}}
  else{c.fillStyle=R.g[(q*5+r*3)%3];c.fillRect(x,y,Z,Z);const v=rnd()*.06;c.fillStyle='rgba(255,230,210,'+v+')';c.fillRect(x+3,y+3,Z-8,Z-8);c.fillStyle='rgba(0,0,0,.35)';c.fillRect(x,y+Z-3,Z,3);c.fillRect(x+Z-3,y,3,Z);
   if(rnd()<.3){c.strokeStyle='rgba(0,0,0,.5)';c.lineWidth=1.3;c.beginPath();let a=x+rnd()*Z,b=y+rnd()*Z;c.moveTo(a,b);for(let n=0;n<3;n++){a+=rnd()*16-8;b+=rnd()*16-8;c.lineTo(a,b)}c.stroke()}
   if(rnd()<.06){c.fillStyle='rgba(120,16,28,.4)';c.beginPath();c.ellipse(x+24,y+24,8+rnd()*10,5+rnd()*6,rnd()*3,0,7);c.fill()}}}
 for(const k of pc){const[q,r]=k.split(',').map(Number),x=q*Z,y=r*Z;c.fillStyle='rgba(0,0,0,.5)';if(!pc.has(q+','+(r-1)))c.fillRect(x,y,Z,6);if(!pc.has((q-1)+','+r))c.fillRect(x,y,6,Z);c.fillStyle='rgba(0,0,0,.3)';if(!pc.has(q+','+(r+1)))c.fillRect(x,y+Z-3,Z,3);if(!pc.has((q+1)+','+r))c.fillRect(x+Z-3,y,3,Z)}
 for(const[nm,isP,al,op]of[['bg_floor1',0,.55,'multiply'],['bg_path1',1,.45,'overlay']]){const im=IM[nm];if(!im||!im.naturalWidth)continue;c.save();c.globalAlpha=al;c.globalCompositeOperation=op;c.beginPath();for(let r=0;r<G.H;r++)for(let q=0;q<MW;q++)if(pc.has(q+','+r)==!!isP)c.rect(q*Z,r*Z,Z,Z);c.clip();for(let y=0;y<m.height;y+=192)for(let x=0;x<m.width;x+=192)c.drawImage(im,x,y,192,192);c.restore()}
 const vg=c.createRadialGradient(m.width/2,m.height/2,m.width*.3,m.width/2,m.height/2,m.height*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.5)');c.fillStyle=vg;c.fillRect(0,0,m.width,m.height);G.mapCv=m}
function calcThreat(){G.threat=G.rc.map(cl=>{let s=0;for(const t of G.tw){const o=tst(t),dps=o.d/o.rt;for(const[c,r]of cl)if(Math.hypot(c-t.c,r-t.r)<=o.r)s+=dps}return s})}
function startLevel(i){const L=LV[i];HB=tUnl(i).length>5?100:66;G={i,L,H:L.H,spm:1+.25*Math.max(0,1-i/10)+.3*Math.max(0,1-i/4),tu:tUnl(i),pz:[],bolts:[],lives:15+2*mt('lives'),gold:Math.round(L.gold*(1+.1*mt('gold'))),wave:0,en:[],tw:[],pr:[],fx:[],pt:[],corpses:[],q:[],wt:0,cd:15,sel:null,place:null,ghost:null,cont:false,nova:0,kills:0,over:0,shake:0,intro:2.5};
 buildMap();mkZones(i);calcThreat();cam.z=1;clampCam();cam.x=0;cam.y=-HT;clampCam();paused=false;spd=1;scr='play';bannerOn();if(!first)music(L.boss?'mus7':'mus'+[2,3,4,5,6,0,2,3,4,5][L.rg]);ev('level_start',{lv:i+1});const nw=newAt(i);if(nw.tw.length)setTimeout(()=>toast('Новая башня: '+TT[nw.tw[0]].n),2600);else if(nw.en.length)setTimeout(()=>toast('Новый враг: '+ET[nw.en[0]].n+' — '+ET[nw.en[0]].ab),2600)}
function waveList(n){const L=G.L,i=G.i,un=EORD.filter(k=>ET[k].at<=i),nw=un.filter(k=>ET[k].at==i),rnd=rng(i*1000+n*37+5);
 const mix=Math.min(un.length,2+Math.floor(i/8)),pick=[];for(let k=0;k<mix;k++)pick.push(un[un.length-1-Math.floor(rnd()*Math.min(un.length,6+i/6))]);if(nw.length&&n>=3)pick.push(nw[0]);
 const cnt=Math.round((4+n*1.2)*(1+i*.006)*(1+1.1*Math.max(0,1-i/12))),out=[];let t=0;
 for(let k=0;k<cnt;k++){let ty=k<2&&n<3?'skel':pick[Math.floor(rnd()*pick.length)];if(ET[ty].fly&&rnd()<.4)ty='skel';if(ET[ty].cent)k+=3;else if(ET[ty].pack)k+=1;out.push({ty,at:t,ent:G.ents[k%G.ents.length]});t+=(ty=='rats'||ty=='hound'?.45:ty=='cent'?2.2:.9)*(.8+.2*Math.min(1,i/10))}
 if(n==L.waves){if(L.boss)out.push({ty:'boss',at:t+1.5,ent:G.ents[0]});else{const gp=un.filter(x=>!ET[x].fly&&ET[x].hp>=80);for(let k=0;k<2;k++)out.push({ty:gp.length?gp[gp.length-1]:'skel',at:t+1+k,ent:G.ents[k%G.ents.length]})}}return out}
function startWave(){G.wave++;AN.waves++;G.q=waveList(G.wave);G.wt=0;snd(G.wave==G.L.waves?'roar':'door',.5);toast('Волна '+G.wave+(G.wave==G.L.waves?' — последняя!':''))}
function mkEn(ty,pts,seg,x,y,hpm){const e=ty=='boss'&&G.L.bi>=0?Object.assign({},ET.boss,{n:BOSS[G.L.bi][0],img:BOSS[G.L.bi][1],mech:BOSS[G.L.bi][2],fly:BOSS[G.L.bi][2].includes('fly')}):ET[ty],hp=e.hp*hpm*(ty=='boss'?1+G.L.rg*.35:1);return{ty,e,hp,mhp:hp,sh:e.sh?hp*e.sh:0,msh:e.sh?hp*e.sh:0,pts,seg,x,y,dist:0,sl:0,st:0,ph:Math.random()*6,fl:0,dir:1,hc:2.5,pc:Math.random()*4,burn:0,bp:0,bt:0}}
function spawn(ty,ent){const e=ET[ty],hm=(e.boss?G.L.hpm*.55:G.L.hpm*(1+(.06+.05*Math.max(0,1-G.i/8))*(G.wave-1)))*(e.at==G.i&&!e.boss?.7:1);let cand=G.L.routes.map((R,i)=>i).filter(i=>G.L.routes[i][0].join(',')==ent);if(!cand.length)cand=[0];
 let ri=cand[0];if(cand.length>1)ri=e.dumb?cand[Math.random()*cand.length|0]:cand.reduce((a,b)=>G.threat[b]<G.threat[a]?b:a);const R=G.L.routes[ri];
 const P=e.fly?[R[0],G.heart]:R,n=e.cent||e.pack||1;let lead=null;for(let q=0;q<n;q++){const m=mkEn(ty,P,0,R[0][0]+.5,R[0][1]+.5-(e.cent?q*.55:q*.3),hm*(e.cent&&q==0?1.6:1));m.delay=e.cent?q*.55/e.sp:q*.25;if(e.cent){m.head=q==0;m.lead=lead;lead=m}G.en.push(m)}}
function spawnAt(ty,f,k){const n=mkEn(ty,f.pts,f.seg,f.x+(Math.random()-.5)*.6,f.y+(Math.random()-.5)*.6,ty=='boss'?.18:(f.mhp/f.e.hp)*(ty=='rats'?.6:.5));if(ty=='boss'){n.small=1;n.e=Object.assign({},n.e,{sz:1.2,mech:['rage']})}n.dist=f.dist-.1*k;G.en.push(n);return n}
function shake(v){G.shake=Math.min(1.2,Math.max(G.shake,v))}
function P2(o){G.pt.push(Object.assign({vx:0,vy:0,g:0,l:.5,m:.5,col:'#fff',a:1,s:2},o));o.m=o.l}
function vfx(k,x,y){const R=Math.random,n=(a,b)=>a+R()*(b-a);
 if(k=='f'||k=='burn'||k=='c'&&0){P2({ty:'flash',x,y,l:.22,m:.22,col:'255,150,40',s:.9});for(let i=0;i<10;i++){const a=R()*6.28,v=n(1,3.2);P2({ty:'spark',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1,g:-1.5,l:n(.3,.7),col:R()<.5?'#ffd27a':'#ff7a20',s:2})}for(let i=0;i<3;i++)P2({ty:'smoke',x:x+n(-.2,.2),y,vy:-.6,l:n(.6,1),col:'40,30,30',s:.25,a:0})}
 else if(k=='i'){P2({ty:'flash',x,y,l:.18,col:'170,230,255',s:.7});for(let i=0;i<8;i++){const a=i*.785+n(-.2,.2),v=n(2,3.5);P2({ty:'shard',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:3,l:n(.25,.45),col:'#e8fbff',s:2})}for(let i=0;i<5;i++)P2({x:x+n(-.3,.3),y:y+n(-.3,.3),vy:.3,l:n(.5,.9),col:'#bfefff',s:1.6})}
 else if(k=='l'){P2({ty:'star',x,y,l:.15,col:'200,225,255',s:.8});for(let i=0;i<7;i++){const a=R()*6.28,v=n(3,5.5);P2({ty:'spark',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:n(.12,.25),col:'#d8ecff',s:1.6})}}
 else if(k=='p'||k=='pois'){for(let i=0;i<6;i++){const a=-Math.PI*n(.15,.85),v=n(1,2.4);P2({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:7,l:n(.3,.55),col:'#8cff4a',s:2.2})}for(let i=0;i<3;i++)P2({ty:'bub',x:x+n(-.25,.25),y,vy:-n(.3,.7),l:n(.5,.9),col:'140,255,90',s:n(.06,.12)})}
 else if(k=='a'||k=='b'){P2({ty:'streak',x,y,vx:n(-.5,.5),l:.12,col:'#fff6d8',s:2});for(let i=0;i<5;i++){const a=-Math.PI*n(.1,.9),v=n(.6,1.6);P2({x,y:y+.25,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:4,l:n(.3,.5),col:'#9a8466',s:1.8,a:0})}}
 else if(k=='h'){P2({ty:'pillar',x,y,l:.45,col:'255,240,170',s:.5});P2({ty:'flash',x,y,l:.3,col:'255,240,170',s:.8})}
 else if(k=='k'||k=='n'){P2({ty:'flash',x,y,l:.15,col:k=='n'?'190,130,255':'255,240,200',s:.6});for(let i=0;i<5;i++){const a=R()*6.28,v=n(1.5,3);P2({ty:'spark',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.2,col:'#fff0c0',s:1.6})}}
 else if(k=='c'){P2({ty:'flash',x,y,l:.25,col:'255,200,120',s:1.2});for(let i=0;i<12;i++){const a=R()*6.28,v=n(1,3);P2({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1.5,g:8,l:n(.4,.8),col:R()<.5?'#6a5440':'#8a7058',s:2.6,a:0})}for(let i=0;i<4;i++)P2({ty:'smoke',x:x+n(-.4,.4),y,vy:-.4,l:n(.8,1.2),col:'90,75,60',s:.35,a:0})}}
function part(x,y,col,n,life,add,sp){for(let i=0;i<n;i++){const a=Math.random()*6.28,v=(sp||1.5)*(.4+Math.random());G.pt.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(add?0:1),g:add?0:6,l:(life||.5)*(.6+Math.random()*.6),m:life||.5,col,a:add,s:add?2.5:2})}}
function num(e,v,col){if(v<2&&Math.random()<.7)return;G.fx.push({k:'num',x:e.x+(Math.random()-.5)*.4,y:e.y-e.e.sz*.9,s:''+Math.round(v),t:0,col:col||'#fff'})}
function dmg(e,d,k,ap){if(e.hp<=0||e.inv||e.bur)return;if(e.bsh>0){if(Math.random()<.2)G.fx.push({k:'num',x:e.x,y:e.y-1.5,s:'щит',t:0,col:'#e8d7a0'});return}let v=Math.max(1,d-(ap?0:Math.max(0,(e.e.ar||0)-(e.acid||0))));
 if(e.sh>0){const a=Math.min(e.sh,v);e.sh-=a;v-=a;part(e.x,e.y-.5,'#7fc8ff',2,.3,1);if(e.sh<=0){part(e.x,e.y-.5,'#a0d8ff',10,.5,1,2.5);snd('shield',.4)}}
 e.hp-=v;e.fl=.09;if(!e.vt||T-e.vt>.12){e.vt=T;vfx(k,e.x,e.y-.45);if(IMP[k])snd(IMP[k],.18)}num(e,v+(e.sh>0?0:0),k=='burn'?'#ffae60':v>=30?'#ffd75a':'#fff');if(k=='i'){e.sl=Math.max(e.sl,TT.i.sl)}
 if(e.hp>0&&Math.random()<.25)snd(e.ty=='skel'?'skelHurt':'monHurt',.22)}
function kill(e){const g=Math.round(e.e.g*1.5*G.L.hpm**.55*(.7+.3*Math.min(1,G.i/10))*(1+.05*mt('bounty')));G.gold+=g;G.kills++;AN.kills++;AN.gold_earned+=g;if(e.e.boss)AN.bosses++;S.kills++;if(e.e.boss){S.boss=1;shake(1.2)}G.fx.push({k:'txt',x:e.x,y:e.y-.9,s:'+'+g,t:0});
 part(e.x,e.y-.4,'#e8dcc0',7,.7,0,2.2);part(e.x,e.y-.4,'#8a1020',6,.6,0,1.8);part(e.x,e.y-.4,'#ff5030',4,.35,1);G.corpses.push({e:e.e,x:e.x,y:e.y,dir:e.dir,t:0});
 snd(e.ty=='skel'||e.ty=='boss'?'skelDie':e.ty=='bat'?'batDie':'monDie',.4);if(e.e.split)for(let k=0;k<2;k++)spawnAt(e.e.split,e,k);if(e.pois>0&&e.pspread)for(const o of G.en)if(o!=e&&o.hp>0&&Math.hypot(o.x-e.x,o.y-e.y)<1.3){o.pois=3;o.pp=e.pp;o.pspread=1}for(const o of G.en)if(o.lead==e){o.lead=null;if(!o.head){o.head=true;o.fl=.2}}
 if(e.e.boss&&e.e.mech&&e.e.mech.includes('split')&&!e.small)for(let k=0;k<2;k++){const m=spawnAt('boss',e,k);}}
function bossAI(e,dt){const M=e.e.mech||['stomp','summon'],has=m=>M.includes(m);e.bt2=(e.bt2==null?5:e.bt2)-dt;
 if(e.bt2<=0&&e.st<=0){e.bt2=8-(e.rage?3:0);shake(.7);snd('roar',.6);
  if(has('stomp')){G.fx.push({k:'shock',x:e.x,y:e.y,t:0,d:.7});for(const t of G.tw)if(Math.hypot(t.c+.5-e.x,t.r+.5-e.y)<2.4){t.stun=1.5;t.hp-=10}}
  if(has('freeze'))for(const t of G.tw)if(Math.hypot(t.c+.5-e.x,t.r+.5-e.y)<3){t.stun=2.2;part(t.c+.5,t.r+.3,'#bfefff',6,.5,1,1.5)}
  if(has('web'))for(const t of G.tw)if(Math.random()<.35){t.web=3}
  if(has('heal')){e.hp=Math.min(e.mhp,e.hp+e.mhp*.06);G.fx.push({k:'heal',x:e.x,y:e.y,t:0,d:.6})}
  if(has('teleport')&&e.seg<e.pts.length-3){part(e.x,e.y-.5,'#a060ff',14,.6,1,2);e.seg++;e.x=e.pts[e.seg][0]+.5;e.y=e.pts[e.seg][1]+.5;part(e.x,e.y-.5,'#a060ff',14,.6,1,2)}}
 const f=e.hp/e.mhp;if((!e.p1&&f<.66)||(!e.p2&&f<.33)){if(f<.66)e.p1=1;if(f<.33){e.p2=1;if(has('rage')||has('stomp'))e.rage=1}if(has('shield'))e.bsh=3;toast(e.e.n+' зовёт подмогу!');
  if(has('summon')){const un=EORD.filter(k=>ET[k].at<=G.i&&!ET[k].cent);for(let k=0;k<5;k++)spawnAt(un[Math.random()*un.length|0],e,k)}else for(let k=0;k<3;k++)spawnAt('skel',e,k);shake(.7)}
 if(e.bsh>0)e.bsh-=dt}
function impact(p){const o=p.o,e=p.e;if(p.k=='c'){for(const x of G.en)if(x.hp>0&&!x.e.fly&&Math.hypot(x.x-p.lx,x.y-p.ly)<=o.sp){dmg(x,o.d,'c');if(o.stun&&!x.e.boss)x.st=Math.max(x.st,o.stun)}if(o.fire)G.pz.push({x:p.lx,y:p.ly,r:o.sp,t:4,d:o.d*.25,k:'fire'});G.fx.push({k:'boom',x:p.lx,y:p.ly,t:0,r:o.sp,d:.5});part(p.lx,p.ly,'#8a6a4a',14,.7,0,2.5);part(p.lx,p.ly,'#ffd090',6,.3,1,2);shake(.3);snd('fireHit',.35);return}
 if(p.k=='p'){G.pz.push({x:p.lx,y:p.ly,r:o.sp,t:3,d:o.d,k:'pois',sp:o.spread,acid:o.acid});part(p.lx,p.ly,'#7cff4a',8,.5,1,1.6);snd('chain',.2);return}
 if(p.k=='f'){const R=o.sp;for(const x of G.en)if(x.hp>0&&!x.e.fly&&Math.hypot(x.x-p.lx,x.y-p.ly)<=R){dmg(x,x==e?o.d:o.d*.6,'f');if(o.burn){x.burn=3;x.bp=o.d*.35}}
  G.fx.push({k:'boom',x:p.lx,y:p.ly,t:0,r:R,d:.5});part(p.lx,p.ly,'#ffb040',o.meteor?18:10,.5,1,o.meteor?3:2);part(p.lx,p.ly,'#5a3a2a',5,.6,0,1.5);shake(o.meteor?.45:.12);snd('fireHit',.3)}
 else{if(e.hp>0)dmg(e,o.d,p.k);if(p.k=='i'){if(o.freeze&&Math.random()<o.freeze&&!e.e.boss){e.st=Math.max(e.st,1);part(e.x,e.y-.4,'#d8f8ff',8,.5,1,1.5)}part(p.lx,p.ly-.3,'#bfefff',6,.35,1,1.8)}else part(p.lx,p.ly-.3,'#fff0c0',4,.25,1,1.6)}}
function step(dt){if(G.over)return;if(G.intro>0){G.intro-=dt;const vh=LH/cam.z;cam.y=-HT/cam.z+(G.H*CS0-vh+(HB+HT)/cam.z)*Math.min(1,Math.max(0,1-G.intro/2.5));clampCam()}
 if(G.q.length){G.wt+=dt;while(G.q.length&&G.q[0].at<=G.wt){const s=G.q.shift();spawn(s.ty,s.ent)}}
 else if(!G.en.length){if(G.wave>=G.L.waves)return win();if(G.cd<=0)G.cd=10;G.cd-=dt;if(G.cd<=0){G.cd=0;startWave()}}
 for(const t of G.tw)t.buff=1;for(const t of G.tw)if(t.l>=3&&t.k=='k'&&t.br==0)for(const u of G.tw)if(u!=t&&Math.hypot(u.c-t.c,u.r-t.r)<=2)u.buff=1.25;
 for(const z of G.pz){z.t-=dt;z.tk=(z.tk||0)-dt;if(z.tk<=0){z.tk=.5;for(const e of G.en)if(e.hp>0&&!e.e.fly&&Math.hypot(e.x-z.x,e.y-z.y)<=z.r){if(z.k=='pois'){e.pois=3;e.pp=z.d;if(z.sp)e.pspread=1;if(z.acid)e.acid=3}else dmg(e,z.d,'burn')}}}G.pz=G.pz.filter(z=>z.t>0);
 for(const t of G.tw){if(t.hp<=0&&!t.dead){t.dead=1;part(t.c+.5,t.r+.3,'#8a6a4a',16,.8,0,2.5);part(t.c+.5,t.r+.3,'#ffb040',8,.4,1,2);shake(.4);snd('error',.5);toast(TT[t.k].n+' разрушен!');if(G.sel==t)G.sel=null}if(t.web>0)t.web-=dt}G.tw=G.tw.filter(t=>!t.dead);
 for(const e of G.en){if(e.delay>0){e.delay-=dt;continue}e.ph+=dt*7*e.e.sp;if(e.pois>0){e.pois-=dt;e.ptk=(e.ptk||0)-dt;if(e.ptk<=0){e.ptk=.5;dmg(e,e.pp*.5,'pois',1);part(e.x,e.y-.4,'#7cff4a',2,.4,1,.6)}}if(e.acid>0&&e.pois<=0)e.acid=0;
  if(e.e.burrow){e.bc=(e.bc||0)+dt;const b=(e.bc%5)>3;if(b&&!e.bur)part(e.x,e.y,'#6a4a30',8,.5,0,1.5);e.bur=b}
  if(e.e.melee||e.e.ranged||e.e.web){const t0=nearT(e,e.e.ranged?e.e.ranged[0]:e.e.web?1.1:.95);e.atk=(e.atk||0)-dt;if(t0&&e.atk<=0){if(e.e.web){e.atk=5;t0.web=1.5;G.fx.push({k:'web',x:t0.c+.5,y:t0.r+.5,t:0,d:1.5})}else if(e.e.ranged){e.atk=e.e.ranged[2];e.cast=.5;G.bolts.push({x:e.x,y:e.y-.6,t:t0,d:e.e.ranged[1]*.4*G.L.hpm**.5,col:e.ty=='mage'?'#c070ff':'#ffe0a0'})}else{e.atk=1;t0.hp-=e.e.melee*.35*G.L.hpm**.5*(zN(t0,'ward')?.5:1);t0.hit=.15;e.lunge=.25;part(t0.c+.5,t0.r+.3,'#d8c8a8',3,.3,0,1.5);if(e.e.drain)e.hp=Math.min(e.mhp,e.hp+e.e.melee)}}if(t0&&e.e.melee&&!e.e.boss){e.lunge=Math.max(0,(e.lunge||0)-dt);continue}if(e.cast>0){e.cast-=dt;continue}}if(e.fl>0)e.fl-=dt;if(e.burn>0){e.burn-=dt;e.bt-=dt;if(Math.random()<.3)part(e.x,e.y-.5,'#ff8030',1,.3,1,.6);if(e.bt<=0){e.bt=.5;dmg(e,e.bp*.5,'burn')}}
  if(e.e.heal){e.hc-=dt;if(e.hc<=0){e.hc=2.5;let any=0;for(const o of G.en)if(o!=e&&o.hp>0&&o.hp<o.mhp&&Math.hypot(o.x-e.x,o.y-e.y)<1.8){o.hp=Math.min(o.mhp,o.hp+o.mhp*.15);any=1;part(o.x,o.y-.6,'#60ff80',4,.5,1,1)}if(any)G.fx.push({k:'heal',x:e.x,y:e.y,t:0,d:.6})}}
  if(e.e.phase){e.pc+=dt;e.inv=(e.pc%4)>3.1}if(e.e.boss)bossAI(e,dt);
  if(e.st>0){e.st-=dt;continue}if(e.sl>0)e.sl-=dt;let rem=e.e.sp*(G.spm||1)*dt*(e.sl>0?.5:1)*(e.rage?1.6:1);const P=e.pts;
  while(rem>0&&e.seg<P.length-1){const tx=P[e.seg+1][0]+.5,ty=P[e.seg+1][1]+.5,d=Math.hypot(tx-e.x,ty-e.y);if(Math.abs(tx-e.x)>.01)e.dir=tx<e.x?-1:1;if(d<=rem){e.x=tx;e.y=ty;e.seg++;rem-=d;e.dist+=d}else{e.x+=(tx-e.x)/d*rem;e.y+=(ty-e.y)/d*rem;e.dist+=rem;rem=0}}
  if(e.e.cent&&!e.head&&e.lead&&e.lead.hp>0){}if(e.seg>=P.length-1){e.hp=0;e.gone=1;if(e.e.steal){G.gold=Math.max(0,G.gold-e.e.steal);toast('Пиявка украла золото!')}G.lives-=e.e.boss?(e.small?3:10):e.e.cent&&!e.head?0:e.e.hp>=100?2:1;shake(.5);snd('wallhit',.4);shake(e.e.boss?1:.35);snd('hurt',.6);G.fx.push({k:'ring',x:e.x,y:e.y,t:0,col:'#ff3040'})}}
 for(const b of G.bolts){const tx=b.t.c+.5,ty=b.t.r+.2,d=Math.hypot(tx-b.x,ty-b.y),v=7*dt;if(d<=v||b.t.dead){b.done=1;if(!b.t.dead){b.t.hp-=b.d*(zN(b.t,'ward')?.5:1);b.t.hit=.15;part(tx,ty,b.col,6,.35,1,1.6)}}else{b.x+=(tx-b.x)/d*v;b.y+=(ty-b.y)/d*v}}G.bolts=G.bolts.filter(b=>!b.done);
 for(const z of G.zn)if(z.k=='trap'){for(const e of G.en)if(e.hp>0&&!e.e.fly&&Math.hypot(e.x-z.c-.5,e.y-z.r-.5)<.8){e.sl=Math.max(e.sl||0,.25);z.tk=(z.tk||0)-dt;if(z.tk<=0){z.tk=.5;dmg(e,3*G.L.hpm**.7,'b')}}}else if(z.k=='ward')for(const t of G.tw)if(!t.dead&&t.hp<t.mhp&&Math.hypot(z.c-t.c,z.r-t.r)<=1.6)t.hp=Math.min(t.mhp,t.hp+3*dt);
 for(const t of G.tw){t.idle=(t.idle||Math.random()*6)+dt;if(t.hit>0)t.hit-=dt;if(t.web>0){t.cd=Math.max(t.cd,.2);continue}if(t.stun>0){t.stun-=dt;continue}
  if(t.k=='h'){const o=tst(t);t.cd-=dt;if(t.cd<=0){t.cd=1;let any=0;for(const u of G.tw)if(Math.hypot(u.c-t.c,u.r-t.r)<=o.r&&u.hp<u.mhp){u.hp=Math.min(u.mhp,u.hp+(8+4*t.l)*(o.heal2?2:1));if(o.heal2){u.stun=0;u.web=0}any=1;part(u.c+.5,u.r,'#fff2a0',3,.5,1,.8)}
   if(o.holy)for(const e of G.en)if(e.hp>0&&Math.hypot(e.x-t.c-.5,e.y-t.r-.5)<=o.r){dmg(e,10+6*t.l,'h');any=1}if(any){t.an=1;G.fx.push({k:'heal',x:t.c+.5,y:t.r+.5,t:0,d:.6})}}continue}t.cd-=dt;t.an=Math.max(0,(t.an||0)-dt*4);t.pop=Math.min(1,(t.pop||0)+dt*3);const o=tst(t),cx0=t.c+.5,cy0=t.r+.5;
  if(o.aura){t.at=(t.at||0)-dt;let any=0;for(const e of G.en)if(e.hp>0&&Math.hypot(e.x-cx0,e.y-cy0)<=o.r){e.sl=Math.max(e.sl,.3);any=1}if(t.at<=0&&any){t.at=.6;t.an=1;for(const e of G.en)if(e.hp>0&&Math.hypot(e.x-cx0,e.y-cy0)<=o.r)dmg(e,o.d*.6,'i')}continue}
  if(t.cd>0)continue;const inR=G.en.filter(e=>e.hp>0&&!e.inv&&!e.bur&&!(e.delay>0)&&(o.air||!e.e.fly)&&Math.hypot(e.x-cx0,e.y-cy0)<=o.r&&(t.k!='c'||Math.hypot(e.x-cx0,e.y-cy0)>=1.5));if(!inR.length)continue;
  inR.sort(o.strong?(a,b)=>b.hp-a.hp:(a,b)=>b.dist-a.dist);t.cd=o.rt;t.an=1;const tg=inR[0];t.face=tg.x<cx0?-1:1;
  if(t.k=='k'){const hs=o.cleave?inR.filter(e=>Math.hypot(e.x-tg.x,e.y-tg.y)<.9):[tg];for(const e of hs){dmg(e,o.d,'k');if(!e.e.boss)e.st=Math.max(e.st,TT.k.st)}G.fx.push({k:'slash',x:tg.x,y:tg.y-.3,t:0,d:.3});part(tg.x,tg.y-.3,'#fff3c0',5,.25,1,1.8);snd('swing'+(Math.random()*3|0),.3)}
  else if(t.k=='l'){let cur=tg,hit=[tg];for(let q=1;q<o.chain;q++){const nx=G.en.find(e=>e.hp>0&&!hit.includes(e)&&!e.bur&&Math.hypot(e.x-cur.x,e.y-cur.y)<1.6);if(!nx)break;hit.push(nx);cur=nx}let px=cx0,py=cy0-.9;hit.forEach((e,q)=>{dmg(e,o.d*(1-q*.1),'l');if(o.stun&&!e.e.boss)e.st=Math.max(e.st,o.stun);G.fx.push({k:'bolt',x:px,y:py,x2:e.x,y2:e.y-.4,t:0,d:.22});px=e.x;py=e.y-.4});snd('chain',.25)}
  else if(t.k=='b'){const an0=Math.atan2(tg.y-cy0,tg.x-cx0);for(const da of o.fan?[-.25,0,.25]:[0]){const an=an0+da,ex=cx0+Math.cos(an)*o.r,ey=cy0+Math.sin(an)*o.r;for(const e of G.en){if(e.hp<=0||e.bur)continue;const ux=e.x-cx0,uy=e.y-cy0,pr=ux*Math.cos(an)+uy*Math.sin(an),pd=Math.abs(-ux*Math.sin(an)+uy*Math.cos(an));if(pr>0&&pr<=o.r&&pd<.4)dmg(e,o.d,'b',o.apierce)}G.fx.push({k:'line',x:cx0,y:cy0-.4,x2:ex,y2:ey-.3,t:0,d:.25})}snd('swing0',.3)}
  else{for(const e of(o.multi?inR.slice(0,o.multi):[tg]))G.pr.push({x:cx0,y:cy0-.5,e,k:t.k,o,lx:e.x,ly:e.y,hx:[]});snd({a:'swing1',f:'fire',i:'chain',p:'potion',c:'rattle'}[t.k]||'swing0',.2)}}
 for(const p of G.pr){if(p.e.hp>0){p.lx=p.e.x;p.ly=p.e.y-.35}p.hx.push(p.x,p.y);if(p.hx.length>10)p.hx.splice(0,2);const d=Math.hypot(p.lx-p.x,p.ly-p.y),v=(p.k=='c'?4.5:p.k=='p'?6:p.k=='f'?(p.o.meteor?5:6.5):11)*dt;if(p.k=='c'||p.k=='p'){p.d0=p.d0||d;p.arc=Math.sin(Math.PI*Math.max(0,Math.min(1,1-d/p.d0)))*(p.k=='c'?1.6:.8)}
  if(p.k=='f'&&Math.random()<.7)part(p.x,p.y,'#ff9030',1,.3,1,.4);if(p.k=='i'&&Math.random()<.4)part(p.x,p.y,'#c8f4ff',1,.25,1,.4);
  if(d<=v){p.done=1;impact(p)}else{p.x+=(p.lx-p.x)/d*v;p.y+=(p.ly-p.y)/d*v}}
 G.pr=G.pr.filter(p=>!p.done);for(const e of G.en)if(e.hp<=0&&!e.dead){e.dead=1;if(!e.gone)kill(e)}G.en=G.en.filter(e=>!e.dead);
 for(const p of G.pt){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.g*dt;p.vx*=.97;p.l-=dt}G.pt=G.pt.filter(p=>p.l>0);if(G.pt.length>450)G.pt.splice(0,G.pt.length-450);
 for(const f of G.fx)f.t+=dt;G.fx=G.fx.filter(f=>f.t<(f.d||.8));for(const c of G.corpses)c.t+=dt;G.corpses=G.corpses.filter(c=>c.t<.5);if(G.nova>0)G.nova-=dt;G.shake=Math.max(0,G.shake-dt*2.5);
 if(G.lives<=0){G.lives=0;G.over=1;G.sel=null;G.place=null;scr='lose';snd('error',.6);ev('level_fail',{lv:G.i+1,wave:G.wave})}}
function win(){G.over=1;AN.levels_won=1;setTimeout(anFlush,50);G.sel=null;G.place=null;const ml=15+2*mt('lives'),st=G.lives>=ml*.85?3:G.lives>=ml*.45?2:1;G.stars=st;G.gems=5+st*5;G.dbl=0;S.stars[G.i]=Math.max(S.stars[G.i]||0,st);S.gems+=G.gems;S.wins++;if(!S.chestAt)S.chestAt=Date.now()+CHEST;save();sendScore();scr='win';G.ask=PB&&!S.pAsked&&perm()=='default';snd('fanfare',.6);ev('level_win',{lv:G.i+1,stars:st});maybeInter()}
function nova(){if(G.nova>0||!G.en.length)return;G.nova=25;for(const e of G.en)dmg(e,35*(1+.15*G.wave)*(1+.2*mt('nova')),'n');G.fx.push({k:'nova',x:0,y:0,t:0,d:.7});shake(.6);snd('nova',.6)}
function callWave(){if(G.q.length||G.en.length||G.wave>=G.L.waves)return;const b=Math.ceil(G.cd)*2;G.gold+=b;G.cd=0;startWave()}
function nearT(e,r){let b=null,bd=r;for(const t of G.tw){const d=Math.hypot(t.c+.5-e.x,t.r+.5-e.y);if(d<bd){bd=d;b=t}}return b}
const towerAt=(c,r)=>G.tw.find(t=>t.c==c&&t.r==r);
const ZT={rune:{n:'Рунный круг',u:7,col:'120,170,255',ds:'башни рядом бьют дальше'},ward:{n:'Святой оберег',u:14,col:'255,225,140',ds:'башни рядом получают меньше урона и лечатся'},trap:{n:'Баррикада с шипами',u:21,col:'255,110,70',ds:'замедляет и ранит врагов'}};
function mkZones(i){G.zn=[];const R=rng(i*7919+13),pc=[...G.pc].map(v=>v.split(',').map(Number)),n=i>=50?2:1;
 const free=[];for(let c=0;c<MW;c++)for(let r=1;r<G.H-1;r++)if(canBuild(c,r)&&pc.some(([a,b])=>Math.abs(a-c)+Math.abs(b-r)==1))free.push([c,r]);
 for(const k of['rune','ward','trap'])if(i>=ZT[k].u)for(let j=0;j<n;j++){if(k=='trap'){const q=pc[Math.floor(pc.length*(.35+.3*R()))];if(q)G.zn.push({k,c:q[0],r:q[1]})}else if(free.length){const q=free.splice(Math.floor(R()*free.length),1)[0];G.zn.push({k,c:q[0],r:q[1]});G.block.add(q[0]+','+q[1])}}
 for(const k in ZT)if(i==ZT[k].u)setTimeout(()=>toast('Новая зона: '+ZT[k].n+' — '+ZT[k].ds),1500)}
function zN(t,k){for(const z of G.zn||[])if(z.k==k&&Math.hypot(z.c-t.c,z.r-t.r)<=1.6)return 1;return 0}
function canBuild(c,r){return c>=0&&c<MW&&r>=0&&r<G.H&&!G.pc.has(c+','+r)&&!G.block.has(c+','+r)&&!towerAt(c,r)}
function build(c,r,k){AN.towers_built++;if(!canBuild(c,r)){snd('error',.4);toast('Здесь строить нельзя');return false}const cost=TT[k].c;if(G.gold<cost){snd('error',.4);toast('Мало золота');return false}
 G.gold-=cost;G.tw.push({c,r,k,l:0,br:null,cd:0,inv:cost,an:0,pop:0,face:1,hp:120,mhp:120});S.built++;calcThreat();snd('equip',.5);part(c+.5,r+.7,'#d4a62a',10,.5,1,1.6);shake(.08);return true}
function upgrade(t,br){if(t.l>=3)return;const c=upCost(t);if(G.gold<c){snd('error',.4);toast('Мало золота');return}if(t.l==2){if(br==null)return;t.br=br}G.gold-=c;t.inv+=c;t.l++;t.pop=0;t.mhp=120+60*t.l;t.hp=t.mhp;if(t.l==3)S.maxed++;calcThreat();snd('levelup',.5);part(t.c+.5,t.r+.4,t.l==3?TB[t.k][t.br].c:'#ffe08a',16,.7,1,2);G.sel=null}
function repair(t){const c=Math.ceil((t.mhp-t.hp)*.5);if(c<=0)return;if(G.gold<c){toast('Мало золота');snd('error',.4);return}G.gold-=c;t.hp=t.mhp;t.web=0;part(t.c+.5,t.r+.3,'#9fffa0',10,.5,1,1.5);snd('heal',.5)}
function goldAd(){if(Date.now()<(S.goldAt||0)){toast('Ещё '+Math.ceil((S.goldAt-Date.now())/1e3)+' с');return}rewarded('gold',ok=>{if(!ok)return;const v=80+G.i*6;G.gold+=v;S.goldAt=Date.now()+120e3;save();toast('+'+v+' золота');snd('coins',.6)})}
function sell(t){G.gold+=Math.floor(t.inv*.6);G.tw=G.tw.filter(x=>x!=t);G.sel=null;calcThreat();snd('coins',.5)}
function s2c(x,y){return[Math.floor((x/cam.z+cam.x)/CS0),Math.floor((y/cam.z+cam.y)/CS0)]}
function fieldTap(x,y){if(!G||G.over||paused||y<HT||y>LH-HB)return;if(G.sel&&y>LH-HB-112&&y<LH-HB)return;const[c,r]=s2c(x,y),t=towerAt(c,r);
 if(G.place){if(G.ghost&&G.ghost[0]==c&&G.ghost[1]==r){if(build(c,r,G.place)){G.last=G.place;G.ghost=null;if(G.gold<TT[G.place].c)G.place=null}return}
  if(canBuild(c,r)){G.ghost=[c,r];snd('click',.25);return}if(t){G.place=null;G.ghost=null;G.sel=t;return}toast('Только на свободной земле');G.ghost=null;return}
 if(t){G.sel=G.sel==t?null:t;snd('click',.3);return}if(G.sel){G.sel=null;return}if(canBuild(c,r)){G.place=G.last||'a';G.ghost=[c,r];snd('click',.25)}}
function revive(){G.lives=5;G.cont=true;G.over=0;G.en=G.en.filter(e=>e.seg<e.pts.length-3);scr='play';snd('heal',.6)}
// ---------- render ----------
const WH={};function white(n){if(WH[n])return WH[n];const i=IM[n];if(!i||!i.naturalWidth)return null;const c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;const x=c.getContext('2d');x.drawImage(i,0,0);x.globalCompositeOperation='source-in';x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);return WH[n]=c}
function sprT(n,x,y,h,o){const i=IM[n];if(!i||!i.naturalWidth)return;const w=h*i.naturalWidth/i.naturalHeight;cx.save();cx.translate(x,y);if(o.rot)cx.rotate(o.rot);cx.scale((o.flip||1)*(o.sx||1),o.sy||1);cx.globalAlpha=o.a==null?1:o.a;cx.drawImage(i,-w/2,-h,w,h);
 if(o.fl>0){const wi=white(n);if(wi){cx.globalAlpha=Math.min(1,o.fl*9)*.85;cx.drawImage(wi,-w/2,-h,w,h)}}cx.restore()}
let LC=null;
function drawTower(t,x,y,s,a){const L=t.l,col=t.l>=3?TB[t.k][t.br].c:TT[t.k].col;cx.globalAlpha=a==null?1:a;
 cx.fillStyle='rgba(0,0,0,.45)';cx.beginPath();cx.ellipse(x,y+s*.36,s*.44,s*.16,0,0,7);cx.fill();
 if(L>=2){const g=cx.createLinearGradient(x-s*.4,0,x+s*.4,0);g.addColorStop(0,'#3a2a22');g.addColorStop(.5,'#6a5444');g.addColorStop(1,'#2a1c16');cx.fillStyle=g;cx.fillRect(x-s*.36,y+s*.05,s*.72,s*.3);cx.fillStyle='#d4a62a';cx.fillRect(x-s*.36,y+s*.05,s*.72,2)}
 cx.fillStyle=L>=1?'#5a4434':'#3e2e24';cx.beginPath();cx.ellipse(x,y+s*.08,s*.38,s*.15,0,0,7);cx.fill();cx.strokeStyle=L>=1?'#d4a62a':'rgba(212,166,42,.4)';cx.lineWidth=L>=1?2:1;cx.stroke();
 if(L>=3){cx.save();cx.globalCompositeOperation='lighter';cx.strokeStyle=col;cx.lineWidth=2;cx.setLineDash([4,5]);cx.lineDashOffset=-T*20;cx.beginPath();cx.ellipse(x,y+s*.08,s*.46,s*.19,0,0,7);cx.stroke();cx.setLineDash([]);
  const gl=cx.createRadialGradient(x,y-s*.3,2,x,y-s*.3,s*.8);gl.addColorStop(0,col+'66');gl.addColorStop(1,col+'00');cx.fillStyle=gl;cx.fillRect(x-s,y-s*1.2,s*2,s*1.8);cx.restore()}
 const pop=t.pop==null?1:.6+.4*Math.min(1,t.pop),rec=(t.an||0),h=s*(t.k=='f'||t.k=='i'?.95:1.15)*(1+.1*Math.min(L,3))*pop;
 if(t.k=='f'){const fg=cx.createRadialGradient(x,y-h*.8,1,x,y-h*.8,s*.55);fg.addColorStop(0,'rgba(255,160,50,'+(.45+.2*Math.sin(T*9))+')');fg.addColorStop(1,'rgba(255,80,0,0)');cx.fillStyle=fg;cx.fillRect(x-s*.6,y-h*1.4,s*1.2,s*1.2)}
 if(t.k=='i'&&t.l>=3&&t.br==1){cx.fillStyle='rgba(120,190,255,'+(.08+.04*Math.sin(T*3))+')';cx.beginPath();cx.arc(x,y,tst(t).r*s,0,7);cx.fill()}
 if(t.k=='k'&&t.l>=3&&t.br==0){cx.strokeStyle='rgba(255,215,90,.25)';cx.lineWidth=1;cx.beginPath();cx.arc(x,y,2*s,0,7);cx.stroke()}
 const id=Math.sin((t.idle||0)*2.2)*.025;if(t.k=='p'&&Math.random()<.08&&G)part(t.c+.5+(Math.random()-.5)*.3,t.r+.1,'#7cff4a',1,.6,1,.4);if(t.k=='l'&&Math.random()<.05&&G)G.fx.push({k:'bolt',x:t.c+.5,y:t.r-.2,x2:t.c+.5+(Math.random()-.5)*.8,y2:t.r+(Math.random()-.5)*.6,t:0,d:.12});
 if(t.k=='h'){cx.save();cx.globalCompositeOperation='lighter';const hg=cx.createRadialGradient(x,y-h*.6,1,x,y-h*.6,s*.6);hg.addColorStop(0,'rgba(255,240,160,'+(.25+.15*Math.sin(T*3))+')');hg.addColorStop(1,'rgba(255,240,160,0)');cx.fillStyle=hg;cx.fillRect(x-s,y-h*1.4,s*2,s*1.6);cx.restore()}
 sprT(TT[t.k].img,x+(t.hit>0?(Math.random()-.5)*4:0),y+s*.15,h,{flip:t.face||1,sx:1+rec*.08-id,sy:1-rec*.1+id,a:a,rot:t.k=='k'?-rec*.25*(t.face||1):t.k=='c'?-rec*.15:0,fl:t.hit>0?t.hit:0});
 if(rec>.7&&t.k!='k'&&t.k!='h'){cx.save();cx.globalCompositeOperation='lighter';cx.globalAlpha=(rec-.7)*3;const mf=cx.createRadialGradient(x,y-h*.7,1,x,y-h*.7,s*.35);mf.addColorStop(0,'#fff');mf.addColorStop(1,TT[t.k].col+'00');cx.fillStyle=mf;cx.fillRect(x-s*.4,y-h*.7-s*.4,s*.8,s*.8);cx.restore()}
 if(t.web>0){cx.strokeStyle='rgba(235,235,235,.7)';cx.lineWidth=1;for(let q=0;q<6;q++){const an=q*1.05;cx.beginPath();cx.moveTo(x,y-h*.4);cx.lineTo(x+Math.cos(an)*s*.5,y-h*.4+Math.sin(an)*s*.5);cx.stroke()}cx.beginPath();cx.arc(x,y-h*.4,s*.3,0,7);cx.stroke()}
 if(t.hp<t.mhp){cx.fillStyle='#200';cx.fillRect(x-s*.35,y+s*.42,s*.7,3);cx.fillStyle=t.hp/t.mhp>.5?'#5fd16a':t.hp/t.mhp>.25?'#e0c040':'#e04040';cx.fillRect(x-s*.35,y+s*.42,s*.7*Math.max(0,t.hp/t.mhp),3)}cx.globalAlpha=a==null?1:a;
 if(L>=3){txt(['◆','✦'][t.br],x+s*.32,y-h+4,11,col)}for(let i=0;i<Math.min(L,2)+1;i++){cx.fillStyle='#e9c46a';cx.beginPath();cx.arc(x-5+i*5,y+s*.3,1.8,0,7);cx.fill()}
 if(t.stun>0)txt('✦✦',x,y-h-4,10,'#ffe680');cx.globalAlpha=1}
function drawEnemy(e,x,y,s){if(e.delay>0)return;if(e.bur){cx.fillStyle='rgba(60,40,25,.8)';cx.beginPath();cx.ellipse(x,y+s*.3,s*.35,s*.12,0,0,7);cx.fill();part(e.x,e.y+.3,'#5a3a20',Math.random()<.2?1:0,.4,0,.5);return}
 if(e.e.cent){const P=e.pts[Math.min(e.seg+1,e.pts.length-1)],an=Math.atan2(P[1]+.5-e.y,P[0]+.5-e.x)+Math.PI/2,w=Math.sin(e.ph)*.15;cx.fillStyle='rgba(0,0,0,.35)';cx.beginPath();cx.ellipse(x,y+3,s*.35,s*.2,0,0,7);cx.fill();sprT(e.head?'e_chead':'e_cseg',x,y+s*.42,s*(e.head?.95:.8),{rot:an+w+(e.head?Math.PI:0),fl:e.fl});if(e.head){cx.fillStyle='#ffd040';cx.beginPath();cx.arc(x+Math.cos(an-Math.PI/2)*s*.3,y+Math.sin(an-Math.PI/2)*s*.3,2.2,0,7);cx.fill()}if(e.hp<e.mhp){cx.fillStyle='#200';cx.fillRect(x-s*.3,y-s*.5,s*.6,3);cx.fillStyle='#c0182c';cx.fillRect(x-s*.3,y-s*.5,s*.6*e.hp/e.mhp,3)}return}
 const h=s*e.e.sz*(e.small?.6:1)*(e.cast>0?1.06:1),fly=e.e.fly,bob=fly?Math.sin(e.ph*1.3)*s*.12-s*.35:-Math.abs(Math.sin(e.ph))*s*.07,sq=Math.sin(e.ph*2)*.05;
 cx.fillStyle='rgba(0,0,0,'+(fly?.25:.4)+')';cx.beginPath();cx.ellipse(x,y+s*.36,h*(fly?.2:.3),h*.09,0,0,7);cx.fill();
 const a=e.inv?.35:1;if(e.cast>0){cx.save();cx.globalCompositeOperation='lighter';cx.fillStyle='rgba(190,110,255,.35)';cx.beginPath();cx.arc(x,y-h*.4,s*.4*(1+Math.sin(T*20)*.2),0,7);cx.fill();cx.restore()}
 sprT(e.e.img,x+(e.lunge>0?e.dir*s*.15*Math.sin(e.lunge*12):0),y+s*.38+bob,h,{flip:e.dir<0?-1:1,sx:fly?1:1+sq,sy:fly?1+Math.sin(e.ph*2.6)*.12:1-sq,rot:fly?0:Math.sin(e.ph)*.07,a,fl:e.fl});
 const top=y+s*.38+bob-h;
 if(e.sh>0){cx.strokeStyle='rgba(120,200,255,'+(.5+.2*Math.sin(T*6))+')';cx.lineWidth=2;cx.beginPath();cx.arc(x,top+h*.55,h*.48,0,7);cx.stroke()}
 if(e.bsh>0){cx.save();cx.globalCompositeOperation='lighter';cx.fillStyle='rgba(230,210,150,.18)';cx.beginPath();cx.arc(x,top+h*.55,h*.6,0,7);cx.fill();cx.restore()}
 if(e.sl>0&&!e.st){cx.fillStyle='rgba(120,200,255,.25)';cx.beginPath();cx.ellipse(x,y+s*.36,h*.32,h*.1,0,0,7);cx.fill()}if(e.st>0)txt('✦',x+Math.sin(T*8)*5,top-4,11,'#ffe680');
 if(e.e.heal){cx.strokeStyle='rgba(90,255,130,'+(.25+.15*Math.sin(T*4))+')';cx.lineWidth=1;cx.beginPath();cx.arc(x,y,1.8*s,0,7);cx.stroke()}
 if(e.hp<e.mhp||e.sh<e.msh){const w=e.e.boss?s*1.6:s*.7;cx.fillStyle='#200';cx.fillRect(x-w/2,top-5,w,4);cx.fillStyle='#c0182c';cx.fillRect(x-w/2,top-5,w*Math.max(0,e.hp/e.mhp),4);if(e.msh){cx.fillStyle='#6cb8ff';cx.fillRect(x-w/2,top-8,w*Math.max(0,e.sh/e.msh),2)}}}
function drawPlay(hud){const g=G;shX=(Math.random()-.5)*g.shake*10;shY=(Math.random()-.5)*g.shake*10;const z=cam.z,s=CS0*z;cx.fillStyle='#070304';cx.fillRect(0,0,360,LH);
 cx.drawImage(g.mapCv,-cam.x*z+shX,-cam.y*z+shY,MW*CS0*z,g.H*CS0*z);
 for(const R of g.rc){const[c,r]=R[0],[x,y]=W2S(c+.5,r+.5);const gl=cx.createRadialGradient(x,y,2,x,y,s*1.2);gl.addColorStop(0,'rgba(200,30,40,.35)');gl.addColorStop(1,'rgba(200,0,0,0)');cx.fillStyle=gl;cx.fillRect(x-s*1.2,y-s*1.2,s*2.4,s*2.4);spr('door',x,y+s*.5,s*1.1,.9)}
 const[hx,hy]=W2S(g.heart[0]+.5,g.heart[1]+.5),pu=1+.06*Math.sin(T*3);const hg=cx.createRadialGradient(hx,hy,2,hx,hy,s*1.6);hg.addColorStop(0,'rgba(255,40,60,.6)');hg.addColorStop(1,'rgba(255,0,0,0)');cx.fillStyle=hg;cx.fillRect(hx-s*1.6,hy-s*1.6,s*3.2,s*3.2);icon('ic_2',hx,hy,s*1.1*pu);
 const L=[];for(const d of g.deco){const[x,y]=W2S(d.c+.5,d.r+.5);L.push({y:d.r+.5,f:()=>{if(d.k=='bones'){cx.fillStyle='rgba(225,215,195,.8)';cx.fillRect(x-s*.25,y,s*.3,s*.06);cx.fillRect(x-s*.05,y-s*.12,s*.06,s*.26);cx.beginPath();cx.arc(x+s*.18,y-s*.02,s*.1,0,7);cx.fill()}else spr(d.k,x,y+s*.4,s*(d.k=='candle'?.7:.9),.9)}})}
 for(const t of g.tw){const[x,y]=W2S(t.c+.5,t.r+.5);L.push({y:t.r+.5,f:()=>drawTower(t,x,y,s)})}
 for(const e of g.en){const[x,y]=W2S(e.x,e.y);L.push({y:e.y+(e.e.fly?5:0),f:()=>drawEnemy(e,x,y,s)})}
 for(const c of g.corpses){const[x,y]=W2S(c.x,c.y);L.push({y:c.y-.1,f:()=>sprT(c.e.img,x,y+s*.38,s*c.e.sz*(1-c.t),{flip:c.dir<0?-1:1,rot:c.t*2.4*(c.dir<0?-1:1),a:1-c.t*2,fl:.1})})}
 L.sort((a,b)=>a.y-b.y).forEach(o=>o.f());
 cx.save();cx.globalCompositeOperation='lighter';
 for(const z of g.zn||[]){const[x,y]=W2S(z.c+.5,z.r+.5),Z=ZT[z.k],p=.75+.25*Math.sin(T*2.5+z.c);cx.save();cx.globalCompositeOperation='lighter';
  if(z.k=='trap'){cx.fillStyle='rgba(60,40,25,.9)';cx.globalCompositeOperation='source-over';for(let j=0;j<5;j++){const a=j*1.26+.3;cx.save();cx.translate(x+Math.cos(a)*s*.22,y+Math.sin(a)*s*.18);cx.fillStyle='#5a4028';cx.fillRect(-s*.2,-s*.04,s*.4,s*.08);cx.fillStyle='#d8d0c0';cx.beginPath();cx.moveTo(-s*.06,0);cx.lineTo(0,-s*.22);cx.lineTo(s*.06,0);cx.fill();cx.restore()}}
  else{const rr=s*(z.k=='rune'?1.6:1.6),gr=cx.createRadialGradient(x,y,0,x,y,rr);gr.addColorStop(0,'rgba('+Z.col+','+.35*p+')');gr.addColorStop(.7,'rgba('+Z.col+','+.12*p+')');gr.addColorStop(1,'rgba('+Z.col+',0)');cx.fillStyle=gr;cx.beginPath();cx.arc(x,y,rr,0,7);cx.fill();
   cx.strokeStyle='rgba('+Z.col+','+.8*p+')';cx.lineWidth=2;cx.beginPath();cx.arc(x,y,s*.42,0,7);cx.stroke();cx.setLineDash([4,5]);cx.lineDashOffset=-T*12;cx.beginPath();cx.arc(x,y,rr*.92,0,7);cx.stroke();cx.setLineDash([]);
   cx.translate(x,y);cx.rotate(T*(z.k=='rune'?.6:-.4));cx.beginPath();for(let j=0;j<(z.k=='rune'?6:4);j++){const a=j*6.28/(z.k=='rune'?6:4);cx.moveTo(Math.cos(a)*s*.42,Math.sin(a)*s*.42);cx.lineTo(Math.cos(a+2.1)*s*.42,Math.sin(a+2.1)*s*.42)}cx.stroke();
   if(z.k=='ward'){cx.rotate(-T*-.4);cx.fillStyle='rgba(255,240,180,'+p+')';cx.fillRect(-s*.04,-s*.22,s*.08,s*.44);cx.fillRect(-s*.15,-s*.1,s*.3,s*.08)}}
  cx.restore()}
 for(const z of g.pz){const[x,y]=W2S(z.x,z.y),a=Math.min(1,z.t);cx.fillStyle=z.k=='pois'?'rgba(110,255,70,'+(.18*a)+')':'rgba(255,110,30,'+(.2*a)+')';cx.beginPath();cx.ellipse(x,y,z.r*s,z.r*s*.6,0,0,7);cx.fill();if(Math.random()<.15)part(z.x+(Math.random()-.5)*z.r,z.y+(Math.random()-.5)*z.r*.6,z.k=='pois'?'#9fff60':'#ff9030',1,.5,1,.5)}
 for(const b of g.bolts){const[x,y]=W2S(b.x,b.y),rg=cx.createRadialGradient(x,y,1,x,y,s*.25);rg.addColorStop(0,'#fff');rg.addColorStop(.4,b.col);rg.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=rg;cx.beginPath();cx.arc(x,y,s*.25,0,7);cx.fill()}
 for(const p of g.pr){const ar=(p.arc||0);const[x,y]=W2S(p.x,p.y-ar),c=TT[p.k].col;if(p.k=='c'){cx.fillStyle='#8a7a68';cx.beginPath();cx.arc(x,y,s*.16,0,7);cx.fill();continue}if(p.k=='a'){cx.strokeStyle='rgba(255,240,200,.35)';cx.lineWidth=1.5;cx.beginPath();for(let i=0;i<p.hx.length;i+=2){const[a,b]=W2S(p.hx[i],p.hx[i+1]);i?cx.lineTo(a,b):cx.moveTo(a,b)}cx.lineTo(x,y);cx.stroke();
   const an=Math.atan2(p.ly-p.y,p.lx-p.x);cx.strokeStyle='#fff6d8';cx.lineWidth=2;cx.beginPath();cx.moveTo(x,y);cx.lineTo(x-Math.cos(an)*s*.35,y-Math.sin(an)*s*.35);cx.stroke()}
  else{const R=(p.k=='f'?(p.o.meteor?.42:.26):.18)*s,rg=cx.createRadialGradient(x,y,1,x,y,R*2);rg.addColorStop(0,'#fff');rg.addColorStop(.3,c);rg.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=rg;cx.beginPath();cx.arc(x,y,R*2,0,7);cx.fill();
   if(p.k=='i'){const an=Math.atan2(p.ly-p.y,p.lx-p.x);cx.strokeStyle='#effcff';cx.lineWidth=2.5;cx.beginPath();cx.moveTo(x+Math.cos(an)*R,y+Math.sin(an)*R);cx.lineTo(x-Math.cos(an)*R*2.2,y-Math.sin(an)*R*2.2);cx.stroke()}}}
 for(const p of g.pt){if(!p.a)continue;const[x,y]=W2S(p.x,p.y),f=Math.max(0,p.l/p.m);if(p.ty){cx.globalAlpha=1;if(p.ty=='flash'||p.ty=='star'){const r=p.s*s*(1.4-f),gr=cx.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,255,255,'+f+')');gr.addColorStop(.35,'rgba('+p.col+','+f*.8+')');gr.addColorStop(1,'rgba('+p.col+',0)');cx.fillStyle=gr;cx.fillRect(x-r,y-r,2*r,2*r);if(p.ty=='star'){cx.strokeStyle='rgba(255,255,255,'+f+')';cx.lineWidth=2;cx.beginPath();cx.moveTo(x-r,y);cx.lineTo(x+r,y);cx.moveTo(x,y-r*.7);cx.lineTo(x,y+r*.7);cx.stroke()}}
   else if(p.ty=='spark'||p.ty=='shard'||p.ty=='streak'){cx.globalAlpha=f;cx.strokeStyle=p.col;cx.lineWidth=p.s*(p.ty=='shard'?1.4:1);cx.beginPath();cx.moveTo(x,y);cx.lineTo(x-p.vx*s*.06,y-p.vy*s*.06-(p.ty=='streak'?s*.3:0));cx.stroke()}
   else if(p.ty=='bub'){cx.globalAlpha=f;cx.strokeStyle='rgba('+p.col+',.9)';cx.lineWidth=1.2;cx.beginPath();cx.arc(x,y,p.s*s*(1.5-f*.5),0,7);cx.stroke()}
   else if(p.ty=='pillar'){const w=p.s*s*f,gr=cx.createLinearGradient(x-w,0,x+w,0);gr.addColorStop(0,'rgba('+p.col+',0)');gr.addColorStop(.5,'rgba('+p.col+','+f+')');gr.addColorStop(1,'rgba('+p.col+',0)');cx.fillStyle=gr;cx.fillRect(x-w,y-s*1.8,2*w,s*1.9)}continue}
   cx.globalAlpha=f;cx.fillStyle=p.col;cx.beginPath();cx.arc(x,y,p.s*z,0,7);cx.fill()}cx.globalAlpha=1;
 for(const f of g.fx){const[x,y]=W2S(f.x,f.y),a=1-f.t/(f.d||.8);if(f.k=='boom'){const R=f.r*s*(.6+f.t*1.2),rg=cx.createRadialGradient(x,y,1,x,y,R);rg.addColorStop(0,'rgba(255,220,120,'+a+')');rg.addColorStop(1,'rgba(255,60,0,0)');cx.fillStyle=rg;cx.beginPath();cx.arc(x,y,R,0,7);cx.fill()}}
 cx.restore();
 for(const p of g.pt){if(p.a)continue;const[x,y]=W2S(p.x,p.y);cx.globalAlpha=Math.max(0,p.l/p.m);if(p.ty=='smoke'){cx.fillStyle='rgba('+p.col+','+(.45*p.l/p.m)+')';cx.beginPath();cx.arc(x,y,p.s*s*(2-p.l/p.m),0,7);cx.fill();continue}cx.fillStyle=p.col;cx.fillRect(x-p.s*z/2,y-p.s*z/2,p.s*z,p.s*z)}cx.globalAlpha=1;
 for(const f of g.fx){const[x,y]=W2S(f.x,f.y),a=Math.max(0,1-f.t/(f.d||.8));cx.globalAlpha=a;
  if(f.k=='bolt'||f.k=='line'){const[x2,y2]=W2S(f.x2,f.y2);cx.save();cx.globalCompositeOperation='lighter';cx.strokeStyle=f.k=='bolt'?'#bfe0ff':'#fff0c0';cx.lineWidth=f.k=='bolt'?2.5:2;cx.beginPath();cx.moveTo(x,y);if(f.k=='bolt'){for(let q=1;q<5;q++)cx.lineTo(x+(x2-x)*q/5+(Math.random()-.5)*8,y+(y2-y)*q/5+(Math.random()-.5)*8)}cx.lineTo(x2,y2);cx.stroke();cx.restore()}else if(f.k=='web'){}else if(f.k=='num'){txt(f.s,x,y-f.t*28,11+(f.col=='#ffd75a'?3:0),f.col)}else if(f.k=='txt')txt(f.s,x,y-f.t*22,13,'#ffd75a');else if(f.k=='ring'){cx.strokeStyle=f.col;cx.lineWidth=3;cx.beginPath();cx.arc(x,y,s*(.2+f.t),0,7);cx.stroke()}
  else if(f.k=='slash'){cx.strokeStyle='#fff3c0';cx.lineWidth=3;cx.beginPath();cx.arc(x,y,s*.45,-1+f.t*8,.4+f.t*8);cx.stroke()}else if(f.k=='heal'){cx.strokeStyle='#60ff80';cx.lineWidth=2;cx.beginPath();cx.arc(x,y,s*1.8*f.t/.6,0,7);cx.stroke()}
  else if(f.k=='shock'){cx.strokeStyle='#c8a070';cx.lineWidth=5;cx.beginPath();cx.arc(x,y,s*2.2*f.t/.7,0,7);cx.stroke()}else if(f.k=='nova'){cx.fillStyle='rgba(170,110,255,'+(.4*a)+')';cx.fillRect(0,0,360,LH)}cx.globalAlpha=1}
 // освещение: тёмный слой с «дырами» света
 const lw=90,lh=Math.ceil(LH/4);if(!LC||LC.height!=lh){LC=document.createElement('canvas');LC.width=lw;LC.height=lh}const l=LC.getContext('2d');l.globalCompositeOperation='source-over';l.clearRect(0,0,lw,lh);l.fillStyle='rgba(6,0,3,.55)';l.fillRect(0,0,lw,lh);l.globalCompositeOperation='destination-out';
 const hole=(x,y,r,k)=>{x/=4;y/=4;r/=4;const gg=l.createRadialGradient(x,y,0,x,y,r);gg.addColorStop(0,'rgba(0,0,0,'+(k||1)+')');gg.addColorStop(1,'rgba(0,0,0,0)');l.fillStyle=gg;l.fillRect(x-r,y-r,2*r,2*r)};
 hole(hx,hy,s*3.2);for(const d of g.deco)if(d.k=='candle'){const[x,y]=W2S(d.c+.5,d.r+.2);hole(x,y,s*(1.8+.1*Math.sin(T*7+d.c)),.9)}for(const t of g.tw){const[x,y]=W2S(t.c+.5,t.r+.3);hole(x,y,s*(t.k=='f'||t.k=='h'||t.k=='l'?2.4:1.5),t.k=='f'?1:.75)}
 for(const p of g.pr)if(p.k=='f'){const[x,y]=W2S(p.x,p.y);hole(x,y,s*1.2)}for(const f of g.fx)if(f.k=='boom'){const[x,y]=W2S(f.x,f.y);hole(x,y,s*2.5)}for(const R of g.rc){const[x,y]=W2S(R[0][0]+.5,R[0][1]+.5);hole(x,y,s*1.6,.7)}
 cx.drawImage(LC,0,0,360,lw?lh*4:0);
 if(g.place&&g.ghost){const[c,r]=g.ghost,[x,y]=W2S(c+.5,r+.5),ok=canBuild(c,r)&&g.gold>=TT[g.place].c,o=tst({k:g.place,l:0});cx.fillStyle=ok?'rgba(120,255,140,.12)':'rgba(255,80,80,.12)';cx.strokeStyle=ok?'rgba(150,255,160,.8)':'rgba(255,90,90,.8)';cx.lineWidth=1.5;cx.beginPath();cx.arc(x,y,o.r*s,0,7);cx.fill();cx.stroke();
  cx.strokeRect(x-s/2,y-s/2,s,s);drawTower({k:g.place,l:0,face:1},x,y,s,.6);if(hud){btn(Math.min(318,x+s*.6),Math.max(HT+2,y-s*1.6),36,30,'✓',()=>{if(build(c,r,g.place)){g.last=g.place;g.ghost=null;if(g.gold<TT[g.place].c)g.place=null}},{sz:18});btn(Math.max(4,x-s*.6-36),Math.max(HT+2,y-s*1.6),36,30,'✕',()=>{g.ghost=null;g.place=null},{alt:1,sz:16})}}
 if(g.sel){const t=g.sel,[x,y]=W2S(t.c+.5,t.r+.5);cx.strokeStyle='rgba(233,196,106,.8)';cx.fillStyle='rgba(233,196,106,.08)';cx.lineWidth=1.5;cx.beginPath();cx.arc(x,y,tst(t).r*s,0,7);cx.fill();cx.stroke()}
 if(hud)drawHud()}
function drawHud(){const g=G;cx.fillStyle='rgba(14,5,8,.78)';cx.fillRect(0,0,360,HT);cx.fillStyle='rgba(212,166,42,.6)';cx.fillRect(0,HT,360,1);
 icon('ic_2',14,17,22);txt(''+g.lives,27,18,16,'#ffb0b0','left');icon('coin',62,17,18);txt(''+g.gold,73,18,16,'#ffd75a','left');const gc=Date.now()<(S.goldAt||0);btn(116,5,40,24,gc?Math.ceil((S.goldAt-Date.now())/1e3)+'':'+▶',goldAd,{alt:1,sz:12,dis:gc});
 txt('Волна '+g.wave+'/'+g.L.waves,206,18,14);btn(258,4,44,26,spd==2?'×2':'×1',()=>spd=spd==1?2:1,{alt:1,sz:14});btn(308,4,46,26,'II',()=>{paused=true;g.sel=null},{alt:1,sz:14});
 const y=LH-HB;cx.fillStyle='rgba(14,5,8,.85)';cx.fillRect(0,y,360,HB);cx.fillStyle='rgba(212,166,42,.6)';cx.fillRect(0,y,360,1);
 const L=g.tu,two=L.length>5,per=two?Math.ceil(L.length/2):L.length,bw=two?Math.floor(250/per):Math.min(62,Math.floor(250/per)),bh=two?46:HB-6;
 L.forEach((k,i)=>{const t=TT[k],bx=2+(i%per)*bw,by=y+3+(two?Math.floor(i/per)*48:0),ok=g.gold>=t.c,sel=g.place==k,nw=TT[k].u==g.i&&g.i>0;BT.push({x:bx,y:by,w:bw-3,h:bh,fn:()=>{g.sel=null;if(g.place==k){g.place=null;g.ghost=null}else{g.place=k;if(!g.ghost)toast(t.n+': коснитесь свободной земли')}}});
  cx.fillStyle=sel?'rgba(160,30,45,.75)':ok?'rgba(80,20,28,.7)':'rgba(40,30,30,.7)';rr(bx,by+1,bw-3,bh-2,6);cx.fill();cx.strokeStyle=sel?'#ffe08a':nw?'#7cff8a':ok?'#d4a62a':'#5a4a3a';cx.lineWidth=sel||nw?2:1;cx.stroke();
  const sz=(two?28:36)*(sel?1+.06*Math.sin(T*8):1);spr(t.img,bx+bw/2-1,by+bh-14,sz,ok?1:.45);icon('coin',bx+9,by+bh-7,9);txt(''+t.c,bx+15,by+bh-6,11,ok?'#ffd75a':'#7a6a5a','left')});
 const rx=254,rh=two?30:27;if(!g.q.length&&!g.en.length&&g.wave<g.L.waves)btn(rx,y+5,102,rh,'▶ +'+Math.ceil(g.cd)*2,callWave,{sz:14});else txt(g.q.length?'идут…':'добейте!',305,y+5+rh/2,13,'#c9b48a');
 const nr=g.nova<=0&&g.en.length>0,ny=y+9+rh;btn(rx,ny,102,rh,'',nova,{dis:!nr});icon('ui_nova',rx+18,ny+rh/2,20);txt(g.nova>0?Math.ceil(g.nova)+'с':'Нова',rx+62,ny+rh/2+1,14,nr?'#f6e0a8':'#8a7a66');
 if(g.sel){g.selT=Math.min(1,(g.selT||0)+.12);selPanel(g.sel)}else g.selT=0}
function selPanel(t){const g=G,py=LH-HB-110+Math.round((1-g.selT)**2*110),o=tst(t);panel(6,py,348,104);txt(TT[t.k].n+(t.l>=3?' · '+TB[t.k][t.br].n:' · ур. '+(t.l+1)),180,py+16,15);txt((t.k=='h'?'лечит '+(8+4*t.l)+'/с':'урон '+Math.round(o.d))+' · дальн. '+o.r.toFixed(1)+(o.air?' · по летающим':'')+' · прочн. '+Math.ceil(t.hp)+'/'+t.mhp,180,py+34,11,'#b8a688');if(t.hp<t.mhp){const rc=Math.ceil((t.mhp-t.hp)*.5);btn(262,py-34,88,30,'🔧 '+rc,()=>repair(t),{sz:13,dis:g.gold<rc})}
 if(t.l<2){const c=upCost(t);btn(16,py+48,200,44,'▲ Улучшить  '+c,()=>upgrade(t),{dis:g.gold<c,sz:15})}else if(t.l==2){const c=upCost(t);TB[t.k].forEach((b,i)=>{BT.push({x:14+i*124,y:py+44,w:120,h:52,fn:()=>upgrade(t,i)});cx.fillStyle=g.gold>=c?'rgba(122,16,32,.6)':'rgba(40,30,30,.7)';rr(14+i*124,py+44,120,52,6);cx.fill();cx.strokeStyle=b.c;cx.lineWidth=1.5;cx.stroke();txt(b.n+'  '+c,74+i*124,py+60,13,g.gold>=c?'#f6e0a8':'#8a7a66');txt(b.ds,74+i*124,py+80,10,'#c9b48a')})}
 else txt('Максимум',116,py+70,15,'#8a7a66');btn(t.l==2?262:226,py+48,t.l==2?86:122,44,'$ '+Math.floor(t.inv*.6),()=>sell(t),{alt:1,sz:14})}
function overlay(){cx.fillStyle='rgba(5,1,3,.72)';cx.fillRect(0,0,360,LH)}
function stars(n,x,y,s){for(let i=0;i<3;i++){txt('★',x+(i-1)*s*1.1,y-(i==1?6:0),s,i<n?'#ffd75a':'#3a2a22')}}
const SCR={
 splash(){bg(.55);logo(LH*.38,1.1);const p=Math.min(1,loaded/NAMES.length);panel(60,LH*.68,240,16);cx.fillStyle='#d4a62a';cx.fillRect(64,LH*.68+4,232*p,8);txt('Загрузка…',180,LH*.68+36,15,'#c9b48a');
  if(loaded>=NAMES.length&&T>1.3&&!Q.has('scr'))scr=S.consent==null?'consent':'menu'},
 consent(){SCR.menu(1);overlay();panel(24,LH*.22,312,300);txt('Перед началом',180,LH*.22+34,24,'#e9c46a');
  wrap('Мы показываем рекламу и собираем обезличенную статистику, чтобы игра оставалась бесплатной и становилась лучше. Изменить выбор можно в настройках.',180,LH*.22+76,270,15,21,'#d8c8a8');
  btn(44,LH*.22+186,272,60,'Хорошо',applyConsent,{sz:24});link(180,LH*.22+272,'Настройки',()=>scr='consentSet')},
 consentSet(){SCR.menu(1);overlay();panel(20,LH*.2,320,330);txt('Приватность',180,LH*.2+34,23,'#e9c46a');
  tog(40,LH*.2+90,280,'Персонализ. реклама',S.pers,()=>S.pers=!S.pers);tog(40,LH*.2+140,280,'Аналитика',S.an,()=>S.an=!S.an);
  wrap('Если выключить персонализацию, реклама останется, но не будет подбираться под вас.',180,LH*.2+190,270,13,18,'#9a8a78');btn(60,LH*.2+250,240,52,'Сохранить',applyConsent,{sz:20})},
 menu(noBtn){bg();logo(112,.9);gemBox();txt('★ '+starsTotal(),20,31,17,'#ffd75a','left');
  const gy=LH-70,pu=1+.05*Math.sin(T*2.5);const gl=cx.createRadialGradient(180,gy,4,180,gy,60);gl.addColorStop(0,'rgba(255,40,60,.45)');gl.addColorStop(1,'rgba(255,0,0,0)');cx.fillStyle=gl;cx.fillRect(110,gy-60,140,120);icon('ic_2',180,gy,50*pu);
  if(noBtn===1)return;const n=Date.now(),dr=n>=S.daily,cr=S.chestAt&&n>=S.chestAt;
  btn(14,186,106,40,dr?'🎁 Подарок':'🎁 '+mmss(S.daily-n),()=>{if(Date.now()<S.daily){toast('Подарок через '+mmss(S.daily-Date.now()));return}S.gems+=10;S.daily=Date.now()+86400e3;save();snd('gem',.6);toast('+10 кристаллов')},{alt:!dr,sz:14});
  btn(127,186,106,40,!S.chestAt?'Сундук —':cr?'Сундук!':'⏳ '+mmss(S.chestAt-n),()=>{if(!S.chestAt){toast('Сундук даётся за победу');return}if(Date.now()<S.chestAt){toast('Откроется через '+mmss(S.chestAt-Date.now()));return}S.chestAt=0;S.gems+=15;save();snd('chest',.6);toast('+15 кристаллов')},{alt:!cr,sz:14});
  btn(240,186,106,40,'⚡ '+S.energy+'/'+MAXE,()=>toast(S.energy<MAXE?'+1 ⚡ через '+mmss(S.enT+EREG-n):'Энергия полная'),{alt:1,sz:15});
  const it=[['Играть',()=>scr='map'],['Улучшения',()=>scr='up'],['Рейтинг',()=>{scr='lb';loadLB()}],['Достижения',()=>scr='ach'],['Другие игры',()=>scr='other'],['Настройки',()=>scr='set']];
  const top=238,h=Math.min(50,(LH-110-top)/it.length);it.forEach((b,i)=>btn(60,top+i*h,240,h-8,b[0],b[1],{sz:i?19:23}))},
 map(){cx.fillStyle='#0a0406';cx.fillRect(0,0,360,LH);const mc=mapCv(selRg),iw=576,ih=1024,k=Math.max(360/iw,Math.min(LH/ih,360/iw*1.1)),ox=(360-iw*k)/2,oy=(LH-ih*k)/2,P=([x,y])=>[ox+x*k,oy+y*k];

  if(mc)cx.drawImage(mc,ox,oy,iw*k,ih*k);if(oy>0){for(const[y0,d]of[[oy,1],[oy+ih*k,-1]]){const g=cx.createLinearGradient(0,y0,0,y0+d*-0.0001+d*40);g.addColorStop(0,'rgba(10,4,6,0)');g.addColorStop(1,'rgba(10,4,6,0)');}const g1=cx.createLinearGradient(0,oy,0,oy+40);g1.addColorStop(0,'#0a0406');g1.addColorStop(1,'rgba(10,4,6,0)');cx.fillStyle=g1;cx.fillRect(0,oy,360,40);const g2=cx.createLinearGradient(0,oy+ih*k-40,0,oy+ih*k);g2.addColorStop(0,'rgba(10,4,6,0)');g2.addColorStop(1,'#0a0406');cx.fillStyle=g2;cx.fillRect(0,oy+ih*k-40,360,40)}const b0=selRg*10,rOpen=q=>q==0||(S.stars[q*10-1]||0)>0,pts=MAPN.map(P);
  // тропа между медальонами: светящийся пунктир
  cx.save();cx.lineCap='round';for(let j=0;j<9;j++){const[a1,a2]=pts[j],[b1,b2]=pts[j+1],done=(S.stars[b0+j]||0)>0,mx=(a1+b1)/2+(j%2?-26:26),my=(a2+b2)/2;
   cx.strokeStyle=done?'rgba(255,215,110,.95)':'rgba(255,215,110,.35)';cx.lineWidth=done?4:3;cx.setLineDash([2,9]);cx.lineDashOffset=-T*14;cx.shadowColor='rgba(255,190,60,.9)';cx.shadowBlur=done?10:0;cx.beginPath();cx.moveTo(a1,a2);cx.quadraticCurveTo(mx,my,b1,b2);cx.stroke()}cx.restore();cx.setLineDash([]);
  pts.forEach((p,j)=>{const q=b0+j,L=LV[q],open=q==0||(S.stars[q-1]||0)>0,cur=open&&!(S.stars[q]>0),ap=Math.min(1,Math.max(0,scrT*5-j*.3)),boss=L.boss,R0=(boss?27:21)*(cur?1+.05*Math.sin(T*4):1)*(.5+.5*ap);cx.globalAlpha=ap;
   if(cur){const g=cx.createRadialGradient(p[0],p[1],R0*.6,p[0],p[1],R0*2.2);g.addColorStop(0,'rgba(255,200,80,.55)');g.addColorStop(1,'rgba(255,160,40,0)');cx.fillStyle=g;cx.beginPath();cx.arc(p[0],p[1],R0*2.2,0,7);cx.fill()}
   if(boss){fit(BOSS[selRg][1],p[0],p[1]-6,64,58,open?1:.45);cx.strokeStyle=open?'#f0c860':'#6a5a40';cx.lineWidth=3;cx.beginPath();cx.arc(p[0],p[1]+22,15,0,7);cx.fillStyle='#2a0c10';cx.fill();cx.stroke();txt(open?'☠':'🔒',p[0],p[1]+23,open?16:12,open?'#ffd8a0':'#8a7a66');stars(S.stars[q]||0,p[0],p[1]+46,12)}
   else{const g=cx.createRadialGradient(p[0]-R0*.3,p[1]-R0*.3,2,p[0],p[1],R0);g.addColorStop(0,open?'#6a4a3a':'#3a3434');g.addColorStop(1,open?'#2a140f':'#161314');cx.fillStyle=g;cx.beginPath();cx.arc(p[0],p[1],R0,0,7);cx.fill();
    const rg=cx.createLinearGradient(0,p[1]-R0,0,p[1]+R0);rg.addColorStop(0,open?'#fff0b0':'#8a7a60');rg.addColorStop(.5,open?'#d4a62a':'#5a4a34');rg.addColorStop(1,open?'#7a5214':'#3a3024');cx.strokeStyle=rg;cx.lineWidth=4;cx.stroke();cx.strokeStyle='rgba(0,0,0,.5)';cx.lineWidth=1;cx.beginPath();cx.arc(p[0],p[1],R0-3,0,7);cx.stroke();
    txt(open?''+(q+1):'🔒',p[0],p[1]+1,open?(q>=99?14:17):13,open?'#fbe6b0':'#8a7a66');stars(S.stars[q]||0,p[0],p[1]+R0+10,11)}
   const nw=newAt(q);if(open&&(nw.en.length||nw.tw.length)&&!(S.stars[q]>0)){cx.fillStyle='#1d6a2a';rr(p[0]+R0-12,p[1]-R0-8,30,13,6);cx.fill();txt('NEW',p[0]+R0+3,p[1]-R0-1,9,'#d8ffd8')}cx.globalAlpha=1;
   if(open)BT.push({x:p[0]-30,y:p[1]-30,w:60,h:60,fn:()=>{selLv=q;scr='squad'}})});
  cx.fillStyle='rgba(10,3,5,.72)';rr(70,8,220,44,10);cx.fill();cx.strokeStyle='#d4a62a';cx.lineWidth=1.5;cx.stroke();txt(REG[selRg].n,180,24,16,'#f0d690');txt('Регион '+(selRg+1)+' / 10 · ★ '+[...Array(10)].reduce((a,_,j)=>a+(S.stars[b0+j]||0),0)+'/30',180,42,11,'#c9b48a');
  back();icon('gem',318,62,18);txt(''+S.gems,330,63,14,'#bfe3ff','left');
  if(selRg>0)btn(8,LH-54,52,42,'‹',()=>{selRg--;scrT=0},{alt:1,sz:24});if(selRg<9)btn(300,LH-54,52,42,'›',()=>{if(rOpen(selRg+1)){selRg++;scrT=0}else toast('Сначала одолейте босса региона')},{alt:1,sz:24,dis:!rOpen(selRg+1)})},
 squad(){bg();back(()=>scr='map');title('Уровень '+(selLv+1)+(LV[selLv].boss?' · БОСС':''));const L=LV[selLv];txt(L.n+' · волн: '+L.waves,180,78,16,'#c9b48a');
  panel(14,96,332,110);txt('Враги',180,114,16,'#e9c46a');const un=EORD.filter(k=>ET[k].at<=selLv),es=un.slice(-5);if(L.boss)es.push('boss');const cw=Math.min(62,316/es.length),x0=180-cw*es.length/2;es.forEach((k,i)=>{const x=x0+i*cw+cw/2,bo=k=='boss',im=bo?BOSS[L.bi][1]:ET[k].img,nw=!bo&&ET[k].at==selLv;cx.fillStyle='rgba(40,16,20,.8)';rr(x-cw/2+3,126,cw-6,76,6);cx.fill();cx.strokeStyle=nw?'#7cff8a':'rgba(212,166,42,.4)';cx.lineWidth=1;cx.stroke();fit(im,x,160+Math.sin(T*3+i)*1.5,cw-12,44);txt(bo?'босс':ET[k].n,x,194,9,nw?'#7cff8a':'#d8c8a8');if(nw)txt('НОВЫЙ',x,133,8,'#7cff8a')});txt('Входов: '+new Set(L.routes.map(r=>r[0].join())).size+' · путей: '+L.routes.length,180,96+0,1,'#0000');
  txt('Отряд защитников',180,226,17,'#e9c46a');const tu=tUnl(selLv);tu.forEach((k,i)=>{const t=TT[k],cols=3,w=110,x=10+(i%cols)*114,y=240+Math.floor(i/cols)*74;panel(x,y,w,68);spr(t.img,x+26,y+60,k=='f'||k=='i'?40:48);txt(t.n,x+72,y+18,12);txt(''+t.c,x+80,y+40,13,'#ffd75a');icon('coin',x+66,y+40,11);if(t.u==selLv&&selLv>0)txt('НОВАЯ',x+72,y+56,10,'#7cff8a')});
  const nx=TK.find(k=>TT[k].u>selLv);if(nx)txt('Следующая башня «'+TT[nx].n+'» — с уровня '+(TT[nx].u+1),180,240+Math.ceil(tu.length/3)*74+8,11,'#8a7a66');
  const by=Math.min(LH-70,500);if(S.energy>0)btn(60,by,240,56,'В бой!  ⚡1',()=>{S.energy--;if(!S.enT)S.enT=Date.now();save();startLevel(selLv)},{sz:24});else{btn(30,by,150,56,'+5 ⚡ (видео)',()=>rewarded('energy',ok=>{if(ok){S.energy=MAXE;S.enT=0;save()}}),{alt:1,sz:15});txt('+1 ⚡ через '+mmss(S.enT+EREG-Date.now()),268,by+28,13,'#c9b48a')}},
 play(){drawPlay(!paused);if(paused){overlay();panel(50,LH*.3,260,230);txt('Пауза',180,LH*.3+34,26,'#e9c46a');btn(80,LH*.3+64,200,44,'Продолжить',()=>paused=false);btn(80,LH*.3+116,200,44,'Заново',()=>startLevel(G.i),{alt:1});btn(80,LH*.3+168,200,44,'На карту',()=>{paused=false;scr='map'},{alt:1})}},
 win(){drawPlay(0);overlay();panel(30,LH*.2,300,330);txt('Победа!',180,LH*.2+38,32,'#ffd75a');stars(G.stars,180,LH*.2+92,40);txt('Сердце: '+G.lives+'/20 · убито: '+G.kills,180,LH*.2+134,15,'#c9b48a');
  icon('gem',150,LH*.2+170,24);txt('+'+G.gems,168,LH*.2+171,22,'#bfe3ff','left');
  if(!G.dbl)btn(55,LH*.2+200,250,46,'×2 кристаллы (видео)',()=>rewarded('double',ok=>{if(ok&&!G.dbl){G.dbl=1;S.gems+=G.gems;G.gems*=2;save();snd('gem',.6)}}),{alt:1,sz:16});else txt('Награда удвоена!',180,LH*.2+223,16,'#bfe3ff');
  const nx=G.i+1<LV.length;const go=f=>()=>{if(G.ask){G.ask=0;notifNext=f;scr='notif'}else f()};btn(55,LH*.2+258,120,48,'На карту',go(()=>scr='map'),{alt:1,sz:16});btn(185,LH*.2+258,120,48,nx?'Далее':'Заново',go(()=>scr='squad'),{sz:18});if(nx)selLv=G.i+1},
 lose(){drawPlay(0);overlay();panel(30,LH*.2,300,320);txt('Сердце пало',180,LH*.2+40,30,'#ff6070');icon('ic_2',180,LH*.2+92,54);txt('Волна '+G.wave+' из '+G.L.waves,180,LH*.2+134,16,'#c9b48a');
  if(!G.cont)btn(45,LH*.2+160,270,54,'▶ Продолжить (видео)  +5 ❤',()=>rewarded('revive',ok=>{if(ok)revive()}),{sz:16});else txt('Продолжение уже использовано',180,LH*.2+187,14,'#8a7a66');
  btn(45,LH*.2+232,130,48,'На карту',()=>scr='map',{alt:1,sz:16});btn(185,LH*.2+232,130,48,'Заново',()=>startLevel(G.i),{sz:18})},
 up(){bg();back();title('Улучшения');gemBox();const tu=TK.filter(k=>TT[k].u<=Math.max(0,S.stars.filter(x=>x).length)),rh=Math.min(50,(LH-300)/tu.length);tu.forEach((k,i)=>{const t=TT[k],u=S.up[k]||0,y=66+i*rh,c=20*(u+1),w=S.upT[k];cx.fillStyle='rgba(30,12,16,.85)';rr(14,y,332,rh-4,6);cx.fill();cx.strokeStyle='rgba(212,166,42,.5)';cx.lineWidth=1;cx.stroke();spr(t.img,40,y+rh-6,rh-8);txt(t.n,70,y+rh*.32,14,'#ecd9a3','left');txt('ур. '+u+'/5 · +'+u*10+'%',70,y+rh*.7,11,'#b8a688','left');
   for(let j=0;j<5;j++){cx.fillStyle=j<u?'#d4a62a':w&&j==u?'#7a1020':'#3a2a22';cx.fillRect(170+j*12,y+rh/2-3,9,6)}
   if(w)txt('⏳ '+mmss(w-Date.now()),290,y+rh/2-2,13,'#8fdcff');else if(u<5)btn(250,y+3,88,rh-10,'💎 '+c,()=>{if(S.gems<c){toast('Нужно больше кристаллов');snd('error',.4);return}S.gems-=c;S.upT[k]=Date.now()+(u+1)*10*60e3;save();snd('equip',.5);toast('Улучшение начато')},{dis:S.gems<c,sz:14});else txt('Макс.',290,y+rh/2,13,'#8a7a66')});
  const my=66+tu.length*rh+8,MT=[['gold','Казна','+10% золота'],['lives','Сердце','+2 жизни'],['nova','Нова','+20% урона'],['bounty','Трофеи','+5% награды']];txt('Древо мастерства',180,my+8,16,'#e9c46a');MT.forEach((m,i)=>{const x=14+i*84,y=my+20,r=mt(m[0]),c=15*(r+1);panel(x,y,80,92);txt(m[1],x+40,y+17,13);txt(m[2],x+40,y+32,9,'#b8a688');for(let j=0;j<3;j++){cx.fillStyle=j<r?'#d4a62a':'#3a2a22';cx.fillRect(x+14+j*18,y+42,14,5)}if(r<3)btn(x+8,y+54,64,28,'💎'+c,()=>{if(S.gems<c){toast('Нужно больше кристаллов');return}S.gems-=c;S.mt[m[0]]=r+1;save();snd('levelup',.5)},{dis:S.gems<c,sz:13});else txt('макс.',x+40,y+68,12,'#8a7a66')});
  const ga=Date.now()<(S.gemAt||0);btn(60,my+122,240,40,ga?'💎 через '+mmss(S.gemAt-Date.now()):'▶ +10 💎 за видео',()=>{if(ga)return;rewarded('gems',ok=>{if(ok){S.gems+=10;S.gemAt=Date.now()+10*60e3;save();snd('gem',.6)}})},{alt:1,sz:15,dis:ga});if(PL.social)btn(60,my+170,240,40,'💎 Купить кристаллы',()=>{scr='buy'},{sz:15})},
 buy(){bg();back();title('Кристаллы');gemBox();const it=PL.social.items;it.forEach((t,i)=>{const y=90+i*76;panel(24,y,312,66);icon('gem',62,y+33,40);txt(t[1],110,y+33,17,'#ecd9a3','left');btn(232,y+13,92,40,t[2]+' '+PL.social.cur,()=>{PL.social.pay(t[0]).then(ok=>{if(ok){toast('Оплата прошла — кристаллы скоро придут');[3e3,1e4,3e4].forEach(d=>setTimeout(gifts,d))}})},{sz:15})});wrap('Кристаллы также можно получить в игре: за звёзды, победы и достижения.',180,100+it.length*76,290,13,18,'#8a7a66')},
 notif(){bg();icon('ic_2',180,LH*.24,90);panel(24,LH*.36,312,250);wrap('Напомнить, когда всё будет готово?',180,LH*.36+36,270,22,28,'#e9c46a');
  wrap('Сундук трофеев, энергия и улучшения башен — пришлём одно уведомление, не чаще раза в день и не ночью.',180,LH*.36+104,270,14,20,'#d8c8a8');
  btn(44,LH*.36+168,272,52,'Да, напомнить',()=>{S.pAsked=1;save();try{PB.ask()}catch(e){}const f=notifNext;notifNext=null;f?f():scr='menu'},{sz:20});
  link(180,LH*.36+238,'Не сейчас',()=>{S.pAsked=1;save();ev('push_permission',{granted:false,skipped:true});const f=notifNext;notifNext=null;f?f():scr='menu'})},
 set(){bg();back();title('Настройки');panel(14,66,332,Math.min(LH-80,500));let y=92;const D=36,sv=()=>{save();pushRem();sendToken()};
  tog(30,y,300,'Звук',S.snd,()=>{S.snd=!S.snd;save()});tog(30,y+=D,300,'Музыка',S.mus,()=>{S.mus=!S.mus;save();music()});
  tog(30,y+=D,300,'Персонализ. реклама',S.pers,()=>{S.pers=!S.pers;save();try{B&&B.setConsent(S.pers)}catch(e){}});tog(30,y+=D,300,'Аналитика',S.an,()=>{S.an=!S.an;save();try{AP&&AP.setConsent(S.an)}catch(e){}});
  txt('Уведомления'+(PB&&perm()!='granted'?' (выключены в системе)':''),180,y+=D,14,'#e9c46a');CATN.forEach(c=>tog(30,y+=D-2,300,c[1],S.cats[c[0]],()=>{S.cats[c[0]]=!S.cats[c[0]];if(S.cats[c[0]]&&PB&&perm()=='default')PB.ask();sv()}));
  txt('Профиль: '+(S.nick||'Гость'),30,y+=D,15,'#c9b48a','left');btn(30,y+=18,300,40,resetAsk?'Точно сбросить?':'Сбросить прогресс',()=>{if(!resetAsk){resetAsk=1;setTimeout(()=>resetAsk=0,3000);return}const k={consent:S.consent,pers:S.pers,an:S.an,cats:S.cats,pAsked:S.pAsked,nick:S.nick,prov:S.prov};S=Object.assign({},DEF,k,{up:{a:0,f:0,i:0,k:0,b:0,p:0,l:0,h:0,c:0},upT:{},stars:[],mt:{gold:0,lives:0,nova:0,bounty:0}});save();resetAsk=0;toast('Прогресс сброшен')},{alt:1,sz:15});
  txt('Версия 0.6.1',180,Math.min(LH-20,y+60),12,'#6a5a4a')},
 lb(){bg();back();title('Рейтинг');panel(14,70,332,70);txt('Ваш результат',180,88,14,'#b8a688');txt('★ '+starsTotal()+'   ·   побед: '+S.wins+'   ·   убито: '+S.kills,180,116,16,'#ffd75a');
  const vk=AP&&AP.vkAvail&&AP.vkAvail();let y=156;
  if(S.prov=='vk'){txt('Вы вошли как '+(S.nick||'игрок')+' (VK ID)',180,y+10,15,'#c9b48a');link(180,y+36,'Выйти',vkOut);y+=56}
  else if(PL.social){if(PL.social.share){btn(40,y,280,44,'📣 Рассказать друзьям',()=>PL.social.share(),{sz:16});btn(40,y+52,280,44,'✉ Пригласить друзей',()=>PL.social.invite(),{alt:1,sz:16})}y+=104}
  else{btn(40,y,280,48,'Войти через VK ID',()=>{if(vk){try{AP.vkLogin('ru')}catch(e){}}else toast('Вход через VK ID — в приложении')},{sz:18});btn(40,y+56,280,44,'Войти с Яндекс ID',()=>toast('Вход с Яндекс ID — скоро'),{dis:1,sz:16});y+=112}
  const rows=(LB||[]).slice(0,Math.max(0,Math.floor((LH-y-20)/30)));if(!rows.length)wrap(AP?'Таблица загружается или пока пуста.':'Онлайн-таблица — в приложении.',180,y+24,300,14,20,'#8a7a66');
  rows.forEach((r,i)=>{const yy=y+i*30;cx.fillStyle=i%2?'rgba(40,16,20,.7)':'rgba(60,20,26,.7)';cx.fillRect(14,yy,332,28);txt((i+1)+'.',34,yy+14,14,'#e9c46a','left');txt(String(r.nickname||r.nick||'Игрок').slice(0,18),64,yy+14,14,'#ecd9a3','left');txt('★ '+(r.score|0),332,yy+14,14,'#ffd75a','right')})},
 ach(){bg();back();title('Достижения');gemBox();const A=[['Первая кровь','Пройти уровень',S.wins,1],['Идеальная оборона','3 звезды на уровне',Math.max(0,...S.stars.map(x=>x||0)),3],['Чистильщик','Убить 100 врагов',S.kills,100],['Истребитель','Убить 1000 врагов',S.kills,1000],
  ['Зодчий','Построить 30 башен',S.built,30],['Мастер','Улучшить башню до макс.',S.maxed,1],['Привратник пал','Победить босса',S.boss,1],['Хранитель Склепов','Все уровни на 3★',starsTotal(),LV.length*3]];
  const h=Math.min(56,(LH-80)/A.length);A.forEach((a,i)=>{const y=70+i*h,ok=a[2]>=a[3];cx.fillStyle=ok?'rgba(122,16,32,.5)':'rgba(30,14,16,.85)';rr(14,y,332,h-6,6);cx.fill();cx.strokeStyle=ok?'#d4a62a':'#4a3a2a';cx.lineWidth=1;cx.stroke();
   icon(ok?'ic_1':'ic_0',38,y+(h-6)/2,h-16);txt(a[0],64,y+15,15,ok?'#ffd75a':'#ecd9a3','left');txt(a[1],64,y+33,11,'#a89878','left');const p=Math.min(1,a[2]/a[3]);cx.fillStyle='#2a1a1a';cx.fillRect(240,y+(h-6)/2-4,96,8);cx.fillStyle=ok?'#d4a62a':'#7a1020';cx.fillRect(240,y+(h-6)/2-4,96*p,8);txt(Math.min(a[2],a[3])+'/'+a[3],288,y+(h-6)/2+12,10,'#a89878')})},
 other(){bg();back();title('Другие игры');const h=Math.min(78,(LH-80)/Math.max(1,CP.length));CP.forEach((g,i)=>{const y=72+i*h;panel(14,y,332,h-6);const im=IM['cp_'+g.package];if(im&&im.naturalWidth)cx.drawImage(im,24,y+8,h-22,h-22);
  txt(g.name,h+14,y+20,15,'#ecd9a3','left');cx.save();cx.beginPath();cx.rect(h+10,y+30,250-h,30);cx.clip();txt(g.pitch||'',h+14,y+42,11,'#a89878','left');cx.restore();btn(262,y+(h-6)/2-17,76,34,'Открыть',()=>openGame(g.package),{sz:14})})}};
function openGame(p){try{if(AP&&AP.openUrl){AP.openUrl('rustore://apps.rustore.ru/app/'+p,'https://www.rustore.ru/catalog/app/'+p);return}}catch(e){}window.open('https://www.rustore.ru/catalog/app/'+p,'_blank')}
function applyConsent(){S.consent=1;save();try{B&&B.setConsent(S.pers);AP&&AP.setConsent&&AP.setConsent(S.an)}catch(e){}bannerOn();scr='menu';ev('consent',{pers:S.pers,an:S.an})}
// ---------- loop & input ----------
let last=performance.now();
function frame(t){const dt=Math.min(.05,(t-last)/1000);last=t;T+=dt;if((T*4|0)!=(T*4-dt*4|0))tick();if(toastT>0)toastT-=dt;
 if(scr=='play'&&!paused&&G&&!G.over)for(let i=0;i<spd;i++)step(dt);
 if(scr!=prevScr){prevScr=scr;scrT=0}scrT+=dt;cx.setTransform(K,0,0,K,0,0);BT=[];(SCR[scr]||SCR.menu)();if(scrT<.3){cx.fillStyle='rgba(5,1,3,'+(1-scrT/.3)+')';cx.fillRect(0,0,360,LH)}
 cx.fillStyle='#070304';cx.fillRect(0,LH,360,FULL-LH);if(!B&&scr!='splash'&&!Q.has('scr')){cx.strokeStyle='#3a2a22';cx.strokeRect(1,LH+1,358,FULL-LH-2);txt('Рекламный баннер (вне игрового поля)',180,(LH+FULL)/2,11,'#5a4a3a')}
 if(toastT>0){cx.globalAlpha=Math.min(1,toastT*2);cx.fillStyle='rgba(20,8,10,.9)';cx.font='15px AlegreyaSC, Georgia, serif';let tn=1,tl='';for(const q of toastS.split(' ')){const t=tl?tl+' '+q:q;if(cx.measureText(t).width>300&&tl){tn++;tl=q}else tl=t}const th=16+tn*19;rr(20,LH-120-th/2+18,320,th,8);cx.fill();wrap(toastS,180,LH-102-(tn-1)*9.5,300,15,19,'#f6e0a8');cx.globalAlpha=1}
 requestAnimationFrame(frame)}
let first=1;
const PT=new Map();let pin=null;const lp=e=>[(e.clientX-OX)*360/CW,(e.clientY-OY)*360/CW];
cv.addEventListener('pointerdown',e=>{const[x,y]=lp(e);if(first){first=0;music()}
 for(let i=BT.length-1;i>=0;i--){const b=BT[i];if(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h){snd('click',.35);b.fn();return}}if(scr!='play')return;PT.set(e.pointerId,{x,y,sx:x,sy:y,mv:0});
 if(PT.size==2){const[a,b]=[...PT.values()];pin={d:Math.hypot(a.x-b.x,a.y-b.y),z:cam.z}}});
cv.addEventListener('pointermove',e=>{const p=PT.get(e.pointerId);if(!p||!G)return;const[x,y]=lp(e),dx=x-p.x,dy=y-p.y;p.x=x;p.y=y;if(Math.hypot(x-p.sx,y-p.sy)>8)p.mv=1;
 if(PT.size==2&&pin){const[a,b]=[...PT.values()],mx=(a.x+b.x)/2,my=(a.y+b.y)/2,wx=mx/cam.z+cam.x,wy=my/cam.z+cam.y;cam.z=pin.z*Math.hypot(a.x-b.x,a.y-b.y)/pin.d;clampCam();cam.x=wx-mx/cam.z;cam.y=wy-my/cam.z;clampCam();return}
 if(p.mv){G.intro=0;cam.x-=dx/cam.z;cam.y-=dy/cam.z;clampCam()}});
const pu=e=>{const p=PT.get(e.pointerId);if(!p)return;PT.delete(e.pointerId);if(PT.size<2)pin=null;if(!p.mv&&PT.size==0&&scr=='play')fieldTap(p.x,p.y)};
cv.addEventListener('pointerup',pu);cv.addEventListener('pointercancel',e=>PT.delete(e.pointerId));
cv.addEventListener('wheel',e=>{if(scr!='play'||!G)return;const[x,y]=lp(e),wx=x/cam.z+cam.x,wy=y/cam.z+cam.y;cam.z*=e.deltaY<0?1.1:.9;clampCam();cam.x=wx-x/cam.z;cam.y=wy-y/cam.z;clampCam()},{passive:true});
window.G={back(){if(scr=='play'){if(G.place){G.place=null;G.ghost=null}else if(G.sel)G.sel=null;else paused=!paused}else if(scr=='squad')scr='map';else if(scr=='consentSet')scr='consent';else if(scr!='menu'&&scr!='consent'&&scr!='splash')scr='menu'},bg(){anFlush();if(scr=='play')paused=true;mus&&mus.pause()}};
document.addEventListener('visibilitychange',()=>{if(document.hidden)window.G.bg();else if(!first)music()});
if(S.consent!=null)setTimeout(()=>{try{B&&B.setConsent(S.pers);AP&&AP.setConsent&&AP.setConsent(S.an)}catch(e){}bannerOn()},600);setInterval(()=>{if(S.consent!=null&&!document.hidden)bannerOn()},5000);
setTimeout(()=>{try{const o=PB&&PB.takeOpen();if(o)__pushOpen(o)}catch(e){}tick();pushRem();sendToken()},1200);
// ---------- скриншот-режим для макетов: ?scr=имя ----------
if(Q.has('scr')){const w=Q.get('scr');setTimeout(()=>{if(['play','win','lose','boss','place'].includes(w)){const lv=w=='boss'?+(Q.get('lv')||29):+(Q.get('lv')||2);G&&0;startLevel(lv);G.intro=0;G.gold=9999;const ok=[];for(let r=2;r<G.H-1;r++)for(let c=0;c<MW;c++)if(canBuild(c,r))ok.push([c,r]);
 const ks=['a','f','i','k'];const ks2=tUnl(lv);for(let n=0;n<14;n++){const[c,r]=ok[(n*37)%ok.length];build(c,r,ks2[n%ks2.length]);const t=G.tw[G.tw.length-1];if(t){t.l=n%4;if(t.l==3)t.br=n%2}}G.wave=w=='boss'?G.L.waves-1:3;G.cd=0;startWave();for(let i=0;i<60*(w=='boss'?9:7);i++)step(1/60);
 G.gold=185;G.lives=w=='lose'?0:16;cam.z=1;clampCam();const e=G.en[0];if(e){cam.y=e.y*CS0-LH/2;clampCam()}if(w=='lose'){G.over=1;G.cont=false}if(w=='win'){G.lives=19;win()}if(w=='place'){G.place='f';G.ghost=ok[5]}scr=['win','lose'].includes(w)?w:'play';if(Q.has('freeze'))spd=0}
  else{if(w=='squad')selLv=2;if(w=='map')S.stars=[3,2];if(w=='ach'){S.wins=2;S.kills=340;S.built=12;S.maxed=1;S.stars=[3,2]}if(w=='up'){S.gems=85;S.up={a:2,f:1,i:0,k:3}}scr=w}},1500)}
if(Q.has('test'))window.__td={tUnl,repair,startLevel,step,build,upgrade,canBuild,callWave,G:()=>G,TT,LV,MW,S:()=>S};
resize();requestAnimationFrame(frame);
})();
