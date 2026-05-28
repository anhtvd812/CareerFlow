# API Xử Lý Kết Quả Đánh Giá

Base URL: `/api`

Tất cả endpoint trả về JSON. Ngày giờ là chuỗi ISO-8601. Phần trăm từ 0-100.

## Xác thực

Endpoint thay đổi dữ liệu hoặc xem lịch sử người dùng yêu cầu Bearer token. Khi làm prototype, có thể gửi `userId` trong payload submit, nhưng production nên dùng JWT.

---

## Dữ liệu seed để test nhanh

- `assessmentId`: `asmt_core_it`
- `userId`: `user_demo`
- `questionId`: `q1`, `q2`, `q3`, `q4`
- `choiceId`: `c1..c6` (đáp án đúng: `c2` cho `q1`, `c5` cho `q2`)

---

## GET /api/assessments

Danh sách bài đánh giá khả dụng.

### Curl nhanh

```bash
curl http://localhost:3000/api/assessments \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Response 200

```json
{
  "assessments": [
    {
      "id": "asmt_core_it",
      "title": "Core IT Foundations",
      "description": "Baseline assessment covering problem solving, theory, and practical skills.",
      "questionCount": 4
    }
  ]
}
```

---

## GET /api/assessments/:id/questions

Lấy danh sách câu hỏi (không trả đáp án đúng).

### Curl nhanh

```bash
curl http://localhost:3000/api/assessments/asmt_core_it/questions \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Response 200

```json
{
  "id": "asmt_core_it",
  "title": "Core IT Foundations",
  "description": "Baseline assessment covering problem solving, theory, and practical skills.",
  "questions": [
    {
      "id": "q1",
      "prompt": "Which data structure follows LIFO ordering?",
      "type": "MULTIPLE_CHOICE",
      "weight": 3,
      "skillCategory": {
        "id": "cat_problem_solving",
        "name": "Problem Solving"
      },
      "choices": [
        { "id": "c1", "label": "Queue", "value": "queue" },
        { "id": "c2", "label": "Stack", "value": "stack" }
      ]
    }
  ]
}
```

---

## POST /api/assessments/:id/attempts

Tạo attempt/session làm bài cho user.

### Curl nhanh

```bash
curl -X POST http://localhost:3000/api/assessments/asmt_core_it/attempts \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Response 201

```json
{
  "attempt": {
    "id": "attempt_123",
    "assessmentId": "asmt_core_it",
    "userId": "user_demo",
    "status": "IN_PROGRESS",
    "startedAt": "2026-05-28T10:00:00.000Z",
    "completedAt": null,
    "createdAt": "2026-05-28T10:00:00.000Z",
    "updatedAt": "2026-05-28T10:00:00.000Z"
  },
  "assessment": {
    "id": "asmt_core_it",
    "title": "Core IT Foundations"
  }
}
```

---

## POST /api/tests/:testId/start

Alias tạo attempt cho bài test.

### Curl nhanh

```bash
curl -X POST http://localhost:3000/api/tests/asmt_core_it/start \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Response 201

```json
{
  "attempt": {
    "id": "attempt_123",
    "assessmentId": "asmt_core_it",
    "userId": "user_demo",
    "status": "IN_PROGRESS",
    "startedAt": "2026-05-28T10:00:00.000Z",
    "completedAt": null,
    "createdAt": "2026-05-28T10:00:00.000Z",
    "updatedAt": "2026-05-28T10:00:00.000Z"
  },
  "assessment": {
    "id": "asmt_core_it",
    "title": "Core IT Foundations"
  }
}
```

---

## PATCH /api/assessments/attempts/:id

Lưu tạm câu trả lời trong attempt (có thể gửi nhiều lần).

### Curl nhanh

```bash
curl -X PATCH http://localhost:3000/api/assessments/attempts/attempt_123 \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      { "questionId": "q1", "choiceId": "c2" },
      { "questionId": "q3", "answerText": "npm" }
    ]
  }'
```

### Response 200

```json
{
  "attempt": {
    "id": "attempt_123",
    "assessmentId": "asmt_core_it",
    "userId": "user_demo",
    "status": "IN_PROGRESS",
    "startedAt": "2026-05-28T10:00:00.000Z",
    "completedAt": null,
    "createdAt": "2026-05-28T10:00:00.000Z",
    "updatedAt": "2026-05-28T10:05:00.000Z"
  },
  "savedCount": 2
}
```

