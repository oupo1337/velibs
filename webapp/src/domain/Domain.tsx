import type { Feature, FeatureCollection, Geometry, Polygon} from 'geojson';

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

export interface DistrictProperties {
  name: string
  label: string
  ids: number[]
  mechanical: number
  electric: number
}

export interface BikeLanesProperties {
  osmid: number
  name: string
  amenagement: string
  cote_amenagement: string
  sens: string
  surface: string
  arrondissement: string
  bois: boolean
  coronapiste: boolean
  amenagement_temporaire: boolean
  infrastructure_bidirection: boolean
  voie_a_sens_unique: boolean
  position_amenagement: string
  vitesse_maximale_autorisee: string
}

export type BikeLanesFeature = Feature<Geometry, BikeLanesProperties>;
export type BikeLanesGeoJSON = BikeLanesFeature[];

export type StationFeature = Feature<Geometry, StationProperties>;
export type StationGeoJSON = StationFeature[];

export type DistrictFeature = Feature<Polygon, DistrictProperties>;
export type DistrictFeatureCollection = FeatureCollection<Polygon, DistrictProperties>