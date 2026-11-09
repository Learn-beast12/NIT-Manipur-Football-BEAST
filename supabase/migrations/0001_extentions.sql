-- 0001_extensions.sql
-- Enable required PostgreSQL extensions.
-- pgcrypto: gen_random_uuid() for UUID primary keys.
-- (No pg_cron needed for v1 — standings are computed on read via the view.)

create extension if not exists pgcrypto;
