import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

const workoutTypes = ['Upper Body', 'Leg Day', 'Cardio', 'Full Body'];
const meetTypes = ['Gym', 'Run', 'Hike'];

export default function MeetsScreen() {
const [gymName, setGymName] = useState('');
const [meetTime, setMeetTime] = useState('');
const [selectedWorkout, setSelectedWorkout] = useState('Upper Body');
const [meetType, setMeetType] = useState<'Gym' | 'Run' | 'Hike'>('Gym');
const [meets, setMeets] = useState<any[]>([]);
const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);

const loadCurrentProfile = async () => {
const { data } = await supabase
.from('profiles')
.select('id')
.order('created_at', { ascending: false })
.limit(1)
.single();

if (data?.id) {
setCurrentProfileId(data.id);
}
};

const loadMeets = async () => {
const { data, error } = await supabase
.from('meets')
.select('*')
.order('created_at', { ascending: false });

if (!error) {
setMeets(data || []);
} else {
console.log('LOAD MEETS ERROR:', error);
}
};

useFocusEffect(
useCallback(() => {
loadCurrentProfile();
loadMeets();
}, [])
);

const createMeet = async () => {
if (!gymName || !meetTime) {
alert('Please fill in all fields');
return;
}

const { data: profile, error: profileError } = await supabase
.from('profiles')
.select('id')
.order('created_at', { ascending: false })
.limit(1)
.single();
console.log('PROFILE ID BEING USED', profile?.id);

if (profileError || !profile?.id) {
alert('No profile found');
return;
}

const title =
meetType === 'Gym'
? `${meetType} • ${selectedWorkout}`
: `${meetType} Meet`;

const { error } = await supabase.from('meets').insert(
[

{
title,
gym: gymName,
time: meetTime,
level: 'Open',
attendees: 1,
host_id: profile.id,
creator_id: profile.id, // ✅ Added

},
]);

if (error) {
console.log('CREATE MEET ERROR:', error);
alert(error.message);
return;
}

setGymName('');
setMeetTime('');
setSelectedWorkout('Upper Body');
setMeetType('Gym');

await loadMeets();

alert('Meet created successfully 🎉');
};

const deleteMeet = async (id: number) => {
Alert.alert('Delete Meet?', 'This cannot be undone.', [
{ text: 'Cancel', style: 'cancel' },
{
text: 'Delete',
style: 'destructive',
onPress: async () => {
const { error } = await supabase
.from('meets')
.delete()
.eq('id', id);

if (error) {
alert('Error deleting meet');
} else {
loadMeets();
}
},
},
]);
};

return (
<ScrollView style={styles.container} contentContainerStyle={styles.
content}>

<Text style={styles.header}>Meets</
Text>

<Text style={styles.subheader}>
Create or join workouts with people near you.
</Text>

<View style={styles.card}>
<Text style={styles.cardTitle}>
Create a Meet</Text>


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
placeholder="Time (example: Saturday • 10:00 AM)"
placeholderTextColor="#9CA3AF"
value={meetTime}
onChangeText={setMeetTime}
/>

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
<Text style={styles.
createButtonText}>+ Create Meet</Text>

</Pressable>
</View>

<Text style={styles.sectionTitle}>
Upcoming Meets</Text>


{meets.map((meet) => (
<View key={meet.id} style={styles.meetCard}>
<Text style={styles.meetTitle}>{
meet.title}</Text>
<Text style={styles.meetInfo}>{meet.gym}</Text>
<Text style={styles.meetInfo}>{meet.time}</Text>

<Text style={styles.attendeesText}>
{meet.attendees} attending
</Text>

{meet.creator_id === currentProfileId && (
<Pressable
onPress={() => deleteMeet(meet.id)}
style={{ marginTop: 10 }}
>
<Text style={{ color: '#EF4444', fontWeight: '700' }}>
Delete Meet
</Text>
</Pressable>
)}
</View>
))}
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
fontSize: 30,
fontWeight: '800',
},
subheader: {
color: '#9CA3AF',
fontSize: 15,
marginTop: 8,
marginBottom: 20,
},
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
},
label: {
color: '#FFFFFF',
fontWeight: '700',
marginBottom: 10,
marginTop: 6,
},
chipRow: {
flexDirection: 'row',
flexWrap: 'wrap',
gap: 10,
marginBottom: 16,
},
chip: {
borderWidth: 1,
borderColor: '#1F2937',
backgroundColor: '#0B1220',
borderRadius: 999,
paddingHorizontal: 14,
paddingVertical: 10,
},
chipActive: {
backgroundColor: '#22FF88',
borderColor: '#22FF88',
},
chipText: {
color: '#9CA3AF',
fontWeight: '600',
},
chipTextActive: {
color: '#050816',
fontWeight: '800',
},
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
meetInfo: {
color: '#9CA3AF',
marginBottom: 4,
},
attendeesText: {
color: '#22FF88',
fontWeight: '700',
marginTop: 6,
},
});