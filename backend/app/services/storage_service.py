import boto3
import json
from botocore.exceptions import ClientError
from app.core.config import settings

class StorageService:
    def __init__(self):
        self.s3 = boto3.client(
            "s3",
            endpoint_url=settings.S3_ENDPOINT,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            region_name=settings.S3_REGION
        )
        self.bucket_name = settings.S3_BUCKET
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        """Check if bucket exists; if not, create it and set public read policy."""
        try:
            try:
                self.s3.head_bucket(Bucket=self.bucket_name)
            except ClientError as e:
                # If bucket doesn't exist (404), try creating it
                # For some S3 providers head_bucket might return 404
                self.s3.create_bucket(Bucket=self.bucket_name)
                
                # Define public read policy
                policy = {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Sid": "PublicReadGetObject",
                            "Effect": "Allow",
                            "Principal": "*",
                            "Action": "s3:GetObject",
                            "Resource": f"arn:aws:s3:::{self.bucket_name}/*"
                        }
                    ]
                }
                
                # Apply policy
                self.s3.put_bucket_policy(
                    Bucket=self.bucket_name,
                    Policy=json.dumps(policy)
                )
                print(f"MinIO bucket '{self.bucket_name}' created with public read access.")
        except Exception as e:
            print(f"Warning: Could not automatically create or configure MinIO bucket (endpoint might be offline): {e}")

    def upload_file(self, file_content: bytes, file_name: str, content_type: str = "image/jpeg") -> str:
        """Uploads a file to MinIO and returns the public accessibility URL."""
        try:
            self.s3.put_object(
                Bucket=self.bucket_name,
                Key=file_name,
                Body=file_content,
                ContentType=content_type
            )
            # URL format for MinIO: endpoint/bucket/filename
            # If endpoint is localhost, return localhost link.
            url = f"{settings.S3_ENDPOINT}/{self.bucket_name}/{file_name}"
            return url
        except Exception as e:
            raise Exception(f"Failed to upload file to storage: {e}")

storage_service = StorageService()
