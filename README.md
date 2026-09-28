# Taskly

An offline-first task manager for iOS, Android and the web, built with Expo,
React Native and TypeScript. Designed for one-handed use on a portrait phone;
all data stays on the device, with no account required.

| Screen | What it does |
| --- | --- |
| **Today** | Greeting, daily progress, quick filters (all, high focus, due now) and the "up next" list, with one-tap task capture. |
| **Task sheet** | Title, notes, project, priority, schedule, estimate and tag, for both new and existing tasks. |
| **Planner** | Seven-day selector, overdue callout, scheduled work per day and the unscheduled backlog. |
| **Projects** | Colour-coded project cards with task counts and progress. |
| **Insights** | Weekly review: completed tasks, focus minutes from estimates, completion rate and daily activity. |
| **Settings** | Clear completed tasks, reset data, and app information. |

Tasks and projects are saved with AsyncStorage (localStorage on the web). Data
saved by earlier versions of the app is migrated when it loads.

## Run it

Requires Node.js 20+ and pnpm 9 (`npm install -g pnpm@9`).

```bash
pnpm install
pnpm dev        # Expo on :8081 (open the web app or scan the QR code) + optional API on :3000
pnpm android    # native Android build (needs the Android SDK)
pnpm ios        # native iOS build (macOS + Xcode)
```

```bash
pnpm check      # TypeScript
pnpm lint
pnpm test       # task domain and auth tests
```

On the very first web start after a fresh install, NativeWind can fail with
`Failed to get the SHA-1 for ... react-native-css-interop/.cache/web.css`.
It generates that file during the first bundle; run the command again.

## Configuration

Taskly needs no configuration. The optional server (sign-in, database, Forge
APIs) reads the variables listed in `.env.example`; copy it to `.env` to use
them. `.env` is git-ignored.

## Credits

Created by **Janin A Apurba**. Released under the [MIT License](LICENSE).

## Follow Janin on YouTube

If this project helped you, please follow and subscribe:

- **Study with Janin**: [youtube.com/@studywithjanin](https://www.youtube.com/@studywithjanin)
- **Pomodoro Study with Janin**: [youtube.com/@pomodorostudywithjanin3326](https://www.youtube.com/@pomodorostudywithjanin3326)
