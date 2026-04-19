# Light

Fonts
Import DM_Sans (weights 300, 400, 500) and DM_Serif_Display (weight 400) from next/font/google. Use DM Serif Display only for page titles and modal headings. Use DM Sans for everything else.
Color palette
The entire UI is monochrome. No brand colors, no gradients.

Background: bg-white / bg-slate-50 for page, bg-slate-100 for hover fills
Text: text-slate-900 (primary), text-slate-500 (secondary), text-slate-400 (muted/labels)
Borders: border-slate-200 (default), border-slate-100 (dividers)
Primary action: bg-[#1a1a1a] with text-white, hover bg-slate-800
Semantic only (never decorative): bg-blue-50 text-blue-500 for DSA, bg-amber-50 text-amber-500 for Q&A, bg-amber-400 fill-amber-400 for favorites/stars, bg-red-50 text-red-400 for destructive actions

Border radius

Cards / containers: rounded-[10px] or rounded-[12px]
Buttons, inputs, icon buttons, badges: rounded-[7px]
Avatars / pills / tags: rounded-full
Code blocks: rounded-[10px]
Never use sharp corners (rounded-none) except on full-bleed dividers

Borders
Always border border-slate-200 at 1px (Tailwind default). Never thicker except a border-l-[2.5px] border-[#1a1a1a] left accent on featured/pinned cards.
Spacing & sizing

Navbar height: h-[52px]
Sidebar width: w-[220px]
Button height: h-8 (small), h-9 (default), h-10 (large CTA)
Icon size: h-[15px] w-[15px] in nav, h-3.5 w-3.5 in buttons, h-4 w-4 in content
Card padding: p-5 (standard), p-4 (compact)
Section gaps: gap-5 between sections, gap-2 to gap-3 between related items

Typography scale

Page title: text-xl or text-2xl, DM Serif Display, tracking-tight
Section heading: text-[13px] font-medium text-slate-900
Body: text-[13px] font-normal text-slate-600, line-height: 1.6
Labels / meta: text-[11px] text-slate-400
Uppercase labels: text-[10.5px] font-medium uppercase tracking-widest text-slate-400
Badges: text-[10.5px] font-medium uppercase tracking-wider, rounded-full, soft colored bg
Never use font-bold — max weight is font-medium (500)

Buttons

Primary: h-9 px-4 rounded-[7px] bg-[#1a1a1a] text-white text-[12.5px] font-medium hover:bg-slate-800 transition-colors
Secondary / outline: h-8 px-3 rounded-[7px] border border-slate-200 text-[12.5px] font-medium text-slate-600 hover:bg-slate-50 transition-colors
Icon button: h-8 w-8 flex items-center justify-center rounded-[7px] text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors
Destructive: same as outline but text-red-400 hover:bg-red-50 hover:border-red-200

Nav items (sidebar)

Default: flex items-center gap-2.5 px-2.5 py-[7px] rounded-[7px] text-[13px] text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors
Active: bg-[#1a1a1a] text-white font-medium
Icons: h-[15px] w-[15px] opacity-70 (full opacity when active)

Cards

Default: rounded-[10px] border border-slate-200 bg-white overflow-hidden
Hover: hover:border-slate-300 transition-colors
Featured/pinned: add border-l-[2.5px] border-l-[#1a1a1a] rounded-l-none
Stat card: same border + rounded, p-4, muted uppercase label + large number

Inputs / search

h-8 rounded-[7px] border border-slate-200 bg-slate-50 text-[12.5px] outline-none transition-all focus:border-slate-300 focus:bg-white placeholder:text-slate-400

Dividers

Horizontal: border-t border-slate-100 (between sections) or border-b border-slate-100 (under headers)
Vertical: w-px h-5 bg-slate-100 (in navbar between groups)

Dropdowns / overlays

rounded-[7px] border border-slate-200 bg-white shadow-lg overflow-hidden
Items: px-2.5 py-2 rounded-[5px] hover:bg-slate-50 transition-colors text-[12.5px]

Modals

Backdrop: fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm
Panel: w-full max-w-sm mx-4 rounded-[12px] border border-slate-200 bg-white p-6 shadow-xl
Title: DM Serif Display, text-[17px] text-slate-900
Use motion from motion/react with initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}

Code blocks

Container: rounded-[10px] overflow-hidden border border-slate-800 bg-[#0d1117]
Header bar: border-b border-slate-700/60 px-4 py-2.5, language label text-[12px] font-medium text-slate-400
Copy button: icon + text label, text-[11px] text-slate-500 hover:text-slate-300 transition-colors
SyntaxHighlighter: fontSize: '0.75rem', lineHeight: '1.6', background: 'transparent'

Animations

All interactive elements: transition-colors (default), transition-all only when size also changes
Skeleton loaders: animate-pulse bg-slate-50 rounded-[7px]
No scale transforms except modals

Layout

Root: flex h-screen overflow-hidden bg-slate-50
Sidebar: sticky top-0 h-screen flex-col, full height, border-r border-slate-100
Content column: flex flex-1 flex-col min-w-0
Navbar: sticky top-0 z-50 border-b border-slate-100 bg-white h-[52px]
Main: flex-1 overflow-y-auto p-6 lg:p-10
Max content width: max-w-6xl mx-auto

General rules

No font-bold anywhere — use font-medium as the maximum weight
No emerald, purple, or other brand colors in UI chrome — only in semantic/data contexts
No sharp corners on interactive elements
Always transition-colors on hover states
Prefer text-[Xpx] over Tailwind text scale for precision
Use cn() from @/lib/utils for conditional classes
DM Serif Display only for h1-level titles and modal headings, never for body or UI chrome

# Dark

Fonts
Import DM_Sans (weights 300, 400, 500) and DM_Serif_Display (weight 400) from next/font/google. Use DM Serif Display only for page titles and modal headings. Use DM Sans for everything else.
Color palette — dark
The entire UI is dark monochrome. No gradients, no glow, no neon.

Root background: bg-[#0f0f0f]
Surface (cards, navbar, sidebar): bg-[#161616]
Elevated surface (inputs, dropdowns, hover fills): bg-[#1e1e1e]
Subtle hover fill: bg-[#232323]
Border default: border-[#2a2a2a]
Border subtle (dividers): border-[#222222]
Border emphasis (focused inputs): border-[#3a3a3a]
Text primary: text-[#ededed]
Text secondary: text-[#888888]
Text muted / labels: text-[#555555]
Primary action: bg-[#ededed] with text-[#0f0f0f], hover bg-[#d4d4d4]
Semantic (never decorative): bg-blue-950 text-blue-400 for DSA, bg-amber-950 text-amber-400 for Q&A, fill-amber-400 text-amber-400 for favorites, bg-red-950 text-red-400 for destructive

Border radius

Cards / containers: rounded-[10px] or rounded-[12px]
Buttons, inputs, icon buttons, badges: rounded-[7px]
Avatars / pills / tags: rounded-full
Code blocks: rounded-[10px]
Never use sharp corners

Borders
Always border border-[#2a2a2a] (1px). Never thicker except a border-l-[2.5px] border-l-[#ededed] left accent on featured/pinned cards.
Spacing & sizing

Navbar height: h-[52px]
Sidebar width: w-[220px]
Button height: h-8 (small), h-9 (default), h-10 (large CTA)
Icon size: h-[15px] w-[15px] in nav, h-3.5 w-3.5 in buttons, h-4 w-4 in content
Card padding: p-5 (standard), p-4 (compact)
Section gaps: gap-5 between sections, gap-2 to gap-3 between related items

Typography scale

Page title: text-xl or text-2xl, DM Serif Display, tracking-tight, text-[#ededed]
Section heading: text-[13px] font-medium text-[#ededed]
Body: text-[13px] font-normal text-[#888888], line-height: 1.6
Labels / meta: text-[11px] text-[#555555]
Uppercase labels: text-[10.5px] font-medium uppercase tracking-widest text-[#555555]
Badges: text-[10.5px] font-medium uppercase tracking-wider, rounded-full, dark semantic bg
Never use font-bold — max weight is font-medium (500)

Buttons

Primary: h-9 px-4 rounded-[7px] bg-[#ededed] text-[#0f0f0f] text-[12.5px] font-medium hover:bg-[#d4d4d4] transition-colors
Secondary / outline: h-8 px-3 rounded-[7px] border border-[#2a2a2a] text-[12.5px] font-medium text-[#888888] hover:bg-[#1e1e1e] hover:text-[#ededed] transition-colors
Icon button: h-8 w-8 flex items-center justify-center rounded-[7px] text-[#555555] hover:bg-[#1e1e1e] hover:text-[#ededed] transition-colors
Destructive: same as outline but text-red-400 hover:bg-red-950 hover:border-red-900

Nav items (sidebar)

Default: flex items-center gap-2.5 px-2.5 py-[7px] rounded-[7px] text-[13px] text-[#555555] hover:bg-[#1e1e1e] hover:text-[#ededed] transition-colors
Active: bg-[#ededed] text-[#0f0f0f] font-medium
Icons: h-[15px] w-[15px] opacity-60 (full opacity when active)
Section label: text-[9.5px] font-medium uppercase tracking-[0.1em] text-[#3a3a3a]

Cards

Default: rounded-[10px] border border-[#2a2a2a] bg-[#161616] overflow-hidden
Hover: hover:border-[#3a3a3a] transition-colors
Featured/pinned: add border-l-[2.5px] border-l-[#ededed] rounded-l-none
Stat card: same border + rounded, p-4, muted uppercase label + large number in text-[#ededed]

Card headers (section label bars)

border-b border-[#222222] bg-[#161616] px-5 py-3
Label: text-[10.5px] font-medium uppercase tracking-widest text-[#555555]

Inputs / search

h-9 rounded-[7px] border border-[#2a2a2a] bg-[#1e1e1e] text-[12.5px] text-[#ededed] outline-none transition-all focus:border-[#3a3a3a] focus:bg-[#232323] placeholder:text-[#444444] px-3.5
On focus within a white card surface: focus:bg-[#232323]

Textareas

Same as inputs but resize-none, leading-6, p-5, no fixed height — use min-h-[120px] or min-h-[420px]
Always inside a card with a labeled header bar

Dividers

Horizontal: border-t border-[#222222]
Vertical: w-px h-5 bg-[#2a2a2a]

Tags / pills

bg-[#1e1e1e] text-[#888888] border border-[#2a2a2a] px-2.5 py-1 text-[10.5px] font-medium rounded-full
Remove button inside: text-[#444444] hover:text-red-400 transition-colors

Dropdowns / overlays

rounded-[7px] border border-[#2a2a2a] bg-[#161616] shadow-2xl overflow-hidden
Items: px-2.5 py-2 rounded-[5px] text-[12.5px] text-[#888888] hover:bg-[#1e1e1e] hover:text-[#ededed] transition-colors

Search bar

Container: h-8 rounded-[7px] border border-[#2a2a2a] bg-[#1e1e1e]
Icon: text-[#444444]
Kbd hint: bg-[#1e1e1e] border border-[#2a2a2a] text-[#444444] text-[10px] rounded px-1.5 py-0.5

Modals

Backdrop: fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm
Panel: w-full max-w-sm mx-4 rounded-[12px] border border-[#2a2a2a] bg-[#161616] p-6 shadow-2xl
Title: DM Serif Display, text-[17px] text-[#ededed]
Body text: text-[13px] text-[#555555]
Use motion from motion/react with initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}

Code blocks

Container: rounded-[10px] overflow-hidden border border-[#2a2a2a] bg-[#0d1117]
Header: border-b border-[#2a2a2a] px-4 py-2.5 bg-[#161616]
Language label: text-[12px] font-medium text-[#555555]
Copy button: icon + text, text-[11px] text-[#555555] hover:text-[#ededed] transition-colors
SyntaxHighlighter: fontSize: '0.75rem', lineHeight: '1.6', background: 'transparent'

Skeleton loaders

animate-pulse bg-[#1e1e1e] rounded-[7px]

Animations

All interactive elements: transition-colors
transition-all only when size also changes
No scale transforms except modals (scale: 0.96 → 1)

Sidebar

Background: bg-[#161616], border-r border-[#222222]
Logo mark: bg-[#ededed] box with text-[#0f0f0f] icon inside
Logo wordmark: DM Serif Display, text-[16px] text-[#ededed]
User chip: hover:bg-[#1e1e1e], avatar bg-[#2a2a2a] text-[#888888]

Navbar

Background: bg-[#161616], border-b border-[#222222], h-[52px]
Brand name: DM Serif Display, text-[15px] text-[#ededed]

Layout

Root: flex h-screen overflow-hidden bg-[#0f0f0f]
Sidebar: sticky top-0 h-screen, border-r border-[#222222], bg-[#161616]
Content column: flex flex-1 flex-col min-w-0
Navbar: sticky top-0 z-50 bg-[#161616] border-b border-[#222222] h-[52px]
Main: flex-1 overflow-y-auto p-6 lg:p-10 bg-[#0f0f0f]
Max content width: max-w-6xl mx-auto

General rules

No font-bold — font-medium is the maximum weight
No colored accents in UI chrome — semantic colors only in data/content contexts
No sharp corners on interactive elements
Always transition-colors on hover states
Prefer text-[Xpx] over Tailwind text scale for precision
Use cn() from @/lib/utils for conditional classes
DM Serif Display only for h1-level titles and modal headings
Three surface levels only: #0f0f0f (page) → #161616 (card/surface) → #1e1e1e (input/elevated). Never introduce a fourth level or mix light surfaces