-- DropForeignKey
ALTER TABLE `AssessmentAttempt` DROP FOREIGN KEY `AssessmentAttempt_assessmentId_fkey`;

-- DropForeignKey
ALTER TABLE `AssessmentAttempt` DROP FOREIGN KEY `AssessmentAttempt_userId_fkey`;

-- DropForeignKey
ALTER TABLE `AssessmentAttemptAnswer` DROP FOREIGN KEY `AssessmentAttemptAnswer_attemptId_fkey`;

-- DropForeignKey
ALTER TABLE `AssessmentAttemptAnswer` DROP FOREIGN KEY `AssessmentAttemptAnswer_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `AssessmentClassificationRule` DROP FOREIGN KEY `AssessmentClassificationRule_assessmentId_fkey`;

-- DropForeignKey
ALTER TABLE `AssessmentClassificationRule` DROP FOREIGN KEY `AssessmentClassificationRule_classificationId_fkey`;

-- DropForeignKey
ALTER TABLE `AssessmentQuestion` DROP FOREIGN KEY `AssessmentQuestion_assessmentId_fkey`;

-- DropForeignKey
ALTER TABLE `AssessmentResult` DROP FOREIGN KEY `AssessmentResult_assessmentId_fkey`;

-- DropForeignKey
ALTER TABLE `AssessmentResult` DROP FOREIGN KEY `AssessmentResult_userId_fkey`;

-- DropForeignKey
ALTER TABLE `AssessmentResultCategory` DROP FOREIGN KEY `AssessmentResultCategory_assessmentResultId_fkey`;

-- DropForeignKey
ALTER TABLE `AssessmentResultCategory` DROP FOREIGN KEY `AssessmentResultCategory_skillCategoryId_fkey`;

-- DropForeignKey
ALTER TABLE `CareerSkill` DROP FOREIGN KEY `CareerSkill_careerId_fkey`;

-- DropForeignKey
ALTER TABLE `CareerSkill` DROP FOREIGN KEY `CareerSkill_skillId_fkey`;

-- DropForeignKey
ALTER TABLE `Mentor` DROP FOREIGN KEY `Mentor_userId_fkey`;

-- DropForeignKey
ALTER TABLE `QuestionChoice` DROP FOREIGN KEY `QuestionChoice_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `QuestionKeyword` DROP FOREIGN KEY `QuestionKeyword_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `Roadmap` DROP FOREIGN KEY `Roadmap_careerId_fkey`;

-- DropForeignKey
ALTER TABLE `Roadmap` DROP FOREIGN KEY `Roadmap_userId_fkey`;

-- DropForeignKey
ALTER TABLE `RoadmapSkill` DROP FOREIGN KEY `RoadmapSkill_roadmapId_fkey`;

-- DropForeignKey
ALTER TABLE `RoadmapSkill` DROP FOREIGN KEY `RoadmapSkill_skillId_fkey`;

-- DropForeignKey
ALTER TABLE `UserAnswer` DROP FOREIGN KEY `UserAnswer_assessmentId_fkey`;

-- DropForeignKey
ALTER TABLE `UserAnswer` DROP FOREIGN KEY `UserAnswer_assessmentResultId_fkey`;

-- DropForeignKey
ALTER TABLE `UserAnswer` DROP FOREIGN KEY `UserAnswer_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `UserAnswer` DROP FOREIGN KEY `UserAnswer_userId_fkey`;

-- AlterTable
ALTER TABLE `AssessmentAttemptAnswer` MODIFY `answerText` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Roadmap` ADD CONSTRAINT `Roadmap_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Roadmap` ADD CONSTRAINT `Roadmap_careerId_fkey` FOREIGN KEY (`careerId`) REFERENCES `Career`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mentor` ADD CONSTRAINT `Mentor_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssessmentQuestion` ADD CONSTRAINT `AssessmentQuestion_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `Assessment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionChoice` ADD CONSTRAINT `QuestionChoice_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `AssessmentQuestion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionKeyword` ADD CONSTRAINT `QuestionKeyword_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `AssessmentQuestion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssessmentResult` ADD CONSTRAINT `AssessmentResult_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssessmentResult` ADD CONSTRAINT `AssessmentResult_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `Assessment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssessmentAttempt` ADD CONSTRAINT `AssessmentAttempt_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `Assessment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssessmentAttempt` ADD CONSTRAINT `AssessmentAttempt_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssessmentAttemptAnswer` ADD CONSTRAINT `AssessmentAttemptAnswer_attemptId_fkey` FOREIGN KEY (`attemptId`) REFERENCES `AssessmentAttempt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssessmentAttemptAnswer` ADD CONSTRAINT `AssessmentAttemptAnswer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `AssessmentQuestion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssessmentResultCategory` ADD CONSTRAINT `AssessmentResultCategory_assessmentResultId_fkey` FOREIGN KEY (`assessmentResultId`) REFERENCES `AssessmentResult`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssessmentResultCategory` ADD CONSTRAINT `AssessmentResultCategory_skillCategoryId_fkey` FOREIGN KEY (`skillCategoryId`) REFERENCES `SkillCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAnswer` ADD CONSTRAINT `UserAnswer_assessmentResultId_fkey` FOREIGN KEY (`assessmentResultId`) REFERENCES `AssessmentResult`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAnswer` ADD CONSTRAINT `UserAnswer_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `Assessment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAnswer` ADD CONSTRAINT `UserAnswer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `AssessmentQuestion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAnswer` ADD CONSTRAINT `UserAnswer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssessmentClassificationRule` ADD CONSTRAINT `AssessmentClassificationRule_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `Assessment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssessmentClassificationRule` ADD CONSTRAINT `AssessmentClassificationRule_classificationId_fkey` FOREIGN KEY (`classificationId`) REFERENCES `Classification`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CareerSkill` ADD CONSTRAINT `CareerSkill_careerId_fkey` FOREIGN KEY (`careerId`) REFERENCES `Career`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CareerSkill` ADD CONSTRAINT `CareerSkill_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `Skill`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoadmapSkill` ADD CONSTRAINT `RoadmapSkill_roadmapId_fkey` FOREIGN KEY (`roadmapId`) REFERENCES `Roadmap`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoadmapSkill` ADD CONSTRAINT `RoadmapSkill_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `Skill`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `AssessmentAttemptAnswer` RENAME INDEX `AssessmentAttemptAnswer_attempt_question_unique` TO `AssessmentAttemptAnswer_attemptId_questionId_key`;

-- RenameIndex
ALTER TABLE `AssessmentResultCategory` RENAME INDEX `AssessmentResultCategory_unique` TO `AssessmentResultCategory_assessmentResultId_skillCategoryId_key`;

-- RenameIndex
ALTER TABLE `UserAnswer` RENAME INDEX `UserAnswer_result_question_unique` TO `UserAnswer_assessmentResultId_questionId_key`;
