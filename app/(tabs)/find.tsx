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
bio: string | null;
availability: string | null;
level: string | null
};

export default function FindScreen() {
const [users, setUsers] = useState<SpotUser[]>([]);
const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
const [currentUserGym, setCurrentUserGym] = useState<string | null>(null);
const [excludedIds, setExcludedIds] = useState<string[]>([]);

// ✅ FIXED: Properly load logged in user's profile
const loadCurrentProfile = async () => {
const {
data: { user },
} = await supabase.auth.getUser();

if (!user) return null;

const { data, error } = await supabase
.from('profiles')
.select('id, gym')
.eq('id', user.id)
.single();

if (error || !data) return null;

setCurrentProfileId(data.id);
setCurrentUserGym(data.gym || null);

return data.id;
};

const loadUsers = async () => {
const { data } = await supabase
.from('profiles')
.select('id, name, goal, gym, profile_image, bio, availability, level')
.order('created_at', { ascending: false });

setUsers(data || []);
};

const loadExclusions = async (profileId: string) => {
const { data: connections } = await supabase
.from('connections')
.select('requester_id, receiver_id, status')
.or(`requester_id.eq.${
profileId},receiver_id.eq.${profileId}`);


const connectionIds =
connections?.flatMap((c) => {
if (c.status === 'accepted') {
return c.requester_id === profileId
? [c.receiver_id]
: [c.requester_id];
}
return [];
}) || [];

const { data: blocked } = await supabase
.from('blocked_users')
.select('blocked_profile_id')
.eq('blocker_profile_id', profileId);

const blockedIds =
blocked?.map((b) => b.blocked_profile_id) || [];

setExcludedIds([...
connectionIds, ...blockedIds]);
};

// ✅ CONNECT WORKING + SAFE
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
Alert.alert('Error sending request');
return;
}

Alert.alert('Connection request sent');
};

const blockUser = async (blockedId: string) => {
if (!currentProfileId) return;

await supabase.from('blocked_users').insert([
{
blocker_profile_id: currentProfileId,
blocked_profile_id: blockedId,
},
]);

setExcludedIds((prev) => [...prev, blockedId]);
};

const reportUser = async (reportedId: string) => {
if (!currentProfileId) return;

const { data, error } = await supabase
.from('reports')
.insert([
{
reporter_profile_id: currentProfileId,
reported_profile_id: reportedId,
reason: 'general',
},
])
.select();

console.log('REPORT DATA:', data);
console.log('REPORT ERROR:', error);

if (error) {
Alert.alert('Failed to report user');
return;
}

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
await loadExclusions(profileId);
}
};

loadAll();
}, [])
);

const visibleUsers = users
.filter(
(u) =>
u.id !== currentProfileId &&
!excludedIds.includes(u.id)
)
.sort((a, b) => {
if (!currentUserGym) return 0;

const aMatch = a.gym === currentUserGym;
const bMatch = b.gym === currentUserGym;

if (aMatch && !bMatch) return -1;
if (!aMatch && bMatch) return 1;
return 0;
});

return (
<View style={styles.container}>
<View style={styles.headerRow}>
<View>
<Text style={styles.header}>Spot People</Text>
<Text style={styles.subheader}>
Discover gym partners near you
</Text>
</View>
</View>

<ScrollView contentContainerStyle={styles.list}>
{visibleUsers.map((user) => {
const name = user.name || 'Spot User';
const initial = name.charAt(0).toUpperCase();

return (
<Pressable
key={user.id}
style={styles.card}
onPress={() =>
router.push({
pathname: '/connection-details',
params: {
id: user.id,
name: user.name,
goal: user.goal,
gym: user.gym,
profileImage: user.profile_image,
bio: user.bio,
availability: user.availability,
level: user.level,
},
})
}
>
{user.profile_image ? (
<Image
source={{ uri: user.profile_image }}
style={styles.avatar}
/>
) : (
<View style={styles.avatarPlaceholder}>
<Text style={styles.avatarText}>{initial}</Text>
</View>
)}

<View style={styles.info}>
<Text style={styles.name}>{name}</Text>
{!!user.goal && (
<Text style={styles.meta}>🎯 {user.goal}</Text>
)}
{!!user.gym && (
<Text style={styles.meta}>🏋️ {user.gym}</Text>
)}
</View>

<View style={styles.actions}>
<Pressable
style={styles.connectBtn}
onPress={() => sendConnectionRequest(user.id)}
>
<Text style={styles.connectText}>
Connect
</Text>
</Pressable>

<Pressable onPress={() => openMenu(user.id)}>
<Text style={styles.menuDots}>•••</Text>
</Pressable>
</View>
</Pressable>
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
menuDots: {
color: '#9CA3AF',
fontSize: 18,
marginTop: 6,
},
});