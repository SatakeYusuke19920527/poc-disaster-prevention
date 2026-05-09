resource "azurerm_service_plan" "main" {
  name                = local.plan_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = "FC1"
  tags                = var.tags
}

resource "azurerm_function_app_flex_consumption" "main" {
  name                = local.func_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.main.id

  storage_container_type      = "blobContainer"
  storage_container_endpoint  = "${azurerm_storage_account.main.primary_blob_endpoint}${azurerm_storage_container.deployment.name}"
  storage_authentication_type = "SystemAssignedIdentity"

  runtime_name    = "node"
  runtime_version = "20"

  maximum_instance_count = 40
  instance_memory_in_mb  = 2048

  identity {
    type = "SystemAssigned"
  }

  site_config {
    application_insights_connection_string = azurerm_application_insights.main.connection_string
  }

  app_settings = {
    AzureWebJobsStorage__accountName = azurerm_storage_account.main.name

    # Required for Azure Functions Node.js v4 programming model
    AzureWebJobsFeatureFlags = "EnableWorkerIndexing"

    AZURE_OPENAI_ENDPOINT                       = azurerm_cognitive_account.openai.endpoint
    AZURE_OPENAI_API_VERSION                    = "2024-10-21"
    AZURE_OPENAI_DEPLOYMENT_INTENT              = azurerm_cognitive_deployment.intent.name
    AZURE_OPENAI_DEPLOYMENT_FURUSATO            = azurerm_cognitive_deployment.furusato.name
    AZURE_OPENAI_DEPLOYMENT_DISASTER_SIMULATION = azurerm_cognitive_deployment.disaster_simulation.name
    AZURE_OPENAI_DEPLOYMENT_DISASTER_LEARNING   = azurerm_cognitive_deployment.disaster_learning.name

    AZURE_SEARCH_ENDPOINT = "https://${azurerm_search_service.main.name}.search.windows.net"
    AZURE_SEARCH_INDEX    = "disaster-index"

    COSMOS_ENDPOINT                = azurerm_cosmosdb_account.main.endpoint
    COSMOS_DATABASE                = azurerm_cosmosdb_sql_database.main.name
    COSMOS_CONTAINER_CONVERSATIONS = azurerm_cosmosdb_sql_container.conversations.name

    BLOB_ACCOUNT_URL     = azurerm_storage_account.main.primary_blob_endpoint
    BLOB_CONTAINER_ASSETS = azurerm_storage_container.assets.name
  }

  tags = var.tags

  # CORS is managed via `az functionapp cors` because the azurerm provider
  # currently has a bug that produces "block count changed from 0 to 1" on apply
  # when site_config.cors is declared inline.
  lifecycle {
    ignore_changes = [
      site_config[0].cors,
    ]
  }
}
