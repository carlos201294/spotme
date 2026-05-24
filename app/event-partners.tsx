import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
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

export default function EventPartnersScreen() {
const { eventId } = useLocalSearchParams();
console.log('EVENT PARTNERS SCREEN EVENT ID:', eventId);
const [users, setUsers] = useState<any[]>([]);
const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
const [requestedIds, setRequestedIds] = useState<string[]>([]);

const loadCurrentProfile = async () => {
const {
data: { user },
} = await supabase.auth.getUser();

if (!user) return null;

setCurrentProfileId(user.id);

return user.id;
};

const loadUsers = async (profileId: string) => {
if (!eventId) return;

const { data: favoriteRows, error } = await supabase
.from('event_favorites')
.select('profile_id')
.eq('event_id', eventId);

if (error) {
console.log('LOAD PARTNERS ERROR:', error);
return;
}

const profileIds =
favoriteRows?.map(row => row.profile_id) || [];

const { data: profilesData } = await supabase
.from('profiles')
.select(`
id,
name,
goal,
gym,
profile_image
`)
.in('id', profileIds);

console.log('CURRENT PROFILE ID:', currentProfileId);
console.log('PROFILES DATA:', profilesData);

const extractedUsers =
profilesData?.filter((u: any) => {
if (!u) return false;

return u.id !== profileId;
}) || [];

setUsers(extractedUsers);

if (error) {
console.log('LOAD PARTNERS ERROR:', error);
console.log('PARTNERS DATA:', profilesData);
return;
}
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
const loadAll = async () => {
const profileId = await loadCurrentProfile();

if (profileId) {
await loadUsers(profileId);
}
};

loadAll();
}, [eventId])
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

{user.profile_image ? (
<Image
source={{ uri: user.profile_image }}
style={styles.avatar}
/>
) : (
<View style={styles.avatarPlaceholder}>
<Text style={styles.avatarText}>
{user.name?.charAt(0)?.toUpperCase() || 'U'}
</Text>
</View>
)}

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
avatar: {
width: 70,
height: 70,
borderRadius: 35,
marginBottom: 14,
alignSelf: 'center',
},

avatarPlaceholder: {
width: 70,
height: 70,
borderRadius: 35,
backgroundColor: '#0B1220',
justifyContent: 'center',
alignItems: 'center',
marginBottom: 14,
alignSelf: 'center',
},

avatarText: {
color: '#22FF88',
fontWeight: '800',
fontSize: 24,
},
});