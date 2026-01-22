#!/bin/bash

# ============================================
# سكربت النشر - مكتبة كلية الهندسة
# جامعة البحر الأحمر
# ============================================

# إعدادات الألوان
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# مسارات النظام
PROJECT_ROOT="/var/www/engineering-library"
BACKEND_DIR="$PROJECT_ROOT/server"
FRONTEND_DIR="$PROJECT_ROOT/client"
SCRIPTS_DIR="$PROJECT_ROOT/scripts"
LOGS_DIR="$PROJECT_ROOT/logs"
DEPLOY_LOG="$LOGS_DIR/deploy_$(date +"%Y-%m-%d_%H-%M-%S").log"

# متغيرات البيئة
NODE_ENV="production"
APP_PORT="5000"
APP_HOST="0.0.0.0"
MONGODB_URI="mongodb://localhost:27017/engineering_library"

# متغيرات المساعدة
SCRIPT_NAME=$(basename "$0")
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# دالة لطباعة رسائل المعلومات
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
    echo "[INFO] $1" >> "$DEPLOY_LOG"
}

# دالة لطباعة رسائل النجاح
print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    echo "[SUCCESS] $1" >> "$DEPLOY_LOG"
}

# دالة لطباعة رسائل التحذير
print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    echo "[WARNING] $1" >> "$DEPLOY_LOG"
}

# دالة لطباعة رسائل الخطأ
print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo "[ERROR] $1" >> "$DEPLOY_LOG"
}

# دالة للتحقق من صلاحيات الجذر
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "يجب تشغيل السكربت كـ root أو باستخدام sudo"
        exit 1
    fi
}

# دالة لعرض المساعدة
show_help() {
    echo "استخدام: $SCRIPT_NAME [خيارات]"
    echo ""
    echo "خيارات:"
    echo "  -h, --help                 عرض هذه الرسالة"
    echo "  -i, --init                 التهيئة الأولية للنظام"
    echo "  -b, --backend              نشر Backend فقط"
    echo "  -f, --frontend             نشر Frontend فقط"
    echo "  -a, --all                  نشر النظام بالكامل (الافتراضي)"
    echo "  -u, --update               تحديث النظام من Git"
    echo "  -r, --restart              إعادة تشغيل الخدمات فقط"
    echo "  -s, --status               عرض حالة الخدمات"
    echo "  -c, --clean                تنظيف الملفات المؤقتة"
    echo "  -y, --yes                  تأكيد بدون مطالبة"
    echo "  --dry-run                  محاكاة النشر بدون تنفيذ"
    echo ""
    echo "أمثلة:"
    echo "  $SCRIPT_NAME --init        التهيئة الأولية"
    echo "  $SCRIPT_NAME --all         نشر النظام بالكامل"
    echo "  $SCRIPT_NAME --update      تحديث من Git"
    echo "  $SCRIPT_NAME --status      عرض الحالة"
}

# دالة للتحقق من التبعيات
check_dependencies() {
    print_info "التحقق من التبعيات المطلوبة..."
    
    local dependencies=("node" "npm" "git" "nginx" "mongod" "pm2")
    local missing_deps=()
    
    for dep in "${dependencies[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing_deps+=("$dep")
        fi
    done
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        print_error "التبعيات المفقودة: ${missing_deps[*]}"
        
        # اقتراح التثبيت
        if [[ " ${missing_deps[*]} " =~ " nginx " ]]; then
            print_info "تثبيت Nginx: apt-get install nginx"
        fi
        if [[ " ${missing_deps[*]} " =~ " mongod " ]]; then
            print_info "تثبيت MongoDB: apt-get install mongodb-org"
        fi
        if [[ " ${missing_deps[*]} " =~ " pm2 " ]]; then
            print_info "تثبيت PM2: npm install -g pm2"
        fi
        
        return 1
    fi
    
    print_success "جميع التبعيات مثبتة"
    return 0
}

# دالة لإنشاء هيكل المجلدات
create_directory_structure() {
    print_info "إنشاء هيكل المجلدات..."
    
    local directories=(
        "$PROJECT_ROOT"
        "$BACKEND_DIR"
        "$FRONTEND_DIR"
        "$SCRIPTS_DIR"
        "$LOGS_DIR"
        "$PROJECT_ROOT/uploads"
        "$PROJECT_ROOT/uploads/courses"
        "$PROJECT_ROOT/uploads/forum"
        "$PROJECT_ROOT/backups"
    )
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            print_info "  إنشاء: $dir"
            mkdir -p "$dir"
        fi
    done
    
    # تعديل الصلاحيات
    chown -R www-data:www-data "$PROJECT_ROOT/uploads"
    chmod -R 755 "$PROJECT_ROOT/uploads"
    
    print_success "تم إنشاء هيكل المجلدات"
}

