import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';

import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

export default function MeetChat() {

const params = useLocalSearchParams();
const id = typeof params.id === 'string' ? params.id : undefined;

console.log('RAW PARAMS:', params);
console.log('RAW ID:', params.id);
console.log('FINAL ID USED:', id);

const flatListRef = useRef<FlatList>(null);

const [messages, setMessages] = useState<any[]>([]);
const [newMessage, setNewMessage] = useState('');
const [userId, setUserId] = useState<string | null>(null);

const [myProfileImage, setMyProfileImage] = useState('');
const [otherProfileImage, setOtherProfileImage] = useState('');

// Get current user
useEffect(() => {
const getUser = async () => {
const { data } = await supabase.auth.getUser();
setUserId(data.user?.id || null);
};

getUser();
}, []);

// Load messages
const loadMessages = async () => {
if (!id || !userId) return;

const filter = `and(sender_id.eq.${userId},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${userId})`;

console.log('FILTER STRING:', filter);

const { data, error } = await supabase
.from('private_messages')
.select('*')
.or(filter)
.order('created_at', { ascending: true });

if (error) {
console.log('LOAD ERROR:', error);
return;
}

setMessages(data || []);

setTimeout(() => {
flatListRef.current?.scrollToEnd({ animated: true });
}, 100);
};

// Load profile photos
const loadProfiles = async () => {
if (!userId || !id) return;

const { data: myProfile } = await supabase
.from('profiles')
.select('profile_image')
.eq('id', userId)
.single();

const { data: otherProfile } = await supabase
.from('profiles')
.select('profile_image')
.eq('id', id)
.single();

setMyProfileImage(myProfile?.profile_image || '');
setOtherProfileImage(otherProfile?.profile_image || '');
};

useEffect(() => {
if (id && userId) {
loadMessages();
loadProfiles();
}
}, [id, userId]);

// IMAGE FUNCTION
const pickAndSendImage = async () => {
try {
console.log('STEP 1');

const result = await ImagePicker.launchImageLibraryAsync({
mediaTypes: ['images'],
quality: 0.7,
});

console.log('STEP 2');

if (result.canceled) return;

const image = result.assets[0];

console.log('STEP 3', image.uri);

const fileName = `${Date.now()}.jpg`;

const response = await fetch(image.uri);

console.log('STEP 4');

const arrayBuffer = await response.arrayBuffer();

console.log('STEP 5');

const { data, error } = await supabase.storage
.from('chat-images')
.upload(fileName, arrayBuffer, {
contentType: 'image/jpeg',
});

console.log('STEP 6');

console.log('UPLOAD DATA:', data);
console.log('UPLOAD ERROR:', error);

if (error) {
console.log('IMAGE UPLOAD ERROR:', error);
return;
}

console.log('UPLOAD SUCCESS:', data);

const {
data: { publicUrl },
} = supabase.storage
.from('chat-images')
.getPublicUrl(fileName);

console.log('PUBLIC URL:', publicUrl);

const { error: messageError } = await supabase
.from('private_messages')
.insert([
{
sender_id: userId,
receiver_id: id,
content: publicUrl,
},
]);

if (messageError) {
console.log('MESSAGE INSERT ERROR:', messageError);
return;
}

loadMessages();

} catch (err) {
console.log('IMAGE FUNCTION ERROR:', err);

}
};

// Send message
const sendMessage = async () => {
if (!newMessage.trim() || !userId || !id) return;

const { error } = await supabase
.from('private_messages')
.insert([
{
sender_id: userId,
receiver_id: id,
content: newMessage.trim(),
},
]);

if (error) {
console.log('SEND ERROR:', error);
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
styles.messageRow,
{
justifyContent: isMine
? 'flex-end'
: 'flex-start',
},
]}
>
{!isMine && (
<Image
source={{
uri: otherProfileImage,
}}
style={styles.avatar}
/>
)}

<View
style={[
styles.messageBubble,
isMine
? styles.myMessage
: styles.otherMessage,
]}
>
{item.content?.includes('supabase.co/storage') ? (
<Image
source={{ uri: item.content }}
style={styles.chatImage}
resizeMode="cover"
/>
) : (
<Text
style={[
styles.messageText,
isMine
? styles.myMessageText
: styles.otherMessageText,
]}
>
{item.content}
</Text>
)}
</View>

{isMine && (
<Image
source={{
uri: myProfileImage,
}}
style={styles.avatar}
/>
)}

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
style={styles.imageButton}
onPress={pickAndSendImage}
>
<Text style={styles.imageButtonText}>
Image
</Text>
</Pressable>

<Pressable
style={styles.sendButton}
onPress={sendMessage}
>
<Text style={styles.sendText}>
Send
</Text>
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

messageRow: {
flexDirection: 'row',
alignItems: 'flex-end',
marginBottom: 10,
width: '100%',
},

avatar: {
width: 34,
height: 34,
borderRadius: 17,
marginHorizontal: 8,
backgroundColor: '#1F2937',
},

messageBubble: {
paddingVertical: 10,
paddingHorizontal: 14,
borderRadius: 20,
maxWidth: '75%',
},

myMessage: {
backgroundColor: '#22FF88',
},

otherMessage: {
backgroundColor: '#1F2937',
},

messageText: {

fontSize: 15,
},

myMessageText: {
color: '#1F2937',
},

otherMessageText: {
color: '#FFFFFF',
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

imageButton: {
backgroundColor: '#1F2937',
paddingHorizontal: 14,
paddingVertical: 10,
borderRadius: 20,
marginLeft: 8,
},

imageButtonText: {
color: '#FFFFFF',
fontWeight: '700',
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

chatImage: {
width: 220,
height: 220,
borderRadius: 16,
},

});