 // Create an IAM Role for the EKS managed node group
resource "aws_iam_role" "eks_node_role" {
  name = "eks_node_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action    = "sts:AssumeRole",
      Effect    = "Allow",
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

# Attach required policies to the node role for EKS workers.
resource "aws_iam_role_policy_attachment" "eks_worker_AmazonEKSWorkerNodePolicy" {
  role       = aws_iam_role.eks_node_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}

resource "aws_iam_role_policy_attachment" "eks_worker_AmazonEC2ContainerRegistryReadOnly" {
  role       = aws_iam_role.eks_node_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role_policy_attachment" "eks_worker_AmazonEKS_CNI_Policy" {
  role       = aws_iam_role.eks_node_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
}

# Create the managed node group for your EKS cluster
resource "aws_eks_node_group" "eks_node_group" {
  cluster_name    = aws_eks_cluster.eks_cluster.name
  node_group_name = "eks-managed-node-group"
  node_role_arn   = aws_iam_role.eks_node_role.arn
  subnet_ids      = var.subnets

  scaling_config {
    desired_size = 2
    min_size     = 1
    max_size     = 3
  }

  instance_types = ["t3.medium"]

  ami_type = "AL2_x86_64"    # Amazon Linux 2 (x86)

  # Optional: Uncomment and adjust if you wish to enable remote SSH access
  # remote_access {
  #   ec2_ssh_key               = "your_key_name"
  #   source_security_group_ids = [ "sg-xxxxxxxx" ]
  # }

  depends_on = [aws_eks_cluster.eks_cluster]
}