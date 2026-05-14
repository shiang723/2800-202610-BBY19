'use client'
import Navbar from "@/components/Navbar";
import Notification from "@/components/Notification";
import Link from "next/link";
import { useState } from "react";

const json = `[
        {
        "type": "sunscreen",
         "on": true,
         "startTime":"",
         "endTime":"",
         "interval": 2,
         "nextNotifTime": ""
        },
         {
        "type": "uv",
       "on": true,
       "startTime":"",
         "endTime":"",
         "interval": 1
       },
        {
        "type": "hydration",
       "on":true,
        "startTime":"",
         "endTime":"",
         "interval": 0.5
       },
         {
        "type": "message",
         "on": true}]`



interface NotificationSetting {
    type: "sunscreen" | "uv" | "hydration" | "message";
    on: boolean;
    startTime?: string;
    endTime?: string;
    interval?: number;
    nextNotifTime?: Date
}

const jsonData: NotificationSetting[] = JSON.parse(json);

export default function NotificationPage() {
    const now = new Date();
    /**
     * How can I combine or simplify the 13 useStates to make the code more readable
     * Adapted code from Gemini 3 fast
     * https://gemini.google.com/app
     */
    const [settings, setSettings] = useState<NotificationSetting[]>(jsonData);

    function updateSetting(type: NotificationSetting["type"], field: keyof NotificationSetting, value: string | number | boolean) {
        setSettings((currentSettings) => {
            return currentSettings.map((item) => {
                if (item.type !== type) return item;
                const updatedSetting = { ...item, [field]: value };
                if (updatedSetting.startTime && updatedSetting.endTime && updatedSetting.interval) {
                    const startDate = new Date(updatedSetting.startTime);
                    const endDate = new Date(updatedSetting.endTime);

                    const nextDate = new Date(startDate.getTime());
                    const hoursToMilliseconds = updatedSetting.interval * 60 * 60 * 1000;
                    nextDate.setTime(nextDate.getTime() + hoursToMilliseconds);

                    if (nextDate <= endDate) {
                        updatedSetting.nextNotifTime = nextDate;
                    }
                }
                return updatedSetting;
            })
        })
    }

    function getNotif(type: NotificationSetting["type"]): NotificationSetting {
        return settings.find(function (item) {
            return item.type === type;
        }) || { type, on: false };
    };

    const sunscreen = getNotif("sunscreen");
    const uv = getNotif("uv");
    const hydration = getNotif("hydration");
    const message = getNotif("message");
    /*End of adapted code. */

    return (
        <div>{(sunscreen.nextNotifTime && sunscreen.on) && (
            <Notification type="sunscreen" timeOfNotif={sunscreen.nextNotifTime} />
        )}
            {(uv.nextNotifTime && uv.on) && (
                <Notification type="uv" uvIndex={3} timeOfNotif={uv.nextNotifTime} />
            )}
            {(hydration.nextNotifTime && hydration.on) && (
                <Notification type="hydration" timeOfNotif={uv.nextNotifTime} />
            )}
            <div id="notification-menu">
                <div>
                    <label htmlFor="sunscreenNotif">Sunscreen notification</label>
                    <input type="checkbox" id="sunscreenNotif"
                        checked={sunscreen.on}
                        onChange={(e) => updateSetting("sunscreen", "on", e.target.checked)} />
                    <div>
                        <label htmlFor="startTimeSun">Select Start Time:</label>
                        <input type="datetime-local" id="startTimeSun" min={String(now)}
                            value={sunscreen.startTime}
                            onChange={(e) => updateSetting("sunscreen", "startTime", e.target.value)} />
                        <label htmlFor="endTimeSun">Select End Time:</label>
                        <input type="datetime-local" id="endTimeSun" min={String(now)}
                            value={sunscreen.endTime}
                            onChange={(e) => updateSetting("sunscreen", "endTime", e.target.value)} />
                        <label htmlFor="hourGapSun">Choose the hourly interval (recommended every 2 hours):</label>
                        <input type="number" id="hourGapSun" value={sunscreen.interval} max={24} min={1} step={1}
                            onChange={(e) => updateSetting("sunscreen", "interval", Number(e.target.value))} />
                    </div>
                </div>
                <div>
                    <label htmlFor="uvNotif">UV notification</label>
                    <input type="checkbox" id="uvNotif"
                        checked={uv.on}
                        onChange={(e) => updateSetting("uv", "on", e.target.checked)}
                    />
                    <div>
                        <label htmlFor="startTimeUV">Select Start Time:</label>
                        <input type="datetime-local" id="startTimeUV" min={String(now)}
                            value={uv.startTime}
                            onChange={(e) => updateSetting("uv", "startTime", e.target.value)} />
                        <label htmlFor="endTimeUV">Select End Time:</label>
                        <input type="datetime-local" id="endTimeUV" min={String(now)}
                            value={uv.endTime}
                            onChange={(e) => updateSetting("uv", "endTime", e.target.value)} />
                        <label htmlFor="hourGapUV">Choose the hourly interval between each notification:</label>
                        <input type="number" id="hourGapUV" max={24} min={1} step={1}
                            value={uv.interval}
                            onChange={(e) => updateSetting("uv", "interval", Number(e.target.value))} />
                    </div>
                </div>
                <div>
                    <label htmlFor="hydrationNotif">Hyrdration notification</label>
                    <input type="checkbox" id="hydrationNotif"
                        checked={hydration.on}
                        onChange={(e) => updateSetting("hydration", "on", e.target.checked)} />
                    <div>
                        <label htmlFor="startTimeH">Select Start Time:</label>
                        <input type="datetime-local" id="startTimeH" min={String(now)}
                            value={hydration.startTime}
                            onChange={(e) => updateSetting("hydration", "startTime", e.target.value,)} />
                        <label htmlFor="endTimeH">Select End Time:</label>
                        <input type="datetime-local" id="endTimeH" min={String(now)}
                            value={hydration.endTime}
                            onChange={(e) => updateSetting("hydration", "endTime", e.target.value,)} />
                        <label htmlFor="timeGap">Choose the time interval between notification (hours):</label>
                        <input type="number" id="timeGap" max={24} min={0.5} step={0.5}
                            value={hydration.interval}
                            onChange={(e) => updateSetting("hydration", "interval", Number(e.target.value))} />
                    </div>
                </div>
                <div>
                    <label htmlFor="messageNotif">Message notification</label>
                    <input type="checkbox" id="messageNotif"
                        checked={message.on}
                        onChange={(e) => updateSetting("message", "on", e.target.checked)} />
                </div>
                <div>
                    <Link href="#"><h2>Notification History</h2></Link>
                </div>
            </div >
            <Navbar />
        </div >
    );
};