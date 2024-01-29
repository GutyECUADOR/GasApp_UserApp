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
  ActivityIndicator,
  Alert,
  ImageBackground
} from 'react-native';
import {Key} from '../../constants/key';
import React, {useState, useEffect, useCallback, useRef, useContext} from 'react';
import {Colors, Fonts, Sizes, screenHeight, screenWidth} from '../../constants/styles';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {Overlay} from '@rneui/themed';
import BottomSheet from 'react-native-simple-bottom-sheet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import {useFocusEffect} from '@react-navigation/native';
import MyStatusBar from '../../components/myStatusBar';
import { getDistance } from 'geolib';

import firestore from '@react-native-firebase/firestore';
import { AuthContext } from '../../context/AuthContext';
import { LocationContext } from '../../context/LocationContext';

const HomeScreen = ({navigation}) => {

  // Constantes
  // Verificar Métodos de pago segun DB
  const paymentmethods = [
    {
      id: 1,
      paymentIcon: require('../../assets/images/paymentMethods/cash.png'),
      paymentType: 'cash',
      paymentMethod: 'Efectivo',
    },
    {
      id: 2,
      paymentIcon: require('../../assets/images/paymentMethods/wallet.png'),
      paymentType: 'other',
      paymentMethod: 'Transferencia Bancaria',
    },
  ];

  const appState = {
    SinPedido: 'SinPedido',
    SeleccionandoPago: 'SeleccionandoPago',
    BuscandoDelivery: 'BuscandoDelivery',
    DeliveryIniciado: 'DeliveryIniciado',
    DeliveryFinalizado: 'DeliveryFinalizado'
  };

  // State
  const [pedidoStep, setpedidoStep] = useState(appState.SinPedido)
  const [backClickCount, setBackClickCount] = useState(0);
  const [distribuidoresCercanos, setDistribuidoresCercanos] = useState([])
  /* const [selectedPaymentMethodIndex, setSelectedPaymentMethodIndex] = useState(0); */

  // Contexts
  const { user, registerPedidoFinalizado } = useContext(AuthContext)
  const { locationState, setLocation, setDistance, setDuration, setDeliveryLocation, setDelivery, getAddress, getCurrentLocation, setHasPedidoActivo, setPedidoActivoID, setStatusDelivery, setPaymentMethodIndex } = useContext(LocationContext);

  const mapViewRef = useRef();

  const sortByDistance = (array) => {
    return array.sort((a, b) => a.distance - b.distance);
  }

  const cancelarPedidoDelivery = async () => {
      setpedidoStep(appState.SinPedido);
      setDeliveryLocation(null)
      navigation.push('Home');
  }

  const finalizarPedidoDelivery = async (pedidoID) => {
    await firestore().collection('pedidos').doc(pedidoID).update({
      status: 'Finalizado'
    }).then(() => {
      console.log('Pedido finalizado!');
    });
  }

  const deletePedidoDelivery = async () => {
    // Register on DB Laravel
    registerPedidoFinalizado({
      id_usuario: user.id,
      id_delivery: 1,
      address: locationState.address,
      distance: locationState.distance,
      payment_method_id: locationState.paymentMethodIndex,
      status: 1
    });

    await firestore()
      .collection('pedidos')
      .doc(locationState.pedidoActivoID)
      .delete()
      .then(() => {
        console.log(`Pedido ${locationState.pedidoActivoID} finalizado`);
        
        setDeliveryLocation(null)
        setPedidoActivoID(null);
        setDelivery(null);
        setpedidoStep(appState.DeliveryFinalizado);
        navigation.push('Rating');
      });

      

  }

  // Watch de distribuidores activos en firestore
  useEffect(() => {
    const subscriber = firestore()
    .collection('distribuidores').where('isActivo', '==', true).limit(10)
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

      const distanceMarkers = markers.map( location => {
        const distance = getDistance(locationState.location, location.coordinate);
        location.distance = distance;
        return location
      });

     /*  console.log('Markers Distribuidores: ', distanceMarkers); */

      setDistribuidoresCercanos(distanceMarkers);
     
    });

    // Unsubscribe from events when no longer in use
    return () => subscriber();
  }, [locationState.location]);

  //Watch del pedido activo
  useEffect(() => {

    if (locationState.pedidoActivoID == null) {
      return;
    }

    const subscriber = firestore()
      .collection('pedidos')
      .doc(locationState.pedidoActivoID)
      .onSnapshot(documentSnapshot => {
        if (documentSnapshot.exists) {
          const statusDelivery = documentSnapshot.get('status');
          console.log('statusDelivery: ', statusDelivery);

          switch (statusDelivery) {
            case 'En Proceso':
              const delivery = documentSnapshot.get('delivery');
              setDelivery({
                id: delivery.id,
                coordinate: {
                  latitude: delivery.coordinate.latitude,
                  longitude: delivery.coordinate.longitude
                },
                name: delivery.name,
                email: delivery.email,
                phone: delivery.phone
              });
              setpedidoStep(appState.DeliveryIniciado);
              console.log('Delivery:', locationState.delivery);
              break;

            case 'Finalizado':
              Alert.alert('Pedido finalizado', 'El delivery se ha marcado como finalizado. Gracias por utilizar la app', [ {
                text: 'Aceptar',
                onPress: () => {
                  deletePedidoDelivery();
                },
              }]);
              break;
          
            default:
              break;
          }
        }
      });
  
    return () => subscriber();
  }, [locationState.pedidoActivoID])

  // Obtener dirección de las coordenadas
  useEffect(() => {
    getAddress();
  }, [])

  // Crear pedido en Firestore
  const createPedidoDelivery = async () => {
    const nuevoPedido = await firestore().collection('pedidos').add({
     delivery: null,
     status: 'Pendiente',
     date: Date.now(),
     client: {
       name: user.name,
       email: user.email,
       address: locationState.address,
       coordinate: new firestore.GeoPoint(locationState.location.latitude, locationState.location.longitude),
     }
   })

   setHasPedidoActivo(true);
   setPedidoActivoID(nuevoPedido.id)
   console.log('ID nuevo Pedido', nuevoPedido.id);
 }
  
  const centerPosition = async () => {
    const { latitude, longitude } = await getCurrentLocation()
    setLocation({latitude, longitude});
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

  function solicitarButton() {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={ async () => {
          if (distribuidoresCercanos.length <= 0) {
            Alert.alert('Sin repartidores', 'No existen deliverys disponibles en este momento. Intenta en unos minutos.', [ {
              text: 'Aceptar'
            }]);
            return;
          }
          
          const deliveryLocationByDistance = sortByDistance(distribuidoresCercanos);
          //console.log('deliveryLocationByDistance', deliveryLocationByDistance)
          const latitude = deliveryLocationByDistance[0].coordinate.latitude;
          const longitude = deliveryLocationByDistance[0].coordinate.longitude;
          const closestLocation = {latitude, longitude};
          console.log(deliveryLocationByDistance)
          await setDeliveryLocation(closestLocation);
          setpedidoStep(appState.SeleccionandoPago);
        }}
        style={styles.buttonStyle}>
        <Text style={{...Fonts.whiteColor18Bold}}>Solicitar</Text>
      </TouchableOpacity>
    );
  }

  function confirmPaymentMethodButton() {
    return (
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={ async () => {
            await createPedidoDelivery();
            setpedidoStep(appState.BuscandoDelivery);
          }}
          style={styles.buttonConfirmStyle}>
          <Text style={{...Fonts.whiteColor18Bold}}>Confirmar pago</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={ async () => {
            await cancelarPedidoDelivery()
          }}
          style={{
            ...styles.buttonCancelStyle
          }}>
          <Text style={{...Fonts.whiteColor18Bold}}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* PaymentSheet */

  function paymentSheet() {
    return (
      <BottomSheet
        isOpen={true}
        sliderMinHeight={150}
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
              {currentToDropLocDivider()}
              {currentLocationInfo()}
              {paymentMethodsInfo()}
            </Animatable.View>
          </ScrollView>
        )}
      </BottomSheet>
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
            { locationState.distance.toFixed(2) } Km - 
            { locationState.duration.toFixed(2) } min
        </Text>
      </View>
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
              console.log(item.id);
              setPaymentMethodIndex(item.id);
            }}
            key={`${item.id}`}
            style={styles.paymentMethodWrapStyle}>
            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
              <Image
                source={item.paymentIcon}
                style={{width: 40.0, height: 40.0, resizeMode: 'contain'}}
              />
              <Text
                numberOfLines={1}
                style={{
                  marginLeft: Sizes.fixPadding + 5.0,
                  flex: 1,
                  ...Fonts.blackColor16SemiBold,
                }}>
                {item.paymentMethod}
              </Text>
              
            </View>
            <View
              style={{
                ...styles.selectedMethodIndicatorStyle,
                backgroundColor:
                  locationState.paymentMethodIndex == item.id
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
  
  /* Searching for Drivers */
  function searchingDriverSheet() {
    return (
      <Animatable.View
        animation="slideInUp"
        iterationCount={1}
        duration={1500}
        style={{...styles.bottomSheetWrapStyleSearching}}>
        {indicatorSheet()}
        {searchingInfo()}
        {progressInfo()}
        {cancelDeliveryButton()}
      </Animatable.View>
    );
  }

  function indicatorSheet() {
    return <View style={{...styles.sheetIndicatorStyleSearching}} />;
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

  function cancelDeliveryButton() {
    return (
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={ async () => {
            await deletePedidoDelivery();
          }}
          style={{...styles.buttonStyleSearching}}>
          <Text numberOfLines={1} style={{...Fonts.whiteColor18Bold}}>
            Cancelar mi pedido
          </Text>
        </TouchableOpacity>
        
      </View>
    );
  }

  /* Delivery in progress */
  function driverInfoSheet() {
    return (
      <Animatable.View
        animation="slideInUp"
        iterationCount={1}
        duration={1500}
        style={{...styles.bottomSheetWrapStyleDriver}}>
        {driverInfo()}
       
        <TouchableOpacity
        activeOpacity={0.8}
        onPress={ async () => {
          await finalizarPedidoDelivery(locationState.pedidoActivoID);
        }}
        style={styles.buttonStyle}>
        <Text style={{...Fonts.whiteColor18Bold}}>Finalizar Pedido</Text>
      </TouchableOpacity>
      </Animatable.View>
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

  function driverDetail() {
    return (
      <View
        style={{
          marginTop: Sizes.fixPadding,
          marginBottom: Sizes.fixPadding * 3.0,
        }}>
        <Text style={{textAlign: 'center', ...Fonts.blackColor17SemiBold}}>
          { locationState.delivery?.name }
        </Text>
        <Text style={{textAlign: 'center', ...Fonts.blackColor17SemiBold}}>
          Forma de pago: { paymentmethods[locationState.paymentMethodIndex].paymentMethod }
        </Text>
        <View style={styles.rideInfoWrapStyle}>
          <View
            style={{
              maxWidth: screenWidth / 2.5,
              marginHorizontal: Sizes.fixPadding + 9.0,
              alignItems: 'center',
            }}>
            <Text numberOfLines={1} style={{...Fonts.grayColor14Regular}}>
              Contácto
            </Text>
            <Text numberOfLines={1} style={{...Fonts.blackColor15SemiBold}}>
              { locationState.delivery?.email }
            </Text>
            <Text numberOfLines={1} style={{...Fonts.blackColor15SemiBold}}>
              { locationState.delivery?.phone }
            </Text>
          </View>
          <View
            style={{
              maxWidth: screenWidth / 2.5,
              marginHorizontal: Sizes.fixPadding + 9.0,
              alignItems: 'center',
            }}>
            <Text numberOfLines={1} style={{...Fonts.grayColor14Regular}}>
              Tiempo Estimado
            </Text>
            <Text numberOfLines={1} style={{...Fonts.blackColor15SemiBold}}>
              { locationState.distance.toFixed(2) } Km 
            </Text>
            <Text numberOfLines={1} style={{...Fonts.blackColor15SemiBold}}>
              { locationState.duration.toFixed(2) } min
            </Text>
          </View>
          
        </View>
      </View>
    );
  }
  
  return (
    
    <View style={{flex: 1, backgroundColor: Colors.whiteColor}}>
      <MyStatusBar />
      <View style={{flex: 1}}>
        {displayMap()}
        {navBar()}
        {pedidoStep == appState.SinPedido && solicitarButton()}
        {pedidoStep == appState.SeleccionandoPago && paymentSheet()}
        {pedidoStep == appState.SeleccionandoPago && confirmPaymentMethodButton()}
        {pedidoStep == appState.BuscandoDelivery && searchingDriverSheet() }
        {pedidoStep == appState.DeliveryIniciado && driverInfoSheet() }
        
      </View>
      {exitInfo()}
      {loadingDialog()}
    </View>
  );

  

  function navBar() {
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

  function currentLocationIcon() {
    return (
      <View style={styles.currentLocationIconWrapStyle}>
        <MaterialIcons onPress={centerPosition} name="my-location" size={30} color="black" />
      </View>
    );
  }

  function displayMap() {
    return (
      <View style={{flex: 1}}>
        <MapView
          ref={ (element) => mapViewRef.current = element}
          zoomEnabled={true}
          minZoomLevel={13}
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
    paddingTop: Sizes.fixPadding + 5.0,
    borderTopLeftRadius: Sizes.fixPadding * 2.5,
    borderTopRightRadius: Sizes.fixPadding * 2.5,
    backgroundColor: Colors.whiteColor,
    paddingHorizontal: 0.0,
    elevation: 0.0,
    marginBottom: Sizes.fixPadding * 4.5,
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
  },
  buttonConfirmStyle: {
    flex: 1,
    marginTop: Sizes.fixPadding * 3.0,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Sizes.fixPadding + 2.0,
    borderColor: Colors.whiteColor,
  },
  buttonCancelStyle: {
    flex: 1,
    marginTop: Sizes.fixPadding * 3.0,
    backgroundColor: Colors.redColor,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Sizes.fixPadding + 2.0,
    borderColor: Colors.whiteColor,
  },
  dropLocationInfoWrapStyle: {
    marginHorizontal: Sizes.fixPadding * 2.0,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -(Sizes.fixPadding - 10.0),
  },
  currentToDropLocationInfoDividerStyle: {
    backgroundColor: Colors.shadowColor,
    height: 1.0,
    flex: 1,
    marginRight: Sizes.fixPadding * 2.5,
    marginLeft: Sizes.fixPadding,
  },
  currentLocationInfoWrapStyle: {
    marginTop: Sizes.fixPadding,
    marginHorizontal: Sizes.fixPadding * 2.0,
    flexDirection: 'row',
    alignItems: 'center',
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
  selectedMethodIndicatorStyle: {
    width: 20.0,
    height: 20.0,
    borderRadius: 10.0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Searching Delivery
  bottomSheetWrapStyleSearching: {
    borderTopLeftRadius: Sizes.fixPadding * 2.5,
    borderTopRightRadius: Sizes.fixPadding * 2.5,
    backgroundColor: Colors.whiteColor,
    paddingHorizontal: 0.0,
    position: 'absolute',
    bottom: 0.0,
    left: 0.0,
    right: 0.0,
  },
  bottomSheetWrapStyleDriver: {
    borderTopLeftRadius: Sizes.fixPadding * 2.5,
    borderTopRightRadius: Sizes.fixPadding * 2.5,
    backgroundColor: Colors.whiteColor,
    paddingHorizontal: 0.0,
    position: 'absolute',
    bottom: 0.0,
    left: 0.0,
    right: 0.0,
  },
  sheetIndicatorStyleSearching: {
    width: 50,
    height: 5.0,
    backgroundColor: Colors.primaryColor,
    borderRadius: Sizes.fixPadding,
    marginVertical: Sizes.fixPadding * 2.0,
    alignSelf: 'center',
  },
  buttonStyleSearching: {
    flex: 1,
    marginTop: Sizes.fixPadding * 3.0,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Sizes.fixPadding + 2.0,
    borderColor: Colors.whiteColor,
  },
  // OnRude Styles
  rideInfoWrapStyle: {
    marginTop: Sizes.fixPadding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
