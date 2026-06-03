# Mockup Generation Instruction

**Mục đích:** Bắt buộc AI Agent phải tạo ra bản nháp giao diện (Mockup) trực quan trước khi bắt đầu code bất kỳ file UI nào.

## Chỉ thị cho AI Agent:
Khi người dùng yêu cầu thiết kế một tính năng mới có giao diện người dùng (UI):
1. **Dừng viết code ngay lập tức.** Không tạo file `.tsx`, `.html`, `.css` nào.
2. Dùng công cụ `generate_image` (nếu có) để tạo ra một bản thiết kế UI Mockup dựa trên mô tả của người dùng.
   - **Prompt cho generate_image:** Cần miêu tả chi tiết: Bố cục (Layout), Màu sắc (Colors), Nút bấm (Buttons), Trạng thái (States), và Phong cách (Style - ví dụ: Glassmorphism, Dark mode, Minimalist).
3. Sau khi ảnh được tạo thành công trong thư mục Artifacts:
   - Hãy dùng lệnh terminal để copy file ảnh đó vào thư mục `.planning/features/<tên-tính-năng>/mockup.png`.
   - Ví dụ: `mkdir -p .planning/features/auth && cp <đường-dẫn-ảnh-từ-artifact> .planning/features/auth/mockup.png`
4. Cập nhật `features/REGISTRY.md` để map tính năng này với file mockup vừa lưu.
5. Chỉ khi người dùng **phê duyệt (Approve)** ảnh Mockup đó, bạn mới được phép bắt đầu viết code Frontend.

> **Lý do:** Harness tuân thủ PEV Loop (Plan -> Execute -> Verify). Việc code UI mù mờ không có mockup được xem là vi phạm bước Plan.
