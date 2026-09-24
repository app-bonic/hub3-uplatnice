'use strict';
/* HUB-3 uplatnice — barkod po „Uputi o upotrebi PDF417 2D bar koda … (HUB3A)”, verzija 6 (euro):
   14 polja odvojenih LF-om (i LF na kraju), UTF-8, PDF417 s 9 stupaca, razina ispravljanja 4,
   omjer visine i širine modula 3:1, binarno (byte) kodiranje, modul 0,254 mm. */

const { $, $$, esc, obavijest, spremi, kopiraj, lokalno } = AB;

const MAKS = { platIme: 30, platAdresa: 27, platMjesto: 27, primNaziv: 25, primAdresa: 25, primMjesto: 27, poziv: 22, opis: 35 };
const PRIMATELJ = ['primNaziv', 'primAdresa', 'primMjesto', 'iban', 'model', 'sifra', 'opis', 'iznos', 'poziv'];
const SVA = ['primNaziv', 'primAdresa', 'primMjesto', 'iban', 'iznos', 'sifra', 'model', 'poziv', 'opis', 'platIme', 'platAdresa', 'platMjesto'];
const KLJUC = 'hub3-primatelj';
const MODUL_MM = 0.254;

let S = Object.fromEntries(SVA.map(k => [k, '']));
S.model = '00';
let nacin = 'jedna';

// ---------------- znakovi i provjere ----------------
// Dozvoljeno: znamenke, hrvatska abeceda + Q W X Y, razmak i , . : - + ? ' / ( )
const DOZVOLJEN = /^[0-9A-Za-zČĆĐŠŽčćđšž ,.:\-+?'/()]$/;
const ZAMJENE = { '„': "'", '“': "'", '”': "'", '"': "'", '‘': "'", '’': "'", '«': "'", '»': "'", '–': '-', '—': '-', '&': '+', '_': '-', ';': ',', '\t': ' ', '\n': ' ', '\r': ' ', '€': 'EUR', '@': '(at)', '#': 'br.', '%': ' posto', '!': '.', '*': '', '=': '-', 'ß': 'ss' };
function ocistiZnakove(s) {
  let van = '';
  for (const z of String(s ?? '')) {
    if (DOZVOLJEN.test(z)) { van += z; continue; }
    if (z in ZAMJENE) { van += ZAMJENE[z]; continue; }
    const osnova = z.normalize('NFD').replace(/\p{M}/gu, '');
    if (osnova && [...osnova].every(c => DOZVOLJEN.test(c))) van += osnova;
  }
  return van.replace(/ {2,}/g, ' ').trim();
}
const skrati = (s, n) => Array.from(s).slice(0, n).join('');
const duljina = s => Array.from(s).length;

function provjeriIban(v) {
  const i = String(v ?? '').replace(/\s+/g, '').toUpperCase();
  if (!i) return { iban: '', greska: 'Upiši IBAN primatelja.' };
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(i)) return { iban: i, greska: 'IBAN smije sadržavati samo slova i brojke.' };
  if (i.startsWith('HR') && i.length !== 21) return { iban: i, greska: `Hrvatski IBAN ima 21 znak (upisano ${i.length}).` };
  if (i.length > 21) return { iban: i, greska: 'U HUB-3 barkod stane IBAN od najviše 21 znaka.' };
  const pomaknut = i.slice(4) + i.slice(0, 4);
  let ostatak = 0;
  for (const c of pomaknut) {
    const n = c >= 'A' ? String(c.charCodeAt(0) - 55) : c;
    for (const d of n) ostatak = (ostatak * 10 + +d) % 97;
  }
  if (ostatak !== 1) return { iban: i, greska: 'Kontrolni broj IBAN-a ne odgovara — provjeri je li dobro prepisan.' };
  return { iban: i, greska: '', upoz: i.startsWith('HR') ? '' : 'Nije hrvatski IBAN — HUB-3 uplatnica je za domaća plaćanja.' };
}

