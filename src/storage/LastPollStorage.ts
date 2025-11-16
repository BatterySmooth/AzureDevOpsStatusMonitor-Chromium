import { Config } from "../util/Config";

export class LastPollStorage {

  static async save(lastPoll: Date): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [Config.LastPollStorageKey]: lastPoll.getTime() }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  static async load(): Promise<Date | null> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(Config.LastPollStorageKey, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        const raw = result[Config.LastPollStorageKey];
        if (!raw) {
          resolve(null);
          return;
        }
        const status: Date = new Date(raw);
        resolve(status);
      });
    });
  }

  static async clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(Config.LastPollStorageKey, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
  
}