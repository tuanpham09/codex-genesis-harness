---
name: genesis-using-git-worktrees
description: Tạo và quản lý môi trường phân lập an toàn qua git worktrees khi thực hiện các thay đổi kiến trúc mang tính rủi ro cao.
---

# Genesis Using Git Worktrees

## Purpose
Đảm bảo an toàn cho nhánh làm việc chính bằng cách thử nghiệm và refactor ở một thư mục làm việc phụ (worktree) được cách ly hoàn toàn.

## When to use
Khi tiến hành refactor lớn, thay đổi thư viện cốt lõi, nâng cấp kiến trúc diện rộng, hoặc khi cần giữ nguyên context repo hiện tại để thực hiện một hotfix khẩn cấp.

## When NOT to use
Khi chỉ thay đổi nhỏ cục bộ (minor changes, typos, text updates) không ảnh hưởng đến toàn hệ thống.

## Inputs required
- Yêu cầu thay đổi kiến trúc lớn.
- Lệnh git để tạo worktree.

## Outputs required
- Một worktree mới được tạo ra.
- Thực thi công việc trên worktree mới.
- Merge kết quả hoặc dọn dẹp worktree khi hoàn tất.

## Required tests
Chạy toàn bộ Regression Tests và Smoke Tests trên worktree trước khi xem xét tích hợp.

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
