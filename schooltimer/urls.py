from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # لوحة التحكم الافتراضية
    path('admin/', admin.site.urls),

    # 🔵 تعريف تطبيق اللوحة (timetable)
    path('', include('timetable.urls')),
]
