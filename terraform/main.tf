terraform {
  required_version = ">= 0.14"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_ecr_repository" "backend_repo" {
  name = "adobe-marketo-backend"
}

resource "aws_ecr_repository" "frontend_repo" {
  name = "adobe-marketo-frontend"
}

resource "aws_s3_bucket" "artifacts_bucket" {
  bucket = var.artifacts_bucket_name
}

resource "aws_s3_bucket_versioning" "artifacts_bucket" {
  bucket = aws_s3_bucket.artifacts_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "artifacts_bucket" {
  bucket = aws_s3_bucket.artifacts_bucket.id

  rule {
    id     = "expire-artifacts"
    status = "Enabled"

    expiration {
      days = 30
    }
  }
}

resource "aws_secretsmanager_secret" "app_secrets" {
  name = "my-app-secrets"
}

resource "aws_secretsmanager_secret_version" "app_secrets_version" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    DATABASE_URL         = var.database_url,
    FRONTEND_URL         = var.frontend_url,
    AWS_REGION           = var.aws_region,
    COGNITO_USER_POOL_ID = var.cognito_user_pool_id,
    COGNITO_CLIENT_ID    = var.cognito_client_id
  })
}

resource "aws_eks_cluster" "eks_cluster" {
  name     = var.eks_cluster_name
  role_arn = aws_iam_role.roles["eks_cluster_role"].arn

  vpc_config {
    subnet_ids = var.subnets
  }

  depends_on = [
    aws_iam_role.roles,
    aws_iam_role_policy_attachment.roles
  ]
}
