import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { supabase } from '../lib/supabase';

type RequestItem = {
id: string;
requester_id: string;
status: string;
requester: {
name: string | null;
goal: string | null;
gym: string | null;
profile_image: string | null;
} | null;
};

export default function RequestsScreen() {
const [requests, setRequests] = useState<RequestItem[]>([]);

const loadRequests = async () => {
const { data: profile, error: profileError } = await supabase
.from('profiles')
.select('id')
.order('created_at', { ascending: false })
.limit(1)
.single();

if (profileError || !profile?.id) {
console.log('LOAD PROFILE ERROR:', profileError);
setRequests([]);
return;
}

const { data, error } = await supabase
.from('connections')
.select(`
id,
requester_id,
status,
requester:profiles!connections_requester_id_fkey (
name,
goal,
gym,
profile_image
)
`)
.eq('receiver_id', profile.id)
.eq('status', 'pending')
.order('created_at', { ascending: false });

if (error) {
console.log('LOAD REQUESTS ERROR:', error);
Alert.alert('Error', error.message);
setRequests([]);
return;
}

setRequests((data as RequestItem[]) || []);
};

const updateStatus = async (id: string, status: 'accepted' | 'declined') => {
const { error } = await supabase
.from('connections')
.update({ status })
.eq('id', id);

if (error) {
console.log('UPDATE REQUEST ERROR:', error);
Alert.alert('Error', error.message);
return;
}

setRequests((prev) => prev.filter((r) => r.id !== id));
};

useFocusEffect(
useCallback(() => {
loadRequests();
}, [])
);

return (
<ScrollView style={styles.container} contentContainerStyle={styles.content}>
<Text style={styles.header}>Requests</Text>
<Text style={styles.subheader}>See who wants to connect with you.</Text>

{requests.length === 0 ? (
<View style={styles.emptyCard}>
<Text style={styles.emptyTitle}>No pending requests</Text>
<Text style={styles.emptyText}>
New connection requests will appear here.
</Text>
</View>
) : (
requests.map((req) => {
const requesterName = req.requester?.name?.trim() || 'Spot User';
const requesterGoal = req.requester?.goal?.trim();
const requesterGym = req.requester?.gym?.trim();
const requesterImage = req.requester?.profile_image;
const initial = requesterName.charAt(0).toUpperCase();

return (
<View key={req.id} style={styles.card}>
{requesterImage ? (
<Image source={{ uri: requesterImage }} style={styles.avatar} />
) : (
<View style={styles.avatarPlaceholder}>
<Text style={styles.avatarPlaceholderText}>{initial}</Text>
</View>
)}

<View style={styles.infoBlock}>
<Text style={styles.name}>{requesterName}</Text>
{!!requesterGoal && <Text style={styles.meta}>Goal: {requesterGoal}</Text>}
{!!requesterGym && <Text style={styles.meta}>Gym: {requesterGym}</Text>}
</View>

<View style={styles.buttonColumn}>
<Pressable
style={styles.acceptBtn}
onPress={() => updateStatus(req.id, 'accepted')}
>
<Text style={styles.acceptText}>Accept</Text>
</Pressable>

<Pressable
style={styles.declineBtn}
onPress={() => updateStatus(req.id, 'declined')}
>
<Text style={styles.declineText}>Decline</Text>
</Pressable>
</View>
</View>
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
marginBottom: 8,
},
subheader: {
color: '#9CA3AF',
fontSize: 15,
marginBottom: 20,
},
emptyCard: {
backgroundColor: '#111827',
padding: 18,
borderRadius: 16,
borderWidth: 1,
borderColor: '#1F2937',
},
emptyTitle: {
color: '#FFFFFF',
fontSize: 18,
fontWeight: '700',
marginBottom: 8,
},
emptyText: {
color: '#9CA3AF',
lineHeight: 22,
},
card: {
backgroundColor: '#111827',
padding: 16,
borderRadius: 16,
marginBottom: 14,
borderWidth: 1,
borderColor: '#1F2937',
flexDirection: 'row',
alignItems: 'center',
},
avatar: {
width: 58,
height: 58,
borderRadius: 29,
marginRight: 12,
},
avatarPlaceholder: {
width: 58,
height: 58,
borderRadius: 29,
backgroundColor: '#0B1220',
borderWidth: 1,
borderColor: '#22FF88',
alignItems: 'center',
justifyContent: 'center',
marginRight: 12,
},
avatarPlaceholderText: {
color: '#22FF88',
fontSize: 22,
fontWeight: '800',
},
infoBlock: {
flex: 1,
marginRight: 10,
},
name: {
color: '#FFFFFF',
fontSize: 16,
fontWeight: '700',
marginBottom: 4,
},
meta: {
color: '#9CA3AF',
fontSize: 13,
marginBottom: 2,
},
buttonColumn: {
width: 92,
},
acceptBtn: {
backgroundColor: '#22FF88',
paddingVertical: 10,
borderRadius: 10,
alignItems: 'center',
marginBottom: 8,
},
acceptText: {
color: '#050816',
fontWeight: '800',
},
declineBtn: {
borderWidth: 1,
borderColor: '#22FF88',
paddingVertical: 10,
borderRadius: 10,
alignItems: 'center',
},
declineText: {
color: '#22FF88',
fontWeight: '700',
},
});
