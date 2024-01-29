export interface Location {
    latitude: number,
    longitude: number
}

export interface Delivery {
    id: number,
    coordinate: Location,
    name: string,
    email: string,
    phone: string
}