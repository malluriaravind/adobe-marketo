terraform {
  backend "s3" {
    bucket = "adobe-marketo"
    key    = "terraform/state.tfstate"
    region = "us-west-1"
  }
} 