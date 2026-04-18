import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
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
import { supabase } from '../../lib/supabase';

type SpotUser = {
id: string;
name: string | null;
goal: string | null;
gym: string | null;
profile_image: string | null;
};

export default function FindScreen() {
const [users, setUsers] = useState<SpotUser[]>([]);
const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
const [pendingRequests, setPendingRequests] = useState<string[]>([]);

const loadCurrentProfile = async () => {
const { data } = await supabase
.from('profiles')
.select('id')
.order('created_at', { ascending: false })
.limit(1)
.single();

if (data?.id) {
setCurrentProfileId(data.id);
return data.id;
}

return null;
};

const loadUsers = async () => {
const { data } = await supabase
.from('profiles')
.select('id, name, goal, gym, profile_image')
.order('created_at', { ascending: false });

setUsers(data || []);
};

const loadPendingRequests = async (profileId: string) => {
const { data } = await supabase
.from('connections')
.select('receiver_id')
.eq('requester_id', profileId)
.eq('status', 'pending');

const ids = data?.map((item) => item.receiver_id) || [];
setPendingRequests(ids);
};

const sendConnectionRequest = async (receiverId: string) => {
if (!currentProfileId) return;
if (pendingRequests.includes(receiverId)) return;

const { error } = await supabase.from('connections').insert([
{
requester_id: currentProfileId,
receiver_id: receiverId,
status: 'pending',
},
]);

if (!error) {
setPendingRequests((prev) => [...prev, receiverId]);
}
};

const blockUser = async (blockedId: string) => {
if (!currentProfileId) return;

await supabase.from('blocked_users').insert([
{
blocker_profile_id: currentProfileId,
blocked_profile_id: blockedId,
},
]);

setUsers((prev) => prev.filter((u) => u.id !== blockedId));
};

const reportUser = async (reportedId: string) => {
if (!currentProfileId) return;

await supabase.from('reports').
insert([

{
reporter_profile_id: currentProfileId,
reported_profile_id: reportedId,
reason: 'general',
},
]);

Alert.alert('User reported');
};

const openMenu = (userId: string) => {
Alert.alert('Options', '', [
{ text: 'Report', onPress: () => reportUser(userId) },
{ text: 'Block', onPress: () => blockUser(userId), style: 'destructive' },
{ text: 'Cancel', style: 'cancel' },
]);
};

useFocusEffect(
useCallback(() => {
const loadAll = async () => {
const profileId = await loadCurrentProfile();
await loadUsers();
if (profileId) {
await loadPendingRequests(profileId)
;

}
};

loadAll();
}, [])
);

const visibleUsers = users.filter((u) => u.id !== currentProfileId);

return (
<View style={styles.container}>

{/* HEADER WITH CHAT ICON */}
<View style={styles.headerRow}>
<View>
<Text style={styles.header}>Spot People</Text>
<Text style={styles.subheader}>
Discover gym partners near you
</Text>
</View>

<Pressable onPress={() => router.push('/connections')}>
<Ionicons
name="chatbubble-outline"
size={26}
color="#22FF88"
/>
</Pressable>
</View>

<ScrollView contentContainerStyle={styles.list}>

{visibleUsers.map((user) => {
const name = user.name || 'Spot User';
const initial = name.charAt(0).toUpperCase();
const isRequested = pendingRequests.includes(user.id);

return (
<View key={user.id} style={styles.card}>
{user.profile_image ? (
<Image
source={{ uri: user.profile_image }}
style={styles.avatar}
/>
) : (
<View style={styles.
avatarPlaceholder}>
<Text style={styles.avatarText}>{initial}</Text>

</View>
)}

<View style={styles.info}>
<Text style={styles.name}>{name}</
Text>

{!!user.goal && (
<Text style={styles.meta}>🎯 {user.goal}</Text>
)}
{!!user.gym && (
<Text style={styles.meta}>🏋️ {user.gym}</Text>
)}
</View>

<View style={styles.actions}>
<Pressable
style={[
styles.connectBtn,
isRequested && styles.requestedBtn,
]}
onPress={() => sendConnectionRequest(user.id)
}

disabled={isRequested}
>
<Text
style={[
styles.connectText,
isRequested && styles.requestedText,
]}
>
{isRequested ? 'Requested' : 'Connect'}
</Text>
</Pressable>

<Pressable onPress={() => openMenu(user.id)}>
<Text style={styles.menuDots}>•••</
Text>

</Pressable>
</View>
</View>
);
})}
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
headerRow: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: 20,
},
header: {
color: '#22FF88',
fontSize: 30,
fontWeight: '800',
},
subheader: {
color: '#9CA3AF',
marginTop: 4,

},
list: {
paddingBottom: 120,
},
card: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: '#111827',
borderRadius: 18,
padding: 14,
marginBottom: 14,
},
avatar: {
width: 60,
height: 60,
borderRadius: 30,
},
avatarPlaceholder: {
width: 60,
height: 60,
borderRadius: 30,
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
marginLeft: 12,
},
name: {
color: '#fff',
fontWeight: '700',
fontSize: 16,
},
meta: {
color: '#9CA3AF',
fontSize: 13,
},
actions: {
alignItems: 'center',
},
connectBtn: {
backgroundColor: '#22FF88',
paddingHorizontal: 14,
paddingVertical: 8,
borderRadius: 10,
},
connectText: {
color: '#050816',
fontWeight: '800',
},
requestedBtn: {
backgroundColor: '#1F2937',
},
requestedText: {
color: '#9CA3AF',
},
menuDots: {
color: '#9CA3AF',
fontSize: 18,
marginTop: 6,
},
});