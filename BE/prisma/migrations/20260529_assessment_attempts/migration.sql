CREATE TABLE IF NOT EXISTS `AssessmentAttempt` (
  `id` VARCHAR(191) NOT NULL,
  `assessmentId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `status` ENUM('IN_PROGRESS', 'SUBMITTED') NOT NULL DEFAULT 'IN_PROGRESS',
  `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `completedAt` DATETIME(3),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `AssessmentAttempt_assessmentId_idx` (`assessmentId`),
  INDEX `AssessmentAttempt_userId_idx` (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AssessmentAttemptAnswer` (
  `id` VARCHAR(191) NOT NULL,
  `attemptId` VARCHAR(191) NOT NULL,
  `questionId` VARCHAR(191) NOT NULL,
  `selectedChoiceId` VARCHAR(191),
  `answerText` TEXT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `AssessmentAttemptAnswer_attempt_question_unique` (`attemptId`, `questionId`),
  INDEX `AssessmentAttemptAnswer_questionId_idx` (`questionId`),
  INDEX `AssessmentAttemptAnswer_selectedChoiceId_idx` (`selectedChoiceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `AssessmentAttempt` ADD CONSTRAINT `AssessmentAttempt_assessmentId_fkey`
  FOREIGN KEY (`assessmentId`) REFERENCES `Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `AssessmentAttempt` ADD CONSTRAINT `AssessmentAttempt_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `AssessmentAttemptAnswer` ADD CONSTRAINT `AssessmentAttemptAnswer_attemptId_fkey`
  FOREIGN KEY (`attemptId`) REFERENCES `AssessmentAttempt`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `AssessmentAttemptAnswer` ADD CONSTRAINT `AssessmentAttemptAnswer_questionId_fkey`
  FOREIGN KEY (`questionId`) REFERENCES `AssessmentQuestion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `AssessmentAttemptAnswer` ADD CONSTRAINT `AssessmentAttemptAnswer_selectedChoiceId_fkey`
  FOREIGN KEY (`selectedChoiceId`) REFERENCES `QuestionChoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `AssessmentResult` ADD COLUMN `attemptId` VARCHAR(191);
CREATE UNIQUE INDEX `AssessmentResult_attemptId_key` ON `AssessmentResult`(`attemptId`);
ALTER TABLE `AssessmentResult` ADD CONSTRAINT `AssessmentResult_attemptId_fkey`
  FOREIGN KEY (`attemptId`) REFERENCES `AssessmentAttempt`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
