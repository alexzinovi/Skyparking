Do NOT modify any backend logic, database structure, shift calculation, reservation status logic, or system behavior.
This is a UI-only enhancement.
Add a minimal “Shift Preview” feature inside the existing SkyParking operator admin panel.
Keep everything else exactly as it is.
1. Add a Mini Status Bar
Place it directly below the current shift header section (under the “Night Shift 01/03/2026 20:00 – 02/03/2026 08:00” area).
Layout Style:
Full width container
Height: 44–56px
Very light neutral background (subtle contrast from main background)
Thin top and bottom border (very light gray)
Horizontal layout (flex row)
Space between left content and right controls
2. Default State – Active Shift Mode
Left side:
🟢 Active: Night Shift (01/03 20:00 – 02/03 08:00)
Under it or inline separated by dots:
Arrivals: 3 / 5
Departures: 2 / 4
Active Cars: 27
Occupancy: 34%
Typography:
Shift label slightly bold
Numbers bold
Labels regular weight
Keep visual hierarchy clean and compact
Right side:
[ ◀ ] [ ▶ ]
Minimal icon buttons (ghost style, no heavy background)
Hover state: subtle background highlight
3. Preview Mode (Triggered by ◀ or ▶)
When user clicks arrow:
Replace 🟢 Active with:
👁 Preview: Day Shift (02/03 08:00 – 20:00)
Change status bar background to slightly darker neutral (very subtle)
Add a small badge on right side:
“PREVIEW MODE”
Below the arrows, add a small ghost button:
“Back to Active Shift”
Style:
Secondary button
Not visually dominant
Clear but minimal
4. Behavioral Constraints (Important)
Preview mode must be:
Read-only
Visual-only
No system state change
No shift reassignment
No operator responsibility change
No report modification
The active shift remains unchanged in the system.
5. Design Rules
Do not add new pages
Do not add new navigation tabs
Do not modify current buttons
Do not move existing elements
Maintain clean operator-focused interface
Keep everything minimal and professional
This enhancement should feel like a natural extension of the current UI, not a redesign.