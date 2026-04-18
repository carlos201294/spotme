import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabsLayout() {
return (
<Tabs
screenOptions={{
headerShown: false,
tabBarActiveTintColor: '#22FF88',
tabBarInactiveTintColor: '#9CA3AF',
tabBarStyle: {
backgroundColor: '#050816',
borderTopColor: '#1F2937',
height: 86,
paddingTop: 8,
paddingBottom: 18,
},
tabBarLabelStyle: {
fontSize: 12,
fontWeight: '600',
marginBottom: 2,
},
}}
>

{/* Home */}
<Tabs.Screen
name="index"
options={{
title: 'Home',
tabBarIcon: ({ color, size }) => (
<Ionicons name="home-outline" size={size} color={color} />
),
}}
/>

{/* Explore (your main Spot page) */}
<Tabs.Screen
name="explore"
options={{
title: 'Discover',
tabBarIcon: ({ color, size }) => (
<MaterialCommunityIcons name="pin" size={size} color={color} />
),
}}
/>

{/* The lowercase find tab — THIS is the one we override */}
<Tabs.Screen
name="find"
options={{
title: 'Find',
tabBarIcon: ({ color, size }) => (
<Ionicons name="binoculars-outline" size={size} color={color} />
),
}}
/>

{/* Meets */}
<Tabs.Screen
name="meets"
options={{
title: 'Meets',
tabBarIcon: ({ color, size }) => (
<MaterialCommunityIcons name="dumbbell" size={size} color={color} />
),
}}
/>

{/* Events */}
<Tabs.Screen
name="events"
options={{
title: 'Events',
tabBarIcon: ({ color, size }) => (
<Ionicons name="calendar-outline" size={size} color={color} />
),
}}
/>

{/* Profile */}
<Tabs.Screen
name="profile"
options={{
title: 'Profile',
tabBarIcon: ({ color, size }) => (
<Ionicons name="person-outline" size={size} color={color} />
),
}}
/>

{/* Hidden routes */}
<Tabs.Screen name="requests" options={{ href: null }} />
<Tabs.Screen name="connections" options={{ href: null }} />
<Tabs.Screen name="connection-details" options={{ href: null }} />

</Tabs>
);
}
