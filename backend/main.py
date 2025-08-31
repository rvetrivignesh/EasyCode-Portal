from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import pandas as pd
import io
from typing import List

from database import engine, get_db, Base
from models import Student

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Student Data Management API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev server ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload-students")
async def upload_students(
    class_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload an Excel file containing student data and bulk insert into students table.
    
    Expected Excel columns: hallticket_no, name
    Additional parameter: class_id (provided as form data)
    """
    # Validate file type
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="File must be an Excel file (.xlsx or .xls)")
    
    try:
        # Read Excel file
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        # Validate required columns
        required_columns = ['hallticket_no', 'name']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required columns: {missing_columns}. Excel file must contain: {required_columns}"
            )
        
        # Clean and prepare data
        df = df.dropna(subset=required_columns)  # Remove rows with missing required data
        df['hallticket_no'] = df['hallticket_no'].astype(str).str.strip()
        df['name'] = df['name'].astype(str).str.strip()
        
        # Remove duplicates within the uploaded data
        df = df.drop_duplicates(subset=['hallticket_no'])
        
        if df.empty:
            raise HTTPException(status_code=400, detail="No valid student data found in the Excel file")
        
        # Prepare student objects for bulk insert
        students_to_insert = []
        for _, row in df.iterrows():
            student = Student(
                class_id=class_id,
                hallticket_no=row['hallticket_no'],
                name=row['name']
            )
            students_to_insert.append(student)
        
        # Bulk insert
        try:
            db.add_all(students_to_insert)
            db.commit()
            
            return JSONResponse(
                status_code=200,
                content={
                    "message": f"Successfully uploaded {len(students_to_insert)} students",
                    "class_id": class_id,
                    "students_count": len(students_to_insert)
                }
            )
        
        except IntegrityError as e:
            db.rollback()
            # Check if it's a duplicate hallticket_no issue
            if "UNIQUE constraint failed" in str(e) or "duplicate key" in str(e).lower():
                raise HTTPException(
                    status_code=400, 
                    detail="Duplicate hall ticket number found. Some students may already exist in the database."
                )
            else:
                raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
                
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="Excel file is empty")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/students")
async def get_students(class_id: str = None, db: Session = Depends(get_db)):
    """Get all students, optionally filtered by class_id"""
    query = db.query(Student)
    if class_id:
        query = query.filter(Student.class_id == class_id)
    
    students = query.all()
    return [
        {
            "id": student.id,
            "class_id": student.class_id,
            "hallticket_no": student.hallticket_no,
            "name": student.name
        }
        for student in students
    ]

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Student Data Management API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
