# Monetization design — payment locks & open-core

Design (not yet implemented) for gating "Pro" features behind payment, without
compromising the open-source, self-hostable core. Implement this **only when
going live / shipping a Pro build** — the free OSS product must always stand on
its own.

## Principle

**Open-core.** The core — connect, scan, score, bulk archive/delete, unsubscribe,
domain reputation — stays free and fully functional in the OSS build. Pro adds
convenience/scale on top; it never holds the core hostage.

## Free vs Pro (proposed split)

| Free (OSS, forever) | Pro |
|---|---|
| Full IMAP scan + scoring | **Scheduled scans** (cron / background) |
| Bulk archive / delete / unsubscribe | **History & reports** (trends over time, CSV/JSON **export**) |
| Domain reputation (DNS; VT with your own key) | **Saved rules / auto-actions** |
| Accent + light/dark, ⌘K palette | Priority support |

Rule of thumb: gate **time-savers and scale**, never the ability to clean the
inbox once.

## Entitlement model (single source of truth)

One resolver consumed by both UI and API:

```ts
type Plan = "free" | "pro";
interface Entitlement { plan: Plan; features: Set<string>; source: "oss" | "license" | "subscription"; }
```

- `useEntitlement()` (frontend) → gates UI.
- `require_pro(feature)` dependency (backend) → gates the endpoint.
- Default in the OSS build: `{ plan: "free" }`.

## Unlock A — Desktop / self-hosted: license key (one-time purchase)

The lightest, lowest-risk first money path — pairs with the **Tauri desktop app**
("download, double-click, private").

- Sell a **signed license key** (offline-verifiable: Ed25519 signature over
  `{ email, plan, issued_at }`; ship the public key in the app).
- User pastes the key (Settings) or sets `PYMAIL_LICENSE_KEY`; the app verifies
  the signature locally — **no phone-home**, works fully offline.
- Fits the privacy story: nothing leaves the machine.

## Unlock B — Hosted: subscription (Stripe)

For a hosted tier ("no ar").

- Accounts + **Stripe Checkout**; a **webhook** (`checkout.session.completed`,
  `customer.subscription.*`) writes the entitlement to the user record.
- Free tier with limits (e.g. N scans/senders per month, bulk read-only);
  Pro removes limits + unlocks the Pro features above.

## Enforcement

- **UI**: locked features render a discreet **"Pro"** badge + an upgrade CTA.
  Never break the flow — let the user reach the action, gate only the **final
  click** (that's where intent is highest and the upsell lands best).
- **API**: a `require_pro` guard on the Pro endpoints (`/schedule`, `/export`,
  saved-rules, …). The core endpoints (`/analyze`, `/delete`, `/archive`) stay
  ungated.

## Honest caveats

- A **hosted** tier still carries the auth/compliance burden discussed in the
  launch strategy — real **OAuth** (Gmail API / Microsoft Graph) + app
  verification. So sequence it **after** the desktop license path, which needs
  none of that.
- Don't cripple the OSS core to sell Pro — that kills goodwill and the launch.
- The scan itself is never gated (it's the demo and the hook).

## Rollout

1. **Now** — this design only. Ship the free product and grow distribution.
2. **On traction** — desktop app + **license key** (Unlock A). One-time purchase,
   offline, privacy-aligned. Lowest lift.
3. **Later, if hosting** — accounts + **Stripe** (Unlock B), together with the
   OAuth/compliance investment.
