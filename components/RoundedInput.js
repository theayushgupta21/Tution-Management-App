import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import theme from '../constants/theme';

export default function RoundedInput({ style, leftIcon, rightIcon, value, onChangeText, onPressRightIcon, ...props }) {
  return (
    <View style={[styles.inputWrap, style]}>
      {leftIcon ? (
        <View style={styles.iconWrap}>
          <Ionicons name={leftIcon} size={18} color={theme.colors.textSecondary} />
        </View>
      ) : null}

      <TextInput
        {...props}
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, leftIcon ? styles.inputWithIcon : null, rightIcon ? styles.inputWithRightIcon : null]}
        placeholderTextColor={theme.colors.textSecondary}
        selectionColor={theme.colors.primary}
      />

      {rightIcon ? (
        <Pressable style={styles.rightIconWrap} onPress={onPressRightIcon}>
          <Ionicons name={rightIcon} size={18} color={theme.colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrap: {
    position: 'relative',
    marginBottom: theme.spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.xl,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  inputWithIcon: {
    paddingLeft: 46,
  },
  inputWithRightIcon: {
    paddingRight: 46,
  },
  iconWrap: {
    position: 'absolute',
    left: 16,
    top: 15,
    zIndex: 1,
  },
  rightIconWrap: {
    position: 'absolute',
    right: 16,
    top: 15,
    zIndex: 1,
  },
});
