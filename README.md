# patientcare-portal-opargoAdmin

Opargo Admin microfrontend (Module Federation remote `opargoAdmin`).

Ported from Angular `OpargoUIAngular/src/app/opargoadmin`.

## Shared services (do not duplicate)

React remotes consume the npm library **`patientcare-portal-sharedui`** (built from
`patientcare-portal-sharedUi`, installed via a `file:` dependency — no remote server to run).

| Angular | React import |
|---------|--------------|
| `SharedservicesuiService` | `patientcare-portal-sharedui/sharedUiService` + `SharedUiProvider` |
| Side nav layout | `patientcare-portal-sharedui/SideNav` (`ModuleLayout`) |
| Data tables | `patientcare-portal-sharedui/DataGrid` via local `DataTable` |
| Toasts / session | `patientcare-portal-sharedui/useSharedUi` |

**Rule:** never copy shared UI into this repo — always import from `patientcare-portal-sharedui/*`.

## Run locally

```bash
cd D:\patientcareportal\patientcare-portal-opargoAdmin
npm install
npm start          # :3005 → opargoAdmin remoteEntry.js

# Shell (host)
cd D:\patientcareportal\patientcare-portal-shell
npm start          # :3000 → loads opargoAdmin/OpargoAdminApp
```

## Shell route

Open **OpargoAdmin** via `/opargoadmin` (role: `opargoadmin` / `roles.opargositerole`).

## Migration order

1. MFE scaffold + shell wiring (this step)
2. Practice Management
3. Practice Groups
4. SmartReach Payers
