/* ==========================================================
   1) عرض الساعة الحية بنظام 12 ساعة
========================================================== */
function format12(h, m, s) {
    let ampm = h >= 12 ? "PM" : "AM";
    let hour = h % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")} ${ampm}`;
}

function updateClock() {
    const now = new Date();
    document.getElementById("live-time").innerText =
        format12(now.getHours(), now.getMinutes(), now.getSeconds());
}
setInterval(updateClock, 1000);
updateClock();

/* ==========================================================
   2) المتغيرات الرئيسية (الحصص – الفسح – البداية – الوقت بين الحصص)
========================================================== */

let lessons = [
    { duration: 45 },
    { duration: 45 },
    { duration: 45 },
    { duration: 45 },
    { duration: 45 }
];

let breaks = [];
let startTime = null;
let betweenMin = 5;
let betweenSec = 0;

/* تحميل إعدادات الحصص من التخزين */
const saved = JSON.parse(localStorage.getItem("schoolSettings"));
if (saved) {
    startTime = saved.startTime;
    lessons = saved.lessons;
    breaks = saved.breaks;
    betweenMin = saved.betweenMin;
    betweenSec = saved.betweenSec;
}
/* ==========================================================
   3) إعدادات عامة (اسم المدرسة – نوع المدرسة – الثيم – المدينة – الصوت)
========================================================== */

let schoolName = "الثانوية الثالثة عشر بعرعر";
let schoolType = "girls";  // boys / girls
let themeMode = "dark";    // light / dark
let cityName = "عرعر";     // المدينة الحالية
let volumeLevel = 80;      // مستوى الصوت من 0 إلى 100

/* تحميل الإعدادات العامة من التخزين */
const savedGeneral = JSON.parse(localStorage.getItem("schoolGeneral"));
if (savedGeneral) {
    schoolName = savedGeneral.schoolName || schoolName;
    schoolType = savedGeneral.schoolType || schoolType;
    themeMode = savedGeneral.themeMode || themeMode;
    cityName = savedGeneral.cityName || cityName;
    volumeLevel = savedGeneral.volumeLevel || volumeLevel;
}

/* تطبيق اسم المدرسة على الصفحة */
document.getElementById("school-name").innerText = schoolName;

/* ==========================================================
   4) تطبيق الثيم (نهاري / ليلي)
========================================================== */

function applyTheme() {
    if (themeMode === "light") {
        document.body.classList.add("light-mode");
        document.body.classList.remove("dark-mode");
    } else {
        document.body.classList.add("dark-mode");
        document.body.classList.remove("light-mode");
    }
}

applyTheme();

/* ==========================================================
   5) مشغل الصوت
========================================================== */

let audioPlayer = new Audio();
audioPlayer.volume = volumeLevel / 100;

/* ⭐ السماح بتشغيل الصوت على iPhone و Safari ⭐ */
document.body.addEventListener("click", () => {
    audioPlayer.play().catch(()=>{});
}, { once: true });

/* تشغيل ملف صوت حسب نوع المدرسة */
function playSound(name) {
    const path = `/static/timetable/sounds/${schoolType}/${name}.mp3`;
    audioPlayer.src = path;
    audioPlayer.load();
    audioPlayer.volume = volumeLevel / 100;
    audioPlayer.play().catch(() => {});
}

/* ==========================================================
   6) تحديث وقت صلاة الظهر حسب المدينة (تلقائي يوميًا من API)
========================================================== */

