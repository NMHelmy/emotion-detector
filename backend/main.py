import uvicorn
from fastapi import FastAPI, Form, HTTPException, Depends, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import secrets
import os
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import JWTError, jwt
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
from typing import Optional
from database import create_table, create_connection
from fastapi.responses import JSONResponse
import aiofiles
from fastapi import Request
from datetime import datetime
import pytz
from fastapi import FastAPI, UploadFile, File
import numpy as np
from tensorflow.keras.models import load_model
from keras.preprocessing import image
from fastapi.responses import JSONResponse
import io


app = FastAPI()

create_table()

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key-for-development-only")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

origins = [
    "http://localhost:3000",
]

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_salt() -> str:
    return secrets.token_hex(32)

# verifies whether entered password matches its hashed version
def verify_password(plain_password: str, hashed_password: str, salt: str = None) -> bool:
    if salt:
        salted_password = plain_password + salt
        return pwd_context.verify(salted_password, hashed_password)
    else:
        return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str, salt: str = None) -> str:
    if salt:
        salted_password = password + salt
        return pwd_context.hash(salted_password)
    else:
        return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

class UserSignup(BaseModel):
    username: str
    first_name: str
    last_name: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class PhotoUpload(BaseModel):
    emotion: str 

@app.get("/")
def root():
    return {}
    
    
@app.post("/signup")
def signup(user: UserSignup):
    conn = create_connection()
    cursor = conn.cursor()
    salt = generate_salt()
    hashed_password = get_password_hash(user.password, salt)
    
    try:
        cursor.execute("""
            INSERT INTO users (username, first_name, last_name, password, salt)
            VALUES (?, ?, ?, ?, ?);
        """, (user.username, user.first_name, user.last_name, hashed_password, salt))
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Username already exists")
    finally:
        conn.close()

    return {"message": "User created successfully"}

@app.post("/login")
def login(user: UserLogin):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT password, salt FROM users WHERE username = ?", (user.username,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    hashed_password, salt = row
    if not verify_password(user.password, hashed_password, salt):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # Generate JWT
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/history")
def history(credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token: no username")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    conn = create_connection()
    cursor = conn.cursor()

    # Get user_id
    cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
    user_row = cursor.fetchone()
    if not user_row:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user_row[0]

    cursor.execute("SELECT * FROM histories WHERE user_id = ?", (user_id,))
    rows = cursor.fetchall()
    conn.close()

    history_list = [
        {
            "id": row[0],
            "emotion": row[1],
            "image": row[2].hex() if row[2] else None,
            "date": row[3]
        }
        for row in rows
    ]

    return {"histories": history_list}

@app.get("/users")
def get_all_users():
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, first_name, last_name FROM users")
    users = cursor.fetchall()
    conn.close()

    return [
        {
            "id": row[0],
            "username": row[1],
            "first_name": row[2],   
            "last_name": row[3],
        }
        for row in users
    ]

@app.post("/upload/")
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token: no username")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    async with aiofiles.open(f"uploads/{file.filename}", "wb") as out_file:
        content = await file.read()
        await out_file.write(content)

    conn = create_connection()
    cursor = conn.cursor()

    # Fetch user ID from username
    cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
    user_row = cursor.fetchone()
    if not user_row:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user_row[0]

    # Insert image with user_id
    egypt_tz = pytz.timezone("Africa/Cairo")
    current_time = datetime.now(egypt_tz).strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
        INSERT INTO histories (image, emotion, user_id, date)
        VALUES (?, ?, ?, ?)
    """, (content, "Sad", user_id, current_time))

    conn.commit()
    conn.close()

    return {"filename": file.filename, "status": "stored as BLOB", "user_id": user_id}

@app.delete("/users/{username}")
def delete_user(username: str):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE username = ?", (username,))
    conn.commit()
    conn.close()
    return {"message": f"User '{username}' deleted successfully."}

model = load_model("../model/face_model.h5")
label_dict = {
    0: 'Angry', 1: 'Disgusted', 2: 'Fear',
    3: 'Happy', 4: 'Sad', 5: 'Surprise', 6: 'Neutral'
}

@app.post("/analyze-image/")
async def analyze_image(
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token: no username")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    contents = await file.read()

    # Save file to disk
    async with aiofiles.open(f"{UPLOAD_DIR}/{file.filename}", "wb") as out_file:
        await out_file.write(contents)

    # Predict emotion
    img = image.load_img(io.BytesIO(contents), target_size=(48, 48), color_mode='grayscale')
    img_array = np.array(img).reshape(1, 48, 48, 1)
    result = model.predict(img_array)[0]
    emotion_index = int(np.argmax(result))
    emotion = label_dict[emotion_index]
    confidence = float(result[emotion_index])

    # Store in database
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
    user_row = cursor.fetchone()
    if not user_row:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user_row[0]

    egypt_tz = pytz.timezone("Africa/Cairo")
    current_time = datetime.now(egypt_tz).strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""INSERT INTO histories (image, emotion, user_id, date)
                      VALUES (?, ?, ?, ?)""",
                   (contents, emotion, user_id, current_time))

    conn.commit()
    conn.close()

    return {
        "filename": file.filename,
        "emotion": emotion,
        "confidence": confidence,
        "status": "stored as BLOB",
        "user_id": user_id
    }

