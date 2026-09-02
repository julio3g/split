CREATE TYPE "public"."workspace_role" AS ENUM('owner', 'member');--> statement-breakpoint
CREATE TABLE "workspace_members" (
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "workspace_role" DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "workspace_members_workspace_id_user_id_pk" PRIMARY KEY("workspace_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"invite_code" text NOT NULL,
	"owner_id" text NOT NULL,
	"next_service_number" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "workspaces_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
ALTER TABLE "service_items" ALTER COLUMN "updated_at" SET DEFAULT current_timestamp;--> statement-breakpoint
ALTER TABLE "service_items" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "number" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "workspace_id" text;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "workspace_id" text;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "workspace_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "active_workspace_id" text;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "providers" ADD CONSTRAINT "providers_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_active_workspace_id_workspaces_id_fk" FOREIGN KEY ("active_workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
DO $$
DECLARE
  default_workspace_id text;
  first_user_id text;
  next_number integer;
BEGIN
  SELECT id INTO first_user_id FROM "users" ORDER BY "created_at" ASC LIMIT 1;

  IF first_user_id IS NOT NULL THEN
    default_workspace_id := 'wsp_' || substr(md5(random()::text || clock_timestamp()::text), 1, 12);

    SELECT COALESCE(MAX("number"), 0) + 1 INTO next_number FROM "services";

    INSERT INTO "workspaces" ("id", "name", "invite_code", "owner_id", "next_service_number")
    VALUES (
      default_workspace_id,
      'Workspace principal',
      substr(md5(random()::text || clock_timestamp()::text), 1, 16),
      first_user_id,
      next_number
    );

    INSERT INTO "workspace_members" ("workspace_id", "user_id", "role")
    SELECT default_workspace_id, "id", (CASE WHEN "id" = first_user_id THEN 'owner' ELSE 'member' END)::workspace_role
    FROM "users";

    UPDATE "customers" SET "workspace_id" = default_workspace_id WHERE "workspace_id" IS NULL;
    UPDATE "providers" SET "workspace_id" = default_workspace_id WHERE "workspace_id" IS NULL;
    UPDATE "services" SET "workspace_id" = default_workspace_id WHERE "workspace_id" IS NULL;
    UPDATE "users" SET "active_workspace_id" = default_workspace_id WHERE "active_workspace_id" IS NULL;
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "workspace_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "providers" ALTER COLUMN "workspace_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "workspace_id" SET NOT NULL;
