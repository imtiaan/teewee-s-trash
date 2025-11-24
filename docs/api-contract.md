# Hobo Hustle Aggregation API — Contract (v1)

Status: Draft
Base URL: `https://<your-api-domain>`
Versioning: Prefix all endpoints with `/v1`
Content Type: `application/json`

## Overview
- Purpose: aggregate dig events from multiple streamers (tenants) and expose per-stream leaderboards; global endpoints exist but are not used by Desktop v0.1.
- Tenancy: each streamer is a tenant; identified by `provider + channel_id`.
- Identity: players identified by `provider + user_id` (stable, not display name).
- Security: write endpoints require API key; read endpoints are public.

## Client Usage (Desktop v0.1)
- Uses: `POST /v1/event/dig`, `GET /v1/leaderboard/channel`.
- Optional: `GET /v1/player/rank` (stream rank only; ignore `global`).
- Not used: `GET /v1/leaderboard/global`.

## Authentication
- Header: `X-API-Key: <channel api key>`
- Scope: write endpoints only; the API key maps to a single `(provider, channel_id)`.
- Optional Idempotency: `Idempotency-Key: <uuid>` on writes to dedupe duplicates for 60s.

## Entities & Types
- `provider`: string enum — `twitch`, `youtube`, `kick`.
- `channel_id`: string — provider-specific channel identifier.
- `user_id`: string — provider-specific user identifier.
- `display_name`: string — latest friendly name; stored for rendering.
- `points`, `xp`: integer ≥ 0.
- `rarity`: enum — `common`, `rare`, `epic`, `legendary`.
- `item_slug`: string — loot slug.
- `ts`: ISO 8601 UTC timestamp (e.g., `2025-01-01T12:00:00Z`).
- Rank ordering: `points DESC, last_seen ASC` for deterministic ties.

## Write Endpoints

### POST `/v1/event/dig`
Records a single dig award event and updates aggregates.

Request (JSON):
```
{
  "provider": "twitch",
  "channel_id": "12345",
  "user_id": "67890",
  "display_name": "HoboHustler",
  "points_delta": 25,
  "xp_delta": 25,
  "item_slug": "prototype-railgun-coil",
  "rarity": "epic",
  "ts": "2025-01-01T12:00:00Z"
}
```
Validation:
- `points_delta`, `xp_delta` ≥ 0; `rarity` in enum; `item_slug` non-empty.
- API key must map to the same `(provider, channel_id)`.

Response:
```
201 Created
{
  "ok": true,
  "event_id": "ev_01HX...",
  "stream_player": { "points": 1234, "xp": 1234 },
  "global_player": { "points": 5432, "xp": 5432 }
}
```

Errors:
- `401 Unauthorized` — missing/invalid `X-API-Key`.
- `403 Forbidden` — key does not match `(provider, channel_id)`.
- `429 Too Many Requests` — rate limited.
- `400 Bad Request` — invalid payload.
- `500 Internal Server Error` — unexpected.

### POST `/v1/events/dig`
Batch ingest; same shape as single, but array.

Request:
```
[
  { ... },
  { ... }
]
```
Response:
```
202 Accepted
{
  "ok": true,
  "accepted": 10,
  "failed": 0
}
```

## Read Endpoints

### GET `/v1/leaderboard/channel`
Returns top players for a specific stream.

Query:
- `provider` (required)
- `channel_id` (required)
- `limit` (optional, default `10`, max `50`)
- `offset` (optional, default `0`)

Response:
```
200 OK
{
  "provider": "twitch",
  "channel_id": "12345",
  "limit": 10,
  "offset": 0,
  "items": [
    { "user_id": "67890", "display_name": "HoboHustler", "points": 1234, "xp": 1234, "rank": 1 },
    { "user_id": "11111", "display_name": "RiverRat", "points": 1100, "xp": 1100, "rank": 2 }
  ]
}
```

### GET `/v1/leaderboard/global` (Not used in Desktop v0.1)
Returns top players across all streams/providers.

Query:
- `limit` (optional, default `10`, max `50`)
- `offset` (optional, default `0`)
- Optional filters: `provider`

Response:
```
200 OK
{
  "limit": 10,
  "offset": 0,
  "items": [
    { "provider": "twitch", "user_id": "67890", "display_name": "HoboHustler", "points": 5432, "xp": 5432, "rank": 1 }
  ]
}
```

### GET `/v1/player/rank`
Returns per-stream and global rank for a player. Desktop v0.1 uses stream rank only and ignores `global`.

Query:
- `provider` (required)
- `user_id` (required)
- `channel_id` (required)

Response:
```
200 OK
{
  "provider": "twitch",
  "user_id": "67890",
  "channel_id": "12345",
  "stream": { "points": 1234, "xp": 1234, "rank": 13 },
  "global": { "points": 5432, "xp": 5432, "rank": 999 }
}
```

### GET `/v1/health`
Basic health/status for monitoring.

Response:
```
200 OK
{ "status": "ok", "uptime_s": 12345 }
```

## Pagination
- Strategy: `limit` + `offset` for simplicity.
- Defaults: `limit=10`, `offset=0`; `limit` capped at `50`.
- Optional future: cursor-based pagination.

## Rate Limits
- Write: `60/min` per `(provider, channel_id)`.
- Read: `120/min` per IP; burst allowance.
- Error: `429 Too Many Requests` with optional `Retry-After` header.

## CORS & Access
- Read endpoints: public; CORS allow overlays website origins.
- Write endpoints: server-to-server only; no browser writes.

## Error Model
```
{
  "error": {
    "code": "invalid_arguments",
    "message": "rarity must be one of common, rare, epic, legendary"
  }
}
```
Codes:
- `unauthorized`, `forbidden`, `invalid_arguments`, `rate_limited`, `not_found`, `internal_error`.

## Examples (cURL)

Write single:
```
curl -X POST "https://api.example.com/v1/event/dig" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_test_channel_key" \
  -d '{
    "provider":"twitch",
    "channel_id":"12345",
    "user_id":"67890",
    "display_name":"HoboHustler",
    "points_delta":25,
    "xp_delta":25,
    "item_slug":"prototype-railgun-coil",
    "rarity":"epic",
    "ts":"2025-01-01T12:00:00Z"
  }'
```

Read channel leaderboard:
```
curl "https://api.example.com/v1/leaderboard/channel?provider=twitch&channel_id=12345&limit=10"
```

Read player rank (Desktop v0.1 uses stream rank only):
```
curl "https://api.example.com/v1/player/rank?provider=twitch&user_id=67890&channel_id=12345"
```

## Operational Notes
- Aggregation: upserts maintain `channel_players` and `global_players`; `dig_events` stored as append-only.
- Consistency: updates are eventually consistent within seconds; reads may trail writes slightly.
- Backups: daily backups; PITR if supported by the DB provider.
- Observability: logs for writes/reads; anomaly detection for point spikes.

## Change Management
- Versioning: additive changes to `/v1`; breaking changes introduce `/v2`.
- Deprecation: 90-day deprecation window with notices.
