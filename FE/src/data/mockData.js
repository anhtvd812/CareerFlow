export const user = {
  id: 'user_001',
  name: 'Nguyễn Văn A',
  email: 'nguyenvana@example.com',
  careerTarget: 'Frontend Developer',
};

export const currentSkills = [
  { name: 'HTML', level: 80 },
  { name: 'CSS', level: 70 },
  { name: 'JavaScript', level: 50 },
  { name: 'ReactJS', level: 25 },
  { name: 'Git', level: 40 },
];

export const requiredSkillsByCareer = {
  'Frontend Developer': [
    { name: 'HTML', level: 90 },
    { name: 'CSS', level: 85 },
    { name: 'JavaScript', level: 90 },
    { name: 'ReactJS', level: 80 },
    { name: 'Git', level: 70 },
    { name: 'API Integration', level: 75 },
  ],
  'Backend Developer': [
    { name: 'Node.js', level: 85 },
    { name: 'Database', level: 80 },
    { name: 'API Design', level: 85 },
    { name: 'Testing', level: 70 },
  ],
  'UI/UX Designer': [
    { name: 'Wireframe', level: 85 },
    { name: 'Design System', level: 80 },
    { name: 'User Research', level: 75 },
    { name: 'Figma', level: 85 },
  ],
};

export const certificates = [
  { id: 'cert_001', name: 'HTML & CSS Basic Certificate', issuer: 'Learning Hub', issuedAt: '2025-09-10' },
  { id: 'cert_002', name: 'JavaScript Foundation Certificate', issuer: 'Code Academy', issuedAt: '2025-12-18' },
];

export const goals = [
  { id: 'goal_001', title: 'Học JavaScript nâng cao', status: 'in_progress' },
  { id: 'goal_002', title: 'Hoàn thành ReactJS cơ bản', status: 'in_progress' },
  { id: 'goal_003', title: 'Làm project Portfolio Website', status: 'not_started' },
  { id: 'goal_004', title: 'Học Git và GitHub', status: 'completed' },
];

export const learningProfile = {
  id: 'profile_001',
  user,
  skills: currentSkills,
  certificates,
  goals,
  overallProgress: 42,
};

export const roadmap = {
  id: 'roadmap_001',
  userId: 'user_001',
  title: 'Frontend Developer Learning Path',
  stages: [
    {
      id: 'stage_001',
      name: 'Web Foundation',
      description: 'Nắm vững cấu trúc web, layout và xây dựng trang tĩnh.',
      tasks: [
        { id: 'task_001', title: 'Learn HTML Structure', type: 'lesson', status: 'completed' },
        { id: 'task_002', title: 'Learn CSS Layout', type: 'lesson', status: 'completed' },
        { id: 'task_003', title: 'Build Personal Portfolio', type: 'project', status: 'in_progress' },
      ],
    },
    {
      id: 'stage_002',
      name: 'JavaScript Foundation',
      description: 'Hiểu biến, hàm, DOM và xây dựng ứng dụng nhỏ.',
      tasks: [
        { id: 'task_004', title: 'Learn Variables and Functions', type: 'lesson', status: 'completed' },
        { id: 'task_005', title: 'Learn DOM Manipulation', type: 'task', status: 'in_progress' },
        { id: 'task_006', title: 'Build Todo List App', type: 'project', status: 'not_started' },
      ],
    },
    {
      id: 'stage_003',
      name: 'ReactJS Basic',
      description: 'Xây dựng UI bằng component, props, state và data flow.',
      tasks: [
        { id: 'task_007', title: 'Learn Components', type: 'lesson', status: 'not_started' },
        { id: 'task_008', title: 'Learn Props and State', type: 'lesson', status: 'not_started' },
        { id: 'task_009', title: 'Build Weather App', type: 'project', status: 'not_started' },
      ],
    },
    {
      id: 'stage_004',
      name: 'Git and API Integration',
      description: 'Quản lý mã nguồn, gọi API và hoàn thiện project thực tế.',
      tasks: [
        { id: 'task_010', title: 'Learn Git Workflow', type: 'lesson', status: 'not_started' },
        { id: 'task_011', title: 'Learn Fetch API', type: 'lesson', status: 'not_started' },
        { id: 'task_012', title: 'Build Movie Search App', type: 'project', status: 'not_started' },
      ],
    },
  ],
};

