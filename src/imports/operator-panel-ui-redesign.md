Do NOT change any backend logic, database structure, reservation logic, or shift calculation.
Do NOT modify how the active shift works.
This is a UI-only improvement.
The goal is to make the operator panel extremely easy to understand for users with low computer literacy, while keeping the interface clean and professional (not outdated, not flashy).
1. Redesign the Mini Status Bar for Clarity
Replace the current compact inline KPI strip with a clearer block-based layout.
Structure:
Create a horizontal container divided into 4 clearly separated blocks.
Each block should have:
A clear title in uppercase (small but readable)
A large number below it
High contrast and strong readability
Generous spacing and padding
Block 1 – Shift
Title:
СМЯНА
Main text (larger and bold):
ДНЕВНА СМЯНА
Below it (smaller text):
02/03 · 08:00 – 20:00
Use a green circle indicator to show active shift.
Make this visually dominant but not oversized.
Block 2 – Arrivals
Title:
ПРИСТИГАНИЯ
Large text:
0 от 1
Do NOT use “0/1”. Use “0 от 1” for clarity.
Block 3 – Departures
Title:
НАПУСКАНИЯ
Large text:
0 от 0
Same structure as arrivals.
Block 4 – Cars in Parking
Title:
КОЛИ В ПАРКИНГА
Large text:
6
Optional smaller text below:
Заетост: 7%
Keep occupancy secondary and visually lighter.
2. Visual Rules
Use soft background (very light neutral gray)
Rounded corners (8–12px)
Subtle border (1px light gray)
No gradients
No strong shadows
No flashy colors
Clean typography with strong hierarchy
Large numbers (18–22px)
Titles smaller but bold enough
Make it feel like a modern control panel, not a SaaS analytics dashboard.
3. Shift Preview Controls
On the right side of the shift block:
Add two clear text buttons:
◀ Предишна смяна
Следваща смяна ▶
Buttons should be:
Text-based
Medium size
Easy to click
Not tiny icons
4. Preview Mode
When user previews another shift:
Change the shift block title to:
ПРЕГЛЕД НА СМЯНА
Add smaller text below:
(Това не е активната смяна)
Add a clear button:
Върни се към активната смяна
Make preview state clearly different but not alarming.
Do NOT use aggressive red.
Use subtle background variation.
5. Important Design Goal
The interface should feel:
Calm
Stable
Clear
Easy to scan in under 2 seconds
Avoid:
Overloading with metrics
Tiny icons
Dense text
Technical formatting
This is an operational tool for real-world parking staff, not a data analytics dashboard.