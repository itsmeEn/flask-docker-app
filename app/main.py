from flask import Flask, request, jsonify
from flask_cors import CORS
from functools import wraps
import jwt
import os
from models import User, Item

app = Flask(__name__)
CORS(app)

# JWT middleware
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, os.environ.get('JWT_SECRET_KEY'), algorithms=["HS256"])
            current_user = data['user_id']
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/')
def home():
    return jsonify({"message": "Flask App is running!"})

@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400
    
    user_id, error = User.create(email, password)
    if error:
        return jsonify({'message': error}), 400
    
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400
    
    token, error = User.authenticate(email, password)
    if error:
        return jsonify({'message': error}), 401
    
    return jsonify({'token': token}), 200

@app.route('/items', methods=['GET'])
@token_required
def read_items(current_user):
    return jsonify(Item.get_all())

@app.route('/items', methods=['POST'])
@token_required
def create_item(current_user):
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({'message': 'Item name is required'}), 400
    return jsonify(Item.create(data['name']))

@app.route('/items/<item_id>', methods=['DELETE'])
@token_required
def delete_item_route(current_user, item_id):
    return jsonify(Item.delete(item_id))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)