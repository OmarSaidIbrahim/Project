import React, { Component } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';


export default class App extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.myText}>Login</Text>
        <View style={styles.textWrapper}>
          <MapView
            provider={PROVIDER_GOOGLE} // remove if not using Google Maps
            style={styles.map}
            region={{
              latitude: 37.78825,
              longitude: -122.4324,
              latitudeDelta: 0.015,
              longitudeDelta: 0.0121,
            }}
          >
          </MapView>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  textWrapper: {
    height: hp('70%'), // 70% of height device screen
    width: wp('80%')   // 80% of width device screen
  },
  myText: {
    fontSize: hp('5%') // End result looks like the provided UI mockup
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
 });