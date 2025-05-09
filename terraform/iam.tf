data "aws_caller_identity" "current" {}

locals {
  iam_roles = {
    eks_cluster_role = {
      name               = "eks_cluster_role"
      assume_role_policy = jsonencode({
        Version   = "2012-10-17",
        Statement = [{
          Action    = "sts:AssumeRole",
          Effect    = "Allow",
          Principal = {
            Service = "eks.amazonaws.com"
          }
        }]
      })
      managed_policy_arns = [
        "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy",
        "arn:aws:iam::aws:policy/AmazonEKSVPCResourceController"
      ]
    }
  }
}

# Create IAM roles dynamically
resource "aws_iam_role" "roles" {
  for_each           = local.iam_roles
  name               = each.value.name
  assume_role_policy = each.value.assume_role_policy
}

# Attach policies to roles dynamically using a flattened map.
resource "aws_iam_role_policy_attachment" "roles" {
  for_each = {
    for attachment in flatten([
      for role_key, role in local.iam_roles : [
        for policy in role.managed_policy_arns : {
          key      = "${role_key}_${replace(replace(policy, ":", "-"), "/", "-")}",
          role_key = role_key,
          policy   = policy
        }
      ]
    ]) : attachment.key => attachment
  }
  role       = aws_iam_role.roles[each.value.role_key].name
  policy_arn = each.value.policy
}
