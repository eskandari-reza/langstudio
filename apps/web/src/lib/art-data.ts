// Brand logo mark and the hero illustration, as inline SVG markup.
// The logo always uses the same pink-violet gradient; the hero follows the theme variables.

export const LOGO_MARK = `
<defs>
  <linearGradient id="langstudio-lg" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#ff7ab8"/>
    <stop offset="1" stop-color="#9b8cff"/>
  </linearGradient>
</defs>
<path d="M28 6c2.2 15 7.5 21 23 24-15.5 3-20.8 9-23 24-2.2-15-7.5-21-23-24 15.5-3 20.8-9 23-24Z" fill="url(#langstudio-lg)" stroke="url(#langstudio-lg)" stroke-width="3" stroke-linejoin="round"/>
<path d="M50 8c.8 5 2.6 7 8 8-5.4 1-7.2 3-8 8-.8-5-2.6-7-8-8 5.4-1 7.2-3 8-8Z" fill="#ffb86b" stroke="#ffb86b" stroke-width="1.5" stroke-linejoin="round"/>
<circle cx="49" cy="50" r="4" fill="#ffb86b"/>
<circle cx="12" cy="54" r="2.2" fill="#ff7ab8"/>
`;

// full favicon: gradient tile + white sparkle
export const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<defs><linearGradient id="g" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ff7ab8"/><stop offset="1" stop-color="#9b8cff"/></linearGradient></defs>
<rect width="64" height="64" rx="18" fill="url(#g)"/>
<path d="M30 11c2 13 6.500 18 20 21-13.500 3-18 8-20 21-2-13-6.500-18-20-21 13.500-3 18-8 20-21Z" fill="#fff" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>
<path d="M49 11c.7 4 2.200 5.500 6.500 6.500-4.300 1-5.800 2.500-6.500 6.500-.7-4-2.200-5.500-6.500-6.500 4.300-1 5.800-2.500 6.500-6.500Z" fill="#ffe3b8"/>
</svg>`;

const O = 'stroke="var(--outline)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
const CLOUD = "M13 37a8 8 0 0 1-1-16 11 11 0 0 1 21-2 9 9 0 0 1 1 18Z";
const SPARK = "M24 4c1 9 4 12 14 14-10 2-13 5-14 14-1-9-4-12-14-14 10-2 13-5 14-14Z";
const STAR = "M24 6l5.2 11 12 1.6-8.8 8.4 2.2 12L24 33l-10.6 6 2.2-12-8.8-8.4 12-1.6Z";
const HEART = "M24 40S6 29.5 6 17.5a9.5 9.5 0 0 1 18-4 9.5 9.5 0 0 1 18 4C42 29.5 24 40 24 40Z";
const TW = 'class="twinkle" style="transform-box:fill-box;transform-origin:center"';

export const HERO_ART = `
<ellipse cx="240" cy="372" rx="260" ry="78" fill="var(--secondary)"/>
<ellipse cx="90" cy="368" rx="150" ry="56" fill="var(--icon-a)" opacity=".8"/>
<ellipse cx="400" cy="372" rx="130" ry="52" fill="var(--icon-a)" opacity=".65"/>

<g class="floaty" style="transform-box:fill-box;transform-origin:center">
  <g transform="translate(28 38) scale(2.3)"><path d="${CLOUD}" fill="var(--card)" ${O} stroke-width="1.4"/></g>
</g>
<g transform="translate(330 60) scale(1.7)"><path d="${CLOUD}" fill="var(--card)" ${O} stroke-width="1.8"/></g>

<!-- left tower -->
<rect x="146" y="218" width="48" height="118" rx="7" fill="var(--card)" ${O}/>
<path d="M138 222 170 160l32 62Z" fill="var(--primary)" ${O}/>
<path d="M170 160v-22" ${O}/><path d="M170 138l24 8-24 8Z" fill="var(--accent)" ${O} stroke-width="2.4"/>
<circle cx="170" cy="258" r="7" fill="var(--secondary)" ${O} stroke-width="2.4"/>

<!-- right tower -->
<rect x="286" y="218" width="48" height="118" rx="7" fill="var(--card)" ${O}/>
<path d="M278 222 310 160l32 62Z" fill="var(--primary)" ${O}/>
<path d="M310 160v-22" ${O}/><path d="M310 138l24 8-24 8Z" fill="var(--accent)" ${O} stroke-width="2.4"/>
<circle cx="310" cy="258" r="7" fill="var(--secondary)" ${O} stroke-width="2.4"/>

<!-- keep -->
<rect x="192" y="206" width="96" height="130" rx="8" fill="var(--card)" ${O}/>
<path d="M192 206v-14h14v8h14v-8h14v8h14v-8h14v8h14v-8h14v14" fill="var(--card)" ${O}/>

<!-- central spire -->
<rect x="212" y="138" width="56" height="68" rx="7" fill="var(--card)" ${O}/>
<path d="M203 142 240 70l37 72Z" fill="var(--primary)" ${O}/>
<path d="M240 70V44" ${O}/><path d="M240 44l28 9-28 9Z" fill="var(--accent)" ${O} stroke-width="2.4"/>
<circle cx="240" cy="172" r="9" fill="var(--secondary)" ${O} stroke-width="2.4"/>

<!-- door + windows -->
<path d="M224 336v-32a16 16 0 0 1 32 0v32Z" fill="var(--accent)" ${O}/>
<circle cx="251" cy="322" r="2.2" fill="var(--outline)"/>
<rect x="206" y="236" width="14" height="22" rx="7" fill="var(--secondary)" ${O} stroke-width="2.4"/>
<rect x="260" y="236" width="14" height="22" rx="7" fill="var(--secondary)" ${O} stroke-width="2.4"/>

<!-- decorations -->
<g ${TW}><g transform="translate(66 118) scale(.9)"><path d="${SPARK}" fill="var(--primary)" opacity=".85"/></g></g>
<g ${TW}><g transform="translate(398 120) scale(.75)"><path d="${STAR}" fill="var(--accent)" ${O} stroke-width="2"/></g></g>
<g ${TW}><g transform="translate(118 44) scale(.6)"><path d="${SPARK}" fill="var(--accent)"/></g></g>
<g ${TW}><g transform="translate(428 214) scale(.65)"><path d="${SPARK}" fill="var(--primary)" opacity=".8"/></g></g>
<g class="floaty" style="transform-box:fill-box;transform-origin:center"><g transform="translate(60 226) scale(.8)"><path d="${HEART}" fill="var(--primary)" ${O} stroke-width="2.2"/></g></g>
<g transform="translate(376 262) scale(.55)"><path d="${HEART}" fill="var(--accent)" ${O} stroke-width="2.6"/></g>
<g transform="translate(414 36) scale(1.1)"><path d="M31 6a18 18 0 1 0 11 28A15 15 0 0 1 31 6Z" fill="var(--accent)" ${O} stroke-width="2"/></g>
`;
