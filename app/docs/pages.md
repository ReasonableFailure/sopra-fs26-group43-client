# Page Documentation

---

## `/scenarios/[id]/player` — Player Dashboard

**File:** `app/scenarios/[id]/player/page.tsx`
**Styles:** `app/styles/playerDashboard.module.css`
**Figma node:** `30:2`

### Purpose

Main interface for a player who has selected a character. Shows their directives, a news feed (Mastodon placeholder), and an action-points exchange panel. Also lists all characters in the scenario so the player can send messages.

---

### Entry Point

Navigated to from the Lobby (`/scenarios/[id]/lobby`) after the player clicks a character card. The selected character ID is persisted in `localStorage` via `useSelectedCharacter(scenarioId)`, keyed as `selectedCharacter_{scenarioId}`.

---

### Component Tree

```
PlayerDashboardPage
└─ ConfigProvider  (light theme)
   └─ .pageRoot
      ├─ <nav> .navbar
      │    ├─ .navLeft  → .logoMark + "Player Dashboard"
      │    └─ .navRight → Bell button + Avatar (character initials)
      └─ Spin (loading)
           └─ .body  (3-column flex-row)
                ├─ <aside> .leftSidebar  ── My Directives
                │    ├─ .sidebarHeader  → "My Directives" + Button "New Directive"
                │    └─ .directiveList  → DirectiveCard × N  |  empty state
                ├─ <main> .center  ── News Feed + Action Points
                │    ├─ .centerHeader  → "News Feed" + Button "Post Pronouncement"
                │    ├─ .sectionSubheading
                │    ├─ .newsFeedCard  → .newsFeedPlaceholder  (Mastodon placeholder)
                │    ├─ .actionPointsHeader  → "My Action Points" + subheading
                │    └─ .apCards
                │         ├─ .apCard  "Likes" / 0
                │         ├─ .apArrow  → Buy button + arrow line + "with N likes"
                │         └─ .apCard  "Action Points" / character.actionPoints
                └─ <aside> .rightSidebar  ── Character List
                     ├─ .sidebarHeader  → "Character List"
                     └─ .characterList  → CharacterRow × N
                          ├─ .characterAvatar  (gradient circle, initials)
                          ├─ .characterInfo  → name + title
                          └─ Button "Message"  (stub)
```

---

### Hooks & Services Used

| Hook / Service | Purpose |
|---|---|
| `useAuth()` | Auth guard + `token` |
| `useSelectedCharacter(scenarioId)` | Reads selected character ID from localStorage |
| `CharacterService.getCharactersByScenario` | `GET /scenarios/{id}/characters` — all characters (right sidebar) |
| `DirectiveService.getDirectivesByScenario` | `GET /scenarios/{id}/directives` — filtered client-side to selected character |
| `ScenarioService.getScenarioById` | `GET /scenarios/{id}` — for exchange rate |
| `useParams()` | Reads `id` from URL |
| `useRouter()` | Navigation |

---

### Data Flow

1. `scenarioId` read from URL; `characterId` read from `useSelectedCharacter`.
2. `Promise.all` fires `GET /scenarios/{id}/characters` + `GET /scenarios/{id}` in parallel.
3. `GET /scenarios/{id}/directives` fires separately; errors are swallowed (endpoint may not exist yet) → empty list.
4. `selectedCharacter = characters.find(c => c.id === characterId)`.
5. `myDirectives = directives.filter(d => d.creator?.id === characterId)`.
6. `actionPoints` comes from `selectedCharacter.actionPoints`; `exchangeRate` from scenario.
7. Likes count is hardcoded to `0` — will come from Mastodon API later.

---

### Navigation Stubs

| Action | Destination | Status |
|---|---|---|
| "New Directive" | `/scenarios/[id]/player/directive/new` | Stub (Editor — not yet implemented) |
| "Post Pronouncement" | `/scenarios/[id]/player/pronouncement/new` | Stub (Editor — not yet implemented) |
| "Message" on a character | `/scenarios/[id]/player/message/new?to={charId}` | Stub (Editor — not yet implemented) |
| "Buy" action points | `alert()` | Stub |

---

### Directive Card: Status Display

