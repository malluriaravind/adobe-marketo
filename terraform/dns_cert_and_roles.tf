// Lookup your hosted zone by domain name. This assumes your route53 zone domain is passed as var.hosted_zone_domain.
data "aws_route53_zone" "primary" {
  name         = var.hosted_zone_domain
  private_zone = false
}

resource "aws_acm_certificate" "app_cert" {
  domain_name       = var.certificate_domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_validation" {
  zone_id = data.aws_route53_zone.primary.zone_id
  name    = aws_acm_certificate.app_cert.domain_validation_options[0].resource_record_name
  type    = aws_acm_certificate.app_cert.domain_validation_options[0].resource_record_type
  records = [aws_acm_certificate.app_cert.domain_validation_options[0].resource_record_value]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "app_cert_validation" {
  certificate_arn         = aws_acm_certificate.app_cert.arn
  validation_record_fqdns = [aws_route53_record.cert_validation.fqdn]
}

// Data source to retrieve your AWS account ID for OIDC trust policy.
data "aws_caller_identity" "current" {}

output "acm_certificate_arn" {
  value = aws_acm_certificate.app_cert.arn
}

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
    },
    eks_pod_rds_connect_role = {
      name = "eks_pod_rds_connect_role"
      assume_role_policy = jsonencode({
        Version   = "2012-10-17",
        Statement = [{
          Effect = "Allow",
          Principal = {
            Federated = aws_iam_openid_connect_provider.eks.arn
          },
          Action    = "sts:AssumeRoleWithWebIdentity",
          Condition = {
            StringEquals = {
              // Remove the "https://" prefix from the URL to match the required format.
              "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub" = "system:serviceaccount:default:rds-access"
            }
          }
        }]
      })
      managed_policy_arns = [
        "arn:aws:iam::aws:policy/AmazonRDSFullAccess"
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

# Attach policies to roles dynamically
resource "aws_iam_role_policy_attachment" "roles" {
  for_each = {
    for role_key, role in local.iam_roles :
    for policy in role.managed_policy_arns :
    "${role_key}_${replace(replace(policy, ":", "-"), "/", "-")}" => {
      role_key = role_key,
      policy   = policy
    }
  }
  role       = aws_iam_role.roles[each.value.role_key].name
  policy_arn = each.value.policy
}

output "eks_cluster_role_arn" {
  value = aws_iam_role.roles["eks_cluster_role"].arn
}

output "eks_pod_rds_connect_role_arn" {
  value = aws_iam_role.roles["eks_pod_rds_connect_role"].arn
} 