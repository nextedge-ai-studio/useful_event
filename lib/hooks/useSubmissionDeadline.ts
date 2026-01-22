
import { useState, useEffect } from "react";
import { isSubmissionEnded } from "../submission-config";

export function useSubmissionDeadline() {
    const [isEnded, setIsEnded] = useState(isSubmissionEnded());

    useEffect(() => {
        // 初始檢查
        setIsEnded(isSubmissionEnded());

        // 每秒檢查一次
        const interval = setInterval(() => {
            setIsEnded(isSubmissionEnded());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return isEnded;
}
