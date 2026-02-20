#!/bin/bash
set -e

echo "Starting Server Fix..."
cd /var/www/cinnamon-basbosa

# 1. Update .env to absolute path for reliability
# Check if .env exists, if not create it
if [ ! -f .env ]; then
    echo "Creating .env..."
    echo 'DATABASE_URL="file:/var/www/cinnamon-basbosa/dev.db"' > .env
else
    # Replace or append
    if grep -q "DATABASE_URL" .env; then
        sed -i 's|DATABASE_URL=.*|DATABASE_URL="file:/var/www/cinnamon-basbosa/dev.db"|g' .env
    else
        echo 'DATABASE_URL="file:/var/www/cinnamon-basbosa/dev.db"' >> .env
    fi
fi

echo "Updated .env"

# 2. Permissions
echo "Fixing permissions..."
# Ensure web server can write to db and uploads
chown -R root:root .
chmod -R 755 .
chmod -R 777 public/uploads
chmod -R 777 public/gallery
chmod 666 dev.db
# SQLite needs write permission on the folder to create WAL/lock files
chmod 777 . 

# 3. Dependencies
echo "Installing dependencies..."
# Force install specific versions to match local as much as possible and ensure sqlite support
rm -rf node_modules package-lock.json
npm install
npm uninstall @prisma/client prisma
npm install prisma@5.22.0 @prisma/client@5.22.0
# Ensure better-sqlite3 is present (often needed for sqlite in node)
npm install better-sqlite3

# 4. Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# 5. Build
echo "Building project..."
npm run build

# 6. Restart
echo "Restarting PM2..."
pm2 restart basbosa || pm2 start npm --name "basbosa" -- start
pm2 save

echo "Fix Complete! Server should be up."
