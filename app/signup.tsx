import { router } from 'expo-router'
import { useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { supabase } from '../lib/supabase'

export default function SignupScreen() {
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [loading, setLoading] = useState(false)

const handleSignup = async () => {
if (!email || !password) {
Alert.alert('Enter email and password')
return
}

setLoading(true)

const { data, error } = await supabase.auth.signUp({
email,
password,
})

if (error) {
setLoading(false)
Alert.alert(error.message)
return
}

if (data.user) {
// 🔥 Create matching profile row
await supabase.from('profiles').insert([
{
id: data.user.id,
name: '',
},
])
}

setLoading(false)
router.replace('/(tabs)')
}

return (
<View style={styles.container}>
<Text style={styles.header}>Create Account</Text>

<TextInput
placeholder="Email"
placeholderTextColor="#9CA3AF"
value={email}
onChangeText={setEmail}
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

<Pressable style={styles.button} onPress={handleSignup} disabled={loading}>
<Text style={styles.buttonText}>
{loading ? 'Creating...' : 'Sign Up'}
</Text>
</Pressable>

<Pressable onPress={() => router.push('/login')}>
<Text style={styles.link}>Already have an account? Login</Text>
</Pressable>
</View>
)
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#050816',
justifyContent: 'center',
paddingHorizontal: 24,
},
header: {
color: '#22FF88',
fontSize: 28,
fontWeight: '800',
marginBottom: 30,
textAlign: 'center',
},
input: {
backgroundColor: '#111827',
borderRadius: 12,
padding: 14,
marginBottom: 14,
color: '#fff',
},
button: {
backgroundColor: '#22FF88',
paddingVertical: 14,
borderRadius: 14,
alignItems: 'center',
marginTop: 10,
},
buttonText: {
color: '#050816',
fontWeight: '800',
fontSize: 16,
},
link: {
color: '#22FF88',
textAlign: 'center',
marginTop: 20,
},
})