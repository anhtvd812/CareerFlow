CREATE TABLE IF NOT EXISTS `User` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `passwordHash` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `role` ENUM('STUDENT', 'MENTOR', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `User_email_key`(`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Career` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `outlook` TEXT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Skill` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Roadmap` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `summary` TEXT,
  `userId` VARCHAR(191) NOT NULL,
  `careerId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `Roadmap_userId_idx`(`userId`),
  INDEX `Roadmap_careerId_idx`(`careerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Mentor` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `headline` TEXT,
  `bio` TEXT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Mentor_userId_key`(`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `CareerSkill` (
  `id` VARCHAR(191) NOT NULL,
  `careerId` VARCHAR(191) NOT NULL,
  `skillId` VARCHAR(191) NOT NULL,
  `level` INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `CareerSkill_careerId_skillId_key`(`careerId`, `skillId`),
  INDEX `CareerSkill_skillId_idx`(`skillId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `RoadmapSkill` (
  `id` VARCHAR(191) NOT NULL,
  `roadmapId` VARCHAR(191) NOT NULL,
  `skillId` VARCHAR(191) NOT NULL,
  `targetLevel` INTEGER NOT NULL DEFAULT 1,
  `progress` INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `RoadmapSkill_roadmapId_skillId_key`(`roadmapId`, `skillId`),
  INDEX `RoadmapSkill_skillId_idx`(`skillId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Assessment` (
  `id` VARCHAR(191) NOT NULL,
  `title` TEXT NOT NULL,
  `description` TEXT,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `SkillCategory` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `SkillCategory_name_key`(`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AssessmentQuestion` (
  `id` VARCHAR(191) NOT NULL,
  `assessmentId` VARCHAR(191) NOT NULL,
  `prompt` TEXT NOT NULL,
  `type` ENUM('MULTIPLE_CHOICE', 'TEXT') NOT NULL,
  `weight` DOUBLE NOT NULL DEFAULT 1,
  `skillCategoryId` VARCHAR(191),
  `textAnswer` TEXT,
  `textMatchMode` ENUM('EXACT', 'KEYWORD') DEFAULT 'KEYWORD',
  `minKeywordScore` INTEGER DEFAULT 1,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `AssessmentQuestion_assessmentId_idx`(`assessmentId`),
  INDEX `AssessmentQuestion_skillCategoryId_idx`(`skillCategoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `QuestionChoice` (
  `id` VARCHAR(191) NOT NULL,
  `questionId` VARCHAR(191) NOT NULL,
  `label` TEXT NOT NULL,
  `value` TEXT NOT NULL,
  `isCorrect` BOOLEAN NOT NULL DEFAULT false,
  `scoreWeight` DOUBLE NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  INDEX `QuestionChoice_questionId_idx`(`questionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `QuestionKeyword` (
  `id` VARCHAR(191) NOT NULL,
  `questionId` VARCHAR(191) NOT NULL,
  `keyword` TEXT NOT NULL,
  `weight` DOUBLE NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  INDEX `QuestionKeyword_questionId_idx`(`questionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Classification` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT,
  `isDefault` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Classification_name_key`(`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AssessmentClassificationRule` (
  `id` VARCHAR(191) NOT NULL,
  `assessmentId` VARCHAR(191) NOT NULL,
  `classificationId` VARCHAR(191) NOT NULL,
  `priority` INTEGER NOT NULL DEFAULT 0,
  `minPercentage` DOUBLE,
  `maxPercentage` DOUBLE,
  `minCorrect` INTEGER,
  `maxIncorrect` INTEGER,
  `minCategoryPercentages` JSON,
  `maxCategoryPercentages` JSON,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `AssessmentClassificationRule_assessmentId_idx`(`assessmentId`),
  INDEX `AssessmentClassificationRule_classificationId_idx`(`classificationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `AssessmentResult`;

CREATE TABLE `AssessmentResult` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `assessmentId` VARCHAR(191) NOT NULL,
  `careerId` VARCHAR(191),
  `classificationId` VARCHAR(191),
  `totalScore` DOUBLE NOT NULL,
  `maxScore` DOUBLE NOT NULL,
  `percentage` DOUBLE NOT NULL,
  `correctCount` INTEGER NOT NULL,
  `incorrectCount` INTEGER NOT NULL,
  `summary` TEXT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `AssessmentResult_userId_idx`(`userId`),
  INDEX `AssessmentResult_assessmentId_idx`(`assessmentId`),
  INDEX `AssessmentResult_careerId_idx`(`careerId`),
  INDEX `AssessmentResult_classificationId_idx`(`classificationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AssessmentResultCategory` (
  `id` VARCHAR(191) NOT NULL,
  `assessmentResultId` VARCHAR(191) NOT NULL,
  `skillCategoryId` VARCHAR(191) NOT NULL,
  `score` DOUBLE NOT NULL,
  `maxScore` DOUBLE NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `AssessmentResultCategory_unique`(`assessmentResultId`, `skillCategoryId`),
  INDEX `AssessmentResultCategory_skillCategoryId_idx`(`skillCategoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `UserAnswer` (
  `id` VARCHAR(191) NOT NULL,
  `assessmentResultId` VARCHAR(191) NOT NULL,
  `assessmentId` VARCHAR(191) NOT NULL,
  `questionId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `selectedChoiceId` VARCHAR(191),
  `answerText` TEXT,
  `isCorrect` BOOLEAN NOT NULL,
  `score` DOUBLE NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `UserAnswer_result_question_unique`(`assessmentResultId`, `questionId`),
  INDEX `UserAnswer_assessmentId_idx`(`assessmentId`),
  INDEX `UserAnswer_questionId_idx`(`questionId`),
  INDEX `UserAnswer_userId_idx`(`userId`),
  INDEX `UserAnswer_selectedChoiceId_idx`(`selectedChoiceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Roadmap` ADD CONSTRAINT `Roadmap_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Roadmap` ADD CONSTRAINT `Roadmap_careerId_fkey` FOREIGN KEY (`careerId`) REFERENCES `Career`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Mentor` ADD CONSTRAINT `Mentor_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `CareerSkill` ADD CONSTRAINT `CareerSkill_careerId_fkey` FOREIGN KEY (`careerId`) REFERENCES `Career`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `CareerSkill` ADD CONSTRAINT `CareerSkill_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `Skill`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `RoadmapSkill` ADD CONSTRAINT `RoadmapSkill_roadmapId_fkey` FOREIGN KEY (`roadmapId`) REFERENCES `Roadmap`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `RoadmapSkill` ADD CONSTRAINT `RoadmapSkill_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `Skill`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `AssessmentQuestion` ADD CONSTRAINT `AssessmentQuestion_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `AssessmentQuestion` ADD CONSTRAINT `AssessmentQuestion_skillCategoryId_fkey` FOREIGN KEY (`skillCategoryId`) REFERENCES `SkillCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `QuestionChoice` ADD CONSTRAINT `QuestionChoice_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `AssessmentQuestion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `QuestionKeyword` ADD CONSTRAINT `QuestionKeyword_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `AssessmentQuestion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `AssessmentClassificationRule` ADD CONSTRAINT `AssessmentClassificationRule_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `AssessmentClassificationRule` ADD CONSTRAINT `AssessmentClassificationRule_classificationId_fkey` FOREIGN KEY (`classificationId`) REFERENCES `Classification`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `AssessmentResult` ADD CONSTRAINT `AssessmentResult_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `AssessmentResult` ADD CONSTRAINT `AssessmentResult_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `AssessmentResult` ADD CONSTRAINT `AssessmentResult_careerId_fkey` FOREIGN KEY (`careerId`) REFERENCES `Career`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `AssessmentResult` ADD CONSTRAINT `AssessmentResult_classificationId_fkey` FOREIGN KEY (`classificationId`) REFERENCES `Classification`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `AssessmentResultCategory` ADD CONSTRAINT `AssessmentResultCategory_assessmentResultId_fkey` FOREIGN KEY (`assessmentResultId`) REFERENCES `AssessmentResult`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `AssessmentResultCategory` ADD CONSTRAINT `AssessmentResultCategory_skillCategoryId_fkey` FOREIGN KEY (`skillCategoryId`) REFERENCES `SkillCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `UserAnswer` ADD CONSTRAINT `UserAnswer_assessmentResultId_fkey` FOREIGN KEY (`assessmentResultId`) REFERENCES `AssessmentResult`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `UserAnswer` ADD CONSTRAINT `UserAnswer_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `UserAnswer` ADD CONSTRAINT `UserAnswer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `AssessmentQuestion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `UserAnswer` ADD CONSTRAINT `UserAnswer_selectedChoiceId_fkey` FOREIGN KEY (`selectedChoiceId`) REFERENCES `QuestionChoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `UserAnswer` ADD CONSTRAINT `UserAnswer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
