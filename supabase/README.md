# Supabase Schema Notes

這份文件用來描述作品審核與後台管理需要的欄位，方便後續串接後台。

## Tables

### public.works

核心欄位（已在 migration 建立）：

- `id` (uuid, pk)
- `title` (text)
- `author_name` (text)
- `description` (text)
- `image_url` (text, optional)
- `demo_url` (text, optional)
- `created_by` (uuid, auth.users)
- `created_at` (timestamptz)

審核欄位（202601190002_add_moderation）：

- `status` (text)  
  - `pending`：待審  
  - `approved`：通過  
  - `rejected`：退件
- `reviewed_by` (uuid, auth.users, optional)
- `reviewed_at` (timestamptz, optional)
- `review_note` (text, optional)

### public.votes

- `id` (uuid, pk)
- `work_id` (uuid, fk -> works.id)
- `user_id` (uuid, fk -> auth.users.id)
- `created_at` (timestamptz)
- unique(`work_id`, `user_id`)

### public.works_with_votes (view)

包含 `works` 所有欄位，並加上：

- `vote_count` (int)

> 注意：因為 view 會包含 `status`，前台通常只抓 `status = 'approved'` 的資料。

## RLS Policies (概要)

- works：只有 `approved` 作品對所有人可見
- works：作者可看自己作品（包含 pending / rejected）
- works：登入者可投稿
- votes：登入者可投票，只能刪自己的投票

## Backend 建議 API 功能

- listWorks(status?: pending|approved|rejected)
- updateWorkStatus(workId, status, reviewNote?)
- listPendingWorks()
- getWorkDetail(workId)
- deleteWork(workId)

## 審核流程建議

1. 投稿後狀態為 `pending`
2. 後台檢視作品內容與連結
3. 審核結果：
   - 通過：`status = approved`，填 `reviewed_by`、`reviewed_at`
   - 退件：`status = rejected`，填 `review_note`
