import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function ProfileScreen() {
const [profile, setProfile] = useState<any | null>(null);
const [loading, setLoading] = useState(true);
const router = useRouter();
const [bio, setBio] = useState('');

const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
};

const loadProfile = async () => {
setLoading(true);

const { data: { user }, error: userError } = await supabase.auth.getUser();

console.log("CURRENT AUTH USER ID:", user?.id);

if (userError || !user) {
console.log('Auth error or no user:', userError);
setLoading(false);
return;
}

const { data, error } = await supabase
.from('profiles')
.select('*')
.eq('id', user.id)
.maybeSingle();

if (error) {
console.log('Profile fetch error:', error);
setLoading(false);
return;
}

if (!data) {
console.log('No profile row found for this user');
setLoading(false);
return;
}

console.log('PROFILE SCREEN ID:', data.id);
setProfile(data);
setLoading(false);
};

useFocusEffect(
useCallback(() => {
loadProfile();
}, [])
);

if (loading) {
return (
<View style={styles.container}>
<Text style={{ color: '#fff', marginTop: 100, textAlign: 'center' }}>
Loading...
</Text>
</View>
);
}

if (!profile) {
return (
<View style={styles.container}>
<Text style={{ color: '#fff', marginTop: 100, textAlign: 'center' }}>
No profile found.
</Text>
</View>
);
}

return (
<ScrollView style={styles.container} contentContainerStyle={styles.content}>
{/* Header */}
<View style={styles.headerRow}>
<Text style={styles.header}>Profile</Text>

<View style={styles.iconRow}>
<Pressable onPress={() => router.push('/connections')}>
<Ionicons name="people-outline" size={26} color="#22FF88" />
</Pressable>

<Pressable onPress={() => router.push('/requests')}>
<Ionicons name="notifications-outline" size={26} color="#22FF88" />
</Pressable>
</View>
</View>

<Text style={styles.subheader}>
Your identity on Spot Me
</Text>

{/* Profile Card */}
<View
style={[
    styles.profileCard,
    { backgroundColor: profile.card_background || '#0B1220' },
]}
>
<Image
source={{
uri:
profile.profile_image ||
'https://i.imgur.com/6VBx3io.png',
}}
style={styles.avatar}
/>

<Text style={styles.name}>{profile.name || 'Fit User'}</Text>

<View style={styles.levelBadge}>
<Text style={styles.levelText}>
{profile.level || 'Beginner'}
</Text>
</View>

<Text style={styles.meta}>Goal: {profile.goal}</Text>
<Text style={styles.meta}>Home Gym: {profile.gym}</Text>
<Text style={styles.meta}>
Availability: {profile.availability}
</Text>
</View>

{/* Stats */}
<View style={styles.statsCard}>
<Text style={styles.statsTitle}>Bio</Text>

<Text style={styles.statsText}>
{profile.bio || 'No bio added yet.'}
</Text>
</View>

{/* Edit Button */}
<Pressable
style={styles.editButton}
onPress={() => router.push('/edit-profile')}
>
<Text style={styles.editButtonText}>Edit Profile</Text>
</Pressable>

<Pressable
style={[styles.editButton, {marginTop: 12, backgroundColor: '#Ef4444'}]}
onPress={handleLogout}
>
    <Text style={styles.editButtonText}>Log Out</Text>
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
paddingHorizontal: 16,
paddingBottom: 70,
},
headerRow: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
},
header: {
color: '#22FF88',
fontSize: 30,
fontWeight: '800',
},
iconRow: {
flexDirection: 'row',
gap: 12,
},
subheader: {
color: '#9CA3AF',
fontSize: 16,
marginTop: 16,
marginBottom: 14,
},
profileCard: {
backgroundColor: '#0B1220',
borderRadius: 22,
padding: 34,
marginTop: 18,
borderWidth: 1,
borderColor: '#22FF88',
alignItems: 'center',
marginBottom: 22,
},
avatar: {
width: 92,
height: 92,
borderRadius: 999,
marginBottom: 18,
},
name: {
color: '#FFFFFF',
fontSize: 22,
fontWeight: '800',
marginBottom: 10,
},
levelBadge: {
backgroundColor: '#22FF88',
paddingHorizontal: 18,
paddingVertical: 8,
borderRadius: 999,
marginBottom: 16,
},
levelText: {
color: '#050816',
fontWeight: '800',
fontSize: 14,
},
meta: {
color: '#9CA3AF',
fontSize: 15,
marginBottom: 6,
},
statsCard: {
backgroundColor: '#111827',
borderRadius: 20,
padding: 16,
marginBottom: 18,
},
statsTitle: {
color: '#FFFFFF',
fontSize: 18,
fontWeight: '700',
marginBottom: 6,
},
statsText: {
color: '#9CA3AF',
fontSize: 14,
textAlign: 'center',
},
editButton: {
backgroundColor: '#22FF88',
borderRadius: 18,
paddingVertical: 13,
alignItems: 'center',
},
editButtonText: {
color: '#050816',
fontWeight: '800',
fontSize: 16,
},
});