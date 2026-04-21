import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function EditProfileScreen() {
const [profileId, setProfileId] = useState<string | null>(null);

const [name, setName] = useState('');
const [level, setLevel] = useState('');
const [goal, setGoal] = useState('');
const [gym, setGym] = useState('');
const [availability, setAvailability] = useState('');
const [profileImage, setProfileImage] = useState('');

// 🔥 Load profile directly from Supabase
useEffect(() => {
const loadProfile = async () => {
const { data } = await supabase
.from('profiles')
.select('*')
.eq('id', 'e8fb8729-6bd5-44d8-8785-63b7f001ad82')
.single();

if (data) {
setProfileId(data.id);
setName(data.name || '');
setLevel(data.level || '');
setGoal(data.goal || '');
setGym(data.gym || '');
setAvailability(data.availability || '');
setProfileImage(data.profile_image || '');
}
};

loadProfile();
}, []);


const pickImage = async () => {
const permissionResult =
await ImagePicker.
requestMediaLibraryPermissionsAsync();


if (!permissionResult.granted) {
alert('Permission to access photos is required.');
return;
}

const result = await ImagePicker.
launchImageLibraryAsync({

mediaTypes: ['images'],
allowsEditing: true,
aspect: [1, 1],
quality: 0.8,
});

if (!result.canceled) {
setProfileImage(result.assets[
0].uri);

}
};

const saveProfile = async () => {
let imageUrl = profileImage;

if (profileImage && !profileImage.startsWith('http')) {

const fileName = `profiles/${Date.now()}.jpg`;

const response = await fetch(profileImage);
const arrayBuffer = await response.arrayBuffer();

const { error: uploadError } = await supabase.storage
.from('profile-images')
.upload(fileName, arrayBuffer, {
contentType: 'image/jpeg',
upsert: true,
});

if (uploadError) {
alert(`Image upload failed: ${uploadError.message}`);
return;
}

const { data: publicUrlData } = supabase.storage
.from('profile-images')
.getPublicUrl(fileName);

imageUrl = publicUrlData.publicUrl;
}

const { error } = await supabase
.from('profiles')
.upsert(
[
{
id: profileId,
name,
level,
goal,
gym,
availability,
profile_image: imageUrl,
},
],
{ onConflict: 'id' }
);

if (error) {
alert(`Profile save failed: ${error.message}`);

return;
}

alert('Profile updated ✅');
router.back();
};

return (
<ScrollView style={styles.container} contentContainerStyle={styles.content}>
<Text style={styles.header}>Edit Profile</Text>
<Text style={styles.subheader}>Update your Spot Me information.</Text>

<View style={styles.photoSection}>
{profileImage ? (
<Image source={{ uri: profileImage }} style={styles.avatar} />
) : (
<View style={styles.avatarPlaceholder}>
<Text style={styles.avatarPlaceholderText}>+</Text>
</View>
)}

<Pressable style={styles.photoButton} onPress={pickImage}>
<Text style={styles.photoButtonText}>
{profileImage ? 'Change Photo' : 'Add Profile Photo'}
</Text>
</Pressable>
</View>

<TextInput
style={styles.input}
placeholder="Name"
placeholderTextColor="#9CA3AF"
value={name}
onChangeText={setName}
/>

<TextInput
style={styles.input}
placeholder="Fitness Level"
placeholderTextColor="#9CA3AF"
value={level}
onChangeText={setLevel}
/>

<TextInput
style={styles.input}
placeholder="Goal"
placeholderTextColor="#9CA3AF"
value={goal}
onChangeText={setGoal}
/>

<TextInput
style={styles.input}
placeholder="Home Gym"
placeholderTextColor="#9CA3AF"
value={gym}
onChangeText={setGym}
/>

<TextInput
style={styles.input}
placeholder="Availability"
placeholderTextColor="#9CA3AF"
value={availability}
onChangeText={setAvailability}
/>

<Pressable style={styles.saveButton} onPress={saveProfile}>
<Text style={styles.saveButtonText}>Save Changes</Text>
</Pressable>

<Pressable style={styles.cancelButton} onPress={() => router.back()}>
<Text style={styles.cancelButtonText}>Cancel</Text>
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
},
subheader: {
color: '#9CA3AF',
fontSize: 15,
marginTop: 8,
marginBottom: 20,
},
photoSection: {
alignItems: 'center',
marginBottom: 20,
},
avatar: {
width: 96,
height: 96,
borderRadius: 48,
marginBottom: 12,
},
avatarPlaceholder: {
width: 96,
height: 96,
borderRadius: 48,
backgroundColor: '#111827',
borderWidth: 1,
borderColor: '#1F2937',
alignItems: 'center',
justifyContent: 'center',
marginBottom: 12,
},
avatarPlaceholderText: {
color: '#22FF88',
fontSize: 30,
fontWeight: '800',
},
photoButton: {
borderWidth: 1,
borderColor: '#22FF88',
borderRadius: 12,
paddingHorizontal: 14,
paddingVertical: 10,
},
photoButtonText: {
color: '#22FF88',
fontWeight: '700',
},
input: {
backgroundColor: '#111827',
borderWidth: 1,
borderColor: '#1F2937',
borderRadius: 14,
paddingHorizontal: 14,
paddingVertical: 14,
color: '#FFFFFF',
marginBottom: 14,
},
saveButton: {
backgroundColor: '#22FF88',
borderRadius: 14,
paddingVertical: 14,
alignItems: 'center',
marginTop: 10,
marginBottom: 12,
},
saveButtonText: {
color: '#050816',
fontWeight: '800',
fontSize: 16,
},
cancelButton: {
borderWidth: 1,
borderColor: '#22FF88',
borderRadius: 14,
paddingVertical: 14,
alignItems: 'center',
},
cancelButtonText: {
color: '#22FF88',
fontWeight: '700',
fontSize: 16,
},
});