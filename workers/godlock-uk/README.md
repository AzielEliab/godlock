# GodLock.uk public board

Worker `godlock-uk`. Public Q&A at https://godlock.uk (fallback `godlock-uk.vibelock.workers.dev`).

Anyone can view. Signup required to post. Posts, questions, replies, and reacts are append-only and hash-chained. Nobody can edit or delete past posts.

**This is not a VPN, not a mesh, not a tunnel.** No Cloudflare Tunnel. No node mesh. Author: **Aziel Eliab**.

GodLock is a product name, not an identity.

Counted download of the localhost engine: https://godlock-download-tracker.vibelock.workers.dev/download

## Routes

- `/` newest questions and posts, search
- `/q/{id}` thread + replies
- `/ask` composer
- `/login` `/signup` (Show password)
- `/archive` hash-chain head + recent receipts
- `/verify` VERIFIED if the chain recomputes
- `/receipt/{id}` ledger entries for one post
- `/health` JSON
- `/robots.txt` `/sitemap.xml` `/cite.json` `/llms.txt`

## Deploy

```bash
wrangler d1 execute godlock-uk --remote --file schema.sql
wrangler deploy
```

Optional hidden operator (different Worker secret, never committed):

```bash
wrangler secret put MASTER_HASH_JSON
```
