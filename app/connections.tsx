import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { supabase } from '../lib/supabase';

type ConnectionUser = {
id: string;
name: string | null;
goal: string | null;
gym: string | null;
profile_image: string | null;
};

type ConnectionRow = {
id: string;
requester_id: string;
receiver_id: string;
requester: ConnectionUser;
receiver: ConnectionUser;
};

export default function ConnectionsScreen() {
const [connections, setConnections] = useState<SpotUser[]>([]);

const loadConnections = async () => {
const { data: { user } } = await supabase.auth.getUser();
if (!user) return;

const CURRENT_USER_ID = user.id;

const { data, error } = await supabase
.from('connections')
.select(`
id,
requester_id,
receiver_id,
requester:profiles!connections_requester_id_fkey (
id,
name,
goal,
gym,
profile_image
),
receiver:profiles!connections_receiver_id_fkey (
id,
name,
goal,
gym,
profile_image
)
`)
.eq('status', 'accepted')
.or(
`requester_id.eq.${CURRENT_USER_ID},receiver_id.eq.${CURRENT_USER_ID}`
);

console.log("CURRENT_USER_ID:", CURRENT_USER_ID);
console.log("CONNECTION DATA:", data);

if (error) {
console.log('LOAD CONNECTIONS ERROR:', error);
setConnections([]);
return;
}

const filtered = (data || []).map((conn: any) => {
return conn.requester_id === CURRENT_USER_ID
? conn.receiver
: conn.requester;
});

const cleaned = filtered.filter(
(user: any) => user?.id !== CURRENT_USER_ID
);

setConnections(cleaned);

};

useFocusEffect(
useCallback(() => {
loadConnections();
}, [])
);

return (
<ScrollView style={styles.container} contentContainerStyle={styles.
content}>

<Text style={styles.header}>Your Connections</Text>

{connections.length === 0 ? (
<Text style={styles.empty}>No connections yet</Text>
) : (
connections.map((user, index) => {
const name = user.name || 'Spot User';
const initial = name.charAt(0).toUpperCase();

return (
<Pressable
key={index}
style={styles.card}
onPress={() =>
router.push({
pathname: '/connection-details',
params: {
id: user.id,
name: user.name || '',
goal: user.goal || '',
gym: user.gym || '',
profileImage: user.profile_image || '',
},
})
}
>
{user.profile_image ? (
<Image source={{ uri: user.profile_image }} style={styles.avatar} />
) : (
<View style={styles.
avatarPlaceholder}>
<Text style={styles.avatarText}>{initial}</Text>

</View>
)}

<View style={styles.info}>
<Text style={styles.name}>{name}</
Text>

{!!user.goal && <Text style={styles.meta}>Goal: {user.goal}</Text>}
{!!user.gym && <Text style={styles.meta}>Gym: {user.gym}</Text>}
</View>

<Text style={styles.chevron}>›</
Text>

</Pressable>
);
})
)}
</ScrollView>
);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#050816',
},
content: {
paddingTop: 60,
paddingHorizontal: 20,
paddingBottom: 120,
},
header: {
color: '#22FF88',
fontSize: 28,
fontWeight: '800',
marginBottom: 20,
},
empty: {
color: '#9CA3AF',
},
card: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: '#111827',
padding: 16,
borderRadius: 16,
marginBottom: 14,
},
avatar: {
width: 58,
height: 58,
borderRadius: 29,
},
avatarPlaceholder: {
width: 58,
height: 58,
borderRadius: 29,
backgroundColor: '#0B1220',
justifyContent: 'center',
alignItems: 'center',
},
avatarText: {
color: '#22FF88',
fontWeight: '800',
fontSize: 20,
},
info: {
flex: 1,
marginLeft: 14,
},
name: {
color: '#fff',
fontWeight: '700',
fontSize: 16,
marginBottom: 2,
},
meta: {
color: '#9CA3AF',
fontSize: 13,
},
chevron: {
color: '#9CA3AF',
fontSize: 28,
marginLeft: 8,
},
});