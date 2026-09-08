import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import DataMode from './DataMode';
import GameMode from './GameMode';
import LabMode from './LabMode';
import Navigation from './Navigation';

type Mode = 'game' | 'lab' | 'data';

export default function Game() {
  const [mode, setMode] = useState<Mode>('game');

  const renderMode = () => {
    switch (mode) {
      case 'game':
        return <GameMode />;
      case 'lab':
        return <LabMode />;
      case 'data':
        return <DataMode />;
      default:
        return <GameMode />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderMode()}
      </View>
      <Navigation currentMode={mode} onModeChange={setMode} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
  },
});
