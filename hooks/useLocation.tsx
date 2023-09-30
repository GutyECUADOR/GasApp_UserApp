import React, { useEffect, useState } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { Location } from "../interfaces/Location";

export const useLocation = () => {

    const [hasLocation, sethasLocation] = useState(false); 
    const [initialPosition, setInitialPosition] = useState<Location>({
        latitude: 0,
        longitude: 0
    })

    useEffect(() => {
        Geolocation.getCurrentPosition(
          info => {
            setInitialPosition({
                latitude: info.coords.latitude,
                longitude: info.coords.longitude
            })
            console.log('Posición inicial', initialPosition);
            sethasLocation(true);
          },
          error => { console.log(error)},{
            enableHighAccuracy: true
          }
          
          );
      }, [])

  return {
    hasLocation,
    initialPosition
  }
}
