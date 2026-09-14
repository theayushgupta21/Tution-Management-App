import { StyleSheet, Text, View } from 'react-native';
import theme from '../constants/theme';

export default function Avatar({
  name = 'T',
  size = 52,
  backgroundColor = theme.colors.primarySoft,
  textColor = theme.colors.primaryStrong,
  style = undefined,
}) {
  const initial = (name || 'T').charAt(0).toUpperCase();

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: textColor, fontSize: Math.max(size * 0.38, 18) }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  text: {
    fontWeight: '800',
  },
});
