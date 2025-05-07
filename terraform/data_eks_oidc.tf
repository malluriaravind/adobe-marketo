// Data source to fetch the EKS cluster details (ensure the cluster is created)
data "aws_eks_cluster" "cluster" {
  name = var.eks_cluster_name
  # Optionally, force a dependency on the cluster resource if needed:
  # depends_on = [aws_eks_cluster.eks_cluster]
}

locals {
  // Remove the "https://" prefix from the issuer to build the final OIDC provider URL.
  computed_oidc_provider_url = replace(data.aws_eks_cluster.cluster.identity[0].oidc.issuer, "https://", "")
}

output "computed_oidc_provider_url" {
  description = "The automatically computed OIDC provider URL for the EKS cluster (without https://)."
  value       = local.computed_oidc_provider_url
} 