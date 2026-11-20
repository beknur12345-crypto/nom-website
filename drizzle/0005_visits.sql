CREATE TABLE "visits" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "visits_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"path" text NOT NULL,
	"source" text NOT NULL,
	"country" text,
	"device" text NOT NULL,
	"visitor" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "visits_at_idx" ON "visits" USING btree ("at");