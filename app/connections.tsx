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
const [connections, setConnections] = useState<ConnectionUser[]>([]);

const loadConnections = async () => {
const { data: profile } = await supabase
.from('profiles')
.select('id')
.order('created_at', { ascending: false })
.limit(1)
.single();

if (!profile?.id) return;

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
.eq('status', 'accepted');

if (error) {
console.log('LOAD CONNECTIONS ERROR:', error);
setConnections([]);
return;
}

const filtered = ((data as ConnectionRow[]) || []).map((conn) => {
return conn.requester.id === profile.id ? conn.receiver : conn.requester;
});

setConnections(filtered);
};

useFocusEffect(
useCallback(() => {
loadConnections();
}, [])
);

return (
<ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
<View style={styles.avatarPlaceholder}>
<Text style={styles.avatarText}>{initial}</Text>
</View>
)}

<View style={styles.info}>
<Text style={styles.name}>{name}</Text>
{!!user.goal && <Text style={styles.meta}>Goal: {user.goal}</Text>}
{!!user.gym && <Text style={styles.meta}>Gym: {user.gym}</Text>}
</View>

<Text style={styles.chevron}>›</Text>
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
flex: 1,
marginLeft: 12,
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
