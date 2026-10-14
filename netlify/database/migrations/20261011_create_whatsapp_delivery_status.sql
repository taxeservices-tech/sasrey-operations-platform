CREATE TABLE IF NOT EXISTS whatsapp_delivery_status (
    id BIGSERIAL PRIMARY KEY,
    message_id TEXT NOT NULL,
    recipient_id TEXT,
    delivery_status TEXT NOT NULL,
    event_timestamp BIGINT,
    errors JSONB NOT NULL DEFAULT '[]'::jsonb,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    raw_event JSONB,
    event_key TEXT NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_delivery_message_id
    ON whatsapp_delivery_status (message_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_delivery_status
    ON whatsapp_delivery_status (delivery_status);

CREATE INDEX IF NOT EXISTS idx_whatsapp_delivery_received_at
    ON whatsapp_delivery_status (received_at);