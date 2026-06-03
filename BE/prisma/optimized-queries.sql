-- Mentor search/filter. primarySpecialty and isAvailable are indexed in schema.prisma.
SELECT
  m.id,
  m.userId,
  m.headline,
  m.bio,
  m.primarySpecialty,
  m.specialties,
  m.yearsOfExperience,
  m.hourlyRate,
  m.location,
  m.isAvailable,
  m.createdAt,
  m.updatedAt,
  u.name,
  u.email,
  u.role
FROM Mentors AS m
JOIN User AS u ON u.id = m.userId
WHERE
  (? IS NULL OR m.isAvailable = ?)
  AND (
    ? IS NULL
    OR m.primarySpecialty = ?
    OR m.specialties LIKE CONCAT('%', ?, '%')
  )
  AND (
    ? IS NULL
    OR m.headline LIKE CONCAT('%', ?, '%')
    OR m.bio LIKE CONCAT('%', ?, '%')
    OR u.name LIKE CONCAT('%', ?, '%')
  )
ORDER BY m.isAvailable DESC, m.updatedAt DESC
LIMIT ? OFFSET ?;

-- Current user's chat rooms. userId lookup and message room/time lookup are indexed.
SELECT
  cr.id,
  cr.name,
  cr.type,
  cr.createdById,
  cr.createdAt,
  cr.updatedAt,
  lm.id AS lastMessageId,
  lm.content AS lastMessageContent,
  lm.type AS lastMessageType,
  lm.createdAt AS lastMessageAt
FROM Chat_Rooms AS cr
JOIN Chat_Room_Participants AS cp ON cp.roomId = cr.id
LEFT JOIN Messages AS lm
  ON lm.id = (
    SELECT m.id
    FROM Messages AS m
    WHERE m.roomId = cr.id
    ORDER BY m.createdAt DESC
    LIMIT 1
  )
WHERE cp.userId = ?
ORDER BY cr.updatedAt DESC
LIMIT ? OFFSET ?;

-- Room access check before reading/sending.
SELECT id
FROM Chat_Room_Participants
WHERE roomId = ? AND userId = ?
LIMIT 1;

-- Paginated message history. The application reverses the page for chronological display.
SELECT
  id,
  roomId,
  senderId,
  type,
  content,
  attachmentUrl,
  attachmentFileName,
  attachmentMimeType,
  attachmentSize,
  createdAt,
  updatedAt
FROM Messages
WHERE roomId = ?
ORDER BY createdAt DESC
LIMIT ? OFFSET ?;

-- Store a new message and bump room sort time in one transaction.
START TRANSACTION;

INSERT INTO Messages (
  id,
  roomId,
  senderId,
  type,
  content,
  attachmentUrl,
  attachmentFileName,
  attachmentMimeType,
  attachmentSize,
  createdAt,
  updatedAt
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3));

UPDATE Chat_Rooms
SET updatedAt = NOW(3)
WHERE id = ?;

COMMIT;
