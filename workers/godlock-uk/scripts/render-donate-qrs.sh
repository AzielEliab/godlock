#!/usr/bin/env bash
# Render AZL-DONATE-1.0 payment-URI QRs as solid black-on-white PNGs.
# Author: Aziel Eliab.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/donate/qr"
mkdir -p "$OUT"

render() {
  local id="$1"
  local uri="$2"
  npx --yes qrcode -t png -e M -q 4 -w 512 -l '#ffffff' -d '#000000' -o "$OUT/${id}.png" "$uri"
}

render btc 'bitcoin:bc1q8cg7hmgmu7x9yaja8j249np0vt84d4y8duugr7'
render eth 'ethereum:0x29b386022e3968cf8dBFCE59569b49680184B23b'
render ltc 'litecoin:LWuqPjMCFtLHvoBaQL4m8QtnxbXSDftVNs'
render xrp 'xrp:rLc3jZJbgEU1wBGwTFtgyq8bpayQE15K7b'
render doge 'dogecoin:DQ4go4iLPfNXDWim4KptTh3565sFCVrCyp'
render sol 'solana:6BZNXxEvcZf1CgkWYojKoWUPCxCcNLbDKYRPfaN465gj'
render trx 'tron:TJXb1YhZ9pAYsEW6UKUAzxFUzH6Tzcacyy'

echo "Wrote PNG QRs in $OUT"
