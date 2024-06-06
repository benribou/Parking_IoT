import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Button, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client, Message } from 'react-native-paho-mqtt';

const ParkingStatus = () => {
  const [client, setClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const reconnectTimeout = useRef(null);

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
          mqttClient.subscribe('test/topic');
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

  const sendMessage = () => {
    if (client && inputMessage) {
      const message = new Message(inputMessage);
      message.destinationName = 'test/topic';
      client.send(message);
      setInputMessage(''); // Clear the input after sending
      console.log('Message sent:', inputMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages reçus du serveur MQTT</Text>
      <ScrollView style={styles.scrollView}>
        {messages.map((msg, index) => (
          <Text key={index} style={styles.message}>{msg}</Text>
        ))}
      </ScrollView>
      <TextInput
        style={styles.input}
        placeholder="Type your message here"
        value={inputMessage}
        onChangeText={setInputMessage}
      />
      <Button title="Send Message" onPress={sendMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  scrollView: {
    marginTop: 10,
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
  },
});

export default ParkingStatus;
