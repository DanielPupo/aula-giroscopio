import { Gyroscope } from 'expo-sensors';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

const PLAYER_SIZE = 50;
const ORB_SIZE = 30;
const GAME_TOP = 80;
const MOVEMENT_SPEED = 3;

type Position = {
  x: number;
  y: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const generateRandomPositionFarFromPlayer = (
  screenWidth: number,
  screenHeight: number,
  playerPosition: Position,
  minDistance: number = 100
): Position => {
  const gameHeight = screenHeight - GAME_TOP;
  let position: Position;
  let distance: number;

  do {
    position = {
      x: Math.random() * Math.max(0, screenWidth - ORB_SIZE),
      y: GAME_TOP + Math.random() * Math.max(0, gameHeight - ORB_SIZE),
    };

    const playerCenterX = playerPosition.x + PLAYER_SIZE / 2;
    const playerCenterY = playerPosition.y + PLAYER_SIZE / 2;
    const orbCenterX = position.x + ORB_SIZE / 2;
    const orbCenterY = position.y + ORB_SIZE / 2;

    distance = Math.hypot(
      playerCenterX - orbCenterX,
      playerCenterY - orbCenterY
    );
  } while (distance < minDistance);

  return position;
};

export default function GameMode() {
  const { width, height } = useWindowDimensions();
  const [playerPosition, setPlayerPosition] = useState<Position>(() => ({
    x: (width - PLAYER_SIZE) / 2,
    y: (height - PLAYER_SIZE) / 2,
  }));
  const [orbPosition, setOrbPosition] = useState<Position>(() =>
    generateRandomPositionFarFromPlayer(width, height, {
      x: (width - PLAYER_SIZE) / 2,
      y: (height - PLAYER_SIZE) / 2,
    })
  );
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [sensorAvailable, setSensorAvailable] = useState(true);
  const playerPositionRef = useRef(playerPosition);

  useEffect(() => {
    playerPositionRef.current = playerPosition;
  }, [playerPosition]);

  // Gyroscope setup
  useEffect(() => {
    let subscription: any = null;

    try {
      Gyroscope.setUpdateInterval(16);
      subscription = Gyroscope.addListener(({ x, y }) => {
        if (isPaused) return;

        setPlayerPosition(currentPosition => {
          const newX = clamp(
            currentPosition.x + y * MOVEMENT_SPEED,
            0,
            width - PLAYER_SIZE
          );
          const newY = clamp(
            currentPosition.y - x * MOVEMENT_SPEED,
            GAME_TOP,
            height - PLAYER_SIZE
          );
          return { x: newX, y: newY };
        });
      });
    } catch (error) {
      setSensorAvailable(false);
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [height, width, isPaused]);

  // Recalculate positions on resize
  useEffect(() => {
    setPlayerPosition(currentPosition => ({
      x: clamp(currentPosition.x, 0, width - PLAYER_SIZE),
      y: clamp(currentPosition.y, GAME_TOP, height - PLAYER_SIZE),
    }));
    setOrbPosition(currentPosition => ({
      x: clamp(currentPosition.x, 0, width - ORB_SIZE),
      y: clamp(currentPosition.y, GAME_TOP, height - ORB_SIZE),
    }));
  }, [height, width]);

  // Collision detection
  useEffect(() => {
    if (isPaused) return;

    const playerCenterX = playerPosition.x + PLAYER_SIZE / 2;
    const playerCenterY = playerPosition.y + PLAYER_SIZE / 2;
    const orbCenterX = orbPosition.x + ORB_SIZE / 2;
    const orbCenterY = orbPosition.y + ORB_SIZE / 2;
    const distance = Math.hypot(
      playerCenterX - orbCenterX,
      playerCenterY - orbCenterY
    );
    const collisionDistance = (PLAYER_SIZE + ORB_SIZE) / 2;

    if (distance <= collisionDistance) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
      }
      setOrbPosition(
        generateRandomPositionFarFromPlayer(width, height, playerPosition)
      );
    }
  }, [orbPosition, playerPosition, score, highScore, height, width, isPaused]);

  const handleReset = useCallback(() => {
    setScore(0);
    setPlayerPosition({
      x: (width - PLAYER_SIZE) / 2,
      y: (height - PLAYER_SIZE) / 2,
    });
    setOrbPosition(
      generateRandomPositionFarFromPlayer(width, height, {
        x: (width - PLAYER_SIZE) / 2,
        y: (height - PLAYER_SIZE) / 2,
      })
    );
    setIsPaused(false);
  }, [width, height]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.instructions}>Colete o orbe azul!</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.score}>Pontos: {score}</Text>
          <Text style={styles.highScore}>Recorde: {highScore}</Text>
        </View>
      </View>

      <View style={styles.gameArea}>
        <View
          style={[styles.orb, { left: orbPosition.x, top: orbPosition.y }]}
        />
        <View
          style={[
            styles.player,
            { left: playerPosition.x, top: playerPosition.y },
          ]}
        />
      </View>

      <View style={styles.controls}>
        <Text
          style={styles.pauseButton}
          onPress={() => setIsPaused(!isPaused)}
        >
          {isPaused ? '▶ Continuar' : '⏸ Pausar'}
        </Text>
        <Text style={styles.resetButton} onPress={handleReset}>
          🔄 Reiniciar
        </Text>
      </View>

      {!sensorAvailable && (
        <Text style={styles.sensorWarning}>
          ⚠️ Giroscópio indisponível
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  instructions: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ecf0f1',
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  score: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: 'bold',
  },
  highScore: {
    fontSize: 14,
    color: '#f39c12',
    fontWeight: 'bold',
  },
  gameArea: {
    flex: 1,
    backgroundColor: '#2c3e50',
    overflow: 'hidden',
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  player: {
    position: 'absolute',
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    borderRadius: PLAYER_SIZE / 2,
    backgroundColor: '#e74c3c',
    borderWidth: 3,
    borderColor: '#ecf0f1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
  },
  orb: {
    position: 'absolute',
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    backgroundColor: '#3498db',
    borderWidth: 2,
    borderColor: '#ecf0f1',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#16213e',
  },
  pauseButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#f39c12',
    color: '#1a1a2e',
    borderRadius: 5,
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  resetButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#27ae60',
    color: '#fff',
    borderRadius: 5,
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  sensorWarning: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 12,
    color: '#e74c3c',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 4,
  },
});