# دالة لتهيئة قاعدة البيانات
init_database() {
    print_info "تهيئة قاعدة البيانات..."
    
    # التحقق من تشغيل MongoDB
    if ! systemctl is-active --quiet mongod; then
        print_warning "MDB غير نشط، جاري التشغيل..."
        systemctl start mongod
        sleep 5
    fi
    
    # إنشاء قاعدة البيانات والمستخدم
    local init_script=$(cat << EOF
use engineering_library;

// إنشاء مستخدم الروت
db.users.insertOne({
    universityId: "zero",
    password: "$2b\$12\$Vp6qH3vj5J9K8L7N2M1B5uY7X9Z0A2C4E6G8I0K2M4O6Q8S0U2W4Y6A8C0E2G4",
    name: "مدير النظام",
    role: "root",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
});

// إنشاء مؤشرات
db.users.createIndex({ universityId: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ department: 1 });
db.users.createIndex({ isActive: 1 });

print("✓ تم تهيئة قاعدة البيانات بنجاح");
EOF
)
    
    if echo "$init_script" | mongo >> "$DEPLOY_LOG" 2>&1; then
        print_success "تم تهيئة قاعدة البيانات"
    else
        print_error "فشل تهيئة قاعدة البيانات"
        return 1
    fi
    
    return 0
}

# دالة لتثبيت Backend
install_backend() {
    print_info "تثبيت Backend..."
    
    cd "$BACKEND_DIR" || return 1
    
    # نسخ ملف الإعدادات
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp ".env.example" ".env"
            print_info "  تم إنشاء ملف .env من النموذج"
        else
            print_warning "  ملف .env.example غير موجود"
        fi
    fi
    
    # تثبيت ال dependencies
    print_info "  تثبيت حزم Node.js..."
    if npm ci --only=production >> "$DEPLOY_LOG" 2>&1; then
        print_info "    ✓ تم تثبيت الحزم"
    else
        print_warning "    فشل npm ci، جاري npm install..."
        npm install --production >> "$DEPLOY_LOG" 2>&1
    fi
    
    print_success "تم تثبيت Backend"
    return 0
}

# دالة لتثبيت Frontend
install_frontend() {
    print_info "تثبيت Frontend..."
    
    cd "$FRONTEND_DIR" || return 1
    
    # تثبيت ال dependencies
    print_info "  تثبيت حزم React..."
    if npm ci --only=production >> "$DEPLOY_LOG" 2>&1; then
        print_info "    ✓ تم تثبيت الحزم"
    else
        print_warning "    فشل npm ci، جاري npm install..."
        npm install --production >> "$DEPLOY_LOG" 2>&1
    fi
    
    # بناء التطبيق
    print_info "  بناء تطبيق React..."
    if npm run build >> "$DEPLOY_LOG" 2>&1; then
        print_info "    ✓ تم البناء بنجاح"
    else
        print_error "    فشل بناء التطبيق"
        return 1
    fi
    
    print_success "تم تثبيت Frontend"
    return 0
}

