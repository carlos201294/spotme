import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { supabase } from '../lib/supabase';

type ConnectionRequest = {
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

type MeetInvite = {
id: string;
meet_id: string;
sender_id: string;
meet: { title: string | null } | null;
sender: { name: string | null; profile_image: string | null } | null;
};

type MeetJoinRequest = {
id: string;
meet_id: string;
user_id: string;
status: string;
meet: { title: string | null; creator_id: string | null } | null;
user: { name: string | null; profile_image: string | null } | null;
};

export default function RequestsScreen() {

const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
const [meetInvites, setMeetInvites] = useState<MeetInvite[]>([]);
const [meetJoinRequests, setMeetJoinRequests] = useState<MeetJoinRequest[]>([]);

const loadRequests = async () => {
const { data: { user } } = await supabase.auth.getUser();
if (!user) return;

const currentUserId = user.id;

const { data: profile } = await supabase
.from('profiles')
.select('id')
.eq('id', user.id)
.single();

if (!profile) return;

const currentProfileId = profile.id;

// CONNECTION REQUESTS
const { data: connectionData } = await supabase
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
.eq('receiver_id', user.id)
.eq('status', 'pending')
.order('created_at', { ascending: false });

setConnectionRequests((connectionData as ConnectionRequest[]) || []);

// MEET INVITES
const { data: inviteData } = await supabase
.from('meet_invites')
.select(`
id,
meet_id,
sender_id,
meet:meets!meet_invites_meet_id_fkey ( title ),
sender:profiles!meet_invites_sender_id_fkey ( name, profile_image )
`)
.eq('receiver_id', currentUserId)
.eq('status', 'pending')
.order('created_at', { ascending: false });

setMeetInvites((inviteData as MeetInvite[]) || []);

// GET HOST MEETS
const { data: hostMeets } = await supabase
.from('meets')
.select('id')
.eq('creator_id', currentUserId);

const hostMeetIds = (hostMeets || []).map(meet => meet.id);

// GET PENDING JOIN REQUESTS
const { data: joinRequestData } = await supabase
.from('meet_requests')
.select('id, meet_id, user_id, status')
.eq('status', 'pending');

if (!joinRequestData) {
setMeetJoinRequests([]);
return;
}

const filteredRequests = joinRequestData.filter(req =>
hostMeetIds.includes(req.meet_id)
);

const formattedRequests: any[] = [];

for (const req of filteredRequests) {
const { data: meetData } = await supabase
.from('meets')
.select('title')
.eq('id', req.meet_id)
.single();

const { data: profileData } = await supabase
.from('profiles')
.select('name, gym, profile_image')
.eq('id', req.user_id)
.single();

formattedRequests.push({
...req,
meet: meetData,
user: profileData,
});
}

setMeetJoinRequests(formattedRequests);
};

const updateMeetJoinRequestStatus = async (
id: string,
meetId: string,
status: 'approved' | 'declined'
) => {

// Get request user
const { data: requestData } = await supabase
.from('meet_requests')
.select('user_id')
.eq('id', id)
.single();

if (!requestData) return;

// Update request status
await supabase
.from('meet_requests')
.update({ status })
.eq('id', id);

if (status === 'approved') {

const requestData = meetJoinRequests.find(
(r) => r.id === id
);

if (!requestData) {
console.log('REQUEST DATA NOT FOUND');
return;
}

console.log('MEET ID:', meetId);
console.log('REQUEST USER ID:', requestData.user_id);

// Insert into meet_participants
const { error: insertError } = await supabase
.from('meet_participants')
.insert({
meet_id: meetId,
user_id: requestData.user_id,
});

console.log("INSERT ERROR:", insertError);

// Increment attendees
const { data: meetData } = await supabase
.from('meets')
.select('attendees')
.eq('id', meetId)
.single();

if (meetData) {
await supabase
.from('meets')
.update({ attendees: meetData.attendees + 1 })
.eq('id', meetId);
}
}

await loadRequests();
};

const updateConnectionStatus = async (
id: string,
status: 'accepted' | 'declined'
) => {

await supabase
.from('connections')
.update({ status })
.eq('id', id);

// Remove from UI after action
setConnectionRequests(prev =>
prev.filter(r => r.id !== id)
);
};

useFocusEffect(
useCallback(() => {
loadRequests();
}, [])
);

return (
<ScrollView
style={styles.container}
contentContainerStyle={styles.content}
>
<Text style={styles.header}>Requests</Text>
<Text style={styles.subheader}>
See who wants to connect or meet.
</Text>

{/* CONNECTION REQUESTS */}
{connectionRequests.map(req => {

const requesterName = req.requester?.name || 'Spot User';
const requesterGoal = req.requester?.goal;
const requesterGym = req.requester?.gym;

return (
<View key={req.id} style={styles.card}>

<View style={styles.infoBlock}>
<Text style={styles.name}>{requesterName}</Text>

{!!requesterGoal && (
<Text style={styles.meta}>Goal: {requesterGoal}</Text>
)}

{!!requesterGym && (
<Text style={styles.meta}>Gym: {requesterGym}</Text>
)}
</View>

<View style={styles.buttonColumn}>

<Pressable
style={styles.acceptBtn}
onPress={() => updateConnectionStatus(req.id, 'accepted')}
>
<Text style={styles.acceptText}>Accept</Text>
</Pressable>

<Pressable
style={styles.declineBtn}
onPress={() => updateConnectionStatus(req.id, 'declined')}
>
<Text style={styles.declineText}>Decline</Text>
</Pressable>

</View>

</View>
);
})}

{meetJoinRequests.map(req => {
const userName = req.user?.name || 'Fit User';
const meetTitle = req.meet?.title || 'Meet';

return (
<View key={req.id} style={styles.card}>
<View style={styles.infoBlock}>
<Text style={styles.name}>{userName}</Text>
<Text style={styles.meta}>Requested to join:</Text>
<Text style={styles.meta}>{meetTitle}</Text>
</View>

<View style={styles.buttonColumn}>
<Pressable
style={styles.acceptBtn}
onPress={() =>
updateMeetJoinRequestStatus(
req.id,
req.meet_id,
'approved'
)
}
>
<Text style={styles.acceptText}>Approve</Text>
</Pressable>

<Pressable
style={styles.declineBtn}
onPress={() =>
updateMeetJoinRequestStatus(
req.id,
req.meet_id,
'declined'
)
}
>
<Text style={styles.declineText}>Decline</Text>
</Pressable>
</View>
</View>
);
})}
</ScrollView>
);
}

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: '#050816' },
content: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 120 },
header: { color: '#22FF88', fontSize: 28, fontWeight: '800', marginBottom: 8 },
subheader: { color: '#9CA3AF', fontSize: 15, marginBottom: 20 },
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
infoBlock: { flex: 1, marginRight: 10 },
name: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 4 },
meta: { color: '#9CA3AF', fontSize: 13, marginBottom: 2 },
buttonColumn: { width: 92 },
acceptBtn: {
backgroundColor: '#22FF88',
paddingVertical: 10,
borderRadius: 10,
alignItems: 'center',
marginBottom: 8,
},
acceptText: { color: '#050816', fontWeight: '800' },
declineBtn: {
borderWidth: 1,
borderColor: '#22FF88',
paddingVertical: 10,
borderRadius: 10,
alignItems: 'center',
},
declineText: { color: '#22FF88', fontWeight: '700' },
});
