import { Location, Delivery } from "../interfaces/Location";

export interface LocationState {
    hasLocation: boolean;
    address: string;
    location: Location;
    deliveryLocation: Location | null;
    delivery: Delivery | null;
    statusDelivery: string;
    hasPedidoActivo: boolean;
    pedidoActivoID: string | null;
    duration: number;
    distance: number;
    amount: number;
    paymentMethodIndex: number;
}



type LocationAction = | 
    { type: 'setLocation', payload: { location: Location }}
    | { type: 'setAddress', payload: string }
    | { type: 'setDeliverylocation', payload: { location: Location | null } }
    | { type: 'setDelivery', payload: { delivery: Delivery | null } }
    | { type: 'setStatusDelivery', payload: string }
    | { type: 'sethasLocation', payload: boolean }
    | { type: 'setHasPedidoActivo', payload: boolean }
    | { type: 'setPedidoActivoID', payload: string | null }
    | { type: 'setAmount', payload: number }
    | { type: 'setDistance', payload: number }
    | { type: 'setDuration', payload: number }
    | { type: 'setPaymentMethodIndex', payload: number }

/* El reducer hace las vaces de useState complejo */

export const LocationReducer = ( state: LocationState, action: LocationAction) : LocationState => {
    switch (action.type) {
        case 'setLocation':
            return {
                ...state,
                location: action.payload.location
            }
            break;

        case 'setDeliverylocation':
            return {
                ...state,
                deliveryLocation: action.payload.location
            }
            break;

        case 'setDelivery':
            return {
                ...state,
                delivery: action.payload.delivery
            }
            break;

        case 'setAddress':
            return {
                ...state,
                address: action.payload
            }
            break;
        
        case 'setStatusDelivery':
            return {
                ...state,
                statusDelivery: action.payload
            }
            break;

        case 'sethasLocation':
            return {
                ...state,
                hasLocation: action.payload
            }
            break;

        case 'setHasPedidoActivo':
            return {
                ...state,
                hasPedidoActivo: action.payload
            }
            break;

        case 'setPedidoActivoID':
            return {
                ...state,
                pedidoActivoID: action.payload
            }
            break;

        case 'setAmount':
            return {
                ...state,
                amount: action.payload
            }
            break;

        case 'setDistance':
            return {
                ...state,
                distance: action.payload
            }
            break;

        case 'setDuration':
            return {
                ...state,
                duration: action.payload
            }
            break;

        case 'setPaymentMethodIndex':
            return {
                ...state,
                paymentMethodIndex: action.payload
            }
            break;

      
        default:
            return state;
            break;
    } 
}