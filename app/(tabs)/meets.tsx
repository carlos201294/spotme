import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { supabase } from '../../lib/supabase';

const workoutTypes = ['Upper Body', 'Leg Day', 'Cardio', 'Full Body'];
const meetTypes = ['Gym', 'Run', 'Hike', 'Miscellaneous'];

export default function MeetsScreen() {
const [currentUserId, setCurrentUserId] = useState<string | null>(null);

const [gymName, setGymName] = useState('');
const [meetDate, setMeetDate] = useState<Date | null>(null);
const [showPicker, setShowPicker] = useState(false);
const [selectedWorkout, setSelectedWorkout] = useState('Upper Body');
const [meetType, setMeetType] =
useState<'Gym' | 'Run' | 'Hike' | 'Miscellaneous'>('Gym');
const [maxAttendees, setMaxAttendees] = useState('');
const [meets, setMeets] = useState<any[]>([]);

const [participantCounts, setParticipantCounts] = useState<any>({});

useEffect(() => {
const getUser = async () => {
const { data: { user } } = await supabase.auth.getUser();
if (user) setCurrentUserId(user.id);
};
getUser();
}, []);

useEffect(() => {
    loadMeets();
    loadParticipantCounts();
}, []);

const loadMeets = async () => {
const { data } = await supabase
.from('meets')
.select('*')
.order('created_at', { ascending: false });

setMeets(data || []);
};

const loadParticipantCounts = async () => {
const { data, error } = await supabase
.from('meet_participants')
.select('*');

if (error) {
console.log('COUNT ERROR:', error);
return;
}

console.log('PARTICIPANTS:', data);

const counts: any = {};

data?.forEach((item) => {
const meetId = Number(item.meet);

counts[meetId] =
(counts[meetId] || 0) + 1;
});

setParticipantCounts(counts);
};

useFocusEffect(
useCallback(() => {
loadMeets();
}, [])
);

const createMeet = async () => {
if (!gymName || !meetDate || !maxAttendees || !currentUserId) {
alert('Please fill in all fields');
return;
}

const title =
meetType === 'Gym'
? `${meetType} • ${selectedWorkout}`
: `${meetType} Meet`;

const isoDate = meetDate.toISOString();

const { data: meetData, error } = await supabase
.from('meets')
.insert([
{
title,
gym: gymName,
time: isoDate,
meet_type: meetType,
level: 'Open',
attendees: 1,
max_attendees: parseInt(maxAttendees),
host_id: currentUserId,
creator_id: currentUserId,
},
])
.select('*')
.single();

if (error) {
console.log(error);
alert(JSON.stringify(error));
return;
}

await supabase.from('calendar_items').insert([
{
profile_id: currentUserId,
type: 'meet',
reference_id: meetData.id,
title,
date: isoDate,
meet_type: meetType,
location: gymName,
},
]);

setGymName('');
setMeetDate(null);
setSelectedWorkout('Upper Body');
setMeetType('Gym');
setMaxAttendees('');

await loadMeets();
alert('Meet created successfully 🎉');
};

const joinMeet = async (meet: any) => {
if (!currentUserId) return;

if (meet.attendees >= meet.max_attendees) {
alert('This meet is full.');
return;
}

const { data: existing } = await supabase
.from('meet_requests')
.select('*')
.eq('meet_id', Number(meet.id))
.eq('user_id', currentUserId)
.maybeSingle();

if (existing) {
alert('You have already requested to join this meet.');
return;
}

const { data, error } = await supabase
.from('meet_requests')
.insert([
{
meet_id: meet.id,
user_id: currentUserId,
status: 'pending',
},
])
.select('*');

console.log('INSERTED REQUEST:', data);
console.log('INSERT ERROR:', error);

if (error) {
console.log('MEET REQUEST INSERT ERROR:', error);
alert(error.message);
return;
}

alert('Request sent to host ✅');
};

const deleteMeet = async (id: number) => {
Alert.alert('Delete Meet?', 'This cannot be undone.', [
{ text: 'Cancel', style: 'cancel' },
{
text: 'Delete',
style: 'destructive',
onPress: async () => {
await supabase.from('meets').delete().eq('id', id);
loadMeets();
},
},
]);
};

const formattedDate =
meetDate &&
meetDate.toLocaleString(undefined, {
weekday: 'short',
month: 'short',
day: 'numeric',
hour: 'numeric',
minute: '2-digit',
});

return (
<ScrollView style={styles.container} contentContainerStyle={styles.content}>
<Text style={styles.header}>Meets</Text>

<Text style={styles.subheader}>
Create or join workouts with people near you.
</Text>

<View style={styles.card}>
<Text style={styles.cardTitle}>Create a Meet</Text>

<Text style={styles.label}>Meet Type</Text>
<View style={styles.chipRow}>
{meetTypes.map((type) => (
<Pressable
key={type}
style={[
styles.chip,
meetType === type && styles.chipActive,
]}
onPress={() => setMeetType(type as any)}
>
<Text
style={[
styles.chipText,
meetType === type && styles.chipTextActive,
]}
>
{type} Meet
</Text>
</Pressable>
))}
</View>

<TextInput
style={styles.input}
placeholder="Location (Gym / Park / Trail)"
placeholderTextColor="#9CA3AF"
value={gymName}
onChangeText={setGymName}
/>

<TextInput
style={styles.input}
placeholder="Max Attendees"
placeholderTextColor="#9CA3AF"
value={maxAttendees}
onChangeText={setMaxAttendees}
keyboardType="numeric"
/>

<Pressable
style={styles.input}
onPress={() => setShowPicker(true)}
>
<Text style={{ color: meetDate ? '#FFFFFF' : '#9CA3AF' }}>
{meetDate ? formattedDate : 'Select Date & Time'}
</Text>
</Pressable>

{showPicker && (
<DateTimePicker
value={meetDate || new Date()}
mode="datetime"
display={Platform.OS === 'ios' ? 'spinner' : 'default'}
onChange={(event, selected) => {
setShowPicker(false);
if (selected) setMeetDate(selected);
}}
/>
)}

{meetType === 'Gym' && (
<>
<Text style={styles.label}>Workout Focus</Text>
<View style={styles.chipRow}>
{workoutTypes.map((type) => (
<Pressable
key={type}
style={[
styles.chip,
selectedWorkout === type && styles.chipActive,
]}
onPress={() => setSelectedWorkout(type)}
>
<Text
style={[
styles.chipText,
selectedWorkout === type && styles.chipTextActive,
]}
>
{type}
</Text>
</Pressable>
))}
</View>
</>
)}

<Pressable style={styles.createButton} onPress={createMeet}>
<Text style={styles.createButtonText}>+ Create Meet</Text>
</Pressable>
</View>

<Text style={styles.sectionTitle}>Upcoming Meets</Text>

{meets.map((meet) => (
<View key={meet.id} style={styles.meetCard}>
<Text style={styles.meetTitle}>{meet.title}</Text>
<Text style={styles.meetInfo}>{meet.gym}</Text>
<Text style={styles.meetInfo}>
{new Date(meet.time).toLocaleString()}
</Text>

<Text style={styles.attendeesText}>
{participantCounts[String(meet.id)] || 1}/{meet.max_attendees} attending
</Text>

{meet.creator_id === currentUserId ? (
<Pressable
onPress={() => deleteMeet(meet.id)}
style={{ marginTop: 10 }}
>
<Text style={{ color: '#EF4444', fontWeight: '700' }}>
Delete Meet
</Text>
</Pressable>
) : (
<Pressable
onPress={() => joinMeet(meet)}
style={{ marginTop: 10 }}
>
<Text style={{ color: '#22FF88', fontWeight: '700' }}>
Join Meet
</Text>
</Pressable>
)}

<Pressable
onPress={async () => {

if (meet.creator_id === currentUserId) {
router.push(`/meet-chat/${Number(meet.id)}`);
return;
}

const { data: participant } = await supabase
.from('meet_participants')
.select('*')
.eq('meet_id', Number(meet.id))
.eq('user_id', currentUserId)
.maybeSingle();

console.log('MEET ID CHECK:', meet.id);
console.log('CURRENT USER CHECK:', currentUserId);
console.log('PARTICIPANT RESULT:', participant);

if (!participant) {
alert('You must be approved by the host to access this private chat.');
return;
}

router.push(`/meet-chat/${Number(meet.id)}`);

}}
style={{ marginTop: 10 }}
>
<Text style={{ color: '#22FF88', fontWeight: '700' }}>
💬 Open Chat
</Text>
</Pressable>
</View>
))}
</ScrollView>
);
}

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: '#050816' },
content: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 120 },
header: { color: '#22FF88', fontSize: 30, fontWeight: '800' },
subheader: { color: '#9CA3AF', fontSize: 15, marginTop: 8, marginBottom: 20 },
card: {
backgroundColor: '#111827',
borderRadius: 18,
padding: 18,
marginBottom: 20,
borderWidth: 1,
borderColor: '#1F2937',
},
cardTitle: {
color: '#FFFFFF',
fontSize: 20,
fontWeight: '700',
marginBottom: 14,
},
input: {
backgroundColor: '#0B1220',
borderWidth: 1,
borderColor: '#1F2937',
borderRadius: 12,
paddingHorizontal: 14,
paddingVertical: 12,
color: '#FFFFFF',
marginBottom: 12,
justifyContent: 'center',
},
label: { color: '#FFFFFF', fontWeight: '700', marginBottom: 10, marginTop: 6 },
chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
chip: {
borderWidth: 1,
borderColor: '#1F2937',
backgroundColor: '#0B1220',
borderRadius: 999,
paddingHorizontal: 14,
paddingVertical: 10,
},
chipActive: { backgroundColor: '#22FF88', borderColor: '#22FF88' },
chipText: { color: '#9CA3AF', fontWeight: '600' },
chipTextActive: { color: '#050816', fontWeight: '800' },
createButton: {
backgroundColor: '#22FF88',
borderRadius: 14,
paddingVertical: 14,
alignItems: 'center',
},
createButtonText: {
color: '#050816',
fontWeight: '800',
fontSize: 16,
},
sectionTitle: {
color: '#FFFFFF',
fontSize: 20,
fontWeight: '700',
marginBottom: 14,
},
meetCard: {
backgroundColor: '#111827',
borderRadius: 18,
padding: 18,
marginBottom: 16,
borderWidth: 1,
borderColor: '#1F2937',
},
meetTitle: {
color: '#FFFFFF',
fontSize: 18,
fontWeight: '700',
marginBottom: 6,
},
meetInfo: { color: '#9CA3AF', marginBottom: 4 },
attendeesText: {
color: '#22FF88',
fontWeight: '700',
marginTop: 6,
},
});
