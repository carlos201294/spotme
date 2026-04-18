import { router, useLocalSearchParams } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ConnectionDetailsScreen() {
const { name, goal, gym, profileImage } = useLocalSearchParams<{
id: string;
name: string;
goal: string;
gym: string;
profileImage: string;
}>();

const displayName = name || 'Spot User';

return (
<ScrollView style={styles.container} contentContainerStyle={styles.content}>
<Pressable onPress={() => router.back()} style={styles.backButton}>
<Text style={styles.backButtonText}>← Back</Text>
</Pressable>

<View style={styles.heroCard}>
{profileImage ? (
<Image source={{ uri: String(profileImage) }} style={styles.avatar} />
) : (
<View style={styles.avatarPlaceholder}>
<Text style={styles.avatarPlaceholderText}>
{displayName.charAt(0).toUpperCase()}
</Text>
</View>
)}

<Text style={styles.name}>{displayName}</Text>

{!!goal && <Text style={styles.info}>Goal: {goal}</Text>}
{!!gym && <Text style={styles.info}>Gym: {gym}</Text>}
</View>

<View style={styles.card}>
<Text style={styles.sectionTitle}>Connection Actions</Text>

<Pressable style={styles.primaryButton}>
<Text style={styles.primaryButtonText}>Invite to Meet</Text>
</Pressable>

<Pressable style={styles.secondaryButton}>
<Text style={styles.secondaryButtonText}>Message Soon</Text>
</Pressable>
</View>
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
backButton: {
alignSelf: 'flex-start',
marginBottom: 18,
},
backButtonText: {
color: '#22FF88',
fontSize: 16,
fontWeight: '700',
},
heroCard: {
backgroundColor: '#111827',
borderRadius: 22,
padding: 20,
marginBottom: 18,
borderWidth: 1,
borderColor: '#22FF88',
alignItems: 'center',
},
avatar: {
width: 96,
height: 96,
borderRadius: 48,
marginBottom: 14,
},
avatarPlaceholder: {
width: 96,
height: 96,
borderRadius: 48,
backgroundColor: '#0B1220',
justifyContent: 'center',
alignItems: 'center',
marginBottom: 14,
},
avatarPlaceholderText: {
color: '#22FF88',
fontSize: 30,
fontWeight: '800',
},
name: {
color: '#FFFFFF',
fontSize: 24,
fontWeight: '800',
marginBottom: 10,
},
info: {
color: '#9CA3AF',
marginBottom: 6,
lineHeight: 22,
},
card: {
backgroundColor: '#111827',
borderRadius: 20,
padding: 18,
borderWidth: 1,
borderColor: '#1F2937',
},
sectionTitle: {
color: '#FFFFFF',
fontSize: 18,
fontWeight: '700',
marginBottom: 14,
},
primaryButton: {
backgroundColor: '#22FF88',
borderRadius: 14,
paddingVertical: 14,
alignItems: 'center',
marginBottom: 12,
},
primaryButtonText: {
color: '#050816',
fontWeight: '800',
fontSize: 16,
},
secondaryButton: {
borderWidth: 1,
borderColor: '#22FF88',
borderRadius: 14,
paddingVertical: 14,
alignItems: 'center',
},
secondaryButtonText: {
color: '#22FF88',
fontWeight: '700',
fontSize: 16,
},
});