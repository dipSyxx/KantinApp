-- Replace the placeholder 'default_hamar' id with a proper cuid-style id
-- The FK constraints have ON UPDATE CASCADE, so updating schools.id
-- will automatically cascade to users, week_menus, dishes, verification_tokens

DO $$
DECLARE
  new_id TEXT;
BEGIN
  new_id := 'cm' || substr(md5(gen_random_uuid()::text), 1, 23);

  -- Just update the school — CASCADE will propagate to all referencing tables
  UPDATE "schools" SET "id" = new_id WHERE "id" = 'default_hamar';
END $$;
