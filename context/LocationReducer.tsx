import { Location } from "../interfaces/Location";

export interface LocationState {
    hasLocation: boolean;
    address: string;
    location: Location;
    deliveryLocation: Location;
}

type LocationAction = | 
    { type: 'setLocation', payload: { location: Location }}
    | { type: 'setAddress', payload: string }
    | { type: 'sethasLocation', payload: boolean }

/* El reducer hace las vaces de useState complejo */

export const LocationReducer = ( state: LocationState, action: LocationAction) : LocationState => {
    switch (action.type) {
        case 'setLocation':
            return {
                ...state,
                location: action.payload.location
            }
            break;

        case 'setAddress':
            return {
                ...state,
                address: action.payload
            }
            break;
        
        case 'sethasLocation':
            return {
                ...state,
                hasLocation: action.payload
            }
            break;

      
        default:
            return state;
            break;
    } 
}