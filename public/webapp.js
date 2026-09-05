var A0=Object.defineProperty;var z0=(e)=>e;function O0(e,t){this[e]=z0.bind(null,t)}var Mi=(e,t)=>{for(var r in t)A0(e,r,{get:t[r],enumerable:!0,configurable:!0,set:O0.bind(t,r)})};var tr=(e,t)=>()=>(e&&(t=e(e=0)),t);var Bi=((e)=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(t,r)=>(typeof require<"u"?require:t)[r]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')});class Ht{constructor(){this.listeners={},this.retainedEventArguments={},this.windowListeners={}}addListener(e,t){let r=!1;if(!this.listeners[e])this.listeners[e]=[],r=!0;this.listeners[e].push(t);let n=this.windowListeners[e];if(n&&!n.registered)this.addWindowListener(n);if(r)this.sendRetainedArgumentsForEvent(e);return Promise.resolve({remove:async()=>this.removeListener(e,t)})}async removeAllListeners(){this.listeners={};for(let e in this.windowListeners)this.removeWindowListener(this.windowListeners[e]);this.windowListeners={}}notifyListeners(e,t,r){let i=this.listeners[e];if(!i){if(r){let n=this.retainedEventArguments[e];if(!n)n=[];n.push(t),this.retainedEventArguments[e]=n}return}i.forEach((n)=>n(t))}hasListeners(e){var t;return!!((t=this.listeners[e])===null||t===void 0?void 0:t.length)}registerWindowListener(e,t){this.windowListeners[t]={registered:!1,windowEventName:e,pluginEventName:t,handler:(r)=>{this.notifyListeners(t,r)}}}unimplemented(e="not implemented"){return new ft.Exception(e,Gt.Unimplemented)}unavailable(e="not available"){return new ft.Exception(e,Gt.Unavailable)}async removeListener(e,t){let r=this.listeners[e];if(!r)return;let i=r.indexOf(t);if(this.listeners[e].splice(i,1),!this.listeners[e].length)this.removeWindowListener(this.windowListeners[e])}addWindowListener(e){window.addEventListener(e.windowEventName,e.handler),e.registered=!0}removeWindowListener(e){if(!e)return;window.removeEventListener(e.windowEventName,e.handler),e.registered=!1}sendRetainedArgumentsForEvent(e){let t=this.retainedEventArguments[e];if(!t)return;delete this.retainedEventArguments[e],t.forEach((r)=>{this.notifyListeners(e,r)})}}var Gt,Ur,R0=(e)=>{var t,r;if(e===null||e===void 0?void 0:e.androidBridge)return"android";else if((r=(t=e===null||e===void 0?void 0:e.webkit)===null||t===void 0?void 0:t.messageHandlers)===null||r===void 0?void 0:r.bridge)return"ios";else return"web"},M0=(e)=>{let t=e.CapacitorCustomPlatform||null,r=e.Capacitor||{},i=r.Plugins=r.Plugins||{},n=()=>t!==null?t.name:R0(e),a=()=>n()!=="web",s=(c)=>{let g=p.get(c);if(g===null||g===void 0?void 0:g.platforms.has(n()))return!0;if(u(c))return!0;return!1},u=(c)=>{var g;return(g=r.PluginHeaders)===null||g===void 0?void 0:g.find((b)=>b.name===c)},l=(c)=>e.console.error(c),p=new Map,h=(c,g={})=>{let b=p.get(c);if(b)return console.warn(`Capacitor plugin "${c}" already registered. Cannot register plugins twice.`),b.proxy;let y=n(),w=u(c),k,S=async()=>{if(!k&&y in g)k=typeof g[y]==="function"?k=await g[y]():k=g[y];else if(t!==null&&!k&&"web"in g)k=typeof g.web==="function"?k=await g.web():k=g.web;return k},_=(v,N)=>{var q,F;if(w){let W=w===null||w===void 0?void 0:w.methods.find((G)=>N===G.name);if(W)if(W.rtype==="promise")return(G)=>r.nativePromise(c,N.toString(),G);else return(G,ae)=>r.nativeCallback(c,N.toString(),G,ae);else if(v)return(q=v[N])===null||q===void 0?void 0:q.bind(v)}else if(v)return(F=v[N])===null||F===void 0?void 0:F.bind(v);else throw new Ur(`"${c}" plugin is not implemented on ${y}`,Gt.Unimplemented)},I=(v)=>{let N,q=(...F)=>{let W=S().then((G)=>{let ae=_(G,v);if(ae){let z=ae(...F);return N=z===null||z===void 0?void 0:z.remove,z}else throw new Ur(`"${c}.${v}()" is not implemented on ${y}`,Gt.Unimplemented)});if(v==="addListener")W.remove=async()=>N();return W};return q.toString=()=>`${v.toString()}() { [capacitor code] }`,Object.defineProperty(q,"name",{value:v,writable:!1,configurable:!1}),q},T=I("addListener"),C=I("removeListener"),A=(v,N)=>{let q=T({eventName:v},N),F=async()=>{let G=await q;C({eventName:v,callbackId:G},N)},W=new Promise((G)=>q.then(()=>G({remove:F})));return W.remove=async()=>{console.warn("Using addListener() without 'await' is deprecated."),await F()},W},O=new Proxy({},{get(v,N){switch(N){case"$$typeof":return;case"toJSON":return()=>({});case"addListener":return w?A:T;case"removeListener":return C;default:return I(N)}}});return i[c]=O,p.set(c,{name:c,proxy:O,platforms:new Set([...Object.keys(g),...w?[y]:[]])}),O};if(!r.convertFileSrc)r.convertFileSrc=(c)=>c;return r.getPlatform=n,r.handleError=l,r.isNativePlatform=a,r.isPluginAvailable=s,r.registerPlugin=h,r.Exception=Ur,r.DEBUG=!!r.DEBUG,r.isLoggingEnabled=!!r.isLoggingEnabled,r},B0=(e)=>e.Capacitor=M0(e),ft,rr,Io=(e)=>encodeURIComponent(e).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape),Co=(e)=>e.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent),Oo,wb,D0=async(e)=>new Promise((t,r)=>{let i=new FileReader;i.onload=()=>{let n=i.result;t(n.indexOf(",")>=0?n.split(",")[1]:n)},i.onerror=(n)=>r(n),i.readAsDataURL(e)}),N0=(e={})=>{let t=Object.keys(e);return Object.keys(e).map((n)=>n.toLocaleLowerCase()).reduce((n,a,s)=>(n[a]=e[t[s]],n),{})},P0=(e,t=!0)=>{if(!e)return null;return Object.entries(e).reduce((i,n)=>{let[a,s]=n,u,l;if(Array.isArray(s))l="",s.forEach((p)=>{u=t?encodeURIComponent(p):p,l+=`${a}=${u}&`}),l.slice(0,-1);else u=t?encodeURIComponent(s):s,l=`${a}=${u}`;return`${i}&${l}`},"").substr(1)},U0=(e,t={})=>{let r=Object.assign({method:e.method||"GET",headers:e.headers},t),n=N0(e.headers)["content-type"]||"";if(typeof e.data==="string")r.body=e.data;else if(n.includes("application/x-www-form-urlencoded")){let a=new URLSearchParams;for(let[s,u]of Object.entries(e.data||{}))a.set(s,u);r.body=a.toString()}else if(n.includes("multipart/form-data")||e.data instanceof FormData){let a=new FormData;if(e.data instanceof FormData)e.data.forEach((u,l)=>{a.append(l,u)});else for(let u of Object.keys(e.data))a.append(u,e.data[u]);r.body=a;let s=new Headers(r.headers);s.delete("content-type"),r.headers=s}else if(n.includes("application/json")||typeof e.data==="object")r.body=JSON.stringify(e.data);return r},Ro,vb,Ao,zo,Mo,$b;var ir=tr(()=>{/*! Capacitor: https://capacitorjs.com/ - MIT License */(function(e){e.Unimplemented="UNIMPLEMENTED",e.Unavailable="UNAVAILABLE"})(Gt||(Gt={}));Ur=class Ur extends Error{constructor(e,t,r){super(e);this.message=e,this.code=t,this.data=r}};ft=B0(typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{}),rr=ft.registerPlugin;Oo=class Oo extends Ht{async getCookies(){let e=document.cookie,t={};return e.split(";").forEach((r)=>{if(r.length<=0)return;let[i,n]=r.replace(/=/,"CAP_COOKIE").split("CAP_COOKIE");i=Co(i).trim(),n=Co(n).trim(),t[i]=n}),t}async setCookie(e){try{let t=Io(e.key),r=Io(e.value),i=e.expires?`; expires=${e.expires.replace("expires=","")}`:"",n=(e.path||"/").replace("path=",""),a=e.url!=null&&e.url.length>0?`domain=${e.url}`:"";document.cookie=`${t}=${r||""}${i}; path=${n}; ${a};`}catch(t){return Promise.reject(t)}}async deleteCookie(e){try{document.cookie=`${e.key}=; Max-Age=0`}catch(t){return Promise.reject(t)}}async clearCookies(){try{let e=document.cookie.split(";")||[];for(let t of e)document.cookie=t.replace(/^ +/,"").replace(/=.*/,`=;expires=${new Date().toUTCString()};path=/`)}catch(e){return Promise.reject(e)}}async clearAllCookies(){try{await this.clearCookies()}catch(e){return Promise.reject(e)}}};wb=rr("CapacitorCookies",{web:()=>new Oo});Ro=class Ro extends Ht{async request(e){let t=U0(e,e.webFetchExtra),r=P0(e.params,e.shouldEncodeUrlParams),i=r?`${e.url}?${r}`:e.url,n=await fetch(i,t),a=n.headers.get("content-type")||"",{responseType:s="text"}=n.ok?e:{};if(a.includes("application/json"))s="json";let u,l;switch(s){case"arraybuffer":case"blob":l=await n.blob(),u=await D0(l);break;case"json":u=await n.json();break;case"document":case"text":default:u=await n.text()}let p={};return n.headers.forEach((h,c)=>{p[c]=h}),{data:u,headers:p,status:n.status,url:n.url}}async get(e){return this.request(Object.assign(Object.assign({},e),{method:"GET"}))}async post(e){return this.request(Object.assign(Object.assign({},e),{method:"POST"}))}async put(e){return this.request(Object.assign(Object.assign({},e),{method:"PUT"}))}async patch(e){return this.request(Object.assign(Object.assign({},e),{method:"PATCH"}))}async delete(e){return this.request(Object.assign(Object.assign({},e),{method:"DELETE"}))}};vb=rr("CapacitorHttp",{web:()=>new Ro});(function(e){e.Dark="DARK",e.Light="LIGHT",e.Default="DEFAULT"})(Ao||(Ao={}));(function(e){e.StatusBar="StatusBar",e.NavigationBar="NavigationBar"})(zo||(zo={}));Mo=class Mo extends Ht{async setStyle(){this.unavailable("not available for web")}async setAnimation(){this.unavailable("not available for web")}async show(){this.unavailable("not available for web")}async hide(){this.unavailable("not available for web")}};$b=rr("SystemBars",{web:()=>new Mo})});var cm={};Mi(cm,{InferenceSession:()=>ia,TRACE:()=>$r,TRACE_EVENT_BEGIN:()=>_t,TRACE_EVENT_END:()=>wt,TRACE_FUNC_BEGIN:()=>Xe,TRACE_FUNC_END:()=>qe,Tensor:()=>Ye,default:()=>pb,env:()=>we,registerBackend:()=>Bt});async function Vo(e={}){var t=e,r=!!globalThis.window,i=!!globalThis.WorkerGlobalScope,n=i&&self.name?.startsWith("em-pthread");t.mountExternalData=(o,d)=>{o.startsWith("./")&&(o=o.substring(2)),(t.Yc||(t.Yc=new Map)).set(o,d)},t.unmountExternalData=()=>{delete t.Yc,delete t.Zd,delete t.Yd,delete t.$d},globalThis.SharedArrayBuffer??new WebAssembly.Memory({initial:0,maximum:0,shared:!0}).buffer.constructor;let a=(o)=>async(...d)=>{try{if(t.Xc)throw Error("Session already started");let m=t.Xc={Kd:d[0],errors:[]},f=await o(...d);if(t.Xc!==m)throw Error("Session mismatch");t.dd?.flush();let x=m.errors;if(0<x.length){let E=await Promise.all(x);if(E=E.filter((R)=>R),0<E.length)throw Error(E.join(`
`))}return f}finally{t.Xc=null}};t.jsepInit=(o,d)=>{if(o==="webgpu"){[t.dd,t.Ad,t.Ed,t.ed,t.Dd,t.$b,t.Fd,t.Hd,t.Bd,t.Cd,t.Gd]=d;let m=t.dd;t.jsepRegisterBuffer=(f,x,E,R)=>m.registerBuffer(f,x,E,R),t.jsepGetBuffer=(f)=>m.getBuffer(f),t.jsepCreateDownloader=(f,x,E)=>m.createDownloader(f,x,E),t.jsepOnCreateSession=(f)=>{m.onCreateSession(f)},t.jsepOnReleaseSession=(f)=>{m.onReleaseSession(f)},t.jsepOnRunStart=(f)=>m.onRunStart(f),t.Id=(f,x)=>{m.upload(f,x)}}else if(o==="webnn"){let m=d[0];[t.Sd,t.sd,t.webnnEnsureTensor,t.td,t.webnnDownloadTensor,t.Rd,t.webnnEnableTraceEvent]=d.slice(1),t.webnnReleaseTensorId=t.sd,t.webnnUploadTensor=t.td,t.webnnRegisterMLContext=t.Rd,t.webnnOnRunStart=(f)=>m.onRunStart(f),t.webnnOnRunEnd=m.onRunEnd.bind(m),t.webnnOnReleaseSession=(f)=>{m.onReleaseSession(f)},t.webnnCreateMLTensorDownloader=(f,x)=>m.createMLTensorDownloader(f,x),t.webnnRegisterMLTensor=(f,x,E,R)=>m.registerMLTensor(f,x,E,R),t.webnnCreateMLContext=(f)=>m.createMLContext(f),t.webnnRegisterGraphInput=m.registerGraphInput.bind(m),t.webnnIsGraphInput=m.isGraphInput.bind(m),t.webnnRegisterGraphOutput=m.registerGraphOutput.bind(m),t.webnnIsGraphOutput=m.isGraphOutput.bind(m),t.webnnCreateTemporaryTensor=m.createTemporaryTensor.bind(m),t.webnnIsGraphInputOutputTypeSupported=m.isGraphInputOutputTypeSupported.bind(m)}};let s=()=>{let o=(d)=>(...m)=>{let f=Je;return m=d(...m),Je!=f?new Promise((x,E)=>{vi={resolve:x,reject:E}}):m};(()=>{for(let d of["_OrtAppendExecutionProvider","_OrtCreateSession","_OrtRun","_OrtRunWithBinding","_OrtBindInput"])t[d]=o(t[d])})(),a!==void 0&&(t._OrtRun=a(t._OrtRun),t._OrtRunWithBinding=a(t._OrtRunWithBinding)),s=void 0};t.asyncInit=()=>{s?.()};var u,l,p=(o,d)=>{throw d},h=import.meta.url,c="";if(r||i){try{c=new URL(".",h).href}catch{}i&&(l=(o)=>{var d=new XMLHttpRequest;return d.open("GET",o,!1),d.responseType="arraybuffer",d.send(null),new Uint8Array(d.response)}),u=async(o)=>{if(O(o))return new Promise((m,f)=>{var x=new XMLHttpRequest;x.open("GET",o,!0),x.responseType="arraybuffer",x.onload=()=>{x.status==200||x.status==0&&x.response?m(x.response):f(x.status)},x.onerror=f,x.send(null)});var d=await fetch(o,{credentials:"same-origin"});if(d.ok)return d.arrayBuffer();throw Error(d.status+" : "+d.url)}}var g,b,y,w,k,S,_=console.log.bind(console),I=console.error.bind(console),T=_,C=I,A=!1,O=(o)=>o.startsWith("file://");function v(){dt.buffer!=F.buffer&&Y()}if(n){let o=function(d){try{var m=d.data,f=m.Sc;if(f==="load"){let x=[];self.onmessage=(E)=>x.push(E),S=()=>{postMessage({Sc:"loaded"});for(let E of x)o(E);self.onmessage=o};for(let E of m.xd)t[E]&&!t[E].proxy||(t[E]=(...R)=>{postMessage({Sc:"callHandler",vd:E,args:R})},E=="print"&&(T=t[E]),E=="printErr"&&(C=t[E]));dt=m.Od,Y(),b=m.Pd,xe(),Pr()}else if(f==="run"){(function(x){var E=(v(),L)[x+52>>>2>>>0];x=(v(),L)[x+56>>>2>>>0],Ns(E,E-x),ue(E)})(m.Rc),Ti(m.Rc,0,0,1,0,0),Pa(),bi(m.Rc),q||(zs(),q=!0);try{wm(m.Md,m.bd)}catch(x){if(x!="unwind")throw x}}else m.target!=="setimmediate"&&(f==="checkMailbox"?q&&zr():f&&(C(`worker: received unknown command ${f}`),C(m)))}catch(x){throw Os(),x}};var N=o,q=!1;self.onunhandledrejection=(d)=>{throw d.reason||d},self.onmessage=o}var F,W,G,ae,z,L,te,re,Q,se,P,J=!1;function Y(){var o=dt.buffer;t.HEAP8=F=new Int8Array(o),G=new Int16Array(o),t.HEAPU8=W=new Uint8Array(o),ae=new Uint16Array(o),t.HEAP32=z=new Int32Array(o),t.HEAPU32=L=new Uint32Array(o),te=new Float32Array(o),re=new Float64Array(o),Q=new BigInt64Array(o),se=new BigUint64Array(o)}function K(){J=!0,n?S():it.sb()}function ve(o){throw C(o="Aborted("+o+")"),A=!0,o=new WebAssembly.RuntimeError(o+". Build with -sASSERTIONS for more info."),k?.(o),o}function Re(){return{a:{ma:Hg,hb:Gg,g:vm,J:$m,f:xm,o:Sm,i:km,$:Tm,b:Em,S:Im,Ia:Ga,n:Cm,aa:Ka,Ya:Za,Ea:Ya,Ga:Xa,Za:Qa,Wa:Ja,Pa:es,Va:ts,ka:rs,Fa:is,Ca:ns,Xa:as,Da:ss,cb:Am,fa:Om,xa:Rm,va:Bm,ea:Nm,N:Pm,H:Um,wa:Lm,_:jm,ya:Km,Sa:Zm,Aa:Xm,Ja:Qm,ta:Jm,ga:eg,Ra:bi,$a:tg,Q:ag,r:dg,c:gi,ib:pg,y:cg,M:hg,D:fg,l:mg,s:fs,jb:gg,I:yg,R:bg,j:_g,u:wg,q:vg,k:$g,Ma:xg,Na:Sg,Oa:kg,Ka:bs,La:_s,ua:ws,eb:Eg,bb:Ag,v:zg,ba:Og,ha:Rg,ab:Ig,V:Mg,_a:Bg,Ba:Dg,F:Tg,T:Ng,la:Dr,za:Ug,gb:Pg,fb:Lg,Ta:Ss,Ua:ks,Ha:ci,U:Ts,ja:Es,Qa:Is,ia:Cs,lb:E0,na:$0,mb:T0,oa:v0,G:p0,e:Zg,t:jg,w:Fg,B:a0,nb:b0,Z:y0,x:Qg,pa:_0,X:x0,ca:g0,ob:m0,pb:f0,O:s0,qa:h0,qb:c0,L:l0,Y:w0,d:Kg,A:Xg,m:Yg,kb:I0,p:e0,z:t0,C:Jg,E:r0,K:o0,ra:d0,P:S0,da:u0,W:k0,rb:n0,sa:i0,h:Vg,a:dt,db:pi}}}async function xe(){function o(f,x){var E=it=f.exports;f={};for(let[R,D]of Object.entries(E))typeof D=="function"?(E=rg(D),f[R]=E):f[R]=D;return it=f,it=function(){var R=it,D=(H)=>(oe)=>H(oe)>>>0,V=(H)=>()=>H()>>>0;return(R=Object.assign({},R)).tb=D(R.tb),R.Xb=V(R.Xb),R.Zb=D(R.Zb),R.lc=D(R.lc),R.mc=V(R.mc),R.qc=D(R.qc),R}(),Da.push(it._b),As=(f=it).tb,zs=f.ub,t._OrtInit=f.vb,t._OrtGetLastError=f.wb,t._OrtCreateSessionOptions=f.xb,t._OrtAppendExecutionProvider=f.yb,t._OrtAddFreeDimensionOverride=f.zb,t._OrtAddSessionConfigEntry=f.Ab,t._OrtReleaseSessionOptions=f.Bb,t._OrtCreateSession=f.Cb,t._OrtReleaseSession=f.Db,t._OrtGetInputOutputCount=f.Eb,t._OrtGetInputOutputMetadata=f.Fb,t._OrtFree=f.Gb,t._OrtCreateTensor=f.Hb,t._OrtGetTensorData=f.Ib,t._OrtReleaseTensor=f.Jb,t._OrtCreateRunOptions=f.Kb,t._OrtAddRunConfigEntry=f.Lb,t._OrtReleaseRunOptions=f.Mb,t._OrtCreateBinding=f.Nb,t._OrtBindInput=f.Ob,t._OrtBindOutput=f.Pb,t._OrtClearBoundOutputs=f.Qb,t._OrtReleaseBinding=f.Rb,t._OrtRunWithBinding=f.Sb,t._OrtRun=f.Tb,t._OrtEndProfiling=f.Ub,t._JsepOutput=f.Vb,t._JsepGetNodeName=f.Wb,Nr=f.Xb,et=t._free=f.Yb,Jt=t._malloc=f.Zb,Ti=f.ac,Os=f.bc,Rs=f.cc,Ms=f.dc,Ei=f.ec,Bs=f.fc,Ds=f.gc,de=f.hc,er=f.ic,Ns=f.jc,ue=f.kc,Ii=f.lc,le=f.mc,Ps=f.nc,Ci=f.oc,Us=f.pc,Ls=f.qc,qs=f.rc,Ai=f.sc,Vs=f.tc,Ws=f.uc,Gs=f.vc,Hs=f.wc,Fs=f.xc,js=f.yc,Ks=f.zc,Zs=f.Ac,Ys=f.Bc,Xs=f.Cc,Qs=f.Dc,Js=f.Ec,eo=f.Fc,to=f.Gc,ro=f.Hc,io=f.Ic,no=f.Jc,ao=f.Kc,so=f.Lc,oo=f.Mc,uo=f.Nc,lo=f.Pc,po=f.Qc,co=f.$c,ho=f.ad,fo=f.fd,mo=f.kd,go=f.ld,yo=f.md,bo=f.nd,_o=f.od,wo=f.pd,vo=f.qd,$o=f.rd,xo=f.wd,So=f.Ud,ko=f.Vd,To=f.Wd,Eo=f.Xd,b=x,it}var d,m=Re();return t.instantiateWasm?new Promise((f)=>{t.instantiateWasm(m,(x,E)=>{f(o(x,E))})}):n?o(new WebAssembly.Instance(b,Re()),b):(P??=t.locateFile?t.locateFile?t.locateFile("ort-wasm-simd-threaded.jsep.wasm",c):c+"ort-wasm-simd-threaded.jsep.wasm":new URL("ort-wasm-simd-threaded.jsep.wasm",import.meta.url).href,d=await async function(f){var x=P;if(!g&&!O(x))try{var E=fetch(x,{credentials:"same-origin"});return await WebAssembly.instantiateStreaming(E,f)}catch(R){C(`wasm streaming compile failed: ${R}`),C("falling back to ArrayBuffer instantiation")}return async function(R,D){try{var V=await async function(H){if(!g)try{var oe=await u(H);return new Uint8Array(oe)}catch{}if(H==P&&g)H=new Uint8Array(g);else{if(!l)throw"both async and sync fetching of the wasm failed";H=l(H)}return H}(R);return await WebAssembly.instantiate(V,D)}catch(H){C(`failed to asynchronously prepare wasm: ${H}`),ve(H)}}(x,f)}(m),o(d.instance,d.module))}class Ie{name="ExitStatus";constructor(o){this.message=`Program terminated with exit(${o})`,this.status=o}}var ge=(o)=>{o.terminate(),o.onmessage=()=>{}},Se=[],Be=0,xt=null,kr=(o)=>{lt.length==0&&(La(),Ua(lt[0]));var d=lt.pop();if(!d)return 6;Xt.push(d),St[o.Rc]=d,d.Rc=o.Rc;var m={Sc:"run",Md:o.Ld,bd:o.bd,Rc:o.Rc};return d.postMessage(m,o.jd),0},ut=0,$e=(o,d,...m)=>{var f,x=16*m.length,E=le(),R=Ii(x),D=R>>>3;for(f of m)typeof f=="bigint"?((v(),Q)[D++>>>0]=1n,(v(),Q)[D++>>>0]=f):((v(),Q)[D++>>>0]=0n,(v(),re)[D++>>>0]=f);return o=Rs(o,0,x,R,d),ue(E),o};function pi(o){if(n)return $e(0,1,o);if(y=o,!(0<ut)){for(var d of Xt)ge(d);for(d of lt)ge(d);lt=[],Xt=[],St={},A=!0}p(0,new Ie(o))}function Ba(o){if(n)return $e(1,0,o);ci(o)}var ci=(o)=>{if(y=o,n)throw Ba(o),"unwind";pi(o)},lt=[],Xt=[],Da=[],St={},Na=(o)=>{var d=o.Rc;delete St[d],lt.push(o),Xt.splice(Xt.indexOf(o),1),o.Rc=0,Ms(d)};function Pa(){Da.forEach((o)=>o())}var Ua=(o)=>new Promise((d)=>{o.onmessage=(x)=>{var E=x.data;if(x=E.Sc,E.Zc&&E.Zc!=Nr()){var R=St[E.Zc];R?R.postMessage(E,E.jd):C(`Internal error! Worker sent a message "${x}" to target pthread ${E.Zc}, but that thread no longer exists!`)}else x==="checkMailbox"?zr():x==="spawnThread"?kr(E):x==="cleanupThread"?Ar(()=>{Na(St[E.Nd])}):x==="loaded"?(o.loaded=!0,d(o)):E.target==="setimmediate"?o.postMessage(E):x==="uncaughtException"?o.onerror(E.error):x==="callHandler"?t[E.vd](...E.args):x&&C(`worker sent an unknown command ${x}`)},o.onerror=(x)=>{throw C(`worker sent an error! ${x.filename}:${x.lineno}: ${x.message}`),x};var m,f=[];for(m of[])t.propertyIsEnumerable(m)&&f.push(m);o.postMessage({Sc:"load",xd:f,Od:dt,Pd:b})});function La(){var o=new Worker((()=>{let d=URL;return import.meta.url>"file:"&&import.meta.url<"file;"?new d("ort.bundle.min.mjs",import.meta.url):new URL(import.meta.url)})(),{type:"module",workerData:"em-pthread",name:"em-pthread"});lt.push(o)}var dt,wm=(o,d)=>{ut=0,o=Ai(o,d),0<ut?y=o:Ei(o)},Tr=[],Er=0;function vm(o){var d=new Ir(o>>>=0);return(v(),F)[d.Tc+12>>>0]==0&&(qa(d,!0),Er--),Va(d,!1),Tr.push(d),Ls(o)}var Vt=0,$m=()=>{de(0,0);var o=Tr.pop();Ps(o.cd),Vt=0};function qa(o,d){d=d?1:0,(v(),F)[o.Tc+12>>>0]=d}function Va(o,d){d=d?1:0,(v(),F)[o.Tc+13>>>0]=d}class Ir{constructor(o){this.cd=o,this.Tc=o-24}}var hi=(o)=>{var d=Vt;if(!d)return er(0),0;var m=new Ir(d);(v(),L)[m.Tc+16>>>2>>>0]=d;var f=(v(),L)[m.Tc+4>>>2>>>0];if(!f)return er(0),d;for(var x of o){if(x===0||x===f)break;if(Us(x,f,m.Tc+16))return er(x),d}return er(f),d};function xm(){return hi([])}function Sm(o){return hi([o>>>0])}function km(o,d,m,f){return hi([o>>>0,d>>>0,m>>>0,f>>>0])}var Tm=()=>{var o=Tr.pop();o||ve("no exception to throw");var d=o.cd;throw(v(),F)[o.Tc+13>>>0]==0&&(Tr.push(o),Va(o,!0),qa(o,!1),Er++),Ci(d),Vt=d};function Em(o,d,m){var f=new Ir(o>>>=0);throw d>>>=0,m>>>=0,(v(),L)[f.Tc+16>>>2>>>0]=0,(v(),L)[f.Tc+4>>>2>>>0]=d,(v(),L)[f.Tc+8>>>2>>>0]=m,Ci(o),Er++,Vt=o}var Im=()=>Er;function Wa(o,d,m,f){return n?$e(2,1,o,d,m,f):Ga(o,d,m,f)}function Ga(o,d,m,f){if(o>>>=0,d>>>=0,m>>>=0,f>>>=0,!globalThis.SharedArrayBuffer)return 6;var x=[];return n&&x.length===0?Wa(o,d,m,f):(o={Ld:m,Rc:o,bd:f,jd:x},n?(o.Sc="spawnThread",postMessage(o,x),0):kr(o))}function Cm(o){throw Vt||=o>>>0,Vt}var Ha=globalThis.TextDecoder&&new TextDecoder,Fa=(o,d,m,f)=>{if(m=d+m,f)return m;for(;o[d]&&!(d>=m);)++d;return d},ja=(o,d=0,m,f)=>{if(16<(m=Fa(o,d>>>=0,m,f))-d&&o.buffer&&Ha)return Ha.decode(o.buffer instanceof ArrayBuffer?o.subarray(d,m):o.slice(d,m));for(f="";d<m;){var x=o[d++];if(128&x){var E=63&o[d++];if((224&x)==192)f+=String.fromCharCode((31&x)<<6|E);else{var R=63&o[d++];65536>(x=(240&x)==224?(15&x)<<12|E<<6|R:(7&x)<<18|E<<12|R<<6|63&o[d++])?f+=String.fromCharCode(x):(x-=65536,f+=String.fromCharCode(55296|x>>10,56320|1023&x))}}else f+=String.fromCharCode(x)}return f},Ee=(o,d,m)=>(o>>>=0)?ja((v(),W),o,d,m):"";function Ka(o,d,m){return n?$e(3,1,o,d,m):0}function Za(o,d){if(n)return $e(4,1,o,d)}function Ya(o,d){if(n)return $e(5,1,o,d)}function Xa(o,d,m){if(n)return $e(6,1,o,d,m)}function Qa(o,d,m){return n?$e(7,1,o,d,m):0}function Ja(o,d){if(n)return $e(8,1,o,d)}function es(o,d,m){if(n)return $e(9,1,o,d,m)}function ts(o,d,m,f){if(n)return $e(10,1,o,d,m,f)}function rs(o,d,m,f){if(n)return $e(11,1,o,d,m,f)}function is(o,d,m,f){if(n)return $e(12,1,o,d,m,f)}function ns(o){if(n)return $e(13,1,o)}function as(o,d){if(n)return $e(14,1,o,d)}function ss(o,d,m){if(n)return $e(15,1,o,d,m)}var Am=()=>ve(""),Qe=(o)=>{o>>>=0;for(var d="";;){var m=(v(),W)[o++>>>0];if(!m)return d;d+=String.fromCharCode(m)}},fi={},mi={},zm={},Wt=class extends Error{constructor(o){super(o),this.name="BindingError"}};function rt(o,d,m={}){return function(f,x,E={}){var R=x.name;if(!f)throw new Wt(`type "${R}" must have a positive integer typeid pointer`);if(mi.hasOwnProperty(f)){if(E.yd)return;throw new Wt(`Cannot register type '${R}' twice`)}mi[f]=x,delete zm[f],fi.hasOwnProperty(f)&&(x=fi[f],delete fi[f],x.forEach((D)=>D()))}(o,d,m)}var os=(o,d,m)=>{switch(d){case 1:return m?(f)=>(v(),F)[f>>>0]:(f)=>(v(),W)[f>>>0];case 2:return m?(f)=>(v(),G)[f>>>1>>>0]:(f)=>(v(),ae)[f>>>1>>>0];case 4:return m?(f)=>(v(),z)[f>>>2>>>0]:(f)=>(v(),L)[f>>>2>>>0];case 8:return m?(f)=>(v(),Q)[f>>>3>>>0]:(f)=>(v(),se)[f>>>3>>>0];default:throw TypeError(`invalid integer width (${d}): ${o}`)}};function Om(o,d,m,f,x){o>>>=0,m>>>=0,d=Qe(d>>>0);let E=(R)=>R;if(f=f===0n){let R=8*m;E=(D)=>BigInt.asUintN(R,D),x=E(x)}rt(o,{name:d,Oc:E,Vc:(R,D)=>(typeof D=="number"&&(D=BigInt(D)),D),Uc:os(d,m,!f),Wc:null})}function Rm(o,d,m,f){rt(o>>>=0,{name:d=Qe(d>>>0),Oc:function(x){return!!x},Vc:function(x,E){return E?m:f},Uc:function(x){return this.Oc((v(),W)[x>>>0])},Wc:null})}var us=[],kt=[0,1,,1,null,1,!0,1,!1,1];function gi(o){9<(o>>>=0)&&--kt[o+1]===0&&(kt[o]=void 0,us.push(o))}var Ue=(o)=>{if(!o)throw new Wt(`Cannot use deleted val. handle = ${o}`);return kt[o]},We=(o)=>{switch(o){case void 0:return 2;case null:return 4;case!0:return 6;case!1:return 8;default:let d=us.pop()||kt.length;return kt[d]=o,kt[d+1]=1,d}};function yi(o){return this.Oc((v(),L)[o>>>2>>>0])}var Mm={name:"emscripten::val",Oc:(o)=>{var d=Ue(o);return gi(o),d},Vc:(o,d)=>We(d),Uc:yi,Wc:null};function Bm(o){return rt(o>>>0,Mm)}var Dm=(o,d)=>{switch(d){case 4:return function(m){return this.Oc((v(),te)[m>>>2>>>0])};case 8:return function(m){return this.Oc((v(),re)[m>>>3>>>0])};default:throw TypeError(`invalid float width (${d}): ${o}`)}};function Nm(o,d,m){m>>>=0,rt(o>>>=0,{name:d=Qe(d>>>0),Oc:(f)=>f,Vc:(f,x)=>x,Uc:Dm(d,m),Wc:null})}function Pm(o,d,m,f,x){o>>>=0,m>>>=0,d=Qe(d>>>0);let E=(D)=>D;if(f===0){var R=32-8*m;E=(D)=>D<<R>>>R,x=E(x)}rt(o,{name:d,Oc:E,Vc:(D,V)=>V,Uc:os(d,m,f!==0),Wc:null})}function Um(o,d,m){function f(E){var R=(v(),L)[E>>>2>>>0];return E=(v(),L)[E+4>>>2>>>0],new x((v(),F).buffer,E,R)}var x=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array,BigInt64Array,BigUint64Array][d];rt(o>>>=0,{name:m=Qe(m>>>0),Oc:f,Uc:f},{yd:!0})}var pt=(o,d,m)=>{var f=(v(),W);if(d>>>=0,0<m){var x=d;m=d+m-1;for(var E=0;E<o.length;++E){var R=o.codePointAt(E);if(127>=R){if(d>=m)break;f[d++>>>0]=R}else if(2047>=R){if(d+1>=m)break;f[d++>>>0]=192|R>>6,f[d++>>>0]=128|63&R}else if(65535>=R){if(d+2>=m)break;f[d++>>>0]=224|R>>12,f[d++>>>0]=128|R>>6&63,f[d++>>>0]=128|63&R}else{if(d+3>=m)break;f[d++>>>0]=240|R>>18,f[d++>>>0]=128|R>>12&63,f[d++>>>0]=128|R>>6&63,f[d++>>>0]=128|63&R,E++}}f[d>>>0]=0,o=d-x}else o=0;return o},Cr=(o)=>{for(var d=0,m=0;m<o.length;++m){var f=o.charCodeAt(m);127>=f?d++:2047>=f?d+=2:55296<=f&&57343>=f?(d+=4,++m):d+=3}return d};function Lm(o,d){rt(o>>>=0,{name:d=Qe(d>>>0),Oc(m){var f=(v(),L)[m>>>2>>>0];return f=Ee(m+4,f,!0),et(m),f},Vc(m,f){f instanceof ArrayBuffer&&(f=new Uint8Array(f));var x=typeof f=="string";if(!(x||ArrayBuffer.isView(f)&&f.BYTES_PER_ELEMENT==1))throw new Wt("Cannot pass non-string to std::string");var E=x?Cr(f):f.length,R=Jt(4+E+1),D=R+4;return(v(),L)[R>>>2>>>0]=E,x?pt(f,D,E+1):(v(),W).set(f,D>>>0),m!==null&&m.push(et,R),R},Uc:yi,Wc(m){et(m)}})}var ls=globalThis.TextDecoder?new TextDecoder("utf-16le"):void 0,qm=(o,d,m)=>{if(o>>>=1,16<(d=Fa((v(),ae),o,d/2,m))-o&&ls)return ls.decode((v(),ae).slice(o,d));for(m="";o<d;++o){var f=(v(),ae)[o>>>0];m+=String.fromCharCode(f)}return m},Vm=(o,d,m)=>{if(m??=2147483647,2>m)return 0;var f=d;m=(m-=2)<2*o.length?m/2:o.length;for(var x=0;x<m;++x){var E=o.charCodeAt(x);(v(),G)[d>>>1>>>0]=E,d+=2}return(v(),G)[d>>>1>>>0]=0,d-f},Wm=(o)=>2*o.length,Gm=(o,d,m)=>{var f="";o>>>=2;for(var x=0;!(x>=d/4);x++){var E=(v(),L)[o+x>>>0];if(!E&&!m)break;f+=String.fromCodePoint(E)}return f},Hm=(o,d,m)=>{if(d>>>=0,m??=2147483647,4>m)return 0;var f=d;m=f+m-4;for(var x=0;x<o.length;++x){var E=o.codePointAt(x);if(65535<E&&x++,(v(),z)[d>>>2>>>0]=E,(d+=4)+4>m)break}return(v(),z)[d>>>2>>>0]=0,d-f},Fm=(o)=>{for(var d=0,m=0;m<o.length;++m)65535<o.codePointAt(m)&&m++,d+=4;return d};function jm(o,d,m){if(o>>>=0,d>>>=0,m=Qe(m>>>=0),d===2)var f=qm,x=Vm,E=Wm;else f=Gm,x=Hm,E=Fm;rt(o,{name:m,Oc:(R)=>{var D=(v(),L)[R>>>2>>>0];return D=f(R+4,D*d,!0),et(R),D},Vc:(R,D)=>{if(typeof D!="string")throw new Wt(`Cannot pass non-string to C++ string type ${m}`);var V=E(D),H=Jt(4+V+d);return(v(),L)[H>>>2>>>0]=V/d,x(D,H+4,V+d),R!==null&&R.push(et,H),H},Uc:yi,Wc(R){et(R)}})}function Km(o,d){rt(o>>>=0,{zd:!0,name:d=Qe(d>>>0),Oc:()=>{},Vc:()=>{}})}function Zm(o){Ti(o>>>0,!i,1,!r,131072,!1),Pa()}var Ar=(o)=>{if(!A)try{if(o(),!(0<ut))try{n?Nr()&&Ei(y):ci(y)}catch(d){d instanceof Ie||d=="unwind"||p(0,d)}}catch(d){d instanceof Ie||d=="unwind"||p(0,d)}},Ym=!Atomics.waitAsync||globalThis.navigator?.userAgent&&91>Number((navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)||[])[2]);function bi(o){o>>>=0,Ym||(Atomics.waitAsync((v(),z),o>>>2,o).value.then(zr),o+=128,Atomics.store((v(),z),o>>>2,1))}var zr=()=>Ar(()=>{var o=Nr();o&&(bi(o),Ds())});function Xm(o,d){(o>>>=0)==d>>>0?setTimeout(zr):n?postMessage({Zc:o,Sc:"checkMailbox"}):(o=St[o])&&o.postMessage({Sc:"checkMailbox"})}var _i=[];function Qm(o,d,m,f,x){for(d>>>=0,x>>>=0,_i.length=0,m=x>>>3,f=x+f>>>3;m<f;){var E;E=(v(),Q)[m++>>>0]?(v(),Q)[m++>>>0]:(v(),re)[m++>>>0],_i.push(E)}return(d?zi[d]:Wg[o])(..._i)}var Jm=()=>{ut=0};function eg(o){o>>>=0,n?postMessage({Sc:"cleanupThread",Nd:o}):Na(St[o])}function tg(o){}var Or=(o)=>{try{o()}catch(d){ve(d)}};function rg(o){var d=(...m)=>{Rr.push(o);try{return o(...m)}finally{A||(Rr.pop(),Je&&ct===1&&Rr.length===0&&(ct=0,ut+=1,Or(ko),typeof Fibers<"u"&&Fibers.be()))}};return cs.set(o,d),d}var ct=0,Je=null,ds=0,Rr=[],wi=new Map,ps=new Map,cs=new Map,ig=0,vi=null,ng=[],hs=(o)=>function(d){if(!A){if(ct===0){var m=!1,f=!1;d((x=0)=>{if(!A&&(ds=x,m=!0,f)){ct=2,Or(()=>To(Je)),typeof MainLoop<"u"&&MainLoop.ud&&MainLoop.resume(),x=!1;try{var E=function(){var V=(v(),z)[Je+8>>>2>>>0];return V=ps.get(V),V=cs.get(V),--ut,V()}()}catch(V){E=V,x=!0}var R=!1;if(!Je){var D=vi;D&&(vi=null,(x?D.reject:D.resolve)(E),R=!0)}if(x&&!R)throw E}}),f=!0,m||(ct=1,Je=function(){var x=Jt(65548),E=x+12;if((v(),L)[x>>>2>>>0]=E,(v(),L)[x+4>>>2>>>0]=E+65536,E=Rr[0],!wi.has(E)){var R=ig++;wi.set(E,R),ps.set(R,E)}return E=wi.get(E),(v(),z)[x+8>>>2>>>0]=E,x}(),typeof MainLoop<"u"&&MainLoop.ud&&MainLoop.pause(),Or(()=>So(Je)))}else ct===2?(ct=0,Or(Eo),et(Je),Je=null,ng.forEach(Ar)):ve(`invalid state: ${ct}`);return ds}}((d)=>{o().then(d)});function ag(o){return o>>>=0,hs(async()=>{var d=await Ue(o);return We(d)})}var $i=[],sg=(o)=>{var d=$i.length;return $i.push(o),d},og=(o,d)=>{for(var m=Array(o),f=0;f<o;++f){var x=f,E=(v(),L)[d+4*f>>>2>>>0],R=mi[E];if(R===void 0)throw o=`parameter ${f}`,E=As(E),d=Qe(E),et(E),new Wt(`${o} has unknown type ${d}`);m[x]=R}return m},ug=(o,d,m)=>{var f=[];return o=o(f,m),f.length&&((v(),L)[d>>>2>>>0]=We(f)),o},lg={},Mr=(o)=>{var d=lg[o];return d===void 0?Qe(o):d};function dg(o,d,m){var[f,...x]=og(o,d>>>0);d=f.Vc.bind(f);var E=x.map((V)=>V.Uc.bind(V));o--;var R={toValue:Ue};switch(o=E.map((V,H)=>{var oe=`argFromPtr${H}`;return R[oe]=V,`${oe}(args${H?"+"+8*H:""})`}),m){case 0:var D="toValue(handle)";break;case 2:D="new (toValue(handle))";break;case 3:D="";break;case 1:R.getStringOrSymbol=Mr,D="toValue(handle)[getStringOrSymbol(methodName)]"}return D+=`(${o})`,f.zd||(R.toReturnWire=d,R.emval_returnValue=ug,D=`return emval_returnValue(toReturnWire, destructorsRef, ${D})`),D=`return function (handle, methodName, destructorsRef, args) {
  ${D}
  }`,m=Function(Object.keys(R),D)(...Object.values(R)),D=`methodCaller<(${x.map((V)=>V.name)}) => ${f.name}>`,sg(Object.defineProperty(m,"name",{value:D}))}function pg(o,d){return d>>>=0,(o=Ue(o>>>0))==Ue(d)}function cg(o){return(o>>>=0)?(o=Mr(o),We(globalThis[o])):We(globalThis)}function hg(o){return o=Mr(o>>>0),We(t[o])}function fg(o,d){return d>>>=0,o=Ue(o>>>0),d=Ue(d),We(o[d])}function mg(o){9<(o>>>=0)&&(kt[o+1]+=1)}function fs(o,d,m,f,x){return $i[o>>>0](d>>>0,m>>>0,f>>>0,x>>>0)}function gg(o,d,m,f,x){return fs(o>>>0,d>>>0,m>>>0,f>>>0,x>>>0)}function yg(){return We([])}function bg(o){o=Ue(o>>>0);for(var d=Array(o.length),m=0;m<o.length;m++)d[m]=o[m];return We(d)}function _g(o){return We(Mr(o>>>0))}function wg(){return We({})}function vg(o){for(var d=Ue(o>>>=0);d.length;){var m=d.pop();d.pop()(m)}gi(o)}function $g(o,d,m){d>>>=0,m>>>=0,o=Ue(o>>>0),d=Ue(d),m=Ue(m),o[d]=m}function xg(o,d){o=-9007199254740992>o||9007199254740992<o?NaN:Number(o),d>>>=0,o=new Date(1000*o),(v(),z)[d>>>2>>>0]=o.getUTCSeconds(),(v(),z)[d+4>>>2>>>0]=o.getUTCMinutes(),(v(),z)[d+8>>>2>>>0]=o.getUTCHours(),(v(),z)[d+12>>>2>>>0]=o.getUTCDate(),(v(),z)[d+16>>>2>>>0]=o.getUTCMonth(),(v(),z)[d+20>>>2>>>0]=o.getUTCFullYear()-1900,(v(),z)[d+24>>>2>>>0]=o.getUTCDay(),o=(o.getTime()-Date.UTC(o.getUTCFullYear(),0,1,0,0,0,0))/86400000|0,(v(),z)[d+28>>>2>>>0]=o}var ms=(o)=>o%4==0&&(o%100!=0||o%400==0),gs=[0,31,60,91,121,152,182,213,244,274,305,335],ys=[0,31,59,90,120,151,181,212,243,273,304,334];function Sg(o,d){o=-9007199254740992>o||9007199254740992<o?NaN:Number(o),d>>>=0,o=new Date(1000*o),(v(),z)[d>>>2>>>0]=o.getSeconds(),(v(),z)[d+4>>>2>>>0]=o.getMinutes(),(v(),z)[d+8>>>2>>>0]=o.getHours(),(v(),z)[d+12>>>2>>>0]=o.getDate(),(v(),z)[d+16>>>2>>>0]=o.getMonth(),(v(),z)[d+20>>>2>>>0]=o.getFullYear()-1900,(v(),z)[d+24>>>2>>>0]=o.getDay();var m=(ms(o.getFullYear())?gs:ys)[o.getMonth()]+o.getDate()-1|0;(v(),z)[d+28>>>2>>>0]=m,(v(),z)[d+36>>>2>>>0]=-60*o.getTimezoneOffset(),m=new Date(o.getFullYear(),6,1).getTimezoneOffset();var f=new Date(o.getFullYear(),0,1).getTimezoneOffset();o=0|(m!=f&&o.getTimezoneOffset()==Math.min(f,m)),(v(),z)[d+32>>>2>>>0]=o}function kg(o){o>>>=0;var d=new Date((v(),z)[o+20>>>2>>>0]+1900,(v(),z)[o+16>>>2>>>0],(v(),z)[o+12>>>2>>>0],(v(),z)[o+8>>>2>>>0],(v(),z)[o+4>>>2>>>0],(v(),z)[o>>>2>>>0],0),m=(v(),z)[o+32>>>2>>>0],f=d.getTimezoneOffset(),x=new Date(d.getFullYear(),6,1).getTimezoneOffset(),E=new Date(d.getFullYear(),0,1).getTimezoneOffset(),R=Math.min(E,x);return 0>m?(v(),z)[o+32>>>2>>>0]=+(x!=E&&R==f):0<m!=(R==f)&&(x=Math.max(E,x),d.setTime(d.getTime()+60000*((0<m?R:x)-f))),(v(),z)[o+24>>>2>>>0]=d.getDay(),m=(ms(d.getFullYear())?gs:ys)[d.getMonth()]+d.getDate()-1|0,(v(),z)[o+28>>>2>>>0]=m,(v(),z)[o>>>2>>>0]=d.getSeconds(),(v(),z)[o+4>>>2>>>0]=d.getMinutes(),(v(),z)[o+8>>>2>>>0]=d.getHours(),(v(),z)[o+12>>>2>>>0]=d.getDate(),(v(),z)[o+16>>>2>>>0]=d.getMonth(),(v(),z)[o+20>>>2>>>0]=d.getYear(),o=d.getTime(),BigInt(isNaN(o)?-1:o/1000)}function bs(o,d,m,f,x,E,R){return n?$e(16,1,o,d,m,f,x,E,R):-52}function _s(o,d,m,f,x,E){if(n)return $e(17,1,o,d,m,f,x,E)}var Qt={},Tg=()=>performance.timeOrigin+performance.now();function ws(o,d){if(n)return $e(18,1,o,d);if(Qt[o]&&(clearTimeout(Qt[o].id),delete Qt[o]),!d)return 0;var m=setTimeout(()=>{delete Qt[o],Ar(()=>Bs(o,performance.timeOrigin+performance.now()))},d);return Qt[o]={id:m,ae:d},0}function Eg(o,d,m,f){o>>>=0,d>>>=0,m>>>=0,f>>>=0;var x=new Date().getFullYear(),E=new Date(x,0,1).getTimezoneOffset();x=new Date(x,6,1).getTimezoneOffset();var R=Math.max(E,x);(v(),L)[o>>>2>>>0]=60*R,(v(),z)[d>>>2>>>0]=+(E!=x),o=(d=(D)=>{var V=Math.abs(D);return`UTC${0<=D?"-":"+"}${String(Math.floor(V/60)).padStart(2,"0")}${String(V%60).padStart(2,"0")}`})(E),d=d(x),x<E?(pt(o,m,17),pt(d,f,17)):(pt(o,f,17),pt(d,m,17))}var Ig=()=>Date.now(),Cg=1;function Ag(o,d,m){if(m>>>=0,!(0<=o&&3>=o))return 28;if(o===0)o=Date.now();else{if(!Cg)return 52;o=performance.timeOrigin+performance.now()}return o=Math.round(1e6*o),(v(),Q)[m>>>3>>>0]=BigInt(o),0}var xi=[],vs=(o,d)=>{xi.length=0;for(var m;m=(v(),W)[o++>>>0];){var f=m!=105;d+=(f&=m!=112)&&d%8?4:0,xi.push(m==112?(v(),L)[d>>>2>>>0]:m==106?(v(),Q)[d>>>3>>>0]:m==105?(v(),z)[d>>>2>>>0]:(v(),re)[d>>>3>>>0]),d+=f?8:4}return xi};function zg(o,d,m){return o>>>=0,d=vs(d>>>0,m>>>0),zi[o](...d)}function Og(o,d,m){return o>>>=0,d=vs(d>>>0,m>>>0),zi[o](...d)}var Rg=()=>{};function Mg(o,d){return C(Ee(o>>>0,d>>>0))}var Bg=()=>{throw ut+=1,"unwind"};function Dg(){return 4294901760}var Ng=()=>navigator.hardwareConcurrency,Tt={},Br=(o)=>{var d;return(d=/\bwasm-function\[\d+\]:(0x[0-9a-f]+)/.exec(o))?+d[1]:(d=/:(\d+):\d+(?:\)|$)/.exec(o))?2147483648|+d[1]:0},$s=(o)=>{for(var d of o)(o=Br(d))&&(Tt[o]=d)};function Pg(){var o=Error().stack.toString().split(`
`);return o[0]=="Error"&&o.shift(),$s(o),Tt.gd=Br(o[3]),Tt.Jd=o,Tt.gd}function Dr(o){if(!(o=Tt[o>>>0]))return 0;var d;if(d=/^\s+at .*\.wasm\.(.*) \(.*\)$/.exec(o))o=d[1];else if(d=/^\s+at (.*) \(.*\)$/.exec(o))o=d[1];else{if(!(d=/^(.+?)@/.exec(o)))return 0;o=d[1]}et(Dr.hd??0),d=Cr(o)+1;var m=Jt(d);return m&&pt(o,m,d),Dr.hd=m,Dr.hd}function Ug(o){o>>>=0;var d=(v(),W).length;if(o<=d||4294901760<o)return!1;for(var m=1;4>=m;m*=2){var f=d*(1+0.2/m);f=Math.min(f,o+100663296);e:{f=(Math.min(4294901760,65536*Math.ceil(Math.max(o,f)/65536))-dt.buffer.byteLength+65535)/65536|0;try{dt.grow(f),Y();var x=1;break e}catch{}x=void 0}if(x)return!0}return!1}function Lg(o,d,m){if(o>>>=0,d>>>=0,Tt.gd==o)var f=Tt.Jd;else(f=Error().stack.toString().split(`
`))[0]=="Error"&&f.shift(),$s(f);for(var x=3;f[x]&&Br(f[x])!=o;)++x;for(o=0;o<m&&f[o+x];++o)(v(),z)[d+4*o>>>2>>>0]=Br(f[o+x]);return o}var Si,ki={},xs=()=>{if(!Si){var o,d={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:(globalThis.navigator?.language??"C").replace("-","_")+".UTF-8",_:"./this.program"};for(o in ki)ki[o]===void 0?delete d[o]:d[o]=ki[o];var m=[];for(o in d)m.push(`${o}=${d[o]}`);Si=m}return Si};function Ss(o,d){if(n)return $e(19,1,o,d);o>>>=0,d>>>=0;var m,f=0,x=0;for(m of xs()){var E=d+f;(v(),L)[o+x>>>2>>>0]=E,f+=pt(m,E,1/0)+1,x+=4}return 0}function ks(o,d){if(n)return $e(20,1,o,d);o>>>=0,d>>>=0;var m=xs();for(var f of((v(),L)[o>>>2>>>0]=m.length,o=0,m))o+=Cr(f)+1;return(v(),L)[d>>>2>>>0]=o,0}function Ts(o){return n?$e(21,1,o):52}function Es(o,d,m,f){return n?$e(22,1,o,d,m,f):52}function Is(o,d,m,f){return n?$e(23,1,o,d,m,f):70}var qg=[null,[],[]];function Cs(o,d,m,f){if(n)return $e(24,1,o,d,m,f);d>>>=0,m>>>=0,f>>>=0;for(var x=0,E=0;E<m;E++){var R=(v(),L)[d>>>2>>>0],D=(v(),L)[d+4>>>2>>>0];d+=8;for(var V=0;V<D;V++){var H=o,oe=(v(),W)[R+V>>>0],ce=qg[H];oe===0||oe===10?((H===1?T:C)(ja(ce)),ce.length=0):ce.push(oe)}x+=D}return(v(),L)[f>>>2>>>0]=x,0}function Vg(o){return o>>>0}n||function(){for(var o=t.numThreads-1;o--;)La();Se.push(async()=>{var d=async function(){if(!n)return Promise.all(lt.map(Ua))}();Be++,await d,--Be==0&&xt&&(d=xt,xt=null,d())})}(),n||(dt=new WebAssembly.Memory({initial:256,maximum:65536,shared:!0}),Y()),t.wasmBinary&&(g=t.wasmBinary),t.stackSave=()=>le(),t.stackRestore=(o)=>ue(o),t.stackAlloc=(o)=>Ii(o),t.setValue=function(o,d,m="i8"){switch(m.endsWith("*")&&(m="*"),m){case"i1":case"i8":(v(),F)[o>>>0]=d;break;case"i16":(v(),G)[o>>>1>>>0]=d;break;case"i32":(v(),z)[o>>>2>>>0]=d;break;case"i64":(v(),Q)[o>>>3>>>0]=BigInt(d);break;case"float":(v(),te)[o>>>2>>>0]=d;break;case"double":(v(),re)[o>>>3>>>0]=d;break;case"*":(v(),L)[o>>>2>>>0]=d;break;default:ve(`invalid type for setValue: ${m}`)}},t.getValue=function(o,d="i8"){switch(d.endsWith("*")&&(d="*"),d){case"i1":case"i8":return(v(),F)[o>>>0];case"i16":return(v(),G)[o>>>1>>>0];case"i32":return(v(),z)[o>>>2>>>0];case"i64":return(v(),Q)[o>>>3>>>0];case"float":return(v(),te)[o>>>2>>>0];case"double":return(v(),re)[o>>>3>>>0];case"*":return(v(),L)[o>>>2>>>0];default:ve(`invalid type for getValue: ${d}`)}},t.UTF8ToString=Ee,t.stringToUTF8=pt,t.lengthBytesUTF8=Cr;var As,zs,Nr,et,Jt,Ti,Os,Rs,Ms,Ei,Bs,Ds,de,er,Ns,ue,Ii,le,Ps,Ci,Us,Ls,qs,Ai,Vs,Ws,Gs,Hs,Fs,js,Ks,Zs,Ys,Xs,Qs,Js,eo,to,ro,io,no,ao,so,oo,uo,lo,po,co,ho,fo,mo,go,yo,bo,_o,wo,vo,$o,xo,So,ko,To,Eo,it,Wg=[pi,Ba,Wa,Ka,Za,Ya,Xa,Qa,Ja,es,ts,rs,is,ns,as,ss,bs,_s,ws,Ss,ks,Ts,Es,Is,Cs],zi={1055492:(o,d,m,f,x)=>{if(t===void 0||!t.Yc)return 1;if((o=Ee(Number(o>>>0))).startsWith("./")&&(o=o.substring(2)),!(o=t.Yc.get(o)))return 2;if(d=Number(d>>>0),m=Number(m>>>0),f=Number(f>>>0),d+m>o.byteLength)return 3;try{let E=o.subarray(d,d+m);switch(x){case 0:(v(),W).set(E,f>>>0);break;case 1:t.Qd?t.Qd(f,E):t.Id(f,E);break;default:return 4}return 0}catch{return 4}},1056316:(o,d,m)=>{t.td(o,(v(),W).subarray(d>>>0,d+m>>>0))},1056380:()=>t.Sd(),1056422:(o)=>{t.sd(o)},1056459:()=>{t.Bd()},1056490:()=>{t.Cd()},1056519:()=>{t.Gd()},1056544:(o)=>t.Ad(o),1056577:(o)=>t.Ed(o),1056609:(o,d,m)=>{t.ed(Number(o),Number(d),Number(m),!0)},1056672:(o,d,m)=>{t.ed(Number(o),Number(d),Number(m))},1056729:()=>typeof wasmOffsetConverter<"u",1056786:(o)=>{t.$b("Abs",o,void 0)},1056837:(o)=>{t.$b("Neg",o,void 0)},1056888:(o)=>{t.$b("Floor",o,void 0)},1056941:(o)=>{t.$b("Ceil",o,void 0)},1056993:(o)=>{t.$b("Reciprocal",o,void 0)},1057051:(o)=>{t.$b("Sqrt",o,void 0)},1057103:(o)=>{t.$b("Exp",o,void 0)},1057154:(o)=>{t.$b("Erf",o,void 0)},1057205:(o)=>{t.$b("Sigmoid",o,void 0)},1057260:(o,d,m)=>{t.$b("HardSigmoid",o,{alpha:d,beta:m})},1057339:(o)=>{t.$b("HardSwish",o,void 0)},1057396:(o)=>{t.$b("Log",o,void 0)},1057447:(o)=>{t.$b("Sin",o,void 0)},1057498:(o)=>{t.$b("Cos",o,void 0)},1057549:(o)=>{t.$b("Tan",o,void 0)},1057600:(o)=>{t.$b("Asin",o,void 0)},1057652:(o)=>{t.$b("Acos",o,void 0)},1057704:(o)=>{t.$b("Atan",o,void 0)},1057756:(o)=>{t.$b("Sinh",o,void 0)},1057808:(o)=>{t.$b("Cosh",o,void 0)},1057860:(o)=>{t.$b("Asinh",o,void 0)},1057913:(o)=>{t.$b("Acosh",o,void 0)},1057966:(o)=>{t.$b("Atanh",o,void 0)},1058019:(o)=>{t.$b("Tanh",o,void 0)},1058071:(o)=>{t.$b("Not",o,void 0)},1058122:(o,d,m)=>{t.$b("Clip",o,{min:d,max:m})},1058191:(o)=>{t.$b("Clip",o,void 0)},1058243:(o,d)=>{t.$b("Elu",o,{alpha:d})},1058301:(o)=>{t.$b("Gelu",o,void 0)},1058353:(o)=>{t.$b("Relu",o,void 0)},1058405:(o,d)=>{t.$b("LeakyRelu",o,{alpha:d})},1058469:(o,d)=>{t.$b("ThresholdedRelu",o,{alpha:d})},1058539:(o,d)=>{t.$b("Cast",o,{to:d})},1058597:(o)=>{t.$b("Add",o,void 0)},1058648:(o)=>{t.$b("Sub",o,void 0)},1058699:(o)=>{t.$b("Mul",o,void 0)},1058750:(o)=>{t.$b("Div",o,void 0)},1058801:(o)=>{t.$b("Pow",o,void 0)},1058852:(o)=>{t.$b("Equal",o,void 0)},1058905:(o)=>{t.$b("Greater",o,void 0)},1058960:(o)=>{t.$b("GreaterOrEqual",o,void 0)},1059022:(o)=>{t.$b("Less",o,void 0)},1059074:(o)=>{t.$b("LessOrEqual",o,void 0)},1059133:(o,d,m,f,x)=>{t.$b("ReduceMean",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:f?Array.from((v(),z).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},1059308:(o,d,m,f,x)=>{t.$b("ReduceMax",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:f?Array.from((v(),z).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},1059482:(o,d,m,f,x)=>{t.$b("ReduceMin",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:f?Array.from((v(),z).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},1059656:(o,d,m,f,x)=>{t.$b("ReduceProd",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:f?Array.from((v(),z).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},1059831:(o,d,m,f,x)=>{t.$b("ReduceSum",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:f?Array.from((v(),z).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},1060005:(o,d,m,f,x)=>{t.$b("ReduceL1",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:f?Array.from((v(),z).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},1060178:(o,d,m,f,x)=>{t.$b("ReduceL2",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:f?Array.from((v(),z).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},1060351:(o,d,m,f,x)=>{t.$b("ReduceLogSum",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:f?Array.from((v(),z).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},1060528:(o,d,m,f,x)=>{t.$b("ReduceSumSquare",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:f?Array.from((v(),z).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},1060708:(o,d,m,f,x)=>{t.$b("ReduceLogSumExp",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:f?Array.from((v(),z).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},1060888:(o)=>{t.$b("Where",o,void 0)},1060941:(o,d,m)=>{t.$b("Transpose",o,{perm:d?Array.from((v(),z).subarray(Number(d)>>>0,Number(m)>>>0)):[]})},1061065:(o,d,m,f)=>{t.$b("DepthToSpace",o,{blocksize:d,mode:Ee(m),format:f?"NHWC":"NCHW"})},1061198:(o,d,m,f)=>{t.$b("DepthToSpace",o,{blocksize:d,mode:Ee(m),format:f?"NHWC":"NCHW"})},1061331:(o,d,m,f)=>{t.$b("DFT",o,{axis:d,inverse:m,onesided:f})},1061423:(o,d,m,f,x,E,R,D,V,H,oe,ce,ye,_e,ht)=>{t.$b("ConvTranspose",o,{format:V?"NHWC":"NCHW",autoPad:d,dilations:[m],group:f,kernelShape:[x],pads:[E,R],strides:[D],wIsConst:()=>!!(v(),F)[H>>>0],outputPadding:oe?Array.from((v(),z).subarray(Number(oe)>>>0,Number(ce)>>>0)):[],outputShape:ye?Array.from((v(),z).subarray(Number(ye)>>>0,Number(_e)>>>0)):[],activation:Ee(ht)})},1061856:(o,d,m,f,x,E,R,D,V,H,oe,ce,ye,_e)=>{t.$b("ConvTranspose",o,{format:D?"NHWC":"NCHW",autoPad:d,dilations:Array.from((v(),z).subarray(Number(m)>>>0,(Number(m)>>>0)+2>>>0)),group:f,kernelShape:Array.from((v(),z).subarray(Number(x)>>>0,(Number(x)>>>0)+2>>>0)),pads:Array.from((v(),z).subarray(Number(E)>>>0,(Number(E)>>>0)+4>>>0)),strides:Array.from((v(),z).subarray(Number(R)>>>0,(Number(R)>>>0)+2>>>0)),wIsConst:()=>!!(v(),F)[V>>>0],outputPadding:H?Array.from((v(),z).subarray(Number(H)>>>0,Number(oe)>>>0)):[],outputShape:ce?Array.from((v(),z).subarray(Number(ce)>>>0,Number(ye)>>>0)):[],activation:Ee(_e)})},1062517:(o,d,m,f,x,E,R,D,V,H,oe,ce,ye,_e,ht)=>{t.$b("ConvTranspose",o,{format:V?"NHWC":"NCHW",autoPad:d,dilations:[m],group:f,kernelShape:[x],pads:[E,R],strides:[D],wIsConst:()=>!!(v(),F)[H>>>0],outputPadding:oe?Array.from((v(),z).subarray(Number(oe)>>>0,Number(ce)>>>0)):[],outputShape:ye?Array.from((v(),z).subarray(Number(ye)>>>0,Number(_e)>>>0)):[],activation:Ee(ht)})},1062950:(o,d,m,f,x,E,R,D,V,H,oe,ce,ye,_e)=>{t.$b("ConvTranspose",o,{format:D?"NHWC":"NCHW",autoPad:d,dilations:Array.from((v(),z).subarray(Number(m)>>>0,(Number(m)>>>0)+2>>>0)),group:f,kernelShape:Array.from((v(),z).subarray(Number(x)>>>0,(Number(x)>>>0)+2>>>0)),pads:Array.from((v(),z).subarray(Number(E)>>>0,(Number(E)>>>0)+4>>>0)),strides:Array.from((v(),z).subarray(Number(R)>>>0,(Number(R)>>>0)+2>>>0)),wIsConst:()=>!!(v(),F)[V>>>0],outputPadding:H?Array.from((v(),z).subarray(Number(H)>>>0,Number(oe)>>>0)):[],outputShape:ce?Array.from((v(),z).subarray(Number(ce)>>>0,Number(ye)>>>0)):[],activation:Ee(_e)})},1063611:(o,d)=>{t.$b("GlobalAveragePool",o,{format:d?"NHWC":"NCHW"})},1063702:(o,d,m,f,x,E,R,D,V,H,oe,ce,ye,_e)=>{t.$b("AveragePool",o,{format:_e?"NHWC":"NCHW",auto_pad:d,ceil_mode:m,count_include_pad:f,storage_order:x,dilations:E?Array.from((v(),z).subarray(Number(E)>>>0,Number(R)>>>0)):[],kernel_shape:D?Array.from((v(),z).subarray(Number(D)>>>0,Number(V)>>>0)):[],pads:H?Array.from((v(),z).subarray(Number(H)>>>0,Number(oe)>>>0)):[],strides:ce?Array.from((v(),z).subarray(Number(ce)>>>0,Number(ye)>>>0)):[]})},1064181:(o,d)=>{t.$b("GlobalAveragePool",o,{format:d?"NHWC":"NCHW"})},1064272:(o,d,m,f,x,E,R,D,V,H,oe,ce,ye,_e)=>{t.$b("AveragePool",o,{format:_e?"NHWC":"NCHW",auto_pad:d,ceil_mode:m,count_include_pad:f,storage_order:x,dilations:E?Array.from((v(),z).subarray(Number(E)>>>0,Number(R)>>>0)):[],kernel_shape:D?Array.from((v(),z).subarray(Number(D)>>>0,Number(V)>>>0)):[],pads:H?Array.from((v(),z).subarray(Number(H)>>>0,Number(oe)>>>0)):[],strides:ce?Array.from((v(),z).subarray(Number(ce)>>>0,Number(ye)>>>0)):[]})},1064751:(o,d)=>{t.$b("GlobalMaxPool",o,{format:d?"NHWC":"NCHW"})},1064838:(o,d,m,f,x,E,R,D,V,H,oe,ce,ye,_e)=>{t.$b("MaxPool",o,{format:_e?"NHWC":"NCHW",auto_pad:d,ceil_mode:m,count_include_pad:f,storage_order:x,dilations:E?Array.from((v(),z).subarray(Number(E)>>>0,Number(R)>>>0)):[],kernel_shape:D?Array.from((v(),z).subarray(Number(D)>>>0,Number(V)>>>0)):[],pads:H?Array.from((v(),z).subarray(Number(H)>>>0,Number(oe)>>>0)):[],strides:ce?Array.from((v(),z).subarray(Number(ce)>>>0,Number(ye)>>>0)):[]})},1065313:(o,d)=>{t.$b("GlobalMaxPool",o,{format:d?"NHWC":"NCHW"})},1065400:(o,d,m,f,x,E,R,D,V,H,oe,ce,ye,_e)=>{t.$b("MaxPool",o,{format:_e?"NHWC":"NCHW",auto_pad:d,ceil_mode:m,count_include_pad:f,storage_order:x,dilations:E?Array.from((v(),z).subarray(Number(E)>>>0,Number(R)>>>0)):[],kernel_shape:D?Array.from((v(),z).subarray(Number(D)>>>0,Number(V)>>>0)):[],pads:H?Array.from((v(),z).subarray(Number(H)>>>0,Number(oe)>>>0)):[],strides:ce?Array.from((v(),z).subarray(Number(ce)>>>0,Number(ye)>>>0)):[]})},1065875:(o,d,m,f,x)=>{t.$b("Gemm",o,{alpha:d,beta:m,transA:f,transB:x})},1065979:(o)=>{t.$b("MatMul",o,void 0)},1066033:(o,d,m,f)=>{t.$b("ArgMax",o,{keepDims:!!d,selectLastIndex:!!m,axis:f})},1066141:(o,d,m,f)=>{t.$b("ArgMin",o,{keepDims:!!d,selectLastIndex:!!m,axis:f})},1066249:(o,d)=>{t.$b("Softmax",o,{axis:d})},1066312:(o,d)=>{t.$b("Concat",o,{axis:d})},1066372:(o,d,m,f,x)=>{t.$b("Split",o,{axis:d,numOutputs:m,splitSizes:f?Array.from((v(),z).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},1066528:(o)=>{t.$b("Expand",o,void 0)},1066582:(o,d)=>{t.$b("Gather",o,{axis:Number(d)})},1066653:(o,d)=>{t.$b("GatherElements",o,{axis:Number(d)})},1066732:(o,d)=>{t.$b("GatherND",o,{batch_dims:Number(d)})},1066811:(o,d,m,f,x,E,R,D,V,H,oe)=>{t.$b("Resize",o,{antialias:d,axes:m?Array.from((v(),z).subarray(Number(m)>>>0,Number(f)>>>0)):[],coordinateTransformMode:Ee(x),cubicCoeffA:E,excludeOutside:R,extrapolationValue:D,keepAspectRatioPolicy:Ee(V),mode:Ee(H),nearestMode:Ee(oe)})},1067173:(o,d,m,f,x,E,R)=>{t.$b("Slice",o,{starts:d?Array.from((v(),z).subarray(Number(d)>>>0,Number(m)>>>0)):[],ends:f?Array.from((v(),z).subarray(Number(f)>>>0,Number(x)>>>0)):[],axes:E?Array.from((v(),z).subarray(Number(E)>>>0,Number(R)>>>0)):[]})},1067437:(o)=>{t.$b("Tile",o,void 0)},1067489:(o,d,m)=>{t.$b("InstanceNormalization",o,{epsilon:d,format:m?"NHWC":"NCHW"})},1067603:(o,d,m)=>{t.$b("InstanceNormalization",o,{epsilon:d,format:m?"NHWC":"NCHW"})},1067717:(o)=>{t.$b("Range",o,void 0)},1067770:(o,d)=>{t.$b("Einsum",o,{equation:Ee(d)})},1067851:(o,d,m,f,x)=>{t.$b("Pad",o,{mode:d,value:m,pads:f?Array.from((v(),z).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},1067994:(o,d,m,f,x,E)=>{t.$b("BatchNormalization",o,{epsilon:d,momentum:m,spatial:!!x,trainingMode:!!f,format:E?"NHWC":"NCHW"})},1068163:(o,d,m,f,x,E)=>{t.$b("BatchNormalization",o,{epsilon:d,momentum:m,spatial:!!x,trainingMode:!!f,format:E?"NHWC":"NCHW"})},1068332:(o,d,m)=>{t.$b("CumSum",o,{exclusive:Number(d),reverse:Number(m)})},1068429:(o,d,m)=>{t.$b("DequantizeLinear",o,{axis:d,blockSize:m})},1068519:(o,d,m,f,x)=>{t.$b("GridSample",o,{align_corners:d,mode:Ee(m),padding_mode:Ee(f),format:x?"NHWC":"NCHW"})},1068689:(o,d,m,f,x)=>{t.$b("GridSample",o,{align_corners:d,mode:Ee(m),padding_mode:Ee(f),format:x?"NHWC":"NCHW"})},1068859:(o,d)=>{t.$b("ScatterND",o,{reduction:Ee(d)})},1068944:(o,d,m,f,x,E,R,D,V)=>{t.$b("Attention",o,{numHeads:d,isUnidirectional:m,maskFilterValue:f,scale:x,doRotary:E,qkvHiddenSizes:R?Array.from((v(),z).subarray(Number(D)>>>0,Number(D)+R>>>0)):[],pastPresentShareBuffer:!!V})},1069216:(o)=>{t.$b("BiasAdd",o,void 0)},1069271:(o)=>{t.$b("BiasSplitGelu",o,void 0)},1069332:(o)=>{t.$b("FastGelu",o,void 0)},1069388:(o,d,m,f,x,E,R,D,V,H,oe,ce,ye,_e,ht,Oi)=>{t.$b("Conv",o,{format:ce?"NHWC":"NCHW",auto_pad:d,dilations:m?Array.from((v(),z).subarray(Number(m)>>>0,Number(f)>>>0)):[],group:x,kernel_shape:E?Array.from((v(),z).subarray(Number(E)>>>0,Number(R)>>>0)):[],pads:D?Array.from((v(),z).subarray(Number(D)>>>0,Number(V)>>>0)):[],strides:H?Array.from((v(),z).subarray(Number(H)>>>0,Number(oe)>>>0)):[],w_is_const:()=>!!(v(),F)[Number(ye)>>>0],activation:Ee(_e),activation_params:ht?Array.from((v(),te).subarray(Number(ht)>>>0,Number(Oi)>>>0)):[]})},1069972:(o)=>{t.$b("Gelu",o,void 0)},1070024:(o,d,m,f,x,E,R,D,V)=>{t.$b("GroupQueryAttention",o,{numHeads:d,kvNumHeads:m,scale:f,softcap:x,doRotary:E,rotaryInterleaved:R,smoothSoftmax:D,localWindowSize:V})},1070241:(o,d,m,f)=>{t.$b("LayerNormalization",o,{axis:d,epsilon:m,simplified:!!f})},1070352:(o,d,m,f)=>{t.$b("LayerNormalization",o,{axis:d,epsilon:m,simplified:!!f})},1070463:(o,d,m,f,x,E)=>{t.$b("MatMulNBits",o,{k:d,n:m,accuracyLevel:f,bits:x,blockSize:E})},1070590:(o,d,m,f,x,E)=>{t.$b("MultiHeadAttention",o,{numHeads:d,isUnidirectional:m,maskFilterValue:f,scale:x,doRotary:E})},1070749:(o,d)=>{t.$b("QuickGelu",o,{alpha:d})},1070813:(o,d,m,f,x)=>{t.$b("RotaryEmbedding",o,{interleaved:!!d,numHeads:m,rotaryEmbeddingDim:f,scale:x})},1070952:(o,d,m)=>{t.$b("SkipLayerNormalization",o,{epsilon:d,simplified:!!m})},1071054:(o,d,m)=>{t.$b("SkipLayerNormalization",o,{epsilon:d,simplified:!!m})},1071156:(o,d,m,f)=>{t.$b("GatherBlockQuantized",o,{gatherAxis:d,quantizeAxis:m,blockSize:f})},1071277:(o)=>{t.Fd(o)},1071311:(o,d)=>t.Hd(Number(o),Number(d),t.Xc.Kd,t.Xc.errors)};function Gg(o,d,m){return hs(async()=>{await t.Dd(Number(o),Number(d),Number(m))})}function Hg(){return typeof wasmOffsetConverter<"u"}function Fg(o,d,m,f){var x=le();try{return Zs(o,d,m,f)}catch(E){if(ue(x),E!==E+0)throw E;de(1,0)}}function jg(o,d,m){var f=le();try{return Hs(o,d,m)}catch(x){if(ue(f),x!==x+0)throw x;de(1,0)}}function Kg(o){var d=le();try{Vs(o)}catch(m){if(ue(d),m!==m+0)throw m;de(1,0)}}function Zg(o,d){var m=le();try{return Ai(o,d)}catch(f){if(ue(m),f!==f+0)throw f;de(1,0)}}function Yg(o,d,m){var f=le();try{qs(o,d,m)}catch(x){if(ue(f),x!==x+0)throw x;de(1,0)}}function Xg(o,d){var m=le();try{Ys(o,d)}catch(f){if(ue(m),f!==f+0)throw f;de(1,0)}}function Qg(o,d,m,f,x,E,R){var D=le();try{return js(o,d,m,f,x,E,R)}catch(V){if(ue(D),V!==V+0)throw V;de(1,0)}}function Jg(o,d,m,f,x,E){var R=le();try{Ws(o,d,m,f,x,E)}catch(D){if(ue(R),D!==D+0)throw D;de(1,0)}}function e0(o,d,m,f){var x=le();try{Ks(o,d,m,f)}catch(E){if(ue(x),E!==E+0)throw E;de(1,0)}}function t0(o,d,m,f,x){var E=le();try{Gs(o,d,m,f,x)}catch(R){if(ue(E),R!==R+0)throw R;de(1,0)}}function r0(o,d,m,f,x,E,R){var D=le();try{Qs(o,d,m,f,x,E,R)}catch(V){if(ue(D),V!==V+0)throw V;de(1,0)}}function i0(o,d,m,f,x,E,R){var D=le();try{Js(o,d,m,f,x,E,R)}catch(V){if(ue(D),V!==V+0)throw V;de(1,0)}}function n0(o,d,m,f,x,E,R,D){var V=le();try{io(o,d,m,f,x,E,R,D)}catch(H){if(ue(V),H!==H+0)throw H;de(1,0)}}function a0(o,d,m,f,x){var E=le();try{return Xs(o,d,m,f,x)}catch(R){if(ue(E),R!==R+0)throw R;de(1,0)}}function s0(o,d,m){var f=le();try{return no(o,d,m)}catch(x){if(ue(f),x!==x+0)throw x;de(1,0)}}function o0(o,d,m,f,x,E,R,D){var V=le();try{ao(o,d,m,f,x,E,R,D)}catch(H){if(ue(V),H!==H+0)throw H;de(1,0)}}function u0(o,d,m,f,x,E,R,D,V,H,oe,ce){var ye=le();try{eo(o,d,m,f,x,E,R,D,V,H,oe,ce)}catch(_e){if(ue(ye),_e!==_e+0)throw _e;de(1,0)}}function l0(o,d,m){var f=le();try{return so(o,d,m)}catch(x){if(ue(f),x!==x+0)throw x;return de(1,0),0n}}function d0(o,d,m,f,x,E,R,D,V){var H=le();try{Fs(o,d,m,f,x,E,R,D,V)}catch(oe){if(ue(H),oe!==oe+0)throw oe;de(1,0)}}function p0(o){var d=le();try{return oo(o)}catch(m){if(ue(d),m!==m+0)throw m;de(1,0)}}function c0(o,d){var m=le();try{return xo(o,d)}catch(f){if(ue(m),f!==f+0)throw f;return de(1,0),0n}}function h0(o){var d=le();try{return uo(o)}catch(m){if(ue(d),m!==m+0)throw m;return de(1,0),0n}}function f0(o,d,m,f){var x=le();try{return mo(o,d,m,f)}catch(E){if(ue(x),E!==E+0)throw E;de(1,0)}}function m0(o,d,m,f,x){var E=le();try{return go(o,d,m,f,x)}catch(R){if(ue(E),R!==R+0)throw R;de(1,0)}}function g0(o,d,m,f,x,E){var R=le();try{return yo(o,d,m,f,x,E)}catch(D){if(ue(R),D!==D+0)throw D;de(1,0)}}function y0(o,d,m,f,x,E){var R=le();try{return to(o,d,m,f,x,E)}catch(D){if(ue(R),D!==D+0)throw D;de(1,0)}}function b0(o,d,m,f,x,E){var R=le();try{return bo(o,d,m,f,x,E)}catch(D){if(ue(R),D!==D+0)throw D;de(1,0)}}function _0(o,d,m,f,x,E,R,D){var V=le();try{return ro(o,d,m,f,x,E,R,D)}catch(H){if(ue(V),H!==H+0)throw H;de(1,0)}}function w0(o,d,m,f,x){var E=le();try{return _o(o,d,m,f,x)}catch(R){if(ue(E),R!==R+0)throw R;return de(1,0),0n}}function v0(o,d,m,f){var x=le();try{return wo(o,d,m,f)}catch(E){if(ue(x),E!==E+0)throw E;de(1,0)}}function $0(o,d,m,f){var x=le();try{return vo(o,d,m,f)}catch(E){if(ue(x),E!==E+0)throw E;de(1,0)}}function x0(o,d,m,f,x,E,R,D,V,H,oe,ce){var ye=le();try{return $o(o,d,m,f,x,E,R,D,V,H,oe,ce)}catch(_e){if(ue(ye),_e!==_e+0)throw _e;de(1,0)}}function S0(o,d,m,f,x,E,R,D,V,H,oe){var ce=le();try{ho(o,d,m,f,x,E,R,D,V,H,oe)}catch(ye){if(ue(ce),ye!==ye+0)throw ye;de(1,0)}}function k0(o,d,m,f,x,E,R,D,V,H,oe,ce,ye,_e,ht,Oi){var C0=le();try{fo(o,d,m,f,x,E,R,D,V,H,oe,ce,ye,_e,ht,Oi)}catch(Ri){if(ue(C0),Ri!==Ri+0)throw Ri;de(1,0)}}function T0(o,d,m){var f=le();try{return lo(o,d,m)}catch(x){if(ue(f),x!==x+0)throw x;de(1,0)}}function E0(o,d,m){var f=le();try{return po(o,d,m)}catch(x){if(ue(f),x!==x+0)throw x;de(1,0)}}function I0(o,d,m,f){var x=le();try{co(o,d,m,f)}catch(E){if(ue(x),E!==E+0)throw E;de(1,0)}}function Pr(){if(0<Be)xt=Pr;else if(n)w?.(t),K();else{for(var o=Se;0<o.length;)o.shift()(t);0<Be?xt=Pr:(t.calledRun=!0,A||(K(),w?.(t)))}}return n||(it=await xe(),Pr()),t.PTR_SIZE=4,J?t:new Promise((o,d)=>{w=o,k=d})}var ta,H0,F0,j0,K0,U=(e,t,r)=>()=>{if(r)throw r[0];try{return e&&(t=e(e=0)),t}catch(i){throw r=[i],i}},Yt=(e,t)=>{for(var r in t)ta(e,r,{get:t[r],enumerable:!0})},Z0=(e,t,r,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of F0(t))!j0.call(e,n)&&n!==r&&ta(e,n,{get:()=>t[n],enumerable:!(i=H0(t,n))||i.enumerable});return e},vr=(e)=>Z0(ta({},"__esModule",{value:!0}),e),sr,mt,Bt,qo,Ep,Ip,Y0,Cp,X0,Pi,ze,Ap,we,Q0,zp,Op,J0,Vr,Rp,Mp,Bp,Dp,Np,ey,Ot,yr,Ui,Pp,ty,Up,Lp,ry,Ne,ra,Ye,qp,$r,Li,Xe,qe,_t,wt,Vp,Wp,iy,ia,ny,ay,sy,oy,uy,Gp,Ve,na,Hp,qi,Vi,Fp,ly,jp,Kp,Wo,dy,Wi,Ln,Go,De,Zp,Wr,Ho,Fo,Gi,jo,Hi,Yp,Fi,Xp,aa,ji,Gr,or,Ki,Ko,Zo,Yo,sa,be,Ut,Ze,ii,me,oa,Qp,py,Xo,Qo,Jo,Et,eu,Jp,cy,Rt,st,Mt,di,ni,ua,la,qn,ee,da,ec,tu,ru,iu,nu,pa,au,pe,ot,su,Kt,M,ai,tc,rc,ic,ie,ca,nc,Zi,ou,Yi,uu,Xi,lu,Qi,Ji,en,du,ac,hy,ur,pu,sc,fy,ha,tn,Hr,Fr,cu,hu,rn,Vn,fu,oc,my,mu,fe,Te,Zt,jr,Ae,Ce,X,ke,Wn,jt,vt,Z,lr,B,j,uc,fa,gu,lc,ne,yu,nn,bu,_u,wu,vu,Pe,dc,pc,$t,$u,xu,Su,ku,Tu,Eu,Iu,Cu,Au,zu,Ge,cc,hc,fc,mc,gc,yc,bc,_c,wc,vc,gy,He,Ou,si,Gn,Fe,Ru,Mu,Bu,Du,Nu,Pu,Uu,Lu,qu,Vu,je,$c,xc,Sc,kc,Tc,Ec,Ic,Cc,Ac,zc,ma,an,Oc,Rc,Hn,yy,Wu,Kr,Gu,Hu,Fu,xr,ju,Mc,ga,Ku,Zu,Yu,Bc,by,Xu,Qu,Dc,_y,Ju,he,Nc,Pc,Uc,Lc,qc,Vc,Wc,Gc,Hc,el,Fc,jc,Kc,Zc,br,Yc,ri,Xc,Qc,Jc,eh,th,rh,ih,nh,ah,sh,oh,uh,lh,dh,ph,ch,hh,sn,fh,Fn,jn,mh,gh,yh,tl,rl,bh,ya,il,nl,_h,wy,al,sl,Ke,wh,vh,$h,xh,Sh,kh,Th,Eh,Ih,Ch,vy,ol,ul,ll,dl,Ah,zh,$y,Dt,Nt,Pt,ba,Lt,Oe,Oh,_a,Rh,xy,wr,wa,va,pl,cl,Kn,on,hl,Zn,fl,oi,$a,ml,Mh,Sy,gl,un,dr,yl,ln,bl,Bh,Dh,ky,Nh,Ph,Ty,_l,Zr,wl,Yr,Yn,dn,vl,$l,Xn,Ey,Uh,Iy,xl,Sl,kl,pn,Lh,Tl,cn,El,qh,Cy,Il,Vh,Wh,Ay,Cl,Al,zl,Gh,Hh,zy,nt,pr,Xr,hn,gt,Ol,Rl,Ml,fn,mn,gn,Bl,Dl,yn,Nl,Fh,jh,Oy,Qr,cr,bn,Pl,Ul,Ll,ql,_n,Vl,Kh,Zh,Ry,Wl,wn,Gl,Hl,Yh,My,Fl,Xh,By,jl,Kl,Qh,Jh,Dy,Zl,ef,tf,Ny,Yl,Xl,rf,nf,Py,Ql,Jl,af,sf,Uy,ed,td,of,uf,Ly,tt,at,It,Ct,rd,id,nd,ad,sd,od,ud,ld,lf,df,qy,Me,dd,pf,vn,pd,_r,cf,hf,cd,hd,fd,md,Qn,ff,mf,gf,gd,ui,yf,bf,yd,bd,$n,_d,_f,Vy,xn,wd,vd,wf,Wy,$d,xd,vf,Gy,Sd,$f,Hy,kd,Td,Ed,xf,Sf,Fy,Id,Cd,Ad,zd,Od,Rd,Md,Bd,kf,jy,hr,Sn,kn,Tn,En,Dd,Nd,In,Cn,Tf,Ef,An,If,Cf,zn,Af,zf,Of,Rf,Ky,Pd,Ud,Mf,Bf,Zy,Ld,qd,Df,Yy,Vd,Wd,Nf,Pf,Xy,Gd,Hd,Fd,On,jd,Kd,Zd,Yd,Xd,Qd,Jd,ep,Rn,tp,rp,ip,np,ap,Uf,Lf,Qy,sp,op,qf,Jy,up,fr,lp,Mn,dp,pp,Vf,Wf,eb,cp,hp,Gf,Hf,tb,Bn,fp,mp,gp,Ff,rb,yp,bp,jf,ib,Kf,nb,Zf,ab,Yf,_p,wp,vp,Xf,sb,Qf,Jr,$p,Jf,ob,xp,xa,Sa,yt,Sp,Dn,li,ka,Ta,Nn,Ea,Ia,Ca,em,bt,Le,Ft,mr,gr,ei,Pn,ti,At,zt,kp,tm,rm,im,nm,am,sm,om,um,Un,Tp,lm,ub,dm,Jn,ea,pm,lb,db="1.29.0",pb;var hm=tr(()=>{/*!
 * ONNX Runtime Web v1.29.0
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */ta=Object.defineProperty,H0=Object.getOwnPropertyDescriptor,F0=Object.getOwnPropertyNames,j0=Object.prototype.hasOwnProperty,K0=((e)=>Bi)(function(e){return Bi.apply(this,arguments)}),Ip=U(()=>{sr=new Map,mt=[],Bt=(e,t,r)=>{if(t&&typeof t.init=="function"&&typeof t.createInferenceSessionHandler=="function"){let i=sr.get(e);if(i===void 0)sr.set(e,{backend:t,priority:r});else{if(i.priority>r)return;if(i.priority===r&&i.backend!==t)throw Error(`cannot register backend "${e}" using priority ${r}`)}if(r>=0){let n=mt.indexOf(e);n!==-1&&mt.splice(n,1);for(let a=0;a<mt.length;a++)if(sr.get(mt[a]).priority<=r){mt.splice(a,0,e);return}mt.push(e)}return}throw TypeError("not a valid backend")},qo=async(e)=>{let t=sr.get(e);if(!t)return"backend not found.";if(t.initialized)return t.backend;if(t.aborted)return t.error;{let r=!!t.initPromise;try{return r||(t.initPromise=t.backend.init(e)),await t.initPromise,t.initialized=!0,t.backend}catch(i){return r||(t.error=`${i}`,t.aborted=!0),t.error}finally{delete t.initPromise}}},Ep=async(e)=>{let t=e.executionProviders||[],r=t.map((l)=>typeof l=="string"?l:l.name),i=r.length===0?mt:r,n,a=[],s=new Set;for(let l of i){let p=await qo(l);typeof p=="string"?a.push({name:l,err:p}):(n||(n=p),n===p&&s.add(l))}if(!n)throw Error(`no available backend found. ERR: ${a.map((l)=>`[${l.name}] ${l.err}`).join(", ")}`);for(let{name:l,err:p}of a)r.includes(l)&&console.warn(`removing requested execution provider "${l}" from session options because it is not available: ${p}`);let u=t.filter((l)=>s.has(typeof l=="string"?l:l.name));return[n,new Proxy(e,{get:(l,p)=>p==="executionProviders"?u:Reflect.get(l,p)})]}}),Y0=U(()=>{Ip()}),X0=U(()=>{Cp="1.29.0"}),Ap=U(()=>{X0(),Pi="warning",ze={wasm:{},webgl:{},webgpu:{},versions:{common:Cp},set logLevel(e){if(e!==void 0){if(typeof e!="string"||["verbose","info","warning","error","fatal"].indexOf(e)===-1)throw Error(`Unsupported logging level: ${e}`);Pi=e}},get logLevel(){return Pi}},Object.defineProperty(ze,"logLevel",{enumerable:!0})}),Q0=U(()=>{Ap(),we=ze}),J0=U(()=>{zp=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas"):new OffscreenCanvas(1,1);r.width=e.dims[3],r.height=e.dims[2];let i=r.getContext("2d");if(i!=null){let n,a;t?.tensorLayout!==void 0&&t.tensorLayout==="NHWC"?(n=e.dims[2],a=e.dims[3]):(n=e.dims[3],a=e.dims[2]);let s=t?.format!==void 0?t.format:"RGB",u=t?.norm,l,p;u===void 0||u.mean===void 0?l=[255,255,255,255]:typeof u.mean=="number"?l=[u.mean,u.mean,u.mean,u.mean]:(l=[u.mean[0],u.mean[1],u.mean[2],0],u.mean[3]!==void 0&&(l[3]=u.mean[3])),u===void 0||u.bias===void 0?p=[0,0,0,0]:typeof u.bias=="number"?p=[u.bias,u.bias,u.bias,u.bias]:(p=[u.bias[0],u.bias[1],u.bias[2],0],u.bias[3]!==void 0&&(p[3]=u.bias[3]));let h=a*n,c=0,g=h,b=h*2,y=-1;s==="RGBA"?(c=0,g=h,b=h*2,y=h*3):s==="RGB"?(c=0,g=h,b=h*2):s==="RBG"&&(c=0,b=h,g=h*2);for(let w=0;w<a;w++)for(let k=0;k<n;k++){let S=(e.data[c++]-p[0])*l[0],_=(e.data[g++]-p[1])*l[1],I=(e.data[b++]-p[2])*l[2],T=y===-1?255:(e.data[y++]-p[3])*l[3];i.fillStyle="rgba("+S+","+_+","+I+","+T+")",i.fillRect(k,w,1,1)}if("toDataURL"in r)return r.toDataURL();throw Error("toDataURL is not supported")}else throw Error("Can not access image data")},Op=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas").getContext("2d"):new OffscreenCanvas(1,1).getContext("2d"),i;if(r!=null){let n,a,s;t?.tensorLayout!==void 0&&t.tensorLayout==="NHWC"?(n=e.dims[2],a=e.dims[1],s=e.dims[3]):(n=e.dims[3],a=e.dims[2],s=e.dims[1]);let u=t!==void 0&&t.format!==void 0?t.format:"RGB",l=t?.norm,p,h;l===void 0||l.mean===void 0?p=[255,255,255,255]:typeof l.mean=="number"?p=[l.mean,l.mean,l.mean,l.mean]:(p=[l.mean[0],l.mean[1],l.mean[2],255],l.mean[3]!==void 0&&(p[3]=l.mean[3])),l===void 0||l.bias===void 0?h=[0,0,0,0]:typeof l.bias=="number"?h=[l.bias,l.bias,l.bias,l.bias]:(h=[l.bias[0],l.bias[1],l.bias[2],0],l.bias[3]!==void 0&&(h[3]=l.bias[3]));let c=a*n;if(t!==void 0&&(t.format!==void 0&&s===4&&t.format!=="RGBA"||s===3&&t.format!=="RGB"&&t.format!=="BGR"))throw Error("Tensor format doesn't match input tensor dims");let g=4,b=0,y=1,w=2,k=3,S=0,_=c,I=c*2,T=-1;u==="RGBA"?(S=0,_=c,I=c*2,T=c*3):u==="RGB"?(S=0,_=c,I=c*2):u==="RBG"&&(S=0,I=c,_=c*2),i=r.createImageData(n,a);for(let C=0;C<a*n;b+=g,y+=g,w+=g,k+=g,C++)i.data[b]=(e.data[S++]-h[0])*p[0],i.data[y]=(e.data[_++]-h[1])*p[1],i.data[w]=(e.data[I++]-h[2])*p[2],i.data[k]=T===-1?255:(e.data[T++]-h[3])*p[3]}else throw Error("Can not access image data");return i}}),ey=U(()=>{ra(),Vr=(e,t)=>{if(e===void 0)throw Error("Image buffer must be defined");if(t.height===void 0||t.width===void 0)throw Error("Image height and width must be defined");if(t.tensorLayout==="NHWC")throw Error("NHWC Tensor layout is not supported yet");let{height:r,width:i}=t,n=t.norm??{mean:255,bias:0},a,s;typeof n.mean=="number"?a=[n.mean,n.mean,n.mean,n.mean]:a=[n.mean[0],n.mean[1],n.mean[2],n.mean[3]??255],typeof n.bias=="number"?s=[n.bias,n.bias,n.bias,n.bias]:s=[n.bias[0],n.bias[1],n.bias[2],n.bias[3]??0];let u=t.format!==void 0?t.format:"RGBA",l=t.tensorFormat!==void 0&&t.tensorFormat!==void 0?t.tensorFormat:"RGB",p=r*i,h=l==="RGBA"?new Float32Array(p*4):new Float32Array(p*3),c=4,g=0,b=1,y=2,w=3,k=0,S=p,_=p*2,I=-1;u==="RGB"&&(c=3,g=0,b=1,y=2,w=-1),l==="RGBA"?I=p*3:l==="RBG"?(k=0,_=p,S=p*2):l==="BGR"&&(_=0,S=p,k=p*2);for(let T=0;T<p;T++,g+=c,y+=c,b+=c,w+=c)h[k++]=(e[g]+s[0])/a[0],h[S++]=(e[b]+s[1])/a[1],h[_++]=(e[y]+s[2])/a[2],I!==-1&&w!==-1&&(h[I++]=(e[w]+s[3])/a[3]);return l==="RGBA"?new Ne("float32",h,[1,4,r,i]):new Ne("float32",h,[1,3,r,i])},Rp=async(e,t)=>{let r=typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement,i=typeof ImageData<"u"&&e instanceof ImageData,n=typeof ImageBitmap<"u"&&e instanceof ImageBitmap,a=typeof e=="string",s,u=t??{},l=()=>{if(typeof document<"u")return document.createElement("canvas");if(typeof OffscreenCanvas<"u")return new OffscreenCanvas(1,1);throw Error("Canvas is not supported")},p=(h)=>typeof HTMLCanvasElement<"u"&&h instanceof HTMLCanvasElement||h instanceof OffscreenCanvas?h.getContext("2d"):null;if(r){let h=l();h.width=e.width,h.height=e.height;let c=p(h);if(c!=null){let{height:g,width:b}=e;if(t!==void 0&&t.resizedHeight!==void 0&&t.resizedWidth!==void 0&&(g=t.resizedHeight,b=t.resizedWidth),t!==void 0){if(u=t,t.tensorFormat!==void 0)throw Error("Image input config format must be RGBA for HTMLImageElement");u.tensorFormat="RGBA",u.height=g,u.width=b}else u.tensorFormat="RGBA",u.height=g,u.width=b;c.drawImage(e,0,0),s=c.getImageData(0,0,b,g).data}else throw Error("Can not access image data")}else if(i){let h,c;if(t!==void 0&&t.resizedWidth!==void 0&&t.resizedHeight!==void 0?(h=t.resizedHeight,c=t.resizedWidth):(h=e.height,c=e.width),t!==void 0&&(u=t),u.format="RGBA",u.height=h,u.width=c,t!==void 0){let g=l();g.width=c,g.height=h;let b=p(g);if(b!=null)b.putImageData(e,0,0),s=b.getImageData(0,0,c,h).data;else throw Error("Can not access image data")}else s=e.data}else if(n){if(t===void 0)throw Error("Please provide image config with format for Imagebitmap");let h=l();h.width=e.width,h.height=e.height;let c=p(h);if(c!=null){let{height:g,width:b}=e;return c.drawImage(e,0,0,b,g),s=c.getImageData(0,0,b,g).data,u.height=g,u.width=b,Vr(s,u)}else throw Error("Can not access image data")}else{if(a)return new Promise((h,c)=>{let g=l(),b=p(g);if(!e||!b)return c();let y=new Image;y.crossOrigin="Anonymous",y.src=e,y.onload=()=>{g.width=y.width,g.height=y.height,b.drawImage(y,0,0,g.width,g.height);let w=b.getImageData(0,0,g.width,g.height);u.height=g.height,u.width=g.width,h(Vr(w.data,u))}});throw Error("Input data provided is not supported - aborted tensor creation")}if(s!==void 0)return Vr(s,u);throw Error("Input data provided is not supported - aborted tensor creation")},Mp=(e,t)=>{let{width:r,height:i,download:n,dispose:a}=t;return new Ne({location:"texture",type:"float32",texture:e,dims:[1,i,r,4],download:n,dispose:a})},Bp=(e,t)=>{let{dataType:r,dims:i,download:n,dispose:a}=t;return new Ne({location:"gpu-buffer",type:r??"float32",gpuBuffer:e,dims:i,download:n,dispose:a})},Dp=(e,t)=>{let{dataType:r,dims:i,download:n,dispose:a}=t;return new Ne({location:"ml-tensor",type:r??"float32",mlTensor:e,dims:i,download:n,dispose:a})},Np=(e,t,r)=>new Ne({location:"cpu-pinned",type:e,data:t,dims:r??[t.length]})}),ty=U(()=>{Ot=new Map([["float32",Float32Array],["uint8",Uint8Array],["int8",Int8Array],["uint16",Uint16Array],["int16",Int16Array],["int32",Int32Array],["bool",Uint8Array],["float64",Float64Array],["uint32",Uint32Array],["int4",Uint8Array],["uint4",Uint8Array]]),yr=new Map([[Float32Array,"float32"],[Uint8Array,"uint8"],[Int8Array,"int8"],[Uint16Array,"uint16"],[Int16Array,"int16"],[Int32Array,"int32"],[Float64Array,"float64"],[Uint32Array,"uint32"]]),Ui=!1,Pp=()=>{if(!Ui){Ui=!0;let e=typeof BigInt64Array<"u"&&BigInt64Array.from,t=typeof BigUint64Array<"u"&&BigUint64Array.from,r=globalThis.Float16Array,i=typeof r<"u"&&r.from;e&&(Ot.set("int64",BigInt64Array),yr.set(BigInt64Array,"int64")),t&&(Ot.set("uint64",BigUint64Array),yr.set(BigUint64Array,"uint64")),i?(Ot.set("float16",r),yr.set(r,"float16")):Ot.set("float16",Uint16Array)}}}),ry=U(()=>{ra(),Up=(e)=>{let t=1;for(let r=0;r<e.length;r++){let i=e[r];if(typeof i!="number"||!Number.isSafeInteger(i))throw TypeError(`dims[${r}] must be an integer, got: ${i}`);if(i<0)throw RangeError(`dims[${r}] must be a non-negative integer, got: ${i}`);t*=i}return t},Lp=(e,t)=>{switch(e.location){case"cpu":return new Ne(e.type,e.data,t);case"cpu-pinned":return new Ne({location:"cpu-pinned",data:e.data,type:e.type,dims:t});case"texture":return new Ne({location:"texture",texture:e.texture,type:e.type,dims:t});case"gpu-buffer":return new Ne({location:"gpu-buffer",gpuBuffer:e.gpuBuffer,type:e.type,dims:t});case"ml-tensor":return new Ne({location:"ml-tensor",mlTensor:e.mlTensor,type:e.type,dims:t});default:throw Error(`tensorReshape: tensor location ${e.location} is not supported`)}}}),ra=U(()=>{J0(),ey(),ty(),ry(),Ne=class{constructor(e,t,r){Pp();let i,n;if(typeof e=="object"&&"location"in e)switch(this.dataLocation=e.location,i=e.type,n=e.dims,e.location){case"cpu-pinned":{let s=Ot.get(i);if(!s)throw TypeError(`unsupported type "${i}" to create tensor from pinned buffer`);if(!(e.data instanceof s))throw TypeError(`buffer should be of type ${s.name}`);this.cpuData=e.data;break}case"texture":{if(i!=="float32")throw TypeError(`unsupported type "${i}" to create tensor from texture`);this.gpuTextureData=e.texture,this.downloader=e.download,this.disposer=e.dispose;break}case"gpu-buffer":{if(i!=="float32"&&i!=="float16"&&i!=="int32"&&i!=="int64"&&i!=="uint32"&&i!=="uint8"&&i!=="bool"&&i!=="uint4"&&i!=="int4")throw TypeError(`unsupported type "${i}" to create tensor from gpu buffer`);this.gpuBufferData=e.gpuBuffer,this.downloader=e.download,this.disposer=e.dispose;break}case"ml-tensor":{if(i!=="float32"&&i!=="float16"&&i!=="int32"&&i!=="int64"&&i!=="uint32"&&i!=="uint64"&&i!=="int8"&&i!=="uint8"&&i!=="bool"&&i!=="uint4"&&i!=="int4")throw TypeError(`unsupported type "${i}" to create tensor from MLTensor`);this.mlTensorData=e.mlTensor,this.downloader=e.download,this.disposer=e.dispose;break}default:throw Error(`Tensor constructor: unsupported location '${this.dataLocation}'`)}else{let s,u;if(typeof e=="string")if(i=e,u=r,e==="string"){if(!Array.isArray(t))throw TypeError("A string tensor's data must be a string array.");s=t}else{let l=Ot.get(e);if(l===void 0)throw TypeError(`Unsupported tensor type: ${e}.`);if(Array.isArray(t)){if(e==="float16"&&l===Uint16Array||e==="uint4"||e==="int4")throw TypeError(`Creating a ${e} tensor from number array is not supported. Please use ${l.name} as data.`);e==="uint64"||e==="int64"?s=l.from(t,BigInt):s=l.from(t)}else if(t instanceof l)s=t;else if(t instanceof Uint8ClampedArray)if(e==="uint8")s=Uint8Array.from(t);else throw TypeError("A Uint8ClampedArray tensor's data must be type of uint8");else if(e==="float16"&&t instanceof Uint16Array&&l!==Uint16Array)s=new globalThis.Float16Array(t.buffer,t.byteOffset,t.length);else throw TypeError(`A ${i} tensor's data must be type of ${l}`)}else if(u=t,Array.isArray(e)){if(e.length===0)throw TypeError("Tensor type cannot be inferred from an empty array.");let l=typeof e[0];if(l==="string")i="string",s=e;else if(l==="boolean")i="bool",s=Uint8Array.from(e);else throw TypeError(`Invalid element type of data array: ${l}.`)}else if(e instanceof Uint8ClampedArray)i="uint8",s=Uint8Array.from(e);else{let l=yr.get(e.constructor);if(l===void 0)throw TypeError(`Unsupported type for tensor data: ${e.constructor}.`);i=l,s=e}if(u===void 0)u=[s.length];else if(!Array.isArray(u))throw TypeError("A tensor's dims must be a number array");n=u,this.cpuData=s,this.dataLocation="cpu"}let a=Up(n);if(this.cpuData&&a!==this.cpuData.length&&!((i==="uint4"||i==="int4")&&Math.ceil(a/2)===this.cpuData.length))throw Error(`Tensor's size(${a}) does not match data length(${this.cpuData.length}).`);this.type=i,this.dims=n,this.size=a}static async fromImage(e,t){return Rp(e,t)}static fromTexture(e,t){return Mp(e,t)}static fromGpuBuffer(e,t){return Bp(e,t)}static fromMLTensor(e,t){return Dp(e,t)}static fromPinnedBuffer(e,t,r){return Np(e,t,r)}toDataURL(e){return zp(this,e)}toImageData(e){return Op(this,e)}get data(){if(this.ensureValid(),!this.cpuData)throw Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");return this.cpuData}get location(){return this.dataLocation}get texture(){if(this.ensureValid(),!this.gpuTextureData)throw Error("The data is not stored as a WebGL texture.");return this.gpuTextureData}get gpuBuffer(){if(this.ensureValid(),!this.gpuBufferData)throw Error("The data is not stored as a WebGPU buffer.");return this.gpuBufferData}get mlTensor(){if(this.ensureValid(),!this.mlTensorData)throw Error("The data is not stored as a WebNN MLTensor.");return this.mlTensorData}async getData(e){switch(this.ensureValid(),this.dataLocation){case"cpu":case"cpu-pinned":return this.data;case"texture":case"gpu-buffer":case"ml-tensor":{if(!this.downloader)throw Error("The current tensor is not created with a specified data downloader.");if(this.isDownloading)throw Error("The current tensor is being downloaded.");try{this.isDownloading=!0;let t=await this.downloader();return this.downloader=void 0,this.dataLocation="cpu",this.cpuData=t,e&&this.disposer&&(this.disposer(),this.disposer=void 0),t}finally{this.isDownloading=!1}}default:throw Error(`cannot get data from location: ${this.dataLocation}`)}}dispose(){if(this.isDownloading)throw Error("The current tensor is being downloaded.");this.disposer&&(this.disposer(),this.disposer=void 0),this.cpuData=void 0,this.gpuTextureData=void 0,this.gpuBufferData=void 0,this.mlTensorData=void 0,this.downloader=void 0,this.isDownloading=void 0,this.dataLocation="none"}ensureValid(){if(this.dataLocation==="none")throw Error("The tensor is disposed.")}reshape(e){if(this.ensureValid(),this.downloader||this.disposer)throw Error("Cannot reshape a tensor that owns GPU resource.");return Lp(this,e)}}}),qp=U(()=>{ra(),Ye=Ne}),Vp=U(()=>{Ap(),$r=(e,t)=>{(typeof ze.trace>"u"?!ze.wasm.trace:!ze.trace)||console.timeStamp(`${e}::ORT::${t}`)},Li=(e,t)=>{let r=Error().stack?.split(/\r\n|\r|\n/g)||[],i=!1;for(let n=0;n<r.length;n++){if(i&&!r[n].includes("TRACE_FUNC")){let a=`FUNC_${e}::${r[n].trim().split(" ")[1]}`;t&&(a+=`::${t}`),$r("CPU",a);return}r[n].includes("TRACE_FUNC")&&(i=!0)}},Xe=(e)=>{(typeof ze.trace>"u"?!ze.wasm.trace:!ze.trace)||Li("BEGIN",e)},qe=(e)=>{(typeof ze.trace>"u"?!ze.wasm.trace:!ze.trace)||Li("END",e)},_t=(e)=>{(typeof ze.trace>"u"?!ze.wasm.trace:!ze.trace)||console.time(`ORT::${e}`)},wt=(e)=>{(typeof ze.trace>"u"?!ze.wasm.trace:!ze.trace)||console.timeEnd(`ORT::${e}`)}}),iy=U(()=>{Ip(),qp(),Vp(),Wp=class e{constructor(t){this.handler=t}async run(t,r,i){Xe(),_t("InferenceSession.run");let n={},a={};if(typeof t!="object"||t===null||t instanceof Ye||Array.isArray(t))throw TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");let s=!0;if(typeof r=="object"){if(r===null)throw TypeError("Unexpected argument[1]: cannot be null.");if(r instanceof Ye)throw TypeError("'fetches' cannot be a Tensor");if(Array.isArray(r)){if(r.length===0)throw TypeError("'fetches' cannot be an empty array.");s=!1;for(let p of r){if(typeof p!="string")throw TypeError("'fetches' must be a string array or an object.");if(this.outputNames.indexOf(p)===-1)throw RangeError(`'fetches' contains invalid output name: ${p}.`);n[p]=null}if(typeof i=="object"&&i!==null)a=i;else if(typeof i<"u")throw TypeError("'options' must be an object.")}else{let p=!1,h=Object.getOwnPropertyNames(r);for(let c of this.outputNames)if(h.indexOf(c)!==-1){let g=r[c];(g===null||g instanceof Ye)&&(p=!0,s=!1,n[c]=g)}if(p){if(typeof i=="object"&&i!==null)a=i;else if(typeof i<"u")throw TypeError("'options' must be an object.")}else a=r}}else if(typeof r<"u")throw TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");for(let p of this.inputNames)if(typeof t[p]>"u")throw Error(`input '${p}' is missing in 'feeds'.`);if(s)for(let p of this.outputNames)n[p]=null;let u=await this.handler.run(t,n,a),l={};for(let p in u)if(Object.hasOwnProperty.call(u,p)){let h=u[p];h instanceof Ye?l[p]=h:l[p]=new Ye(h.type,h.data,h.dims)}return wt("InferenceSession.run"),qe(),l}async release(){return this.handler.dispose()}static async create(t,r,i,n){Xe(),_t("InferenceSession.create");let a,s={};if(typeof t=="string"){if(a=t,typeof r=="object"&&r!==null)s=r;else if(typeof r<"u")throw TypeError("'options' must be an object.")}else if(t instanceof Uint8Array){if(a=t,typeof r=="object"&&r!==null)s=r;else if(typeof r<"u")throw TypeError("'options' must be an object.")}else if(t instanceof ArrayBuffer||typeof SharedArrayBuffer<"u"&&t instanceof SharedArrayBuffer){let h=t,c=0,g=t.byteLength;if(typeof r=="object"&&r!==null)s=r;else if(typeof r=="number"){if(c=r,!Number.isSafeInteger(c))throw RangeError("'byteOffset' must be an integer.");if(c<0||c>=h.byteLength)throw RangeError(`'byteOffset' is out of range [0, ${h.byteLength}).`);if(g=t.byteLength-c,typeof i=="number"){if(g=i,!Number.isSafeInteger(g))throw RangeError("'byteLength' must be an integer.");if(g<=0||c+g>h.byteLength)throw RangeError(`'byteLength' is out of range (0, ${h.byteLength-c}].`);if(typeof n=="object"&&n!==null)s=n;else if(typeof n<"u")throw TypeError("'options' must be an object.")}else if(typeof i<"u")throw TypeError("'byteLength' must be a number.")}else if(typeof r<"u")throw TypeError("'options' must be an object.");a=new Uint8Array(h,c,g)}else throw TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");let[u,l]=await Ep(s),p=await u.createInferenceSessionHandler(a,l);return wt("InferenceSession.create"),qe(),new e(p)}startProfiling(){this.handler.startProfiling()}endProfiling(){this.handler.endProfiling()}get inputNames(){return this.handler.inputNames}get outputNames(){return this.handler.outputNames}get inputMetadata(){return this.handler.inputMetadata}get outputMetadata(){return this.handler.outputMetadata}}}),ny=U(()=>{iy(),ia=Wp}),ay=U(()=>{}),sy=U(()=>{}),oy=U(()=>{}),uy=U(()=>{}),Gp={};Yt(Gp,{InferenceSession:()=>ia,TRACE:()=>$r,TRACE_EVENT_BEGIN:()=>_t,TRACE_EVENT_END:()=>wt,TRACE_FUNC_BEGIN:()=>Xe,TRACE_FUNC_END:()=>qe,Tensor:()=>Ye,env:()=>we,registerBackend:()=>Bt});Ve=U(()=>{Y0(),Q0(),ny(),qp(),ay(),sy(),Vp(),oy(),uy()}),na=U(()=>{}),Hp={};Yt(Hp,{default:()=>Fp});ly=U(()=>{em(),Ut(),aa(),qi="ort-wasm-proxy-worker",Vi=globalThis.self?.name===qi,Vi&&(self.onmessage=(e)=>{let{type:t,in:r}=e.data;try{switch(t){case"init-wasm":sa(r.wasm).then(()=>{xa(r).then(()=>{postMessage({type:t})},(i)=>{postMessage({type:t,err:i})})},(i)=>{postMessage({type:t,err:i})});break;case"init-ep":{let{epName:i,env:n}=r;Sa(n,i).then(()=>{postMessage({type:t})},(a)=>{postMessage({type:t,err:a})});break}case"copy-from":{let{buffer:i}=r,n=li(i);postMessage({type:t,out:n});break}case"create":{let{model:i,options:n}=r;ka(i,n).then((a)=>{postMessage({type:t,out:a})},(a)=>{postMessage({type:t,err:a})});break}case"release":Ta(r),postMessage({type:t});break;case"run":{let{sessionId:i,inputIndices:n,inputs:a,outputIndices:s,options:u}=r;Ea(i,n,a,s,Array(s.length).fill(null),u).then((l)=>{l.some((p)=>p[3]!=="cpu")?postMessage({type:t,err:"Proxy does not support non-cpu tensor location."}):postMessage({type:t,out:l},Ca([...a,...l]))},(l)=>{postMessage({type:t,err:l})});break}case"end-profiling":Ia(r),postMessage({type:t});break;default:}}catch(i){postMessage({type:t,err:i})}}),Fp=Vi?null:(e)=>new Worker(e??De,{type:"module",name:qi})}),jp={};Yt(jp,{default:()=>Kp});dy=U(()=>{Kp=Vo,Wo=globalThis.self?.name?.startsWith("em-pthread"),Wo&&Vo()}),aa=U(()=>{na(),Wi=typeof location>"u"?void 0:location.origin,Ln=import.meta.url>"file:"&&import.meta.url<"file;",Go=()=>{if(Ln)return new URL(new URL("ort.bundle.min.mjs",import.meta.url).href,Wi).href;return import.meta.url},De=Go(),Zp=()=>{if(De&&!De.startsWith("blob:"))return De.substring(0,De.lastIndexOf("/")+1)},Wr=(e,t)=>{try{let r=t??De;return(r?new URL(e,r):new URL(e)).origin===Wi}catch{return!1}},Ho=(e,t)=>{let r=t??De;try{return(r?new URL(e,r):new URL(e)).href}catch{return}},Fo=(e,t)=>`${t??"./"}${e}`,Gi=async(e)=>{let t=await(await fetch(e,{credentials:"same-origin"})).blob();return URL.createObjectURL(t)},jo=async(e)=>(await import(e)).default,Hi=(ly(),vr(Hp)).default,Yp=async()=>{if(!De)throw Error("Failed to load proxy worker: cannot determine the script source URL.");if(Wr(De))return[void 0,Hi()];let e=await Gi(De);return[e,Hi(e)]},Fi=(dy(),vr(jp)).default,Xp=async(e,t,r,i)=>{let n=Fi&&!(e||t);if(n)if(De)n=Wr(De)||i&&!r;else if(i&&!r)n=!0;else throw Error("cannot determine the script source URL.");if(n)return[void 0,Fi];{let a="ort-wasm-simd-threaded.jsep.mjs",s=e??Ho(a,t),u=r&&s&&!Wr(s,t),l=u?await Gi(s):s??Fo(a,t);return[u?l:void 0,await jo(l)]}}}),Ut=U(()=>{aa(),Gr=!1,or=!1,Ki=!1,Ko=()=>{if(typeof SharedArrayBuffer>"u")return!1;try{return typeof MessageChannel<"u"&&new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)),WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,5,4,1,3,1,1,10,11,1,9,0,65,0,254,16,2,0,26,11]))}catch{return!1}},Zo=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,30,1,28,0,65,0,253,15,253,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,186,1,26,11]))}catch{return!1}},Yo=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,19,1,17,0,65,1,253,15,65,2,253,15,65,3,253,15,253,147,2,11]))}catch{return!1}},sa=async(e)=>{if(Gr)return Promise.resolve();if(or)throw Error("multiple calls to 'initializeWebAssembly()' detected.");if(Ki)throw Error("previous call to 'initializeWebAssembly()' failed.");or=!0;let{initTimeout:t,numThreads:r}=e;if(e.simd!==!1){if(e.simd==="relaxed"){if(!Yo())throw Error("Relaxed WebAssembly SIMD is not supported in the current environment.")}else if(!Zo())throw Error("WebAssembly SIMD is not supported in the current environment.")}let i=Ko();r>1&&!i&&(typeof self<"u"&&!self.crossOriginIsolated&&console.warn("env.wasm.numThreads is set to "+r+", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."),console.warn("WebAssembly multi-threading is not supported in the current environment. Falling back to single-threading."),e.numThreads=r=1);let n=e.wasmPaths,a=typeof n=="string"?n:void 0,s=n?.mjs,u=s?.href??s,l=n?.wasm,p=l?.href??l,h=e.wasmBinary,[c,g]=await Xp(u,a,r>1,!!h||!!p),b=!1,y=[];if(t>0&&y.push(new Promise((w)=>{setTimeout(()=>{b=!0,w()},t)})),y.push(new Promise((w,k)=>{let S={numThreads:r};if(h)S.wasmBinary=h,S.locateFile=(_)=>_;else if(p||a)S.locateFile=(_)=>p??a+_;else if(u&&u.indexOf("blob:")!==0)S.locateFile=(_)=>new URL(_,u).href;else if(c){let _=Zp();_&&(S.locateFile=(I)=>_+I)}g(S).then((_)=>{or=!1,Gr=!0,ji=_,w(),c&&URL.revokeObjectURL(c)},(_)=>{or=!1,Ki=!0,k(_)})})),await Promise.race(y),b)throw Error(`WebAssembly backend initializing failed due to timeout: ${t}ms`)},be=()=>{if(Gr&&ji)return ji;throw Error("WebAssembly is not initialized yet.")}}),oa=U(()=>{Ut(),Ze=(e,t)=>{let r=be(),i=r.lengthBytesUTF8(e)+1,n=r._malloc(i);return r.stringToUTF8(e,n,i),t.push(n),n},ii=(e,t,r,i)=>{if(typeof e=="object"&&e!==null){if(r.has(e))throw Error("Circular reference in options");r.add(e)}Object.entries(e).forEach(([n,a])=>{let s=t?t+n:n;if(typeof a=="object")ii(a,s+".",r,i);else if(typeof a=="string"||typeof a=="number")i(s,a.toString());else if(typeof a=="boolean")i(s,a?"1":"0");else throw Error(`Can't handle extra config type: ${typeof a}`)})},me=(e)=>{let t=be(),r=t.stackSave();try{let i=t.PTR_SIZE,n=t.stackAlloc(2*i);t._OrtGetLastError(n,n+i);let a=Number(t.getValue(n,i===4?"i32":"i64")),s=t.getValue(n+i,"*"),u=s?t.UTF8ToString(s):"";throw Error(`${e} ERROR_CODE: ${a}, ERROR_MESSAGE: ${u}`)}finally{t.stackRestore(r)}}}),py=U(()=>{Ut(),oa(),Qp=(e)=>{let t=be(),r=0,i=[],n=e||{};try{if(e?.logSeverityLevel===void 0)n.logSeverityLevel=2;else if(typeof e.logSeverityLevel!="number"||!Number.isInteger(e.logSeverityLevel)||e.logSeverityLevel<0||e.logSeverityLevel>4)throw Error(`log severity level is not valid: ${e.logSeverityLevel}`);if(e?.logVerbosityLevel===void 0)n.logVerbosityLevel=0;else if(typeof e.logVerbosityLevel!="number"||!Number.isInteger(e.logVerbosityLevel))throw Error(`log verbosity level is not valid: ${e.logVerbosityLevel}`);e?.terminate===void 0&&(n.terminate=!1);let a=0;return e?.tag!==void 0&&(a=Ze(e.tag,i)),r=t._OrtCreateRunOptions(n.logSeverityLevel,n.logVerbosityLevel,!!n.terminate,a),r===0&&me("Can't create run options."),e?.extra!==void 0&&ii(e.extra,"",new WeakSet,(s,u)=>{let l=Ze(s,i),p=Ze(u,i);t._OrtAddRunConfigEntry(r,l,p)!==0&&me(`Can't set a run config entry: ${s} - ${u}.`)}),[r,i]}catch(a){throw r!==0&&t._OrtReleaseRunOptions(r),i.forEach((s)=>t._free(s)),a}}}),cy=U(()=>{Ut(),oa(),Xo=(e)=>{switch(e){case"disabled":return 0;case"basic":return 1;case"extended":return 2;case"layout":return 3;case"all":return 99;default:throw Error(`unsupported graph optimization level: ${e}`)}},Qo=(e)=>{switch(e){case"sequential":return 0;case"parallel":return 1;default:throw Error(`unsupported execution mode: ${e}`)}},Jo=(e)=>{e.extra||(e.extra={}),e.extra.session||(e.extra.session={});let t=e.extra.session;t.use_ort_model_bytes_directly||(t.use_ort_model_bytes_directly="1"),e.executionProviders&&e.executionProviders.some((r)=>(typeof r=="string"?r:r.name)==="webgpu")&&(e.enableMemPattern=!1)},Et=(e,t,r,i)=>{let n=Ze(t,i),a=Ze(r,i);be()._OrtAddSessionConfigEntry(e,n,a)!==0&&me(`Can't set a session config entry: ${t} - ${r}.`)},eu=async(e,t,r)=>{let i=t.executionProviders;for(let n of i){let a=typeof n=="string"?n:n.name,s=[];switch(a){case"webnn":if(a="WEBNN",Et(e,"session.disable_quant_qdq","1",r),Et(e,"session.disable_qdq_constant_folding","1",r),typeof n!="string"){let c=n?.deviceType;c&&Et(e,"deviceType",c,r)}break;case"webgpu":if(a="JS",typeof n!="string"){let c=n;if(c?.preferredLayout){if(c.preferredLayout!=="NCHW"&&c.preferredLayout!=="NHWC")throw Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${c.preferredLayout}`);Et(e,"preferredLayout",c.preferredLayout,r)}}break;case"wasm":case"cpu":continue;default:throw Error(`not supported execution provider: ${a}`)}let u=Ze(a,r),l=s.length,p=0,h=0;if(l>0){p=be()._malloc(l*be().PTR_SIZE),r.push(p),h=be()._malloc(l*be().PTR_SIZE),r.push(h);for(let c=0;c<l;c++)be().setValue(p+c*be().PTR_SIZE,s[c][0],"*"),be().setValue(h+c*be().PTR_SIZE,s[c][1],"*")}await be()._OrtAppendExecutionProvider(e,u,p,h,l)!==0&&me(`Can't append execution provider: ${a}.`)}},Jp=async(e)=>{let t=be(),r=0,i=[],n=e||{};Jo(n);try{let a=Xo(n.graphOptimizationLevel??"all"),s=Qo(n.executionMode??"sequential"),u=typeof n.logId=="string"?Ze(n.logId,i):0,l=n.logSeverityLevel??2;if(!Number.isInteger(l)||l<0||l>4)throw Error(`log severity level is not valid: ${l}`);let p=n.logVerbosityLevel??0;if(!Number.isInteger(p)||p<0||p>4)throw Error(`log verbosity level is not valid: ${p}`);let h=typeof n.optimizedModelFilePath=="string"?Ze(n.optimizedModelFilePath,i):0;if(r=t._OrtCreateSessionOptions(a,!!n.enableCpuMemArena,!!n.enableMemPattern,s,!!n.enableProfiling,0,u,l,p,h),r===0&&me("Can't create session options."),n.executionProviders&&await eu(r,n,i),n.enableGraphCapture!==void 0){if(typeof n.enableGraphCapture!="boolean")throw Error(`enableGraphCapture must be a boolean value: ${n.enableGraphCapture}`);Et(r,"enableGraphCapture",n.enableGraphCapture.toString(),i)}if(n.freeDimensionOverrides)for(let[c,g]of Object.entries(n.freeDimensionOverrides)){if(typeof c!="string")throw Error(`free dimension override name must be a string: ${c}`);if(typeof g!="number"||!Number.isInteger(g)||g<0)throw Error(`free dimension override value must be a non-negative integer: ${g}`);let b=Ze(c,i);t._OrtAddFreeDimensionOverride(r,b,g)!==0&&me(`Can't set a free dimension override: ${c} - ${g}.`)}return n.extra!==void 0&&ii(n.extra,"",new WeakSet,(c,g)=>{Et(r,c,g,i)}),[r,i]}catch(a){throw r!==0&&t._OrtReleaseSessionOptions(r)!==0&&me("Can't release session options."),i.forEach((s)=>t._free(s)),a}}}),ee=U(()=>{Rt=(e)=>{switch(e){case"int8":return 3;case"uint8":return 2;case"bool":return 9;case"int16":return 5;case"uint16":return 4;case"int32":return 6;case"uint32":return 12;case"float16":return 10;case"float32":return 1;case"float64":return 11;case"string":return 8;case"int64":return 7;case"uint64":return 13;case"int4":return 22;case"uint4":return 21;default:throw Error(`unsupported data type: ${e}`)}},st=(e)=>{switch(e){case 3:return"int8";case 2:return"uint8";case 9:return"bool";case 5:return"int16";case 4:return"uint16";case 6:return"int32";case 12:return"uint32";case 10:return"float16";case 1:return"float32";case 11:return"float64";case 8:return"string";case 7:return"int64";case 13:return"uint64";case 22:return"int4";case 21:return"uint4";default:throw Error(`unsupported data type: ${e}`)}},Mt=(e,t)=>{let r=[-1,4,1,1,2,2,4,8,-1,1,2,8,4,8,-1,-1,-1,-1,-1,-1,-1,0.5,0.5][e],i=typeof t=="number"?t:t.reduce((n,a)=>n*a,1);return r>0?Math.ceil(i*r):void 0},di=(e)=>{switch(e){case"float16":return typeof Float16Array<"u"?Float16Array:Uint16Array;case"float32":return Float32Array;case"uint8":return Uint8Array;case"int8":return Int8Array;case"uint16":return Uint16Array;case"int16":return Int16Array;case"int32":return Int32Array;case"bool":return Uint8Array;case"float64":return Float64Array;case"uint32":return Uint32Array;case"int64":return BigInt64Array;case"uint64":return BigUint64Array;default:throw Error(`unsupported type: ${e}`)}},ni=(e)=>{switch(e){case"verbose":return 0;case"info":return 1;case"warning":return 2;case"error":return 3;case"fatal":return 4;default:throw Error(`unsupported logging level: ${e}`)}},ua=(e)=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",la=(e)=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint64"||e==="int8"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",qn=(e)=>{switch(e){case"none":return 0;case"cpu":return 1;case"cpu-pinned":return 2;case"texture":return 3;case"gpu-buffer":return 4;case"ml-tensor":return 5;default:throw Error(`unsupported data location: ${e}`)}}}),ec=U(()=>{na(),da=async(e)=>{if(typeof e=="string"){let t=await fetch(e);if(!t.ok)throw Error(`failed to load external data file: ${e}`);let r=t.headers.get("Content-Length"),i=r?parseInt(r,10):0;if(i<1073741824)return new Uint8Array(await t.arrayBuffer());{if(!t.body)throw Error(`failed to load external data file: ${e}, no response body.`);let n=t.body.getReader(),a;try{a=new ArrayBuffer(i)}catch(u){if(u instanceof RangeError){let l=Math.ceil(i/65536);a=new WebAssembly.Memory({initial:l,maximum:l}).buffer}else throw u}let s=0;for(;;){let{done:u,value:l}=await n.read();if(u)break;let p=l.byteLength;new Uint8Array(a,s,p).set(l),s+=p}return new Uint8Array(a,0,i)}}else return e instanceof Blob?new Uint8Array(await e.arrayBuffer()):e instanceof Uint8Array?e:new Uint8Array(e)}}),ot=U(()=>{ee(),tu=["V","I","W","E","F"],ru=(e,t)=>{console.log(`[${tu[e]},${new Date().toISOString()}]${t}`)},pa=(e,t)=>{iu=e,nu=t},au=(e,t)=>{let r=ni(e),i=ni(iu);r>=i&&ru(r,typeof t=="function"?t():t)},pe=(...e)=>{nu&&au(...e)}}),ie=U(()=>{su=class{static calcMatMulShape(e,t){return e[1]!==t[0]?void 0:[e[0],t[1]]}},Kt=class{static calcShape(e,t,r=!1){let i=e.length,n=t.length;if(i===0)return t;if(n===0)return e;let a=Math.max(e.length,t.length),s=Array(a);if(r){if(i<2||n<2)return;let u=su.calcMatMulShape([e[i-2],e[i-1]],[t[n-2],t[n-1]]);if(u===void 0)return;[s[a-2],s[a-1]]=u}for(let u=r?3:1;u<=a;u++){let l=i-u<0?1:e[i-u],p=n-u<0?1:t[n-u];if(l!==p&&l>1&&p>1)return;let h=Math.max(l,p);if(l&&p)s[a-u]=Math.max(l,p);else{if(h>1)return;s[a-u]=0}}return s}static isValidBroadcast(e,t){let r=e.length,i=t.length;if(r>i)return!1;for(let n=1;n<=r;n++)if(e[r-n]!==1&&e[r-n]!==t[i-n])return!1;return!0}},M=class e{static size(t){return e.getSizeFromDimensionRange(t,0,t.length)}static convertShape(t,r=4){let i=t.length;if(i===0)return[];let n=Array(i),a=i-1;for(;a>=0;){if(t[a]%r===0){n[a]=t[a]/r;break}if(r%t[a]!==0)throw Error("cannot convert shape");n[a]=1,r/=t[a],a--}for(a--;a>=0;a--)n[a]=t[a];return n}static sizeFromDimension(t,r){if(r<0||r>t.length)throw Error(`invalid dimension of ${r} for sizeFromDimension as Tensor has ${t.length} dimensions.`);return e.getSizeFromDimensionRange(t,r,t.length)}static sizeToDimension(t,r){if(r<0||r>t.length)throw Error(`invalid dimension of ${r} for sizeToDimension as Tensor has ${t.length} dimensions.`);return e.getSizeFromDimensionRange(t,0,r)}static getSizeFromDimensionRange(t,r,i){let n=1;for(let a=r;a<i;a++){if(t[a]<0)throw Error("cannot get valid size from specified dimension range. Most likely the range contains negative values in them.");n*=Number(t[a])}return n}static computeStrides(t){let r=t.length;if(r===0)return[];if(r===1)return[1];let i=Array(r);i[r-1]=1,i[r-2]=t[r-1];for(let n=r-3;n>=0;--n)i[n]=i[n+1]*t[n+1];return i}static normalizeAxis(t,r){if(t<-r&&t>=r)throw Error("unsupported axis for this operation.");return t<0?t+r:t}static normalizeAxes(t,r){return t.map((i)=>this.normalizeAxis(i,r??t.length))}static sortBasedOnPerm(t,r){return r?r.map((i)=>t[i]):t.slice().reverse()}static padShape(t,r){let i=t.length;return t.map((n,a)=>n+r[a]+r[a+i])}static areEqual(t,r){return t.length!==r.length?!1:t.every((i,n)=>i===r[n])}},ai=class e{static adjustPoolAttributes(t,r,i,n,a,s){if(!t&&i.length!==r.length-2)throw Error("length of specified kernel shapes should be 2 less than length of input dimensions");if(t)for(let u=0;u<r.length-2;u++)u>=i.length?i.push(r[u+2]):i[u]=r[u+2];for(let u=0;u<i.length;u++)if(u<n.length){if(n[u]<0)throw Error("strides should be greater than or equal to 1")}else n.push(1);for(let u=0;u<i.length;u++)if(u<a.length){if(a[u]<0)throw Error("dilations should be greater than or equal to 1")}else a.push(1);for(let u=0;u<i.length*2;u++)if(u<s.length){if(s[u]<0)throw Error("pad should be greater than or equal to 1")}else s.push(0);for(let u=0;u<i.length;u++){if(i[u]<=0)throw Error("kernel shapes need to be greater than 0");if(s[u]>=i[u]||s[u+i.length]>=i[u])throw Error("pads should be smaller than kernel")}}static adjustPadsBasedOnAutoPad(t,r,i,n,a,s,u){if(u){if(a.length!==2*(t.length-2))throw Error("length of pads should be twice the length of data dimensions");if(r.length!==t.length-2)throw Error("length of strides should be the length of data dimensions");if(n.length!==t.length-2)throw Error("length of kernel shapes should be the length of data dimensions");for(let l=0;l<t.length-2;l++)e.adjustPadAndReturnShape(t[l+(s?1:2)],r[l],i[l],n[l],a,l,l+t.length-2,u)}}static computePoolOutputShape(t,r,i,n,a,s,u,l=0){if(r.length<=0)throw Error("input shape must be of size greater than 0");let p=[r[0],r[1]];return e.computeShapeHelper(t,r,p,i,n,a,s,u,l),p}static computeConvOutputShape(t,r,i,n,a,s,u){if(t.length<=0||r.length<=0)throw Error("invalid input tensor dims or invalid filter tensor dims");let l=[t[0],r[0]];return e.computeShapeHelper(!1,t,l,i,n,a,s,u),l}static computeShapeHelper(t,r,i,n,a,s,u,l,p=0){if(t)for(let h=0;h<r.length-2;h++)i.push(1);else for(let h=0;h<r.length-2;h++)i.push(e.adjustPadAndReturnShape(r[h+2],n[h],a[h],s[h],u,h,h+r.length-2,l,p))}static computeOutputSize(t,r,i,n,a){let s=Math.floor(t/r)+1;return a===1&&(s=Math.ceil(t/r)+1,(s-1)*r>=i+n&&(s-=1)),s}static adjustPadAndReturnShape(t,r,i,n,a,s,u,l,p=0){let h=i*(n-1)+1;if(l&&l!=="NOTSET")switch(l){case"VALID":return a[s]=0,a[u]=0,e.computeOutputSize(t-h,r,t,0,p);case"SAME_LOWER":case"SAME_UPPER":if(i!==1)throw Error("Dilation not supported for SAME_UPPER or SAME_LOWER");{let c=(Math.floor((t+r-1)/r)-1)*r+n-t;return a[s]=Math.floor(l==="SAME_LOWER"?(c+1)/2:c/2),a[u]=c-a[s],e.computeOutputSize(t+a[s]+a[u]-h,r,t,a[s],p)}default:throw Error("Unsupported AutoPad type")}else return e.computeOutputSize(t+a[s]+a[u]-h,r,t,a[s],p)}},tc=class{static getShapeOfGemmResult(e,t,r,i,n){if(e.length!==2||r.length!==2)throw Error("shape need to be of size 2");let a,s,u;t?(a=e[1],s=e[0]):(a=e[0],s=e[1]);let l=-1;if(i?(u=r[0],l=1):(u=r[1],l=0),r[l]!==s)throw Error("dimension mismatch");if(a<=0||u<=0||s<=0)throw Error("invalid shape specified");if(n&&!Kt.isValidBroadcast(n,[a,u]))throw Error("gemm: invalid bias shape for broadcast");return[a,u,s]}},rc=-340282346638528860000000000000000000000,ic=340282346638528860000000000000000000000}),nc=U(()=>{ee(),ca=(e,t)=>new(di(t))(e)}),hy=U(()=>{ee(),ot(),Zi=new Map([["float32",32],["float16",16],["int32",32],["uint32",32],["int64",64],["uint64",64],["int8",8],["uint8",8],["int4",4],["uint4",4]]),ou=(e,t)=>{if(t==="int32")return e;let r=Zi.get(t);if(!r)throw Error(`WebNN backend does not support data type: ${t}`);let i=r/8;if(e.byteLength%i!==0)throw Error(`Invalid Uint8Array length - must be a multiple of ${i}.`);let n=e.byteLength/i,a=new(di(t))(e.buffer,e.byteOffset,n);switch(t){case"int64":case"uint64":{let s=new Int32Array(n);for(let u=0;u<n;u++){let l=a[u];if(l>2147483647n||l<-2147483648n)throw Error("Can not convert int64 data to int32 - value out of range.");s[u]=Number(l)}return new Uint8Array(s.buffer)}case"int8":case"uint8":case"uint32":{if(t==="uint32"&&a.some((u)=>u>2147483647))throw Error("Can not convert uint32 data to int32 - value out of range.");let s=Int32Array.from(a,Number);return new Uint8Array(s.buffer)}default:throw Error(`Unsupported data conversion from ${t} to 'int32'`)}},Yi=(e,t)=>{if(t==="int32")return e;if(e.byteLength%4!==0)throw Error("Invalid Uint8Array length - must be a multiple of 4 (int32).");let r=e.byteLength/4,i=new Int32Array(e.buffer,e.byteOffset,r);switch(t){case"int64":{let n=BigInt64Array.from(i,BigInt);return new Uint8Array(n.buffer)}case"uint64":{if(i.some((a)=>a<0))throw Error("Can not convert int32 data to uin64 - negative value found.");let n=BigUint64Array.from(i,BigInt);return new Uint8Array(n.buffer)}case"int8":{if(i.some((a)=>a<-128||a>127))throw Error("Can not convert int32 data to int8 - value out of range.");let n=Int8Array.from(i,Number);return new Uint8Array(n.buffer)}case"uint8":{if(i.some((n)=>n<0||n>255))throw Error("Can not convert int32 data to uint8 - value out of range.");return Uint8Array.from(i,Number)}case"uint32":{if(i.some((a)=>a<0))throw Error("Can not convert int32 data to uint32 - negative value found.");let n=Uint32Array.from(i,Number);return new Uint8Array(n.buffer)}default:throw Error(`Unsupported data conversion from 'int32' to ${t}`)}},uu=1,Xi=()=>uu++,lu=new Map([["int8","int32"],["uint8","int32"],["uint32","int32"],["int64","int32"]]),Qi=(e,t)=>{let r=Zi.get(e);if(!r)throw Error(`WebNN backend does not support data type: ${e}`);return t.length>0?Math.ceil(t.reduce((i,n)=>i*n)*r/8):0},Ji=class{constructor(e){this.isDataConverted=!1;let{sessionId:t,context:r,tensor:i,dataType:n,shape:a,fallbackDataType:s}=e;this.sessionId=t,this.mlContext=r,this.mlTensor=i,this.dataType=n,this.tensorShape=a,this.fallbackDataType=s}get tensor(){return this.mlTensor}get type(){return this.dataType}get fallbackType(){return this.fallbackDataType}get shape(){return this.tensorShape}get byteLength(){return Qi(this.dataType,this.tensorShape)}destroy(){pe("verbose",()=>"[WebNN] TensorWrapper.destroy"),this.mlTensor.destroy()}write(e){this.mlContext.writeTensor(this.mlTensor,e)}async read(e){if(this.fallbackDataType){let t=await this.mlContext.readTensor(this.mlTensor),r=Yi(new Uint8Array(t),this.dataType);if(e){(e instanceof ArrayBuffer?new Uint8Array(e):new Uint8Array(e.buffer,e.byteOffset,e.byteLength)).set(r);return}else return new Uint8Array(r).buffer}else return e?this.mlContext.readTensor(this.mlTensor,e):this.mlContext.readTensor(this.mlTensor)}canReuseTensor(e,t,r){return this.mlContext===e&&this.dataType===t&&this.tensorShape.length===r.length&&this.tensorShape.every((i,n)=>i===r[n])}setIsDataConverted(e){this.isDataConverted=e}},en=class{constructor(e,t){this.tensorManager=e,this.wrapper=t}get tensorWrapper(){return this.wrapper}releaseTensor(){this.tensorWrapper&&(this.tensorManager.releaseTensor(this.tensorWrapper),this.wrapper=void 0)}async ensureTensor(e,t,r,i){let n=this.tensorManager.getMLContext(e),a=this.tensorManager.getMLOpSupportLimits(e),s;if(!a?.input.dataTypes.includes(t)){if(s=lu.get(t),!s||a?.input.dataTypes.includes(s))throw Error(`WebNN backend does not support data type: ${t}`);pe("verbose",()=>`[WebNN] TensorIdTracker.ensureTensor: fallback dataType from ${t} to ${s}`)}if(this.wrapper){if(this.wrapper.canReuseTensor(n,t,r))return this.wrapper.tensor;if(i){if(this.wrapper.byteLength!==Qi(t,r))throw Error("Unable to copy data to tensor with different size.");this.activeUpload=new Uint8Array(await this.wrapper.read())}this.tensorManager.releaseTensor(this.wrapper)}let u=typeof MLTensorUsage>"u"?void 0:MLTensorUsage.READ|MLTensorUsage.WRITE;return this.wrapper=await this.tensorManager.getCachedTensor(e,t,r,u,!0,!0,s),i&&this.activeUpload&&(this.wrapper.write(this.activeUpload),this.activeUpload=void 0),this.wrapper.tensor}upload(e){let t=e;if(this.wrapper){if(this.wrapper.fallbackType)if(this.wrapper.fallbackType==="int32")t=ou(e,this.wrapper.type),this.wrapper.setIsDataConverted(!0);else throw Error(`Unsupported fallback data type: ${this.wrapper.fallbackType}`);if(e.byteLength===this.wrapper.byteLength){this.wrapper.write(t);return}else pe("verbose",()=>"Data size does not match tensor size. Releasing tensor."),this.releaseTensor()}this.activeUpload?this.activeUpload.set(t):this.activeUpload=new Uint8Array(t)}async download(e){if(this.activeUpload){let t=this.wrapper?.isDataConverted?Yi(this.activeUpload,this.wrapper?.type):this.activeUpload;if(e){e instanceof ArrayBuffer?new Uint8Array(e).set(t):new Uint8Array(e.buffer,e.byteOffset,e.byteLength).set(t);return}else return t.buffer}if(!this.wrapper)throw Error("Tensor has not been created.");return e?this.wrapper.read(e):this.wrapper.read()}},du=class{constructor(e){this.backend=e,this.tensorTrackersById=new Map,this.freeTensors=[],this.externalTensors=new Set}getMLContext(e){let t=this.backend.getMLContext(e);if(!t)throw Error("MLContext not found for session.");return t}getMLOpSupportLimits(e){return this.backend.getMLOpSupportLimits(e)}reserveTensorId(){let e=Xi();return this.tensorTrackersById.set(e,new en(this)),e}releaseTensorId(e){let t=this.tensorTrackersById.get(e);t&&(this.tensorTrackersById.delete(e),t.tensorWrapper&&this.releaseTensor(t.tensorWrapper))}async ensureTensor(e,t,r,i,n){pe("verbose",()=>`[WebNN] TensorManager.ensureTensor {tensorId: ${t}, dataType: ${r}, shape: ${i}, copyOld: ${n}}`);let a=this.tensorTrackersById.get(t);if(!a)throw Error("Tensor not found.");return a.ensureTensor(e,r,i,n)}upload(e,t){let r=this.tensorTrackersById.get(e);if(!r)throw Error("Tensor not found.");r.upload(t)}async download(e,t){pe("verbose",()=>`[WebNN] TensorManager.download {tensorId: ${e}, dstBuffer: ${t?.byteLength}}`);let r=this.tensorTrackersById.get(e);if(!r)throw Error("Tensor not found.");return r.download(t)}releaseTensorsForSession(e){for(let t of this.freeTensors)t.sessionId===e&&t.destroy();this.freeTensors=this.freeTensors.filter((t)=>t.sessionId!==e)}registerTensor(e,t,r,i){let n=this.getMLContext(e),a=Xi(),s=new Ji({sessionId:e,context:n,tensor:t,dataType:r,shape:i});return this.tensorTrackersById.set(a,new en(this,s)),this.externalTensors.add(s),a}async getCachedTensor(e,t,r,i,n,a,s){let u=this.getMLContext(e);for(let[p,h]of this.freeTensors.entries())if(h.canReuseTensor(u,t,r)){pe("verbose",()=>`[WebNN] Reusing tensor {dataType: ${t}, ${s?`fallbackDataType: ${s},`:""} shape: ${r}`);let c=this.freeTensors.splice(p,1)[0];return c.sessionId=e,c}pe("verbose",()=>`[WebNN] MLContext.createTensor {dataType: ${t}, ${s?`fallbackDataType: ${s},`:""} shape: ${r}}`);let l=await u.createTensor({dataType:s??t,shape:r,dimensions:r,usage:i,writable:n,readable:a});return new Ji({sessionId:e,context:u,tensor:l,dataType:t,shape:r,fallbackDataType:s})}releaseTensor(e){this.externalTensors.has(e)&&this.externalTensors.delete(e),this.freeTensors.push(e)}},ac=(...e)=>new du(...e)}),fy=U(()=>{ee(),Ut(),nc(),hy(),ot(),ur=new Map([[1,"float32"],[10,"float16"],[6,"int32"],[12,"uint32"],[7,"int64"],[13,"uint64"],[22,"int4"],[21,"uint4"],[3,"int8"],[2,"uint8"],[9,"uint8"]]),pu=(e,t)=>{if(e===t)return!0;if(e===void 0||t===void 0)return!1;let r=Object.keys(e).sort(),i=Object.keys(t).sort();return r.length===i.length&&r.every((n,a)=>n===i[a]&&e[n]===t[n])},sc=class{constructor(e){this.tensorManager=ac(this),this.mlContextBySessionId=new Map,this.sessionIdsByMLContext=new Map,this.mlContextCache=[],this.sessionGraphInputs=new Map,this.sessionGraphOutputs=new Map,this.temporaryGraphInputs=[],this.temporaryGraphOutputs=[],this.temporarySessionTensorIds=new Map,this.mlOpSupportLimitsBySessionId=new Map,pa(e.logLevel,!!e.debug)}get currentSessionId(){if(this.activeSessionId===void 0)throw Error("No active session");return this.activeSessionId}onRunStart(e){pe("verbose",()=>`[WebNN] onRunStart {sessionId: ${e}}`),this.activeSessionId=e}onRunEnd(e){pe("verbose",()=>`[WebNN] onRunEnd {sessionId: ${e}}`);let t=this.temporarySessionTensorIds.get(e);if(t){for(let r of t)pe("verbose",()=>`[WebNN] releasing temporary tensor {tensorId: ${r}}`),this.tensorManager.releaseTensorId(r);this.temporarySessionTensorIds.delete(e),this.activeSessionId=void 0}}async createMLContext(e){if(e instanceof GPUDevice){let r=this.mlContextCache.findIndex((i)=>i.gpuDevice===e);if(r!==-1)return this.mlContextCache[r].mlContext;{let i=await navigator.ml.createContext(e);return this.mlContextCache.push({gpuDevice:e,mlContext:i}),i}}else if(e===void 0){let r=this.mlContextCache.findIndex((i)=>i.options===void 0&&i.gpuDevice===void 0);if(r!==-1)return this.mlContextCache[r].mlContext;{let i=await navigator.ml.createContext();return this.mlContextCache.push({mlContext:i}),i}}let t=this.mlContextCache.findIndex((r)=>pu(r.options,e));if(t!==-1)return this.mlContextCache[t].mlContext;{let r=await navigator.ml.createContext(e);return this.mlContextCache.push({options:e,mlContext:r}),r}}registerMLContext(e,t){this.mlContextBySessionId.set(e,t);let r=this.sessionIdsByMLContext.get(t);r||(r=new Set,this.sessionIdsByMLContext.set(t,r)),r.add(e),this.mlOpSupportLimitsBySessionId.has(e)||this.mlOpSupportLimitsBySessionId.set(e,t.opSupportLimits()),this.temporaryGraphInputs.length>0&&(this.sessionGraphInputs.set(e,this.temporaryGraphInputs),this.temporaryGraphInputs=[]),this.temporaryGraphOutputs.length>0&&(this.sessionGraphOutputs.set(e,this.temporaryGraphOutputs),this.temporaryGraphOutputs=[])}onReleaseSession(e){this.sessionGraphInputs.delete(e),this.sessionGraphOutputs.delete(e);let t=this.mlContextBySessionId.get(e);if(!t)return;this.tensorManager.releaseTensorsForSession(e),this.mlContextBySessionId.delete(e),this.mlOpSupportLimitsBySessionId.delete(e);let r=this.sessionIdsByMLContext.get(t);if(r.delete(e),r.size===0){this.sessionIdsByMLContext.delete(t);let i=this.mlContextCache.findIndex((n)=>n.mlContext===t);i!==-1&&this.mlContextCache.splice(i,1)}}getMLContext(e){return this.mlContextBySessionId.get(e)}getMLOpSupportLimits(e){return this.mlOpSupportLimitsBySessionId.get(e)}reserveTensorId(){return this.tensorManager.reserveTensorId()}releaseTensorId(e){pe("verbose",()=>`[WebNN] releaseTensorId {tensorId: ${e}}`),this.tensorManager.releaseTensorId(e)}async ensureTensor(e,t,r,i,n){let a=ur.get(r);if(!a)throw Error(`Unsupported ONNX data type: ${r}`);return this.tensorManager.ensureTensor(e??this.currentSessionId,t,a,i,n)}async createTemporaryTensor(e,t,r){pe("verbose",()=>`[WebNN] createTemporaryTensor {onnxDataType: ${t}, shape: ${r}}`);let i=ur.get(t);if(!i)throw Error(`Unsupported ONNX data type: ${t}`);let n=this.tensorManager.reserveTensorId();await this.tensorManager.ensureTensor(e,n,i,r,!1);let a=this.temporarySessionTensorIds.get(e);return a?a.push(n):this.temporarySessionTensorIds.set(e,[n]),n}uploadTensor(e,t){if(!be().shouldTransferToMLTensor)throw Error("Trying to upload to a MLTensor while shouldTransferToMLTensor is false");pe("verbose",()=>`[WebNN] uploadTensor {tensorId: ${e}, data: ${t.byteLength}}`),this.tensorManager.upload(e,t)}async downloadTensor(e,t){return this.tensorManager.download(e,t)}createMLTensorDownloader(e,t){return async()=>{let r=await this.tensorManager.download(e);return ca(r,t)}}registerMLTensor(e,t,r,i){let n=ur.get(r);if(!n)throw Error(`Unsupported ONNX data type: ${r}`);let a=this.tensorManager.registerTensor(e,t,n,i);return pe("verbose",()=>`[WebNN] registerMLTensor {tensor: ${t}, dataType: ${n}, dimensions: ${i}} -> {tensorId: ${a}}`),a}registerGraphInput(e){this.temporaryGraphInputs.push(e)}registerGraphOutput(e){this.temporaryGraphOutputs.push(e)}isGraphInput(e,t){let r=this.sessionGraphInputs.get(e);return r?r.includes(t):!1}isGraphOutput(e,t){let r=this.sessionGraphOutputs.get(e);return r?r.includes(t):!1}isGraphInputOutputTypeSupported(e,t,r=!0){let i=ur.get(Rt(t)),n=this.mlOpSupportLimitsBySessionId.get(e);return typeof i>"u"?!1:r?!!n?.input.dataTypes.includes(i):!!n?.output.dataTypes.includes(i)}flush(){}}}),ha=U(()=>{}),my=U(()=>{ot(),ha(),tn=new Map([[64,250],[128,200],[256,200],[512,200],[2048,230],[4096,200],[8192,50],[16384,50],[32768,50],[65536,50],[131072,50],[262144,50],[524288,50],[1048576,50],[2097152,30],[4194304,20],[8388608,10],[12582912,10],[16777216,10],[26214400,15],[33554432,22],[44236800,2],[58982400,6],[67108864,6],[134217728,6],[167772160,6]]),Hr=[],Fr=(e)=>Math.ceil(Number(e)/16)*16,cu=(e)=>{for(let t=0;t<Hr.length;t++){let r=Hr[t];if(e<=r)return r}return Math.ceil(e/16)*16},hu=1,rn=()=>hu++,Vn=async(e,t,r,i)=>{let n=Fr(r),a=e.device.createBuffer({size:n,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});try{let s=e.getCommandEncoder();e.endComputePass(),s.copyBufferToBuffer(t,0,a,0,n),e.flush(),await a.mapAsync(GPUMapMode.READ);let u=a.getMappedRange();if(i){let l=i();return l.set(new Uint8Array(u,0,r)),l}else return new Uint8Array(u.slice(0,r))}finally{a.destroy()}},fu=class{constructor(e){this.backend=e,this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.buffersPending=[],this.capturedPendingBuffers=new Map;for(let[t]of tn)Hr.push(t),this.freeBuffers.set(t,[]),this.freeUniformBuffers.set(t,[]);this.sessionCount=0}upload(e,t){let{buffer:r,byteOffset:i,byteLength:n}=t,a=Fr(n),s=this.storageCache.get(e);if(!s)throw Error("gpu data for uploading does not exist");if(Number(s.originalSize)!==n)throw Error(`inconsistent data size. gpu data size=${s.originalSize}, data size=${n}`);if(a===n&&i%4===0)this.backend.device.queue.writeBuffer(s.gpuData.buffer,0,r,i,n);else{let u=new Uint8Array(a);u.set(t),this.backend.device.queue.writeBuffer(s.gpuData.buffer,0,u,0,a)}pe("verbose",()=>`[WebGPU] GpuDataManager.upload(id=${e})`)}memcpy(e,t){let r=this.storageCache.get(e);if(!r)throw Error("source gpu data for memcpy does not exist");let i=this.storageCache.get(t);if(!i)throw Error("destination gpu data for memcpy does not exist");if(r.originalSize!==i.originalSize)throw Error("inconsistent source and destination gpu data size");let n=Fr(r.originalSize),a=this.backend.getCommandEncoder();this.backend.endComputePass(),a.copyBufferToBuffer(r.gpuData.buffer,0,i.gpuData.buffer,0,n)}registerExternalBuffer(e,t,r){let i;if(r){if(i=r[0],e===r[1])return pe("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${i}, buffer is the same, skip.`),i;if(this.backend.capturedCommandList.has(this.backend.currentSessionId))throw Error(`Registering a different external buffer under graph capture mode is not supported yet.
             Please use the previous external buffer!`)}else i=rn();return this.storageCache.set(i,{gpuData:{id:i,type:0,buffer:e},originalSize:t}),pe("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${i}, registered.`),i}unregisterExternalBuffer(e){e!==void 0&&(this.storageCache.delete(e),pe("verbose",()=>`[WebGPU] GpuDataManager.unregisterExternalBuffer() => id=${e}`))}create(e,t=GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST){let r=cu(e),i,n=(t&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE,a=(t&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM;if(n||a){let u=(n?this.freeBuffers:this.freeUniformBuffers).get(r);u?u.length>0?i=u.pop():i=this.backend.device.createBuffer({size:r,usage:t}):i=this.backend.device.createBuffer({size:r,usage:t})}else i=this.backend.device.createBuffer({size:r,usage:t});let s={id:rn(),type:0,buffer:i};return this.storageCache.set(s.id,{gpuData:s,originalSize:Number(e)}),pe("verbose",()=>`[WebGPU] GpuDataManager.create(size=${e}) => id=${s.id}`),s}get(e){return this.storageCache.get(e)?.gpuData}release(e){let t=typeof e=="bigint"?Number(e):e,r=this.storageCache.get(t);if(!r){if(this.storageCache.size===0)return 0;throw Error("releasing data does not exist")}return pe("verbose",()=>`[WebGPU] GpuDataManager.release(id=${t}), gpuDataId=${r.gpuData.id}`),this.storageCache.delete(t),this.buffersPending.push(r.gpuData.buffer),r.originalSize}async download(e,t){let r=this.storageCache.get(Number(e));if(!r)throw Error("data does not exist");await Vn(this.backend,r.gpuData.buffer,r.originalSize,t)}refreshPendingBuffers(){if(this.buffersPending.length!==0)if(this.backend.sessionStatus==="default"){for(let e of this.buffersPending){let t=tn.get(e.size);if((e.usage&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE){let r=this.freeBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else if((e.usage&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM){let r=this.freeUniformBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else e.destroy()}this.buffersPending=[]}else{let e=this.capturedPendingBuffers.get(this.backend.currentSessionId);e||(e=[],this.capturedPendingBuffers.set(this.backend.currentSessionId,e));for(let t of this.buffersPending)e.push(t);this.buffersPending=[]}}dispose(){this.freeBuffers.forEach((e)=>{e.forEach((t)=>{t.destroy()})}),this.freeUniformBuffers.forEach((e)=>{e.forEach((t)=>{t.destroy()})}),this.storageCache.forEach((e)=>{e.gpuData.buffer.destroy()}),this.capturedPendingBuffers.forEach((e)=>{e.forEach((t)=>{t.destroy()})}),this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.capturedPendingBuffers=new Map}onCreateSession(){this.sessionCount+=1}onReleaseSession(e){let t=this.capturedPendingBuffers.get(e);t&&(t.forEach((r)=>{r.destroy()}),this.capturedPendingBuffers.delete(e)),this.sessionCount-=1,this.sessionCount===0&&(pe("warning",()=>"[WebGPU] Clearing webgpu buffer cache"),this.storageCache.forEach((r)=>{r.gpuData.buffer.destroy()}),this.storageCache=new Map)}},oc=(...e)=>new fu(...e)}),Te=U(()=>{mu=class{constructor(e){Object.assign(this,e)}get cacheKey(){return this.key||(this.key=Object.getOwnPropertyNames(this).sort().map((e)=>`${this[e]}`).join(";")),this.key}},fe=(e)=>new mu(e)}),ne=U(()=>{ee(),ie(),Zt=64,jr=(e,t)=>{if(t===3)throw Error("vec3 has same alignment as vec4, use vec4 instead");switch(Number(e)){case 10:return t>1?`vec${t}<f16>`:"f16";case 1:return t>1?`vec${t}<f32>`:"f32";case 6:return t>1?`vec${t}<i32>`:"i32";case 12:return t>1?`vec${t}<u32>`:"u32";case 7:if(t>1)throw Error("currently not supported vecX of uint64 yet");return["vec2<u32>","i32"];case 13:if(t>1)throw Error("currently not supported vecX of uint64 yet");return["vec2<u32>","u32"];case 9:if(t!==4)throw Error("bool must be vec4");return["u32","vec4<bool>"];case 22:return"i32";case 21:return"u32";default:throw Error(`Unknown data type: ${e}`)}},Ae=(e,t=1)=>{let r=jr(e,t);return typeof r=="string"?r:r[0]},Ce=(e,t=1)=>{let r=jr(e,t);return typeof r=="string"?r:r[1]},X=(...e)=>{let t=[];return e.forEach((r)=>{r.length!==0&&t.push({type:12,data:r},{type:12,data:M.computeStrides(r)})}),t},ke=(e)=>e%4===0?4:e%2===0?2:1,Wn=(e="f32",t,r="0")=>!t||t===1?`${e}(${r})`:`vec${t}<${e}>(${r})`,jt=(e,t,r)=>e==="f32"?r:t===1?`f32(${r})`:`vec${t}<f32>(${r})`,vt=(e,t)=>t===4?`(${e}.x + ${e}.y + ${e}.z + ${e}.w)`:t===2?`(${e}.x + ${e}.y)`:t===3?`(${e}.x + ${e}.y + ${e}.z)`:e,Z=(e,t,r,i)=>e.startsWith("uniforms.")&&r>4?typeof t=="string"?i==="f16"?`${e}[(${t}) / 8][(${t}) % 8 / 4][(${t}) % 8 % 4]`:`${e}[(${t}) / 4][(${t}) % 4]`:i==="f16"?`${e}[${Math.floor(t/8)}][${Math.floor(t%8/4)}][${t%8%4}]`:`${e}[${Math.floor(t/4)}][${t%4}]`:r>1?`${e}[${t}]`:e,lr=(e,t,r,i,n)=>{let a=typeof r=="number",s=a?r:r.length,u=[...Array(s).keys()],l=s<2?"u32":s<=4?`vec${s}<u32>`:`array<u32, ${s}>`,p=jr(t,n),h=typeof p=="string"?p:p[1],c=typeof p=="string"?p:p[0],g={indices:l,value:h,storage:c,tensor:t},b=(P)=>typeof P=="string"?P:`${P}u`,y={offsetToIndices:!1,indicesToOffset:!1,broadcastedIndicesToOffset:!1,set:!1,setByIndices:!1,get:!1,getByIndices:!1},w=a?"uniforms.":"",k=`${w}${e}_shape`,S=`${w}${e}_strides`,_="";for(let P=0;P<s-1;P++)_+=`
    let dim${P} = current / ${Z(S,P,s)};
    let rest${P} = current % ${Z(S,P,s)};
    indices[${P}] = dim${P};
    current = rest${P};
    `;_+=`indices[${s-1}] = current;`;let I=s<2?"":`
  fn o2i_${e}(offset: u32) -> ${g.indices} {
    var indices: ${g.indices};
    var current = offset;
    ${_}
    return indices;
  }`,T=(P)=>(y.offsetToIndices=!0,s<2?P:`o2i_${e}(${P})`),C=[];if(s>=2)for(let P=s-1;P>=0;P--)C.push(`${Z(S,P,s)} * (indices[${P}])`);let A=s<2?"":`
  fn i2o_${e}(indices: ${g.indices}) -> u32 {
    return ${C.join("+")};
  }`,O=(P)=>(y.indicesToOffset=!0,s<2?P:`i2o_${e}(${P})`),v=(...P)=>s===0?"0u":`${g.indices}(${P.map(b).join(",")})`,N=(P,J)=>s<2?`${P}`:`${Z(P,J,s)}`,q=(P,J,Y)=>s<2?`${P}=${Y};`:`${Z(P,J,s)}=${Y};`,F={},W=(P,J)=>{y.broadcastedIndicesToOffset=!0;let Y=`${J.name}broadcastedIndicesTo${e}Offset`;if(Y in F)return`${Y}(${P})`;let K=[];for(let ve=s-1;ve>=0;ve--){let Re=J.indicesGet("outputIndices",ve+J.rank-s);K.push(`${N(S,ve)} * (${Re} % ${N(k,ve)})`)}return F[Y]=`fn ${Y}(outputIndices: ${J.type.indices}) -> u32 {
             return ${K.length>0?K.join("+"):"0u"};
           }`,`${Y}(${P})`},G=(P,J)=>(()=>{if(g.storage===g.value)return`${e}[${P}]=${J};`;if(g.storage==="vec2<u32>"&&g.value==="i32")return`${e}[${P}]=vec2<u32>(u32(${J}), select(0u, 0xFFFFFFFFu, ${J} < 0));`;if(g.storage==="vec2<u32>"&&g.value==="u32")return`${e}[${P}]=vec2<u32>(u32(${J}), 0u);`;if(g.storage==="u32"&&g.value==="vec4<bool>")return`${e}[${P}]=dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(${J}));`;throw Error(`not supported combination of storage type ${g.storage} and value type ${g.value} yet`)})(),ae=(P)=>(()=>{if(g.storage===g.value)return`${e}[${P}]`;if(g.storage==="vec2<u32>"&&g.value==="i32")return`i32(${e}[${P}].x)`;if(g.storage==="vec2<u32>"&&g.value==="u32")return`u32(${e}[${P}].x)`;if(g.storage==="u32"&&g.value==="vec4<bool>")return`vec4<bool>(bool(${e}[${P}] & 0xFFu), bool(${e}[${P}] & 0xFF00u), bool(${e}[${P}] & 0xFF0000u), bool(${e}[${P}] & 0xFF000000u))`;throw Error(`not supported combination of storage type ${g.storage} and value type ${g.value} yet`)})(),z=s<2?"":`
  fn get_${e}ByIndices(indices: ${g.indices}) -> ${h} {
    return ${ae(`i2o_${e}(indices)`)};
  }`,L=s<2?"":(()=>{let P=u.map((Y)=>`d${Y}: u32`).join(", "),J=u.map((Y)=>`d${Y}`).join(", ");return`
  fn get_${e}(${P}) -> ${h} {
    return get_${e}ByIndices(${v(J)});
  }`})(),te=(...P)=>{if(P.length!==s)throw Error(`indices length must be ${s}`);let J=P.map(b).join(",");return s===0?ae("0u"):s===1?ae(J[0]):(y.get=!0,y.getByIndices=!0,y.indicesToOffset=!0,`get_${e}(${J})`)},re=(P)=>s<2?ae(P):(y.getByIndices=!0,y.indicesToOffset=!0,`get_${e}ByIndices(${P})`),Q=s<2?"":`
  fn set_${e}ByIndices(indices: ${g.indices}, value: ${h}) {
    ${G(`i2o_${e}(indices)`,"value")}
  }`,se=s<2?"":(()=>{let P=u.map((Y)=>`d${Y}: u32`).join(", "),J=u.map((Y)=>`d${Y}`).join(", ");return`
  fn set_${e}(${P}, value: ${h}) {
    set_${e}ByIndices(${v(J)}, value);
  }`})();return{impl:()=>{let P=[],J=!1;return y.offsetToIndices&&(P.push(I),J=!0),y.indicesToOffset&&(P.push(A),J=!0),y.broadcastedIndicesToOffset&&(Object.values(F).forEach((Y)=>P.push(Y)),J=!0),y.set&&(P.push(se),J=!0),y.setByIndices&&(P.push(Q),J=!0),y.get&&(P.push(L),J=!0),y.getByIndices&&(P.push(z),J=!0),!a&&J&&P.unshift(`const ${k} = ${g.indices}(${r.join(",")});`,`const ${S} = ${g.indices}(${M.computeStrides(r).join(",")});`),P.join(`
`)},type:g,offsetToIndices:T,indicesToOffset:O,broadcastedIndicesToOffset:W,indices:v,indicesGet:N,indicesSet:q,set:(...P)=>{if(P.length!==s+1)throw Error(`indices length must be ${s}`);let J=P[s];if(typeof J!="string")throw Error("value must be string");let Y=P.slice(0,s).map(b).join(",");return s===0?G("0u",J):s===1?G(Y[0],J):(y.set=!0,y.setByIndices=!0,y.indicesToOffset=!0,`set_${e}(${Y}, ${J})`)},setByOffset:G,setByIndices:(P,J)=>s<2?G(P,J):(y.setByIndices=!0,y.indicesToOffset=!0,`set_${e}ByIndices(${P}, ${J});`),get:te,getByOffset:ae,getByIndices:re,usage:i,name:e,strides:S,shape:k,rank:s}},B=(e,t,r,i=1)=>lr(e,t,r,"input",i),j=(e,t,r,i=1)=>lr(e,t,r,"output",i),uc=(e,t,r)=>lr(e,t,r,"atomicOutput",1),fa=(e,t,r,i=1)=>lr(e,t,r,"internal",i),gu=class{constructor(e,t){this.normalizedDispatchGroup=e,this.limits=t,this.internalVariables=[],this.variables=[],this.uniforms=[],this.variableIndex=0}guardAgainstOutOfBoundsWorkgroupSizes(e){return`if (global_idx >= ${typeof e=="number"?`${e}u`:e}) { return; }`}mainStart(e=Zt){let t=typeof e=="number"?e:e[0],r=typeof e=="number"?1:e[1],i=typeof e=="number"?1:e[2];if(t>this.limits.maxComputeWorkgroupSizeX||r>this.limits.maxComputeWorkgroupSizeY||i>this.limits.maxComputeWorkgroupSizeZ)throw Error(`workgroup size [${t}, ${r}, ${i}] exceeds the maximum workgroup size [${this.limits.maxComputeWorkgroupSizeX}, ${this.limits.maxComputeWorkgroupSizeY}, ${this.limits.maxComputeWorkgroupSizeZ}].`);if(t*r*i>this.limits.maxComputeInvocationsPerWorkgroup)throw Error(`workgroup size [${t}, ${r}, ${i}] exceeds the maximum workgroup invocations ${this.limits.maxComputeInvocationsPerWorkgroup}.`);let n=this.normalizedDispatchGroup[1]===1&&this.normalizedDispatchGroup[2]===1,a=n?`@builtin(global_invocation_id) global_id : vec3<u32>,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(local_invocation_id) local_id : vec3<u32>`:`@builtin(global_invocation_id) global_id : vec3<u32>,
                                             @builtin(local_invocation_id) local_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(num_workgroups) num_workgroups : vec3<u32>`,s=n?`let global_idx = global_id.x;
         let workgroup_index = workgroup_id.x;`:`let workgroup_index = workgroup_id.z * num_workgroups[0] * num_workgroups[1] +
             workgroup_id.y * num_workgroups[0] + workgroup_id.x;
         let global_idx = workgroup_index * ${t*r*i}u + local_idx;`;return`@compute @workgroup_size(${t}, ${r}, ${i})
  fn main(${a}) {
    ${s}
  `}appendVariableUniforms(e){e.rank!==0&&(e.shape.startsWith("uniforms.")&&this.uniforms.push({name:e.shape.replace("uniforms.",""),type:"u32",length:e.rank}),e.strides.startsWith("uniforms.")&&this.uniforms.push({name:e.strides.replace("uniforms.",""),type:"u32",length:e.rank}))}declareVariable(e,t){if(e.usage==="internal")throw Error("cannot use internal variable with declareVariable(). use registerInternalVariables() instead.");this.variables.push(e),this.appendVariableUniforms(e);let r=e.usage==="input"?"read":"read_write",i=e.usage==="atomicOutput"?"atomic<i32>":e.type.storage;return`@group(0) @binding(${t}) var<storage, ${r}> ${e.name}: array<${i}>;`}declareVariables(...e){return e.map((t)=>this.declareVariable(t,this.variableIndex++)).join(`
`)}registerInternalVariable(e){if(e.usage!=="internal")throw Error("cannot use input or output variable with registerInternalVariable(). use declareVariables() instead.");this.internalVariables.push(e),this.appendVariableUniforms(e)}registerInternalVariables(...e){return e.forEach((t)=>this.registerInternalVariable(t)),this}registerUniform(e,t,r=1){return this.uniforms.push({name:e,type:t,length:r}),this}registerUniforms(e){return this.uniforms=this.uniforms.concat(e),this}uniformDeclaration(){if(this.uniforms.length===0)return"";let e=[];for(let{name:t,type:r,length:i}of this.uniforms)if(i&&i>4)r==="f16"?e.push(`@align(16) ${t}:array<mat2x4<${r}>, ${Math.ceil(i/8)}>`):e.push(`${t}:array<vec4<${r}>, ${Math.ceil(i/4)}>`);else{let n=i==null||i===1?r:`vec${i}<${r}>`;e.push(`${t}:${n}`)}return`
      struct Uniforms { ${e.join(", ")} };
      @group(0) @binding(${this.variableIndex}) var<uniform> uniforms: Uniforms;`}get additionalImplementations(){return this.uniformDeclaration()+this.variables.map((e)=>e.impl()).join(`
`)+this.internalVariables.map((e)=>e.impl()).join(`
`)}get variablesInfo(){if(this.uniforms.length===0)return;let e=(t)=>[12,10,1,6][["u32","f16","f32","i32"].indexOf(t)];return this.uniforms.map((t)=>[e(t.type),t.length??1])}},lc=(e,t)=>new gu(e,t)}),$t=U(()=>{ee(),ie(),Te(),ne(),yu=(e,t)=>{if(!e||e.length!==1)throw Error("Transpose requires 1 input.");if(t.length!==0&&t.length!==e[0].dims.length)throw Error(`perm size ${t.length} does not match input rank ${e[0].dims.length}`)},nn=(e,t)=>t.length!==0?t:[...Array(e).keys()].reverse(),bu=(e,t)=>M.sortBasedOnPerm(e,nn(e.length,t)),_u=(e,t,r,i)=>{let n=`fn perm(i: ${i.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`;for(let a=0;a<t;++a)n+=`a[${e[a]}]=i[${a}];`;return n+="return a;}"},wu=(e,t)=>{let r=[],i=[];for(let n=0;n<e.length;++n)e[n]!==1&&r.push(e[n]),e[t[n]]!==1&&i.push(t[n]);return{newShape:r,newPerm:i}},vu=(e,t)=>{let r=0;for(let i=0;i<e.length;++i)if(t[e[i]]!==1){if(e[i]<r)return!1;r=e[i]}return!0},Pe=(e,t)=>{let r=e.dataType,i=e.dims.length,n=nn(i,t),a=bu(e.dims,n),s=e.dims,u=a,l=i<2||vu(n,e.dims),p;if(l)return p=(y)=>{let w=B("input",r,s,4),k=j("output",r,u,4);return`
  ${y.registerUniform("output_size","u32").declareVariables(w,k)}
  ${y.mainStart()}
    ${y.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    output[global_idx] = input[global_idx];
  }`},{name:"TransposeCopy",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let y=M.size(a);return{outputs:[{dims:a,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(y/64/4)},programUniforms:[{type:12,data:Math.ceil(y/4)}]}},getShaderSource:p};let{newShape:h,newPerm:c}=wu(e.dims,n),g=M.areEqual(c,[2,3,1]),b=M.areEqual(c,[3,1,2]);if(h.length===2||g||b){s=g?[h[0],h[1]*h[2]]:b?[h[0]*h[1],h[2]]:h,u=[s[1],s[0]];let y=16;return p=(w)=>{let k=B("a",r,s.length),S=j("output",r,u.length);return`
  ${w.registerUniform("output_size","u32").declareVariables(k,S)}
  var<workgroup> tile : array<array<${S.type.value}, ${y+1}>, ${y}>;
  ${w.mainStart([y,y,1])}
    let stride = (uniforms.output_shape[1] - 1) / ${y} + 1;
    let workgroup_id_x = workgroup_index % stride;
    let workgroup_id_y = workgroup_index / stride;
    let input_col = workgroup_id_y * ${y}u + local_id.x;
    let input_row = workgroup_id_x * ${y}u + local_id.y;
    if (input_row < uniforms.a_shape[0] && input_col < uniforms.a_shape[1]) {
      tile[local_id.y][local_id.x] = ${k.getByIndices(`${k.type.indices}(input_row, input_col)`)};
    }
    workgroupBarrier();

    let output_col = workgroup_id_x * ${y}u + local_id.x;
    let output_row = workgroup_id_y * ${y}u + local_id.y;
    if (output_row < uniforms.output_shape[0] && output_col < uniforms.output_shape[1]) {
      ${S.setByIndices(`${S.type.indices}(output_row, output_col)`,"tile[local_id.x][local_id.y]")}
    }
  }`},{name:"TransposeShared",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let w=M.size(a);return{outputs:[{dims:a,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(u[1]/y),y:Math.ceil(u[0]/y)},programUniforms:[{type:12,data:w},...X(s,u)]}},getShaderSource:p}}return p=(y)=>{let w=B("a",r,s.length),k=j("output",r,u.length);return`
  ${y.registerUniform("output_size","u32").declareVariables(w,k)}

  ${_u(n,i,w,k)}

  ${y.mainStart()}
    ${y.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${k.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${k.setByOffset("global_idx",w.getByIndices("aIndices"))}
  }`},{name:"Transpose",shaderCache:{hint:`${t}`,inputDependencies:["rank"]},getRunData:()=>{let y=M.size(a);return{outputs:[{dims:a,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(y/64)},programUniforms:[{type:12,data:y},...X(s,u)]}},getShaderSource:p}},dc=(e,t)=>{yu(e.inputs,t.perm),e.compute(Pe(e.inputs[0],t.perm))},pc=(e)=>fe({perm:e.perm})}),gy=U(()=>{ee(),ie(),ne(),ma(),$t(),$u={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate * candidate",logSumExp:"bestValue + exp(candidate)",l1:"bestValue + abs(candidate)",l2:"bestValue + candidate * candidate",logSum:"bestValue + candidate"},xu={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate",logSumExp:"bestValue + candidate",l1:"bestValue + candidate",l2:"bestValue + candidate",logSum:"bestValue + candidate"},Su={max:"_A[offset]",min:"_A[offset]",mean:"0",sum:"0",prod:"1",sumSquare:"0",logSumExp:"0",l1:"0",l2:"0",logSum:"0"},ku={max:"bestValue",min:"bestValue",sum:"bestValue",prod:"bestValue",sumSquare:"bestValue",logSumExp:"log(bestValue)",l1:"bestValue",l2:"sqrt(bestValue)",logSum:"log(bestValue)"},Tu=(e,t)=>{let r=[];for(let i=t-e;i<t;++i)r.push(i);return r},Eu=(e,t)=>{let r=[],i=e.length;for(let a=0;a<i;a++)t.indexOf(a)===-1&&r.push(e[a]);let n=t.map((a)=>e[a]);return[r,n]},Iu=(e,t)=>{let r=e.length+t.length,i=[],n=0;for(let a=0;a<r;a++)t.indexOf(a)===-1?i.push(e[n++]):i.push(1);return i},Cu=(e,t)=>{for(let r=0;r<e.length;++r)if(e[e.length-r-1]!==t-1-r)return!1;return!0},Au=(e,t)=>{let r=[];if(!Cu(e,t)){for(let i=0;i<t;++i)e.indexOf(i)===-1&&r.push(i);e.forEach((i)=>r.push(i))}return r},zu=(e,t,r,i,n,a,s)=>{let u=r[0].dims,l=M.size(a),p=M.size(s),h=B("_A",r[0].dataType,u),c=j("output",n,a),g=64;l===1&&(g=256);let b=`
          var<workgroup> aBestValues : array<f32, ${g}>;
       `,y=(w)=>`
        ${w.registerUniform("reduceSize","u32").declareVariables(h,c)}
        ${b}
        fn DIV_CEIL(a : u32, b : u32) -> u32 {
          return ((a - 1u) / b + 1u);
         }
         ${w.mainStart(g)}

          let outputIndex = global_idx / ${g};
          let offset = outputIndex * uniforms.reduceSize;

          var bestValue = f32(${Su[i]});
          let Length = uniforms.reduceSize;
          for (var k = local_idx; k < Length; k = k + ${g}) {
           let candidate = f32(${h.getByOffset("offset + k")});
           bestValue = ${$u[i]};
          }
          aBestValues[local_idx] = bestValue;
          workgroupBarrier();

         var reduceSize = min(Length, ${g}u);
         for (var currentSize = reduceSize / 2u; reduceSize > 1u;
             currentSize = reduceSize / 2u) {
           let interval = DIV_CEIL(reduceSize, 2u);
           if (local_idx < currentSize) {
            let candidate = aBestValues[local_idx + interval];
            bestValue = ${xu[i]};
            aBestValues[local_idx] = bestValue;
           }
           reduceSize = interval;
           workgroupBarrier();
         }

         if (local_idx == 0u) {
          ${c.setByOffset("outputIndex",`${i==="mean"?`${c.type.storage}(bestValue / f32(uniforms.reduceSize))`:`${c.type.storage}(${ku[i]})`}`)};
         }
        }`;return{name:e,shaderCache:{hint:`${t};${g}`,inputDependencies:["type"]},getShaderSource:y,getRunData:()=>({outputs:[{dims:a,dataType:n}],dispatchGroup:{x:l},programUniforms:[{type:12,data:p}]})}},Ge=(e,t,r,i)=>{let n=e.inputs.length===1?r:Gn(e.inputs,r),a=n.axes;a.length===0&&!n.noopWithEmptyAxes&&(a=e.inputs[0].dims.map((b,y)=>y));let s=M.normalizeAxes(a,e.inputs[0].dims.length),u=s,l=e.inputs[0],p=Au(u,e.inputs[0].dims.length);p.length>0&&(l=e.compute(Pe(e.inputs[0],p),{inputs:[0],outputs:[-1]})[0],u=Tu(u.length,l.dims.length));let[h,c]=Eu(l.dims,u),g=h;n.keepDims&&(g=Iu(h,s)),e.compute(zu(t,n.cacheKey,[l],i,e.inputs[0].dataType,g,c),{inputs:[l]})},cc=(e,t)=>{Ge(e,"ReduceMeanShared",t,"mean")},hc=(e,t)=>{Ge(e,"ReduceL1Shared",t,"l1")},fc=(e,t)=>{Ge(e,"ReduceL2Shared",t,"l2")},mc=(e,t)=>{Ge(e,"ReduceLogSumExpShared",t,"logSumExp")},gc=(e,t)=>{Ge(e,"ReduceMaxShared",t,"max")},yc=(e,t)=>{Ge(e,"ReduceMinShared",t,"min")},bc=(e,t)=>{Ge(e,"ReduceProdShared",t,"prod")},_c=(e,t)=>{Ge(e,"ReduceSumShared",t,"sum")},wc=(e,t)=>{Ge(e,"ReduceSumSquareShared",t,"sumSquare")},vc=(e,t)=>{Ge(e,"ReduceLogSumShared",t,"logSum")}}),ma=U(()=>{ee(),ie(),Te(),ne(),gy(),He=(e)=>{if(!e||e.length===0||e.length>2)throw Error("Reduce op requires 1 or 2 inputs.");if(e.length===2&&e[1].dims.length!==1)throw Error("Invalid axes input dims.")},Ou=(e)=>["","",`var value = ${e.getByIndices("input_indices")};`,""],si=(e,t,r,i,n,a,s=!1,u=!1)=>{let l=[],p=r[0].dims,h=p.length,c=M.normalizeAxes(n,h),g=!u&&c.length===0;p.forEach((w,k)=>{g||c.indexOf(k)>=0?s&&l.push(1):l.push(w)});let b=l.length,y=M.size(l);return{name:e,shaderCache:t,getShaderSource:(w)=>{let k=[],S=B("_A",r[0].dataType,h),_=j("output",a,b),I=i(S,_,c),T=I[2];for(let C=0,A=0;C<h;C++)g||c.indexOf(C)>=0?(s&&A++,T=`for(var j${C}: u32 = 0; j${C} < ${p[C]}; j${C}++) {
                  ${I[2].includes("last_index")?`let last_index = j${C};`:""}
                  ${S.indicesSet("input_indices",C,`j${C}`)}
                  ${T}
                }`):(k.push(`${S.indicesSet("input_indices",C,_.indicesGet("output_indices",A))};`),A++);return`

        ${w.registerUniform("output_size","u32").declareVariables(S,_)}

        ${w.mainStart()}
          ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          var input_indices: ${S.type.indices};
          let output_indices = ${_.offsetToIndices("global_idx")};

          ${k.join(`
`)}
          ${I[0]}       // init ops for reduce max/min
          ${I[1]}
          ${T}
          ${I[3]}
          ${I.length===4?_.setByOffset("global_idx","value"):I.slice(4).join(`
`)}
        }`},getRunData:()=>({outputs:[{dims:l,dataType:a}],dispatchGroup:{x:Math.ceil(y/64)},programUniforms:[{type:12,data:y},...X(p,l)]})}},Gn=(e,t)=>{let r=[];return e[1].dims[0]>0&&e[1].getBigInt64Array().forEach((i)=>r.push(Number(i))),fe({axes:r,keepDims:t.keepDims,noopWithEmptyAxes:t.noopWithEmptyAxes})},Fe=(e,t,r,i)=>{let n=e.inputs,a=n.length===1?r:Gn(n,r);e.compute(si(t,{hint:a.cacheKey,inputDependencies:["rank"]},[n[0]],a.noopWithEmptyAxes&&a.axes.length===0?Ou:i,a.axes,n[0].dataType,a.keepDims,a.noopWithEmptyAxes),{inputs:[0]})},Ru=(e,t)=>{He(e.inputs),Fe(e,"ReduceLogSum",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,"value = log(value);"])},Mu=(e,t)=>{He(e.inputs),Fe(e,"ReduceL1",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += abs(${r.getByIndices("input_indices")});`,""])},Bu=(e,t)=>{He(e.inputs),Fe(e,"ReduceL2",t,(r,i)=>[`var t = ${i.type.value}(0); var value = ${i.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += (t * t);`,"value = sqrt(value);"])},Du=(e,t)=>{He(e.inputs),Fe(e,"ReduceLogSumExp",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += exp(${r.getByIndices("input_indices")});`,"value = log(value);"])},Nu=(e,t)=>{He(e.inputs),Fe(e,"ReduceMax",t,(r,i,n)=>{let a=[];for(let s=0;s<r.rank;s++)(n.indexOf(s)>=0||n.length===0)&&a.push(r.indicesSet("input_indices",s,0));return[`${a.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = max(value, ${r.getByIndices("input_indices")});`,""]})},Pu=(e,t)=>{He(e.inputs),Fe(e,"ReduceMean",t,(r,i,n)=>{let a=1;for(let s=0;s<r.rank;s++)(n.indexOf(s)>=0||n.length===0)&&(a*=e.inputs[0].dims[s]);return["var sum = f32(0);","",`sum += f32(${r.getByIndices("input_indices")});`,`let value = ${i.type.value}(sum / ${a});`]})},Uu=(e,t)=>{He(e.inputs),Fe(e,"ReduceMin",t,(r,i,n)=>{let a=[];for(let s=0;s<r.rank;s++)(n.indexOf(s)>=0||n.length===0)&&a.push(`input_indices[${s}] = 0;`);return[`${a.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = min(value, ${r.getByIndices("input_indices")});`,""]})},Lu=(e,t)=>{He(e.inputs),Fe(e,"ReduceProd",t,(r,i)=>[`var value = ${i.type.storage}(1);`,"",`value *= ${r.getByIndices("input_indices")};`,""])},qu=(e,t)=>{He(e.inputs),Fe(e,"ReduceSum",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,""])},Vu=(e,t)=>{He(e.inputs),Fe(e,"ReduceSumSquare",t,(r,i)=>[`var t = ${i.type.value}(0); var value = ${i.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += t * t;`,""])},je=(e,t,r)=>{if(t.length===0)return r;let i=1,n=1;for(let a=0;a<t.length;a++)t.indexOf(a)===-1?i*=e[a]:n*=e[a];return n<32&&i>1024},$c=(e,t)=>{je(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Pu(e,t):cc(e,t)},xc=(e,t)=>{je(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Mu(e,t):hc(e,t)},Sc=(e,t)=>{je(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Bu(e,t):fc(e,t)},kc=(e,t)=>{je(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Du(e,t):mc(e,t)},Tc=(e,t)=>{je(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Nu(e,t):gc(e,t)},Ec=(e,t)=>{je(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Uu(e,t):yc(e,t)},Ic=(e,t)=>{je(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Lu(e,t):bc(e,t)},Cc=(e,t)=>{je(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?qu(e,t):_c(e,t)},Ac=(e,t)=>{je(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Vu(e,t):wc(e,t)},zc=(e,t)=>{je(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Ru(e,t):vc(e,t)}}),yy=U(()=>{ee(),Te(),ma(),an=(e)=>{if(!e||e.length===0||e.length>2)throw Error("ArgMinMaxOp op requires 1 or 2 inputs.");if(e[0].dataType!==1)throw Error("Invalid input type.")},Oc=(e,t)=>{an(e.inputs);let r=(i,n,a)=>{let s=[];for(let u=0;u<i.rank;u++)(a.indexOf(u)>=0||a.length===0)&&s.push(`input_indices[${u}] = 0;`);return[`${s.join(`
`)}`,`var value = ${i.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${i.getByIndices("input_indices")} ${t.selectLastIndex>0?"<=":"<"} value) {
         value = ${i.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",n.setByOffset("global_idx","best_index")]};e.compute(si("ArgMin",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},Rc=(e,t)=>{an(e.inputs);let r=(i,n,a)=>{let s=[];for(let u=0;u<i.rank;u++)(a.indexOf(u)>=0||a.length===0)&&s.push(`input_indices[${u}] = 0;`);return[`${s.join(`
`)}`,`var value = ${i.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${i.getByIndices("input_indices")} ${t.selectLastIndex>0?">=":">"} value) {
         value = ${i.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",n.setByOffset("global_idx","best_index")]};e.compute(si("argMax",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},Hn=(e)=>fe(e)}),ga=U(()=>{ee(),ie(),ha(),ne(),Wu=(e,t)=>{let r=e[0],i=e[1],n=e[2],a=e[3],s=e[4],u=e[5];if(s&&u)throw Error("Attention cannot have both past and attention_bias");if(r.dims.length!==3)throw Error('Input "input" must have 3 dimensions');let l=r.dims[0],p=r.dims[1],h=r.dims[2];if(n.dims.length!==1)throw Error('Input "bias" is expected to have 1 dimensions');if(i.dims.length!==2)throw Error('Input "weights" is expected to have 2 dimensions');if(i.dims[0]!==h)throw Error("Input 1 dimension 0 should have same length as dimension 2 of input 0");if(n.dims[0]!==i.dims[1])throw Error('Input "bias" dimension 0 should have same length as dimension 1 of input "weights"');let c=n.dims[0]/3,g=c,b=g;if(t.qkvHiddenSizes.length>0){if(t.qkvHiddenSizes.length!==3)throw Error("qkv_hidden_sizes attribute should have 3 elements");for(let I of t.qkvHiddenSizes)if(I%t.numHeads!==0)throw Error("qkv_hidden_sizes should be divisible by num_heads");c=t.qkvHiddenSizes[0],g=t.qkvHiddenSizes[1],b=t.qkvHiddenSizes[2]}let y=p;if(c!==g)throw Error("qkv_hidden_sizes first element should be same as the second");if(n.dims[0]!==c+g+b)throw Error('Input "bias" dimension 0 should have same length as sum of Q/K/V hidden sizes');let w=0;if(s){if(g!==b)throw Error('Input "past" expect k_hidden_size == v_hidden_size');if(s.dims.length!==5)throw Error('Input "past" must have 5 dimensions');if(s.dims[0]!==2)throw Error('Input "past" first dimension must be 2');if(s.dims[1]!==l)throw Error('Input "past" second dimension must be batch_size');if(s.dims[2]!==t.numHeads)throw Error('Input "past" third dimension must be num_heads');if(s.dims[4]!==g/t.numHeads)throw Error('Input "past" fifth dimension must be k_hidden_size / num_heads');t.pastPresentShareBuffer||(w=s.dims[3])}let k=y+w,S=-1,_=0;if(a)throw Error("Mask not supported");if(s)throw Error("past is not supported");if(u){if(u.dims.length!==4)throw Error('Input "attention_bias" must have 4 dimensions');if(u.dims[0]!==l||u.dims[1]!==t.numHeads||u.dims[2]!==p||u.dims[3]!==k)throw Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:l,sequenceLength:p,pastSequenceLength:w,kvSequenceLength:y,totalSequenceLength:k,maxSequenceLength:S,inputHiddenSize:h,hiddenSize:c,vHiddenSize:b,headSize:Math.floor(c/t.numHeads),vHeadSize:Math.floor(b/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:_,scale:t.scale,broadcastResPosBias:!1,passPastInKv:!1,qkvFormat:1}},Kr=(e,t,r)=>t&&e?`
      let total_sequence_length_input = u32(${t.getByOffset("0")});
      let present_sequence_length = max(total_sequence_length_input, uniforms.past_sequence_length);
      let is_subsequent_prompt: bool = sequence_length > 1 && sequence_length != total_sequence_length_input;
      let is_first_prompt: bool = is_subsequent_prompt == false && sequence_length == total_sequence_length_input;
      total_sequence_length = u32(${e?.getByOffset("batchIdx")}) + 1;
      var past_sequence_length: u32 = 0;
      if (is_first_prompt == false) {
        past_sequence_length = total_sequence_length - sequence_length;
      }
       `:`
    ${r?"let past_sequence_length = uniforms.past_sequence_length":""};
    let present_sequence_length = total_sequence_length;
    `,Gu=(e,t,r,i,n,a,s,u)=>{let l=ke(s?1:a),p=64,h=a/l;h<p&&(p=32);let c=Math.ceil(a/l/p),g=[{type:12,data:t},{type:12,data:r},{type:12,data:i},{type:12,data:n},{type:12,data:h},{type:12,data:c}],b=Ae(e.dataType,l),y=Ce(1,l),w=["type"];s&&w.push("type"),u&&w.push("type");let k=(S)=>{let _=j("x",e.dataType,e.dims,l),I=[_],T=s?B("seq_lens",s.dataType,s.dims):void 0;T&&I.push(T);let C=u?B("total_sequence_length_input",u.dataType,u.dims):void 0;C&&I.push(C);let A=Ce(e.dataType),O=[{name:"batch_size",type:"u32"},{name:"num_heads",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"sequence_length",type:"u32"},{name:"total_sequence_length",type:"u32"},{name:"elements_per_thread",type:"u32"}];return`
  var<workgroup> thread_max: array<f32, ${p}>;
  var<workgroup> thread_sum: array<f32, ${p}>;
  ${S.registerUniforms(O).declareVariables(...I)}
  ${S.mainStart([p,1,1])}
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let sequence_length = uniforms.sequence_length;
    var total_sequence_length = uniforms.total_sequence_length;
    ${Kr(T,C,!1)}
    let local_offset = local_idx * uniforms.elements_per_thread;
    let offset = (global_idx / ${p}) * uniforms.total_sequence_length + local_offset;
    let seq_causal_length = ${s?"u32(past_sequence_length + workgroup_id.y + 1)":"total_sequence_length"};
    var thread_max_vector = ${y}(-3.4028234663852886e+38f);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      thread_max_vector = max(${y}(x[offset + i]), thread_max_vector);
    }
    thread_max[local_idx] = ${(()=>{switch(l){case 1:return"thread_max_vector";case 2:return"max(thread_max_vector.x, thread_max_vector.y)";case 4:return"max(max(thread_max_vector.x, thread_max_vector.y), max(thread_max_vector.z, thread_max_vector.w))";default:throw Error(`Unsupported components: ${l}`)}})()};
    workgroupBarrier();

    var max_value =  f32(-3.4028234663852886e+38f);
    for (var i = 0u; i < ${p}; i++) {
      max_value = max(thread_max[i], max_value);
    }

    var sum_vector = ${y}(0);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      sum_vector += exp(${y}(x[offset + i]) - max_value);
    }
    thread_sum[local_idx] = ${(()=>{switch(l){case 1:return"sum_vector";case 2:return"sum_vector.x + sum_vector.y";case 4:return"sum_vector.x + sum_vector.y + sum_vector.z + sum_vector.w";default:throw Error(`Unsupported components: ${l}`)}})()};
    workgroupBarrier();

    var sum: f32 = 0;
    for (var i = 0u; i < ${p}; i++) {
      sum += thread_sum[i];
    }

    if (sum == 0) {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        x[offset + i] = ${_.type.value}(${A}(1.0) / ${A}(seq_causal_length));
      }
    } else {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        var f32input = ${y}(x[offset + i]);
        x[offset + i] = ${_.type.value}(exp(f32input - max_value) / sum);
      }
    }
      ${s?`
        for (var total_seq_id: u32 = seq_causal_length; total_seq_id + local_offset < uniforms.total_sequence_length; total_seq_id++) {
          x[offset + total_seq_id] = ${_.type.value}(${A}(0));
        }`:""};
  }`};return{name:"AttentionProbsSoftmax",shaderCache:{hint:`${p};${b};${l}`,inputDependencies:w},getShaderSource:k,getRunData:()=>({outputs:[],dispatchGroup:{x:1,y:n,z:t*r},programUniforms:g})}},Hu=(e,t,r,i,n,a,s,u,l)=>{let p=s+a.kvSequenceLength,h=[a.batchSize,a.numHeads,a.sequenceLength,p],c=e>1&&i,g=a.kvNumHeads?a.kvNumHeads:a.numHeads,b=c?[a.batchSize,g,p,a.headSize]:void 0,y=a.nReps?a.nReps:1,w=a.scale===0?1/Math.sqrt(a.headSize):a.scale,k=ke(a.headSize),S=a.headSize/k,_=12,I={x:Math.ceil(p/_),y:Math.ceil(a.sequenceLength/_),z:a.batchSize*a.numHeads},T=[{type:12,data:a.sequenceLength},{type:12,data:S},{type:12,data:p},{type:12,data:a.numHeads},{type:12,data:a.headSize},{type:1,data:w},{type:12,data:s},{type:12,data:a.kvSequenceLength},{type:12,data:y}],C=c&&i&&M.size(i.dims)>0,A=["type","type"];C&&A.push("type"),n&&A.push("type"),u&&A.push("type"),l&&A.push("type");let O=[{dims:h,dataType:t.dataType,gpuDataType:0}];c&&O.push({dims:b,dataType:t.dataType,gpuDataType:0});let v=(N)=>{let q=B("q",t.dataType,t.dims,k),F=B("key",r.dataType,r.dims,k),W=[q,F];if(C){let Q=B("past_key",i.dataType,i.dims,k);W.push(Q)}n&&W.push(B("attention_bias",n.dataType,n.dims));let G=u?B("seq_lens",u.dataType,u.dims):void 0;G&&W.push(G);let ae=l?B("total_sequence_length_input",l.dataType,l.dims):void 0;ae&&W.push(ae);let z=j("output",t.dataType,h),L=[z];c&&L.push(j("present_key",t.dataType,b,k));let te=Ce(1,k),re=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"alpha",type:"f32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${_}u;

  var<workgroup> tileQ: array<${q.type.storage}, ${_*_}>;
  var<workgroup> tileK: array<${q.type.storage}, ${_*_}>;
  ${N.registerUniforms(re).declareVariables(...W,...L)}
  ${N.mainStart([_,_,1])}
    // x holds the N and y holds the M
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let kvHeadIdx = ${y===1?"headIdx":"headIdx / uniforms.n_reps"};
    let kv_num_heads = ${y===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let m = workgroup_id.y * TILE_SIZE;
    let n = workgroup_id.x * TILE_SIZE;
    let sequence_length = uniforms.M;
    var total_sequence_length = uniforms.N;
    ${Kr(G,ae,!0)}
    let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx;
    let qOffset = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
    ${C&&c?"let pastKeyOffset = absKvHeadIdx * uniforms.past_sequence_length * uniforms.K;":""};
    let kOffset = absKvHeadIdx * uniforms.kv_sequence_length * uniforms.K;
    ${c?"let presentKeyOffset = absKvHeadIdx * uniforms.N * uniforms.K;":""}
    var value = ${te}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (global_id.y < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = q[qOffset + local_id.y * uniforms.K + w + local_id.x];
      }
      if (n + local_id.y < uniforms.N && w + local_id.x < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
      ${C&&c?`
              if (n + local_id.y < past_sequence_length) {
                tileK[idx] = past_key[pastKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
              } else if (n + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
                tileK[idx] = key[kOffset + (n + local_id.y - past_sequence_length) * uniforms.K + w + local_id.x];
              }`:`
          if (n + local_id.y < uniforms.kv_sequence_length) {
            tileK[idx] = key[kOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
          }`}
      ${c?`if (n + local_id.y < present_sequence_length) {
        present_key[presentKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x] = tileK[idx];
      }`:""}
      }
      workgroupBarrier();

      for (var k: u32 = 0u; k < TILE_SIZE && w+k < uniforms.K; k++) {
          value += ${te}(tileQ[TILE_SIZE * local_id.y + k] * tileK[TILE_SIZE * local_id.x + k]);
      }

      workgroupBarrier();
    }

    if (global_id.y < uniforms.M && global_id.x < total_sequence_length) {
      let headOffset = workgroup_id.z * uniforms.M * uniforms.N;
      let outputIdx = headOffset + global_id.y * uniforms.N + global_id.x;
      var sum: f32 = ${(()=>{switch(k){case 1:return"value";case 2:return"value.x + value.y";case 4:return"value.x + value.y + value.z + value.w";default:throw Error(`Unsupported components: ${k}`)}})()};
        output[outputIdx] = ${z.type.value} (sum * uniforms.alpha) + ${n?"attention_bias[outputIdx]":"0.0"};
    }
  }`};return{name:"AttentionProbs",shaderCache:{hint:`${k};${n!==void 0};${i!==void 0};${e}`,inputDependencies:A},getRunData:()=>({outputs:O,dispatchGroup:I,programUniforms:T}),getShaderSource:v}},Fu=(e,t,r,i,n,a,s=void 0,u=void 0)=>{let l=a+n.kvSequenceLength,p=n.nReps?n.nReps:1,h=n.vHiddenSize*p,c=e>1&&i,g=n.kvNumHeads?n.kvNumHeads:n.numHeads,b=c?[n.batchSize,g,l,n.headSize]:void 0,y=[n.batchSize,n.sequenceLength,h],w=12,k={x:Math.ceil(n.vHeadSize/w),y:Math.ceil(n.sequenceLength/w),z:n.batchSize*n.numHeads},S=[{type:12,data:n.sequenceLength},{type:12,data:l},{type:12,data:n.vHeadSize},{type:12,data:n.numHeads},{type:12,data:n.headSize},{type:12,data:h},{type:12,data:a},{type:12,data:n.kvSequenceLength},{type:12,data:p}],_=c&&i&&M.size(i.dims)>0,I=["type","type"];_&&I.push("type"),s&&I.push("type"),u&&I.push("type");let T=[{dims:y,dataType:t.dataType,gpuDataType:0}];c&&T.push({dims:b,dataType:t.dataType,gpuDataType:0});let C=(A)=>{let O=B("probs",t.dataType,t.dims),v=B("v",r.dataType,r.dims),N=[O,v];_&&N.push(B("past_value",i.dataType,i.dims));let q=s?B("seq_lens",s.dataType,s.dims):void 0;s&&N.push(q);let F=u?B("total_sequence_length_input",u.dataType,u.dims):void 0;u&&N.push(F);let W=[j("output",t.dataType,y)];c&&W.push(j("present_value",t.dataType,b));let G=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"v_hidden_size",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${w}u;
  var<workgroup> tileQ: array<${O.type.value}, ${w*w}>;
  var<workgroup> tileV: array<${O.type.value}, ${w*w}>;
  ${A.registerUniforms(G).declareVariables(...N,...W)}
  ${A.mainStart([w,w,1])}
   let headIdx = workgroup_id.z % uniforms.num_heads;
   let batchIdx = workgroup_id.z / uniforms.num_heads;
   let kvHeadIdx = ${p===1?"headIdx":"headIdx / uniforms.n_reps"};
   let kv_num_heads = ${p===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
   let m = global_id.y;
   let n = global_id.x;
   let sequence_length = uniforms.M;
   var total_sequence_length = uniforms.K;
   ${Kr(q,F,!0)}
   let offsetA = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
   let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx; // kvHeadIdx is relative to the batch
   ${_&&c?"let pastValueOffset = absKvHeadIdx * uniforms.N * uniforms.past_sequence_length + n;":""};
   let vOffset = absKvHeadIdx * uniforms.N * uniforms.kv_sequence_length + n;
   ${c?"let presentValueOffset = absKvHeadIdx * uniforms.N * uniforms.K + n;":""}
   var value = ${O.type.storage}(0);
   for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = probs[offsetA + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
        ${_&&c?`
        if (w + local_id.y < past_sequence_length) {
          tileV[idx] = past_value[pastValueOffset + (w + local_id.y) * uniforms.N];
        } else if (w + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
          tileV[idx] = v[vOffset + (w + local_id.y - past_sequence_length) * uniforms.N];
        }
      `:`
            if (w + local_id.y < uniforms.kv_sequence_length) {
              tileV[idx] = v[vOffset + (w + local_id.y) * uniforms.N];
            }`}
        ${c?`
            if (w + local_id.y < present_sequence_length) {
          present_value[presentValueOffset + (w + local_id.y) * uniforms.N] = tileV[idx];
        }`:""}
      }
     workgroupBarrier();
     for (var k: u32 = 0u; k < TILE_SIZE && w+k < total_sequence_length; k++) {
       value += tileQ[TILE_SIZE * local_id.y + k] * tileV[TILE_SIZE * k + local_id.x];
     }
     workgroupBarrier();
   }

   // we need to transpose output from BNSH_v to BSND_v
   if (m < uniforms.M && n < uniforms.N) {
     let outputIdx = batchIdx * uniforms.M * uniforms.v_hidden_size + m * uniforms.v_hidden_size
       + headIdx * uniforms.N + n;
     output[outputIdx] = value;
   }
  }`};return{name:"AttentionScore",shaderCache:{hint:`${i!==void 0};${e}`,inputDependencies:I},getRunData:()=>({outputs:T,dispatchGroup:k,programUniforms:S}),getShaderSource:C}},xr=(e,t,r,i,n,a,s,u,l,p,h=void 0,c=void 0)=>{let g=Math.min(e.outputCount,1+(s?1:0)+(u?1:0)),b=g>1?s:void 0,y=g>1?u:void 0,w=g>1?p.pastSequenceLength:0,k=w+p.kvSequenceLength,S=l&&M.size(l.dims)>0?l:void 0,_=[t,r];b&&M.size(b.dims)>0&&_.push(b),S&&_.push(S),h&&_.push(h),c&&_.push(c);let I=e.compute(Hu(g,t,r,b,S,p,w,h,c),{inputs:_,outputs:g>1?[-1,1]:[-1]})[0];e.compute(Gu(I,p.batchSize,p.numHeads,w,p.sequenceLength,k,h,c),{inputs:h&&c?[I,h,c]:[I],outputs:[]});let T=[I,i];y&&M.size(y.dims)>0&&T.push(y),h&&T.push(h),c&&T.push(c),e.compute(Fu(g,I,i,y,p,w,h,c),{inputs:T,outputs:g>1?[0,2]:[0]})},ju=(e,t)=>{let r=[t.batchSize,t.numHeads,t.sequenceLength,t.headSize],i=t.sequenceLength,n=t.inputHiddenSize,a=t.headSize,s=12,u={x:Math.ceil(t.headSize/s),y:Math.ceil(t.sequenceLength/s),z:t.batchSize*t.numHeads},l=[e.inputs[0],e.inputs[1],e.inputs[2]],p=[{type:12,data:i},{type:12,data:n},{type:12,data:a},{type:12,data:t.numHeads},{type:12,data:t.headSize},{type:12,data:t.hiddenSize},{type:12,data:t.hiddenSize+t.hiddenSize+t.vHiddenSize}],h=(c)=>{let g=j("output_q",l[0].dataType,r),b=j("output_k",l[0].dataType,r),y=j("output_v",l[0].dataType,r),w=B("input",l[0].dataType,l[0].dims),k=B("weight",l[1].dataType,l[1].dims),S=B("bias",l[2].dataType,l[2].dims),_=w.type.storage,I=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"hidden_size",type:"u32"},{name:"ldb",type:"u32"}];return`
  const TILE_SIZE = ${s}u;
  var<workgroup> tileInput: array<${_}, ${s*s}>;
  var<workgroup> tileWeightQ: array<${_}, ${s*s}>;
  var<workgroup> tileWeightK: array<${_}, ${s*s}>;
  var<workgroup> tileWeightV: array<${_}, ${s*s}>;
  ${c.registerUniforms(I).declareVariables(w,k,S,g,b,y)}
  ${c.mainStart([s,s,1])}
    let batchIndex = workgroup_id.z / uniforms.num_heads;
    let headNumber = workgroup_id.z % uniforms.num_heads;
    let m = global_id.y;
    let n = global_id.x;

    let inputOffset = batchIndex * (uniforms.M * uniforms.K) + m * uniforms.K;
    let biasOffsetQ = headNumber * uniforms.head_size;
    let biasOffsetK = uniforms.hidden_size + biasOffsetQ;
    let biasOffsetV = uniforms.hidden_size + biasOffsetK;

    var valueQ = ${_}(0);
    var valueK = ${_}(0);
    var valueV = ${_}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileInput[TILE_SIZE * local_id.y + local_id.x] = input[inputOffset + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        let offset = n + (w + local_id.y) * uniforms.ldb;
        tileWeightQ[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetQ + offset];
        tileWeightK[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetK + offset];
        tileWeightV[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetV + offset];
      }
      workgroupBarrier();
      for (var k: u32 = 0u; k<TILE_SIZE && w+k < uniforms.K; k++) {
        let inputTileOffset = TILE_SIZE * local_id.y + k;
        let weightTileOffset = TILE_SIZE * k + local_id.x;
        valueQ += tileInput[inputTileOffset] * tileWeightQ[weightTileOffset];
        valueK += tileInput[inputTileOffset] * tileWeightK[weightTileOffset];
        valueV += tileInput[inputTileOffset] * tileWeightV[weightTileOffset];
      }

      workgroupBarrier();
    }

    let headOffset = (m * uniforms.N + n) % uniforms.head_size;
    valueQ += bias[headOffset + biasOffsetQ];
    valueK += bias[headOffset + biasOffsetK];
    valueV += bias[headOffset + biasOffsetV];

    let offset = workgroup_id.z * uniforms.M * uniforms.N;
    if (m < uniforms.M && n < uniforms.N) {
      let outputIdx = offset + m * uniforms.N + n;
      output_q[outputIdx] = valueQ;
      output_k[outputIdx] = valueK;
      output_v[outputIdx] = valueV;
    }
  }`};return e.compute({name:"AttentionPrepare",shaderCache:{inputDependencies:["type","type","type"]},getRunData:()=>({outputs:[{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0}],dispatchGroup:u,programUniforms:p}),getShaderSource:h},{inputs:l,outputs:[-1,-1,-1]})},Mc=(e,t)=>{let r=Wu(e.inputs,t),[i,n,a]=ju(e,r);return xr(e,i,n,a,e.inputs[4],void 0,void 0,void 0,e.inputs[5],r)}}),by=U(()=>{Ve(),ee(),ie(),Te(),ne(),Ku=(e,t)=>{if(!e||e.length!==5)throw Error("BatchNormalization requires 5 inputs");let r=(i,n,a)=>{let s=n.length;if(s!==i.length)throw Error(`${a}: num dimensions != ${s}`);n.forEach((u,l)=>{if(u!==i[l])throw Error(`${a}: dim[${l}] do not match`)})};if(e[0].dims.length>1){let i=t.format==="NHWC"?t.spatial?e[0].dims.slice(-1):e[0].dims.slice(-1).concat(e[0].dims.slice(1,e[0].dims.length-1)):e[0].dims.slice(1,t.spatial?2:void 0);r(e[1].dims,i,"Invalid input scale"),r(e[2].dims,i,"Invalid input B"),r(e[3].dims,i,"Invalid input mean"),r(e[4].dims,i,"Invalid input var")}else r(e[1].dims,[1],"Invalid input scale"),r(e[2].dims,[1],"Invalid input B"),r(e[3].dims,[1],"Invalid input mean"),r(e[4].dims,[1],"Invalid input var")},Zu=(e,t)=>{let{epsilon:r,spatial:i,format:n}=t,a=e[0].dims,s=i?ke(a[a.length-1]):1,u=n==="NHWC"&&a.length>1?s:1,l=M.size(a)/s,p=i,h=p?a.length:a,c=B("x",e[0].dataType,e[0].dims,s),g=B("scale",e[1].dataType,e[1].dims,u),b=B("bias",e[2].dataType,e[2].dims,u),y=B("inputMean",e[3].dataType,e[3].dims,u),w=B("inputVar",e[4].dataType,e[4].dims,u),k=j("y",e[0].dataType,h,s),S=()=>{let I="";if(i)I=`let cOffset = ${a.length===1?"0u":n==="NHWC"?`outputIndices[${a.length-1}] / ${s}`:"outputIndices[1]"};`;else if(n==="NCHW")I=`
            ${k.indicesSet("outputIndices","0","0")}
            let cOffset = ${k.indicesToOffset("outputIndices")};`;else{I=`var cIndices = ${g.type.indices}(0);
                       cIndices[0] = outputIndices[${a.length-1}];`;for(let T=1;T<g.rank;T++)I+=`cIndices[${T}] = outputIndices[${T}];`;I+=`let cOffset = ${g.indicesToOffset("cIndices")};`}return I},_=(I)=>`
  const epsilon = ${r};
  ${I.registerUniform("outputSize","u32").declareVariables(c,g,b,y,w,k)}
  ${I.mainStart()}
  ${I.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
    var outputIndices = ${k.offsetToIndices(`global_idx * ${s}`)};
    ${S()}
    let scale = ${g.getByOffset("cOffset")};
    let bias = ${b.getByOffset("cOffset")};
    let inputMean = ${y.getByOffset("cOffset")};
    let inputVar = ${w.getByOffset("cOffset")};
    let x = ${c.getByOffset("global_idx")};
    let value = (x - inputMean) * inverseSqrt(inputVar + epsilon) * scale + bias;
    ${k.setByOffset("global_idx","value")}
  }`;return{name:"BatchNormalization",shaderCache:{hint:`${t.epsilon}_${t.format}_${i}_${s}`,inputDependencies:p?["rank","type","type","type","type"]:void 0},getShaderSource:_,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:p?[{type:12,data:l},...X(a)]:[{type:12,data:l}]})}},Yu=(e)=>fe(e),Bc=(e,t)=>{let{inputs:r,outputCount:i}=e,n=Yu({...t,outputCount:i});if(we.webgpu.validateInputContent&&Ku(r,n),t.trainingMode)throw Error("BatchNormalization trainingMode is not supported yet.");e.compute(Zu(r,n))}}),_y=U(()=>{ie(),ne(),Xu=(e)=>{if(e[0].dims.length!==3)throw Error("input should have 3 dimensions");if(![320,640,1280].includes(e[0].dims[2]))throw Error("number of channels should be 320, 640 or 1280");if(e[1].dims.length!==1)throw Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw Error("last dimension of input and bias are not the same")},Qu=(e)=>{let t=e[0].dims,r=e[0].dims[2],i=M.size(t)/4,n=e[0].dataType,a=B("input",n,t,4),s=B("bias",n,[r],4),u=B("residual",n,t,4),l=j("output",n,t,4);return{name:"BiasAdd",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(i/64)}}),getShaderSource:(p)=>`
  const channels = ${r}u / 4;
  ${p.declareVariables(a,s,u,l)}

  ${p.mainStart()}
    ${p.guardAgainstOutOfBoundsWorkgroupSizes(i)}
    let value = ${a.getByOffset("global_idx")}
      + ${s.getByOffset("global_idx % channels")} + ${u.getByOffset("global_idx")};
    ${l.setByOffset("global_idx","value")}
  }`}},Dc=(e)=>{Xu(e.inputs),e.compute(Qu(e.inputs))}}),ya=U(()=>{ee(),ie(),Te(),ne(),Ju=(e,t,r,i,n,a,s)=>{let u=Math.ceil(t/4),l="";typeof n=="string"?l=`${n}(a)`:l=n("a");let p=B("inputData",r,[u],4),h=j("outputData",i,[u],4),c=[{name:"vec_size",type:"u32"}];return s&&c.push(...s),`
      ${e.registerUniforms(c).declareVariables(p,h)}

  ${a??""}

  ${e.mainStart()}
    ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}

    let a = ${p.getByOffset("global_idx")};
    ${h.setByOffset("global_idx",l)}
  }`},he=(e,t,r,i,n,a=e.dataType,s,u)=>{let l=[{type:12,data:Math.ceil(M.size(e.dims)/4)}];return s&&l.push(...s),{name:t,shaderCache:{hint:n,inputDependencies:["type"]},getShaderSource:(p)=>Ju(p,M.size(e.dims),e.dataType,a,r,i,u),getRunData:(p)=>({outputs:[{dims:e.dims,dataType:a}],dispatchGroup:{x:Math.ceil(M.size(p[0].dims)/64/4)},programUniforms:l})}},Nc=(e)=>{e.compute(he(e.inputs[0],"Abs","abs"))},Pc=(e)=>{e.compute(he(e.inputs[0],"Acos","acos"))},Uc=(e)=>{e.compute(he(e.inputs[0],"Acosh","acosh"))},Lc=(e)=>{e.compute(he(e.inputs[0],"Asin","asin"))},qc=(e)=>{e.compute(he(e.inputs[0],"Asinh","asinh"))},Vc=(e)=>{e.compute(he(e.inputs[0],"Atan","atan"))},Wc=(e)=>{e.compute(he(e.inputs[0],"Atanh","atanh"))},Gc=(e)=>fe(e),Hc=(e,t)=>{let r;switch(t.to){case 10:r="vec4<f16>";break;case 1:r="vec4<f32>";break;case 12:r="vec4<u32>";break;case 6:r="vec4<i32>";break;case 9:r="vec4<bool>";break;default:throw RangeError(`not supported type (specified in attribute 'to' from 'Cast' operator): ${t.to}`)}e.compute(he(e.inputs[0],"Cast",r,void 0,t.cacheKey,t.to))},el=(e)=>{let t,r,i=e.length>=2&&e[1].data!==0,n=e.length>=3&&e[2].data!==0;switch(e[0].dataType){case 1:t=i?e[1].getFloat32Array()[0]:-340282346638528860000000000000000000000,r=n?e[2].getFloat32Array()[0]:340282346638528860000000000000000000000;break;case 10:t=i?e[1].getUint16Array()[0]:64511,r=n?e[2].getUint16Array()[0]:31743;break;default:throw Error("Unsupport data type")}return fe({min:t,max:r})},Fc=(e,t)=>{let r=t||el(e.inputs),i=Ce(e.inputs[0].dataType);e.compute(he(e.inputs[0],"Clip",(n)=>`clamp(${n}, vec4<${i}>(uniforms.min), vec4<${i}>(uniforms.max))`,void 0,r.cacheKey,void 0,[{type:e.inputs[0].dataType,data:r.min},{type:e.inputs[0].dataType,data:r.max}],[{name:"min",type:i},{name:"max",type:i}]),{inputs:[0]})},jc=(e)=>{e.compute(he(e.inputs[0],"Ceil","ceil"))},Kc=(e)=>{e.compute(he(e.inputs[0],"Cos","cos"))},Zc=(e)=>{e.compute(he(e.inputs[0],"Cosh","cosh"))},br=(e)=>fe(e),Yc=(e,t)=>{let r=Ce(e.inputs[0].dataType);e.compute(he(e.inputs[0],"Elu",(i)=>`elu_vf32(${i})`,`
  const elu_alpha_ = ${r}(${t.alpha});

  fn elu_f32(a: ${r}) -> ${r} {
  return select((exp(a) - 1.0) * elu_alpha_, a, a >= 0.0);
  }

  fn elu_vf32(v: vec4<${r}>) -> vec4<${r}> {
  return vec4(elu_f32(v.x), elu_f32(v.y), elu_f32(v.z), elu_f32(v.w));
  }`,t.cacheKey))},ri=(e="f32")=>`
const r0: ${e} = 0.3275911;
const r1: ${e} = 0.254829592;
const r2: ${e} = -0.284496736;
const r3: ${e} = 1.421413741;
const r4: ${e} = -1.453152027;
const r5: ${e} = 1.061405429;

fn erf_vf32(v: vec4<${e}>) -> vec4<${e}> {
  let absv = abs(v);
  let x = 1.0 / (1.0 + r0 * absv);
  return sign(v) * (1.0 - ((((r5 * x + r4) * x + r3) * x + r2) * x + r1) * x * exp(-absv * absv));
}`,Xc=(e)=>{let t=Ce(e.inputs[0].dataType);e.compute(he(e.inputs[0],"Erf",(r)=>`erf_vf32(${r})`,ri(t)))},Qc=(e)=>{e.compute(he(e.inputs[0],"Exp","exp"))},Jc=(e)=>{e.compute(he(e.inputs[0],"Floor","floor"))},eh=(e)=>{let t=Ce(e.inputs[0].dataType);e.compute(he(e.inputs[0],"Gelu",(r)=>`0.5 * ${r} * (1.0 + erf_vf32(${r} * 0.7071067811865475))`,ri(t)))},th=(e,t)=>{let r=Ce(e.inputs[0].dataType);e.compute(he(e.inputs[0],"LeakyRelu",(i)=>`select(leaky_relu_alpha_ * ${i}, ${i}, ${i} >= vec4<${r}>(0.0))`,`const leaky_relu_alpha_ = ${r}(${t.alpha});`,t.cacheKey))},rh=(e)=>{e.compute(he(e.inputs[0],"Not",(t)=>`!${t}`))},ih=(e)=>{e.compute(he(e.inputs[0],"Neg",(t)=>`-${t}`))},nh=(e)=>{e.compute(he(e.inputs[0],"Reciprocal",(t)=>`1.0/${t}`))},ah=(e)=>{let t=Ce(e.inputs[0].dataType);e.compute(he(e.inputs[0],"Relu",(r)=>`select(vec4<${t}>(0.0), ${r}, ${r} > vec4<${t}>(0.0))`))},sh=(e)=>{e.compute(he(e.inputs[0],"Sigmoid",(t)=>`(1.0 / (1.0 + exp(-${t})))`))},oh=(e)=>fe(e),uh=(e,t)=>{let r=Ce(e.inputs[0].dataType);e.compute(he(e.inputs[0],"HardSigmoid",(i)=>`max(vec4<${r}>(0.0), min(vec4<${r}>(1.0), ${t.alpha} * ${i} + vec4<${r}>(${t.beta})))`,void 0,t.cacheKey))},lh=(e)=>{let t=Ce(e.inputs[0].dataType);e.compute(he(e.inputs[0],"HardSwish",(r)=>`${r} * max(vec4<${t}>(0.0), min(vec4<${t}>(1.0), vec4<${t}>(${t}(1.0 / 6.0)) * ${r} + vec4<${t}>(0.5)))`))},dh=(e)=>{e.compute(he(e.inputs[0],"Sin","sin"))},ph=(e)=>{e.compute(he(e.inputs[0],"Sinh","sinh"))},ch=(e)=>{e.compute(he(e.inputs[0],"Sqrt","sqrt"))},hh=(e)=>{e.compute(he(e.inputs[0],"Tan","tan"))},sn=(e)=>`sign(${e}) * (1 - exp(-2 * abs(${e}))) / (1 + exp(-2 * abs(${e})))`,fh=(e)=>{e.compute(he(e.inputs[0],"Tanh",sn))},Fn=(e="f32")=>`
const fast_gelu_a: ${e} = 0.5;
const fast_gelu_b: ${e} = 0.7978845608028654;
const fast_gelu_c: ${e} = 0.035677408136300125;

fn tanh_v(v: vec4<${e}>) -> vec4<${e}> {
  return ${sn("v")};
}
`,jn=(e)=>`(fast_gelu_a + fast_gelu_a * tanh_v(${e} * (fast_gelu_c * ${e} * ${e} + fast_gelu_b))) * ${e}`,mh=(e)=>{let t=Ce(e.inputs[0].dataType);e.compute(he(e.inputs[0],"FastGelu",jn,Fn(t),void 0,e.inputs[0].dataType))},gh=(e,t)=>{let r=Ce(e.inputs[0].dataType);return e.compute(he(e.inputs[0],"ThresholdedRelu",(i)=>`select(vec4<${r}>(0.0), ${i}, ${i} > thresholded_relu_alpha_)`,`const thresholded_relu_alpha_ = vec4<${r}>(${t.alpha});`,t.cacheKey)),0},yh=(e)=>{e.compute(he(e.inputs[0],"Log","log"))},tl=(e,t)=>`
const alpha = vec4<${e}>(${t});
const one = ${e}(1.0);
const zero = ${e}(0.0);

fn quick_gelu_impl(x: vec4<${e}>) -> vec4<${e}> {
  let v = x *alpha;
  var x1 : vec4<${e}>;
  for (var i = 0; i < 4; i = i + 1) {
    if (v[i] >= zero) {
      x1[i] = one / (one + exp(-v[i]));
    } else {
      x1[i] = one - one / (one + exp(v[i]));
    }
  }
  return x * x1;
}
`,rl=(e)=>`quick_gelu_impl(${e})`,bh=(e,t)=>{let r=Ce(e.inputs[0].dataType);e.compute(he(e.inputs[0],"QuickGelu",rl,tl(r,t.alpha),t.cacheKey,e.inputs[0].dataType))}}),wy=U(()=>{ie(),ne(),ya(),il=(e)=>{if(e[0].dims.length!==3)throw Error("input should have 3 dimensions");if(![2560,5120,10240].includes(e[0].dims[2]))throw Error("hidden state should be 2560, 5120 or 10240");if(e[1].dims.length!==1)throw Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw Error("last dimension of input and bias are not the same")},nl=(e)=>{let t=e[0].dims.slice();t[2]=t[2]/2;let r=B("input",e[0].dataType,e[0].dims,4),i=B("bias",e[0].dataType,[e[0].dims[2]],4),n=j("output",e[0].dataType,t,4),a=M.size(t)/4,s=Ae(e[0].dataType);return{name:"BiasSplitGelu",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(a/64)}}),getShaderSource:(u)=>`
  const M_SQRT2 = sqrt(2.0);
  const halfChannels = ${e[0].dims[2]/4/2}u;

  ${u.declareVariables(r,i,n)}

  ${ri(s)}

  ${u.mainStart()}
    ${u.guardAgainstOutOfBoundsWorkgroupSizes(a)}
    let biasIdx = global_idx % halfChannels;
    let batchIndex = global_idx / halfChannels;
    let inputOffset = biasIdx + batchIndex * halfChannels * 2;
    let valueLeft = input[inputOffset] + bias[biasIdx];
    let valueRight = input[inputOffset + halfChannels] + bias[biasIdx + halfChannels];
    let geluRight = valueRight * 0.5 * (erf_vf32(valueRight / M_SQRT2) + 1);

    ${n.setByOffset("global_idx","valueLeft * geluRight")}
  }`}},_h=(e)=>{il(e.inputs),e.compute(nl(e.inputs))}}),vy=U(()=>{ee(),ie(),ne(),al=(e,t,r,i,n,a,s,u,l,p,h,c)=>{let g,b;typeof u=="string"?g=b=(_,I)=>`${u}((${_}),(${I}))`:typeof u=="function"?g=b=u:(g=u.scalar,b=u.vector);let y=j("outputData",h,i.length,4),w=B("aData",l,t.length,4),k=B("bData",p,r.length,4),S;if(n)if(a){let _=M.size(t)===1,I=M.size(r)===1,T=t.length>0&&t[t.length-1]%4===0,C=r.length>0&&r[r.length-1]%4===0;_||I?S=y.setByOffset("global_idx",b(_?`${w.type.value}(${w.getByOffset("0")}.x)`:w.getByOffset("global_idx"),I?`${k.type.value}(${k.getByOffset("0")}.x)`:k.getByOffset("global_idx"))):S=`
            let outputIndices = ${y.offsetToIndices("global_idx * 4u")};
            let offsetA = ${w.broadcastedIndicesToOffset("outputIndices",y)};
            let offsetB = ${k.broadcastedIndicesToOffset("outputIndices",y)};
            ${y.setByOffset("global_idx",b(s||T?w.getByOffset("offsetA / 4u"):`${w.type.value}(${w.getByOffset("offsetA / 4u")}[offsetA % 4u])`,s||C?k.getByOffset("offsetB / 4u"):`${k.type.value}(${k.getByOffset("offsetB / 4u")}[offsetB % 4u])`))}
          `}else S=y.setByOffset("global_idx",b(w.getByOffset("global_idx"),k.getByOffset("global_idx")));else{if(!a)throw Error("no necessary to use scalar implementation for element-wise binary op implementation.");let _=(I,T,C="")=>{let A=`aData[indexA${T}][componentA${T}]`,O=`bData[indexB${T}][componentB${T}]`;return`
            let outputIndices${T} = ${y.offsetToIndices(`global_idx * 4u + ${T}u`)};
            let offsetA${T} = ${w.broadcastedIndicesToOffset(`outputIndices${T}`,y)};
            let offsetB${T} = ${k.broadcastedIndicesToOffset(`outputIndices${T}`,y)};
            let indexA${T} = offsetA${T} / 4u;
            let indexB${T} = offsetB${T} / 4u;
            let componentA${T} = offsetA${T} % 4u;
            let componentB${T} = offsetB${T} % 4u;
            ${I}[${T}] = ${C}(${g(A,O)});
          `};h===9?S=`
            var data = vec4<u32>(0);
            ${_("data",0,"u32")}
            ${_("data",1,"u32")}
            ${_("data",2,"u32")}
            ${_("data",3,"u32")}
            outputData[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:S=`
            ${_("outputData[global_idx]",0)}
            ${_("outputData[global_idx]",1)}
            ${_("outputData[global_idx]",2)}
            ${_("outputData[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(w,k,y)}

        ${c??""}

        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${S}
      }`},sl=(e,t,r,i,n,a,s=r.dataType)=>{let u=r.dims.map(Number),l=i.dims.map(Number),p=!M.areEqual(u,l),h=u,c=M.size(u),g=!1,b=!1,y=[p];if(p){let w=Kt.calcShape(u,l,!1);if(!w)throw Error("Can't perform binary op on the given tensors");h=w.slice(),c=M.size(h);let k=M.size(u)===1,S=M.size(l)===1,_=u.length>0&&u[u.length-1]%4===0,I=l.length>0&&l[l.length-1]%4===0;y.push(k),y.push(S),y.push(_),y.push(I);let T=1;for(let C=1;C<h.length;C++){let A=u[u.length-C],O=l[l.length-C];if(A===O)T*=A;else break}T%4===0?(b=!0,g=!0):(k||S||_||I)&&(g=!0)}else g=!0;return y.push(g),{name:e,shaderCache:{hint:t+y.map((w)=>w.toString()).join("_"),inputDependencies:["rank","rank"]},getShaderSource:(w)=>al(w,u,l,h,g,p,b,n,r.dataType,i.dataType,s,a),getRunData:()=>({outputs:[{dims:h,dataType:s}],dispatchGroup:{x:Math.ceil(c/64/4)},programUniforms:[{type:12,data:Math.ceil(M.size(h)/4)},...X(u,l,h)]})}},Ke=(e,t,r,i,n,a)=>{e.compute(sl(t,n??"",e.inputs[0],e.inputs[1],r,i,a))},wh=(e)=>{Ke(e,"Add",(t,r)=>`${t}+${r}`)},vh=(e)=>{Ke(e,"Div",(t,r)=>`${t}/${r}`)},$h=(e)=>{Ke(e,"Equal",{scalar:(t,r)=>`u32(${t}==${r})`,vector:(t,r)=>`vec4<u32>(${t}==${r})`},void 0,void 0,9)},xh=(e)=>{Ke(e,"Mul",(t,r)=>`${t}*${r}`)},Sh=(e)=>{let t=B("input",e.inputs[0].dataType,e.inputs[0].dims).type.value;Ke(e,"Pow",{scalar:(r,i)=>`pow_custom(${r},${i})`,vector:(r,i)=>`pow_vector_custom(${r},${i})`},`
    fn pow_custom(a : ${t}, b : ${t}) -> ${t} {
      if (b == ${t}(0.0)) {
        return ${t}(1.0);
      } else if (a < ${t}(0.0) && f32(b) != floor(f32(b))) {
        return ${t}(pow(f32(a), f32(b))); // NaN
      }
      return select(sign(a), ${t}(1.0), round(f32(abs(b) % ${t}(2.0))) != 1.0) * ${t}(${t==="i32"?"round":""}(pow(f32(abs(a)), f32(b))));
    }
    fn pow_vector_custom(a : vec4<${t}>, b : vec4<${t}>) -> vec4<${t}> {
      // TODO: implement vectorized pow
      return vec4<${t}>(pow_custom(a.x, b.x), pow_custom(a.y, b.y), pow_custom(a.z, b.z), pow_custom(a.w, b.w));
    }
      `)},kh=(e)=>{Ke(e,"Sub",(t,r)=>`${t}-${r}`)},Th=(e)=>{Ke(e,"Greater",{scalar:(t,r)=>`u32(${t}>${r})`,vector:(t,r)=>`vec4<u32>(${t}>${r})`},void 0,void 0,9)},Eh=(e)=>{Ke(e,"Less",{scalar:(t,r)=>`u32(${t}<${r})`,vector:(t,r)=>`vec4<u32>(${t}<${r})`},void 0,void 0,9)},Ih=(e)=>{Ke(e,"GreaterOrEqual",{scalar:(t,r)=>`u32(${t}>=${r})`,vector:(t,r)=>`vec4<u32>(${t}>=${r})`},void 0,void 0,9)},Ch=(e)=>{Ke(e,"LessOrEqual",{scalar:(t,r)=>`u32(${t}<=${r})`,vector:(t,r)=>`vec4<u32>(${t}<=${r})`},void 0,void 0,9)}}),$y=U(()=>{ee(),ie(),Te(),ne(),ol=(e,t)=>{if(!e||e.length<1)throw Error("too few inputs");let r=0,i=e[r],n=i.dataType,a=i.dims.length;e.forEach((s,u)=>{if(u!==r){if(s.dataType!==n)throw Error("input tensors should be one type");if(s.dims.length!==a)throw Error("input tensors should have the same shape");s.dims.forEach((l,p)=>{if(p!==t&&l!==i.dims[p])throw Error("non concat dimensions must match")})}})},ul=(e,t)=>`
  fn calculateInputIndex(index: u32) -> u32 {
    let sizeInConcatAxis = array<u32, ${e}u>(${t});
    for (var i: u32 = 0u; i < ${e}; i += 1u ) {
      if (index < sizeInConcatAxis[i]) {
        return i;
      }
    }
    return ${e}u;
  }`,ll=(e,t)=>{let r=e.length,i=[];for(let n=0;n<r;++n){let a=t.setByOffset("global_idx",e[n].getByIndices("indices"));r===1?i.push(a):n===0?i.push(`if (inputIndex == ${n}u) { ${a} }`):n===r-1?i.push(`else { ${a} }`):i.push(`else if (inputIndex == ${n}) { ${a} }`)}return i.join(`
`)},dl=(e,t,r,i)=>{let n=M.size(r),a=Array(e.length),s=Array(e.length),u=0,l=[],p=[],h=[{type:12,data:n}];for(let w=0;w<e.length;++w)u+=e[w].dims[t],a[w]=u,p.push(e[w].dims.length),s[w]=B(`input${w}`,i,p[w]),l.push("rank"),h.push({type:12,data:a[w]});for(let w=0;w<e.length;++w)h.push(...X(e[w].dims));h.push(...X(r));let c=j("output",i,r.length),g=c.indicesGet("indices",t),b=Array.from(Array(a.length).keys()).map((w)=>`uniforms.sizeInConcatAxis${w}`).join(","),y=(w)=>`

  ${(()=>{w.registerUniform("outputSize","u32");for(let k=0;k<e.length;k++)w.registerUniform(`sizeInConcatAxis${k}`,"u32");return w.declareVariables(...s,c)})()}

  ${ul(a.length,b)}

  ${w.mainStart()}
    ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

    var indices = ${c.offsetToIndices("global_idx")};

    let inputIndex = calculateInputIndex(${g});
    if (inputIndex != 0u) {
      let sizeInConcatAxis = array<u32, ${a.length}u>(${b});
      ${g} -= sizeInConcatAxis[inputIndex - 1u];
    }

    ${ll(s,c)}
  }`;return{name:"Concat",shaderCache:{hint:`${t}`,inputDependencies:l},getRunData:()=>({outputs:[{dims:r,dataType:i}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:h}),getShaderSource:y}},Ah=(e,t)=>{let r=e.inputs,i=r[0].dims,n=M.normalizeAxis(t.axis,i.length);ol(r,n);let a=i.slice();a[n]=r.reduce((u,l)=>u+(l.dims.length>n?l.dims[n]:0),0);let s=r.filter((u)=>M.size(u.dims)>0);e.compute(dl(s,n,a,r[0].dataType),{inputs:s})},zh=(e)=>fe({axis:e.axis})}),Lt=U(()=>{ee(),ie(),Dt=(e,t,r="f32")=>{switch(e.activation){case"Relu":return`value = max(value, ${t}(0.0));`;case"Sigmoid":return`value = (${t}(1.0) / (${t}(1.0) + exp(-value)));`;case"Clip":return`value = clamp(value, ${t}(${r}(uniforms.clip_min)), ${t}(${r}(uniforms.clip_max)));`;case"HardSigmoid":return`value = max(${t}(0.0), min(${t}(1.0), ${r}(uniforms.alpha) * value + ${r}(uniforms.beta)));`;case"LeakyRelu":return`value = select(${r}(uniforms.alpha) * value, value, value >= ${t}(0.0));`;case"Tanh":return`let e2x = exp(-2.0 * abs(value));
              value = sign(value) * (1.0 - e2x) / (1.0 + e2x);
        `;case"":return"";default:throw Error(`Unsupported activation ${e.activation}`)}},Nt=(e,t)=>{e.activation==="Clip"?t.push({type:1,data:e.clipMax},{type:1,data:e.clipMin}):e.activation==="HardSigmoid"?t.push({type:1,data:e.alpha},{type:1,data:e.beta}):e.activation==="LeakyRelu"&&t.push({type:1,data:e.alpha})},Pt=(e,t)=>{e.activation==="Clip"?t.push({name:"clip_max",type:"f32"},{name:"clip_min",type:"f32"}):e.activation==="HardSigmoid"?t.push({name:"alpha",type:"f32"},{name:"beta",type:"f32"}):e.activation==="LeakyRelu"&&t.push({name:"alpha",type:"f32"})},ba=(e)=>{let t=e?.activation||"";if(t==="HardSigmoid"){let[r,i]=e?.activation_params||[0.2,0.5];return{activation:t,alpha:r,beta:i}}else if(t==="Clip"){let[r,i]=e?.activation_params||[rc,ic];return{activation:t,clipMax:i,clipMin:r}}else if(t==="LeakyRelu"){let[r]=e?.activation_params||[0.01];return{activation:t,alpha:r}}return{activation:t}}}),_a=U(()=>{Oe=(e,t)=>{switch(e){case 1:return t;case 2:return`vec2<${t}>`;case 3:return`vec3<${t}>`;case 4:return`vec4<${t}>`;default:throw Error(`${e}-component is not supported.`)}},Oh=(e)=>`
      ${e?"value = value + getBiasByOutputCoords(coords);":""}
      `}),xy=U(()=>{Rh=(e)=>`
fn getIndexFromCoords4D(coords : vec4<i32>, shape : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
      shape.y * shape.z * shape.w, shape.z * shape.w, shape.w, 1));
}
fn getOutputIndexFromCoords(coords : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
    i32(${e}.x), i32(${e}.y), i32(${e}.z), 1));
}
`}),va=U(()=>{ee(),ie(),ne(),Lt(),wr=(e,t,r,i,n)=>{let a=i-r;return`
      ${Array.from({length:r}).map((s,u)=>`
      if (${Z(t.shape,u,t.rank)} != 1) {
        ${t.indicesSet(e,u,Z(n,u+a,i))}
      } else {
        ${t.indicesSet(e,u,0)}
      }`).join("")}
`},wa=(e,t,r,i,n=!1,a)=>{let s=e[0].dims,u=e[1].dims,l=s[s.length-2],p=u[u.length-1],h=s[s.length-1],c=ke(p),g=ke(h),b=ke(l),y=M.size(r)/c/b,w=e.length>2,k=i?i.slice(0,-2):r.slice(0,-2),S=[M.size(k),l,p],_=[{type:12,data:y},{type:12,data:l},{type:12,data:p},{type:12,data:h}];Nt(t,_),_.push(...X(k,s,u)),w&&_.push(...X(e[2].dims)),_.push(...X(S));let I=(T)=>{let C=fa("batch_dims",e[0].dataType,k.length),A=B("a",e[0].dataType,s.length,g),O=B("b",e[1].dataType,u.length,c),v=j("output",e[0].dataType,S.length,c),N=Ae(v.type.tensor),q=Dt(t,v.type.value,N),F=[A,O],W="";if(w){let z=n?c:1;F.push(B("bias",e[2].dataType,e[2].dims.length,z)),W=`${n?`value += bias[col / ${z}];`:`value += ${v.type.value}(bias[row + i]);`}`}let G=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"}];Pt(t,G);let ae=()=>{let z=`var a_data: ${A.type.value};`;for(let L=0;L<g;L++)z+=`
              let b_data${L} = b[(b_offset + (k + ${L}) * uniforms.N + col) / ${c}];`;for(let L=0;L<b;L++){z+=`a_data = a[(a_offset + (row + ${L}) * uniforms.K + k) / ${g}];`;for(let te=0;te<g;te++)z+=`
            values[${L}] = fma(${O.type.value}(a_data${g===1?"":`[${te}]`}), b_data${te}, values[${L}]);
`}return z};return`
  ${T.registerUniforms(G).registerInternalVariables(C).declareVariables(...F,v)}
  ${T.mainStart()}
    ${T.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let col = (global_idx % (uniforms.N / ${c})) * ${c};
    var index1 = global_idx / (uniforms.N / ${c});
    let stride1 = uniforms.M / ${b};
    let row = (index1 % stride1) * ${b};
    let batch = index1 / stride1;

    ${r.length===2?"":`let batch_indices = ${C.offsetToIndices("batch")};`}

    var a_indices: ${A.type.indices};
    ${wr("a_indices",A,A.rank-2,C.rank,"batch_indices")}
    ${A.indicesSet("a_indices",A.rank-2,0)}
    ${A.indicesSet("a_indices",A.rank-1,0)}
    let a_offset = ${A.indicesToOffset("a_indices")};

    var b_indices: ${O.type.indices};
    ${wr("b_indices",O,O.rank-2,C.rank,"batch_indices")}
    ${O.indicesSet("b_indices",O.rank-2,0)}
    ${O.indicesSet("b_indices",O.rank-1,0)}
    let b_offset = ${O.indicesToOffset("b_indices")};
    var values: array<${v.type.value}, ${b}>;
    for (var k: u32 = 0u; k < uniforms.K; k = k + ${g}) {
      ${ae()}
    }
    for (var i = 0u; i < ${b}u; i++) {
      var value = values[i];
      ${W}
      ${q}
      let cur_indices = ${v.type.indices}(batch, row + i, col);
      let offset = ${v.indicesToOffset("cur_indices")};
      ${v.setByOffset(`offset / ${c}`,"value")};
    }
  }
  `};return{name:"MatMulNaive",shaderCache:{hint:`${t.activation};${c};${g};${b};${n}`,inputDependencies:w?["rank","rank","rank"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:a?a(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(y/64)},programUniforms:_}),getShaderSource:I}}}),$a=U(()=>{ee(),ie(),ne(),Lt(),va(),_a(),pl=(e,t)=>e?`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          kStart + inputRow,
          globalRowStart / innerElementSize + inputCol${t?", batchIndices":""});
        `:`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          globalRow + innerRow,
          kStart / innerElementSize + inputCol${t?", batchIndices":""});
        `,cl=(e,t)=>e?`
        let ACached0 = mm_Asub[k * innerElementSize][localRow];
        let ACached1 = mm_Asub[k * innerElementSize + 1][localRow];
        let ACached2 = mm_Asub[k * innerElementSize + 2][localRow];
        ${t===3?"":"let ACached3 = mm_Asub[k * innerElementSize + 3][localRow];"}
        for (var i = 0; i < rowPerThread; i = i + 1) {
          acc[i] = BCached0 * ACached0[i] + acc[i];
          acc[i] = BCached1 * ACached1[i] + acc[i];
          acc[i] = BCached2 * ACached2[i] + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached3[i] + acc[i];"}
        }`:`
        for (var i = 0; i < rowPerThread; i = i + 1) {
          let ACached = mm_Asub[tileRow + i][k];
          acc[i] = BCached0 * ACached.x + acc[i];
          acc[i] = BCached1 * ACached.y + acc[i];
          acc[i] = BCached2 * ACached.z + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached.w + acc[i];"}
        }`,Kn=(e,t,r="f32",i,n=!1,a=32,s=!1,u=32)=>{let l=t[1]*e[1],p=t[0]*e[0],h=n?l:a,c=n?a:l,g=h/t[0],b=a/t[1];if(!((n&&g===4&&e[1]===4||!n&&(g===3||g===4))&&h%t[0]===0&&a%t[1]===0&&e[0]===4))throw Error(`If transposeA ${n} is true, innerElementSize ${g} and workPerThread[1] ${e[1]} must be 4.
      Otherwise, innerElementSize ${g} must be 3 or 4.
  tileAWidth ${h} must be divisible by workgroupSize[0]${t[0]}. tileInner ${a} must be divisible by workgroupSize[1] ${t[1]}. colPerThread ${e[0]} must be 4.`);return`
var<workgroup> mm_Asub: array<array<vec${g}<${r}>, ${h/g}>, ${c}>;
var<workgroup> mm_Bsub: array<array<vec4<${r}>, ${p/e[0]}>, ${a}>;

const rowPerThread = ${e[1]};
const colPerThread = ${e[0]};
const innerElementSize = ${g};
const tileInner = ${a};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
  let localRow = i32(localId.y);
  let tileRow = localRow * rowPerThread;
  let tileCol = i32(localId.x);

  let globalRow =i32(globalId.y) * rowPerThread;
  let globalCol = i32(globalId.x);
  let batch = ${s?"0":"i32(globalId.z)"};
  ${i?`let batchIndices = ${i.offsetToIndices("u32(batch)")};`:""}
  let globalRowStart = i32(workgroupId.y) * ${l};

  let num_tiles = ${s?`${Math.ceil(u/a)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
  var kStart = ${s?`i32(globalId.z) * ${u}`:"0"};

  var acc: array<vec4<${r}>, rowPerThread>;

  // Loop over shared dimension.
  let tileRowB = localRow * ${b};
  for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let inputRow = tileRow + innerRow;
          let inputCol = tileCol;
          ${pl(n,i)}
      }

      // Load one tile of B into local memory.
      for (var innerRow = 0; innerRow < ${b}; innerRow = innerRow + 1) {
          let inputRow = tileRowB + innerRow;
          let inputCol = tileCol;
          mm_Bsub[inputRow][inputCol] = mm_readB(batch, kStart + inputRow, globalCol${i?", batchIndices":""});
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      for (var k = 0; k < tileInner / innerElementSize; k = k + 1) {
          let BCached0 = mm_Bsub[k * innerElementSize][tileCol];
          let BCached1 = mm_Bsub[k * innerElementSize + 1][tileCol];
          let BCached2 = mm_Bsub[k * innerElementSize + 2][tileCol];
          ${g===3?"":"let BCached3 = mm_Bsub[k * innerElementSize + 3][tileCol];"}

          ${cl(n,g)}
      }

      workgroupBarrier();
  }

  for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      mm_write(batch, globalRow + innerRow, globalCol, acc[innerRow]);
  }
}`},on=(e,t)=>e?`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              kStart + inputRow,
              globalRowStart + inputCol${t?", batchIndices":""});
            `:`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              globalRowStart + inputRow,
              kStart + inputCol${t?", batchIndices":""});
            `,hl=(e)=>e?"let ACached = mm_Asub[k][tileRow + innerRow];":"let ACached = mm_Asub[tileRow + innerRow][k];",Zn=(e,t,r="f32",i,n=!1,a=32,s=!1,u=32,l=!1)=>{let p=e[1]*t[1],h=e[0]*t[0],c=n?p:a,g=n?a:p;if(!(g%t[1]===0&&c%t[0]===0&&a%t[1]===0))throw Error(`tileAHight ${g} must be divisible by workgroupSize[1]${t[1]}, tileAWidth ${c} must be divisible by workgroupSize[0]${t[0]}, tileInner ${a} must be divisible by workgroupSize[1]${t[1]}`);let b=g/t[1],y=c/t[0],w=a/t[1],k=l?`
    let localRow = i32(localId.y);
    let localCol = i32(localId.x);
    let globalRowStart = i32(workgroupId.y) * ${p};
    let globalColStart = i32(workgroupId.x) * ${h};

    // Loop over shared dimension.
    for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var inputRow = localRow; inputRow < ${g}; inputRow = inputRow + ${t[1]}) {
        for (var inputCol = localCol; inputCol < ${c}; inputCol = inputCol + ${t[0]}) {
          ${on(n,i)}
        }
      }
      // Load one tile of B into local memory.
      for (var inputRow = localRow; inputRow < ${a}; inputRow = inputRow + ${t[1]}) {
            for (var inputCol = localCol; inputCol < ${h}; inputCol = inputCol + ${t[0]}) {
          mm_Bsub[inputRow][inputCol] = mm_readB(batch,
            kStart + inputRow,
            globalColStart + inputCol${i?", batchIndices":""});
        }
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      var BCached : array<${r}, colPerThread>;
      for (var k = 0; k < tileInner; k = k + 1) {
        for (var inner = 0; inner < colPerThread; inner = inner + 1) {
          BCached[inner] = mm_Bsub[k][localCol + inner * ${t[0]}];
        }
        for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let ACached = ${n?`mm_Asub[k][localRow + innerRow * ${t[1]}];`:`mm_Asub[localRow + innerRow * ${t[1]}][k];`}
          for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
            acc[innerRow][innerCol] = acc[innerRow][innerCol] +
                ACached * BCached[innerCol];
          }
        }
      }
      workgroupBarrier();
    }
    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      let gRow = globalRowStart + localRow + innerRow * ${t[1]};
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        let gCol = globalColStart + localCol + innerCol * ${t[0]};
        mm_write(batch, gRow, gCol, acc[innerRow][innerCol]);
      }
    }
    `:`
let tileRow = i32(localId.y) * rowPerThread;
let tileCol = i32(localId.x) * colPerThread;

let globalRow = i32(globalId.y) * rowPerThread;
let globalCol = i32(globalId.x) * colPerThread;
let globalRowStart = i32(workgroupId.y) * ${p};

let tileRowA = i32(localId.y) * ${b};
let tileColA = i32(localId.x) * ${y};
let tileRowB = i32(localId.y) * ${w};
// Loop over shared dimension.
for (var t = 0; t < num_tiles; t = t + 1) {
  // Load one tile of A into local memory.
  for (var innerRow = 0; innerRow < ${b}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < ${y}; innerCol = innerCol + 1) {
      let inputRow = tileRowA + innerRow;
      let inputCol = tileColA + innerCol;
      ${on(n,i)}
    }
  }

  // Load one tile of B into local memory.
  for (var innerRow = 0; innerRow < ${w}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
      let inputRow = tileRowB + innerRow;
      let inputCol = tileCol + innerCol;
      mm_Bsub[inputRow][inputCol] = mm_readB(batch,
        kStart + inputRow,
        globalCol + innerCol${i?", batchIndices":""});
    }
  }
  kStart = kStart + tileInner;
  workgroupBarrier();

  // Compute acc values for a single thread.
  var BCached : array<${r}, colPerThread>;
  for (var k = 0; k < tileInner; k = k + 1) {
    for (var inner = 0; inner < colPerThread; inner = inner + 1) {
      BCached[inner] = mm_Bsub[k][tileCol + inner];
    }

    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      ${hl(n)}
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        acc[innerRow][innerCol] = acc[innerRow][innerCol] + ACached * BCached[innerCol];
      }
    }
  }

  workgroupBarrier();
}

for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
  for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
    mm_write(batch, globalRow + innerRow, globalCol + innerCol,
        acc[innerRow][innerCol]);
  }
}
`;return`
  var<workgroup> mm_Asub : array<array<${r}, ${c}>, ${g}>;
  var<workgroup> mm_Bsub : array<array<${r}, ${h}>, ${a}>;
  const rowPerThread = ${e[1]};
  const colPerThread = ${e[0]};
  const tileInner = ${a};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
    let batch = ${s?"0":"i32(globalId.z)"};
    ${i?`let batchIndices = ${i.offsetToIndices("u32(batch)")};`:""}
    let num_tiles = ${s?`${Math.ceil(u/a)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
    var kStart = ${s?`i32(globalId.z) * ${u}`:"0"};

    var acc : array<array<${r}, colPerThread>, rowPerThread>;
    ${k}
  }
`},fl=(e,t,r,i,n=!1)=>{let[a,s,u,l]=i,p=Ae(i[0].type.tensor);return`
    fn mm_readA(batch: i32, row: i32, colIn: i32, batchIndices: ${a.type.indices}) -> ${Oe(e,p)} {
      var value = ${Oe(e,p)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_a_outer && col < uniforms.dim_inner)
      {
        var aIndices: ${s.type.indices};
        ${wr("aIndices",s,s.rank-2,a.rank,"batchIndices")}
        ${s.indicesSet("aIndices",s.rank-2,"u32(row)")}
        ${s.indicesSet("aIndices",s.rank-1,"u32(colIn)")}
        value = ${s.getByIndices("aIndices")};
      }
      return value;
    }

    fn mm_readB(batch: i32, row: i32, colIn: i32, batchIndices: ${a.type.indices}) -> ${Oe(e,p)} {
      var value = ${Oe(e,p)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_inner && col < uniforms.dim_b_outer)
      {
        var bIndices: ${u.type.indices};
        ${wr("bIndices",u,u.rank-2,a.rank,"batchIndices")}
        ${u.indicesSet("bIndices",u.rank-2,"u32(row)")}
        ${u.indicesSet("bIndices",u.rank-1,"u32(colIn)")}
        value = ${u.getByIndices("bIndices")};
      }
      return value;
    }

    fn mm_write(batch: i32, row: i32, colIn: i32, valueIn: ${Oe(e,p)}) {
      let col = colIn * ${e};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer) {
        var value = valueIn;
        let coords = vec3<i32>(batch, row, colIn);
        ${t?`value = value + ${n?"bias[colIn]":`${Oe(e,p)}(bias[row])`};`:""}
        ${r}
        ${l.setByIndices("vec3<u32>(coords)","value")}
      }
    }
    `},oi=(e,t,r,i,n=!1,a)=>{let s=e[0].dims,u=e[1].dims,l=s.slice(0,-2),p=u.slice(0,-2),h=i?i.slice(0,-2):r.slice(0,-2),c=M.size(h),g=s[s.length-2],b=s[s.length-1],y=u[u.length-1],w=b%4===0&&y%4===0,k=g<=8?[4,1,1]:[4,4,1],S=[8,8,1],_=[Math.ceil(y/S[0]/k[0]),Math.ceil(g/S[1]/k[1]),Math.ceil(c/S[2]/k[2])],I=w?4:1,T=[...l,g,b/I],C=T.length,A=[...p,b,y/I],O=A.length,v=[c,g,y/I],N=[{type:6,data:g},{type:6,data:y},{type:6,data:b}];Nt(t,N),N.push(...X(h,T,A));let q=["rank","rank"],F=e.length>2;F&&(N.push(...X(e[2].dims)),q.push("rank")),N.push(...X(v));let W=(G)=>{let ae=h.length,z=fa("batchDims",e[0].dataType,ae,1),L=Ae(e[0].dataType),te=B("a",e[0].dataType,C,I),re=B("b",e[1].dataType,O,I),Q=j("result",e[0].dataType,v.length,I),se=[te,re];if(F){let ve=n?I:1;se.push(B("bias",e[2].dataType,e[2].dims.length,ve))}let P=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"}];Pt(t,P);let J=Ae(Q.type.tensor),Y=Dt(t,Q.type.value,J),K=fl(I,F,Y,[z,te,re,Q],n);return`
  ${G.registerUniforms(P).registerInternalVariables(z).declareVariables(...se,Q)}
  ${K}
  ${w?Kn(k,S,L,z):Zn(k,S,L,z)}
                   `};return{name:"MatMul",shaderCache:{hint:`${k};${t.activation};${w};${n}`,inputDependencies:q},getRunData:()=>({outputs:[{dims:a?a(r):r,dataType:e[0].dataType}],dispatchGroup:{x:_[0],y:_[1],z:_[2]},programUniforms:N}),getShaderSource:W}}}),Sy=U(()=>{ee(),ot(),ne(),Lt(),_a(),xy(),$a(),ml=(e,t,r,i,n=!1,a,s=4,u=4,l=4,p="f32")=>{let h=(N)=>{switch(N){case 1:return"resData = x[xIndex];";case 3:return`resData = vec3<${p}>(x[xIndex], x[xIndex + 1], x[xIndex + 2]);`;case 4:return"resData = x[xIndex / 4];";default:throw Error(`innerElementSize ${N} is not supported.`)}},c=(N)=>{switch(N){case 1:return"return w[row * i32(uniforms.w_shape[3]) + colIn];";case 4:return"return w[row * i32(uniforms.w_shape[3]) / 4 + colIn];";default:throw Error(`innerElementSize ${N} is not supported.`)}},g=e?`
    let coord = vec4<i32>(batch, xRow, xCol, xCh);
    `:`
    let coord = vec4<i32>(batch, xCh, xRow, xCol);
    `,b=e?`
    let coords = vec4<i32>(
      batch,
      row / outWidth,
      row % outWidth,
      col);
    `:`
    let coords = vec4<i32>(
      batch,
      row,
      col / outWidth,
      col % outWidth);
    `,y=e?"i32(uniforms.x_shape[1])":"i32(uniforms.x_shape[2])",w=e?"i32(uniforms.x_shape[2])":"i32(uniforms.x_shape[3])",k=e?"row":"col",S=e?"col":"row",_=`
    let inChannels = i32(uniforms.w_shape[2]);
    let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
    let outRow = ${k} / outWidth;
    let outCol = ${k} % outWidth;

    let WRow = ${S} / (i32(uniforms.w_shape[1]) * inChannels);
    let WCol = ${S} / inChannels % i32(uniforms.w_shape[1]);
    let xRow = outRow * uniforms.stride[0] + uniforms.dilation[0] * WRow - uniforms.pad[0];
    let xCol = outCol * uniforms.stride[1] + uniforms.dilation[1] * WCol - uniforms.pad[1];
    let xCh = ${S} % inChannels;
    var resData = ${Oe(s,p)}(0.0);
    // The bounds checking is always needed since we use it to pad zero for
    // the 'same' padding type.
    if (xRow >= 0 && xRow < ${y} && xCol >= 0 && xCol < ${w}) {
      ${g}
      let xIndex = getIndexFromCoords4D(coord, vec4<i32>(uniforms.x_shape));
      ${h(s)}
    }
    return resData;`,I=e?t&&i?`
    let col = colIn * ${s};
    ${_}`:`
    let col = colIn * ${s};
    if (row < uniforms.dim_a_outer && col < uniforms.dim_inner) {
      ${_}
    }
    return ${Oe(s,p)}(0.0);`:i&&r?`
    let col = colIn * ${s};
    ${_}`:`
    let col = colIn * ${s};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${_}
    }
    return ${Oe(s,p)}(0.0);`,T=e?i&&r?c(u):`
    let col = colIn * ${u};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${c(u)}
    }
    return ${Oe(u,p)}(0.0);`:`
    let col = colIn * ${u};
    if (row < uniforms.dim_inner && col < uniforms.dim_a_outer) {
      ${c(u)}
    }
    return ${Oe(u,p)}(0.0);`,C=Oe(l,p),A=e?Oe(s,p):Oe(u,p),O=e?Oe(u,p):Oe(s,p),v=Dt(a,C,p);return`
    fn mm_readA(batch: i32, row : i32, colIn : i32) -> ${A} {
      ${e?I:T}
    }

    fn mm_readB(batch: i32, row : i32, colIn : i32) -> ${O} {
      ${e?T:I}
    }

    fn mm_write(batch: i32, row : i32, colIn : i32, valueIn : ${C}) {
      let col = colIn * ${l};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer)
      {
      var value = valueIn;
      let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
      ${b}
      ${Oh(n)}
      ${v}
      setOutputAtCoords(coords[0], coords[1], coords[2], coords[3], value);
      }
    }`},Mh=(e,t,r,i,n,a,s,u,l)=>{let p=t.format==="NHWC",h=p?e[0].dims[3]:e[0].dims[1],c=r[0],g=p?r[2]:r[3],b=p?r[1]:r[2],y=p?r[3]:r[1],w=p&&(h%4===0||h%3===0)&&y%4===0,k=p?y:g*b,S=p?g*b:y,_=[8,8,1],I=i<=8?[4,1,1]:[4,4,1],T=[Math.ceil(k/_[0]/I[0]),Math.ceil(S/_[1]/I[1]),Math.ceil(c/_[2]/I[2])];pe("verbose",()=>`[conv2d_mm_webgpu] dispatch = ${T}`);let C=w?p&&h%4!==0?3:4:1,A=_[1]*I[1],O=_[0]*I[0],v=Math.max(_[0]*C,_[1]),N=i%A===0,q=n%O===0,F=a%v===0,W=w?[C,4,4]:[1,1,1],G=[{type:6,data:i},{type:6,data:n},{type:6,data:a},{type:6,data:[t.pads[0],t.pads[1]]},{type:6,data:t.strides},{type:6,data:t.dilations}];Nt(t,G),G.push(...X(e[0].dims,e[1].dims));let ae=["rank","rank"];s&&(G.push(...X(e[2].dims)),ae.push("rank")),G.push(...X(r));let z=(L)=>{let te=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"},{name:"pad",type:"i32",length:2},{name:"stride",type:"i32",length:2},{name:"dilation",type:"i32",length:2}];Pt(t,te);let re=w?4:1,Q=Ae(e[0].dataType),se=`
      fn setOutputAtIndex(flatIndex : i32, value : ${w?`vec4<${Q}>`:Q}) {
        result[flatIndex] = ${w?`vec4<${Q}>`:Q}(value);
      }
      fn setOutputAtCoords(d0 : i32, d1 : i32, d2 : i32, d3 : i32, value : ${w?`vec4<${Q}>`:Q}) {
        let flatIndex = getOutputIndexFromCoords(vec4<i32>(d0, d1, d2, d3));
        setOutputAtIndex(flatIndex ${w?"/ 4":""}, value);
      }`,P=B("x",e[0].dataType,e[0].dims.length,C===3?1:C),J=B("w",e[1].dataType,e[1].dims.length,re),Y=[P,J],K=j("result",e[0].dataType,r.length,re);if(s){let ve=B("bias",e[2].dataType,e[2].dims.length,re);Y.push(ve),se+=`
        fn getBiasByOutputCoords(coords : vec4<i32>) -> ${w?`vec4<${Q}>`:Q} {
          return bias[coords.${p?"w":"y"}${w?"/ 4":""}];
        }`}return`
        ${Rh("uniforms.result_strides")}
        //struct Uniforms { xShape : vec4<i32>, wShape : vec4<i32>, outShape : vec4<i32>,
        //  outShapeStrides: vec3<i32>, filterDims : vec2<i32>, pad : vec2<i32>, stride : vec2<i32>,
        //  dilation : vec2<i32>, dimAOuter : i32, dimBOuter : i32, dimInner : i32 };
        ${L.registerUniforms(te).declareVariables(...Y,K)}
        ${se}
        ${ml(p,N,q,F,s,t,W[0],W[1],W[2],Q)}
        ${w?Kn(I,_,Q,void 0,!p,v):Zn(I,_,Q,void 0,!p,v,!1,void 0,u)}`};return{name:"Conv2DMatMul",shaderCache:{hint:`${t.cacheKey};${C};${w};${N};${q};${F};${A};${O};${v}`,inputDependencies:ae},getRunData:()=>({outputs:[{dims:l?l(r):r,dataType:e[0].dataType}],dispatchGroup:{x:T[0],y:T[1],z:T[2]},programUniforms:G}),getShaderSource:z}}}),ky=U(()=>{ee(),ot(),ie(),ne(),Lt(),_a(),gl=(e)=>{let t=1;for(let r=0;r<e.length;r++)t*=e[r];return t},un=(e)=>typeof e=="number"?[e,e,e]:e,dr=(e,t)=>t<=1?e:e+(e-1)*(t-1),yl=(e,t,r,i=1)=>{let n=dr(t,i);return Math.floor((e[0]*(r-1)-r+n)/2)},ln=(e,t,r,i,n)=>{n==null&&(n=yl(e,t[0],i[0]));let a=[0,0,0,r];for(let s=0;s<3;s++)e[s]+2*n>=t[s]&&(a[s]=Math.trunc((e[s]-t[s]+2*n)/i[s]+1));return a},bl=(e,t,r,i,n,a,s,u,l,p)=>{let h,c,g,b;if(e==="VALID"&&(e=0),typeof e=="number"){h={top:e,bottom:e,left:e,right:e,front:e,back:e};let y=ln([t,r,i,1],[u,l,p],1,[n,a,s],e);c=y[0],g=y[1],b=y[2]}else if(Array.isArray(e)){if(!e.every((w,k,S)=>w===S[0]))throw Error(`Unsupported padding parameter: ${e}`);h={top:e[0],bottom:e[1],left:e[2],right:e[3],front:e[4],back:e[5]};let y=ln([t,r,i,1],[u,l,p],1,[n,a,s],e[0]);c=y[0],g=y[1],b=y[2]}else if(e==="SAME_UPPER"){c=Math.ceil(t/n),g=Math.ceil(r/a),b=Math.ceil(i/s);let y=(c-1)*n+u-t,w=(g-1)*a+l-r,k=(b-1)*s+p-i,S=Math.floor(y/2),_=y-S,I=Math.floor(w/2),T=w-I,C=Math.floor(k/2),A=k-C;h={top:I,bottom:T,left:C,right:A,front:S,back:_}}else throw Error(`Unknown padding parameter: ${e}`);return{padInfo:h,outDepth:c,outHeight:g,outWidth:b}},Bh=(e,t,r,i,n,a=!1,s="channelsLast")=>{let u,l,p,h,c;if(s==="channelsLast")[u,l,p,h,c]=e;else if(s==="channelsFirst")[u,c,l,p,h]=e;else throw Error(`Unknown dataFormat ${s}`);let[g,,b,y,w]=t,[k,S,_]=un(r),[I,T,C]=un(i),A=dr(b,I),O=dr(y,T),v=dr(w,C),{padInfo:N,outDepth:q,outHeight:F,outWidth:W}=bl(n,l,p,h,k,S,_,A,O,v),G=a?g*c:g,ae=[0,0,0,0,0];return s==="channelsFirst"?ae=[u,G,q,F,W]:s==="channelsLast"&&(ae=[u,q,F,W,G]),{batchSize:u,dataFormat:s,inDepth:l,inHeight:p,inWidth:h,inChannels:c,outDepth:q,outHeight:F,outWidth:W,outChannels:G,padInfo:N,strideDepth:k,strideHeight:S,strideWidth:_,filterDepth:b,filterHeight:y,filterWidth:w,effectiveFilterDepth:A,effectiveFilterHeight:O,effectiveFilterWidth:v,dilationDepth:I,dilationHeight:T,dilationWidth:C,inShape:e,outShape:ae,filterShape:t}},Dh=(e,t,r,i,n,a)=>{let s=a==="channelsLast",u=s?e[0].dims[3]:e[0].dims[1],l=!1,p=[64,1,1],h={x:r.map((_,I)=>I)},c=[Math.ceil(gl(h.x.map((_)=>r[_]))/p[0]),1,1];pe("verbose",()=>`[conv3d_naive_webgpu] dispatch = ${c}`);let g=l?s&&u%4!==0?3:4:1,b=M.size(r),y=[{type:12,data:b},{type:12,data:i},{type:12,data:n},{type:12,data:t.strides},{type:12,data:t.dilations}];Nt(t,y),y.push(...X(e[0].dims,e[1].dims));let w=["rank","rank"],k=e.length===3;k&&(y.push(...X(e[2].dims)),w.push("rank")),y.push(...X(r));let S=(_)=>{let I=[{name:"output_size",type:"u32"},{name:"filter_dims",type:"u32",length:i.length},{name:"pads",type:"u32",length:n.length},{name:"strides",type:"u32",length:t.strides.length},{name:"dilations",type:"u32",length:t.dilations.length}];Pt(t,I);let T=l?4:1,C=Ae(e[0].dataType),A=B("x",e[0].dataType,e[0].dims.length,g===3?1:g),O=B("W",e[1].dataType,e[1].dims.length,T),v=[A,O],N=j("result",e[0].dataType,r.length,T),q="";if(k){let G=B("bias",e[2].dataType,e[2].dims.length,T);v.push(G),q+=`
        fn getBiasByOutputCoords(coords : array<u32, 5>) -> ${l?`vec4<${C}>`:C} {
          return bias[${s?Z("coords",4,5):Z("coords",1,5)}${l?"/ 4":""}];
        }`}let F=Oe(g,C),W=Dt(t,F,C);return`
            ${q}
            fn getX(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> f32 {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${A.getByIndices("aIndices")};
            }
            fn getW(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> f32 {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${O.getByIndices("aIndices")};
            }
          ${_.registerUniforms(I).declareVariables(...v,N)}
          ${_.mainStart()}
          ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
              let coords = ${N.offsetToIndices("global_idx")};
              let batch = ${Z("coords",0,A.rank)};
              let d2 = ${s?Z("coords",A.rank-1,A.rank):Z("coords",1,A.rank)};
              let xFRCCorner = vec3<u32>(${s?Z("coords",1,A.rank):Z("coords",2,A.rank)},
              ${s?Z("coords",2,A.rank):Z("coords",3,A.rank)},
              ${s?Z("coords",3,A.rank):Z("coords",4,A.rank)}) * uniforms.strides - uniforms.pads;
              let xFCorner = xFRCCorner.x;
              let xRCorner = xFRCCorner.y;
              let xCCorner = xFRCCorner.z;
              let xShapeY = ${s?Z("uniforms.x_shape",1,A.rank):Z("uniforms.x_shape",2,A.rank)};
              let xShapeZ = ${s?Z("uniforms.x_shape",2,A.rank):Z("uniforms.x_shape",3,A.rank)};
              let xShapeW = ${s?Z("uniforms.x_shape",3,A.rank):Z("uniforms.x_shape",4,A.rank)};
              let xShapeU = ${s?Z("uniforms.x_shape",4,A.rank):Z("uniforms.x_shape",1,A.rank)};
              let inputDepthNearestVec4 = (xShapeU / 4) * 4;
              let inputDepthVec4Remainder = xShapeU % 4;

              var value = 0.0;
              for (var wF = 0u; wF < uniforms.filter_dims[0]; wF++) {
                let xF = xFCorner + wF * uniforms.dilations[0];
                if (xF < 0 || xF >= xShapeY) {
                  continue;
                }

                for (var wR = 0u; wR < uniforms.filter_dims[1]; wR++) {
                  let xR = xRCorner + wR * uniforms.dilations[1];
                  if (xR < 0 || xR >= xShapeZ) {
                    continue;
                  }

                  for (var wC = 0u; wC < uniforms.filter_dims[2]; wC++) {
                    let xC = xCCorner + wC * uniforms.dilations[2];
                    if (xC < 0 || xC >= xShapeW) {
                      continue;
                    }

                    for (var d1 = 0u; d1 < inputDepthNearestVec4; d1 += 4) {
                      ${s?`let xValues = vec4<f32>(
                               getX(batch, xF, xR, xC, d1),
                               getX(batch, xF, xR, xC, d1 + 1),
                               getX(batch, xF, xR, xC, d1 + 2),
                               getX(batch, xF, xR, xC, d1 + 3));
                            `:`let xValues = vec4<f32>(
                               getX(batch, d1, xF, xR, xC),
                               getX(batch, d1 + 1, xF, xR, xC),
                               getX(batch, d1 + 2, xF, xR, xC),
                               getX(batch, d1 + 3, xF, xR, xC));
                            `}
                            let wValues = vec4<f32>(
                              getW(d2, d1, wF, wR, wC),
                              getW(d2, d1 + 1, wF, wR, wC),
                              getW(d2, d1 + 2, wF, wR, wC),
                              getW(d2, d1 + 3, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                    if (inputDepthVec4Remainder == 1) {
                        ${s?`value += getX(batch, xF, xR, xC, inputDepthNearestVec4)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`:`value += getX(batch, inputDepthNearestVec4, xF, xR, xC)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`}
                    } else if (inputDepthVec4Remainder == 2) {
                      ${s?`let xValues = vec2<f32>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1));
                      `:`let xValues = vec2<f32>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC));
                    `}
                    let wValues = vec2<f32>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC));
                      value += dot(xValues, wValues);
                    } else if (inputDepthVec4Remainder == 3) {
                      ${s?`let xValues = vec3<f32>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 2));
                      `:`let xValues = vec3<f32>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 2, xF, xR, xC));
                    `}
                    let wValues = vec3<f32>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 2, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                  }
                }
              }
              ${k?"value = value + getBiasByOutputCoords(coords)":""};
              ${W}
              result[global_idx] = f32(value);
          }`};return{name:"Conv3DNaive",shaderCache:{hint:`${t.cacheKey};${s};${g};${k}`,inputDependencies:w},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:c[0],y:c[1],z:c[2]},programUniforms:y}),getShaderSource:S}}}),Ty=U(()=>{ee(),ie(),ne(),Lt(),Nh=(e,t,r,i)=>{let n=e.length>2,a=n?"value += b[output_channel];":"",s=e[0].dims,u=e[1].dims,l=t.format==="NHWC",p=l?r[3]:r[1],h=p/t.group,c=l&&h>=4?ke(p):1,g=M.size(r)/c,b=[{type:12,data:g},{type:12,data:t.dilations},{type:12,data:[t.strides[0],t.strides[1]]},{type:12,data:[t.pads[0],t.pads[1]]},{type:12,data:h}];Nt(t,b),b.push(...X(s,[u[0],u[1],u[2],u[3]/c]));let y=n?["rank","rank","rank"]:["rank","rank"];b.push(...X([r[0],r[1],r[2],r[3]/c]));let w=(k)=>{let S=j("output",e[0].dataType,r.length,c),_=Ae(S.type.tensor),I=Dt(t,S.type.value,_),T=B("x",e[0].dataType,s.length),C=B("w",e[1].dataType,u.length,c),A=[T,C];n&&A.push(B("b",e[2].dataType,e[2].dims,c));let O=[{name:"output_size",type:"u32"},{name:"dilations",type:"u32",length:t.dilations.length},{name:"strides",type:"u32",length:2},{name:"pads",type:"u32",length:2},{name:"output_channels_per_group",type:"u32"}];Pt(t,O);let v=l?`
      for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[0]; wHeight++) {
        let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

        if (xHeight < 0u || xHeight >= uniforms.x_shape[1]) {
          continue;
        }

        for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[1]; wWidth++) {
          let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
          if (xWidth < 0u || xWidth >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[2]; wInChannel++) {
            let input_channel = in_channel_offset + wInChannel;
            let xVal = ${T.get("batch","xHeight","xWidth","input_channel")};
            let wVal = ${C.get("wHeight","wWidth","wInChannel","output_channel")};
            value += xVal * wVal;
          }
        }
      }
      `:`
      for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[1]; wInChannel++) {
        let input_channel = in_channel_offset + wInChannel;
        for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[2]; wHeight++) {
          let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

          if (xHeight < 0u || xHeight >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[3]; wWidth++) {
            let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
            if (xWidth < 0u || xWidth >= uniforms.x_shape[3]) {
              continue;
            }

            let xVal = ${T.get("batch","input_channel","xHeight","xWidth")};
            let wVal = ${C.get("output_channel","wInChannel","wHeight","wWidth")};
            value += xVal * wVal;
          }
        }
      }
      `;return`
  ${k.registerUniforms(O).declareVariables(...A,S)}

  ${k.mainStart()}
    ${k.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let outputIndices = ${S.offsetToIndices("global_idx")};
    let batch: u32 = outputIndices[0];
    let output_channel: u32 = outputIndices[${l?3:1}];
    let xRCCorner: vec2<u32> = vec2<u32>(outputIndices[${l?1:2}], outputIndices[${l?2:3}]) * uniforms.strides - uniforms.pads;
    let group_id: u32 = output_channel * ${c} / uniforms.output_channels_per_group;
    var in_channel_offset = group_id * uniforms.w_shape[${l?2:1}];

    var value: ${S.type.value} = ${S.type.value}(0);
    ${v}
    ${a}
    ${I}
    ${S.setByOffset("global_idx","value")}
  }`};return{name:"GroupedConv",shaderCache:{hint:`${t.cacheKey}_${c}`,inputDependencies:y},getRunData:()=>({outputs:[{dims:i?i(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:b}),getShaderSource:w}},Ph=(e,t,r,i)=>{let n=e.length>2,a=ke(r[3]),s=ke(r[2]),u=M.size(r)/a/s,l=[e[0].dims[0],e[0].dims[1],e[0].dims[2],e[0].dims[3]/a],p=[e[1].dims[0],e[1].dims[1],e[1].dims[2],e[1].dims[3]/a],h=[r[0],r[1],r[2],r[3]/a],c=[{type:12,data:u},{type:6,data:[t.strides[0],t.strides[1]]},{type:6,data:[t.pads[0],t.pads[1]]}];Nt(t,c),c.push(...X(l,p,h));let g=(s-1)*t.strides[1]+p[1],b=(y)=>{let w=j("output",e[0].dataType,h.length,a),k=Ae(w.type.tensor),S=Dt(t,w.type.value,k),_=B("x",e[0].dataType,l.length,a),I=B("w",e[1].dataType,p.length,a),T=[_,I];n&&T.push(B("b",e[2].dataType,e[2].dims,a));let C=n?"value += b[output_channel];":"",A=[{name:"output_size",type:"u32"},{name:"strides",type:"i32",length:2},{name:"pads",type:"i32",length:2}];return Pt(t,A),`
  ${y.registerUniforms(A).declareVariables(...T,w)}
  ${y.mainStart()}
    ${y.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let width0 = uniforms.output_shape[3];
    let output_channel = global_idx % width0;
    var index1 = global_idx / width0;
    let width1 = uniforms.output_shape[2] / ${s}u;
    let col = (index1 % width1) * ${s}u;
    index1 = index1 / width1;
    let row = index1 % uniforms.output_shape[1];
    let batch = index1 / uniforms.output_shape[1];

    let x_corner = vec2<i32>(i32(row), i32(col)) * uniforms.strides - uniforms.pads;

    var x_vals: array<${_.type.value}, ${g}>;
    var values: array<${w.type.value}, ${s}>;
    let input_channel = output_channel;
    // Use constant instead of uniform can give better performance for w's height/width.
    for (var w_height: u32 = 0u; w_height < ${p[0]}; w_height++) {
      let x_height = x_corner.x + i32(w_height);
      if (x_height >= 0 && u32(x_height) < uniforms.x_shape[1]) {
        for (var i = 0; i < ${g}; i++) {
          let x_width = x_corner.y + i;
          if (x_width >= 0 && u32(x_width) < uniforms.x_shape[2]) {
            x_vals[i] = ${_.get("batch","u32(x_height)","u32(x_width)","input_channel")};
          } else {
            x_vals[i] = ${_.type.value}(0);
          }
        }
        for (var w_width: u32 = 0u; w_width < ${p[1]}; w_width++) {
          let w_val = ${I.get("w_height","w_width","0","output_channel")};
          for (var i = 0u; i < ${s}u; i++) {
            values[i] = fma(x_vals[i * u32(uniforms.strides[1]) + w_width], w_val, values[i]);
          }
        }
      }
    }

    for (var i = 0u; i < ${s}u; i++) {
      var value = values[i];
      ${C}
      ${S}
      ${w.set("batch","row","col + i","output_channel","value")};
    }
  }`};return{name:"GroupedConv-Vectorize",shaderCache:{hint:`${t.cacheKey};${a};${s};${g};${p[0]};${p[1]}`,inputDependencies:n?["rank","rank","type"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:i?i(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:c}),getShaderSource:b}}}),Ey=U(()=>{ie(),Sy(),ky(),$a(),Ty(),Lt(),va(),$t(),_l=(e,t,r,i,n,a)=>{let s=e[0],u=e.slice(a?1:2,a?3:4),l=u.length,p=t[0],h=t.slice(2).map((g,b)=>g+(g-1)*(r[b]-1)),c=u.map((g,b)=>g+i[b]+i[b+l]).map((g,b)=>Math.floor((g-h[b]+n[b])/n[b]));return c.splice(0,0,s),c.splice(a?3:1,0,p),c},Zr=[2,3,1,0],wl=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw Error("Conv requires 2 or 3 inputs");if(e[0].dims.length>5)throw Error("greater than 5D is not supported");if(e[0].dims.length!==e[1].dims.length)throw Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],i=e[1].dims[1]*t.group;if(r!==i)throw Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");if(e.length===3&&(e[2].dims.length!==1||e[1].dims[0]!==e[2].dims[0]))throw Error("invalid bias");let n=e[0].dims.length-2;if(t.dilations.length!==n)throw Error(`dilations should be ${n}D`);if(t.strides.length!==n)throw Error(`strides should be ${n}D`);if(t.pads.length!==n*2)throw Error(`pads should be ${n*2}D`);if(t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw Error("invalid kernel shape")},Yr=(e,t)=>{let r=e.kernelShape.slice();r.length<t[1].dims.length-2&&r.push(...Array(t[1].dims.length-2-r.length).fill(0));for(let a=2;a<t[1].dims.length;++a)r[a-2]===0&&(r[a-2]=t[1].dims[a]);let i=e.pads.slice();ai.adjustPadsBasedOnAutoPad(t[0].dims,e.strides,e.dilations,r,i,e.format==="NHWC",e.autoPad);let n=Object.assign({},e);return Object.assign(n,{kernelShape:r,pads:i}),n},Yn=(e)=>{let t=ba(e),r=e.format,i=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],n=e.dilations,a=e.group,s=e.kernel_shape,u=e.pads,l=e.strides,p=e.w_is_const();return{autoPad:i,format:r,dilations:n,group:a,kernelShape:s,pads:u,strides:l,wIsConst:p,...t,cacheKey:`${e.format};${t.activation};`}},dn=(e,t,r,i)=>{let n=r.format==="NHWC",a=_l(t[0].dims,t[1].dims,r.dilations,r.pads,r.strides,n);if(r.group!==1){let A=[t[0]];if(n){let O=e.kernelCustomData.wT??e.compute(Pe(t[1],Zr),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=O),A.push(O)}else A.push(t[1]);t.length===3&&A.push(t[2]),!e.adapterInfo.isArchitecture("ampere")&&n&&t[1].dims[0]===r.group&&t[1].dims[1]===1&&r.dilations[0]===1&&r.dilations[1]===1?e.compute(Ph(A,r,a,i),{inputs:A}):e.compute(Nh(A,r,a,i),{inputs:A});return}let s=t.length===3,u=t[0].dims[n?1:2],l=t[0].dims[n?2:3],p=t[0].dims[n?3:1],h=t[1].dims[2],c=t[1].dims[3],g=a[n?1:2],b=a[n?2:3],y=a[n?3:1],w=n&&h===u&&c===l&&r.pads[0]===0&&r.pads[1]===0;if(w||h===1&&c===1&&r.dilations[0]===1&&r.dilations[1]===1&&r.strides[0]===1&&r.strides[1]===1&&r.pads[0]===0&&r.pads[1]===0){let A=a[0],O,v,N,q=[];if(n){let G=e.kernelCustomData.wT??e.compute(Pe(t[1],Zr),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];if(r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=G),w){let ae=u*l*p;O=t[0].reshape([1,A,ae]),v=G.reshape([1,ae,y]),N=[1,A,y]}else O=t[0].reshape([A,u*l,p]),v=G.reshape([1,p,y]),N=[A,g*b,y];q.push(O),q.push(v)}else O=t[0].reshape([A,p,u*l]),v=t[1].reshape([1,y,p]),N=[A,y,g*b],q.push(v),q.push(O);s&&q.push(t[2]);let F=N[2],W=q[0].dims[q[0].dims.length-1];F<8&&W<8?e.compute(wa(q,r,a,N,n,i),{inputs:q}):e.compute(oi(q,r,a,N,n,i),{inputs:q});return}let k=!0,S=e.kernelCustomData.wT??e.compute(Pe(t[1],Zr),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=S);let _=[t[0],S];s&&_.push(t[2]);let I=n?g*b:y,T=n?y:g*b,C=h*c*p;e.compute(Mh(_,r,a,I,T,C,s,k,i),{inputs:_})},vl=(e,t)=>{let r=t.format==="NHWC",i=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&i.push(e.inputs[2]);let n=[0,t.pads[0],0,t.pads[1]],a=[1].concat(t.strides),s=[1].concat(t.dilations),u=[1].concat(t.kernelShape),l=Yr({...t,pads:n,strides:a,dilations:s,kernelShape:u},i);dn(e,i,l,(p)=>r?[p[0],p[2],p[3]]:[p[0],p[1],p[3]])},$l=(e,t,r)=>{let i=r.format==="NHWC"?"channelsLast":"channelsFirst",n=Yr(r,t),a=r.autoPad==="NOTSET"?r.pads:r.autoPad,s=Bh(t[0].dims,t[1].dims,r.strides,r.dilations,a,!1,i);e.compute(Dh(t,n,s.outShape,[s.filterDepth,s.filterHeight,s.filterWidth],[s.padInfo.front,s.padInfo.top,s.padInfo.left],i))},Xn=(e,t)=>{if(wl(e.inputs,t),e.inputs[0].dims.length===3)vl(e,t);else if(e.inputs[0].dims.length===5)$l(e,e.inputs,t);else{let r=Yr(t,e.inputs);dn(e,e.inputs,r)}}}),Iy=U(()=>{ee(),ot(),ie(),ne(),Uh=(e,t,r)=>{let i=e.length>2,n=t.outputShape,a=t.format==="NHWC",s=t.group,u=e[1].dims,l=u[2]/s,p=u[3],h=a?ke(l):1,c=a&&p===1&&l>=4,g=c?Math.floor(l/4)*4:Math.floor(l/h)*h,b=l-g,y=a?ke(p):1,w=a?p===1?h:y:1,k=M.size(n)/y,S=[Math.ceil(k/64),1,1];pe("verbose",()=>`[conv2d_backprop_webgpu] dispatch = ${S}`);let _=["rank","rank"],I=[t.strides[0],t.strides[1]],T=[t.kernelShape[a?1:2],t.kernelShape[a?2:3]],C=[t.dilations[0],t.dilations[1]],A=[T[0]+(t.dilations[0]<=1?0:(t.kernelShape[a?1:2]-1)*(t.dilations[0]-1)),T[1]+(t.dilations[1]<=1?0:(t.kernelShape[a?2:3]-1)*(t.dilations[1]-1))],O=[A[0]-1-Math.floor((t.pads[0]+t.pads[2])/2),A[1]-1-Math.floor((t.pads[1]+t.pads[3])/2)],v=[{type:12,data:k},{type:12,data:I},{type:12,data:T},{type:12,data:C},{type:12,data:A},{type:6,data:O},{type:12,data:g},{type:12,data:l},{type:12,data:p},...X(e[0].dims,e[1].dims)];i&&(v.push(...X(e[2].dims)),_.push("rank")),v.push(...X(n));let N=(q)=>{let F=[{name:"output_size",type:"u32"},{name:"strides",type:"u32",length:I.length},{name:"filter_dims",type:"u32",length:T.length},{name:"dilations",type:"u32",length:T.length},{name:"effective_filter_dims",type:"u32",length:A.length},{name:"pads",type:"i32",length:O.length},{name:"input_channels_per_group_int",type:"u32"},{name:"input_channels_per_group",type:"u32"},{name:"output_channels_per_group",type:"u32"}],W=Ae(e[0].dataType),G=a?1:2,ae=a?2:3,z=a?3:1,L=B("W",e[1].dataType,e[1].dims.length,w),te=B("Dy",e[0].dataType,e[0].dims.length,h),re=[te,L];i&&re.push(B("bias",e[2].dataType,[n[z]].length,y));let Q=j("result",e[0].dataType,n.length,y),se=()=>{let Y="";if(c)h===4?Y+=`
        let xValue = ${te.getByOffset("x_offset")};
        let wValue = ${L.getByOffset("w_offset")};
        dotProd = dotProd + dot(xValue, wValue);
        x_offset += 1u;
        w_offset += 1u;`:h===2?Y+=`
          dotProd = dotProd + dot(vec4<${W}>(${te.getByOffset("x_offset")}, ${te.getByOffset("x_offset + 1u")}), vec4<${W}>(${L.getByOffset("w_offset")}, ${L.getByOffset("w_offset + 1u")}));
          x_offset += 2u;
          w_offset += 2u;`:h===1&&(Y+=`
          dotProd = dotProd + dot(vec4<${W}>(${te.getByOffset("x_offset")}, ${te.getByOffset("x_offset + 1u")}, ${te.getByOffset("x_offset + 2u")}, ${te.getByOffset("x_offset + 3u")}), vec4<${W}>(${L.getByOffset("w_offset")}, ${L.getByOffset("w_offset + 1u")}, ${L.getByOffset("w_offset + 2u")}, ${L.getByOffset("w_offset + 3u")}));
          x_offset += 4u;
          w_offset += 4u;`);else if(Y+=`
                  let xValue = ${a?te.getByOffset(`${te.indicesToOffset(`${te.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${h}`):te.get("batch","inputChannel","idyR","idyC")};
        `,h===1)Y+=`
          let w_offset = ${L.indicesToOffset(`${L.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel, wOutChannel)`)};
          let wValue = ${L.getByOffset(`w_offset / ${w}`)};
          dotProd = dotProd + xValue * wValue;`;else for(let K=0;K<h;K++)Y+=`
            let wValue${K} = ${L.getByOffset(`${L.indicesToOffset(`${L.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel + ${K}, wOutChannel)`)} / ${w}`)};
            dotProd = dotProd + xValue[${K}] * wValue${K};`;return Y},P=()=>{if(b===0)return"";if(!c)throw Error(`packInputAs4 ${c} is not true.`);let Y="";if(h===1){Y+="dotProd = dotProd";for(let K=0;K<b;K++)Y+=`
            + ${te.getByOffset(`x_offset + ${K}`)} * ${L.getByOffset(`w_offset + ${K}`)}`;Y+=";"}else if(h===2){if(b!==2)throw Error(`Invalid inputChannelsRemainder ${b}.`);Y+=`
          let xValue = ${te.getByOffset("x_offset")};
          let wValue = ${L.getByOffset("w_offset")};
          dotProd = dotProd + dot(xValue, wValue);`}return Y},J=`
            let outputIndices = ${Q.offsetToIndices(`global_idx * ${y}`)};
            let batch = ${Q.indicesGet("outputIndices",0)};
            let d1 = ${Q.indicesGet("outputIndices",z)};
            let r = ${Q.indicesGet("outputIndices",G)};
            let c = ${Q.indicesGet("outputIndices",ae)};
            let dyCorner = vec2<i32>(i32(r), i32(c)) - uniforms.pads;
            let dyRCorner = dyCorner.x;
            let dyCCorner = dyCorner.y;
            let groupId = d1 / uniforms.output_channels_per_group;
            let wOutChannel = d1 - groupId * uniforms.output_channels_per_group;
            // Convolve dy(?, ?, d2) with w(:, :, d1, d2) to compute dx(xR, xC, d1).
            // ? = to be determined. : = across all values in that axis.
            var dotProd = ${Q.type.value}(0.0);
            var wR: u32 = 0;
            if (uniforms.dilations.x == 1) {
              // Minimum wR >= 0 that satisfies (dyRCorner + wR) % (uniforms.strides.x) == 0
              wR = u32(((dyRCorner + i32(uniforms.strides.x) - 1) / i32(uniforms.strides.x)) * i32(uniforms.strides.x) - dyRCorner);
            }
            for (; wR < uniforms.effective_filter_dims.x; wR = wR + 1) {
              if (wR % uniforms.dilations.x != 0) {
                continue;
              }
              let dyR = (${W}(dyRCorner) + ${W}(wR)) / ${W}(uniforms.strides[0]);
              let wRPerm = uniforms.filter_dims.x - 1 - wR / uniforms.dilations.x;
              if (dyR < 0.0 || dyR >= ${W}(uniforms.Dy_shape[${G}]) || fract(dyR) > 0.0 ||
                  wRPerm < 0) {
                continue;
              }
              let idyR: u32 = u32(dyR);
              var wC: u32 = 0;
              if (uniforms.dilations.y == 1) {
                // Minimum wC >= 0 that satisfies (dyCCorner + wC) % (uniforms.strides.y) == 0
                wC = u32(((dyCCorner + i32(uniforms.strides.y) - 1) / i32(uniforms.strides.y)) * i32(uniforms.strides.y) - dyCCorner);
              }
              for (; wC < uniforms.effective_filter_dims.y; wC = wC + 1) {
                if (wC % uniforms.dilations.y != 0) {
                  continue;
                }
                let dyC = (${W}(dyCCorner) + ${W}(wC)) / ${W}(uniforms.strides.y);
                let wCPerm = uniforms.filter_dims.y - 1 - wC / uniforms.dilations.y;
                if (dyC < 0.0 || dyC >= ${W}(uniforms.Dy_shape[${ae}]) ||
                    fract(dyC) > 0.0 || wCPerm < 0) {
                  continue;
                }
                let idyC: u32 = u32(dyC);
                var inputChannel = groupId * uniforms.input_channels_per_group;
                ${c?`
                var x_offset = ${te.indicesToOffset(`${te.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${h};
                var w_offset = ${L.indicesToOffset(`${L.type.indices}(wRPerm, wCPerm, inputChannel, wOutChannel)`)} / ${w};
                  `:""}
                for (var d2: u32 = 0; d2 < uniforms.input_channels_per_group_int; d2 = d2 + ${c?4:h}) {
                  ${se()}
                  inputChannel = inputChannel + ${c?4:h};
                }
                ${P()}
                wC = wC + uniforms.strides.y - 1;
              }
              wR = wR + uniforms.strides[0] - 1;
            }
            let value = dotProd${i?` + bias[d1 / ${y}]`:""};
            ${Q.setByOffset("global_idx","value")};
          `;return`
    ${q.registerUniforms(F).declareVariables(...re,Q)}
      ${q.mainStart()}
      ${q.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")};
    ${J}}`};return{name:"ConvTranspose2D",shaderCache:{hint:`${t.cacheKey};${h}${w}${y}${c}${b}`,inputDependencies:_},getRunData:()=>({dispatchGroup:{x:S[0],y:S[1],z:S[2]},outputs:[{dims:r?r(n):n,dataType:e[0].dataType}],programUniforms:v}),getShaderSource:N}}}),Cy=U(()=>{Iy(),Lt(),$t(),xl=(e,t,r,i,n,a)=>(e-1)*t+r+(i-1)*n+1-a,Sl=(e,t,r,i,n)=>{let a=Math.floor(e/2);t==="SAME_UPPER"?(r[i]=a,r[n]=e-a):t==="SAME_LOWER"&&(r[i]=e-a,r[n]=a)},kl=(e,t,r,i,n,a,s,u,l,p)=>{let h=e.length-2,c=p.length===0;l.length<h&&l.push(...Array(h-l.length).fill(0));let g=e[0],b=t[u?3:1]*n;for(let y=0,w=e.length-h-(u?1:0);y<h;++y,++w){let k=e[w],S=c?k*s[y]:p[y],_=xl(k,s[y],a[y],t[w],r[y],S);Sl(_,i,a,y,y+h),c&&p.push(s[y]*(k-1)+l[y]+(t[w]-1)*r[y]+1-a[y]-a[y+h])}p.splice(0,0,g),p.splice(u?3:1,0,b)},pn=(e,t)=>{let r=e.kernelShape.slice();if(e.kernelShape.length===0||e.kernelShape.reduce((c,g)=>c*g,1)===0){r.length=0;for(let c=2;c<t[1].dims.length;++c)r.push(t[1].dims[c])}let i=e.format==="NHWC";r.splice(0,0,t[1].dims[0]),r.splice(i?3:1,0,t[1].dims[1]);let n=e.pads.slice(),a=e.outputShape.slice(),s=e.outputPadding.slice(),u=t[0].dims,l=e.dilations.slice();if(l.reduce((c,g)=>c+g,0)===0){let c=t[0].dims.length-2;l=Array(c).fill(1)}let p=e.strides.slice();if(p.reduce((c,g)=>c+g,0)===0){let c=t[0].dims.length-2;p=Array(c).fill(1)}kl(u,r,l,e.autoPad,e.group,n,p,i,s,a);let h=Object.assign({},e);return Object.assign(h,{kernelShape:r,pads:n,outputPadding:s,outputShape:a,dilations:l,strides:p}),h},Lh=(e)=>{let t=ba(e),r=e.format,i=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][typeof e.autoPad>"u"?0:e.autoPad],n=e.dilations,a=e.group??1,s=e.kernelShape,u=e.pads,l=e.strides,p=e.wIsConst(),h=e.outputPadding,c=e.outputShape;return{autoPad:i,format:r,dilations:n,group:a,kernelShape:s,outputPadding:h,outputShape:c,pads:u,strides:l,wIsConst:p,...t,cacheKey:`${e.format};${t.activation};`}},Tl=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw Error("Conv requires 2 or 3 inputs");if(e[0].dims.length!==4&&e[0].dims.length!==3)throw Error("currently only support 2-dimensional conv");if(e[0].dims.length!==e[1].dims.length)throw Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],i=e[1].dims[0];if(r!==i)throw Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");let n=e[1].dims[1]*t.group;if(e.length===3&&(e[2].dims.length!==1||e[2].dims[0]!==n))throw Error("invalid bias");let a=e[0].dims.length-2;if(t.dilations.reduce((s,u)=>s+u,0)>0&&t.dilations.length!==a)throw Error(`dilations should be ${a}D`);if(t.strides.reduce((s,u)=>s+u,0)>0&&t.strides.length!==a)throw Error(`strides should be ${a}D`);if(t.pads.reduce((s,u)=>s+u,0)>0&&t.pads.length!==a*2)throw Error(`pads should be ${a*2}D`);if(t.outputPadding.length!==a&&t.outputPadding.length!==0)throw Error(`output_padding should be ${a}D`);if(t.kernelShape.reduce((s,u)=>s+u,0)>0&&t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw Error("invalid kernel shape");if(t.outputShape.length!==0&&t.outputShape.length!==e[0].dims.length-2)throw Error("invalid output shape")},cn=(e,t,r,i)=>{let n=e.kernelCustomData.wT??e.compute(Pe(t[1],[2,3,0,1]),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=n);let a=[t[0],n];t.length===3&&a.push(t[2]),e.compute(Uh(a,r,i),{inputs:a})},El=(e,t)=>{let r=t.format==="NHWC",i=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&i.push(e.inputs[2]);let n=t.kernelShape;(n.length===0||n[0]===0)&&(n=[e.inputs[1].dims[2]]);let a=t.dilations;(a.length===0||a[0]===0)&&(a=[1]);let s=t.strides;(s.length===0||s[0]===0)&&(s=[1]);let u=t.pads;u.length===0&&(u=[0,0]),u=[0,u[0],0,u[1]],s=[1].concat(s),a=[1].concat(a),n=[1].concat(n);let l=t.outputPadding;l=[0].concat(l);let p=pn({...t,pads:u,strides:s,dilations:a,kernelShape:n,outputPadding:l},i);cn(e,i,p,(h)=>r?[h[0],h[2],h[3]]:[h[0],h[1],h[3]])},qh=(e,t)=>{if(Tl(e.inputs,t),e.inputs[0].dims.length===3)El(e,t);else{let r=pn(t,e.inputs);cn(e,e.inputs,r)}}}),Ay=U(()=>{ee(),ie(),Te(),ne(),Il=(e,t,r,i)=>{let n=M.size(t),a=t.length,s=B("input",e,a),u=j("output",e,a),l=r.dataType===6?r.getInt32Array()[0]:Number(r.getBigInt64Array()[0]),p=M.normalizeAxis(l,a),h=(c)=>{let g=` i32(${s.indicesGet("inputIndices","uniforms.axis")}) `,b=Z("uniforms.input_shape","uniforms.axis",a),y=i.reverse?g+(i.exclusive?" + 1":""):"0",w=i.reverse?b:g+(i.exclusive?"":" + 1");return`
                ${c.registerUniform("outputSize","u32").registerUniform("axis","u32").declareVariables(s,u)}
                ${c.mainStart()}
                  ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
                  var inputIndices = ${u.offsetToIndices("global_idx")};
                  var sum = ${u.type.value}(0);
                  let first : i32 = ${y};
                  let last : i32 = ${w};
                  for (var i : i32 = first; i < last; i++) {
                    ${s.indicesSet("inputIndices","uniforms.axis","u32(i)")};
                    sum = sum + ${s.getByIndices("inputIndices")};
                  }
                  ${u.setByOffset("global_idx","sum")};
                }`};return{name:"CumSum",shaderCache:{hint:i.cacheKey,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:t,dataType:e}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:[{type:12,data:n},{type:12,data:p},...X(t,t)]}),getShaderSource:h}},Vh=(e,t)=>{let r=e.inputs[0].dims,i=e.inputs[0].dataType,n=e.inputs[1];e.compute(Il(i,r,n,t),{inputs:[0]})},Wh=(e)=>{let t=e.exclusive===1,r=e.reverse===1;return fe({exclusive:t,reverse:r})}}),zy=U(()=>{ee(),ie(),Te(),ne(),Cl=(e)=>{if(!e||e.length!==1)throw Error("DepthToSpace requires 1 input.");if(e[0].dims.length!==4)throw Error("DepthToSpace requires 4D input.")},Al=(e,t,r,i)=>{let n=[];n.push(`fn perm(i: ${i.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`);for(let a=0;a<t;++a)n.push(r.indicesSet("a",e[a],`i[${a}]`));return n.push("return a;}"),n.join(`
`)},zl=(e,t)=>{let r,i,n,a,s,u,l=t.format==="NHWC",p=t.blocksize,h=t.mode==="DCR";l?([r,i,n,a]=e.dims,s=h?[r,i,n,p,p,a/p**2]:[r,i,n,a/p**2,p,p],u=h?[0,1,3,2,4,5]:[0,1,4,2,5,3]):([r,i,n,a]=[e.dims[0],e.dims[2],e.dims[3],e.dims[1]],s=h?[r,p,p,a/p**2,i,n]:[r,a/p**2,p,p,i,n],u=h?[0,3,4,1,5,2]:[0,1,4,2,5,3]);let c=e.reshape(s),g=c.dims.length,b=e.dataType,y=B("a",b,g),w=j("output",b,g),k=(S)=>`
  ${S.registerUniform("output_size","u32").declareVariables(y,w)}

  ${Al(u,g,y,w)}

  ${S.mainStart()}
    ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${w.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${w.setByOffset("global_idx",y.getByIndices("aIndices"))}
  }`;return{name:"DepthToSpace",shaderCache:{hint:`${e.dims};${t.blocksize};${t.mode}`,inputDependencies:["rank"]},getRunData:(S)=>{let _=l?[r,i*p,n*p,a/p**2]:[r,a/p**2,i*p,n*p],I=M.size(_),T=c.dims,C=M.sortBasedOnPerm(T,u);return{outputs:[{dims:_,dataType:S[0].dataType}],dispatchGroup:{x:Math.ceil(I/64)},programUniforms:[{type:12,data:I},...X(T,C)]}},getShaderSource:k}},Gh=(e,t)=>{Cl(e.inputs),e.compute(zl(e.inputs[0],t))},Hh=(e)=>fe({blocksize:e.blocksize,mode:e.mode,format:e.format})}),Oy=U(()=>{ee(),ie(),Te(),ne(),nt=256,pr=512,Xr=2*Math.PI,hn=(e)=>{let t=[],r=e;for(let i of[4,2,3,5])for(;r%i===0;)t.push(i),r/=i;return r===1?t:void 0},gt=(e)=>{let t=e.toPrecision(9);return/[.eE]/.test(t)?t:`${t}.0`},Ol=(e,t,r,i,n)=>{let a=r/e,s=pr-i,u=(p)=>`smem[${s}u + base + ${p*t}u]`,l=`  for (var t = local_idx; t < ${a}u; t += ${nt}u) {
`;l+=`    let twiddleIndex = t % ${t}u;
    let angleUnit = f32(twiddleIndex);
`,l+=`    var leg: array<vec2<f32>, 5>;
`;for(let p=0;p<e;p++){let h=`${i}u + t + ${p*a}u`;if(p===0)l+=`    leg[0] = smem[${h}];
`;else{let c=n*Xr*p/(e*t);l+=`    { let a = ${gt(c)} * angleUnit; leg[${p}] = cmul(smem[${h}], vec2<f32>(cos(a), sin(a))); }
`}}if(l+=`    let base = (t / ${t}u) * ${t*e}u + twiddleIndex;
`,e===2)l+=`    ${u(0)} = leg[0] + leg[1];
    ${u(1)} = leg[0] - leg[1];
`;else if(e===4){let p=n<0?"vec2<f32>(oddDiff.y, -oddDiff.x)":"vec2<f32>(-oddDiff.y, oddDiff.x)";l+=`    let evenSum = leg[0] + leg[2]; let evenDiff = leg[0] - leg[2];
`,l+=`    let oddSum = leg[1] + leg[3]; let oddDiff = leg[1] - leg[3];
`,l+=`    let oddRot = ${p};
`,l+=`    ${u(0)} = evenSum + oddSum;
    ${u(1)} = evenDiff + oddRot;
`,l+=`    ${u(2)} = evenSum - oddSum;
    ${u(3)} = evenDiff - oddRot;
`}else for(let p=0;p<e;p++){let h=["leg[0]"];for(let c=1;c<e;c++){let g=n*Xr*(c*p)/e,b=gt(Math.cos(g)),y=gt(Math.sin(g));h.push(`vec2<f32>(leg[${c}].x*${b} - leg[${c}].y*${y}, leg[${c}].x*${y} + leg[${c}].y*${b})`)}l+=`    ${u(p)} = ${h.join(" + ")};
`}return`${l}  }
  workgroupBarrier();
`},Rl=(e,t,r)=>{let i="",n=1,a=0;for(let s of e)i+=Ol(s,n,t,a,r),n*=s,a=pr-a;return{code:i,resultOffset:a}},Ml=(e,t,r,i,n)=>{let a=e.dims,s=a.length,u=a[s-1],l=a[t],p=r&&i?(l-1)*2:l;n!==void 0&&(p=n);let h=r&&i?1:2,c=i&&!r?Math.floor(p/2)+1:p,g=a.slice();g[t]=c,g[s-1]=h;let b=1;for(let w=t+1;w<s-1;w++)b*=a[w];let y=M.size(a)/u/l;return{dataType:e.dataType,outputDims:g,length:p,signalLength:l,inner:b,batch:y,inputComponents:u,outputComponents:h,outputLength:c,inverse:r,onesided:i}},fn=(e,t)=>[t,e.length,e.inputComponents,e.outputComponents,e.inverse,e.onesided].join(";"),mn=(e)=>[{type:12,data:e.batch},{type:12,data:e.signalLength},{type:12,data:e.inner},{type:12,data:e.outputLength}],gn=(e,t,r)=>e.registerUniform("batch","u32").registerUniform("signalLength","u32").registerUniform("inner","u32").registerUniform("outputLength","u32").declareVariables(t,r),Bl=(e)=>{let{dataType:t,length:r,inputComponents:i,outputComponents:n,inverse:a,onesided:s}=e,u=Ce(t),l=a?1:-1,p=a?1/r:1,h=hn(r),c=(g)=>{let b=B("x",t,[1]),y=j("y",t,[1]),w=(C)=>{let A=`inBase + (${C}) * uniforms.inner * ${i}u`,O=`f32(${b.getByOffset(A)})`,v=i===2?`f32(${b.getByOffset(`${A} + 1u`)})`:"0.0";return`vec2<f32>(${O}, ${v})`},k;if(a&&s){let C=Math.floor(r/2)+1,A=r%2===0?`select(provided, provided - 1u, provided == ${C}u)`:"provided";k=`
    let provided = min(uniforms.signalLength, ${C}u);
    for (var i = local_idx; i < ${r}u; i += ${nt}u) {
      if (i < provided) { smem[i] = ${w("i")}; } else { smem[i] = vec2<f32>(0.0); }
    }
    workgroupBarrier();
    for (var k = local_idx + 1u; k < ${A}; k += ${nt}u) {
      let h = smem[k];
      smem[${r}u - k] = vec2<f32>(h.x, -h.y);
    }
    workgroupBarrier();`}else k=`
    let loadCount = min(uniforms.signalLength, ${r}u);
    for (var i = local_idx; i < ${r}u; i += ${nt}u) {
      if (i < loadCount) { smem[i] = ${w("i")}; } else { smem[i] = vec2<f32>(0.0); }
    }
    workgroupBarrier();`;let{code:S,resultOffset:_}=Rl(h,r,l),I=p===1?`smem[${_}u + i]`:`smem[${_}u + i] * ${gt(p)}`,T=n===2?y.setByOffset("off + 1u",`${u}(v.y)`):"";return`
  ${gn(g,b,y)}
  var<workgroup> smem: array<vec2<f32>, ${2*pr}>;
  fn cmul(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
  }
  ${g.mainStart(nt)}
    let row = workgroup_index;
    if (row >= uniforms.batch) { return; }
    let outer = row / uniforms.inner;
    let within = row % uniforms.inner;
    let inBase = (outer * uniforms.signalLength * uniforms.inner + within) * ${i}u;
    let outBase = (outer * uniforms.outputLength * uniforms.inner + within) * ${n}u;
    ${k}
${S}    for (var i = local_idx; i < uniforms.outputLength; i += ${nt}u) {
      let v = ${I};
      let off = outBase + i * uniforms.inner * ${n}u;
      ${y.setByOffset("off",`${u}(v.x)`)}
      ${T}
    }
  }`};return{name:"DFT",shaderCache:{hint:fn(e,"fft"),inputDependencies:["type"]},getShaderSource:c,getRunData:()=>({outputs:[{dims:e.outputDims,dataType:t}],programUniforms:mn(e),dispatchGroup:{x:e.batch}})}},Dl=(e)=>{let{dataType:t,length:r,inputComponents:i,outputComponents:n,inverse:a,onesided:s}=e,u=Ce(t),l=a?1:-1,p=a?1/r:1,h=(c)=>{let g=B("x",t,[1]),b=j("y",t,[1]),y=(I)=>{let T=`inBase + (${I}) * uniforms.inner * ${i}u`,C=`f32(${g.getByOffset(T)})`,A=i===2?`f32(${g.getByOffset(`${T} + 1u`)})`:"0.0";return`vec2<f32>(${C}, ${A})`},w=a&&s?`fn spectrum(inBase: u32, k: u32) -> vec2<f32> {
    let provided = min(uniforms.signalLength, ${Math.floor(r/2)+1}u);
    if (k < provided) { return ${y("k")}; }
    let m = ${r}u - k;
    if (m < provided) {
      let h = ${y("m")};
      return vec2<f32>(h.x, -h.y);
    }
    return vec2<f32>(0.0, 0.0);
  }`:`fn spectrum(inBase: u32, n: u32) -> vec2<f32> {
    if (n < uniforms.signalLength) { return ${y("n")}; }
    return vec2<f32>(0.0, 0.0);
  }`,k=`
      let angle = ${gt(l*Xr)} * f32(knMod) / ${gt(r)};
      acc += cmul(spectrum(inBase, n), vec2<f32>(cos(angle), sin(angle)));
      knMod += k;
      if (knMod >= ${r}u) { knMod -= ${r}u; }`,S=n===2?b.setByOffset("off + 1u",`${u}(v.y)`):"",_=p===1?"acc":`acc * ${gt(p)}`;return`
  ${gn(c,g,b)}
  fn cmul(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
  }
  ${w}
  ${c.mainStart(nt)}
    let row = workgroup_index;
    if (row >= uniforms.batch) { return; }
    let outer = row / uniforms.inner;
    let within = row % uniforms.inner;
    let inBase = (outer * uniforms.signalLength * uniforms.inner + within) * ${i}u;
    let outBase = (outer * uniforms.outputLength * uniforms.inner + within) * ${n}u;
    for (var k = local_idx; k < uniforms.outputLength; k += ${nt}u) {
      var acc = vec2<f32>(0.0, 0.0);
      var knMod = 0u;
      for (var n = 0u; n < ${r}u; n++) {${k}
      }
      let v = ${_};
      let off = outBase + k * uniforms.inner * ${n}u;
      ${b.setByOffset("off",`${u}(v.x)`)}
      ${S}
    }
  }`};return{name:"DFT",shaderCache:{hint:fn(e,"direct"),inputDependencies:["type"]},getShaderSource:h,getRunData:()=>({outputs:[{dims:e.outputDims,dataType:t}],programUniforms:mn(e),dispatchGroup:{x:e.batch}})}},yn=(e)=>{if(!e||e.dataType===0)return;if(M.size(e.dims)!==1)throw Error("DFT optional scalar inputs must have exactly 1 element.");if(e.dataType===6)return e.getInt32Array()[0];let t=Number(e.getBigInt64Array()[0]);if(!Number.isSafeInteger(t))throw Error("DFT optional scalar inputs are out of JavaScript safe integer range.");return t},Nl=(e)=>{if(!e||e.length<1)throw Error("DFT requires at least 1 input.");let t=e[0].dims;if(t.length<2)throw Error("DFT input must have at least 2 dimensions.");let r=t[t.length-1];if(r!==1&&r!==2)throw Error("DFT input's innermost dimension must be 1 (real) or 2 (complex).")},Fh=(e,t)=>{Nl(e.inputs);let r=e.inputs[0],i=r.dims.length,n=t.inverse!==0,a=t.onesided!==0,s=yn(e.inputs[1]);if(s!==void 0&&s<=0)throw Error("dft_length must be greater than zero.");let u=M.normalizeAxis(yn(e.inputs[2])??t.axis,i);if(u===i-1)throw Error("DFT axis must refer to a signal dimension, not the innermost (real/imaginary) dimension.");if(n&&a&&r.dims[i-1]!==2)throw Error("Inverse one-sided DFT (IRFFT) requires complex-valued input (innermost dimension 2).");let l=Ml(r,u,n,a,s);if(l.length<=0)throw Error(`Invalid DFT length: ${l.length}`);let p=l.length<=pr&&hn(l.length)!==void 0?Bl(l):Dl(l);e.compute(p,{inputs:[0]})},jh=(e)=>fe({axis:e.axis??1,inverse:e.inverse??0,onesided:e.onesided??0})}),Ry=U(()=>{ee(),ie(),Te(),ne(),Qr="[a-zA-Z]|\\.\\.\\.",cr="("+Qr+")+",bn="^"+cr+"$",Pl="("+cr+",)*"+cr,Ul="^"+Pl+"$",Ll=class{constructor(e=-1){this.symbolToIndices=new Map,this.inputIndex=e}addSymbol(e,t){let r=this.symbolToIndices.get(e);r===void 0?r=[t]:r.push(t),this.symbolToIndices.set(e,r)}},ql=class{constructor(e,t){this.equation=t,this.hasEllipsis=!1,this.symbolToInfo=new Map,this.lhs=[],this.outputDims=[];let[r,i]=t.includes("->")?t.split("->",2):[t,""];if(!r.match(RegExp(Ul)))throw Error("Invalid LHS term");if(r.split(",").forEach((n,a)=>{let s=e[a].dims.slice();if(!n.match(RegExp(bn)))throw Error("Invalid LHS term");let u=this.processTerm(n,!0,s,a);this.lhs.push(u)}),i==="")i+=[...this.symbolToInfo.entries()].filter(([n,a])=>a.count===1||n==="...").map(([n])=>n).join("");else if(!i.match(RegExp(cr)))throw Error("Invalid RHS");i.match(RegExp(Qr,"g"))?.forEach((n)=>{if(n==="...")this.outputDims=this.outputDims.concat(this.ellipsisDims);else{let a=this.symbolToInfo.get(n);if(a===void 0)throw Error("Invalid RHS symbol");this.outputDims.push(a.dimValue)}}),this.rhs=this.processTerm(i,!1,this.outputDims)}addSymbol(e,t,r){let i=this.symbolToInfo.get(e);if(i!==void 0){if(i.dimValue!==t&&i.count!==1)throw Error("Dimension mismatch");i.count++,i.inputIndices.push(r)}else i={count:1,dimValue:t,inputIndices:[r]};this.symbolToInfo.set(e,i)}processTerm(e,t,r,i=-1){let n=r.length,a=!1,s=[],u=0;if(!e.match(RegExp(bn))&&!t&&e!=="")throw Error("Invalid LHS term");let l=e.match(RegExp(Qr,"g")),p=new Ll(i);return l?.forEach((h,c)=>{if(h==="..."){if(a)throw Error("Only one ellipsis is allowed per input term");a=!0;let g=n-l.length+1;if(g<0)throw Error("Ellipsis out of bounds");if(s=r.slice(u,u+g),this.hasEllipsis){if(this.ellipsisDims.length!==s.length||this.ellipsisDims.toString()!==s.toString())throw Error("Ellipsis dimensions mismatch")}else if(t)this.hasEllipsis=!0,this.ellipsisDims=s;else throw Error("Ellipsis must be specified in the LHS");for(let b=0;b<s.length;b++){let y=String.fromCharCode(48+b);p.addSymbol(y,c+b),this.addSymbol(y,r[u++],i)}}else p.addSymbol(h,c+(this.hasEllipsis?this.ellipsisDims.length-1:0)),this.addSymbol(h,r[u++],i)}),p}},_n=(e)=>e+"_max",Vl=(e,t,r,i)=>{let n=e.map((p)=>p.length).map((p,h)=>B(`input${h}`,t,p)),a=M.size(i),s=j("output",t,i.length),u=[...r.symbolToInfo.keys()].filter((p)=>!r.rhs.symbolToIndices.has(p)),l=(p)=>{let h=[],c="var prod = 1.0;",g="var sum = 0.0;",b="sum += prod;",y=[],w=[],k=[],S=[],_=r.symbolToInfo.size===r.rhs.symbolToIndices.size;r.symbolToInfo.forEach((T,C)=>{if(r.rhs.symbolToIndices.has(C)){let A=r.rhs.symbolToIndices.get(C)?.[0];A!==void 0&&r.lhs.forEach((O,v)=>{if(T.inputIndices.includes(v)){let N=O.symbolToIndices.get(C);if(N===void 0)throw Error("Invalid symbol error");N.forEach((q)=>{h.push(`${n[v].indicesSet(`input${v}Indices`,q,s.indicesGet("outputIndices",A))}`)})}})}else r.lhs.forEach((A,O)=>{if(T.inputIndices.includes(O)){let v=A.symbolToIndices.get(C);if(v===void 0)throw Error("Invalid symbol error");v.forEach((N)=>{y.push(`${n[O].indicesSet(`input${O}Indices`,N,`${C}`)}`)}),S.push(`prod *= ${n[O].getByIndices(`input${O}Indices`)};`)}}),w.push(`for(var ${C}: u32 = 0; ${C} < uniforms.${_n(C)}; ${C}++) {`),k.push("}")});let I=_?[...h,`let sum = ${n.map((T,C)=>T.getByIndices(`input${C}Indices`)).join(" * ")};`]:[...h,g,...w,...y,c,...S,b,...k];return`
            ${p.registerUniforms(u.map((T)=>({name:`${_n(T)}`,type:"u32"}))).registerUniform("outputSize","u32").declareVariables(...n,s)}

            ${p.mainStart()}
            ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
            var outputIndices = ${s.offsetToIndices("global_idx")};
            ${n.map((T,C)=>`var input${C}Indices: ${n[C].type.indices};`).join(`
`)}
            ${I.join(`
`)};
            ${s.setByOffset("global_idx","sum")};
          }`};return{name:"Einsum",shaderCache:{hint:r.equation,inputDependencies:e.map(()=>"rank")},getRunData:()=>{let p=u.filter((c)=>r.symbolToInfo.has(c)).map((c)=>({type:12,data:r.symbolToInfo.get(c)?.dimValue||0}));p.push({type:12,data:a});let h=e.map((c,g)=>[...X(c)]).reduce((c,g)=>c.concat(g),p);return h.push(...X(i)),{outputs:[{dims:i,dataType:t}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:h}},getShaderSource:l}},Kh=(e,t)=>{let r=new ql(e.inputs,t.equation),i=r.outputDims,n=e.inputs.map((a,s)=>a.dims);e.compute(Vl(n,e.inputs[0].dataType,r,i))},Zh=(e)=>{let t=e.equation.replace(/\s+/g,"");return fe({equation:t})}}),My=U(()=>{ee(),ie(),ne(),Wl=(e)=>{if(!e||e.length!==2)throw Error("Expand requires 2 input.");let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),i=r.length<t.length?0:r.length-t.length,n=t.length<r.length?0:t.length-r.length;for(;i<r.length&&n<t.length;++i,++n)if(r[i]!==t[n]&&r[i]!==1&&t[n]!==1)throw Error("Expand requires shape to be broadcastable to input")},wn=(e,t)=>{let r=e.length-t.length,i=[];for(let n=0;n<r;++n)i.push(e[n]);for(let n=0;n<t.length;++n)i.push(t[n]===1?e[n+r]:t[n]);return i},Gl=(e,t)=>e.length>t.length?wn(e,t):wn(t,e),Hl=(e)=>{let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),i=Gl(t,r),n=e[0].dataType,a=n===9||M.size(t)===1,s=n===9||t.length>0&&t[t.length-1]%4===0?4:1,u=a||i.length>0&&i[i.length-1]%4===0?4:1,l=Math.ceil(M.size(i)/u),p=(c)=>{let g=B("input",n,t.length,s),b=j("output",n,i.length,u),y;if(n===9){let w=(k,S,_="")=>`
          let outputIndices${S} = ${b.offsetToIndices(`outputOffset + ${S}u`)};
          let offset${S} = ${g.broadcastedIndicesToOffset(`outputIndices${S}`,b)};
          let index${S} = offset${S} / 4u;
          let component${S} = offset${S} % 4u;
          ${k}[${S}] = ${_}(${g.getByOffset(`index${S}`)}[component${S}]);
        `;y=`
        let outputOffset = global_idx * ${u};
        var data = vec4<u32>(0);
        ${w("data",0,"u32")}
        ${w("data",1,"u32")}
        ${w("data",2,"u32")}
        ${w("data",3,"u32")}
        ${b.setByOffset("global_idx","data")}
      }`}else y=`
        let outputIndices = ${b.offsetToIndices(`global_idx * ${u}`)};
        let inputOffset = ${g.broadcastedIndicesToOffset("outputIndices",b)};
        let data = ${b.type.value}(${g.getByOffset(`inputOffset / ${s}`)});
        ${b.setByOffset("global_idx","data")}
      }`;return`
    ${c.registerUniform("vec_size","u32").declareVariables(g,b)}
    ${c.mainStart()}
    ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
    ${y}`},h=[{type:12,data:l},...X(t,i)];return{name:"Expand",shaderCache:{hint:`${i.length};${s}${u}`,inputDependencies:["rank"]},getShaderSource:p,getRunData:()=>({outputs:[{dims:i,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:h})}},Yh=(e)=>{Wl(e.inputs),e.compute(Hl(e.inputs),{inputs:[0]})}}),By=U(()=>{ee(),ie(),ne(),ya(),Fl=(e)=>{let t=e[0].dataType,r=M.size(e[0].dims),i=M.size(e[1].dims),n=i%4===0,a=(s)=>{let u=B("x",t,[1],4),l=B("bias",t,[1],4),p=j("y",t,[1],4),h=[{name:"output_vec_size",type:"u32"},{name:"bias_size",type:"u32"}],c=(b)=>`
      let bias${b}_offset: u32 = (global_idx * 4 + ${b}) % uniforms.bias_size;
      let bias${b} = ${l.getByOffset(`bias${b}_offset / 4`)}[bias${b}_offset % 4];`,g=n?`
      let bias = ${l.getByOffset("global_idx % (uniforms.bias_size / 4)")};`:`${c(0)}${c(1)}${c(2)}${c(3)}
      let bias = ${u.type.value}(bias0, bias1, bias2, bias3);`;return`${s.registerUniforms(h).declareVariables(u,l,p)}

    ${Fn(Ce(t))}

    ${s.mainStart(Zt)}
      ${s.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_vec_size")}

      let x = ${u.getByOffset("global_idx")};
      ${g}
      let x_in = x + bias;
      ${p.setByOffset("global_idx",jn("x_in"))}
    }`};return{name:"FastGeluWithBias",shaderCache:{hint:`${n}`,inputDependencies:["type","type"]},getShaderSource:a,getRunData:(s)=>({outputs:[{dims:s[0].dims,dataType:s[0].dataType}],programUniforms:[{type:12,data:Math.ceil(r/4)},{type:12,data:i}],dispatchGroup:{x:Math.ceil(r/Zt/4)}})}},Xh=(e)=>{e.inputs.length<2||M.size(e.inputs[1].dims)===0?mh(e):e.compute(Fl(e.inputs))}}),Dy=U(()=>{ee(),ie(),Te(),ne(),jl=(e)=>{if(!e||e.length!==2)throw Error("Gather requires 2 inputs.")},Kl=(e,t)=>{let r=e[0].dims,i=e[1].dims,n=r.length,a=M.normalizeAxis(t.axis,n),s=r.slice(0);s.splice(a,1,...i);let u=r[a],l=e[0].dataType===9?4:1,p=Math.ceil(M.size(s)/l),h=[{type:12,data:p},{type:6,data:u},{type:12,data:a},...X(e[0].dims,e[1].dims,s)],c=(g)=>{let b=B("data",e[0].dataType,e[0].dims.length,l),y=B("inputIndices",e[1].dataType,e[1].dims.length),w=j("output",e[0].dataType,s.length,l),k=(_)=>{let I=i.length,T=`var indicesIndices${_}  = ${y.type.indices}(0);`;for(let C=0;C<I;C++)T+=`${I>1?`indicesIndices${_}[${C}]`:`indicesIndices${_}`} = ${s.length>1?`outputIndices${_}[uniforms.axis + ${C}]`:`outputIndices${_}`};`;T+=`
          var idx${_} = ${y.getByIndices(`indicesIndices${_}`)};
          if (idx${_} < 0) {
            idx${_} = idx${_} + uniforms.axisDimLimit;
          }
          var dataIndices${_} : ${b.type.indices};
        `;for(let C=0,A=0;C<n;C++)C===a?(T+=`${n>1?`dataIndices${_}[${C}]`:`dataIndices${_}`} = u32(idx${_});`,A+=I):(T+=`${n>1?`dataIndices${_}[${C}]`:`dataIndices${_}`} = ${s.length>1?`outputIndices${_}[${A}]`:`outputIndices${_}`};`,A++);return T},S;if(e[0].dataType===9){let _=(I,T,C="")=>`
          let outputIndices${T} = ${w.offsetToIndices(`outputOffset + ${T}u`)};
          ${k(T)};
          let offset${T} = ${b.indicesToOffset(`dataIndices${T}`)};
          let index${T} = offset${T} / 4u;
          let component${T} = offset${T} % 4u;
          ${I}[${T}] = ${C}(${b.getByOffset(`index${T}`)}[component${T}]);
        `;S=`
        let outputOffset = global_idx * ${l};
        var value = vec4<u32>(0);
        ${_("value",0,"u32")}
        ${_("value",1,"u32")}
        ${_("value",2,"u32")}
        ${_("value",3,"u32")}
        ${w.setByOffset("global_idx","value")}
      `}else S=`
      let outputIndices = ${w.offsetToIndices("global_idx")};
      ${k("")};
      let value = ${b.getByIndices("dataIndices")};
      ${w.setByOffset("global_idx","value")};
      `;return`
      ${g.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(b,y,w)}
      ${g.mainStart()}
        ${g.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        ${S}
      }`};return{name:"Gather",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:s,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(p/64)},programUniforms:h}),getShaderSource:c}},Qh=(e)=>fe({axis:e.axis}),Jh=(e,t)=>{let r=e.inputs;jl(r),e.compute(Kl(e.inputs,t))}}),Ny=U(()=>{ee(),ie(),ne(),Zl=(e,t,r,i,n,a,s,u,l)=>{let p=[{type:12,data:a},{type:12,data:i},{type:12,data:n},{type:12,data:r},{type:12,data:s},{type:12,data:u},{type:12,data:l}],h=[a];p.push(...X(t.dims,h));let c=(g)=>{let b=B("indices_data",t.dataType,t.dims.length),y=j("input_slice_offsets_data",12,1,1),w=[b,y],k=[{name:"output_size",type:"u32"},{name:"batch_dims",type:"u32"},{name:"input_dims",type:"u32",length:n.length},{name:"sizes_from_slice_dims_data",type:"u32",length:r.length},{name:"num_slices_per_batch",type:"u32"},{name:"input_batch_stride",type:"u32"},{name:"num_slice_dims",type:"u32"}];return`
  ${g.registerUniforms(k).declareVariables(...w)}
  ${g.mainStart()}
    ${g.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let batch_idx = global_idx / uniforms.num_slices_per_batch;
    let base_offset = batch_idx * uniforms.input_batch_stride;

    let slice_indices_base_offset = global_idx * uniforms.num_slice_dims;
    var relative_slice_offset = 0;
    for (var dim_idx = 0u; dim_idx < uniforms.num_slice_dims; dim_idx ++) {
      var index = i32(indices_data[dim_idx + slice_indices_base_offset].x);
      let input_dim_idx = uniforms.batch_dims + dim_idx;
      if (index < 0) {
        ${n.length===1?"index += i32(uniforms.input_dims);":"index += i32(uniforms.input_dims[input_dim_idx]);"}
      }
      ${r.length===1?"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data);":"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data[dim_idx]);"}
    }

    input_slice_offsets_data[global_idx] =  base_offset + u32(relative_slice_offset);
  }`};return e.compute({name:"computeSliceOffsets",shaderCache:{hint:`${n.length}_${r.length}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:h,dataType:e.inputs[1].dataType}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:p}),getShaderSource:c},{inputs:[t],outputs:[-1]})[0]},ef=(e,t)=>{let r=e.inputs,i=r[0].dims,n=r[0].dataType,a=r[1].dims,s=a[a.length-1],u=M.sizeToDimension(a,a.length-1),l=M.sizeFromDimension(i,t.batchDims+s),p=M.sizeToDimension(i,t.batchDims),h=M.sizeFromDimension(i,t.batchDims),c=u/p,g=Array(s),b=l;for(let T=0;T<s;++T)g[s-1-T]=b,b*=i[t.batchDims+s-1-T];let y=Zl(e,r[1],g,t.batchDims,i,u,c,h,s),w=t.batchDims+s;if(w>i.length)throw Error("last dimension of indices must not be larger than rank of input tensor");let k=a.slice(0,-1).concat(i.slice(w)),S=M.size(k),_=[{type:12,data:S},{type:12,data:l},...X(r[0].dims,y.dims,k)],I=(T)=>{let C=B("data",r[0].dataType,r[0].dims.length),A=B("slice_offsets",12,y.dims.length),O=j("output",r[0].dataType,k.length);return`
          ${T.registerUniform("output_size","u32").registerUniform("slice_size","u32").declareVariables(C,A,O)}
            ${T.mainStart()}
            ${T.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let slice_offset = slice_offsets[global_idx / uniforms.slice_size];
          output[global_idx] = data[u32(slice_offset) + global_idx % uniforms.slice_size];
        }`};e.compute({name:"GatherND",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:k,dataType:n}],dispatchGroup:{x:Math.ceil(S/64)},programUniforms:_}),getShaderSource:I},{inputs:[r[0],y]})},tf=(e)=>({batchDims:e.batch_dims,cacheKey:""})}),Py=U(()=>{ee(),ie(),Te(),ne(),Yl=(e,t)=>{if(e.length<3||e.length>4)throw Error("GatherBlockQuantized requires 3 or 4 inputs.");let r=M.normalizeAxis(t.quantizeAxis,e[0].dims.length),i=t.blockSize,n=e[0],a=e[2],s=e.length===4?e[3]:void 0;if(a.dims.length!==n.dims.length||!n.dims.map((u,l)=>l===r?Math.ceil(u/i)===a.dims[l]:u===a.dims[l]).reduce((u,l)=>u&&l,!0))throw Error("Scales must have the same rank as the input tensor and the dims should match except on gatherAxis.");if(s){if(s.dataType!==n.dataType)throw Error("Zero point must have the same data type as the input tensor.");if(s.dims.length!==a.dims.length||!s.dims.map((u,l)=>u===a.dims[l]).reduce((u,l)=>u&&l,!0))throw Error("Zero point must have the same rank as the input tensor and the dims should match except on quantizeAxis.")}},Xl=(e,t)=>{let r=e[0].dims,i=e[1].dims,n=r.length,a=M.normalizeAxis(t.gatherAxis,n),s=M.normalizeAxis(t.quantizeAxis,n),u=r.slice(0);u.splice(a,1,...i);let l=M.size(u),p=e[2].dataType,h=e[0].dataType===22,c=[{type:12,data:l},{type:12,data:s},{type:12,data:a},{type:12,data:t.blockSize},...X(...e.map((b,y)=>b.dims),u)],g=(b)=>{let y=B("data",e[0].dataType,e[0].dims.length),w=B("inputIndices",e[1].dataType,e[1].dims.length),k=B("scales",e[2].dataType,e[2].dims.length),S=e.length>3?B("zeroPoint",e[3].dataType,e[3].dims.length):void 0,_=j("output",p,u.length),I=[y,w,k];S&&I.push(S);let T=[{name:"output_size",type:"u32"},{name:"quantize_axis",type:"u32"},{name:"gather_axis",type:"u32"},{name:"block_size",type:"u32"}];return`
        ${b.registerUniforms(T).declareVariables(...I,_)}
        ${b.mainStart()}
        let output_indices = ${_.offsetToIndices("global_idx")};
        var indices_indices = ${w.type.indices}(0);
        ${i.length>1?`
          for (var i: u32 = 0; i < ${i.length}; i++) {
            let index = ${_.indicesGet("output_indices","uniforms.gather_axis + i")};
            ${w.indicesSet("indices_indices","i","index")};
          }`:`indices_indices = ${_.indicesGet("output_indices","uniforms.gather_axis")};`};
        var data_indices = ${y.type.indices}(0);
        for (var i: u32 = 0; i < uniforms.gather_axis; i++) {
          let index = ${_.indicesGet("output_indices","i")};
          ${y.indicesSet("data_indices","i","index")};
        }
        var index_from_indices = ${w.getByIndices("indices_indices")};
        if (index_from_indices < 0) {
          index_from_indices += ${r[a]};
        }
        ${y.indicesSet("data_indices","uniforms.gather_axis","u32(index_from_indices)")};
        for (var i = uniforms.gather_axis + 1; i < ${u.length}; i++) {
          let index = ${_.indicesGet("output_indices",`i + ${i.length} - 1`)};
          ${y.indicesSet("data_indices","i","index")};
        }
        let data_offset = ${y.indicesToOffset("data_indices")};
        let data_index = data_offset % 8;
        // Convert 4-bit packed data to 8-bit packed data.
        let packed_4bit_quantized_data = ${y.getByOffset("data_offset / 8")};
        let packed_8bit_quantized_data = (packed_4bit_quantized_data >> (4 * (data_index % 2))) & 0x0f0f0f0f;
        let quantized_data_vec = ${h?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_quantized_data));
        let quantized_data = quantized_data_vec[data_index / 2];
        var scale_indices = data_indices;
        let quantize_axis_index = ${k.indicesGet("data_indices","uniforms.quantize_axis")} / uniforms.block_size;
        ${k.indicesSet("scale_indices","uniforms.quantize_axis","quantize_axis_index")};
        var scale = ${k.getByIndices("scale_indices")};
        ${S?`
              let zero_point_indices = scale_indices;
              let zero_point_offset = ${S.indicesToOffset("zero_point_indices")};
              let zero_point_index = zero_point_offset % 8;
              let packed_4bit_zero_points = ${S.getByOffset("zero_point_offset / 8")};
              let packed_8bit_zero_points = (packed_4bit_zero_points >> (4 * (zero_point_index % 2))) & 0x0f0f0f0f;
              let zero_point_vec = ${h?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_zero_points));
              let zero_point = zero_point_vec[zero_point_index / 2];`:"var zero_point = 0"};
        let dequantized_data = ${Ce(p)}(quantized_data - zero_point) * scale;
        ${_.setByOffset("global_idx","dequantized_data")};
    }`};return{name:"GatherBlockQuantized",shaderCache:{hint:`${t.cacheKey};${e.filter((b,y)=>y!==1).map((b)=>b.dims.join("_")).join(";")}`,inputDependencies:Array.from({length:e.length},(b,y)=>"rank")},getRunData:()=>({outputs:[{dims:u,dataType:p}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:c}),getShaderSource:g}},rf=(e,t)=>{let r=e.inputs;Yl(r,t),e.compute(Xl(e.inputs,t))},nf=(e)=>fe({blockSize:e.blockSize,gatherAxis:e.gatherAxis,quantizeAxis:e.quantizeAxis})}),Uy=U(()=>{ee(),ie(),Te(),ne(),Ql=(e)=>{if(!e||e.length!==2)throw Error("GatherElements requires 2 inputs.");if(e[0].dims.length<1)throw Error("GatherElements requires that the data input be rank >= 1.");if(e[0].dims.length!==e[1].dims.length)throw Error(`GatherElements requires that the data input and
                     indices input tensors be of same rank.`)},Jl=(e,t)=>{let r=e[0].dims,i=e[0].dataType,n=r.length,a=e[1].dims,s=e[1].dataType,u=M.normalizeAxis(t.axis,n),l=r[u],p=a.slice(0),h=M.size(p),c=B("input",i,n),g=B("indicesInput",s,a.length),b=j("output",i,p.length),y=[{type:12,data:h},{type:6,data:l},{type:12,data:u}];return y.push(...X(r,a,p)),{name:"GatherElements",shaderCache:{inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:p,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(h/64)},programUniforms:y}),getShaderSource:(w)=>`
      ${w.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(c,g,b)}
      ${w.mainStart()}
      ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

      let outputIndices = ${b.offsetToIndices("global_idx")};

      var idx = ${g.getByOffset("global_idx")};
      if (idx < 0) {
        idx = idx + uniforms.axisDimLimit;
      }
      var inputIndices = ${c.type.indices}(outputIndices);
      ${c.indicesSet("inputIndices","uniforms.axis","u32(idx)")};
      let value = ${c.getByIndices("inputIndices")};

      ${b.setByOffset("global_idx","value")};
  }`}},af=(e)=>fe({axis:e.axis}),sf=(e,t)=>{let r=e.inputs;Ql(r),e.compute(Jl(e.inputs,t))}}),Ly=U(()=>{ee(),ie(),ne(),ed=(e)=>{if(!e)throw Error("Input is missing");if(e.length<2||e.length>3)throw Error("Invaid input number.");if(e.length===3&&e[2].dims.length>2)throw Error("Invalid input shape of C");if(e[0].dataType!==e[1].dataType||e.length===3&&e[0].dataType!==e[2].dataType)throw Error("Input types are mismatched")},td=(e,t)=>{let r=e[0].dims.slice(),i=e[1].dims.slice(),[n,a,s]=tc.getShapeOfGemmResult(r,t.transA,i,t.transB,e.length===3?e[2].dims:void 0),u=[n,a];if(!u)throw Error("Can't use gemm on the given tensors");let l=16,p=Math.ceil(a/l),h=Math.ceil(n/l),c=!0,g=M.size(u),b=[{type:12,data:c?p:g},{type:12,data:n},{type:12,data:a},{type:12,data:s},{type:1,data:t.alpha},{type:1,data:t.beta}],y=["type","type"];e.length===3&&(b.push(...X(e[2].dims)),y.push("rank")),b.push(...X(u));let w=(S)=>{let _="";t.transA&&t.transB?_="value += a[k * uniforms.M + m] * b[n * uniforms.K + k];":t.transA&&!t.transB?_="value += a[k * uniforms.M + m] * b[k * uniforms.N + n];":!t.transA&&t.transB?_="value += a[m * uniforms.K + k] * b[n * uniforms.K + k];":!t.transA&&!t.transB&&(_="value += a[m * uniforms.K + k] * b[k * uniforms.N + n];");let I=t.alpha===1?"":"value *= uniforms.alpha;",T=B("a",e[0].dataType,e[0].dims),C=B("b",e[1].dataType,e[1].dims),A=T.type.value,O=null,v=[T,C];e.length===3&&(O=B("c",e[2].dataType,e[2].dims.length),v.push(O));let N=j("output",e[0].dataType,u.length);v.push(N);let q=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}];return`
  ${S.registerUniforms(q).declareVariables(...v)}

  ${S.mainStart()}
    ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let m = global_idx / uniforms.N;
    let n = global_idx % uniforms.N;

    var value = ${A}(0);
    for (var k: u32 = 0u; k < uniforms.K; k++) {
      ${_}
    }

    ${I}
    ${O!=null?`let cOffset = ${O.broadcastedIndicesToOffset("vec2(m, n)",N)}; value += ${A}(uniforms.beta) * ${O.getByOffset("cOffset")};`:""}
    output[global_idx] = value;
  }`},k=(S)=>{let _=B("a",e[0].dataType,e[0].dims),I=B("b",e[1].dataType,e[1].dims),T=null,C=[_,I];e.length===3&&(T=B("c",e[2].dataType,e[2].dims.length),C.push(T));let A=j("output",e[0].dataType,u.length);C.push(A);let O=[{name:"num_tile_n",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}],v="",N="";t.transA&&t.transB?(N=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${_.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${I.type.value}(0);
      }
      `,v="value += tile_a[k][local_id.y] * tile_b[local_id.x][k];"):t.transA&&!t.transB?(N=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${_.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${I.type.value}(0);
      }
      `,v="value += tile_a[k][local_id.y] * tile_b[k][local_id.x];"):!t.transA&&t.transB?(N=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${_.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${I.type.value}(0);
      }
      `,v="value += tile_a[local_id.y][k] * tile_b[local_id.x][k];"):!t.transA&&!t.transB&&(N=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${_.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${I.type.value}(0);
      }
      `,v="value += tile_a[local_id.y][k] * tile_b[k][local_id.x];");let q=t.alpha===1?"":"value *= uniforms.alpha;";return`
  ${S.registerUniforms(O).declareVariables(...C)}
  var<workgroup> tile_a: array<array<${_.type.storage}, ${l}>, ${l}>;
  var<workgroup> tile_b: array<array<${I.type.storage}, ${l}>, ${l}>;
  ${S.mainStart([l,l,1])}
    let tile_col_start = (workgroup_index % uniforms.num_tile_n) * ${l};
    let tile_row_start = (workgroup_index / uniforms.num_tile_n) * ${l};
    let num_tiles = (uniforms.K - 1) / ${l} + 1;
    var k_start = 0u;
    var value = ${A.type.value}(0);
    for (var t: u32 = 0u; t < num_tiles; t++) {
      ${N}
      k_start = k_start + ${l};
      workgroupBarrier();

      for (var k: u32 = 0u; k < ${l}; k++) {
        ${v}
      }
      workgroupBarrier();
    }

    ${q}
    let m = tile_row_start + local_id.y;
    let n = tile_col_start + local_id.x;
    ${T!=null?`let cOffset = ${T.broadcastedIndicesToOffset("vec2(m, n)",A)}; value += ${A.type.value}(uniforms.beta) * ${T.getByOffset("cOffset")};`:""}
    if (m < uniforms.M && n < uniforms.N) {
      output[m * uniforms.N + n] = value;
    }
  }`};return c?{name:"GemmShared",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:y},getRunData:()=>({outputs:[{dims:u,dataType:e[0].dataType}],dispatchGroup:{x:p*h},programUniforms:b}),getShaderSource:k}:{name:"Gemm",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:y},getRunData:()=>({outputs:[{dims:u,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:b}),getShaderSource:w}},of=(e)=>{let{transA:t,transB:r,alpha:i,beta:n}=e;return{transA:t,transB:r,alpha:i,beta:n,cacheKey:`${e.transA};${e.transB};${e.alpha===1}`}},uf=(e,t)=>{ed(e.inputs),e.compute(td(e.inputs,t))}}),qy=U(()=>{ee(),ie(),Te(),ne(),[tt,at,It,Ct]=[0,1,2,3],rd=(e)=>{if(e[0].dims.length!==4)throw Error("only 4-D tensor is supported.");if(e[0].dims.length!==e[1].dims.length)throw Error("input dimensions must be equal to grid dimensions");if(e[0].dims.length-2!==e[1].dims[e[1].dims.length-1])throw Error(`last dimension of grid must be equal to ${e[0].dims.length-2}`);if(e[0].dims[0]!==e[1].dims[0])throw Error("grid batch size must match input batch size")},id=`
  fn gs_get_cubic_coeffs(x: f32) -> vec4<f32> {
    let cubic_alpha = -0.75f;
    let x_abs = abs(x);
    var coeffs: vec4<f32>;
    coeffs[0] = (((cubic_alpha * (x_abs + 1) - 5 * cubic_alpha) * (x_abs + 1) + 8 * cubic_alpha) * (x_abs + 1) - 4 * cubic_alpha);
    coeffs[1] = (((cubic_alpha + 2) * x_abs - (cubic_alpha + 3)) * x_abs * x_abs + 1);
    coeffs[2] = (((cubic_alpha + 2) * (1 - x_abs) - (cubic_alpha + 3)) * (1 - x_abs) * (1 - x_abs) + 1);
    coeffs[3] = (((cubic_alpha * (2 - x_abs) - 5 * cubic_alpha) * (2 - x_abs) + 8 * cubic_alpha) * (2 - x_abs) - 4 * cubic_alpha);
    return coeffs;
  }
`,nd=(e)=>`
  fn gs_bicubic_interpolate(p: mat4x4<${e}>, x: f32, y: f32) -> ${e} {
    var v: vec4<f32>;
    var coeffs = gs_get_cubic_coeffs(x);
    for (var i = 0; i < 4; i++) {
      v[i] = coeffs[0] * p[i][0] + coeffs[1] * p[i][1] + coeffs[2] * p[i][2] + coeffs[3] * p[i][3];
    }
    coeffs = gs_get_cubic_coeffs(y);
    let pixel = ${e}(coeffs[0] * v[0] + coeffs[1] * v[1] + coeffs[2] * v[2] + coeffs[3] * v[3]);
    return pixel;
  }
`,ad=(e)=>`
  fn gs_denormalize(n: f32, length: i32) -> f32 {
    ${e.alignCorners===0?`
    // alignCorners: false => [-1, 1] to [-0.5, length - 0.5]
    return ((n + 1.0) * f32(length) - 1.0) / 2.0;
    `:`
    // alignCorners: true => [-1, 1] to [0, length - 1]
    return (n + 1.0) / 2.0 * (f32(length - 1));
    `}
  }
`,sd=(e)=>`
  ${e.paddingMode==="reflection"?`
      fn gs_reflect(x: i32, x_min: f32, x_max: f32) -> u32 {
        var dx = 0.0;
        var fx = f32(x);
        let range = x_max - x_min;
        if (fx < x_min) {
          dx = x_min - fx;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_min + r;
          } else {
            fx = x_max - r;
          }
        } else if (fx > x_max) {
          dx = fx - x_max;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_max - r;
          } else {
            fx = x_min + r;
          }
        }
        return u32(fx);
      }`:""}
`,od=(e,t,r)=>`
  fn pixel_at_grid(r: i32, c: i32, H: i32, W: i32, batch: u32, channel: u32, border: vec4<f32>) -> ${t} {
     var pixel = ${t}(0);
     var indices = vec4<u32>(0);
     indices[${tt}] = batch;
     indices[${at}] = channel;`+(()=>{switch(r.paddingMode){case"zeros":return`
          if (r >= 0 && r < H && c >=0 && c < W) {
            indices[${It}] = u32(r);
            indices[${Ct}] = u32(c);
          } else {
            return ${t}(0);
          }
        `;case"border":return`
          indices[${It}] = u32(clamp(r, 0, H - 1));
          indices[${Ct}] = u32(clamp(c, 0, W - 1));
        `;case"reflection":return`
          indices[${It}] = gs_reflect(r, border[1], border[3]);
          indices[${Ct}] = gs_reflect(c, border[0], border[2]);
        `;default:throw Error(`padding mode ${r.paddingMode} is not supported`)}})()+`
    return ${e.getByIndices("indices")};
  }
`,ud=(e,t,r)=>(()=>{switch(r.mode){case"nearest":return`
          let result = pixel_at_grid(i32(round(y)), i32(round(x)), H_in, W_in, indices[${tt}], indices[${at}], border);
        `;case"bilinear":return`
          let x1 = i32(floor(x));
          let y1 = i32(floor(y));
          let x2 = x1 + 1;
          let y2 = y1 + 1;

          let p11 = pixel_at_grid(y1, x1, H_in, W_in, indices[${tt}], indices[${at}], border);
          let p12 = pixel_at_grid(y1, x2, H_in, W_in, indices[${tt}], indices[${at}], border);
          let p21 = pixel_at_grid(y2, x1, H_in, W_in, indices[${tt}], indices[${at}], border);
          let p22 = pixel_at_grid(y2, x2, H_in, W_in, indices[${tt}], indices[${at}], border);

          let dx2 = ${t}(f32(x2) - x);
          let dx1 = ${t}(x - f32(x1));
          let dy2 = ${t}(f32(y2) - y);
          let dy1 = ${t}(y - f32(y1));
          let result = dy2 * (dx2 * p11 + dx1 * p12) + dy1 * (dx2 * p21 + dx1 * p22);
        `;case"bicubic":return`
          let x0 = i32(floor(x)) - 1;
          let y0 = i32(floor(y)) - 1;
          var p: mat4x4<${t}>;
          for (var h = 0; h < 4; h++) {
            for (var w = 0; w < 4; w++) {
              p[h][w] = pixel_at_grid(h + y0, w + x0, H_in, W_in, indices[${tt}], indices[${at}], border);
            }
          }

          let dx = x - f32(x0 + 1);
          let dy = y - f32(y0 + 1);
          let result = gs_bicubic_interpolate(p, dx, dy);
        `;default:throw Error(`mode ${r.mode} is not supported`)}})()+`${e.setByOffset("global_idx","result")}`,ld=(e,t)=>{let r=B("x",e[0].dataType,e[0].dims.length),i=[e[1].dims[0],e[1].dims[1],e[1].dims[2]],n=B("grid",e[1].dataType,i.length,2),a=[e[0].dims[0],e[0].dims[1],e[1].dims[1],e[1].dims[2]];t.format==="NHWC"&&(a=[e[0].dims[0],e[1].dims[1],e[1].dims[2],e[0].dims[3]],[tt,at,It,Ct]=[0,3,1,2]);let s=j("output",e[0].dataType,a.length),u=r.type.value,l=M.size(a),p=[{type:12,data:l},...X(e[0].dims,i,a)],h=(c)=>`
  ${c.registerUniform("output_size","u32").declareVariables(r,n,s)}
  ${id}
  ${nd(u)}
  ${ad(t)}
  ${sd(t)}
  ${od(r,u,t)}

  ${c.mainStart()}
    ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let H_in = i32(uniforms.x_shape[${It}]);
      let W_in = i32(uniforms.x_shape[${Ct}]);

      ${t.alignCorners===0?`
      let x_min = -0.5;
      let x_max = f32(W_in) - 0.5;
      let y_min = -0.5;
      let y_max = f32(H_in) - 0.5;
      `:`
      let x_min = 0.0;
      let x_max = f32(W_in) - 1.0;
      let y_min = 0.0;
      let y_max = f32(H_in) - 1.0;
      `};
      let border = vec4<f32>(x_min, y_min, x_max, y_max);

      let indices = ${s.offsetToIndices("global_idx")};
      var grid_indices = vec3<u32>(indices[${tt}], indices[${It}], indices[${Ct}]);
      let nxy = ${n.getByIndices("grid_indices")};
      var x = gs_denormalize(f32(nxy[0]), W_in);
      var y = gs_denormalize(f32(nxy[1]), H_in);

      ${ud(s,u,t)}
  }`;return{name:"GridSample",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:["type","type"]},getRunData:(c)=>{let g=M.size(a);return{outputs:[{dims:a,dataType:c[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:p}},getShaderSource:h}},lf=(e,t)=>{rd(e.inputs),e.compute(ld(e.inputs,t))},df=(e)=>fe({alignCorners:e.align_corners,mode:e.mode,paddingMode:e.padding_mode,format:e.format})}),hf=U(()=>{ee(),ie(),Te(),ha(),ga(),ne(),$t(),Me=(e,t)=>e.length>t&&e[t].dims.length>0?e[t]:void 0,dd=(e,t)=>{let r=e[0],i=Me(e,1),n=Me(e,2),a=Me(e,3),s=Me(e,4),u=Me(e,5),l=Me(e,6),p=Me(e,7);if(r.dims.length!==3&&r.dims.length!==5)throw Error("Input query is expected to have 3 or 5 dimensions");let h=r.dims[0],c=r.dims[1],g=r.dims.length===3?r.dims[2]:t.numHeads*r.dims[4],b=c,y=0,w=0,k=Math.floor(g/t.numHeads);if(l&&p&&M.size(l.dims)&&M.size(p.dims)){if(l.dims.length!==4)throw Error('Input "past_key" is expected to have 4 dimensions');if(l.dims[0]!==h||l.dims[1]!==t.numHeads||l.dims[3]!==k)throw Error('Input "past_key" shape (batch_size, num_heads, past_sequence_length, head_size)');if(p.dims[0]!==h||p.dims[1]!==t.numHeads||p.dims[3]!==k)throw Error('Input "past_value" shape (batch_size, num_heads, past_sequence_length, head_size)');if(l.dims[2]!==p.dims[2])throw Error('Input "past_key" and "past_value" shall have same dim 2 (past_sequence_length)');if(p.dims.length!==4)throw Error('Input "past_value" is expected to have 4 dimensions');y=l.dims[2],w=l.dims[2]}else if(l&&M.size(l.dims)||p&&M.size(p.dims))throw Error('Input "past_key" and "past_value" shall be both present or both absent');let S;if(i&&M.size(i.dims)>0){if(r.dims.length!==3)throw Error('Input "query" is expected to have 3 dimensions when key is given');if(i.dims.length<3||i.dims.length>5)throw Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==i.dims[0])throw Error('Input "query" and "key" shall have same dim 0 (batch size)');if(i.dims.length===3){if(i.dims[2]!==r.dims[2])throw Error('Input "query" and "key" shall have same dim 2 (hidden_size)');S=2,b=i.dims[1]}else if(i.dims.length===5){if(i.dims[2]!==t.numHeads||i.dims[3]!==2||i.dims[4]!==k)throw Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(n)throw Error('Expect "value" be none when "key" has packed kv format.');S=5,b=i.dims[1]}else{if(i.dims[1]!==t.numHeads||i.dims[3]!==k)throw Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');S=0,b=i.dims[2]}}else{if(r.dims.length!==5)throw Error('Input "query" is expected to have 5 dimensions when key is empty');if(r.dims[2]!==t.numHeads||r.dims[3]!==3)throw Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');S=3}if(a&&M.size(a.dims)>0){if(a.dims.length!==1)throw Error('Input "bias" is expected to have 1 dimension');if(i&&i.dims.length===5&&i.dims[3]===2)throw Error("bias is not allowed for packed kv.")}let _=y+b,I=0;if(s&&M.size(s.dims)>0){I=8;let O=s.dims;throw O.length===1?O[0]===h?I=1:O[0]===3*h+2&&(I=3):O.length===2&&O[0]===h&&O[1]===_&&(I=5),I===8?Error('Input "key_padding_mask" shape shall be (batch_size) or (batch_size, total_sequence_length)'):Error("Mask not supported")}let T=!1,C=g;if(n&&M.size(n.dims)>0){if(n.dims.length!==3&&n.dims.length!==4)throw Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==n.dims[0])throw Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(n.dims.length===3){if(b!==n.dims[1])throw Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');C=n.dims[2]}else{if(b!==n.dims[2])throw Error('Input "key" and "value" shall have the same dim 2 (kv_sequence_length)');C=n.dims[1]*n.dims[3],T=!0}}let A=!1;if(s&&M.size(s.dims)>0)throw Error("Key padding mask is not supported");if(u&&M.size(u.dims)>0){if(u.dims.length!==4)throw Error('Input "attention_bias" is expected to have 4 dimensions');if(u.dims[0]!==h||u.dims[1]!==t.numHeads||u.dims[2]!==c||u.dims[3]!==_)throw Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:h,sequenceLength:c,pastSequenceLength:y,kvSequenceLength:b,totalSequenceLength:_,maxSequenceLength:w,inputHiddenSize:0,hiddenSize:g,vHiddenSize:C,headSize:k,vHeadSize:Math.floor(C/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:I,scale:t.scale,broadcastResPosBias:A,passPastInKv:T,qkvFormat:S}},pf=(e)=>fe({...e}),vn=fe({perm:[0,2,1,3]}),pd=(e,t,r,i,n,a,s)=>{let u=[i,n,a],l=M.size(u),p=[{type:12,data:l},{type:12,data:s},{type:12,data:a}],h=(c)=>{let g=j("qkv_with_bias",t.dataType,u),b=B("qkv",t.dataType,u),y=B("bias",r.dataType,u),w=[{name:"output_size",type:"u32"},{name:"bias_offset",type:"u32"},{name:"hidden_size",type:"u32"}];return`
  ${c.registerUniforms(w).declareVariables(b,y,g)}
  ${c.mainStart()}
    ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let bias_offset_idx = (global_idx % uniforms.hidden_size) + uniforms.bias_offset;

    qkv_with_bias[global_idx] = qkv[global_idx] + bias[bias_offset_idx];
  }`};return e.compute({name:"MultiHeadAttentionAddBias",shaderCache:{inputDependencies:["type","type"]},getRunData:()=>({outputs:[{dims:u,dataType:t.dataType,gpuDataType:0}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:p}),getShaderSource:h},{inputs:[t,r],outputs:[-1]})[0]},_r=(e,t,r,i,n,a,s,u)=>{let l=a;if(s&&M.size(s.dims)>0){if(i===1)throw Error("AddBiasReshape is not implemented. Please export your model with packed QKV or KV");return l=pd(e,a,s,t,i,r*n,u),l=l.reshape([t,i,r,n]),r===1||i===1?l:e.compute(Pe(l,vn.perm),{inputs:[l],outputs:[-1]})[0]}else return a.dims.length===3&&(l=a.reshape([t,i,r,n])),r===1||i===1?l:e.compute(Pe(l,vn.perm),{inputs:[l],outputs:[-1]})[0]},cf=(e,t)=>{let r=dd(e.inputs,t),i=e.inputs[0],n=Me(e.inputs,1),a=Me(e.inputs,2),s=Me(e.inputs,3),u=Me(e.inputs,4),l=Me(e.inputs,5),p=Me(e.inputs,6),h=Me(e.inputs,7);if(i.dims.length===5)throw Error("Packed QKV is not implemented");if(n?.dims.length===5)throw Error("Packed KV is not implemented");let c=n&&a&&n.dims.length===4&&a.dims.length===4,g=_r(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,i,s,0);if(c)return xr(e,g,n,a,u,void 0,p,h,l,r);if(!n||!a)throw Error("key and value must be provided");let b=_r(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.headSize,n,s,r.hiddenSize),y=_r(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.vHeadSize,a,s,2*r.hiddenSize);xr(e,g,b,y,u,void 0,p,h,l,r)}}),gf=U(()=>{ee(),ie(),Te(),ne(),cd=(e)=>{if(!e||e.length<1)throw Error("too few inputs")},hd=(e,t)=>{let r=[],i=t.numOutputs;return e[1].dims[0]>0&&(e[1].getBigInt64Array().forEach((n)=>r.push(Number(n))),i=r.length),fe({numOutputs:i,axis:t.axis,splitSizes:r})},fd=(e)=>`
fn calculateOutputIndex(index: u32) -> u32 {
    for (var i: u32 = 0u; i < ${e}u; i += 1u ) {
    if (index < ${Z("uniforms.size_in_split_axis","i",e)}) {
        return i;
    }
    }
    return ${e}u;
}`,md=(e)=>{let t=e.length,r=[];for(let i=0;i<t;++i){let n=e[i].setByIndices("indices","input[global_idx]");t===1?r.push(n):i===0?r.push(`if (output_number == ${i}u) { ${n} }`):i===t-1?r.push(`else { ${n} }`):r.push(`else if (output_number == ${i}) { ${n} }`)}return`
      fn writeBufferData(output_number: u32, indices: ${e[0].type.indices}, global_idx: u32) {
        ${r.join(`
`)}
      }`},Qn=(e,t)=>{let r=e[0].dims,i=M.size(r),n=e[0].dataType,a=M.normalizeAxis(t.axis,r.length),s=Array(t.numOutputs),u=B("input",n,r.length),l=Array(t.numOutputs),p=[],h=[],c=0,g=[{type:12,data:i}];for(let y=0;y<t.numOutputs;y++){c+=t.splitSizes[y],l[y]=c;let w=r.slice();w[a]=t.splitSizes[y],h.push(w),s[y]=j(`output${y}`,n,w.length),p.push({dims:h[y],dataType:e[0].dataType})}g.push({type:12,data:l},...X(r,...h));let b=(y)=>`
  ${y.registerUniform("input_size","u32").registerUniform("size_in_split_axis","u32",l.length).declareVariables(u,...s)}
  ${fd(l.length)}
  ${md(s)}

  ${y.mainStart()}
    ${y.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.input_size")}

    var indices = ${u.offsetToIndices("global_idx")};
    var index = ${u.indicesGet("indices",a)};
    let output_number = calculateOutputIndex(index);
    if (output_number != 0) {
      index -= ${Z("uniforms.size_in_split_axis","output_number - 1u",l.length)};
      ${u.indicesSet("indices",a,"index")};
    }
    writeBufferData(output_number, indices, global_idx);
  }`;return{name:"Split",shaderCache:{hint:t.cacheKey,inputDependencies:["rank"]},getShaderSource:b,getRunData:()=>({outputs:p,dispatchGroup:{x:Math.ceil(i/64)},programUniforms:g})}},ff=(e,t)=>{cd(e.inputs);let r=e.inputs.length===1?t:hd(e.inputs,t);e.compute(Qn(e.inputs,r),{inputs:[0]})},mf=(e)=>{let{axis:t,splitSizes:r}=e,i=e.numOutputs<0?r.length:e.numOutputs;if(i!==r.length)throw Error("numOutputs and splitSizes length must be equal");return fe({axis:t,numOutputs:i,splitSizes:r})}}),bf=U(()=>{ee(),ie(),Te(),ne(),gd=(e,t)=>{let[r,i,n,a]=e,{numHeads:s,rotaryEmbeddingDim:u}=t;if(r.dims.length!==3&&r.dims.length!==4)throw Error(`Input 'x' is expected to have 3 or 4 dimensions, got ${r.dims.length}`);if(!M.areEqual(i.dims,[])&&!M.areEqual(i.dims,[1])&&i.dims.length!==2)throw Error(`Input 'position_ids' is expected to have 0, 1, or 2 dimensions, got ${i.dims.length}`);if(n.dims.length!==2)throw Error(`Input 'cos_cache' is expected to have 2 dimensions, got ${n.dims.length}`);if(a.dims.length!==2)throw Error(`Input 'sin_cache' is expected to have 2 dimensions, got ${a.dims.length}`);if(!M.areEqual(n.dims,a.dims))throw Error("Inputs 'cos_cache' and 'sin_cache' are expected to have the same shape");if(u>0&&s===0)throw Error("num_heads must be provided if rotary_embedding_dim is specified");let l=r.dims[0],p=r.dims[r.dims.length-2],h=n.dims[0],c=M.sizeFromDimension(r.dims,1)/p,g=u===0?n.dims[1]*2:c/s;if(u>g)throw Error("rotary_embedding_dim must be less than or equal to head_size");if(i.dims.length===2){if(l!==i.dims[0])throw Error(`Input 'position_ids' dimension 0 should be of size batch_size, got ${i.dims[0]}`);if(p!==i.dims[1])throw Error(`Input 'position_ids' dimension 1 should be of size sequence_length, got ${i.dims[1]}`)}if(p>h)throw Error("Updating cos_cache and sin_cache in RotaryEmbedding is not currently supported");if(g/2!==n.dims[1]&&u/2!==n.dims[1])throw Error(`Input 'cos_cache' dimension 1 should be same as head_size / 2 or rotary_embedding_dim / 2, got ${n.dims[1]}`)},ui=(e,t)=>{let{interleaved:r,numHeads:i,rotaryEmbeddingDim:n,scale:a}=t,s=e[0].dims[0],u=M.sizeFromDimension(e[0].dims,1),l=e[0].dims[e[0].dims.length-2],p=u/l,h=e[2].dims[1],c=n===0?h*2:p/i,g=[s,l,p/c,c-h],b=M.computeStrides(g),y=[{type:1,data:a},{type:12,data:g},{type:12,data:b},...e[0].dims.length===3?[{type:12,data:[u,p,c,1]}]:[],...e[0].dims.length===4?[{type:12,data:[u,c,l*c,1]}]:[],...X(e[0].dims,e[1].dims,e[2].dims,e[3].dims,e[0].dims)],w=(k)=>{let S=B("input",e[0].dataType,e[0].dims.length),_=B("position_ids",e[1].dataType,e[1].dims.length),I=B("cos_cache",e[2].dataType,e[2].dims.length),T=B("sin_cache",e[3].dataType,e[3].dims.length),C=j("output",e[0].dataType,e[0].dims.length);return k.registerUniforms([{name:"scale",type:"f32"},{name:"global_shape",type:"u32",length:g.length},{name:"global_strides",type:"u32",length:b.length},{name:"input_output_strides",type:"u32",length:b.length}]),`
        ${k.declareVariables(S,_,I,T,C)}

        ${k.mainStart(Zt)}
          let half_rotary_emb_dim = uniforms.${I.name}_shape[1];
          let bsnh = global_idx / uniforms.global_strides % uniforms.global_shape;
          let size = uniforms.global_shape[0] * uniforms.global_strides[0];
          ${k.guardAgainstOutOfBoundsWorkgroupSizes("size")}

          if (bsnh[3] < half_rotary_emb_dim) {
            let position_ids_idx =
                ${_.broadcastedIndicesToOffset("bsnh.xy",j("",_.type.tensor,2))};
            let position_id =
                u32(${_.getByOffset("position_ids_idx")}) + select(0, bsnh[1], position_ids_idx == 0);
            let i = dot(bsnh, uniforms.input_output_strides) + select(0, bsnh[3], ${r});
            let j = i + select(half_rotary_emb_dim, 1, ${r});
            let re = ${S.getByOffset("i")} * ${I.get("position_id","bsnh[3]")} -
                ${S.getByOffset("j")} * ${T.get("position_id","bsnh[3]")};
            ${C.setByOffset("i","re")}
            let im = ${S.getByOffset("i")} * ${T.get("position_id","bsnh[3]")} +
                ${S.getByOffset("j")} * ${I.get("position_id","bsnh[3]")};
            ${C.setByOffset("j","im")}
          } else {
            let k = dot(bsnh, uniforms.input_output_strides) + half_rotary_emb_dim;
            ${C.setByOffset("k",S.getByOffset("k"))}
          }
        }`};return{name:"RotaryEmbedding",shaderCache:{hint:fe({interleaved:r}).cacheKey,inputDependencies:["rank","rank","rank","rank"]},getShaderSource:w,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(M.size(g)/Zt)},programUniforms:y})}},yf=(e,t)=>{gd(e.inputs,t),e.compute(ui(e.inputs,t))}}),Vy=U(()=>{Te(),ee(),ga(),hf(),gf(),$t(),bf(),ne(),yd=(e,t)=>{if(t.doRotary&&e.length<=7)throw Error("cos_cache and sin_cache inputs are required if do_rotary is specified");let r=e[0],i=e[1],n=e[2],a=e[3],s=e[4];if(t.doRotary!==0&&e.length<=7)throw Error("cos_cast and sin_cache are expected if do_rotary attribute is non-zero");if(t.localWindowSize!==-1)throw Error("Local attention is not supported");if(t.softcap!==0)throw Error("Softcap is not supported");if(t.rotaryInterleaved!==0)throw Error("Rotary interleaved is not supported");if(t.smoothSoftmax)throw Error("Smooth softmax is not supported");if(r.dims.length!==3&&r.dims.length!==5)throw Error("Input query is expected to have 3 or 5 dimensions");let u=!1,l=r.dims[0],p=r.dims[1],h=r.dims.length===3?u?r.dims[2]/3:r.dims[2]:t.numHeads*r.dims[4],c=p,g=0,b=!i||i.dims.length===0,y=Math.floor(b?h/(t.numHeads+2*t.kvNumHeads):h/t.numHeads);b&&(h=y*t.numHeads);let w=a&&a.dims.length!==0,k=s&&s.dims.length!==0;if(w&&a.dims.length===4&&a.dims[0]===l&&a.dims[1]!==t.kvNumHeads&&a.dims[2]===t.kvNumHeads&&a.dims[3]===y)throw Error("BSNH pastKey/pastValue is not supported");if(w&&k){if(a.dims.length!==4)throw Error('Input "past_key" is expected to have 4 dimensions');if(s.dims.length!==4)throw Error('Input "past_value" is expected to have 4 dimensions');g=a.dims[2]}else if(w||k)throw Error('Input "past_key" and "past_value" shall be both present or both absent');let S=1;if(i&&i.dims.length>0){if(r.dims.length!==3)throw Error('Input "query" is expected to have 3 dimensions when key is given');if(i.dims.length<3||i.dims.length>5)throw Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==i.dims[0])throw Error('Input "query" and "key" shall have same dim 0 (batch size)');if(i.dims.length===3){if(r.dims[2]%i.dims[2]!==0)throw Error('Dimension 2 of "query" should be a multiple of "key"');c=i.dims[1]}else if(i.dims.length===5){if(i.dims[2]!==t.numHeads||i.dims[3]!==2||i.dims[4]!==y)throw Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(n)throw Error('Expect "value" be none when "key" has packed kv format.');c=i.dims[1]}else{if(i.dims[1]!==t.numHeads||i.dims[3]!==y)throw Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');c=i.dims[2]}}else{if(r.dims.length!==3&&r.dims.length!==5)throw Error('Input "query" is expected to have 3 or 5 dimensions when key is empty');if(r.dims.length===5&&(r.dims[2]!==t.numHeads||r.dims[3]!==3))throw Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');S=3}let _=0,I=!1,T=t.kvNumHeads?y*t.kvNumHeads:h;if(n&&n.dims.length>0){if(n.dims.length!==3&&n.dims.length!==4)throw Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==n.dims[0])throw Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(n.dims.length===3){if(c!==n.dims[1])throw Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');T=n.dims[2]}else{if(c!==n.dims[2])throw Error('Input "past_key" and "past_value" shall have the same dim 2 (kv_sequence_length)');T=n.dims[1]*n.dims[3],I=!0}}let C=e.length>4?e[5]:void 0;if(C){if(C.dims.length===0)throw Error("seqlens_k must be at least 1D, got scalar.");let A=C.dims.reduce((O,v)=>O*v,1);if(A!==l)throw Error(`seqlens_k must have batch_size (${l}) elements, got ${A}.`);for(let O=0;O<C.dims.length;O++)if(C.dims[O]!==1&&C.dims[O]!==l)throw Error(`seqlens_k has unexpected shape. Each dimension must be 1 or batch_size (${l}), got dims[${O}] = ${C.dims[O]}.`)}return{batchSize:l,sequenceLength:p,pastSequenceLength:g,kvSequenceLength:c,totalSequenceLength:-1,maxSequenceLength:-1,inputHiddenSize:0,hiddenSize:h,vHiddenSize:T,headSize:y,vHeadSize:Math.floor(T/t.kvNumHeads),numHeads:t.numHeads,kvNumHeads:t.kvNumHeads,nReps:t.numHeads/t.kvNumHeads,pastPresentShareBuffer:!1,maskType:_,scale:t.scale,broadcastResPosBias:!1,passPastInKv:I,qkvFormat:S}},bd=fe({perm:[0,2,1,3]}),$n=(e,t,r)=>{let i=t,n=r.kvNumHeads;return t.dims.length===3&&r.kvSequenceLength!==0&&(i=t.reshape([r.batchSize,r.kvSequenceLength,n,r.headSize]),i=e.compute(Pe(i,bd.perm),{inputs:[i],outputs:[-1]})[0]),i},_d=(e,t,r,i)=>{let n=7,a=["type","type"],s=[e*t],u=e*t,l=[{type:12,data:u},{type:12,data:t},{type:12,data:e}],p=(h)=>{let c=B("seq_lens",r.dataType,r.dims),g=B("total_seq_lens",i.dataType,i.dims),b=j("pos_ids",n,s),y=[{name:"output_size",type:"u32"},{name:"sequence_length",type:"u32"},{name:"batch_size",type:"u32"}];return`
  ${h.registerUniforms(y).declareVariables(c,g,b)}
  ${h.mainStart()}
    ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let total_sequence_length = u32(${g.getByOffset("0")});
    let is_subsequent_prompt = uniforms.sequence_length > 1 && uniforms.sequence_length != total_sequence_length;
    let is_first_prompt = !is_subsequent_prompt && uniforms.sequence_length == total_sequence_length;
    let batch_idx = global_idx / uniforms.sequence_length;
    let sequence_idx = i32(global_idx % uniforms.sequence_length);
    var pos_id: i32 = 0;
    let seqlen = ${c.getByOffset("batch_idx")};
    let total_seqlen = seqlen + 1;
    if (is_first_prompt) {
      if (sequence_idx < total_seqlen) {
        pos_id = sequence_idx;
      } else {
        pos_id = 1;
      }
      ${b.setByOffset("global_idx","pos_id")}
    } else if (is_subsequent_prompt) {
      let past_seqlen = total_seqlen - i32(uniforms.sequence_length);
      if (past_seqlen + sequence_idx < total_seqlen) {
        pos_id = past_seqlen + sequence_idx;
      } else {
        pos_id = 1;
      }
      ${b.setByOffset("global_idx","pos_id")}
    } else if (global_idx < uniforms.batch_size) {
      ${b.setByOffset("global_idx","seqlen")}
    };
  }
  `};return{name:"GeneratePositionIds",shaderCache:{hint:`${e};${t}`,inputDependencies:a},getRunData:()=>({outputs:[{dims:s,dataType:n}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:l}),getShaderSource:p}},_f=(e,t)=>{if(e.inputs.length>14&&e.inputs[14]||e.inputs.length>15&&e.inputs[15])throw Error("GroupQueryAttention (JSEP): q_norm_weight / k_norm_weight inputs are not supported. The per-head Q/K RMS normalization prologue is implemented only on the CUDA and native WebGPU EPs.");let r=yd(e.inputs,t);if(e.inputs[0].dims.length===5)throw Error("Packed QKV is not implemented");if(e.inputs[1]?.dims.length===5)throw Error("Packed KV is not implemented");let i=e.inputs[0],n=e.inputs[1]&&e.inputs[1].dims.length>0?e.inputs[1]:void 0,a=e.inputs[2]&&e.inputs[2].dims.length>0?e.inputs[2]:void 0,s=e.inputs[3]&&e.inputs[3].dims.length!==0?e.inputs[3]:void 0,u=e.inputs[4]&&e.inputs[4].dims.length!==0?e.inputs[4]:void 0,l=e.inputs.length>4?e.inputs[5]:void 0,p=e.inputs.length>5?e.inputs[6]:void 0,h=r.kvNumHeads?r.kvNumHeads:r.numHeads,c=fe({axis:2,numOutputs:3,splitSizes:[r.numHeads*r.headSize,h*r.headSize,h*r.headSize]}),[g,b,y]=!n&&!a?e.compute(Qn([i],c),{inputs:[i],outputs:[-1,-1,-1]}):[i,n,a],w,k;if(t.doRotary){let T=e.compute(_d(r.batchSize,r.sequenceLength,l,p),{inputs:[l,p],outputs:[-1]})[0],C=e.inputs[7],A=e.inputs[8],O=fe({interleaved:t.rotaryInterleaved!==0,numHeads:r.numHeads,rotaryEmbeddingDim:0,scale:t.scale}),v=[g,T,C,A],N=[-1];w=e.compute(ui(v,O),{inputs:v,outputs:N})[0],v.splice(0,1,b);let q=fe({interleaved:t.rotaryInterleaved!==0,numHeads:r.kvNumHeads,rotaryEmbeddingDim:0,scale:t.scale});k=e.compute(ui(v,q),{inputs:v,outputs:N})[0]}let S=_r(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,t.doRotary?w:g,void 0,0),_=$n(e,t.doRotary?k:b,r),I=$n(e,y,r);xr(e,S,_,I,void 0,void 0,s,u,void 0,r,l,p)}}),Wy=U(()=>{ee(),ie(),$t(),ne(),xn=(e,t,r,i,n,a,s,u)=>{let l=ke(a),p=l===1?"f32":`vec${l}f`,h=l===1?"vec2f":`mat2x${l}f`,c=n*s,g=64;c===1&&(g=256);let b=[n,s,a/l],y=[n,s,2],w=["rank","type","type"],k=[];k.push(...X(b,y));let S=(_)=>{let I=B("x",t.dataType,3,l),T=B("scale",r.dataType,r.dims),C=B("bias",i.dataType,i.dims),A=j("output",1,3,2),O=[I,T,C,A];return`
  var<workgroup> workgroup_shared : array<${h}, ${g}>;
  const workgroup_size = ${g}u;
  ${_.declareVariables(...O)}
  ${_.mainStart(g)}
    let batch = workgroup_index / uniforms.x_shape[1];
    let channel = workgroup_index % uniforms.x_shape[1];
    let hight = uniforms.x_shape[2];
    // initialize workgroup memory
    var sum = ${p}(0);
    var squared_sum = ${p}(0);
    for (var h = local_idx; h < hight; h += workgroup_size) {
      let value = ${p}(${I.get("batch","channel","h")});
      sum += value;
      squared_sum += value * value;
    }
    workgroup_shared[local_idx] = ${h}(sum, squared_sum);
    workgroupBarrier();

    for (var currSize = workgroup_size >> 1;  currSize > 0; currSize = currSize >> 1) {
      if (local_idx < currSize) {
        workgroup_shared[local_idx] = workgroup_shared[local_idx] + workgroup_shared[local_idx + currSize];
      }
      workgroupBarrier();
    }
    if (local_idx == 0) {
      let sum_final = ${vt("workgroup_shared[0][0]",l)} / f32(hight * ${l});
      let squared_sum_final = ${vt("workgroup_shared[0][1]",l)} / f32(hight * ${l});

      let inv_std_dev = inverseSqrt(squared_sum_final - sum_final * sum_final + f32(${u}));
      let channel_scale = inv_std_dev * f32(scale[channel]);
      let channel_shift = f32(bias[channel]) - sum_final * channel_scale;
      output[workgroup_index] = vec2f(channel_scale, channel_shift);
    }
  }`};return e.compute({name:"InstanceNormComputeChannelScaleShift",shaderCache:{hint:`${l};${u};${g}`,inputDependencies:w},getRunData:()=>({outputs:[{dims:y,dataType:1}],dispatchGroup:{x:c},programUniforms:k}),getShaderSource:S},{inputs:[t,r,i],outputs:[-1]})[0]},wd=(e,t,r)=>{let i=t[0].dims,n=i,a=2,s=i[0],u=i[1],l=M.sizeFromDimension(i,a),p=ke(l),h=M.size(n)/p,c=xn(e,t[0],t[1],t[2],s,l,u,r.epsilon),g=[s,u,l/p],b=[s,u],y=["type","none"],w=(k)=>{let S=B("x",t[0].dataType,g.length,p),_=B("scale_shift",1,b.length,2),I=j("output",t[0].dataType,g.length,p),T=[S,_,I];return`
  ${k.registerUniform("output_size","u32").declareVariables(...T)}
  ${k.mainStart()}
  ${k.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let outputIndices = ${I.offsetToIndices("global_idx")};
      let batch = outputIndices[0];
      let channel = outputIndices[1];
      let scale_shift = ${_.getByIndices("vec2<u32>(batch, channel)")};
      let value = ${S.getByOffset("global_idx")} * ${I.type.value}(scale_shift.x) + ${I.type.value}(scale_shift.y);
      ${I.setByOffset("global_idx","value")};
  }`};e.compute({name:"InstanceNormalization",shaderCache:{hint:`${p}`,inputDependencies:y},getRunData:()=>({outputs:[{dims:n,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(h/64)},programUniforms:[{type:12,data:h},...X(g,b,g)]}),getShaderSource:w},{inputs:[t[0],c]})},vd=(e,t,r)=>{let i=t[0].dims,n=i,a=i[0],s=i[i.length-1],u=M.sizeFromDimension(i,1)/s,l=ke(s),p=M.size(n)/l,h=[{type:12,data:u},{type:12,data:Math.floor(s/l)}],c=["type","type"],g=!1,b=[0,i.length-1];for(let S=0;S<i.length-2;S++)g=g||i[S+1]!==1,b.push(S+1);g=g&&i[i.length-1]!==1;let y=g?e.compute(Pe(e.inputs[0],b),{inputs:[e.inputs[0]],outputs:[-1]})[0]:e.inputs[0].reshape(Array.from({length:i.length},(S,_)=>i[b[_]])),w=xn(e,y,t[1],t[2],a,u,s,r.epsilon),k=(S)=>{let _=Ae(t[0].dataType),I=l===1?"vec2f":`mat${l}x2f`,T=(O)=>{let v=O===0?"x":"y",N=l===1?"f32":`vec${l}f`;switch(l){case 1:return`${_}(${N}(scale.${v}))`;case 2:return`vec2<${_}>(${N}(scale[0].${v}, scale[1].${v}))`;case 4:return`vec4<${_}>(${N}(scale[0].${v}, scale[1].${v}, scale[2].${v}, scale[3].${v}))`;default:throw Error(`Not supported compoents ${l}`)}},C=B("input",t[0].dataType,t[0].dims,l),A=j("output",t[0].dataType,n,l);return`
  @group(0) @binding(0) var<storage, read> input : array<${C.type.storage}>;
  @group(0) @binding(1) var<storage, read> scale_input : array<${I}>;
  @group(0) @binding(2) var<storage, read_write> output : array<${A.type.storage}>;
  struct Uniforms {H: u32, C : u32};
  @group(0) @binding(3) var<uniform> uniforms: Uniforms;

  ${S.mainStart()}
    let current_image_number = global_idx / (uniforms.C * uniforms.H);
    let current_channel_number = global_idx % uniforms.C;

    let scale_offset = current_image_number * uniforms.C + current_channel_number;
    let scale = scale_input[scale_offset];
    output[global_idx] = fma(input[global_idx], ${T(0)}, ${T(1)});
  }`};e.compute({name:"InstanceNormalizationNHWC",shaderCache:{hint:`${l}`,inputDependencies:c},getRunData:()=>({outputs:[{dims:n,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(p/64)},programUniforms:h}),getShaderSource:k},{inputs:[t[0],w]})},wf=(e,t)=>{t.format==="NHWC"?vd(e,e.inputs,t):wd(e,e.inputs,t)}}),Gy=U(()=>{ee(),ie(),ne(),$d=(e)=>{if(!e||e.length<2)throw Error("layerNorm requires at least 2 inputs.")},xd=(e,t,r)=>{let i=t.simplified,n=e[0].dims,a=e[1],s=!i&&e[2],u=n,l=M.normalizeAxis(t.axis,n.length),p=M.sizeToDimension(n,l),h=M.sizeFromDimension(n,l),c=M.size(a.dims),g=s?M.size(s.dims):0;if(c!==h||s&&g!==h)throw Error(`Size of X.shape()[axis:] == ${h}.
       Size of scale and bias (if provided) must match this.
       Got scale size of ${c} and bias size of ${g}`);let b=[];for(let C=0;C<n.length;++C)C<l?b.push(n[C]):b.push(1);let y=ke(h),w=["type","type"],k=[{type:12,data:p},{type:1,data:h},{type:12,data:Math.floor(h/y)},{type:1,data:t.epsilon}];s&&w.push("type");let S=r>1,_=r>2,I=(C)=>{let A=Ae(e[0].dataType),O=[B("x",e[0].dataType,e[0].dims,y),B("scale",a.dataType,a.dims,y)];s&&O.push(B("bias",s.dataType,s.dims,y)),O.push(j("output",e[0].dataType,u,y)),S&&O.push(j("mean_data_output",1,b)),_&&O.push(j("inv_std_output",1,b));let v=[{name:"norm_count",type:"u32"},{name:"norm_size",type:"f32"},{name:"norm_size_vectorized",type:"u32"},{name:"epsilon",type:"f32"}];return`
  ${C.registerUniforms(v).declareVariables(...O)}
  ${C.mainStart()}
    ${C.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.norm_count")}
    let offset = global_idx * uniforms.norm_size_vectorized;
    var mean_vector = ${Wn("f32",y)};
    var mean_square_vector = ${Wn("f32",y)};

    for (var h: u32 = 0u; h < uniforms.norm_size_vectorized; h++) {
      let value = ${jt(A,y,"x[h + offset]")};
      mean_vector += value;
      mean_square_vector += value * value;
    }
    let mean = ${vt("mean_vector",y)} / uniforms.norm_size;
    let inv_std_dev = inverseSqrt(${vt("mean_square_vector",y)} / uniforms.norm_size ${i?"":"- mean * mean"} + uniforms.epsilon);

    for (var j: u32 = 0; j < uniforms.norm_size_vectorized; j++) {
      let f32input = ${jt(A,y,"x[j + offset]")};
      let f32scale = ${jt(A,y,"scale[j]")};
      output[j + offset] = ${O[0].type.value}((f32input ${i?"":"- mean"}) * inv_std_dev * f32scale
        ${s?`+ ${jt(A,y,"bias[j]")}`:""}
      );
    }

    ${S?"mean_data_output[global_idx] = mean":""};
    ${_?"inv_std_output[global_idx] = inv_std_dev":""};
  }`},T=[{dims:u,dataType:e[0].dataType}];return S&&T.push({dims:b,dataType:1}),_&&T.push({dims:b,dataType:1}),{name:"LayerNormalization",shaderCache:{hint:`${y};${r};${i}`,inputDependencies:w},getRunData:()=>({outputs:T,dispatchGroup:{x:Math.ceil(p/64)},programUniforms:k}),getShaderSource:I}},vf=(e,t)=>{$d(e.inputs),e.compute(xd(e.inputs,t,e.outputCount))}}),Hy=U(()=>{ie(),va(),$a(),Sd=(e)=>{if(!e||e.length!==2)throw Error("MatMul requires 2 inputs.");if(e[0].dims[e[0].dims.length-1]!==e[1].dims[e[1].dims.length-2])throw Error("shared dimension does not match.")},$f=(e)=>{Sd(e.inputs);let t=Kt.calcShape(e.inputs[0].dims,e.inputs[1].dims,!0);if(!t)throw Error("Can't use matmul on the given tensors");let r=t[t.length-1],i=e.inputs[0].dims[e.inputs[0].dims.length-1];if(r<8&&i<8)e.compute(wa(e.inputs,{activation:""},t));else{let n=t[t.length-2],a=M.size(e.inputs[0].dims.slice(0,-2)),s=M.size(e.inputs[1].dims.slice(0,-2));if(a!==1&&n===1&&s===1){let u=e.inputs[0].reshape([1,a,i]),l=e.inputs[1].reshape([1,i,r]),p=[1,a,r],h=[u,l];e.compute(oi(h,{activation:""},t,p),{inputs:h})}else e.compute(oi(e.inputs,{activation:""},t))}}}),Fy=U(()=>{ee(),ie(),Te(),ne(),kd=(e,t)=>{if(e.length<3||e.length>4)throw Error("MatMulNBits requires 3 or 4 inputs");let r=e[0],i=r.dims.length;if(r.dims[i-1]!==t.k)throw Error("The last dim of input shape does not match the k value");let n=Math.floor((t.k+t.blockSize-1)/t.blockSize),a=t.blockSize/8*t.bits,s=e[1];if(!M.areEqual(s.dims,[t.n,n,a]))throw Error("The second inputs must be 3D tensor with shape N X nBlocksPerCol X blobSize");let u=e[2].dims;if(M.size(u)!==t.n*n)throw Error("scales input size error.");if(e.length===4){let l=e[3].dims,p=t.n*(t.bits===8?n:Math.floor((n*t.bits+7)/8));if(M.size(l)!==p)throw Error("zeroPoints input size error.")}},Td=(e,t)=>{let r=e[0].dims,i=r.length,n=r[i-2],a=t.k,s=t.n,u=r.slice(0,i-2),l=M.size(u),p=e[1].dims[2]/4,h=e[0].dataType,c=ke(t.k),g=ke(p),b=ke(s),y=u.concat([n,s]),w=n>1&&s/b%2===0?2:1,k=M.size(y)/b/w,S=64,_=[],I=[l,n,a/c],T=M.convertShape(e[1].dims).slice();T.splice(-1,1,p/g),_.push(...X(I)),_.push(...X(T)),_.push(...X(e[2].dims)),e.length===4&&_.push(...X(M.convertShape(e[3].dims)));let C=[l,n,s/b];_.push(...X(C));let A=(O)=>{let v=I.length,N=B("a",e[0].dataType,v,c),q=B("b",12,T.length,g),F=B("scales",e[2].dataType,e[2].dims.length),W=[N,q,F],G=e.length===4?B("zero_points",12,e[3].dims.length):void 0;G&&W.push(G);let ae=C.length,z=j("output",e[0].dataType,ae,b),L=Ae(e[0].dataType),te=(()=>{switch(c){case 1:return`array<${L}, 8>`;case 2:return`mat4x2<${L}>`;case 4:return`mat2x4<${L}>`;default:throw Error(`${c}-component is not supported.`)}})(),re=Math.floor(32/t.bits),Q=Math.floor(re/8),se=()=>{let Y="";for(let K=0;K<Q;K++){let ve=K*t.bits*4,Re=ve+t.bits;Y+=`
          // reuse a data (pass ${K})
            var input_offset${K>0?K:""} = ${K===0?N.indicesToOffset(`${N.type.indices}(batch, row, word_offset)`):"input_offset"};
            var a_data${K>0?K:""}: ${te};
            for (var j${K>0?K:""}: u32 = 0; j${K>0?K:""} < ${8/c}; j${K>0?K:""}++) {
              a_data${K>0?K:""}[j${K>0?K:""}] = ${N.getByOffset(`input_offset${K>0?K:""}`)};
              input_offset${K>0?K:""}++;
            }
          `;for(let xe=0;xe<b*w;xe++)Y+=`
            b_value = ${g===1?`b${xe}_data`:`b${xe}_data[i]`};
            ${t.bits===2?`{
              let half_word = b_value >> ${K*16}u;
              let byte_lo = half_word & 0xFFu;
              let byte_hi = (half_word >> 8u) & 0xFFu;
              let spread_word = (byte_lo & 0xFu) | ((byte_lo >> 4u) << 8u) | ((byte_hi & 0xFu) << 16u) | ((byte_hi >> 4u) << 24u);
              b_value_lower = unpack4xU8(spread_word & b_mask);
              b_value_upper = unpack4xU8((spread_word >> 2u) & b_mask);
            }`:`b_value_lower = unpack4xU8((b_value >> ${ve}u) & b_mask);
            b_value_upper = unpack4xU8((b_value >> ${Re}u) & b_mask);`}
            b_quantized_values = ${te}(${Array.from({length:4},(Ie,ge)=>`${L}(b_value_lower[${ge}]), ${L}(b_value_upper[${ge}])`).join(", ")});
            b_dequantized_values = ${c===1?`${te}(${Array.from({length:8},(Ie,ge)=>`(b_quantized_values[${ge}] - ${G?`zero_point${xe}`:"zero_point"}) * scale${xe}`).join(", ")});`:`(b_quantized_values - ${te}(${Array(8).fill(`${G?`zero_point${xe}`:"zero_point"}`).join(",")})) * scale${xe};`};
            workgroup_shared[local_id.x * ${w} + ${Math.floor(xe/b)}]${b>1?`[${xe%b}]`:""} += ${Array.from({length:8/c},(Ie,ge)=>`${c===1?`a_data${K>0?K:""}[${ge}] * b_dequantized_values[${ge}]`:`dot(a_data${K>0?K:""}[${ge}], b_dequantized_values[${ge}])`}`).join(" + ")};
          `}return Y},P=()=>{let Y=`
            var col_index = col * ${b};
            ${G?`
            let zero_point_values_per_byte: u32 = ${Math.floor(8/t.bits)}u;
            let zero_point_bytes_per_col = (nBlocksPerCol + zero_point_values_per_byte - 1u) / zero_point_values_per_byte;
            var zero_point_byte_count: u32;
            var zero_point_word_index: u32;
            var zero_point_byte_offset: u32;
            let zero_point_sub_offset: u32 = block % zero_point_values_per_byte;
            var zero_point_bits_offset: u32;
            var zero_point_word: u32;`:`
            // The default zero point is ${Math.pow(2,t.bits-1)} for unsigned ${t.bits}-bit quantization.
            let zero_point = ${L}(${Math.pow(2,t.bits-1).toFixed(1)});`}
            `;for(let K=0;K<b*w;K++)Y+=`
            let scale${K} = ${F.getByOffset("col_index * nBlocksPerCol + block")};
            ${G?`
            zero_point_byte_count = col_index * zero_point_bytes_per_col + (block / zero_point_values_per_byte);
            zero_point_word_index = zero_point_byte_count >> 0x2u;
            zero_point_byte_offset = zero_point_byte_count & 0x3u;
            zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_sub_offset * ${t.bits}u);
            zero_point_word = ${G.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point${K} = ${L}((zero_point_word) & ${t.bits===2?"0x3u":"0xFu"});`:""}
            col_index += 1;`;return Y},J=()=>{let Y=`col_index = col * ${b};`;for(let K=0;K<b*w;K++)Y+=`
            let b${K}_data = ${q.getByIndices(`${q.type.indices}(col_index, block, word)`)};
            col_index += 1;`;return Y+=`
            var b_value: u32;
            let b_mask: u32 = ${t.bits===2?"0x03030303u":"0x0F0F0F0Fu"};
            var b_value_lower: vec4<u32>;
            var b_value_upper: vec4<u32>;
            var b_quantized_values: ${te};
            var b_dequantized_values: ${te};`,Y};return`
        var<workgroup> workgroup_shared: array<${z.type.value}, ${w*S}>;
        ${O.declareVariables(...W,z)}
        ${O.mainStart([S,1,1])}
          let output_indices = ${z.offsetToIndices(`(global_idx / ${S}) * ${w}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let nBlocksPerCol = uniforms.b_shape[1];

          for (var block = local_id.x; block < nBlocksPerCol; block += ${S}) {
            //process one block
            var word_offset: u32 = block * ${t.blockSize/c};
            ${P()}
            for (var word: u32 = 0; word < ${p}; word += ${g}) {
              ${J()}
              for (var i: u32 = 0; i < ${g}; i++) {
                ${se()}
                word_offset += ${re/c};
              }
            }
          }
          workgroupBarrier();

          if (local_id.x < ${w}) {
            var output_value: ${z.type.value} = ${z.type.value}(0);
            var workgroup_shared_offset: u32 = local_id.x;
            for (var b: u32 = 0u; b < ${S}u; b++) {
              output_value += workgroup_shared[workgroup_shared_offset];
              workgroup_shared_offset += ${w};
            }
            ${z.setByIndices(`${z.type.indices}(batch, row, col + local_id.x)`,"output_value")};
          }
        }`};return{name:"MatMulNBits",shaderCache:{hint:`${t.blockSize};${t.bits};${c};${g};${b};${w};${S}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:y,dataType:h}],dispatchGroup:{x:k},programUniforms:_}),getShaderSource:A}},Ed=(e,t)=>{let r=e[0].dims,i=r.length,n=r[i-2],a=t.k,s=t.n,u=r.slice(0,i-2),l=M.size(u),p=e[1].dims[2]/4,h=e[0].dataType,c=ke(t.k),g=ke(p),b=u.concat([n,s]),y=128,w=s%8===0?8:s%4===0?4:1,k=y/w,S=Math.floor(32/t.bits),_=k*g*S,I=_/c,T=_/t.blockSize,C=M.size(b)/w,A=[],O=[l,n,a/c],v=M.convertShape(e[1].dims).slice();v.splice(-1,1,p/g),A.push(...X(O)),A.push(...X(v)),A.push(...X(e[2].dims)),e.length===4&&A.push(...X(M.convertShape(e[3].dims)));let N=[l,n,s];A.push(...X(N));let q=(F)=>{let W=O.length,G=B("a",e[0].dataType,W,c),ae=B("b",12,v.length,g),z=B("scales",e[2].dataType,e[2].dims.length),L=[G,ae,z],te=e.length===4?B("zero_points",12,e[3].dims.length):void 0;te&&L.push(te);let re=N.length,Q=j("output",e[0].dataType,re),se=Ae(e[0].dataType),P=()=>{switch(c){case 1:return`
          let a_data0 = vec4<${se}>(sub_a[word_offset], sub_a[word_offset + 1], sub_a[word_offset + 2], sub_a[word_offset + 3]);
          let a_data1 = vec4<${se}>(sub_a[word_offset + 4], sub_a[word_offset + 5], sub_a[word_offset + 6], sub_a[word_offset + 7]);`;case 2:return`
          let a_data0 = vec4<${se}>(sub_a[word_offset], sub_a[word_offset + 1]);
          let a_data1 = vec4<${se}>(sub_a[word_offset + 2], sub_a[word_offset + 3]);`;case 4:return`
          let a_data0 = sub_a[word_offset];
          let a_data1 = sub_a[word_offset + 1];`;default:throw Error(`${c}-component is not supported.`)}};return`
        var<workgroup> sub_a: array<${G.type.value}, ${I}>;
        var<workgroup> inter_results: array<array<${Q.type.value}, ${k}>, ${w}>;
        ${F.declareVariables(...L,Q)}
        ${F.mainStart([k,w,1])}
          let output_indices = ${Q.offsetToIndices(`workgroup_index * ${w}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let n_blocks_per_col = uniforms.b_shape[1];
          let num_tiles =  (n_blocks_per_col - 1) / ${T} + 1;

          // Loop over shared dimension.
          for (var tile: u32 = 0; tile < num_tiles; tile += 1) {
            let a_col_start = tile * ${I};
            // load one tile A data into shared memory.
            for (var a_offset = local_idx; a_offset < ${I}; a_offset += ${y})
            {
              let a_col = a_col_start + a_offset;
              if (a_col < uniforms.a_shape[2])
              {
                sub_a[a_offset] = ${G.getByIndices(`${G.type.indices}(batch, row, a_col)`)};
              } else {
                sub_a[a_offset] = ${G.type.value}(0);
              }
            }
            workgroupBarrier();

            // each thread process one block
            let b_row = col + local_id.y;
            let block = tile * ${T} + local_id.x;
            ${te?`
            let zero_point_values_per_byte: u32 = ${Math.floor(8/t.bits)}u;
            let zero_point_bytes_per_col = (n_blocks_per_col + zero_point_values_per_byte - 1u) / zero_point_values_per_byte;
            let zero_point_byte_count = b_row * zero_point_bytes_per_col + (block / zero_point_values_per_byte);
            let zero_point_word_index = zero_point_byte_count >> 0x2u;
            let zero_point_byte_offset = zero_point_byte_count & 0x3u;
            let zero_point_sub_offset: u32 = block % zero_point_values_per_byte;
            let zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_sub_offset * ${t.bits}u);
            let zero_point_word = ${te.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point = ${se}((zero_point_word) & ${t.bits===2?"0x3u":"0xFu"});`:`
            // The default zero point is ${Math.pow(2,t.bits-1)} for unsigned ${t.bits}-bit quantization.
            let zero_point = ${se}(${Math.pow(2,t.bits-1).toFixed(1)});`}
            let scale = ${z.getByOffset("b_row * n_blocks_per_col + block")};
            let b_data = ${ae.getByIndices(`${ae.type.indices}(b_row, block, 0)`)};
            var word_offset = local_id.x * ${t.blockSize/c};
            for (var i: u32 = 0; i < ${g}; i++) {
              let b_value = ${g===1?"b_data":"b_data[i]"};
              ${(()=>{let J=Math.floor(S/8),Y="";for(let K=0;K<J;K++){let ve=K*t.bits*4,Re=ve+t.bits;Y+=`
              ${P()}
              {${t.bits===2?`
                let half_word = b_value >> ${K*16}u;
                let byte_lo = half_word & 0xFFu;
                let byte_hi = (half_word >> 8u) & 0xFFu;
                let spread_word = (byte_lo & 0xFu) | ((byte_lo >> 4u) << 8u) | ((byte_hi & 0xFu) << 16u) | ((byte_hi >> 4u) << 24u);
                let b_value_lower = unpack4xU8(spread_word & 0x03030303u);
                let b_value_upper = unpack4xU8((spread_word >> 2u) & 0x03030303u);`:`
                let b_value_lower = unpack4xU8((b_value >> ${ve}u) & 0x0F0F0F0Fu);
                let b_value_upper = unpack4xU8((b_value >> ${Re}u) & 0x0F0F0F0Fu);`}
                let b_quantized_values = mat2x4<${se}>(${Array.from({length:4},(xe,Ie)=>`${se}(b_value_lower[${Ie}]), ${se}(b_value_upper[${Ie}])`).join(", ")});
                let b_dequantized_values = (b_quantized_values - mat2x4<${se}>(${Array(8).fill("zero_point").join(",")})) * scale;
                inter_results[local_id.y][local_id.x] += ${Array.from({length:2},(xe,Ie)=>`${`dot(a_data${Ie}, b_dequantized_values[${Ie}])`}`).join(" + ")};
              }
              word_offset += ${8/c};`}return Y})()}
            }
            workgroupBarrier();
          }

          if (local_idx < ${w}) {
            var output_value: ${Q.type.value} = ${Q.type.value}(0);
            for (var b = 0u; b < ${k}; b++) {
              output_value += inter_results[local_idx][b];
            }
            if (col + local_idx < uniforms.output_shape[2])
            {
              ${Q.setByIndices(`${Q.type.indices}(batch, row, col + local_idx)`,"output_value")}
            }
          }
        }`};return{name:"BlockwiseMatMulNBits32",shaderCache:{hint:`${t.blockSize};${c};${g};${k};${w}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:b,dataType:h}],dispatchGroup:{x:C},programUniforms:A}),getShaderSource:q}},xf=(e,t)=>{kd(e.inputs,t),t.blockSize===32&&e.adapterInfo.isVendor("intel")&&e.adapterInfo.isArchitecture("gen-12lp")?e.compute(Ed(e.inputs,t)):e.compute(Td(e.inputs,t))},Sf=(e)=>fe(e)}),jy=U(()=>{ee(),ie(),ne(),Id=(e)=>{if(!e||e.length<1)throw Error("Too few inputs");if(e[0].dataType!==1&&e[0].dataType!==10)throw Error("Input type must be float or float16.");if(e.length>=2){let t=e[0].dims.length*2===e[1].dims[0];if(e.length===4&&(t=e[3].dims[0]*2===e[1].dims[0]),!t)throw Error("The pads should be a 1D tensor of shape [2 * input_rank] or [2 * num_axes].")}},Cd=(e,t,r)=>{let i="";for(let n=t-1;n>=0;--n)i+=`
            k = i32(${e.indicesGet("indices",n)}) - ${Z("uniforms.pads",n,r)};
            if (k < 0) {
              break;
            }
            if (k >= i32(${Z("uniforms.x_shape",n,t)})) {
              break;
            }
            offset += k * i32(${Z("uniforms.x_strides",n,t)});
        `;return`
          value = ${e.type.value}(uniforms.constant_value);
          for (var i = 0; i < 1; i++) {
            var offset = 0;
            var k = 0;
            ${i}
            value = x[offset];
          }
      `},Ad=(e,t,r)=>{let i="";for(let n=t-1;n>=0;--n)i+=`
                k = i32(${e.indicesGet("indices",n)}) - ${Z("uniforms.pads",n,r)};
                if (k < 0) {
                  k = -k;
                }
                {
                  let _2n_1 = 2 * (i32(${Z("uniforms.x_shape",n,t)}) - 1);
                  k = k % _2n_1;
                  if(k >= i32(${Z("uniforms.x_shape",n,t)})) {
                    k = _2n_1 - k;
                  }
                }
                offset += k * i32(${Z("uniforms.x_strides",n,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},zd=(e,t,r)=>{let i="";for(let n=t-1;n>=0;--n)i+=`
                k = i32(${e.indicesGet("indices",n)}) - ${Z("uniforms.pads",n,r)};
                if (k < 0) {
                  k = 0;
                }
                if (k >= i32(${Z("uniforms.x_shape",n,t)})) {
                  k = i32(${Z("uniforms.x_shape",n,t)}) - 1;
                }
                offset += k * i32(${Z("uniforms.x_strides",n,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},Od=(e,t,r)=>{let i="";for(let n=t-1;n>=0;--n)i+=`
                k = i32(${e.indicesGet("indices",n)}) - ${Z("uniforms.pads",n,r)};
                if (k < 0)  {
                  k += i32(${Z("uniforms.x_shape",n,t)}]);
                }
                if (k >= i32(${Z("uniforms.x_shape",n,t)})) {
                  k -= i32(${Z("uniforms.x_shape",n,t)});
                }
                offset += k * i32(${Z("uniforms.x_strides",n,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},Rd=(e,t,r)=>{switch(r.mode){case 0:return Cd(e,t,r.pads.length);case 1:return Ad(e,t,r.pads.length);case 2:return zd(e,t,r.pads.length);case 3:return Od(e,t,r.pads.length);default:throw Error("Invalid mode")}},Md=(e,t)=>{let r=M.padShape(e[0].dims.slice(),t.pads),i=e[0].dims,n=M.size(r),a=[{type:12,data:n},{type:6,data:t.pads}],s=e.length>=3&&e[2].data;t.mode===0&&a.push({type:s?e[2].dataType:1,data:t.value}),a.push(...X(e[0].dims,r));let u=["rank"],l=(p)=>{let h=j("output",e[0].dataType,r.length),c=B("x",e[0].dataType,i.length),g=c.type.value,b=Rd(h,i.length,t),y=[{name:"output_size",type:"u32"},{name:"pads",type:"i32",length:t.pads.length}];return t.mode===0&&y.push({name:"constant_value",type:s?g:"f32"}),`
            ${p.registerUniforms(y).declareVariables(c,h)}
            ${p.mainStart()}
            ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

            let indices = ${h.offsetToIndices("global_idx")};

            var value = ${g}(0);
            ${b}
            output[global_idx] = value;
        }`};return{name:"Pad",shaderCache:{hint:`${t.mode}${s}`,inputDependencies:u},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(M.size(r)/64)},programUniforms:a}),getShaderSource:l}},Bd=(e,t)=>{if(e.length>1){let r=e[1].getBigInt64Array(),i=e.length>=3&&e[2].data?e[2].dataType===10?e[2].getUint16Array()[0]:e[2].getFloat32Array()[0]:0,n=e[0].dims.length,a=new Int32Array(2*n).fill(0);if(e.length>=4){let u=e[3].getBigInt64Array();for(let l=0;l<u.length;l++)a[Number(u[l])]=Number(r[l]),a[Number(u[l])+n]=Number(r[l+u.length])}else r.forEach((u,l)=>a[Number(l)]=Number(u));let s=[];return a.forEach((u)=>s.push(u)),{mode:t.mode,value:i,pads:s}}else return t},kf=(e,t)=>{Id(e.inputs);let r=Bd(e.inputs,t);e.compute(Md(e.inputs,r),{inputs:[0]})}}),Ky=U(()=>{Ve(),ee(),ie(),ne(),hr=(e)=>{if(we.webgpu.validateInputContent&&(!e||e.length!==1))throw Error("Pool ops requires 1 input.")},Sn=(e,t,r)=>{let i=t.format==="NHWC",n=e.dims.slice();i&&n.splice(1,0,n.pop());let a=Object.hasOwnProperty.call(t,"dilations"),s=t.kernelShape.slice(),u=t.strides.slice(),l=a?t.dilations.slice():[],p=t.pads.slice();ai.adjustPoolAttributes(r,n,s,u,l,p);let h=ai.computePoolOutputShape(r,n,u,l,s,p,t.autoPad,t.ceilMode),c=Object.assign({},t);a?Object.assign(c,{kernelShape:s,strides:u,pads:p,dilations:l,cacheKey:t.cacheKey}):Object.assign(c,{kernelShape:s,strides:u,pads:p,cacheKey:t.cacheKey});let g=h.slice();return g.push(g.splice(1,1)[0]),[c,i?g:h]},kn=(e,t)=>{let r=t.format==="NHWC",i=M.size(e),n=M.size(t.kernelShape),a=[{type:12,data:i},{type:12,data:n}],s=[{name:"outputSize",type:"u32"},{name:"kernelSize",type:"u32"}];if(t.kernelShape.length<=2){let u=t.kernelShape[t.kernelShape.length-1],l=t.strides[t.strides.length-1],p=t.pads[t.pads.length/2-1],h=t.pads[t.pads.length-1],c=!!(p+h);a.push({type:12,data:u},{type:12,data:l},{type:12,data:p},{type:12,data:h}),s.push({name:"kw",type:"u32"},{name:"sw",type:"u32"},{name:"pwStart",type:"u32"},{name:"pwEnd",type:"u32"});let g=!1;if(t.kernelShape.length===2){let b=t.kernelShape[t.kernelShape.length-2],y=t.strides[t.strides.length-2],w=t.pads[t.pads.length/2-2],k=t.pads[t.pads.length-2];g=!!(w+k),a.push({type:12,data:b},{type:12,data:y},{type:12,data:w},{type:12,data:k}),s.push({name:"kh",type:"u32"},{name:"sh",type:"u32"},{name:"phStart",type:"u32"},{name:"phEnd",type:"u32"})}return[a,s,!0,c,g]}else{if(r)throw Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let u=M.computeStrides(t.kernelShape);a.push({type:12,data:u},{type:12,data:t.pads},{type:12,data:t.strides}),s.push({name:"kernelStrides",type:"u32",length:u.length},{name:"pads",type:"u32",length:t.pads.length},{name:"strides",type:"u32",length:t.strides.length});let l=t.pads.reduce((p,h)=>p+h);return[a,s,!!l,!1,!1]}},Tn=(e,t,r,i,n,a,s,u,l,p,h,c)=>{let g=n.format==="NHWC",b=t.type.value,y=j("output",t.type.tensor,i);if(n.kernelShape.length<=2){let w="",k="",S="",_=r-(g?2:1);if(h?w=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${_}] = indices[${_}] * uniforms.sw - uniforms.pwStart + i;
                  if (xIndices[${_}] < 0 || xIndices[${_}]
                      >= uniforms.x_shape[${_}]) {
                    pad++;
                    continue;
                  }
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${a}
                }`:w=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${_}] = indices[${_}] * uniforms.sw - uniforms.pwStart + i;
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${a}
                }`,n.kernelShape.length===2){let I=r-(g?3:2);c?k=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${I}] = indices[${I}] * uniforms.sh - uniforms.phStart + j;
                  if (xIndices[${I}] < 0 || xIndices[${I}] >= uniforms.x_shape[${I}]) {
                    pad += i32(uniforms.kw);
                    continue;
                  }
              `:k=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${I}] = indices[${I}] * uniforms.sh - uniforms.phStart + j;
                `,S=`
              }
            `}return`
            ${e.registerUniforms(l).declareVariables(t,y)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

              let indices = ${y.offsetToIndices("global_idx")};
              var xIndices = ${y.offsetToIndices("global_idx")};

              var value = ${b}(${u});
              var pad = 0;
              ${k}
              ${w}
              ${S}
              ${s}

              output[global_idx] = value;
            }`}else{if(g)throw Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let w=n.kernelShape.length,k=n.pads.length,S="";return p?S=`
                if (xIndices[j] >= uniforms.x_shape[j]) {
                  pad++;
                  isPad = true;
                  break;
                }
              }
              if (!isPad) {
                let x_val = x[${t.indicesToOffset("xIndices")}];
                ${a}
              }`:S=`
              }
              let x_val = x[${t.indicesToOffset("xIndices")}];
              ${a}
            `,`
            ${e.registerUniforms(l).declareVariables(t,y)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
              let indices = ${y.offsetToIndices("global_idx")};
              var xIndices = ${y.offsetToIndices("global_idx")};

              var offsets: array<u32, ${w}>;

              var value = ${b}(${u});
              var pad = 0;
              var isPad = false;

              for (var i: u32 = 0u; i < uniforms.kernelSize; i++) {
                var offset = i;
                for (var j = 0u; j < ${w-1}u; j++) {
                  offsets[j] = offset / ${Z("uniforms.kernelStrides","j",w)};
                  offset -= offsets[j] * ${Z("uniforms.kernelStrides","j",w)};
                }
                offsets[${w-1}] = offset;

                isPad = false;
                for (var j = ${r-w}u; j < ${r}u; j++) {
                  xIndices[j] = indices[j] * ${Z("uniforms.strides",`j - ${r-w}u`,w)}
                    + offsets[j - ${r-w}u] - ${Z("uniforms.pads","j - 2u",k)};
                  ${S}
              }
              ${s}

              output[global_idx] = value;
            }`}},En=(e)=>`${e.format};${e.ceilMode};${e.autoPad};${e.kernelShape.length}`,Dd=(e)=>`${En(e)};${e.countIncludePad}`,Nd=(e)=>`${En(e)};${e.storageOrder};${e.dilations}`,In=(e)=>({format:e.format,autoPad:["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],ceilMode:e.ceil_mode,kernelShape:e.kernel_shape,strides:e.strides,pads:e.pads}),Cn=(e,t,r,i)=>{let[n,a]=Sn(t,i,r),s=B("x",t.dataType,t.dims.length),u=s.type.value,l="value += x_val;",p="";n.countIncludePad?p+=`value /= ${u}(uniforms.kernelSize);`:p+=`value /= ${u}(i32(uniforms.kernelSize) - pad);`;let[h,c,g,b,y]=kn(a,n);h.push(...X(t.dims,a));let w=["rank"];return{name:e,shaderCache:{hint:`${i.cacheKey};${g};${b};${y}`,inputDependencies:w},getRunData:()=>({outputs:[{dims:a,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(M.size(a)/64)},programUniforms:h}),getShaderSource:(k)=>Tn(k,s,t.dims.length,a.length,n,l,p,0,c,g,b,y)}},Tf=(e)=>{let t=e.count_include_pad!==0,r=In(e);if(r.ceilMode!==0)throw Error("ceil_mode output-shape is computed, but ceil_mode kernel execution (padding/divisor) is not yet implemented in the WebGPU AveragePool kernel");let i={countIncludePad:t,...r,cacheKey:""};return{...i,cacheKey:Dd(i)}},Ef=(e,t)=>{hr(e.inputs),e.compute(Cn("AveragePool",e.inputs[0],!1,t))},An={autoPad:"",ceilMode:0,countIncludePad:!1,kernelShape:[],strides:[],pads:[],storageOrder:0,dilations:[]},If=(e)=>{let t=e.format;return{format:t,...An,cacheKey:t}},Cf=(e,t)=>{hr(e.inputs),e.compute(Cn("GlobalAveragePool",e.inputs[0],!0,t))},zn=(e,t,r,i)=>{let[n,a]=Sn(t,i,r),s=`
      value = max(x_val, value);
    `,u="",l=B("x",t.dataType,t.dims.length),p=["rank"],[h,c,g,b,y]=kn(a,n);return h.push(...X(t.dims,a)),{name:e,shaderCache:{hint:`${i.cacheKey};${g};${b};${y}`,inputDependencies:p},getRunData:()=>({outputs:[{dims:a,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(M.size(a)/64)},programUniforms:h}),getShaderSource:(w)=>Tn(w,l,t.dims.length,a.length,n,s,u,t.dataType===10?-65504:-1e5,c,g,b,y)}},Af=(e,t)=>{hr(e.inputs),e.compute(zn("MaxPool",e.inputs[0],!1,t))},zf=(e)=>{let{storage_order:t,dilations:r}=e,i=In(e);if(t!==0)throw Error("column major storage order is not yet supported for MaxPool");if(i.ceilMode!==0)throw Error("ceil_mode output-shape is computed, but ceil_mode kernel execution (padding) is not yet implemented in the WebGPU MaxPool kernel");let n={storageOrder:t,dilations:r,...i,cacheKey:""};return{...n,cacheKey:Nd(n)}},Of=(e)=>{let t=e.format;return{format:t,...An,cacheKey:t}},Rf=(e,t)=>{hr(e.inputs),e.compute(zn("GlobalMaxPool",e.inputs[0],!0,t))}}),Zy=U(()=>{ee(),ie(),Te(),ne(),Pd=(e,t)=>{if(e.length<2||e.length>3)throw Error("DequantizeLinear requires 2 or 3 inputs.");if(e.length===3&&e[1].dims===e[2].dims)throw Error("x-scale and x-zero-point must have the same shape.");if(e.length===3&&e[0].dataType!==e[2].dataType)throw Error("x and x-zero-point must have the same data type.");if(e[1].dims.length!==0&&e[1].dims.length!==1&&e[1].dims.length!==e[0].dims.length)throw Error("scale input must be a scalar, a 1D tensor, or have the same rank as the input tensor.");if(e.length>2){if(e[0].dataType!==e[2].dataType)throw Error("x and x-zero-point must have the same data type.");if(e[1].dims.length!==e[2].dims.length)throw Error("scale and zero-point inputs must have the same rank.");if(!e[1].dims.map((r,i)=>r===e[2].dims[i]).reduce((r,i)=>r&&i,!0))throw Error("scale and zero-point inputs must have the same shape.")}if(t.blockSize>0){if(e[1].dims.length===0||e[1].dims.length===1&&e[1].dims[0]===1)throw Error("blockSize must be set only for block quantization.");if(!e[1].dims.map((n,a)=>a===t.axis||n===e[0].dims[a]).reduce((n,a)=>n&&a,!0))throw Error("For block qunatization, scale input shape to match the input shape except for the axis");if(e[1].dims.length!==e[0].dims.length)throw Error("For block qunatization the scale input rank must be the same as the x rank.");let r=e[0].dims[t.axis],i=e[1].dims[t.axis];if(t.blockSize<Math.ceil(r/i)||t.blockSize>Math.ceil(r/(i-1)-1))throw Error("blockSize must be with in the range [ceil(dI / Si), ceil(dI / (Si - 1) - 1)].")}},Ud=(e,t)=>{let r=M.normalizeAxis(t.axis,e[0].dims.length),i=e[0].dataType,n=i===3,a=e[0].dims,s=e[1].dataType,u=M.size(a),l=i===3||i===2,p=l?[Math.ceil(M.size(e[0].dims)/4)]:e[0].dims,h=e[1].dims,c=e.length>2?e[2]:void 0,g=c?l?[Math.ceil(M.size(c.dims)/4)]:c.dims:void 0,b=h.length===0||h.length===1&&h[0]===1,y=b===!1&&h.length===1,w=ke(u),k=b&&(!l||w===4),S=k?w:1,_=k&&!l?w:1,I=B("input",l?12:i,p.length,_),T=B("scale",s,h.length),C=c?B("zero_point",l?12:i,g.length):void 0,A=j("output",s,a.length,S),O=[I,T];C&&O.push(C);let v=[p,h];c&&v.push(g);let N=[{type:12,data:u/S},{type:12,data:r},{type:12,data:t.blockSize},...X(...v,a)],q=(F)=>{let W=[{name:"output_size",type:"u32"},{name:"axis",type:"u32"},{name:"block_size",type:"u32"}];return`
      ${F.registerUniforms(W).declareVariables(...O,A)}
      ${F.mainStart()}
          ${F.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let output_indices = ${A.offsetToIndices("global_idx")};

          // Set input x
          ${l?`
            let input = ${I.getByOffset("global_idx / 4")};
            let x_vec = ${n?"unpack4xI8(input)":"unpack4xU8(input)"};
            let x_value = ${S===1?"x_vec[global_idx % 4]":"x_vec"};`:`let x_value = ${I.getByOffset("global_idx")};`};

          // Set scale input
          ${b?`let scale_value= ${T.getByOffset("0")}`:y?`
            let scale_index = ${A.indicesGet("output_indices","uniforms.axis")};
            let scale_value= ${T.getByOffset("scale_index")};`:`
            var scale_indices: ${T.type.indices} = output_indices;
            let index = ${T.indicesGet("scale_indices","uniforms.axis")} / uniforms.block_size;
            ${T.indicesSet("scale_indices","uniforms.axis","index")};
            let scale_value= ${T.getByIndices("scale_indices")};`};

          // Set zero-point input
          ${C?b?l?`
                let zero_point_input = ${C.getByOffset("0")};
                let zero_point_vec =  ${n?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value= zero_point_vec[0]`:`let zero_point_value = ${C.getByOffset("0")}`:y?l?`
                let zero_point_index = ${A.indicesGet("output_indices","uniforms.axis")};
                let zero_point_input = ${C.getByOffset("zero_point_index / 4")};
                let zero_point_vec =  ${n?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_index % 4]`:`
                let zero_point_index = ${A.indicesGet("output_indices","uniforms.axis")};
                let zero_point_value = ${C.getByOffset("zero_point_index")};`:l?`
                let zero_point_offset = ${T.indicesToOffset("scale_indices")};
                let zero_point_input = ${C.getByOffset("zero_point_offset / 4")};
                let zero_point_vec = ${n?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_offset % 4];`:`let zero_point_value = ${C.getByIndices("scale_indices")};`:`let zero_point_value = ${l?n?"i32":"u32":I.type.value}(0);`};
      // Compute and write output
      ${A.setByOffset("global_idx",`${A.type.value}(x_value - zero_point_value) * scale_value`)};
      }`};return{name:"DequantizeLinear",shaderCache:{hint:t.cacheKey,inputDependencies:C?["rank","rank","rank"]:["rank","rank"]},getShaderSource:q,getRunData:()=>({outputs:[{dims:a,dataType:s}],dispatchGroup:{x:Math.ceil(u/S/64),y:1,z:1},programUniforms:N})}},Mf=(e,t)=>{Pd(e.inputs,t),e.compute(Ud(e.inputs,t))},Bf=(e)=>fe({axis:e.axis,blockSize:e.blockSize})}),Yy=U(()=>{Ve(),ee(),ne(),Ld=(e,t,r)=>{let i=e===t,n=e<t&&r<0,a=e>t&&r>0;if(i||n||a)throw Error("Range these inputs' contents are invalid.")},qd=(e,t,r,i)=>{let n=Math.abs(Math.ceil((t-e)/r)),a=[n],s=n,u=[{type:12,data:s},{type:i,data:e},{type:i,data:r},...X(a)],l=(p)=>{let h=j("output",i,a.length),c=h.type.value,g=[{name:"outputSize",type:"u32"},{name:"start",type:c},{name:"delta",type:c}];return`
        ${p.registerUniforms(g).declareVariables(h)}
        ${p.mainStart()}
        ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        output[global_idx] = uniforms.start + ${c}(global_idx) * uniforms.delta;
      }`};return{name:"Range",shaderCache:{hint:`${i}`},getShaderSource:l,getRunData:()=>({outputs:[{dims:a,dataType:i}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:u})}},Df=(e)=>{let t=0,r=0,i=0;e.inputs[0].dataType===6?(t=e.inputs[0].getInt32Array()[0],r=e.inputs[1].getInt32Array()[0],i=e.inputs[2].getInt32Array()[0]):e.inputs[0].dataType===1&&(t=e.inputs[0].getFloat32Array()[0],r=e.inputs[1].getFloat32Array()[0],i=e.inputs[2].getFloat32Array()[0]),we.webgpu.validateInputContent&&Ld(t,r,i),e.compute(qd(t,r,i,e.inputs[0].dataType),{inputs:[]})}}),Xy=U(()=>{ee(),ie(),Te(),ne(),Vd=(e,t,r,i)=>{if(e!=="none"&&i!=="i32"&&i!=="u32"&&i!=="f32")throw Error(`Input ${i} is not supported with reduction ${e}.`);let n=`{
                var oldValue = 0;
                loop {
                  let newValueF32 =`,a=`;
                  let newValue = bitcast<i32>(newValueF32);
                  let res = atomicCompareExchangeWeak(&${t}, oldValue, newValue);
                  if res.exchanged {
                    break;
                  }
                  oldValue = res.old_value;
                }
              }`;switch(e){case"none":return`${t}=${r};`;case"add":return i==="i32"||i==="u32"?`atomicAdd(&${t}, bitcast<${i}>(${r}));`:`
              ${n}bitcast<${i}>(oldValue) + (${r})${a}`;case"max":return i==="i32"||i==="u32"?`atomicMax(&${t}, bitcast<${i}>(${r}));`:`
                ${n}max(bitcast<f32>(oldValue), (${r}))${a}`;case"min":return i==="i32"||i==="u32"?`atomicMin(&${t}, bitcast<${i}>(${r}));`:`${n}min(bitcast<${i}>(oldValue), (${r}))${a}`;case"mul":return`${n}(bitcast<${i}>(oldValue) * (${r}))${a}`;default:throw Error(`Reduction ${e} is not supported.`)}},Wd=(e,t)=>{let r=e[0].dims,i=e[1].dims,n=r,a=1,s=Math.ceil(M.sizeToDimension(i,i.length-1)/a),u=i[i.length-1],l=M.sizeFromDimension(r,u),p=[{type:12,data:s},{type:12,data:u},{type:12,data:l},...X(e[1].dims,e[2].dims,n)],h=(c)=>{let g=B("indices",e[1].dataType,e[1].dims.length),b=B("updates",e[2].dataType,e[2].dims.length,a),y=t.reduction!=="none"&&t.reduction!==""?uc("output",e[0].dataType,n.length):j("output",e[0].dataType,n.length,a);return`
      ${c.registerUniform("output_size","u32").registerUniform("last_index_dimension","u32").registerUniform("num_updates_elements","u32").declareVariables(g,b,y)}
      ${c.mainStart()}
        ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
  var data_offset = 0u;
  let indices_start = uniforms.last_index_dimension * global_idx;
  let indices_end = indices_start + uniforms.last_index_dimension;
  for (var i = indices_start; i < indices_end; i++) {
    var index = i32(indices[i].x);
    ${e[0].dims.length===1?`
    let element_count_dim = uniforms.output_strides;
    let dim_value = uniforms.output_shape;`:`
    let element_count_dim = uniforms.output_strides[i - indices_start];
    let dim_value = uniforms.output_shape[i - indices_start];`}
    if (index >= 0) {
      if (index >= i32(dim_value)) {
        index = i32(dim_value - 1);
      }
    } else {
      if (index < -i32(dim_value)) {
        index = 0;
      } else {
        index += i32(dim_value);
      }
    }
    data_offset += u32((u32(index) * element_count_dim));
  }

  for (var i = 0u; i < uniforms.num_updates_elements; i++) {
    let value = updates[uniforms.num_updates_elements * global_idx + i];
    ${Vd(t.reduction,"output[data_offset + i]","value",y.type.value)}
  }

      }`};return{name:"ScatterND",shaderCache:{hint:`${t.cacheKey}_${t.reduction}`,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:n,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:p}),getShaderSource:h}},Nf=(e)=>fe({reduction:e.reduction}),Pf=(e,t)=>{e.compute(Wd(e.inputs,t),{inputs:[e.inputs[1],e.inputs[2]],outputs:[]})}}),Qy=U(()=>{ee(),ie(),Te(),ne(),Gd=(e,t)=>{if(e.every((r)=>r>0||(()=>{throw Error("Resize requires scales input values to be positive")})),e.length>0){if(t.mode==="linear"){if(!(e.length===2||e.length===3||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1||e.length===5&&e[0]===1&&e[1]===1))throw Error(`For linear mode, Resize requires scales to be 2D, 3D, 4D with either two outermost or one innermost and
            one outermost scale values equal to 1, or 5D with two outermost scale values equal to 1`)}else if(t.mode==="cubic"&&!(e.length===2||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1))throw Error("Resize requires scales input size to be 2 or 4 for cubic mode")}},Hd=(e,t,r)=>{t.every((n)=>n>=0&&n<r||(()=>{throw Error("Resize requires axes input values to be positive and less than rank")}));let i=Array(r).fill(1);return t.forEach((n,a)=>i[n]=e[a]),i},Fd=(e,t,r,i,n,a)=>{let[s,u,l]=r>10?[1,2,3]:[-1,e.length>1?1:-1,-1],p=e[0].dims.length;if(s>0&&e.length>s&&e[s].dims.length>0)e[s].getFloat32Array().forEach((h)=>a.push(h));else if(t.coordinateTransformMode==="tf_crop_and_resize")throw Error("Resize requires RoI input to be specified when coordinateTransformMode is tfCropAndResize");if(u>0&&e.length>u&&e[u].dims.length===1&&e[u].dims[0]>0){if(e[u].getFloat32Array().forEach((h)=>i.push(h)),i.length!==0&&i.length!==p&&r>=18&&i.length!==t.axes.length)throw Error("Resize requires scales input size to be same as input rank or axes size for opset 18 and up");Gd(i,t),t.axes.length>0&&Hd(i,t.axes,p).forEach((h,c)=>i[c]=h)}if(l>0&&e.length>l&&e[l].dims.length===1&&e[l].dims[0]>0&&(e[l].getBigInt64Array().forEach((h)=>n.push(Number(h))),n.length!==0&&n.length!==p&&r>=18&&n.length!==t.axes.length))throw Error("Resize requires sizes input size to be same as input rank or axes size for opset 18 and up");if(t.axes.length>0){if(i.length!==0&&i.length!==t.axes.length)throw Error('Resize requires "scales" input size to be of axes rank when axes attributes is specified');if(n.length!==0&&n.length!==t.axes.length)throw Error('Resize requires "sizes" input size to be of rank axes rank when axes attributes is specified')}if(typeof i<"u"&&typeof n<"u"&&i.length>0&&n.length>p)throw Error("Resize requires only of scales or sizes to be specified")},On=(e,t,r,i)=>`
  // The whole part and the fractional part are calculated separately due to inaccuracy of floating
  // point division. As an example, f32(21) / f32(7) may evaluate to 2.99... instead of 3, causing an
  // offset-by-one error later in floor().
  let big = (${e}) * (${t});
  let whole = ${i}(big / (${r}));
  let fract = ${i}(big % (${r})) / ${i}(${r});
  return whole + fract;
`,jd=(e,t)=>`fn getOriginalCoordinateFromResizedCoordinate(xResized: u32, xScale: f32, lengthResized: u32,
     lengthOriginal: u32, roiStart: f32, roiEnd: f32) -> ${t} { `+(()=>{switch(e){case"asymmetric":return`
          if (xScale < 1.0 || floor(xScale) != xScale) {
            return ${t}(xResized) / ${t}(xScale);
          } else {
            ${On("xResized","lengthOriginal","lengthResized",t)}
          }
        `;case"pytorch_half_pixel":return`if (lengthResized > 1) {
                    return (${t}(xResized) + 0.5) / ${t}(xScale) - 0.5;
                  } else {
                    return 0.0;
                  }`;case"tf_half_pixel_for_nn":return`return (${t}(xResized) + 0.5) / ${t}(xScale);`;case"align_corners":return`if (lengthResized == 1) {
                    return 0.0;
                  } else {
                    ${On("xResized","lengthOriginal - 1","lengthResized - 1",t)}
                  }`;case"tf_crop_and_resize":return`if (lengthResized > 1) {
                    return ${t}(roiStart) * ${t}(lengthOriginal - 1) +
                        (${t}(xResized) * ${t}(roiEnd - roiStart) * ${t}(lengthOriginal - 1)) /
                        ${t}(lengthResized - 1);
                  } else {
                    return 0.5 * ${t}(roiStart + roiEnd) * ${t}(lengthOriginal - 1);
                  }`;case"half_pixel_symmetric":return`const outputWidth = ${t}xScale * ${t}(lengthResized);
                  const adjustment = ${t}(lengthResized) / outputWidth;
                  const center = ${t}(lengthOriginal) / 2;
                  const offset = center * (1 - adjustment);
                  return offset + ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;case"half_pixel":return`return ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;default:throw Error(`Coordinate transform mode ${e} is not supported`)}})()+"}",Kd=(e,t,r)=>`fn getNearestPixelFromOriginal(xOriginal: ${r}, isDownSample: bool) -> ${r} {`+(()=>{switch(e){case"round_prefer_ceil":return"if (fract(xOriginal) == 0.5) {             return ceil(xOriginal);           } else {             return round(xOriginal);           }";case"floor":return"return floor(xOriginal);";case"ceil":return"return ceil(xOriginal);";case"round_prefer_floor":return"if (fract(xOriginal) == 0.5) {                     return floor(xOriginal);                   } else {                     return round(xOriginal);                   }";default:if(t<11)return"if (isDownSample)                     {                       return ceil(xOriginal);                     } else {                       return xOriginal;                     }";throw Error(`Nearest mode ${e} is not supported`)}})()+"}",Zd=(e,t,r)=>{let i=Array(r).fill(0).concat(Array(r).fill(1)),n=e.length===0?i:e.slice();return t.length>0?(t.forEach((a,s)=>{i[a]=n[s],i[s+r]=n[t.length+s]}),i):n},Yd=(e,t,r,i)=>{let n=[];if(r.length>0)if(i.length>0){if(e.forEach((a)=>n.push(a)),Math.max(...i)>e.length)throw Error("axes is out of bound");i.forEach((a,s)=>n[a]=r[s])}else r.forEach((a)=>n.push(a));else{if(t.length===0)throw Error("Resize requires either scales or sizes.");n=e.map((a,s)=>Math.round(a*t[s]))}return n},Xd=(e,t,r)=>{let i=(()=>{switch(r.keepAspectRatioPolicy){case"not_larger":return r.axes.length>0?Math.min(...r.axes.map((a)=>t[a]),Number.MAX_VALUE):Math.min(...t,Number.MAX_VALUE);case"not_smaller":return r.axes.length>0?Math.max(...r.axes.map((a)=>t[a]),Number.MIN_VALUE):Math.max(...t,Number.MIN_VALUE);default:throw Error(`Keep aspect ratio policy ${r.keepAspectRatioPolicy} is not supported`)}})();t.fill(1,0,t.length);let n=e.slice();return r.axes.length>0?(r.axes.forEach((a)=>t[a]=i),r.axes.forEach((a)=>n[a]=Math.round(e[a]*t[a]))):(t.fill(i,0,t.length),n.forEach((a,s)=>n[s]=Math.round(a*t[s]))),n},Qd=(e,t,r,i,n)=>`
    fn calculateOriginalIndicesFromOutputIndices(output_indices: ${e.type.indices}) -> array<${e.type.value}, ${r.length}> {
      var original_indices: array<${e.type.value}, ${r.length}>;
      for (var i:u32 = 0; i < ${r.length}; i++) {
        var output_index = ${e.indicesGet("output_indices","i")};
        var scale = ${Z("uniforms.scales","i",i)};
        var roi_low = ${Z("uniforms.roi","i",n)};
        var roi_hi = ${Z("uniforms.roi",`i + ${t.length}`,n)};
        if (scale == 1.0) {
          original_indices[i] = ${e.type.value}(output_index);
        } else {
          var input_shape_i = ${Z("uniforms.input_shape","i",t.length)};
          var output_shape_i = ${Z("uniforms.output_shape","i",r.length)};
          original_indices[i] = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                           input_shape_i, roi_low, roi_hi);
        }
      }
      return original_indices;
    }`,Jd=(e,t,r,i,n,a,s)=>`
    fn calculateInputIndicesFromOutputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
      var input_indices: ${e.type.indices};
      for (var i:u32 = 0; i < ${i.length}; i++) {
        var output_index = ${t.indicesGet("output_indices","i")};
        var input_index: u32;
        var scale = ${Z("uniforms.scales","i",n)};
        if (scale == 1.0) {
          input_index = output_index;
        } else {
          var roi_low = ${Z("uniforms.roi","i",a)};
          var roi_hi = ${Z("uniforms.roi",`i + ${r.length}`,a)};
          var input_shape_i = ${Z("uniforms.input_shape","i",r.length)};
          var output_shape_i = ${Z("uniforms.output_shape","i",i.length)};
          var original_idx = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                        input_shape_i, roi_low, roi_hi);
          if (!${s} || (original_idx >= 0 && original_idx < ${t.type.value}(input_shape_i))) {
            if (original_idx < 0) {
              input_index = 0;
            } else if (original_idx > ${t.type.value}(input_shape_i - 1)) {
              input_index = input_shape_i - 1;
            } else {
              input_index = u32(getNearestPixelFromOriginal(original_idx, scale < 1));
            }
          } else {
            input_index = u32(original_idx);
          }
        }
        ${e.indicesSet("input_indices","i","input_index")}
      }
      return input_indices;
    }`,ep=(e,t)=>`
    fn checkInputIndices(input_indices: ${e.type.indices}) -> bool {
      for (var i:u32 = 0; i < ${t.length}; i++) {
        var input_index = ${e.indicesGet("input_indices","i")};
        if (input_index < 0 || input_index >= ${Z("uniforms.input_shape","i",t.length)}) {
          return false;
        }
      }
      return true;
    }`,Rn=(e,t,r,i)=>e.rank>i?`
    ${e.indicesSet("input_indices",t,"channel")};
    ${e.indicesSet("input_indices",r,"batch")};
`:"",tp=(e,t,r,i,n)=>{let[a,s,u,l]=r.length===2?[-1,0,1,-1]:[0,2,3,1],p=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, row: u32, col: u32) -> ${p} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",s,`max(0, min(row, ${r[s]} - 1))`)};
      ${e.indicesSet("input_indices",u,`max(0, min(col, ${r[u]} - 1))`)};
      ${Rn(e,l,a,2)}
      return ${e.getByIndices("input_indices")};
    }

    fn bilinearInterpolation(output_indices: ${t.type.indices}) -> ${p} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var row:${p} = originalIndices[${s}];
      var col:${p} = originalIndices[${u}];
      ${i?`if (row < 0 || row > (${r[s]} - 1) || col < 0 || col > (${r[u]} - 1)) {
        return ${n};
      }`:""};
      row = max(0, min(row, ${r[s]} - 1));
      col = max(0, min(col, ${r[u]} - 1));
      var row1: u32 = u32(row);
      var col1: u32 = u32(col);
      var row2: u32 = u32(row + 1);
      var col2: u32 = u32(col + 1);
      var channel: u32 = ${r.length>2?`u32(originalIndices[${l}])`:"0"};
      var batch: u32 =  ${r.length>2?`u32(originalIndices[${a}])`:"0"};
      var x11: ${p} = getInputValue(batch, channel, row1, col1);
      var x12: ${p} = getInputValue(batch, channel, row1, col2);
      var x21: ${p} = getInputValue(batch, channel, row2, col1);
      var x22: ${p} = getInputValue(batch, channel, row2, col2);
      var dx1: ${p} = abs(row - ${p}(row1));
      var dx2: ${p} = abs(${p}(row2) - row);
      var dy1: ${p} = abs(col - ${p}(col1));
      var dy2: ${p} = abs(${p}(col2) - col);
      if (row1 == row2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (col1 == col2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      return (x11 * dx2 * dy2 + x12 * dx2 * dy1 + x21 * dx1 * dy2 + x22 * dx1 * dy1);
    }`},rp=(e,t,r,i,n,a,s,u,l,p)=>{let h=r.length===2,c=!0,[g,b]=h?[0,1]:c?[2,3]:[1,2],y=e.type.value,w=(k)=>{let S=k===g?"row":"col";return`
      fn ${S}CubicInterpolation(input_indices: ${e.type.indices}, output_indices: ${t.type.indices}) -> ${y} {
        var output_index = ${t.indicesGet("output_indices",k)};
        var originalIdx: ${y} = getOriginalCoordinateFromResizedCoordinate(output_index, ${n[k]},
        ${i[k]}, ${r[k]}, ${a[k]}, ${a[k]} + ${r.length});
        var fractOriginalIdx: ${y} = originalIdx - floor(originalIdx);
        var coefs = getCubicInterpolationCoefs(fractOriginalIdx);

        if (${u} && (originalIdx < 0 || originalIdx > (${r[k]} - 1))) {
          return ${l};
        }
        var data: array<${y}, 4> = array<${y}, 4>(0.0, 0.0, 0.0, 0.0);
        for (var i: i32 = -1; i < 3; i++) {
          var ${S}: ${y} = originalIdx + ${y}(i);
          if (${S} < 0 || ${S} >= ${r[k]}) {
            ${p?`coefs[i + 1] = 0.0;
                        continue;`:u?`return ${l};`:`${S} = max(0, min(${S}, ${r[k]} - 1));`};
          }
        var input_indices_copy: ${e.type.indices} = input_indices;
          ${e.indicesSet("input_indices_copy",k,`u32(${S})`)};
          data[i + 1] = ${k===g?e.getByIndices("input_indices_copy"):"rowCubicInterpolation(input_indices_copy, output_indices)"};
        }
        return cubicInterpolation1D(data, coefs);
      }`};return`
    ${w(g)};
    ${w(b)};
  fn getCubicInterpolationCoefs(s: ${y}) -> array<${y}, 4> {
    var absS = abs(s);
    var coeffs: array<${y}, 4> = array<${y}, 4>(0.0, 0.0, 0.0, 0.0);
    var oneMinusAbsS: ${y} = 1.0 - absS;
    var twoMinusAbsS: ${y} = 2.0 - absS;
    var onePlusAbsS: ${y} = 1.0 + absS;
    coeffs[0] = ((${s} * onePlusAbsS - 5 * ${s}) * onePlusAbsS + 8 * ${s}) * onePlusAbsS - 4 * ${s};
    coeffs[1] = ((${s} + 2) * absS - (${s} + 3)) * absS * absS + 1;
    coeffs[2] = ((${s} + 2) * oneMinusAbsS - (${s} + 3)) * oneMinusAbsS * oneMinusAbsS + 1;
    coeffs[3] = ((${s} * twoMinusAbsS - 5 * ${s}) * twoMinusAbsS + 8 * ${s}) * twoMinusAbsS - 4 * ${s};
    return coeffs;
  }

  fn cubicInterpolation1D(x: array<${y}, 4>, coefs: array<${y}, 4>) -> ${y} {
    var coefsSum: ${y} = coefs[0] + coefs[1] + coefs[2] + coefs[3];
    return (x[0] * coefs[0] + x[1] * coefs[1]+ x[2] * coefs[2]+ x[3] * coefs[3]) / coefsSum;
  }

  fn bicubicInterpolation(output_indices: ${t.type.indices}) -> ${y} {
    var input_indices: ${e.type.indices} = output_indices;
    return colCubicInterpolation(input_indices, output_indices);
  }
    `},ip=(e,t,r,i,n)=>{let[a,s,u,l,p]=r.length===3?[-1,0,1,2,-1]:[0,2,3,4,1],h=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, depth:u32, height: u32, width: u32) -> ${h} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",s,`max(0, min(depth, ${r[s]} - 1))`)};
      ${e.indicesSet("input_indices",u,`max(0, min(height, ${r[u]} - 1))`)};
      ${e.indicesSet("input_indices",l,`max(0, min(width, ${r[l]} - 1))`)};
      ${Rn(e,p,a,3)}
      return ${e.getByIndices("input_indices")};
    }

    fn trilinearInterpolation(output_indices: ${t.type.indices}) -> ${h} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var depth:${h} = originalIndices[${s}];
      var height:${h} = originalIndices[${u}];
      var width:${h} = originalIndices[${l}];
      ${i?`if (depth < 0 || depth > (${r[s]} - 1) || height < 0 || height > (${r[u]} - 1) || width < 0 || (width > ${r[l]} - 1)) {
      return ${n};
        }`:""};

    depth = max(0, min(depth, ${r[s]} - 1));
      height = max(0, min(height, ${r[u]} - 1));
      width = max(0, min(width, ${r[l]} - 1));
      var depth1: u32 = u32(depth);
      var height1: u32 = u32(height);
      var width1: u32 = u32(width);
      var depth2: u32 = u32(depth + 1);
      var height2: u32 = u32(height + 1);
      var width2: u32 = u32(width + 1);
      var channel: u32 = ${r.length>3?`u32(originalIndices[${p}])`:"0"};
      var batch: u32 =  ${r.length>3?`u32(originalIndices[${a}])`:"0"};

      var x111: ${h} = getInputValue(batch, channel, depth1, height1, width1);
      var x112: ${h} = getInputValue(batch, channel, depth1, height1, width2);
      var x121: ${h} = getInputValue(batch, channel, depth1, height2, width1);
      var x122: ${h} = getInputValue(batch, channel, depth1, height2, width2);
      var x211: ${h} = getInputValue(batch, channel, depth2, height1, width1);
      var x212: ${h} = getInputValue(batch, channel, depth2, height1, width2);
      var x221: ${h} = getInputValue(batch, channel, depth2, height2, width1);
      var x222: ${h} = getInputValue(batch, channel, depth2, height2, width2);
      var dx1: ${h} = abs(depth - ${h}(depth1));
      var dx2: ${h} = abs(${h}(depth2) - depth);
      var dy1: ${h} = abs(height - ${h}(height1));
      var dy2: ${h} = abs(${h}(height2) - height);
      var dz1: ${h} = abs(width - ${h}(width1));
      var dz2: ${h} = abs(${h}(width2) - width);
      if (depth1 == depth2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (height1 == height2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      if (width1 == width2) {
        dz1 = 0.5;
        dz2 = 0.5;
      }
      return (x111 * dx2 * dy2 * dz2 + x112 * dx2 * dy2 * dz1 + x121 * dx2 * dy1 *dz2 + x122 * dx2 * dy1 * dz1 +
              x211 * dx1 * dy2 * dz2 + x212 * dx1 * dy2 * dz1 + x221 * dx1 * dy1 *dz2 + x222 * dx1 * dy1 * dz1);
    }`},np=(e,t,r,i,n,a)=>{let s=e.dims,u=Zd(a,t.axes,s.length),l=Yd(s,i,n,t.axes),p=i.slice();i.length===0&&(p=s.map((_,I)=>_===0?1:l[I]/_),t.keepAspectRatioPolicy!=="stretch"&&(l=Xd(s,p,t)));let h=j("output",e.dataType,l.length),c=B("input",e.dataType,s.length),g=M.size(l),b=s.length===l.length&&s.every((_,I)=>_===l[I]),y=t.coordinateTransformMode==="tf_crop_and_resize",w=t.extrapolationValue,k=c.type.value,S=(_)=>`
      ${b?"":`
      ${jd(t.coordinateTransformMode,k)};
      ${(()=>{switch(t.mode){case"nearest":return`
              ${ep(c,s)};
              ${Kd(t.nearestMode,r,k)};
              ${Jd(c,h,s,l,p.length,u.length,y)};
              `;case"linear":return`
              ${Qd(h,s,l,p.length,u.length)};
              ${(()=>{if(s.length===2||s.length===4)return`${tp(c,h,s,y,w)}`;if(s.length===3||s.length===5)return`${ip(c,h,s,y,w)}`;throw Error("Linear mode only supports input dims 2, 3, 4 and 5 are supported in linear mode.")})()};
            `;case"cubic":return`
            ${(()=>{if(s.length===2||s.length===4)return`${rp(c,h,s,l,p,u,t.cubicCoeffA,y,t.extrapolationValue,t.excludeOutside)}`;throw Error("Cubic mode only supports input dims 2 and 4 are supported in linear mode.")})()};
            `;default:throw Error("Invalid resize mode")}})()};
      `}
      ${_.registerUniform("output_size","u32").registerUniform("scales","f32",p.length).registerUniform("roi","f32",u.length).declareVariables(c,h)}
      ${_.mainStart()}
        ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
        ${b?"output[global_idx] = input[global_idx];":`
        let output_indices = ${h.offsetToIndices("global_idx")};
        var input_indices: ${c.type.indices};
        ${(()=>{switch(t.mode){case"nearest":return`input_indices = calculateInputIndicesFromOutputIndices(output_indices);
                if (checkInputIndices(input_indices)) {
                  output[global_idx] = ${c.getByIndices("input_indices")};
                } else {
                  output[global_idx] = ${t.extrapolationValue};
                }`;case"linear":return`output[global_idx] = ${s.length===2||s.length===4?"bilinearInterpolation":"trilinearInterpolation"}(output_indices);`;case"cubic":return"output[global_idx] = bicubicInterpolation(output_indices);";default:throw Error(`Unsupported resize mode: ${t.mode}`)}})()};
`}
      }`;return{name:"Resize",shaderCache:{hint:`${t.cacheKey}|${r}|${p.length>0?t.mode==="cubic"?p:p.length:""}|${n.length>0?n:""}|${u.length>0?u:""}|${b}|${t.mode==="nearest"?s.length:s}`,inputDependencies:["rank"]},getShaderSource:S,getRunData:()=>({outputs:[{dims:l,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:[{type:12,data:g},{type:1,data:p},{type:1,data:u},...X(s,l)]})}},ap=(e)=>{let t=e.customDataBuffer;return new Uint32Array(t.buffer,t.byteOffset,1)[0]},Uf=(e,t)=>{let r=[],i=[],n=[],a=ap(e);if(t.antialias!==0)throw Error("Only default value (0) for Antialias attribute is supported");Fd(e.inputs,t,a,r,i,n),e.compute(np(e.inputs[0],t,a,r,i,n),{inputs:[0]})},Lf=(e)=>{let{antialias:t,axes:r,coordinateTransformMode:i,cubicCoeffA:n}=e,a=e.excludeOutside!==0,s=e.extrapolationValue,u=e.keepAspectRatioPolicy,l=e.mode,p=e.nearestMode===""?"simple":e.nearestMode;return fe({antialias:t,axes:r,coordinateTransformMode:i,cubicCoeffA:n,excludeOutside:a,extrapolationValue:s,keepAspectRatioPolicy:u,mode:l,nearestMode:p})}}),Jy=U(()=>{ee(),ie(),ne(),sp=(e)=>{if(!e||e.length<3)throw Error("layerNorm requires at least 3 inputs.");let t=e[0],r=e[1],i=e[2];if(t.dataType!==r.dataType||t.dataType!==i.dataType)throw Error("All inputs must have the same data type");if(t.dims.length!==3&&t.dims.length!==2)throw Error("Input must be 2D or 3D");if(r.dims.length!==3&&r.dims.length!==2)throw Error("Skip must be 2D or 3D");let n=t.dims[t.dims.length-1],a=t.dims[t.dims.length-2];if(r.dims[r.dims.length-1]!==n)throw Error("Skip must have the same hidden size as input");if(r.dims[r.dims.length-2]!==a)throw Error("Skip must have the same sequence length as input");if(i.dims.length!==1)throw Error("Gamma must be 1D");if(i.dims[i.dims.length-1]!==n)throw Error("Gamma must have the same hidden size as input");if(e.length>3){let s=e[3];if(s.dims.length!==1)throw Error("Beta must be 1D");if(s.dims[s.dims.length-1]!==n)throw Error("Beta must have the same hidden size as input")}if(e.length>4){let s=e[4];if(s.dims.length!==1)throw Error("Bias must be 1D");if(s.dims[s.dims.length-1]!==n)throw Error("Bias must have the same hidden size as input")}},op=(e,t,r,i)=>{let n=t.simplified,a=e[0].dims,s=M.size(a),u=a,l=s,p=a.slice(-1)[0],h=i?a.slice(0,-1).concat(1):[],c=!n&&e.length>3,g=e.length>4,b=i&&r>1,y=i&&r>2,w=r>3,k=64,S=ke(p),_=[{type:12,data:l},{type:12,data:S},{type:12,data:p},{type:1,data:t.epsilon}],I=(C)=>{let A=[{name:"output_size",type:"u32"},{name:"components",type:"u32"},{name:"hidden_size",type:"u32"},{name:"epsilon",type:"f32"}],O=[B("x",e[0].dataType,e[0].dims,S),B("skip",e[1].dataType,e[1].dims,S),B("gamma",e[2].dataType,e[2].dims,S)];c&&O.push(B("beta",e[3].dataType,e[3].dims,S)),g&&O.push(B("bias",e[4].dataType,e[4].dims,S)),O.push(j("output",e[0].dataType,u,S)),b&&O.push(j("mean_output",1,h)),y&&O.push(j("inv_std_output",1,h)),w&&O.push(j("input_skip_bias_sum",e[0].dataType,u,S));let v=Ae(e[0].dataType),N=Ae(1,S);return`

      ${C.registerUniforms(A).declareVariables(...O)}
      var<workgroup> sum_shared : array<${N}, ${k}>;
      var<workgroup> sum_squared_shared : array<${N}, ${k}>;

      ${C.mainStart([k,1,1])}
        let ix = local_id.x;
        let iy = global_id.x / ${k};

        let hidden_size_vectorized: u32 = uniforms.hidden_size / uniforms.components;
        var stride = hidden_size_vectorized / ${k};
        let offset = ix * stride + iy * hidden_size_vectorized;
        let offset1d = stride * ix;
        if (ix == ${k-1}) {
          stride = hidden_size_vectorized - stride * ix;
        }
        for (var i: u32 = 0; i < stride; i++) {
          let skip_value = skip[offset + i];
          let bias_value = ${g?"bias[offset1d + i]":v+"(0.0)"};
          let input_value = x[offset + i];
          let value = input_value + skip_value + bias_value;
          ${w?"input_skip_bias_sum[offset + i] = value;":""}
          output[offset + i] = value;
          let f32_value = ${jt(v,S,"value")};
          sum_shared[ix] += f32_value;
          sum_squared_shared[ix] += f32_value * f32_value;
        }
        workgroupBarrier();

        var reduce_size : u32 = ${k};
        for (var curr_size = reduce_size >> 1;  curr_size > 0; curr_size = reduce_size >> 1) {
          reduce_size = curr_size + (reduce_size & 1);
          if (ix < curr_size) {
            sum_shared[ix] += sum_shared[ix + reduce_size];
            sum_squared_shared[ix] += sum_squared_shared[ix + reduce_size];
          }
          workgroupBarrier();
        }

        let sum = sum_shared[0];
        let square_sum = sum_squared_shared[0];
        let mean = ${vt("sum",S)} / f32(uniforms.hidden_size);
        let inv_std_dev = inverseSqrt(${vt("square_sum",S)} / f32(uniforms.hidden_size) ${n?"":"- mean * mean"} + uniforms.epsilon);
        ${b?"mean_output[global_idx] = mean;":""}
        ${y?"inv_std_output[global_idx] = inv_std_dev;":""}

        for (var i: u32 = 0; i < stride; i++) {
          output[offset + i] = (output[offset + i] ${n?"":`- ${v}(mean)`}) *
            ${v}(inv_std_dev) * gamma[offset1d + i]
            ${c?"+ beta[offset1d + i]":""};
        }
      }`},T=[{dims:u,dataType:e[0].dataType}];return r>1&&T.push({dims:h,dataType:1}),r>2&&T.push({dims:h,dataType:1}),r>3&&T.push({dims:a,dataType:e[0].dataType}),{name:"SkipLayerNormalization",shaderCache:{hint:`${S};${b};${y};${w}`,inputDependencies:e.map((C,A)=>"type")},getShaderSource:I,getRunData:()=>({outputs:T,dispatchGroup:{x:Math.ceil(l/p)},programUniforms:_})}},qf=(e,t)=>{sp(e.inputs);let r=[0];e.outputCount>1&&r.push(-3),e.outputCount>2&&r.push(-3),e.outputCount>3&&r.push(3),e.compute(op(e.inputs,t,e.outputCount,!1),{outputs:r})}}),eb=U(()=>{ee(),ie(),Te(),ne(),up=(e,t)=>{if(!e||e.length<1)throw Error("too few inputs");if(t.axes.length!==0){if(t.axes.length!==t.starts.length||t.axes.length!==t.ends.length)throw Error("axes, starts and ends must have the same length")}else if(t.starts.length!==t.ends.length)throw Error("starts and ends must have the same length");e.slice(1).forEach((r,i)=>{if(e[i+1].dataType!==6&&e[i+1].dataType!==7)throw Error(`Input ${i} must be an array of int32 or int64`)})},fr=(e,t)=>{let r=[];if(e.length>t)if(e[t].dataType===7)e[t].getBigInt64Array().forEach((i)=>r.push(Number(i)));else if(e[t].dataType===6)e[t].getInt32Array().forEach((i)=>r.push(Number(i)));else throw Error(`Input ${t} must be an array of int32 or int64`);return r},lp=(e,t)=>{if(e.length>1){let r=fr(e,1),i=fr(e,2),n=fr(e,3);return n.length===0&&(n=[...Array(e[0].dims.length).keys()]),fe({starts:r,ends:i,axes:n})}else return t},Mn=(e,t,r,i,n)=>{let a=e;return e<0&&(a+=r[i[t]]),n[t]<0?Math.max(0,Math.min(a,r[i[t]]-1)):Math.max(0,Math.min(a,r[i[t]]))},dp=(e,t,r)=>`fn calculateInputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
          var input_indices: ${e.type.indices};
          var carry = 0u;
          for (var i = ${r.length-1}; i >= 0; i--) {
            let input_shape_i = ${Z("uniforms.input_shape","i",r.length)};
            let steps_i = ${Z("uniforms.steps","i",r.length)};
            let signs_i = ${Z("uniforms.signs","i",r.length)};
            let starts_i = ${Z("uniforms.starts","i",r.length)};
            var output_index = ${t.indicesGet("output_indices","i")};
            var input_index = output_index * steps_i + starts_i + carry;
            carry = input_index / input_shape_i;
            input_index = input_index % input_shape_i;
            if (signs_i < 0) {
              input_index = input_shape_i - input_index - 1u + starts_i;
            }
            ${e.indicesSet("input_indices","i","input_index")};
          }
          return input_indices;
      }`,pp=(e,t)=>{let r=e[0].dims,i=M.size(r),n=t.axes.length>0?M.normalizeAxes(t.axes,r.length):[...Array(r.length).keys()],a=fr(e,4);a.forEach((S)=>S!==0||(()=>{throw Error("step cannot be 0")})),a.length===0&&(a=Array(n.length).fill(1));let s=t.starts.map((S,_)=>Mn(S,_,r,n,a)),u=t.ends.map((S,_)=>Mn(S,_,r,n,a));if(n.length!==s.length||n.length!==u.length)throw Error("start, ends and axes should have the same number of elements");if(n.length!==r.length)for(let S=0;S<r.length;++S)n.includes(S)||(s.splice(S,0,0),u.splice(S,0,r[S]),a.splice(S,0,1));let l=a.map((S)=>Math.sign(S));a.forEach((S,_,I)=>{if(S<0){let T=(u[_]-s[_])/S,C=s[_],A=C+T*a[_];s[_]=A,u[_]=C,I[_]=-S}});let p=r.slice(0);n.forEach((S,_)=>{p[S]=Math.ceil((u[S]-s[S])/a[S])});let h={dims:p,dataType:e[0].dataType},c=j("output",e[0].dataType,p.length),g=B("input",e[0].dataType,e[0].dims.length),b=M.size(p),y=[{name:"outputSize",type:"u32"},{name:"starts",type:"u32",length:s.length},{name:"signs",type:"i32",length:l.length},{name:"steps",type:"u32",length:a.length}],w=[{type:12,data:b},{type:12,data:s},{type:6,data:l},{type:12,data:a},...X(e[0].dims,p)],k=(S)=>`
      ${S.registerUniforms(y).declareVariables(g,c)}
        ${dp(g,c,r)}
        ${S.mainStart()}
          ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
          let output_indices = ${c.offsetToIndices("global_idx")};
          let input_indices = calculateInputIndices(output_indices);
          ${c.setByOffset("global_idx",g.getByIndices("input_indices"))}
      }`;return{name:"Slice",shaderCache:{hint:`${l.length}_${s.length}_${a.length}`,inputDependencies:["rank"]},getShaderSource:k,getRunData:()=>({outputs:[h],dispatchGroup:{x:Math.ceil(i/64)},programUniforms:w})}},Vf=(e,t)=>{up(e.inputs,t);let r=lp(e.inputs,t);e.compute(pp(e.inputs,r),{inputs:[0]})},Wf=(e)=>{let{starts:t,ends:r,axes:i}=e;return fe({starts:t,ends:r,axes:i})}}),tb=U(()=>{ee(),ie(),Te(),$t(),ne(),cp=(e)=>{if(!e||e.length!==1)throw Error("Softmax op requires 1 input.")},hp=(e,t)=>{let r=e.inputs[0],i=r.dims,n=M.size(i),a=i.length,s=M.normalizeAxis(t.axis,a),u=s<i.length-1,l,p=[];u?(p=Array.from({length:a},(O,v)=>v),p[s]=a-1,p[a-1]=s,l=e.compute(Pe(r,p),{inputs:[r],outputs:[-1]})[0]):l=r;let h=l.dims,c=h[a-1],g=n/c,b=ke(c),y=c/b,w=64;g===1&&(w=256);let k=(O,v)=>v===4?`max(max(${O}.x, ${O}.y), max(${O}.z, ${O}.w))`:v===2?`max(${O}.x, ${O}.y)`:v===3?`max(max(${O}.x, ${O}.y), ${O}.z)`:O,S=B("x",l.dataType,l.dims,b),_=j("result",l.dataType,l.dims,b),I=S.type.value,T=Ae(l.dataType)==="f32"?`var threadMax = ${I}(-3.4028234663852886e+38f);`:`var threadMax = ${I}(-65504.0h);`,C=(O)=>`
      var<workgroup> rowMaxShared : ${I};
      var<workgroup> rowSumShared : ${I};
      var<workgroup> threadShared : array<${I}, ${w}>;

      fn getValue(row: i32, col: i32, row_stride: i32) -> ${I} {
        let index = row * row_stride + col;
        return x[index];
      }

      fn setValue(row: i32, col: i32, row_stride: i32, value: ${I}) {
        let index = row * row_stride + col;
        result[index] = value;
      }
      ${O.registerUniform("packedCols","i32").declareVariables(S,_)}
      ${O.mainStart(w)}
        let gindex = i32(global_idx);
        let lindex = i32(local_idx);
        const wg = ${w};
        let row = gindex / wg;
        let cols = uniforms.packedCols;
        let row_stride : i32 = uniforms.packedCols;

        // find the rows max
        ${T}
        for (var col = lindex; col < cols; col += wg) {
          let value = getValue(row, col, row_stride);
          threadMax = max(threadMax, value);
        }
        if (lindex < cols) {
          threadShared[lindex] = threadMax;
        }
        workgroupBarrier();

        var reduceSize = min(cols, wg);
        for (var currSize = reduceSize >> 1;  currSize > 0; currSize = reduceSize >> 1) {
          reduceSize = currSize + (reduceSize & 1);
          if (lindex < currSize) {
            threadShared[lindex] = max(threadShared[lindex], threadShared[lindex + reduceSize]);
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowMaxShared = ${I}(${k("threadShared[0]",b)});
        }
        workgroupBarrier();

        // find the rows sum
        var threadSum = ${I}(0.0);
        for (var col = lindex; col < cols; col += wg) {
          let subExp = exp(getValue(row, col, row_stride) - rowMaxShared);
          threadSum += subExp;
        }
        threadShared[lindex] = threadSum;
        workgroupBarrier();

        for (var currSize = wg >> 1;  currSize > 0; currSize = currSize >> 1) {
          if (lindex < currSize) {
            threadShared[lindex] = threadShared[lindex] + threadShared[lindex + currSize];
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowSumShared = ${I}(${vt("threadShared[0]",b)});
        }
        workgroupBarrier();

        // calculate final value for each element in the row
        for (var col = lindex; col < cols; col += wg) {
          var value = exp(getValue(row, col, row_stride) - rowMaxShared) / rowSumShared;
          // max operation protects against NaN since all values should be >=0
          value = max(value, ${I}(0.0));
          setValue(row, col, row_stride, value);
        }
      }`,A=e.compute({name:"Softmax",shaderCache:{hint:`${b};${w}`,inputDependencies:["type"]},getRunData:()=>({outputs:[{dims:h,dataType:l.dataType}],dispatchGroup:{x:g},programUniforms:[{type:6,data:y}]}),getShaderSource:C},{inputs:[l],outputs:[u?-1:0]})[0];u&&e.compute(Pe(A,p),{inputs:[A]})},Gf=(e,t)=>{cp(e.inputs),hp(e,t)},Hf=(e)=>fe({axis:e.axis})}),rb=U(()=>{ee(),ie(),ne(),Bn=(e)=>Array.from(e.getBigInt64Array(),Number),fp=(e)=>{if(!e||e.length!==2)throw Error("Tile requires 2 inputs.");if(e[0].dataType!==1&&e[0].dataType!==10&&e[0].dataType!==6&&e[0].dataType!==12)throw Error("Tile only support float, float16, int32, and uint32 data types");if(e[1].dataType!==7)throw Error("Tile `repeats` input should be of int64 data type");if(e[1].dims.length!==1)throw Error("Tile `repeats` input should be 1-D");if(Bn(e[1]).length!==e[0].dims.length)throw Error("Tile `repeats` input should have same number of elements as rank of input data tensor")},mp=(e,t)=>{let r=[];for(let i=0;i<e.length;++i)r.push(e[i]*t[i]);return r},gp=(e,t)=>{let r=e[0].dims,i=t??Bn(e[1]),n=mp(r,i),a=M.size(n),s=e[0].dataType,u=B("input",s,r.length),l=j("output",s,n.length),p=(h)=>`
      const inputShape = ${u.indices(...r)};
      ${h.registerUniform("output_size","u32").declareVariables(u,l)}
      ${h.mainStart()}
      ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let output_indices = ${l.offsetToIndices("global_idx")};
      var input_indices: ${u.type.indices};
      for (var i = 0; i < ${r.length}; i++) {
        let input_dim_i = ${u.indicesGet("uniforms.input_shape","i")};
        let input_dim_value = ${l.indicesGet("output_indices","i")}  % input_dim_i;

        ${u.indicesSet("input_indices","i","input_dim_value")}
      }
      ${l.setByOffset("global_idx",u.getByIndices("input_indices"))}
    }`;return{name:"Tile",shaderCache:{hint:`${i}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:n,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:[{type:12,data:a},...X(e[0].dims,n)]}),getShaderSource:p}},Ff=(e)=>{fp(e.inputs),e.compute(gp(e.inputs),{inputs:[0]})}}),ib=U(()=>{ee(),ie(),ne(),yp=(e,t,r,i,n)=>{let a=j("output_data",n,r.length,4),s=B("a_data",t[1].dataType,t[1].dims.length,4),u=B("b_data",t[2].dataType,t[2].dims.length,4),l=B("c_data",t[0].dataType,t[0].dims.length,4),p,h=(c,g,b)=>`select(${g}, ${c}, ${b})`;if(!i)p=a.setByOffset("global_idx",h(s.getByOffset("global_idx"),u.getByOffset("global_idx"),l.getByOffset("global_idx")));else{let c=(g,b,y="")=>{let w=`a_data[index_a${b}][component_a${b}]`,k=`b_data[index_b${b}][component_b${b}]`,S=`bool(c_data[index_c${b}] & (0xffu << (component_c${b} * 8)))`;return`
            let output_indices${b} = ${a.offsetToIndices(`global_idx * 4u + ${b}u`)};
            let offset_a${b} = ${s.broadcastedIndicesToOffset(`output_indices${b}`,a)};
            let offset_b${b} = ${u.broadcastedIndicesToOffset(`output_indices${b}`,a)};
            let offset_c${b} = ${l.broadcastedIndicesToOffset(`output_indices${b}`,a)};
            let index_a${b} = offset_a${b} / 4u;
            let index_b${b} = offset_b${b} / 4u;
            let index_c${b} = offset_c${b} / 4u;
            let component_a${b} = offset_a${b} % 4u;
            let component_b${b} = offset_b${b} % 4u;
            let component_c${b} = offset_c${b} % 4u;
            ${g}[${b}] = ${y}(${h(w,k,S)});
          `};n===9?p=`
            var data = vec4<u32>(0);
            ${c("data",0,"u32")}
            ${c("data",1,"u32")}
            ${c("data",2,"u32")}
            ${c("data",3,"u32")}
            output_data[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:p=`
            ${c("output_data[global_idx]",0)}
            ${c("output_data[global_idx]",1)}
            ${c("output_data[global_idx]",2)}
            ${c("output_data[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(l,s,u,a)}
        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${p}
      }`},bp=(e)=>{let t=e[1].dims,r=e[2].dims,i=e[0].dims,n=e[1].dataType,a=!(M.areEqual(t,r)&&M.areEqual(r,i)),s=t,u=M.size(t);if(a){let p=Kt.calcShape(Kt.calcShape(t,r,!1),i,!1);if(!p)throw Error("Can't perform where op on the given tensors");s=p,u=M.size(s)}let l=Math.ceil(u/4);return{name:"Where",shaderCache:{inputDependencies:["rank","rank","rank"]},getShaderSource:(p)=>yp(p,e,s,a,n),getRunData:()=>({outputs:[{dims:s,dataType:n}],dispatchGroup:{x:Math.ceil(u/64/4)},programUniforms:[{type:12,data:l},...X(i,t,r,s)]})}},jf=(e)=>{e.compute(bp(e.inputs))}}),nb=U(()=>{yy(),ga(),by(),_y(),wy(),vy(),$y(),Ey(),Cy(),Ay(),zy(),Oy(),Ry(),My(),By(),Dy(),Ny(),Py(),Uy(),Ly(),qy(),Vy(),Wy(),Gy(),Hy(),Fy(),hf(),jy(),Ky(),Zy(),Yy(),Xy(),ma(),Qy(),bf(),Jy(),eb(),tb(),gf(),rb(),$t(),ya(),ib(),Kf=new Map([["Abs",[Nc]],["Acos",[Pc]],["Acosh",[Uc]],["Add",[wh]],["ArgMax",[Rc,Hn]],["ArgMin",[Oc,Hn]],["Asin",[Lc]],["Asinh",[qc]],["Atan",[Vc]],["Atanh",[Wc]],["Attention",[Mc]],["AveragePool",[Ef,Tf]],["BatchNormalization",[Bc]],["BiasAdd",[Dc]],["BiasSplitGelu",[_h]],["Cast",[Hc,Gc]],["Ceil",[jc]],["Clip",[Fc]],["Concat",[Ah,zh]],["Conv",[Xn,Yn]],["ConvTranspose",[qh,Lh]],["Cos",[Kc]],["Cosh",[Zc]],["CumSum",[Vh,Wh]],["DepthToSpace",[Gh,Hh]],["DequantizeLinear",[Mf,Bf]],["DFT",[Fh,jh]],["Div",[vh]],["Einsum",[Kh,Zh]],["Elu",[Yc,br]],["Equal",[$h]],["Erf",[Xc]],["Exp",[Qc]],["Expand",[Yh]],["FastGelu",[Xh]],["Floor",[Jc]],["FusedConv",[Xn,Yn]],["Gather",[Jh,Qh]],["GatherElements",[sf,af]],["GatherBlockQuantized",[rf,nf]],["GatherND",[ef,tf]],["Gelu",[eh]],["Gemm",[uf,of]],["GlobalAveragePool",[Cf,If]],["GlobalMaxPool",[Rf,Of]],["Greater",[Th]],["GreaterOrEqual",[Ih]],["GridSample",[lf,df]],["GroupQueryAttention",[_f]],["HardSigmoid",[uh,oh]],["HardSwish",[lh]],["InstanceNormalization",[wf]],["LayerNormalization",[vf]],["LeakyRelu",[th,br]],["Less",[Eh]],["LessOrEqual",[Ch]],["Log",[yh]],["MatMul",[$f]],["MatMulNBits",[xf,Sf]],["MaxPool",[Af,zf]],["Mul",[xh]],["MultiHeadAttention",[cf,pf]],["Neg",[ih]],["Not",[rh]],["Pad",[kf]],["Pow",[Sh]],["QuickGelu",[bh,br]],["Range",[Df]],["Reciprocal",[nh]],["ReduceMin",[Ec]],["ReduceMean",[$c]],["ReduceMax",[Tc]],["ReduceSum",[Cc]],["ReduceProd",[Ic]],["ReduceL1",[xc]],["ReduceL2",[Sc]],["ReduceLogSum",[zc]],["ReduceLogSumExp",[kc]],["ReduceSumSquare",[Ac]],["Relu",[ah]],["Resize",[Uf,Lf]],["RotaryEmbedding",[yf]],["ScatterND",[Pf,Nf]],["Sigmoid",[sh]],["Sin",[dh]],["Sinh",[ph]],["Slice",[Vf,Wf]],["SkipLayerNormalization",[qf]],["Split",[ff,mf]],["Sqrt",[ch]],["Softmax",[Gf,Hf]],["Sub",[kh]],["Tan",[hh]],["Tanh",[fh]],["ThresholdedRelu",[gh,br]],["Tile",[Ff]],["Transpose",[dc,pc]],["Where",[jf]]])}),ab=U(()=>{Ve(),ot(),ne(),Zf=class{constructor(e){this.backend=e,this.repo=new Map,this.attributesBound=!1}getArtifact(e){return this.repo.get(e)}setArtifact(e,t){this.repo.set(e,t)}run(e,t,r,i,n){Xe(e.programInfo.name);let a=this.backend.device,s=this.backend.getComputePassEncoder();this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2);let u=[];for(let p of t)u.push({binding:u.length,resource:{buffer:p.buffer}});for(let p of r)u.push({binding:u.length,resource:{buffer:p.buffer}});n&&u.push({binding:u.length,resource:n});let l=a.createBindGroup({layout:e.computePipeline.getBindGroupLayout(0),entries:u,label:e.programInfo.name});if(this.backend.sessionStatus==="capturing"){let p={kernelId:this.backend.currentKernelId,computePipeline:e.computePipeline,bindGroup:l,dispatchGroup:i};this.backend.capturedCommandList.get(this.backend.currentSessionId).push(p)}s.setPipeline(e.computePipeline),s.setBindGroup(0,l),s.dispatchWorkgroups(...i),this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2+1),this.backend.pendingDispatchNumber++,(this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber||this.backend.queryType==="at-passes")&&this.backend.endComputePass(),this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber&&this.backend.flush(),qe(e.programInfo.name)}dispose(){}build(e,t){Xe(e.name);let r=this.backend.device,i=[];[{feature:"shader-f16",extension:"f16"},{feature:"subgroups",extension:"subgroups"}].forEach((p)=>{r.features.has(p.feature)&&i.push(`enable ${p.extension};`)});let n=lc(t,this.backend.device.limits),a=e.getShaderSource(n),s=`${i.join(`
`)}
${n.additionalImplementations}
${a}`,u=r.createShaderModule({code:s,label:e.name});pe("verbose",()=>`[WebGPU] ${e.name} shader code: ${s}`);let l=r.createComputePipeline({compute:{module:u,entryPoint:"main"},layout:"auto",label:e.name});return qe(e.name),{programInfo:e,computePipeline:l,uniformVariablesInfo:n.variablesInfo}}normalizeDispatchGroupSize(e){let t=typeof e=="number"?e:e.x,r=typeof e=="number"?1:e.y||1,i=typeof e=="number"?1:e.z||1,n=this.backend.device.limits.maxComputeWorkgroupsPerDimension;if(t<=n&&r<=n&&i<=n)return[t,r,i];let a=t*r*i,s=Math.ceil(Math.sqrt(a));if(s>n){if(s=Math.ceil(Math.cbrt(a)),s>n)throw Error("Total dispatch size exceeds WebGPU maximum.");return[s,s,s]}else return[s,s,1]}}}),Yf={};Yt(Yf,{WebGpuBackend:()=>Xf});sb=U(()=>{Ve(),ee(),ot(),nc(),my(),nb(),ab(),_p=(e,t)=>{if(t.length!==e.length)throw Error(`inputDependencies length ${t.length} is not equal to inputTensors length ${e.length}.`);let r=[];for(let i=0;i<e.length;++i){let n=e[i].dataType;switch(t[i]){case"none":{r.push("");break}case"type":{r.push(`${n}`);break}case"rank":{let a=e[i].dims.length;r.push(`${n};${a}`);break}case"dims":{let a=e[i].dims.join(",");r.push(`${n};${a}`);break}default:throw Error(`unsupported input dependency: ${t[i]}`)}}return r.join("|")},wp=(e,t,r)=>{let i=e.name;return e.shaderCache?.hint&&(i+="["+e.shaderCache.hint+"]"),i+=":"+r+`:${_p(t,e.shaderCache?.inputDependencies??Array(t.length).fill("dims"))}`,i},vp=class{constructor(e){e&&(this.architecture=e.architecture,this.vendor=e.vendor)}isArchitecture(e){return this.architecture===e}isVendor(e){return this.vendor===e}},Xf=class{constructor(){this.currentSessionId=null,this.currentKernelId=null,this.commandEncoder=null,this.computePassEncoder=null,this.maxDispatchNumber=16,this.pendingDispatchNumber=0,this.pendingKernels=[],this.pendingQueries=new Map,this.sessionStatus="default",this.capturedCommandList=new Map,this.capturedPendingKernels=new Map,this.sessionExternalDataMapping=new Map}get currentKernelCustomData(){if(this.currentKernelId===null)throw Error("currentKernelCustomData(): currentKernelId is null. (should not happen)");let e=this.kernelCustomData.get(this.currentKernelId);return e||(e={},this.kernelCustomData.set(this.currentKernelId,e)),e}async initialize(e,t){this.env=e;let r=[],i={requiredLimits:{maxComputeWorkgroupStorageSize:t.limits.maxComputeWorkgroupStorageSize,maxComputeWorkgroupsPerDimension:t.limits.maxComputeWorkgroupsPerDimension,maxStorageBufferBindingSize:t.limits.maxStorageBufferBindingSize,maxBufferSize:t.limits.maxBufferSize,maxComputeInvocationsPerWorkgroup:t.limits.maxComputeInvocationsPerWorkgroup,maxComputeWorkgroupSizeX:t.limits.maxComputeWorkgroupSizeX,maxComputeWorkgroupSizeY:t.limits.maxComputeWorkgroupSizeY,maxComputeWorkgroupSizeZ:t.limits.maxComputeWorkgroupSizeZ},requiredFeatures:r},n=(u)=>t.features.has(u)&&r.push(u)&&!0;n("chromium-experimental-timestamp-query-inside-passes")||n("timestamp-query"),n("shader-f16"),n("subgroups"),this.device=await t.requestDevice(i);let a=t,s=t.info??(typeof a.requestAdapterInfo=="function"?await a.requestAdapterInfo():void 0);this.adapterInfo=new vp(s),this.gpuDataManager=oc(this),this.programManager=new Zf(this),this.kernels=new Map,this.kernelPersistentData=new Map,this.kernelCustomData=new Map,pa(e.logLevel,!!e.debug),this.device.onuncapturederror=(u)=>{u.error instanceof GPUValidationError&&console.error(`An uncaught WebGPU validation error was raised: ${u.error.message}`)},Object.defineProperty(this.env.webgpu,"device",{value:this.device,writable:!1,enumerable:!0,configurable:!0}),Object.defineProperty(this.env.webgpu,"adapter",{value:t,writable:!1,enumerable:!0,configurable:!1}),this.setQueryType()}dispose(){typeof this.querySet<"u"&&this.querySet.destroy(),this.gpuDataManager.dispose(),this.device&&this.env?.webgpu&&this.device.lost.then(()=>{delete this.env.webgpu.device})}getCommandEncoder(){return this.commandEncoder||(this.commandEncoder=this.device.createCommandEncoder()),this.commandEncoder}getComputePassEncoder(){if(!this.computePassEncoder){let e=this.getCommandEncoder(),t={};this.queryType==="at-passes"&&(t.timestampWrites={querySet:this.querySet,beginningOfPassWriteIndex:this.pendingDispatchNumber*2,endOfPassWriteIndex:this.pendingDispatchNumber*2+1}),this.computePassEncoder=e.beginComputePass(t)}return this.computePassEncoder}endComputePass(){this.computePassEncoder&&(this.computePassEncoder.end(),this.computePassEncoder=null)}flush(){if(!this.commandEncoder)return;Xe(),this.endComputePass();let e;this.queryType!=="none"&&(this.commandEncoder.resolveQuerySet(this.querySet,0,this.pendingDispatchNumber*2,this.queryResolveBuffer,0),e=this.device.createBuffer({size:this.pendingDispatchNumber*2*8,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),this.pendingQueries.set(e,this.pendingKernels),this.pendingKernels=[],this.commandEncoder.copyBufferToBuffer(this.queryResolveBuffer,0,e,0,this.pendingDispatchNumber*2*8)),this.device.queue.submit([this.commandEncoder.finish()]),this.gpuDataManager.refreshPendingBuffers(),this.commandEncoder=null,this.pendingDispatchNumber=0,this.queryType!=="none"&&e.mapAsync(GPUMapMode.READ).then(()=>{let t=new BigUint64Array(e.getMappedRange()),r=this.pendingQueries.get(e);for(let i=0;i<t.length/2;i++){let n=r[i],a=n.kernelId,s=this.kernels.get(a),u=s.kernelType,l=s.kernelName,p=n.programName,h=n.inputTensorViews,c=n.outputTensorViews,g=t[i*2],b=t[i*2+1];typeof this.queryTimeBase>"u"&&(this.queryTimeBase=g);let y=Number(g-this.queryTimeBase),w=Number(b-this.queryTimeBase);if(!Number.isSafeInteger(y)||!Number.isSafeInteger(w))throw RangeError("incorrect timestamp range");if(this.env.webgpu.profiling?.ondata)this.env.webgpu.profiling.ondata({version:1,inputsMetadata:h.map((k)=>({dims:k.dims,dataType:st(k.dataType)})),outputsMetadata:c.map((k)=>({dims:k.dims,dataType:st(k.dataType)})),kernelId:a,kernelType:u,kernelName:l,programName:p,startTime:y,endTime:w});else{let k="";h.forEach((_,I)=>{k+=`input[${I}]: [${_.dims}] | ${st(_.dataType)}, `});let S="";c.forEach((_,I)=>{S+=`output[${I}]: [${_.dims}] | ${st(_.dataType)}, `}),console.log(`[profiling] kernel "${a}|${u}|${l}|${p}" ${k}${S}start time: ${y} ns, execution time: ${w-y} ns`)}$r("GPU",`${p}::${g}::${b}`)}e.unmap(),this.pendingQueries.delete(e)}),qe()}run(e,t,r,i,n,a){Xe(e.name);let s=[];for(let _=0;_<t.length;++_){let I=t[_].data;if(I===0)continue;let T=this.gpuDataManager.get(I);if(!T)throw Error(`no GPU data for input: ${I}`);s.push(T)}let{outputs:u,dispatchGroup:l,programUniforms:p}=e.getRunData(t),h=r.length===0?u.map((_,I)=>I):r;if(h.length!==u.length)throw Error(`Output size ${h.length} must be equal to ${u.length}.`);let c=[],g=[];for(let _=0;_<u.length;++_){if(!Number.isInteger(h[_])||h[_]<-3||h[_]>=a)throw Error(`Invalid output index: ${h[_]}`);if(h[_]===-3)continue;let I=h[_]===-1,T=h[_]===-2,C=I||T?n(u[_].dataType,u[_].dims):i(h[_],u[_].dataType,u[_].dims);if(c.push(C),C.data===0)continue;let A=this.gpuDataManager.get(C.data);if(!A)throw Error(`no GPU data for output: ${C.data}`);if(I&&this.temporaryData.push(A),T){let O=this.kernelPersistentData.get(this.currentKernelId);O||(O=[],this.kernelPersistentData.set(this.currentKernelId,O)),O.push(A)}g.push(A)}if(s.length!==t.length||g.length!==c.length){if(g.length===0)return qe(e.name),c;throw Error(`Program ${e.name} has zero-sized tensor(s) in inputs or outputs. This is not supported now.`)}let b;if(p){let _=0,I=[];p.forEach((O)=>{let v=typeof O.data=="number"?[O.data]:O.data;if(v.length===0)return;let N=O.type===10?2:4,q,F;O.type===10?(F=v.length>4?16:v.length>2?8:v.length*N,q=v.length>4?16:N*v.length):(F=v.length<=2?v.length*N:16,q=16),_=Math.ceil(_/F)*F,I.push(_);let W=O.type===10?8:4;_+=v.length>4?Math.ceil(v.length/W)*q:v.length*N});let T=16;_=Math.ceil(_/T)*T;let C=new ArrayBuffer(_);p.forEach((O,v)=>{let N=I[v],q=typeof O.data=="number"?[O.data]:O.data;if(O.type===6)new Int32Array(C,N,q.length).set(q);else if(O.type===12)new Uint32Array(C,N,q.length).set(q);else if(O.type===10)new Uint16Array(C,N,q.length).set(q);else if(O.type===1)new Float32Array(C,N,q.length).set(q);else throw Error(`Unsupported uniform type: ${st(O.type)}`)});let A=this.gpuDataManager.create(_,GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM);this.device.queue.writeBuffer(A.buffer,0,C,0,_),this.gpuDataManager.release(A.id),b={offset:0,size:_,buffer:A.buffer}}let y=this.programManager.normalizeDispatchGroupSize(l),w=y[1]===1&&y[2]===1,k=wp(e,t,w),S=this.programManager.getArtifact(k);if(S||(S=this.programManager.build(e,y),this.programManager.setArtifact(k,S),pe("info",()=>`[artifact] key: ${k}, programName: ${e.name}`)),p&&S.uniformVariablesInfo){if(p.length!==S.uniformVariablesInfo.length)throw Error(`Uniform variables count mismatch: expect ${S.uniformVariablesInfo.length}, got ${p.length} in program "${S.programInfo.name}".`);for(let _=0;_<p.length;_++){let I=p[_],T=I.type,C=typeof I.data=="number"?1:I.data.length,[A,O]=S.uniformVariablesInfo[_];if(T!==A||C!==O)throw Error(`Uniform variable ${_} mismatch: expect type ${A} with size ${O}, got type ${T} with size ${C} in program "${S.programInfo.name}".`)}}if(pe("info",()=>`[ProgramManager] run "${e.name}" (key=${k}) with ${y[0]}x${y[1]}x${y[2]}`),this.queryType!=="none"||this.sessionStatus==="capturing"){let _={kernelId:this.currentKernelId,programName:S.programInfo.name,inputTensorViews:t,outputTensorViews:c};this.pendingKernels.push(_),this.sessionStatus==="capturing"&&this.capturedPendingKernels.get(this.currentSessionId).push(_)}return this.programManager.run(S,s,g,y,b),qe(e.name),c}upload(e,t){this.gpuDataManager.upload(e,t)}memcpy(e,t){this.gpuDataManager.memcpy(e,t)}async download(e,t){await this.gpuDataManager.download(e,t)}alloc(e){return this.gpuDataManager.create(e).id}free(e){return this.gpuDataManager.release(e)}createKernel(e,t,r,i){let n=Kf.get(e);if(!n)throw Error(`kernel not implemented: ${e}`);let a={kernelType:e,kernelName:i,kernelEntry:n[0],attributes:[n[1],r]};this.kernels.set(t,a)}releaseKernel(e){let t=this.kernelPersistentData.get(e);if(t){for(let r of t)this.gpuDataManager.release(r.id);this.kernelPersistentData.delete(e)}this.kernelCustomData.delete(e),this.kernels.delete(e)}computeKernel(e,t,r){let i=this.kernels.get(e);if(!i)throw Error(`kernel not created: ${e}`);let{kernelType:n,kernelName:a,kernelEntry:s,attributes:u}=i;if(this.currentKernelId!==null)throw Error(`kernel "[${n}] ${a}" is not allowed to be called recursively`);this.currentKernelId=e,u[0]&&(u[1]=u[0](u[1]),u[0]=void 0),pe("info",()=>`[WebGPU] Start to run kernel "[${n}] ${a}"...`);let l=this.env.debug;this.temporaryData=[];try{return l&&this.device.pushErrorScope("validation"),s(t,u[1]),0}catch(p){return r.push(Promise.resolve(`[WebGPU] Kernel "[${n}] ${a}" failed. ${p}`)),1}finally{l&&r.push(this.device.popErrorScope().then((p)=>p?`GPU validation error for kernel "[${n}] ${a}": ${p.message}`:null));for(let p of this.temporaryData)this.gpuDataManager.release(p.id);this.temporaryData=[],this.currentKernelId=null}}registerBuffer(e,t,r,i){let n=this.sessionExternalDataMapping.get(e);n||(n=new Map,this.sessionExternalDataMapping.set(e,n));let a=n.get(t),s=this.gpuDataManager.registerExternalBuffer(r,i,a);return n.set(t,[s,r]),s}unregisterBuffers(e){let t=this.sessionExternalDataMapping.get(e);t&&(t.forEach((r)=>this.gpuDataManager.unregisterExternalBuffer(r[0])),this.sessionExternalDataMapping.delete(e))}getBuffer(e){let t=this.gpuDataManager.get(e);if(!t)throw Error(`no GPU data for buffer: ${e}`);return t.buffer}createDownloader(e,t,r){return async()=>{let i=await Vn(this,e,t);return ca(i.buffer,r)}}writeTimestamp(e){this.queryType==="inside-passes"&&this.computePassEncoder.writeTimestamp(this.querySet,e)}setQueryType(){this.queryType="none",(this.env.webgpu.profiling?.mode==="default"||(typeof this.env.trace>"u"?this.env.wasm.trace:this.env.trace))&&(this.device.features.has("chromium-experimental-timestamp-query-inside-passes")?this.queryType="inside-passes":this.device.features.has("timestamp-query")&&(this.queryType="at-passes"),this.queryType!=="none"&&typeof this.querySet>"u"&&(this.querySet=this.device.createQuerySet({type:"timestamp",count:this.maxDispatchNumber*2}),this.queryResolveBuffer=this.device.createBuffer({size:this.maxDispatchNumber*2*8,usage:GPUBufferUsage.COPY_SRC|GPUBufferUsage.QUERY_RESOLVE})))}captureBegin(){pe("info","captureBegin"),this.capturedCommandList.get(this.currentSessionId)||this.capturedCommandList.set(this.currentSessionId,[]),this.capturedPendingKernels.get(this.currentSessionId)||this.capturedPendingKernels.set(this.currentSessionId,[]),this.flush(),this.sessionStatus="capturing"}captureEnd(){pe("info","captureEnd"),this.flush(),this.sessionStatus="default"}replay(){pe("info","replay"),this.sessionStatus="replaying";let e=this.capturedCommandList.get(this.currentSessionId),t=this.capturedPendingKernels.get(this.currentSessionId),r=e.length;this.pendingKernels=[];for(let i=0;i<r;i++){let n=this.getComputePassEncoder(),a=e[i];this.writeTimestamp(this.pendingDispatchNumber*2),n.setPipeline(a.computePipeline),n.setBindGroup(0,a.bindGroup),n.dispatchWorkgroups(...a.dispatchGroup),this.writeTimestamp(this.pendingDispatchNumber*2+1),this.pendingDispatchNumber++,this.queryType!=="none"&&this.pendingKernels.push(t[i]),(this.pendingDispatchNumber>=this.maxDispatchNumber||this.queryType==="at-passes")&&this.endComputePass(),this.pendingDispatchNumber>=this.maxDispatchNumber&&this.flush()}this.flush(),this.sessionStatus="default"}onCreateSession(){this.gpuDataManager.onCreateSession()}onReleaseSession(e){this.unregisterBuffers(e),this.capturedCommandList.has(e)&&this.capturedCommandList.delete(e),this.capturedPendingKernels.has(e)&&this.capturedPendingKernels.delete(e),this.gpuDataManager.onReleaseSession(e)}onRunStart(e){this.currentSessionId=e,this.setQueryType()}}}),Qf={};Yt(Qf,{init:()=>Jf});ob=U(()=>{ee(),ot(),ie(),fy(),Jr=class e{constructor(t,r,i,n){this.module=t,this.dataType=r,this.data=i,this.dims=n}getFloat32Array(){if(this.dataType!==1)throw Error("Invalid data type");let t=M.size(this.dims);return t===0?new Float32Array:new Float32Array(this.module.HEAP8.buffer,this.data,t)}getBigInt64Array(){if(this.dataType!==7)throw Error("Invalid data type");let t=M.size(this.dims);return t===0?new BigInt64Array:new BigInt64Array(this.module.HEAP8.buffer,this.data,t)}getInt32Array(){if(this.dataType!==6)throw Error("Invalid data type");let t=M.size(this.dims);return t===0?new Int32Array:new Int32Array(this.module.HEAP8.buffer,this.data,t)}getUint16Array(){if(this.dataType!==10&&this.dataType!==4)throw Error("Invalid data type");let t=M.size(this.dims);return t===0?new Uint16Array:new Uint16Array(this.module.HEAP8.buffer,this.data,t)}reshape(t){if(M.size(t)!==M.size(this.dims))throw Error("Invalid new shape");return new e(this.module,this.dataType,this.data,t)}},$p=class{constructor(e,t,r){this.module=e,this.backend=t,this.customDataOffset=0,this.customDataSize=0,this.adapterInfo=t.adapterInfo;let i=e.PTR_SIZE,n=r/e.PTR_SIZE,a=i===4?"i32":"i64";this.opKernelContext=Number(e.getValue(i*n++,a));let s=Number(e.getValue(i*n++,a));this.outputCount=Number(e.getValue(i*n++,a)),this.customDataOffset=Number(e.getValue(i*n++,"*")),this.customDataSize=Number(e.getValue(i*n++,a));let u=[];for(let l=0;l<s;l++){let p=Number(e.getValue(i*n++,a)),h=Number(e.getValue(i*n++,"*")),c=Number(e.getValue(i*n++,a)),g=[];for(let b=0;b<c;b++)g.push(Number(e.getValue(i*n++,a)));u.push(new Jr(e,p,h,g))}this.inputs=u}get kernelCustomData(){return this.backend.currentKernelCustomData}get customDataBuffer(){return this.module.HEAPU8.subarray(this.customDataOffset,this.customDataOffset+this.customDataSize)}compute(e,t){let r=t?.inputs?.map((s)=>typeof s=="number"?this.inputs[s]:s)??this.inputs,i=t?.outputs??[],n=(s,u,l)=>new Jr(this.module,u,this.output(s,l),l),a=(s,u)=>{let l=Mt(s,u);if(!l)throw Error(`Unsupported data type: ${s}`);let p=l>0?this.backend.gpuDataManager.create(l).id:0;return new Jr(this.module,s,p,u)};return this.backend.run(e,r,i,n,a,this.outputCount)}output(e,t){let r=this.module.stackSave();try{let i=this.module.PTR_SIZE,n=i===4?"i32":"i64",a=this.module.stackAlloc((1+t.length)*i);this.module.setValue(a,t.length,n);for(let s=0;s<t.length;s++)this.module.setValue(a+i*(s+1),t[s],n);return this.module._JsepOutput(this.opKernelContext,e,a)}catch(i){throw Error(`Failed to generate kernel's output[${e}] with dims [${t}]. If you are running with pre-allocated output, please make sure the output type/dims are correct. Error: ${i}`)}finally{this.module.stackRestore(r)}}},Jf=async(e,t,r,i)=>{let n=t.jsepInit;if(!n)throw Error("Failed to initialize JSEP. The WebAssembly module is not built with JSEP support.");if(e==="webgpu"){let a=(sb(),vr(Yf)).WebGpuBackend,s=new a;await s.initialize(r,i),n("webgpu",[s,(u)=>s.alloc(Number(u)),(u)=>s.free(u),(u,l,p,h=!1)=>{if(h)pe("verbose",()=>`[WebGPU] jsepCopyGpuToGpu: src=${Number(u)}, dst=${Number(l)}, size=${Number(p)}`),s.memcpy(Number(u),Number(l));else{pe("verbose",()=>`[WebGPU] jsepCopyCpuToGpu: dataOffset=${Number(u)}, gpuDataId=${Number(l)}, size=${Number(p)}`);let c=t.HEAPU8.subarray(Number(u>>>0),Number(u>>>0)+Number(p));s.upload(Number(l),c)}},async(u,l,p)=>{pe("verbose",()=>`[WebGPU] jsepCopyGpuToCpu: gpuDataId=${u}, dataOffset=${l}, size=${p}`),await s.download(Number(u),()=>t.HEAPU8.subarray(Number(l)>>>0,Number(l+p)>>>0))},(u,l,p)=>s.createKernel(u,Number(l),p,t.UTF8ToString(t._JsepGetNodeName(Number(l)))),(u)=>s.releaseKernel(u),(u,l,p,h)=>{pe("verbose",()=>`[WebGPU] jsepRun: sessionHandle=${p}, kernel=${u}, contextDataOffset=${l}`);let c=new $p(t,s,Number(l));return s.computeKernel(Number(u),c,h)},()=>s.captureBegin(),()=>s.captureEnd(),()=>s.replay()])}else{let a=new sc(r);n("webnn",[a,()=>a.reserveTensorId(),(s)=>a.releaseTensorId(s),async(s,u,l,p,h)=>a.ensureTensor(s,u,l,p,h),(s,u)=>{a.uploadTensor(s,u)},async(s,u)=>a.downloadTensor(s,u),(s,u)=>a.registerMLContext(s,u),!!r.trace])}}}),em=U(()=>{Ve(),py(),cy(),ee(),Ut(),oa(),ec(),xp=(e,t)=>{be()._OrtInit(e,t)!==0&&me("Can't initialize onnxruntime.")},xa=async(e)=>{xp(e.wasm.numThreads,ni(e.logLevel))},Sa=async(e,t)=>{be().asyncInit?.();let r=e.webgpu.adapter;if(t==="webgpu"){if(typeof navigator>"u"||!navigator.gpu)throw Error("WebGPU is not supported in current environment");if(r){if(typeof r.limits!="object"||typeof r.features!="object"||typeof r.requestDevice!="function")throw Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.")}else{let i=e.webgpu.powerPreference;if(i!==void 0&&i!=="low-power"&&i!=="high-performance")throw Error(`Invalid powerPreference setting: "${i}"`);let n=e.webgpu.forceFallbackAdapter;if(n!==void 0&&typeof n!="boolean")throw Error(`Invalid forceFallbackAdapter setting: "${n}"`);if(r=await navigator.gpu.requestAdapter({powerPreference:i,forceFallbackAdapter:n}),!r)throw Error('Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.')}}if(t==="webnn"&&(typeof navigator>"u"||!navigator.ml))throw Error("WebNN is not supported in current environment");{let i=(ob(),vr(Qf)).init;t==="webgpu"&&await i("webgpu",be(),e,r),t==="webnn"&&await i("webnn",be(),e)}},yt=new Map,Sp=(e)=>{let t=be(),r=t.stackSave();try{let i=t.PTR_SIZE,n=t.stackAlloc(2*i);t._OrtGetInputOutputCount(e,n,n+i)!==0&&me("Can't get session input/output count.");let a=i===4?"i32":"i64";return[Number(t.getValue(n,a)),Number(t.getValue(n+i,a))]}finally{t.stackRestore(r)}},Dn=(e,t)=>{let r=be(),i=r.stackSave(),n=0;try{let a=r.PTR_SIZE,s=r.stackAlloc(2*a);r._OrtGetInputOutputMetadata(e,t,s,s+a)!==0&&me("Can't get session input/output metadata.");let u=Number(r.getValue(s,"*"));n=Number(r.getValue(s+a,"*"));let l=r.HEAP32[n/4];if(l===0)return[u,0];let p=r.HEAPU32[n/4+1],h=[];for(let c=0;c<p;c++){let g=Number(r.getValue(n+8+c*a,"*"));h.push(g!==0?r.UTF8ToString(g):Number(r.getValue(n+8+(c+p)*a,"*")))}return[u,l,h]}finally{r.stackRestore(i),n!==0&&r._OrtFree(n)}},li=(e)=>{let t=be(),r=t._malloc(e.byteLength);if(r===0)throw Error(`Can't create a session. failed to allocate a buffer of size ${e.byteLength}.`);return t.HEAPU8.set(e,r),[r,e.byteLength]},ka=async(e,t)=>{let r,i,n=be();Array.isArray(e)?[r,i]=e:e.buffer===n.HEAPU8.buffer?[r,i]=[e.byteOffset,e.byteLength]:[r,i]=li(e);let a=0,s=0,u=0,l=[],p=[],h=[];try{if([s,l]=await Jp(t),t?.externalData&&n.mountExternalData){let T=[];for(let C of t.externalData){let A=typeof C=="string"?C:C.path,O=typeof C=="string"?C:C.data;T.push(da(O).then((v)=>{n.mountExternalData(A,v)}))}await Promise.all(T)}for(let T of t?.executionProviders??[])if((typeof T=="string"?T:T.name)==="webnn"){if(n.shouldTransferToMLTensor=!1,typeof T!="string"){let C=T,A=C?.context,O=C?.gpuDevice,v=C?.deviceType,N=C?.powerPreference;A?n.currentContext=A:O?n.currentContext=await n.webnnCreateMLContext(O):n.currentContext=await n.webnnCreateMLContext({deviceType:v,powerPreference:N})}else n.currentContext=await n.webnnCreateMLContext();break}a=await n._OrtCreateSession(r,i,s),n.webgpuOnCreateSession?.(a),a===0&&me("Can't create a session."),n.jsepOnCreateSession?.(),n.currentContext&&(n.webnnRegisterMLContext(a,n.currentContext),n.currentContext=void 0,n.shouldTransferToMLTensor=!0);let[c,g]=Sp(a),b=!!t?.enableGraphCapture,y=[],w=[],k=[],S=[],_=[];for(let T=0;T<c;T++){let[C,A,O]=Dn(a,T);C===0&&me("Can't get an input name."),p.push(C);let v=n.UTF8ToString(C);y.push(v),k.push(A===0?{name:v,isTensor:!1}:{name:v,isTensor:!0,type:st(A),shape:O})}for(let T=0;T<g;T++){let[C,A,O]=Dn(a,T+c);C===0&&me("Can't get an output name."),h.push(C);let v=n.UTF8ToString(C);w.push(v),S.push(A===0?{name:v,isTensor:!1}:{name:v,isTensor:!0,type:st(A),shape:O});{if(b&&t?.preferredOutputLocation===void 0){_.push("gpu-buffer");continue}let N=typeof t?.preferredOutputLocation=="string"?t.preferredOutputLocation:t?.preferredOutputLocation?.[v]??"cpu",q=n.webnnIsGraphOutput;if(N==="cpu"&&q&&q(a,v)){_.push("ml-tensor-cpu-output");continue}if(N!=="cpu"&&N!=="cpu-pinned"&&N!=="gpu-buffer"&&N!=="ml-tensor")throw Error(`Not supported preferred output location: ${N}.`);if(b&&N!=="gpu-buffer")throw Error(`Not supported preferred output location: ${N}. Only 'gpu-buffer' location is supported when enableGraphCapture is true.`);_.push(N)}}let I=null;return _.some((T)=>T==="gpu-buffer"||T==="ml-tensor"||T==="ml-tensor-cpu-output")&&(u=n._OrtCreateBinding(a),u===0&&me("Can't create IO binding."),I={handle:u,outputPreferredLocations:_,outputPreferredLocationsEncoded:_.map((T)=>T==="ml-tensor-cpu-output"?"ml-tensor":T).map((T)=>qn(T))}),yt.set(a,[a,p,h,I,b,!1]),[a,y,w,k,S]}catch(c){throw p.forEach((g)=>n._OrtFree(g)),h.forEach((g)=>n._OrtFree(g)),u!==0&&n._OrtReleaseBinding(u)!==0&&me("Can't release IO binding."),a!==0&&n._OrtReleaseSession(a)!==0&&me("Can't release session."),c}finally{n._free(r),s!==0&&n._OrtReleaseSessionOptions(s)!==0&&me("Can't release session options."),l.forEach((c)=>n._free(c)),n.unmountExternalData?.()}},Ta=(e)=>{let t=be(),r=yt.get(e);if(!r)throw Error(`cannot release session. invalid session id: ${e}`);let[i,n,a,s,u]=r;s&&(u&&t._OrtClearBoundOutputs(s.handle)!==0&&me("Can't clear bound outputs."),t._OrtReleaseBinding(s.handle)!==0&&me("Can't release IO binding.")),t.jsepOnReleaseSession?.(e),t.webnnOnReleaseSession?.(e),t.webgpuOnReleaseSession?.(e),n.forEach((l)=>t._OrtFree(l)),a.forEach((l)=>t._OrtFree(l)),t._OrtReleaseSession(i)!==0&&me("Can't release session."),yt.delete(e)},Nn=async(e,t,r,i,n,a,s=!1)=>{if(!e){t.push(0);return}let u=be(),l=u.PTR_SIZE,p=e[0],h=e[1],c=e[3],g=c,b,y;if(p==="string"&&(c==="gpu-buffer"||c==="ml-tensor"))throw Error("String tensor is not supported on GPU.");if(s&&c!=="gpu-buffer")throw Error(`External buffer must be provided for input/output index ${a} when enableGraphCapture is true.`);if(c==="gpu-buffer"){let S=e[2].gpuBuffer;y=Mt(Rt(p),h);{let _=u.jsepRegisterBuffer;if(!_)throw Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');b=_(i,a,S,y)}}else if(c==="ml-tensor"){let S=e[2].mlTensor;y=Mt(Rt(p),h);let _=u.webnnRegisterMLTensor;if(!_)throw Error('Tensor location "ml-tensor" is not supported without using WebNN.');b=_(i,S,Rt(p),h)}else{let S=e[2];if(Array.isArray(S)){y=l*S.length,b=u._malloc(y),r.push(b);for(let _=0;_<S.length;_++){if(typeof S[_]!="string")throw TypeError(`tensor data at index ${_} is not a string`);u.setValue(b+_*l,Ze(S[_],r),"*")}}else{let{webnnIsGraphInput:_,webnnIsGraphOutput:I}=u;if(p!=="string"&&_&&I){let T=u.UTF8ToString(n);if(_(i,T)||I(i,T)){let C=Rt(p);y=Mt(C,h),g="ml-tensor";let{webnnCreateTemporaryTensor:A,webnnUploadTensor:O}=u;if(!A||!O)throw Error('Tensor location "ml-tensor" is not supported without using WebNN.');let v=await A(i,C,h);O(v,new Uint8Array(S.buffer,S.byteOffset,S.byteLength)),b=v}else y=S.byteLength,b=u._malloc(y),r.push(b),u.HEAPU8.set(new Uint8Array(S.buffer,S.byteOffset,y),b)}else y=S.byteLength,b=u._malloc(y),r.push(b),u.HEAPU8.set(new Uint8Array(S.buffer,S.byteOffset,y),b)}}let w=u.stackSave(),k=u.stackAlloc(4*h.length);try{h.forEach((_,I)=>u.setValue(k+I*l,_,l===4?"i32":"i64"));let S=u._OrtCreateTensor(Rt(p),b,y,k,h.length,qn(g));S===0&&me(`Can't create tensor for input/output. session=${i}, index=${a}.`),t.push(S)}finally{u.stackRestore(w)}},Ea=async(e,t,r,i,n,a)=>{let s=be(),u=s.PTR_SIZE,l=yt.get(e);if(!l)throw Error(`cannot run inference. invalid session id: ${e}`);let p=l[0],h=l[1],c=l[2],g=l[3],b=l[4],y=l[5],w=t.length,k=i.length,S=0,_=[],I=[],T=[],C=[],A=[],O=s.stackSave(),v=s.stackAlloc(w*u),N=s.stackAlloc(w*u),q=s.stackAlloc(k*u),F=s.stackAlloc(k*u);try{[S,_]=Qp(a),_t("wasm prepareInputOutputTensor");for(let z=0;z<w;z++)await Nn(r[z],I,C,e,h[t[z]],t[z],b);for(let z=0;z<k;z++)await Nn(n[z],T,C,e,c[i[z]],w+i[z],b);wt("wasm prepareInputOutputTensor");for(let z=0;z<w;z++)s.setValue(v+z*u,I[z],"*"),s.setValue(N+z*u,h[t[z]],"*");for(let z=0;z<k;z++)s.setValue(q+z*u,T[z],"*"),s.setValue(F+z*u,c[i[z]],"*");if(g&&!y){let{handle:z,outputPreferredLocations:L,outputPreferredLocationsEncoded:te}=g;if(h.length!==w)throw Error(`input count from feeds (${w}) is expected to be always equal to model's input count (${h.length}).`);_t("wasm bindInputsOutputs");for(let re=0;re<w;re++){let Q=t[re];await s._OrtBindInput(z,h[Q],I[re])!==0&&me(`Can't bind input[${re}] for session=${e}.`)}for(let re=0;re<k;re++){let Q=i[re];n[re]?.[3]?(A.push(T[re]),s._OrtBindOutput(z,c[Q],T[re],0)!==0&&me(`Can't bind pre-allocated output[${re}] for session=${e}.`)):s._OrtBindOutput(z,c[Q],0,te[Q])!==0&&me(`Can't bind output[${re}] to ${L[re]} for session=${e}.`)}wt("wasm bindInputsOutputs"),yt.set(e,[p,h,c,g,b,!0])}s.jsepOnRunStart?.(p),s.webnnOnRunStart?.(p);let W;g?W=await s._OrtRunWithBinding(p,g.handle,k,q,S):W=await s._OrtRun(p,N,v,w,F,k,q,S),W!==0&&me("failed to call OrtRun().");let G=[],ae=[];_t("wasm ProcessOutputTensor");for(let z=0;z<k;z++){let L=Number(s.getValue(q+z*u,"*"));if(L===T[z]||A.includes(T[z])){G.push(n[z]),L!==T[z]&&s._OrtReleaseTensor(L)!==0&&me("Can't release tensor.");continue}let te=s.stackSave(),re=s.stackAlloc(4*u),Q=!1,se,P=0;try{s._OrtGetTensorData(L,re,re+u,re+2*u,re+3*u)!==0&&me(`Can't access output tensor data on index ${z}.`);let J=u===4?"i32":"i64",Y=Number(s.getValue(re,J));P=s.getValue(re+u,"*");let K=s.getValue(re+u*2,"*"),ve=Number(s.getValue(re+u*3,J)),Re=[];for(let ge=0;ge<ve;ge++)Re.push(Number(s.getValue(K+ge*u,J)));s._OrtFree(K)!==0&&me("Can't free memory for tensor dims.");let xe=Re.reduce((ge,Se)=>ge*Se,1);se=st(Y);let Ie=g?.outputPreferredLocations[i[z]];if(se==="string"){if(Ie==="gpu-buffer"||Ie==="ml-tensor")throw Error("String tensor is not supported on GPU.");let ge=[];for(let Se=0;Se<xe;Se++){let Be=s.getValue(P+Se*u,"*"),xt=s.getValue(P+(Se+1)*u,"*"),kr=Se===xe-1?void 0:xt-Be;ge.push(s.UTF8ToString(Be,kr))}G.push([se,Re,ge,"cpu"])}else if(Ie==="gpu-buffer"&&xe>0){let ge=s.jsepGetBuffer;if(!ge)throw Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');let Se=ge(P),Be=Mt(Y,xe);if(Be===void 0||!ua(se))throw Error(`Unsupported data type: ${se}`);Q=!0,G.push([se,Re,{gpuBuffer:Se,download:s.jsepCreateDownloader(Se,Be,se),dispose:()=>{s._OrtReleaseTensor(L)!==0&&me("Can't release tensor.")}},"gpu-buffer"])}else if(Ie==="ml-tensor"&&xe>0){let{webnnEnsureTensor:ge,webnnIsGraphInputOutputTypeSupported:Se}=s;if(!ge||!Se)throw Error('preferredLocation "ml-tensor" is not supported without using WebNN.');if(Mt(Y,xe)===void 0||!la(se))throw Error(`Unsupported data type: ${se}`);if(!Se(e,se,!1))throw Error(`preferredLocation "ml-tensor" for ${se} output is not supported by current WebNN Context.`);let Be=await ge(e,P,Y,Re,!1);Q=!0,G.push([se,Re,{mlTensor:Be,download:s.webnnCreateMLTensorDownloader(P,se),dispose:()=>{s.webnnReleaseTensorId(P),s._OrtReleaseTensor(L)}},"ml-tensor"])}else if(Ie==="ml-tensor-cpu-output"&&xe>0){let ge=s.webnnCreateMLTensorDownloader(P,se)(),Se=G.length;Q=!0,ae.push((async()=>{let Be=[Se,await ge];return s.webnnReleaseTensorId(P),s._OrtReleaseTensor(L),Be})()),G.push([se,Re,[],"cpu"])}else{let ge=di(se),Se=new ge(xe);new Uint8Array(Se.buffer,Se.byteOffset,Se.byteLength).set(s.HEAPU8.subarray(P,P+Se.byteLength)),G.push([se,Re,Se,"cpu"])}}finally{s.stackRestore(te),se==="string"&&P&&s._free(P),Q||s._OrtReleaseTensor(L)}}g&&!b&&(s._OrtClearBoundOutputs(g.handle)!==0&&me("Can't clear bound outputs."),yt.set(e,[p,h,c,g,b,!1]));for(let[z,L]of await Promise.all(ae))G[z][2]=L;return wt("wasm ProcessOutputTensor"),G}finally{s.webnnOnRunEnd?.(p),s.stackRestore(O),I.forEach((W)=>s._OrtReleaseTensor(W)),T.forEach((W)=>s._OrtReleaseTensor(W)),C.forEach((W)=>s._free(W)),S!==0&&s._OrtReleaseRunOptions(S),_.forEach((W)=>s._free(W))}},Ia=(e)=>{let t=be(),r=yt.get(e);if(!r)throw Error("invalid session id");let i=r[0],n=t._OrtEndProfiling(i);n===0&&me("Can't get an profile file name."),t._OrtFree(n)},Ca=(e)=>{let t=[];for(let r of e){let i=r[2];!Array.isArray(i)&&"buffer"in i&&t.push(i.buffer)}return t}}),um=U(()=>{Ve(),em(),Ut(),aa(),bt=()=>!!we.wasm.proxy&&typeof document<"u",Ft=!1,mr=!1,gr=!1,ti=new Map,At=(e,t)=>{let r=ti.get(e);r?r.push(t):ti.set(e,[t])},zt=()=>{if(Ft||!mr||gr||!Le)throw Error("worker not ready")},kp=(e)=>{switch(e.data.type){case"init-wasm":Ft=!1,e.data.err?(gr=!0,Pn[1](e.data.err)):(mr=!0,Pn[0]()),ei&&(URL.revokeObjectURL(ei),ei=void 0);break;case"init-ep":case"copy-from":case"create":case"release":case"run":case"end-profiling":{let t=ti.get(e.data.type);e.data.err?t.shift()[1](e.data.err):t.shift()[0](e.data.out);break}default:}},tm=async()=>{if(!mr){if(Ft)throw Error("multiple calls to 'initWasm()' detected.");if(gr)throw Error("previous call to 'initWasm()' failed.");if(Ft=!0,bt())return new Promise((e,t)=>{Le?.terminate(),Yp().then(([r,i])=>{try{Le=i,Le.onerror=(a)=>t(a),Le.onmessage=kp,Pn=[e,t];let n={type:"init-wasm",in:we};!n.in.wasm.wasmPaths&&(r||Ln)&&(n.in.wasm.wasmPaths={wasm:new URL("ort-wasm-simd-threaded.jsep.wasm",import.meta.url).href}),Le.postMessage(n),ei=r}catch(n){t(n)}},t)});try{await sa(we.wasm),await xa(we),mr=!0}catch(e){throw gr=!0,e}finally{Ft=!1}}},rm=async(e)=>{if(bt())return zt(),new Promise((t,r)=>{At("init-ep",[t,r]);let i={type:"init-ep",in:{epName:e,env:we}};Le.postMessage(i)});await Sa(we,e)},im=async(e)=>bt()?(zt(),new Promise((t,r)=>{At("copy-from",[t,r]);let i={type:"copy-from",in:{buffer:e}};Le.postMessage(i,[e.buffer])})):li(e),nm=async(e,t)=>{if(bt()){if(t?.preferredOutputLocation)throw Error('session option "preferredOutputLocation" is not supported for proxy.');return zt(),new Promise((r,i)=>{At("create",[r,i]);let n={type:"create",in:{model:e,options:{...t}}},a=[];e instanceof Uint8Array&&a.push(e.buffer),Le.postMessage(n,a)})}else return ka(e,t)},am=async(e)=>{if(bt())return zt(),new Promise((t,r)=>{At("release",[t,r]);let i={type:"release",in:e};Le.postMessage(i)});Ta(e)},sm=async(e,t,r,i,n,a)=>{if(bt()){if(r.some((s)=>s[3]!=="cpu"))throw Error("input tensor on GPU is not supported for proxy.");if(n.some((s)=>s))throw Error("pre-allocated output tensor is not supported for proxy.");return zt(),new Promise((s,u)=>{At("run",[s,u]);let l=r,p={type:"run",in:{sessionId:e,inputIndices:t,inputs:l,outputIndices:i,options:a}};Le.postMessage(p,Ca(l))})}else return Ea(e,t,r,i,n,a)},om=async(e)=>{if(bt())return zt(),new Promise((t,r)=>{At("end-profiling",[t,r]);let i={type:"end-profiling",in:e};Le.postMessage(i)});Ia(e)}}),ub=U(()=>{Ve(),um(),ee(),na(),ec(),Un=(e,t)=>{switch(e.location){case"cpu":return[e.type,e.dims,e.data,"cpu"];case"gpu-buffer":return[e.type,e.dims,{gpuBuffer:e.gpuBuffer},"gpu-buffer"];case"ml-tensor":return[e.type,e.dims,{mlTensor:e.mlTensor},"ml-tensor"];default:throw Error(`invalid data location: ${e.location} for ${t()}`)}},Tp=(e)=>{switch(e[3]){case"cpu":return new Ye(e[0],e[2],e[1]);case"gpu-buffer":{let t=e[0];if(!ua(t))throw Error(`not supported data type: ${t} for deserializing GPU tensor`);let{gpuBuffer:r,download:i,dispose:n}=e[2];return Ye.fromGpuBuffer(r,{dataType:t,dims:e[1],download:i,dispose:n})}case"ml-tensor":{let t=e[0];if(!la(t))throw Error(`not supported data type: ${t} for deserializing MLTensor tensor`);let{mlTensor:r,download:i,dispose:n}=e[2];return Ye.fromMLTensor(r,{dataType:t,dims:e[1],download:i,dispose:n})}default:throw Error(`invalid data location: ${e[3]}`)}},lm=class{async fetchModelAndCopyToWasmMemory(e){return im(await da(e))}async loadModel(e,t){Xe();let r;typeof e=="string"?r=await this.fetchModelAndCopyToWasmMemory(e):r=e,[this.sessionId,this.inputNames,this.outputNames,this.inputMetadata,this.outputMetadata]=await nm(r,t),qe()}async dispose(){return am(this.sessionId)}async run(e,t,r){Xe();let i=[],n=[];Object.entries(e).forEach((c)=>{let g=c[0],b=c[1],y=this.inputNames.indexOf(g);if(y===-1)throw Error(`invalid input '${g}'`);i.push(b),n.push(y)});let a=[],s=[];Object.entries(t).forEach((c)=>{let g=c[0],b=c[1],y=this.outputNames.indexOf(g);if(y===-1)throw Error(`invalid output '${g}'`);a.push(b),s.push(y)});let u=i.map((c,g)=>Un(c,()=>`input "${this.inputNames[n[g]]}"`)),l=a.map((c,g)=>c?Un(c,()=>`output "${this.outputNames[s[g]]}"`):null),p=await sm(this.sessionId,n,u,s,l,r),h={};for(let c=0;c<p.length;c++)h[this.outputNames[s[c]]]=a[c]??Tp(p[c]);return qe(),h}startProfiling(){}endProfiling(){om(this.sessionId)}}}),dm={};Yt(dm,{OnnxruntimeWebAssemblyBackend:()=>ea,initializeFlags:()=>Jn,wasmBackend:()=>pm});lb=U(()=>{Ve(),um(),ub(),Jn=()=>{(typeof we.wasm.initTimeout!="number"||we.wasm.initTimeout<0)&&(we.wasm.initTimeout=0);let e=we.wasm.simd;if(typeof e!="boolean"&&e!==void 0&&e!=="fixed"&&e!=="relaxed"&&(console.warn(`Property "env.wasm.simd" is set to unknown value "${e}". Reset it to \`false\` and ignore SIMD feature checking.`),we.wasm.simd=!1),typeof we.wasm.proxy!="boolean"&&(we.wasm.proxy=!1),typeof we.wasm.trace!="boolean"&&(we.wasm.trace=!1),typeof we.wasm.numThreads!="number"||!Number.isInteger(we.wasm.numThreads)||we.wasm.numThreads<=0)if(typeof self<"u"&&!self.crossOriginIsolated)we.wasm.numThreads=1;else{let t=typeof navigator>"u"?K0("node:os").cpus().length:navigator.hardwareConcurrency;we.wasm.numThreads=Math.min(4,Math.ceil((t||1)/2))}},ea=class{async init(e){Jn(),await tm(),await rm(e)}async createInferenceSessionHandler(e,t){let r=new lm;return await r.loadModel(e,t),r}},pm=new ea});Ve();Ve();Ve();pb=Gp;{let e=(lb(),vr(dm)).wasmBackend;Bt("webgpu",e,5),Bt("webnn",e,5),Bt("cpu",e,10),Bt("wasm",e,10)}Object.defineProperty(we.versions,"web",{value:db,enumerable:!0})});var za;var mm=tr(()=>{(function(e){e[e.Flush=0]="Flush",e[e.Add=1]="Add"})(za||(za={}))});var ym={};Mi(ym,{TextToSpeechWeb:()=>gm});var gm;var bm=tr(()=>{ir();gm=class gm extends Ht{constructor(){super();if(this.speechSynthesis=null,"speechSynthesis"in window)this.speechSynthesis=window.speechSynthesis,window.addEventListener("beforeunload",()=>{this.stop()})}async speak(e){if(!this.speechSynthesis)this.throwUnsupportedError();await this.stop();let t=this.speechSynthesis,r=this.createSpeechSynthesisUtterance(e);return new Promise((i,n)=>{r.onend=()=>{i()},r.onerror=(a)=>{n(a)},t.speak(r)})}async stop(){if(!this.speechSynthesis)this.throwUnsupportedError();this.speechSynthesis.cancel()}async getSupportedLanguages(){return{languages:this.getSpeechSynthesisVoices().map((i)=>i.lang).filter((i,n,a)=>a.indexOf(i)==n)}}async getSupportedVoices(){return{voices:this.getSpeechSynthesisVoices()}}async isLanguageSupported(e){return{supported:(await this.getSupportedLanguages()).languages.includes(e.lang)}}async openInstall(){this.throwUnimplementedError()}createSpeechSynthesisUtterance(e){let t=this.getSpeechSynthesisVoices(),r=new SpeechSynthesisUtterance,{text:i,lang:n,rate:a,pitch:s,volume:u,voice:l}=e;if(l!==void 0)r.voice=t[l];if(u!==void 0)r.volume=u>=0&&u<=1?u:1;if(a!==void 0)r.rate=a>=0.1&&a<=10?a:1;if(s!==void 0)r.pitch=s>=0&&s<=2?s:2;if(n)r.lang=n;return r.text=i,r}getSpeechSynthesisVoices(){if(!this.speechSynthesis)this.throwUnsupportedError();if(!this.supportedVoices||this.supportedVoices.length<1)this.supportedVoices=this.speechSynthesis.getVoices();return this.supportedVoices}throwUnsupportedError(){throw this.unavailable("SpeechSynthesis API not available in this browser.")}throwUnimplementedError(){throw this.unimplemented("Not implemented on web.")}}});var Oa={};Mi(Oa,{QueueStrategy:()=>za,TextToSpeech:()=>yb});var yb;var Ra=tr(()=>{ir();mm();yb=rr("TextToSpeech",{web:()=>Promise.resolve().then(() => (bm(),ym)).then((e)=>new e.TextToSpeechWeb)});if("speechSynthesis"in window)window.speechSynthesis});ir();class Lr{minSpeechMs;silenceMs;rmsThreshold;hardCapMs;speechStartedAt=null;lastSpeechAt=null;current="idle";constructor(e={}){this.minSpeechMs=e.minSpeechMs??800,this.silenceMs=e.silenceMs??1500,this.rmsThreshold=e.rmsThreshold??0.02,this.hardCapMs=e.hardCapMs??5000}push(e,t){if(e>=this.rmsThreshold){if(this.speechStartedAt===null)this.speechStartedAt=t;if(this.lastSpeechAt=t,t-this.speechStartedAt>=this.hardCapMs)return this.current="silence","silence";if(this.current!=="speech"&&t-this.speechStartedAt>=this.minSpeechMs)this.current="speech"}else if(this.speechStartedAt!==null){if(t-this.speechStartedAt>=this.hardCapMs)return this.current="silence","silence";if(this.lastSpeechAt!==null&&t-this.lastSpeechAt>=this.silenceMs)return this.current="silence","silence"}return this.current}reset(){this.speechStartedAt=null,this.lastSpeechAt=null,this.current="idle"}}function L0(e){let t=e.includes(",")?e.split(",")[1]:e,r=atob(t),i=new Uint8Array(r.length);for(let n=0;n<r.length;n++)i[n]=r.charCodeAt(n);return i}class qr{ctx;nextStartTime=0;sources=[];gain;endedHandlers=[];playing=!1;constructor(e){if(this.ctx=e??new AudioContext,this.gain=this.ctx.createGain(),this.gain.connect(this.ctx.destination),this.ctx.state==="suspended")this.ctx.resume()}async scheduleChunk(e,t=24000,r=1){if(!e||!e.trim())return;let i=L0(e);if(i.length===0)return;let n,a=i.length>=4&&i[0]===82&&i[1]===73&&i[2]===70&&i[3]===70,s=i.length>=3&&i[0]===73&&i[1]===68&&i[2]===51,u=i.length>=4&&i[0]===79&&i[1]===103&&i[2]===103&&i[3]===83;if(a||s||u)try{n=await this.ctx.decodeAudioData(i.buffer.slice(i.byteOffset,i.byteOffset+i.byteLength))}catch(h){console.warn("[AudioChunkPlayer] Container decode failed, falling back to PCM:",h),n=this.decodeRawPcm(i,t,r)}else n=this.decodeRawPcm(i,t,r);if(!n||n.length===0)return;if(this.ctx.state==="suspended")try{await this.ctx.resume()}catch{}let l=Math.max(this.nextStartTime,this.ctx.currentTime+0.02),p=this.ctx.createBufferSource();p.buffer=n,p.connect(this.gain),p.start(l),p.onended=()=>{if(this.sources=this.sources.filter((h)=>h!==p),this.sources.length===0)this.playing=!1,this.endedHandlers.forEach((h)=>h())},this.sources.push(p),this.nextStartTime=l+n.duration,this.playing=!0}decodeRawPcm(e,t,r){let i=Math.floor(e.byteLength/(2*r)),n=this.ctx.createBuffer(r,i,t),a=new DataView(e.buffer,e.byteOffset,e.byteLength);for(let s=0;s<r;s++){let u=n.getChannelData(s);for(let l=0;l<i;l++){let p=(l*r+s)*2;if(p+1<e.byteLength){let h=a.getInt16(p,!0);u[l]=h<0?h/32768:h/32767}}}return n}duck(e=0.15,t=35){if(!this.playing)return;let r=this.ctx.currentTime;this.gain.gain.cancelScheduledValues(r),this.gain.gain.setValueAtTime(Math.max(0.01,this.gain.gain.value),r),this.gain.gain.exponentialRampToValueAtTime(Math.max(0.01,e),r+t/1000)}unduck(e=60){if(!this.playing)return;let t=this.ctx.currentTime;this.gain.gain.cancelScheduledValues(t),this.gain.gain.setValueAtTime(Math.max(0.01,this.gain.gain.value),t),this.gain.gain.exponentialRampToValueAtTime(1,t+e/1000)}stop(){let e=this.ctx.currentTime;this.gain.gain.cancelScheduledValues(e),this.gain.gain.setValueAtTime(Math.max(0.001,this.gain.gain.value),e),this.gain.gain.linearRampToValueAtTime(0.0001,e+0.035),setTimeout(()=>{this.sources.forEach((t)=>{try{t.stop()}catch{}}),this.sources=[],this.playing=!1,this.nextStartTime=0,this.gain.gain.setValueAtTime(1,this.ctx.currentTime)},40)}isPlaying(){return this.playing}onEnd(e){return this.endedHandlers.push(e),()=>{this.endedHandlers=this.endedHandlers.filter((t)=>t!==e)}}}function Bo(){return`
class PCM16kProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.ratio = sampleRate / 16000;
    this.buffer = new Float32Array(1600); // 100 ms @ 16k mono
    this.bufferPos = 0;
    this.phase = 0;
    this.sumSq = 0;
    this.sampleCount = 0;
    this.lastRmsAt = 0;
  }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (!ch || ch.length === 0) return true;
    for (let i = 0; i < ch.length; i++) {
      this.sumSq += ch[i] * ch[i];
      this.sampleCount++;
      this.phase += 1;
      if (this.phase >= this.ratio) {
        this.phase -= this.ratio;
        if (this.bufferPos < this.buffer.length) {
          this.buffer[this.bufferPos++] = ch[i];
        }
      }
    }
    if (this.bufferPos >= this.buffer.length) {
      const int16 = new Int16Array(this.buffer.length);
      for (let j = 0; j < this.buffer.length; j++) {
        const s = Math.max(-1, Math.min(1, this.buffer[j]));
        int16[j] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      this.port.postMessage({ kind: 'frame', pcm: int16.buffer }, [int16.buffer]);
      this.bufferPos = 0;
    }
    // RMS at ~10 Hz (accumulated continuously over the window)
    const now = currentFrame / sampleRate;
    if (now - this.lastRmsAt >= 0.1 && this.sampleCount > 0) {
      this.lastRmsAt = now;
      const rms = Math.sqrt(this.sumSq / this.sampleCount);
      this.port.postMessage({ kind: 'rms', value: rms });
      this.sumSq = 0;
      this.sampleCount = 0;
    }
    return true;
  }
}
registerProcessor('pcm-16k', PCM16kProcessor);
`}var Di=new WeakSet;async function q0(e){if(Di.has(e))return;let t=new Blob([Bo()],{type:"application/javascript"}),r=URL.createObjectURL(t);try{await e.audioWorklet.addModule(r),Di.add(e)}catch(i){if(i?.name==="NotSupportedError"||i?.message&&i.message.includes("already registered"))Di.add(e);else throw i}finally{URL.revokeObjectURL(r)}}async function Ni(e){await q0(e.ctx);let t=new AudioWorkletNode(e.ctx,"pcm-16k",{numberOfInputs:1,numberOfOutputs:0,channelCount:1});return e.sourceNode.connect(t),t.port.onmessage=(r)=>{let{kind:i,...n}=r.data;if(i==="frame"&&n.pcm)e.onFrame(new Int16Array(n.pcm));else if(i==="rms"&&typeof n.value==="number")e.onRms?.(n.value)},{stop(){try{t.disconnect()}catch{}try{e.sourceNode.disconnect(t)}catch{}}}}function Do(e){let t=new Uint8Array(e.buffer,e.byteOffset,e.byteLength),r="";for(let i=0;i<t.length;i++)r+=String.fromCharCode(t[i]);return btoa(r)}function V0(){if(typeof window>"u")return"ws://localhost:3000/v1/asr/stream";return`${window.location.protocol==="https:"?"wss:":"ws:"}//${window.location.host}/v1/asr/stream`}class nr{url;language;sampleRate;stopTimeoutMs;ws=null;seq=0;listeners={ready:new Set,partial:new Set,final:new Set,error:new Set,closed:new Set};pendingStop=null;constructor(e={}){this.url=e.url??V0(),this.language=e.language??"fr-CA",this.sampleRate=e.sampleRate??16000,this.stopTimeoutMs=e.stopTimeoutMs??5000}on(e,t){if(!this.listeners[e])this.listeners[e]=new Set;return this.listeners[e].add(t),()=>{this.listeners[e]?.delete(t)}}emit(e,...t){this.listeners[e]?.forEach((r)=>r(...t))}pendingPcm=[];start(){this.seq=0,this.pendingPcm=[],this.ws=new WebSocket(this.url),this.ws.onopen=()=>{let e={type:"start",language:this.language,sample_rate:this.sampleRate};if(this.ws.send(JSON.stringify(e)),this.pendingPcm.length>0){for(let t of this.pendingPcm){let r={type:"pcm",seq:this.seq++,data:Do(t)};this.ws.send(JSON.stringify(r))}this.pendingPcm=[]}},this.ws.onmessage=(e)=>{let t;try{t=JSON.parse(e.data)}catch{return}switch(t.type){case"ready":this.emit("ready",{model:t.model,fallback:t.fallback});break;case"partial":this.emit("partial",{seq:t.seq,text:t.text,latency_ms:t.latency_ms,model:t.model});break;case"final":if(this.emit("final",{seq:t.seq,text:t.text,model:t.model}),this.pendingStop)this.pendingStop.resolve(t.text),this.pendingStop=null;break;case"error":this.emit("error",{message:t.message});break}},this.ws.onclose=(e)=>{if(this.emit("closed",{code:e.code,reason:e.reason??""}),this.pendingStop)this.pendingStop.resolve(""),this.pendingStop=null},this.ws.onerror=()=>this.emit("error",{message:"ws error"})}sendPcm(e){if(!this.ws||this.ws.readyState===0){this.pendingPcm.push(e);return}if(this.ws.readyState!==1)return;let t={type:"pcm",seq:this.seq++,data:Do(e)};this.ws.send(JSON.stringify(t))}stop(){if(!this.ws)return Promise.resolve("");return new Promise((e)=>{let t={resolve:e};this.pendingStop=t,this.ws.send(JSON.stringify({type:"stop"})),setTimeout(()=>{if(this.pendingStop===t)this.pendingStop.resolve(""),this.pendingStop=null},this.stopTimeoutMs)})}close(){this.ws?.close(),this.ws=null}}function No(e){if(typeof document>"u")return"";let t=document.cookie?document.cookie.split("; "):[];for(let r of t){let i=r.indexOf("=");if(i>0&&r.slice(0,i)===e)return decodeURIComponent(r.slice(i+1))}return""}function Po(e,t){if(typeof document>"u")return;let r=typeof location<"u"&&location.protocol==="https:",n=(typeof location<"u"?location.hostname:"").endsWith("guig.dev")?"; domain=.guig.dev":"";document.cookie=`${e}=${encodeURIComponent(t)}; path=/; max-age=31536000; SameSite=Lax`+n+(r?"; Secure":"")}function Uo(e){try{return localStorage.getItem(e)||""}catch{return""}}function W0(e){Po("guig_session_id",e.session_id),Po("guig_session_token",e.session_token);try{localStorage.setItem("guig_session_id",e.session_id),localStorage.setItem("guig_session_token",e.session_token)}catch{}}function G0(){let e=No("guig_session_id")||Uo("guig_session_id"),t=No("guig_session_token")||Uo("guig_session_token");return e&&t?{session_id:e,session_token:t}:null}var ar=null;function Lo(){let e=G0();if(e)return Promise.resolve(e);if(ar)return ar;return ar=fetch("https://api.guig.dev/v1/memory/session",{method:"POST"}).then((t)=>t.ok?t.json():null).then((t)=>{if(!t?.session_id||!t?.session_token)return null;let r={session_id:t.session_id,session_token:t.session_token};return W0(r),r}).catch(()=>null).finally(()=>{ar=null}),ar}var cb=["Pleased","Relaxed","Neutral","Sad","Tension"],hb={Pleased:"Ton : chaleureux. Joie. Conversationnel.",Relaxed:"Ton : posé. Calme. Détendu.",Neutral:"Ton : neutre. Informatif. Neutre.",Sad:"Ton : doux. Tristesse. Empreint.",Tension:"Ton : serré. Tension. Inquiet."};class fm{session=null;ort=null;activeBackend=null;loadMs=null;async preload(){if(this.session)return;if(!this.ort)this.ort=await Promise.resolve().then(() => (hm(),cm)),this.ort.env.wasm.wasmPaths="/onnxruntime-web/",this.ort.env.wasm.simd=!0,this.ort.env.wasm.numThreads=Math.min(4,navigator.hardwareConcurrency??2);let e=performance.now(),t=[];if("gpu"in navigator)t.push("webgpu","wasm");else t.push("wasm");try{this.session=await this.ort.InferenceSession.create("/models/ser/model_fp16.onnx",{executionProviders:t,graphOptimizationLevel:"all"}),this.activeBackend=t.includes("webgpu")&&this.session?.executionProviders?.[0]==="webgpu"?"webgpu":"wasm"}catch{this.session=await this.ort.InferenceSession.create("/models/ser/model_fp16.onnx",{executionProviders:["wasm"],graphOptimizationLevel:"all"}),this.activeBackend="wasm"}this.loadMs=performance.now()-e,console.info(`[ser-browser] loaded in ${this.loadMs.toFixed(0)} ms via ${this.activeBackend}`)}async classify(e){if(await this.preload(),!this.session||e.length<800)return null;let t=e.length>480000?e.subarray(e.length-480000):e,r=performance.now(),i=fb(t),n=await this.session.run({input_values:new this.ort.Tensor("float32",i,[1,i.length])}),{label:a,score:s}=mb(n.logits.data);return{label:a,hint:hb[a],score:s,backend:this.activeBackend,latency_ms:performance.now()-r}}stats(){return{loaded:this.session!==null,backend:this.activeBackend,load_ms:this.loadMs}}}function fb(e){let t=0;for(let a=0;a<e.length;a++)t+=e[a];t/=e.length;let r=0;for(let a=0;a<e.length;a++){let s=e[a]-t;r+=s*s}let i=1/(Math.sqrt(r/e.length)+0.0000001),n=new Float32Array(e.length);for(let a=0;a<e.length;a++)n[a]=(e[a]-t)*i;return n}function mb(e){let t=-1/0,r=0;for(let a=0;a<e.length;a++)if(e[a]>t)t=e[a],r=a;let i=0,n=new Float32Array(e.length);for(let a=0;a<e.length;a++)n[a]=Math.exp(e[a]-t),i+=n[a];return{label:cb[r],score:n[r]/i}}var Aa=new fm;function gb(){if(typeof window>"u")return"ws://localhost:3000/v1/voice/stream";if(window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1")return`${window.location.protocol==="https:"?"wss:":"ws:"}//${window.location.host}/v1/voice/stream`;return"wss://api.guig.dev/v1/voice/stream"}class Sr{url;ws=null;listeners={ready:new Set,token:new Set,audio:new Set,done:new Set,interrupted:new Set,error:new Set};constructor(e={}){this.url=e.url??gb()}on(e,t){if(!this.listeners[e])this.listeners[e]=new Set;return this.listeners[e].add(t),()=>{this.listeners[e]?.delete(t)}}emit(e,...t){this.listeners[e]?.forEach((r)=>r(...t))}chat(e,t={}){if(!this.ws||this.ws.readyState!==1)this.ws=new WebSocket(this.url),this.ws.onopen=()=>this._sendChat(e,t);else this._sendChat(e,t);if(!this.ws.onmessage)this._wireSocket()}async _buildMsg(e,t){let r=await Lo(),i;if(t.audio)try{let n=Uint8Array.from(atob(t.audio),(p)=>p.charCodeAt(0)),a=new DataView(n.buffer,n.byteOffset,n.byteLength),s=n.byteLength>>1,u=new Float32Array(s);for(let p=0;p<s;p++)u[p]=a.getInt16(p<<1,!0)/32768;i=(await Aa.classify(u))?.hint}catch{}return{type:"chat",text:e,voice:t.voice,system:t.system,audio:t.audio,emotion_hint:i,session_id:r?.session_id,session_token:r?.session_token}}_sendChat(e,t){this._buildMsg(e,t).then((r)=>this.ws.send(JSON.stringify(r)))}_wireSocket(){this.ws.onmessage=(e)=>{let t;try{t=JSON.parse(e.data)}catch{return}switch(t.type){case"ready":this.emit("ready");break;case"token":this.emit("token",{content:t.content});break;case"audio":this.emit("audio",{data:t.data,format:t.format||"wav"});break;case"done":this.emit("done",{content:t.content,ttfa_ms:t.ttfa_ms});break;case"interrupted":this.emit("interrupted");break;case"error":this.emit("error",{message:t.message});break}},this.ws.onerror=()=>this.emit("error",{message:"ws error"}),this.ws.onclose=()=>{this.ws=null}}interrupt(){if(this.ws&&this.ws.readyState===1)this.ws.send(JSON.stringify({type:"interrupt",timestamp:Date.now()}))}abort(){if(!this.ws)return;try{this.ws.close()}catch{}this.ws=null}close(){this.abort()}}ir();class qt{static isSpeaking=!1;static async speak(e,t={}){if(!e||!e.trim())return;let r=e.trim(),i=t.lang||"fr-CA";if(this.isSpeaking=!0,t.onStart?.(),ft.isNativePlatform())try{let{TextToSpeech:n}=await Promise.resolve().then(() => (Ra(),Oa));await n.speak({text:r,lang:i,rate:t.rate||1,pitch:t.pitch||1,volume:1,category:"ambient"}),this.isSpeaking=!1,t.onEnd?.();return}catch(n){console.warn("[FallbackTts] Capacitor TTS error, falling back to Web Speech:",n)}if(typeof window<"u"&&"speechSynthesis"in window)try{await this.speakWithWebSpeech(r,t),this.isSpeaking=!1,t.onEnd?.();return}catch(n){console.warn("[FallbackTts] WebSpeech error:",n),t.onError?.(n)}this.isSpeaking=!1,t.onEnd?.()}static speakWithWebSpeech(e,t){return new Promise((r,i)=>{try{window.speechSynthesis.cancel();let n=new SpeechSynthesisUtterance(e);n.lang=t.lang||"fr-CA",n.rate=t.rate||1.05,n.pitch=t.pitch||1;let s=window.speechSynthesis.getVoices().find((u)=>u.name.includes("Google")&&u.lang.startsWith("fr")||u.lang==="fr-CA"||u.lang==="fr-FR"||u.lang.startsWith("fr"));if(s)n.voice=s;n.onend=()=>{r()},n.onerror=(u)=>{console.warn("[FallbackTts] Utterance error:",u),r()},window.speechSynthesis.speak(n)}catch(n){i(n)}})}static stop(){if(this.isSpeaking=!1,typeof window<"u"&&"speechSynthesis"in window)try{window.speechSynthesis.cancel()}catch{}if(ft.isNativePlatform())Promise.resolve().then(() => (Ra(),Oa)).then(({TextToSpeech:e})=>{e.stop().catch(()=>{})}).catch(()=>{})}static isCurrentlySpeaking(){return this.isSpeaking||typeof window<"u"&&window.speechSynthesis?.speaking===!0}}var bb=ft.getPlatform()==="web",_m=`Tu es UltraBlabla, une IA vocale ultra-réactive, chaleureuse et naturelle.
Réponds de manière concise, directe et vivante (1 phrase courte à l'oral, ≤ 15 mots).
Commence TOUJOURS ta réponse par un mot d'amorce court suivi d'une virgule (ex: "Oui,", "D'accord,", "En fait,", "Absolument,", "Bien sûr,", "Regarde,").
Jamais de syntaxe Markdown (*, #, tirets), ni d'emojis, ni de robotismes.`;class Ma{state="idle";audioCtx=null;wsAsr;wsVoice;player;vad;capture;vadInterval;lastRms=0;asrReady=!1;audioEndUnsub;isAutoConversation=!0;autoRestartTimer=null;isDucked=!1;bargeInSpeechStart=null;pcmFrames=[];pcmByteCount=0;static PCM_MAX_BYTES=524288;recordBtn;messages;status;clearBtn;holoSubtitles;holoSubtitlesTimeout=null;chatToggleBtn=null;chatboxContent=null;neuralInput=null;neuralSendBtn=null;chatStatus=null;constructor(){if(typeof window<"u")document.addEventListener("DOMContentLoaded",()=>this.init())}init(){if(this.bindElements(),this.setupListeners(),this.setupChatbox(),this.updateUI("idle"),bb)this.initNextGenWeb(),this.initWebAudioApi(),this.initWebGPU()}turnstileToken=null;async initNextGenWeb(){if("serviceWorker"in navigator)try{await navigator.serviceWorker.register("/sw.js"),console.log("[Web Next-Gen] Service Worker actif.")}catch(e){console.error("[Web Next-Gen] Erreur SW:",e)}if(typeof window.turnstile<"u")window.turnstile.render("#turnstile-container",{sitekey:"0x4AAAAAAEP_Ht6yB0F4_r-k",callback:(e)=>{this.turnstileToken=e},"refresh-expired":"auto"})}initWebAudioApi(){try{let e=window.AudioContext||window.webkitAudioContext;this.audioCtx=new e,console.log("[Web Next-Gen] Web Audio API prête.")}catch(e){console.warn("[Web Next-Gen] Web Audio API non disponible:",e)}}async initWebGPU(){if("gpu"in navigator)try{await(await navigator.gpu.requestAdapter()).requestDevice(),console.log("[Web Next-Gen] WebGPU initialisé avec succès ! Prêt pour le Neural Canvas 2028.")}catch(e){console.warn("[Web Next-Gen] Echec WebGPU, fallback WebGL:",e)}}bindElements(){this.recordBtn=document.getElementById("recordBtn"),this.messages=document.getElementById("messages"),this.status=document.querySelector("#status .status-text"),this.clearBtn=document.getElementById("clearBtn"),this.holoSubtitles=document.getElementById("holo-subtitles")}setupListeners(){this.recordBtn?.addEventListener("click",()=>this.toggleLiveSession()),this.clearBtn?.addEventListener("click",()=>{if(this.clearMessages(),this.addMessage("SYSTEM","Historique nettoyé. Prêt à discuter.","system"),this.playChime(400,0.08),this.state!=="idle")this.stopListening()}),document.addEventListener("keydown",(e)=>{if(e.code==="Space"&&(e.target===document.body||e.target===this.recordBtn))e.preventDefault(),this.toggleLiveSession()})}setupChatbox(){if(this.chatToggleBtn=document.getElementById("chatToggleBtn"),this.chatboxContent=document.getElementById("chatboxContent"),this.neuralInput=document.getElementById("neuralInput"),this.neuralSendBtn=document.getElementById("neuralSendBtn"),this.chatStatus=document.getElementById("chatStatus"),this.chatStatus)this.chatStatus.textContent="ONLINE • CLOUD AI",this.chatStatus.style.color="#10b981";this.chatToggleBtn?.addEventListener("click",()=>{if(this.chatboxContent)if(this.chatboxContent.style.display==="none"||!this.chatboxContent.classList.contains("active"))this.chatboxContent.style.display="block",this.chatboxContent.classList.add("active");else this.chatboxContent.style.display="none",this.chatboxContent.classList.remove("active")}),this.neuralInput?.addEventListener("input",()=>{let e=!!this.neuralInput?.value.trim();if(this.neuralSendBtn)this.neuralSendBtn.disabled=!e}),this.neuralInput?.addEventListener("keydown",(e)=>{if(e.key==="Enter"&&!e.shiftKey)e.preventDefault(),this.sendTextMessage()}),this.neuralSendBtn?.addEventListener("click",()=>{this.sendTextMessage()})}scheduleAutoRestart(e=260){if(this.autoRestartTimer)clearTimeout(this.autoRestartTimer),this.autoRestartTimer=null;if(!this.isAutoConversation)return;this.autoRestartTimer=setTimeout(()=>{if(this.state==="idle"&&this.isAutoConversation)this.startListening()},e)}async getOrCreateAudioContext(){if(!this.audioCtx||this.audioCtx.state==="closed"){let e=window.AudioContext||window.webkitAudioContext;this.audioCtx=new e}if(this.audioCtx.state==="suspended")try{await this.audioCtx.resume()}catch{}if(!this.player)this.player=new qr(this.audioCtx),this.audioEndUnsub?.(),this.audioEndUnsub=this.player.onEnd(()=>{this.updateUI("idle"),this.scheduleAutoRestart(260)});return this.audioCtx}async sendTextMessage(){let e=this.neuralInput?.value.trim();if(!e)return;if(this.neuralInput)this.neuralInput.value="";if(this.neuralSendBtn)this.neuralSendBtn.disabled=!0;if(this.addMessage("VOUS",e,"user"),this.updateUI("thinking"),await this.getOrCreateAudioContext(),!this.wsVoice)this.wsVoice=new Sr,this.setupVoiceClientListeners();this.wsVoice.chat(e,{voice:this.currentVoice(),system:_m})}setupVoiceClientListeners(){if(!this.wsVoice)return;let e=!1,t="";this.wsVoice.on("ready",()=>{t="",e=!1}),this.wsVoice.on("token",(r)=>{t+=r.content,this.streamHoloSubtitle(t,3000)}),this.wsVoice.on("audio",(r)=>{e=!0,this.updateUI("speaking"),this.player?.scheduleChunk(r.data).catch(console.error)}),this.wsVoice.on("interrupted",()=>{console.log("[Full-Duplex Barge-in] Interruption confirmed by server."),this.stopSpeaking(),this.updateUI("listening")}),this.wsVoice.on("done",(r)=>{console.info("voice_ttfa:",r.ttfa_ms);let i=r.content||t;if(i.trim())this.addMessage("GUILLAUME",i,"ai");if(!e)if(i.trim())this.updateUI("speaking"),qt.speak(i,{voice:this.currentVoice(),onStart:()=>this.updateUI("speaking"),onEnd:()=>{this.updateUI("idle"),this.scheduleAutoRestart(260)},onError:()=>{this.updateUI("idle"),this.scheduleAutoRestart(400)}}).catch(console.error);else this.updateUI("idle"),this.scheduleAutoRestart(200)}),this.wsVoice.on("error",(r)=>{if(this.showError(`Voix: ${r.message}`),t.trim()&&!e)this.addMessage("GUILLAUME",t,"ai"),this.updateUI("speaking"),qt.speak(t,{voice:this.currentVoice(),onStart:()=>this.updateUI("speaking"),onEnd:()=>{this.updateUI("idle"),this.scheduleAutoRestart(260)},onError:()=>{this.updateUI("idle"),this.scheduleAutoRestart(400)}}).catch(console.error);else this.updateUI("idle"),this.scheduleAutoRestart(400)})}async toggleLiveSession(){if(this.state==="speaking"){this.stopSpeaking(),this.isAutoConversation=!0,this.startListening();return}if(this.state==="listening"){this.isAutoConversation=!1,this.stopListening();return}if(this.state==="thinking")return;this.isAutoConversation=!0,await this.startListening()}async startListening(){if(this.autoRestartTimer)clearTimeout(this.autoRestartTimer),this.autoRestartTimer=null;try{let e=await this.getOrCreateAudioContext(),t=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:!0,noiseSuppression:!0,autoGainControl:!0},video:!1}),r=e.createMediaStreamSource(t);this.vad=new Lr({minSpeechMs:300,silenceMs:800,rmsThreshold:0.01,hardCapMs:15000}),this.wsAsr=new nr({language:"fr-CA"}),this.wsVoice=new Sr,this.asrReady=!1,this.lastRms=0,this.wsAsr.on("ready",()=>{this.asrReady=!0}),this.wsAsr.on("partial",(i)=>this.streamHoloSubtitle(i.text,2000)),this.wsAsr.on("error",(i)=>this.showError(`ASR: ${i.message}`)),this.setupVoiceClientListeners(),this.wsAsr.start(),this.updateUI("listening"),this.capture=await Ni({ctx:e,sourceNode:r,sampleRate:16000,frameMs:100,onFrame:(i)=>{if(this.state==="listening"){if(this.wsAsr?.sendPcm(i),this.pcmByteCount<Ma.PCM_MAX_BYTES)this.pcmFrames.push(i),this.pcmByteCount+=i.byteLength}},onRms:(i)=>{if(this.lastRms=i,this.state==="speaking"){if(i>=0.022){if(!this.isDucked)this.isDucked=!0,this.bargeInSpeechStart=performance.now(),this.player?.duck(0.12,30);else if(performance.now()-(this.bargeInSpeechStart||0)>=160)console.log("[Full-Duplex Barge-in] Interruption utilisateur confirmée."),this.isDucked=!1,this.bargeInSpeechStart=null,this.stopSpeaking(),this.wsVoice?.interrupt(),this.updateUI("listening"),this.wsAsr=new nr({language:"fr-CA"}),this.wsAsr.on("ready",()=>{this.asrReady=!0}),this.wsAsr.on("partial",(n)=>this.streamHoloSubtitle(n.text,2000)),this.wsAsr.on("error",(n)=>this.showError(`ASR: ${n.message}`)),this.wsAsr.start()}else if(i<0.015&&this.isDucked){if(performance.now()-(this.bargeInSpeechStart||0)<160)this.isDucked=!1,this.bargeInSpeechStart=null,this.player?.unduck(60)}}}}),this.vadInterval=setInterval(()=>{if(this.state!=="listening")return;if(this.vad?.push(this.lastRms,performance.now())==="silence")this.vad?.reset(),this.finishUtterance()},100)}catch(e){console.error("[Microphone error]",e),this.showError(`Microphone indisponible: ${e?.message||"Accès refusé"}`),this.updateUI("idle")}}async finishUtterance(){let e="";if(this.wsAsr)try{e=await this.wsAsr.stop()}catch(r){console.error("[ASR stop error]",r)}try{this.wsAsr?.close()}catch{}if(this.wsAsr=void 0,!e||e.trim().length===0){this.pcmFrames=[],this.pcmByteCount=0,this.updateUI("idle"),this.scheduleAutoRestart(150);return}let t;if(this.pcmFrames.length>0){let r=this.pcmFrames.reduce((u,l)=>u+l.length,0),i=new Int16Array(r),n=0;for(let u of this.pcmFrames)i.set(u,n),n+=u.length;let a=new Uint8Array(i.buffer),s="";for(let u=0;u<a.length;u++)s+=String.fromCharCode(a[u]);t=btoa(s)}this.pcmFrames=[],this.pcmByteCount=0,this.addMessage("VOUS",e,"user"),this.updateUI("thinking"),this.streamHoloSubtitle(e,2000),this.wsVoice?.chat(e,{voice:this.currentVoice(),system:_m,audio:t})}stopListening(){if(this.autoRestartTimer)clearTimeout(this.autoRestartTimer),this.autoRestartTimer=null;if(this.capture?.stop(),this.vadInterval)clearInterval(this.vadInterval),this.vadInterval=void 0;try{this.wsAsr?.close()}catch{}try{this.wsVoice?.abort()}catch{}try{this.player?.stop()}catch{}qt.stop(),this.audioEndUnsub?.(),this.audioEndUnsub=void 0,this.pcmFrames=[],this.pcmByteCount=0,this.updateUI("idle"),this.playChime(350,0.06)}currentVoice(){return"guillaume"}showError(e){console.error("[voice]",e),this.addMessage("SYSTEM",e,"system")}stopSpeaking(){try{this.player?.stop()}catch{}qt.stop(),this.audioEndUnsub?.(),this.audioEndUnsub=void 0,this.updateUI("idle")}addMessage(e,t,r){if(!this.messages)return;let i=this.messages.querySelector(".welcome-matrix");if(i)i.remove();let n=document.createElement("div");n.className=`message ${r}-message`,n.style.padding="12px 16px",n.style.margin="10px 0",n.style.borderRadius="12px",n.style.fontSize="15px",n.style.lineHeight="1.5",n.style.background=r==="user"?"rgba(6, 182, 212, 0.08)":r==="ai"?"rgba(139, 92, 246, 0.08)":"rgba(255, 255, 255, 0.05)",n.style.border=`1px solid ${r==="user"?"rgba(6, 182, 212, 0.2)":r==="ai"?"rgba(139, 92, 246, 0.2)":"rgba(255, 255, 255, 0.1)"}`,n.style.color=r==="user"?"#fff":r==="ai"?"#e9d5ff":"#a1a1aa",n.style.boxShadow=`0 4px 15px ${r==="user"?"rgba(6, 182, 212, 0.05)":r==="ai"?"rgba(139, 92, 246, 0.05)":"none"}`,n.innerHTML=`<strong style="color: ${r==="user"?"#06b6d4":r==="ai"?"#c084fc":"#a1a1aa"}; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">${e}</strong> ${t}`,this.messages.appendChild(n),this.messages.scrollTop=this.messages.scrollHeight}clearMessages(){if(!this.messages)return;this.messages.innerHTML='<div class="welcome-matrix"><div class="holo-card neural-welcome holo-border neural-scan"><div class="card-glow"></div><div class="quantum-field"></div><div class="quantum-interference"></div><div class="neural-header"><h2 class="matrix-title holo-text">NEURAL VOICE INTERFACE</h2><div class="quantum-line"></div></div><p class="holo-subtitle">Advanced Cloud AI • Quantum Processing</p><div class="tech-specs"><div class="spec-item vosk"><div class="spec-icon"><div class="icon-core"></div><div class="icon-rings"></div></div><div class="spec-details"><span class="spec-name">CLOUDFLARE AI EDGE</span><span class="spec-desc">Global Latency Audio Processing</span></div><div class="spec-status active"></div></div><div class="spec-item qwen"><div class="spec-icon"><div class="icon-core"></div><div class="icon-rings"></div></div><div class="spec-details"><span class="spec-name">Kimi K2.7 / Qwen Neural</span><span class="spec-desc">Quantum Language Matrix</span></div><div class="spec-status active"></div></div><div class="spec-item tts"><div class="spec-icon"><div class="icon-core"></div><div class="icon-rings"></div></div><div class="spec-details"><span class="spec-name">QWEN CLONED TTS + GOOGLE FALLBACK</span><span class="spec-desc">Guillaume Voice Synthesis</span></div><div class="spec-status active"></div></div></div><div class="quantum-prompt"><div class="prompt-glow"></div><span>CLIQUEZ SUR LE BOUTON POUR COMMENCER</span></div></div></div>'}streamHoloSubtitle(e,t=3000){if(!this.holoSubtitles)return;if(this.holoSubtitlesTimeout)window.clearTimeout(this.holoSubtitlesTimeout),this.holoSubtitlesTimeout=null;this.holoSubtitles.classList.remove("fade-out"),this.holoSubtitles.textContent=e,this.holoSubtitlesTimeout=window.setTimeout(()=>{this.holoSubtitles.classList.add("fade-out"),setTimeout(()=>{if(this.holoSubtitles&&this.holoSubtitles.classList.contains("fade-out"))this.holoSubtitles.innerHTML=""},1000)},Math.max(2000,t))}updateUI(e){this.state=e;let t=this.recordBtn?.querySelector(".btn-label"),r=this.recordBtn?.querySelector(".btn-sublabel");switch(e){case"idle":if(this.status)this.status.textContent="PRÊT • 100% CLOUD AI";if(t)t.textContent="CLOUD VOICE";if(r)r.textContent="Tap to Activate";this.recordBtn?.classList.remove("voice-active","processing","speaking");break;case"listening":if(this.status)this.status.textContent="\uD83D\uDC42 À l'écoute... (parlez naturellement)";if(t)t.textContent="LISTENING";if(r)r.textContent="Tap to Stop & Send";this.recordBtn?.classList.add("voice-active"),this.recordBtn?.classList.remove("processing","speaking");break;case"thinking":if(this.status)this.status.textContent="\uD83E\uDDE0 Traitement IA...";if(t)t.textContent="THINKING";if(r)r.textContent="Processing...";this.recordBtn?.classList.add("processing"),this.recordBtn?.classList.remove("voice-active","speaking");break;case"speaking":if(this.status)this.status.textContent="\uD83C\uDF99️ Guillaume parle... (touchez pour interrompre)";if(t)t.textContent="SPEAKING";if(r)r.textContent="Tap to Stop";this.recordBtn?.classList.add("speaking"),this.recordBtn?.classList.remove("voice-active","processing");break}}playChime(e,t){try{if(!this.audioCtx)return;let r=this.audioCtx.createOscillator(),i=this.audioCtx.createGain();r.type="sine",r.frequency.setValueAtTime(e,this.audioCtx.currentTime),i.gain.setValueAtTime(0.04,this.audioCtx.currentTime),i.gain.exponentialRampToValueAtTime(0.0001,this.audioCtx.currentTime+t),r.connect(i),i.connect(this.audioCtx.destination),r.start(),r.stop(this.audioCtx.currentTime+t)}catch{}}}new Ma;
