import { Config } from "../util/Config";
import { ServiceStatus } from "../util/Models";
import { Parsers } from "../util/Parsing";

export class ServiceStatusStorage {

  static async save(status: ServiceStatus): Promise<void> {
    const serializableStatus = {
      ...status,
      lastUpdated: status.lastUpdated.toISOString()
    };

    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [Config.LastStatusStorageKey]: serializableStatus }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  static async load(): Promise<ServiceStatus | null> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(Config.LastStatusStorageKey, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        const raw = result[Config.LastStatusStorageKey];
        if (!raw) {
          resolve(null);
          return;
        }
        const status: ServiceStatus = Parsers.parseServiceStatus(raw);
        resolve(status);
      });
    });
  }

  static async clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(Config.LastStatusStorageKey, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
  
}