export const weeklyProgress = [
  { week: 'Tuần 1', completed: 2, target: 3 },
  { week: 'Tuần 2', completed: 4, target: 5 },
  { week: 'Tuần 3', completed: 5, target: 6 },
  { week: 'Tuần 4', completed: 7, target: 8 },
  { week: 'Tuần 5', completed: 8, target: 10 },
  { week: 'Tuần 6', completed: 10, target: 12 },
];

export const assessmentQuestions = [
  {
    id: 'q1',
    text: 'Bạn thích làm phần nào nhất khi xây dựng một sản phẩm số?',
    options: [
      { id: 'q1_a', text: 'Giao diện người dùng và tương tác', group: 'frontend', score: 10 },
      { id: 'q1_b', text: 'Logic phía máy chủ và hệ thống', group: 'backend', score: 10 },
      { id: 'q1_c', text: 'Trải nghiệm, bố cục và hành vi người dùng', group: 'uiux', score: 10 },
      { id: 'q1_d', text: 'Phân tích dữ liệu để ra quyết định', group: 'data', score: 10 },
    ],
  },
  {
    id: 'q2',
    text: 'Bạn tự tin nhất với hoạt động nào?',
    options: [
      { id: 'q2_a', text: 'Viết HTML, CSS và JavaScript', group: 'frontend', score: 10 },
      { id: 'q2_b', text: 'Thiết kế cơ sở dữ liệu', group: 'backend', score: 10 },
      { id: 'q2_c', text: 'Phác thảo wireframe', group: 'uiux', score: 10 },
      { id: 'q2_d', text: 'Làm sạch và trực quan hóa dữ liệu', group: 'data', score: 10 },
    ],
  },
  {
    id: 'q3',
    text: 'Khi gặp một yêu cầu mới, bạn thường bắt đầu từ đâu?',
    options: [
      { id: 'q3_a', text: 'Chia giao diện thành các component', group: 'frontend', score: 10 },
      { id: 'q3_b', text: 'Xác định API và luồng dữ liệu', group: 'backend', score: 10 },
      { id: 'q3_c', text: 'Tìm hiểu người dùng và pain point', group: 'uiux', score: 10 },
      { id: 'q3_d', text: 'Xác định chỉ số cần đo', group: 'data', score: 10 },
    ],
  },
  {
    id: 'q4',
    text: 'Project nào hấp dẫn bạn nhất?',
    options: [
      { id: 'q4_a', text: 'Dashboard học tập responsive', group: 'frontend', score: 10 },
      { id: 'q4_b', text: 'Hệ thống xác thực và phân quyền', group: 'backend', score: 10 },
      { id: 'q4_c', text: 'Prototype app học tập trên Figma', group: 'uiux', score: 10 },
      { id: 'q4_d', text: 'Mô hình dự đoán hiệu quả học tập', group: 'data', score: 10 },
    ],
  },
  {
    id: 'q5',
    text: 'Bạn muốn phát triển kỹ năng nào trong 3 tháng tới?',
    options: [
      { id: 'q5_a', text: 'ReactJS và tích hợp API', group: 'frontend', score: 10 },
      { id: 'q5_b', text: 'Node.js và kiến trúc dịch vụ', group: 'backend', score: 10 },
      { id: 'q5_c', text: 'Research và usability testing', group: 'uiux', score: 10 },
      { id: 'q5_d', text: 'SQL, Python và dashboard dữ liệu', group: 'data', score: 10 },
    ],
  },
];

export const mentors = [
  { id: 'mentor_001', name: 'Mentor Frontend', role: 'ReactJS Mentor', online: true },
  { id: 'mentor_002', name: 'Mentor UI/UX', role: 'Product Design Mentor', online: false },
  { id: 'mentor_003', name: 'Mentor Career Orientation', role: 'Career Coach', online: true },
];

export const chatMessages = {
  mentor_001: [
    { id: 'm1', sender: 'mentor', text: 'Chào A, hôm nay em muốn tối ưu phần nào trong lộ trình Frontend?' },
    { id: 'm2', sender: 'user', text: 'Em muốn biết nên học gì tiếp theo.' },
  ],
  mentor_002: [
    { id: 'm3', sender: 'mentor', text: 'Chúng ta có thể bắt đầu từ cách đọc brief và dựng wireframe.' },
  ],
  mentor_003: [
    { id: 'm4', sender: 'mentor', text: 'Mục tiêu nghề nghiệp hiện tại của em là Frontend Developer, lộ trình đang đi đúng hướng.' },
  ],
};
