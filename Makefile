.PHONY: test test-backend test-frontend test-e2e

test: test-backend test-frontend

test-backend:
	cd pymail-api && python -m pytest -q

test-frontend:
	cd pymail-webapp && npm run test:run

test-e2e:
	cd pymail-webapp && npm run test:e2e