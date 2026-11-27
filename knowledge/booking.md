# Booking policy

Fictional demo document for Orange County HVAC Techs. Not a real business. The chat tool can log a request. It does not charge a card and it does not put a truck on the road by itself.

## What we collect

A service request needs all of the following:

- Customer name.
- City where the equipment is, and that city must be in the service-area list.
- A short description of the issue.
- A preferred day and time window, such as "Thursday morning" or "Saturday afternoon."
- Urgency: routine (several days is fine), soon (this week), or emergency (no heat, no cooling in unsafe weather, or the customer says it cannot wait).

The chat does not collect a phone number or a payment. In the story of this demo, the office would confirm by phone or text after the request is logged. This demo only stores the request in memory for the running server.

## Arrival and cancellation

- Morning window is 8:00 a.m. to 12:00 p.m. Afternoon window is 12:00 p.m. to 4:00 p.m.
- The arrival promise is a two-hour window, not a minute.
- Cancel or reschedule at least 24 hours before the window. Inside 24 hours, the diagnostic fee may be charged.
- Same-day routine requests are taken when the board has room. They are not guaranteed.
- Emergency no-heat and no-cooling calls described in the emergency policy are flagged for same-day priority.

## When the assistant must not confirm a visit

- Suspected gas leak or carbon monoxide alarm: tell the caller to leave and call 911 and the gas company. A log entry is not a confirmed visit.
- City outside Orange County: do not book it.
- Missing name, issue, or preferred time: ask for the missing piece. Do not say the visit is booked.

## Confirmation ids

A normal or extreme-comfort booking returns a confirmation id shaped like OC-YYYYMMDD-XXXX. That id means the request was logged in this demo. It is not a real work order. Gas-related logs return a reference id with the same shape, and the message must say it is not a dispatch.
