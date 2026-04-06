import { View, Text, StyleSheet, Image } from 'react-native'
import { Colors } from '../../constants/Colors'

const LogoCard = () => {
    return (
        <View style={styles.logoCard}>
            <Image
                source={require('../../assets/img/cons_safe.png')}
                style={styles.logo}
                resizeMode="contain"
            />
            <Text style={styles.logoText}>CONSAFE{'\n'}PATH</Text>
        </View>
    )
}

export default LogoCard

const styles = StyleSheet.create({
    logoCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 32,
        paddingVertical: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 20,
    },
    logo: {
        width: 72,
        height: 72,
        marginBottom: 8,
    },
    logoText: {
        color: Colors.primaryDark,
        fontWeight: '800',
        fontSize: 13,
        textAlign: 'center',
        letterSpacing: 1,
    },
})