| `CommsStatus` | Display text | Color |
|---|---|---|
| `ACCEPTED` | "Approved" | Green (`#059669`) |
| `REJECTED` | "Rejected: {body}" | Red (`#dc2626`) |
| `FAILED` | "Failed" | Red (`#dc2626`) |
| `PENDING` | "Pending review" | Default gray |

---

### News Feed: Placeholder

The news feed card renders a centered placeholder ("News Feed coming soon") until the Mastodon API integration is built. No mock data is shown.

---

### Character Avatars

Colors cycle through a 6-color gradient palette (`AVATAR_GRADIENTS`) based on the character's index in the list. Initials are derived: first+last-word initials if multi-word name, first 2 chars otherwise.

---

### CSS Module Classes (`playerDashboard.module.css`)

| Class | Key styles |
|---|---|
| `.pageRoot` | `flex-direction: column; min-height: 100vh; background: #fafbfc` |
| `.navbar` | `height: 76px; background: #fff; border-bottom: 1px solid #e5e7eb; sticky` |
| `.body` | `display: flex; flex: 1` (3-column row) |
| `.leftSidebar` | `width: 357px; background: #fff; border-right: 1px solid #e5e7eb` |
| `.rightSidebar` | `width: 320px; background: #fff; border-left: 1px solid #e5e7eb` |
| `.center` | `flex: 1; overflow-y: auto; padding: 24px 32px` |
| `.directiveCard` | `background: #f3f4f6; border-radius: 6px; padding: 10px 12px` |
| `.newsFeedCard` | `background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow` |
| `.apCard` | `background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; padding: 20px 24px` |
| `.apArrow` | `flex: 1; flex-direction: column; align-items: center` |
| `.apArrowLine` | `width: 100%; height: 2px; background: #111827; with CSS arrow tip` |
| `.characterAvatar` | `40×40px circle; gradient background; white initials` |
| `@media (max-width: 700px)` | Stacks columns vertically |

---

### Known Omissions / Future Work

- **Directives endpoint**: `GET /scenarios/{id}/directives` may not exist on backend yet — shows empty list silently.
- **Likes count**: Hardcoded `0`. Will need Mastodon API to fetch real like counts on player's pronouncements.
- **Buy action points**: `alert()` stub. Needs `POST /players/{id}/actionPoints` or similar.
- **Day label on directives**: Figma shows "Day 8", "Day 7" etc. The `Directive.createdAt` is an ISO timestamp; day number needs to come from the scenario's `day` field or a separate server response.
- **Selected character highlight**: The right sidebar doesn't visually distinguish the player's own character. Consider adding a badge or different styling.

---

## `/scenarios/[id]/lobby` — Game Lobby

**File:** `app/scenarios/[id]/lobby/page.tsx`
**Styles:** `app/styles/lobby.module.css`
**Figma node:** `24:273`

### Purpose

Landing page for Players joining a scenario. Shows all characters created for that scenario as selectable cards. Also provides the "Become Backroomer" action.

---

### Authentication

Same guard as other pages: redirects to `/login` if `isAuthenticated` is false.

---

### Component Tree

```
GameLobbyPage
└─ ConfigProvider  (light theme)
   └─ .pageRoot
      ├─ <nav> .navbar  → .logoMark + "Game Lobby" + Avatar
      └─ <main> .pageBody
           ├─ Button "Become Backroomer"  (stub)
           ├─ <h1> "Select Your Character"
           ├─ <p>  subtitle
           └─ Spin (loading)
                └─ .characterGrid
                     └─ CharacterCard × N   (one per character)
```

**`CharacterCard` (inline component):**
```
.characterCard  (hover → indigo border + shadow)
├─ <h3> .characterName      character.name
├─ .cabinetRow
│    ├─ StarFilled           indigo star icon
│    └─ .cabinetName        cabinet.cabinetName (looked up by cabinetId)
├─ <p> .characterDesc       character.description
└─ .selectHint
     ├─ InfoCircleOutlined  muted icon
     └─ "Hover to select"
```

---

### Data Flow

1. `scenarioId` read from URL via `useParams().id`.
2. On mount (once `token` is available), fires **two parallel requests**:
   - `GET /scenarios/{id}/characters` → `Character[]`
   - `GET /scenarios/{id}/cabinets` → `Cabinet[]`
3. `getCabinetName(cabinetId)` joins them in-memory: finds the matching `Cabinet` by `id` and returns `cabinetName`.
4. Cards render only real characters from the API — no dummy data.

