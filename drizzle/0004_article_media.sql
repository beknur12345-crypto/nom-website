ALTER TABLE "articles" ADD COLUMN "images" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "files" jsonb DEFAULT '[]'::jsonb NOT NULL;