import React, { Component } from 'react'
import { Text, View, StyleSheet, PermissionsAndroid, Alert } from 'react-native'
import MapView, {Marker}  from 'react-native-maps';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Geolocation from 'react-native-geolocation-service';

export async function hasLocationPermission(){
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        'title': 'ReactNativeCode Location Permission',
        'message': 'ReactNativeCode App needs access to your location '
      }
    )
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }
    else {
      return false
    }
  } catch (err) {
    console.warn(err)
  }
}


export default class App extends Component {

  constructor(props) {   
    super(props)
    
    this.state={
      latitude: 37.78825,
      longitude: -122.4324,
      location: null,
      postcode: null,
      city: null,
      data: "ok"
    }
    
  }



  async componentDidMount() {
    if (await hasLocationPermission()) {
      Geolocation.getCurrentPosition(
        (position) => {
          console.log(position)
          const latitude = JSON.stringify(position.coords.latitude);
          const longitude = JSON.stringify(position.coords.longitude);
          const location  = JSON.stringify(position);
          this.setState({ latitude, longitude });
          this.getPostcodeAndCityFromApi();
        },
        (error) => {
          // See error code charts below.
          console.log(error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    }
  }
  
  getPostcodeAndCityFromApi = () => {
    return fetch('https://api.postcodes.io/postcodes?lon='+this.state.longitude+'&lat='+this.state.latitude+'')
      .then(response => response.json())
      .then((response) => {
        const postcode = JSON.stringify(response.result[0].postcode);
        const city = JSON.stringify(response.result[0].admin_district);
        this.setState({postcode, city})
      })
      .catch((error) => {
        console.error(error);
      });
  };

  render() {
    var markers = [
      {
        latitude: 51.514680,
        longitude: -0.302530,
        title: 'River Island',
      }
    ];
    return (
      <View style={styles.container}>
        <Text style={styles.myText}>Your position is: {this.state.latitude}</Text>
        <View style={styles.textWrapper}>
        <MapView
          style={styles.map}
          region={{
            latitude: Number(this.state.latitude),
            longitude: Number(this.state.longitude),
            latitudeDelta: 0.0322,
            longitudeDelta: 0.0321,
          }}
        >
        <Marker
          coordinate={{ 
            latitude : Number(this.state.latitude), 
            longitude : Number(this.state.longitude) 
          }}
        />
        <Marker
          coordinate={{ 
            latitude: 51.5130103,
            longitude: -0.3029769,
          }}
          title = "River Island"
        />
        </MapView>
        </View>
        <Text>Postcode: {this.state.postcode} - Borough of: {this.state.city}</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    flexDirection: "column",
    //justifyContent: "center", 
    alignItems: "center"
  },
  textWrapper: {
    height: hp('70%'), // 70% of height device screen
    width: wp('80%'),   // 80% of width device screen
    justifyContent: "center",
    alignItems: "center"
  },
  myText: {
    fontSize: hp('4%') // End result looks like the provided UI mockup
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
 });