---

### Services Added

| Service | Method | Endpoint |
|---|---|---|
| `CharacterService` | `getCharactersByScenario(scenarioId, token)` | `GET /scenarios/{id}/characters` |
| `CabinetService` | `getCabinetsByScenario(scenarioId, token)` | `GET /scenarios/{id}/cabinets` |

---

### Character Card: Field Mapping

| `Character` field | Displayed as |
|---|---|
| `name` | Card heading (18px semibold) |
| `cabinetId` | Looked up in `cabinets[]` → `cabinetName` (indigo, star icon) |
| `description` | Body text (14px gray) |
| `id` | React `key` |
| `title`, `portrait`, `secret`, `isAlive`, `actionPoints`, `messageCount` | Not shown on this page |

---

### Interactions

| Action | Behavior |
|---|---|
| Click a character card | `alert()` stub — character selection not yet implemented |
| "Become Backroomer" button | `alert()` stub — role assignment not yet implemented |

---

### CSS Module Classes (`lobby.module.css`)

| Class | Key styles |
|---|---|
| `.pageRoot` | `min-height: 100vh; flex-direction: column; background: #fafbfc` |
| `.navbar` | `height: 64px; background: #fff; border-bottom: 1px solid #e5e7eb; sticky` |
| `.backroomerButton` | `height: 52px; width: 280px; font-size: 15px; font-weight: 600` |
| `.characterGrid` | `display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px` |
| `.characterCard` | `background: #fff; border-radius: 12px; cursor: pointer; transition border+shadow` |
| `.characterCard:hover` | `border-color: #4f46e5; box-shadow: indigo glow` |
| `.cabinetRow` | `flex; align-items: center; gap: 5px` |
| `.starIcon` | `color: #4f46e5; font-size: 13px` |
| `.cabinetName` | `font-size: 13px; font-weight: 500; color: #4f46e5` |
| `.selectHint` | `flex; centered; border-top: 1px solid #f3f4f6; color: #9ca3af` |
| `.emptyText` | `grid-column: 1 / -1; text-align: center; padding: 64px 0` |
| `@media (max-width: 900px)` | Grid → 2 columns |
| `@media (max-width: 600px)` | Grid → 1 column; button full-width |

---

### Known Omissions / Future Work

- **Character selection API**: `POST /scenarios/{id}/players` or similar endpoint needed. Currently an `alert()` stub.
- **Become Backroomer API**: Role assignment endpoint needed. Currently an `alert()` stub.
- **Already-taken characters**: No indication if a character is already claimed by another player. Will need backend support (`isAssigned` field or similar).

---

## `/scenarios/create` — Create New Scenario

**File:** `app/scenarios/create/page.tsx`
**Styles:** `app/styles/createScenario.module.css`
**Figma node:** `24:230`

### Purpose

Form page for Directors to create a new scenario. Submits `POST /scenarios` and redirects back to the scenario list on success.

---

### Authentication

Same guard as `/scenarios`: `useEffect` watching `isAuthenticated` redirects to `/login`; returns `null` during hydration.

---

### Component Tree

```
CreateScenarioPage
└─ ConfigProvider  (light theme override)
   └─ .pageRoot
      ├─ <nav> .navbar
      │    ├─ .navLeft → .logoMark + .navTitle
      │    └─ Avatar (UserOutlined)
      └─ <main> .pageBody
           └─ .contentWrapper
                ├─ .pageHeader → <h1> + <p>
                └─ .formCard
                     └─ Form (layout="vertical")
                          ├─ Form.Item "Scenario Title"   → Input
                          ├─ Form.Item "Description"      → Input.TextArea (rows=4)
                          ├─ .section "Characters"
                          │    ├─ .sectionHeader → <h3> + Button "Add Character" (stub)
                          │    └─ .sectionEmpty  (empty state text)
                          ├─ .section "Cabinets"
                          │    ├─ .sectionHeader → <h3> + Button "Add Cabinet" (stub)
                          │    └─ .sectionEmpty  (empty state text)
                          ├─ Form.Item "Message Cost"     → InputNumber (addonAfter="credits")
                          ├─ .fieldHint                   "Cost per message in this scenario"
                          └─ .formFooter
                               ├─ Button "Cancel"         → router.push("/scenarios")
                               └─ Button "Save Scenario"  → form submit
```

