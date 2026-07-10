CREATE TABLE IF NOT EXISTS "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT,
    "password_hash" TEXT,
    "wechat_openid" TEXT NOT NULL,
    "union_id" TEXT,
    "phone" TEXT,
    "nickname" TEXT,
    "avatar_url" TEXT,
    "source" TEXT DEFAULT 'direct',
    "inviteBy" INTEGER,
    "is_test_user" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 0,
    "last_login_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME,
    CONSTRAINT "users_inviteBy_fkey" FOREIGN KEY ("inviteBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "birth_infos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "birth_date" DATETIME NOT NULL,
    "birth_hour" INTEGER,
    "birth_minute" INTEGER,
    "birth_place" TEXT,
    "longitude" REAL,
    "latitude" REAL,
    "is_solar_calendar" BOOLEAN NOT NULL DEFAULT true,
    "timezone" INTEGER NOT NULL DEFAULT 8,
    "is_approx_time" BOOLEAN NOT NULL DEFAULT false,
    "approx_time_range" TEXT,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME,
    CONSTRAINT "birth_infos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "personality_reports" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "birth_info_id" INTEGER NOT NULL,
    "report_type" TEXT NOT NULL DEFAULT 'FREE',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "version" INTEGER NOT NULL DEFAULT 0,
    "bazi_json" TEXT NOT NULL,
    "five_elements_json" TEXT,
    "shishen_json" TEXT,
    "dayun_json" TEXT,
    "personality_tags" TEXT,
    "summary_json" TEXT,
    "full_report_json" TEXT,
    "ai_model" TEXT,
    "prompt_version" TEXT,
    "cache_key" TEXT,
    "error_message" TEXT,
    "generated_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME,
    CONSTRAINT "personality_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "personality_reports_birth_info_id_fkey" FOREIGN KEY ("birth_info_id") REFERENCES "birth_infos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "orders" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderNo" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "report_id" INTEGER,
    "product_type" TEXT NOT NULL,
    "productName" TEXT,
    "amount" INTEGER NOT NULL,
    "coupon_deduction" INTEGER NOT NULL DEFAULT 0,
    "final_amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "idempotency_key" TEXT,
    "prepayId" TEXT,
    "transaction_id" TEXT,
    "paid_at" DATETIME,
    "expired_at" DATETIME,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "personality_reports" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "subscriptions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "plan_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "auto_renew" BOOLEAN NOT NULL DEFAULT true,
    "wx_agreement_id" TEXT,
    "current_period_start" DATETIME,
    "current_period_end" DATETIME,
    "last_order_id" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "canceled_at" DATETIME,
    "deleted_at" DATETIME,
    CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "subscriptions_last_order_id_fkey" FOREIGN KEY ("last_order_id") REFERENCES "orders" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "comparisons" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "target_user_id" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "match_score" INTEGER,
    "dimensions_json" TEXT,
    "advice_json" TEXT,
    "user_bazi_json" TEXT,
    "target_bazi_json" TEXT,
    "user_tags" TEXT,
    "target_tags" TEXT,
    "share_image_url" TEXT,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "comparisons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "comparisons_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "sharing_records" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "shareType" TEXT NOT NULL,
    "invited_user_id" INTEGER,
    "platform" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sharing_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sharing_records_invited_user_id_fkey" FOREIGN KEY ("invited_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX IF NOT EXISTS "users_wechat_openid_key" ON "users"("wechat_openid");
CREATE INDEX IF NOT EXISTS "users_wechat_openid_idx" ON "users"("wechat_openid");
CREATE INDEX IF NOT EXISTS "users_inviteBy_idx" ON "users"("inviteBy");
CREATE INDEX IF NOT EXISTS "birth_infos_user_id_idx" ON "birth_infos"("user_id");
CREATE INDEX IF NOT EXISTS "birth_infos_user_id_is_current_idx" ON "birth_infos"("user_id", "is_current");
CREATE INDEX IF NOT EXISTS "personality_reports_user_id_idx" ON "personality_reports"("user_id");
CREATE INDEX IF NOT EXISTS "personality_reports_report_type_status_idx" ON "personality_reports"("report_type", "status");
CREATE INDEX IF NOT EXISTS "personality_reports_personality_tags_idx" ON "personality_reports"("personality_tags");
CREATE UNIQUE INDEX IF NOT EXISTS "orders_orderNo_key" ON "orders"("orderNo");
CREATE UNIQUE INDEX IF NOT EXISTS "orders_transaction_id_key" ON "orders"("transaction_id");
CREATE INDEX IF NOT EXISTS "orders_user_id_idx" ON "orders"("user_id");
CREATE INDEX IF NOT EXISTS "orders_orderNo_idx" ON "orders"("orderNo");
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders"("status");
CREATE INDEX IF NOT EXISTS "orders_idempotency_key_idx" ON "orders"("idempotency_key");
CREATE INDEX IF NOT EXISTS "subscriptions_user_id_idx" ON "subscriptions"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_user_id_plan_type_status_key" ON "subscriptions"("user_id", "plan_type", "status");
CREATE INDEX IF NOT EXISTS "comparisons_user_id_idx" ON "comparisons"("user_id");
CREATE INDEX IF NOT EXISTS "sharing_records_user_id_idx" ON "sharing_records"("user_id");
