import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  BackHandler,
  Platform,
  TextInput
} from 'react-native';
import React, {useState, useCallback} from 'react';
import {Colors, Fonts, Sizes, screenHeight} from '../../constants/styles';
import IntlPhoneInput from 'react-native-intl-phone-input';
import {useFocusEffect} from '@react-navigation/native';
import MyStatusBar from '../../components/myStatusBar';

const LoginScreen = ({navigation}) => {
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

  const [backClickCount, setBackClickCount] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');

  return (
    <View style={{flex: 1, backgroundColor: Colors.whiteColor}}>
      <MyStatusBar />
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
        <ScrollView
          automaticallyAdjustKeyboardInsets={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{justifyContent: 'flex-end', flexGrow: 1}}>
          {loginImage()}
          {welcomeInfo()}
          {mobileNumberInfo()}
        </ScrollView>
        {continueButton()}
        {registerButton()}
      </View>
      {exitInfo()}
    </View>
  );

  function continueButton() {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          navigation.push('Home');
        }}
        style={styles.buttonStyle}>
        <Text style={{...Fonts.whiteColor18Bold}}>Iniciar Sesión</Text>
      </TouchableOpacity>
    );
  }

  function registerButton() {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          navigation.push('Register');
        }}
        style={styles.buttonRegisterStyle}>
        <Text style={{...Fonts.blackColor18Bold}}>Aun No tienes cuenta? Clic Aqui</Text>
      </TouchableOpacity>
    );
  }

  function exitInfo() {
    return backClickCount == 1 ? (
      <View style={styles.exitInfoWrapStyle}>
        <Text style={{...Fonts.whiteColor15SemiBold}}>
          Presiona 2 veces para salir
        </Text>
      </View>
    ) : null;
  }

  function mobileNumberInfo() {
    return (
      <View
        style={{
          marginHorizontal: Sizes.fixPadding * 2.0,
          marginBottom: Sizes.fixPadding,
        }}>
          <Text>
            Correo:
          </Text>
          <TextInput
            style={styles.input}
            placeholder='micorreo@gmail.com'
          />
          <Text>
            Clave:
          </Text>
          <TextInput
            secureTextEntry={true}
            style={styles.input}
            placeholder='**********'
          />
        {/* <IntlPhoneInput
          onChangeText={({phoneNumber}) => setPhoneNumber(phoneNumber)}
          defaultCountry="EC"
          containerStyle={{backgroundColor: Colors.whiteColor}}
          placeholder={'Enter Your Number'}
          phoneInputStyle={styles.phoneInputStyle}
          dialCodeTextStyle={{
            ...Fonts.blackColor15Bold,
            marginHorizontal: Sizes.fixPadding - 2.0,
          }}
          modalCountryItemCountryNameStyle={{...Fonts.blackColor16Bold}}
          flagStyle={{width:40.0,height:40.0,marginBottom:10.0,}}
        />         */}
      </View>
    );
  }

  function welcomeInfo() {
    return (
      <View
        style={{
          marginHorizontal: Sizes.fixPadding * 2.0,
          marginTop: Sizes.fixPadding * 4.0,
          marginBottom: Sizes.fixPadding * 2.0,
        }}>
        <Text style={{...Fonts.blackColor20Bold}}>Bienvenido a MiGas App</Text>
        <Text
          style={{marginTop: Sizes.fixPadding, ...Fonts.grayColor14SemiBold}}>
          Ingresa tu correo y clave para comenzar
        </Text>
        
      </View>
    );
  }

  function loginImage() {
    return (
      <Image
        source={require('../../assets/images/app_icon.png')}
        style={{
          width: 'auto',
          height: screenHeight / 3.0,
          resizeMode: 'contain',
        }}
      />
    );
  }
};

export default LoginScreen;

const styles = StyleSheet.create({
  phoneInputStyle: {
    flex: 1,
    ...Fonts.blackColor15Bold,
    borderBottomColor: Colors.shadowColor,
    borderBottomWidth: 1.0,
    padding:0
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
  buttonStyle: {
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Sizes.fixPadding - 5.0,
    paddingVertical: Sizes.fixPadding + 3.0,
    marginHorizontal: Sizes.fixPadding * 6.0,
    marginVertical: Sizes.fixPadding * 0.25,
  },
  buttonRegisterStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
});
