CREATE TYPE "public"."order_status" AS ENUM('new', 'paid', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."pay_method" AS ENUM('qr', 'bank', 'card');--> statement-breakpoint
CREATE TABLE "orders" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "orders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1001 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"city" text NOT NULL,
	"district" text NOT NULL,
	"address" text NOT NULL,
	"quantity" integer NOT NULL,
	"pay_method" "pay_method" NOT NULL,
	"unit_price" integer NOT NULL,
	"delivery" integer NOT NULL,
	"total" integer NOT NULL,
	"status" "order_status" DEFAULT 'new' NOT NULL,
	"note" text
);
