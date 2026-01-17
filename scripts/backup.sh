

```bash
#!/bin/bash

# إعدادات النسخ الاحتياطي
BACKUP_DIR="/var/backups/engineering-library"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/backup_$DATE"

# ألوان للتنسيق
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN} بدء النسخ الاحتياطي: $DATE${NC}"

# إنشاء المجلد إذا لم يكن موجوداً
mkdir -p $BACKUP_PATH

# 1. نسخ قاعدة البيانات
echo -e "${YELLOW} نسخ قاعدة البيانات...${NC}"
mongodump --out $BACKUP_PATH/mongodb --db engineering_library

# 2. نسخ الملفات المرفوعة
echo -e "${YELLOW}نسخ الملفات المرفوعة...${NC}"
cp -r /var/www/engineering-library-red-sea/server/uploads $BACKUP_PATH/uploads 2>/dev/null || :

# 3. نسخ ملفات التطبيق
echo -e "${YELLOW} نسخ ملفات التطبيق...${NC}"
cp -r /var/www/engineering-library-red-sea/server $BACKUP_PATH/server
cp -r /var/www/engineering-library-red-sea/client/build $BACKUP_PATH/client 2>/dev/null || :

# 4. نسخ ملفات الإعداد
echo -e "${YELLOW} نسخ ملفات الإعداد...${NC}"
cp /var/www/engineering-library-red-sea/nginx.conf $BACKUP_PATH/
cp /var/www/engineering-library-red-sea/ecosystem.config.js $BACKUP_PATH/
cp /var/www/engineering-library-red-sea/server/.env $BACKUP_PATH/ 2>/dev/null || :

# 5. ضغط النسخة الاحتياطية
echo -e "${YELLOW} ضغط النسخة الاحتياطية...${NC}"
cd $BACKUP_DIR
tar -czf backup_$DATE.tar.gz backup_$DATE
rm -rf $BACKUP_PATH

# 6. حذف النسخ القديمة
echo -e "${YELLOW} تنظيف النسخ القديمة...${NC}"
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete

# 7. إظهار النتيجة
BACKUP_SIZE=$(du -h backup_$DATE.tar.gz | cut -f1)
echo -e "${GREEN} النسخ الاحتياطي اكتمل${NC}"
echo -e "   الحجم: $BACKUP_SIZE"
echo -e "   الموقع: $BACKUP_DIR/backup_$DATE.tar.gz"
echo -e "   التاريخ: $(date)"

# إضافة إلى سجل النسخ الاحتياطي
echo "$DATE - $BACKUP_SIZE - backup_$DATE.tar.gz" >> $BACKUP_DIR/backup.log
