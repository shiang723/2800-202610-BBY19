import Navbar from "@/components/Navbar";
import Notification from "@/components/Notification";

export default function NotificationPage() {
    const now = new Date();
    return (
        <div>
            <Notification type="sunscreen" timeOfNotif={now} />
            <div id="notification-menu">
            </div>
            <Navbar />
        </div>
    );
};