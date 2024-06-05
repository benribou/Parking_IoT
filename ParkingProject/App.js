import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mqtt from 'mqtt';

const App = () => {
  const [availableSpaces, setAvailableSpaces] = useState(0);
  const [client, setClient] = useState(null);

  useEffect(() => {
    const mqttClient = mqtt.connect('ws://your_MQTT_BROKER_IP:1883');

    mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker');
      mqttClient.subscribe('parking/spaces', (err) => {
        if (!err) {
          console.log('Subscribed to parking/spaces');
        }
      });
    });

    mqttClient.on('message', (topic, message) => {
      if (topic === 'parking/spaces') {
        const data = JSON.parse(message.toString());
        setAvailableSpaces(data.spaces);
      }
    });

    mqttClient.on('error', (err) => {
      console.error('Connection error:', err);
      mqttClient.end();
    });

    mqttClient.on('close', () => {
      console.log('Disconnected');
    });

    setClient(mqttClient);

    return () => {
      if (client) {
        client.end();
      }
    };
  }, []);

  const handleBarrier = (action) => {
    if (client) {
      client.publish('parking/barrier', action);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.spacesText}>Places disponible : {availableSpaces}</Text>
      <Button title="Open Barrier" onPress={() => handleBarrier('open')} />
      <br></br>
      <Button title="Close Barrier" onPress={() => handleBarrier('close')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacesText: {
    fontSize: 24,
    marginBottom: 20,
  }
});

export default App;
