alter table users add column "graduationYear" integer default null ;
ALTER TABLE addresses ALTER COLUMN "label" DROP NOT NULL;
ALTER TABLE addresses ADD COLUMN "whatsapp_number" VARCHAR(255);