---

### Ant Design Components Used

| Component | Props / Notes |
|---|---|
| `ConfigProvider` | Overrides global dark theme; also sets `Form.labelColor: "#111827"` |
| `Form` | `layout="vertical"`; `onFinish` triggers API call |
| `Form.Item` | Required validation on title only |
| `Input` | Scenario title field |
| `Input.TextArea` | Description field, `rows={4}` |
| `InputNumber` | Message Cost; `addonAfter="credits"`, `min={0}`, initial value `0` |
| `Button` (primary) | "Save Scenario" (`htmlType="submit"`, `loading={submitting}`); "Add Character" / "Add Cabinet" stubs |
| `Button` (default) | "Cancel" → navigates back |
| `Avatar` | Navbar user icon |

---

### Hooks & Services Used

| Hook / Service | Purpose |
|---|---|
| `useAuth()` | Auth guard + `token` for API call |
| `useApi()` | Provides `ApiService` instance |
| `ScenarioService.createScenario(data, token)` | `POST /scenarios` |
| `useRouter()` | Cancel navigation + post-submit redirect |
| `Form.useForm()` | Ant Design form instance |

---

### Data Flow

1. User fills in title, description, message cost.
2. On submit, `Form` validates (title is required).
3. `handleSubmit(values)` builds a `ScenarioPostDTO: { title, description, exchangeRate }`.
4. Calls `ScenarioService.createScenario(data, token)` → `POST /scenarios`.
5. On success: `router.push(\`/scenarios/${created.id}\`)` → lands on the Director Dashboard for the new scenario.
6. On error: `alert()` with the error message.
7. `submitting` state drives the `loading` spinner on the "Save Scenario" button.

**Field → DTO mapping:**

| Form field | DTO field | Notes |
|---|---|---|
| Scenario Title | `title` | Required |
| Description | `description` | Nullable |
| Message Cost | `exchangeRate` | Default `0`; action-points cost per message |

---

### Sections: Characters & Cabinets

Both sections render an empty state only. The "Add Character" and "Add Cabinet" buttons show an `alert()` stub. Full implementation is deferred until character/cabinet creation flows are built.

---

### CSS Module Classes (`createScenario.module.css`)

| Class | Key styles |
|---|---|
| `.pageRoot` | `min-height: 100vh; flex-direction: column; background: #fafbfc` |
| `.navbar` | `height: 64px; background: #fff; border-bottom: 1px solid #e5e7eb; sticky` |
| `.logoMark` | `28×28px; border-radius: 6px; background: linear-gradient(135deg, #4f46e5, #7c3aed)` |
| `.navTitle` | `font-size: 16px; font-weight: 600; color: #111827` |
| `.pageBody` | `flex: 1; padding: 40px 32px` |
| `.contentWrapper` | `max-width: 880px; margin: 0 auto` |
| `.heading` | `font-size: 24px; font-weight: 700; color: #111827` |
| `.subheading` | `font-size: 14px; color: #6b7280` |
| `.formCard` | `background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; padding: 32px` |
| `.section` | `padding: 20px 0; border-bottom: 1px solid #e5e7eb; margin-bottom: 20px` |
| `.sectionHeader` | `display: flex; justify-content: space-between` |
| `.sectionTitle` | `font-size: 16px; font-weight: 600; color: #111827` |
| `.sectionEmpty` | `font-size: 14px; color: #9ca3af; text-align: center` |
| `.fieldHint` | `font-size: 13px; color: #6b7280; margin-top: -12px` |
| `.formFooter` | `display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #e5e7eb` |

---

### Known Omissions / Future Work

- **Characters section**: "Add Character" is a stub. Full flow needed to create characters within a scenario.
- **Cabinets section**: "Add Cabinet" is a stub. Full flow needed.
- **Exchange rate vs message cost**: `exchangeRate` in the type is described as "likes → action points conversion rate", but the form labels it "Message Cost". Clarify with backend on final field semantics.

---

## `/scenarios` — Scenario Manager (Main Page)

**File:** `app/scenarios/page.tsx`
**Styles:** `app/styles/scenarios.module.css`
**Figma node:** `24:105`

### Purpose

Displays all scenarios available to the authenticated Director. Provides entry points to create new scenarios, view a scenario detail, edit, or delete.

---

### Authentication

