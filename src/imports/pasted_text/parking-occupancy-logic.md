**Goal:** Fix calendar occupancy logic and improve clarity between *actual cars in parking* and *projected occupancy from reservations*.

---

### 🧠 LOGIC CHANGES

1. **Fix Calendar Calculation**

* Do NOT use current “В ПАРКИНГА” (e.g. 45 cars) as a default for past or future days.
* Each calendar day must calculate occupancy independently using:

**Projected Occupancy (per day) =**

* Cars already parked from previous days

- Confirmed arrivals for that day

* Confirmed departures for that day

2. **Use Confirmed Reservations for Calendar**

* Include all confirmed reservations in projections (even if some may not show).
* This is a **forecasting tool**, not real-time status.

3. **Separate Real vs Projected Data**

* Keep:

  * **“В ПАРКИНГА” = real, physical cars currently parked**
* Calendar should show:

  * **Expected / Projected cars**

---

### 🎨 UI CHANGES

#### Calendar Cells (each day)

* Main number = **Projected cars**
* Below or smaller text:

  * **⬇️ +X arrivals**
  * **⬆️ -Y departures**

Example:

```
19
60
+15 / -7
```

---

#### Today Panel (Right Side)

Add clear separation:

**Section 1: Реално състояние (Live)**

* В ПАРКИНГА: 45
* СВОБОДНИ: 135

**Section 2: Прогноза за днес (Forecast)**

* Очаквани коли: 60
* Пристигания: 15
* Напускания: 7

---

### 🏷 LABELING (VERY IMPORTANT)

Rename:

* Calendar title → **“Очаквана заетост”**
* Tooltip or helper text:
  → “Базирано на потвърдени резервации”

---

### ⚠️ EDGE CASES

* Past dates:

  * If no historical data → show 0 or calculated values (NOT current cars)
* Today:

  * Show BOTH real and projected values
* Future:

  * Only projected values

---

### 🎯 RESULT

* Calendar becomes a **capacity planning tool**
* Dashboard remains **real-time operational tool**
* Eliminates confusion from constant “45” values
* Helps decision-making for availability and overbooking

---

**Keep SkyParking visual style and colors (#053790 / #f1c933).**
