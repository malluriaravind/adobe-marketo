resource "aws_eip" "frontend_lb" {
  vpc = true
  tags = {
    Name = "frontend-loadbalancer-ip"
  }
} 