import { Gyroscope } from 'expo-sensors';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

const PLAYER_SIZE = 50;
const ORB_SIZE = 30;
const GAME_TOP = 100;
const MOVEMENT_SPEED = 3;

type Position = {
  x: number;
  y: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

const generateRandomPosition = (
  screenWidth: number,
  screenHeight: number
): Position => {
  const maxX = Math.max(0, screenWidth - ORB_SIZE);
  const maxY = Math.max(GAME_TOP, screenHeight - ORB_SIZE);

  return {
    x: Math.random() * maxX,
    y: GAME_TOP + Math.random() * (maxY - GAME_TOP),
  };
};

export default function Game() {
  const { width, height } = useWindowDimensions();
  const [playerPosition, setPlayerPosition] = useState<Position>(() => ({
    x: Math.max(0, (width - PLAYER_SIZE) / 2),
    y: Math.max(GAME_TOP, (height - PLAYER_SIZE) / 2),
  }));
  const [orbPosition, setOrbPosition] = useState<Position>(() =>
    generateRandomPosition(width, height)
  );
  const [score, setScore] = useState(0);

  useEffect(() => {
    Gyroscope.setUpdateInterval(16);

    const subscription = Gyroscope.addListener(({ x, y }) => {
      setPlayerPosition(currentPosition => ({
        x: clamp(
          currentPosition.x + y * MOVEMENT_SPEED,
          0,
          width - PLAYER_SIZE
        ),
        y: clamp(
          currentPosition.y - x * MOVEMENT_SPEED,
          GAME_TOP,
          height - PLAYER_SIZE
        ),
      }));
    });

    return () => subscription.remove();
  }, [height, width]);

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

  useEffect(() => {
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
      setScore(currentScore => currentScore + 1);
      setOrbPosition(generateRandomPosition(width, height));
    }
  }, [height, orbPosition, playerPosition, width]);

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>Colete o orbe azul!</Text>
      <Text style={styles.score}>Pontos: {score}</Text>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
    overflow: 'hidden',
  },
  instructions: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 1,
    textAlign: 'center',
    fontSize: 20,
    color: '#fff',
  },
  score: {
    position: 'absolute',
    top: 78,
    left: 0,
    right: 0,
    zIndex: 1,
    textAlign: 'center',
    fontSize: 16,
    color: '#fff',
  },
  player: {
    position: 'absolute',
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    borderRadius: PLAYER_SIZE / 2,
    backgroundColor: 'coral',
    borderWidth: 2,
    borderColor: '#fff',
  },
  orb: {
    position: 'absolute',
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    backgroundColor: '#3498db',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
