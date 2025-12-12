

# THREE-TIER-DevOps-Project

Multi‑tier demo application containerized with Docker, orchestrated with Docker Compose, and deployed to a Kubernetes cluster (kubeadm on AWS). The app is a CRUD tutorial manager built with Angular frontend, Node/Express backend, MongoDB database, Redis cache, and Nginx reverse proxy. 

***

## Architecture

**Services**

- `frontend`: Angular app built to static files and served by Nginx.   
- `api`: Node.js + Express REST API (tutorials CRUD) talking to MongoDB.   
- `mongodb`: MongoDB 6 database for tutorial data.   
- `redis`: Redis 7 (alpine) cache for the backend.   
- `reverse-proxy`: Nginx reverse proxy routing `"/"` to `frontend` and `"/api/"` to `api`. 

**Key technologies**

- Docker, multi‑stage builds with small alpine images.   
- Docker Compose for local multi‑service orchestration.   
- Kubernetes (kubeadm cluster on AWS) with Deployments, Services, ConfigMap, Secret, PVC. 

***

## Local development with Docker Compose

### Prerequisites

- Docker Engine and Docker Compose installed.  
- Clone the repo:

```bash
git clone https://github.com/Ajay6-six/THREE-TIER-DEVOPS-PROJECT.git
cd softify
```

### 1. Environment file

Create `.env` in the project root:

```env
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=example
MONGO_INITDB_DATABASE=bezkoder_db

MONGODB_URI=mongodb://root:example@mongodb:27017/bezkoder_db?authSource=admin
NODE_ENV=production
REDIS_HOST=redis
REDIS_PORT=6379
```



### 2. Build and run

From the project root:

```bash
docker compose down -v
docker compose up --build
```

This starts:

- `frontend` on port 80  
- `api` on port 8080  
- `mongodb` on port 27017  
- `redis` on port 6379  
- `reverse-proxy` on port 80 (entrypoint) 

### 3. Test

- Frontend: `http://localhost/`  
- API direct: `http://localhost:8080/api/tutorials`  
- Through proxy: `http://localhost/api/tutorials` 

Health checks are defined in `docker-compose.yml` for api, mongodb, redis, and reverse‑proxy. 

***

## Dockerfiles (summary)

- `backend/Dockerfile`  
  - Multi‑stage Node 20 alpine image, installs dependencies, exposes port 8080, runs `server.js`.   
- `frontend/Dockerfile`  
  - Build stage: Node 20 alpine, `npm install` and `ng build --configuration production`.  
  - Runtime stage: `nginx:alpine` serving `dist/angular-15-crud` with custom `nginx.conf` that proxies `/api/` to `api:8080`. 

MongoDB and Redis use official images in Compose and Kubernetes manifests. 

***

## Kubernetes deployment (kubeadm / Minikube / Kind)

The `k8s/` directory contains manifests for a `simplyfi` namespace: 

- `mongo-config.yaml` – ConfigMap with `MONGODB_URI`, DB name, host, port.  
- `mongo-secret.yaml` – Secret with base64‑encoded Mongo root username/password.  
- `mongo-pvc.yaml` – PVC definition for Mongo data (for simple cluster this may be paired with `emptyDir` in Deployment).  
- `mongo-deploy.yaml` – MongoDB Deployment + ClusterIP Service.  
- `api-deploy.yaml` – API Deployment + ClusterIP Service using image `arun101010/softify-api:latest`.  
- `frontend-deploy.yaml` – Frontend Deployment + ClusterIP Service using image `arun101010/softify-frontend:latest`.  
- `redis-deploy.yaml` – Redis Deployment + ClusterIP Service.  
- `reverse-proxy-config.yaml` – ConfigMap with Nginx reverse‑proxy `default.conf`.  
- `reverse-proxy-deploy.yaml` – Reverse‑proxy Deployment + NodePort Service (port `30080`). 

### 1. Apply manifests

```bash
kubectl create namespace simplyfi

kubectl apply -n simplyfi -f k8s/mongo-config.yaml
kubectl apply -n simplyfi -f k8s/mongo-secret.yaml
kubectl apply -n simplyfi -f k8s/mongo-pvc.yaml
kubectl apply -n simplyfi -f k8s/mongo-deploy.yaml

kubectl apply -n simplyfi -f k8s/api-deploy.yaml
kubectl apply -n simplyfi -f k8s/redis-deploy.yaml
kubectl apply -n simplyfi -f k8s/frontend-deploy.yaml
kubectl apply -n simplyfi -f k8s/reverse-proxy-config.yaml
kubectl apply -n simplyfi -f k8s/reverse-proxy-deploy.yaml
```

Check resources:

```bash
kubectl get pods,svc,pvc -n simplyfi
```

All Pods should be `Running`. 

### 2. Access the app

- For kubeadm on AWS: open security group for NodePort `30080` and browse to:

```text
http://<worker-node-public-ip>:30080/
http://<worker-node-public-ip>:30080/api/tutorials
```



