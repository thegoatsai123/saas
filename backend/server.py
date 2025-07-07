from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
import os
from datetime import datetime, timedelta
import jwt
import bcrypt
from pymongo import MongoClient
import uuid
from openai import OpenAI
import json
import re

# Initialize FastAPI app
app = FastAPI(title="SaaS Blueprint Generator API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB setup
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/saas_blueprint")
client = MongoClient(MONGO_URL)
db = client.saas_blueprint

# Collections
users_collection = db.users
projects_collection = db.projects
tasks_collection = db.tasks
flows_collection = db.flows

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# OpenAI setup
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

# Security
security = HTTPBearer()

# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class ProjectCreate(BaseModel):
    title: str
    description: str

class TaskCreate(BaseModel):
    title: str
    description: str
    priority: str = "Medium"

class TaskUpdate(BaseModel):
    status: str

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        user = users_collection.find_one({"email": email})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

def analyze_idea_with_ai(idea_description: str):
    """Analyze SaaS idea using OpenAI API or mock analysis"""
    if openai_client and OPENAI_API_KEY:
        try:
            response = openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert SaaS consultant. Analyze the given SaaS idea and provide feedback on Market Need (1-10), Technical Feasibility (1-10), and User Value (1-10). Also provide constructive feedback and suggestions."},
                    {"role": "user", "content": f"Please analyze this SaaS idea: {idea_description}"}
                ],
                max_tokens=500,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI API error: {e}")
            return generate_mock_analysis(idea_description)
    else:
        return generate_mock_analysis(idea_description)

def generate_mock_analysis(idea_description: str):
    """Generate mock AI analysis for demonstration purposes"""
    word_count = len(idea_description.split())
    
    # Simple scoring based on description length and keywords
    market_need = min(10, max(3, word_count // 10))
    technical_feasibility = min(10, max(4, 8 - len(re.findall(r'AI|blockchain|machine learning|neural network', idea_description.lower()))))
    user_value = min(10, max(3, word_count // 15))
    
    return {
        "market_need": market_need,
        "technical_feasibility": technical_feasibility,
        "user_value": user_value,
        "feedback": f"Your SaaS idea shows promise. Market need score: {market_need}/10 - Consider validating with potential users. Technical feasibility: {technical_feasibility}/10 - This appears technically achievable. User value: {user_value}/10 - Focus on clearly defining the value proposition.",
        "suggestions": [
            "Validate your idea with potential customers",
            "Create a minimum viable product (MVP)",
            "Research your competition",
            "Define clear user personas",
            "Plan your monetization strategy"
        ]
    }

def extract_features_from_idea(idea_description: str):
    """Extract core features from SaaS idea description"""
    # Simple feature extraction (can be enhanced with NLP)
    features = []
    
    # Common SaaS features based on keywords
    feature_keywords = {
        "user management": ["user", "account", "profile", "login", "registration"],
        "dashboard": ["dashboard", "overview", "analytics", "metrics"],
        "data management": ["data", "database", "storage", "information"],
        "reporting": ["report", "analytics", "insights", "charts"],
        "notifications": ["notification", "alert", "email", "message"],
        "api integration": ["api", "integration", "connect", "sync"],
        "mobile app": ["mobile", "app", "ios", "android"],
        "payment system": ["payment", "billing", "subscription", "pricing"]
    }
    
    text_lower = idea_description.lower()
    for feature, keywords in feature_keywords.items():
        if any(keyword in text_lower for keyword in keywords):
            features.append(feature)
    
    # Always include basic features
    if "user management" not in features:
        features.append("user management")
    if "dashboard" not in features:
        features.append("dashboard")
    
    return features[:6]  # Limit to 6 features

def convert_features_to_tasks(features: List[str]):
    """Convert features to development tasks"""
    task_templates = {
        "user management": [
            {"title": "Implement user registration", "description": "Create user signup form and backend validation", "priority": "High"},
            {"title": "Build login system", "description": "Implement secure user authentication", "priority": "High"},
            {"title": "User profile management", "description": "Allow users to update their profiles", "priority": "Medium"}
        ],
        "dashboard": [
            {"title": "Create main dashboard", "description": "Build overview page with key metrics", "priority": "High"},
            {"title": "Add data visualization", "description": "Implement charts and graphs for data", "priority": "Medium"}
        ],
        "data management": [
            {"title": "Design database schema", "description": "Create efficient data structure", "priority": "High"},
            {"title": "Implement CRUD operations", "description": "Create, read, update, delete functionality", "priority": "High"}
        ],
        "reporting": [
            {"title": "Build reporting system", "description": "Generate automated reports", "priority": "Medium"},
            {"title": "Export functionality", "description": "Allow users to export data", "priority": "Low"}
        ],
        "notifications": [
            {"title": "Email notification system", "description": "Send automated emails to users", "priority": "Medium"},
            {"title": "In-app notifications", "description": "Real-time notifications in application", "priority": "Low"}
        ],
        "api integration": [
            {"title": "REST API development", "description": "Create robust API endpoints", "priority": "High"},
            {"title": "Third-party integrations", "description": "Connect with external services", "priority": "Medium"}
        ],
        "mobile app": [
            {"title": "Mobile app development", "description": "Create mobile application", "priority": "Low"},
            {"title": "Responsive design", "description": "Make web app mobile-friendly", "priority": "Medium"}
        ],
        "payment system": [
            {"title": "Payment integration", "description": "Integrate payment gateway", "priority": "High"},
            {"title": "Subscription management", "description": "Handle recurring payments", "priority": "Medium"}
        ]
    }
    
    tasks = []
    for feature in features:
        if feature in task_templates:
            tasks.extend(task_templates[feature])
    
    return tasks

# API Routes
@app.get("/")
async def root():
    return {"message": "SaaS Blueprint Generator API", "version": "1.0.0"}

@app.post("/api/register")
async def register_user(user: UserCreate):
    # Check if user exists
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password and create user
    hashed_password = hash_password(user.password)
    user_id = str(uuid.uuid4())
    
    user_doc = {
        "id": user_id,
        "username": user.username,
        "email": user.email,
        "password_hash": hashed_password,
        "created_at": datetime.utcnow()
    }
    
    users_collection.insert_one(user_doc)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "username": user.username,
            "email": user.email
        }
    }

@app.post("/api/login")
async def login_user(user: UserLogin):
    # Find user
    db_user = users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user["id"],
            "username": db_user["username"],
            "email": db_user["email"]
        }
    }

