# Create OIDC provider manually for your EKS cluster.
resource "aws_iam_openid_connect_provider" "eks" {
  url             = var.eks_oidc_provider_url != "" ? var.eks_oidc_provider_url : data.aws_eks_cluster.cluster.identity[0].oidc.issuer
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [var.oidc_thumbprint]
} 