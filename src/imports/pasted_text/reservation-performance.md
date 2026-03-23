**Goal:** Add a **Reservation Tracking & Employee Performance system** inside the admin dashboard to track:

* How many reservations are created per day
* Who created them
* Who accepted/confirmed them
* Overall reservation flow and performance

Keep UI clean, operational, and consistent with SkyParking admin design.

---

## 🧠 CORE DATA TO TRACK (MUST ADD TO EACH RESERVATION)

Add these fields to every reservation:

1. **Created at (Дата на създаване)**
2. **Arrival date (Дата на пристигане)**
3. **Created by (Създадено от)**

   * Employee name OR “Клиент (онлайн)”
4. **Accepted by (Прието от)**

   * Which employee confirmed it

---

## 📊 NEW SECTION: “Резервации”

Add a new tab or dashboard section:
👉 **“Резервации”**

---

## 📈 TOP SUMMARY CARDS

Show:

1. **Резервации днес**
2. **Резервации тази седмица**
3. **Резервации този месец**
4. **Средна стойност на резервация (€)**

---

## 👤 EMPLOYEE PERFORMANCE

Add a card or table:

### “По служител”

Columns:

* Employee name
* Reservations created
* Reservations accepted
* Total revenue generated

Example:

```id="emp001"
Иван — 18 резервации — €520
Мария — 12 резервации — €340
```

---

## 📅 DAILY TRACKING TABLE

Main table:

### “Резервации по дни”

Columns:

* Date
* Reservations count
* Revenue
* Arrivals
* Departures

Clickable → opens detailed list for that day

---

## 📋 DETAILED RESERVATION TABLE

Columns:

* Reservation ID
* Customer name
* Created at (time)
* Arrival date
* Created by
* Accepted by
* Amount
* Status

This acts as a full **audit trail** of reservations.

---

## 🔍 FILTERS (VERY IMPORTANT)

Add filters:

* Period (date range)
* Employee
* Status (confirmed, no-show, cancelled)
* Payment status

---

## 📤 EXPORT (CSV)

Add export button with options:

* Export all reservations (filtered)
* Export by employee

CSV must include:

* created_at
* arrival_date
* created_by
* accepted_by
* amount
* status

---

## 🎯 WHY THIS MATTERS

This will allow:

* Track **employee performance**
* See **who is actually doing the work**
* Track **daily booking flow**
* Identify inefficiencies (slow confirmations, missed bookings)

---

## 🏷 LABELS (Bulgarian)

* “Създадено от”
* “Прието от”
* “Резервации по дни”
* “По служител”
* “Детайли”

---

## 🎨 DESIGN NOTES

* Keep cards compact
* Tables scrollable
* Use icons:

  * 👤 employee
  * 📅 date
* Maintain SkyParking colors (#053790 / #f1c933)

---

**Result:** A clear operational dashboard to track reservations and employee performance.
