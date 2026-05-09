variable "project" {
  description = "Project short name (used in resource names)."
  type        = string
  default     = "pocdisaster"

  validation {
    condition     = length(var.project) <= 12 && can(regex("^[a-z0-9]+$", var.project))
    error_message = "project must be lowercase alphanumeric and <= 12 chars."
  }
}

variable "environment" {
  description = "Environment short name (e.g. dev, stg, prd)."
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Primary Azure region."
  type        = string
  default     = "japaneast"
}

variable "openai_location" {
  description = "Region for the Azure OpenAI account (some models are region-restricted)."
  type        = string
  default     = "japaneast"
}

variable "openai_model_intent" {
  description = "Model used for the intent classifier deployment."
  type        = string
  default     = "gpt-4o-mini"
}

variable "openai_model_intent_version" {
  type    = string
  default = "2024-07-18"
}

variable "openai_model_agent" {
  description = "Model used for all three agent deployments."
  type        = string
  default     = "gpt-4o-mini"
}

variable "openai_model_agent_version" {
  type    = string
  default = "2024-07-18"
}

variable "openai_deployment_capacity" {
  description = "TPM capacity (in thousands) per deployment."
  type        = number
  default     = 50
}

variable "search_sku" {
  description = "Azure AI Search SKU (free, basic, standard, standard2, ...)."
  type        = string
  default     = "basic"
}

variable "tags" {
  description = "Common tags."
  type        = map(string)
  default = {
    project = "poc-disaster-prevention"
    managed = "terraform"
    env     = "dev"
  }
}

variable "developer_object_id" {
  description = "Optional Entra ID object ID for a developer/team that should also receive RBAC for local debugging. Leave null to skip developer RBAC (e.g. when applying from CI)."
  type        = string
  default     = null
}
