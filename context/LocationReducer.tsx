import { Location } from "../interfaces/Location";

export interface LocationState {
    hasLocation: boolean;
    address: string;
    location: Location;
}

type AuthAction = | 
    { type: 'getLocation', payload: null}
    | { type: 'addError', payload: string }

export const LocationReducer = ( state: LocationState, action: AuthAction) : LocationState => {
    switch (action.type) {
        case 'getLocation':
            return {
                ...state,
              
            }
            break;

      
        default:
            return state;
            break;
    } 
}