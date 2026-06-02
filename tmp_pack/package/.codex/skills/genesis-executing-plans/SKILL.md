---
name: genesis-executing-plans
description: Tuân thủ nghiêm ngặt lộ trình đã thống nhất. Yêu cầu agent check-off các công việc trong task.md và nghiêm cấm việc đi chệch hướng khỏi kế hoạch đã được duyệt.
---

# Genesis Executing Plans

## Purpose
Đảm bảo execution bám sát 100% bản kế hoạch (Implementation Plan). Ngăn chặn tình trạng AI tự ý mở rộng phạm vi công việc (scope creep).

## When to use
Sử dụng trong mọi quá trình thực thi sau khi phase Planning kết thúc và đã nhận được sự phê duyệt của người dùng.

## When NOT to use
Không sử dụng trong lúc đang làm research, lập kế hoạch, hoặc giải quyết sự cố khẩn cấp chưa có plan.

## Inputs required
- Bản kế hoạch (`artifacts/implementation_plan.md`)
- Danh sách công việc (`artifacts/task.md`)

## Outputs required
- Đánh dấu `[x]` hoặc `[/]` vào `task.md` liên tục.
- Báo cáo kết quả trực tiếp bám theo đầu mục công việc.

## Required tests
N/A

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
