import { StyleSheet, View } from 'react-native';

export default function WavyBackground({ style }) {
  return (
    <View style={[styles.wrap, style]} pointerEvents="none">
      <View style={styles.blobOne} />
      <View style={styles.blobTwo} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  blobOne: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#eef2ff',
    top: -60,
    right: -30,
    opacity: 0.9,
  },
  blobTwo: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#fff7ed',
    bottom: -80,
    left: -40,
    opacity: 0.8,
  },
});
