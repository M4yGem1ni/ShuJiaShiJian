#!/usr/bin/env bash
set -e

echo "============================================"
echo "  浙江数字公益扶贫平台 - 发布打包"
echo "============================================"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

RELEASE_DIR="shujiashijian-release"
OUTPUT="shujiashijian-release.tar.gz"

# Step 1: Build frontend
echo "[1/7] Building frontend..."
cd frontend
npm run build
cd ..

# Step 2: Copy frontend build to backend
echo "[2/7] Copying frontend build to backend..."
mkdir -p backend/public
cp -r frontend/dist/* backend/public/

# Step 3: Install backend deps & generate Prisma client
echo "[3/7] Installing backend dependencies..."
cd backend
npm install --silent
npx prisma generate
cd ..

# Step 4: Build backend
echo "[4/7] Building backend..."
cd backend
npm run build
cd ..

# Step 5: Initialize database & seed
echo "[5/7] Initializing database..."
cd backend
cp .env.example .env 2>/dev/null || true
npx prisma db push
node --import tsx prisma/seed.ts
cd ..

# Step 6: Assemble release package
echo "[6/7] Assembling release package..."
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"

cp -r backend/dist "$RELEASE_DIR/server"
cp -r backend/public "$RELEASE_DIR/public"
cp -r backend/prisma "$RELEASE_DIR/prisma"
cp -r backend/node_modules "$RELEASE_DIR/node_modules"
cp backend/package.json "$RELEASE_DIR/"
cp backend/.env.example "$RELEASE_DIR/.env"
cp README.md "$RELEASE_DIR/" 2>/dev/null || true

# Create start.sh
cat > "$RELEASE_DIR/start.sh" << 'STARTEND'
#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
echo "============================================"
echo "  浙江数字公益扶贫平台"
echo "============================================"
if [ ! -f .env ]; then
  cp .env.example .env
fi
echo "Starting server..."
NODE_ENV=production node server/app.js
STARTEND
chmod +x "$RELEASE_DIR/start.sh"

# Step 7: Package
echo "[7/7] Creating tarball..."
tar -czf "$OUTPUT" "$RELEASE_DIR/"
rm -rf "$RELEASE_DIR"

echo "============================================"
echo "  Done! Release package: $OUTPUT"
echo "============================================"
echo ""
echo "Quick start:"
echo "  tar -xzf $OUTPUT"
echo "  cd $RELEASE_DIR && ./start.sh"
