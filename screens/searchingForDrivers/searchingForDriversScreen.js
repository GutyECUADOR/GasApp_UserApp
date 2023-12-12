import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import React, { useContext } from 'react';
import {Colors, Fonts, Sizes, screenWidth} from '../../constants/styles';
import MapViewDirections from 'react-native-maps-directions';
import {Key} from '../../constants/key';
import MapView, {PROVIDER_GOOGLE, Marker, Callout} from 'react-native-maps';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import * as Animatable from 'react-native-animatable';
import MyStatusBar from '../../components/myStatusBar';
import { LocationContext } from '../../context/LocationContext';

const SearchingForDriversScreen = ({navigation}) => {
  const { locationState, setDistance, setDuration } = useContext(LocationContext);

  return (
    <View style={{flex: 1, backgroundColor: Colors.whiteColor}}>
      <MyStatusBar />
      <View style={{flex: 1}}>
        {displayMap()}
        {header()}
      </View>
      {searchingDriverSheet()}
    </View>
  );

  function searchingDriverSheet() {
    return (
      <Animatable.View
        animation="slideInUp"
        iterationCount={1}
        duration={1500}
        style={{...styles.bottomSheetWrapStyle}}>
        {indicator()}
        {searchingInfo()}
        {progressInfo()}
        {cancelRideAndContinueButton()}
      </Animatable.View>
    );
  }

  function indicator() {
    return <View style={{...styles.sheetIndicatorStyle}} />;
  }

  function cancelRideAndContinueButton() {
    return (
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            navigation.pop();
          }}
          style={{...styles.buttonStyle, marginRight: Sizes.fixPadding - 8.5}}>
          <Text numberOfLines={1} style={{...Fonts.whiteColor18Bold}}>
            Cancelar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            navigation.push('RideStarted');
          }}
          style={{...styles.buttonStyle, marginLeft: Sizes.fixPadding - 8.5}}>
          <Text numberOfLines={1} style={{...Fonts.whiteColor18Bold}}>
            Continuar
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  function progressInfo() {
    return (
      <View
        style={{
          marginHorizontal: Sizes.fixPadding * 5.0,
          marginVertical: Sizes.fixPadding,
        }}>
        <ActivityIndicator
          size={56}
          color={Colors.primaryColor}
          style={{
            alignSelf: 'center',
            transform: [{scale: Platform.OS == 'ios' ? 2 : 1}],
          }}
        />
      </View>
    );
  }

  function searchingInfo() {
    return (
      <View style={{alignItems: 'center', marginTop: Sizes.fixPadding + 5.0}}>
        <Image
          source={require('../../assets/images/search_driver.png')}
          style={{width: '100%', height: screenWidth / 2.5, resizeMode: 'contain'}}
        />
        <Text
          style={{
            ...Fonts.blackColor16Regular,
            textAlign: 'center',
            margin: Sizes.fixPadding * 2.0,
          }}>
          Espera un momento!! Estamos contactando{`\n`} a un delivery cercano. Tiempo de espera máximo 15 min. Si ningun delivery ha aceptado tu solicitud despues de este tiempo intentalo más tarde.
        </Text>
      </View>
    );
  }

  function header() {
    return (
      <View style={styles.headerWrapStyle}>
        <FontAwesome6
          name="arrow-left"
          size={20}
          color={Colors.blackColor}
          onPress={() => navigation.pop()}
          style={{alignSelf:'flex-start'}}
        />
      </View>
    );
  }

  function displayMap() {
    return (
      <MapView
        region={{
          latitude: locationState.location.latitude,
          longitude: locationState.location.longitude,
          latitudeDelta: 0.15,
          longitudeDelta: 0.15,
        }}
        style={{height: '100%'}}
        provider={PROVIDER_GOOGLE}>
        <MapViewDirections
          origin={locationState.deliveryLocation}
          destination={locationState.location}
          apikey={Key.apiKey}
          strokeColor={Colors.primaryColor}
          strokeWidth={3}

          onReady={ mapViewDirectionsResults =>{
            setDistance( mapViewDirectionsResults.distance);
            setDuration( mapViewDirectionsResults.duration);
          }}
        />
        <Marker coordinate={locationState.deliveryLocation}
          title='Delivery más cercano'
          description={'Latidud:'+ locationState.deliveryLocation.latitude +'Longitud:'+ locationState.deliveryLocation.longitude}
          >
          <Image
            source={require('../../assets/images/icons/cilindro_amarillo.png')}
            style={{width: 50.0, height: 50.0, resizeMode: 'stretch'}}
          />
        </Marker>
        <Marker coordinate={locationState.location}
          title='Punto de entrega'
          description='Se entregara en esta dirección'
          >
          <Image
            source={require('../../assets/images/icons/marker3.png')}
            style={{width: 23.0, height: 23.0}}
          />
        </Marker>
      </MapView>
    );
  }
};

export default SearchingForDriversScreen;

const styles = StyleSheet.create({
  headerWrapStyle: {
    position: 'absolute',
    top: 20.0,
    left: 15.0,
    right: 15.0,
  },
  calloutWrapStyle: {
    width: screenWidth / 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Sizes.fixPadding,
    backgroundColor: Colors.whiteColor,
  },
  kilometerInfoWrapStyle: {
    borderRadius: Sizes.fixPadding - 5.0,
    backgroundColor: Colors.lightBlackColor,
    paddingVertical: Sizes.fixPadding,
    paddingHorizontal: Sizes.fixPadding - 5.0,
  },
  bottomSheetWrapStyle: {
    borderTopLeftRadius: Sizes.fixPadding * 2.5,
    borderTopRightRadius: Sizes.fixPadding * 2.5,
    backgroundColor: Colors.whiteColor,
    paddingHorizontal: 0.0,
    position: 'absolute',
    bottom: 0.0,
    left: 0.0,
    right: 0.0,
  },
  sheetIndicatorStyle: {
    width: 50,
    height: 5.0,
    backgroundColor: Colors.primaryColor,
    borderRadius: Sizes.fixPadding,
    marginVertical: Sizes.fixPadding * 2.0,
    alignSelf: 'center',
  },
  buttonStyle: {
    flex: 1,
    marginTop: Sizes.fixPadding * 3.0,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Sizes.fixPadding + 2.0,
    borderColor: Colors.whiteColor,
  },
});
