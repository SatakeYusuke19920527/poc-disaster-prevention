data "azurerm_client_config" "current" {}

resource "random_string" "suffix" {
  length  = 5
  upper   = false
  special = false
  numeric = true
}

locals {
  base = "${var.project}-${var.environment}"
  sfx  = random_string.suffix.result

  # Names for resources with global uniqueness or naming constraints
  rg_name      = "rg-${local.base}"
  storage_name = lower(replace("st${var.project}${var.environment}${local.sfx}", "-", ""))
  openai_name  = "oai-${local.base}-${local.sfx}"
  search_name  = "srch-${local.base}-${local.sfx}"
  cosmos_name  = "cosmos-${local.base}-${local.sfx}"
  func_name    = "func-${local.base}-${local.sfx}"
  plan_name    = "plan-${local.base}"
  swa_name     = "swa-${local.base}-${local.sfx}"
  appi_name    = "appi-${local.base}"
  log_name     = "log-${local.base}"
  maps_name    = "maps-${local.base}-${local.sfx}"
}

resource "azurerm_resource_group" "main" {
  name     = local.rg_name
  location = var.location
  tags     = var.tags
}
