# ⚽ FC Online FVPL Tournament Broadcast HUD

Hệ thống Scorebug & Facecam Overlay chuẩn giải đấu **FVPL (FC Online Vietnam Pro League)** phục vụ livestream giải đấu FC Online trên OBS Studio / vMix.

---

## 🌟 Tính Năng Chính

- **Scene 1: Intro Đầu Trận (Matchup)**:
  - Sequence animation chuẩn truyền hình: Logo giải đấu và 2 tuyển thủ (cutout PNG tách nền) đồng loạt trượt từ thanh banner mở rộng vươn lên.
  - Hỗ trợ căn chỉnh kích thước (Scale %) và vị trí (X, Y) realtime của từng tuyển thủ và Logo.
  - Hỗ trợ tải Logo tĩnh (PNG/WebP/GIF) hoặc Logo chuyển động (Video MP4/WebM animation).
- **Scene 2: In-Game HUD**:
  - 2 Khung Camera VDO.Ninja đặt chuẩn xác ở 2 bên cạnh radar mini-map, tỷ lệ 16:9 (`270px x 152px`), không có viền đen thừa (edge-to-edge).
  - Tùy chỉnh màu viền camera trùng với màu áo thi đấu.
  - Phím <kbd>D</kbd>: Làm mờ camera (Opacity 28%) khi bóng xuống đáy sân để khán giả nhìn bóng.
  - Phím <kbd>H</kbd>: Ẩn / Hiện camera (trượt xuống dưới đáy màn hình).
  - Phím <kbd>S</kbd>: Đổi bên 2 camera (Trái $\leftrightarrow$ Phải) khi 2 VĐV đổi sân.
  - Phím <kbd>G</kbd> / <kbd>J</kbd>: Hiệu ứng **Ghi Bàn kiểu Ngoại Hạng Anh (Premier League Goal Banner)** đè khít 100% lên bảng tỉ số in-game (`Top: 73px, Left: 108px, Width: 618px, Height: 40px`) với âm thanh whoosh truyền hình sống động và màu áo tương ứng.
- **Tối ưu Cloud & Render.com**:
  - Tự động duy trì kết nối WebSocket 24/7 với cơ chế Ping/Pong Heartbeat mỗi 25s chống ngắt kết nối do Cloud Timeout.
  - Endpoint `/healthz` hỗ trợ keep-alive chống ngủ đông trên Render.

---

## 🚀 Triển Khai Nhanh Trên Render.com

1. Đăng nhập [Render.com](https://render.com/) ➔ Chọn **New +** ➔ **Web Service**.
2. Kết nối với repository GitHub này: `DuyOrbit/fcohud`.
3. Điền cấu hình:
   - **Name**: `fconline-hud` (hoặc tên tùy chọn)
   - **Language**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Bấm **Deploy Web Service**.
5. Sau khi deploy xong, bạn sẽ có URL: `https://<ten-app>.onrender.com`.

---

## 📺 Đưa Vào OBS Studio

1. Trong OBS Studio, tạo một **Source** mới ➔ Chọn **Browser**.
2. Dán link: `https://<ten-app>.onrender.com/overlay`
3. Cài đặt:
   - **Width**: `1920`
   - **Height**: `1080`
   - Tích chọn **Shutdown source when not visible** và **Refresh browser when scene becomes active**.
4. Mở Bảng Điều Khiển tại `https://<ten-app>.onrender.com/control` để vận hành trực tiếp!

---

## 💻 Chạy Trực Tiếp Ở Máy Local

```bash
# Cài đặt thư viện
npm install

# Khởi chạy server
npm start
# Server sẽ chạy tại: http://localhost:3000
```
