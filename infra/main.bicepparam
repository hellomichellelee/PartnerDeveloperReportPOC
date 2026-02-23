using './main.bicep'

param environmentName = 'dev'
param baseName = 'rfpsurvey'
param location = 'eastus2'
param sqlServerName = 'sql-rfpsurvey-dev-nlppmcvzymz2s'
param sqlDatabaseName = 'sqldb-responses'
param sqlAdminLogin = readEnvironmentVariable('SQL_ADMIN_LOGIN', '')
param sqlAdminPassword = readEnvironmentVariable('SQL_ADMIN_PASSWORD', '')
