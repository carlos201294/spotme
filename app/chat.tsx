import { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { supabase } from '../lib/supabase';

type Profile = {
id: string;
name: string | null;
profile_image: string | null;
};

export default function ChatScreen() {
const [connections, setConnections] = useState<Profile[]>([]);

const loadConnections = async () => {
// Get all accepted connections
const { data: connectionData } = await supabase
.from('connections')
.select('*')
.eq('status', 'accepted');

if (!connectionData || connectionData.length === 0) {
setConnections([]);
return;
}

// Collect all profile IDs involved
const profileIds = connectionData.flatMap((c) => [
c.requester_profile_id,
c.receiver_profile_id,
]);

const uniqueIds = [...new Set(profileIds)];

// Get profiles
const { data: profiles } = await supabase
.from('profiles')
.select('id, name, profile_image')
.in('id', uniqueIds);

setConnections(profiles || []);
};

useEffect(() => {
loadConnections();

}, []);

return (
<View style={styles.container}>
<Text style={styles.header}>Chats</Text>

{connections.length === 0 ? (
<Text style={styles.empty}>
Start connecting to begin chatting.
</Text>
) : (
<FlatList
data={connections}
keyExtractor={(item) => item.id}
renderItem={({ item }) => {
const name = item.name || 'Spot User';
const initial = name.charAt(0).toUpperCase();

return (
<Pressable style={styles.card}>
{item.profile_image ? (
<Image
source={{ uri: item.profile_image }}
style={styles.avatar}
/>
) : (
<View style={styles.avatarPlaceholder}>
<Text style={styles.avatarText}>{initial}</Text>
</View>
)}

<Text style={styles.name}>{name}</Text>
</Pressable>
);
}}
/>
)}
</View>
);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#050816',
paddingTop: 60,
paddingHorizontal: 20,
},
header: {
color: '#22FF88',
fontSize: 28,
fontWeight: '800',
marginBottom: 20,
},
empty: {
color: '#9CA3AF',
marginTop: 40,
},
card: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: '#111827',
padding: 14,
borderRadius: 16,
marginBottom: 12,
},
avatar: {
width: 50,
height: 50,
borderRadius: 25,
},
avatarPlaceholder: {
width: 50,
height: 50,
borderRadius: 25,
backgroundColor: '#0B1220',
justifyContent: 'center',
alignItems: 'center',
},
avatarText: {
color: '#22FF88',
fontWeight: '800',
fontSize: 18,
},
name: {
color: '#fff',
fontWeight: '700',
fontSize: 16,
marginLeft: 14,
},
});