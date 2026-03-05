Do NOT modify any backend logic, shift calculation, reservation logic, or occupancy calculation.
Do NOT change the capacity thresholds or color logic used in the Calendar view.
Use the EXACT SAME occupancy calculation and color thresholds as the Calendar.
This is a UI-only improvement.
Goal
Improve the Shift Status Bar so it is:
Extremely clear for low computer-literacy operators
Simple and calm
Professional (not flashy, not SaaS-analytics style)
Consistent with the Calendar occupancy color logic
1️⃣ Layout Structure
Create a horizontal container divided into 4 structured blocks.
Full width
Moderate height (not oversized)
Soft neutral background
Subtle 1px border
8–10px border radius
Generous spacing
No gradients
No heavy shadows
2️⃣ ACTIVE SHIFT MODE (Default State)
Block 1 — Shift
Title (small, uppercase):
СМЯНА
Main text (larger, bold):
ДНЕВНА СМЯНА
Below:
02/03 · 08:00 – 20:00
Add green dot indicator for active shift.
On the right side of this block:
◀ Предишна смяна
Следваща смяна ▶
Clear, medium-sized text buttons (not tiny icons).
Block 2 — Arrivals
Title:
ПРИСТИГАНИЯ
Large number:
0 от 1
Readable and bold.
No slash format (do NOT use 0/1).
Block 3 — Departures
Title:
НАПУСКАНИЯ
Large number:
0 от 0
Same visual hierarchy as arrivals.
Block 4 — Current Occupancy
Title:
КОЛИ В ПАРКИНГА
Large number:
6
Below it:
Заетост: 7%
Apply the SAME color logic as the Calendar:
Green for low occupancy
Yellow for medium
Red for high
Do NOT change thresholds.
Only color the percentage and add a small 4px vertical colored indicator bar on the left side of this block.
Do NOT color the entire card background red.
Below percentage (smaller text):
Свободни места: 74
3️⃣ PREVIEW MODE
When user clicks previous/next shift:
Change Shift block title to:
ПРЕГЛЕД НА СМЯНА
Below shift name add:
(Това не е активната смяна)
Use subtle gray text.
No alarming colors.
In Preview mode:
Replace “КОЛИ В ПАРКИНГА” block with:
Title:
МАКС. НАТОВАРВАНЕ
Main number:
41 от 80
Below:
51%
Apply SAME occupancy color logic as Calendar.
Below that:
Свободни места при пик: 39
Add one additional block (compact):
Title:
ПИК
Main text:
17:00 – 18:00
Below:
+5 коли
Keep it simple. No charts.
4️⃣ Auto Reset Behavior (Visual Only)
Preview mode is temporary.
It automatically returns to Active Shift after 60 seconds or when changing tabs.
When returning, show a subtle 2-second fade message:
“Върнато към активната смяна”
No popups.
No alerts.
No red warnings.
5️⃣ Design Principles
The interface must feel:
Calm
Stable
Easy to scan in 1–2 seconds
Like a control panel, not analytics software
Avoid:
Flashy UI
Over-animation
Tiny text
Dense layout
SaaS-style KPI dashboards
This is a real-world operational tool for parking staff.