@app.get("/api/user/profile")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "username": current_user["username"],
        "email": current_user["email"]
    }

@app.post("/api/projects")
async def create_project(project: ProjectCreate, current_user: dict = Depends(get_current_user)):
    # Analyze idea with AI
    analysis = analyze_idea_with_ai(project.description)
    
    # Extract features and convert to tasks
    features = extract_features_from_idea(project.description)
    tasks = convert_features_to_tasks(features)
    
    # Create project
    project_id = str(uuid.uuid4())
    project_doc = {
        "id": project_id,
        "user_id": current_user["id"],
        "title": project.title,
        "description": project.description,
        "validation_scores": analysis if isinstance(analysis, dict) else {},
        "features": features,
        "status": "active",
        "created_at": datetime.utcnow()
    }
    
    projects_collection.insert_one(project_doc)
    
    # Create tasks for the project
    for task in tasks:
        task_id = str(uuid.uuid4())
        task_doc = {
            "id": task_id,
            "project_id": project_id,
            "title": task["title"],
            "description": task["description"],
            "priority": task["priority"],
            "status": "To Do",
            "created_at": datetime.utcnow()
        }
        tasks_collection.insert_one(task_doc)
    
    return {
        "project": {
            "id": project_doc["id"],
            "user_id": project_doc["user_id"],
            "title": project_doc["title"],
            "description": project_doc["description"],
            "validation_scores": project_doc["validation_scores"],
            "features": project_doc["features"],
            "status": project_doc["status"],
            "created_at": project_doc["created_at"].isoformat()
        },
        "analysis": analysis,
        "tasks_created": len(tasks)
    }

@app.get("/api/projects")
async def get_user_projects(current_user: dict = Depends(get_current_user)):
    projects = list(projects_collection.find({"user_id": current_user["id"]}))
    
    # Add task counts to each project
    for project in projects:
        task_count = tasks_collection.count_documents({"project_id": project["id"]})
        completed_tasks = tasks_collection.count_documents({"project_id": project["id"], "status": "Done"})
        project["task_count"] = task_count
        project["completed_tasks"] = completed_tasks
        project["progress"] = (completed_tasks / task_count * 100) if task_count > 0 else 0
        
        # Remove MongoDB _id field and convert datetime
        project.pop("_id", None)
        if "created_at" in project:
            project["created_at"] = project["created_at"].isoformat()
    
    return {"projects": projects}

