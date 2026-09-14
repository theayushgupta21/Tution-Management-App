import { StyleSheet, Text, View } from 'react-native';
import theme from '../constants/theme';

export default function ScreenHeader({ title, subtitle, rightAction, style }) {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {rightAction ? <View>{rightAction}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xxl,
    marginTop: theme.spacing.sm,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
});
