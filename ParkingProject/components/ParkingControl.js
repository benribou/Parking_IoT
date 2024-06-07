import React from 'react';
import { StyleSheet, View, Button } from 'react-native';
import { Client, Message } from 'react-native-paho-mqtt';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ParkingControl = () => {
  const [client, setClient] = React.useState(null);

  React.useEffect(() => {
    const mqttClient = new Client({
      uri: 'wss://test.mosquitto.org:8081/mqtt',
      clientId: 'react-native-client-control',
      storage: AsyncStorage,
    });

    mqttClient.on('connectionLost', (responseObject) => {
      if (responseObject.errorCode !== 0) {
        console.log('Connection lost:', responseObject.errorMessage);
      }
    });

    mqttClient.connect()
      .then(() => {
        console.log('Connected to MQTT broker');
      })
      .catch((err) => {
        console.error('Connection error: ', err);
      });

    setClient(mqttClient);

    return () => {
      if (client) {
        client.disconnect();
      }
    };
  }, []);

  const sendMessage = (action) => {
    if (client) {
      const message = new Message(action);
      message.destinationName = 'parking/barriere';
      client.send(message);
      console.log(`Barrier ${action}`);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Ouvrir la Barrière" onPress={() => sendMessage('open')} />
      <Button title="Fermer la Barrière" onPress={() => sendMessage('close')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ParkingControl;
