resource "azurerm_maps_account" "main" {
  name                = local.maps_name
  resource_group_name = azurerm_resource_group.main.name
  location            = "global"
  sku_name            = "G2"
  tags                = var.tags
}
