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
import React, {useState, useEffect, useCallback, useRef, useContext} from 'react';
import {Colors, Fonts, Sizes, screenHeight} from '../../constants/styles';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import {Overlay} from '@rneui/themed';
import BottomSheet from 'react-native-simple-bottom-sheet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useFocusEffect} from '@react-navigation/native';
import MyStatusBar from '../../components/myStatusBar';

//import database from '@react-native-firebase/database';
import firestore from '@react-native-firebase/firestore';
import { LocationContext } from '../../context/LocationContext';

const HomeScreen = ({navigation}) => {

  const [backClickCount, setBackClickCount] = useState(0);
  const [distribuidoresCercanos, setDistribuidoresCercanos] = useState([])

  const { locationState, setLocation, getAddress, getCurrentLocation } = useContext(LocationContext);

  const mapViewRef = useRef();

  useEffect(() => {
    const subscriber = firestore()
    .collection('distribuidores').where('isActivo', '==', true)
    .onSnapshot(querySnapshot => {
      const markers = [];

      querySnapshot.forEach(documentSnapshot => {
        markers.push({
          id: documentSnapshot.id,
          coordinate: {
            latitude: documentSnapshot.get('coordinate').latitude,
            longitude: documentSnapshot.get('coordinate').longitude,
          },
        });
      });

      console.log('Markers Distribuidores: ', markers);
      setDistribuidoresCercanos(markers);
     
    });

    // Unsubscribe from events when no longer in use
    return () => subscriber();
  }, []);

  useEffect(() => {
    getAddress();
  }, [])
  

  const centerPosition = async () => {
    const { latitude, longitude } = await getCurrentLocation()
    setLocation({latitude, longitude});
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
      <Overlay isVisible={!locationState.hasLocation} overlayStyle={styles.dialogStyle}>
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

  function continueButton() {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={ async () => {
          await getAddress();
          navigation.push('SelectPaymentMethod');
        }}
        style={styles.buttonStyle}>
        <Text style={{...Fonts.whiteColor18Bold}}>Solicitar</Text>
      </TouchableOpacity>
    );
  }
  
  


  return (
    
    <View style={{flex: 1, backgroundColor: Colors.whiteColor}}>
      <MyStatusBar />
      <View style={{flex: 1}}>
        {displayMap()}
        {currentLocationWithMenuIcon()}
        {continueButton()}
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
            {locationState.address} 
          </Text>
        </View>
        {currentLocationIcon()}
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
        <Button
          onPress={
            () => {
              navigation.push('SelectPaymentMethod');
            }
          }
          title="Pedir Ahora"
          color={Colors.primaryColor}
          accessibilityLabel="Clic para solicitar"
        />
       
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: Sizes.fixPadding,
            paddingBottom: Sizes.fixPadding * 3.0,
          }}>
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
          zoomEnabled={true}
          minZoomLevel={15}
          zoomControlEnabled={true}
          showsUserLocation={true}
          region={{
            latitude: locationState.location.latitude,
            longitude: locationState.location.longitude,
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
          }}
          style={{height: '100%'}}
          provider={PROVIDER_GOOGLE}>
          {distribuidoresCercanos.map((item, index) => (
            <Marker key={`${index}`} coordinate={ item.coordinate }
              title='Delivery Cercano'
              description='Este delivery está activo'
              >
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
            draggable={true}
            coordinate={locationState.location}
            title='Solicitar aqui'
            description='El delivery llegará a esta ubicación'
            onDragEnd={ (event)=> {
              const latitude = event.nativeEvent.coordinate.latitude;
              const longitude = event.nativeEvent.coordinate.longitude;
              setLocation({latitude, longitude});
            }}
          
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
    top: 10.0,
    right: 10.0,
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
  buttonStyle: {
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Sizes.fixPadding + 3.0,
  }
});
