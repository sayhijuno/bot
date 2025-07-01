export type OpenMeteoTimeUnit = "iso8601" | "unixtime"
export type OpenMeteoTimeArray = string[] | number[]
export type OpenMeteoTemperatureUnit = "°C" | "°F"
export type OpenMeteoWindSpeedUnit = "km/h" | "m/s" | "mph" | "kn"
export type OpenMeteoPrecipitationUnit = "mm" | "inch"

export interface OpenMeteoForecastCurrentUnits {
    time: OpenMeteoTimeUnit
    interval: "seconds" // is this always seconds lol
    weather_code: "wmo_code"
    wind_speed_10m: OpenMeteoWindSpeedUnit
    wind_direction_10m: "°"
    apparent_temperature: OpenMeteoTemperatureUnit
    precipitation: OpenMeteoPrecipitationUnit
    temperature_2m: "°C" | "°F"
    relative_humidity_2m: "%"
}

export interface OpenMeteoForecastCurrent {
    time: string
    interval: number
    weather_code: number
    wind_speed_10m: number
    wind_direction_10m: number
    apparent_temperature: number
    precipitation: number
    temperature_2m: number
    relative_humidity_2m: number
}

export interface OpenMeteoForecastHourlyUnits {
    time: OpenMeteoTimeUnit
    temperature_2m: OpenMeteoTemperatureUnit
    precipitation_probability: "%"
    weather_code: "wmo_code"
}

export interface OpenMeteoForecastHourly {
    time: OpenMeteoTimeArray // timestamps
    temperature_2m?: number[]
    precipitation_probability?: number[]
    weather_code?: number[]
}

export interface OpenMeteoForecastDailyUnits {
    time: OpenMeteoTimeUnit
    weather_code: "wmo_code"
    sunrise: OpenMeteoTimeUnit
    sunset: OpenMeteoTimeUnit
}

export interface OpenMeteoForecastDaily {
    time: OpenMeteoTimeArray // timestamps
    weather_code: number[]
    sunrise: OpenMeteoTimeArray
    sunset: OpenMeteoTimeArray
}

export function convertWMOCode(code: number) {
    switch (code) {
        case 0:
            return "Clear sky"
        case 1:
            return "Mainly clear"
        case 2:
            return "Partly cloudy"
        case 3:
            return "Overcast"
        case 45:
            return "Fog"
        case 48:
            return "Depositing rime fog"
        case 51:
            return "Light drizzle"
        case 53:
            return "Moderate drizzle"
        case 55:
            return "Dense drizzle"
        case 56:
            return "Light freezing drizzle"
        case 57:
            return "Dense freezing drizzle"
        case 61:
            return "Light rain"
        case 63:
            return "Moderate rain"
        case 65:
            return "Heavy rain"
        case 66:
            return "Light freezing rain"
        case 67:
            return "Heavy freezing rain"
        case 71:
            return "Light snow"
        case 73:
            return "Moderate snow"
        case 75:
            return "Heavy snow"
        case 77:
            return "Snow grains"
        case 80:
            return "Light rain showers"
        case 81:
            return "Moderate rain showers"
        case 82:
            return "Heavy rain showers"
        case 85:
            return "Light snow showers"
        case 86:
            return "Heavy snow showers"
        case 95:
            return "Thunderstorm"
        case 96:
            return "Thunderstorm with light hail"
        case 99:
            return "Thunderstorm with heavy hail"
        default:
            return `Weather code ${code}`
    }
}