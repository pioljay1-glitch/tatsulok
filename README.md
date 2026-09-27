# TATSULOK

Interactive first-person 3D puzzle game about power, mystery, corruption, development, and democracy.

This is the playable rebuild of the TATSULOK prototype: lobby, characters, dossiers, factions, missions, and a **true first-person 3D district**.

## Play locally

```bash
npm install
npm run dev
```

Open the Vite URL. Choose a character, open a mission, click the district to look around.

### Controls

- Desktop: click to capture mouse look, WASD move, Shift run, E interact
- Mobile / iPad: left joystick move, drag to look, RUN / INTERACT buttons
- BACK returns to the mission list without a full reload

## Mission 01

Flooded street → survivor → clue → blocked road → side street → supplies → evacuation center → choice.

Choices are saved in `localStorage` (`tatsulok-choices`).

## Deploy

Vite static site. On Render / Vercel / Netlify:

- Build: `npm run build`
- Publish: `dist`

Character portraits and audio load from the original public assets on GitHub so this repo stays small.

Status: playable first-person prototype.
