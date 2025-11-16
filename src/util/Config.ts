export const Config = {
    DevOpsEndpoint: "https://status.dev.azure.com/_apis/status/health",
    DevOpsApiVersion: "7.1-preview.1",
    AlarmName: "adoStatusPollAlarm",
    DevOpsPollFrequency: 1, // in mins
    QueryOptionsStorageKey: "AzureDevOpsHealthFilterOptions",
    LastStatusStorageKey: "AzureDevOpsHealthLastStatus",
    LastPollStorageKey: "AzureDevOpsHealthLastPoll",
}