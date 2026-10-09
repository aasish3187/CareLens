.PHONY: all test e2e build run clean eval

all: build test

test:
	python -m pytest backend/tests/ -v

e2e:
	python backend/tests/run_tests.py
	python -c "import urllib.request; print('Health check:', urllib.request.urlopen('http://localhost:8000/api/health').status)"

build:
	cd frontend && npm run build

run:
	python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

clean:
	python -c "import shutil, os; [shutil.rmtree(p, ignore_errors=True) for p in ['__pycache__', '.pytest_cache', 'backend/app/__pycache__', 'backend/tests/__pycache__']]"
