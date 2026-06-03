# Compressed Context & Dependency Graph

## src/auth.js
### Implements Features
- `Đăng nhập`
- `Cập nhật Profile`

## tests/integration/cli-smoke.test.js
### Dependencies
- `assert`
- `fs`
- `os`
- `path`
- `child_process`

## tests/unit/contract_integrity_gate.test.js
### Dependencies
- `assert`
- `fs`
- `path`
- `child_process`

## tests/unit/healing_telemetry.test.js
### Dependencies
- `assert`
- `fs`
- `path`
- `child_process`

## tests/unit/prompt_sentinel.test.js
### Dependencies
- `assert`
- `fs`
- `path`
- `child_process`

## tests/unit/spec_visual_sync.test.js
### Dependencies
- `assert`
- `fs`
- `path`
- `child_process`

## tests/unit/test_generator.test.js
### Dependencies
- `assert`
- `fs`
- `path`
- `child_process`

## bin/genesis-harness.js
### Dependencies
- `fs`
- `path`
- `child_process`
- `@babel/parser`
- `@babel/traverse`
- `child_process`


## Project Planning & Roadmap
# Phase 1: Core Features

## Role: User
- [x] Đăng nhập (files: src/auth.js)
- [/] Cập nhật Profile (depends_on: Đăng nhập) (files: src/auth.js, src/db.js)
- [ ] Mua hàng (depends_on: Đăng nhập)

## Role: Admin
- [x] Quản lý User
- [ ] Xem thống kê doanh thu (depends_on: Mua hàng)
- [~] Xử lý đơn hàng (depends_on: Mua hàng)

# Phase 2: Nâng Cao

## Role: Analytics
- [ ] Xuất báo cáo Excel (depends_on: Xem thống kê doanh thu)
- [ ] Tích hợp Google Analytics
- [/] Dashboard Real-time (depends_on: Google Analytics)