@app.get("/api/projects/{project_id}")
async def get_project(project_id: str, current_user: dict = Depends(get_current_user)):
    project = projects_collection.find_one({"id": project_id, "user_id": current_user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get project tasks
    tasks = list(tasks_collection.find({"project_id": project_id}))
    for task in tasks:
        task.pop("_id", None)
        if "created_at" in task:
            task["created_at"] = task["created_at"].isoformat()
    
    project.pop("_id", None)
    if "created_at" in project:
        project["created_at"] = project["created_at"].isoformat()
    project["tasks"] = tasks
    
    return {"project": project}

@app.get("/api/projects/{project_id}/tasks")
async def get_project_tasks(project_id: str, current_user: dict = Depends(get_current_user)):
    # Verify project ownership
    project = projects_collection.find_one({"id": project_id, "user_id": current_user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    tasks = list(tasks_collection.find({"project_id": project_id}))
    for task in tasks:
        task.pop("_id", None)
    
    return {"tasks": tasks}

@app.post("/api/projects/{project_id}/tasks")
async def create_task(project_id: str, task: TaskCreate, current_user: dict = Depends(get_current_user)):
    # Verify project ownership
    project = projects_collection.find_one({"id": project_id, "user_id": current_user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    task_id = str(uuid.uuid4())
    task_doc = {
        "id": task_id,
        "project_id": project_id,
        "title": task.title,
        "description": task.description,
        "priority": task.priority,
        "status": "To Do",
        "created_at": datetime.utcnow()
    }
    
    tasks_collection.insert_one(task_doc)
    task_doc.pop("_id", None)
    
    return {"task": task_doc}

@app.put("/api/tasks/{task_id}")
async def update_task(task_id: str, task_update: TaskUpdate, current_user: dict = Depends(get_current_user)):
    # Find task and verify ownership through project
    task = tasks_collection.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    project = projects_collection.find_one({"id": task["project_id"], "user_id": current_user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Update task
    tasks_collection.update_one(
        {"id": task_id},
        {"$set": {"status": task_update.status}}
    )
    
    # Get updated task
    updated_task = tasks_collection.find_one({"id": task_id})
    updated_task.pop("_id", None)
    
    return {"task": updated_task}

@app.get("/api/projects/{project_id}/flow")
async def get_project_flow(project_id: str, current_user: dict = Depends(get_current_user)):
    # Verify project ownership
    project = projects_collection.find_one({"id": project_id, "user_id": current_user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Generate basic user flow based on project features
    features = project.get("features", [])
    flow_steps = []
    
    # Basic flow steps
    flow_steps.append("User Registration/Login")
    
    if "dashboard" in features:
        flow_steps.append("Dashboard Overview")
    
    if "data management" in features:
        flow_steps.append("Data Input/Management")
    
    if "reporting" in features:
        flow_steps.append("View Reports/Analytics")
    
    if "notifications" in features:
        flow_steps.append("Receive Notifications")
    
    flow_steps.append("User Settings/Profile")
    
    # Create flow description
    flow_description = " → ".join(flow_steps)
    
    return {
        "flow_steps": flow_steps,
        "flow_description": flow_description,
        "pages_needed": [
            "Landing Page",
            "Login/Register Page",
            "Dashboard",
            "Settings Page"
        ] + [f"{feature.title()} Page" for feature in features[:3]]
    }

@app.get("/api/assistant/suggestion")
async def get_ai_suggestion(current_user: dict = Depends(get_current_user)):
    # Get user's latest project
    latest_project = projects_collection.find_one(
        {"user_id": current_user["id"]},
        sort=[("created_at", -1)]
    )
    
    if not latest_project:
        return {"suggestion": "Start by creating your first SaaS project! Click 'New Project' to begin."}
    
    # Get task statistics
    total_tasks = tasks_collection.count_documents({"project_id": latest_project["id"]})
    completed_tasks = tasks_collection.count_documents({"project_id": latest_project["id"], "status": "Done"})
    in_progress_tasks = tasks_collection.count_documents({"project_id": latest_project["id"], "status": "In Progress"})
    
    # Generate suggestion based on progress
    if completed_tasks == 0:
        suggestion = "Great start! Begin by marking your first task as 'In Progress' to build momentum."
    elif completed_tasks < total_tasks * 0.3:
        suggestion = "Keep going! Focus on completing high-priority tasks first to see quick wins."
    elif completed_tasks < total_tasks * 0.7:
        suggestion = "You're making good progress! Consider adding more detailed tasks for better project tracking."
    else:
        suggestion = "Excellent work! You're almost done. Focus on the remaining tasks to complete your project."
    
    return {
        "suggestion": suggestion,
        "project_progress": (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
        "next_steps": [
            "Review your task priorities",
            "Update task statuses",
            "Add new tasks if needed",
            "Celebrate your progress!"
        ]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)