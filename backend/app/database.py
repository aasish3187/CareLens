import os
from datetime import date
from pathlib import Path
from sqlmodel import SQLModel, create_engine, Session, select
from backend.app.models.database import Person, Document, Observation, Medication, Condition

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DB_PATH = BASE_DIR / "carelens.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Connect args for SQLite
connect_args = {"check_same_thread": False}
engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)

def init_db():
    """Initializes tables and seeds default patient if none exists."""
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        statement = select(Person)
        existing = session.exec(statement).first()
        if not existing:
            default_person = Person(
                display_name="Arjun Verma",
                dob=date(1982, 8, 14),
                sex="male",
                abha_number="91-2345-6789-0123",
                abha_address="arjun.verma@abdm"
            )
            session.add(default_person)
            session.commit()
            session.refresh(default_person)
            return default_person
        return existing

def get_session():
    """Dependency for obtaining database sessions."""
    with Session(engine) as session:
        yield session
