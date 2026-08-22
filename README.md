
# MacroCalculator - Local PWA

This is a simple macronutrient calculator intended to be downloaded and saved onto your mobile phone. No API calls, no cloud providers, no data being sent out or coming in. 

## Why PWA?
Because I don't want to pay Apple or Google to put it on their app stores lol.

## Tech Stack
* Vite
* React / Typescript
* Tailwind v4
* Figma (design assistance)
* Dexie for their IndexedDB wrapper

## Setup

**Just want to use it?** Open [the deployed site](https://macro-calculator-pwa.vercel.app) on your phone,
then add it to your home screen:

- **iOS (Safari only):** Share → Add to Home Screen. Chrome on iOS
  can't do this.
- **Android (Chrome):** you'll get an install prompt, or Menu → Install app.

Once installed it runs offline and stores everything on your device.

**Want your own copy?**

```bash
git clone <repo> && cd macro
npm install
npm run dev
```

To use it on your phone, deploy `npm run build` output anywhere static —
Netlify, Vercel, GitHub Pages. It has to be served over HTTPS; the
service worker won't register otherwise, so it won't install.