function parsirajIznos(v) {
  let s = String(v ?? '').replace(/\s|€|EUR/gi, '');
  if (!s) return { centi: 0, prazno: true };
  if (s.includes(',') && s.includes('.')) {
    s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  } else if (s.includes(',')) s = s.replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return { greska: 'Iznos upiši kao broj, npr. 25,00 ili 1.250,50.' };
  const centi = Math.round(parseFloat(s) * 100);
  if (String(centi).length > 15) return { greska: 'Iznos je prevelik.' };
  return { centi };
}
const iznosTekst = c => (c / 100).toLocaleString('hr-HR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function provjeriPoziv(p, model) {
  if (model === '99') return p ? 'Uz model HR99 poziv na broj ostaje prazan.' : '';
  if (!p) return '';
  if (!/^[0-9-]+$/.test(p)) return 'Poziv na broj smije sadržavati samo znamenke i crtice.';
  if (/^-|-$|--/.test(p)) return 'Crtica ne smije biti na početku, na kraju ni dvaput zaredom.';
  if (p.split('-').length > 3) return 'Poziv na broj ima najviše tri dijela odvojena crticom.';
  if (duljina(p) > 22) return 'Poziv na broj ima najviše 22 znaka.';
  return '';
}

// ---------------- izrada zapisa i barkoda ----------------
function izgradi(u) {
  const greske = [], upoz = [];
  const polje = k => {
    const izvorno = String(u[k] ?? '').trim();
    let v = ocistiZnakove(izvorno);
    if (v !== izvorno.replace(/\s+/g, ' ') && izvorno) upoz.push(`„${izvorno}” sadrži znakove koji nisu dopušteni u barkodu — zapisano kao „${v}”.`);
    if (MAKS[k] && duljina(v) > MAKS[k]) { upoz.push(`„${v}” je dulje od ${MAKS[k]} znakova pa je u barkodu skraćeno.`); v = skrati(v, MAKS[k]); }
    return v;
  };
  const d = {};
  for (const k of ['platIme', 'platAdresa', 'platMjesto', 'primNaziv', 'primAdresa', 'primMjesto', 'opis']) d[k] = polje(k);
  if (!d.primNaziv) greske.push('Upiši naziv primatelja.');

  const ib = provjeriIban(u.iban);
  d.iban = ib.iban;
  if (ib.greska) greske.push(ib.greska);
  if (ib.upoz) upoz.push(ib.upoz);

  const iz = parsirajIznos(u.iznos);
  if (iz.greska) greske.push(iz.greska);
  d.centi = iz.centi || 0;
  if (iz.prazno) upoz.push('Iznos nije upisan — platitelj ga upisuje sam u aplikaciji.');

  d.model = String(u.model ?? '').trim() || '00';
  if (!/^\d{2}$/.test(d.model)) greske.push('Model su dvije znamenke (npr. 00, 01 ili 99).');
  d.poziv = String(u.poziv ?? '').replace(/\s+/g, '');
  const gp = provjeriPoziv(d.poziv, d.model);
  if (gp) greske.push(gp);
  d.sifra = /^[A-Z]{4}$/.test(u.sifra || '') ? u.sifra : '';

  const zapis = ['HRVHUB30', 'EUR', String(d.centi).padStart(15, '0'),
    d.platIme, d.platAdresa, d.platMjesto, d.primNaziv, d.primAdresa, d.primMjesto,
    d.iban, 'HR' + d.model, d.poziv, d.sifra, d.opis].join('\n') + '\n';
  return { d, zapis, greske, upoz: [...new Set(upoz)] };
}

