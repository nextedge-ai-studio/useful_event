
// 投稿截止日期配置
// 格式: ISO 8601 (YYYY-MM-DDTHH:mm:ss)
// 例如: "2026-02-14T00:00:00"

// 你可以在這裡修改時間來進行測試
export const SUBMISSION_DEADLINE = "2026-02-14T00:00:00+08:00";
// export const SUBMISSION_DEADLINE = "2026-01-22T14:47:00+08:00";

// 檢查是否已過截止日期
export const isSubmissionEnded = (): boolean => {
    const deadline = new Date(SUBMISSION_DEADLINE);
    const now = new Date();

    // Debug log to help verify the time comparison
    // console.log(`[Submission Check] Now: ${now.toLocaleString()}, Deadline: ${deadline.toLocaleString()}, Ended: ${now >= deadline}`);

    return now >= deadline;
};
