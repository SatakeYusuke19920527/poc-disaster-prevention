resource "azurerm_search_service" "main" {
  name                = local.search_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = var.search_sku
  replica_count       = 1
  partition_count     = 1
  local_authentication_enabled = false

  identity {
    type = "SystemAssigned"
  }

  tags = var.tags
}
