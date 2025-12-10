FROM node:20-alpine

WORKDIR /app

# 패키지 파일 복사 및 설치
COPY package*.json ./
RUN npm ci --only=production

# TypeScript 컴파일을 위한 devDependencies 설치
RUN npm install typescript @types/node @types/express @types/cors @types/pg

# 소스 코드 복사
COPY . .

# 빌드
RUN npm run build

# devDependencies 제거
RUN npm prune --production

# 포트 노출
EXPOSE 3001

# 실행
CMD ["node", "dist/server.js"]

