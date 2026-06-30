// alejero.studio Cloudflare Worker
// Routes by Host header — see wrangler.toml for the full route list.

const COOKIE_MAX_AGE = 60 * 60 * 24 * 90;
const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
const TURNSTILE_SITE_KEY = "0x4AAAAAADs9O72S89XMPBDp";

// ---------- Helpers ----------
function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;",
  }[c]));
}

async function verifyTurnstile(env, token, remoteip) {
  if (!token) return false;
  const res = await env.TURNSTILE_VERIFY.fetch("https://turnstile-siteverify/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, remoteip }),
  });
  return !!(await res.json()).success;
}

async function getTenant(env, slug) {
  return env.DB.prepare("SELECT * FROM tenants WHERE slug = ? AND status = 'active'").bind(slug).first();
}

function fmtDate(iso, lang) {
  try {
    return new Date(iso).toLocaleDateString(lang === "en" ? "en-US" : "es-MX", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  } catch { return iso; }
}

// ---------- Design system constants (alejero.studio) ----------
const DS = `
  :root{
    --paper:#FFF8EF;--ink:#1B1714;--ink-soft:#5A5048;
    --coral:#FF7A59;--peach:#FFC894;--butter:#FFE39A;--blush:#FFB3B8;--sky:#9FDBD3;--lilac:#CDBDF5;
    --glass-fill:rgba(255,255,255,0.42);--glass-fill-strong:rgba(255,255,255,0.62);
    --glass-stroke:rgba(255,255,255,0.65);--glass-stroke-dark:rgba(27,23,20,0.08);
    --glass-shadow:0 18px 50px -16px rgba(80,45,20,0.30);
    --glass-shadow-lift:0 30px 70px -18px rgba(80,45,20,0.42);
    --radius:30px;--radius-sm:20px;
    --display:"Shantell Sans",system-ui,sans-serif;
    --body:"Hanken Grotesk",system-ui,sans-serif;
    --maxw:1180px;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{font-family:var(--body);color:var(--ink);background:var(--paper);line-height:1.5;-webkit-font-smoothing:antialiased;overflow-x:hidden;position:relative;min-height:100vh;}
  /* bg atmosphere */
  .bg{position:fixed;inset:0;z-index:-2;overflow:hidden}
  .bg::before{content:"";position:absolute;inset:0;background:radial-gradient(120% 90% at 12% 8%,var(--butter) 0%,transparent 48%),radial-gradient(120% 100% at 88% 4%,var(--blush) 0%,transparent 46%),radial-gradient(130% 120% at 50% 100%,var(--peach) 0%,transparent 60%),var(--paper);}
  .blob{position:absolute;border-radius:50%;filter:blur(60px);opacity:.55;mix-blend-mode:multiply;will-change:transform}
  .blob.b1{width:46vw;height:46vw;left:-8vw;top:-6vw;background:var(--coral);animation:drift1 22s ease-in-out infinite}
  .blob.b2{width:40vw;height:40vw;right:-6vw;top:6vw;background:var(--lilac);animation:drift2 26s ease-in-out infinite}
  .blob.b3{width:50vw;height:50vw;left:24vw;bottom:-18vw;background:var(--sky);opacity:.5;animation:drift3 30s ease-in-out infinite}
  @keyframes drift1{50%{transform:translate(8vw,6vh) scale(1.08)}}
  @keyframes drift2{50%{transform:translate(-6vw,8vh) scale(1.06)}}
  @keyframes drift3{50%{transform:translate(5vw,-6vh) scale(1.1)}}
  .grain{position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:.05;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");}
  @media(prefers-reduced-motion:reduce){.blob{animation:none!important}}
  /* glass */
  .glass{position:relative;background:var(--glass-fill);backdrop-filter:blur(22px) saturate(180%);-webkit-backdrop-filter:blur(22px) saturate(180%);border:1px solid var(--glass-stroke);border-radius:var(--radius);box-shadow:var(--glass-shadow),inset 0 1px 0 rgba(255,255,255,.7),inset 0 -1px 1px rgba(27,23,20,.04);overflow:hidden;}
  .glass::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(135deg,rgba(255,255,255,.55) 0%,rgba(255,255,255,0) 38%);mix-blend-mode:screen;}
  /* layout */
  .wrap{max-width:var(--maxw);margin:0 auto;padding:0 24px}
  section{position:relative;z-index:1}
  /* nav */
  .nav{position:fixed;top:16px;left:0;right:0;z-index:50;display:flex;justify-content:center;padding:0 16px}
  .nav-inner{display:flex;align-items:center;gap:18px;padding:9px 9px 9px 18px;border-radius:999px;background:var(--glass-fill-strong);backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border:1px solid var(--glass-stroke);box-shadow:var(--glass-shadow),inset 0 1px 0 rgba(255,255,255,.7);}
  .nav-brand{font-family:var(--display);font-weight:600;font-size:1rem;text-decoration:none;color:var(--ink);}
  .nav-links{display:flex;gap:4px}
  .nav-links a{text-decoration:none;color:var(--ink-soft);font-size:.86rem;font-weight:600;padding:8px 13px;border-radius:999px;transition:.25s;}
  .nav-links a:hover{color:var(--ink);background:rgba(255,255,255,.55)}
  .nav-cta{text-decoration:none;color:var(--paper);background:var(--ink);font-weight:600;font-size:.86rem;padding:10px 16px;border-radius:999px;transition:.25s;}
  .nav-cta:hover{transform:translateY(-1px);box-shadow:0 8px 20px -6px rgba(27,23,20,.5)}
  @media(max-width:760px){.nav-links{display:none}}
  /* buttons */
  .btn{display:inline-flex;align-items:center;gap:9px;text-decoration:none;font-weight:600;font-size:1rem;padding:15px 26px;border-radius:999px;transition:.28s cubic-bezier(.2,.8,.2,1);cursor:pointer;border:none;font-family:var(--body);}
  .btn-primary{background:var(--ink);color:var(--paper)}
  .btn-primary:hover{transform:translateY(-2px);box-shadow:0 16px 30px -10px rgba(27,23,20,.55)}
  .btn-ghost{background:var(--glass-fill-strong);color:var(--ink);border:1px solid var(--glass-stroke);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);}
  .btn-ghost:hover{transform:translateY(-2px);box-shadow:var(--glass-shadow-lift)}
  /* section heads */
  .sec-kicker{font-family:var(--display);font-weight:600;color:var(--coral);font-size:1rem;margin-bottom:8px}
  .sec-title{font-family:var(--display);font-weight:600;font-size:clamp(2rem,4vw,3rem);line-height:1.04;letter-spacing:-.5px}
  .sec-sub{color:var(--ink-soft);max-width:54ch;margin-top:12px;font-size:1.05rem}
  /* eyebrow pill */
  .eyebrow-pill{display:inline-flex;align-items:center;gap:8px;font-family:var(--display);font-weight:600;font-size:.95rem;color:var(--ink);padding:8px 16px;border-radius:999px;background:var(--glass-fill);backdrop-filter:blur(14px);border:1px solid var(--glass-stroke);box-shadow:inset 0 1px 0 rgba(255,255,255,.7);}
  .dot{width:9px;height:9px;border-radius:50%;background:var(--coral);box-shadow:0 0 0 4px rgba(255,122,89,.22);flex-shrink:0;}
`;

const FONTS = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Shantell+Sans:ital,wght@0,400;0,500;0,600;0,700;1,500&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
`;

// Background markup shared across all pages
const BG = `<div class="bg"><div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div></div><div class="grain"></div>`;

// Nav for sub-pages (invitations product)
const NAV_HTML = `
<nav class="nav">
  <div class="nav-inner">
    <a class="nav-brand" href="https://alejero.studio">alejero.studio</a>
    <div class="nav-links">
      <a href="https://invitations.alejero.studio">Invitations</a>
      <a href="https://invites-demo.alejero.studio">Demos</a>
    </div>
    <a class="nav-cta" href="mailto:hello@alejero.studio">Get in touch</a>
  </div>
</nav>`;

// ---------- Themes ----------
const THEMES = {
  baby_shower_boy:    { label:"Baby Shower (Boy)",       emoji:"🧸", accent:"#8fc1e3", accentDeep:"#4a7fa0", sections:["hero","event_details","registry","dress_code","rsvp"] },
  baby_shower_girl:   { label:"Baby Shower (Girl)",      emoji:"🐰", accent:"#e8a9c0", accentDeep:"#b86080", sections:["hero","event_details","registry","dress_code","rsvp"] },
  baby_shower_neutral:{ label:"Baby Shower (Neutral)",   emoji:"🐝", accent:"#d8a84f", accentDeep:"#a87a2f", sections:["hero","event_details","registry","dress_code","rsvp"] },
  wedding:            { label:"Wedding",                 emoji:"💍", accent:"#c9a36a", accentDeep:"#8a6d3f", sections:["hero","event_details","rsvp"] },
  baptism:            { label:"Baptism",                 emoji:"🕊️", accent:"#9bc4dd", accentDeep:"#5d8caa", sections:["hero","event_details","rsvp"] },
  first_communion:    { label:"First Communion",         emoji:"🕊️", accent:"#d8c79a", accentDeep:"#a8915b", sections:["hero","event_details","rsvp"] },
  confirmation:       { label:"Confirmation",            emoji:"🕯️", accent:"#c97f5a", accentDeep:"#94532f", sections:["hero","event_details","rsvp"] },
  graduation:         { label:"Graduation",              emoji:"🎓", accent:"#2f4d73", accentDeep:"#1c324f", sections:["hero","event_details","rsvp"] },
};

// ---------- Per-guest adult/kid/baby fields ----------
const GUEST_FIELDS_JS = `
  function setupGuestFields(opts){
    var countSel=document.getElementById(opts.countId);
    var container=document.getElementById(opts.containerId);
    var namesH=document.getElementById(opts.namesHiddenId);
    var kidsH=document.getElementById(opts.kidsHiddenId);
    var babiesH=document.getElementById(opts.babiesHiddenId);
    var form=countSel.closest('form');
    var state=[];
    function render(){
      var n=parseInt(countSel.value,10)||0;
      while(state.length<n)state.push({name:'',type:'adulto'});
      state.length=n;
      var lang=document.documentElement.lang==='en'?'en':'es';
      var L={guestName:lang==='en'?'Guest name ':'Nombre del acompañante ',adult:lang==='en'?'Adult':'Adulto',kid:lang==='en'?'Kid':'Niño/a',baby:lang==='en'?'Baby':'Bebé',placeholder:lang==='en'?'Full name':'Nombre completo'};
      container.innerHTML='';
      state.forEach(function(g,i){
        var wrap=document.createElement('div');wrap.style.marginBottom='12px';
        var label=document.createElement('label');label.textContent=L.guestName+(i+1);label.style.cssText='display:block;font-weight:600;font-size:.85rem;color:var(--ink-soft);margin-bottom:6px;';
        var input=document.createElement('input');input.type='text';input.value=g.name;input.placeholder=L.placeholder;input.style.cssText='width:100%;padding:12px 16px;border:1.5px solid var(--glass-stroke-dark);border-radius:var(--radius-sm);font-family:var(--body);font-size:1rem;background:var(--glass-fill);backdrop-filter:blur(10px);';input.oninput=function(){g.name=input.value;};
        var typeRow=document.createElement('div');typeRow.style.cssText='display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;';
        [['adulto',L.adult],['nino',L.kid],['bebe',L.baby]].forEach(function(pair){
          var val=pair[0],text=pair[1];
          var typeLabel=document.createElement('label');typeLabel.style.cssText='display:inline-flex;align-items:center;gap:6px;font-weight:600;font-size:.88rem;padding:7px 14px;border-radius:999px;border:1.5px solid '+(g.type===val?'var(--ink)':'var(--glass-stroke-dark)')+';background:'+(g.type===val?'var(--ink)':'rgba(255,255,255,.4)')+';color:'+(g.type===val?'var(--paper)':'var(--ink)')+';cursor:pointer;transition:.2s;';
          var radio=document.createElement('input');radio.type='radio';radio.name='gtype_'+i;radio.checked=(g.type===val);radio.style.display='none';
          radio.onchange=function(){g.type=val;render();};
          typeLabel.appendChild(radio);typeLabel.appendChild(document.createTextNode(text));typeRow.appendChild(typeLabel);
        });
        wrap.appendChild(label);wrap.appendChild(input);wrap.appendChild(typeRow);container.appendChild(wrap);
      });
    }
    countSel.addEventListener('change',render);
    form.addEventListener('submit',function(){
      namesH.value=state.map(function(g){return g.name.trim();}).filter(Boolean).join(', ');
      kidsH.value=state.filter(function(g){return g.type==='nino';}).length;
      babiesH.value=state.filter(function(g){return g.type==='bebe';}).length;
    });
    render();
  }
`;

// Shared tenant CSS (layout + RSVP form + admin table)
function tenantCss(accent, accentDeep) {
  return `
    :root{--accent:${accent};--accent-deep:${accentDeep};}
    a{color:inherit}
    .center{text-align:center}
    /* gate */
    .gate-wrap{min-height:100svh;display:flex;align-items:center;justify-content:center;padding:120px 24px 60px;}
    .gate-card{width:100%;max-width:440px;padding:44px 36px;text-align:center;}
    .gate-emoji{font-size:56px;margin-bottom:12px;}
    .gate-title{font-family:var(--display);font-weight:600;font-size:clamp(1.6rem,4vw,2.2rem);margin-bottom:8px;}
    .gate-sub{color:var(--ink-soft);margin-bottom:28px;}
    .turnstile-wrap{display:flex;justify-content:center;margin-bottom:20px;}
    .gate-error{color:#d94f3d;font-weight:600;font-size:.9rem;margin-top:14px;}
    /* invite */
    .invite-hero{padding:120px 24px 60px;text-align:center;}
    .invite-emoji{font-size:64px;margin-bottom:16px;}
    .invite-event{font-family:var(--display);font-weight:600;font-size:clamp(2rem,5vw,3.2rem);margin-bottom:8px;letter-spacing:-.5px;}
    .invite-honorees{font-size:1.2rem;font-weight:600;color:var(--accent-deep);margin-bottom:6px;}
    .invite-date{color:var(--ink-soft);font-weight:500;}
    /* journey */
    .journey{max-width:680px;margin:0 auto;padding:0 24px 80px;display:flex;flex-direction:column;gap:24px;}
    .stop-card{padding:32px 28px;}
    .stop-kicker{font-family:var(--display);font-weight:600;color:var(--accent-deep);font-size:.9rem;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;}
    .stop-title{font-family:var(--display);font-weight:600;font-size:1.5rem;margin-bottom:18px;}
    .detail-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
    @media(max-width:500px){.detail-grid{grid-template-columns:1fr;}}
    .detail-tile{background:rgba(255,255,255,.5);border-radius:var(--radius-sm);padding:14px 16px;border:1px solid var(--glass-stroke-dark);}
    .detail-k{font-size:.8rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--ink-soft);margin-bottom:4px;}
    .detail-v{font-weight:600;}
    .btn-row{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:20px;}
    /* rsvp */
    .rsvp-form{display:flex;flex-direction:column;gap:18px;}
    .rsvp-form label{display:block;font-weight:600;font-size:.85rem;color:var(--ink-soft);margin-bottom:8px;text-transform:uppercase;letter-spacing:.4px;}
    .rsvp-form input[type=text],.rsvp-form select{width:100%;padding:13px 16px;border:1.5px solid var(--glass-stroke-dark);border-radius:var(--radius-sm);font-family:var(--body);font-size:1rem;background:rgba(255,255,255,.6);transition:.2s;}
    .rsvp-form input[type=text]:focus,.rsvp-form select:focus{outline:none;border-color:var(--accent);}
    .radio-row{display:flex;gap:10px;flex-wrap:wrap;}
    .radio-row label{display:inline-flex;align-items:center;gap:7px;font-weight:600;font-size:.95rem;padding:11px 18px;border-radius:999px;border:1.5px solid var(--glass-stroke-dark);background:rgba(255,255,255,.4);cursor:pointer;transition:.2s;}
    .radio-row input{accent-color:var(--accent);}
    .rsvp-status{font-weight:600;text-align:center;font-size:.95rem;padding:10px 0;}
    .rsvp-status.ok{color:#1a7a4a}
    .rsvp-status.err{color:#d94f3d}
    /* footer */
    footer{text-align:center;padding:24px;color:var(--ink-soft);font-size:.85rem;font-weight:500;}
    footer a{color:var(--ink-soft);text-decoration:none;}
    footer a:hover{color:var(--ink);}
  `;
}

// ---------- Gate page ----------
function gatePage(tenant, error) {
  const t = THEMES[tenant.invite_type] || THEMES.wedding;
  return `<!DOCTYPE html><html lang="es"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(tenant.event_name)}</title>
${FONTS}
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
<style>${DS}${tenantCss(t.accent, t.accentDeep)}</style>
</head><body>
${BG}
<div class="gate-wrap">
  <div class="gate-card glass">
    <div class="gate-emoji">${t.emoji}</div>
    <h1 class="gate-title">${escapeHtml(tenant.event_name)}</h1>
    <p class="gate-sub" data-i18n="gate_sub">Toca abajo para ver tu invitación</p>
    <form method="POST" action="/login">
      <div class="turnstile-wrap">
        <div class="cf-turnstile" data-sitekey="${TURNSTILE_SITE_KEY}" data-action="turnstile-spin-v1"></div>
      </div>
      <button class="btn btn-primary" type="submit" style="width:100%;justify-content:center;" data-i18n="gate_btn">Ver invitación →</button>
    </form>
    ${error ? `<p class="gate-error" data-i18n="gate_error">Algo salió mal, intenta otra vez.</p>` : ""}
  </div>
</div>
<script>
  const I={en:{gate_sub:"Tap below to view your invitation",gate_btn:"View invitation →",gate_error:"Something went wrong, try again."}};
  var lang=(localStorage.getItem('as_lang')||navigator.language||'es').slice(0,2);
  if(lang==='en'){document.documentElement.lang='en';document.querySelectorAll('[data-i18n]').forEach(function(el){if(I.en[el.dataset.i18n])el.textContent=I.en[el.dataset.i18n];});}
</script>
</body></html>`;
}

// ---------- Invite page ----------
function invitePage(tenant) {
  const t = THEMES[tenant.invite_type] || THEMES.wedding;
  const custom = (() => { try { return JSON.parse(tenant.custom_data || "{}"); } catch { return {}; } })();
  const sections = t.sections;

  const eventDetailsSection = sections.includes("event_details") ? `
  <div class="stop-card glass">
    <div class="stop-kicker" data-i18n="sec_details_kicker">Detalles del evento</div>
    <h2 class="stop-title" data-i18n="sec_details_title">Cuándo &amp; dónde</h2>
    <div class="detail-grid">
      <div class="detail-tile"><div class="detail-k" data-i18n="lbl_date">Fecha</div><div class="detail-v">${escapeHtml(fmtDate(tenant.event_date, "es"))}</div></div>
      ${tenant.venue_name ? `<div class="detail-tile"><div class="detail-k" data-i18n="lbl_venue">Lugar</div><div class="detail-v">${escapeHtml(tenant.venue_name)}</div></div>` : ""}
      ${tenant.venue_address ? `<div class="detail-tile"><div class="detail-k" data-i18n="lbl_address">Dirección</div><div class="detail-v">${escapeHtml(tenant.venue_address)}</div></div>` : ""}
    </div>
  </div>` : "";

  const registrySection = sections.includes("registry") && custom.registry ? `
  <div class="stop-card glass">
    <div class="stop-kicker" data-i18n="sec_registry_kicker">Regalos</div>
    <h2 class="stop-title" data-i18n="sec_registry_title">Mesa de regalos</h2>
    <p style="color:var(--ink-soft);margin-bottom:8px;" data-i18n="sec_registry_note">${escapeHtml(custom.registryNoteEs || "Tu presencia es el mejor regalo.")}</p>
    <div class="btn-row">
      ${(custom.registry || []).map((r) => `<a class="btn btn-ghost" href="${escapeHtml(r.url)}" target="_blank" rel="noopener">${escapeHtml(r.label)}</a>`).join("")}
    </div>
  </div>` : "";

  const dressCodeSection = sections.includes("dress_code") && custom.dressCode ? `
  <div class="stop-card glass">
    <div class="stop-kicker" data-i18n="sec_dress_kicker">Vestimenta</div>
    <h2 class="stop-title" data-i18n="sec_dress_title">Código de vestimenta</h2>
    <p style="color:var(--ink-soft);">${escapeHtml(custom.dressCode)}</p>
  </div>` : "";

  const rsvpSection = `
  <div class="stop-card glass">
    <div class="stop-kicker" data-i18n="sec_rsvp_kicker">Te esperamos</div>
    <h2 class="stop-title" data-i18n="sec_rsvp_title">Confirma tu asistencia</h2>
    <form class="rsvp-form" id="rsvpForm">
      <div>
        <label for="rsvpName" data-i18n="lbl_name">Tu nombre</label>
        <input type="text" id="rsvpName" required placeholder="Nombre completo" data-i18n-ph="lbl_name_ph">
      </div>
      <div>
        <label data-i18n="lbl_attending">¿Asistirás?</label>
        <div class="radio-row">
          <label><input type="radio" name="attending" value="si" required> <span data-i18n="lbl_yes">Sí, asistiré</span></label>
          <label><input type="radio" name="attending" value="no"> <span data-i18n="lbl_no">No podré ir</span></label>
        </div>
      </div>
      <div>
        <label for="rsvpGuests" data-i18n="lbl_guests">Acompañantes (sin contarte a ti)</label>
        <select id="rsvpGuests" name="guest_count">
          ${Array.from({length:11},(_,i)=>`<option value="${i}">${i}</option>`).join("")}
        </select>
      </div>
      <div id="guestFields"></div>
      <input type="hidden" id="guest_names" name="guest_names">
      <input type="hidden" id="kid_count" name="kid_count">
      <input type="hidden" id="baby_count" name="baby_count">
      <button class="btn btn-primary" type="submit" id="rsvpSubmit" style="justify-content:center;" data-i18n="lbl_rsvp_btn">Confirmar asistencia</button>
      <div class="rsvp-status" id="rsvpStatus"></div>
    </form>
  </div>`;

  const I18N = JSON.stringify({
    sec_details_kicker:"Event details",sec_details_title:"When &amp; where",
    sec_registry_kicker:"Gifts",sec_registry_title:"Gift registry",sec_registry_note:escapeHtml(custom.registryNoteEn||"Your presence is the best gift."),
    sec_dress_kicker:"Dress code",sec_dress_title:"Dress code",
    sec_rsvp_kicker:"We can't wait",sec_rsvp_title:"RSVP",
    lbl_date:"Date",lbl_venue:"Venue",lbl_address:"Address",
    lbl_name:"Your name",lbl_name_ph:"Full name",lbl_attending:"Will you attend?",lbl_yes:"Yes, I'll be there",lbl_no:"I can't make it",
    lbl_guests:"Guests (not counting yourself)",lbl_rsvp_btn:"Submit RSVP",
    sending:"Sending…",thanks_prefix:"Thanks for confirming, ",duplicate_suffix:" was already confirmed.",generic_err:"Something went wrong, please try again.",
  });

  return `<!DOCTYPE html><html lang="es"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(tenant.event_name)}</title>
${FONTS}
<style>${DS}${tenantCss(t.accent, t.accentDeep)}</style>
</head><body>
${BG}
${NAV_HTML}
<div class="invite-hero center">
  <div class="invite-emoji">${t.emoji}</div>
  <h1 class="invite-event">${escapeHtml(tenant.event_name)}</h1>
  <div class="invite-honorees">${escapeHtml(tenant.honoree_names)}</div>
  <div class="invite-date">${escapeHtml(fmtDate(tenant.event_date,"es"))}</div>
</div>
<main class="journey">
  ${eventDetailsSection}
  ${rsvpSection}
  ${registrySection}
  ${dressCodeSection}
</main>
<footer><a href="https://alejero.studio">alejero.studio</a> · <span data-i18n="footer_note">Invitaciones digitales</span></footer>
<script>${GUEST_FIELDS_JS}</script>
<script>
(function(){
  var I18N_EN=${I18N};
  var STR={
    sending:{es:'Enviando…',en:I18N_EN.sending},
    thanksPrefix:{es:'¡Gracias, ',en:I18N_EN.thanks_prefix},
    dupSuffix:{es:'" ya fue confirmado antes.',en:'" '+I18N_EN.duplicate_suffix},
    err:{es:'Algo salió mal, intenta otra vez.',en:I18N_EN.generic_err}
  };
  var lang=(localStorage.getItem('as_lang')||navigator.language||'es').slice(0,2);
  function applyLang(l){
    document.documentElement.lang=l;
    if(l==='en'){
      document.querySelectorAll('[data-i18n]').forEach(function(el){if(I18N_EN[el.dataset.i18n])el.innerHTML=I18N_EN[el.dataset.i18n];});
      document.querySelectorAll('[data-i18n-ph]').forEach(function(el){if(I18N_EN[el.dataset.i18nPh])el.placeholder=I18N_EN[el.dataset.i18nPh];});
    }
    localStorage.setItem('as_lang',l);
  }
  applyLang(lang);

  setupGuestFields({countId:'rsvpGuests',containerId:'guestFields',namesHiddenId:'guest_names',kidsHiddenId:'kid_count',babiesHiddenId:'baby_count'});

  var form=document.getElementById('rsvpForm');
  var status=document.getElementById('rsvpStatus');
  var submitBtn=document.getElementById('rsvpSubmit');
  var curLang=lang;
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var fd=new FormData(form);
    var payload={
      name:(fd.get('name')||fd.get('rsvpName')||(document.getElementById('rsvpName').value)||'').toString(),
      attending:(fd.get('attending')||'').toString(),
      guest_count:parseInt(fd.get('guest_count'),10)||0,
      guest_names:(fd.get('guest_names')||'').toString(),
      kid_count:parseInt(fd.get('kid_count'),10)||0,
      baby_count:parseInt(fd.get('baby_count'),10)||0
    };
    if(!payload.name){return;}
    submitBtn.disabled=true;
    status.className='rsvp-status';
    status.textContent=STR.sending[curLang];
    fetch('/rsvp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
      .then(function(r){return r.json();})
      .then(function(data){
        submitBtn.disabled=false;
        if(data&&data.success){
          if(data.duplicate){status.className='rsvp-status err';status.innerHTML='"'+escH(data.name)+STR.dupSuffix[curLang];}
          else{status.className='rsvp-status ok';status.textContent=STR.thanksPrefix[curLang]+data.name+'!';}
        }else{status.className='rsvp-status err';status.textContent=STR.err[curLang];}
      })
      .catch(function(){submitBtn.disabled=false;status.className='rsvp-status err';status.textContent=STR.err[curLang];});
  });
  function escH(s){return String(s??'').replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]);});}

  // Get name from the actual input element since FormData key is "name" but we set id="rsvpName"
  document.getElementById('rsvpName').name='name';
})();
</script>
</body></html>`;
}

// ---------- Admin pages ----------
function adminLoginPage(tenant, error) {
  const t = THEMES[tenant.invite_type] || THEMES.wedding;
  return `<!DOCTYPE html><html lang="es"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(tenant.event_name)} · Admin</title>
