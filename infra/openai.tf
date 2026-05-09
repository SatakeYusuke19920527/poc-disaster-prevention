resource "azurerm_cognitive_account" "openai" {
  name                          = local.openai_name
  location                      = var.openai_location
  resource_group_name           = azurerm_resource_group.main.name
  kind                          = "OpenAI"
  sku_name                      = "S0"
  custom_subdomain_name         = local.openai_name
  public_network_access_enabled = true
  local_auth_enabled            = false # Managed Identity 中心
  tags                          = var.tags
}

resource "azurerm_cognitive_deployment" "intent" {
  name                 = "intent"
  cognitive_account_id = azurerm_cognitive_account.openai.id

  model {
    format  = "OpenAI"
    name    = var.openai_model_intent
    version = var.openai_model_intent_version
  }

  sku {
    name     = "GlobalStandard"
    capacity = var.openai_deployment_capacity
  }
}

resource "azurerm_cognitive_deployment" "furusato" {
  name                 = "furusato"
  cognitive_account_id = azurerm_cognitive_account.openai.id

  model {
    format  = "OpenAI"
    name    = var.openai_model_agent
    version = var.openai_model_agent_version
  }

  sku {
    name     = "GlobalStandard"
    capacity = var.openai_deployment_capacity
  }
}

resource "azurerm_cognitive_deployment" "disaster_simulation" {
  name                 = "disaster-simulation"
  cognitive_account_id = azurerm_cognitive_account.openai.id

  model {
    format  = "OpenAI"
    name    = var.openai_model_agent
    version = var.openai_model_agent_version
  }

  sku {
    name     = "GlobalStandard"
    capacity = var.openai_deployment_capacity
  }
}

resource "azurerm_cognitive_deployment" "disaster_learning" {
  name                 = "disaster-learning"
  cognitive_account_id = azurerm_cognitive_account.openai.id

  model {
    format  = "OpenAI"
    name    = var.openai_model_agent
    version = var.openai_model_agent_version
  }

  sku {
    name     = "GlobalStandard"
    capacity = var.openai_deployment_capacity
  }
}
