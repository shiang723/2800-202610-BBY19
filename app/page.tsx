import HomeContainer from "@/components/HomeContainer";
import { createClientForServerComponent } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClientForServerComponent();
  const data = await supabase.auth.getUser();
  const user = data.data.user;

  return (
    <HomeContainer userEmail={user?.email} />
  );
}
