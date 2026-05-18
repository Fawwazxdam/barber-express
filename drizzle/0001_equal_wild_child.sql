ALTER TABLE "tenants" ADD COLUMN "open_time" varchar(5) DEFAULT '09:00';--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "close_time" varchar(5) DEFAULT '21:00';