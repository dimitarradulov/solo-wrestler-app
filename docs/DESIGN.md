# Solo Wrestler — UI/UX Design System Manual
**Product Identity:** Elite Scoreboard × Modern Combat Aesthetic

This document defines the complete visual identity, design tokens, and component styling rules for the **Solo Wrestler** mobile application MVP. It translates the raw core curriculum requirements into a cohesive, high-intensity, distraction-free visual environment designed specifically for solo athletes training on a mat layout.

---

## 1. Typography System

The typography configuration utilizes **Combination 2: The Modern Combat Aesthetic**, combining a high-kinetic, angular display face with an industry-standard, clean geometric UI typeface.

### 1.1 Font Families
*   **Primary Display / Headers:** `Oxanium` (Google Fonts)
    *   *Characteristics:* Severe, sharp-angled corner cuts, high-energy structural presence.
    *   *Usage:* App titles, Phase headings, Week/Workout structural identifiers, macro timer digits, and primary call-to-action triggers.
*   **Body / UI Text:** `Inter` (Google Fonts)
    *   *Characteristics:* Ultra-legible geometric sans-serif with excellent tracking defaults for small interfaces.
    *   *Usage:* Drill prescriptive data, minimal training cues, text inputs, buttons, navigation menus, and reading sections.

### 1.2 Type Scale & Hierarchy
All layout dimensions are optimized for readability from a standing distance of 1.5 to 2 meters while the user is positioned on a training mat.

| Element | Font Family | Weight | Size | Case / Style | Tracking (Letter-Spacing) | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **H1 (Hero)** | Oxanium | Extra Bold (800) | 22pt | Uppercase | 0.06em | Intro screen title, primary screen headers |
| **H2 (Section)** | Oxanium | Bold (700) | 15pt | Uppercase | 0.04em | Current Phase, Workout Phase Title, Group headers |
| **H3 (Component)**| Oxanium | Semi-Bold (600)| 13pt | Sentence | Normal | Drill Card Title, Equipment Card Header |
| **Subtitle** | Inter | Semi-Bold (600)| 11pt | Sentence | Normal | Week & Workout tracking strings (e.g., Week 2 • Workout A) |
| **Body Lead** | Inter | Medium (500) | 11pt | Sentence | Normal | Safety instructions, intro descriptions |
| **Body Standard**| Inter | Regular (400) | 10pt | Sentence | Normal | General technical descriptions, user input notes |
| **Drill Cue** | Inter | Semi-Bold (600)| 11pt | Sentence | Normal | Technical cue callouts (`Cue: Step deep. Stay tall.`) |
| **Prescription Data**| Inter | Bold (700) | 12pt | Sentence | Normal | Metric readouts (`5 sets × 5 reps each side`, `5 min`) |
| **Macro Timer** | Oxanium | Extra Bold (800) | 48pt | Monospace numbers | Normal | Countdown clocks for rounds, work, and rest |
| **Tab / Button Label**| Inter | Semi-Bold (600)| 10pt | Uppercase | 0.05em | Bottom navigation tags, system action triggers |

### 1.3 Stylistic Conventions
*   **The 15% Italic Rule:** Apply a standard italic lean (`font-style: italic;`) exclusively to `Oxanium` header assets when depicting *active workflow items* (e.g., an in-progress workout header, active status badges, or live timer containers) to evoke a physical sense of momentum and explosive action.
*   Never apply italics to standard body text, cues, or structural metric readouts.

---

## 2. Color Palette & Design Tokens

The app adopts a dark, matte canvas ecosystem reminiscent of international wrestling tournament spaces. Pure black surfaces are avoided to maintain excellent UI contrast limits during intense physical activity and high sweat/motion visibility states.

