---
name: genesis-using-git-worktrees
description: Tạo và quản lý môi trường phân lập an toàn qua git worktrees khi thực hiện các thay đổi kiến trúc mang tính rủi ro cao.
---

# Genesis Using Git Worktrees

## Purpose
Đảm bảo an toàn tuyệt đối cho nhánh làm việc chính bằng cách thử nghiệm và refactor hệ thống ở một thư mục làm việc phụ (git worktree) được cách ly hoàn toàn. Kỹ năng này giúp developer hoặc AI không sợ làm hỏng repo gốc, dễ dàng xoá bỏ nếu kế hoạch thất bại.

## When to use
Khi tiến hành refactor lớn, thay đổi thư viện cốt lõi, nâng cấp kiến trúc diện rộng, thử nghiệm framework mới, hoặc khi cần giữ nguyên bối cảnh (context) repo hiện tại để thực hiện một hotfix khẩn cấp sang một branch khác.

## When NOT to use
Khi chỉ thay đổi nhỏ cục bộ (minor changes, typos, text updates, unit test fixes) không đe doạ đến kiến trúc hoặc sự ổn định toàn hệ thống.

## Inputs required
- Yêu cầu thay đổi kiến trúc rủi ro cao từ `implementation_plan.md`.
- Vị trí an toàn để tạo worktree (ví dụ: một cấp bên ngoài thư mục project hiện tại như `../project-refactor`).

## Outputs required
- Lệnh tạo worktree thành công (`git worktree add -b refactor-branch ../project-refactor`).
- Chuyển hướng context của AI sang thư mục worktree mới để làm việc.
- Dọn dẹp/xoá worktree sau khi hoàn tất hoặc merge thành công (`git worktree remove ...`).

## Required tests
Chạy toàn bộ Regression Tests và Smoke Tests trên worktree để chứng minh tính đúng đắn trước khi xem xét tích hợp (merge) lại vào nhánh chính của repository gốc.

## Required fixtures
N/A - Worktree dùng chung codebase repo gốc nhưng chia sẻ node_modules riêng rẽ hoặc tuỳ cấu hình. 

## Required contract updates
Trong môi trường worktree, hãy tuỳ ý chỉnh sửa hợp đồng (contracts) để thử nghiệm. Tuy nhiên trước khi merge, phải thông báo sự tương thích chéo.

## Required codebase map updates
Đừng quên đồng bộ `CURRENT_STATE.md` để phản ánh nhánh/worktree đang thao tác nhằm tránh lạc đường.

## Token saving rules
Quản lý tốt đường dẫn tương đối và tuyệt đối khi làm việc trong worktree để tránh nhầm lẫn với repo gốc, gây nhiễu cho luồng đọc file.

## Acceptance criteria
1. Không được phép chỉnh sửa các file thuộc cấu trúc nhánh chính khi mục tiêu là rủi ro. Mọi thay đổi đều phải thực hiện trên branch của worktree.
2. Thử nghiệm trên worktree không được phá hỏng git index của repo gốc.
3. Có quy trình merge an toàn hoặc gỡ bỏ (prune) sạch sẽ khi không còn sử dụng.

## Common mistakes
- **Tạo worktree sai chỗ**: Tạo worktree *bên trong* thư mục làm việc gốc (ví dụ: `./my-worktree`) dẫn đến việc hệ thống git bị bối rối hoặc bị scan bởi linter/watcher. Phải luôn tạo ở cấp thư mục cha (ví dụ: `../my-worktree`).
- **Quên xoá worktree**: Làm rác hệ thống máy chủ, gây xung đột tài nguyên đĩa.
- **Thực thi lệnh nhầm thư mục**: Quên đổi thư mục làm việc (CWD) sang thư mục worktree mới, tiếp tục đập phá nhánh gốc.

## Recovery workflow
1. Nếu worktree gặp lỗi nghiêm trọng không thể cứu vãn: Chạy lệnh `git worktree remove -f <path>` và `git worktree prune`.
2. Trở lại repository gốc với trạng thái nguyên vẹn 100%.
3. Tạo worktree mới và bắt đầu lại.
