import { ImageBackground, StyleSheet, Text, View } from 'react-native';

export default function ExploreScreen() {
return (
<ImageBackground
source={require('../../assets/images/AdobeStock_889343799.jpeg')}
style={styles.container}
imageStyle={styles.backgroundImage}
>
<View style={styles.overlay}>
<View style={styles.centerContent}>
<Text style={styles.header}>Find People</Text>
<Text style={styles.subheader}>
Discover gym partners near you
</Text>
</View>
</View>
</ImageBackground>
);
}

const styles = StyleSheet.create({
container: {
flex: 1,
},
backgroundImage: {
opacity: 0.8,
},
overlay: {
flex: 1,
backgroundColor: 'rgba(0,0,0,0.7)',
},
centerContent: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
paddingHorizontal: 30,
},
header: {
color: '#22FF88',
fontSize: 34,
fontWeight: '800',
textAlign: 'center',
marginBottom: 12,
},
subheader: {
color: '#D1D5DB',
fontSize: 16,
textAlign: 'center',
lineHeight: 24,
},
});