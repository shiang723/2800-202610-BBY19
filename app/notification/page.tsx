import Navbar from "@/components/Navbar";
import Notification from "@/components/Notification";

export default function NotificationPage() {
    return (
        <div>
            <button command="show-modal" commandfor="notification" className="text-black">Click Here</button>
            <Notification type="uv" uvIndex={12} />
            <Navbar />
        </div>
    );
}
