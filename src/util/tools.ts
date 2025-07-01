import { convertWMOCode } from "@/types/openmeteo"
import type { OpenMeteoForecastResponse, OpenMeteoGeocodingResponse } from "@/types/openmeteo/responses"
import * as chrono from "chrono-node"
import convert from "convert"
import type { ChatCompletionTool } from "openai/resources/index"

export const tools: ChatCompletionTool[] = [
    {
        type: "function",
        function: {
            name: "get_current_date",
            description: "Get the current date and time as an ISO 8601 string",
            parameters: {
                type: "object",
                properties: {
                    timezone: {
                        type: "string",
                        description: "The timezone to use for the date and time (e.g. 'America/New_York')"
                    }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "parse_date",
            description: "Parse a natural language date or time expression and return information about it",
            parameters: {
                type: "object",
                properties: {
                    date_string: {
                        type: "string",
                        description: "Natural language date expression (e.g., 'next Tuesday', 'tomorrow at 3pm', '2 weeks from now')"
                    }
                },
                required: ["date_string"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "convert_units",
            description: "Convert a value from one unit to another (e.g., length, mass, volume, temperature).",
            parameters: {
                type: "object",
                properties: {
                    value: {
                        type: "number",
                        description: "The numerical value to convert."
                    },
                    fromUnit: {
                        type: "string",
                        description: 'The unit to convert from (e.g., "m", "kg", "L", "C", "mi", "lb", "gal", "F"). Abbreviation preferred.'
                    },
                    toUnit: {
                        type: "string",
                        description: 'The unit to convert to (e.g., "ft", "g", "ml", "K", "km", "oz", "qt", "R"). Abbreviation preferred.'
                    }
                },
                required: ["value", "fromUnit", "toUnit"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_location",
            description: "Get more information about a location, including latitude and longitude, timezone, and elevation",
            parameters: {
                type: "object",
                properties: {
                    location: {
                        type: "string",
                        description: "String to search for. The string can be a location name or a postal code."
                    }
                },
                required: ["location"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_weather",
            description: "Get the weather for a given location",
            parameters: {
                type: "object",
                properties: {
                    latitude: {
                        type: "number",
                        description: "Latitude of the location"
                    },
                    longitude: {
                        type: "number",
                        description: "Longitude of the location"
                    }
                },
                required: ["latitude", "longitude"]
            }
        }
    }
]

export function getCurrentDate(timezone = "UTC") {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
    })

    return formatter.format(new Date())
}

export function parseDate(dateString: string) {
    const results = chrono.parse(dateString)
    if (results.length > 0) {
        const parsedDate = results[0].start.date()
        const timestamp = Math.floor(parsedDate.getTime() / 1000)
        return `<t:${timestamp}:F> (<t:${timestamp}:R>)`
    }
    return "Could not parse that date expression."
}

export function convertUnits(value: number, fromUnit: string, toUnit: string) {
    try {
        const conversionResult = convert(value, fromUnit as any).to(toUnit as any)
        const result = Number(conversionResult)

        const formattedResult = Number.isInteger(result) ? result.toString() : result.toFixed(2)

        return `${value}${fromUnit} = ${formattedResult}${toUnit}`
    } catch (error) {
        console.error("Unit conversion error:", error)
        return `Could not convert ${value}${fromUnit} to ${toUnit}`
    }
}

export async function getLocation(location: string) {
    const params = new URLSearchParams()
    params.set("name", location)
    params.set("count", "1")
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`)
    const data = await response.json() as any
    
    if ('generationtime_ms' in data && !('results' in data)) {
        return "Could not find that location, it can help if you're not too specific. A city name or postal code is best."
    }
    
    return (data as OpenMeteoGeocodingResponse).results[0]
}

export async function getWeather(latitude: number, longitude: number, american = false) {
    // https://api.open-meteo.com/v1/forecast

    const params = new URLSearchParams()
    params.set("latitude", latitude.toString())
    params.set("longitude", longitude.toString())
    params.set("daily", "weather_code,sunrise,sunset")
    params.set("hourly", "temperature_2m,precipitation_probability,weather_code")
    params.set("current", "weather_code,wind_speed_10m,wind_direction_10m,apparent_temperature,precipitation,temperature_2m,relative_humidity_2m")
    params.set("timezone", "auto")
    params.set("forecast_days", "1")
    params.set("temperature_unit", american ? "fahrenheit" : "celsius")

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`)
    const data = (await response.json()) as OpenMeteoForecastResponse

    const formatted = {
        current: {
            temperature: data.current.temperature_2m.toString() + data.current_units.temperature_2m,
            wind_speed: data.current.wind_speed_10m.toString() + data.current_units.wind_speed_10m,
            wind_direction: data.current.wind_direction_10m.toString() + data.current_units.wind_direction_10m,
            apparent_temperature: data.current.apparent_temperature.toString() + data.current_units.apparent_temperature,
            precipitation: data.current.precipitation.toString() + data.current_units.precipitation,
            relative_humidity: data.current.relative_humidity_2m.toString() + data.current_units.relative_humidity_2m
        },
        hourly: {
            temperature: data.hourly.temperature_2m?.map((temp, index) => `${temp} ${data.hourly_units.temperature_2m} at ${formatWeatherTime(data.hourly.time[index] as string)}`),
            precipitation_probability: data.hourly.precipitation_probability?.map((prob, index) => `${prob} ${data.hourly_units.precipitation_probability} at ${formatWeatherTime(data.hourly.time[index] as string)}`),
            weather_code: data.hourly.weather_code?.map((code, index) => `${convertWMOCode(code)} at ${formatWeatherTime(data.hourly.time[index] as string)}`)
        },
        daily: {
            sunrise: formatWeatherTime(data.daily.sunrise[0] as string),
            sunset: formatWeatherTime(data.daily.sunset[0] as string),
            weather_code: convertWMOCode(data.daily.weather_code[0])
        }
    }

    return formatted
}

export const TOOL_REGISTRY = {
    get_current_date: (args: { timezone: string }) => getCurrentDate(args.timezone),
    parse_date: (args: { date_string: string }) => parseDate(args.date_string),
    convert_units: (args: { value: number; fromUnit: string; toUnit: string }) => 
        convertUnits(args.value, args.fromUnit, args.toUnit),
    get_location: async (args: { location: string }) => {
        return JSON.stringify(await getLocation(args.location))
    },
    get_weather: async (args: { latitude: number; longitude: number }) => {
        return JSON.stringify(await getWeather(args.latitude, args.longitude))
    }
} as const

export type ToolName = keyof typeof TOOL_REGISTRY

function formatWeatherTime(time: string) {
    return time.toString().split("T")[1]
}