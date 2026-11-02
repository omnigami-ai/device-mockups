# Device mockups · omnigami

Your real screens, on a soft studio ground.

Put your product’s real screens on photoreal hardware in a soft studio setting. Pair a laptop and phone, add your own short line, or show an action and its result on two phones. Get wide and tall PNGs, small review copies and editable HTML.

See its images at [omnigami.ai/skills/device-mockups](https://omnigami.ai/skills/device-mockups).

## Install

In Claude Code:

```
/plugin marketplace add omnigami-ai/skills
/plugin install omnigami-device-mockups@omnigami
```

With the skills CLI, for Claude Code and other agents that read SKILL.md:

```bash
npx skills add omnigami-ai/device-mockups
```

Or copy `skills/device-mockups/` into your agent's skills folder (for Claude Code, `~/.claude/skills/device-mockups/`). Then ask:

```
Make light device mockups from my product’s real screens
```

## What it runs

The skill works on your computer. Its Node scripts capture your product’s real screens in a local browser, render the image set, check the cards and wire the Open Graph and Twitter tags into your site. It leaves an editable plan and an update script in your project. It sends nothing to omnigami; only your own product’s pages are loaded over the network.

## You need

- An AI coding agent that reads SKILL.md
- Node 20.11 or later
- ffmpeg
- A Chrome-family browser with WebGL
- puppeteer-core

Free. Your agent’s usual usage applies; no paid API or image-generation account is needed for the included poses.

## Licence

Free to use. Use the films and anything else the skill makes for anything, commercial work included. Don't redistribute the skill. See [LICENSE.md](LICENSE.md). The bundled fonts keep their own licence (SIL Open Font License, beside them in `reference/assets/fonts/`).

## Credits

Its example shows Ostlery, a fictional company made for omnigami’s examples, with sample data.

The devices are based on [“Apple Macbook Air 15 (Space Gray) 2023”](https://sketchfab.com/3d-models/apple-macbook-air-15-space-gray-2023-e8d82e341c794141a2561c2c9d01d79e) by akshatmittal and [“iPhone 16 Pro Max”](https://sketchfab.com/3d-models/iphone-16-pro-max-41a071ae12794b668502f58d1e0fd1a3) by MajdyModels, modified for omnigami and used under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (`reference/assets/devices/`).

omnigami is not affiliated with Anthropic. More skills at [omnigami.ai](https://omnigami.ai).
