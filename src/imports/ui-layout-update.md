Do NOT modify any backend logic, reservation logic, shift calculation, or occupancy calculation.

Keep the existing occupancy logic and color thresholds exactly the same as the Calendar view.

This is a UI layout and visual hierarchy improvement only.

The interface must remain extremely simple for operators who do not use computers frequently.

Avoid complex dashboards or SaaS-style analytics layouts.

1. Improve the Shift Header

Replace the current large shift card with a compact shift header.

Layout:

Left side:

● ДНЕВНА СМЯНА
05/03 · 08:00 – 20:00

Right side:

[ ◀ Предишна смяна ]
[ Следваща смяна ▶ ]

Typography:

Shift name: bold

Time range: smaller, secondary color

Green dot for active shift

The shift header should look like a status line, not a large card.

2. Redesign KPI Blocks (More Compact)

Below the shift header create three compact KPI blocks.

They must be horizontally aligned.

Each block height should be 70–80px max.

Avoid excessive vertical padding.

Block 1 – Arrivals

Title (small uppercase):

ПРИСТИГАНИЯ

Main number (large):

1 от 3

Make the number visually dominant.

Block 2 – Departures

Title:

НАПУСКАНИЯ

Main number:

0 от 0

Same visual hierarchy as arrivals.

Block 3 – Cars in Parking

Title:

КОЛИ В ПАРКИНГА

Main number:

6

Below it:

Заетост: 12%

Apply the exact same color logic used in the Calendar:

Green / Yellow / Red.

Do NOT change thresholds.

Below occupancy add:

Свободни места: 177

Add a small colored indicator bar on the left side of this block based on occupancy.

Do NOT color the entire background.

3. Improve Visual Hierarchy

Numbers must dominate visually.

Recommended typography:

Main numbers:
20–24px bold

Labels:
12–13px uppercase

Secondary text:
13px normal

Avoid thin font weights.

Text must remain readable during scrolling.

4. Preview Mode Layout

When user navigates to another shift (preview mode):

Change shift header to:

ПРЕГЛЕД НА СМЯНА

Below shift name add:

(не е активната смяна)

Use neutral gray text.

Do NOT use red warning colors.

5. Peak Information (Separated)

When in preview mode add two additional compact blocks below the KPIs.

These show peak load information.

Peak Arrivals

Title:

ПИК ПРИСТИГАНИЯ

Main text:

17:00 – 18:00

Below:

5 коли

Peak Departures

Title:

ПИК НАПУСКАНИЯ

Main text:

10:00 – 11:00

Below:

4 коли

Keep these blocks visually smaller than the main KPIs.

No charts.

No graphs.

Only simple readable information.

6. Design Principles

The interface should feel like an operations control panel, not an analytics dashboard.

Focus on:

clarity

strong typography

compact layout

minimal colors

easy scanning in under 2 seconds

Avoid:

large empty cards

oversized padding

heavy shadows

complex widgets

data visualizations

Operators should instantly understand:

• which shift they are in
• how many cars arrive
• how many cars depart
• how full the parking is
• when the busiest hours are