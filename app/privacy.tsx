import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function PrivacyScreen() {
return (
<View style={styles.container}>
<ScrollView contentContainerStyle={styles.content}>
<Text style={styles.header}>Commitix Privacy Policy</Text>

<Text style={styles.text}>
Effective Date: [Insert Date]
</Text>

<Text style={styles.section}>
1. Information We Collect
</Text>
<Text style={styles.text}>
We may collect personal information including your name,
profile image, fitness preferences, gym information, and
account-related data necessary to provide app functionality.
</Text>

<Text style={styles.section}>
2. How We Use Your Information
</Text>
<Text style={styles.text}>
Your information is used to:
{"\n"}• Create and manage your profile
{"\n"}• Display meetups and events
{"\n"}• Enable connections with other users
{"\n"}• Improve app performance and features
</Text>

<Text style={styles.section}>
3. Data Sharing
</Text>
<Text style={styles.text}>
We do not sell your personal data. Information may be visible
to other users within the app based on your profile settings.
</Text>

<Text style={styles.section}>
4. Data Storage
</Text>
<Text style={styles.text}>
Data is securely stored using third-party services including
Supabase infrastructure.
</Text>

<Text style={styles.section}>
5. User Responsibility
</Text>
<Text style={styles.text}>
You are responsible for the information you share publicly
within the app. Commitix is not responsible for misuse of
publicly shared information.
</Text>

<Text style={styles.section}>
6. Changes to This Policy
</Text>
<Text style={styles.text}>
We may update this Privacy Policy periodically. Continued use
of the app constitutes acceptance of updates.
</Text>
</ScrollView>
</View>
);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#050816',
},
content: {
paddingTop: 80,
paddingHorizontal: 24,
paddingBottom: 60,
},
header: {
color: '#22FF88',
fontSize: 26,
fontWeight: '800',
marginBottom: 20,
},
section: {
color: '#FFFFFF',
fontSize: 16,
fontWeight: '700',
marginTop: 18,
marginBottom: 8,
},
text: {
color: '#9CA3AF',
fontSize: 14,
marginBottom: 12,
lineHeight: 22,
},
});