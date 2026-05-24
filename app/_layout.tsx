import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function RootLayout() {
const [session, setSession] = useState<any>(null);
const [ready, setReady] = useState(false);

useEffect(() => {
const check = async () => {
const { data } = await supabase.auth.getSession();
setSession(data.session);
setReady(true);
};

check();

const { data: listener } = supabase.auth.onAuthStateChange(
(_event, session) => {
setSession(session);
}
);

return () => {
listener.subscription.unsubscribe();
};
}, []);

if (!ready) return null;

return (
<Stack screenOptions={{ headerShown: false }}>
{session ? (
[
<Stack.Screen key="tabs" name="(tabs)" />,
<Stack.Screen key="chat" name="chat/[id]" />
]
) : (
<Stack.Screen name="login" />
)}
</Stack>
);
}