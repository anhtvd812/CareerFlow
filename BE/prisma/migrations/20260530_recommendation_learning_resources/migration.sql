CREATE TABLE IF NOT EXISTS `Course` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT,
  `difficulty` VARCHAR(191) NOT NULL,
  `estimatedHours` INTEGER,
  `url` VARCHAR(191),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `CourseSkill` (
  `id` VARCHAR(191) NOT NULL,
  `courseId` VARCHAR(191) NOT NULL,
  `skillId` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `CourseSkill_courseId_skillId_key`(`courseId`, `skillId`),
  INDEX `CourseSkill_skillId_idx`(`skillId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `SampleProject` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT,
  `difficulty` VARCHAR(191) NOT NULL,
  `estimatedHours` INTEGER,
  `instructions` TEXT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `SampleProjectSkill` (
  `id` VARCHAR(191) NOT NULL,
  `sampleProjectId` VARCHAR(191) NOT NULL,
  `skillId` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `SampleProjectSkill_sampleProjectId_skillId_key`(`sampleProjectId`, `skillId`),
  INDEX `SampleProjectSkill_skillId_idx`(`skillId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `CourseSkill` ADD CONSTRAINT `CourseSkill_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `CourseSkill` ADD CONSTRAINT `CourseSkill_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `Skill`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `SampleProjectSkill` ADD CONSTRAINT `SampleProjectSkill_sampleProjectId_fkey` FOREIGN KEY (`sampleProjectId`) REFERENCES `SampleProject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `SampleProjectSkill` ADD CONSTRAINT `SampleProjectSkill_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `Skill`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