// PDF417 „byte compaction”: 6 bajtova → 5 kodnih riječi u bazi 900, ostatak bajt po bajt
function kodneRijeci(zapis) {
  const b = new TextEncoder().encode(zapis);
  const cw = [b.length % 6 === 0 ? 924 : 901];
  let i = 0;
  for (; i + 6 <= b.length; i += 6) {
    let v = 0n;
    for (let j = 0; j < 6; j++) v = v * 256n + BigInt(b[i + j]);
    const g = [];
    for (let k = 0; k < 5; k++) { g.unshift(Number(v % 900n)); v /= 900n; }
    cw.push(...g);
  }
  for (; i < b.length; i++) cw.push(b[i]);
  return cw;
}

function barkodSvg(zapis) {
  const text = kodneRijeci(zapis).map(c => '^' + String(c).padStart(3, '0')).join('');
  let svg = bwipjs.toSVG({ bcid: 'pdf417', text, raw: true, columns: 9, eclevel: 4, rowmult: 3, scale: 1, paddingwidth: 2, paddingheight: 2, backgroundcolor: 'FFFFFF' });
  const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  if (vb) {
    const w = r2(+vb[1] * MODUL_MM), h = r2(+vb[2] * MODUL_MM);
    svg = svg.replace(/<svg([^>]*?)>/, (m, a) => `<svg${a.replace(/\s(width|height)="[^"]*"/g, '')} width="${w}mm" height="${h}mm" role="img" aria-label="HUB-3 2D barkod">`);
    return { svg, sirinaMm: w, visinaMm: h, modulaX: +vb[1], modulaY: +vb[2] };
  }
  return { svg, sirinaMm: 58 };
}
const r2 = n => Math.round(n * 100) / 100;

function uplatnicaHtml(r, b) {
  const { d } = r;
  const v = (k, t = d[k]) => `<span class="u-vrijednost">${esc(t) || '&nbsp;'}</span>`;
  return `<article class="uplatnica">
    <div class="u-naslov"><b>NALOG ZA PLAĆANJE</b><span>HUB-3A · 2D barkod</span></div>
    <div class="u-lijevo">
      <div class="u-blok"><span class="u-oznaka">Platitelj (naziv / ime i adresa)</span>${v('platIme')}${v('platAdresa')}${v('platMjesto')}</div>
      <div class="u-blok"><span class="u-oznaka">Primatelj (naziv / ime i adresa)</span>${v('primNaziv')}${v('primAdresa')}${v('primMjesto')}</div>
      <div class="u-barkod">${b ? b.svg : `<p class="u-greska">${esc(r.greske[0] || '')}</p>`}</div>
    </div>
    <div class="u-desno">
      <div class="u-red iznos"><div class="u-blok"><span class="u-oznaka">Valuta</span>${v('', 'EUR')}</div>
        <div class="u-blok u-iznos"><span class="u-oznaka">Iznos</span>${v('', d.centi ? '= ' + iznosTekst(d.centi) : '')}</div></div>
      <div class="u-blok"><span class="u-oznaka">IBAN ili broj računa primatelja</span><span class="u-vrijednost mono">${esc(d.iban.replace(/(.{4})/g, '$1 ').trim())}</span></div>
      <div class="u-red poziv"><div class="u-blok"><span class="u-oznaka">Model</span><span class="u-vrijednost mono">HR${esc(d.model)}</span></div>
        <div class="u-blok"><span class="u-oznaka">Poziv na broj primatelja</span><span class="u-vrijednost mono">${esc(d.poziv) || '&nbsp;'}</span></div>
        <div class="u-blok"><span class="u-oznaka">Šifra namjene</span><span class="u-vrijednost mono">${esc(d.sifra) || '&nbsp;'}</span></div></div>
      <div class="u-blok"><span class="u-oznaka">Opis plaćanja</span>${v('opis')}</div>
    </div>
  </article>`;
}

// ---------------- popis (više uplatnica) ----------------
function redovi() {
  return $('#popis').value.split(/\r?\n/).map(r => r.trim()).filter(Boolean).map(r => {
    const s = (r.includes('\t') ? r.split('\t') : r.split(';')).map(x => x.trim());
    return { ...S, platIme: s[0] || '', platAdresa: s[1] || '', platMjesto: s[2] || '', iznos: s[3] || S.iznos, poziv: s[4] || S.poziv, opis: s[5] || S.opis };
  });
}

