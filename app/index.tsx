import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function Index() {
const [loading, setLoading] = useState(true);
const [session, setSession] = useState<any>(null);

useEffect(() => {
const checkSession = async () => {
const { data } = await supabase.auth.getSession();
setSession(data.session);
setLoading(false);
};

checkSession();
}, []);

if (loading) {
return (
<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050816' }}>
<ActivityIndicator color="#22FF88" />
</View>
);
}

if (!session) {
return <Redirect href="/login" />;
}

return <Redirect href="/(tabs)" />;
}