variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-1"
}

variable "artifacts_bucket_name" {
  description = "S3 bucket name for artifacts"
  type        = string
  default     = "aravind-adobe-marketo-artifacts"  // Ensure this is globally unique.
}

variable "database_url" {
  description = "Database URL for the app"
  type        = string
}

variable "frontend_url" {
  description = "Production Frontend URL (used for CORS)"
  type        = string
  default     = "https://adobemarketotask.com"
}

variable "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  type        = string
}

variable "cognito_client_id" {
  description = "Cognito Client ID"
  type        = string
}

variable "eks_cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "adobe-marketo-eks-cluster"
}

variable "eks_cluster_role_arn" {
  description = "ARN of the IAM role for the EKS Cluster"
  type        = string
}

variable "subnets" {
  description = "List of subnet IDs for the EKS cluster"
  type        = list(string)
  default     = ["subnet-026e0d6e20763e565", "subnet-0e93bf5ff9d639296"]
}

variable "hosted_zone_domain" {
  description = "The domain of your Route53 hosted zone (e.g. example.com)"
  type        = string
  default     = "adobemarketotask.com"
}

variable "certificate_domain" {
  description = "The domain or subdomain for the SSL certificate (e.g. myapp.example.com)"
  type        = string
  default     = "adobemarketotask.com"
} 

variable "eks_oidc_provider_url" {
  description = "The URL of the OIDC provider for your EKS cluster. If the cluster already exists, you can automatically compute it—but if you are creating the cluster, leave this empty and retrieve it after creation."
  type        = string
  default     = ""  // Leave empty unless your cluster is pre-existing
} 