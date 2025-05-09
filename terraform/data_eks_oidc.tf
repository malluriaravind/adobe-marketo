<<<<<<< HEAD
// File removed because we do not require an OIDC provider.
// If this file exists, you can delete its contents.

// Removed the data "aws_eks_cluster" block because we already create the cluster in main.tf.
// data "aws_eks_cluster" "cluster" {
//   name = var.eks_cluster_name
// }

locals {
  // Use the created EKS cluster resource directly.
  computed_oidc_provider_url = replace(aws_eks_cluster.eks_cluster.identity[0].oidc[0].issuer, "https://", "")
=======
// Data source to fetch the EKS cluster details (ensure the cluster is created)
data "aws_eks_cluster" "cluster" {
  name = var.eks_cluster_name
  # Optionally, force a dependency on the cluster resource if needed:
  # depends_on = [aws_eks_cluster.eks_cluster]
}

locals {
  // Remove the "https://" prefix from the issuer to build the final OIDC provider URL.
  computed_oidc_provider_url = replace(data.aws_eks_cluster.cluster.identity[0].oidc.issuer, "https://", "")
>>>>>>> 93a3394 (added)
}

output "computed_oidc_provider_url" {
  description = "The automatically computed OIDC provider URL for the EKS cluster (without https://)."
  value       = local.computed_oidc_provider_url
} 