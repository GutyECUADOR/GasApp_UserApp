import {
  StyleSheet,
  BackHandler,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  Button,
  ActivityIndicator
} from 'react-native';
import React, {useState, useEffect, useCallback, useRef} from 'react';
import {Colors, Fonts, Sizes, screenHeight} from '../../constants/styles';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import {Overlay} from '@rneui/themed';
import BottomSheet from 'react-native-simple-bottom-sheet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useFocusEffect} from '@react-navigation/native';
import MyStatusBar from '../../components/myStatusBar';
import { useLocation } from '../../hooks/useLocation';

import database from '@react-native-firebase/database';

const HomeScreen = ({navigation}) => {

  const [backClickCount, setBackClickCount] = useState(0);
  const [distribuidoresCercanos, setDistribuidoresCercanos] = useState([
    
  ])
  const [data, setData] = useState([])

  const getData = () => {
    database()
      .ref('/notas')
      .on('value', snapshot => {
        let responselist = Object.values(snapshot.val())
       
        const markers = responselist.map( responselist =>{
          return {
            id: responselist["id:"],
            coordinate: {
              latitude: responselist["coordinate"]["latitude"],
              longitude: responselist["coordinate"]["longitude"],
            }
          }
        });

        /* const objeto1 = {
            id: responselist[0]["id:"],
            coordinate: {
              latitude: responselist[0]["coordinate"]["latitude"],
              longitude: responselist[0]["coordinate"]["longitude"],
            }
          }

        const objeto2 = {
          id: responselist[1]["id:"],
          coordinate: {
            latitude: responselist[1]["coordinate"]["latitude"],
            longitude: responselist[1]["coordinate"]["longitude"],
          }
        } */
       
        setDistribuidoresCercanos(markers);
        console.log('User data: ', responselist);
        /* console.log('markers: ', objeto1.coordinate.latitude);
        console.log('markers: ', objeto1.coordinate.longitude); */
      });

  }

  useEffect(() => {
   
      getData()
    
  }, []);

  const { hasLocation, initialPosition, getCurrentLocation, address } = useLocation();
  const mapViewRef = useRef();

  const centerPosition = async () => {
    const { latitude, longitude } = await getCurrentLocation()
    console.log('Centrando posición', latitude, longitude);
    mapViewRef.current?.animateCamera({
      center: {
          latitude,
          longitude,
          zoom:8
      }
    })
  };

  const backAction = () => {
    if (Platform.OS === 'ios') {
      navigation.addListener('beforeRemove', e => {
        e.preventDefault();
      });
    } else {
      backClickCount == 1 ? BackHandler.exitApp() : _spring();
      return true;
    }
  };

  useFocusEffect(
    useCallback(() => {
      BackHandler.addEventListener('hardwareBackPress', backAction);
      navigation.addListener('gestureEnd', backAction);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', backAction);
        navigation.removeListener('gestureEnd', backAction);
      };
    }, [backAction]),
  );

  function _spring() {
    setBackClickCount(1);
    setTimeout(() => {
      setBackClickCount(0);
    }, 1000);
  }

  function loadingDialog() {
    return (
      <Overlay isVisible={!hasLocation} overlayStyle={styles.dialogStyle}>
        <ActivityIndicator
          size={56}
          color={Colors.primaryColor}
          style={{
            alignSelf: 'center',
            transform: [{scale: Platform.OS == 'ios' ? 2 : 1}],
          }}
        />
        <Text
          style={{
            marginTop: Sizes.fixPadding * 2.0,
            textAlign: 'center',
            ...Fonts.grayColor14Regular,
          }}>
          Espera, te estamos ubicando...
        </Text>
      </Overlay>
    );
  }
  


  return (
    
    <View style={{flex: 1, backgroundColor: Colors.whiteColor}}>
      <MyStatusBar />
      <View style={{flex: 1}}>
        {displayMap()}
        {currentLocationWithMenuIcon()}
        {nearestLocationsSheet()}
      </View>
      {exitInfo()}
      {loadingDialog()}
    </View>
  );

  function currentLocationIcon() {
    return (
      <View style={styles.currentLocationIconWrapStyle}>
        <MaterialIcons onPress={centerPosition} name="my-location" size={30} color="black" />
      </View>
    );
  }

  function currentLocationWithMenuIcon() {
    return (
      <View style={styles.currentLocationWithIconWrapStyle}>
        <MaterialIcons
          name="menu"
          size={20}
          color={Colors.blackColor}
          onPress={() => {
            navigation.openDrawer();
          }}
        />
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: Sizes.fixPadding + 5.0,
          }}>
          <MaterialIcons
            name="location-pin"
            size={20}
            color={Colors.primaryColor}
          />
          <Text
            style={{
              marginLeft: Sizes.fixPadding - 4.0,
              flex: 1,
              ...Fonts.blackColor15SemiBold,
            }}>
            {address} 
          </Text>
        </View>
      </View>
    );
  }

  function nearestLocationsSheet() {
    return (
      <BottomSheet
        isOpen={true}
        lineContainerStyle={{
          height: 0.0,
          marginVertical: Sizes.fixPadding + 5.0,
        }}
        lineStyle={styles.sheetIndicatorStyle}
        wrapperStyle={{...styles.bottomSheetWrapStyle}}>
       {/*  {searchBar()} */}
        <Button
          onPress={centerPosition}
          title="Pedir Ahora"
          color={Colors.primaryColor}
          accessibilityLabel="Clic para solicitar"
        />
       {/*  <TouchableOpacity style={styles.appButtonContainer}>
          <Text style={styles.appButtonText}>Clic para solicitar</Text>
        </TouchableOpacity> */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: Sizes.fixPadding,
            paddingBottom: Sizes.fixPadding * 3.0,
          }}>
          {/* {nearestLocations.map((item, index) => (
            <View key={`${item.id}`} style={{}}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  navigation.push('BookNow');
                }}
                style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={styles.iconCircleStyle}>
                  <MaterialIcons
                    name="star-border"
                    size={18}
                    color={Colors.lightGrayColor}
                  />
                </View>
                <View style={{flex: 1, marginLeft: Sizes.fixPadding + 5.0}}>
                  <Text style={{...Fonts.blackColor16SemiBold}}>
                    {item.address}
                  </Text>
                  <Text style={{...Fonts.grayColor15Regular}}>
                    {item.addressDetail}
                  </Text>
                </View>
              </TouchableOpacity>
              {nearestLocations.length - 1 == index ? null : (
                <View
                  style={{
                    backgroundColor: Colors.shadowColor,
                    height: 1.0,
                    marginVertical: Sizes.fixPadding + 5.0,
                  }}
                />
              )}
            </View>
          ))} */}
        </ScrollView>
        {currentLocationIcon()}
      </BottomSheet>
    );
  }

  function searchBar() {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          navigation.push('DropOffLocation');
        }}
        style={styles.searchBarWrapStyle}>
        <MaterialIcons name="search" size={24} color={Colors.primaryColor} />
        <Text
          style={{
            flex: 1,
            marginLeft: Sizes.fixPadding,
            ...Fonts.blackColor15SemiBold,
          }}>
          Where to go?
        </Text>
      </TouchableOpacity>
    );
  }

  function displayMap() {
    return (
      <View style={{flex: 1}}>
        <MapView
          ref={ (element) => mapViewRef.current = element}
          region={{
            latitude: initialPosition.latitude,
            longitude: initialPosition.longitude,
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
          }}
          style={{height: '100%'}}
          provider={PROVIDER_GOOGLE}>
          {distribuidoresCercanos.map((item, index) => (
            <Marker key={`${index}`} coordinate={ item.coordinate }>
              <Image
                source={require('../../assets/images/icons/cilindro_amarillo.png')}
                style={{
                  width: 23.0,
                  height: 43.0,
                }}
              />
            </Marker>
          ))}
          <Marker 
            coordinate={initialPosition}
            title='Solicitar aqui'
            description='El delivery llegará a esta ubicación'
          
          >
            {/* <Image
              source={require('../../assets/images/icons/current_marker.png')}
              style={{width: 70.0, height: 70.0, resizeMode: 'contain'}}
            /> */}
          </Marker>
        </MapView>
      </View>
    );
  }

  function exitInfo() {
    return backClickCount == 1 ? (
      <View style={styles.exitInfoWrapStyle}>
        <Text style={{...Fonts.whiteColor15SemiBold}}>
          Presiona otra vez para salir de la app
        </Text>
      </View>
    ) : null;
  }
};

