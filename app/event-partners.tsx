import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function EventPartnersScreen() {
const { eventId } = useLocalSearchParams();
const [users, setUsers] = useState<any[]>([]);
const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
const [requestedIds, setRequestedIds] = useState<string[]>([]);

const loadCurrentProfile = async () => {
const { data } = await supabase
.from('profiles')
.select('id')
.order('created_at', { ascending: false })
.limit(1)
.single();

if (data?.id) setCurrentProfileId(data.id);
};

const loadUsers = async () => {
if (!eventId) return;

const { data, error } = await supabase
.from('event_favorites')
.select(`
profile_id,
profiles (
id,
name,
goal,
gym
)
`)
.eq('event_id', Number(eventId));

if (error) {
console.log('LOAD PARTNERS ERROR:', error);
return;
}

const extractedUsers =
data
?.map((item: any) => item.profiles)
.filter((u: any) => u?.id !== currentProfileId) || [];

setUsers(extractedUsers);
};

const sendConnectionRequest = async (receiverId: string) => {
if (!currentProfileId) return;

const { error } = await supabase.from('connections').insert([
{
requester_id: currentProfileId,
receiver_id: receiverId,
status: 'pending',
},
]);

if (error) {
console.log('CONNECTION ERROR:', error);
return;
}

setRequestedIds((prev) => [...prev, receiverId]);
};

useFocusEffect(
useCallback(() => {
loadCurrentProfile();
loadUsers();
}, [eventId, currentProfileId])
);

return (
<View style={styles.container}>
<Text style={styles.header}>Event Partners</Text>
<Text style={styles.subheader}>
People who favorited this event
</Text>

<ScrollView contentContainerStyle={styles.list}>
{users.length === 0 ? (
<View style={styles.emptyCard}>
<Text style={styles.emptyTitle}>No partners yet</Text>
<Text style={styles.emptyText}>
Be the first to favorite this event 🔥
</Text>
</View>
) : (
users.map((user, index) => {
const alreadyRequested = requestedIds.includes(user.id);

return (
<View key={index} style={styles.card}>
<Text style={styles.name}>
{user?.name || 'User'}
</Text>

{user?.goal && (
<Text style={styles.meta}>Goal: {user.goal}</Text>
)}

{user?.gym && (
<Text style={styles.meta}>Gym: {user.gym}</Text>
)}

<Pressable
style={[
styles.connectButton,
alreadyRequested && styles.requestedButton,
]}
onPress={() =>
!alreadyRequested &&
sendConnectionRequest(user.id)
}
>
<Text
style={[
styles.connectText,
alreadyRequested && styles.requestedText,
]}
>
{alreadyRequested ? 'Requested' : 'Connect'}
</Text>
</Pressable>
</View>
);

})
)}
</ScrollView>
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
},
subheader: {
color: '#9CA3AF',
marginBottom: 20,
},
list: {
paddingBottom: 120,
},
card: {
backgroundColor: '#111827',
borderRadius: 18,
padding: 16,
marginBottom: 14,
borderWidth: 1,
borderColor: '#1F2937',
},
name: {
color: '#FFFFFF',
fontSize: 18,
fontWeight: '700',
marginBottom: 4,
},
meta: {
color: '#9CA3AF',
fontSize: 14,
marginBottom: 6,
},
connectButton: {
marginTop: 10,
borderWidth: 1,
borderColor: '#22FF88',
borderRadius: 12,
paddingVertical: 10,
alignItems: 'center',
},
connectText: {
color: '#22FF88',
fontWeight: '700',
},
requestedButton: {
backgroundColor: '#22FF88',
},
requestedText: {
color: '#050816',
fontWeight: '800',
},
emptyCard: {
backgroundColor: '#111827',
borderRadius: 18,
padding: 18,
borderWidth: 1,
borderColor: '#1F2937',
},
emptyTitle: {
color: '#FFFFFF',
fontSize: 18,
fontWeight: '700',
marginBottom: 6,
},
emptyText: {
color: '#9CA3AF',
},
});