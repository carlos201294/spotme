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
const [profile, setProfile] = useState<any>(null);
const router = useRouter();

const loadProfile = async () => {
const { data } = await supabase
.from('profiles')
.select('*')
.order('created_at', { ascending: false })
.limit(1)
.single();

if (data) setProfile(data);
};

useFocusEffect(
useCallback(() => {
loadProfile();
}, [])
);

if (!profile) {
return (
<View style={styles.container}>
<Text style={{ color: '#fff', marginTop: 100, textAlign: 'center' }}>
Loading...
</Text>
</View>
);
}

return (
<ScrollView style={styles.container} contentContainerStyle={styles.
content}>


{/* Header */}
<View style={styles.headerRow}>
<Text style={styles.header}>Me</
Text>


<View style={styles.iconRow}>
<Pressable onPress={() => router.push('/connections')}>
<Ionicons name="people-outline" size={26} color="#22FF88" />
</Pressable>

<Pressable onPress={() => router.push('/notifications')}
>

<Ionicons name="notifications-outline" size={26} color="#22FF88" />
</Pressable>
</View>
</View>

<Text style={styles.subheader}>
Your fitness identity on Spot Me Fit.
</Text>

{/* Profile Card */}
<View style={styles.profileCard}>
<Image
source={{
uri:
profile.avatar_url ||
'https://i.imgur.com/6VBx3io.png',
}}
style={styles.avatar}
/>

<Text style={styles.name}>{profile.name || 'Spot User'}</Text>

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
<Text style={styles.statsTitle}>Stats</Text>
<Text style={styles.statsText}>
Your activity and stats will appear here once you start using the app.
</Text>
</View>

{/* Edit Button */}
<Pressable
style={styles.editButton}
onPress={() => router.push('/edit-profile')}
>
<Text style={styles.editButtonText}>Edit Profile</Text>
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
paddingTop: 28,
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
fontSize: 28,
fontWeight: '800',
},
iconRow: {
flexDirection: 'row',
gap: 12,
},
subheader: {
color: '#9CA3AF',
fontSize: 14,
marginTop: 4,
marginBottom: 14,
},
profileCard: {
backgroundColor: '#0B1220',
borderRadius: 20,
padding: 16,
borderWidth: 1,
borderColor: '#22FF88',
alignItems: 'center',
marginBottom: 16,
},
avatar: {
width: 82,
height: 82,
borderRadius: 999,
marginBottom: 10,
},
name: {
color: '#FFFFFF',
fontSize: 22,
fontWeight: '800',
marginBottom: 6,
},
levelBadge: {
backgroundColor: '#22FF88',
paddingHorizontal: 14,
paddingVertical: 5,
borderRadius: 999,
marginBottom: 10,
},
levelText: {
color: '#050816',
fontWeight: '800',
fontSize: 14,
},
meta: {
color: '#9CA3AF',
fontSize: 14,
marginBottom: 3,
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