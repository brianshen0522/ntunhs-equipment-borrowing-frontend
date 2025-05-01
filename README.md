# NTUNHS 總務處器材借用管理系統 (Equipment Borrowing System)

## 專案概述 (Project Overview)

NTUNHS 總務處器材借用管理系統是為國立臺北護理健康大學總務處開發的一套完整的器材借用管理解決方案。該系統旨在簡化器材借用流程，提高資源利用效率，並為管理人員提供全面的監控和管理工具。

The NTUNHS Equipment Borrowing System is a comprehensive solution developed for the General Affairs Office of National Taipei University of Nursing and Health Sciences. The system aims to streamline the equipment borrowing process, improve resource utilization efficiency, and provide administrators with comprehensive monitoring and management tools.

## 系統架構 (System Architecture)

本系統採用前後端分離的架構：

- **前端**：使用 Next.js 框架開發的 React 應用程式
- **後端**：RESTful API 服務
- **資料庫**：關聯式資料庫（未在前端代碼中指定）

The system adopts a frontend-backend separation architecture:

- **Frontend**: React application developed with Next.js framework
- **Backend**: RESTful API service
- **Database**: Relational database (not specified in frontend code)

## 主要功能 (Key Features)

### 使用者管理 (User Management)
- 多角色支援：申請者、學術人員、系統管理員、大樓管理員
- 使用者認證與授權
- 角色基礎的權限控制

### 申請管理 (Request Management)
- 創建器材借用申請
- 追蹤申請狀態
- 審批流程管理

### 器材管理 (Equipment Management)
- 器材庫存管理
- 器材分配與追蹤
- 可用性狀態監控

### 大樓管理 (Building Management)
- 大樓資源管理
- 大樓特定器材分配
- 大樓管理員回應機制

### 通知系統 (Notification System)
- LINE 通知整合
- 電子郵件通知
- 自定義通知模板

### 系統管理 (System Administration)
- 系統設定管理
- 系統日誌監控
- 整合設定（LINE、SMTP）

## 技術堆疊 (Technology Stack)

### 前端 (Frontend)
- **框架**: Next.js (React)
- **樣式**: Tailwind CSS
- **UI 元件**: Shadcn UI
- **狀態管理**: React Hooks
- **路由**: Next.js App Router
- **API 通訊**: Fetch API

### 開發工具 (Development Tools)
- **語言**: TypeScript
- **程式碼格式化**: ESLint, Prettier
- **版本控制**: Git

## 安裝與設置 (Installation & Setup)

### 前置需求 (Prerequisites)
- Node.js 18.x 或更高版本
- npm 或 yarn 或 pnpm

### 環境變數 (Environment Variables)
創建一個 `.env.local` 文件並設置以下變數：

```
NEXT_PUBLIC_API_URL=https://your-api-url.com/api
```

### 安裝步驟 (Installation Steps)

1. 克隆儲存庫
   ```bash
   git clone https://github.com/your-org/equipment-borrowing-system.git
   cd equipment-borrowing-system
   ```

2. 安裝依賴
   ```bash
   npm install
   # 或
   yarn install
   # 或
   pnpm install
   ```

3. 啟動開發伺服器
   ```bash
   npm run dev
   # 或
   yarn dev
   # 或
   pnpm dev
   ```

4. 建置生產版本
   ```bash
   npm run build
   # 或
   yarn build
   # 或
   pnpm build
   ```

## API 文檔 (API Documentation)

系統使用以下 API 端點與後端通訊：

### 認證 API (Authentication API)
- `POST /api/auth/login` - 使用者登入
- `POST /api/auth/logout` - 使用者登出
- `GET /api/auth/user` - 獲取當前使用者資訊

### 申請 API (Request API)
- `GET /api/requests` - 獲取申請列表
- `GET /api/requests/{id}` - 獲取特定申請詳情
- `POST /api/requests` - 創建新申請
- `PUT /api/requests/{id}` - 更新申請狀態

### 器材 API (Equipment API)
- `GET /api/equipments` - 獲取器材列表
- `POST /api/equipments` - 新增器材
- `PUT /api/equipments/{id}` - 更新器材資訊
- `DELETE /api/equipments/{id}` - 刪除器材

### 大樓 API (Building API)
- `GET /api/buildings` - 獲取大樓列表
- `POST /api/buildings` - 新增大樓
- `PUT /api/buildings/{id}` - 更新大樓資訊
- `DELETE /api/buildings/{id}` - 刪除大樓

### 大樓回應 API (Building Response API)
- `GET /api/building-response/{token}` - 獲取大樓回應請求
- `POST /api/building-response/{token}` - 提交大樓回應

### 管理 API (Admin API)
- `GET /api/admin/users` - 獲取使用者列表
- `POST /api/admin/users` - 創建使用者
- `PUT /api/admin/users/{id}` - 更新使用者資訊
- `GET /api/admin/logs` - 獲取系統日誌
- `GET /api/admin/settings` - 獲取系統設定
- `PUT /api/admin/settings` - 更新系統設定
- `GET /api/admin/line-settings` - 獲取 LINE 設定
- `PUT /api/admin/line-settings` - 更新 LINE 設定
- `GET /api/admin/smtp-settings` - 獲取 SMTP 設定
- `PUT /api/admin/smtp-settings` - 更新 SMTP 設定

## 錯誤處理 (Error Handling)

系統使用統一的錯誤回應格式：

```json
{
    "detail": {
        "success": false,
        "error": {
            "code": "ERROR_CODE",
            "message": "錯誤訊息"
        }
    }
}
```

前端應用程式會從回應中提取 `message` 欄位並顯示給使用者。

## 使用者角色與權限 (User Roles & Permissions)

### 申請者 (Applicant)
- 創建器材借用申請
- 查看自己的申請
- 管理個人資料

### 學術人員 (Academic Staff)
- 審核申請
- 管理器材
- 管理大樓
- 查看申請統計

### 系統管理員 (System Admin)
- 管理使用者
- 配置系統設定
- 查看系統日誌
- 管理 LINE 和 SMTP 設定

### 大樓管理員 (Building Manager)
- 回應器材分配請求
- 管理大樓器材庫存

## 開發指南 (Development Guidelines)

### 程式碼風格 (Code Style)
- 使用 TypeScript 類型
- 遵循 React 函數組件模式
- 使用 Tailwind CSS 進行樣式設計
- 使用 Shadcn UI 組件

### 狀態管理 (State Management)
- 使用 React Hooks 進行本地狀態管理
- 使用 Context API 進行全局狀態管理（如主題）

### API 通訊 (API Communication)
- 使用集中式 API 函數
- 處理錯誤回應並顯示適當的錯誤訊息
- 實現載入狀態指示器

## 部署指南 (Deployment Guide)

### 生產環境建置 (Production Build)
```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

## 貢獻指南 (Contributing Guidelines)

1. Fork 儲存庫
2. 創建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request