/* قائمة المدن مع إحداثياتها - لتحديث الصلاة من API */
const prayerCities = {
    "عرعر": { lat: 30.9756, lng: 41.0380 },
    "الرياض": { lat: 24.7136, lng: 46.6753 },
    "جدة": { lat: 21.4858, lng: 39.1925 },
    "مكة": { lat: 21.3891, lng: 39.8579 },
    "المدينة": { lat: 24.5247, lng: 39.5692 },
    "تبوك": { lat: 28.3833, lng: 36.5662 },
    "جازان": { lat: 16.8892, lng: 42.5510 },
    "نجران": { lat: 17.5429, lng: 44.2550 },
    "الدمام": { lat: 26.4207, lng: 50.0888 },
    "الطائف": { lat: 21.4373, lng: 40.5127 },
    "ابها": { lat: 18.2164, lng: 42.5053 },
    "ينبع": { lat: 24.0895, lng: 38.0618 },
    "حائل": { lat: 27.5114, lng: 41.7208 },
    "القريات": { lat: 31.3300, lng: 37.3438 },
    "الخفجي": { lat: 28.4328, lng: 48.4913 },
    "بيشة": { lat: 20.0000, lng: 42.6050 },
    "الباحة": { lat: 20.0129, lng: 41.4677 }
};

