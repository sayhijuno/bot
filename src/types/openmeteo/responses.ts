import type { OpenMeteoForecastCurrent, OpenMeteoForecastCurrentUnits, OpenMeteoForecastDaily, OpenMeteoForecastDailyUnits, OpenMeteoForecastHourly, OpenMeteoForecastHourlyUnits } from "../openmeteo"

export interface OpenMeteoGeocodingResponse {
    results: {
        id: string
        name: string
        latitude: number
        longitude: number
        elevation: number
        timezone: string
        feature_code: string
        country_code: string
        country: string
        country_id: string
        population: number
        postcodes: string[]
        admin1: string
        admin2: string
        admin3: string
        admin4: string
        admin1_id: number
        admin2_id: number
        admin3_id: number
        admin4_id: number
    }[]
}

export interface OpenMeteoForecastResponse {
    latitude: number
    longitude: number
    generationtime_ms: number
    utc_offset_seconds: number
    timezone: string
    timezone_abbreviation: string
    elevation: number
    current_units: OpenMeteoForecastCurrentUnits
    current: OpenMeteoForecastCurrent
    hourly_units: OpenMeteoForecastHourlyUnits
    hourly: OpenMeteoForecastHourly
    daily_units: OpenMeteoForecastDailyUnits
    daily: OpenMeteoForecastDaily
}