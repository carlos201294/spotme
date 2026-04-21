import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function HomeScreen() {
const [calendarMeets, setCalendarMeets] = useState<any[]>([]);
const [totalConnections, setTotalConnections] = useState(0);
const [totalMeets, setTotalMeets] = useState(0);
const [calendarItems, setCalendarItems] = useState<any[]>([]);

const loadHomeData = async () => {

// Load calendar items
const { data: calendar } = await supabase
.from('calendar_items')
.select('*')
.eq('profile_id', 'e8fb8729-6bd5-44d8-8785-63b7f001ad82')
.order('created_at', { ascending: false });

setCalendarItems(calendar || []);

// Load meets count
const { data: meets } = await supabase
.from('meets')
.select('*');

setTotalMeets(meets?.length || 0);

// Load connections
const { data: connections } = await supabase
.from('connections')
.select('*');

setTotalConnections(connections?.length || 0);
};

useFocusEffect(
useCallback(() => {
loadHomeData();
}, [])
);

return (
<ScrollView style={styles.container} contentContainerStyle={styles.content}>
<Text style={styles.header}>CommitMix</Text>
<Text style={styles.subheader}>
Your fitness community, all in one place.
</Text>

{/* CALENDAR */}
<View style={styles.heroCard}>
<Text style={styles.heroTitle}>Your Calendar</Text>

{calendarItems.length === 0 ? (
<Text style={styles.heroText}>
Nothing scheduled yet.
</Text>
) : (
calendarItems.slice(0, 3).map((item) => (
<View key={item.id} style={{ marginBottom: 10 }}>
<Text style={styles.heroStat}>{item.title}</Text>
<Text style={styles.heroText}>{item.date}</Text>
<Text style={styles.heroText}>
{item.type === 'meet' ? 'Meet' : 'Event'}
</Text>
</View>
))
)}
</View>

{/* TODAY'S MOTIVATION */}
<View style={styles.card}>
<Text style={styles.cardTitle}>Today’s Motivation</Text>

<Text style={styles.cardText}>
• I believe in my skills and abilities.
</Text>
<Text style={styles.cardText}>
• I am strong, capable, and resilient.
</Text>
<Text style={styles.cardText}>
• I am proud of who I am becoming.
</Text>
<Text style={styles.cardText}>
• I am enough.
</Text>
</View>

{/* QUICK STATS */}
<View style={styles.card}>
<Text style={styles.cardTitle}>Quick Stats</Text>
<Text style={styles.cardText}>
Total Meets Created: {totalMeets}
</Text>
<Text style={styles.cardText}>
Total Connections: {totalConnections}
</Text>
</View>

{/* WHY SPOT ME */}
<View style={styles.card}>
<Text style={styles.cardTitle}>Why CommitMix?</Text>
<Text style={styles.cardText}>
Find gym partners, join meets, and train for real events
with people near you.
</Text>
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
header: {
color: '#22FF88',
fontSize: 34,
fontWeight: '800',
letterSpacing: 0.3,
},
subheader: {
color: '#9CA3AF',
fontSize: 15,
marginTop: 8,
marginBottom: 22,
lineHeight: 22,
},
heroCard: {
backgroundColor: '#0B1220',
borderRadius: 22,
padding: 20,
marginBottom: 18,
borderWidth: 1,
borderColor: '#22FF88',
},
heroTitle: {
color: '#FFFFFF',
fontSize: 20,
fontWeight: '700',
marginBottom: 12,
},
heroStat: {
color: '#22FF88',
fontSize: 18,
fontWeight: '800',
},
heroText: {
color: '#D1D5DB',
marginBottom: 4,
lineHeight: 22,
},
card: {
backgroundColor: '#111827',
borderRadius: 20,
padding: 18,
marginBottom: 16,
borderWidth: 1,
borderColor: '#1F2937',
},
cardTitle: {
color: '#FFFFFF',
fontSize: 19,
fontWeight: '700',
marginBottom: 10,
},
cardText: {
color: '#9CA3AF',
marginBottom: 8,
lineHeight: 22,
},
});