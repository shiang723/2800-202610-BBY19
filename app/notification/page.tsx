'use client'
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useState } from "react";

const json = `[
        {
        "type": "sunscreen"
         "on": true,
         "startTime":"",
         "endTime":"",
         "interval": 2

        },
         {
        "type": "uv"
       "on": true,
       "startTime":"",
         "endTime":"",
         "interval": 1
       },
        {
        "type": "hydration"
       "on":true,
        "startTime":"",
         "endTime":"",
         "interval": 0.5
       },
         {
        "type": "message"
         "on": true}]`



// interface NotificationSetting {
//     type: "sunscreen" | "uv" | "hydration" | "message";
//     on: boolean;
//     startTime?: string;
//     endTime?: string;
//     interval?: number;
// }

const jsonData: NotificationSetting = JSON.parse(json);

export default function NotificationPage() {
    const now = new Date();
    const [sunscreenStartTime, setSunscreenStartTime] = useState((jsonData.sunscreenNotif.startTime));
    const [sunscreenInterval, setSunscreenInterval] = useState((jsonData.sunscreenNotif.interval));
    const [sunscreenEndTime, setSunscreenEndTime] = useState((jsonData.sunscreenNotif.endTime));
    const [sunscreenOn, setSunscreenOn] = useState(jsonData.sunscreenNotif.on);

    const [uvStartTime, setUVStartTime] = useState((jsonData.uvNotif.startTime));
    const [uvInterval, setUVInterval] = useState((jsonData.uvNotif.interval));
    const [uvEndTime, setUVEndTime] = useState((jsonData.uvNotif.endTime));
    const [uvOn, setUVOn] = useState(jsonData.uvNotif.on);


    const [hydrationStartTime, sethydrationStartTime] = useState((jsonData.hydrationNotif.startTime));
    const [hydrationInterval, setHydrationInterval] = useState((jsonData.hydrationNotif.interval));
    const [hydrationEndTime, setHydrationEndTime] = useState((jsonData.hydrationNotif.endTime));
    const [hydrationOn, setHydrationOn] = useState((jsonData.hydrationNotif.on));

    const [messageOn, setMessageOn] = useState(jsonData.messageNotif.on);

    function updateStartTime(newTime: string, type: string) {
        if (type === "sunscreen") {
            jsonData.sunscreenNotif.startTime = newTime;
            setSunscreenStartTime(newTime);
        } else if (type === "uv") {
            jsonData.uvNotif.startTime = newTime;
            setUVStartTime(newTime);
        } else if (type === "hydration") {
            jsonData.hydrationNotif.startTime = newTime;
            sethydrationStartTime(newTime);
        }
    }

    function updateEndTime(newTime: string, type: string) {
        if (type === "sunscreen") {
            jsonData.sunscreenNotif.endTime = newTime;
            setSunscreenEndTime(newTime);
        } else if (type === "uv") {
            jsonData.uvNotif.endTime = newTime;
            setUVEndTime(newTime);
        } else if (type === "hydration") {
            jsonData.hydrationNotif.endTime = newTime;
            setHydrationEndTime(newTime);
        }
    }

    function updateInterval(newInterval: number, type: string) {
        if (type === "sunscreen") {
            jsonData.sunscreenNotif.interval = newInterval;
            setSunscreenInterval(newInterval);
        } else if (type === "uv") {
            jsonData.uvNotif.interval = newInterval;
            setUVInterval(newInterval);
        } else if (type === "hydration") {
            jsonData.hydrationNotif.interval = newInterval;
            setHydrationInterval(newInterval);
        }
    }

    function updateSettingToggle(newStatus: boolean, type: string) {
        if (type === "sunscreen") {
            jsonData.sunscreenNotif.on = newStatus;
            setSunscreenOn(newStatus);
        } else if (type === "uv") {
            jsonData.uvNotif.on = newStatus;
            setUVOn(newStatus);
        } else if (type === "hydration") {
            jsonData.hydrationNotif.on = newStatus;
            setHydrationOn(newStatus);
        } else if (type === "message") {
            jsonData.messageNotif.on = newStatus;
            setMessageOn(newStatus);
        }
    }
    return (
        <div>
            <div id="notification-menu">
                <div>
                    <label htmlFor="sunscreenNotif">Sunscreen notification</label>
                    <input type="checkbox" id="sunscreenNotif"
                        checked={sunscreenOn}
                        onChange={(e) => updateSettingToggle(e.target.checked, "sunscreen")} />
                    <div>
                        <label htmlFor="startTimeSun">Select Start Time:</label>
                        <input type="datetime-local" id="startTimeSun" min={String(now)}
                            value={sunscreenStartTime}
                            onChange={(e) => updateStartTime(e.target.value, "sunscreen")} />
                        <label htmlFor="endTimeSun">Select End Time:</label>
                        <input type="datetime-local" id="endTimeSun" min={String(now)}
                            value={sunscreenEndTime}
                            onChange={(e) => updateEndTime(e.target.value, "sunscreen")} />
                        <label htmlFor="hourGapSun">Choose the hourly interval (recommended every 2 hours):</label>
                        <input type="number" id="hourGapSun" value={sunscreenInterval} max={24} min={1} step={1}
                            onChange={(e) => updateInterval(Number(e.target.value), "sunscreen")} />
                    </div>
                </div>
                <div>
                    <label htmlFor="uvNotif">UV notification</label>
                    <input type="checkbox" id="uvNotif"
                        checked={uvOn}
                        onChange={(e) => updateSettingToggle(e.target.checked, "uv")}
                    />
                    <div>
                        <label htmlFor="startTimeUV">Select Start Time:</label>
                        <input type="datetime-local" id="startTimeUV" min={String(now)}
                            value={uvStartTime}
                            onChange={(e) => updateStartTime(e.target.value, "uv")} />
                        <label htmlFor="endTimeUV">Select End Time:</label>
                        <input type="datetime-local" id="endTimeUV" min={String(now)}
                            value={uvEndTime}
                            onChange={(e) => updateEndTime(e.target.value, "uv")} />
                        <label htmlFor="hourGapUV">Choose the hourly interval between each notification:</label>
                        <input type="number" id="hourGapUV" max={24} min={1} step={1}
                            value={uvInterval}
                            onChange={(e) => updateInterval(Number(e.target.value), "uv")} />
                    </div>
                </div>
                <div>
                    <label htmlFor="hydrationNotif">Hyrdration notification</label>
                    <input type="checkbox" id="hydrationNotif"
                        checked={hydrationOn}
                        onChange={(e) => updateSettingToggle(e.target.checked, "hydration")} />
                    <div>
                        <label htmlFor="startTimeH">Select Start Time:</label>
                        <input type="datetime-local" id="startTimeH" min={String(now)}
                            value={hydrationStartTime}
                            onChange={(e) => updateStartTime(e.target.value, "hydration")} />
                        <label htmlFor="endTimeH">Select End Time:</label>
                        <input type="datetime-local" id="endTimeH" min={String(now)}
                            value={hydrationEndTime}
                            onChange={(e) => updateEndTime(e.target.value, "hydration")} />
                        <label htmlFor="timeGap">Choose the time interval between notification (hours):</label>
                        <input type="number" id="timeGap" max={24} min={0.5} step={0.5}
                            value={hydrationInterval}
                            onChange={(e) => updateInterval(Number(e.target.value), "hydration")} />
                    </div>
                </div>
                <div>
                    <label htmlFor="messageNotif">Message notification</label>
                    <input type="checkbox" id="messageNotif"
                        checked={messageOn}
                        onChange={(e) => updateSettingToggle(e.target.checked, "message")} />
                </div>
                <div>
                    <Link href="#"><h2>Notification History</h2></Link>
                </div>
            </div >
            <Navbar />
        </div >
    );
};