### 2.1 Core Archetype Colors
```
BACKGROUNDS
  ├── Base Canvas:      #121417  (Deep Matte Charcoal — arena floor canvas)
  ├── Card / Surface:   #1E222B  (Slightly lifted slate — contextual containers)
  └── Modal Backdrop:   rgba(18, 20, 23, 0.85) (Obscured view tinting)

TYPOGRAPHY
  ├── High Contrast:    #FFFFFF  (Absolute crisp readability for cues & metrics)
  ├── Medium Contrast:  #E2E8F0  (Sub-headers, primary descriptive elements)
  └── Muted Contrast:   #8E96A5  (Locked elements, secondary labels, structural data)

BRAND SIGNATURES
  ├── Wrestling Red:    #E63946  (Primary interaction highlight / Target workflows)
  └── Scoreboard Blue:  #0066FF  (Secondary structural anchor / Navigation highlights)
```

### 2.2 Semantic State Engine
Color rules dictating interactive workflow parameters across cards, navigation matrices, and indicators:

```
🟢 COMPLETED STATE
  ├── Foreground Token: #00D26A  (Vibrant Scoreboard Green)
  └── Surface Token:    rgba(0, 210, 106, 0.08) (Soft contextual green fill)

🔴 CURRENT / UNLOCKED STATE
  ├── Foreground Token: #E63946  (Wrestling Red)
  └── Surface Token:    rgba(230, 57, 70, 0.05) (Soft contextual red tint)

⚫ LOCKED STATE
  ├── Foreground Token: #525C6C  (Deep Muted Iron)
  └── Surface Token:    #161A22  (Recessed low-contrast background)

🟡 TIMER ACTIVE STATE
  ├── Foreground Token: #FFB703  (High-Visibility Tournament Amber)
  └── Surface Token:    rgba(255, 183, 3, 0.04) (Slight amber glow overlay)

🔵 REST COUNTDOWN STATE
  ├── Foreground Token: #0066FF  (Scoreboard Blue)
  └── Surface Token:    rgba(0, 102, 255, 0.06) (Recovery phase fill)
```

---

## 3. Component Visual Specifications

### 3.1 App Layout Shell (Bottom Navigation)
*   **Container Background:** `#121417` Base Canvas.
*   **Tab Bar Matrix:** Fixed along base with a `#1E222B` surface background and a thin `1px` structural top dividing border colored `#2A303C`.
*   **Tab State Interaction:**
    *   *Active Selected Item:* Graphic icon and underlying `Inter` text tag colored `#0066FF` (Scoreboard Blue).
    *   *Inactive Items:* Graphic icon and text tag colored `#8E96A5` (Muted Contrast).

### 3.2 Main Structural Dashboard Cards (Today & Equipment Cards)
*   **Card Architecture:** Rounded corner profile (`border-radius: 12px`); background surface color set to `#1E222B`. No box-shadow properties (flat layout design philosophy).
*   **Today Card Special Variant:** Focus treatment using a persistent `4px` solid left vertical border color mapping directly to `#E63946` (Wrestling Red).
*   **Equipment Card Layout:** Standard structural layout with a `#323946` clear left graphic accent strip to anchor list icons.

### 3.3 The Core Drill Card
Drill Cards display uniform dimensions across types but apply contextual visual engines to match internal metric frameworks.

```
+-----------------------------------------------------------+
|  [Icon] SHADOW DOUBLE LEG                       #FFFFFF   |
|  5 rounds x 1 min                               #8E96A5   |
|                                                           |
|  Core Technique: Double Leg                     #E2E8F0   |
|  Cue: Level change first. Head up.              #FFFFFF   |
|                                                           |
|  +--------------+   +----------------------------------+  |
|  |  WATCH       |   |  START / MARK COMPLETE           |  |
|  +--------------+   +----------------------------------+  |
+-----------------------------------------------------------+
```

*   **Default Rest State:** Card surface background sits at `#1E222B`.
*   **Typography Separation:**
    *   Drill Title: `Oxanium Semi-Bold` (13pt, White).
    *   Prescription String: `Inter Bold` (12pt, `#8E96A5`).
    *   Core Technique Meta Label: `Inter Regular` (10pt, `#E2E8F0`).
    *   The Technical Cue text block: Contained inside a micro-inset wrapper with a background fill of `#161A22` and a left border element of `#0066FF`. Text set to `Inter Semi-Bold` (11pt, White).
