@description('Environment name (dev, staging, prod)')
param environmentName string = 'dev'

@description('Base name for resources')
param baseName string = 'rfpsurvey'

@description('Azure region for resources')
param location string = resourceGroup().location

@description('Existing SQL Server name to reuse')
param sqlServerName string

@description('Existing SQL Database name')
param sqlDatabaseName string

@secure()
@description('SQL admin username')
param sqlAdminLogin string

@secure()
@description('SQL admin password')
param sqlAdminPassword string

// ─── Variables ───
var reportAppName = 'swa-${baseName}-report-${environmentName}'
var sqlConnectionString = 'Server=tcp:${sqlServerName}.database.windows.net,1433;Database=${sqlDatabaseName};User ID=${sqlAdminLogin};Password=${sqlAdminPassword};Encrypt=true;TrustServerCertificate=false;Connection Timeout=30;'

// ─── Reference Existing SQL Server ───
resource sqlServer 'Microsoft.Sql/servers@2023-08-01-preview' existing = {
  name: sqlServerName
}

// ─── Azure Static Web App ───
resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: reportAppName
  location: location
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
    buildProperties: {
      appLocation: 'src/frontend'
      apiLocation: 'src/api'
      outputLocation: 'dist'
      appBuildCommand: 'npm run build'
    }
  }
  tags: {
    environment: environmentName
    project: 'partner-developer-report'
    'azd-service-name': 'web'
  }
}

// ─── App Settings for the SWA ───
resource staticWebAppSettings 'Microsoft.Web/staticSites/config@2023-12-01' = {
  parent: staticWebApp
  name: 'appsettings'
  properties: {
    AZURE_SQL_CONNECTION_STRING: sqlConnectionString
  }
}

// ─── Outputs ───
output staticWebAppName string = staticWebApp.name
output staticWebAppUrl string = 'https://${staticWebApp.properties.defaultHostname}'
output sqlServerName string = sqlServer.name
output sqlDatabaseName string = sqlDatabaseName
