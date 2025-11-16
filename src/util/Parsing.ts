import { Geography, ScopeHealth, Service, ServiceStatus } from "./Models";

export class Parsers {

  public static parseServiceStatus(json: any): ServiceStatus {
    return {
      lastUpdated: Parsers.parseDate(json.lastUpdated),
      status: {
        health: Parsers.parseScopeHealth(json.status.health),
        message: json.status.message
      },
      services: json.services.map((service: any) => ({
        id: Parsers.parseService(service.id),
        geographies: service.geographies.map((geo: any) => ({
          id: Parsers.parseGeography(geo.id),
          name: geo.name,
          health: Parsers.parseScopeHealth(geo.health)
        }))
      }))
    };
  }

  public static parseScopeHealth(value: string): ScopeHealth {
    if (Object.values(ScopeHealth).includes(value as ScopeHealth)) {
      return value as ScopeHealth;
    }
    return ScopeHealth.Unknown;
  }

  public static parseService(value: string): Service {
    if (Object.values(Service).includes(value as Service)) {
      return value as Service;
    }
    throw new Error(`Invalid Service: ${value}`);
  }

  public static parseGeography(value: string): Geography {
    if (Object.values(Geography).includes(value as Geography)) {
      return value as Geography;
    }
    throw new Error(`Invalid Geography: ${value}`);
  }

  public static parseDate(value: string): Date {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${value}`);
    }
    return date;
  }
  
}