/* دالة تجيب وقت الصلاة من API */
async function fetchPrayerTime(city) {

    const info = prayerCities[city];
    if (!info) return;

    const { lat, lng } = info;

    try {
        const api = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=4`;

        const res = await fetch(api);
        const data = await res.json();

        const dhuhr = data.data.timings.Dhuhr;

        // حفظ وقت الصلاة
        document.getElementById("prayer-time").innerText = dhuhr;

        // حفظ آخر وقت في التخزين
        localStorage.setItem("dhuhrTime", dhuhr);

    } catch (e) {
        console.log("خطأ في جلب وقت الصلاة:", e);
    }
}

/* دالة تحدث الصلاة حسب المدينة المختارة */
function updateCityDhuhr() {
    fetchPrayerTime(cityName);
}

/* تشغيل تحديث الصلاة أول مرة */
updateCityDhuhr();

/* إعادة تحديث الصلاة كل 6 ساعات */
setInterval(updateCityDhuhr, 21600000);
/* ==========================================================
   7) فتح وإغلاق النوافذ (الإعدادات + إدارة الحصص)
========================================================== */

const manageBtn = document.getElementById("manage-btn");
const settingsBtn = document.getElementById("settings-btn");

const managePopup = document.getElementById("manage-popup");
const settingsPopup = document.getElementById("settings-popup");

/* إغلاق جميع النوافذ */
document.querySelectorAll(".close").forEach(btn => {
    btn.onclick = () => {
        managePopup.style.display = "none";
        settingsPopup.style.display = "none";
    };
});

/* ==========================================================
   8) عند فتح نافذة الإعدادات — تعبئة القيم الحالية
========================================================== */

settingsBtn.onclick = () => {
    settingsPopup.style.display = "flex";

    // اسم المدرسة
    document.getElementById("school-name-input").value = schoolName;

    // نوع المدرسة
    if (schoolType === "boys") {
        document.getElementById("type-boys").classList.add("active-type");
        document.getElementById("type-girls").classList.remove("active-type");
    } else {
        document.getElementById("type-girls").classList.add("active-type");
        document.getElementById("type-boys").classList.remove("active-type");
    }

    // الثيم
    document.getElementById("theme-select").value = themeMode;

    // المدينة
    document.getElementById("city-select").value = cityName;

    // مستوى الصوت
    document.getElementById("volume-range").value = volumeLevel;
};
/* ==========================================================
   زر حفظ الإعدادات العامة
========================================================== */
document.getElementById("save-settings-general").onclick = () => {

    // اسم المدرسة
    schoolName = document.getElementById("school-name-input").value;
    document.getElementById("school-name").innerText = schoolName;

    // نوع المدرسة
    schoolType = document.querySelector(".active-type").id === "type-boys" 
        ? "boys" 
        : "girls";

    // الثيم
    themeMode = document.getElementById("theme-select").value;
    applyTheme();

    // المدينة
    cityName = document.getElementById("city-select").value;
    updateCityDhuhr(); // تحديث وقت الصلاة حسب المدينة

    // مستوى الصوت
    volumeLevel = document.getElementById("volume-range").value;
    audioPlayer.volume = volumeLevel / 100;

    // حفظ الإعدادات
    localStorage.setItem("schoolGeneral", JSON.stringify({
        schoolName,
        schoolType,
        themeMode,
        cityName,
        volumeLevel
    }));

    settingsPopup.style.display = "none"; // إغلاق النافذة
};
/* ==========================================================
   تفعيل أزرار بنين / بنات
========================================================== */
document.getElementById("type-boys").onclick = () => {
    schoolType = "boys";  // ← السطر الأول المهم
    document.getElementById("type-boys").classList.add("active-type");
    document.getElementById("type-girls").classList.remove("active-type");
};

document.getElementById("type-girls").onclick = () => {
    schoolType = "girls"; // ← السطر الثاني المهم
    document.getElementById("type-girls").classList.add("active-type");
    document.getElementById("type-boys").classList.remove("active-type");
};

/* ==========================================================
   9) نافذة إدارة الحصص
========================================================== */

manageBtn.onclick = () => {
    buildLessonsList();
    buildBreaksList();
    managePopup.style.display = "flex";
};
/* ==========================================================
   10) بناء قائمة الحصص داخل نافذة الإدارة
========================================================== */

function buildLessonsList() {
    const list = document.getElementById("lessons-list");
    list.innerHTML = "";

    lessons.forEach((lesson, index) => {
        const item = document.createElement("div");
        item.className = "lesson-item";

        item.innerHTML = `
            <label>مدة الحصة ${index + 1}</label>
            <input type="number" data-index="${index}" 
                class="lesson-duration" value="${lesson.duration}">
        `;

        list.appendChild(item);
    });
}

/* زر إضافة حصة */
document.getElementById("add-lesson").onclick = () => {
    lessons.push({ duration: 45 });
    buildLessonsList();
};

/* زر حذف آخر حصة */
document.getElementById("remove-lesson").onclick = () => {
    if (lessons.length > 1) {
        lessons.pop();
        buildLessonsList();
    }
};

/* ==========================================================
   11) بناء قائمة الفُسح داخل نافذة الإدارة
========================================================== */

function buildBreaksList() {
    const list = document.getElementById("breaks-list");
    list.innerHTML = "";

    breaks.forEach((br, index) => {
        const item = document.createElement("div");
        item.className = "break-item";

        item.innerHTML = `
            <label>فسحة رقم ${index + 1}</label>

            <select class="break-after" data-index="${index}">
                ${lessons.map((_, i) => `
                    <option value="${i + 1}" 
                        ${br.after == i + 1 ? "selected" : ""}>
                        بعد الحصة ${i + 1}
                    </option>
                `).join("")}
            </select>

            <input type="number" class="break-duration" 
                data-index="${index}" value="${br.duration}">

            <button class="btn red mini-btn delete-break" 
                data-index="${index}">حذف</button>
        `;

        list.appendChild(item);
    });

    // زر حذف كل فسحة
    document.querySelectorAll(".delete-break").forEach(btn => {
        btn.onclick = () => {
            breaks.splice(btn.dataset.index, 1);
            buildBreaksList();
        };
    });
}

/* زر إضافة فسحة */
document.getElementById("add-break").onclick = () => {
    breaks.push({ after: 1, duration: 10 });
    buildBreaksList();
};
/* ==========================================================
   12) حفظ الإعدادات الخاصة بالحـصص
========================================================== */

document.getElementById("save-settings").onclick = () => {

    /* ================================
       1) حفظ وقت بداية الحصة الأولى
    ================================= */
    const hour = parseInt(document.getElementById("start-hour").value);
    const minute = document.getElementById("start-minute").value;
    const ampm = document.getElementById("start-ampm").value;

    if (hour && minute && ampm) {
        let h = hour % 12;
        if (ampm === "PM") h += 12;   // تحويل PM
        startTime = `${h}:${minute}`; // حفظ وقت البداية
    }

    /* ================================
       2) حفظ مدد الحصص
    ================================= */
    document.querySelectorAll(".lesson-duration").forEach(input => {
        lessons[input.dataset.index].duration = parseInt(input.value);
    });

    /* ================================
       3) حفظ الوقت بين الحصص
    ================================= */
    betweenMin = parseInt(document.getElementById("between-min").value || 0);
    betweenSec = parseInt(document.getElementById("between-sec").value || 0);

    /* ================================
       4) حفظ الفُسح
    ================================= */
    document.querySelectorAll(".break-after").forEach(select => {
        breaks[select.dataset.index].after = parseInt(select.value);
    });

    document.querySelectorAll(".break-duration").forEach(input => {
        breaks[input.dataset.index].duration = parseInt(input.value);
    });

    /* ================================
       5) تخزين جميع الإعدادات في localStorage
    ================================= */
    localStorage.setItem("schoolSettings", JSON.stringify({
        startTime,
        lessons,
        breaks,
        betweenMin,
        betweenSec
    }));

    /* ================================
       6) إغلاق النافذة
    ================================= */
    managePopup.style.display = "none";

    /* ================================
       7) إعادة بناء جدول اليوم بعد التعديل
    ================================= */
    buildDaySchedule();
};
/* ==========================================================
   13) بناء جدول اليوم (Day Schedule)
========================================================== */

let daySchedule = [];

function buildDaySchedule() {
    if (!startTime) return;

    daySchedule = []; // تصفير الجدول

    let [h, m] = startTime.split(":").map(Number);
    let current = h * 60 + m;   // تحويل وقت البداية إلى دقائق كاملة

    lessons.forEach((lesson, index) => {

        /* ==========================
           1) بداية ونهاية الحصة
        ============================= */
        const start = current;
        const end = current + lesson.duration;

        daySchedule.push({
            type: "lesson",
            index: index + 1,
            start,
            end
        });

        current = end; // تحديث الوقت لمابعد الحصة

        /* ==========================
           2) الفُسح بعد هذه الحصة
        ============================= */
        breaks
            .filter(b => b.after === index + 1)
            .forEach(br => {

                const bStart = current;
                const bEnd = current + br.duration;

                daySchedule.push({
                    type: "break",
                    index: index + 1,
                    start: bStart,
                    end: bEnd
                });

                current = bEnd; // تحديث الوقت لما بعد الفسحة
            });

        /* ==========================
           3) الوقت بين الحصص
        ============================= */
        if (index !== lessons.length - 1) {
            current += (betweenMin * 60 + betweenSec);
        }
    });

    /* بناء دوائر الحصص في الشريط السفلي */
    buildLessonsRow();
}

/* بناء الجدول أول مرة عند فتح الصفحة */
buildDaySchedule();
/* ==========================================================
   14) بناء دوائر الحصص والفسح في الشريط السفلي
========================================================== */

function buildLessonsRow() {
    const row = document.getElementById("lessons-row");
    row.innerHTML = "";

    lessons.forEach((_, i) => {
        /* ----------------------------
           دائرة الحصة
        ----------------------------- */
        const lessonDiv = document.createElement("div");
        lessonDiv.className = "lesson upcoming";
        lessonDiv.setAttribute("data-type", "lesson");
        lessonDiv.setAttribute("data-index", i + 1);
        lessonDiv.innerText = i + 1;

        row.appendChild(lessonDiv);

        /* ----------------------------
           إضافة فسحة بعد الحصة
        ----------------------------- */
        breaks
            .filter(b => b.after === i + 1)
            .forEach(() => {
                const breakDiv = document.createElement("div");
                breakDiv.className = "break-circle";
                breakDiv.innerText = "فسحة";
                breakDiv.setAttribute("data-type", "break");
                row.appendChild(breakDiv);
            });
    });
}
/* ==========================================================
   15) صلاة الظهر + المتبقي عليها
========================================================== */

function updatePrayer() {
    const dhuhrText = document.getElementById("prayer-time").innerText.trim();
    if (!dhuhrText.includes(":")) return;

    let [hour, minute] = dhuhrText.split(":").map(Number);

    const now = new Date();
    const dhuhrDate = new Date();

    // تعيين وقت صلاة الظهر لليوم الحالي
    dhuhrDate.setHours(hour, minute, 0);

    // الفرق بين الآن ووقت الصلاة بالثواني
    let diffSec = Math.floor((dhuhrDate - now) / 1000);

    // لو الوقت مرّ (يعني بعد الظهر) نحسب لبكرة
    if (diffSec < 0) diffSec += 24 * 60 * 60;

    let h = Math.floor(diffSec / 3600);
    let m = Math.floor((diffSec % 3600) / 60);
    let s = diffSec % 60;

    document.getElementById("prayer-countdown").innerText =
        `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/* تحديث العد التنازلي كل ثانية */
setInterval(updatePrayer, 1000);



/* ==========================================================
   17) تحديث ألوان الدوائر في الشريط السفلي
========================================================== */

function updateRowColors(activeBlock) {

    lessons.forEach((lesson, i) => {

        const lessonDiv = document.querySelector(`.lesson[data-index="${i + 1}"]`);
        if (!lessonDiv) return;

        const block = daySchedule.find(
            b => b.type === "lesson" && b.index === i + 1
        );
        if (!block) return;

        /* -----------------------------
           الحصة منتهية
        ------------------------------ */
        if (block.end <= activeBlock.start) {
            lessonDiv.className = "lesson done";
        }

        /* -----------------------------
           الحصة الحالية
        ------------------------------ */
        else if (block.start <= activeBlock.start && block.end > activeBlock.start) {
            lessonDiv.className = "lesson active";
        }

        /* -----------------------------
           الحصص القادمة
        ------------------------------ */
        else {
            lessonDiv.className = "lesson upcoming";
        }
    });
}
/* ==========================================================
   18) دائرة التقدم (Progress Circle)
========================================================== */

function updateProgressCircle() {
    if (!daySchedule.length) return;

    const now = new Date();
    const minNow = now.getHours() * 60 + now.getMinutes();
    const secNow = now.getSeconds();

    /* العثور على الحصة أو الفسحة الحالية */
    const active = daySchedule.find(
        b => minNow >= b.start && minNow < b.end
    );

    /* لا يوجد حصة أو فسحة الآن */
    if (!active) {
        document.getElementById("circle-progress").style.strokeDashoffset = 1100;
        return;
    }

    /* حساب الوقت المنقضي */
    const totalSeconds = (active.end - active.start) * 60;
    const passedSeconds = (minNow - active.start) * 60 + secNow;

    /* نسبة التقدم */
    const percent = passedSeconds / totalSeconds;
    const offset = 1100 - (1100 * percent);

    /* تطبيق الحركة */
    document.getElementById("circle-progress").style.strokeDashoffset = offset;
}

/* تحديث التقدم كل نصف ثانية */
setInterval(updateProgressCircle, 500);
/* ==========================================================
   19) نظام الأصوات — تشغيل تلقائي حسب الحدث (تهيئة)
========================================================== */

let lastPlayed = "";        // لتجنب إعادة تشغيل نفس الصوت
let lastLessonIndex = null; // آخر حصة تم تشغيلها
let lastBlockType = null;   // هل كان بداية حصة – نهاية حصة – فسحة

/* ==========================================================
   تشغيل صوت بدون تكرار
========================================================== */
function playOnce(name) {
    const id = `${name}-${schoolType}`;
    if (lastPlayed === id) return;   // لا تعيد تشغيل نفس الصوت
    lastPlayed = id;

    playSound(name);  // التشغيل الفعلي للصوت
}
/* ==========================================================
   20) تشغيل الأصوات أثناء الحصص والفسح
========================================================== */

function handleSounds(activeBlock) {

    /* -----------------------------
       بداية الحصة
       start1 – start2 – start3...
    ------------------------------ */
    if (activeBlock.type === "lesson") {
        if (lastLessonIndex !== activeBlock.index || lastBlockType !== "lesson-start") {

            playOnce(`start${activeBlock.index}`);

            lastLessonIndex = activeBlock.index;
            lastBlockType = "lesson-start";
        }
    }

    /* -----------------------------
       بداية الفُسحة
       break_start
    ------------------------------ */
    if (activeBlock.type === "break") {
        if (lastBlockType !== "break-start") {

            playOnce("break_start");

            lastBlockType = "break-start";
        }
    }

    /* -----------------------------
       نهاية الحصة أو الفسحة
       end1 – end2…  أو break_end
    ------------------------------ */
    const now = new Date();
    const minNow = now.getHours() * 60 + now.getMinutes();
    const secNow = now.getSeconds();
    const currentSeconds = (minNow * 60) + secNow;

    const blockEndSeconds = activeBlock.end * 60;

    // قبل النهاية بثانية واحدة
    if (currentSeconds === blockEndSeconds - 1) {

        if (activeBlock.type === "lesson") {
            playOnce(`end${activeBlock.index}`);
        } else {
            playOnce("break_end");
        }

        lastBlockType = "ended";
    }
}
/* ==========================================================
   21) أصوات الصلاة — تنبيه (5 دقائق) + دخول الوقت
========================================================== */

let prayerWarnPlayed = false;   // تنبيه قبل الصلاة بخمس دقائق
let prayerNowPlayed = false;    // دخول وقت الصلاة

function handlePrayerSound() {

    const dhuhrText = document.getElementById("prayer-time").innerText.trim();
    if (!dhuhrText.includes(":")) return;

    let [hour, minute] = dhuhrText.split(":").map(Number);

    const now = new Date();
    const dhuhr = new Date();

    // تحديد وقت صلاة الظهر
    dhuhr.setHours(hour, minute, 0);

    // فرق الوقت بالثواني
    let diffSec = Math.floor((dhuhr - now) / 1000);

    // إذا مرّ الوقت، نضيف 24 ساعة
    if (diffSec < 0) diffSec += 24 * 60 * 60;

    /* -----------------------------------
       تنبيه قبل الصلاة بخمس دقائق (300 ثانية)
    ------------------------------------ */
    if (diffSec <= 300 && diffSec > 240) {
        if (!prayerWarnPlayed) {
            playOnce("prayer5");   // ملف صوت: prayer5.mp3
            prayerWarnPlayed = true;
        }
    }

    /* -----------------------------------
       عند دخول وقت الصلاة تماماً
    ------------------------------------ */
    if (diffSec <= 2) {
        if (!prayerNowPlayed) {
            playOnce("prayer_now");   // ملف صوت: prayer_now.mp3
            prayerNowPlayed = true;
        }
    }

    /* -----------------------------------
       إعادة السماح بتشغيل الأصوات
       إذا كان وقت الصلاة بعيد (أكثر من 500 ثانية)
    ------------------------------------ */
    if (diffSec > 500) {
        prayerWarnPlayed = false;
        prayerNowPlayed = false;
    }
}
/* ==========================================================
   22) صوت الترحيب عند فتح اللوحة أول مرة فقط
========================================================== */

if (!localStorage.getItem("welcomePlayed")) {
    playOnce("welcome");      // ملف صوت الترحيب: welcome.mp3
    localStorage.setItem("welcomePlayed", "1");
}
/* ==========================================================
   23) دمج الصوت مع تحديث الحصة الحالية + أصوات الصلاة
========================================================== */

function updateCurrentLesson() {
    if (!daySchedule.length) return;

    const now = new Date();
    const minNow = now.getHours() * 60 + now.getMinutes();
    const secNow = now.getSeconds();

    let active = null;

    // تحديد الحصة أو الفسحة الحالية
    for (let block of daySchedule) {
        if (minNow >= block.start && minNow < block.end) {
            active = block;
        }
    }

    let currentTxt = document.getElementById("current-lesson");
    let timerTxt = document.getElementById("lesson-timer");
    let nextTxt = document.getElementById("next-lesson");

    // إذا مافي شيء شغال الآن
    if (!active) {
        currentTxt.innerText = "—";
        timerTxt.innerText = "--:--";
        nextTxt.innerText = "—";
        return;
    }

    // حساب المتبقي
    const totalSecondsLeft = (active.end * 60) - (minNow * 60 + secNow);
    const min = Math.floor(totalSecondsLeft / 60);
    const sec = totalSecondsLeft % 60;

    // كتابة النصوص
    if (active.type === "lesson") {
        currentTxt.innerText = `الحصة الآن: ${active.index}`;
    } else {
        currentTxt.innerText = "فسحة الآن";
    }

    timerTxt.innerText = `${min}:${sec.toString().padStart(2, "0")}`;

    // الحصة التالية
    const next = daySchedule.find(b => b.start >= active.end);
    if (next) {
        nextTxt.innerText =
            next.type === "lesson"
                ? `الحصة القادمة: ${next.index}`
                : `الفسحة القادمة`;
    } else {
        nextTxt.innerText = "انتهى اليوم";
    }

    // تحديث الألوان
    updateRowColors(active);

    // ⭐ تشغيل الأصوات للحصص والفسح
    handleSounds(active);

    // ⭐ تشغيل أصوات الصلاة
    handlePrayerSound();
}

// تحديث كل ثانية
setInterval(updateCurrentLesson, 1000);
/* ==========================================================
   24) دائرة التقدم (Progress Circle)
========================================================== */

function updateProgressCircle() {
    if (!daySchedule.length) return;

    const now = new Date();
    const minNow = now.getHours() * 60 + now.getMinutes();
    const secNow = now.getSeconds();

    // إيجاد الحصة أو الفسحة الحالية
    const active = daySchedule.find(b => minNow >= b.start && minNow < b.end);

    // إذا مافي شيء شغال الآن — رجّعي الدائرة للوضع الأصلي
    if (!active) {
        document.getElementById("circle-progress").style.strokeDashoffset = 1100;
        return;
    }

    // حساب الوقت المنقضي داخل الحصة
    const totalSeconds = (active.end - active.start) * 60;  
    const passedSeconds = (minNow - active.start) * 60 + secNow;

    // نسبة التقدم
    const percent = passedSeconds / totalSeconds;

    // تحويل النسبة لتعويض stroke-dashoffset
    const offset = 1100 - (1100 * percent);

    document.getElementById("circle-progress").style.strokeDashoffset = offset;
}

// تحديث الدائرة كل نصف ثانية
setInterval(updateProgressCircle, 500);
/* ==========================================================



/* ==========================================================
   25) تشغيل الأنظمة وتحديث الشاشة الرئيسية
========================================================== */

// تشغيل هذه الدوال مباشرة عند بدء الصفحة
updateClock();
updateCityDhuhr();
buildDaySchedule();
updatePrayer();
updateCurrentLesson();
updateProgressCircle();

// تحديثات مستمرة
setInterval(updateClock, 1000);          // تحديث الساعة الحية
setInterval(updatePrayer, 1000);         // تحديث العد التنازلي للصلاة
setInterval(updateCurrentLesson, 1000);  // تحديث الحصة الحالية والأصوات
setInterval(updateProgressCircle, 500);  // تحديث دائرة التقدم
