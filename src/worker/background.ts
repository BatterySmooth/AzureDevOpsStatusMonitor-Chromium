import { Config } from "../util/Config";
import { LastPollStorage } from "../storage/LastPollStorage";
import { ScopeHealth, ServiceStatus } from "../util/Models";
import { ServiceHealthClient } from "../util/ServiceHealthClient";
import { ServiceStatusStorage } from "../storage/ServiceStatusStorage";
import { QueryFilterStorage } from "../storage/QueryFilterStorage";

async function checkServiceHealth() {
  try {
    // get status
    chrome.action.setIcon({ path: ServiceHealthClient.getHealthIconPath() }); // Set "waiting" icon
    
    const savedOptions = await QueryFilterStorage.load();
    const oldStatus = await ServiceStatusStorage.load();
    const newStatus: ServiceStatus = await ServiceHealthClient.getStatus(savedOptions);
    
    // Notification
    if (oldStatus && oldStatus.status.health != newStatus?.status.health) {
      notifyUser(newStatus.status.health);
    }
  } catch (error) {
    console.error("Error checking service health:", error);
  }
}

function notifyUser(scopeHealth: ScopeHealth) {
  chrome.notifications.create("AzureDevOpsHealthNotification", {
    type: "basic",
    iconUrl: ServiceHealthClient.getHealthIconPath(scopeHealth, 128),
    title: "Service Status Changed",
    message: `New status: ${scopeHealth}`,
    // priority: 2
  });
}

chrome.runtime.onInstalled.addListener(async () => {
  chrome.alarms.create(Config.AlarmName, { periodInMinutes: Config.DevOpsPollFrequency });
  checkServiceHealth();
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === Config.AlarmName) {
    checkServiceHealth();
  }
});

chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === "AzureDevOpsHealthNotification") {
    chrome.tabs.create({ url: "https://status.dev.azure.com/" });
  }
});