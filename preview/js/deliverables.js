export const STORAGE_BASE =
  'https://atnrdggjbfaosjqafkor.supabase.co/storage/v1/object/public/tto-deliverables';

const GITHUB_RELEASE_BASE =
  'https://github.com/matidiswiss/TTO-Reporting-Agent/releases/download/deliverables-jun-2026';

/** @type {{ label: string; url: string; filename: string; primary?: boolean }[]} */
export const DELIVERABLES = [
  {
    label: 'Download Wound Deck (16 slides)',
    url: `${GITHUB_RELEASE_BASE}/FOLO-Report-TTO-Betadine-Wound-Jun-2026.pptx`,
    filename: 'FOLO - Report TTO Betadine Wound (Jun 2026).pptx',
    primary: true,
  },
  {
    label: 'Download Solution Deck (7 slides)',
    url: `${STORAGE_BASE}/FOLO-Report-TTO-Betadine-Solution-Jun-2026.pptx`,
    filename: 'FOLO - Report TTO Betadine Antiseptic Solution (Jun 2026).pptx',
  },
  {
    label: 'Download Source Excel',
    url: '/exports/TIKTOK ONE REPORT - Betadine Antiseptic Solution (OLV - Online Video).xlsx',
    filename: 'TIKTOK ONE REPORT - Betadine Antiseptic Solution (OLV - Online Video).xlsx',
  },
];
