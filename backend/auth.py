import os
import boto3
import time
from fastapi import HTTPException
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()
cognito_client = boto3.client('cognito-idp', region_name=os.getenv("AWS_REGION", "us-west-1"))
USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")
CLIENT_ID = os.getenv("COGNITO_CLIENT_ID")

MAX_LOGIN_ATTEMPTS = 3
LOCKOUT_PERIOD_SECONDS = 300

login_attempts = {}

def sign_up(email: str, password: str):
    try:
        response = cognito_client.sign_up(
            ClientId=CLIENT_ID,
            Username=email,
            Password=password,
            UserAttributes=[
                {'Name': 'email', 'Value': email},
            ],
        )
        return response
    except cognito_client.exceptions.UsernameExistsException:
        raise HTTPException(status_code=400, detail="User already exists")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def confirm_sign_up(email: str, code: str):
    try:
        response = cognito_client.confirm_sign_up(
            ClientId=CLIENT_ID,
            Username=email,
            ConfirmationCode=code
        )
        return response
    except cognito_client.exceptions.CodeMismatchException:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    except cognito_client.exceptions.ExpiredCodeException:
        raise HTTPException(status_code=400, detail="Verification code expired")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def login(email: str, password: str):
    current_time = time.time()
    if email in login_attempts:
        if login_attempts[email].get("lockout_until", 0) > current_time:
            remaining_seconds = int(login_attempts[email]["lockout_until"] - current_time)
            remaining_minutes = remaining_seconds // 60
            remaining_seconds %= 60
            time_str = f"{remaining_minutes}m {remaining_seconds}s"
            
            raise HTTPException(
                status_code=429, 
                detail=f"Too many failed login attempts. Try again in {time_str}"
            )
    
    try:
        response = cognito_client.initiate_auth(
            ClientId=CLIENT_ID,
            AuthFlow='USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': email,
                'PASSWORD': password
            }
        )
        if email in login_attempts:
            del login_attempts[email]
        return response
    except cognito_client.exceptions.NotAuthorizedException:
        if email not in login_attempts:
            login_attempts[email] = {"count": 0}
        
        login_attempts[email]["count"] += 1
        
        if login_attempts[email]["count"] >= MAX_LOGIN_ATTEMPTS:
            login_attempts[email]["lockout_until"] = current_time + LOCKOUT_PERIOD_SECONDS
            raise HTTPException(
                status_code=429, 
                detail=f"Too many failed login attempts. Try again in 5 minutes"
            )
        
        remaining = MAX_LOGIN_ATTEMPTS - login_attempts[email]["count"]
        raise HTTPException(
            status_code=401, 
            detail=f"Incorrect username or password. {remaining} attempts remaining"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def forgot_password(email: str):
    try:
        response = cognito_client.forgot_password(
            ClientId=CLIENT_ID,
            Username=email
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def confirm_forgot_password(email: str, code: str, new_password: str):
    try:
        response = cognito_client.confirm_forgot_password(
            ClientId=CLIENT_ID,
            Username=email,
            ConfirmationCode=code,
            Password=new_password
        )
        return response
    except cognito_client.exceptions.CodeMismatchException:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    except cognito_client.exceptions.ExpiredCodeException:
        raise HTTPException(status_code=400, detail="Verification code expired")
    except cognito_client.exceptions.InvalidPasswordException:
        raise HTTPException(status_code=400, detail="Password does not meet the requirements")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
def get_login_attempts_remaining(email: str):
    if email not in login_attempts:
        return MAX_LOGIN_ATTEMPTS
    
    current_time = time.time()
    if login_attempts[email].get("lockout_until", 0) > current_time:
        return 0
        
    return MAX_LOGIN_ATTEMPTS - login_attempts[email].get("count", 0) 