// ---------------- crtanje ----------------
let zadnji = null;
function nacrtaj() {
  spremiLokalno();
  brojaci();
  const poruke = [], kutija = $('#uplatnice');
  const popis = nacin === 'vise' ? redovi() : [S];
  if (nacin === 'vise' && !popis.length) {
    kutija.innerHTML = '<div class="prazno">Zalijepi popis platitelja lijevo — svaki redak postaje jedna uplatnica.</div>';
    zadnji = null; porukeHtml([]); gumbi(false); return;
  }
  let html = '', ok = 0;
  popis.forEach((u, i) => {
    const r = izgradi(u);
    let b = null;
    if (!r.greske.length) {
      try { b = barkodSvg(r.zapis); ok++; } catch (e) { r.greske.push('Barkod nije izrađen: ' + e.message); }
      if (b && b.visinaMm > 26) r.upoz.push(`Barkod je visok ${String(b.visinaMm).replace('.', ',')} mm, a HUB-3 dopušta najviše 26 mm — skrati nazive ili opis.`);
    }
    const pref = nacin === 'vise' ? `Redak ${i + 1}: ` : '';
    r.greske.forEach(g => poruke.push(['greska', pref + g]));
    if (nacin === 'jedna') r.upoz.forEach(g => poruke.push(['upoz', g]));
    html += uplatnicaHtml(r, b);
    if (nacin === 'jedna') zadnji = b ? { ...b, zapis: r.zapis } : null;
  });
  if (nacin === 'vise') { zadnji = null; poruke.unshift([ok === popis.length ? 'ok' : 'info', `${ok} od ${popis.length} uplatnica spremno za ispis.`]); }
  else if (zadnji) poruke.unshift(['ok', 'Barkod je spreman — skeniraj ga aplikacijom svoje banke (opcija „Skeniraj uplatnicu”).']);
  kutija.innerHTML = html;
  $('#velikiOkvir').hidden = !zadnji;
  $('#veliki').innerHTML = zadnji ? zadnji.svg : '';
  porukeHtml(poruke.slice(0, 12));
  gumbi(nacin === 'vise' ? ok > 0 : !!zadnji);
  ibanPoruka();
}
function porukeHtml(p) {
  const ik = { ok: 'kvacica', upoz: 'oprez', greska: 'oprez', info: 'info' };
  $('#poruke').innerHTML = p.map(([v, t]) => `<div class="poruka ${v}">${AB.ikona(ik[v])}<span>${esc(t)}</span></div>`).join('');
}
function gumbi(ima) { ['#ispisi', '#png', '#svg'].forEach(s => { $(s).disabled = !ima; }); }
function brojaci() {
  for (const el of $$('[data-brojac]')) {
    const k = el.dataset.brojac, n = duljina(ocistiZnakove(S[k]));
    el.textContent = n ? `${n}/${MAKS[k]}` : '';
    el.classList.toggle('preko', n > MAKS[k]);
  }
}
function ibanPoruka() {
  const el = $('#ibanPoruka'), ib = provjeriIban(S.iban);
  const upisano = String(S.iban).replace(/\s/g, '').length;
  el.className = !upisano ? '' : ib.greska ? 'greska' : 'ok';
  el.textContent = !upisano ? '' : ib.greska ? ib.greska : 'IBAN je ispravan.';
  $('#iban').classList.toggle('neispravno', !!(upisano >= 21 && ib.greska));
  const gp = provjeriPoziv(String(S.poziv).replace(/\s+/g, ''), S.model || '00');
  $('#pozivPoruka').className = gp ? 'greska' : '';
  $('#pozivPoruka').textContent = gp;
}

let tajmer;
const osvjezi = () => { clearTimeout(tajmer); tajmer = setTimeout(nacrtaj, 120); };