${FONTS}
<style>${DS}${tenantCss(t.accent, t.accentDeep)}
.login-wrap{min-height:100svh;display:flex;align-items:center;justify-content:center;padding:40px 24px;}
.login-card{width:100%;max-width:380px;padding:40px 34px;}
.login-title{font-family:var(--display);font-weight:600;font-size:1.6rem;margin-bottom:24px;text-align:center;}
input[type=password]{width:100%;padding:13px 16px;border:1.5px solid var(--glass-stroke-dark);border-radius:var(--radius-sm);font-family:var(--body);font-size:1rem;background:rgba(255,255,255,.6);margin-bottom:16px;}
.login-err{color:#d94f3d;font-weight:600;font-size:.9rem;text-align:center;margin-top:12px;}
</style></head><body>
${BG}
<div class="login-wrap">
  <div class="login-card glass">
    <h1 class="login-title">Planeadores ✦</h1>
    <form method="POST" action="/admin/login">
      <input type="password" name="password" placeholder="Contraseña" autofocus required>
      <button class="btn btn-primary" type="submit" style="width:100%;justify-content:center;">Entrar</button>
    </form>
    ${error ? '<p class="login-err">Contraseña incorrecta</p>' : ""}
  </div>
</div>
</body></html>`;
}

function adminDashboardPage(tenant, rows) {
  const attendingYes = rows.filter((r) => r.attending === "si").length;
  const totalGuests = rows.reduce((s,r) => s+(r.attending==="si"?r.guest_count||0:0), 0);
  const totalKids   = rows.reduce((s,r) => s+(r.attending==="si"?r.kid_count||0:0), 0);
  const totalBabies = rows.reduce((s,r) => s+(r.attending==="si"?r.baby_count||0:0), 0);
  const totalPeople = attendingYes + totalGuests;
  const totalAdults = totalPeople - totalKids - totalBabies;

  const tableRows = rows.map((r) => `<tr>
    <td data-label="Nombre">${escapeHtml(r.name)}</td>
    <td data-label="Asiste">${r.attending==="si"?"✅ Sí":"❌ No"}</td>
    <td data-label="Acompañantes">${r.guest_count||0}</td>
    <td data-label="Niños">${r.kid_count||0}</td>
    <td data-label="Bebés">${r.baby_count||0}</td>
    <td data-label="Nombres">${escapeHtml(r.guest_names||"—")}</td>
    <td data-label="Fecha">${escapeHtml(r.created_at)}</td>
    <td class="actions">
      <form method="POST" action="/admin/rsvp/delete" onsubmit="return confirm('¿Eliminar?');">
        <input type="hidden" name="id" value="${r.id}">
        <button class="btn-sm-danger" type="submit">Eliminar</button>
      </form>
    </td>
  </tr>`).join("");

  return `<!DOCTYPE html><html lang="es"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(tenant.event_name)} · RSVPs</title>
