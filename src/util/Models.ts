export interface HealthQueryOptions {
  readonly services?: readonly Service[];
  readonly geographies?: readonly Geography[];
}

export interface ServiceStatus {
  readonly lastUpdated: Date;
  readonly status: StatusSummary;
  readonly services: readonly ServiceHealth[];
}

export interface StatusSummary {
  readonly health: ScopeHealth;
  readonly message: string;
}

export interface ServiceHealth {
  readonly id: Service;
  readonly geographies: readonly GeographyWithHealth[];
}

export interface GeographyWithHealth {
  readonly id: Geography;
  readonly name: string;
  readonly health: ScopeHealth;
}

export enum ScopeHealth {
  Unknown = 'unknown',
  Unhealthy = 'unhealthy',
  Degraded = 'degraded',
  Advisory = 'advisory',
  Healthy = 'healthy',
}
export enum Geography {
  APAC = 'APAC',
  AU = 'AU',
  BR = 'BR',
  CA = 'CA',
  EU = 'EU',
  IN = 'IN',
  UK = 'UK',
  US = 'US',
}
export enum Service {
  Artifacts = 'Artifacts',
  Boards = 'Boards',
  CoreServices = 'Core services',
  OtherServices = 'Other services',
  Pipelines = 'Pipelines',
  Repos = 'Repos',
  TestPlans = 'Test Plans',
}