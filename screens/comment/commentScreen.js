import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ImageBackground,
} from 'react-native';
import React, {useContext, useState} from 'react';
import {Colors, Fonts, Sizes, screenWidth} from '../../constants/styles';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MyStatusBar from '../../components/myStatusBar';
import { AuthContext } from '../../context/AuthContext';

const CommentScreen = ({navigation}) => {

  const { user, sendComentario } = useContext(AuthContext)
  const [comentario, setComentario] = useState('');

  return (
    <View style={{flex: 1, backgroundColor: Colors.whiteColor}}>
      <MyStatusBar />
      <View style={{flex: 1}}>
      {backArrow()}
        <ScrollView
          automaticallyAdjustKeyboardInsets={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: Sizes.fixPadding * 2.0}}>
          {driverInfo()}
          {comentarioInfo()}
          {submitButton()}
        </ScrollView>
      </View>
      {backToHomeText()}
    </View>
  );

  function backToHomeText() {
    return (
      <Text
        onPress={() => {
          navigation.push('Home');
        }}
        style={styles.backToHomeTextStyle}>
        Regresar al inicio
      </Text>
    );
  }

  function submitButton() {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          if (comentario.length > 0) {
            sendComentario({'id_usuario':user.id, comentario});
          }
          navigation.push('Home');
        }}
        style={styles.buttonStyle}>
        <Text style={{...Fonts.whiteColor18Bold}}>Enviar comentarios</Text>
      </TouchableOpacity>
    );
  }

  function comentarioInfo() {
    return (
      <TextInput
        value={comentario}
        onChangeText={value => setComentario(value)}
        style={styles.textFieldStyle}
        placeholder="Dejanos un comentario"
        placeholderTextColor={Colors.grayColor}
        cursorColor={Colors.primaryColor}
        selectionColor={Colors.primaryColor}
      />
    );
  }

  function driverInfo() {
    return (
      <View
        style={{
          alignItems: 'center',
          marginHorizontal: Sizes.fixPadding * 2.0,
          marginBottom: Sizes.fixPadding * 2.0
        }}>
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <ImageBackground
            source={require('../../assets/images/app_icon.png')}
            style={styles.driverImageStyle}>
          </ImageBackground>
        </View>
        <Text
          style={{
            marginTop: Sizes.fixPadding,
            textAlign: 'center',
            ...Fonts.blackColor17SemiBold,
          }}>
          Gracias por usar la app
        </Text>
        <Text
          style={{
            marginTop: Sizes.fixPadding,
            textAlign: 'center',
            ...Fonts.blackColor17SemiBold,
          }}>
          Dejanos un comentario sobre tu experiencia con el delivery, esto nos ayuda a mejorar.
        </Text>
      </View>
    );
  }

  function backArrow() {
    return (
      <FontAwesome6
        name="arrow-left"
        size={20}
        color={Colors.blackColor}
        onPress={() => {
          navigation.push('Home');
        }}
        style={{
          marginHorizontal: Sizes.fixPadding + 5.0,
          marginVertical: Sizes.fixPadding * 2.0,
          alignSelf: 'flex-start',
        }}
      />
    );
  }
};

export default CommentScreen;

const styles = StyleSheet.create({
  backToHomeTextStyle: {
    margin: Sizes.fixPadding + 5.0,
    textAlign: 'center',
    alignSelf: 'center',
    ...Fonts.primaryColor18Bold,
  },
  ratingInfoWrapStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: Sizes.fixPadding - 8.0,
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
  textFieldStyle: {
    ...Fonts.blackColor14Regular,
    borderRadius: Sizes.fixPadding - 5.0,
    paddingHorizontal: Sizes.fixPadding * 2.0,
    paddingVertical: Sizes.fixPadding + 3.0,
    borderColor: Colors.shadowColor,
    borderWidth: 1.0,
    marginHorizontal: Sizes.fixPadding * 2.0,
  },
  buttonStyle: {
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Sizes.fixPadding - 5.0,
    paddingVertical: Sizes.fixPadding + 3.0,
    marginHorizontal: Sizes.fixPadding * 6.0,
    marginTop: Sizes.fixPadding * 3.0,
    marginBottom: Sizes.fixPadding * 2.0,
  },
});
