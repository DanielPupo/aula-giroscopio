import { Gyroscope } from 'expo-sensors';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';

type GyroData = {
  x: number;
  y: number;
  z: number;
};

const TRAIL_POINT_SIZE = 4;
const MAX_TRAIL_POINTS = 50;
const BALL_SIZE = 40;
const GAME_TOP = 60;

export default function LabMode() {
  const { width, height } = useWindowDimensions();
  const [gyroData, setGyroData] = useState<GyroData>({ x: 0, y: 0, z: 0 });
  const [ballPosition, setBallPosition] = useState({
    x: (width - BALL_SIZE) / 2,
    y: (height - BALL_SIZE) / 2,
  });
  const [trail, setTrail] = useState<Array<{ x: number; y: number }>>([]);
  const [sensitivity, setSensitivity] = useState(3);
  const [isFrozen, setIsFrozen] = useState(false);
  const [sensorAvailable, setSensorAvailable] = useState(true);
  const ballPositionRef = useRef(ballPosition);
  const gyroDataRef = useRef(gyroData);

  useEffect(() => {
    ballPositionRef.current = ballPosition;
    gyroDataRef.current = gyroData;
  }, [ballPosition, gyroData]);

  // Gyroscope setup
  useEffect(() => {
    let subscription: any = null;

    try {
      Gyroscope.setUpdateInterval(16);
      subscription = Gyroscope.addListener((data: GyroData) => {
        if (!isFrozen) {
          setGyroData(data);
          setBallPosition(currentPos => {
            const newX = Math.max(
              0,
              Math.min(currentPos.x + data.y * sensitivity, width - BALL_SIZE)
            );
            const newY = Math.max(
              GAME_TOP,
              Math.min(
                currentPos.y - data.x * sensitivity,
                height - BALL_SIZE
              )
            );
            return { x: newX, y: newY };
          });

          setTrail(prev => {
            const newTrail = [
              ...prev,
              {
                x: ballPositionRef.current.x + BALL_SIZE / 2,
                y: ballPositionRef.current.y + BALL_SIZE / 2,
              },
            ];
            if (newTrail.length > MAX_TRAIL_POINTS) {
              newTrail.shift();
            }
            return newTrail;
          });
        }
      });
    } catch (error) {
      setSensorAvailable(false);
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [width, height, isFrozen, sensitivity]);

  const handleCenterize = useCallback(() => {
    setBallPosition({
      x: (width - BALL_SIZE) / 2,
      y: (height - BALL_SIZE) / 2,
    });
    setTrail([]);
  }, [width, height]);

  const handleClearTrail = useCallback(() => {
    setTrail([]);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Laboratório de Sensores</Text>
      </View>

      <View style={styles.gameArea}>
        {/* Trail rendering */}
        {trail.map((point, index) => (
          <View
            key={index}
            style={[
              styles.trailPoint,
              {
                left: point.x - TRAIL_POINT_SIZE / 2,
                top: point.y - TRAIL_POINT_SIZE / 2,
                opacity: index / trail.length,
              },
            ]}
          />
        ))}

        {/* Ball */}
        <View
          style={[
            styles.ball,
            {
              left: ballPosition.x,
              top: ballPosition.y,
            },
          ]}
        />
      </View>

      <View style={styles.controlPanel}>
        <View style={styles.controlSection}>
          <Text style={styles.controlLabel}>Sensibilidade</Text>
          <View style={styles.sensitivityContainer}>
            <Text
              style={styles.sensitivityButton}
              onPress={() => setSensitivity(Math.max(1, sensitivity - 0.5))}
            >
              −
            </Text>
            <Text style={styles.sensitivityValue}>{sensitivity.toFixed(1)}</Text>
            <Text
              style={styles.sensitivityButton}
              onPress={() => setSensitivity(Math.min(10, sensitivity + 0.5))}
            >
              +
            </Text>
          </View>
        </View>

        <View style={styles.controlSection}>
          <Text
            style={styles.actionButton}
            onPress={handleCenterize}
          >
            🎯 Centralizar
          </Text>
          <Text
            style={styles.actionButton}
            onPress={handleClearTrail}
          >
            🗑️ Limpar Rastro
          </Text>
          <Text
            style={[
              styles.actionButton,
              { backgroundColor: isFrozen ? '#e74c3c' : '#27ae60' },
            ]}
            onPress={() => setIsFrozen(!isFrozen)}
          >
            {isFrozen ? '🔒 Congelado' : '🔓 Livre'}
          </Text>
        </View>

        {!sensorAvailable && (
          <Text style={styles.warning}>⚠️ Giroscópio indisponível</Text>
        )}
      </View>

      <ScrollView style={styles.dataPanel} horizontal>
        <View style={styles.dataItem}>
          <Text style={styles.dataLabel}>X</Text>
          <Text style={styles.dataValue}>{gyroData.x.toFixed(2)}</Text>
          <View
            style={[
              styles.dataBar,
              {
                width: Math.min(100, Math.abs(gyroData.x * 20)),
                backgroundColor:
                  gyroData.x > 0 ? '#3498db' : '#e74c3c',
              },
            ]}
          />
        </View>
        <View style={styles.dataItem}>
          <Text style={styles.dataLabel}>Y</Text>
          <Text style={styles.dataValue}>{gyroData.y.toFixed(2)}</Text>
          <View
            style={[
              styles.dataBar,
              {
                width: Math.min(100, Math.abs(gyroData.y * 20)),
                backgroundColor:
                  gyroData.y > 0 ? '#27ae60' : '#f39c12',
              },
            ]}
          />
        </View>
        <View style={styles.dataItem}>
          <Text style={styles.dataLabel}>Z</Text>
          <Text style={styles.dataValue}>{gyroData.z.toFixed(2)}</Text>
          <View
            style={[
              styles.dataBar,
              {
                width: Math.min(100, Math.abs(gyroData.z * 20)),
                backgroundColor:
                  gyroData.z > 0 ? '#9b59b6' : '#1abc9c',
              },
            ]}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#16213e',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ecf0f1',
    textAlign: 'center',
  },
  gameArea: {
    flex: 1,
    backgroundColor: '#2c3e50',
    margin: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  trailPoint: {
    position: 'absolute',
    width: TRAIL_POINT_SIZE,
    height: TRAIL_POINT_SIZE,
    borderRadius: TRAIL_POINT_SIZE / 2,
    backgroundColor: '#3498db',
  },
  ball: {
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    backgroundColor: '#e74c3c',
    borderWidth: 2,
    borderColor: '#ecf0f1',
  },
  controlPanel: {
    backgroundColor: '#16213e',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  controlSection: {
    marginBottom: 8,
  },
  controlLabel: {
    fontSize: 12,
    color: '#bdc3c7',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  sensitivityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  sensitivityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#3498db',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: 'bold',
    fontSize: 18,
  },
  sensitivityValue: {
    fontSize: 16,
    color: '#ecf0f1',
    fontWeight: 'bold',
    minWidth: 50,
    textAlign: 'center',
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#3498db',
    color: '#fff',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
    marginBottom: 5,
    overflow: 'hidden',
  },
  warning: {
    fontSize: 11,
    color: '#e74c3c',
    marginTop: 5,
    textAlign: 'center',
  },
  dataPanel: {
    backgroundColor: '#2c3e50',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#16213e',
  },
  dataItem: {
    marginRight: 20,
    minWidth: 120,
  },
  dataLabel: {
    fontSize: 12,
    color: '#bdc3c7',
    fontWeight: 'bold',
  },
  dataValue: {
    fontSize: 14,
    color: '#ecf0f1',
    fontWeight: 'bold',
    marginVertical: 2,
  },
  dataBar: {
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
});
