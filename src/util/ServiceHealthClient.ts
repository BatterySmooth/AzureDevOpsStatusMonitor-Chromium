import { LastPollStorage } from "../storage/LastPollStorage";
import { ServiceStatusStorage } from "../storage/ServiceStatusStorage";
import { Config } from "./Config";
import { HealthQueryOptions, ScopeHealth, ServiceStatus } from "./Models";
import { Parsers } from "./Parsing";

export class ServiceHealthClient {

  static async getStatus(options?: HealthQueryOptions): Promise<ServiceStatus> {
    const url = `${Config.DevOpsEndpoint}${this.buildHealthQuery(options)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const data: ServiceStatus = Parsers.parseServiceStatus(await response.json());
    await ServiceStatusStorage.save(data);
    await LastPollStorage.save(new Date());
    // update icon & title
    chrome.action.setIcon({ path: ServiceHealthClient.getHealthIconPath(data.status.health) });
    chrome.action.setTitle({ title: ServiceHealthClient.getHealthDisplayText(data.status.health) });
    return data;
  }

  private static buildHealthQuery(options?: HealthQueryOptions): string {
    const params: Record<string, string> = {};
    params['api-version'] = Config.DevOpsApiVersion;
    if (options?.services && options.services.length > 0) {
      params['services'] = options.services.join(',');
    }
    if (options?.geographies && options.geographies.length > 0) {
      params['geographies'] = options.geographies.join(',');
    }
    const queryString = new URLSearchParams(params).toString();
    return `?${queryString}`;
  }

  static getHealthIconPath(status?: ScopeHealth, iconSize: number = 16): string {
    switch (status) {
      case ScopeHealth.Unknown:   return `../icons/DevOps_${iconSize}.png`;
      case ScopeHealth.Unhealthy: return `../icons/DevOps_Unhealthy_${iconSize}.png`;
      case ScopeHealth.Degraded:  return `../icons/DevOps_Degraded_${iconSize}.png`;
      case ScopeHealth.Advisory:  return `../icons/DevOps_Advisory_${iconSize}.png`;
      case ScopeHealth.Healthy:   return `../icons/DevOps_Healthy_${iconSize}.png`;
      default:                    return `../icons/DevOps_Waiting_${iconSize}.png`;
    }
  }
  static getHealthDisplayText(status?: ScopeHealth): string {
    switch (status) {
      case ScopeHealth.Unknown:   return 'Unknown';
      case ScopeHealth.Unhealthy: return 'Unhealthy';
      case ScopeHealth.Degraded:  return 'Degraded';
      case ScopeHealth.Advisory:  return 'Advisory';
      case ScopeHealth.Healthy:   return 'Healthy';
      default:                    return 'Waiting...';
    }
  }
  
}