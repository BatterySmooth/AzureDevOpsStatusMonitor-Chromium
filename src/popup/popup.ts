import { Config } from "../util/Config";
import { LastPollStorage } from "../storage/LastPollStorage";
import { Geography, HealthQueryOptions, ScopeHealth, Service, ServiceStatus } from "../util/Models";
import { ServiceStatusStorage } from "../storage/ServiceStatusStorage";
import { QueryFilterStorage } from "../storage/QueryFilterStorage";
import { ServiceHealthClient } from "../util/ServiceHealthClient";

function generateServiceTableElement(data: ServiceStatus): HTMLTableElement {
  const allGeographies = Array.from(
    new Set(data.services.flatMap(service => service.geographies.map(g => g.name)))
  );

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  const serviceHeader = document.createElement('th');
  serviceHeader.textContent = 'Service';
  headerRow.appendChild(serviceHeader);

  for (const geo of allGeographies) {
    const th = document.createElement('th');
    const displayTxt = geo == 'United States'
      ? 'USA'
      : geo == 'United Kingdom'
        ? 'UK'
        : geo == 'Asia Pacific'
          ? 'Asia'
          : geo;
    th.textContent = displayTxt;
    headerRow.appendChild(th);
  }

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  for (const service of data.services) {
    const row = document.createElement('tr');

    const serviceCell = document.createElement('td');
    serviceCell.textContent = service.id;
    row.appendChild(serviceCell);

    for (const geo of allGeographies) {
      const cell = document.createElement('td');
      const match = service.geographies.find(g => g.name === geo);
      const health = match ? match.health : ScopeHealth.Unknown;
      const healthImagePath = getScopeHealthIconPath(health);

      const img = document.createElement('img');
      img.src = healthImagePath;
      img.width = 16;
      img.height = 16;
      img.alt = health;

      cell.textContent = '';
      cell.appendChild(img);
      row.appendChild(cell);
    }

    tbody.appendChild(row);
  }

  table.appendChild(tbody);
  return table;
}

function createCheckbox(id: string, labelText: string, container: HTMLElement) {
  const wrapper = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = id;
  checkbox.value = labelText;
  wrapper.appendChild(checkbox);
  wrapper.appendChild(document.createTextNode(labelText));
  container.appendChild(wrapper);
}

function updateCheckboxStates(selectedGeographies: Geography[], selectedServices: Service[]) {
  Object.values(Geography).forEach(g => {
    const checkbox = document.getElementById(`geo-${g}`) as HTMLInputElement;
    if (checkbox) checkbox.checked = selectedGeographies.includes(g);
  });

  Object.values(Service).forEach(s => {
    const checkbox = document.getElementById(`svc-${s}`) as HTMLInputElement;
    if (checkbox) checkbox.checked = selectedServices.includes(s);
  });
}

function getScopeHealthIconPath(scopeHealth: ScopeHealth): string {
  switch (scopeHealth) {
    case ScopeHealth.Unknown: return '../images/AdvisoryIcon.svg';
    case ScopeHealth.Unhealthy: return '../images/UnhealthyIcon.svg';
    case ScopeHealth.Degraded: return '../images/DegradedIcon.svg';
    case ScopeHealth.Advisory: return '../images/AdvisoryIcon.svg';
    case ScopeHealth.Healthy: return '../images/HealthyIcon.svg';
  }
}

function getGeographyDisplayName(geography: Geography): string {
  switch (geography) {
    case Geography.APAC: return 'Asia Pacific';
    case Geography.AU: return 'Austrailia';
    case Geography.BR: return 'Brazil';
    case Geography.CA: return 'Canada';
    case Geography.EU: return 'Europe';
    case Geography.IN: return 'India';
    case Geography.UK: return 'United Kingdom';
    case Geography.US: return 'United States';
  }
}

