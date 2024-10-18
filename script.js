// بيانات تسجيل الدخول الأساسية
const users = {
    admin: { role: 'مدير' },
    teacher: { role: 'معلم' }
};

// بيانات الحضور
let attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || [];

// متغير لحفظ السجل المعدل
let editingRecordIndex = null;

// تسجيل الدخول
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;

    if (users[username]) {
        toastr.success('تم تسجيل الدخول بنجاح!');
        document.getElementById('loginCard').classList.add('d-none');
        document.getElementById('addAttendanceSection').classList.remove('d-none');
        document.getElementById('searchAttendanceSection').classList.remove('d-none');
        document.getElementById('attendanceSection').classList.remove('d-none');
        document.getElementById('statisticsSection').classList.remove('d-none');
        loadAttendance();
    } else {
        document.getElementById('loginError').classList.remove('d-none');
        document.getElementById('loginError').textContent = 'اسم المستخدم غير صحيح.';
    }
});

// تحميل بيانات الحضور
function loadAttendance() {
    const tableBody = document.getElementById('attendanceTableBody');
    tableBody.innerHTML = '';

    attendanceData.forEach((record, index) => {
        const row = createTableRow(record, index);
        tableBody.appendChild(row);
    });

    updateChart(attendanceData);
}

// إنشاء صف في جدول الحضور
function createTableRow(record, index) {
    const row = document.createElement('tr');

    const imageCell = document.createElement('td');
    const img = document.createElement('img');
    img.src = record.image ? record.image : 'default.jpg'; // صورة افتراضية
    img.style.width = '50px'; // تحديد عرض الصورة
    img.style.height = '50px'; // تحديد ارتفاع الصورة
    imageCell.appendChild(img);
    row.appendChild(imageCell);

    const nameCell = document.createElement('td');
    nameCell.textContent = record.name;
    row.appendChild(nameCell);

    const statusCell = document.createElement('td');
    statusCell.textContent = record.status;
    row.appendChild(statusCell);

    const dayCell = document.createElement('td');
    dayCell.textContent = record.day;
    row.appendChild(dayCell);

    const actionCell = document.createElement('td');
    actionCell.innerHTML = `
        <button class="btn btn-warning btn-sm" onclick="editRecord(${index})"><i class="fas fa-edit"></i></button>
        <button class="btn btn-danger btn-sm" onclick="deleteRecord(${index})"><i class="fas fa-trash"></i></button>
    `;
    row.appendChild(actionCell);

    return row;
}

// تحديث الإحصائيات
function updateChart(attendanceData) {
    const presentCount = attendanceData.filter(r => r.status === 'حاضر').length;
    const absentCount = attendanceData.filter(r => r.status === 'غائب').length;

    const ctx = document.getElementById('attendanceChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['حضور', 'غياب'],
            datasets: [{
                label: 'عدد الطلاب',
                data: [presentCount, absentCount],
                backgroundColor: ['#28a745', '#dc3545']
            }]
        }
    });
}

// إضافة سجل حضور جديد
document.getElementById('addAttendanceForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const name = document.getElementById('studentName').value;
    const day = document.getElementById('attendanceDay').value;
    const status = document.getElementById('attendanceStatus').value;
    const imageInput = document.getElementById('studentImage');
    const image = imageInput.files[0] ? URL.createObjectURL(imageInput.files[0]) : '';

    if (name && day && status) {
        if (editingRecordIndex !== null) {
            // تعديل السجل
            attendanceData[editingRecordIndex] = { name, day, status, image };
            editingRecordIndex = null; // إعادة تعيين الفهرس
            toastr.success('تم تعديل الحضور بنجاح!');
        } else {
            // إضافة سجل جديد
            attendanceData.push({ name, day, status, image });
            toastr.success('تم إضافة الحضور بنجاح!');
        }

        localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
        loadAttendance();
        this.reset();
    } else {
        document.getElementById('addAttendanceError').classList.remove('d-none');
        document.getElementById('addAttendanceError').textContent = 'يرجى ملء جميع الحقول.';
    }
});

// البحث عن سجلات الحضور
function searchAttendance() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const tableBody = document.getElementById('attendanceTableBody');
    tableBody.innerHTML = '';

    attendanceData.forEach((record, index) => {
        if (record.name.toLowerCase().includes(searchValue)) {
            const row = createTableRow(record, index);
            tableBody.appendChild(row);
        }
    });
}

// تعديل سجل الحضور
function editRecord(index) {
    const record = attendanceData[index];
    document.getElementById('studentName').value = record.name;
    document.getElementById('attendanceDay').value = record.day;
    document.getElementById('attendanceStatus').value = record.status;
    
    editingRecordIndex = index; // حفظ الفهرس للسجل المعدل
}

// حذف سجل
function deleteRecord(index) {
    attendanceData.splice(index, 1);
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    loadAttendance();
    toastr.success('تم حذف الطالب بنجاح!');
}

// تفعيل الوضع الليلي
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

// طباعة البيانات
function printAttendance() {
    let printContent = '<h3>بيانات الحضور</h3><table border="1" cellspacing="0" cellpadding="5"><tr><th>اسم الطالب</th><th>الحالة</th><th>اليوم</th></tr>';

    attendanceData.forEach(record => {
        printContent += `<tr><td>${record.name}</td><td>${record.status}</td><td>${record.day}</td></tr>`;
    });

    printContent += '</table>';

    const newWindow = window.open('', 'Print-Window', 'width=600,height=600');
    newWindow.document.write(`<html><head><title>طباعة بيانات الحضور</title></head><body>${printContent}</body></html>`);
    newWindow.document.close();
    newWindow.print();
}

// عرض التقارير
function showReport() {
    let reportContent = '<table class="table"><tr><th>اسم الطالب</th><th>الحالة</th><th>اليوم</th></tr>';

    attendanceData.forEach(record => {
        reportContent += `<tr><td>${record.name}</td><td>${record.status}</td><td>${record.day}</td></tr>`;
    });

    reportContent += '</table>';

    document.getElementById('reportContent').innerHTML = reportContent;
    const reportModal = new bootstrap.Modal(document.getElementById('reportModal'));
    reportModal.show();
}

// تحميل البيانات عند فتح الصفحة
window.onload = loadAttendance;
