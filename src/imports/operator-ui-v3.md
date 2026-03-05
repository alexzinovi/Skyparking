**Figma AI Prompt — Clean Operator UI v3 (SkyParking Admin Panel)**

Do NOT modify any backend logic, reservation logic, shift calculations, occupancy calculations, or database structure.

This is strictly a **visual UI and layout improvement** for the operator panel.

The interface must remain extremely simple for operators with low computer literacy.
The design should feel like a **clean operations control panel**, not a SaaS analytics dashboard.

---

# 1. Improve the Shift Header

Create a compact horizontal shift header.

Left side:

● **ДНЕВНА СМЯНА**
05/03 · 08:00–20:00

Right side navigation buttons:

◀ **Предишна**
**ДНЕС**
**Следваща ▶**

Button rules:

* Medium size buttons
* Easy to click
* “ДНЕС” should have a subtle highlight to indicate the default state
* Buttons must be visually grouped with the shift header

Remove the separate “Back to active shift” button if present.

---

# 2. KPI Row (Main Operational Metrics)

Below the shift header create **three compact KPI cards**.

Card rules:

* Height: ~70–80px
* Rounded corners: 8px
* Subtle border
* Light neutral background
* Consistent padding
* Left-aligned content
* Strong typography hierarchy

---

## Card 1 — Arrivals

Title (small uppercase):

ПРИСТИГАНИЯ

Main value (large bold):

1 от 3

---

## Card 2 — Departures

Title:

НАПУСКАНИЯ

Main value:

0 от 0

---

## Card 3 — Cars in Parking

Title:

КОЛИ В ПАРКИНГА

Main value:

6

Below:

Заетост: 12%

Apply the **same occupancy color logic used in the Calendar**.

Only color the percentage or show a small 4px colored indicator bar.

Below that:

Свободни места: 176

---

# 3. Preview Mode

When a user navigates to another shift:

Change header to:

👁 **ПРЕГЛЕД НА СМЯНА**
06/03 · 08:00–20:00

Below header add subtle text:

(не е активната смяна)

Use neutral gray color.

---

# 4. Peak Information (Preview Only)

Remove any block labeled **“ПИК НАТОВАРВАНЕ”**.

Instead show two compact informational cards below the KPI row.

---

## Peak Arrivals

Title:

ПИК ПРИСТИГАНИЯ

Main value:

17:00 – 18:00

Below:

5 коли

---

## Peak Departures

Title:

ПИК НАПУСКАНИЯ

Main value:

14:00 – 15:00

Below:

3 коли

---

# 5. Visual Design Rules

The interface must feel:

* Calm
* Stable
* Operational
* Easy to scan in under 2 seconds

Avoid:

* Large empty cards
* Heavy shadows
* Analytics-style charts
* Overly complex widgets
* Centered text blocks

Use:

* Left-aligned text
* Strong typography hierarchy
* Compact layout
* Clear spacing
* Minimal colors

Operators must instantly understand:

• which shift they are in
• how many cars arrive
• how many cars depart
• how many cars are currently parked
• when the busiest arrival and departure hours occur
