import { StyleSheet, View } from 'react-native';
import theme from '../constants/theme';

export default function Card({ children, style, elevated = true }) {
  return <View style={[styles.card, elevated && styles.elevated, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  elevated: {
    ...theme.shadows.card,
  },
});
