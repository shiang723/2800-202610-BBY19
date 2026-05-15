'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Notification, { type NotificationType } from "./Notification";
import { createClientForClientComponent } from "@/lib/supabase/client";

/**
 * Refactor the code in this file to be more readable and fix type errors using GPT-5.4 mini extension on VSCode
 */
const NOTIFICATION_TYPES = ["sunscreen", "uv", "hydration"] as const satisfies readonly NotificationType[];

// Keep date formatting in one place so Supabase writes and local comparisons use the same shape.
const formatDateTimeLocal = (date: Date) => {
    const pad = (num: number) => String(num).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// Normalize values coming back from Supabase into the format used by datetime-local inputs.
const normalizeDateTime = (value: string | null | undefined) => {
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

    // Calculate the next valid notification slot from the saved start time and interval.
    const calculateNextValidTime = useCallback((startTime: string, endTime: string, interval: number): string => {
        const now = new Date();
        const startDate = new Date(startTime.replace(" ", "T"));
        const endDate = new Date(endTime.replace(" ", "T"));

        const intervalMs = interval * 60 * 60 * 1000;
        let nextDate = new Date(startDate.getTime() + intervalMs);

        if (nextDate <= now) {
            while (nextDate <= now && nextDate < endDate) {
                nextDate = new Date(nextDate.getTime() + intervalMs);
            }
        }

        return formatDateTimeLocal(nextDate);
    }, []);

    // Cancel any pending timeout for a notification type before rescheduling it.
    const clearNotificationTimer = useCallback((type: NotificationType) => {
        const existingTimer = notificationTimers.current[type];
        if (existingTimer) {
            clearTimeout(existingTimer);
            notificationTimers.current[type] = undefined;
        }
    }, []);

    // Add a notification to the visible queue only once.
    const queueNotification = useCallback((type: NotificationType, popUpTime: Date, interval: number, endTime: string) => {
        setNotificationQueue((currentQueue) => {
            if (currentQueue.some((item) => item.type === type)) return currentQueue;
            return [...currentQueue, { type, popUpTime, interval, endTime }];
        });
    }, []);

    // If the notification is still in the future, wait until its exact time before showing it.
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

        async function syncDatabaseAndQueue() {
            // Read the latest saved settings first so the handler always reacts to the current database state.
            const { data: dbData } = await supabase.from('notificationSetting').select('*').eq('user_id', userID).maybeSingle();
            if (!dbData) return;

            const lastUpdated = dbData['last_updated'] ?? null;
            const isMenuUpdate = lastUpdated !== timeLastChanged;

            // Clone the row so any recomputed next_time values can be written back without mutating the original result.
            const fullData = { ...dbData };
            let updateNeeded = false;
            const now = new Date();

            NOTIFICATION_TYPES.forEach((type) => {
                const on = dbData[`${type}_on` as keyof NotificationSetting];
                const startTime = normalizeDateTime(dbData[`${type}_start_time` as keyof NotificationSetting] as string);
                const endTime = normalizeDateTime(dbData[`${type}_end_time` as keyof NotificationSetting] as string);
                const interval = dbData[`${type}_interval` as keyof NotificationSetting] ? Number(dbData[`${type}_interval` as keyof NotificationSetting]) : 2;
                let nextTime = normalizeDateTime(dbData[`${type}_next_time` as keyof NotificationSetting] as string | null);

                // Turn off any old timer for this type before deciding whether it needs to be rescheduled.
                clearNotificationTimer(type);

                if (!on || !endTime || !startTime) return;

                const isCorrupted = !nextTime || nextTime.includes("Z") || nextTime.includes(".");

                // If the settings changed or the stored next_time looks invalid, rebuild it from the saved window.
                if (isMenuUpdate || isCorrupted || !nextTime) {
                    nextTime = calculateNextValidTime(startTime, endTime, interval);
                    fullData[`${type}_next_time`] = nextTime;
                    updateNeeded = true;
                }

                const nextDate = new Date(nextTime.replace(" ", "T"));
                const endDate = new Date(endTime.replace(" ", "T"));

                // Fire immediately when the scheduled time has already arrived, otherwise set a timeout for it.
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
                // Persist any repaired next_time values so the next check uses the fixed schedule.
                await supabase.from('notificationSetting').upsert(fullData, { onConflict: 'user_id' });
            }
        }

        // Poll as a fallback so settings changes and missed timers still get corrected.
        syncDatabaseAndQueue();

        const timer = setInterval(syncDatabaseAndQueue, 30000);
        return () => {
            // Clean up both the polling loop and any pending popup timers on unmount.
            clearInterval(timer);
            NOTIFICATION_TYPES.forEach((type) => clearNotificationTimer(type));
        };

    }, [userID, timeLastChanged, supabase, clearNotificationTimer, scheduleNotification, calculateNextValidTime, queueNotification]);

    async function handleCloseNotif(type: string) {
        // Remove the current popup from the screen before calculating the next occurrence.
        const targetedNotif = notificationQueue.find(item => item.type === type);

        setNotificationQueue((currentQueue) => currentQueue.filter((item) => item.type !== type));
        if (!userID || !targetedNotif) return;

        // Re-read the row so the upsert keeps every other setting intact.
        const { data: dbData } = await supabase.from('notificationSetting').select('*').eq('user_id', userID).maybeSingle();
        if (!dbData) return;

        // After closing a notification, schedule the next one from the current moment.
        const now = new Date();
        const nextDate = new Date(now.getTime() + targetedNotif.interval * 60 * 60 * 1000);

        const nextTimeStr = formatDateTimeLocal(nextDate);

        const fullPayloadUpdate = { ...dbData };
        fullPayloadUpdate[`${type}_next_time`] = nextTimeStr;

        await supabase.from('notificationSetting').upsert(fullPayloadUpdate, { onConflict: 'user_id' });
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