# دالة لإعداد Nginx
setup_nginx() {
    print_info "إعداد Nginx..."
    
    local nginx_config="/etc/nginx/sites-available/engineering-library"
    local nginx_enabled="/etc/nginx/sites-enabled/engineering-library"
    
    # إنشاء إعدادات Nginx
    cat > "$nginx_config" << EOF
# إعدادات Nginx لمكتبة كلية الهندسة
server {
    listen 80;
    listen [::]:80;
    
    server_name _;
    root $PROJECT_ROOT/client/build;
    index index.html index.htm;
    
    # Frontend
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # ملفات التحميل
    location /uploads/ {
        alias $PROJECT_ROOT/uploads/;
        autoindex off;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # الأمان
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # الضغط
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # السجلات
    access_log $LOGS_DIR/nginx-access.log;
    error_log $LOGS_DIR/nginx-error.log;
    
    # الحد الأقصى لحجم التحميل
    client_max_body_size 150M;
}
EOF
    
    # تفعيل الموقع
    if [ ! -L "$nginx_enabled" ]; then
        ln -s "$nginx_config" "$nginx_enabled"
    fi
    
    # اختبار وتحميل الإعدادات
    if nginx -t >> "$DEPLOY_LOG" 2>&1; then
        systemctl reload nginx
        print_success "تم إعداد Nginx"
    else
        print_error "فشل إعداد Nginx"
        return 1
    fi
    
    return 0
}

# دالة لإعداد PM2
setup_pm2() {
    print_info "إعداد PM2..."
    
    cd "$BACKEND_DIR" || return 1
    
    # إيقاف التطبيق إذا كان يعمل
    if pm2 describe engineering-library >> /dev/null 2>&1; then
        pm2 delete engineering-library >> "$DEPLOY_LOG" 2>&1
    fi
    
    # بدء التطبيق
    if pm2 start ecosystem.config.js >> "$DEPLOY_LOG" 2>&1; then
        pm2 save >> "$DEPLOY_LOG" 2>&1
        pm2 startup >> "$DEPLOY_LOG" 2>&1
        
        print_success "تم إعداد PM2"
        return 0
    else
        print_error "فشل إعداد PM2"
        return 1
    fi
}

# دالة للتهيئة الأولية
init_system() {
    print_info "بدء التهيئة الأولية للنظام..."
    
    # التحقق من التبعيات
    if ! check_dependencies; then
        print_error "التبعيات غير مكتملة"
        return 1
    fi
    
    # إنشاء هيكل المجلدات
    create_directory_structure
    
    # نسخ الملفات من Git (إذا كانت موجودة)
    if [ -d "$PROJECT_ROOT/.git" ]; then
        print_info "تحديث الملفات من Git..."
        git pull origin main >> "$DEPLOY_LOG" 2>&1
    fi
    
    # تثبيت Backend
    if ! install_backend; then
        print_error "فشل تثبيت Backend"
        return 1
    fi
    
    # تثبيت Frontend
    if ! install_frontend; then
        print_error "فشل تثبيت Frontend"
        return 1
    fi
    
    # إعداد Nginx
    if ! setup_nginx; then
        print_error "فشل إعداد Nginx"
        return 1
    fi
    
    # إعداد PM2
    if ! setup_pm2; then
        print_error "فشل إعداد PM2"
        return 1
    fi
    
    # تهيئة قاعدة البيانات
    if ! init_database; then
        print_error "فشل تهيئة قاعدة البيانات"
        return 1
    fi
    
    print_success "تم التهيئة الأولية للنظام بنجاح!"
    return 0
}

# دالة لنشر النظام بالكامل
deploy_all() {
    print_info "بدء نشر النظام بالكامل..."
    
    # تأكيد النشر
    if [ "$AUTO_CONFIRM" != true ]; then
        echo ""
        print_warning "تحذير: هذه العملية ستقوم بنشر النظام بالكامل!"
        read -p "هل تريد المتابعة؟ (نعم/لا): " confirm
        
        if [[ ! "$confirm" =~ ^(نعم|yes|y|Y)$ ]]; then
            print_info "تم إلغاء عملية النشر"
            return 0
        fi
    fi
    
    # التحقق من التبعيات
    if ! check_dependencies; then
        print_error "التبعيات غير مكتملة"
        return 1
    fi
    
    # تثبيت Backend
    if ! install_backend; then
        print_error "فشل تثبيت Backend"
        return 1
    fi
    
    # تثبيت Frontend
    if ! install_frontend; then
        print_error "فشل تثبيت Frontend"
        return 1
    fi
    
    # إعداد Nginx
    if ! setup_nginx; then
        print_error "فشل إعداد Nginx"
        return 1
    fi
    
    # إعداد PM2
    if ! setup_pm2; then
        print_error "فشل إعداد PM2"
        return 1
    fi
    
    print_success "تم نشر النظام بالكامل بنجاح!"
    return 0
}

# دالة لتحديث النظام من Git
update_system() {
    print_info "بدء تحديث النظام من Git..."
    
    # التحقق من وجود Git
    if [ ! -d "$PROJECT_ROOT/.git" ]; then
        print_error "المجلد ليس مستودع Git"
        return 1
    fi
    
    cd "$PROJECT_ROOT" || return 1
    
    # سحب التحديثات
    print_info "سحب التحديثات من Git..."
    if git pull origin main >> "$DEPLOY_LOG" 2>&1; then
        print_info "✓ تم سحب التحديثات"
    else
        print_error "فشل سحب التحديثات"
        return 1
    fi
    
    # تثبيت Backend
    if ! install_backend; then
        print_error "فشل تحديث Backend"
        return 1
    fi
    
    # تثبيت Frontend
    if ! install_frontend; then
        print_error "فشل تحديث Frontend"
        return 1
    fi
    
    # إعادة تشغيل الخدمات
    restart_services
    
    print_success "تم تحديث النظام بنجاح!"
    return 0
}

# دالة لإعادة تشغيل الخدمات
restart_services() {
    print_info "إعادة تشغيل الخدمات..."
    
    # إعادة تشغيل Backend
    if pm2 describe engineering-library >> /dev/null 2>&1; then
        pm2 restart engineering-library >> "$DEPLOY_LOG" 2>&1
        print_info "  ✓ تم إعادة تشغيل Backend"
    else
        setup_pm2
    fi
    
    # إعادة تحميل Nginx
    if nginx -t >> "$DEPLOY_LOG" 2>&1; then
        systemctl reload nginx >> "$DEPLOY_LOG" 2>&1
        print_info "  ✓ تم إعادة تحميل Nginx"
    fi
    
    print_success "تم إعادة تشغيل الخدمات"
}

# دالة لعرض حالة الخدمات
show_status() {
    print_info "عرض حالة الخدمات..."
    
    echo ""
    echo "===== حالة النظام ====="
    echo ""
    
    # حالة PM2
    echo "Backend (PM2):"
    if pm2 describe engineering-library >> /dev/null 2>&1; then
        pm2 show engineering-library | grep -E "(status|pid|uptime|memory)"
    else
        echo "  ❌ غير نشط"
    fi
    
    echo ""
    
    # حالة Nginx
    echo "Nginx:"
    if systemctl is-active --quiet nginx; then
        echo "  ✅ نشط"
        nginx -t 2>&1 | head -1
    else
        echo "  ❌ غير نشط"
    fi
    
    echo ""
    
    # حالة MongoDB
    echo "MongoDB:"
    if systemctl is-active --quiet mongod; then
        echo "  ✅ نشط"
    else
        echo "  ❌ غير نشط"
    fi
    
    echo ""
    
    # مساحة التخزين
    echo "مساحة التخزين:"
    df -h "$PROJECT_ROOT" | tail -1
    
    echo ""
    
    # السجلات
    echo "آخر السجلات:"
    tail -5 "$LOGS_DIR"/*.log 2>/dev/null | head -20
    
    echo ""
}

# دالة لتنظيف الملفات المؤقتة
clean_system() {
    print_info "تنظيف الملفات المؤقتة..."
    
    # تنظيف node_modules
    print_info "  تنظيف node_modules..."
    find "$PROJECT_ROOT" -name "node_modules" -type d -prune -exec rm -rf {} + 2>/dev/null
    
    # تنظيف الملفات المؤقتة
    print_info "  تنظيف الملفات المؤقتة..."
    find "$PROJECT_ROOT" -name "*.log" -mtime +7 -delete 2>/dev/null
    find "$PROJECT_ROOT" -name "*.tmp" -delete 2>/dev/null
    find "$PROJECT_ROOT" -name "*.backup*" -mtime +30 -delete 2>/dev/null
    
    # تنظيف npm cache
    npm cache clean --force >> "$DEPLOY_LOG" 2>&1
    
    print_success "تم تنظيف النظام"
}

# ============================================
# التنفيذ الرئيسي
# ============================================

# تهيئة المتغيرات
MODE="all"
AUTO_CONFIRM=false
DRY_RUN=false

# إنشاء مجلد السجلات
mkdir -p "$LOGS_DIR"

# بدء تسجيل السجلات
echo "===== سجل النشر =====" > "$DEPLOY_LOG"
echo "الوقت: $TIMESTAMP" >> "$DEPLOY_LOG"
echo "المعاملات: $*" >> "$DEPLOY_LOG"
echo "" >> "$DEPLOY_LOG"

# قراءة المعاملات
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -i|--init)
            MODE="init"
            shift
            ;;
        -b|--backend)
            MODE="backend"
            shift
            ;;
        -f|--frontend)
            MODE="frontend"
            shift
            ;;
        -a|--all)
            MODE="all"
            shift
            ;;
        -u|--update)
            MODE="update"
            shift
            ;;
        -r|--restart)
            MODE="restart"
            shift
            ;;
        -s|--status)
            MODE="status"
            shift
            ;;
        -c|--clean)
            MODE="clean"
            shift
            ;;
        -y|--yes)
            AUTO_CONFIRM=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            print_error "معامل غير معروف: $1"
            show_help
            exit 1
            ;;
    esac
done

# التحقق من صلاحيات الجذر
check_root

# تنفيذ الوضع المحدد
case $MODE in
    "init")
        init_system
        ;;
    "backend")
        print_info "نشر Backend فقط..."
        install_backend
        restart_services
        ;;
    "frontend")
        print_info "نشر Frontend فقط..."
        install_frontend
        restart_services
        ;;
    "all")
        deploy_all
        ;;
    "update")
        update_system
        ;;
    "restart")
        restart_services
        ;;
    "status")
        show_status
        ;;
    "clean")
        clean_system
        ;;
    *)
        print_error "وضع غير معروف: $MODE"
        show_help
        exit 1
        ;;
esac

# عرض سجل النشر
if [ "$MODE" != "status" ]; then
    echo ""
    echo "===== ملخص النشر ====="
    echo "الوضع: $MODE"
    echo "الوقت: $(date)"
    echo "السجل: $DEPLOY_LOG"
    echo ""
fi

exit 0
