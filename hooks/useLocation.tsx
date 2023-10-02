import React, { useEffect, useState } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { Location } from "../interfaces/Location";

export const useLocation = () => {

    const [hasLocation, sethasLocation] = useState(false); 
    const [initialPosition, setInitialPosition] = useState<Location>({
        latitude: 0,
        longitude: 0
    })

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

    useEffect(() => {
      getCurrentLocation().then( location => {
        setInitialPosition(location);
        sethasLocation(true);
        console.log(location);
      });
    }, [])

  return {
    hasLocation,
    initialPosition,
    getCurrentLocation
  }
}
