for operator dashboard:

**Goal:** Make revenue tracking accurate, transparent, and operationally useful by separating *expected revenue* from *actual collected revenue* and improving breakdown visibility.

---

### 🧠 CORE LOGIC (VERY IMPORTANT)

First currently on the revenue tab it only says night shift and doesn't change to day shift

Split revenue into **3 clear categories**:

#### 1. Очаквани приходи (Expected Revenue)

* Based on **all confirmed reservations**
* Includes:

  * Future arrivals
  * Active stays not yet paid
* EXCLUDES:

  * Cancelled / No-show (once marked)

👉 IMPORTANT:

* If a reservation is marked **No Show**, it should be:

  * Removed from expected revenue
  * OR shown as **“Lost revenue” (optional future feature)**

---

#### 2. Реално събрани приходи (Collected Revenue)

* Only include **payments actually received**
* Triggered when:

  * Payment is marked as paid (cash or card)
  * EVEN if paid on departure

---

#### 3. Неплатени / Очаквани плащания (Pending Payments)

* Reservations that:

  * Have arrived OR are active
  * But are **not yet paid**

---

### 🎨 UI STRUCTURE

#### Top Section

Replace current:

👉 “Общо”

With:

**Общо приходи**

* Очаквани: €XXX
* Събрани: €XXX
* Неплатени: €XXX

---

### 🔽 EXPANDABLE SECTION (IMPORTANT)

When expanded, group reservations like this:

#### 🟢 Събрани приходи

List:

* Customer name
* Amount
* Payment method:

  * 💵 В брой
  * 💳 С карта
* Optional:

  * Paid at arrival / departure

Example:

```
Иван Иванов — €20 (💵 В брой)
Мария Петрова — €35 (💳 С карта)
```

---

#### 🟡 Очаквани (неплатени)

List:

* Customer name
* Amount
* Status:

  * Очаква се пристигане
  * В паркинга (неплатено)

---

#### 🔴 No-show / Отпаднали (optional but VERY useful)

* Customer name
* Amount
* Label:

  * ❌ Не се е явил

---

### ⚠️ FIX CURRENT ISSUE

> “When I mark no-show it disappears from expected revenue”

✔️ This is correct behavior BUT:

* You must show it somewhere:
  → Add **“Lost / Cancelled revenue” section**

Otherwise it feels like money “vanishes”.

---


✔️ When paid at departure:

* Move from:
  → Expected → Collected

---

### 🎯 RESULT

* No more confusion when revenue changes
* Clear separation:

  * Forecast vs real cash
* Staff can see:

  * Who paid
  * How they paid
  * Who still owes money
* Handles real-world behavior (late payments, no-shows)

---

**Keep SkyParking design system and colors (#053790 / #f1c933).**