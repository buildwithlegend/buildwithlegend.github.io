<!DOCTYPE html>
<html lang="zh-Hant">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>自動排班系統</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        h1, h2 {
            color: #333;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input[type="text"] {
            width: 100%;
            padding: 8px;
            box-sizing: border-box;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        button {
            background-color: #007bff;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background-color: #0056b3;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: center;
        }
        th {
            background-color: #f2f2f2;
        }
        .off {
            background-color: #ffe6e6;
            color: #d9534f;
            font-weight: bold;
        }
        .summary {
            margin-top: 20px;
            background: #e9ecef;
            padding: 15px;
            border-radius: 4px;
        }
    </style>
</head>
<body>

<div class="container">
    <h1>自動排班產生器 (6人 / 6天)</h1>
    
    <div class="form-group">
        <label>員工姓名（用逗號或空格分隔 6 位成員）：</label>
        <input type="text" id="employeeInput" value="員工A, 員工B, 員工C, 員工D, 員工E, 員工F">
    </div>

    <button onclick="generateSchedule()">產生隨機班表</button>

    <div id="result"></div>
</div>

<script>
function generateSchedule() {
    // 讀取員工名單
    const inputVal = document.getElementById('employeeInput').value;
    let employees = inputVal.split(/[,，\s]+/).filter(e => e.trim() !== '');

    if (employees.length !== 6) {
        alert("請輸入剛好 6 位員工姓名！");
        return;
    }

    const days = ['週一', '週二', '週三', '週四', '週五', '週六'];
    
    // 為了保證公平性：6天中每天休2人，總共12個人次休假。
    // 6個人每人剛好隨機分配休假 2 天。
    let offDays = {};
    employees.forEach(emp => offDays[emp] = []);

    // 建立排班池：週一到週六各需要2人休假 -> [0,0, 1,1, 2,2, 3,3, 4,4, 5,5]
    let pool = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5];
    
    // 嘗試洗牌並分配休假（確保每人選到的 2 天不重複）
    let success = false;
    let maxAttempts = 100;
    
    while (!success && maxAttempts > 0) {
        maxAttempts--;
        pool.sort(() => Math.random() - 0.5); // 洗牌
        
        let valid = true;
        let tempOffDays = {};
        employees.forEach(emp => tempOffDays[emp] = []);

        for (let i = 0; i < employees.length; i++) {
            let day1 = pool[i * 2];
            let day2 = pool[i * 2 + 1];

            if (day1 === day2) { // 不能在同一天休兩次
                valid = false;
                break;
            }
            tempOffDays[employees[i]] = [day1, day2];
        }

        if (valid) {
            offDays = tempOffDays;
            success = true;
        }
    }

    // 建立每天的班表
    let schedule = []; // 每一天的班表詳細資訊

    for (let dayIndex = 0; dayIndex < 6; dayIndex++) {
        let workingToday = [];
        let offToday = [];

        employees.forEach(emp => {
            if (offDays[emp].includes(dayIndex)) {
                offToday.push(emp);
            } else {
                workingToday.push(emp);
            }
        });

        // 打亂今天上班的 4 個人，隨機分配班別
        workingToday.sort(() => Math.random() - 0.5);

        // 班別分配規則：早班 1 人、中班 1 人、晚班 2 人 (可自由調整)
        schedule.push({
            day: days[dayIndex],
            morning: workingToday[0],
            noon: workingToday[1],
            night: [workingToday[2], workingToday[3]],
            off: offToday
        });
    }

    // 渲染表格
    renderTable(days, employees, schedule, offDays);
}

function renderTable(days, employees, schedule, offDays) {
    let html = `<h2>本週班表 (週日公休)</h2>`;
    
    // 1. 每日班別檢視表
    html += `<h3>【按日期檢視】</h3>`;
    html += `<table>
        <tr>
            <th>日期</th>
            <th>早班 (1人)</th>
            <th>中班 (1人)</th>
            <th>晚班 (2人)</th>
            <th>排休 (2人)</th>
        </tr>`;

    schedule.forEach(s => {
        html += `<tr>
            <td><strong>${s.day}</strong></td>
            <td>${s.morning}</td>
            <td>${s.noon}</td>
            <td>${s.night.join(', ')}</td>
            <td class="off">${s.off.join(', ')}</td>
        </tr>`;
    });
    
    html += `<tr style="background-color: #f8d7da; font-weight: bold;">
        <td>週日</td>
        <td colspan="4">全員公休 / 店休</td>
    </tr>`;
    html += `</table>`;

    // 2. 個人班表統計
    html += `<div class="summary">`;
    html += `<h3>【個人休假統計】</h3><ul>`;
    employees.forEach(emp => {
        let empOffDays = offDays[emp].map(d => days[d]).join('、');
        html += `<li><strong>${emp}</strong>：本週排休日期為 ${empOffDays}</li>`;
    });
    html += `</ul></div>`;

    document.getElementById('result').innerHTML = html;
}

// 頁面載入時自動執行一次
window.onload = generateSchedule;
</script>

</body>
</html>
