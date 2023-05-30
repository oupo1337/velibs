export interface TimeSeries {
    date: Date
    mechanical: number
    electric: number
}

export interface GraphData {
    time_series: TimeSeries[]
    capacity: number
}

export interface Station {
    name: string
    id: number
}