import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Mode = 'game' | 'lab' | 'data';

interface NavigationProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
}

export default function Navigation({ currentMode, onModeChange }: NavigationProps) {
  const isActive = (mode: Mode) => currentMode === mode;

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.navItem,
          isActive('game') && styles.navItemActive,
        ]}
        onPress={() => onModeChange('game')}
      >
        🎮 Jogo
      </Text>
      <Text
        style={[
          styles.navItem,
          isActive('lab') && styles.navItemActive,
        ]}
        onPress={() => onModeChange('lab')}
      >
        🔬 Laboratório
      </Text>
      <Text
        style={[
          styles.navItem,
          isActive('data') && styles.navItemActive,
        ]}
        onPress={() => onModeChange('data')}
      >
        📊 Dados
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#0f3460',
    borderTopWidth: 1,
    borderTopColor: '#16213e',
    paddingVertical: 8,
    paddingHorizontal: 5,
    justifyContent: 'space-around',
  },
  navItem: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 'bold',
    color: '#95a5a6',
    marginHorizontal: 4,
    borderRadius: 4,
  },
  navItemActive: {
    backgroundColor: '#3498db',
    color: '#fff',
  },
});
