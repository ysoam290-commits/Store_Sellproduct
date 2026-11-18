-- Run against the Products PostgreSQL database to widen existing columns.
ALTER TABLE product
    ALTER COLUMN description TYPE TEXT;

ALTER TABLE product
    ALTER COLUMN image TYPE TEXT;
