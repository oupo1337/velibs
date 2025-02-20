import type {Feature, Geometry} from 'geojson';

export interface Timeseries {
  date: Date
  mechanical: number
  electric: number
}

export interface StationInformation {
  station_id: number
  name: string
  capacity: number
}

export interface Distribution {
  time: string
  mechanical: number
  electric: number
}

export interface StationProperties {
  name: string
  station_id: number
  capacity: number
  bikes: number
  mechanical: number
  electric: number
}

export type StationFeature = Feature<Geometry, StationProperties>;
export type StationGeoJSON = StationFeature[];