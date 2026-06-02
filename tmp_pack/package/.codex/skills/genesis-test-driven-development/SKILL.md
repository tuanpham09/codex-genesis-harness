---
name: genesis-test-driven-development
description: Đảm bảo viết Test trước, Implement sau (Red -> Green -> Refactor). Bắt buộc phải có verification cycle ở mọi bước thay đổi logic.
---

# Genesis Test Driven Development

## Purpose
Bắt buộc tuân thủ nguyên tắc TDD. Agent phải chứng minh được test fail (Red) trước khi sửa code, sau đó pass (Green), và cuối cùng là dọn dẹp mã (Refactor).

## When to use
Bất cứ khi nào thêm tính năng mới, sửa lỗi, hoặc thay đổi logic nghiệp vụ.

## When NOT to use
Khi viết tài liệu, thay đổi cấu trúc thư mục không ảnh hưởng logic, hoặc thuần tuý design UI không có logic nghiệp vụ.

## Inputs required
- Lỗi cụ thể từ người dùng hoặc requirement mới.
- Khung test framework của dự án.

## Outputs required
- Test file mới hoặc được cập nhật.
- Kết quả chạy test fail.
- Source code được implement.
- Kết quả chạy test pass.

## Required tests
Mọi chức năng phải được bao phủ bởi Unit Test hoặc Integration Test trước khi code chính được viết.

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
