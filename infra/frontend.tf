resource "azurerm_static_web_app" "main" {
  name                = local.swa_name
  resource_group_name = azurerm_resource_group.main.name
  location            = "eastasia" # Static Web Apps の利用可能リージョンに限定
  sku_tier            = "Free"
  sku_size            = "Free"
  tags                = var.tags
}
