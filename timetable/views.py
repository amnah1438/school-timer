from django.shortcuts import render
from datetime import datetime
from hijri_converter import convert

def display_board(request):

    # التاريخ الميلادي
    today_m = datetime.now().strftime("%Y / %m / %d")

    # التاريخ الهجري
    h = convert.Gregorian.today().to_hijri()
    today_h = f"{h.year} / {h.month:02d} / {h.day:02d}"

    context = {
        "today_m": today_m,
        "today_h": today_h,
    }

    return render(request, "timetable/board.html", context)
