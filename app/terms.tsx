import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const CURRENT_TERMS_VERSION = '2.0';

export default function TermsScreen() {
const [ageConfirmed, setAgeConfirmed] = useState(false);
const [agreed, setAgreed] = useState(false);
const navigation = useNavigation();

// 🔒 Disable back swipe
useEffect(() => {
navigation.setOptions({
headerShown: false,
gestureEnabled: false,
});
}, []);

const handleContinue = async () => {
await AsyncStorage.setItem('termsVersion', CURRENT_TERMS_VERSION);

router.replace('/(tabs)');
};

return (
<View style={styles.container}>
<ScrollView contentContainerStyle={styles.
content}>

<Text style={styles.header}>Commitix Terms & Conditions</Text>

<Text style={styles.text}>
You must be 18 years or older to use this app. Commitix is a
social fitness coordination platform that allows users to
create and join fitness-related meetups and events.
</Text>

<Text style={styles.text}>
Commitix does not supervise, organize, or control in-person
meetings. Any meetups arranged through this platform are done
entirely at your own risk.
</Text>

<Text style={styles.text}>
By using this app, you acknowledge and accept full
responsibility for your safety, conduct, and decisions.
Commitix is not liable for injury, damages, loss, theft,
harassment, or any incidents that occur before, during,
or after in-person meetings.
</Text>

<Text style={styles.text}>
Continued use of this app constitutes agreement to these
Terms & Conditions and the Privacy Policy.
</Text>

{/* Privacy Link */}
<Pressable onPress={() => router.push('/privacy')}>
<Text style={{ color: '#22FF88', marginBottom: 20 }}>
View Privacy Policy
</Text>
</Pressable>

{/* Checkbox 1 */}
<Pressable
style={styles.checkboxRow}
onPress={() => setAgeConfirmed(!ageConfirmed)}
>
<View style={[styles.checkbox, ageConfirmed && styles.checked]} />
<Text style={styles.checkboxText}>
I confirm I am 18 years or older
</Text>
</Pressable>

{/* Checkbox 2 */}
<Pressable
style={styles.checkboxRow}
onPress={() => setAgreed(!agreed)}
>
<View style={[styles.checkbox, agreed && styles.checked]} />
<Text style={styles.checkboxText}>
I agree to the Terms & Conditions
</Text>
</Pressable>

<Pressable
style={[
styles.button,
!(ageConfirmed && agreed) && styles.buttonDisabled,
]}
disabled={!(ageConfirmed && agreed)}
onPress={handleContinue}
>
<Text style={styles.buttonText}>Continue</Text>
</Pressable>
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
text: {
color: '#9CA3AF',
fontSize: 14,
marginBottom: 16,
lineHeight: 22,
},
checkboxRow: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 16,
},
checkbox: {
width: 20,
height: 20,
borderWidth: 2,
borderColor: '#22FF88',
marginRight: 12,
},
checked: {
backgroundColor: '#22FF88',
},
checkboxText: {
color: '#FFFFFF',
fontSize: 14,
},
button: {
backgroundColor: '#22FF88',
paddingVertical: 14,
borderRadius: 12,
alignItems: 'center',
marginTop: 24,
},
buttonDisabled: {
backgroundColor: '#1F2937',
},
buttonText: {
color: '#050816',
fontWeight: '800',
fontSize: 16,
},
});