import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function MeetDetailsScreen() {
const params = useLocalSearchParams();
const attendeeCount = params.attendees || '1';

const [message, setMessage] = useState('');
const [messages, setMessages] = useState([
{ id: 1, sender: 'Alex', text: 'See you all tomorrow 💪' },
{ id: 2, sender: 'Jordan', text: 'I’ll be there at 6:55!' },
]);

const sendMessage = () => {
if (!message.trim()) return;

const newMessage = {
id: Date.now(),
sender: 'You',
text: message,
};

setMessages([...messages, newMessage]);
setMessage('');
};

return (
<ScrollView style={styles.container} contentContainerStyle={styles.content}>
<Text style={styles.header}>Meet Details</Text>

<View style={styles.heroCard}>
<Text style={styles.title}>{params.title || 'Gym Meet'}</Text>
<Text style={styles.info}>Gym: {params.gym || 'Unknown Gym'}</Text>
<Text style={styles.info}>Time: {params.time || 'TBD'}</Text>
<Text style={styles.info}>Level: {params.level || 'Open'}</Text>
<Text style={styles.host}>Host: {params.host || 'Unknown Host'}</Text>
<Text style={styles.attending}>{attendeeCount} attending</Text>
</View>

<View style={styles.card}>
<Text style={styles.sectionTitle}>Attendees</Text>
<Text style={styles.attendee}>• {params.host || 'Alex'} (Host)</Text>

<Text style={styles.attendee}>• Jordan</Text>
<Text style={styles.attendee}>• Mia</Text>
<Text style={styles.attendee}>• You</Text>
</View>

<View style={styles.card}>
<Text style={styles.sectionTitle}>
Group Chat</Text>


{messages.map((msg) => (
<View key={msg.id} style={styles.messageBubble}>
<Text style={styles.messageSender}>{
msg.sender}</Text>
<Text style={styles.messageText}>{msg.text}</Text>

</View>
))}

<TextInput
style={styles.input}
placeholder="Send a message..."
placeholderTextColor="#9CA3AF"
value={message}
onChangeText={setMessage}
/>

<Pressable style={styles.sendButton} onPress={sendMessage}>
<Text style={styles.sendButtonText}>
Send Message</Text>

</Pressable>
</View>

<Pressable style={styles.button} onPress={() => router.back()}>
<Text style={styles.buttonText}>
Back</Text>

</Pressable>
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
marginBottom: 20,
},
heroCard: {
backgroundColor: '#0B1220',
borderRadius: 22,
padding: 20,
marginBottom: 16,
borderWidth: 1,
borderColor: '#22FF88',
},
card: {
backgroundColor: '#111827',
borderRadius: 18,
padding: 18,
marginBottom: 16,
borderWidth: 1,
borderColor: '#1F2937',
},
title: {
color: '#FFFFFF',
fontSize: 22,
fontWeight: '800',
marginBottom: 10,
},
sectionTitle: {
color: '#22FF88',
fontSize: 18,
fontWeight: '700',
marginBottom: 10,
},
info: {
color: '#9CA3AF',
marginBottom: 6,
lineHeight: 22,
},
host: {
color: '#FFFFFF',
fontWeight: '700',
marginTop: 8,
marginBottom: 6,
},
attending: {
color: '#22FF88',
fontWeight: '800',
marginTop: 4,

},
attendee: {
color: '#FFFFFF',
marginBottom: 6,
fontWeight: '600',
},
messageBubble: {
backgroundColor: '#0B1220',
borderRadius: 12,
padding: 12,
marginBottom: 10,
borderWidth: 1,
borderColor: '#1F2937',
},
messageSender: {
color: '#22FF88',
fontWeight: '700',
marginBottom: 4,
},
messageText: {
color: '#FFFFFF',
lineHeight: 20,
},
input: {
backgroundColor: '#0B1220',
borderWidth: 1,
borderColor: '#1F2937',
borderRadius: 12,
paddingHorizontal: 14,
paddingVertical: 12,
color: '#FFFFFF',
marginTop: 10,
marginBottom: 12,
},
sendButton: {
borderWidth: 1,
borderColor: '#22FF88',
borderRadius: 12,
paddingVertical: 12,
alignItems: 'center',
},
sendButtonText: {
color: '#22FF88',
fontWeight: '700',
},
button: {
backgroundColor: '#22FF88',
borderRadius: 14,
paddingVertical: 14,
alignItems: 'center',
marginTop: 8,
},
buttonText: {
color: '#050816',
fontWeight: '800',
fontSize: 16,
},
});