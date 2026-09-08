import { Gyroscope } from 'expo-sensors';
import React, { useEffect, useRef, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type GyroData = {
  x: number;
  y: number;
  z: number;
};

const MAX_HISTORY = 30;

export default function DataMode() {
  const [gyroData, setGyroData] = useState<GyroData>({ x: 0, y: 0, z: 0 });
  const [history, setHistory] = useState<GyroData[]>([]);
  const [sensorStatus, setSensorStatus] = useState('Conectado');
  const [isFrozen, setIsFrozen] = useState(false);
  const [calibrationOffset, setCalibrationOffset] = useState({ x: 0, y: 0, z: 0 });
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    let subscription: any = null;

    try {
      Gyroscope.setUpdateInterval(100);
      setSensorStatus('Conectado ✓');

      subscription = Gyroscope.addListener((data: GyroData) => {
        if (!isFrozen) {
          const calibratedData = {
            x: Number((data.x - calibrationOffset.x).toFixed(4)),
            y: Number((data.y - calibrationOffset.y).toFixed(4)),
            z: Number((data.z - calibrationOffset.z).toFixed(4)),
          };

          setGyroData(calibratedData);
          setHistory(prev => {
            const newHistory = [calibratedData, ...prev];
            return newHistory.slice(0, MAX_HISTORY);
          });
        }
      });

      subscriptionRef.current = subscription;
    } catch (error) {
      setSensorStatus('Indisponível ✗');
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isFrozen, calibrationOffset]);

  const handleCalibrate = () => {
    setCalibrationOffset(gyroData);
  };

  const getStatusColor = (value: number): string => {
    const abs = Math.abs(value);
    if (abs < 0.5) return '#27ae60';
    if (abs < 2) return '#f39c12';
    return '#e74c3c';
  };

  const getMagnitude = (): number => {
    return Math.hypot(gyroData.x, gyroData.y, gyroData.z);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Painel de Dados</Text>
        <Text style={[styles.status, { color: sensorStatus.includes('✓') ? '#27ae60' : '#e74c3c' }]}>
          {sensorStatus}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Current Values Panel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leitura Atual</Text>
          <View style={styles.valuesGrid}>
            <View style={styles.valueCard}>
              <Text style={styles.valueLabel}>X (Pitch)</Text>
              <Text style={[styles.valueLarge, { color: getStatusColor(gyroData.x) }]}>
                {gyroData.x.toFixed(3)}
              </Text>
              <View style={[styles.statusBar, { backgroundColor: getStatusColor(gyroData.x) }]} />
            </View>
            <View style={styles.valueCard}>
              <Text style={styles.valueLabel}>Y (Roll)</Text>
              <Text style={[styles.valueLarge, { color: getStatusColor(gyroData.y) }]}>
                {gyroData.y.toFixed(3)}
              </Text>
              <View style={[styles.statusBar, { backgroundColor: getStatusColor(gyroData.y) }]} />
            </View>
            <View style={styles.valueCard}>
              <Text style={styles.valueLabel}>Z (Yaw)</Text>
              <Text style={[styles.valueLarge, { color: getStatusColor(gyroData.z) }]}>
                {gyroData.z.toFixed(3)}
              </Text>
              <View style={[styles.statusBar, { backgroundColor: getStatusColor(gyroData.z) }]} />
            </View>
          </View>
        </View>

        {/* Magnitude */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Magnitude</Text>
          <View style={styles.magnitudeCard}>
            <Text style={styles.magnitudeValue}>{getMagnitude().toFixed(3)} rad/s</Text>
            <View
              style={[
                styles.magnitudeBar,
                {
                  width: `${Math.min(100, (getMagnitude() / 5) * 100)}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Calibration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calibração</Text>
          <Text style={styles.calibrationInfo}>
            Offset X: {calibrationOffset.x.toFixed(3)} | Y: {calibrationOffset.y.toFixed(3)} | Z: {calibrationOffset.z.toFixed(3)}
          </Text>
          <Text style={styles.calibrationButton} onPress={handleCalibrate}>
            🔧 Calibrar Agora
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.section}>
          <Text
            style={[
              styles.freezeButton,
              { backgroundColor: isFrozen ? '#e74c3c' : '#27ae60' },
            ]}
            onPress={() => setIsFrozen(!isFrozen)}
          >
            {isFrozen ? '🔒 Descongelar' : '❄️ Congelar'}
          </Text>
        </View>

        {/* History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico (últimas {history.length} leituras)</Text>
          {history.map((data, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyIndex}>#{index + 1}</Text>
              <View style={styles.historyValues}>
                <Text style={styles.historyValue}>X: {data.x.toFixed(2)}</Text>
                <Text style={styles.historyValue}>Y: {data.y.toFixed(2)}</Text>
                <Text style={styles.historyValue}>Z: {data.z.toFixed(2)}</Text>
              </View>
            </View>
          ))}
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
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#16213e',
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ecf0f1',
  },
  status: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  section: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 10,
  },
  valuesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  valueCard: {
    flex: 1,
    backgroundColor: '#0f3460',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 11,
    color: '#bdc3c7',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  valueLarge: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
  },
  magnitudeCard: {
    backgroundColor: '#0f3460',
    borderRadius: 6,
    padding: 10,
  },
  magnitudeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ecf0f1',
    marginBottom: 8,
  },
  magnitudeBar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3498db',
  },
  calibrationInfo: {
    fontSize: 11,
    color: '#bdc3c7',
    marginBottom: 8,
  },
  calibrationButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f39c12',
    color: '#1a1a2e',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    overflow: 'hidden',
  },
  freezeButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 4,
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    overflow: 'hidden',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#0f3460',
    marginBottom: 4,
    borderRadius: 4,
  },
  historyIndex: {
    fontSize: 10,
    color: '#95a5a6',
    fontWeight: 'bold',
    width: 30,
  },
  historyValues: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyValue: {
    fontSize: 10,
    color: '#ecf0f1',
  },
});
