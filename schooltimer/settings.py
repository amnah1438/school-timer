from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent


# ==========================
#        الأمان
# ==========================
SECRET_KEY = 'django-insecure-replace-this-key-in-production'
DEBUG = True
ALLOWED_HOSTS = ['*']   # للسماح بالوصول من الشاشات التفاعلية والآيباد


# ==========================
#        التطبيقات
# ==========================
INSTALLED_APPS = [
    # تطبيقات Django الأساسية
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # تطبيق اللوحة (الذي قمتي بإنشائه)
    'timetable',
]


# ==========================
#        الوسيطات
# ==========================
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',

    # دعم التعدد اللغوي
    'django.middleware.locale.LocaleMiddleware',

    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# ==========================
#         الروابط
# ==========================
ROOT_URLCONF = 'schooltimer.urls'


# ==========================
#         القوالب
# ==========================
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',

        # مجلد القوالب الرئيسي
        'DIRS': [BASE_DIR / 'templates'],

        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


# ==========================
#       WSGI / ASGI
# ==========================
WSGI_APPLICATION = 'schooltimer.wsgi.application'



# ==========================
#     قاعدة البيانات
# ==========================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}



# ==========================
#   التحقق من كلمات المرور
# ==========================
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# ==========================
#   اللغة والتوقيت
# ==========================
LANGUAGE_CODE = 'ar'
TIME_ZONE = 'Asia/Riyadh'

USE_I18N = True
USE_TZ = True


# ==========================
#     الملفات الثابتة
# ==========================
STATIC_URL = '/static/'


STATIC_ROOT = BASE_DIR / 'staticfiles'

# عند التحزيم (collectstatic)
STATIC_ROOT = BASE_DIR / 'staticfiles'


# ==========================
#     الإعدادات العامة
# ==========================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
