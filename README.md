# Crisis Manager Frontend

## Introduction

This is the frontend component of Crisis Manager, a project to facilitate the running of Model United Nations crisis role-playing games. Crisis is a common game format at MUN conferences in which historical or fictional scenarios are simulated, with participants serving as individual characters.

Our website facilitates interactions between 3 types of participants: **Directors**, who create and control the state of the crisis scenario; **Characters (Players)**, who represent people within the universe of the game, and can undertake actions by sending directives, send messages to other characters, and post publicly visible pronouncements; and **Backroomers**, who approve and respond to player directives and messages, and function equivalently to a dungeon master in Dungeons & Dragons.

The website allows a user to be involved with many different crisis scenarios in different capacities. It integrates with the API of Mastodon to allow the visibility of news stories posted by characters and backroomers, and allows characters to use likes to purchase additional messages.

## Tech Stack

This frontend is built with web technologies to ensure a responsive and interactive user experience:

- **Framework:** Next.js 15 (App Router, Turbopack) with React 19
- **Language:** TypeScript
- **Styling & UI:** Ant Design 6 (with global and per-page theme overrides), CSS Modules
- **Runtime:** Node.js or Deno
- **Testing:** Jest + React Testing Library

## Architecture

**API layer.** `ApiService` (`app/api/apiService.ts`) is a thin `fetch` wrapper
that builds requests against the base URL, attaches `Content-Type` and an
optional `Authorization` header, and normalizes errors into `ApplicationError`
(`{ message, status, info }`). Each domain has a service class
(`ScenarioService`, `CharacterService`, …) that exposes typed methods and is
constructed with an `ApiService` instance via the `useApi()` hook (memoized so
only one instance exists per app).

**Auth & session.** `useAuth()` (`app/hooks/useAuth.ts`) owns the auth token and
user id, both kept in `localStorage`. Tokens are stored already prefixed with
`Bearer `. Login/register persist the token; `logout()` calls the backend and
then wipes **all** per-session keys — including per-scenario role tokens stored
under keys like `scenario_{id}_directorToken`, `selectedCharacter_{id}`, etc. —
so the next user on the same browser can't inherit a previous session's role
credentials.

**Role scoping.** Because a user's role is per scenario, role tokens/ids are
stored per scenario in `localStorage`. `routeForEngagement()`
(`app/utils/engagementRouting.ts`) decides where to send a user based on their
engagement: Directors → `/scenarios/{id}`, Backroomers →
`/scenarios/{id}/backroom`, Players → `/scenarios/{id}/player`; non-engaged
viewers of a completed scenario land on the read-only news feed, otherwise the
lobby.

**Live updates.** `usePolling()` (`app/hooks/usePolling.ts`) re-runs a fetcher on
an interval to keep dashboards (directives, messages, news, online status) in
sync with the server, since approvals happen asynchronously on the backroom
side.

## Components

The Frontend is composed of several key dashboards and views tailored to the user's role in a given scenario:

### Scenarios & Game Lobby

Displays all scenarios created by all users, segmented into "All Scenarios" and "My Scenarios". Status labels indicate whether a scenario is `UNSTARTED`, `In Progress`, or `COMPLETED`. Users can browse these to join an available game via the Game Lobby, resume their role, or view the public news feed of a completed scenario.

### Director Dashboard

The control center for the scenario creator. The director can advance the game to the "Next Day", "Freeze" the game (temporarily disabling characters from sending messages/directives so the backroom can catch up), or "End Game". The director can also monitor player stats (directives, messages sent, total text length), "kill" a character if they are no longer alive in the scenario, and add a Mastodon token for integrations.

### Character Dashboard

The interface for players participating in the simulation. Players can view a character list (with unread message indicators), check their available messages and current likes balance, send private messages to other characters, issue directives to the backroom, and post pronouncements to the News Feed.

### Backroom Dashboard

The moderation queue for the backroom team. Backroomers can filter and review incoming player directives, approve or reject them, write response messages, review pending communications between characters, and publish global News Stories to all players.

### News Feed & Mastodon

A page where all pronouncements and backroom news stories are published. If the scenario director has added a Mastodon account, players can navigate through the "Go to Mastodon" button on the Character Dashboard to support pronouncements and receive likes for their own pronouncements. Player can purchase more messages than the starting amount with likes they received. The news page is public to all app users after a scenario is completed.

## How to Use and Test the App

To fully test the features of the Crisis Manager, you will need to simulate a multi-user environment. Here is a step-by-step walkthrough:

**1. Account Creation & Profile Setup**

- Register at least 4 separate accounts (e.g., using different browser profiles or incognito windows) to represent the Director, a Backroomer, and two Characters.
- Log in and test editing your profile (avatar, name, and bio) via the profile pop-over.

**2. Create a Crisis Scenario (User A - Director)**

- As User A, navigate to the **Create New Scenario** page.
- Fill in the Scenario Title, Description, Message Cost (number of likes required to buy a message), and Starting Messages.
- Add Characters involved in this scenario and assign them descriptions and portraits.
- Save the scenario. User A automatically becomes the **Director**.
- On the Director Dashboard, follow the question mark button to add a Mastodon account.

**3. Join the Scenario (Users B & C's)**

- As User B, browse the Scenarios list, open the newly created scenario, and click the **Become Backroomer** button.
- As User C1 & C2, open the same scenario and click on an available Character card in the Game Lobby to claim it.
- Try navigating back to All Scenarios and resume roles from **My Scenarios**.

**4. Gameplay Loop - Character Actions**

- As User C1, navigate to your Character Dashboard.
- **Communicate:** Draft and send a private message to the other Character in the game.
- **Directives:** Submit a directive outlining an action you wish to take in response to the current story.
- **Pronouncements:** Post a public statement.
- **Go to Mastodon:** As User C2, click on "Go to Mastodon" and like (☆) User C1's pronouncement.
- **Buy Messages:** Back to User C1, check if current like balance increased and purchase a new message.
- After **Backroom Moderation**, test if:
  - User C1's Character Dashboard auto-updates the directive status.
  - User C2 receives C1's message only upon backroom's approval.

**5. Gameplay Loop - Backroom Moderation**

- As User B (Backroomer), navigate to the Backroom Dashboard.
- Review User C1's pending message and directive. Click on a button to approve or reject the private message, and use the Communication Form to approve or reject the directive with a response.
- Post a **News Story** to update the state of the world for all players.

**6. Gameplay Loop - Director Controls**

- As User A (Director), monitor the recent activity on the Director Dashboard.
- Test game states: Click **Freeze** to temporarily stop character actions, click **Next Day** to advance time, and finally **End Game** to conclude the scenario.

## Launch and Deployment

To initiate the frontend client locally:

1. Ensure the Backend Server is running (defaults to `http://localhost:8080`).
2. Install dependencies.
3. ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## Roadmap

There are several possible modifications which would improve the functionality of the system. Desired features include:

- The inclusion of a cabinet class, which would be able to separate the characters of a crisis scenario into distinct factions
- Imposing limits on how backroomers can join a crisis, for example by limiting their number or requiring a code to join
- Allowing Directors to also perform the tasks of a backroomer.

## Authors and Acknowledgement

This codebase was created by:\
Faye Dinh\
Github: reasonablefailure

Kai Schärer\
Github: HalaiRhea

Zeyu Wang\
Github: zeyuwang-uzh

Yiru Yang\
Github: yiruyang2025

We would additionally like to give thanks to Ceyhun Emre Açikmese for his invaluable guidance.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
