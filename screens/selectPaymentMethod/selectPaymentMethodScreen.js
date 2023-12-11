import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import React, {useContext, useState} from 'react';
import {
  Colors,
  Fonts,
  Sizes,
  screenHeight,
  screenWidth,
} from '../../constants/styles';
import MapViewDirections from 'react-native-maps-directions';
import {Key} from '../../constants/key';
import MapView, {PROVIDER_GOOGLE, Marker, Callout} from 'react-native-maps';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import BottomSheet from 'react-native-simple-bottom-sheet';
import * as Animatable from 'react-native-animatable';
import MyStatusBar from '../../components/myStatusBar';
import { useLocation } from '../../hooks/useLocation';
import { LocationContext } from '../../context/LocationContext';


const paymentmethods = [
  {
    id: '1',
    paymentIcon: require('../../assets/images/paymentMethods/cash.png'),
    paymentType: 'cash',
    paymentMethod: 'Efectivo',
  },
  {
    id: '2',
    paymentIcon: require('../../assets/images/paymentMethods/wallet.png'),
    paymentType: 'other',
    paymentMethod: 'Transferencia Bancaria',
  },
];

const SelectPaymentMethodScreen = ({navigation}) => {
  const [selectedPaymentMethodIndex, setSelectedPaymentMethodIndex] = useState(0);
  
  const { locationState, setlocation, getCurrentLocation } = useContext(LocationContext);

  return (
    <View style={{flex: 1, backgroundColor: Colors.whiteColor}}>
      <MyStatusBar />
      <View style={{flex: 1}}>
        {displayMap()}
        {header()}
        {paymentSheet()}
        {bookRideButton()}
      </View>
    </View>
  );

  function paymentSheet() {
    return (
      <BottomSheet
        isOpen={false}
        sliderMinHeight={300}
        sliderMaxHeight={screenHeight - 150.0}
        lineContainerStyle={{
          height: 0.0,
          marginVertical: Sizes.fixPadding + 5.0,
        }}
        lineStyle={styles.sheetIndicatorStyle}
        wrapperStyle={{...styles.bottomSheetWrapStyle}}>
        {onScrollEndDrag => (
          <ScrollView
            onScrollEndDrag={onScrollEndDrag}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: Sizes.fixPadding * 2.0}}>
            <Animatable.View
              animation="slideInUp"
              iterationCount={1}
              duration={1500}
              style={{flex: 1}}>
             
              {dropLocationInfo()}
              {paymentMethodsInfo()}
            </Animatable.View>
          </ScrollView>
        )}
      </BottomSheet>
    );
  }

  function bookRideButton() {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          navigation.push('SearchingForDrivers');
        }}
        style={{
          ...styles.buttonStyle,
          position: 'absolute',
          bottom: 0.0,
          right: 0.0,
          left: 0.0,
        }}>
        <Text style={{...Fonts.whiteColor18Bold}}>Confirmar</Text>
      </TouchableOpacity>
    );
  }

  function paymentMethodsInfo() {
    return (
      <View
        style={{
          marginTop: Sizes.fixPadding * 2.0,
          marginHorizontal: Sizes.fixPadding * 2.0,
        }}>
        <Text
          style={{marginBottom: Sizes.fixPadding, ...Fonts.blackColor18Bold}}>
          Método de pago
        </Text>
        {paymentmethods.map((item, index) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setSelectedPaymentMethodIndex(index);
            }}
            key={`${item.id}`}
            style={styles.paymentMethodWrapStyle}>
            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
              <Image
                source={item.paymentIcon}
                style={{width: 40.0, height: 40.0, resizeMode: 'contain'}}
              />
              {item.paymentType == 'card' ? (
                <View style={{marginLeft: Sizes.fixPadding + 5.0, flex: 1}}>
                  <Text
                    numberOfLines={1}
                    style={{...Fonts.blackColor16SemiBold}}>
                    {item.cardNumber}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{...Fonts.grayColor12SemiBold}}>
                    Expires 04/25
                  </Text>
                </View>
              ) : (
                <Text
                  numberOfLines={1}
                  style={{
                    marginLeft: Sizes.fixPadding + 5.0,
                    flex: 1,
                    ...Fonts.blackColor16SemiBold,
                  }}>
                  {item.paymentMethod}
                </Text>
              )}
            </View>
            <View
              style={{
                ...styles.selectedMethodIndicatorStyle,
                backgroundColor:
                  selectedPaymentMethodIndex == index
                    ? Colors.lightBlackColor
                    : Colors.shadowColor,
              }}>
              <MaterialIcons name="check" color={Colors.whiteColor} size={14} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  function dropLocationInfo() {
    return (
      <View style={styles.dropLocationInfoWrapStyle}>
        <View style={{width: 24.0, alignItems: 'center'}}>
          <MaterialIcons
            name="location-pin"
            size={24}
            color={Colors.primaryColor}
          />
        </View>
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            marginLeft: Sizes.fixPadding + 5.0,
            ...Fonts.blackColor15SemiBold,
          }}>
          { locationState.address }
        </Text>
      </View>
    );
  }

  function currentToDropLocDivider() {
    return (
      <View
        style={{
          marginHorizontal: Sizes.fixPadding * 2.0,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <View style={{width: 24.0, alignItems: 'center'}}>
          <Text style={{...Fonts.blackColor8SemiBold, lineHeight: 6}}>
            •{`\n`}•{`\n`}•{`\n`}•{`\n`}•{`\n`}•{`\n`}•
          </Text>
        </View>
        <View style={styles.currentToDropLocationInfoDividerStyle} />
      </View>
    );
  }

  function currentLocationInfo() {
    return (
      <View style={styles.currentLocationInfoWrapStyle}>
        <View style={{width: 24, alignItems: 'center'}}>
          <View style={styles.currentLocationIconStyle}>
            <View style={styles.currentLocationInnerCircel} />
          </View>
        </View>
        <Text
          numberOfLines={1}
          style={{
            marginLeft: Sizes.fixPadding + 5.0,
            flex: 1,
            ...Fonts.blackColor15SemiBold,
          }}>
          9 Bailey Drive, Fredericton, NB E3B 5A3
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
        />
        <Text
          style={{
            flex: 1,
            marginLeft: Sizes.fixPadding + 2.0,
            ...Fonts.blackColor20ExtraBold,
          }}>
          Forma de pago
        </Text>
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
        />
        <Marker coordinate={locationState.deliveryLocation}>
          <Image
            source={require('../../assets/images/icons/cilindro_amarillo.png')}
            style={{width: 50.0, height: 50.0, resizeMode: 'stretch'}}
          />
        </Marker>
        <Marker coordinate={locationState.location}>
          <Image
            source={require('../../assets/images/icons/marker3.png')}
            style={{width: 23.0, height: 23.0}}
          />
        </Marker>
      </MapView>
    );
  }
};

export default SelectPaymentMethodScreen;

const styles = StyleSheet.create({
  paymentMethodWrapStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: Colors.shadowColor,
    borderWidth: 1.0,
    borderRadius: Sizes.fixPadding - 5.0,
    padding: Sizes.fixPadding,
    marginBottom: Sizes.fixPadding + 5.0,
  },
  headerWrapStyle: {
    flexDirection: 'row',
    alignItems: 'center',
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
    paddingTop: Sizes.fixPadding + 5.0,
    borderTopLeftRadius: Sizes.fixPadding * 2.5,
    borderTopRightRadius: Sizes.fixPadding * 2.5,
    backgroundColor: Colors.whiteColor,
    paddingHorizontal: 0.0,
    elevation: 0.0,
    marginBottom: Sizes.fixPadding * 4.5,
  },
  currentToDropLocationInfoDividerStyle: {
    backgroundColor: Colors.shadowColor,
    height: 1.0,
    flex: 1,
    marginRight: Sizes.fixPadding * 2.5,
    marginLeft: Sizes.fixPadding,
  },
  currentLocationIconStyle: {
    width: 18.0,
    height: 18.0,
    borderRadius: 9.0,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: Colors.blackColor,
    borderWidth: 2.0,
  },
  currentLocationInnerCircel: {
    width: 7.0,
    height: 7.0,
    borderRadius: 3.5,
    backgroundColor: Colors.blackColor,
  },
  sheetIndicatorStyle: {
    width: 50,
    height: 5.0,
    backgroundColor: Colors.primaryColor,
    borderRadius: Sizes.fixPadding,
  },
  currentLocationInfoWrapStyle: {
    marginTop: Sizes.fixPadding,
    marginHorizontal: Sizes.fixPadding * 2.0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropLocationInfoWrapStyle: {
    marginHorizontal: Sizes.fixPadding * 2.0,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -(Sizes.fixPadding - 10.0),
  },
  buttonStyle: {
    marginTop: Sizes.fixPadding + 5.0,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Sizes.fixPadding + 2.0,
  },
  selectedMethodIndicatorStyle: {
    width: 20.0,
    height: 20.0,
    borderRadius: 10.0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
