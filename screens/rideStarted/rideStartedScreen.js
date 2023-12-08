import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import React from 'react';
import {
  Colors,
  Fonts,
  Sizes,
  commonStyles,
  screenHeight,
  screenWidth,
} from '../../constants/styles';
import MapViewDirections from 'react-native-maps-directions';
import {Key} from '../../constants/key';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import * as Animatable from 'react-native-animatable';
import MyStatusBar from '../../components/myStatusBar';

const RideStartedScreen = ({navigation}) => {
  return (
    <View style={{flex: 1, backgroundColor: Colors.shadowColor}}>
      <MyStatusBar />
      <View style={{flex: 1}}>
        {directionInfo()}
       {/*  {reachingDestinationInfo()} */}
        {header()}
        {driverInfoSheet()}
      </View>
    </View>
  );

  function driverInfoSheet() {
    return (
      <Animatable.View
        animation="slideInUp"
        iterationCount={1}
        duration={1500}
        style={{...styles.bottomSheetWrapStyle}}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {driverInfo()}
        </ScrollView>
        {endRideButton()}
      </Animatable.View>
    );
  }

  function indicator() {
    return <View style={{...styles.sheetIndicatorStyle}} />;
  }

  function endRideButton() {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          navigation.push('Rating');
        }}
        style={styles.buttonStyle}>
        <Text style={{...Fonts.whiteColor18Bold}}>Finalizar</Text>
      </TouchableOpacity>
    );
  }

  function driverInfo() {
    return (
      <View style={{marginTop: Sizes.fixPadding}}>
        {driverImageWithCallAndMessage()}
        {driverDetail()}
      </View>
    );
  }

  function driverDetail() {
    return (
      <View
        style={{
          marginTop: Sizes.fixPadding,
          marginBottom: Sizes.fixPadding * 3.0,
        }}>
        <Text style={{textAlign: 'center', ...Fonts.blackColor17SemiBold}}>
          Cameron Williamson
        </Text>
        <View style={styles.rideInfoWrapStyle}>
          <View
            style={{
              maxWidth: screenWidth / 2.5,
              marginHorizontal: Sizes.fixPadding + 9.0,
              alignItems: 'center',
            }}>
            <Text numberOfLines={1} style={{...Fonts.grayColor14Regular}}>
              Teléfono
            </Text>
            <Text numberOfLines={1} style={{...Fonts.blackColor15SemiBold}}>
              0999887477
            </Text>
          </View>
          <View
            style={{
              maxWidth: screenWidth / 2.5,
              marginHorizontal: Sizes.fixPadding + 9.0,
              alignItems: 'center',
            }}>
            <Text numberOfLines={1} style={{...Fonts.grayColor14Regular}}>
              LLegará en
            </Text>
            <Text numberOfLines={1} style={{...Fonts.blackColor15SemiBold}}>
              15 mins
            </Text>
          </View>
          
        </View>
      </View>
    );
  }

  function driverImageWithCallAndMessage() {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <ImageBackground
            source={require('../../assets/images/users/nouser.png')}
            style={styles.driverImageStyle}>
            
          </ImageBackground>
        </View>
        
      </View>
    );
  }

  function reachingDestinationInfo() {
    return (
      <View style={styles.reachingDestinationInfoWrapStyle}>
        <Text style={{...Fonts.grayColor14Regular}}>
          LLegará a tu ubicación en
        </Text>
        <Text style={{...Fonts.blackColor14SemiBold}}>15 mins</Text>
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
          style={{alignSelf: 'flex-start'}}
        />
      </View>
    );
  }

  function directionInfo() {
    const currentCabLocation = {
      latitude: 22.715024,
      longitude: 88.474119,
    };
    const userLocation = {
      latitude: 22.558488,
      longitude: 88.309215,
    };
    return (
      <MapView
        region={{
          latitude: 22.528682,
          longitude: 88.374505,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }}
        style={{height: '100%'}}
        provider={PROVIDER_GOOGLE}
        mapType="terrain">
        <MapViewDirections
          origin={userLocation}
          destination={currentCabLocation}
          apikey={Key.apiKey}
          strokeColor={Colors.primaryColor}
          strokeWidth={3}
        />
        <Marker coordinate={currentCabLocation}>
          <Image
            source={require('../../assets/images/icons/marker2.png')}
            style={{width: 50.0, height: 50.0, resizeMode: 'stretch'}}
          />
        </Marker>
        <Marker coordinate={userLocation}>
          <Image
            source={require('../../assets/images/icons/cab.png')}
            style={{
              width: 25.0,
              height: 45.0,
              resizeMode: 'contain',
              top: 16.0,
              transform: [{rotate: '70deg'}],
            }}
          />
        </Marker>
      </MapView>
    );
  }
};

export default RideStartedScreen;

const styles = StyleSheet.create({
  headerWrapStyle: {
    position: 'absolute',
    top: 20.0,
    left: 15.0,
    right: 15.0,
  },
  rideInfoWrapStyle: {
    marginTop: Sizes.fixPadding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheetWrapStyle: {
    borderTopLeftRadius: Sizes.fixPadding * 2.5,
    borderTopRightRadius: Sizes.fixPadding * 2.5,
    backgroundColor: Colors.whiteColor,
    position: 'absolute',
    left: 0.0,
    right: 0.0,
    bottom: 0.0,
    maxHeight: screenHeight / 2.4,
  },
  sheetIndicatorStyle: {
    width: 50,
    height: 5.0,
    backgroundColor: Colors.primaryColor,
    borderRadius: Sizes.fixPadding,
    alignSelf: 'center',
    marginVertical: Sizes.fixPadding * 2.0,
  },
  callAndMessageIconWrapStyle: {
    width: screenWidth / 10.0,
    height: screenWidth / 10.0,
    borderRadius: screenWidth / 10.0 / 2.0,
    backgroundColor: Colors.whiteColor,
    elevation: 3.0,
    alignItems: 'center',
    justifyContent: 'center',
    ...commonStyles.shadow,
  },
  ratingInfoWrapStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: Sizes.fixPadding - 8.0,
  },
  buttonStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryColor,
    paddingVertical: Sizes.fixPadding + 3.0,
  },
  reachingDestinationInfoWrapStyle: {
    position: 'absolute',
    left: 20.0,
    right: 20.0,
    top: 60.0,
    backgroundColor: Colors.whiteColor,
    borderRadius: Sizes.fixPadding - 5.0,
    paddingHorizontal: Sizes.fixPadding * 2.0,
    paddingVertical: Sizes.fixPadding,
  },
  driverImageStyle: {
    width: screenWidth / 4.0,
    height: screenWidth / 4.0,
    backgroundColor: 'orange',
    borderRadius: screenWidth / 4.0 / 2.0,
    marginHorizontal: Sizes.fixPadding * 2.0,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
});
