/**
 * Type declarations for openmeteo
 */
declare module 'openmeteo' {
  export interface WeatherApiResponse {
    current(): CurrentWeatherApi | null;
    hourly(): HourlyWeatherApi | null;
    daily(): DailyWeatherApi | null;
    utcOffsetSeconds(): number;
    timezone(): string;
    timezoneAbbreviation(): string;
  }

  export interface WeatherVariable {
    value(): number;
    valuesArray(): number[] | null;
  }

  export interface CurrentWeatherApi {
    time(): number;
    variables(index: number): WeatherVariable | null;
  }

  export interface HourlyWeatherApi {
    time(): number[];
    timeEnd(): number;
    interval(): number;
    variables(index: number): WeatherVariable | null;
  }

  export interface DailyWeatherApi {
    time(): number[];
    timeEnd(): number;
    interval(): number;
    variables(index: number): WeatherVariable | null;
  }

  export function fetchWeatherApi(
    url: string,
    params: Record<string, any>
  ): Promise<WeatherApiResponse[]>;
} 