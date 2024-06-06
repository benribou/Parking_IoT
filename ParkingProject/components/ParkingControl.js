import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client, Message } from 'react-native-paho-mqtt';

const ParkingControl = () => {
  const [client, setClient] = React.useState(null);

  React.useEffect(() => {
    // Créer un client MQTT
    const mqttClient = new Client({
      uri: 'wss://test.mosquitto.org:8081/mqtt',
      clientId: 'react-native-client-control',
      storage: AsyncStorage
    });

    // Définir les gestionnaires d'événements
    mqttClient.on('connectionLost', (responseObject) => {
      if (responseObject.errorCode !== 0) {
        console.log('Connection lost:', responseObject.errorMessage);
      }
    });

    // Connecter le client
    mqttClient.connect()
      .then(() => {
        console.log('Connected to MQTT broker');
      })
      .catch((err) => {
        console.error('Connection error: ', err);
      });

    setClient(mqttClient);

    // Cleanup function to disconnect the client when the component unmounts
    // return () => {
    //   mqttClient.disconnect();
    // };
  }, []);

  const openBarrier = () => {
    if (client) {
      const message = new Message('open');
      message.destinationName = 'parking/barriere';
      client.send(message);
      console.log('Barrier opened');
    }
  };

  const closeBarrier = () => {
    if (client) {
      const message = new Message('close');
      message.destinationName = 'parking/barriere';
      client.send(message);
      console.log('Barrier closed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contrôle de la Barrière</Text>
      <Button title="Ouvrir la Barrière" onPress={openBarrier} />
      <Button title="Fermer la Barrière" onPress={closeBarrier} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  button: {
    marginVertical: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});

export default ParkingControl;
