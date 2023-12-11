import React, { useEffect, useState } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { Location } from "../interfaces/Location";
import Geocoder from 'react-native-geocoding';
import {Key} from '../constants/key';

export const useLocation = () => {

    const [hasLocation, sethasLocation] = useState(false); 
    const [address, setAddress] = useState('Mi ubicación actual')
    const [initialPosition, setInitialPosition] = useState<Location>({
        latitude: 0,
        longitude: 0
    })
    const [location, setlocation] = useState<Location>({
      latitude: 0,
      longitude: 0
  })

    Geocoder.init(Key.apiKey); // TODO - use a valid API key from ConfigFILE

    const getCurrentLocation = (): Promise<Location> => {
      return new Promise( (resolve, reject) => {
        Geolocation.getCurrentPosition(
          info => {
            resolve({
                latitude: info.coords.latitude,
                longitude: info.coords.longitude
            });
          },
          error => { reject(error)},{
            enableHighAccuracy: true
          });
      });
    } 

    const getAddress = () => {
      Geocoder.from(location)
      .then(json => {
        const addressFormatted = json.results[0].formatted_address;
        setAddress(addressFormatted);
      })
      .catch(error => console.warn(error));
    }

    useEffect(() => {
      getCurrentLocation().then( location => {
        setInitialPosition(location);
        setlocation(location);
        sethasLocation(true);
      });
    }, [])

    useEffect(() => {
      getAddress()
  }, [location])
  

  

  return {
    hasLocation,
    initialPosition,
    getCurrentLocation,
    address,
    getAddress,
    location,
    setlocation
  }
}
