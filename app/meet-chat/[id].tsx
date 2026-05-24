import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

export default function MeetChatScreen() {
const params = useLocalSearchParams();
const id = typeof params.id === 'string' ? params.id : undefined;

const flatListRef = useRef<FlatList>(null);

const [messages, setMessages] = useState<any[]>([]);
const [newMessage, setNewMessage] = useState('');
const [userId, setUserId] = useState<string | null>(null);

useEffect(() => {
const getUser = async () => {
const { data } = await supabase.auth.getUser();
setUserId(data.user?.id || null);
};

getUser();
}, []);

const loadMessages = async () => {
if (!id) return;

const { data, error } = await supabase
.from('meet_messages')
.select('*')
.eq('meet_id', id)
.order('created_at', { ascending: true });

if (error) {
console.log('LOAD MEET MESSAGES ERROR:', error);
return;
}

setMessages(data || []);

setTimeout(() => {
flatListRef.current?.scrollToEnd({ animated: true });
}, 100);
};

useEffect(() => {
loadMessages();
}, [id]);

const sendMessage = async () => {
if (!newMessage.trim() || !userId || !id) return;

const { error } = await supabase
.from('meet_messages')
.insert([
{
meet_id: id,
sender_id: userId,
content: newMessage.trim(),
},
]);

if (error) {
console.log('SEND MEET MESSAGE ERROR:', error);
return;
}

setNewMessage('');
loadMessages();
};

return (
<SafeAreaView style={styles.safeArea}>
<KeyboardAvoidingView
style={styles.container}
behavior={Platform.OS === 'ios' ? 'padding' : undefined}
>
<FlatList
ref={flatListRef}
data={messages}
keyExtractor={(item) => item.id.toString()}
contentContainerStyle={styles.messagesContainer}
renderItem={({ item }) => {
const isMine = item.sender_id === userId;

return (
<View
style={[
styles.messageBubble,
isMine ? styles.myMessage : styles.otherMessage,
]}
>
<Text
style={
isMine
? styles.myMessageText
: styles.otherMessageText
}
>
{item.content}
</Text>
</View>
);
}}
/>

<View style={styles.inputContainer}>
<View style={styles.inputWrapper}>
<TextInput
style={styles.input}
placeholder="Type a message..."
placeholderTextColor="#9CA3AF"
value={newMessage}
onChangeText={setNewMessage}
multiline
/>

<Pressable
style={styles.sendButton}
onPress={sendMessage}
>
<Text style={styles.sendText}>Send</Text>
</Pressable>
</View>
</View>
</KeyboardAvoidingView>
</SafeAreaView>
);
}

const styles = StyleSheet.create({
safeArea: {
flex: 1,
backgroundColor: '#050816',
},
container: {
flex: 1,
},
messagesContainer: {
paddingHorizontal: 16,
paddingTop: 20,
paddingBottom: 10,
},
messageBubble: {
paddingVertical: 10,
paddingHorizontal: 14,
borderRadius: 20,
marginBottom: 10,
maxWidth: '75%',
},
myMessage: {
alignSelf: 'flex-end',
backgroundColor: '#22FF88',
},
otherMessage: {
alignSelf: 'flex-start',
backgroundColor: '#1F2937',
},
myMessageText: {
color: '#1F2937',
fontSize: 15,
},
otherMessageText: {
color: '#FFFFFF',
fontSize: 15,
},
inputContainer: {
paddingHorizontal: 12,
paddingVertical: 12,
backgroundColor: '#050816',
borderTopWidth: 1,
borderColor: '#1F2937',
},
inputWrapper: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: '#0B1220',
borderRadius: 30,
paddingHorizontal: 12,
paddingVertical: 6,
},
input: {
flex: 1,
color: '#FFFFFF',
fontSize: 15,
paddingVertical: 8,
paddingHorizontal: 8,
},
sendButton: {
backgroundColor: '#22FF88',
paddingHorizontal: 18,
paddingVertical: 10,
borderRadius: 20,
marginLeft: 8,
},
sendText: {
fontWeight: '800',
color: '#050816',
},
});
