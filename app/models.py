from pymongo import MongoClient
import os
from bson import ObjectId
import bcrypt
import jwt
from datetime import datetime, timedelta

# Initialize MongoDB connection
uri = os.environ.get("MONGO_URI")
if not uri:
    username = os.environ.get("MONGO_ROOT_USERNAME", "admin")
    password = os.environ.get("MONGO_ROOT_PASSWORD", "secret")
    uri = f"mongodb://{username}:{password}@mongo:27017/"

client = MongoClient(uri)
db = client["FlaskDB"]

class User:
    @staticmethod
    def create(email, password):
        # Check if user already exists
        if db.users.find_one({"email": email}):
            return None, "User already exists"
        
        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Create user
        user = {
            "email": email,
            "password": hashed_password,
            "created_at": datetime.utcnow()
        }
        
        result = db.users.insert_one(user)
        return str(result.inserted_id), None

    @staticmethod
    def authenticate(email, password):
        user = db.users.find_one({"email": email})
        if not user:
            return None, "User not found"
        
        if not bcrypt.checkpw(password.encode('utf-8'), user['password']):
            return None, "Invalid password"
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': str(user['_id']),
            'exp': datetime.utcnow() + timedelta(days=1)
        }, os.environ.get('JWT_SECRET_KEY'), algorithm='HS256')
        
        return token, None

class Item:
    @staticmethod
    def get_all():
        return [{"_id": str(doc['_id']), "name": doc["name"]} for doc in db.items.find()]

    @staticmethod
    def create(name):
        result = db.items.insert_one({"name": name})
        return {"inserted_id": str(result.inserted_id)}

    @staticmethod
    def delete(item_id):
        db.items.delete_one({'_id': ObjectId(item_id)})
        return {"status": "deleted"}
