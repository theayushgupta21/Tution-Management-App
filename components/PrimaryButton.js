import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import theme from '../constants/theme';

export default function PrimaryButton({ title, onPress, disabled, style, textStyle, loading }) {
  const scale = useRef(new Animated.Value(1)).current;

  const animate = (toValue) => {
    Animated.spring(scale, {
      toValue,
      friction: 6,
      tension: 180,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        onPressIn={() => animate(0.98)}
        onPressOut={() => animate(1)}
        style={({ pressed }) => [{
          opacity: pressed || disabled || loading ? 0.9 : 1,
        }, styles.button]}
      >
        <Text style={[styles.text, textStyle]}>{loading ? 'Please wait...' : title}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: theme.radii.xl,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.xl,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    ...theme.shadows.soft,
  },
  text: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
