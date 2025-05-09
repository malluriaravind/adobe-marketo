variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-1"
}

variable "artifacts_bucket_name" {
  description = "S3 bucket name for artifacts"
  type        = string
  default     = "aravind-adobe-marketo-artifacts" .
}

variable "database_url" {
  description = "Database URL for the app"
  type        = string
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