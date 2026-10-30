DROP INDEX IF EXISTS uq_active_auction_inventory_item;

ALTER TABLE auction_listings
DROP CONSTRAINT IF EXISTS fk_auction_inventory_item;

ALTER TABLE auction_listings
DROP COLUMN IF EXISTS inventory_item_id;
