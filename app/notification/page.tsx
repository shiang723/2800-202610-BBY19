'use client'
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClientForClientComponent } from "@/lib/supabase/client";

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
}

export default function NotificationPage() {
    const supabase = createClientForClientComponent();
    const now = new Date();
    const nowString = now.toISOString().slice(0, 16);
    /**
     * How can I combine or simplify the 13 useStates to make the code more readable
     * Adapted code from Gemini 3 fast
     * https://gemini.google.com/app
     */
    const [settings, setSettings] = useState<NotificationSetting | null>({
        sunscreen_on: true,
        sunscreen_start_time: nowString,
        sunscreen_end_time: nowString,
        sunscreen_interval: 2,
        sunscreen_next_time: null,
        uv_on: true,
        uv_start_time: nowString,
        uv_end_time: nowString,
        uv_interval: 2,
        uv_next_time: null,
        hydration_on: true,
        hydration_start_time: nowString,
        hydration_end_time: nowString,
        hydration_interval: 0.5,
        hydration_next_time: null,
        message_on: true
    });
    /**End of adapted code */
    useEffect(() => {
        async function loadData() {
            const { data: { user } } = await supabase.auth.getUser()
            const userID = user?.id;
            if (!user) return;
            const { data } = await supabase.from('notificationSetting').select('*').eq('user_id', userID).maybeSingle();
            /**
             * How to map database values to local typescript values
             * Adapted from Gemini 3 fast
             * https://gemini.google.com/app
             */
            const mappedSettings: NotificationSetting = {
                sunscreen_on: data ? data['sunscreen_on'] : true,
                sunscreen_start_time: data?.['sunscreen_start_time'] ? data['sunscreen_start_time'].slice(0, 16) : nowString,
                sunscreen_end_time: data?.['sunscreen_end_time'] ? data['sunscreen_end_time'].slice(0, 16) : nowString,
                sunscreen_interval: data ? Number(data['sunscreen_interval']) : 2,
                sunscreen_next_time: data?.['sunscreen_next_time'] ? data['sunscreen_next_time'].slice(0, 16) : nowString,
                uv_on: data ? data['uv_on'] : true,
                uv_start_time: data?.['uv_start_time'] ? data['uv_start_time'].slice(0, 16) : nowString,
                uv_end_time: data?.['uv_end_time'] ? data['uv_end_time'].slice(0, 16) : nowString,
                uv_interval: data ? Number(data['uv_interval']) : 2,
                uv_next_time: data?.['uv_next_time'] ? data['uv_next_time'].slice(0, 16) : nowString,
                hydration_on: data ? data['hydration_on'] : true,
                hydration_start_time: data?.['hydration_start_time'] ? data['hydration_start_time'].slice(0, 16) : nowString,
                hydration_end_time: data?.['hydration_end_time'] ? data['hydration_end_time'].slice(0, 16) : nowString,
                hydration_interval: data ? Number(data['hydration_interval']) : 0.5,
                hydration_next_time: data?.['hydration_next_time'] ? data['hydration_next_time'].slice(0, 16) : nowString,
                message_on: data ? data['message_on'] : true
            };
            setSettings(mappedSettings)
            /**End of adapted code */
        }
        loadData();
    }, [])

    async function updateSetting(field: keyof NotificationSetting, value: string | number | boolean) {
        if (!settings) return;
        const updatedData = { ...settings, [field]: value };

        if (field.toString().startsWith("hydration")) {
            const startDate = new Date(updatedData.hydration_start_time as string);
            const endDate = new Date(updatedData.hydration_end_time as string);
            const interval = Number(updatedData.hydration_interval);
            const nextDate = new Date(startDate.getTime() + interval * 60 * 60 * 1000);
            if (nextDate <= endDate) {
                const pad = (num: number) => String(num).padStart(2, '0');
                updatedData.sunscreen_next_time = `${nextDate.getFullYear()}-${pad(nextDate.getMonth() + 1)}-${pad(nextDate.getDate())}T${pad(nextDate.getHours())}:${pad(nextDate.getMinutes())}`;
            } else {
                updatedData.hydration_next_time = null;
            }
        } if (field.toString().startsWith("sunscreen")) {
            const startDate = new Date(updatedData.sunscreen_start_time as string);
            const endDate = new Date(updatedData.sunscreen_end_time as string);
            const interval = Number(updatedData.sunscreen_interval);
            const nextDate = new Date(startDate.getTime() + interval * 60 * 60 * 1000);
            if (nextDate <= endDate) {
                /**
                * Fix bug with interval adding 8 extra hours
                 * Adapted from Gemini 3 fast
                * https://gemini.google.com/app
                */
                const pad = (num: number) => String(num).padStart(2, '0');
                updatedData.sunscreen_next_time = `${nextDate.getFullYear()}-${pad(nextDate.getMonth() + 1)}-${pad(nextDate.getDate())}T${pad(nextDate.getHours())}:${pad(nextDate.getMinutes())}`;
            } else {
                updatedData.sunscreen_next_time = null;
            }
        } if (field.toString().startsWith("uv")) {
            const startDate = new Date(updatedData.uv_start_time as string);
            const endDate = new Date(updatedData.uv_end_time as string);
            const interval = Number(updatedData.uv_interval);
            const nextDate = new Date(startDate.getTime() + interval * 60 * 60 * 1000);
            if (nextDate <= endDate) {
                const pad = (num: number) => String(num).padStart(2, '0');
                updatedData.sunscreen_next_time = `${nextDate.getFullYear()}-${pad(nextDate.getMonth() + 1)}-${pad(nextDate.getDate())}T${pad(nextDate.getHours())}:${pad(nextDate.getMinutes())}`;
            } else {
                updatedData.uv_next_time = null;
            }
        }

        setSettings(updatedData);
        const { data: { user } } = await supabase.auth.getUser()
        const userID = user?.id;

        // Fix supabase POST bug with timedateptz recieving ""
        // Adapted from Gemini 3 fast
        // https://gemini.google.com/app
        if (user && userID) {
            //  Dispatch clean request down to Supabase table
            await supabase.from("notificationSetting")
                .upsert(updatedData, { onConflict: "user_id" });
        }
        //End of Adapted code
    }
    return (
        <div className="bg-gray-300">
            <h1 className="text-2xl text-center m-10 font-bold">Notification Settings</h1>
            <div id="notification-menu" className="flex flex-col">
                <div className="p-5 ml-10 mr-10 mb-0 rounded-t-2xl bg-gray-100 shadow-sm">
                    <label htmlFor="sunscreenNotif" className="text-lg">Enable sunscreen notification</label>
                    <input type="checkbox" id="sunscreenNotif"
                        checked={settings?.sunscreen_on}
                        onChange={(e) => updateSetting('sunscreen_on', e.target.checked)}
                        className="w-4 h-4 ml-2" />
                    <div className="flex flex-col gap-2">
                        <label htmlFor="start_timeSun">Select Start Time:</label>
                        <input type="datetime-local" id="start_timeSun"
                            value={settings?.sunscreen_start_time}
                            onChange={(e) => updateSetting('sunscreen_start_time', e.target.value)}
                            className="border-solid border-gray-400 border-1 rounded-lg p-1 max-w-60" />
                        <label htmlFor="end_timeSun">Select End Time:</label>
                        <input type="datetime-local" id="end_timeSun"
                            value={settings?.sunscreen_end_time}
                            onChange={(e) => updateSetting("sunscreen_end_time", e.target.value)}
                            className="border-solid border-gray-400 border-1 rounded-lg p-1 max-w-60" />
                        <label htmlFor="hourGapSun">Choose the hourly interval (recommended every 2 hours):</label>
                        <input type="number" id="hourGapSun" value={settings?.sunscreen_interval} max={24} min={1} step={1}
                            onChange={(e) => updateSetting("sunscreen_interval", Number(e.target.value))}
                            className="border-solid border-gray-400 border-1 rounded-lg p-1 max-w-20" />
                    </div>
                </div>
                <div className="p-5 ml-10 mr-10 mb-0 bg-gray-100 shadow-sm border-bs border-gray-400">
                    <label htmlFor="uvNotif" className="text-lg">Enable UV notification</label>
                    <input type="checkbox" id="uvNotif"
                        checked={settings?.uv_on}
                        onChange={(e) => updateSetting("uv_on", e.target.checked)}
                        className="w-4 h-4 ml-2"
                    />
                    <div className="flex flex-col  gap-2">
                        <label htmlFor="start_timeUV">Select Start Time:</label>
                        <input type="datetime-local" id="start_timeUV"
                            value={settings?.uv_start_time}
                            onChange={(e) => updateSetting("uv_start_time", e.target.value)}
                            className="border-solid border-gray-400 border-1 rounded-lg p-1 max-w-60" />
                        <label htmlFor="end_timeUV">Select End Time:</label>
                        <input type="datetime-local" id="end_timeUV"
                            value={settings?.uv_end_time}
                            onChange={(e) => updateSetting("uv_end_time", e.target.value)}
                            className="border-solid border-gray-400 border-1 rounded-lg p-1 max-w-60"
                        />
                        <label htmlFor="hourGapUV">Choose the hourly interval between each notification:</label>
                        <input type="number" id="hourGapUV" max={24} min={1} step={1}
                            value={settings?.uv_interval}
                            onChange={(e) => updateSetting("uv_interval", Number(e.target.value))}
                            className="border-solid border-gray-400 border-1 rounded-lg p-1 max-w-20" />
                    </div>
                </div>
                <div className="p-5 ml-10 mr-10 mb-0 bg-gray-100 shadow-sm border-bs border-gray-400">
                    <label htmlFor="hydrationNotif" className="text-lg">Enable hydration notification</label>
                    <input type="checkbox" id="hydrationNotif"
                        checked={settings?.hydration_on}
                        onChange={(e) => updateSetting("hydration_on", e.target.checked)}
                        className="w-4 h-4 ml-2" />
                    <div className="flex flex-col  gap-2">
                        <label htmlFor="start_timeH">Select Start Time:</label>
                        <input type="datetime-local" id="start_timeH"
                            value={settings?.hydration_start_time}
                            onChange={(e) => updateSetting("hydration_start_time", e.target.value)}
                            className="border-solid border-gray-400 border-1 rounded-lg p-1 max-w-60" />
                        <label htmlFor="end_timeH">Select End Time:</label>
                        <input type="datetime-local" id="end_timeH"
                            value={settings?.hydration_end_time}
                            onChange={(e) => updateSetting("hydration_end_time", e.target.value)}
                            className="border-solid border-gray-400 border-1 rounded-lg p-1 max-w-60" />
                        <label htmlFor="timeGap">Choose the time interval between notification (hours):</label>
                        <input type="number" id="timeGap" max={24} min={0.5} step={0.5}
                            value={settings?.hydration_interval}
                            onChange={(e) => updateSetting("hydration_interval", Number(e.target.value))}
                            className="border-solid border-gray-400 border-1 rounded-lg p-1 max-w-20" />
                    </div>
                </div>
                <div className="p-5 ml-10 mr-10 mb-0 bg-gray-100 shadow-sm border-bs border-gray-400 rounded-b-2xl">
                    <label htmlFor="messageNotif" className="text-lg">Enable message notification</label>
                    <input type="checkbox" id="messageNotif"
                        checked={settings?.message_on}
                        onChange={(e) => updateSetting("message_on", e.target.checked)}
                        className="w-4 h-4 ml-2" />
                </div>
                <div className="p-5 ml-10 mr-10 mb-10 mt-5 rounded-2xl bg-gray-100 shadow-sm border-bs border-gray-400">
                    <Link href="#"><h2 className="text-lg">Notification History</h2></Link>
                </div>
            </div >
            <Navbar />
        </div >
    );
};