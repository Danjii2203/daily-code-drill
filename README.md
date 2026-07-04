# Daily Code Drill

A daily, framework-scoped, 10-minute coding rep with zero AI assistance while
you write — the AI's only job is reviewing your submission afterward.

## How it works

- Pick a framework from the fixed list on the home page.
- The app fetches today's challenge for that framework (generated once per
  day per framework by GPT-4o, then cached in Upstash Redis — everyone who
  picks "React" today gets the same challenge).
- You get 10 minutes in a CodeMirror editor (syntax highlighting only, no
  autocomplete/AI). The countdown is stored in `localStorage`, so refreshing
  the page doesn't reset it.
- When time hits zero, the editor locks (read-only) but you can still submit
  whatever you have.
- GPT-4o reviews the submission — statically, it never executes your code —
  using the relevant subset of correctness / readability / architecture /
  security / performance, and frames feedback differently depending on
  whether you finished early or ran out of time.
- You can retry the same daily challenge as many times as you want (fresh
  timer, blank editor) — there are no accounts, so nothing is tracked
  between attempts.

## Local setup

```bash
npm install
cp .env.example .env.local
# fill in OPENAI_API_KEY at minimum
npm run dev
```

Upstash Redis (`KV_REST_API_URL` / `KV_REST_API_TOKEN`) is only
required if you want challenge caching to actually work locally against a
real store. If you're just testing the UI, you can run without it — the
challenge generation call will simply run on every request instead of being
cached (fine for local dev, not for production, since it costs an API call
per page load).

## Deploying to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. In the Vercel project: **Storage → Marketplace Database Providers →
   Upstash → Create**, then connect it to the project — this
   auto-populates `KV_REST_API_URL` / `KV_REST_API_TOKEN`.
   (Vercel KV itself was sunset in late 2024; Upstash Redis is the
   replacement.)
3. Add `OPENAI_API_KEY` under **Settings → Environment Variables**.
4. Deploy.

## Deliberately out of scope for v1

No accounts, no streaks/history, no leaderboards, no difficulty levels, no
code execution/sandboxing, no free-text framework input. See the design
decision log from the planning conversation if you want the reasoning
behind each of these.
