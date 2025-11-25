from django.db import models
from django.utils import timezone


# ================================
#   إعدادات اللوحة
# ================================
class Settings(models.Model):
    school_name = models.CharField(max_length=255, default="الثانوية الثالثة عشر بعرعر")
    next_break_after = models.IntegerField(default=2)   # بعد أي حصة تكون الفسحة
    break_duration = models.IntegerField(default=15)    # مدة الفسحة بالدقائق
    time_between_lessons = models.IntegerField(default=5)
    dhuhr_prayer = models.TimeField(default="12:00")

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "إعدادات النظام"


# ================================
#       الحصص الدراسية
# ================================
class Lesson(models.Model):
    number = models.IntegerField()  # رقم الحصة
    title = models.CharField(max_length=100, default="حصة")
    duration = models.IntegerField(default=45)  # بالدقائق
    is_break = models.BooleanField(default=False)

    # وقت البداية يتم حسابه ديناميكيًا
    start_time = models.TimeField(null=True, blank=True)

    def __str__(self):
        return f"الحصة {self.number} {'(فسحة)' if self.is_break else ''}"
