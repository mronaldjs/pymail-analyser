.PHONY: test test-backend test-frontend test-e2e openapi gen-types

test: test-backend test-frontend

test-backend:
	cd pymail-api && python -m pytest -q

test-frontend:
	cd pymail-webapp && npm run test:run

test-e2e:
	cd pymail-webapp && npm run test:e2e

# Dump the FastAPI OpenAPI schema to pymail-webapp/openapi.json (source of truth
# for the generated TS types). Requires the backend deps to be importable.
openapi:
	cd pymail-api && python -c "import json, main; open('../pymail-webapp/openapi.json','wb').write((json.dumps(main.app.openapi(), indent=2, ensure_ascii=False) + '\n').encode('utf-8'))"

# Regenerate the frontend API types from the committed openapi.json.
gen-types: openapi
	cd pymail-webapp && npm run gen:types