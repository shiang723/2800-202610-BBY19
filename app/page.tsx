import { createClientForServerComponent } from "@/lib/supabase/server";
import { signOut } from "@/actions/auth";

export default async function Home() {
  const supabase = await createClientForServerComponent();
  const data = await supabase.auth.getUser();
  const user = data.data.user;

  return (
    <div>
      <p>Status: {user ? "User is authenticated. User email: " + user.email : "User is not authenticated." }</p>
      <button onClick={signOut} className={user ? "p-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition-colors" : "hidden"}>Logout</button>
    </div>
  );
}
