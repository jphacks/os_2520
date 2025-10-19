-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN "requestId" TEXT;

-- CreateTable
CREATE TABLE "QuizRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isHandled" BOOLEAN NOT NULL DEFAULT false,
    "handledQuizId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuizRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "QuizRequest_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "QuizRequest_handledQuizId_fkey" FOREIGN KEY ("handledQuizId") REFERENCES "Quiz" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lineId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "displayName", "id", "lineId", "role", "updatedAt") SELECT "createdAt", "displayName", "id", "lineId", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_lineId_key" ON "User"("lineId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
