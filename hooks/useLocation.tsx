import React, { useEffect, useState } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { Location } from "../interfaces/Location";
import Geocoder from 'react-native-geocoding';
import {Key} from '../constants/key';
import Config from "react-native-config";


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
      // Search by geo-location (reverse geo-code)
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
        console.log(location);
        getAddress();
        
      });
    }, [])

  

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
