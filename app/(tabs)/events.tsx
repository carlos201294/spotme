import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { supabase } from '../../lib/supabase';


const events = [
{
id: 1,
title: "Rock 'n' Roll Nashville",
type: 'Running Event',
location: 'Nashville, TN',
date: 'Official event page',
url: 'https://www.runrocknroll.com/events/nashville',
},
{
id: 2,
title: "Rock 'n' Roll San Jose",
type: 'Running Event',
location: 'San Jose, CA',
date: 'Official event page',
url: 'https://www.runrocknroll.com/events/san-jose',
},
{
id: 3,
title: 'HYROX Anaheim',
type: 'Fitness Racing',
location: 'Anaheim, CA',
date: 'Official event page',
url: 'https://hyrox.com/event/hyrox-anaheim-26-27/',
},
{
id: 4,
title: 'HYROX Find My Race',
type: 'Fitness Racing',
location: 'Multiple locations',
date: 'Live race finder',
url: 'https://hyrox.com/find-my-race/',
},
{
id: 5,
title: 'SoCal Spartan Trifecta Weekend',
type: 'Obstacle Race',
location: 'Perris, CA',
date: 'Official event page',
url: 'https://www.spartan.com/en/races/southern-california',
},
{
id: 6,
title: 'SLO CAL Spartan Trifecta Weekend',
type: 'Obstacle Race',
location: 'Central California',
date: 'Official event page',
url: 'https://www.spartan.com/en/races/central-california',
},
{
id: 7,
title: 'Griffith Park Run',
type: 'Run / Half Marathon / 5K',
location: 'Los Angeles, CA',
date: 'Official event page',
url: 'https://runsignup.com/Race/CA/LosAngeles/GriffithParkRun'
,

},
{
id: 8,
title: 'RunSignup Find a Race',
type: 'Race Finder',
location: 'Multiple locations',
date: 'Live race finder',
url: 'https://runsignup.com/races',
},
];

export default function EventsScreen() {
const router = useRouter();
const [searchQuery, setSearchQuery] = useState('');
const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
const [favorites, setFavorites] = useState<number[]>([]);

useEffect(() => {
const loadData = async () => {
const { data: profile } = await supabase
.from('profiles')
.select('id')
.order('created_at', { ascending: false })
.limit(1)
.single();

if (!profile) return;

setCurrentProfileId(profile.id);


};

loadData();
}, []);

const toggleFavorite = async (eventId: number) => {
if (!currentProfileId) return;

const isFavorited = favorites.includes(eventId);

if (isFavorited) {
await supabase
.from('event_favorites')
.delete()
.eq('profile_id', currentProfileId)
.eq('event_id', eventId);

setFavorites((prev) => prev.filter((id) => id !== eventId));
} else {
const { data, error } = await supabase.from('event_favorites').insert([
{
profile_id: currentProfileId,
event_id: eventId,
},
]);

if (error) {
console.log('INSERT ERROR:', error);
} else {
console.log('INSERT SUCCESS:', data);
}

setFavorites((prev) => [...prev, eventId]);

}
};

const openEventLink = async (url: string) => {
const supported = await Linking.canOpenURL(url);
if (!supported) {
alert('Unable to open this event link right now.');
return;
}
await Linking.openURL(url);
};

const filteredEvents = useMemo(() => {
const query = searchQuery.trim().
toLowerCase();


if (!query) return events;

return events.filter((event) => {
return (
event.title.toLowerCase().
includes(query) ||
event.type.toLowerCase().includes(query) ||
event.location.toLowerCase().includes(query)

);
});
}, [searchQuery]);

return (
<View style={styles.container}>
<Text style={styles.header}>Events</
Text>

<Text style={styles.subheader}>
Discover real races, obstacle events, fitness competitions, and runs.
</Text>

<TextInput
style={styles.searchInput}
placeholder="Search events, locations, or types"
placeholderTextColor="#6B7280"
value={searchQuery}
onChangeText={setSearchQuery}
/>

<ScrollView contentContainerStyle={styles.
list}>

{filteredEvents.length === 0 ? (
<View style={styles.emptyCard}>
<Text style={styles.emptyTitle}>No events found</Text>
<Text style={styles.emptyText}>
Try a different event name, location, or event type.
</Text>
</View>
) : (
filteredEvents.map((event) => (
<View key={event.id} style={styles.card}>
{/* TITLE ROW WITH HEART */}
<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
<Text style={styles.title}>{event.title}</Text>
<Pressable onPress={() => toggleFavorite(event.id)}>
<Ionicons
name={favorites.includes(event.id) ? 'heart' : 'heart-outline'}
size={22}
color={favorites.includes(event.id) ? '#22FF88' : '#9CA3AF'}
/>
</Pressable>
</View>

<Text style={styles.info}>Type: {event.type}</Text>
<Text style={styles.info}>Location: {event.location}</Text>
<Text style={styles.info}>Date: {event.date}</Text>

<View style={styles.buttonRow}>
<Pressable
style={styles.primaryButton}
onPress={() => openEventLink(event.url)}
>
<Text style={styles.primaryButtonText}>View Details</Text>

</Pressable>

<Pressable
style={styles.secondaryButton}
onPress={() =>
router.push({
pathname: '/event-partners',
params: { eventId: event.id },
})
}
>
<Text style={styles.secondaryButtonText}>Find Partners</Text>
</Pressable>
</View>
</View>
))
)}
</ScrollView>
</View>
);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#050816',
paddingTop: 60,
paddingHorizontal: 20,
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
searchInput: {
backgroundColor: '#111827',
borderWidth: 1,
borderColor: '#1F2937',
borderRadius: 14,
paddingHorizontal: 14,
paddingVertical: 14,
color: '#FFFFFF',
marginBottom: 18,
},
list: {
paddingBottom: 140,
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
fontSize: 20,
fontWeight: '700',
marginBottom: 10,
},
info: {
color: '#9CA3AF',
marginBottom: 6,
},
buttonRow: {
flexDirection: 'row',
marginTop: 14,
},
primaryButton: {
flex: 1,
backgroundColor: '#22FF88',
borderRadius: 12,
paddingVertical: 12,
alignItems: 'center',
marginRight: 6,
},
primaryButtonText: {
color: '#050816',
fontWeight: '800',
},
secondaryButton: {
flex: 1,
borderWidth: 1,
borderColor: '#22FF88',
borderRadius: 12,
paddingVertical: 12,
alignItems: 'center',
marginLeft: 6,
},
secondaryButtonText: {
color: '#22FF88',
fontWeight: '700',
},
emptyCard: {
backgroundColor: '#111827',
borderRadius: 18,
padding: 18,
borderWidth: 1,
borderColor: '#1F2937',
},
emptyTitle: {
color: '#FFFFFF',
fontSize: 18,
fontWeight: '700',
marginBottom: 8,
},
emptyText: {
color: '#9CA3AF',
lineHeight: 22,
},
});
