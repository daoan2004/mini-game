# 🕵️ Bí Ẩn Marlene Harrington - Game Trinh Thám AI

Trò chơi trinh thám tương tác sử dụng AI để giải quyết bí ẩn cái chết của Marlene Harrington tại biệt thự cổ.

## 🎮 Về Game

**Bí Ẩn Marlene Harrington** là một trò chơi trinh thám tương tác được phát triển bằng Next.js và tích hợp AI. Người chơi vào vai thám tử điều tra vụ án bí ẩn trong biệt thự cổ.

### 🎯 Tính Năng Chính

- **🤖 AI Thông Minh**: Hệ thống AI hỗ trợ gợi ý câu hỏi và phân tích bằng chứng
- **🔍 Điều Tra Tương Tác**: Tìm kiếm bằng chứng, phỏng vấn nhân vật
- **🧪 Phòng Lab Phân Tích**: Mini-game phân tích bằng chứng với các công cụ chuyên nghiệp
- **📊 Hệ Thống Deduction**: Bảng suy luận để kết nối manh mối
- **🏆 Achievements**: Hệ thống thành tích và điểm số
- **💾 Save/Load**: Lưu và tải tiến trình game
- **📱 Responsive**: Tối ưu cho mọi thiết bị

### 🎭 Cốt Truyện

Đêm giông bão năm 1993, bà Marlene Harrington được phát hiện chết trong phòng riêng tại biệt thự cổ. Cửa phòng khóa từ bên trong, không có dấu hiệu đột nhập. Trước đó bà vừa tuyên bố sẽ thay đổi di chúc...

## 🚀 Cài Đặt và Chạy Game

### Yêu Cầu Hệ Thống
- Node.js 18.0 hoặc cao hơn
- NPM hoặc Yarn

### Cài Đặt

1. **Clone repository:**
```bash
git clone <repository-url>
cd mystery-game
```

2. **Cài đặt dependencies:**
```bash
npm install
# hoặc
yarn install
```

3. **Tạo file môi trường:**
```bash
cp .env.local.example .env.local
```

4. **Thêm API key Google Gemini vào `.env.local`:**
```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

### Chạy Game

```bash
# Development mode
npm run dev

# Production build
npm run build
npm run start

# Lint code
npm run lint
```

Mở [http://localhost:3000](http://localhost:3000) để chơi game.

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **AI Integration**: Google Gemini AI
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 🎮 Hướng Dẫn Chơi

1. **Điều Tra**: Di chuyển giữa các phòng trong biệt thự
2. **Thu Thập Bằng Chứng**: Tìm kiếm và phân tích các manh mối
3. **Phỏng Vấn**: Nói chuyện với các nhân vật nghi ngờ
4. **Phân Tích**: Sử dụng phòng lab để nghiên cứu bằng chứng
5. **Suy Luận**: Kết nối các manh mối trên bảng deduction
6. **Buộc Tội**: Đưa ra kết luận cuối cùng

## 🏗️ Cấu Trúc Dự Án

```
mystery-game/
├── app/                    # Next.js App Router
├── src/
│   ├── components/         # React Components
│   │   ├── game/          # Game-specific components
│   │   ├── layout/        # Layout components
│   │   └── ui/            # UI components
│   ├── data/              # Game data (characters, evidence, rooms)
│   ├── hooks/             # Custom React hooks
│   ├── stores/            # Zustand stores
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
└── public/                # Static assets
    └── images/            # Game images
```

## 🤝 Đóng Góp

Mọi đóng góp đều được chào đón! Hãy tạo issue hoặc pull request.

## 📄 License

Dự án này được phát hành dưới MIT License.

## 🎯 Roadmap

- [ ] Thêm nhiều kịch bản mystery khác nhau
- [ ] Multiplayer mode
- [ ] Mobile app version
- [ ] Hệ thống ranking toàn cầu
- [ ] Mod support

---

**Chúc bạn chơi game vui vẻ và tìm ra hung thủ thật sự! 🕵️‍♂️**