${FONTS}
<style>${DS}
body{padding:28px 18px;}
.wrap{max-width:960px;margin:0 auto;}
h1{font-family:var(--display);font-weight:600;font-size:1.8rem;margin-bottom:20px;text-align:center;}
.stats{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:24px;}
.stat{background:var(--glass-fill);backdrop-filter:blur(14px);border:1px solid var(--glass-stroke);border-radius:var(--radius-sm);padding:14px 22px;text-align:center;min-width:96px;}
.stat .num{font-family:var(--display);font-size:1.8rem;font-weight:700;color:var(--coral);}
.stat .lbl{font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--ink-soft);}
.top-row{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:18px;}
.btn-sm{display:inline-block;font-weight:700;font-size:.82rem;color:var(--ink);background:var(--glass-fill);border:1px solid var(--glass-stroke);border-radius:999px;padding:8px 16px;text-decoration:none;backdrop-filter:blur(10px);}
.btn-sm-danger{display:inline-block;font-weight:700;font-size:.82rem;color:#d94f3d;background:rgba(217,79,61,.08);border:1px solid rgba(217,79,61,.25);border-radius:999px;padding:6px 13px;cursor:pointer;font-family:var(--body);}
table{width:100%;border-collapse:collapse;background:var(--glass-fill);backdrop-filter:blur(14px);border:1px solid var(--glass-stroke);border-radius:var(--radius);overflow:hidden;}
th,td{padding:11px 14px;text-align:left;font-size:.9rem;border-bottom:1px solid rgba(27,23,20,.07);}
th{background:rgba(255,255,255,.45);font-weight:700;font-size:.78rem;text-transform:uppercase;letter-spacing:.5px;color:var(--ink-soft);}
tr:last-child td{border-bottom:none;}
td.actions{white-space:nowrap;}
td.actions form{display:inline;}
.empty{text-align:center;color:var(--ink-soft);padding:40px 0;font-weight:600;}
@media(max-width:680px){
  table,thead,tbody,tr,td{display:block;}thead{display:none;}table{background:none;border:none;backdrop-filter:none;}
  tbody{display:flex;flex-direction:column;gap:12px;}
  tr{background:var(--glass-fill);backdrop-filter:blur(14px);border:1px solid var(--glass-stroke);border-radius:var(--radius-sm);padding:6px 14px;}
  td{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:4px 12px;padding:8px 0;border-bottom:1px solid rgba(27,23,20,.07);overflow-wrap:break-word;word-break:break-word;min-width:0;}
  tr td:last-child{border-bottom:none;}
  td::before{content:attr(data-label);font-weight:700;font-size:.78rem;text-transform:uppercase;color:var(--ink-soft);flex-shrink:0;}
  td.actions{flex-direction:column;align-items:stretch;}td.actions::before{content:none;}
  td.actions .btn-sm-danger{display:block;text-align:center;margin-top:4px;}
}
</style></head><body>
${BG}
<div class="wrap">
  <h1>${escapeHtml(tenant.event_name)} · RSVPs</h1>
  <div class="stats">
    <div class="stat"><div class="num">${rows.length}</div><div class="lbl">Respuestas</div></div>
    <div class="stat"><div class="num">${attendingYes}</div><div class="lbl">Confirmados</div></div>
    <div class="stat"><div class="num">${totalAdults}</div><div class="lbl">Adultos</div></div>
    <div class="stat"><div class="num">${totalKids}</div><div class="lbl">Niños</div></div>
    <div class="stat"><div class="num">${totalBabies}</div><div class="lbl">Bebés</div></div>
    <div class="stat"><div class="num">${totalPeople}</div><div class="lbl">Total</div></div>
  </div>
  <div class="top-row">
    <a class="btn-sm" href="/admin/export.csv">⬇ Exportar CSV</a>
    <form method="POST" action="/admin/logout" style="display:inline;"><button class="btn-sm" type="submit" style="cursor:pointer;">Cerrar sesión</button></form>
  </div>
  ${rows.length
    ? `<table><thead><tr><th>Nombre</th><th>Asiste</th><th>Acompañantes</th><th>Niños</th><th>Bebés</th><th>Nombres</th><th>Fecha</th><th>Acciones</th></tr></thead><tbody>${tableRows}</tbody></table>`
    : '<div class="empty">Aún no hay confirmaciones.</div>'
  }
</div>
</body></html>`;
}

function toCsv(rows) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const header = ["Nombre","Asiste","Acompañantes","Niños","Bebés","Nombres acompañantes","Fecha"];
  const lines = [header.map(esc).join(",")];
  for (const r of rows) {
    lines.push([r.name, r.attending==="si"?"Si":"No", r.guest_count||0, r.kid_count||0, r.baby_count||0, r.guest_names||"", r.created_at].map(esc).join(","));
  }
  return lines.join("\r\n");
}

// ---------- Product landing page (invitations.alejero.studio) ----------
function invitationsLandingPage() {
  const typeCards = Object.entries(THEMES).map(([key, t]) =>
    `<a class="type-card glass" href="https://demo-${key.replace(/_/g,"-")}.alejero.studio">
      <div class="type-emoji">${t.emoji}</div>
      <div class="type-label">${t.label}</div>
      <div class="type-arrow">→</div>
    </a>`
  ).join("");

  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invitations · alejero.studio</title>
<meta name="description" content="Beautiful digital invitations for life's biggest moments. Baby showers, weddings, baptisms, graduations, and more.">
${FONTS}
<style>${DS}
.hero-inv{padding:160px 24px 80px;text-align:center;}
.hero-inv .eyebrow-pill{margin-bottom:24px;}
.hero-inv h1{font-family:var(--display);font-weight:600;font-size:clamp(2.4rem,6vw,4.2rem);line-height:1.04;letter-spacing:-.5px;margin-bottom:18px;}
.hero-inv .lede{color:var(--ink-soft);font-size:clamp(1rem,1.8vw,1.25rem);max-width:42ch;margin:0 auto 36px;}
.cta-row{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;}
.types-section{padding:60px 24px 100px;}
.sec-head{text-align:center;margin-bottom:48px;}
.type-grid{max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:18px;}
.type-card{text-decoration:none;color:var(--ink);padding:28px 20px 22px;display:flex;flex-direction:column;align-items:center;gap:10px;transition:.3s cubic-bezier(.2,.8,.2,1);cursor:pointer;}
.type-card:hover{transform:translateY(-6px);box-shadow:var(--glass-shadow-lift);}
.type-emoji{font-size:36px;}
.type-label{font-family:var(--display);font-weight:600;font-size:.95rem;text-align:center;}
.type-arrow{font-size:.85rem;color:var(--ink-soft);}
.how-section{padding:60px 24px 100px;max-width:780px;margin:0 auto;}
.steps{display:grid;grid-template-columns:1fr 1fr 1fr;gap:22px;margin-top:40px;}
@media(max-width:600px){.steps{grid-template-columns:1fr;}}
.step{padding:28px 24px;}
.step-num{font-family:var(--display);font-size:2rem;font-weight:700;color:var(--coral);margin-bottom:10px;}
.step-title{font-family:var(--display);font-weight:600;font-size:1.05rem;margin-bottom:6px;}
.step-desc{color:var(--ink-soft);font-size:.9rem;}
footer{text-align:center;padding:28px 24px;color:var(--ink-soft);font-size:.85rem;font-weight:500;}
footer a{color:var(--ink-soft);text-decoration:none;}footer a:hover{color:var(--ink);}
</style></head><body>
${BG}
${NAV_HTML}
<section class="hero-inv">
  <div class="eyebrow-pill"><span class="dot"></span>A new offering from alejero.studio</div>
  <h1>Digital invitations<br>made with intention.</h1>
  <p class="lede">Beautiful, custom event invitations for life's biggest moments — delivered as a private link, no app required.</p>
  <div class="cta-row">
    <a class="btn btn-primary" href="https://invites-demo.alejero.studio">See the demos →</a>
    <a class="btn btn-ghost" href="mailto:hello@alejero.studio">Request yours</a>
  </div>
</section>

<section class="types-section">
  <div class="sec-head">
    <div class="sec-kicker">Event types</div>
    <h2 class="sec-title">Every occasion, covered</h2>
    <p class="sec-sub">Each invitation is crafted for the specific tone of your event — from playful baby showers to elegant weddings.</p>
  </div>
  <div class="type-grid">${typeCards}</div>
</section>

<section class="how-section">
  <div class="sec-head">
    <div class="sec-kicker">How it works</div>
    <h2 class="sec-title">Simple from start to finish</h2>
  </div>
  <div class="steps">
    <div class="step glass">
      <div class="step-num">01</div>
      <div class="step-title">Choose a style</div>
      <div class="step-desc">Browse the demos and pick the look that fits your event.</div>
    </div>
    <div class="step glass">
      <div class="step-num">02</div>
      <div class="step-title">We set it up</div>
      <div class="step-desc">Send us your event details — we configure your private invite link, same day.</div>
    </div>
    <div class="step glass">
      <div class="step-num">03</div>
      <div class="step-title">Share &amp; track RSVPs</div>
      <div class="step-desc">Send the link to guests. Track confirmations, guest counts, and more from a private dashboard.</div>
    </div>
  </div>
</section>

<footer><a href="https://alejero.studio">alejero.studio</a> · hello@alejero.studio</footer>
</body></html>`;
}

