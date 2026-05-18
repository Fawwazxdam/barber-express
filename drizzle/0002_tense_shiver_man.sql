ALTER TYPE "public"."role" ADD VALUE 'OWNER' BEFORE 'BARBER';--> statement-breakpoint
ALTER TABLE "refresh_tokens" ALTER COLUMN "token" SET DATA TYPE varchar(512);