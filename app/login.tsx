import { router } from 'expo-router'
import { useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { supabase } from '../lib/supabase'

export default function LoginScreen() {
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [loading, setLoading] = useState(false)

const handleLogin = async () => {
if (!email || !password) {
Alert.alert('Enter email and password')
return
}

setLoading(true)

const { data, error } = await supabase.auth.signInWithPassword({
email,
password,
});

if (error) {
    alert(error.message);
    return;
}

if (data?.user) {
    await supabase.from('profiles').insert([
        {
            id: data.user.id,
            name: '',
            level: '',
            goal: '',
            gym: '',
            availability: '',
            profile_image: '',
        },
    ]);
}


setLoading(false)

if (error) {
Alert.alert(error.message)
return
}

router.replace('/(tabs)')
}

return (
<View style={styles.container}>
<Text style={styles.header}>Spot Me</Text>

<TextInput
placeholder="Email"
placeholderTextColor="#9CA3AF"
value={email}
onChangeText={setEmail}
autoCapitalize="none"
style={styles.input}
/>

<TextInput
placeholder="Password"
placeholderTextColor="#9CA3AF"
secureTextEntry
value={password}
onChangeText={setPassword}
style={styles.input}
/>

<Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
<Text style={styles.buttonText}>
{loading ? 'Logging in...' : 'Login'}
</Text>
</Pressable>

<Pressable onPress={() => router.push('/signup')}>
<Text style={styles.link}>
Don’t have an account? Sign up

</Text>
</Pressable>
</View>
)
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#050816',
justifyContent: 'center',
paddingHorizontal: 30,
},
header: {
color: '#22FF88',
fontSize: 32,
fontWeight: '800',
marginBottom: 40,
textAlign: 'center',
},
input: {
backgroundColor: '#111827',
borderRadius: 12,
padding: 14,
color: '#fff',
marginBottom: 16,
},
button: {
backgroundColor: '#22FF88',
padding: 14,
borderRadius: 12,
alignItems: 'center',
},
buttonText: {
fontWeight: '800',
color: '#050816',
},
link: {
color: '#22FF88',
textAlign: 'center',
marginTop: 20,
},
})