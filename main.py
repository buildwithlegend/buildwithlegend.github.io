import streamlit as st
import pandas as pd
from ortools.sat.python import cp_model
import io

# 1. 頁面基本設定
st.set_page_config(
    page_title="自動排班系統",
    page_icon="📅",
    layout="wide"
)

st.title("📅 企業自動排班系統 (6日營業 / 早中晚班)")
st.markdown("基於運算最佳化模型，自動分配員工班次並確保工時公平性與充足休息時間。")

# 2. 側邊欄設定
st.sidebar.header("⚙️ 排班條件設定")

# 員工代號設定
default_employees = ["A", "B", "C", "D", "E", "F"]
emp_input = st.sidebar.text_input("員工代號/姓名 (請用英文逗號分開)", ",".join(default_employees))
employees = [e.strip() for e in emp_input.split(",") if e.strip()]

# 班次需求設定
st.sidebar.subheader("👥 每日各班次所需人數")
morning_req = st.sidebar.number_input("早班人數", min_value=1, value=1, step=1)
noon_req = st.sidebar.number_input("中班人數", min_value=1, value=1, step=1)
night_req = st.sidebar.number_input("晚班人數", min_value=1, value=1, step=1)

shifts = ["早班", "中班", "晚班"]
days = ["週一", "週二", "週三", "週四", "週五", "週六"]
shift_req = {"早班": morning_req, "中班": noon_req, "晚班": night_req}

# 3. 排班求解器核心邏輯
def generate_schedule(employees, days, shifts, shift_req):
    model = cp_model.CpModel()
    
    # 建立決策變數
    shifts_vars = {}
    for e in employees:
        for d_idx, d in enumerate(days):
            for s in shifts:
                shifts_vars[(e, d_idx, s)] = model.NewBoolVar(f'shift_{e}_{d_idx}_{s}')
                
    # 限制條件 1: 每日班次人數需求必須完全滿足
    for d_idx in range(len(days)):
        for s in shifts:
            model.Add(
                sum(shifts_vars[(e, d_idx, s)] for e in employees) == shift_req[s]
            )
            
    # 限制條件 2: 每人每天最多只能上一個班
    for e in employees:
        for d_idx in range(len(days)):
            model.Add(
                sum(shifts_vars[(e, d_idx, s)] for s in shifts) <= 1
            )
            
    # 限制條件 3: 避免「前一天晚班，次日早班」（保護員工休息時間）
    for e in employees:
        for d_idx in range(len(days) - 1):
            model.AddBoolOr([
                shifts_vars[(e, d_idx, "晚班")].Not(),
                shifts_vars[(e, d_idx + 1, "早班")].Not()
            ])

    # 限制條件 4: 工時平均化（最高與最低總班數相差最多 1 班）
    total_slots = len(days) * sum(shift_req.values())
    min_shifts_per_emp = total_slots // len(employees)
    max_shifts_per_emp = (total_slots + len(employees) - 1) // len(employees)
    
    for e in employees:
        emp_total = sum(shifts_vars[(e, d_idx, s)] for d_idx in range(len(days)) for s in shifts)
        model.Add(emp_total >= min_shifts_per_emp)
        model.Add(emp_total <= max_shifts_per_emp)

    # 執行計算
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 5.0
    status = solver.Solve(model)

    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        schedule_data = {e: {d: "輪休" for d in days} for e in employees}
        for e in employees:
            for d_idx, d in enumerate(days):
                for s in shifts:
                    if solver.Value(shifts_vars[(e, d_idx, s)]) == 1:
                        schedule_data[e][d] = s
        
        # 加入週日固定休息
        for e in employees:
            schedule_data[e]["週日"] = "固定休"
            
        df = pd.DataFrame.from_dict(schedule_data, orient='index')
        return df
    else:
        return None

# 4. 前端介面觸發與結果輸出
if st.button("🚀 開始自動排班", type="primary"):
    total_needed_per_day = sum(shift_req.values())
    if len(employees) < total_needed_per_day:
        st.error(f"❌ 員工人數不足！每日共需要 {total_needed_per_day} 人次，但目前只有 {len(employees)} 位員工。")
    else:
        with st.spinner("智慧演算班表中..."):
            df_result = generate_schedule(employees, days, shifts, shift_req)
            
        if df_result is not None:
            st.success("✅ 自動排班成功！")
            
            # 展示班表
            st.subheader("📋 本週班表總覽")
            st.dataframe(df_result, use_container_width=True)
            
            # 統計資料
            st.subheader("📊 員工班次分配統計")
            stats = []
            for emp in employees:
                row = df_result.loc[emp]
                m_cnt = (row == "早班").sum()
                n_cnt = (row == "中班").sum()
                e_cnt = (row == "晚班").sum()
                off_cnt = (row == "輪休").sum()
                stats.append({
                    "員工": emp,
                    "早班天數": m_cnt,
                    "中班天數": n_cnt,
                    "晚班天數": e_cnt,
                    "輪休天數": off_cnt,
                    "總工作天數": m_cnt + n_cnt + e_cnt
                })
            st.dataframe(pd.DataFrame(stats), use_container_width=True)
            
            # 產出 Excel 下載
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df_result.to_excel(writer, sheet_name='週班表')
                pd.DataFrame(stats).to_excel(writer, sheet_name='班次統計', index=False)
            excel_data = output.getvalue()
            
            st.download_button(
                label="📥 下載 Excel 班表檔案",
                data=excel_data,
                file_name="weekly_schedule.xlsx",
                mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
        else:
            st.error("⚠️ 無法找到符合限制條件的排班組合，請嘗試調整班次人數需求或增加員工。")
