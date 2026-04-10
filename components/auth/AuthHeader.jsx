import { View, StyleSheet } from 'react-native'
import { Colors } from '../../constants/Colors'

const AuthHeader = () => {
    return (
        <View style={styles.topHalf} />
    )
}

export default AuthHeader

const styles = StyleSheet.create({
    topHalf: {
        height: 220,
        backgroundColor: Colors.primaryDark,
    },
})