async function configureCountdownElement(): Promise<void> {
  const spanElementNullable = document.getElementById('refresh-badge');
  if (!spanElementNullable) return;
  const spanElement: HTMLSpanElement = spanElementNullable;

  let lastPoll = await LastPollStorage.load();
  if (lastPoll != null) {
    await updateCountdown();
    // update every second
    const intervalId = setInterval(async () => {
      await updateCountdown();
    }, 1000);
  }
  else {
    updateBadgeText(spanElement, `Waiting...`);
  }

  return;

  async function updateCountdown() {
    lastPoll = await LastPollStorage.load();
    if (lastPoll == null) { return; }
    const now = new Date();
    const nextPollTime = new Date(lastPoll.getTime() + Config.DevOpsPollFrequency * 60000);
    const diffMs = nextPollTime.getTime() - now.getTime();
    const nextUpdateInSeconds = Math.max(Math.floor(diffMs / 1000), 0);

    if (nextUpdateInSeconds > 0) {
      updateBadgeText(spanElement, `Update in ${nextUpdateInSeconds}s`);
      updateBadgeTooltip(spanElement, `Last update on ${lastPoll.toLocaleString()}`);
    } else {
      updateBadgeText(spanElement, `Updating...`);
      updateBadgeTooltip(spanElement, `Last update on ${lastPoll.toLocaleString()}`);
      lastPoll = await LastPollStorage.load();
    }
  }

  function updateBadgeText(spanElement: HTMLSpanElement, badgeText: string) {
    spanElement.lastChild?.nodeType === Node.TEXT_NODE
      ? (spanElement.lastChild.textContent = badgeText)
      : spanElement.append(badgeText);
  }
  function updateBadgeTooltip(spanElement: HTMLSpanElement, tooltip: string) {
    spanElement.title = tooltip;
  }
}

async function configureServiceTable(status: ServiceStatus | null) {
  const container = document.getElementById('status-container');
  if (status && container) {
    const table = generateServiceTableElement(status);
    container.innerHTML = "";
    container.appendChild(table);
    configureCountdownElement();
  }
  else {

  }
}

async function configureMainPopup() {
  const status = await ServiceStatusStorage.load();
  await configureServiceTable(status);
}

async function configureSettingsDialog() {
  const geoContainer = document.getElementById('geo-list')!;
  const serviceContainer = document.getElementById('service-list')!;
  const overlay = document.getElementById('overlay')!;
  const openBtn = document.getElementById('settings-button')!;
  const closeBtn = document.getElementById('closeOverlayBtn')!;
  const savedOptions = await QueryFilterStorage.load();
  let selectedGeographies: Geography[] = [...savedOptions.geographies ?? Object.values(Geography)];
  let selectedServices: Service[] = [...savedOptions.services ?? Object.values(Service)];
  // Create checkboxes
  Object.values(Geography).forEach(g => createCheckbox(`geo-${g}`, getGeographyDisplayName(g), geoContainer));
  Object.values(Service).forEach(s => createCheckbox(`svc-${s}`, s, serviceContainer));

  openBtn.addEventListener('click', () => {
    updateCheckboxStates(selectedGeographies, selectedServices);
    overlay.classList.remove('hidden');
  });

  closeBtn.addEventListener('click', async () => {
    selectedGeographies = Object.values(Geography).filter(g =>
      (document.getElementById(`geo-${g}`) as HTMLInputElement).checked
    );
    selectedServices = Object.values(Service).filter(s =>
      (document.getElementById(`svc-${s}`) as HTMLInputElement).checked
    );
    const options: HealthQueryOptions = {
      geographies: selectedGeographies,
      services: selectedServices,
    };
    await QueryFilterStorage.save(options);
    const status = await ServiceHealthClient.getStatus(options);
    await configureServiceTable(status);
    overlay.classList.add('hidden');
  });
  // close overlay when clicking outside content
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.add('hidden');
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  // Main content
  await configureMainPopup();
  // Settings dialog
  await configureSettingsDialog();
});