---

## POST /api/assessments/attempts/:id/submit

Nộp bài, chấm điểm và trả kết quả.

### Curl nhanh

```bash
curl -X POST http://localhost:3000/api/assessments/attempts/attempt_123/submit \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Response 201

```json
{
  "attempt": {
    "id": "attempt_123",
    "assessmentId": "asmt_core_it",
    "userId": "user_demo",
    "status": "SUBMITTED",
    "startedAt": "2026-05-28T10:00:00.000Z",
    "completedAt": "2026-05-28T10:10:00.000Z",
    "createdAt": "2026-05-28T10:00:00.000Z",
    "updatedAt": "2026-05-28T10:10:00.000Z"
  },
  "result": {
    "id": "result_123",
    "assessment": {
      "id": "asmt_core_it",
      "title": "Core IT Foundations"
    },
    "userId": "user_demo",
    "classification": null,
    "scores": {
      "totalScore": 3,
      "maxScore": 10,
      "percentage": 30,
      "correctCount": 1,
      "incorrectCount": 2
    },
    "summary": "Assessment completed with 30% overall score.",
    "categoryScores": [],
    "answers": [],
    "createdAt": "2026-05-28T10:00:00.000Z"
  }
}
```

---

## POST /api/auth/register

Đăng ký tài khoản đơn giản.

### Request Body

```json
{
  "name": "Demo User",
  "email": "demo@careerflow.local",
  "password": "demo_password"
}
```

### Curl nhanh

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo User",
    "email": "demo@careerflow.local",
    "password": "demo_password"
  }'
```

### Response 201

```json
{
  "user": {
    "id": "user_123",
    "name": "Demo User",
    "email": "demo@careerflow.local"
  }
}
```

### Error Responses

```json
{
  "message": "Email already exists.",
  "code": "EMAIL_ALREADY_EXISTS"
}
```

---

## POST /api/auth/login

Đăng nhập và nhận JWT.

### Request Body

```json
{
  "email": "demo@careerflow.local",
  "password": "demo_password"
}
```

### Curl nhanh

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@careerflow.local",
    "password": "demo_password"
  }'
```

### Response 200

```json
{
  "token": "<JWT_TOKEN>",
  "user": {
    "id": "user_123",
    "name": "Demo User",
    "email": "demo@careerflow.local",
    "role": "STUDENT"
  }
}
```

### Error Responses

```json
{
  "message": "Invalid email or password.",
  "code": "INVALID_CREDENTIALS"
}
```

---

## POST /api/auth/logout

Đăng xuất (client chỉ cần xoá token). Endpoint này trả về kết quả OK.

### Curl nhanh

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Response 200

```json
{
  "message": "Logged out."
}
```

---

## POST /api/assessments/submit

Gửi đáp án và tạo kết quả đánh giá. (Deprecated: ưu tiên flow attempt)

### Request Body

```json
{
  "assessmentId": "asmt_123",
  "userId": "user_123",
  "answers": [
    { "questionId": "q1", "choiceId": "c1" },
    { "questionId": "q2", "answerText": "Binary search là log n." }
  ]
}
```

### Validation Rules

- `assessmentId` bắt buộc.
- `answers` phải là mảng và không rỗng.
- Mỗi đáp án phải có `questionId` và hoặc `choiceId` (multiple choice) hoặc `answerText` (text).
- Trùng `questionId` bị từ chối.
- Thiếu đáp án cho bất kỳ câu hỏi nào sẽ bị từ chối.
- `choiceId` phải thuộc câu hỏi đó.

### Curl nhanh

```bash
curl -X POST http://localhost:3000/api/assessments/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "assessmentId": "asmt_123",
    "userId": "user_123",
    "answers": [
      { "questionId": "q1", "choiceId": "c1" },
      { "questionId": "q2", "answerText": "Binary search là log n." }
    ]
  }'
