output "backend_ecr_repo_url" {
  value = aws_ecr_repository.backend_repo.repository_url
}

output "frontend_ecr_repo_url" {
  value = aws_ecr_repository.frontend_repo.repository_url
}

output "artifacts_bucket" {
  value = aws_s3_bucket.artifacts_bucket.id
}

output "app_secrets_arn" {
  value = aws_secretsmanager_secret.app_secrets.arn
}

output "eks_cluster_name" {
  value = aws_eks_cluster.eks_cluster.name
}

<<<<<<< HEAD
output "eks_cluster_role_arn" {
  value = aws_iam_role.roles["eks_cluster_role"].arn
=======
output "acm_certificate_arn" {
  value = aws_acm_certificate.app_cert.arn
}

output "eks_cluster_role_arn" {
  value = aws_iam_role.eks_cluster_role.arn
>>>>>>> 93a3394 (added)
}

output "iam_roles_arns" {
  description = "ARNs of the automatically created IAM roles"
  value       = { for role, iam in aws_iam_role.roles : role => iam.arn }
} 