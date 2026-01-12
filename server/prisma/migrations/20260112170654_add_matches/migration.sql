-- CreateTable
CREATE TABLE "Match" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matchId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "matchDate" DATETIME NOT NULL,
    "homeTeamId" INTEGER NOT NULL,
    "homeTeamName" TEXT NOT NULL,
    "homeTeamShortName" TEXT,
    "awayTeamId" INTEGER NOT NULL,
    "awayTeamName" TEXT NOT NULL,
    "awayTeamShortName" TEXT,
    "homeGoals" INTEGER NOT NULL DEFAULT 0,
    "awayGoals" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "matchType" TEXT NOT NULL,
    "matchContextId" INTEGER NOT NULL DEFAULT 0,
    "cupLevel" INTEGER,
    "cupLevelIndex" INTEGER,
    "sourceSystem" TEXT,
    "ordersGiven" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Match_matchId_key" ON "Match"("matchId");

-- CreateIndex
CREATE INDEX "Match_teamId_matchDate_idx" ON "Match"("teamId", "matchDate");

-- CreateIndex
CREATE INDEX "Match_matchId_idx" ON "Match"("matchId");

-- CreateIndex
CREATE INDEX "Match_matchDate_idx" ON "Match"("matchDate");
