# دليل رفع مشروع Cinnamon Basbosa على سيرفر Hetzner (Ubuntu + PostgreSQL)

هذا الدليل يشرح كيفية رفع وتشغيل تطبيق Next.js مع قاعدة بيانات PostgreSQL على سيرفر VPS من Hetzner.

## 1. إنشاء السيرفر (Hetzner Console)
1. في مشروع **Cinnamon Basbosa**، اضغط على **Add Server**.
2. **Location**: اختر الموقع (مثلاً في أوروبا).
3. **Image**: اختر **Ubuntu 24.04**.
4. **Type**: الـنوع **CX22** كافية للبداية.
5. اضغط **Create & Buy**.

## 2. الدخول للسيرفر وتجهيز البيئة
افتح التيرمينال في جهازك واتصل بالسيرفر:
```bash
ssh root@YOUR_SERVER_IP
# أدخل كلمة المرور إذا طُلبت
```

### أ. تحديث النظام وتثبيت Node.js
```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# تثبيت أدوات التشغيل
sudo npm install -g pm2
```

### ب. تثبيت وإعداد قاعدة بيانات PostgreSQL
```bash
# تثبيت Postgres
sudo apt install -y postgresql postgresql-contrib

# تشغيل الخدمة
sudo systemctl start postgresql
sudo systemctl enable postgresql

# الدخول لسطر أوامر Postgres
sudo -u postgres psql
```

الآن داخل شاشة `postgres=#`، نفذ الأوامر التالية (غير كلمة السر 'StrongPass123' بشيء قوي):
```sql
CREATE DATABASE cinnamon_db;
CREATE USER admin WITH ENCRYPTED PASSWORD 'StrongPass123';
GRANT ALL PRIVILEGES ON DATABASE cinnamon_db TO admin;
ALTER DATABASE cinnamon_db OWNER TO admin;
\q
```
*(تم الخروج من Postgres)*

**رابط الاتصال الخاص بك أصبح:**
`postgresql://admin:StrongPass123@localhost:5432/cinnamon_db?schema=public`
*(احتفظ بهذا الرابط لأننا سنضعه في ملف .env)*

## 3. نقل ملفات المشروع
### طريقة FileZilla:
1. اتصل بالسيرفر (SFTP) ببيانات الـ root.
2. اذهب للمسار `/var/www` وأنشئ مجلداً باسم `cinnamon-basbosa`.
3. انسخ ملفات مشروعك من جهازك إلى هذا المجلد **ما عدا**:
    - `node_modules`
    - `.next`
    - `.git`
    - `dev.db` (لا نحتاجه)
4. **مهم جداً:** أنشئ ملفاً جديداً داخل المجلد في السيرفر باسم `.env` وضع فيه الرابط:
   ```env
   DATABASE_URL="postgresql://admin:StrongPass123@localhost:5432/cinnamon_db?schema=public"
   ```

## 4. تشغيل المشروع
ارجع للـ Terminal (SSH) وانتقل للمجلد:
```bash
cd /var/www/cinnamon-basbosa

# 1. تثبيت المكاتب
npm install

# 2. توليد عميل Prisma (لـ Postgres)
npx prisma generate

# 3. إنشاء الجداول في قاعدة البيانات الجديدة
npx prisma migrate deploying

# 4. (اختياري) تعبئة بيانات أولية
npx prisma db seed

# 5. بناء نسخة الإنتاج
npm run build

# 6. تشغيل الموقع
pm2 start npm --name "basbosa" -- start
pm2 save
pm2 startup
```

## 5. إعداد Nginx (لربط الدومين)
تثبيت Nginx:
```bash
sudo apt install -y nginx
```

إنشاء ملف الإعدادات:
```bash
sudo nano /etc/nginx/sites-available/basbosa
```

ألصق المحتوى التالي (عدل `YOUR_DOMAIN` بدومينك):
```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN.com www.YOUR_DOMAIN.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
احفظ بـ `Ctrl+X` ثم `Y`.

تفعيل الموقع:
```bash
sudo ln -s /etc/nginx/sites-available/basbosa /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## 6. تفعيل الحماية SSL (HTTPS)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d YOUR_DOMAIN.com
```

---
**مبروك!** موقعك الآن يعمل على سيرفرك الخاص مع قاعدة بيانات PostgreSQL قوية. 🚀
