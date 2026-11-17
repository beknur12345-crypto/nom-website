CREATE TABLE "inventory" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"stock" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_single_row" CHECK ("inventory"."id" = 1),
	CONSTRAINT "inventory_stock_nonnegative" CHECK ("inventory"."stock" >= 0)
);
--> statement-breakpoint
INSERT INTO "inventory" ("id", "stock") VALUES (1, 100) ON CONFLICT DO NOTHING;
