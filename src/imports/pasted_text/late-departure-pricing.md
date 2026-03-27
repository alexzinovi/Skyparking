**Goal:** Update late departure pricing logic in the SkyParking admin/operator dashboard.

Currently, late reservations automatically receive a fixed **€5 per day penalty fee**.
Change this behavior so that late departures are calculated using the **normal parking price logic**, not a fixed penalty fee.

At the same time, keep flexibility for the operator to manually adjust the amount when marking that the client has left the parking.

Also, any extra late-departure charge must be clearly visible in the **shift revenue tab** of the operator dashboard.

---

## 1) PRICING LOGIC CHANGE

### Current behavior

* Late departure = automatic fixed **€5/day penalty**

### New behavior

* Late departure should be priced using the **standard parking pricing rules**
* Calculate the additional stay exactly like a normal extension of the reservation
* Do NOT use a fixed penalty by default

Example:

* If a customer stays 2 extra days, calculate those 2 days using the standard active pricing model
* Respect normal pricing tiers, daily rates, and business rules already used elsewhere in the system

---

## 2) OPERATOR ACTION ON CHECK-OUT

When the operator clicks:

**“Client has left parking” / “Клиентът е напуснал паркинга”**

open a checkout confirmation modal or panel that shows:

* Original reservation amount
* Original planned departure date/time
* Actual departure date/time
* Extra stay duration
* Automatically calculated extra charge using normal pricing
* Final total amount

Add a field:

### “Корекция от оператор”

Allow the operator to:

* keep the auto-calculated extra charge
* increase or decrease it manually
* enter a note/reason for the adjustment

Suggested adjustment reasons:

* goodwill discount
* operator correction
* special case
* waived fee
* custom amount

---

## 3) LATE CHARGE LABELING

Rename the concept from generic penalty fee to something clearer:

Preferred labels:

* **Допълнителен престой**
* **Такса за допълнителен престой**
* **Корекция при напускане**

Avoid relying only on the term “penalty fee” if the new logic is standard price-based.

If a manual override is applied, show:

* **Автоматично изчислено**
* **Коригирано от оператор**

---

## 4) SHIFT REVENUE TAB IN OPERATOR DASHBOARD

Add a dedicated line or subsection in the operator’s shift revenue tab to show extra revenue from late departures / checkout adjustments.

### In shift revenue summary, include:

* Base revenue from reservations
* Extra revenue from additional stay
* Manual checkout adjustments
* Total shift revenue

### Add a visible row:

* **Допълнителен престой**
  or
* **Корекции при напускане**

This amount should include:

* extra charges added when the client leaves late
* manual operator amendments related to checkout

---

## 5) EXPANDED SHIFT REVENUE DETAILS

When the operator expands the shift revenue details, show exactly which reservations included additional charges.

Suggested columns:

* Reservation ID
* Customer name
* Base amount
* Extra stay amount
* Manual adjustment
* Final collected amount
* Payment method
* Processed by operator

This helps track:

* who applied the charge
* which reservation was changed
* how much extra revenue came from late departures

---

## 6) CHECKOUT MODAL UX

Design a clean modal for “Client left parking” with this structure:

### Section 1: Reservation info

* Customer name
* Vehicle / reservation ID
* Planned departure
* Actual departure

### Section 2: Additional stay calculation

* Extra time / extra days
* Auto-calculated extra cost using standard pricing

### Section 3: Operator adjustment

* Editable amount field
* Adjustment reason dropdown
* Optional note textarea

### Section 4: Final summary

* Original amount
* Extra stay
* Adjustment
* Total due / total collected

Buttons:

* Cancel
* Confirm checkout

---

## 7) BUSINESS RULES

Apply these rules:

1. Late departure should no longer default to €5/day
2. Extra stay must use stan