const INK = '#5b5650';

const svg = (body, attrs) => `<svg viewBox="0 0 24 24" ${attrs} aria-hidden="true">${body}</svg>`;
const item = body => svg(body, `fill="none" stroke="${INK}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"`);
const ui = body => svg(body, 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"');

export const ITEM_ICONS = {
  i_loc: item(`<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z" fill="#eba79a"/><circle cx="12" cy="10" r="2.4" fill="#fff"/>`),
  i_traffic: item(`<rect x="5" y="3.5" width="14" height="14" rx="3.5" fill="#8fb3d9"/><rect x="7.5" y="6.5" width="9" height="5" rx="1.2" fill="#fff" stroke="none"/><circle cx="8.5" cy="18.5" r="1.5" fill="${INK}" stroke="none"/><circle cx="15.5" cy="18.5" r="1.5" fill="${INK}" stroke="none"/>`),
  i_env: item(`<circle cx="12" cy="9.5" r="6.5" fill="#9cc5a1"/><path d="M12 16v5"/>`),
  i_room: item(`<rect x="3" y="10" width="18" height="6" rx="2" fill="#b5a8d6"/><path d="M3 16v3.5M21 16v3.5"/><rect x="5.5" y="7" width="6" height="3.5" rx="1.5" fill="#fff"/>`),
  i_share: item(`<circle cx="9" cy="8" r="3.2" fill="#f2d38a"/><path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5z" fill="#f2d38a"/><circle cx="16.5" cy="9" r="2.6" fill="#c9bfb3"/><path d="M15.2 14.4c2.8-.2 5.3 1.8 5.3 5.1"/>`),
  i_bath: item(`<path d="M3 12h18v1.5a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z" fill="#8fb3d9"/><path d="M6 12V6.5a2 2 0 0 1 4 0M7 19.5l-1 1.5M17 19.5l1 1.5"/>`),
  i_light: item(`<circle cx="12" cy="12" r="4.2" fill="#f2d38a"/><path d="M12 2.8v2.2M12 19v2.2M2.8 12H5M19 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M5.4 18.6L7 17M17 7l1.6-1.6"/>`),
  i_deco: item(`<rect x="3" y="4" width="14" height="5" rx="2" fill="#eba79a"/><path d="M15 9v2.5a2 2 0 0 1-2 2h-2v7"/>`),
  i_video: item(`<rect x="3" y="6.5" width="13" height="11" rx="2.5" fill="#8fb3d9"/><path d="M16 10.5l5-3v9l-5-3z" fill="#f2d38a"/>`),
  i_sublet: item(`<circle cx="12" cy="12" r="3" fill="#9cc5a1" stroke="none"/><path d="M19 12a7 7 0 0 1-12.2 4.7M5 12a7 7 0 0 1 12.2-4.7M17.5 4v3.5H14M6.5 20v-3.5H10"/>`),
  i_price: item(`<circle cx="12" cy="13.5" r="6.5" fill="#f2d38a"/><path d="M9.5 4.5h5l-1 3h-3z" fill="#c9bfb3"/><circle cx="12" cy="13.5" r="3"/>`),
  i_safe: item(`<path d="M12 3l7 2.5V11c0 4.5-3 8-7 9-4-1-7-4.5-7-9V5.5z" fill="#9cc5a1"/><path d="M9 12l2.2 2.2L15.5 10" stroke="#fff"/>`),
  i_noise: item(`<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" fill="#8fb3d9"/><path d="M15.5 9.5a3.5 3.5 0 0 1 0 5M18.3 6.8a7 7 0 0 1 0 10.4"/>`),
  i_landlord: item(`<circle cx="9.5" cy="8" r="3.3" fill="#b5a8d6"/><path d="M3.5 20c0-3.4 2.6-6 6-6s6 2.6 6 6z" fill="#b5a8d6"/><circle cx="17.5" cy="16.5" r="3.5" fill="#9cc5a1"/><path d="M16 16.5l1.1 1.1 2-2.1" stroke="#fff"/>`),
  i_hidden: item(`<path d="M6 3h12v17.5l-2.2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 20.5z" fill="#fff"/><path d="M9 8h6M9 12h4"/><circle cx="16.5" cy="16" r="3" fill="#eba79a" stroke="none"/>`),
  i_appl: item(`<rect x="5.5" y="3" width="13" height="18" rx="2.5" fill="#fff"/><path d="M5.5 10h13M8.5 6.5v1.5M8.5 13v3"/>`),
  i_kitchen: item(`<path d="M3.5 11h17v3.5a5.5 5.5 0 0 1-5.5 5.5H9a5.5 5.5 0 0 1-5.5-5.5z" fill="#eba79a"/><path d="M1.5 12.5h2M20.5 12.5h2M9 3.5c-1 1.2 1 2.2 0 3.6M13.5 3.5c-1 1.2 1 2.2 0 3.6"/>`),
  i_contract: item(`<path d="M6 3h8l4 4v14H6z" fill="#fff"/><path d="M14 3v4h4M9 12h6M9 15.5h4"/><circle cx="17.5" cy="18" r="2.5" fill="#f2d38a"/>`),
  i_damp: item(`<path d="M9 3.5c2.6 3.4 5 6 5 9.2a5 5 0 0 1-10 0c0-3.2 2.4-5.8 5-9.2z" fill="#8fb3d9"/><path d="M15 14h5.5M16.5 18h4"/>`),
};

export const FALLBACK_ICON = item(`<path d="M12 3.5l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.5l-5.1 2.7 1-5.7-4.1-4 5.7-.8z" fill="#f2d38a"/>`);

export const itemIcon = id => ITEM_ICONS[id] ?? FALLBACK_ICON;

export const IC = {
  compare: ui(`<path d="M3 20h18M6 20v-6M12 20V5M18 20v-9"/>`),
  export: ui(`<path d="M12 14V3.5M8 7.5l4-4 4 4"/><path d="M4 13v6.5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V13"/>`),
  import: ui(`<path d="M12 3.5V14M8 10.5l4 4 4-4"/><path d="M4 13v6.5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V13"/>`),
  camera: ui(`<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>`),
  gallery: ui(`<rect x="8" y="3.5" width="12.5" height="12" rx="2"/><path d="M4 8v10.5a2 2 0 0 0 2 2h11"/>`),
  info: ui(`<path d="M4 11l8-6.5 8 6.5v8.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M9.5 20.5v-5h5v5"/>`),
  photo: ui(`<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><circle cx="8.5" cy="10" r="1.8"/><path d="M21 16l-5-5-8.5 8.5"/>`),
  link: ui(`<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>`),
  trash: ui(`<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>`),
  plus: ui(`<path d="M12 5v14M5 12h14"/>`),
  calendar: ui(`<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>`),
  reset: ui(`<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4.5V9h4.5"/>`),
  key: ui(`<circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M21 12v2"/>`),
  home: ui(`<path d="M3.5 11L12 4l8.5 7M5.5 9.5V20h13V9.5"/>`),
  rank: ui(`<path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0z"/><path d="M7.5 6H4.5v1.5a3 3 0 0 0 3 3M16.5 6h3v1.5a3 3 0 0 1-3 3M12 13.5V17M8.5 20.5h7"/>`),
  list: ui(`<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.5" cy="6.5" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="17.5" r="1" fill="currentColor"/>`),
  items: ui(`<rect x="3.5" y="4" width="5" height="5" rx="1.2"/><rect x="3.5" y="15" width="5" height="5" rx="1.2"/><path d="M11.5 6.5h9M11.5 17.5h9M11.5 12h9"/>`),
  settings: ui(`<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>`),
};

export const EMPTY_ART = `<svg viewBox="0 0 200 160" aria-hidden="true">
  <ellipse cx="100" cy="146" rx="70" ry="6" fill="#e6e3dc"/>
  <g fill="#dfe9f2"><circle cx="34" cy="40" r="11"/><circle cx="48" cy="33" r="15"/><circle cx="63" cy="42" r="10"/><rect x="24" y="40" width="50" height="12" rx="6"/></g>
  <g fill="#e4ece2"><circle cx="150" cy="30" r="9"/><circle cx="162" cy="24" r="12"/><circle cx="174" cy="32" r="8"/><rect x="142" y="30" width="40" height="10" rx="5"/></g>
  <rect x="58" y="74" width="84" height="66" rx="6" fill="#f2e6cf"/>
  <path d="M46 80L100 34l54 46z" fill="#eba79a"/>
  <rect x="122" y="42" width="10" height="24" rx="2" fill="#b5a8d6"/>
  <rect x="66" y="90" width="16" height="14" rx="3" fill="#8fb3d9"/>
  <rect x="118" y="90" width="16" height="14" rx="3" fill="#8fb3d9"/>
  <path d="M74 90v14M66 97h16M126 90v14M118 97h16" stroke="#fff" stroke-width="2"/>
  <rect x="90" y="100" width="22" height="40" rx="4" fill="#ffb27a"/>
  <circle cx="106" cy="121" r="2" fill="${INK}"/>
  <circle cx="20" cy="126" r="6.5" fill="none" stroke="#f2d38a" stroke-width="4"/>
  <path d="M27 126h22M42 126v6M48 126v4" stroke="#f2d38a" stroke-width="4" stroke-linecap="round"/>
  <path d="M150 136h16l-2 9h-12z" fill="#eba79a"/>
  <g fill="#9cc5a1"><circle cx="158" cy="122" r="8"/><circle cx="150" cy="128" r="5"/><circle cx="166" cy="127" r="5"/></g>
</svg>`;

export const KEY_MOTIF = `<svg viewBox="0 0 24 24" aria-hidden="true">
  <circle cx="8" cy="12" r="4.5" fill="#f2d38a" stroke="${INK}" stroke-width="1.5"/>
  <path d="M12.5 12H21M18 12v3M21 12v2" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>
</svg>`;
