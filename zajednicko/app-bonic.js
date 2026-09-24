/* app-bonic alati — zajedničko zaglavlje, podnožje i pomoćne funkcije.
   Izvor: GITHUB Projects/_zajednicko (sinkroniziraj-zajednicko.ps1 ga kopira u svaki alat). */
(function () {
  'use strict';

  const IK = {
    novac: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
    oib: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    pdf: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/>',
    slojevi: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
    slika: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    smanji: '<path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/>',
    potpis: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    tablica: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
    lista: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    barkod: '<path d="M3 5v14M7 5v14M10 5v14M14 5v14M17 5v14M21 5v14"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v.01M14 21h7v-4"/>',
    kartica: '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M5 16c.5-1.4 1.7-2 3-2s2.5.6 3 2M14 10h5M14 14h4"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    kljuc: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    pecat: '<path d="M5 22h14M19 18H5a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2zM14 13V9.5a3 3 0 1 0-4 0V13"/>',
    stit: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    mreza: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    preuzmi: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    kopiraj: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    ispis: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    rotiraj: '<path d="M21 2v6h-6"/><path d="M21 13a9 9 0 1 1-3-7.7L21 8"/>',
    smece: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    kvacica: '<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
    oprez: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    osvjezi: '<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15"/>',
    strelica: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    trazi: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  };
  const ikona = (k, cls) => `<svg class="ik${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IK[k] || IK.info}</svg>`;

  // Popis svih alata — mapa = ime repozitorija na GitHubu (app-bonic.github.io/<id>/)
  const ALATI = [
    { id: 'hub3-uplatnice', naziv: 'HUB-3 uplatnice', ik: 'novac', kat: 'Plaćanja i provjere', opis: 'Uplatnica s 2D barkodom (PDF417) koji se skenira mobilnim bankarstvom. Jedna ili više odjednom.' },
    { id: 'oib-provjera', naziv: 'Provjera OIB-a', ik: 'oib', kat: 'Plaćanja i provjere', opis: 'Kontrolna znamenka po ISO 7064 (MOD 11,10), provjera cijelog popisa i provjera IBAN-a.' },
    { id: 'pdf-alati', naziv: 'PDF alati', ik: 'slojevi', kat: 'PDF', opis: 'Spajanje, razdvajanje, rotiranje, brisanje i premještanje stranica PDF-a.' },
    { id: 'slike-pdf', naziv: 'Slike ↔ PDF', ik: 'pdf', kat: 'PDF', opis: 'Slike u jedan PDF (A4 ili veličina slike) i PDF u slike (PNG/JPG).' },
    { id: 'pdf-potpis', naziv: 'Potpis i pečat na PDF', ik: 'potpis', kat: 'PDF', opis: 'Nacrtaj potpis ili učitaj pečat i postavi ga bilo gdje na stranicu PDF-a.' },
    { id: 'slike-kompresija', naziv: 'Smanji slike', ik: 'smanji', kat: 'Slike', opis: 'Kompresija i promjena veličine slika, JPG/WebP/PNG, uklanja EXIF i GPS podatke.' },
    { id: 'tablice-pretvorba', naziv: 'CSV ↔ Excel ↔ JSON', ik: 'tablica', kat: 'Podaci i tekst', opis: 'Pretvorba tablica između CSV, Excela (XLSX, XLS, ODS) i JSON-a, s pregledom.' },
    { id: 'sredi-popis', naziv: 'Sredi popis', ik: 'lista', kat: 'Podaci i tekst', opis: 'Uklanjanje duplikata, praznih redaka i sortiranje po hrvatskoj abecedi.' },
    { id: 'barkodovi', naziv: 'Barkodovi i naljepnice', ik: 'barkod', kat: 'Kodovi i oznake', opis: 'EAN-13, EAN-8, Code128, Code39… i arci naljepnica za ispis.' },
    { id: 'qr-radionica', naziv: 'QR Radionica', ik: 'qr', kat: 'Kodovi i oznake', opis: 'QR kodovi s bojama, logom i vlastitim oblicima — URL, WiFi, vCard, događaj…' },
    { id: 'vcard-posjetnice', naziv: 'vCard posjetnice', ik: 'kartica', kat: 'Kodovi i oznake', opis: 'Posjetnica s QR kodom koji sprema kontakt u mobitel, arak za ispis.' },
    { id: 'email-potpis', naziv: 'E-mail potpis', ik: 'mail', kat: 'Ured', opis: 'HTML potpis za Outlook, Gmail i Thunderbird — nekoliko predložaka, kopiraj jednim klikom.' },
    { id: 'generator-lozinki', naziv: 'Generator lozinki', ik: 'kljuc', kat: 'Ured', opis: 'Jake nasumične lozinke i fraze od hrvatskih riječi, s procjenom jačine.' },
    { id: 'urudzbeni-broj', naziv: 'KLASA i URBROJ', ik: 'pecat', kat: 'Ured', opis: 'Generator klasifikacijskih oznaka i urudžbenih brojeva po predlošku, s evidencijom.' },
  ];

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const trenutni = document.body.dataset.alat || '';
  const url = id => id === trenutni ? './' : `../${id}/`;

  function zaglavlje() {
    const el = $('.ab-vrh');
    if (!el) return;
    el.innerHTML = `<div class="ab-vrh-unutra">
      <a class="ab-marka" href="${url('alati')}"><img src="zajednicko/logo.png" alt="" width="40" height="40"><span><b>app-bonic</b><small>Besplatni alati</small></span></a>
      ${trenutni !== 'alati' ? `<nav><a href="${url('alati')}">${ikona('mreza')} Svi alati</a></nav>` : ''}
    </div>`;
  }

  function podnozje() {
    const el = $('.ab-dno');
    if (!el) return;
    const god = new Date().getFullYear();
    el.innerHTML = `<div class="ab-dno-unutra">
      <div class="ab-gdpr">
        <span class="oznaka-crvena">GDPR</span>
        <b>Tvoji podaci ne napuštaju tvoje računalo</b>
        <p>Alat radi u potpunosti u tvom pregledniku. Ništa od onoga što upišeš ili učitaš ne šalje se na poslužitelj, ne sprema se u oblak i ne prati se — nema kolačića ni analitike. Zato je pogodan za rad s osobnim podacima (OIB, IBAN, ugovori, fotografije). Radi i bez interneta, nakon što se stranica jednom učita.</p>
      </div>
      <div class="ab-ostali"><h3>Svi alati</h3><ul>${ALATI.map(a =>
        `<li><a href="${url(a.id)}"${a.id === trenutni ? ' aria-current="page"' : ''}>${ikona(a.ik)}${esc(a.naziv)}</a></li>`).join('')}</ul></div>
      <div class="ab-potpis"><img src="zajednicko/logo.png" alt="" width="28" height="28"><span>© ${god} app-bonic · besplatni alati bez registracije</span><a href="${url('alati')}">Kazalo alata</a><a href="https://github.com/app-bonic" rel="noopener">GitHub</a></div>
    </div>`;
  }

  let tajmer;
  function obavijest(t) {
    let el = $('.obavijest');
    if (!el) { el = document.createElement('div'); el.className = 'obavijest'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = t;
    el.classList.add('vidljiv');
    clearTimeout(tajmer);
    tajmer = setTimeout(() => el.classList.remove('vidljiv'), 2800);
  }

  function spremi(blob, ime) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = ime;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  }

  async function kopiraj(tekst, poruka = 'Kopirano.') {
    try { await navigator.clipboard.writeText(tekst); }
    catch {
      const t = document.createElement('textarea');
      t.value = tekst; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove();
    }
    obavijest(poruka);
  }

  const velicina = b => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1).replace('.', ',') + ' KB' : (b / 1048576).toFixed(2).replace('.', ',') + ' MB';

  // Područje za ubacivanje datoteka: klik ili povuci-i-ispusti
  function dropzona(el, naDatoteke, { accept = '', visestruko = true } = {}) {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = accept;
    inp.multiple = visestruko;
    el.appendChild(inp);
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.addEventListener('click', e => { if (e.target !== inp) inp.click(); });
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inp.click(); } });
    inp.addEventListener('change', () => { if (inp.files.length) naDatoteke([...inp.files]); inp.value = ''; });
    ['dragenter', 'dragover'].forEach(t => el.addEventListener(t, e => { e.preventDefault(); el.classList.add('iznad'); }));
    ['dragleave', 'drop'].forEach(t => el.addEventListener(t, e => { e.preventDefault(); el.classList.remove('iznad'); }));
    el.addEventListener('drop', e => { const f = [...(e.dataTransfer?.files || [])]; if (f.length) naDatoteke(visestruko ? f : f.slice(0, 1)); });
  }

  const lokalno = {
    uzmi(k, zadano = null) { try { const v = localStorage.getItem(k); return v === null ? zadano : JSON.parse(v); } catch { return zadano; } },
    stavi(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* blokirano */ } },
    makni(k) { try { localStorage.removeItem(k); } catch { /* blokirano */ } },
  };

  // ikone u HTML-u: <span data-ik="preuzmi"></span>
  function ikoneUHtml(root = document) { $$('[data-ik]', root).forEach(s => { s.outerHTML = ikona(s.dataset.ik, s.className); }); }
  // hrvatska množina: mn(5, 'stranica', 'stranice', 'stranica')
  const mn = (n, jedan, dva, pet) => { const d = n % 10, s = n % 100; return d === 1 && s !== 11 ? jedan : d >= 2 && d <= 4 && (s < 12 || s > 14) ? dva : pet; };

  window.AB = { $, $$, esc, ikona, IK, ALATI, obavijest, spremi, kopiraj, velicina, dropzona, lokalno, ikoneUHtml, url, mn };

  zaglavlje();
  podnozje();
  ikoneUHtml();
})();
