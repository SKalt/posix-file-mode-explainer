import{S as t,i as s,s as e,A as n,e as a,t as o,F as i,f as r,B as c,c as u,j as l,k as h,a as f,d,o as p,p as m,n as v}from"./client.0b1a206b.js";function y(t){let s,e,y,x,j,b,g=t[0].title+"",w=t[0].html+"";return document.title=s=t[0].title,{c(){e=n(),y=a("h1"),x=o(g),j=n(),b=a("div"),this.h()},l(t){i('[data-svelte="svelte-1uty71u"]',document.head).forEach(r),e=c(t),y=u(t,"H1",{});var s=l(y);x=h(s,g),s.forEach(r),j=c(t),b=u(t,"DIV",{class:!0}),l(b).forEach(r),this.h()},h(){f(b,"class","content svelte-emm3f3")},m(t,s){d(t,e,s),d(t,y,s),p(y,x),d(t,j,s),d(t,b,s),b.innerHTML=w},p(t,[e]){1&e&&s!==(s=t[0].title)&&(document.title=s),1&e&&g!==(g=t[0].title+"")&&m(x,g),1&e&&w!==(w=t[0].html+"")&&(b.innerHTML=w)},i:v,o:v,d(t){t&&r(e),t&&r(y),t&&r(j),t&&r(b)}}}var x=function(t,s,e,n){return new(e||(e=Promise))((function(a,o){function i(t){try{c(n.next(t))}catch(t){o(t)}}function r(t){try{c(n.throw(t))}catch(t){o(t)}}function c(t){var s;t.done?a(t.value):(s=t.value,s instanceof e?s:new e((function(t){t(s)}))).then(i,r)}c((n=n.apply(t,s||[])).next())}))};function j({params:t}){return x(this,void 0,void 0,(function*(){const s=yield this.fetch(`blog/${t.slug}.json`),e=yield s.json();if(200===s.status)return{post:e};this.error(s.status,e.message)}))}function b(t,s,e){let{post:n}=s;return t.$$set=t=>{"post"in t&&e(0,n=t.post)},[n]}export default class extends t{constructor(t){super(),s(this,t,b,y,e,{post:0})}}export{j as preload};