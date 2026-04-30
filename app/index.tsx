import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
useEffect(() => {
const checkTerms = async () => {
const accepted = await AsyncStorage.getItem('termsAccepted');

if (!accepted) {
router.replace('/terms');
} else {
router.replace('/(tabs)');
}
};

checkTerms();
}, []);

return (
<View style={{
flex: 1,
justifyContent: 'center',
alignItems: 'center',
backgroundColor: '#050816'
}}>
<ActivityIndicator color="#22FF88" />
</View>
);
}