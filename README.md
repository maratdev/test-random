# Рекомендуемые системные требования

- Docker Compose version v2.38.2
- Docker version 28.3.2, build 578ccf6
- Node.js v22.17.1
- Ubuntu 24.04.2 LTS

**Порты по умолчанию:**
- backend: http://localhost:3001
- frontend: http://localhost:8080

---

# Подготовка переменных окружения

Перед запуском переименуйте файл `.env.example` в `.env` в корне и в папке frontend:

```sh
cp .env.example в .env
cp frontend/.env.example в frontend/.env
```
---

# Запуск backend в production

1. **Соберите контейнер и запустите docker:**
   ```sh
   docker compose up --build -d
   ```