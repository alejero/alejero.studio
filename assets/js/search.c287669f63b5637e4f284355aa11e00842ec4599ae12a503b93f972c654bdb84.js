/**
 * Fuse.js v7.0.0 - Lightweight fuzzy-search (http://fusejs.io)
 *
 * Copyright (c) 2023 Kiro Risk (http://kiro.me)
 * All Rights Reserved. Apache Software License 2.0
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */
var e,t;e=this,t=function(){"use strict";function e(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function t(t){for(var n=1;n<arguments.length;n++){var r=null!=arguments[n]?arguments[n]:{};n%2?e(Object(r),!0).forEach((function(e){a(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):e(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}function n(e){return n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},n(e)}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,h(r.key),r)}}function o(e,t,n){return t&&i(e.prototype,t),n&&i(e,n),Object.defineProperty(e,"prototype",{writable:!1}),e}function a(e,t,n){return(t=h(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function c(e){return function(e){if(Array.isArray(e))return s(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||function(e,t){if(e){if("string"==typeof e)return s(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?s(e,t):void 0}}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function s(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}function h(e){var t=function(e,t){if("object"!=typeof e||null===e)return e;var n=e[Symbol.toPrimitive];if(void 0!==n){var r=n.call(e,t||"default");if("object"!=typeof r)return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(e,"string");return"symbol"==typeof t?t:String(t)}function u(e){return Array.isArray?Array.isArray(e):"[object Array]"===m(e)}var l=1/0;function d(e){return null==e?"":function(e){if("string"==typeof e)return e;var t=e+"";return"0"==t&&1/e==-l?"-0":t}(e)}function f(e){return"string"==typeof e}function v(e){return"number"==typeof e}function g(e){return!0===e||!1===e||function(e){return function(e){return"object"===n(e)}(e)&&null!==e}(e)&&"[object Boolean]"==m(e)}function y(e){return null!=e}function p(e){return!e.trim().length}function m(e){return null==e?void 0===e?"[object Undefined]":"[object Null]":Object.prototype.toString.call(e)}var b=function(e){return"Missing ".concat(e," property in key")},k=function(e){return"Property 'weight' in key '".concat(e,"' must be a positive integer")},M=Object.prototype.hasOwnProperty,w=function(){function e(t){var n=this;r(this,e),this._keys=[],this._keyMap={};var i=0;t.forEach((function(e){var t=x(e);n._keys.push(t),n._keyMap[t.id]=t,i+=t.weight})),this._keys.forEach((function(e){e.weight/=i}))}return o(e,[{key:"get",value:function(e){return this._keyMap[e]}},{key:"keys",value:function(){return this._keys}},{key:"toJSON",value:function(){return JSON.stringify(this._keys)}}]),e}();function x(e){var t=null,n=null,r=null,i=1,o=null;if(f(e)||u(e))r=e,t=L(e),n=S(e);else{if(!M.call(e,"name"))throw new Error(b("name"));var a=e.name;if(r=a,M.call(e,"weight")&&(i=e.weight)<=0)throw new Error(k(a));t=L(a),n=S(a),o=e.getFn}return{path:t,id:n,weight:i,src:r,getFn:o}}function L(e){return u(e)?e:e.split(".")}function S(e){return u(e)?e.join("."):e}var _={useExtendedSearch:!1,getFn:function(e,t){var n=[],r=!1;return function e(t,i,o){if(y(t))if(i[o]){var a=t[i[o]];if(!y(a))return;if(o===i.length-1&&(f(a)||v(a)||g(a)))n.push(d(a));else if(u(a)){r=!0;for(var c=0,s=a.length;c<s;c+=1)e(a[c],i,o+1)}else i.length&&e(a,i,o+1)}else n.push(t)}(e,f(t)?t.split("."):t,0),r?n:n[0]},ignoreLocation:!1,ignoreFieldNorm:!1,fieldNormWeight:1},O=t(t(t(t({},{isCaseSensitive:!1,includeScore:!1,keys:[],shouldSort:!0,sortFn:function(e,t){return e.score===t.score?e.idx<t.idx?-1:1:e.score<t.score?-1:1}}),{includeMatches:!1,findAllMatches:!1,minMatchCharLength:1}),{location:0,threshold:.6,distance:100}),_),j=/[^ ]+/g,A=function(){function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=t.getFn,i=void 0===n?O.getFn:n,o=t.fieldNormWeight,a=void 0===o?O.fieldNormWeight:o;r(this,e),this.norm=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:3,n=new Map,r=Math.pow(10,t);return{get:function(t){var i=t.match(j).length;if(n.has(i))return n.get(i);var o=1/Math.pow(i,.5*e),a=parseFloat(Math.round(o*r)/r);return n.set(i,a),a},clear:function(){n.clear()}}}(a,3),this.getFn=i,this.isCreated=!1,this.setIndexRecords()}return o(e,[{key:"setSources",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];this.docs=e}},{key:"setIndexRecords",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];this.records=e}},{key:"setKeys",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];this.keys=t,this._keysMap={},t.forEach((function(t,n){e._keysMap[t.id]=n}))}},{key:"create",value:function(){var e=this;!this.isCreated&&this.docs.length&&(this.isCreated=!0,f(this.docs[0])?this.docs.forEach((function(t,n){e._addString(t,n)})):this.docs.forEach((function(t,n){e._addObject(t,n)})),this.norm.clear())}},{key:"add",value:function(e){var t=this.size();f(e)?this._addString(e,t):this._addObject(e,t)}},{key:"removeAt",value:function(e){this.records.splice(e,1);for(var t=e,n=this.size();t<n;t+=1)this.records[t].i-=1}},{key:"getValueForItemAtKeyId",value:function(e,t){return e[this._keysMap[t]]}},{key:"size",value:function(){return this.records.length}},{key:"_addString",value:function(e,t){if(y(e)&&!p(e)){var n={v:e,i:t,n:this.norm.get(e)};this.records.push(n)}}},{key:"_addObject",value:function(e,t){var n=this,r={i:t,$:{}};this.keys.forEach((function(t,i){var o=t.getFn?t.getFn(e):n.getFn(e,t.path);if(y(o))if(u(o)){for(var a=[],c=[{nestedArrIndex:-1,value:o}];c.length;){var s=c.pop(),h=s.nestedArrIndex,l=s.value;if(y(l))if(f(l)&&!p(l)){var d={v:l,i:h,n:n.norm.get(l)};a.push(d)}else u(l)&&l.forEach((function(e,t){c.push({nestedArrIndex:t,value:e})}))}r.$[i]=a}else if(f(o)&&!p(o)){var v={v:o,n:n.norm.get(o)};r.$[i]=v}})),this.records.push(r)}},{key:"toJSON",value:function(){return{keys:this.keys,records:this.records}}}]),e}();function E(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},r=n.getFn,i=void 0===r?O.getFn:r,o=n.fieldNormWeight,a=void 0===o?O.fieldNormWeight:o,c=new A({getFn:i,fieldNormWeight:a});return c.setKeys(e.map(x)),c.setSources(t),c.create(),c}function I(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=t.errors,r=void 0===n?0:n,i=t.currentLocation,o=void 0===i?0:i,a=t.expectedLocation,c=void 0===a?0:a,s=t.distance,h=void 0===s?O.distance:s,u=t.ignoreLocation,l=void 0===u?O.ignoreLocation:u,d=r/e.length;if(l)return d;var f=Math.abs(c-o);return h?d+f/h:f?1:d}var F=32;function C(e,t,n){var r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{},i=r.location,o=void 0===i?O.location:i,a=r.distance,c=void 0===a?O.distance:a,s=r.threshold,h=void 0===s?O.threshold:s,u=r.findAllMatches,l=void 0===u?O.findAllMatches:u,d=r.minMatchCharLength,f=void 0===d?O.minMatchCharLength:d,v=r.includeMatches,g=void 0===v?O.includeMatches:v,y=r.ignoreLocation,p=void 0===y?O.ignoreLocation:y;if(t.length>F)throw new Error("Pattern length exceeds max of ".concat(F,"."));for(var m,b=t.length,k=e.length,M=Math.max(0,Math.min(o,k)),w=h,x=M,L=f>1||g,S=L?Array(k):[];(m=e.indexOf(t,x))>-1;){var _=I(t,{currentLocation:m,expectedLocation:M,distance:c,ignoreLocation:p});if(w=Math.min(_,w),x=m+b,L)for(var j=0;j<b;)S[m+j]=1,j+=1}x=-1;for(var A=[],E=1,C=b+k,N=1<<b-1,P=0;P<b;P+=1){for(var W=0,T=C;W<T;)I(t,{errors:P,currentLocation:M+T,expectedLocation:M,distance:c,ignoreLocation:p})<=w?W=T:C=T,T=Math.floor((C-W)/2+W);C=T;var $=Math.max(1,M-T+1),D=l?k:Math.min(M+T,k)+b,K=Array(D+2);K[D+1]=(1<<P)-1;for(var z=D;z>=$;z-=1){var J=z-1,R=n[e.charAt(J)];if(L&&(S[J]=+!!R),K[z]=(K[z+1]<<1|1)&R,P&&(K[z]|=(A[z+1]|A[z])<<1|1|A[z+1]),K[z]&N&&(E=I(t,{errors:P,currentLocation:J,expectedLocation:M,distance:c,ignoreLocation:p}))<=w){if(w=E,(x=J)<=M)break;$=Math.max(1,2*M-x)}}if(I(t,{errors:P+1,currentLocation:M,expectedLocation:M,distance:c,ignoreLocation:p})>w)break;A=K}var U={isMatch:x>=0,score:Math.max(.001,E)};if(L){var B=function(){for(var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:O.minMatchCharLength,n=[],r=-1,i=-1,o=0,a=e.length;o<a;o+=1){var c=e[o];c&&-1===r?r=o:c||-1===r||((i=o-1)-r+1>=t&&n.push([r,i]),r=-1)}return e[o-1]&&o-r>=t&&n.push([r,o-1]),n}(S,f);B.length?g&&(U.indices=B):U.isMatch=!1}return U}function N(e){for(var t={},n=0,r=e.length;n<r;n+=1){var i=e.charAt(n);t[i]=(t[i]||0)|1<<r-n-1}return t}var P=function(){function e(t){var n=this,i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},o=i.location,a=void 0===o?O.location:o,c=i.threshold,s=void 0===c?O.threshold:c,h=i.distance,u=void 0===h?O.distance:h,l=i.includeMatches,d=void 0===l?O.includeMatches:l,f=i.findAllMatches,v=void 0===f?O.findAllMatches:f,g=i.minMatchCharLength,y=void 0===g?O.minMatchCharLength:g,p=i.isCaseSensitive,m=void 0===p?O.isCaseSensitive:p,b=i.ignoreLocation,k=void 0===b?O.ignoreLocation:b;if(r(this,e),this.options={location:a,threshold:s,distance:u,includeMatches:d,findAllMatches:v,minMatchCharLength:y,isCaseSensitive:m,ignoreLocation:k},this.pattern=m?t:t.toLowerCase(),this.chunks=[],this.pattern.length){var M=function(e,t){n.chunks.push({pattern:e,alphabet:N(e),startIndex:t})},w=this.pattern.length;if(w>F){for(var x=0,L=w%F,S=w-L;x<S;)M(this.pattern.substr(x,F),x),x+=F;if(L){var _=w-F;M(this.pattern.substr(_),_)}}else M(this.pattern,0)}}return o(e,[{key:"searchIn",value:function(e){var t=this.options,n=t.isCaseSensitive,r=t.includeMatches;if(n||(e=e.toLowerCase()),this.pattern===e){var i={isMatch:!0,score:0};return r&&(i.indices=[[0,e.length-1]]),i}var o=this.options,a=o.location,s=o.distance,h=o.threshold,u=o.findAllMatches,l=o.minMatchCharLength,d=o.ignoreLocation,f=[],v=0,g=!1;this.chunks.forEach((function(t){var n=t.pattern,i=t.alphabet,o=t.startIndex,y=C(e,n,i,{location:a+o,distance:s,threshold:h,findAllMatches:u,minMatchCharLength:l,includeMatches:r,ignoreLocation:d}),p=y.isMatch,m=y.score,b=y.indices;p&&(g=!0),v+=m,p&&b&&(f=[].concat(c(f),c(b)))}));var y={isMatch:g,score:g?v/this.chunks.length:1};return g&&r&&(y.indices=f),y}}]),e}(),W=[];function T(e,t){for(var n=0,r=W.length;n<r;n+=1){var i=W[n];if(i.condition(e,t))return new i(e,t)}return new P(e,t)}function $(e,t){var n=e.matches;t.matches=[],y(n)&&n.forEach((function(e){if(y(e.indices)&&e.indices.length){var n={indices:e.indices,value:e.value};e.key&&(n.key=e.key.src),e.idx>-1&&(n.refIndex=e.idx),t.matches.push(n)}}))}function D(e,t){t.score=e.score}var K=function(){function e(n){var i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},o=arguments.length>2?arguments[2]:void 0;if(r(this,e),this.options=t(t({},O),i),this.options.useExtendedSearch)throw new Error("Extended search is not available");this._keyStore=new w(this.options.keys),this.setCollection(n,o)}return o(e,[{key:"setCollection",value:function(e,t){if(this._docs=e,t&&!(t instanceof A))throw new Error("Incorrect 'index' type");this._myIndex=t||E(this.options.keys,this._docs,{getFn:this.options.getFn,fieldNormWeight:this.options.fieldNormWeight})}},{key:"add",value:function(e){y(e)&&(this._docs.push(e),this._myIndex.add(e))}},{key:"remove",value:function(){for(var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:function(){return!1},t=[],n=0,r=this._docs.length;n<r;n+=1){var i=this._docs[n];e(i,n)&&(this.removeAt(n),n-=1,r-=1,t.push(i))}return t}},{key:"removeAt",value:function(e){this._docs.splice(e,1),this._myIndex.removeAt(e)}},{key:"getIndex",value:function(){return this._myIndex}},{key:"search",value:function(e){var t=(arguments.length>1&&void 0!==arguments[1]?arguments[1]:{}).limit,n=void 0===t?-1:t,r=this.options,i=r.includeMatches,o=r.includeScore,a=r.shouldSort,c=r.sortFn,s=r.ignoreFieldNorm,h=f(e)?f(this._docs[0])?this._searchStringList(e):this._searchObjectList(e):this._searchLogical(e);return function(e,t){var n=t.ignoreFieldNorm,r=void 0===n?O.ignoreFieldNorm:n;e.forEach((function(e){var t=1;e.matches.forEach((function(e){var n=e.key,i=e.norm,o=e.score,a=n?n.weight:null;t*=Math.pow(0===o&&a?Number.EPSILON:o,(a||1)*(r?1:i))})),e.score=t}))}(h,{ignoreFieldNorm:s}),a&&h.sort(c),v(n)&&n>-1&&(h=h.slice(0,n)),function(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},r=n.includeMatches,i=void 0===r?O.includeMatches:r,o=n.includeScore,a=void 0===o?O.includeScore:o,c=[];return i&&c.push($),a&&c.push(D),e.map((function(e){var n=e.idx,r={item:t[n],refIndex:n};return c.length&&c.forEach((function(t){t(e,r)})),r}))}(h,this._docs,{includeMatches:i,includeScore:o})}},{key:"_searchStringList",value:function(e){var t=T(e,this.options),n=this._myIndex.records,r=[];return n.forEach((function(e){var n=e.v,i=e.i,o=e.n;if(y(n)){var a=t.searchIn(n),c=a.isMatch,s=a.score,h=a.indices;c&&r.push({item:n,idx:i,matches:[{score:s,value:n,norm:o,indices:h}]})}})),r}},{key:"_searchLogical",value:function(e){throw new Error("Logical search is not available")}},{key:"_searchObjectList",value:function(e){var t=this,n=T(e,this.options),r=this._myIndex,i=r.keys,o=r.records,a=[];return o.forEach((function(e){var r=e.$,o=e.i;if(y(r)){var s=[];i.forEach((function(e,i){s.push.apply(s,c(t._findMatches({key:e,value:r[i],searcher:n})))})),s.length&&a.push({idx:o,item:r,matches:s})}})),a}},{key:"_findMatches",value:function(e){var t=e.key,n=e.value,r=e.searcher;if(!y(n))return[];var i=[];if(u(n))n.forEach((function(e){var n=e.v,o=e.i,a=e.n;if(y(n)){var c=r.searchIn(n),s=c.isMatch,h=c.score,u=c.indices;s&&i.push({score:h,key:t,value:n,idx:o,norm:a,indices:u})}}));else{var o=n.v,a=n.n,c=r.searchIn(o),s=c.isMatch,h=c.score,l=c.indices;s&&i.push({score:h,key:t,value:o,norm:a,indices:l})}return i}}]),e}();return K.version="7.0.0",K.createIndex=E,K.parseIndex=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=t.getFn,r=void 0===n?O.getFn:n,i=t.fieldNormWeight,o=void 0===i?O.fieldNormWeight:i,a=e.keys,c=e.records,s=new A({getFn:r,fieldNormWeight:o});return s.setKeys(a),s.setIndexRecords(c),s},K.config=O,K},"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self).Fuse=t();
;
/*
  PaperMod v8+
  License: MIT https://github.com/adityatelange/hugo-PaperMod/blob/master/LICENSE
  Copyright (c) 2020 nanxiaobei and adityatelange
  Copyright (c) 2021-2025 adityatelange
*/

