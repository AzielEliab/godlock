-- Receipt proof reads a receipt's ledger rows by exact receipt_id (no substring scan).
CREATE INDEX IF NOT EXISTS idx_ledger_receipt_id ON ledger(json_extract(payload_json, '$.receipt_id'));