*   **Interactive Action Bars (Buttons):**
    *   *Secondary Trigger (Watch Button):* Transparent core color, structured with a flat `1px` border frame matching `#8E96A5`. Text uses `Inter Semi-Bold` in `#8E96A5`.
    *   *Primary Action Trigger (Start / Mark Complete):* Solid fill using `#0066FF` (Scoreboard Blue) or `#E63946` (Wrestling Red) depending on the core template layout. Text is high-contrast white `Inter Semi-Bold`.

### 3.4 Curriculum Status Grid Matrix
The 6-week progressive training block is built around a tight, multi-column scannable grid layout.

*   **Current Action Node:** Grid cell is highlighted with an absolute boundary stroke profile (`border: 2px solid #E63946`). The internal card content uses an italicised `Oxanium` font treatment for immediate optical orientation.
*   **Completed Node:** Grid cell transforms its internal background canvas entirely to `rgba(0, 210, 106, 0.08)` and locks an absolute graphic checkmark icon in the upper right quadrant utilizing `#00D26A` (Vibrant Green).
*   **Locked Node:** Grid cell falls back to a recessed `#161A22` canvas profile. Text and label fields switch uniformly to `#525C6C` (Deep Muted Iron). No hover or tap scaling states are active.

### 3.5 High-Visibility Scoreboard Timers
When duration or round configurations are activated, the card interface minimizes secondary information and scales the operational countdown canvas into Macro Presentation Mode.

*   **The Numeric Interface:** Time strings render inside an atomic font layer set to `48pt` using `Oxanium Extra Bold`. It enforces a strict monospace numeral width distribution to prevent flickering layout element shifting while digits descend.
*   **Work State Lighting:** Digits glow sharply using color token `#FFB703` (Tournament Amber).
*   **Rest State Lighting:** Digits instantly snap to `#0066FF` (Scoreboard Blue).
*   **Operational Controls Area:** Underneath macro numbers, standard control elements (`Pause`, `Resume`, `Reset`) are built as low-profile, clean text buttons centered horizontally using `#E2E8F0` text strings.

### 3.6 In-App Video Modals
*   **Backdrop Shell:** Full window overlay setting a premium alpha barrier transparency state of `rgba(18, 20, 23, 0.92)`.
*   **Content Window Wrapper:** Centered box element using `#121417` base styling with a hard `12px` rounded corner configuration.
*   **The Media Viewport:** Enforces an explicit widescreen `16:9` aspect ratio container shell filled with solid black (`#000000`) before native network streaming hooks activate.
*   **Dismissal Frame:** A distinct close icon anchor positioned persistently at the top right bounding corner using color asset `#FFFFFF`.

---

## 4. Visual Layout & Micro-Interactions

### 4.1 Border Radii & Structural Geometry
*   Main Application Drill Cards: `12px`
*   Input Components, Buttons, Action Sheets, and Status Chips: `8px`
*   Video Modal Frame Containers: `12px`

### 4.2 Spacing Metric System (8pt Spatial Grid)
Layout configurations use an exact `8pt` multiplier logic mapping layer definitions consistently across screen structures:
*   Standard Page Padding margins: `16mm` or `16px` structural offsets.
*   Internal Inter-Card vertical separations: `12px` or `16px`.
*   Intra-Card content nesting paddings: `12px`.

### 4.3 Screen-Transition Physics (CSS Transition Hooks)
*   **Drill Complete Transition:** When a drill transitions to a completed state, the component morphs its state properties over an absolute window of `200ms` using a linear ease function (`transition: background-color 200ms ease, border-color 200ms ease`).
*   **Timer Phase Snap Changes:** The switch between Work state colors (`#FFB703`) and Rest state colors (`#0066FF`) triggers with a zero-duration hard frame refresh cut (`0ms`), ensuring instant athletic clarity on the mat space.