// ---------------- spremanje, poveznica ----------------
function spremiLokalno() {
  if ($('#zapamti').checked) lokalno.stavi(KLJUC, Object.fromEntries(['primNaziv', 'primAdresa', 'primMjesto', 'iban', 'model', 'sifra', 'opis'].map(k => [k, S[k]])));
}
const b64 = s => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const odB64 = s => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)));

function izPoveznice() {
  const m = location.hash.match(/^#p=([\w-]+)/);
  if (!m) return false;
  try {
    const o = JSON.parse(odB64(m[1]));
    for (const k of PRIMATELJ) if (typeof o[k] === 'string') S[k] = o[k];
    return true;
  } catch { return false; }
}
function postaviPolja() { for (const el of $$('[data-p]')) el.value = S[el.dataset.p] ?? ''; }

// ---------------- pokretanje ----------------
const zapamceno = lokalno.uzmi(KLJUC);
if (zapamceno) { Object.assign(S, zapamceno); $('#zapamti').checked = true; }
if (izPoveznice()) obavijest('Podaci primatelja učitani iz poveznice.');
postaviPolja();

document.addEventListener('input', e => {
  const k = e.target.dataset?.p;
  if (k) { S[k] = e.target.value; osvjezi(); }
  if (e.target.id === 'popis') osvjezi();
});
$$('input[name="nacin"]').forEach(r => r.addEventListener('change', () => {
  nacin = r.value;
  document.body.classList.toggle('vise', nacin === 'vise');
  nacrtaj();
}));
$('#zapamti').addEventListener('change', e => { if (e.target.checked) { spremiLokalno(); obavijest('Primatelj se pamti u ovom pregledniku.'); } else { lokalno.makni(KLJUC); obavijest('Zapamćeni podaci su obrisani.'); } });
$('#ispisi').onclick = () => window.print();
$('#svg').onclick = () => zadnji && spremi(new Blob([zadnji.svg], { type: 'image/svg+xml' }), 'hub3-barkod.svg');
$('#png').onclick = () => {
  if (!zadnji) return;
  const px = 3; // 3 px po modulu ≈ 300 dpi
  const c = document.createElement('canvas');
  c.width = zadnji.modulaX * px; c.height = zadnji.modulaY * px;
  const img = new Image();
  img.onload = () => { const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.imageSmoothingEnabled = false; x.drawImage(img, 0, 0, c.width, c.height); c.toBlob(bl => spremi(bl, 'hub3-barkod.png')); };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(zadnji.svg.replace(/width="[^"]*mm" height="[^"]*mm"/, `width="${c.width}" height="${c.height}"`));
};
$('#poveznica').onclick = () => {
  const o = Object.fromEntries(PRIMATELJ.filter(k => S[k]).map(k => [k, S[k]]));
  if (!o.primNaziv || !o.iban) return obavijest('Najprije upiši naziv i IBAN primatelja.');
  kopiraj(location.href.split('#')[0] + '#p=' + b64(JSON.stringify(o)), 'Poveznica je kopirana.');
};
$('#primjer').onclick = () => {
  Object.assign(S, { primNaziv: '2DBK d.d.', primAdresa: 'Alkarski prolaz 13B', primMjesto: '21230 Sinj', iban: 'HR1210010051863000160', iznos: '123,55', model: '01', poziv: '7269-68499637766-00019', sifra: 'COST', opis: 'Troškovi za 1. mjesec', platIme: 'Željko Seneković', platAdresa: 'Ivanečka ulica 125', platMjesto: '42000 Varaždin' });
  postaviPolja(); nacrtaj();
};
$('#ocisti').onclick = () => {
  S = Object.fromEntries(SVA.map(k => [k, ''])); S.model = '00';
  $('#popis').value = '';
  history.replaceState(null, '', location.pathname);
  postaviPolja(); nacrtaj();
};
nacrtaj();
