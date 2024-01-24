export interface TimeSeries {
    date: Date
    mechanical: number
    electric: number
}

export interface Station {
    id: number
    name: string
    capacity: number
    time_series: TimeSeries[]
}

export interface Distribution {
    time: string
    mechanical: number
    electric: number
}

export interface GeoJSON {
    type: string
    features: Feature[]
  }
  
  export interface Feature {
    type: string
    geometry: Geometry
    properties: Properties
  }
  
  export interface Geometry {
    coordinates: number[][]
    type: string
  }
  
  export interface Properties {
    name: string
    station_id: number
    capacity: number
    bikes: number
    mechanical: number
    electric: number
    hexagon: string
  }