Guarded by `useAuth()`. On mount, a `useEffect` watches `isAuthenticated`:
- If `false`, calls `router.replace("/login")` to redirect.
- The component also returns `null` while `isAuthenticated` is false to prevent a flash of unauthenticated content during the localStorage hydration tick (the `useLocalStorage` hook reads from localStorage asynchronously on first render).

---

### Component Tree

```
ScenariosPage
└─ ConfigProvider  (light theme override — see "Theme Override" below)
   └─ .pageRoot
      ├─ <nav> .navbar
      │    ├─ .navLeft
      │    │    ├─ .logoMark         (indigo gradient square, logo stand-in)
      │    │    └─ .navTitle         "Scenario Manager"
      │    └─ .navRight
      │         ├─ Button (primary)  "Create New Scenario"
      │         └─ Avatar            user icon
      └─ <main> .pageBody
           └─ .contentWrapper
                ├─ .pageHeader
                │    ├─ <h1>         "Created Scenarios"
                │    └─ <p>          subtitle
                ├─ error message     (rendered if fetch fails)
                └─ Spin (loading wrapper)
                     └─ .cardList
                          └─ ScenarioCard × N
```

---

### Ant Design Components Used

| Component | Props / Notes |
|---|---|
| `ConfigProvider` | Overrides global dark theme with light tokens for this page |
| `Button` (primary) | "Create New Scenario" in navbar; navigates to `/scenarios/create` |
| `Avatar` | User icon in navbar; uses `UserOutlined` as fallback icon |
| `Dropdown` | Per-card "⋮" more-options menu; `trigger={["click"]}` |
| `Spin` | Wraps the card list; `spinning={loading}` |

---

### Icons Used (`@ant-design/icons`)

| Icon | Used for |
|---|---|
| `MoreOutlined` | Trigger button for the per-card dropdown menu |
| `UserOutlined` | Fallback inside the navbar `Avatar` |

---

### Hooks Used

| Hook | Source | Returns | Purpose |
|---|---|---|---|
| `useAuth()` | `app/hooks/useAuth.ts` | `{ token, isAuthenticated }` | Auth guard; passes `token` to `useScenarios` |
| `useScenarios(token)` | `app/hooks/useScenarios.ts` | `{ scenarios, loading, error }` | Fetches `GET /scenarios` |
| `useRouter()` | `next/navigation` | Next.js router | All in-page navigation |

---

### Data Flow

1. Component mounts; `useAuth` reads `token` from localStorage (one-tick async delay).
2. `useScenarios(token)` fires `GET /scenarios` with the Bearer token once `token` is non-empty. While `token` is `""` (hydrating), the hook skips the fetch.
3. While `loading` is `true`, `Spin` renders an overlay over the card area.
4. Each `Scenario` in the response maps to a `ScenarioCard`:
   - `title` → card heading
   - `description` → card body (falls back to `"No description provided."` if `null`)
   - `id` → React key, navigation target
5. `isActive`, `day`, and `exchangeRate` are not shown on this listing page.
6. `creationDate` does not exist on the `Scenario` type — the date row visible in Figma is intentionally omitted until the backend adds it.

---

### `ScenarioCard` Component (inline)

Defined inside `page.tsx` (not a separate file). Renders one card per scenario.

```
ScenarioCard({ scenario })
├─ .cardHeader
│    ├─ <h2> .cardTitle        scenario.title
│    └─ Dropdown (MoreOutlined)
│         ├─ "Edit"   → router.push(`/scenarios/${id}/edit`)
│         └─ "Delete" → alert stub (danger style)
├─ <p> .cardDesc               scenario.description or fallback
└─ .cardFooter
     └─ Button (type="link")   "View" → router.push(`/scenarios/${id}`)
```

---

### Theme Override

The global `layout.tsx` sets a dark Ant Design theme (`colorBgContainer: "#16181D"`, `colorText: "#fff"`, `Button.colorPrimary: "#75bd9d"`). This page wraps its entire output in a nested `ConfigProvider` to produce the light Figma design.

A nested `ConfigProvider` in Ant Design 6 merges tokens with the parent; child values win on collision. The override set:

