import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client, Message } from 'react-native-paho-mqtt';

const ParkingStatus = () => {
  const [client, setClient] = useState(null);
  const reconnectTimeout = useRef(null);
  const [availableSpaces, setAvailableSpaces] = useState(10);

  useEffect(() => {
    const createClient = () => {
      const mqttClient = new Client({
        uri: 'wss://test.mosquitto.org:8081/mqtt',
        clientId: 'react-native-client',
        storage: AsyncStorage,
      });

      mqttClient.on('connectionLost', (responseObject) => {
        if (responseObject.errorCode !== 0) {
          console.log('Connection lost:', responseObject.errorMessage);
          attemptReconnect(mqttClient);
        }
      });

      mqttClient.on('messageReceived', (message) => {
        console.log(`Received message: ${message.payloadString} on topic: ${message.destinationName}`);
        setMessages((prevMessages) => [...prevMessages, message.payloadString]);
      });

      mqttClient.connect()
        .then(() => {
          console.log('Connected to MQTT broker');
          mqttClient.subscribe('porteentre/state');
        })
        .catch((err) => {
          console.error('Connection error: ', err);
          attemptReconnect(mqttClient);
        });

      setClient(mqttClient);
    };

    createClient();

    return () => {
      if (client) {
        client.disconnect();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, []);

  const attemptReconnect = (mqttClient) => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    reconnectTimeout.current = setTimeout(() => {
      console.log('Attempting to reconnect...');
      mqttClient.connect()
        .then(() => {
          console.log('Reconnected to MQTT broker');
          mqttClient.subscribe('test/topic');
        })
        .catch((err) => {
          console.error('Reconnection error: ', err);
          attemptReconnect(mqttClient);
        });
    }, 5000); // Try to reconnect every 5 seconds
  };

  const sendBarrierMessage = (action, barrier) => {
    if (client) {
      const message = new Message(action);
      const topic = barrier === 'entree' ? 'parking/barriere/entree' : 'parking/barriere/sortie';
      message.destinationName = topic;
      client.send(message);
      console.log(`Barrier ${action} for ${barrier} sent to ${topic}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.statusContainer}>
          <Text style={styles.spacesText}>Places disponibles</Text>
          <Text style={styles.spacesText2}>{availableSpaces}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.controlsContainer}>
          <Text style={styles.title}>Contrôle des Barrières</Text>
          <View style={styles.barrierContainerRow}>
            <View style={styles.barrierContainer}>
              <Text style={styles.barrierTitle}>Barrière Entrée</Text>
              <TouchableOpacity style={[styles.button, styles.openButton]} onPress={() => sendBarrierMessage('open', 'entree')}>
                <Text style={styles.buttonText}>Ouvrir</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={() => sendBarrierMessage('close', 'entree')}>
                <Text style={styles.buttonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.barrierContainer}>
              <Text style={styles.barrierTitle}>Barrière Sortie</Text>
              <TouchableOpacity style={[styles.button, styles.openButton]} onPress={() => sendBarrierMessage('open', 'sortie')}>
                <Text style={styles.buttonText}>Ouvrir</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={() => sendBarrierMessage('close', 'sortie')}>
                <Text style={styles.buttonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  statusContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  spacesText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  spacesText2: {
    fontSize: 45,
    color: '#0BC282',
    fontWeight: 'bold',
  },
  controlsContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  barrierContainerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  barrierContainer: {
    alignItems: 'center',
  },
  barrierTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  debugContainer: {
    flex: 1,
    justifyContent: 'flex-start', // Ensure items are at the top
  },
  scrollView: {
    marginTop: 10,
    maxHeight: 150,
  },
  message: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  button: {
    width: 150,
    paddingVertical: 15,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: 'center',
  },
  openButton: {
    backgroundColor: '#0BC282', // Green color
  },
  closeButton: {
    backgroundColor: '#dc3545', // Red color
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default ParkingStatus;
