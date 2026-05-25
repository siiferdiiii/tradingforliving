-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TradingSession" AS ENUM ('ASIA', 'LONDON', 'NEW_YORK', 'LONDON_CLOSE');

-- CreateEnum
CREATE TYPE "TradeResult" AS ENUM ('WIN', 'LOSS', 'BREAKEVEN', 'PARTIAL');

-- CreateEnum
CREATE TYPE "TradeMood" AS ENUM ('DISCIPLINED', 'RUSHED', 'HESITANT');

-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('BEFORE', 'AFTER');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "username" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "display_name" VARCHAR(50),
    "bio" VARCHAR(300),
    "avatar_url" TEXT,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "methods" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "method_timeframes" (
    "id" UUID NOT NULL,
    "method_id" UUID NOT NULL,
    "timeframe" VARCHAR(10) NOT NULL,

    CONSTRAINT "method_timeframes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategies" (
    "id" UUID NOT NULL,
    "method_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "trigger_entry" TEXT NOT NULL,
    "sl_rule" VARCHAR(500) NOT NULL,
    "tp_rule" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strategies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategy_concepts" (
    "id" UUID NOT NULL,
    "strategy_id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "strategy_concepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategy_sessions" (
    "id" UUID NOT NULL,
    "strategy_id" UUID NOT NULL,
    "session_name" "TradingSession" NOT NULL,

    CONSTRAINT "strategy_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backtest_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "method_id" UUID NOT NULL,
    "strategy_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "instrument" VARCHAR(20) NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backtest_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trades" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "trade_date" DATE NOT NULL,
    "session" "TradingSession" NOT NULL,
    "entry_price" DECIMAL(20,5) NOT NULL,
    "sl_price" DECIMAL(20,5) NOT NULL,
    "tp_price" DECIMAL(20,5) NOT NULL,
    "result" "TradeResult" NOT NULL,
    "timeframe_trigger" VARCHAR(10) NOT NULL,
    "notes" VARCHAR(1000),
    "mood" "TradeMood",
    "risk_pips" DECIMAL(20,5) NOT NULL,
    "reward_pips" DECIMAL(20,5) NOT NULL,
    "rr_target" DECIMAL(10,2) NOT NULL,
    "actual_r" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_closes" (
    "id" UUID NOT NULL,
    "trade_id" UUID NOT NULL,
    "close_price" DECIMAL(20,5) NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "notes" VARCHAR(500),

    CONSTRAINT "trade_closes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_images" (
    "id" UUID NOT NULL,
    "trade_id" UUID NOT NULL,
    "image_type" "ImageType" NOT NULL,
    "storage_url" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trade_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_concepts" (
    "id" UUID NOT NULL,
    "trade_id" UUID NOT NULL,
    "strategy_concept_id" UUID NOT NULL,
    "is_present" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "trade_concepts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE INDEX "methods_user_id_idx" ON "methods"("user_id");

-- CreateIndex
CREATE INDEX "methods_is_public_idx" ON "methods"("is_public");

-- CreateIndex
CREATE UNIQUE INDEX "method_timeframes_method_id_timeframe_key" ON "method_timeframes"("method_id", "timeframe");

-- CreateIndex
CREATE INDEX "strategies_method_id_idx" ON "strategies"("method_id");

-- CreateIndex
CREATE UNIQUE INDEX "strategy_concepts_strategy_id_name_key" ON "strategy_concepts"("strategy_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "strategy_sessions_strategy_id_session_name_key" ON "strategy_sessions"("strategy_id", "session_name");

-- CreateIndex
CREATE INDEX "backtest_sessions_user_id_idx" ON "backtest_sessions"("user_id");

-- CreateIndex
CREATE INDEX "backtest_sessions_method_id_idx" ON "backtest_sessions"("method_id");

-- CreateIndex
CREATE INDEX "backtest_sessions_strategy_id_idx" ON "backtest_sessions"("strategy_id");

-- CreateIndex
CREATE INDEX "trades_session_id_idx" ON "trades"("session_id");

-- CreateIndex
CREATE INDEX "trades_trade_date_idx" ON "trades"("trade_date");

-- CreateIndex
CREATE INDEX "trade_closes_trade_id_idx" ON "trade_closes"("trade_id");

-- CreateIndex
CREATE INDEX "trade_images_trade_id_idx" ON "trade_images"("trade_id");

-- CreateIndex
CREATE UNIQUE INDEX "trade_images_trade_id_image_type_key" ON "trade_images"("trade_id", "image_type");

-- CreateIndex
CREATE INDEX "trade_concepts_trade_id_idx" ON "trade_concepts"("trade_id");

-- CreateIndex
CREATE INDEX "trade_concepts_strategy_concept_id_idx" ON "trade_concepts"("strategy_concept_id");

-- CreateIndex
CREATE UNIQUE INDEX "trade_concepts_trade_id_strategy_concept_id_key" ON "trade_concepts"("trade_id", "strategy_concept_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "methods" ADD CONSTRAINT "methods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "method_timeframes" ADD CONSTRAINT "method_timeframes_method_id_fkey" FOREIGN KEY ("method_id") REFERENCES "methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_method_id_fkey" FOREIGN KEY ("method_id") REFERENCES "methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategy_concepts" ADD CONSTRAINT "strategy_concepts_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "strategies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategy_sessions" ADD CONSTRAINT "strategy_sessions_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "strategies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backtest_sessions" ADD CONSTRAINT "backtest_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backtest_sessions" ADD CONSTRAINT "backtest_sessions_method_id_fkey" FOREIGN KEY ("method_id") REFERENCES "methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backtest_sessions" ADD CONSTRAINT "backtest_sessions_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "strategies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "backtest_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_closes" ADD CONSTRAINT "trade_closes_trade_id_fkey" FOREIGN KEY ("trade_id") REFERENCES "trades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_images" ADD CONSTRAINT "trade_images_trade_id_fkey" FOREIGN KEY ("trade_id") REFERENCES "trades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_concepts" ADD CONSTRAINT "trade_concepts_trade_id_fkey" FOREIGN KEY ("trade_id") REFERENCES "trades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_concepts" ADD CONSTRAINT "trade_concepts_strategy_concept_id_fkey" FOREIGN KEY ("strategy_concept_id") REFERENCES "strategy_concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

