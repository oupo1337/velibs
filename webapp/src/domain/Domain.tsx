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
    hour: number
    minute: number
    mechanical: number
    electric: number
}