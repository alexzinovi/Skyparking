Goal: redesign and fix the **Приходи / Revenue** section in the SkyParking admin dashboard so that **historical revenue**, **future revenue forecast**, and **exports** work correctly and are easy to understand.

Use the existing SkyParking admin style. Keep the design clean, operational, and suitable for shift staff. Preserve Bulgarian UI language.

---

## 1) FIX THE REVENUE LOGIC

Separate revenue into **two distinct modes**:

### A. Historical / Actual Revenue

This is for **past dates and past periods**.
It must include only reservations that are:

* **Paid**
* and whose payment is actually collected

Historical revenue must show:

* **Total collected revenue**
* **Cash total**
* **Card total**
* **Number of paid reservations**

Do NOT use confirmed unpaid reservations in historical actual revenue.

---

### B. Future Estimation / Forecast Revenue

This is for **future dates and future periods**.
It must include:

* **Confirmed reservations**
* regardless of whether payment is already collected or not

Forecast revenue should show:

* **Expected total revenue from confirmed reservations**
* **Number of confirmed reservations**
* optional small breakdown:

  * already prepaid
  * unpaid but confirmed

Do NOT mix future forecast with actual collected revenue.

---

## 2) PERIOD BEHAVIOR

Make the selected period intelligent:

### If the selected period is in the past

Show:

* **Actual revenue only**
* based on paid reservations
* with cash/card breakdown

### If the selected period is in the future

Show:

* **Forecast revenue only**
* based on confirmed reservations

### If the selected period includes both past and future dates

Split the summary clearly into:

* **Collected revenue**
* **Forecast revenue**
* **Combined total** (optional secondary figure only)

This is very important because right now the dashboard is mixing these numbers and the calculation is wrong.

---

## 3) NEW CARD STRUCTURE

Redesign the revenue summary cards into clearer blocks:

### Main summary row

1. **Събрани приходи**

   * total actual collected revenue
   * subtitle: number of paid reservations

2. **В брой**

   * total collected in cash
   * percentage of collected revenue

3. **С карта**

   * total collected by card
   * percentage of collected revenue

4. **Прогнозни приходи**

   * expected revenue from confirmed future reservations
   * subtitle: number of confirmed reservations

5. Optional: **Неплатени**

   * reservations not yet paid
   * helpful for operations

Make it visually obvious that:

* green/blue area = real collected money
* orange/yellow area = projected money

---

## 4) DETAILS / EXPANDED TABLES

Below the cards, add separate expandable data tables.

### Table A: Actual Revenue Details

Used for past dates.

Columns:

* Reservation ID
* Customer name
* Arrival date
* Departure date
* Amount
* Payment status
* Payment method
* Paid on date
* Collected by / shift (optional)

Payment method values:

* В брой
* С карта

This table must only include **paid reservations**.

Add a small summary above the table:

* Общо събрани
* В брой
* С карта

---

### Table B: Forecast Revenue Details

Used for future dates.

Columns:

* Reservation ID
* Customer name
* Arrival date
* Departure date
* Expected amount
* Reservation status
* Payment status

This table must only include:

* **Confirmed reservations**
* that belong to the selected future period

Add summary above:

* Прогнозно общо
* Брой потвърдени резервации

---

### Table C: Mixed Period View

If the date range includes both past and future dates, show both tables one after another with separate headings:

* **Събрани приходи**
* **Прогнозни приходи**

Do not merge them into one confusing table.

---

## 5) EXPORT TO CSV

Add export controls for the tables.

### Export requirements

Allow CSV export for:

* Actual revenue table
* Forecast revenue table
* Combined export for mixed period

Add an **Export dropdown button** with options:

* Експорт на събрани приходи (.csv)
* Експорт на прогнозни приходи (.csv)
* Експорт на всички видими данни (.csv)

CSV should include column headers and export exactly what is currently filtered by:

* selected period
* search
* status filters
* payment method filters if applied

Show this export button near the top right of the revenue section.

---

## 6) FILTERS

Add useful filters above the tables:

* Period selector
* Reservation status
* Payment status
* Payment method
* Search by customer / reservation number

Suggested payment status filters:

* Платено
* Неплатено
* Частично платено (optional if supported)

Suggested reservation status filters:

* Потвърдена
* Пристигнала
* Завършена
* Не се е явил
* Анулирана

Important logic:

* Historical actual revenue should ignore no-show and cancelled unless there is a real collected payment
* Future forecast should use confirmed reservations only

---

## 7) IMPORTANT BUSINESS RULES

Apply these rules in the design logic:

1. **Past revenue**

* count only payments actually received
* split by cash/card
* based on paid reservations

2. **Future estimation**

* count only confirmed reservations
* show expected figures, not collected cash

3. **No-show / cancelled**

* should not appear in forecast unless business rules explicitly keep them
* should not appear in actual revenue unless payment was actually collected

4. **Payment on departure**

* must count in actual revenue on the date it is paid / within the selected historical period if relevant

5. **Do not mix collected money with forecast money in one main number without labels**

* labels must be explicit and impossible to misunderstand

---

## 8) UI LABEL IMPROVEMENTS

Use clearer labels in Bulgarian:

* **Събрани приходи**
* **Прогнозни приходи**
* **В брой**
* **С карта**
* **Детайли по събрани приходи**
* **Детайли по прогнозни приходи**
* **Експорт**
* **Избран период**

If the selected period is fully future, avoid showing “Обща сума” as the main label. Use:

* **Очаквана сума** or **Прогнозни приходи**

If the period is fully past, use:

* **Събрана сума**

---

## 9) DESIGN DIRECTION

Keep the existing admin dashboard look, but make it more functional:

* strong summary cards
* clear hierarchy
* easy scanning fo
