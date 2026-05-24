import { useFocusEffect } from '@react-navigation/native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { supabase } from '../../lib/supabase';

export default function HomeScreen() {
const [totalConnections, setTotalConnections] = useState(0);
const [totalMeets, setTotalMeets] = useState(0);
const [calendarItems, setCalendarItems] = useState<any[]>([]);
const [selectedDate, setSelectedDate] = useState<string | null>(null);
const [profileId, setProfileId] = useState<string | null>(null);

// 🔔 Load data
useFocusEffect(
useCallback(() => {
const loadHomeData = async () => {
    if (!profileId) return;

const { data: calendar } = await supabase
.from('calendar_items')
.select('*')
.eq('profile_id', profileId);

setCalendarItems(calendar || []);

const { data: meets } = await supabase
.from('meets')
.select('*');

setTotalMeets(meets?.length || 0);

const { data: connections } = await supabase
.from('connections')
.select('*');

setTotalConnections(connections?.length || 0);
};

loadHomeData();
}, [profileId])
);

// 🔔 Register push permissions
const registerForPushNotifications = async () => {
if (!Device.isDevice) return;

const { status: existingStatus } =
await Notifications.getPermissionsAsync();

let finalStatus = existingStatus;

if (existingStatus !== 'granted') {
const { status } =
await Notifications.requestPermissionsAsync();
finalStatus = status;
}

if (finalStatus !== 'granted') return;


const tokenData =
await Notifications.
getExpoPushTokenAsync();


await supabase
.from('profiles')
.update({ push_token: tokenData.data })
.eq('id', profileId);
};

useEffect(() => {
    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setProfileId(user.id);
        }
    };

    getUser();
}, []);

useEffect(() => {
registerForPushNotifications()
;

}, []);

// 🔔 Handle notification tap
useEffect(() => {
const subscription =
Notifications.
addNotificationResponseReceivedListener(

(response) => {
const date =
response.notification.request.
content.data?.date;


if (date) {
const parsed = new Date(date);
if (!isNaN(parsed.getTime())) {
const formatted =
parsed.toISOString().split('T'
)[0];

setSelectedDate(formatted);
}
}
}
);

return () => subscription.remove();
}, []);

// 🔥 Multi-dot marking with meet-type colors
const markedDates = calendarItems.reduce(
(acc: any, item) => {
if (!item?.date) return acc;

const parsedDate = new Date(item.date);
if (isNaN(parsedDate.getTime())) return acc;

const formatted =
parsedDate.getFullYear() +
'-' +
String(parsedDate.getMonth() + 1).padStart(2, '0') +
'-' +
String(parsedDate.getDate()).padStart(2, '0');

if (!acc[formatted]) {
acc[formatted] = { dots: [] };
}

const dotColor =
item.meet_type === 'Gym'
? '#22FF88'
: item.meet_type === 'Run'
? '#3B82F6'
: item.meet_type === 'Hike'
? '#FACC15'
: item.meet_type === 'Miscellaneous'
? '#EF4444'
: '#22FF88';


acc[formatted].dots.push({
key: item.id,
color: dotColor,
});

return acc;
},
{}
);

if (selectedDate) {
markedDates[selectedDate] = {
...(markedDates[selectedDate] || {}),
selected: true,
selectedColor: '#22FF88',
};
}

const itemsForSelectedDate = calendarItems.filter(
(item) => {
if (!selectedDate || !item?.date)
return false;

const parsedDate = new Date(item.date);
if (isNaN(parsedDate.getTime()))
return false;

const formatted =
parsedDate.getFullYear() +
'-' +
String(parsedDate.getMonth() + 1).padStart(2, '0') +
'-' +
String(parsedDate.getDate()).padStart(2, '0');


return formatted === selectedDate;
}
);

return (
<ScrollView
style={styles.container}
contentContainerStyle={styles.
content}
>
<Text style={styles.header}>Spot Me</Text>


<Text style={styles.subheader}>
Your fitness community, all in one place.
</Text>

<View style={styles.heroCard}>
<Text style={styles.heroTitle}>
Your Calendar
</Text>

<Calendar
markingType="multi-dot"
markedDates={markedDates}
onDayPress={(day) =>
setSelectedDate(day.
dateString)

}
theme={{
backgroundColor: '#0B1220',
calendarBackground: '#0B1220',
dayTextColor: '#FFFFFF',
monthTextColor: '#22FF88',
todayTextColor: '#22FF88',
arrowColor: '#22FF88',
textDisabledColor: '#374151',
selectedDayTextColor: '#050816',
}}
/>

{selectedDate &&
itemsForSelectedDate.length > 0 && (
<View style={{ marginTop: 15 }}>
{itemsForSelectedDate.map(
(item) => (
<View
key={item.id}
style={{ marginBottom: 8 }}
>
<Text style={styles.heroStat}>
{item.title}
</Text>

{item.location && (
<Text style={styles.heroText}>
📍 {item.location}
</Text>
)}

<Text style={styles.heroText}>
🕒{' '}
{new Date(
item.date
).toLocaleString()}
</Text>

{item.meet_type && (
<Text style={styles.heroText}>
{item.meet_type} Meet
</Text>
)}

</View>
)
)}
</View>
)}

{selectedDate &&
itemsForSelectedDate.length ===
0 && (
<Text
style={[
styles.heroText,
{ marginTop: 10 },
]}
>
Nothing scheduled for this date.
</Text>
)}
</View>

<View style={styles.card}>
<Text style={styles.cardTitle}>
Everyday Motivation
</Text>
<Text style={styles.cardText}>
• I believe in my skills and abilities.
</Text>
<Text style={styles.cardText}>
• I am strong, capable, and resilient.
</Text>
<Text style={styles.cardText}>
• I am proud of who I am becoming.
</Text>
</View>

<View style={styles.card}>
<Text style={styles.cardTitle}>
Quick Stats
</Text>
<Text style={styles.cardText}>
Total Meets Created: {totalMeets}
</Text>
<Text style={styles.cardText}>
Total Connections: {totalConnections}
</Text>
</View>

<View style={styles.card}>
<Text style={styles.cardTitle}>
Why 'Spot Me'?
</Text>
<Text style={styles.cardText}>
Find gym partners, running partners, hiking partners, join meets,
and train for real events with
people near you.
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