---
name: genesis-executing-plans
description: Tuân thủ nghiêm ngặt lộ trình đã thống nhất. Yêu cầu agent check-off các công việc trong task.md và nghiêm cấm việc đi chệch hướng khỏi kế hoạch đã được duyệt.
---

# Genesis Executing Plans

## Purpose
Đảm bảo execution bám sát 100% bản kế hoạch (Implementation Plan). Ngăn chặn tình trạng AI tự ý mở rộng phạm vi công việc (scope creep) hoặc thực hiện những tác vụ chưa được người dùng phê duyệt.

## When to use
Sử dụng trong mọi quá trình thực thi code sau khi phase Planning kết thúc và đã nhận được sự phê duyệt (approval) của người dùng.

## When NOT to use
Không sử dụng trong lúc đang làm research, lập kế hoạch, hoặc khi hệ thống gặp sự cố khẩn cấp (cần hotfix) chưa kịp có plan.

## Inputs required
- Bản kế hoạch đã được phê duyệt (`artifacts/implementation_plan.md`)
- Danh sách công việc chi tiết (`artifacts/task.md`)

## Outputs required
- Dấu `[x]` (hoàn thành) hoặc `[/]` (đang làm) được cập nhật liên tục vào `task.md`.
- Báo cáo kết quả trực tiếp bám sát theo từng đầu mục công việc, không lan man.

## Required tests
Mọi chức năng thêm mới hoặc sửa đổi đều phải có test tương ứng để chứng minh tính đúng đắn trước khi hoàn tất công việc.

## Required fixtures
Nếu task yêu cầu xử lý luồng dữ liệu mới, bắt buộc phải có file JSON/Markdown giả lập (mock data) ở mục `fixtures/` để mô phỏng chính xác dữ liệu đầu vào.

## Required contract updates
Nếu quá trình thực thi làm thay đổi interface (input/output/schema) của API hoặc cấu trúc Agent, bắt buộc cập nhật các file hợp đồng tại `contracts/`.

## Required codebase map updates
Nếu quá trình thực thi làm thay đổi cấu trúc thư mục, thêm/bớt module, bắt buộc cập nhật `CURRENT_STATE.md` và `MODULE_INDEX.md`.

## Token saving rules
Chỉ sử dụng `view_file` để đọc những file liên quan trực tiếp đến sub-task hiện tại. Không đọc toàn bộ file hoặc toàn bộ project nếu không thực sự cần thiết. Khuyến khích đọc các file summary thay vì đọc source code dài.

## Acceptance criteria
1. Mọi công việc trong `task.md` phải được đánh dấu `[x]`.
2. Code phải pass toàn bộ linter và test (`npm run verify` / `npm test`).
3. Cấu trúc project sau khi thực thi phải sạch sẽ, không có file nháp thừa (ngoại trừ trong `scratch/`).

## Common mistakes
- **Scope creep**: Nhảy cóc qua các bước, tự ý thêm tính năng hoặc refactor những file không nằm trong kế hoạch ban đầu.
- **Quên cập nhật task.md**: Làm xong việc nhưng không cập nhật dấu `[x]` vào checklist, gây mất bối cảnh cho các tác vụ tiếp theo.
- **Thiếu test**: Viết code xong nhưng bỏ quên bước tạo test đi kèm.

## Recovery workflow
Nếu quá trình thực thi làm hỏng hệ thống và không thể vãn hồi nhanh chóng:
1. Thông báo ngay cho người dùng về mức độ nghiêm trọng.
2. Dùng lệnh `git reset --hard` hoặc checkout lại từ branch/worktree gốc để đưa hệ thống về trạng thái an toàn gần nhất.
3. Cập nhật lại kế hoạch nếu hướng đi hiện tại không khả thi.
