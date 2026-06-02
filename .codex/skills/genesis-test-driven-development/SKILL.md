---
name: genesis-test-driven-development
description: Đảm bảo viết Test trước, Implement sau (Red -> Green -> Refactor). Bắt buộc phải có verification cycle ở mọi bước thay đổi logic.
---

# Genesis Test Driven Development

## Purpose
Bắt buộc tuân thủ nguyên tắc TDD (Test-Driven Development) nhằm giữ cho chất lượng codebase luôn ở mức cao nhất. Cụ thể, Agent phải chứng minh được test fail (Red) trước khi sửa code, sau đó pass (Green) sau khi implement, và cuối cùng là dọn dẹp mã (Refactor) để duy trì cấu trúc sạch sẽ.

## When to use
Bất cứ khi nào thêm tính năng mới (feature), sửa lỗi logic (bug fix), hoặc thay đổi luồng nghiệp vụ của ứng dụng/API.

## When NOT to use
Khi chỉ thay đổi tài liệu (README, docs), thay đổi cấu trúc thư mục không ảnh hưởng logic (như move file), cấu hình CI/CD, hoặc thuần tuý design UI không có logic nghiệp vụ phức tạp.

## Inputs required
- Lỗi cụ thể từ người dùng hoặc requirement chi tiết từ bản kế hoạch.
- Khung test framework của dự án (Jest, Mocha, Playwright, v.v.).

## Outputs required
- Test file mới hoặc được cập nhật.
- Kết quả chạy test báo lỗi (Red phase) phản ánh đúng phần logic chưa có hoặc bị hỏng.
- Source code được implement hoặc chỉnh sửa.
- Kết quả chạy test pass (Green phase).

## Required tests
Mọi chức năng, API endpoint hoặc module mới phải được bao phủ bởi Unit Test (và Integration Test nếu có tương tác giữa các service) trước khi code chính được hoàn thiện.

## Required fixtures
Các bài test bắt buộc phải sử dụng dữ liệu từ mục `fixtures/` thay vì hardcode trực tiếp trong nội dung test, nhằm đảm bảo tính tái sử dụng và dễ theo dõi.

## Required contract updates
Trong quá trình TDD, nếu nhận thấy cần thay đổi đầu vào (request) hoặc đầu ra (response) của API, hãy cập nhật ngay lập tức các file trong mục `contracts/` rồi mới tiến hành sửa test.

## Required codebase map updates
Đảm bảo thêm module test mới vào file `TEST_MATRIX.md` để hệ thống nắm được phạm vi kiểm thử (coverage).

## Token saving rules
Hạn chế chạy toàn bộ test suite lớn của dự án nhiều lần liên tiếp. Thay vào đó, hãy chạy riêng lẻ file test hoặc block test đang được implement (`npm test -- path/to/file.test.js`).

## Acceptance criteria
1. Quá trình Red -> Green -> Refactor được chứng minh bằng lịch sử dòng lệnh (CLI output).
2. Codebase sau khi Refactor không bị trùng lặp mã (DRY).
3. Test phải pass 100% khi chạy lẻ và chạy chung với toàn hệ thống.

## Common mistakes
- **Viết code trước, viết test sau**: Đi ngược lại với triết lý TDD, dẫn đến test thiếu chính xác hoặc "test để pass".
- **Test không ý nghĩa (Trivial Tests)**: Viết test chỉ kiểm tra biến bằng chính nó (vd: `expect(true).toBe(true)`), không có giá trị bảo vệ logic.
- **Bỏ quên Refactor**: Đạt được Green (test pass) nhưng bỏ lại source code rối rắm, lộn xộn.

## Recovery workflow
1. Nếu quá trình Refactor làm test đỏ (fail) trở lại, tuyệt đối KHÔNG đổi mã của bài test.
2. Hãy khôi phục source code về trạng thái Green gần nhất bằng `git restore` hoặc undo các thay đổi.
3. Tiến hành Refactor lại từng bước nhỏ hơn (baby steps).