// ---------- Demo picker (invites-demo.alejero.studio) ----------
function demoPicker() {
  const cards = Object.entries(THEMES).map(([key, t]) =>
    `<a class="type-card glass" href="https://demo-${key.replace(/_/g,"-")}.alejero.studio">
      <div class="type-emoji">${t.emoji}</div>
      <div class="type-label">${t.label}</div>
      <div class="type-arrow">Ver demo →</div>
    </a>`
  ).join("");

  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invitation Demos · alejero.studio</title>
${FONTS}
<style>${DS}
.hero-demo{padding:140px 24px 60px;text-align:center;}
.hero-demo h1{font-family:var(--display);font-weight:600;font-size:clamp(2rem,5vw,3.4rem);letter-spacing:-.5px;margin-bottom:12px;}
.hero-demo .lede{color:var(--ink-soft);font-size:1.05rem;max-width:40ch;margin:0 auto;}
.type-grid{max-width:900px;margin:50px auto 100px;padding:0 24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:18px;}
.type-card{text-decoration:none;color:var(--ink);padding:30px 20px 24px;display:flex;flex-direction:column;align-items:center;gap:10px;transition:.3s cubic-bezier(.2,.8,.2,1);cursor:pointer;}
.type-card:hover{transform:translateY(-6px);box-shadow:var(--glass-shadow-lift);}
.type-emoji{font-size:38px;}
.type-label{font-family:var(--display);font-weight:600;font-size:.95rem;text-align:center;}
.type-arrow{font-size:.82rem;color:var(--coral);font-weight:600;}
footer{text-align:center;padding:28px;color:var(--ink-soft);font-size:.85rem;}
footer a{color:var(--ink-soft);text-decoration:none;}
</style></head><body>
${BG}
${NAV_HTML}
<div class="hero-demo">
  <div class="eyebrow-pill" style="margin-bottom:20px;"><span class="dot"></span>Live demos</div>
  <h1>Pick a style to preview</h1>
  <p class="lede">Each card opens a live demo — same experience your guests will see.</p>
</div>
<div class="type-grid">${cards}</div>
<footer><a href="https://invitations.alejero.studio">← Back to Invitations</a></footer>
</body></html>`;
}

// ---------- Not found ----------
function notFoundPage() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Not found · alejero.studio</title>
${FONTS}<style>${DS}.center{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;text-align:center;gap:16px;padding:40px;}</style>
</head><body>${BG}<div class="center"><h1 style="font-family:var(--display);font-size:2rem;">This link isn't active.</h1><p style="color:var(--ink-soft);">Double-check the link or contact the event host.</p><a class="btn btn-ghost" href="https://alejero.studio">alejero.studio</a></div></body></html>`;
}

