'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Notification, { type NotificationType } from "./Notification";
import { createClientForClientComponent } from "@/lib/supabase/client";

/**
 * Refactored the code in this file to be more readable and fix type errors using GPT-5.4 mini extension on VSCode
 */
const NOTIFICATION_TYPES = ["sunscreen", "uv", "hydration"] as const satisfies readonly NotificationType[];

// Format datetime to match supabase format
const formatDateTimeLocal = (date: Date) => {
    const pad = (num: number) => String(num).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// Format datatime from supabase to match javascript Date format
const formatDateTimeData = (value: string | null | undefined) => {
    if (!value) return "";
    return value.slice(0, 16).replace(" ", "T");
};

interface NotificationSetting {
    sunscreen_on: boolean;
    sunscreen_start_time: string;
    sunscreen_end_time: string;
    sunscreen_interval: number;
    sunscreen_next_time: string | null;
    uv_on: boolean;
    uv_start_time: string;
    uv_end_time: string;
    uv_interval: number;
    uv_next_time: string | null;
    hydration_on: boolean;
    hydration_start_time: string;
    hydration_end_time: string;
    hydration_interval: number;
    hydration_next_time: string | null;
    message_on: boolean;
    last_updated?: string;
}

interface NotificationInfo {
    type: NotificationType;
    popUpTime: Date;
    interval: number;
    endTime: string;
    uvIndex?: number;
    locationUser?: { longitude: number; latitude: number };
}

export default function GlobalNotificationHandler({ userID }: { userID: string }) {
    const supabase = useMemo(() => createClientForClientComponent(), []);
    const [notificationQueue, setNotificationQueue] = useState<NotificationInfo[]>([]);
    const [timeLastChanged, setTimeLastChanged] = useState<string | null>(null);
    const notificationTimers = useRef<Partial<Record<NotificationType, ReturnType<typeof setTimeout>>>>({});

    // Calculate the next time for the notification to pop up from the saved start time and interval.
    const calculateNextValidTime = useCallback((startTime: string, endTime: string, interval: number): string => {
        const now = new Date();
        const startDate = new Date(startTime.replace(" ", "T"));
        const endDate = new Date(endTime.replace(" ", "T"));

        const intervalMilli = interval * 60 * 60 * 1000;
        let nextDate = new Date(startDate.getTime() + intervalMilli);

        if (nextDate <= now) {
            while (nextDate <= now && nextDate < endDate) {
                nextDate = new Date(nextDate.getTime() + intervalMilli);
            }
        }
        return formatDateTimeLocal(nextDate);
    }, []);


    // Cancel any pending timeout for a notification type before rescheduling it.
    // Added by GPT-5.4 mini extension on VSCode to fix bug where notif pop up right away.
    const clearNotificationTimer = useCallback((type: NotificationType) => {
        const existingTimer = notificationTimers.current[type];
        if (existingTimer) {
            clearTimeout(existingTimer);
            notificationTimers.current[type] = undefined;
        }
    }, []);

    // Add a notification to the queue only once.
    const queueNotification = useCallback((type: NotificationType, popUpTime: Date, interval: number, endTime: string) => {
        setNotificationQueue((currentQueue) => {
            if (currentQueue.some((item) => item.type === type)) return currentQueue;
            return [...currentQueue, { type, popUpTime, interval, endTime }];
        });
    }, []);

    // If the notification is still in the future, wait until its exact time before showing it.
    // Added by GPT-5.4 mini extension on VSCode to fix bug where notif pop up right away.
    const scheduleNotification = useCallback((type: NotificationType, nextDate: Date, interval: number, endTime: string) => {
        clearNotificationTimer(type);

        const delay = nextDate.getTime() - Date.now();
        if (delay <= 0) {
            queueNotification(type, nextDate, interval, endTime);
            return;
        }

        notificationTimers.current[type] = setTimeout(() => {
            notificationTimers.current[type] = undefined;
            queueNotification(type, nextDate, interval, endTime);
        }, delay);
    }, [clearNotificationTimer, queueNotification]);

    useEffect(() => {
        if (!userID) return;

        // Read and sync local data with database values.
        async function initAndSyncQueue() {
            const { data: dbData } = await supabase.from('notificationSetting').select('*').eq('user_id', userID).maybeSingle();
            if (!dbData) return;

            const lastUpdated = dbData['last_updated'] ?? null;
            const isMenuUpdated = lastUpdated !== timeLastChanged;

            const fullData = { ...dbData };
            let updateNeeded = false;
            const now = new Date();

            NOTIFICATION_TYPES.forEach((type) => {
                const on = dbData[`${type}_on` as keyof NotificationSetting];
                const startTime = formatDateTimeData(dbData[`${type}_start_time` as keyof NotificationSetting] as string);
                const endTime = formatDateTimeData(dbData[`${type}_end_time` as keyof NotificationSetting] as string);
                const interval = dbData[`${type}_interval` as keyof NotificationSetting] ? Number(dbData[`${type}_interval` as keyof NotificationSetting]) : 2;
                let nextTime = formatDateTimeData(dbData[`${type}_next_time` as keyof NotificationSetting] as string | null);

                clearNotificationTimer(type);

                if (!on || !endTime || !startTime) return;

                const isWrongFormat = !nextTime || nextTime.includes("Z") || nextTime.includes(".");

                if (isMenuUpdated || isWrongFormat || !nextTime) {
                    nextTime = calculateNextValidTime(startTime, endTime, interval);
                    fullData[`${type}_next_time`] = nextTime;
                    updateNeeded = true;
                }

                const nextDate = new Date(nextTime.replace(" ", "T"));
                const endDate = new Date(endTime.replace(" ", "T"));

                if (now >= nextDate && now <= endDate) {
                    queueNotification(type, nextDate, interval, endTime);
                    return;
                }

                if (now < nextDate && nextDate <= endDate) {
                    scheduleNotification(type, nextDate, interval, endTime);
                }
            });

            if (lastUpdated) {
                setTimeLastChanged(lastUpdated);
            }

            if (updateNeeded) {
                await supabase.from('notificationSetting').upsert(fullData, { onConflict: 'user_id' });
            }
        }
        initAndSyncQueue();

        const timer = setInterval(initAndSyncQueue, 30000);
        return () => {
            clearInterval(timer);
            NOTIFICATION_TYPES.forEach((type) => clearNotificationTimer(type));
        };

    }, [userID, timeLastChanged, supabase, clearNotificationTimer, scheduleNotification, calculateNextValidTime, queueNotification]);

    // handle removing closed notifs from queue and calculations for the next notif pop up time after user closes it.
    async function handleCloseNotif(type: NotificationType) {
        const targetedNotif = notificationQueue.find(item => item.type === type);

        setNotificationQueue((currentQueue) => currentQueue.filter((item) => item.type !== type));
        clearNotificationTimer(type);
        if (!userID || !targetedNotif) return;

        const { data: dbData } = await supabase.from('notificationSetting').select('*').eq('user_id', userID).maybeSingle();
        if (!dbData) return;

        const now = new Date();
        const nextDate = new Date(now.getTime() + targetedNotif.interval * 60 * 60 * 1000);

        const fullSettingsData = { ...dbData };

        const endTime = formatDateTimeData(dbData[`${type}_end_time` as keyof NotificationSetting] as string);
        const endDate = endTime ? new Date(endTime.replace(" ", "T")) : null;

        if (endDate && nextDate.getTime() > endDate.getTime()) {
            fullSettingsData[`${type}_next_time`] = null;
        } else {
            const nextTimeFormatted = formatDateTimeLocal(nextDate);
            fullSettingsData[`${type}_next_time`] = nextTimeFormatted;
            scheduleNotification(type, nextDate, targetedNotif.interval, endTime || "");
        }

        await supabase.from('notificationSetting').upsert(fullSettingsData, { onConflict: 'user_id' });
    }

    if (notificationQueue.length === 0) return null;
    return (<>
        {notificationQueue.map((notif) => (
            <Notification
                key={notif.type}
                type={notif.type}
                uvIndex={notif.uvIndex || 0}
                timeOfNotif={notif.popUpTime}
                onClose={() => handleCloseNotif(notif.type)} />
        ))}
    </>
    );
}