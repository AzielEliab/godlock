# Receipt wipe retired

The parent D1 receipt and ledger DELETE procedure is retired.

GodLock.uk wraps each receipt into the lattice hashchain after `appendLedger` and pulls that wrap back by `entry_hash`. Primary online writes address aziel-runtime. Secondary offline writes address aziel-corpus. The submitting user's tie-break keeps an offline document on one chain. Deleting `receipts` or `ledger` would break that chain.

Do not run DELETE or a remote D1 execute against `receipts` or `ledger`. This file has no wipe SQL and no wipe command. Application code does not delete those rows.

## What stays

Do not reset Views, the Uses floor, the running score, the downloads cache, heartbeats, download KV, or runtime-uses KV. Those are not the receipt lattice.

`workers/godlock-uk/src/index.js` creates tables with `CREATE TABLE IF NOT EXISTS` and `INSERT OR IGNORE` for metadata defaults. It increments `views` on homepage GET. It snapshots Uses into `metadata.uses` when the ledger count is higher. It does not delete receipt rows or ledger rows, and it does not set those counters to zero.

`schema.sql` says never UPDATE or DELETE receipt or ledger rows from the app. There is no operator exception.

The submit throttle may drop its own expired rows. That table is not a receipt and not the lattice.

`--no-persist` on the local Python package is in-memory. It is not a wipe of godlock.uk.
