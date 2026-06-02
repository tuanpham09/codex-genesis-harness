---
name: genesis-verification-before-completion
description: Bắt buộc cung cấp bằng chứng (evidence) của quá trình kiểm định trước khi tuyên bố hoàn thành task.
---

# Genesis Verification Before Completion

## Purpose
Chấm dứt triệt để việc AI "ảo giác" (hallucinate) kết quả làm việc hoặc tuyên bố xong việc khi chưa chạy test thực tế trên hệ thống. Kỹ năng này đảm bảo chất lượng mã nguồn bằng cách yêu cầu đưa ra bằng chứng (evidence) cụ thể, có thể xác minh được.

## When to use
Sử dụng mỗi khi kết thúc một đầu mục công việc trong `task.md` hoặc trước khi thông báo với người dùng rằng toàn bộ kế hoạch (Implementation Plan) đã hoàn tất.

## When NOT to use
Không sử dụng khi task chỉ đơn thuần là trả lời câu hỏi lý thuyết, vẽ sơ đồ, hoặc hướng dẫn cấu trúc mà không hề chạm vào code/hệ thống thực tế.

## Inputs required
- Trạng thái công việc vừa thực hiện xong.
- Scripts kiểm tra có sẵn của dự án (`verify.sh`, `npm test`, `run-evals.sh`, linter, v.v.).

## Outputs required
- Bằng chứng chạy lệnh (CLI output hoặc logs).
- Trạng thái cụ thể của các bài test (Pass/Fail) và giải thích ngắn gọn ý nghĩa của output đó (vd: "Toàn bộ 45 unit tests đã pass").

## Required tests
Không tự ý viết thêm test ở bước này nếu không được yêu cầu. Tập trung vào việc **thực thi** (execute) các test suite đã được thiết lập bởi TDD ở các bước trước.

## Required fixtures
Xác nhận rằng mọi script kiểm thử đã tiêu thụ (consume) đúng các mock data hoặc fixtures được quy định trong cấu trúc dự án.

## Required contract updates
Nếu script verify phát hiện sự sai lệch giữa code và contract (ví dụ: JSON schema bị lỗi), báo cáo ngay lập tức để người dùng quyết định thay đổi code hay cập nhật contract.

## Required codebase map updates
N/A - Việc cập nhật map nên được thực hiện trong quá trình code, kiểm định chỉ đóng vai trò xác thực.

## Token saving rules
Nếu output của quá trình test hoặc linter quá dài (hàng nghìn dòng do log lỗi), hãy dùng các cờ (flags) để chỉ in ra summary (như `--silent` hoặc `tail -n 50`) để tránh tràn context.

## Acceptance criteria
1. Phải có bằng chứng rõ ràng (CLI stdout/stderr) chứng minh lệnh kiểm định đã thực sự được gọi trên Terminal.
2. Không còn bất kỳ error hay warning nghiêm trọng nào bị bỏ sót chưa xử lý.
3. Toàn bộ kịch bản kiểm thử (smoke, unit, integration) đã đạt chỉ tiêu 100% xanh (Green).

## Common mistakes
- **Báo cáo suông**: Viết dòng chữ "Đã kiểm tra và mã hoạt động tốt" nhưng không hề đính kèm CLI output hoặc không cung cấp bằng chứng đã chạy script nào.
- **Bỏ qua Warning**: Chỉ nhìn thấy chữ "Pass" nhưng phớt lờ hàng loạt warning tiềm ẩn từ trình biên dịch (compiler) hoặc linter.
- **Kiểm định sai thư mục**: Chạy test ở thư mục root trong khi package nằm ở thư mục con.

## Recovery workflow
1. Nếu verify thất bại ở những phút cuối: Đánh dấu lại tiến độ vào `task.md` (chưa xong).
2. Tái sử dụng TDD loop (skill: `genesis-test-driven-development`) để khoanh vùng và xử lý lỗi.
3. Không cố gắng che giấu lỗi bằng cách phớt lờ thông báo thất bại.