| Token | Value | Reason |
|---|---|---|
| `colorBgContainer` | `#ffffff` | Overrides dark `#16181D` |
| `colorText` | `#111827` | Overrides global white text |
| `colorTextSecondary` | `#6b7280` | Description / subtitle text |
| `colorBorder` | `#e5e7eb` | Card and input borders |
| `colorPrimary` | `#4f46e5` | Indigo brand color for this page |
| `borderRadius` | `12` | Card corner radius |
| `fontSize` | `14` | Base font size |
| `Button.colorPrimary` | `#4f46e5` | Must also override at component level — the parent sets `Button.colorPrimary: "#75bd9d"` which would otherwise win |

---

### Navigation

| Action | Destination | Status |
|---|---|---|
| "Create New Scenario" button | `/scenarios/create` | Live |
| "View" button on a card | `/scenarios/[id]` | Live |
| "Edit" in more menu | `/scenarios/[id]/edit` | Stub (404) |
| "Delete" in more menu | `alert()` | Stub |

---

### CSS Module Classes (`scenarios.module.css`)

| Class | Key styles |
|---|---|
| `.pageRoot` | `min-height: 100vh; display: flex; flex-direction: column; background: #fafbfc` |
| `.navbar` | `height: 64px; background: #fff; border-bottom: 1px solid #e5e7eb; sticky; z-index: 100` |
| `.navLeft` | `flex; align-items: center; gap: 10px` |
| `.logoMark` | `28×28px; border-radius: 6px; background: linear-gradient(135deg, #4f46e5, #7c3aed)` |
| `.navTitle` | `font-size: 16px; font-weight: 600; color: #111827` |
| `.navRight` | `flex; align-items: center; gap: 16px` |
| `.avatar` | `background: linear-gradient(135deg, #4f46e5, #7c3aed)` |
| `.pageBody` | `flex: 1; padding: 40px 32px` |
| `.contentWrapper` | `max-width: 720px; margin: 0 auto` |
| `.pageHeader` | `margin-bottom: 28px` |
| `.heading` | `font-size: 24px; font-weight: 700; color: #111827` |
| `.subheading` | `font-size: 14px; color: #6b7280` |
| `.cardList` | `display: flex; flex-direction: column; gap: 16px` |
| `.card` | `background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; padding: 20px 24px; hover shadow` |
| `.cardHeader` | `display: flex; justify-content: space-between; gap: 12px` |
| `.cardTitle` | `font-size: 18px; font-weight: 600; color: #111827` |
| `.cardDesc` | `font-size: 14px; color: #6b7280` |
| `.cardFooter` | `display: flex; padding-top: 4px` |
| `.errorText` | `color: #dc2626; font-size: 14px` |
| `.emptyText` | `color: #9ca3af; text-align: center; padding: 48px 0` |
| `@media (max-width: 600px)` | Reduced padding on navbar, pageBody, card; `.cardTitle` → 16px |

---

### Known Omissions / Future Work

- **Date row**: Figma shows a calendar icon + creation date on each card. The `Scenario` type has no `creationDate` field. Implement when the backend adds it.
- **User avatar initials**: Figma shows "JD" initials. Currently renders a `UserOutlined` icon. Upgrade to real initials once user profile is fetched on this page.
- **Stub routes**: `/scenarios/[id]/edit` does not exist yet and will 404.

---

## `/scenarios/[id]` — Director Dashboard

**File:** `app/scenarios/[id]/page.tsx`
**Styles:** `app/styles/directorDashboard.module.css`
**Figma node:** `62:21`

### Purpose

The main control panel for a Director managing an active scenario. Shows the current game state, provides controls to start/freeze/end the game, and lists recent activity (news stories).

---

### Authentication

Same guard: `useEffect` watching `isAuthenticated` redirects to `/login`; component returns `null` during hydration.

---

### Component Tree

```
DirectorDashboardPage
└─ ConfigProvider  (light theme override)
   └─ .pageRoot
      ├─ <nav> .navbar
      │    ├─ .navLeft → .logoMark + "Director Dashboard"
      │    └─ .navRight → Button "All Scenarios" + Avatar
      └─ <main> .pageBody
           └─ Spin (loading)
                └─ .contentWrapper
                     ├─ .pageHeader → .scenarioTitle + .scenarioSubtitle
                     ├─ .topRow
                     │    ├─ Game Status card
                     │    │    ├─ .cardLabel "GAME STATUS"
                     │    │    ├─ .statusValue → StopOutlined icon + status text
                     │    │    ├─ .statusBadge → .dot + badge text
                     │    │    └─ .statusDescription
                     │    └─ Game Controls card
                     │         ├─ .cardLabel "GAME CONTROLS"
                     │         ├─ Button "Start Game"   (primary, full width, 56px)
                     │         └─ .controlsRow
                     │              ├─ Button "Freeze Game" (blue outline)
                     │              └─ Button "End Game"    (danger)
                     └─ Recent Activity card (.activityCard)
                          ├─ .activityHeader → "Recent Activity" + "See All News →"
                          └─ .activityList (empty state)
```

