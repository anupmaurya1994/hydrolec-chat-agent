(function(x,J){typeof exports=="object"&&typeof module<"u"?J(exports):typeof define=="function"&&define.amd?define(["exports"],J):(x=typeof globalThis<"u"?globalThis:x||self,J(x.PristineChat={}))})(this,function(x){"use strict";/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var ys;const J=globalThis,re=J.ShadowRoot&&(J.ShadyCSS===void 0||J.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ae=Symbol(),Fe=new WeakMap;let Be=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==ae)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(re&&t===void 0){const s=e!==void 0&&e.length===1;s&&(t=Fe.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&Fe.set(e,t))}return t}toString(){return this.cssText}};const Ws=o=>new Be(typeof o=="string"?o:o+"",void 0,ae),it=(o,...t)=>{const e=o.length===1?o[0]:t.reduce((s,i,r)=>s+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+o[r+1],o[0]);return new Be(e,o,ae)},Gs=(o,t)=>{if(re)o.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const e of t){const s=document.createElement("style"),i=J.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=e.cssText,o.appendChild(s)}},je=re?o=>o:o=>o instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return Ws(e)})(o):o;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:qs,defineProperty:Ys,getOwnPropertyDescriptor:Vs,getOwnPropertyNames:Xs,getOwnPropertySymbols:Ks,getPrototypeOf:Js}=Object,Z=globalThis,We=Z.trustedTypes,Zs=We?We.emptyScript:"",le=Z.reactiveElementPolyfillSupport,Ot=(o,t)=>o,Wt={toAttribute(o,t){switch(t){case Boolean:o=o?Zs:null;break;case Object:case Array:o=o==null?o:JSON.stringify(o)}return o},fromAttribute(o,t){let e=o;switch(t){case Boolean:e=o!==null;break;case Number:e=o===null?null:Number(o);break;case Object:case Array:try{e=JSON.parse(o)}catch{e=null}}return e}},ce=(o,t)=>!qs(o,t),Ge={attribute:!0,type:String,converter:Wt,reflect:!1,useDefault:!1,hasChanged:ce};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),Z.litPropertyMetadata??(Z.litPropertyMetadata=new WeakMap);let ft=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=Ge){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,e);i!==void 0&&Ys(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){const{get:i,set:r}=Vs(this.prototype,t)??{get(){return this[e]},set(a){this[e]=a}};return{get:i,set(a){const c=i==null?void 0:i.call(this);r==null||r.call(this,a),this.requestUpdate(t,c,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??Ge}static _$Ei(){if(this.hasOwnProperty(Ot("elementProperties")))return;const t=Js(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(Ot("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Ot("properties"))){const e=this.properties,s=[...Xs(e),...Ks(e)];for(const i of s)this.createProperty(i,e[i])}const t=this[Symbol.metadata];if(t!==null){const e=litPropertyMetadata.get(t);if(e!==void 0)for(const[s,i]of e)this.elementProperties.set(s,i)}this._$Eh=new Map;for(const[e,s]of this.elementProperties){const i=this._$Eu(e,s);i!==void 0&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const i of s)e.unshift(je(i))}else t!==void 0&&e.push(je(t));return e}static _$Eu(t,e){const s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var t;this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),(t=this.constructor.l)==null||t.forEach(e=>e(this))}addController(t){var e;(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&((e=t.hostConnected)==null||e.call(t))}removeController(t){var e;(e=this._$EO)==null||e.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Gs(t,this.constructor.elementStyles),t}connectedCallback(){var t;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(t=this._$EO)==null||t.forEach(e=>{var s;return(s=e.hostConnected)==null?void 0:s.call(e)})}enableUpdating(t){}disconnectedCallback(){var t;(t=this._$EO)==null||t.forEach(e=>{var s;return(s=e.hostDisconnected)==null?void 0:s.call(e)})}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){var r;const s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(i!==void 0&&s.reflect===!0){const a=(((r=s.converter)==null?void 0:r.toAttribute)!==void 0?s.converter:Wt).toAttribute(e,s.type);this._$Em=t,a==null?this.removeAttribute(i):this.setAttribute(i,a),this._$Em=null}}_$AK(t,e){var r,a;const s=this.constructor,i=s._$Eh.get(t);if(i!==void 0&&this._$Em!==i){const c=s.getPropertyOptions(i),u=typeof c.converter=="function"?{fromAttribute:c.converter}:((r=c.converter)==null?void 0:r.fromAttribute)!==void 0?c.converter:Wt;this._$Em=i;const f=u.fromAttribute(e,c.type);this[i]=f??((a=this._$Ej)==null?void 0:a.get(i))??f,this._$Em=null}}requestUpdate(t,e,s,i=!1,r){var a;if(t!==void 0){const c=this.constructor;if(i===!1&&(r=this[t]),s??(s=c.getPropertyOptions(t)),!((s.hasChanged??ce)(r,e)||s.useDefault&&s.reflect&&r===((a=this._$Ej)==null?void 0:a.get(t))&&!this.hasAttribute(c._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:r},a){s&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,a??e??this[t]),r!==!0||a!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),i===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var s;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[r,a]of this._$Ep)this[r]=a;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[r,a]of i){const{wrapped:c}=a,u=this[r];c!==!0||this._$AL.has(r)||u===void 0||this.C(r,void 0,a,u)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),(s=this._$EO)==null||s.forEach(i=>{var r;return(r=i.hostUpdate)==null?void 0:r.call(i)}),this.update(e)):this._$EM()}catch(i){throw t=!1,this._$EM(),i}t&&this._$AE(e)}willUpdate(t){}_$AE(t){var e;(e=this._$EO)==null||e.forEach(s=>{var i;return(i=s.hostUpdated)==null?void 0:i.call(s)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(e=>this._$ET(e,this[e]))),this._$EM()}updated(t){}firstUpdated(t){}};ft.elementStyles=[],ft.shadowRootOptions={mode:"open"},ft[Ot("elementProperties")]=new Map,ft[Ot("finalized")]=new Map,le==null||le({ReactiveElement:ft}),(Z.reactiveElementVersions??(Z.reactiveElementVersions=[])).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Rt=globalThis,qe=o=>o,Gt=Rt.trustedTypes,Ye=Gt?Gt.createPolicy("lit-html",{createHTML:o=>o}):void 0,Ve="$lit$",Q=`lit$${Math.random().toFixed(9).slice(2)}$`,Xe="?"+Q,Qs=`<${Xe}>`,ot=document,kt=()=>ot.createComment(""),Pt=o=>o===null||typeof o!="object"&&typeof o!="function",pe=Array.isArray,ti=o=>pe(o)||typeof(o==null?void 0:o[Symbol.iterator])=="function",he=`[ 	
\f\r]`,It=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ke=/-->/g,Je=/>/g,nt=RegExp(`>|${he}(?:([^\\s"'>=/]+)(${he}*=${he}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Ze=/'/g,Qe=/"/g,ts=/^(?:script|style|textarea|title)$/i,ei=o=>(t,...e)=>({_$litType$:o,strings:t,values:e}),g=ei(1),rt=Symbol.for("lit-noChange"),w=Symbol.for("lit-nothing"),es=new WeakMap,at=ot.createTreeWalker(ot,129);function ss(o,t){if(!pe(o)||!o.hasOwnProperty("raw"))throw Error("invalid template strings array");return Ye!==void 0?Ye.createHTML(t):t}const si=(o,t)=>{const e=o.length-1,s=[];let i,r=t===2?"<svg>":t===3?"<math>":"",a=It;for(let c=0;c<e;c++){const u=o[c];let f,_,m=-1,U=0;for(;U<u.length&&(a.lastIndex=U,_=a.exec(u),_!==null);)U=a.lastIndex,a===It?_[1]==="!--"?a=Ke:_[1]!==void 0?a=Je:_[2]!==void 0?(ts.test(_[2])&&(i=RegExp("</"+_[2],"g")),a=nt):_[3]!==void 0&&(a=nt):a===nt?_[0]===">"?(a=i??It,m=-1):_[1]===void 0?m=-2:(m=a.lastIndex-_[2].length,f=_[1],a=_[3]===void 0?nt:_[3]==='"'?Qe:Ze):a===Qe||a===Ze?a=nt:a===Ke||a===Je?a=It:(a=nt,i=void 0);const S=a===nt&&o[c+1].startsWith("/>")?" ":"";r+=a===It?u+Qs:m>=0?(s.push(f),u.slice(0,m)+Ve+u.slice(m)+Q+S):u+Q+(m===-2?c:S)}return[ss(o,r+(o[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]};class Mt{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let r=0,a=0;const c=t.length-1,u=this.parts,[f,_]=si(t,e);if(this.el=Mt.createElement(f,s),at.currentNode=this.el.content,e===2||e===3){const m=this.el.content.firstChild;m.replaceWith(...m.childNodes)}for(;(i=at.nextNode())!==null&&u.length<c;){if(i.nodeType===1){if(i.hasAttributes())for(const m of i.getAttributeNames())if(m.endsWith(Ve)){const U=_[a++],S=i.getAttribute(m).split(Q),N=/([.?@])?(.*)/.exec(U);u.push({type:1,index:r,name:N[2],strings:S,ctor:N[1]==="."?oi:N[1]==="?"?ni:N[1]==="@"?ri:qt}),i.removeAttribute(m)}else m.startsWith(Q)&&(u.push({type:6,index:r}),i.removeAttribute(m));if(ts.test(i.tagName)){const m=i.textContent.split(Q),U=m.length-1;if(U>0){i.textContent=Gt?Gt.emptyScript:"";for(let S=0;S<U;S++)i.append(m[S],kt()),at.nextNode(),u.push({type:2,index:++r});i.append(m[U],kt())}}}else if(i.nodeType===8)if(i.data===Xe)u.push({type:2,index:r});else{let m=-1;for(;(m=i.data.indexOf(Q,m+1))!==-1;)u.push({type:7,index:r}),m+=Q.length-1}r++}}static createElement(t,e){const s=ot.createElement("template");return s.innerHTML=t,s}}function mt(o,t,e=o,s){var a,c;if(t===rt)return t;let i=s!==void 0?(a=e._$Co)==null?void 0:a[s]:e._$Cl;const r=Pt(t)?void 0:t._$litDirective$;return(i==null?void 0:i.constructor)!==r&&((c=i==null?void 0:i._$AO)==null||c.call(i,!1),r===void 0?i=void 0:(i=new r(o),i._$AT(o,e,s)),s!==void 0?(e._$Co??(e._$Co=[]))[s]=i:e._$Cl=i),i!==void 0&&(t=mt(o,i._$AS(o,t.values),i,s)),t}class ii{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:s}=this._$AD,i=((t==null?void 0:t.creationScope)??ot).importNode(e,!0);at.currentNode=i;let r=at.nextNode(),a=0,c=0,u=s[0];for(;u!==void 0;){if(a===u.index){let f;u.type===2?f=new Dt(r,r.nextSibling,this,t):u.type===1?f=new u.ctor(r,u.name,u.strings,this,t):u.type===6&&(f=new ai(r,this,t)),this._$AV.push(f),u=s[++c]}a!==(u==null?void 0:u.index)&&(r=at.nextNode(),a++)}return at.currentNode=ot,i}p(t){let e=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class Dt{get _$AU(){var t;return((t=this._$AM)==null?void 0:t._$AU)??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=w,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=(i==null?void 0:i.isConnected)??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return e!==void 0&&(t==null?void 0:t.nodeType)===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=mt(this,t,e),Pt(t)?t===w||t==null||t===""?(this._$AH!==w&&this._$AR(),this._$AH=w):t!==this._$AH&&t!==rt&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):ti(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==w&&Pt(this._$AH)?this._$AA.nextSibling.data=t:this.T(ot.createTextNode(t)),this._$AH=t}$(t){var r;const{values:e,_$litType$:s}=t,i=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=Mt.createElement(ss(s.h,s.h[0]),this.options)),s);if(((r=this._$AH)==null?void 0:r._$AD)===i)this._$AH.p(e);else{const a=new ii(i,this),c=a.u(this.options);a.p(e),this.T(c),this._$AH=a}}_$AC(t){let e=es.get(t.strings);return e===void 0&&es.set(t.strings,e=new Mt(t)),e}k(t){pe(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,i=0;for(const r of t)i===e.length?e.push(s=new Dt(this.O(kt()),this.O(kt()),this,this.options)):s=e[i],s._$AI(r),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){var s;for((s=this._$AP)==null?void 0:s.call(this,!1,!0,e);t!==this._$AB;){const i=qe(t).nextSibling;qe(t).remove(),t=i}}setConnected(t){var e;this._$AM===void 0&&(this._$Cv=t,(e=this._$AP)==null||e.call(this,t))}}class qt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,r){this.type=1,this._$AH=w,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=r,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=w}_$AI(t,e=this,s,i){const r=this.strings;let a=!1;if(r===void 0)t=mt(this,t,e,0),a=!Pt(t)||t!==this._$AH&&t!==rt,a&&(this._$AH=t);else{const c=t;let u,f;for(t=r[0],u=0;u<r.length-1;u++)f=mt(this,c[s+u],e,u),f===rt&&(f=this._$AH[u]),a||(a=!Pt(f)||f!==this._$AH[u]),f===w?t=w:t!==w&&(t+=(f??"")+r[u+1]),this._$AH[u]=f}a&&!i&&this.j(t)}j(t){t===w?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class oi extends qt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===w?void 0:t}}class ni extends qt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==w)}}class ri extends qt{constructor(t,e,s,i,r){super(t,e,s,i,r),this.type=5}_$AI(t,e=this){if((t=mt(this,t,e,0)??w)===rt)return;const s=this._$AH,i=t===w&&s!==w||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,r=t!==w&&(s===w||i);i&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e;typeof this._$AH=="function"?this._$AH.call(((e=this.options)==null?void 0:e.host)??this.element,t):this._$AH.handleEvent(t)}}class ai{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){mt(this,t)}}const ue=Rt.litHtmlPolyfillSupport;ue==null||ue(Mt,Dt),(Rt.litHtmlVersions??(Rt.litHtmlVersions=[])).push("3.3.2");const li=(o,t,e)=>{const s=(e==null?void 0:e.renderBefore)??t;let i=s._$litPart$;if(i===void 0){const r=(e==null?void 0:e.renderBefore)??null;s._$litPart$=i=new Dt(t.insertBefore(kt(),r),r,void 0,e??{})}return i._$AI(o),i};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const lt=globalThis;let F=class extends ft{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e;const t=super.createRenderRoot();return(e=this.renderOptions).renderBefore??(e.renderBefore=t.firstChild),t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=li(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),(t=this._$Do)==null||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this._$Do)==null||t.setConnected(!1)}render(){return rt}};F._$litElement$=!0,F.finalized=!0,(ys=lt.litElementHydrateSupport)==null||ys.call(lt,{LitElement:F});const de=lt.litElementPolyfillSupport;de==null||de({LitElement:F}),(lt.litElementVersions??(lt.litElementVersions=[])).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ct=o=>(t,e)=>{e!==void 0?e.addInitializer(()=>{customElements.define(o,t)}):customElements.define(o,t)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ci={attribute:!0,type:String,converter:Wt,reflect:!1,hasChanged:ce},pi=(o=ci,t,e)=>{const{kind:s,metadata:i}=e;let r=globalThis.litPropertyMetadata.get(i);if(r===void 0&&globalThis.litPropertyMetadata.set(i,r=new Map),s==="setter"&&((o=Object.create(o)).wrapped=!0),r.set(e.name,o),s==="accessor"){const{name:a}=e;return{set(c){const u=t.get.call(this);t.set.call(this,c),this.requestUpdate(a,u,o,!0,c)},init(c){return c!==void 0&&this.C(a,void 0,o,c),c}}}if(s==="setter"){const{name:a}=e;return function(c){const u=this[a];t.call(this,c),this.requestUpdate(a,u,o,!0,c)}}throw Error("Unsupported decorator location: "+s)};function b(o){return(t,e)=>typeof e=="object"?pi(o,t,e):((s,i,r)=>{const a=i.hasOwnProperty(r);return i.constructor.createProperty(r,s),a?Object.getOwnPropertyDescriptor(i,r):void 0})(o,t,e)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function k(o){return b({...o,state:!0,attribute:!1})}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const hi=(o,t,e)=>(e.configurable=!0,e.enumerable=!0,Reflect.decorate&&typeof t!="object"&&Object.defineProperty(o,t,e),e);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ui(o,t){return(e,s,i)=>{const r=a=>{var c;return((c=a.renderRoot)==null?void 0:c.querySelector(o))??null};return hi(e,s,{get(){return r(this)}})}}const di=it`
  :host {
    display: block;
    font-family: var(--pc-font-family, system-ui, sans-serif);
    --pc-primary: #007bff;
    --pc-bg: #fff;
    --pc-text: #000;
  }

  * { box-sizing: border-box; }

  .chat-container {
    position: fixed;
    display: flex;
    flex-direction: column;
    width: 380px;
    height: 600px;
    max-height: 80vh;
    background: var(--pc-bg);
    color: var(--pc-text);
    border-radius: var(--pc-radius, 12px);
    box-shadow: 0 5px 25px rgba(0,0,0,0.15);
    overflow: hidden;
    transition: opacity 0.3s ease, transform 0.3s ease;
    z-index: var(--pc-z-index, 9999);
  }

  .chat-container.closed {
    opacity: 0;
    pointer-events: none;
    transform: translateY(20px) scale(0.95);
  }

  .chat-container.open {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0) scale(1);
  }

  /* Positions */
  .pos-bottom-right { bottom: 20px; right: 20px; }
  .pos-bottom-left { bottom: 20px; left: 20px; }

  .launcher-wrapper {
    position: fixed;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    /* Background and color removed here as they are handled by inner component or passed down? 
       Actually chat-bubble handles its own background/color. 
       Let's check if we need to remove them or if they are just ignored/overridden.
       The template says: <chat-bubble ...></chat-bubble>
       The wrapper is just for positioning.
       So we probably don't want background on the wrapper if the bubble is circular.
       But let's look at chat-bubble.ts again.
    */
    /* Keeping original styles but renaming for now to be safe, assuming wrapper should behave like the launcher button container */
    /* Wait, chat-bubble has .launcher class too inside it! */
    /* If we style wrapper with background, we might have double circles. */
    /* Let's look at pristine-chat.ts again. */
    /* <div class="launcher-wrapper ..."> <chat-bubble ...> </div> */
    /* Wrapper is for positioning. chat-bubble is the visual. */
    /* So wrapper should NOT have background/shadow/size if chat-bubble has it. */
    /* OR wrapper IS the visual container? */
    /* chat-bubble.ts styles: .launcher { width: 60px; height: 60px; ... background: ... } */
    /* So chat-bubble HAS the visual styles. */
    /* So styles.ts .launcher having background/width/height/shadow is WRONG or REDUNDANT? */
    /* styles.ts .launcher has position: fixed. chat-bubble .launcher does NOT. */
    /* So styles.ts was trying to be the positioning container. */
    /* If I rename it to .launcher-wrapper, I should REMOVE visual styles (bg, shadow, etc) and KEEP positioning styles (fixed, z-index). */
  }

  .launcher-wrapper {
    position: fixed;
    z-index: var(--pc-z-index, 9999);
    /* No visual styles, just positioning */
    display: flex;
    align-items: center;
    justify-content: center;
    /* We need width/height??? No, let child determine size? */
    /* But standardizing layout helps. */
    /* If I remove width/height/bg, will it break? */
    /* The original code had ALL styles on .launcher in styles.ts. */
    /* AND chat-bubble.ts has styles on .launcher too. */
  }


  @media (max-width: 480px) {
    .chat-container {
      width: 100%;
      height: 100%;
      max-height: 100%;
      bottom: 0 !important;
      right: 0 !important;
      left: 0 !important;
      border-radius: 0;
    }
  }
`,is={apiBaseUrl:"http://localhost:3000/api/hydrolecagentKim",theme:"light",primaryColor:"#007bff",secondaryColor:"#6c757d",backgroundColor:"#ffffff",textColor:"#000000",borderRadius:"12px",fontFamily:"Inter, system-ui, sans-serif",position:"bottom-right",zIndex:"9999",launcherIcon:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',headerTitle:"Support",headerSubtitle:"We are online",welcomeMessage:"Hello! How can I help you?",typingIndicator:!0,typingText:"Agent is typing...",features:{enableFileUpload:!1,allowedFileTypes:["jpg","png","pdf"],maxFileSizeMB:5,enableEmoji:!0,enableMarkdown:!0,enableStreaming:!0,enableFeedback:!1,enableConversationReset:!0}};function os(o,t={},e={}){return{...o,...t,...e,features:{...o.features,...t.features||{},...e.features||{}}}}class fi{constructor(t){this.config=t}async fetchConfig(){try{const t=new URL(`${this.config.apiBaseUrl}/widget/config`);this.config.tenantId&&t.searchParams.append("tenantId",this.config.tenantId);const e=await fetch(t.toString());if(!e.ok)throw new Error("Failed to fetch config");return await e.json()}catch(t){return console.warn("Failed to load remote config:",t),{}}}async storeConversationMessage(t,e,s){await fetch(`${this.config.apiBaseUrl}/chat/store-conversation-message`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({visitorId:t,sender:e,message:s})})}async resetConversation(t){const e=await fetch(`${this.config.apiBaseUrl}/chat/reset`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({visitorId:t})});return e.ok?await e.json():{active:!1}}async checkStatus(t){const e=new URL(`${this.config.apiBaseUrl}/chat/status/${t}`),s=await fetch(e.toString());return s.ok?await s.json():{active:!1}}async getMessages(t){const e=await fetch(`${this.config.apiBaseUrl}/conversations/${t}/messages`);return e.ok?await e.json():[]}}var mi=Object.defineProperty,gi=Object.getOwnPropertyDescriptor,Yt=(o,t,e,s)=>{for(var i=s>1?void 0:s?gi(t,e):t,r=o.length-1,a;r>=0;r--)(a=o[r])&&(i=(s?a(t,e,i):a(i))||i);return s&&i&&mi(t,e,i),i};let gt=class extends F{constructor(){super(...arguments),this.title="Chat",this.subtitle="",this.primaryColor="#007bff"}render(){return g`
      <div class="header-top">
        <div style="display:flex;gap:5px;align-items:center;">
            <span style="padding:8px;background:#ffffff33;line-height: 0;border-radius: 8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles h-4 w-4"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>
            </span>
          <div style="display:flex;flex-direction:column;">
             <h2 style="font-size:14px;">${this.title}</h2>
             ${this.subtitle?g`<p style="font-size:12px;margin:0px;">${this.subtitle}</p>`:""}
          </div>
        </div>
        <div class="actions">
            <button class="icon-btn" title="End Conversation" @click=${()=>this.dispatchEvent(new CustomEvent("reset"))}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </button>
            <button class="icon-btn" @click=${()=>this.dispatchEvent(new CustomEvent("close"))}>&times;</button>
        </div>
      </div>
    `}};gt.styles=it`
    :host {
      display: flex;
      flex-direction: column;
      padding: 5px 20px;
      color: white;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h2 { margin: 0; font-size: 1.1rem; }
    p { margin: 4px 0 0; font-size: 0.85rem; opacity: 0.9; }
    .actions { display: flex; align-items: center; gap: 8px; }
    .icon-btn {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 1.5rem;
      padding: 4px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
    }
    .icon-btn:hover { background: rgba(255,255,255,0.1); }
    .icon-btn svg { width: 20px; height: 20px; }
  `,Yt([b()],gt.prototype,"title",2),Yt([b()],gt.prototype,"subtitle",2),Yt([b()],gt.prototype,"primaryColor",2),gt=Yt([ct("chat-header")],gt);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const bi={CHILD:2},yi=o=>(...t)=>({_$litDirective$:o,values:t});class _i{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,s){this._$Ct=t,this._$AM=e,this._$Ci=s}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class fe extends _i{constructor(t){if(super(t),this.it=w,t.type!==bi.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(t){if(t===w||t==null)return this._t=void 0,this.it=t;if(t===rt)return t;if(typeof t!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(t===this.it)return this._t;this.it=t;const e=[t];return e.raw=e,this._t={_$litType$:this.constructor.resultType,strings:e,values:[]}}}fe.directiveName="unsafeHTML",fe.resultType=1;const ns=yi(fe);/*! @license DOMPurify 3.3.1 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.3.1/LICENSE */const{entries:rs,setPrototypeOf:as,isFrozen:vi,getPrototypeOf:wi,getOwnPropertyDescriptor:Ai}=Object;let{freeze:P,seal:H,create:me}=Object,{apply:ge,construct:be}=typeof Reflect<"u"&&Reflect;P||(P=function(t){return t}),H||(H=function(t){return t}),ge||(ge=function(t,e){for(var s=arguments.length,i=new Array(s>2?s-2:0),r=2;r<s;r++)i[r-2]=arguments[r];return t.apply(e,i)}),be||(be=function(t){for(var e=arguments.length,s=new Array(e>1?e-1:0),i=1;i<e;i++)s[i-1]=arguments[i];return new t(...s)});const Vt=M(Array.prototype.forEach),Ei=M(Array.prototype.lastIndexOf),ls=M(Array.prototype.pop),Nt=M(Array.prototype.push),Ti=M(Array.prototype.splice),Xt=M(String.prototype.toLowerCase),ye=M(String.prototype.toString),_e=M(String.prototype.match),Lt=M(String.prototype.replace),xi=M(String.prototype.indexOf),Si=M(String.prototype.trim),B=M(Object.prototype.hasOwnProperty),I=M(RegExp.prototype.test),Ut=$i(TypeError);function M(o){return function(t){t instanceof RegExp&&(t.lastIndex=0);for(var e=arguments.length,s=new Array(e>1?e-1:0),i=1;i<e;i++)s[i-1]=arguments[i];return ge(o,t,s)}}function $i(o){return function(){for(var t=arguments.length,e=new Array(t),s=0;s<t;s++)e[s]=arguments[s];return be(o,e)}}function d(o,t){let e=arguments.length>2&&arguments[2]!==void 0?arguments[2]:Xt;as&&as(o,null);let s=t.length;for(;s--;){let i=t[s];if(typeof i=="string"){const r=e(i);r!==i&&(vi(t)||(t[s]=r),i=r)}o[i]=!0}return o}function Ci(o){for(let t=0;t<o.length;t++)B(o,t)||(o[t]=null);return o}function j(o){const t=me(null);for(const[e,s]of rs(o))B(o,e)&&(Array.isArray(s)?t[e]=Ci(s):s&&typeof s=="object"&&s.constructor===Object?t[e]=j(s):t[e]=s);return t}function Ht(o,t){for(;o!==null;){const s=Ai(o,t);if(s){if(s.get)return M(s.get);if(typeof s.value=="function")return M(s.value)}o=wi(o)}function e(){return null}return e}const cs=P(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","shadow","slot","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),ve=P(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","enterkeyhint","exportparts","filter","font","g","glyph","glyphref","hkern","image","inputmode","line","lineargradient","marker","mask","metadata","mpath","part","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),we=P(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),Oi=P(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),Ae=P(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),Ri=P(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),ps=P(["#text"]),hs=P(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","exportparts","face","for","headers","height","hidden","high","href","hreflang","id","inert","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","part","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","slot","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns","slot"]),Ee=P(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","mask-type","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),us=P(["accent","accentunder","align","bevelled","close","columnsalign","columnlines","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lspace","lquote","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),Kt=P(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),ki=H(/\{\{[\w\W]*|[\w\W]*\}\}/gm),Pi=H(/<%[\w\W]*|[\w\W]*%>/gm),Ii=H(/\$\{[\w\W]*/gm),Mi=H(/^data-[\-\w.\u00B7-\uFFFF]+$/),Di=H(/^aria-[\-\w]+$/),ds=H(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),Ni=H(/^(?:\w+script|data):/i),Li=H(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),fs=H(/^html$/i),Ui=H(/^[a-z][.\w]*(-[.\w]+)+$/i);var ms=Object.freeze({__proto__:null,ARIA_ATTR:Di,ATTR_WHITESPACE:Li,CUSTOM_ELEMENT:Ui,DATA_ATTR:Mi,DOCTYPE_NAME:fs,ERB_EXPR:Pi,IS_ALLOWED_URI:ds,IS_SCRIPT_OR_DATA:Ni,MUSTACHE_EXPR:ki,TMPLIT_EXPR:Ii});const zt={element:1,text:3,progressingInstruction:7,comment:8,document:9},Hi=function(){return typeof window>"u"?null:window},zi=function(t,e){if(typeof t!="object"||typeof t.createPolicy!="function")return null;let s=null;const i="data-tt-policy-suffix";e&&e.hasAttribute(i)&&(s=e.getAttribute(i));const r="dompurify"+(s?"#"+s:"");try{return t.createPolicy(r,{createHTML(a){return a},createScriptURL(a){return a}})}catch{return console.warn("TrustedTypes policy "+r+" could not be created."),null}},gs=function(){return{afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]}};function bs(){let o=arguments.length>0&&arguments[0]!==void 0?arguments[0]:Hi();const t=h=>bs(h);if(t.version="3.3.1",t.removed=[],!o||!o.document||o.document.nodeType!==zt.document||!o.Element)return t.isSupported=!1,t;let{document:e}=o;const s=e,i=s.currentScript,{DocumentFragment:r,HTMLTemplateElement:a,Node:c,Element:u,NodeFilter:f,NamedNodeMap:_=o.NamedNodeMap||o.MozNamedAttrMap,HTMLFormElement:m,DOMParser:U,trustedTypes:S}=o,N=u.prototype,Te=Ht(N,"cloneNode"),_s=Ht(N,"remove"),xe=Ht(N,"nextSibling"),Zt=Ht(N,"childNodes"),pt=Ht(N,"parentNode");if(typeof a=="function"){const h=e.createElement("template");h.content&&h.content.ownerDocument&&(e=h.content.ownerDocument)}let A,ht="";const{implementation:wt,createNodeIterator:to,createDocumentFragment:eo,getElementsByTagName:so}=e,{importNode:io}=s;let D=gs();t.isSupported=typeof rs=="function"&&typeof pt=="function"&&wt&&wt.createHTMLDocument!==void 0;const{MUSTACHE_EXPR:Se,ERB_EXPR:$e,TMPLIT_EXPR:Ce,DATA_ATTR:oo,ARIA_ATTR:no,IS_SCRIPT_OR_DATA:ro,ATTR_WHITESPACE:vs,CUSTOM_ELEMENT:ao}=ms;let{IS_ALLOWED_URI:ws}=ms,$=null;const As=d({},[...cs,...ve,...we,...Ae,...ps]);let C=null;const Es=d({},[...hs,...Ee,...us,...Kt]);let v=Object.seal(me(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),Ft=null,Oe=null;const At=Object.seal(me(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}}));let Ts=!0,Re=!0,xs=!1,Ss=!0,Et=!1,Qt=!0,ut=!1,ke=!1,Pe=!1,Tt=!1,te=!1,ee=!1,$s=!0,Cs=!1;const lo="user-content-";let Ie=!0,Bt=!1,xt={},q=null;const Me=d({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","style","svg","template","thead","title","video","xmp"]);let Os=null;const Rs=d({},["audio","video","img","source","image","track"]);let De=null;const ks=d({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),se="http://www.w3.org/1998/Math/MathML",ie="http://www.w3.org/2000/svg",V="http://www.w3.org/1999/xhtml";let St=V,Ne=!1,Le=null;const co=d({},[se,ie,V],ye);let oe=d({},["mi","mo","mn","ms","mtext"]),ne=d({},["annotation-xml"]);const po=d({},["title","style","font","a","script"]);let jt=null;const ho=["application/xhtml+xml","text/html"],uo="text/html";let T=null,$t=null;const fo=e.createElement("form"),Ps=function(n){return n instanceof RegExp||n instanceof Function},Ue=function(){let n=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};if(!($t&&$t===n)){if((!n||typeof n!="object")&&(n={}),n=j(n),jt=ho.indexOf(n.PARSER_MEDIA_TYPE)===-1?uo:n.PARSER_MEDIA_TYPE,T=jt==="application/xhtml+xml"?ye:Xt,$=B(n,"ALLOWED_TAGS")?d({},n.ALLOWED_TAGS,T):As,C=B(n,"ALLOWED_ATTR")?d({},n.ALLOWED_ATTR,T):Es,Le=B(n,"ALLOWED_NAMESPACES")?d({},n.ALLOWED_NAMESPACES,ye):co,De=B(n,"ADD_URI_SAFE_ATTR")?d(j(ks),n.ADD_URI_SAFE_ATTR,T):ks,Os=B(n,"ADD_DATA_URI_TAGS")?d(j(Rs),n.ADD_DATA_URI_TAGS,T):Rs,q=B(n,"FORBID_CONTENTS")?d({},n.FORBID_CONTENTS,T):Me,Ft=B(n,"FORBID_TAGS")?d({},n.FORBID_TAGS,T):j({}),Oe=B(n,"FORBID_ATTR")?d({},n.FORBID_ATTR,T):j({}),xt=B(n,"USE_PROFILES")?n.USE_PROFILES:!1,Ts=n.ALLOW_ARIA_ATTR!==!1,Re=n.ALLOW_DATA_ATTR!==!1,xs=n.ALLOW_UNKNOWN_PROTOCOLS||!1,Ss=n.ALLOW_SELF_CLOSE_IN_ATTR!==!1,Et=n.SAFE_FOR_TEMPLATES||!1,Qt=n.SAFE_FOR_XML!==!1,ut=n.WHOLE_DOCUMENT||!1,Tt=n.RETURN_DOM||!1,te=n.RETURN_DOM_FRAGMENT||!1,ee=n.RETURN_TRUSTED_TYPE||!1,Pe=n.FORCE_BODY||!1,$s=n.SANITIZE_DOM!==!1,Cs=n.SANITIZE_NAMED_PROPS||!1,Ie=n.KEEP_CONTENT!==!1,Bt=n.IN_PLACE||!1,ws=n.ALLOWED_URI_REGEXP||ds,St=n.NAMESPACE||V,oe=n.MATHML_TEXT_INTEGRATION_POINTS||oe,ne=n.HTML_INTEGRATION_POINTS||ne,v=n.CUSTOM_ELEMENT_HANDLING||{},n.CUSTOM_ELEMENT_HANDLING&&Ps(n.CUSTOM_ELEMENT_HANDLING.tagNameCheck)&&(v.tagNameCheck=n.CUSTOM_ELEMENT_HANDLING.tagNameCheck),n.CUSTOM_ELEMENT_HANDLING&&Ps(n.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)&&(v.attributeNameCheck=n.CUSTOM_ELEMENT_HANDLING.attributeNameCheck),n.CUSTOM_ELEMENT_HANDLING&&typeof n.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements=="boolean"&&(v.allowCustomizedBuiltInElements=n.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements),Et&&(Re=!1),te&&(Tt=!0),xt&&($=d({},ps),C=[],xt.html===!0&&(d($,cs),d(C,hs)),xt.svg===!0&&(d($,ve),d(C,Ee),d(C,Kt)),xt.svgFilters===!0&&(d($,we),d(C,Ee),d(C,Kt)),xt.mathMl===!0&&(d($,Ae),d(C,us),d(C,Kt))),n.ADD_TAGS&&(typeof n.ADD_TAGS=="function"?At.tagCheck=n.ADD_TAGS:($===As&&($=j($)),d($,n.ADD_TAGS,T))),n.ADD_ATTR&&(typeof n.ADD_ATTR=="function"?At.attributeCheck=n.ADD_ATTR:(C===Es&&(C=j(C)),d(C,n.ADD_ATTR,T))),n.ADD_URI_SAFE_ATTR&&d(De,n.ADD_URI_SAFE_ATTR,T),n.FORBID_CONTENTS&&(q===Me&&(q=j(q)),d(q,n.FORBID_CONTENTS,T)),n.ADD_FORBID_CONTENTS&&(q===Me&&(q=j(q)),d(q,n.ADD_FORBID_CONTENTS,T)),Ie&&($["#text"]=!0),ut&&d($,["html","head","body"]),$.table&&(d($,["tbody"]),delete Ft.tbody),n.TRUSTED_TYPES_POLICY){if(typeof n.TRUSTED_TYPES_POLICY.createHTML!="function")throw Ut('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');if(typeof n.TRUSTED_TYPES_POLICY.createScriptURL!="function")throw Ut('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');A=n.TRUSTED_TYPES_POLICY,ht=A.createHTML("")}else A===void 0&&(A=zi(S,i)),A!==null&&typeof ht=="string"&&(ht=A.createHTML(""));P&&P(n),$t=n}},Is=d({},[...ve,...we,...Oi]),Ms=d({},[...Ae,...Ri]),mo=function(n){let l=pt(n);(!l||!l.tagName)&&(l={namespaceURI:St,tagName:"template"});const p=Xt(n.tagName),y=Xt(l.tagName);return Le[n.namespaceURI]?n.namespaceURI===ie?l.namespaceURI===V?p==="svg":l.namespaceURI===se?p==="svg"&&(y==="annotation-xml"||oe[y]):!!Is[p]:n.namespaceURI===se?l.namespaceURI===V?p==="math":l.namespaceURI===ie?p==="math"&&ne[y]:!!Ms[p]:n.namespaceURI===V?l.namespaceURI===ie&&!ne[y]||l.namespaceURI===se&&!oe[y]?!1:!Ms[p]&&(po[p]||!Is[p]):!!(jt==="application/xhtml+xml"&&Le[n.namespaceURI]):!1},Y=function(n){Nt(t.removed,{element:n});try{pt(n).removeChild(n)}catch{_s(n)}},dt=function(n,l){try{Nt(t.removed,{attribute:l.getAttributeNode(n),from:l})}catch{Nt(t.removed,{attribute:null,from:l})}if(l.removeAttribute(n),n==="is")if(Tt||te)try{Y(l)}catch{}else try{l.setAttribute(n,"")}catch{}},Ds=function(n){let l=null,p=null;if(Pe)n="<remove></remove>"+n;else{const E=_e(n,/^[\r\n\t ]+/);p=E&&E[0]}jt==="application/xhtml+xml"&&St===V&&(n='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+n+"</body></html>");const y=A?A.createHTML(n):n;if(St===V)try{l=new U().parseFromString(y,jt)}catch{}if(!l||!l.documentElement){l=wt.createDocument(St,"template",null);try{l.documentElement.innerHTML=Ne?ht:y}catch{}}const R=l.body||l.documentElement;return n&&p&&R.insertBefore(e.createTextNode(p),R.childNodes[0]||null),St===V?so.call(l,ut?"html":"body")[0]:ut?l.documentElement:R},Ns=function(n){return to.call(n.ownerDocument||n,n,f.SHOW_ELEMENT|f.SHOW_COMMENT|f.SHOW_TEXT|f.SHOW_PROCESSING_INSTRUCTION|f.SHOW_CDATA_SECTION,null)},He=function(n){return n instanceof m&&(typeof n.nodeName!="string"||typeof n.textContent!="string"||typeof n.removeChild!="function"||!(n.attributes instanceof _)||typeof n.removeAttribute!="function"||typeof n.setAttribute!="function"||typeof n.namespaceURI!="string"||typeof n.insertBefore!="function"||typeof n.hasChildNodes!="function")},Ls=function(n){return typeof c=="function"&&n instanceof c};function X(h,n,l){Vt(h,p=>{p.call(t,n,l,$t)})}const Us=function(n){let l=null;if(X(D.beforeSanitizeElements,n,null),He(n))return Y(n),!0;const p=T(n.nodeName);if(X(D.uponSanitizeElement,n,{tagName:p,allowedTags:$}),Qt&&n.hasChildNodes()&&!Ls(n.firstElementChild)&&I(/<[/\w!]/g,n.innerHTML)&&I(/<[/\w!]/g,n.textContent)||n.nodeType===zt.progressingInstruction||Qt&&n.nodeType===zt.comment&&I(/<[/\w]/g,n.data))return Y(n),!0;if(!(At.tagCheck instanceof Function&&At.tagCheck(p))&&(!$[p]||Ft[p])){if(!Ft[p]&&zs(p)&&(v.tagNameCheck instanceof RegExp&&I(v.tagNameCheck,p)||v.tagNameCheck instanceof Function&&v.tagNameCheck(p)))return!1;if(Ie&&!q[p]){const y=pt(n)||n.parentNode,R=Zt(n)||n.childNodes;if(R&&y){const E=R.length;for(let L=E-1;L>=0;--L){const K=Te(R[L],!0);K.__removalCount=(n.__removalCount||0)+1,y.insertBefore(K,xe(n))}}}return Y(n),!0}return n instanceof u&&!mo(n)||(p==="noscript"||p==="noembed"||p==="noframes")&&I(/<\/no(script|embed|frames)/i,n.innerHTML)?(Y(n),!0):(Et&&n.nodeType===zt.text&&(l=n.textContent,Vt([Se,$e,Ce],y=>{l=Lt(l,y," ")}),n.textContent!==l&&(Nt(t.removed,{element:n.cloneNode()}),n.textContent=l)),X(D.afterSanitizeElements,n,null),!1)},Hs=function(n,l,p){if($s&&(l==="id"||l==="name")&&(p in e||p in fo))return!1;if(!(Re&&!Oe[l]&&I(oo,l))){if(!(Ts&&I(no,l))){if(!(At.attributeCheck instanceof Function&&At.attributeCheck(l,n))){if(!C[l]||Oe[l]){if(!(zs(n)&&(v.tagNameCheck instanceof RegExp&&I(v.tagNameCheck,n)||v.tagNameCheck instanceof Function&&v.tagNameCheck(n))&&(v.attributeNameCheck instanceof RegExp&&I(v.attributeNameCheck,l)||v.attributeNameCheck instanceof Function&&v.attributeNameCheck(l,n))||l==="is"&&v.allowCustomizedBuiltInElements&&(v.tagNameCheck instanceof RegExp&&I(v.tagNameCheck,p)||v.tagNameCheck instanceof Function&&v.tagNameCheck(p))))return!1}else if(!De[l]){if(!I(ws,Lt(p,vs,""))){if(!((l==="src"||l==="xlink:href"||l==="href")&&n!=="script"&&xi(p,"data:")===0&&Os[n])){if(!(xs&&!I(ro,Lt(p,vs,"")))){if(p)return!1}}}}}}}return!0},zs=function(n){return n!=="annotation-xml"&&_e(n,ao)},Fs=function(n){X(D.beforeSanitizeAttributes,n,null);const{attributes:l}=n;if(!l||He(n))return;const p={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:C,forceKeepAttr:void 0};let y=l.length;for(;y--;){const R=l[y],{name:E,namespaceURI:L,value:K}=R,Ct=T(E),ze=K;let O=E==="value"?ze:Si(ze);if(p.attrName=Ct,p.attrValue=O,p.keepAttr=!0,p.forceKeepAttr=void 0,X(D.uponSanitizeAttribute,n,p),O=p.attrValue,Cs&&(Ct==="id"||Ct==="name")&&(dt(E,n),O=lo+O),Qt&&I(/((--!?|])>)|<\/(style|title|textarea)/i,O)){dt(E,n);continue}if(Ct==="attributename"&&_e(O,"href")){dt(E,n);continue}if(p.forceKeepAttr)continue;if(!p.keepAttr){dt(E,n);continue}if(!Ss&&I(/\/>/i,O)){dt(E,n);continue}Et&&Vt([Se,$e,Ce],js=>{O=Lt(O,js," ")});const Bs=T(n.nodeName);if(!Hs(Bs,Ct,O)){dt(E,n);continue}if(A&&typeof S=="object"&&typeof S.getAttributeType=="function"&&!L)switch(S.getAttributeType(Bs,Ct)){case"TrustedHTML":{O=A.createHTML(O);break}case"TrustedScriptURL":{O=A.createScriptURL(O);break}}if(O!==ze)try{L?n.setAttributeNS(L,E,O):n.setAttribute(E,O),He(n)?Y(n):ls(t.removed)}catch{dt(E,n)}}X(D.afterSanitizeAttributes,n,null)},go=function h(n){let l=null;const p=Ns(n);for(X(D.beforeSanitizeShadowDOM,n,null);l=p.nextNode();)X(D.uponSanitizeShadowNode,l,null),Us(l),Fs(l),l.content instanceof r&&h(l.content);X(D.afterSanitizeShadowDOM,n,null)};return t.sanitize=function(h){let n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},l=null,p=null,y=null,R=null;if(Ne=!h,Ne&&(h="<!-->"),typeof h!="string"&&!Ls(h))if(typeof h.toString=="function"){if(h=h.toString(),typeof h!="string")throw Ut("dirty is not a string, aborting")}else throw Ut("toString is not a function");if(!t.isSupported)return h;if(ke||Ue(n),t.removed=[],typeof h=="string"&&(Bt=!1),Bt){if(h.nodeName){const K=T(h.nodeName);if(!$[K]||Ft[K])throw Ut("root node is forbidden and cannot be sanitized in-place")}}else if(h instanceof c)l=Ds("<!---->"),p=l.ownerDocument.importNode(h,!0),p.nodeType===zt.element&&p.nodeName==="BODY"||p.nodeName==="HTML"?l=p:l.appendChild(p);else{if(!Tt&&!Et&&!ut&&h.indexOf("<")===-1)return A&&ee?A.createHTML(h):h;if(l=Ds(h),!l)return Tt?null:ee?ht:""}l&&Pe&&Y(l.firstChild);const E=Ns(Bt?h:l);for(;y=E.nextNode();)Us(y),Fs(y),y.content instanceof r&&go(y.content);if(Bt)return h;if(Tt){if(te)for(R=eo.call(l.ownerDocument);l.firstChild;)R.appendChild(l.firstChild);else R=l;return(C.shadowroot||C.shadowrootmode)&&(R=io.call(s,R,!0)),R}let L=ut?l.outerHTML:l.innerHTML;return ut&&$["!doctype"]&&l.ownerDocument&&l.ownerDocument.doctype&&l.ownerDocument.doctype.name&&I(fs,l.ownerDocument.doctype.name)&&(L="<!DOCTYPE "+l.ownerDocument.doctype.name+`>
`+L),Et&&Vt([Se,$e,Ce],K=>{L=Lt(L,K," ")}),A&&ee?A.createHTML(L):L},t.setConfig=function(){let h=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};Ue(h),ke=!0},t.clearConfig=function(){$t=null,ke=!1},t.isValidAttribute=function(h,n,l){$t||Ue({});const p=T(h),y=T(n);return Hs(p,y,l)},t.addHook=function(h,n){typeof n=="function"&&Nt(D[h],n)},t.removeHook=function(h,n){if(n!==void 0){const l=Ei(D[h],n);return l===-1?void 0:Ti(D[h],l,1)[0]}return ls(D[h])},t.removeHooks=function(h){D[h]=[]},t.removeAllHooks=function(){D=gs()},t}var Fi=bs(),Bi=Object.defineProperty,ji=Object.getOwnPropertyDescriptor,W=(o,t,e,s)=>{for(var i=s>1?void 0:s?ji(t,e):t,r=o.length-1,a;r>=0;r--)(a=o[r])&&(i=(s?a(t,e,i):a(i))||i);return s&&i&&Bi(t,e,i),i};let z=class extends F{constructor(){super(...arguments),this.messages=[],this.primaryColor="#007bff",this.assistantIcon='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot h-4 w-4 text-primary"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>',this.userIcon='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user h-4 w-4 text-primary"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',this.typing=!1,this.typingText="Agent is typing...",this.showCallbackForm=!1,this.showSupportInfo=!1,this.error="",this.isFirst=!0,this.oldScrollHeight=0}firstUpdated(){this.scrollTop=this.scrollHeight}updated(o){(o.has("showSupportInfo")||o.has("showCallbackForm"))&&(this.scrollTop=this.scrollHeight),this.typing?(this.isFirst&&(this.oldScrollHeight=this.scrollHeight,this.isFirst=!1),this.scrollHeight<=this.oldScrollHeight+375&&(this.scrollTop=this.scrollHeight)):this.isFirst=!0}renderMarkdown(o){const t=Fi.sanitize(o);return ns(t.replace(/\n/g,"<br>"))}onFollowupClick(o){this.dispatchEvent(new CustomEvent("followup-selected",{detail:o,bubbles:!0,composed:!0}))}onSpecialClick(o){o==="Request Callback"&&(this.showCallbackForm=!this.showCallbackForm,this.showSupportInfo=!1),o==="Contact Customer"&&(this.showSupportInfo=!this.showSupportInfo,this.showCallbackForm=!1)}submitCallbackForm(o){o.preventDefault();const t=o.target,e={phone:t.elements.namedItem("phone").value,message:t.elements.namedItem("message").value};if(!/^[0-9+\-\s]{7,15}$/.test(e.phone)){this.error="Please enter a valid phone number.";return}this.dispatchEvent(new CustomEvent("callback-submitted",{detail:e,bubbles:!0,composed:!0})),this.showCallbackForm=!1}renderIcon(o){if(!o)return null;if(typeof o=="string"&&/<svg[\s\S]*?>/i.test(o)){const e=document.createElement("span");return e.style.color=this.primaryColor,e.innerHTML=o,g`${e}`}return g`<img src=${o} width="30"/>`}renderIconByRole(o){return["assistant","system"].includes(o)?this.renderIcon(this.assistantIcon):o==="user"?this.renderIcon(this.userIcon):null}clearError(){this.error&&(this.error="")}render(){const o=this.messages.some(t=>t.role==="assistant");return g`
      ${this.messages.map(t=>g`
        <div style="display:flex;gap:5px;align-items:center;margin-bottom: 12px; ${t.role==="user"?"flex-flow: row-reverse;":""}">
          <div class="message-icon">
            ${this.renderIconByRole(t.role)}
          </div>
          <div
          class="message ${t.role}"
          style="${t.role==="user"?`background:${this.primaryColor}`:""}">
            ${this.renderMarkdown(t.content)}

            ${t.role==="assistant"?g`
                    <div class="followups">
                      ${(t.followups??[]).map(e=>g`
                        <button
                          class="followup-btn"
                          @click=${()=>this.onFollowupClick(e)}>
                          ${e}
                        </button>
                      `)}
                    </div>
                  `:""}
          </div>
        </div>
      `)}

      ${this.typing?g`<div class="typing">${this.typingText}</div>`:""}

      ${o?g`
            <div class="followups">
              <button
                class="followup-btn"
                style="background:#e7f1ff"
                @click=${()=>this.onSpecialClick("Request Callback")}>
                Request Callback
              </button>
              <button
                class="followup-btn"
                style="background:#e7f1ff"
                @click=${()=>this.onSpecialClick("Contact Customer")}>
                Contact Customer
              </button>
            </div>
          `:""}

      ${this.showCallbackForm?g`
            <form class="callback-form" @submit=${this.submitCallbackForm}>
              <h3 class="form-title">Request a Callback</h3>

              <div style="display:flex; flex-direction:column; width:100%;">
                <label>
                  Phone Number <span class="red">*</span>
                </label>
                <input
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    required
                    @input=${this.clearError}
                  />
                  ${this.error?g`<div class="error">${this.error}</div>`:""}
              </div>
              

              <div style="display:flex; flex-direction:column;width:100%;">
                <label>
                  Message <span class="red">*</span>
                </label>
                <textarea
                    name="message"
                    required
                    placeholder="How can we help you?"
                  ></textarea>
              </div>

              
              <button type="submit">Request Callback</button>
            </form>
          `:""}

      ${this.showSupportInfo?g`
          <div class="callback-form">
            <p style="font-size:18px; margin:0">
              📧 <strong>Email:</strong>
              <a href="mailto:support@company.com">support@company.com</a>
            </p>
            <p style="font-size:18px; margin:0">
              📞 <strong>Phone:</strong>
              <a href="tel:+1234567890">+1 234 567 890</a>
            </p>
          </div>
    `:""}

    `}};z.styles=it`
    :host {
      display: block;
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: #f8f9fa;
    }

    /* ---------------- MESSAGES ---------------- */

    .message {
      display:flex;
      flex-direction:column;
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 0.95rem;
      line-height: 1.4;
      word-wrap: break-word;
    }

    .user {
      margin-left: auto;
      background: var(--msg-user-bg, #007bff);
      color: #fff;
      border-bottom-right-radius: 2px;
    }

    .assistant {
      margin-right: auto;
      background: #fff;
      color: #333;
      border: 1px solid #e9ecef;
      border-bottom-left-radius: 2px;
    }

    .typing {
      font-style: italic;
      color: #666;
      font-size: 0.8rem;
      margin-top: 6px;
      margin-bottom: 20px;
    }

    .message p { margin: 0 0 8px; }
    .message p:last-child { margin: 0; }

    .message code {
      background: rgba(0,0,0,0.08);
      padding: 2px 4px;
      border-radius: 4px;
    }

    .message pre {
      background: #333;
      color: #fff;
      padding: 10px;
      border-radius: 8px;
      overflow-x: auto;
    }

    /* ---------------- FOLLOWUPS ---------------- */

    .followups {
      margin-top: 8px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .followup-btn {
      background: #f1f3f5;
      border: 1px solid #dee2e6;
      border-radius: 16px;
      padding: 4px 12px;
      font-size: 14px;
      cursor: pointer;
      color: inherit;
      text-align: left;
      line-height: inherit;
    }

    .followup-btn:hover {
      background: #e9ecef;
    }

    /* ---------------- CALLBACK FORM ---------------- */

    .callback-form {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;

      margin-top: 14px;
      padding: 16px;

      background: #e9f7ef;
      border: 1px solid #c3e6cb;
      border-radius: 10px;
      font-family:inherit;
    }

    .callback-form .form-title {
      margin: 0 0 6px;
      font-size: 1.05rem;
      font-weight: 600;
      color: #155724;
    }

    .callback-form label {
      width: 100%;
      max-width: 320px;
      gap: 4px;
      font-weight: 500;
      color: #155724;
      font-family:inherit;
    }

    .callback-form input,
    .callback-form textarea {
      padding: 10px 12px;
      border-radius: 6px;
      border: 1px solid #ced4da;
      background: #fff;
      outline: none;
      font-family:inherit;
    }

    .callback-form input:focus,
    .callback-form textarea:focus {
      border-color: #28a745;
      box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.15);
    }

    .callback-form textarea {
      resize: vertical;
      min-height: 80px;
    }

    .callback-form button {
      width: 100%;
      max-width: 320px;
      height: 30px;

      background: #28a745;
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;

      border: none;
      border-radius: 6px;
      cursor: pointer;

      transition: background 0.15s ease, transform 0.05s ease;
    }

    .callback-form button:hover {
      background: #218838;
    }

    .callback-form button:active {
      transform: translateY(1px);
    }
    .error {
          color: #dc3545;
          font-size: 0.8rem;
          margin-top: 5px;
    }
    .message-icon{
      line-height: 0;
      background: #00a35a1a;
      padding: 8px;
      border-radius: 8px;
    }
    .red{
      color:#dc3545;
    }
  `,W([b({type:Array})],z.prototype,"messages",2),W([b()],z.prototype,"primaryColor",2),W([b()],z.prototype,"assistantIcon",2),W([b()],z.prototype,"userIcon",2),W([b({type:Boolean})],z.prototype,"typing",2),W([b()],z.prototype,"typingText",2),W([b({type:Boolean})],z.prototype,"showCallbackForm",2),W([b({type:Boolean})],z.prototype,"showSupportInfo",2),W([k()],z.prototype,"error",2),z=W([ct("chat-message-list")],z);var Wi=Object.defineProperty,Gi=Object.getOwnPropertyDescriptor,Jt=(o,t,e,s)=>{for(var i=s>1?void 0:s?Gi(t,e):t,r=o.length-1,a;r>=0;r--)(a=o[r])&&(i=(s?a(t,e,i):a(i))||i);return s&&i&&Wi(t,e,i),i};let bt=class extends F{constructor(){super(...arguments),this.disabled=!1,this.primaryColor="#007bff"}handleKey(o){o.key==="Enter"&&!o.shiftKey&&(o.preventDefault(),this.send())}send(){const o=this.input.value.trim();!o||this.disabled||(this.dispatchEvent(new CustomEvent("send",{detail:o})),this.input.value="")}render(){return g`
      <textarea 
        placeholder="Type a message..." 
        ?disabled=${this.disabled}
        @keydown=${this.handleKey}
      ></textarea>
      <button @click=${this.send} ?disabled=${this.disabled}>
        <svg fill="${this.primaryColor}" width="24" height="24" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    `}};bt.styles=it`
    :host {
      display: flex;
      padding: 12px;
      background: white;
      border-top: 1px solid #eee;
    }
    textarea {
      flex: 1;
      border: 1px solid #ddd;
      border-radius: 20px;
      padding: 10px 15px;
      resize: none;
      font-family: inherit;
      outline: none;
    }
    textarea:focus { border-color: #aaa; }
    button {
      margin-left: 10px;
      background: none;
      border: none;
      cursor: pointer;
      color: #007bff;
      padding: 0 10px;
    }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
  `,Jt([ui("textarea")],bt.prototype,"input",2),Jt([b({type:Boolean})],bt.prototype,"disabled",2),Jt([b()],bt.prototype,"primaryColor",2),bt=Jt([ct("chat-input")],bt);var qi=Object.defineProperty,Yi=Object.getOwnPropertyDescriptor,yt=(o,t,e,s)=>{for(var i=s>1?void 0:s?Yi(t,e):t,r=o.length-1,a;r>=0;r--)(a=o[r])&&(i=(s?a(t,e,i):a(i))||i);return s&&i&&qi(t,e,i),i};let tt=class extends F{constructor(){super(...arguments),this.primaryColor="#007bff",this.loading=!1,this.email="",this.name="",this.error=""}handleSubmit(o){if(o.preventDefault(),!this.email||!this.email.includes("@")){this.error="Please enter a valid business email address.";return}this.error="",this.dispatchEvent(new CustomEvent("submit-email",{detail:{email:this.email,name:this.name},bubbles:!0,composed:!0}))}render(){return g`
            <form @submit=${this.handleSubmit} style="--pc-primary: ${this.primaryColor}">
                <h3>Welcome! 👋</h3>
                <p>Please provide your email to connect with Agent Kim.</p>
                
                <div class="form-group">
                    <label for="name">Name (Optional)</label>
                    <input 
                        type="text" 
                        id="name" 
                        .value=${this.name} 
                        @input=${o=>this.name=o.target.value}
                        placeholder="John Doe"
                    >
                </div>

                <div class="form-group">
                    <label for="email">Business Email *</label>
                    <input 
                        type="email" 
                        id="email" 
                        required
                        .value=${this.email} 
                        @input=${o=>this.email=o.target.value}
                        placeholder="john@company.com"
                    >
                    ${this.error?g`<div class="error">${this.error}</div>`:""}
                </div>

                <button type="submit" ?disabled=${this.loading}>
                    ${this.loading?"Connecting...":"Start Chat"}
                </button>
            </form>
        `}};tt.styles=it`
        :host {
            background: rgb(255, 255, 255);
            display: block;
            padding: 20px;
            height: 100vh;
            font-family: inherit;
        }
        h3 {
            margin-top: 0;
            color: #333;
        }
        p {
            font-size: 0.9rem;
            color: #666;
            margin-bottom: 20px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-size: 0.9rem;
            font-weight: 500;
        }
        input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 6px;
            box-sizing: border-box;
            font-size: 1rem;
        }
        input:focus {
            outline: none;
            border-color: var(--pc-primary, #007bff);
        }
        button {
            width: 100%;
            padding: 10px;
            background: var(--pc-primary, #007bff);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 1rem;
            cursor: pointer;
            font-weight: 500;
            transition: opacity 0.2s;
        }
        button:hover {
            opacity: 0.9;
        }
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .error {
            color: #dc3545;
            font-size: 0.8rem;
            margin-top: 5px;
        }
    `,yt([b()],tt.prototype,"primaryColor",2),yt([b({type:Boolean})],tt.prototype,"loading",2),yt([k()],tt.prototype,"email",2),yt([k()],tt.prototype,"name",2),yt([k()],tt.prototype,"error",2),tt=yt([ct("chat-email-form")],tt);var Vi=Object.defineProperty,Xi=Object.getOwnPropertyDescriptor,_t=(o,t,e,s)=>{for(var i=s>1?void 0:s?Xi(t,e):t,r=o.length-1,a;r>=0;r--)(a=o[r])&&(i=(s?a(t,e,i):a(i))||i);return s&&i&&Vi(t,e,i),i};let et=class extends F{constructor(){super(...arguments),this.icon="",this.color="#007bff",this.launcherText="Need assistance?",this.showPopup=!1,this.popupText="Need assistance?"}render(){return g`
            <div class="bubble-container" @click=${()=>this.dispatchEvent(new CustomEvent("toggle"))}>
                <div class="launcher" style="background: ${this.color}">
                    ${ns(this.icon)}
                    ${this.launcherText}
                </div>
            </div>
        `}};et.styles=it`
        :host {
            display: block;
            position: relative;
            cursor: pointer;
        }
        .bubble-container {
            display: flex;
            align-items: center;
            right: 10px;
            position: fixed;
            bottom: 20px;
        }
        .popup-message {
            background: white;
            color: #333;
            padding: 10px 15px;
            border-radius: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            margin-right: 15px;
            white-space: nowrap;
            font-size: 0.9rem;
            animation: fadeIn 0.3s ease-out;
            position: relative;
        }
        .popup-message::after {
            content: '';
            position: absolute;
            right: -6px;
            top: 50%;
            transform: translateY(-50%);
            border-style: solid;
            border-width: 6px 0 6px 6px;
            border-color: transparent transparent transparent white;
        }
        .launcher {
            border-radius: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap:10px;
            font-weight:600;
            padding:10px 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: transform 0.2s;
            color: white;
            min-width:188px;
            height:25px;
        }
        .launcher:hover {
            transform: scale(1.05);
        }
            .launcher svg {
    width: 24px;
    height: 24px;
}
        @keyframes fadeIn {
            from { opacity: 0; transform: translateX(10px); }
            to { opacity: 1; transform: translateX(0); }
        }
    `,_t([b()],et.prototype,"icon",2),_t([b()],et.prototype,"color",2),_t([b()],et.prototype,"launcherText",2),_t([b({type:Boolean})],et.prototype,"showPopup",2),_t([b()],et.prototype,"popupText",2),et=_t([ct("chat-bubble")],et);var Ki=Object.defineProperty,Ji=Object.getOwnPropertyDescriptor,vt=(o,t,e,s)=>{for(var i=s>1?void 0:s?Ji(t,e):t,r=o.length-1,a;r>=0;r--)(a=o[r])&&(i=(s?a(t,e,i):a(i))||i);return s&&i&&Ki(t,e,i),i};let st=class extends F{constructor(){super(...arguments),this.primaryColor="#007bff",this.supportPhone="1-800-HYDROLEC",this.mode="menu",this.phone="",this.status="idle"}handleCallbackRequest(){this.phone&&(this.status="submitting",this.dispatchEvent(new CustomEvent("callback-request",{detail:{phone:this.phone},bubbles:!0,composed:!0})))}setStatus(o){this.status=o,o==="success"&&setTimeout(()=>{this.mode="menu",this.status="idle"},3e3)}render(){return this.mode==="menu"?g`
                <h4>Follow-up Options</h4>
                <div class="buttons">
                    <button @click=${()=>this.mode="callback"}>Request Callback</button>
                    <button @click=${()=>alert(`Call us at ${this.supportPhone}`)}>Call Support</button>
                </div>
            `:g`
            <div class="callback-form" style="--pc-primary: ${this.primaryColor}">
                <h4>Request Callback</h4>
                ${this.status==="success"?g`<div class="success">Request sent! We'll call you shortly.</div>`:this.status==="error"?g`<div class="error">Failed to send request.</div>`:g`
                    <p style="font-size:0.8rem; margin:0 0 5px 0;">Enter your number:</p>
                    <input 
                        type="tel" 
                        .value=${this.phone} 
                        @input=${o=>this.phone=o.target.value}
                        placeholder="+1 (555) ..."
                    >
                    <div class="buttons">
                        <button @click=${()=>this.mode="menu"}>Cancel</button>
                        <button class="submit-btn" @click=${this.handleCallbackRequest} ?disabled=${this.status==="submitting"}>
                            ${this.status==="submitting"?"Sending...":"Submit"}
                        </button>
                    </div>
                `}
            </div>
        `}};st.styles=it`
        :host {
            display: block;
            padding: 15px;
            border-top: 1px solid #eee;
        }
        h4 {
            margin: 0 0 10px 0;
            font-size: 0.9rem;
            color: #333;
        }
        .buttons {
            display: flex;
            gap: 10px;
        }
        button {
            flex: 1;
            padding: 8px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.85rem;
            transition: all 0.2s;
        }
        button:hover {
            background: #f8f9fa;
            border-color: #ccc;
        }
        .callback-form {
            margin-top: 10px;
            animation: slideDown 0.2s;
        }
        input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-bottom: 5px;
            box-sizing: border-box;
        }
        .submit-btn {
            width: 100%;
            background: var(--pc-primary, #007bff);
            color: white;
            border: none;
        }
        .submit-btn:hover {
             background: var(--pc-primary-dark, #0056b3);
        }
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .success { color: green; font-size: 0.9rem; }
        .error { color: #dc3545; font-size: 0.9rem; }
    `,vt([b()],st.prototype,"primaryColor",2),vt([b()],st.prototype,"supportPhone",2),vt([k()],st.prototype,"mode",2),vt([k()],st.prototype,"phone",2),vt([k()],st.prototype,"status",2),st=vt([ct("chat-support-options")],st);var Zi=Object.defineProperty,Qi=Object.getOwnPropertyDescriptor,G=(o,t,e,s)=>{for(var i=s>1?void 0:s?Qi(t,e):t,r=o.length-1,a;r>=0;r--)(a=o[r])&&(i=(s?a(t,e,i):a(i))||i);return s&&i&&Zi(t,e,i),i};x.PristineChat=class extends F{constructor(){super(...arguments),this.config={},this._config=is,this.isOpen=!1,this.messages=[],this.isTyping=!1,this.visitor=null,this.showAutoPopup=!1,this.view="chat",this.loading=!1}async firstUpdated(){super.connectedCallback(),this.initialize()}async initialize(){this._config=os(is,{},this.config),this.api=new fi(this._config),console.log("Initial Config",this.config);try{const t=await this.api.fetchConfig();this._config=os(this._config,t,this.config);const e=localStorage.getItem("lastConversationTime");if(e){const s=Number(e),i=Date.now();let r=this._config.sessionTimeout?this._config.sessionTimeout*60*60*1e3:60*60*1e3;i-s>r&&(localStorage.getItem("pristine-chat-visitor")&&await this.handleReset(!1),localStorage.clear())}}catch(t){console.error("Failed to fetch remote config",t)}this.loadState(),this._config.backgroundColor&&this.style.setProperty("--pc-bg",this._config.backgroundColor),this._config.textColor&&this.style.setProperty("--pc-text",this._config.textColor),this._config.autoOpenDelay&&this._config.autoOpenDelay>0?setTimeout(()=>{this.isOpen||this.open()},this._config.autoOpenDelay):!this.isOpen&&!localStorage.getItem("pristine-chat-interacted")&&setTimeout(()=>{this.isOpen||(this.showAutoPopup=!0)},4e3)}async loadState(){localStorage.getItem("pristine-chat-history");const t=localStorage.getItem("pristine-chat-visitor");if(t)try{if(this.visitor=JSON.parse(t),this.visitor&&this.visitor.id){const e=localStorage.getItem("pristine-chat-history");e&&(this.messages=JSON.parse(e)),this.isOpen=!0}}catch(e){console.error(e)}this.messages.length===0&&this._config.welcomeMessage&&(this.messages=[{role:"assistant",content:this._config.welcomeMessage}])}saveState(){localStorage.setItem("pristine-chat-history",JSON.stringify(this.messages)),localStorage.setItem("pristine-chat-interacted","true"),this.visitor&&localStorage.setItem("pristine-chat-visitor",JSON.stringify(this.visitor))}toggle(){this.isOpen?this.close():this.open()}open(){this.isOpen=!0,this.showAutoPopup=!1,localStorage.setItem("pristine-chat-interacted","true")}close(){this.isOpen=!1}async handleEmailSubmit(t){const{email:e,name:s}=t.detail;try{this.loading=!0;const i=await fetch(`${this._config.apiBaseUrl}/visitor`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,name:s})});if(!i.ok)throw new Error("Failed to register visitor");const r=await i.json();this.visitor=r,this.saveState(),this.loading=!1}catch(i){console.error("Visitor registration failed:",i),alert("Visitor registration failed"),this.loading=!1}}async handleCallbackRequest(t){var r;if(console.log("Enter in handleCallbackRequest"),!this.visitor)return;const{name:e,phone:s,message:i}=t.detail;try{const a=await fetch(`${this._config.apiBaseUrl}/visitor/callback`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({visitorId:(r=this.visitor)==null?void 0:r.id,name:e,phone:s,message:i})});if(!a.ok)throw new Error("Failed to register visitor");const c=await a.json();console.log("res",c);const u=this.messages.length-1,f=[...this.messages];f[u]={role:"assistant",content:(c==null?void 0:c.message)||"Thanks your call back request is registered our team will call you. Thanks"},this.messages=f}catch(a){console.error("Callback request failed:",a),this.messages=[...this.messages,{role:"system",content:"Error: Please try again later"}]}}async handleSend(t){var r,a;const e=t.detail;if(!e)return;localStorage.setItem("lastConversationTime",Date.now().toString());const s=(r=this.visitor)==null?void 0:r.id,i=(a=this.visitor)==null?void 0:a.email;this.api.storeConversationMessage(s,"user",e),this.messages=[...this.messages,{role:"user",content:e}],this.saveState(),this.isTyping=!0;try{await this.streamResponse(e,i,s)}catch(c){console.error(c),this.messages=[...this.messages,{role:"system",content:"Failed to send message."}]}finally{this.isTyping=!1,this.saveState()}}async streamResponse(t,e,s){const i=await fetch(`${this._config.apiBaseUrl}/chat/message`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:t,email:e,visitorId:s})});if(!i.body)throw new Error("No response body");const r=i.body.getReader(),a=new TextDecoder;let c="";const u="followup_question";let f="message";this.messages.push({role:"assistant",content:""});const _=this.messages.length-1;let m=!1;const U=/【\d+:\d+†source】/g;for(;!m;){const{done:N,value:Te}=await r.read();if(N)break;const xe=a.decode(Te,{stream:!0}).split(`
`);for(const Zt of xe){if(!Zt.startsWith("data: "))continue;const pt=Zt.slice(6).trim();if(pt==="[DONE]"){m=!0;break}try{const A=JSON.parse(pt);if(A.content){const ht=A.content.replace(U,"");if(c+=ht,f==="message"){const wt=[...this.messages];wt[_]={role:"assistant",content:c},this.messages=wt}f==="message"&&c.includes(u)&&(f="followup",this.messages[_].content=this.messages[_].content.replace(u,""))}}catch(A){console.warn("Failed to parse stream chunk:",A)}}}const{followups:S}=this.normalizeAssistantResponse(c);S!=null&&S.length&&(this.messages[_].followups=S);try{await this.api.storeConversationMessage(s,"assistant",c)}catch(N){console.error("Failed to store conversation message:",N),this.messages=[...this.messages,{role:"system",content:"Internal server error"}]}this.saveState()}normalizeAssistantResponse(t){const e=/followups?_question/i,[s,i]=t.split(e),r=s.trim(),a=i?i.split(`
`).map(c=>c.replace(/^[\-\•\d\.\)]*/,"").trim()).filter(Boolean):[];return{message:r,followups:a}}async handleReset(t=!0){var s;if(t&&!confirm("End conversation? You cannot resume this chat."))return;const e=(s=this.visitor)==null?void 0:s.id;try{if(e){const i=await this.api.resetConversation(e);if(i.status){localStorage.clear();let r=document.querySelector("pristine-chat");r&&r.remove(),document.querySelector("pristine-chat")||(r=document.createElement("pristine-chat"),document.body.appendChild(r)),r&&r.open(),r.config=this.config}else alert(i==null?void 0:i.message)}}catch(i){console.error("Reset failed",i),t&&(this.messages=[...this.messages,{role:"system",content:"Error: Failed to reset chat. Try again later"}])}}handleFollowup(t){const e=t.detail;e&&this.handleSend({detail:e})}render(){const{primaryColor:t,position:e,launcherIcon:s,headerTitle:i,headerSubtitle:r,width:a,launcherText:c}=this._config;return g`
        <div class="chat-container ${this.isOpen?"open":"closed"} pos-${e}"
            style="--pc-primary: ${t}; ${a?`width: ${a}px;`:""}">
            
            <chat-header 
                title="${i}" 
                subtitle="${r}"
                @close=${this.close}
                @reset=${this.handleReset}
                style="background: ${t}"
            >
                <button slot="actions" 
                        class="icon-btn" 
                        title="Support Options"
                        style="background:none; border:none; color:white; cursor:pointer;"
                        @click=${()=>this.view=this.view==="chat"?"support":"chat"}>
                    ${this.view==="chat"?"📞":"💬"}
                </button>
            </chat-header>
            
            ${this.visitor?this.view==="support"?g`
                <chat-support-options
                    primaryColor="${t}"
                    @callback-request=${this.handleCallbackRequest}
                ></chat-support-options>
            `:g`
                <chat-message-list 
                    .messages=${this.messages} 
                    .typing=${this.isTyping}
                    typingText="${this._config.typingText}"
                    primaryColor="${t}"
                    @followup-selected=${this.handleFollowup}
                    @callback-submitted=${this.handleCallbackRequest}
                ></chat-message-list>
                <chat-input @send=${this.handleSend}
                primaryColor="${t}"></chat-input>
            `:g`
                <chat-email-form 
                    primaryColor="${t}"
                    .loading="${this.loading}"
                    @submit-email=${this.handleEmailSubmit}
                ></chat-email-form>
            `}
        </div>

        <div class="pos-${e}" style="position:absolute;">
            <chat-bubble
                icon="${s}"
                color="${t}"
                launcherText=${c}
                .showPopup=${this.showAutoPopup}
                @toggle=${this.toggle}
            ></chat-bubble>
        </div>
        `}},x.PristineChat.styles=di,G([b({type:Object})],x.PristineChat.prototype,"config",2),G([k()],x.PristineChat.prototype,"_config",2),G([k()],x.PristineChat.prototype,"isOpen",2),G([k()],x.PristineChat.prototype,"messages",2),G([k()],x.PristineChat.prototype,"isTyping",2),G([k()],x.PristineChat.prototype,"visitor",2),G([k()],x.PristineChat.prototype,"showAutoPopup",2),G([k()],x.PristineChat.prototype,"view",2),G([k()],x.PristineChat.prototype,"loading",2),x.PristineChat=G([ct("pristine-chat")],x.PristineChat),window.PristineChat={init:o=>{let t=document.querySelector("pristine-chat");t||(t=document.createElement("pristine-chat"),document.body.appendChild(t)),t.config=o},open:()=>{const o=document.querySelector("pristine-chat");o&&o.open()},close:()=>{const o=document.querySelector("pristine-chat");o&&o.close()},destroy:()=>{const o=document.querySelector("pristine-chat");o&&o.remove()}},Object.defineProperty(x,Symbol.toStringTag,{value:"Module"})});
