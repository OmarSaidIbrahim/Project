import React, { Component } from 'react'
import { Text, View, StyleSheet, PermissionsAndroid, Image, Modal, Pressable, Dimensions, ScrollView, FlatList, TouchableOpacity } from 'react-native'
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
      shopsCoordinates: [],
      //RECORD OF ALL PRODUCTS IN THE WEBSITE
      allProducts: [],
      //DATA
      data: {},
      //SHOP CLICKED BY THE USER
      shopClicked: null,
      //LOADING DATA
      isLoaded: false,
      //TEST
      dataTest: {
        "12543": [1230976020339, 1241376004039, 1241276000139, 1220476000139, 1230476020239, 1230276003239, 1280176010738, 1210066004039, 1200066004039, 1240476000139, 1245266004039, 1243866000139, 1243466020239, 1240066000139, 1240976004039, 1240676004039], 
        "6958": [1230976020339, 1240176004039, 1240076000139, 1241376004039, 1241276000139, 1270076013139, 1241676000139, 1241776004039, 1220676020339, 1220476000139, 1231276000139, 1231076000439, 1230476020239, 1230276003239, 1280176010738, 1210066004039, 1200066004039, 1240476000139, 1245266004039, 1243866000139, 1243466020239, 1240066000139, 1240676004039], 
        "8310": [1231876004039, 1230976020339, 1241376004039, 1241276000139, 1220676020339, 1220476000139, 1231076000439, 1230676020239, 1230476020239, 1230276003239, 1240876011739, 1280176010738, 1210066004039, 1260076004039, 1210266004039, 1200066004039, 1240476000139, 1245266004039, 1235266004039, 1243866000139, 1243466020239, 1240066000139, 1240976004039, 1240676004039]
      }
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
  async componentDidMount() {
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
    //--------------------------------
    this.fetchData();
  }
  fetchData = async () => {
    const a = await this.getStoresNearby();
    const b = await this.getAllProducts();
    this.setState({isLoaded: true})
    //const c = await this.getProductsLocation();
  }
  //GET THE LOCATION OF ALL THE PRODUCTS FOUND
  getProductsLocation = async () => {
    var urlShops = "physicalStoreId="+(+this.state.shopsCoordinates[0].shopId.slice(1,-1));
    var thisData = {}
    thisData[(+this.state.shopsCoordinates[0].shopId.slice(1,-1))] = []
    for(var i = 1; i < this.state.shopsCoordinates.length; i++)
    {
      urlShops = urlShops+"&physicalStoreId="+(+this.state.shopsCoordinates[i].shopId.slice(1,-1));
      thisData[(+this.state.shopsCoordinates[i].shopId.slice(1,-1))] = []
    }
    this.setState({data: thisData})
    
    var x = 0;
    var counter;
    var prod;
    var test = this.state.data
    while(x < this.state.allProducts.length)
    {
      await fetch("https://itxrest.inditex.com/LOMOServiciosRESTCommerce-ws/common/1/stock/campaign/V2021/product/part-number/"+(+this.state.allProducts[x].pn.slice(1,-1))+"?"+urlShops)
      .then(response => response.json())
      .then((response) => {
        counter = 0;
        console.log("Product: "+(+this.state.allProducts[x].pn.slice(1,-1)))
        if(response.stocks.length > 0)
        {
          prod = (+this.state.allProducts[x].pn.slice(1,-1))
          while(counter < response.stocks.length)
          {
            //SHOE SIZE = 8 (UK)
            if(response.stocks[counter].sizeStocks.some((d) => Number(d.size) == (34+8)))
            {
              console.log("Available at: "+JSON.stringify(response.stocks[counter].physicalStoreId)+"\n")
              test[JSON.stringify(response.stocks[counter].physicalStoreId)].push(prod)
            }
            else
            {
              console.log("Product not available with this size")
            }
            counter++;
          }
        }
        else{
          console.log("This product is not available around you")
        }
      })
      .catch((error, response) => {
        //console.log(error)
        //console.log(response)
      });
      x=x+1;
    }
    console.log("end.")
    console.log(test)
    this.setState({isLoaded: true})
  }
  //GET STORE NEAR THE USER LOCATION
  getStoresNearby = () => {
    return fetch("https://www.bershka.com/itxrest/2/bam/store/44009506/physical-store?latitude="+this.state.testLat+"&longitude="+this.state.testLong+"&countryCode=GB&max=10&appId=2&languageId=-1")
      .then(response => response.json())
      .then((response) => {
        var x = 0
        var dis;
        var newShop;
        var newRecord;
        //EACH STORE COLLECTED WILL BE SAVED WITH NAME AND ID AND COORDINATES INTO THE ARRAY OF DICTIONARY
        while(x < response.closerStores.length)
        {
          //THIS METHOD BELOW WILL CALCULATE THE DISTANCE BETWEEN TWO COORDINATES
          //MUST BE UPDATED BY THE USER INPUT MILES RANGE
          dis = getDistance(
            {latitude: this.state.testLat, longitude: this.state.testLong},
            {latitude: Number(JSON.stringify(response.closerStores[x].latitude)), longitude: Number(JSON.stringify(response.closerStores[x].longitude))},
          );
          //ONLY THE STORES IN THE RANGE WILL BE DISPLAYED
          if(dis < 8046)
          {
            newShop = {
              shopId: JSON.stringify(response.closerStores[x].id),
              shopName: response.closerStores[x].name,
              shopLatitude: Number(JSON.stringify(response.closerStores[x].latitude)),
              shopLongitude: Number(JSON.stringify(response.closerStores[x].longitude))
            }
            newRecord = this.state.shopsCoordinates
            newRecord.push(newShop)
            this.setState({shopsCoordinates: newRecord})
          }
          x=x+1
        }
        this.setState({shopClicked: newRecord[0].shopId})
      })
      .catch((error) => {
        console.error(error);
      });
      
  }
  //GET ALL PRODUCTS OFF THE WEBSITE
  getAllProducts = () => {
    return fetch("https://www.bershka.com/itxrest/2/catalog/store/44009506/40259534/category/1010193202/product?languageId=-1")
      .then(response => response.json())
      .then((response) => {
        var x = 0;
        var newProduct = [];
        var allProd;
        while(x < response.products.length)
        {
          //TESTING WITH SHOE SIZE = 8 (UK)
          //TOGLI JSON STRINGIFY SE NON FA
          try{
            newProduct = {
              pn: JSON.stringify(response.products[x].bundleProductSummaries[0].detail.colors[0].sizes[0].partnumber.substring(0,13)),
              image: "https://static.bershka.net/4/photos2/"+response.products[x].bundleProductSummaries[0].detail.colors[0].image.url+"_1_1_3.jpg?t="+response.products[x].bundleProductSummaries[0].detail.colors[0].image.timestamp,
              price: (response.products[x].bundleProductSummaries[0].detail.colors[0].sizes[0].price)/100
            }
            allProd = this.state.allProducts
            allProd.push(newProduct)
            x = x + 1;
          }
          catch(err){
            break;
          }
        }
        //allProd = [...new Set(allProd)];
        //Remove duplicates
        allProd = Array.from(new Set(allProd.map(a => a.pn)))
        .map(pn => {
          return allProd.find(a => a.pn === pn)
        })
        this.setState({allProducts: allProd})
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

  searchPrice = (item) => {

    /*console.log(item)
    console.log(typeof(item))
    console.log(this.state.allProducts[0].pn)
    console.log(typeof(this.state.allProducts[0].pn))*/
    let obj = this.state.allProducts.find(o => Number(o.pn.slice(1,-1)) === item);
    return obj.price;
  }

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
          {/* TEST CUSTOM MARKER 
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
          ))}*/}
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
              onPress={()=>{this.setState({shopClicked:index.shopId, modalVisible: true, testLat: index.shopLatitude-0.004, testLong: index.shopLongitude, modalTitle: index.shopName})}}
            />
          ))}

        </MapView>
        </View>
        {/*<Text style={{alignSelf: "center"}}>Postcode: {this.state.postcode} - Borough of: {this.state.city}</Text>*/}
        {/* TEST */}
        <Text style={{alignSelf: "center"}}>Postcode: {this.state.testPostCode} - Borough of: {this.state.testCity}</Text>
        <Text style={{alignSelf: "center"}}>{this.state.isLoaded ? "Data collected successfully" : "Wait for the data to be retrieved"}</Text>
        {/* MODAL OPENS WHEN USER CLICKS ON MARKERS */}
        <View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.modalVisible}
            onRequestClose={() => {
              this.setState({modalVisible: false, testLat: ((this.state.testLat)+0.004)})
            }}
          >
            <View style={{backgroundColor: "white",flex:1, marginTop: 200, borderTopRightRadius: 10,borderTopLeftRadius: 10, borderLeftWidth:3, borderTopWidth:3,borderRightWidth: 3, borderLeftColor:"black",borderTopColor: "black",borderRightColor: "black"}}>
              <Header
                leftComponent={<TouchableOpacity onPress={() => {
                  this.setState({modalVisible: false, testLat: ((this.state.testLat)+0.004)})
                }}><Text style={{ color:'white'}}>Close</Text></TouchableOpacity>}
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
              
              {/*this.state.isLoaded ? this.state.data[this.state.shopClicked.slice(1,-1)].map((index,i) => (
                <Text key={i}>{index}</Text>
              )) : <Text>No products</Text>*/}
              {this.state.isLoaded ? 
              <FlatList
                data={this.state.dataTest[this.state.shopClicked.slice(1,-1)]}
                renderItem={({item}) => {
                  let obj = this.state.allProducts.find(o => Number(o.pn.slice(1,-1)) === item);
                  return (
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'column',
                        margin: 10,
                        alignItems: "center"
                      }}>
                      <Image
                        style={styles.tinyLogo}
                        source={{uri: obj.image}}
                      />
                      <Text>{obj.price}</Text>
                    </View>
                  )
                }}
                //Setting the number of column
                numColumns={3}
                keyExtractor={(item, index) => index}
              />
              : <Text>No Products</Text>}
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
  tinyLogo: {
    width: 100,
    height: 100,
  },
 });