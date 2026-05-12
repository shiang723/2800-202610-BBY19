import { signOut } from "@/actions/auth";

export default function SignoutBtn({userEmail} : {userEmail: string | undefined}) {
    return (
        <button
            onClick={signOut}
            className={
                userEmail
                    ? "p-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition-colors"
                    : "hidden"
            }
        >
            Logout
        </button>
    )
}