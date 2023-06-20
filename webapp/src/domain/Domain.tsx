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