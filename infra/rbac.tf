# =====================================================================
# Function App (System-Assigned MI) → 各 Azure サービスへの最小権限割当
# =====================================================================

# --- Storage (Flex Consumption デプロイメントパッケージ + ランタイム) ---
resource "azurerm_role_assignment" "func_storage_blob_owner" {
  scope                = azurerm_storage_account.main.id
  role_definition_name = "Storage Blob Data Owner"
  principal_id         = azurerm_function_app_flex_consumption.main.identity[0].principal_id
}

resource "azurerm_role_assignment" "func_storage_queue" {
  scope                = azurerm_storage_account.main.id
  role_definition_name = "Storage Queue Data Contributor"
  principal_id         = azurerm_function_app_flex_consumption.main.identity[0].principal_id
}

# Durable Functions (AzureStorage backend) requires Table access for hub state
resource "azurerm_role_assignment" "func_storage_table" {
  scope                = azurerm_storage_account.main.id
  role_definition_name = "Storage Table Data Contributor"
  principal_id         = azurerm_function_app_flex_consumption.main.identity[0].principal_id
}

# --- Azure OpenAI ---
resource "azurerm_role_assignment" "func_openai_user" {
  scope                = azurerm_cognitive_account.openai.id
  role_definition_name = "Cognitive Services OpenAI User"
  principal_id         = azurerm_function_app_flex_consumption.main.identity[0].principal_id
}

# --- Azure AI Search (read query + index data) ---
resource "azurerm_role_assignment" "func_search_index_reader" {
  scope                = azurerm_search_service.main.id
  role_definition_name = "Search Index Data Reader"
  principal_id         = azurerm_function_app_flex_consumption.main.identity[0].principal_id
}

resource "azurerm_role_assignment" "func_search_service_reader" {
  scope                = azurerm_search_service.main.id
  role_definition_name = "Search Service Contributor"
  principal_id         = azurerm_function_app_flex_consumption.main.identity[0].principal_id
}

# --- Cosmos DB (SQL Data Contributor: read + write) ---
resource "azurerm_cosmosdb_sql_role_assignment" "func_cosmos_data_contributor" {
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name

  # 組み込みロール: 00000000-0000-0000-0000-000000000002 = Cosmos DB Built-in Data Contributor
  role_definition_id = "${azurerm_cosmosdb_account.main.id}/sqlRoleDefinitions/00000000-0000-0000-0000-000000000002"
  principal_id       = azurerm_function_app_flex_consumption.main.identity[0].principal_id
  scope              = azurerm_cosmosdb_account.main.id
}

# --- 開発者向け: 指定された Object ID にロール付与 (運用時は分離) ---
# var.developer_object_id が null の場合 (CI 実行時) は開発者ロール割当をスキップする。
locals {
  developer_count = var.developer_object_id == null ? 0 : 1
}

resource "azurerm_role_assignment" "dev_openai_user" {
  count                = local.developer_count
  scope                = azurerm_cognitive_account.openai.id
  role_definition_name = "Cognitive Services OpenAI User"
  principal_id         = var.developer_object_id
}

resource "azurerm_role_assignment" "dev_storage_blob" {
  count                = local.developer_count
  scope                = azurerm_storage_account.main.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = var.developer_object_id
}

resource "azurerm_role_assignment" "dev_storage_table" {
  count                = local.developer_count
  scope                = azurerm_storage_account.main.id
  role_definition_name = "Storage Table Data Contributor"
  principal_id         = var.developer_object_id
}

# Developer access to AI Search to manage indexes and seed documents
resource "azurerm_role_assignment" "dev_search_service" {
  count                = local.developer_count
  scope                = azurerm_search_service.main.id
  role_definition_name = "Search Service Contributor"
  principal_id         = var.developer_object_id
}

resource "azurerm_role_assignment" "dev_search_index_data" {
  count                = local.developer_count
  scope                = azurerm_search_service.main.id
  role_definition_name = "Search Index Data Contributor"
  principal_id         = var.developer_object_id
}

resource "azurerm_cosmosdb_sql_role_assignment" "dev_cosmos_data_contributor" {
  count               = local.developer_count
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name
  role_definition_id  = "${azurerm_cosmosdb_account.main.id}/sqlRoleDefinitions/00000000-0000-0000-0000-000000000002"
  principal_id        = var.developer_object_id
  scope               = azurerm_cosmosdb_account.main.id
}