```

### Response 201

```json
{
  "id": "result_123",
  "assessment": {
    "id": "asmt_123",
    "title": "Core IT Foundations"
  },
  "userId": "user_123",
  "classification": {
    "id": "class_1",
    "name": "Strong Problem Solver",
    "description": "Excellent analytical reasoning."
  },
  "scores": {
    "totalScore": 7,
    "maxScore": 10,
    "percentage": 70,
    "correctCount": 2,
    "incorrectCount": 1
  },
  "summary": "Strong Problem Solver with 70% overall score.",
  "categoryScores": [
    {
      "id": "cat_problem_solving",
      "name": "Problem Solving",
      "score": 4,
      "maxScore": 5,
      "percentage": 80
    }
  ],
  "answers": [
    {
      "questionId": "q1",
      "prompt": "Which data structure fits LIFO?",
      "type": "MULTIPLE_CHOICE",
      "selectedChoice": {
        "id": "c1",
        "label": "Stack",
        "value": "stack"
      },
      "answerText": null,
      "isCorrect": true,
      "score": 3
    }
  ],
  "createdAt": "2026-05-28T10:00:00.000Z"
}
```

### Error Responses

```json
{
  "message": "Missing answers for some questions.",
  "code": "VALIDATION_ERROR",
  "details": {
    "missingQuestionIds": ["q3"]
  }
}
```

---

## GET /api/assessments/results/:id

Lấy kết quả đánh giá theo id.

### Curl nhanh

```bash
curl http://localhost:3000/api/assessments/results/result_123
```

### Response 200

Giống response khi submit.

### Error Responses

```json
{
  "message": "Assessment result not found.",
  "code": "RESULT_NOT_FOUND"
}
```

---

## GET /api/users/:id/assessments

Lấy lịch sử đánh giá của người dùng.

### Curl nhanh

```bash
curl http://localhost:3000/api/users/user_123/assessments \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Response 200

```json
{
  "userId": "user_123",
  "results": [
    {
      "id": "result_123",
      "assessment": {
        "id": "asmt_123",
        "title": "Core IT Foundations"
      },
      "userId": "user_123",
      "classification": null,
      "scores": {
        "totalScore": 3,
        "maxScore": 10,
        "percentage": 30,
        "correctCount": 1,
        "incorrectCount": 2
      },
      "summary": "Assessment completed with 30% overall score.",
      "categoryScores": [],
      "answers": [],
      "createdAt": "2026-05-28T10:00:00.000Z"
    }
  ]
}
```

---

## GET /api/assessments/classifications

Danh sách classification và rule.

### Curl nhanh

```bash
curl http://localhost:3000/api/assessments/classifications
```

### Response 200

```json
{
  "classifications": [
    {
      "id": "class_1",
      "name": "Strong Problem Solver",
      "description": "Excellent analytical reasoning.",
      "isDefault": false,
      "rules": [
        {
          "id": "rule_1",
          "assessment": {
            "id": "asmt_123",
            "title": "Core IT Foundations"
          },
          "priority": 1,
          "minPercentage": 80,
          "maxPercentage": null,
          "minCorrect": null,
          "maxIncorrect": null,
          "minCategoryPercentages": {
            "cat_problem_solving": 0.8
          },
          "maxCategoryPercentages": null
        }
      ]
    }
  ]
}
```

---

## Classification Rules

Rule được đánh giá theo `priority` tăng dần. Rule đầu tiên khớp sẽ được chọn. Nếu không có rule nào khớp, sử dụng classification mặc định cho assessment đó.

Trường hỗ trợ:

- `minPercentage`, `maxPercentage`: ngưỡng phần trăm tổng điểm.
- `minCorrect`, `maxIncorrect`: ngưỡng đúng/sai.
- `minCategoryPercentages`, `maxCategoryPercentages`: map `skillCategoryId` đến phần trăm yêu cầu.

---

## Quan hệ Database (Assessment Module)

- `Assessment` có nhiều `AssessmentQuestion` và `AssessmentResult`.
- `AssessmentQuestion` có nhiều `QuestionChoice` và `QuestionKeyword`.
- `AssessmentResult` có nhiều `UserAnswer` và `AssessmentResultCategory`.
- `AssessmentResultCategory` liên kết kết quả với `SkillCategory`.
- `AssessmentClassificationRule` liên kết `Assessment` và `Classification`.

---

## Định dạng lỗi

Tất cả lỗi theo format:

```json
{
  "message": "Human-readable message",
  "code": "ERROR_CODE",
  "details": {}
}
```
