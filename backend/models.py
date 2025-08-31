from sqlalchemy import Column, Integer, String
from database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    class_id = Column(String, nullable=False, index=True)
    hallticket_no = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)

    def __repr__(self):
        return f"<Student(id={self.id}, class_id={self.class_id}, hallticket_no={self.hallticket_no}, name={self.name})>"
