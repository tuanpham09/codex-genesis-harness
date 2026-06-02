---
name: genesis-verification-before-completion
description: Bắt buộc cung cấp bằng chứng (evidence) của quá trình kiểm định trước khi tuyên bố hoàn thành task.
---

# Genesis Verification Before Completion

## Purpose
Chấm dứt việc AI "ảo giác" hoặc tuyên bố xong việc khi chưa chạy test thực tế. Đảm bảo chất lượng mã nguồn bằng evidence cụ thể.

## When to use
Mỗi khi kết thúc một đầu mục công việc trong `task.md` hoặc trước khi thông báo hoàn tất toàn bộ yêu cầu của người dùng.

## When NOT to use
Không sử dụng khi task chỉ là trả lời câu hỏi lý thuyết, không chạm vào code/hệ thống.

## Inputs required
- Trạng thái công việc đang thực hiện.
- Scripts kiểm tra (`verify.sh`, `run-evals.sh`, v.v.).

## Outputs required
- Bằng chứng chạy lệnh (CLI output).
- Trạng thái các bài test (Pass/Fail).

## Required tests
Phụ thuộc vào loại thay đổi, thường là toàn bộ test suite liên quan đến thay đổi vừa thực hiện.

## Required fixtures
N/A

## Required contract updates
N/A

## Required codebase map updates
N/A

## Token saving rules
Keep context small.

## Acceptance criteria
Must be completed properly.

## Common mistakes
N/A

## Recovery workflow
Revert if failed.
