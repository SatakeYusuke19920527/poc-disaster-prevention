output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "function_app_name" {
  value = azurerm_function_app_flex_consumption.main.name
}

output "function_app_default_hostname" {
  value = azurerm_function_app_flex_consumption.main.default_hostname
}

output "api_base_url" {
  description = "NEXT_PUBLIC_API_BASE_URL に設定する値"
  value       = "https://${azurerm_function_app_flex_consumption.main.default_hostname}"
}

output "static_web_app_name" {
  value = azurerm_static_web_app.main.name
}

output "static_web_app_default_host_name" {
  value = azurerm_static_web_app.main.default_host_name
}

output "static_web_app_api_key" {
  description = "GitHub Actions 等のデプロイで使用 (sensitive)"
  value       = azurerm_static_web_app.main.api_key
  sensitive   = true
}

output "openai_endpoint" {
  value = azurerm_cognitive_account.openai.endpoint
}

output "search_endpoint" {
  value = "https://${azurerm_search_service.main.name}.search.windows.net"
}

output "cosmos_endpoint" {
  value = azurerm_cosmosdb_account.main.endpoint
}

output "storage_account_name" {
  value = azurerm_storage_account.main.name
}

output "application_insights_connection_string" {
  value     = azurerm_application_insights.main.connection_string
  sensitive = true
}
