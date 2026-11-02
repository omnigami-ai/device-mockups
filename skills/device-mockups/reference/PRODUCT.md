# Ostlery · product note

Ostlery is a fictional stays assistant made for omnigami's examples; all people, stays and prices are sample data.
It finds a few small stays from a sentence, compares them and asks before booking. No booking has happened here.
Brand: linen #F7F4EE, ink #17191F, ember #C2482B; Newsreader display, Figtree UI (OFL).
Line: “Plan a stay in a sentence.”

| Slot | Real state and capture plan | What is true |
| --- | --- | --- |
| lap | #/chat/lake-cabin, laptop.json | Request for four and a dog, Oct 30–Nov 1, under $220/night; six matching stays. |
| ostPhone | #/stay/heron-point, phone.json, native bottom scroll | Heron Point, $198/night, 4.92, capacity six; party four plus dog. Booking action available, not used. |
| ostRequest | #/, phone-pair.json, suggestion 0 ready to send | Same lake-cabin request in the real composer, not yet sent. |
| ostResult | after that send, phone-pair.json | The matching six-stay answer; first result exposed, not booked. |

Heron Point's current rationale is the only private dock of the six, canoe and two kayaks, $22 under budget.
It is not the best-rated or closest drive; the earlier conflicting sample copy was corrected before these captures.
Desktop is 1440×900 at 2×. Phones are 440×897 at 3×, app only; the renderer adds fixed sample system chrome.
No tablet, payment, confirmation, guaranteed match or fake customer outcome is shown.