;
(()=>{var s,r,c,e={distance:100,findallmatches:!1,includematches:!0,iscasesensitive:!1,keys:["title","description","content"],location:0,minmatchcharlength:2,shouldsort:!0,threshold:.3},n=document.getElementById("searchResults"),t=document.getElementById("searchInput"),a=null,o=!1;window.onload=function(){let t=new XMLHttpRequest;t.onreadystatechange=function(){if(t.readyState===4)if(t.status===200){{let n=JSON.parse(t.responseText);if(n){let t={distance:100,threshold:.4,ignoreLocation:!0,keys:["title","permalink","summary","content"]};e&&(t={isCaseSensitive:e.iscasesensitive??!1,includeScore:e.includescore??!1,includeMatches:e.includematches??!1,minMatchCharLength:e.minmatchcharlength??1,shouldSort:e.shouldsort??!0,findAllMatches:e.findallmatches??!1,keys:e.keys??["title","permalink","summary","content"],location:e.location??0,threshold:e.threshold??.4,distance:e.distance??100,ignoreLocation:e.ignorelocation??!0}),s=new Fuse(n,t)}}}else console.log(t.responseText)},t.open("GET","../index.json"),t.send()};function i(e){document.querySelectorAll(".focus").forEach(function(e){e.classList.remove("focus")}),e?(e.focus(),document.activeElement=a=e,e.parentElement.classList.add("focus")):document.activeElement.parentElement.classList.add("focus")}function l(){o=!1,n.innerHTML=t.value="",t.focus()}t.onkeyup=function(){if(s){let t;if(e?t=s.search(this.value.trim(),{limit:e.limit}):t=s.search(this.value.trim()),t.length!==0){let e="";for(let n in t)e+=`<li class="post-entry"><header class="entry-header">${t[n].item.title}&nbsp;\xBB</header><a href="${t[n].item.permalink}" aria-label="${t[n].item.title}"></a></li>`;n.innerHTML=e,o=!0,r=n.firstChild,c=n.lastChild}else o=!1,n.innerHTML=""}},t.addEventListener("search",function(){this.value||l()}),document.onkeydown=function(e){let d=e.key,s=document.activeElement,u=document.getElementById("searchbox").contains(s);if(s===t){let e=document.getElementsByClassName("focus");for(;e.length>0;)e[0].classList.remove("focus")}else a&&(s=a);if(d==="Escape")l();else if(!o||!u)return;else d==="ArrowDown"?(e.preventDefault(),s==t?i(n.firstChild.lastChild):s.parentElement!=c&&i(s.parentElement.nextSibling.lastChild)):d==="ArrowUp"?(e.preventDefault(),s.parentElement==r?i(t):s!=t&&i(s.parentElement.previousSibling.lastChild)):d==="ArrowRight"&&s.click()}})()