import React, { Component } from 'react'
import { Text, View, StyleSheet, PermissionsAndroid, Image, Modal, Pressable, Dimensions } from 'react-native'
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

const CustomMarker = () => (
  <View
    style={{
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#007bff",
      padding: 3,
      borderRadius: 5,

    }}
  >
    <Image
        style={{
          width: 50,
          height: 50
        }}
        source={{
          uri: 'https://www.thequays.co.uk/media/uploads/river_island_logo.png',
        }}
      />
  </View>
);

export default class App extends Component {

  constructor(props) {   
    super(props)
    
    this.state={
      latitude: null,
      longitude: null,
      location: null,
      postcode: null,
      city: null,
      data: "ok",
      modalVisible: false
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
    return (
      <View style={styles.container}>
        
        <Text style={styles.myText}>You are here !!</Text>
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
            tracksViewChanges={false}
          />
          <Marker
            coordinate={{ 
              latitude: 51.5130103,
              longitude: -0.3029769,
            }}
            onPress={()=>{this.setState({modalVisible: true, latitude: 51.5130103, longitude: -0.3029769})}}
          >
            <CustomMarker 
              tracksViewChanges={false}
            />
          </Marker>
        </MapView>
        </View>
        <Text style={{alignSelf: "center"}}>Postcode: {this.state.postcode} - Borough of: {this.state.city}</Text>
        <View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.modalVisible}
            onRequestClose={() => {
              this.setState({modalVisible: false})
            }}
          >
            <View style={{backgroundColor: "white",flex:1, marginTop: 200, borderTopRightRadius: 10,borderTopLeftRadius: 10, borderLeftWidth:5, borderTopWidth:5,borderRightWidth: 5, borderLeftColor:"black",borderTopColor: "black",borderRightColor: "black", alignItems: "center"}}>
              <View >
                <Text >Hello World!</Text>
                <Pressable
                  onPress={() => this.setState({modalVisible: false})}
                >
                  <Text>Hide Modal</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    flexDirection: "column",
    //justifyContent: "center", 
    //alignItems: "left"
  },
  textWrapper: {
    height: hp('70%'), // 70% of height device screen
    width: wp('80%'),   // 80% of width device screen
    justifyContent: "center",
    alignItems: "center"
  },
  myText: {
    fontSize: hp('4%'), // End result looks like the provided UI mockup
    alignSelf: "center"
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    width: Dimensions.get('window').width
  },
 });