export default HomeScreen;

const styles = StyleSheet.create({
  appButtonContainer: {
    elevation: 2,
    backgroundColor: Colors.primaryColor,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  appButtonText: {
    fontSize: 18,
    color: "#fff",
    alignSelf: "center",
    textTransform: "uppercase"
  },
  exitInfoWrapStyle: {
    backgroundColor: Colors.lightBlackColor,
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    borderRadius: Sizes.fixPadding * 2.0,
    paddingHorizontal: Sizes.fixPadding + 5.0,
    paddingVertical: Sizes.fixPadding,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheetWrapStyle: {
    paddingBottom: Sizes.fixPadding - 5.0,
    paddingTop: Sizes.fixPadding + 5.0,
    paddingHorizontal: Sizes.fixPadding * 2.0,
    borderTopLeftRadius: Sizes.fixPadding * 2.5,
    borderTopRightRadius: Sizes.fixPadding * 2.5,
    backgroundColor: Colors.whiteColor,
  },
  searchBarWrapStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.shadowColor,
    borderRadius: Sizes.fixPadding - 5.0,
    paddingHorizontal: Sizes.fixPadding,
    paddingVertical: Sizes.fixPadding + 5.0,
    marginBottom: Sizes.fixPadding * 2.0,
  },
  currentLocationWithIconWrapStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.whiteColor,
    paddingHorizontal: Sizes.fixPadding,
    paddingVertical: Sizes.fixPadding * 2.0,
    borderRadius: Sizes.fixPadding - 5.0,
    margin: Sizes.fixPadding * 2.0,
    position: 'absolute',
  },
  currentLocationIconWrapStyle: {
    top: -100.0,
    right: 0.0,
    position: 'absolute',
    flex: 1,
    borderRadius: 20.0,
    width: 40.0,
    height: 40.0,
    backgroundColor: Colors.whiteColor,
    elevation: 2.0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleStyle: {
    backgroundColor: Colors.shadowColor,
    width: 30.0,
    height: 30.0,
    borderRadius: 15.0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetIndicatorStyle: {
    width: 50,
    height: 5.0,
    backgroundColor: Colors.primaryColor,
    borderRadius: Sizes.fixPadding,
  },
});
