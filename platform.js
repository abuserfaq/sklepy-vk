// Platform layer for «Склепы»: android (native bridges, untouched) | vk (VK Games / OK via vk-bridge) | fs (Fotostrana iframe) | web.
// On vk/fs it installs a window.AdBridge shim so td.js keeps one ad code path. No secrets here: VK launch params and the
// FS authKey (= md5(apiId_viewerId_serverKey)) are verified by the backend on register.
(function(){
const W=window, NATIVE=!!W.AppBridge;
const tryf=(f,d)=>{try{return f()}catch(e){return d}};
const Q=tryf(()=>new URLSearchParams(location.search),new URLSearchParams());
const isVK=!NATIVE&&!!(Q.get('vk_app_id')||Q.get('vk_platform'))&&!!W.vkBridge;
const isFS=!NATIVE&&!isVK&&!!(Q.get('apiId')&&Q.get('viewerId')&&Q.get('authKey'));
const VB=W.vkBridge, vsend=(m,p)=>{try{return VB.send(m,p||{}).catch(()=>null)}catch(e){return Promise.resolve(null)}};
const onOK=Q.get('vk_client')==='ok';
// [key, title, price (голоса | ОК | ФМ), FS itemId] — must match game_backend lb/vk_pay.py ITEMS.sklepy_td / lb/fs_pay.py FS_ITEMS.sklepy_td
const VKI=[['gems_60','60 кристаллов',3],['gems_200','200 кристаллов',8],['gems_600','600 кристаллов',20],['gems_1500','1500 кристаллов',45]];
const OKI=[['gems_60','60 кристаллов',20],['gems_200','200 кристаллов',55],['gems_600','600 кристаллов',140],['gems_1500','1500 кристаллов',300]];
const FSI=[['gems_60','60 кристаллов',20,1],['gems_200','200 кристаллов',55,2],['gems_600','600 кристаллов',140,3],['gems_1500','1500 кристаллов',300,4]];
let P={id:NATIVE?'android':'web',web:!NATIVE,social:null,launchQS:location.search.slice(1),reg:()=>({platform:'web'})};
if(isVK){
  let rw=false,bWant=false,bReady=false;const chk=()=>vsend('VKWebAppCheckNativeAds',{ad_format:'reward'}).then(r=>{rw=!!(r&&r.result)});
  const bShow=on=>{bWant=on;if(!bReady)return;on?vsend('VKWebAppShowBannerAd',{banner_location:'bottom',layout_type:'resize',can_close:false}):vsend('VKWebAppHideBannerAd')};
  const go=()=>{if(bReady)return;bReady=true;if(bWant)bShow(true)}; // no banner right at launch
  W.addEventListener('pointerdown',()=>setTimeout(go,1500),{once:true});setTimeout(go,30000);
  const app=Q.get('vk_app_id')||'';
  W.AdBridge={slotDp:()=>0,banner:on=>bShow(!!on),enabled:()=>rw,setConsent:()=>{},interstitialEnabled:()=>false,showInterstitial:()=>{},
    showRewarded:k=>{vsend('VKWebAppShowNativeAds',{ad_format:'reward'}).then(r=>{const ok=!!(r&&r.result);if(ok&&W.__adImp)W.__adImp('rewarded');W.__adResult&&W.__adResult(k,ok);chk()})}};
  P=Object.assign(P,{id:'vk',reg:()=>({platform:onOK?'ok':'vk',vk:P.launchQS}),social:{cur:onOK?'ОК':'гол.',items:onOK?OKI:VKI,
    pay:key=>vsend('VKWebAppShowOrderBox',{type:'item',item:key}).then(r=>!!(r&&(r.success||r.status==='success'))),
    share:()=>vsend('VKWebAppShare',{link:'https://vk.com/app'+app}),invite:()=>vsend('VKWebAppShowInviteBox')}});
  vsend('VKWebAppInit').then(chk);
}else if(isFS){
  let fsC=null,fsP=null;const pend=new Set();
  const load=()=>fsP||(fsP=new Promise(res=>{const cfg=W.FS_CFG||{};let u=null;try{u=new URL(Q.get('fsapi')||'');if(u.protocol==='http:')u.protocol='https:'}catch(e){}
    if(!u||!/(^|\.)(fotostrana\.ru|fsimg\.ru|fotocdn\.net)$/.test(u.hostname)||!cfg.clientKey)return res(null);
    const s=document.createElement('script');s.src=u.href;s.async=true;s.onerror=()=>res(null);
    s.onload=()=>{try{fsC=new W.fsapi(Q.get('apiId')||cfg.appId,cfg.clientKey);fsC.init(()=>{pend.forEach(f=>f(false));pend.clear()});res(fsC)}catch(e){res(null)}};document.head.appendChild(s)}));
  W.AdBridge={slotDp:()=>0,banner:()=>{},enabled:()=>false,setConsent:()=>{},interstitialEnabled:()=>false,showInterstitial:()=>{},showRewarded:k=>{W.__adResult&&W.__adResult(k,false)}};
  P=Object.assign(P,{id:'fs',reg:()=>({platform:'fotostrana',fs:P.launchQS}),social:{cur:'ФМ',items:FSI,
    pay:key=>load().then(c=>new Promise(res=>{const it=P.social.items.find(i=>i[0]===key);if(!c||!it)return res(false);const done=ok=>{if(pend.delete(done))res(ok)};pend.add(done);
      try{c.event('buyItemCallback',r=>done(!!(r&&r.result==='success')),Object.assign({itemId:it[3],name:it[1],priceFmCents:Math.round(it[2]*100),amount:1,picUrl:((W.FS_CFG||{}).imgBase||'')+'gem.png'},((W.FS_CFG||{}).debugViewerIds||[]).map(String).includes(String(Q.get('viewerId')))?{isDebug:1}:{}))}catch(e){done(false)}}))}});
  load();
}
// Prices from signed /v2/config `shop` (admin /admin/prices); hardcoded lists above are fallback only. Disabled items are absent.
P.applyShop=sh=>{try{if(!P.social||!sh)return;const l=sh[P.id==='fs'?'fs':onOK?'ok':'vk'];if(!Array.isArray(l))return;
  const it=l.filter(i=>i&&i.id&&i.enabled!==false&&i.on!==false&&+i.price>0).map(i=>[String(i.id),String(i.title||i.id),+i.price,i.fs_id]);
  if(P.id==='fs'&&it.some(i=>!i[3]))return;P.social.items.splice(0,P.social.items.length,...it)}catch(e){}};
W.Platform=P;
})();
