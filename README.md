# fire-relief


What your .env file should look like:

```
API_KEY=<>
AZURE_OPENAI_ENDPOINT=https://fire-relief-project-api-key.openai.azure.com/
API_VERSION=2024-10-21
MODEL=gpt-4o-mini
DEV=True
```

Useful commands for backend
```
celery -A tasks.celery worker --loglevel=info
gunicorn --bind 0.0.0.0:5000 wsgi:app
```