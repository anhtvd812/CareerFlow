CREATE TABLE IF NOT EXISTS `UserProfile` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `headline` TEXT,
  `bio` TEXT,
  `careerGoal` TEXT,
  `careerGoalId` VARCHAR(191),
  `progressPercent` DOUBLE NOT NULL DEFAULT 0,
  `lastAssessmentResultId` VARCHAR(191),
  `lastAssessmentTakenAt` DATETIME(3),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `UserProfile_userId_key` (`userId`),
  INDEX `UserProfile_careerGoalId_idx` (`careerGoalId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `UserSkill` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `skillId` VARCHAR(191) NOT NULL,
  `level` INTEGER NOT NULL DEFAULT 1,
  `source` ENUM('MANUAL', 'ASSESSMENT', 'ROADMAP', 'CERTIFICATION') NOT NULL DEFAULT 'MANUAL',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `UserSkill_userId_skillId_key` (`userId`, `skillId`),
  INDEX `UserSkill_skillId_idx` (`skillId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `UserCertification` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `name` TEXT NOT NULL,
  `issuer` TEXT,
  `issuedAt` DATETIME(3),
  `expiresAt` DATETIME(3),
  `credentialUrl` TEXT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `UserCertification_userId_idx` (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `UserProfile` ADD CONSTRAINT `UserProfile_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `UserProfile` ADD CONSTRAINT `UserProfile_careerGoalId_fkey`
  FOREIGN KEY (`careerGoalId`) REFERENCES `Career`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `UserProfile` ADD CONSTRAINT `UserProfile_lastAssessmentResultId_fkey`
  FOREIGN KEY (`lastAssessmentResultId`) REFERENCES `AssessmentResult`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `UserSkill` ADD CONSTRAINT `UserSkill_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `UserSkill` ADD CONSTRAINT `UserSkill_skillId_fkey`
  FOREIGN KEY (`skillId`) REFERENCES `Skill`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `UserCertification` ADD CONSTRAINT `UserCertification_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
