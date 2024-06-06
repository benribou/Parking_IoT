import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ParkingStatus from './components/ParkingStatus';
import ParkingControl from './components/ParkingControl';

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Parking IoT</Text>
      </View>
      <View style={styles.main}>
        <ParkingStatus />
        <ParkingControl />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    backgroundColor: '#0BC282',
    paddingTop: 60,
    paddingBottom: 10,
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 40,
  },
  main: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
});