---

### Ant Design Components Used

| Component | Props / Notes |
|---|---|
| `ConfigProvider` | Light theme override |
| `Spin` | Wraps content area; `spinning={loading}` |
| `Button` (primary) | "Start Game" — full width, 56px height |
| `Button` (default, blue border) | "Freeze Game" — `borderColor: #3b82f6`, `color: #3b82f6` |
| `Button` (danger) | "End Game" |
| `Button` (link) | "See All News →" and "All Scenarios" |
| `Avatar` | Navbar user icon |

---

### Hooks & Services Used

| Hook / Service | Purpose |
|---|---|
| `useAuth()` | Auth guard + `token` |
| `useApi()` | Provides `ApiService` instance |
| `ScenarioService.getScenarioById(id, token)` | `GET /scenarios/{id}` — fetches scenario title and status |
| `useParams()` | Reads `id` from URL |
| `useRouter()` | Navigation |

---

### Data Flow

1. `scenarioId` read from URL via `useParams().id`.
2. `GET /scenarios/{scenarioId}` fires once `isAuthenticated` is true.
3. `scenario.title` → page heading.
4. `deriveStatus(scenario)` maps `{ isActive, day }` → `"stopped" | "running" | "frozen"`:
   - `!isActive && day === 0` → `"stopped"`
   - `isActive` → `"running"`
   - `!isActive && day > 0` → `"frozen"`
5. Status drives the label, dot color, badge text, and description text.
6. All game-control buttons are `alert()` stubs.

---

### Navigation

| Action | Destination | Status |
|---|---|---|
| "All Scenarios" button | `/scenarios` | Live |
| "Start Game" button | alert stub | Not yet implemented |
| "Freeze Game" button | alert stub | Not yet implemented |
| "End Game" button | alert stub | Not yet implemented |
| "See All News →" button | alert stub | Not yet implemented |

---

### CSS Module Classes (`directorDashboard.module.css`)

| Class | Key styles |
|---|---|
| `.pageRoot` | `min-height: 100vh; flex-direction: column; background: #fafbfc` |
| `.navbar` | `height: 64px; background: #fff; border-bottom: 1px solid #e5e7eb; sticky` |
| `.topRow` | `display: grid; grid-template-columns: 1fr 1.5fr; gap: 24px` |
| `.card` | `background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; padding: 28px` |
| `.cardLabel` | `font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase` |
| `.statusText` | `font-size: 36px; font-weight: 700` (color set by modifier class) |
| `.statusText.stopped` | `color: #ef4444` |
| `.statusText.running` | `color: #10b981` |
| `.statusText.frozen` | `color: #3b82f6` |
| `.dot` | `8×8px circle` (`.red`, `.green`, `.blue` modifiers) |
| `.controlsGrid` | `flex-direction: column; gap: 12px` |
| `.startBtn` | `height: 56px; font-size: 16px; font-weight: 600` |
| `.controlsRow` | `flex; gap: 12px` (children `flex: 1`) |
| `.activityCard` | Same card style; `margin-top: 0` (in flow after `.topRow`) |
| `@media (max-width: 760px)` | `.topRow` → `grid-template-columns: 1fr`; reduced padding |

---

### Known Omissions / Future Work

- **Game controls API**: Start/Freeze/End require backend endpoints (e.g. `PATCH /scenarios/{id}/start`). Currently `alert()` stubs.
- **Recent Activity**: No backend endpoint yet. Shows empty state. Will need `GET /scenarios/{id}/news` or similar.
- **Freeze state**: The `Scenario` entity only has `active: boolean`. A separate `frozen: boolean` field may be needed to distinguish frozen from stopped.
- **Role guard**: Any authenticated user can currently navigate to this page. Director-only guard needs to be added once role info is available from the auth token.