// ---------- Tenant request handler ----------
async function handleTenant(request, env, url, slug) {
  const tenant = await getTenant(env, slug);
  if (!tenant) return new Response(notFoundPage(), { status: 404, headers: { "Content-Type": "text/html; charset=UTF-8" } });

  const cookieName  = `as_session_${tenant.id}`;
  const adminCookie = `as_admin_${tenant.id}`;
  const session     = getCookie(request, cookieName);
  const authed      = !!session && session === tenant.session_secret;
  const adminSess   = getCookie(request, adminCookie);
  const adminAuthed = !!adminSess && adminSess === tenant.admin_session_secret;
  const html = { "Content-Type": "text/html; charset=UTF-8" };

  if (url.pathname === "/login" && request.method === "POST") {
    let token = "";
    try { const f = await request.formData(); token = (f.get("cf-turnstile-response") || "").toString(); } catch {}
    const ok = await verifyTurnstile(env, token, request.headers.get("CF-Connecting-IP") || undefined);
    if (ok) {
      const h = new Headers({ Location: "/" });
      h.append("Set-Cookie", `${cookieName}=${tenant.session_secret}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`);
      return new Response(null, { status: 302, headers: h });
    }
    return new Response(gatePage(tenant, true), { status: 401, headers: html });
  }

  if (url.pathname === "/admin/login" && request.method === "POST") {
    const f = await request.formData().catch(() => null);
    if ((f?.get("password") || "").toString() === tenant.admin_password) {
      const h = new Headers({ Location: "/admin" });
      h.append("Set-Cookie", `${adminCookie}=${tenant.admin_session_secret}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${ADMIN_COOKIE_MAX_AGE}`);
      return new Response(null, { status: 302, headers: h });
    }
    return new Response(adminLoginPage(tenant, true), { status: 401, headers: html });
  }

  if (url.pathname === "/admin/logout" && request.method === "POST") {
    const h = new Headers({ Location: "/admin" });
    h.append("Set-Cookie", `${adminCookie}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
    return new Response(null, { status: 302, headers: h });
  }

  if (url.pathname === "/admin/rsvp/delete" && request.method === "POST") {
    if (!adminAuthed) return new Response(adminLoginPage(tenant, false), { status: 200, headers: html });
    const f = await request.formData().catch(() => null);
    const id = parseInt(f?.get("id"), 10);
    if (id) await env.DB.prepare("DELETE FROM rsvps WHERE id = ? AND tenant_id = ?").bind(id, tenant.id).run();
    return new Response(null, { status: 302, headers: { Location: "/admin" } });
  }

  if (url.pathname === "/admin" || url.pathname === "/admin/export.csv") {
    if (!adminAuthed) return new Response(adminLoginPage(tenant, false), { status: 200, headers: html });
    const { results } = await env.DB.prepare("SELECT * FROM rsvps WHERE tenant_id = ? ORDER BY created_at DESC").bind(tenant.id).all();
    if (url.pathname === "/admin/export.csv") return new Response(toCsv(results), { headers: { "Content-Type": "text/csv; charset=UTF-8", "Content-Disposition": 'attachment; filename="rsvps.csv"' } });
    return new Response(adminDashboardPage(tenant, results), { status: 200, headers: html });
  }

  if (url.pathname === "/rsvp" && request.method === "POST") {
    if (!authed) return new Response(JSON.stringify({ success: false }), { status: 401, headers: { "Content-Type": "application/json" } });
    let data;
    try { data = await request.json(); } catch { return new Response(JSON.stringify({ success: false }), { status: 400, headers: { "Content-Type": "application/json" } }); }
    const name = (data.name || "").toString().trim().slice(0, 120);
    const attending = data.attending === "si" ? "si" : "no";
    const guestCount = Math.max(0, Math.min(20, parseInt(data.guest_count, 10) || 0));
    const kidCount   = Math.max(0, Math.min(guestCount, parseInt(data.kid_count, 10) || 0));
    const babyCount  = Math.max(0, Math.min(guestCount - kidCount, parseInt(data.baby_count, 10) || 0));
    const guestNames = (data.guest_names || "").toString().trim().slice(0, 500);
    if (!name) return new Response(JSON.stringify({ success: false, error: "missing_name" }), { status: 400, headers: { "Content-Type": "application/json" } });
    const existing = await env.DB.prepare("SELECT name FROM rsvps WHERE tenant_id = ? AND LOWER(TRIM(name)) = LOWER(TRIM(?)) LIMIT 1").bind(tenant.id, name).first();
    if (existing) return new Response(JSON.stringify({ success: true, duplicate: true, name: existing.name }), { status: 200, headers: { "Content-Type": "application/json" } });
    await env.DB.prepare("INSERT INTO rsvps (tenant_id, name, attending, guest_count, guest_names, kid_count, baby_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(tenant.id, name, attending, guestCount, guestNames, kidCount, babyCount, new Date().toISOString()).run();
    return new Response(JSON.stringify({ success: true, duplicate: false, name }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  if (!authed) return new Response(gatePage(tenant, false), { status: 200, headers: html });
  return new Response(invitePage(tenant), { status: 200, headers: html });
}

// ---------- Main fetch handler ----------
export default {
  async fetch(request, env) {
    const url  = new URL(request.url);
    const host = (request.headers.get("Host") || "").toLowerCase();
    const html = { "Content-Type": "text/html; charset=UTF-8" };

    if (host === "alejero.studio" || host === "www.alejero.studio") {
      return env.ASSETS.fetch(request);
    }
    if (host === "invitations.alejero.studio") {
      return new Response(invitationsLandingPage(), { status: 200, headers: html });
    }
    if (host === "invites-demo.alejero.studio") {
      return new Response(demoPicker(), { status: 200, headers: html });
    }
    if (host.endsWith(".alejero.studio")) {
      const slug = host.split(".")[0];
      return handleTenant(request, env, url, slug);
    }
    return new Response(notFoundPage(), { status: 404, headers: html });
  },
};
