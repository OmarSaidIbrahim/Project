import React, { Component } from 'react'
import { Text, View, StyleSheet, PermissionsAndroid, Image, Modal, Pressable, Dimensions } from 'react-native'
import MapView, {Marker}  from 'react-native-maps';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Geolocation from 'react-native-geolocation-service';
import { Header} from 'react-native-elements';
import { getDistance } from 'geolib';

//TEST MARKERS
const shopMarkers = {
  markers: [{
    title: 'H&M',
    coordinates: {
      latitude: 51.512538,
      longitude: -0.303592
    },
    imageUri: 'https://ceowatermandate.org/wp-content/uploads/2017/08/HM.png'
  },
  {
    title: 'Footlocker',
    coordinates: {
      latitude: 51.5127815,
      longitude: -0.3027705
    },  
    imageUri: 'https://diginomica.com/sites/default/files/images/2016-08/foot-locker-final.jpg'
  },
  {
    title: 'River Island',
    coordinates: {
      latitude: 51.5130103,
      longitude: -0.3029769,
    }, 
    imageUri: 'https://www.thequays.co.uk/media/uploads/river_island_logo.png'
  }]
}
//----------------
//BEGINNING
export default class App extends Component {
  constructor(props) {   
    super(props)
    
    this.state={
      latitude: null,
      longitude: null,
      location: null,
      postcode: null,
      city: null,
      modalVisible: false,
      modalTitle: null,
      //TESTS IN LONDON
      testLat: 51.50727,
      testLong: -0.1279706,
      testPostCode: null,
      testCity: null,
      //ARRAY OF SHOP COORDINATES
      shopsCoordinates: []
    }
    
  }
  //APP CHECKS IF USER HAS GPS ACTIVATED
  hasLocationPermission = () => {
    try {
      const granted = PermissionsAndroid.request(
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
  //BEFORE MOUNTING THE APP, THIS METHOD RECEIVES THE USER COORDINATES
  componentDidMount() {
    /*if (this.hasLocationPermission) {
      Geolocation.getCurrentPosition(
        (position) => {
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
    }*/
    //THIS METHOD BELOW WILL GET THE POSTCODE (UK ONLY) FROM LATITUDE AND LONGITUDE
    this.getPostcodeAndCityFromApi();
    //GETS THE NEAREST STORES FROM USER LOCATION (TEST IN LONDON)
    return fetch("https://www.bershka.com/itxrest/2/bam/store/44009506/physical-store?latitude="+this.state.testLat+"&longitude="+this.state.testLong+"&countryCode=GB&max=10&appId=2&languageId=-1")
      .then(response => response.json())
      .then((response) => {
        var x = 0
        //EACH STORE COLLECTED WILL BE SAVED WITH NAME AND ID AND COORDINATES INTO THE ARRAY OF DICTIONARY
        while(x < response.closerStores.length)
        {
          //THIS METHOD BELOW WILL CALCULATE THE DISTANCE BETWEEN TWO COORDINATES
          //MUST BE UPDATED BY THE USER INPUT MILES RANGE
          var dis = getDistance(
            {latitude: this.state.testLat, longitude: this.state.testLong},
            {latitude: Number(JSON.stringify(response.closerStores[x].latitude)), longitude: Number(JSON.stringify(response.closerStores[x].longitude))},
          );
          //ONLY THE STORES IN THE RANGE WILL BE DISPLAYED
          if(dis < 8046)
          {
            const newShop = {
              shopId: JSON.stringify(response.closerStores[x].id),
              shopName: JSON.stringify(response.closerStores[x].name),
              shopLatitude: Number(JSON.stringify(response.closerStores[x].latitude)),
              shopLongitude: Number(JSON.stringify(response.closerStores[x].longitude))
            }
            const newRecord = this.state.shopsCoordinates
            newRecord.push(newShop)
            this.setState({
              shopsCoordinates: newRecord
            })
          }
          x=x+1
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
  //THE METHOD BELOW WILL RETURN THE CITY AND POSTCODE FROM COORDINATES (UK ONLY)
  getPostcodeAndCityFromApi = () => {
    //return fetch('https://api.postcodes.io/postcodes?lon='+this.state.longitude+'&lat='+this.state.latitude+'')
    return fetch('https://api.postcodes.io/postcodes?lon='+this.state.testLong+'&lat='+this.state.testLat+'')
      .then(response => response.json())
      .then((response) => {
        //const postcode = JSON.stringify(response.result[0].postcode);
        //const city = JSON.stringify(response.result[0].admin_district);
        const testPostCode = JSON.stringify(response.result[0].postcode);
        const testCity = JSON.stringify(response.result[0].admin_district);
        //this.setState({postcode, city})
        this.setState({testPostCode,testCity})
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
        {/* USER LOCATION DISPLAYED */}
        <MapView
          style={styles.map}
          region={{
            latitude: this.state.testLat,//Number(this.state.latitude),
            longitude: this.state.testLong,//Number(this.state.longitude),
            latitudeDelta: 0.0322,
            longitudeDelta: 0.0321,
          }}
          showsUserLocation = {true}
        >
          {/* TEST CUSTOM MARKER */}
          {shopMarkers.markers.map((marker,i) => (
            <MapView.Marker 
              coordinate={marker.coordinates}
              title={marker.title}
              key={i}
              tracksViewChanges={false}
              onPress={()=>{this.setState({modalVisible: true, latitude: marker.coordinates.latitude-0.004, longitude: marker.coordinates.longitude, modalTitle: marker.title})}}
            >
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
                      uri: marker.imageUri,
                    }}
                />
              </View>
            </MapView.Marker>
          ))}
          {/* SHOPS FOUND NEAR THE USER LOCATION AND DISPLAYED WITH A MARKER */}
          {this.state.shopsCoordinates.map((index,i) => (
            <Marker
              coordinate={{
                latitude: index.shopLatitude,
                longitude: index.shopLongitude
              }}
              title={index.shopName}
              key={i}
              tracksViewChanges={false}
            />
          ))}

        </MapView>
        </View>
        {/*<Text style={{alignSelf: "center"}}>Postcode: {this.state.postcode} - Borough of: {this.state.city}</Text>*/}
        {/* TEST */}
        <Text style={{alignSelf: "center"}}>Postcode: {this.state.testPostCode} - Borough of: {this.state.testCity}</Text>
        {/* MODAL OPENS WHEN USER CLICKS ON MARKERS */}
        <View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.modalVisible}
            onRequestClose={() => {
              this.setState({modalVisible: false, latitude: ((this.state.latitude)+0.004)})
            }}
          >
            <View style={{backgroundColor: "white",flex:1, marginTop: 200, borderTopRightRadius: 10,borderTopLeftRadius: 10, borderLeftWidth:3, borderTopWidth:3,borderRightWidth: 3, borderLeftColor:"black",borderTopColor: "black",borderRightColor: "black"}}>
              <Header
                leftComponent={{ text: 'Close', style: { color: '#fff' } }}
                centerComponent={{ text: this.state.modalTitle, style: { color: '#fff' } }}
                rightComponent={{ text: 'Navigate', style: { color: '#fff' } }}
                containerStyle={{
                  backgroundColor: '#3D6DCC',
                  justifyContent: 'space-around',
                  borderTopLeftRadius: 7,
                  borderTopRightRadius:7,
                  height:50
                }}
              />
              <View style={{flexDirection: "row", justifyContent:"space-evenly" , margin: 50}}>
                <Text>Product</Text>
                <Text>Product</Text>
                <Text>Product</Text>
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