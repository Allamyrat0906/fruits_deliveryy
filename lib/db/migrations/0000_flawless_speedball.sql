CREATE TYPE "public"."role" AS ENUM('CUSTOMER', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."category" AS ENUM('МЕСТНЫЕ', 'ТРОПИЧЕСКИЕ', 'ОРГАНИЧЕСКИЕ', 'ИМПОРТНЫЕ');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('ОЖИДАНИЕ', 'ПОДТВЕРЖДЁН', 'ОТПРАВЛЕН', 'ДОСТАВЛЕН', 'ОТМЕНЁН');--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"role" "role" DEFAULT 'CUSTOMER' NOT NULL,
	"avatar" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "fruits" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"price" double precision NOT NULL,
	"discount_price" double precision,
	"stock" integer DEFAULT 0 NOT NULL,
	"category" "category" NOT NULL,
	"organic" boolean DEFAULT false NOT NULL,
	"image_url" text,
	"images" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "fruits_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"fruit_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"weight" text NOT NULL,
	"unit_price" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"status" "order_status" DEFAULT 'ОЖИДАНИЕ' NOT NULL,
	"total_price" double precision NOT NULL,
	"address" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"paid_amount" double precision,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_fruit_id_fruits_id_fk" FOREIGN KEY ("fruit_id") REFERENCES "public"."fruits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;