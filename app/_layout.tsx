import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';

export default function RootLayout() {
const [isReady, setIsReady] = useState(false);
const [showTerms, setShowTerms] = useState(false);

useEffect(() => {
const checkTerms = async () => {
const accepted = await AsyncStorage.getItem('termsAccepted');
if (!accepted) {
setShowTerms(true);
}
setIsReady(true);
};

checkTerms();
}, []);

if (!isReady) return null;

return (
<Stack screenOptions={{ headerShown: false }}>
{showTerms ? (
<>
<Stack.Screen name="terms" />
<Stack.Screen name="privacy" />
</>
) : (
<>
<Stack.Screen name="(tabs)" />
<Stack.Screen name="privacy" />
</>
)}
</Stack>
);
}