import React, { createContext, useReducer, useEffect} from 'react';
import { Location } from '../interfaces/Location';
import { LocationReducer, LocationState } from './LocationReducer';
import Geolocation from '@react-native-community/geolocation';

type LocationContextProps = {
    hasLocation: boolean;
    address: string;
    location: Location;
    
    getCurrentLocation: () => Promise<Location>;
    getAddress: () => void;
}

const LocationInitialState: LocationState = {
    hasLocation: false,
    address: 'Ubicación Actual',
    location: {latitude: 0, longitude: 0}
}

export const LocationContext = createContext({} as LocationContextProps);

export const AuthProvider = ({ children }:any) => {

    const [state, dispatch] = useReducer(LocationReducer, LocationInitialState)

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
        Geocoder.from(state.location)
        .then(json => {
          const addressFormatted = json.results[0].formatted_address;
          //setAddress(addressFormatted);
        })
        .catch(error => console.warn(error));
      }

    return (
        <LocationContext.Provider value={{
            ...state,
            getCurrentLocation,
            getAddress
        }}>
            { children }
        </LocationContext.Provider>
    )
}