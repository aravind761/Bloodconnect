# 🩸 BloodConnect

> **Real-Time Voluntary Blood Donation, Clinical Decision Suite & Emergency Network**

BloodConnect is a production-grade, multi-page healthcare web platform engineered to connect emergency hospital requests with voluntary blood donors in real time. Designed with a clean liquid-glass aesthetic, tactile 3D WebGL visualizations, clinical transfusion decision tools, and WCAG 2.1 AAA accessibility controls.

---

## 📑 Table of Contents

- [Overview & Mission](#-overview--mission)
- [Quick Start & Local Setup](#-quick-start--local-setup)
- [Multi-Page Architecture](#-multi-page-architecture)
- [Clinical & Donor Tools Suite](#-clinical--donor-tools-suite)
- [Real-World Controls & Accessibility](#-real-world-controls--accessibility)
- [Emergency Broadcasting & SOS Directory](#-emergency-broadcasting--sos-directory)
- [Centers Locator & GPS Telemetry](#-centers-locator--gps-telemetry)
- [Donor Portal & Verified Digital Pass](#-donor-portal--verified-digital-pass)
- [Medical Standards & Formulas](#-medical-standards--formulas)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Browser Support & Technology Stack](#-browser-support--technology-stack)
- [License & Disclaimer](#-license--disclaimer)

---

## 🌟 Overview & Mission

Every two seconds, someone in India requires emergency blood. BloodConnect operates under the strict ethical frameworks of the **National Blood Transfusion Council (NBTC)** and **WHO guidelines**, advocating 100% voluntary, non-remunerated donation. 

The platform bridges critical gaps in emergency transfusion care through:
* **Real-time Shortage Telemetry**: Aggregate inventory radar tracking reserves across 9 regional blood banks.
* **Instant Emergency Mobilization**: Direct WhatsApp SOS broadcasting and hospital dispatch telephone routing.
* **Clinical Intelligence**: Transfusion compatibility explorers, statutory deferral calculators, and biometric blood volume estimators.
* **Universal Accessibility**: High contrast modes, text scaling, speech synthesis, and battery-friendly static rendering.

---

## 🚀 Quick Start & Local Setup

BloodConnect runs as a standalone static web application with zero external build dependencies or npm packaging required.

### 1. Prerequisites
Any standard browser (Chrome, Edge, Firefox, Safari) and a simple local HTTP server (Python or Node.js).

### 2. Launch Local Server

**Using Python:**
```bash
# Navigate to project directory
cd BloodConnect

# Start local server on port 3000
python -m http.server 3000
```

**Using Node.js:**
```bash
npx serve -l 3000 .
```

### 3. Open in Browser
Visit [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🗺️ Multi-Page Architecture

The application is structured into dedicated, purpose-built pages rather than an anchor-scrolling single page:

| Page / Route | File | Key Features |
| :--- | :--- | :--- |
| **Home / Landing Page** | [`index.html`](index.html) | 3D blood drop sculpture, critical shortage ticker, live telemetry counters, clinical tools showcase, urgent requests spotlight, 4-step journey, and verified partner network. |
| **Clinical Tools Suite** | [`tools.html`](tools.html) | Full dedicated medical calculators suite (Compatibility Matrix, Next Date & `.ics` Sync, Nadler's Blood Volume Estimator, Live Inventory Radar, Transfusion FAQs). |
| **Centers & 3D Map** | [`centers.html`](centers.html) | Interactive 3D India map with rotation controls, HTML5 GPS Haversine proximity sorter, Google Maps turn-by-turn routing, direct phone links, and mobile camp hosting. |
| **Urgent Requests Board** | [`requests.html`](requests.html) | Live emergency requests board, hospital filtering, `+ Post Urgent Request` intake modal, WhatsApp SOS card generator, and 24/7 National Emergency Helplines. |
| **Eligibility Checker** | [`eligibility.html`](eligibility.html) | Interactive 4-step screening quiz with Web Speech TTS Voice Assist, statutory clinical deferral matrix (medications, travel, tattoos), and pre-donation preparation checklist. |
| **Donor Portal & Pass** | [`dashboard.html`](dashboard.html) | Verified lifesaver dashboard: personalized Digital Donor Pass with dynamic Canvas QR Code, physical card printing, PNG download, appointment booking, and badges. |
| **About & Support** | [`about.html`](about.html) | Non-profit mission, ethical standards, participating hospital centers, feedback submission form, and emergency dispatch procedures. |

---

## 🧮 Clinical & Donor Tools Suite

Accessible on [`tools.html`](tools.html) or via the navigation bar:

### 1. 🩸 Blood Transfusion Compatibility Explorer
* **Dual-Component Mode**:
  * **Red Blood Cells (Whole Blood)**: Focuses on ABO & Rh surface antigens. Demonstrates why **O−** is the Universal Red Cell Donor and **AB+** is the Universal Recipient.
  * **Plasma & Platelets**: Inverted compatibility where **AB** is the Universal Plasma Donor (no ABO antibodies) and **O** is the universal recipient.
* **Interactive Selector**: Instant highlighting of compatible donors and recipients across all 8 blood groups (`O−`, `O+`, `A−`, `A+`, `B−`, `B+`, `AB−`, `AB+`).
* **8×8 Transfusion Crossmatch Matrix**: Comprehensive clinical reference table.

### 2. 📅 Next Eligible Date Calculator & Calendar Export (.ics)
* **Statutory Deferral Cycles**:
  * Whole Blood: 90 days (males), 120 days (females).
  * Platelets (Apheresis): 7 days (up to 24 times/year).
  * Plasma: 28 days.
  * Double Red Cells: 180 days.
* **Readiness Gauge**: Animated circular SVG progress ring displaying days remaining and percentage readiness.
* **Standard `.ics` Download**: Generates and downloads an RFC-5545 compliant `.ics` calendar event that imports directly into Google Calendar, Apple Calendar, and Outlook.

### 3. ⚖️ Total Circulating Blood Volume & Safety Estimator
* **Nadler’s Clinical Biometric Formula**:
  $$\text{Men: } TBV = 0.3669 \times H^3 + 0.03219 \times W + 0.6041$$
  $$\text{Women: } TBV = 0.3561 \times H^3 + 0.03308 \times W + 0.1833$$
  *(where $H$ is in meters and $W$ in kilograms)*
* **Clinical Safety Thresholds**: Verifies donor weight $\ge 50\text{ kg}$ and confirms that a standard 450 mL collection stays safely under the $13\%$ circulating volume threshold.
* **Biological Recovery Timeline**: Visual recovery milestones for plasma restoration (24–48h), platelets (72h), and red cell hemoglobin reconstitution (4–6 weeks).

### 4. 📊 Live Blood Bank Inventory Radar
* Real-time aggregate stock levels across 9 verified regional blood centres.
* Categorized by clinical risk: **Critical** ($<20\%$), **Low** ($20\text{--}40\%$), **Optimal** ($40\text{--}75\%$), and **Healthy Reserve** ($>75\%$).
* Interactive click-through to instantly filter active emergency requests on the Blood Board.

---

## ⚙️ Real-World Controls & Accessibility

BloodConnect includes a comprehensive suite of accessibility and environmental controls compliant with **WCAG 2.1 AAA standards**:

| Control | Implementation | Features |
| :--- | :--- | :--- |
| **Theme Controller** | `Auto (System)` / `☀️ Light` / `🌙 Dark` | Stored in `localStorage`. Automatically syncs 3D Three.js lighting and CSS glass variables. |
| **Typography Zoom** | `A- (90%)` / `A (100%)` / `A+ (115%)` / `A++ (130%)` | Fluid root rem scaling preventing horizontal overflow or broken layouts. |
| **High Contrast Mode** | `data-contrast="high"` | Deep contrasting backgrounds, solid borders, and 4px yellow focus outlines. |
| **Motion & 3D Pause** | `data-motion="pause"` | Halts Three.js rendering loops, pauses aurora and halos, and disables parallax for vestibular sensitivity. |
| **Sound FX Synthesizer** | Web Audio API | Pure synthesized acoustic cues for button clicks, successes, and alerts with an instant mute/unmute switch. |
| **Voice Assist (TTS)** | Web Speech API | Built-in text-to-speech reader (`🔊 Read`) for critical shortage alerts and screening quiz questions. |
| **Universal Command Palette** | <kbd>Ctrl</kbd> + <kbd>K</kbd> / <kbd>Cmd</kbd> + <kbd>K</kbd> | Instant keyboard-driven fuzzy search across all centers, blood groups, clinical tools, and emergency hotlines. |
| **Floating Quick Dock** | `⚡` Speed-Dial | Persistent bottom-right floating dock providing one-click access to Settings, Search, SOS, and Tools. |

---

## 🚨 Emergency Broadcasting & SOS Directory

Accessible on [`requests.html`](requests.html):

* **Broadcast Urgent Request (`#postRequestModal`)**:
  * Medical intake form for hospital attendants and family members: Patient Name, Blood Group, Units Needed (1–10), Urgency Level, Hospital, City, Attendant Contact, and Clinical Indication.
  * Injects directly into the live board with priority sorting.
* **Shareable Emergency Card (`#emergencyCardModal`)**:
  * **One-Click WhatsApp Share**: Generates a pre-formatted emergency message with patient details, units needed, and contact phone for forwarding to WhatsApp donor groups.
  * **Twitter / X Share**: Pre-populates hashtagged SOS tweet.
  * **Copy SOS Text**: Copies formatted emergency dispatch text to clipboard.
* **24/7 National Emergency Helplines**:
  * **1910**: National Blood Transfusion Council (NBTC) Hotline.
  * **104**: National Health & Blood Availability Helpline.
  * **108**: Emergency Medical & Trauma Ambulance Response.
  * **+91 11 2371 6441**: Indian Red Cross Society National Headquarters.

---

## 📍 Centers Locator & GPS Telemetry

Accessible on [`centers.html`](centers.html):

* **3D Interactive Map**: Interactive extruded map of India rendered using Three.js with crimson beacons indicating active critical shortages.
* **📍 Use My Location (HTML5 Geolocation)**:
  * Computes spherical **Haversine distances** in kilometers from donor's GPS coordinates:
    $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$
  * Sorts all donation centers from nearest to furthest with live distance tags (`📍 4.2 km away`).
* **Direct Actions**: Google Maps turn-by-turn navigation (`🗺️ Directions`) and center telephone calling (`📞 Call Centre`).
* **Mobile Drive Hosting**: Booking gateway for colleges, IT parks, and communities to request a mobile blood donation van.

---

## 👤 Donor Portal & Verified Digital Pass

Accessible on [`dashboard.html`](dashboard.html):

* **Personalized Digital Donor Pass**:
  * Metallic glass pass featuring verified Donor ID, Blood Group, Rh factor, and lifetime units donated.
* **Canvas QR Code Generator**:
  * Client-side 2D Canvas QR code generator with central blood emblem encoding donor verification records.
* **Export Controls**:
  * `🖨️ Print Donor Card`: Formatted for physical card printing via clean `@media print` rules.
  * `📥 Download PNG Pass`: Exports high-resolution digital pass image.
* **Appointment Scheduling & Management**:
  * Component selection (Whole Blood, Platelets, Plasma).
  * Direct `.ics` calendar download for any scheduled appointment.
  * Appointment cancellation safeguards with confirmation modals.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>K</kbd> / <kbd>Cmd</kbd> + <kbd>K</kbd> | Open Universal Command Palette |
| <kbd>Esc</kbd> | Close active dialog, modal, or command palette |
| <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd> | Navigate focusable interactive elements |
| <kbd>Enter</kbd> | Select highlighted command item / submit form |

---

## 💻 Browser Support & Technology Stack

* **Markup & Semantics**: HTML5 with ARIA landmark roles and live regions (`aria-live="polite"`).
* **Styling**: Vanilla CSS3 using custom properties (CSS variables), glassmorphism (`backdrop-filter`), CSS Grid, and Flexbox.
* **Scripting**: Pure modern vanilla JavaScript (ES6+), zero external runtime dependencies.
* **3D Visualizations**: Three.js (r128) WebGL Lathe, Extrude, and Line geometries with PMREM environment maps.
* **Audio**: Native Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`).
* **Voice**: Native Web Speech API (`SpeechSynthesisUtterance`).
* **Calendar**: RFC-5545 iCalendar (`.ics`) MIME payload generation.

Tested and fully supported on:
* Google Chrome 90+
* Microsoft Edge 90+
* Mozilla Firefox 88+
* Apple Safari 14+
* Mobile browsers (iOS Safari & Android Chrome)

---

## ⚖️ License & Disclaimer

**Clinical Disclaimer**: BloodConnect is an open-source concept and educational demonstration platform. Medical guidance, blood compatibility tables, and volume calculations are provided for general educational purposes. Attending clinical staff and blood bank medical officers perform definitive screening and crossmatching before any transfusion.

For life-threatening medical emergencies, immediately dial **108** or your national emergency operator.

Licensed under the [MIT License](LICENSE).

