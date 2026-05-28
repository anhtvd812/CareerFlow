# Hồ sơ học tập cá nhân và lộ trình học tập thông minh

Website demo React + Vite + Tailwind CSS cho hệ thống hồ sơ học tập, đánh giá năng lực, lộ trình học thông minh và chat mentor.

## Chạy dự án

```bash
npm install
npm run dev
```

Mặc định Vite chạy tại `http://localhost:5173`.

App dùng React Router ở chế độ hash để bản demo chạy ổn cả khi mở build tĩnh. Các trang có dạng:

- `http://localhost:5173/#/dashboard`
- `http://localhost:5173/#/profile`
- `http://localhost:5173/#/roadmap`
- `http://localhost:5173/#/assessment`

## Build production

```bash
npm run build
npm run preview
```

Nếu mở trực tiếp `dist/index.html`, dùng route dạng `#/dashboard` để tránh lỗi trắng trang khi không có web server rewrite.

## Cấu trúc chính

- `src/components`: component dùng chung.
- `src/pages`: các trang theo route.
- `src/services`: mock API giả lập.
- `src/data`: dữ liệu mẫu.
- `src/utils`: hàm tiện ích.

## Route

- `/dashboard`
- `/profile`
- `/roadmap`
- `/assessment`
- `/assessment-result`
- `/mentor-chat`
