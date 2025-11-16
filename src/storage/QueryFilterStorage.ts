import { Config } from "../util/Config";
import { Geography, HealthQueryOptions, Service } from "../util/Models";

export class QueryFilterStorage {

  static async save(queryOptions: HealthQueryOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [Config.QueryOptionsStorageKey]: queryOptions }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  static async load(): Promise<HealthQueryOptions> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(Config.QueryOptionsStorageKey, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        const options: HealthQueryOptions = result[Config.QueryOptionsStorageKey]
          ?? {
            services: Object.values(Service),
            geographies: Object.values(Geography),
          };
        resolve(options);
      });
    });
  }

  static async clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(Config.QueryOptionsStorageKey, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

}