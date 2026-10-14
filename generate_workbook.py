import json
import os
import csv
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Load extracted program and explanations
with open('extracted_program.json', 'r', encoding='utf-8') as f:
    app_data = json.load(f)

program_data = app_data['programData']
day_explanations = app_data['dayExplanations']

wb = openpyxl.Workbook()

# -------------------------------------------------------------
# Color Palette & Styles
# -------------------------------------------------------------
NAVY_HEADER = '1E293B'      # Dark Slate/Navy for master headers
NAVY_SUBHEADER = '334155'   # Lighter Slate
WHITE = 'FFFFFF'
TEXT_DARK = '0F172A'
TEXT_MUTED = '64748B'
BORDER_GRAY = 'CBD5E1'
BORDER_LIGHT = 'E2E8F0'
ZEBRA_FILL = 'F8FAFC'
MAIN_LIFT_FILL = 'FEF3C7'  # Soft amber for main lift rows
CARD_BG = 'F1F5F9'
ACCENT_BLUE = '0284C7'
SUCCESS_GREEN = '16A34A'
WARNING_ORANGE = 'EA580C'

PHASE_COLORS = {
    'Accumulation': {'bg': 'E0F2FE', 'text': '0369A1', 'border': '7DD3FC'},
    'Accumulation Peak': {'bg': 'BAE6FD', 'text': '0284C7', 'border': '38BDF8'},
    'Deload': {'bg': 'DCFCE7', 'text': '15803D', 'border': '86EFAC'},
    'Intensification': {'bg': 'FEF3C7', 'text': 'B45309', 'border': 'FCD34D'},
    'Top of Intensification': {'bg': 'FFEDD5', 'text': 'C2410C', 'border': 'FDBA74'},
    'Peak / Realization': {'bg': 'FEE2E2', 'text': 'B91C1C', 'border': 'FCA5A5'},
    'FINAL FORM (Taper)': {'bg': 'EDE9FE', 'text': '6D28D9', 'border': 'C4B5FD'},
    'Testing Window': {'bg': 'FEF08A', 'text': '854D0E', 'border': 'FACC15'},
}

# Borders
thin_border_side = Side(border_style='thin', color=BORDER_GRAY)
thin_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)
light_border_side = Side(border_style='thin', color=BORDER_LIGHT)
light_border = Border(left=light_border_side, right=light_border_side, top=light_border_side, bottom=light_border_side)
header_border = Border(
    left=Side(border_style='thin', color='475569'),
    right=Side(border_style='thin', color='475569'),
    top=Side(border_style='thin', color='475569'),
    bottom=Side(border_style='medium', color=NAVY_HEADER)
)

# Fonts
font_title = Font(name='Segoe UI', size=16, bold=True, color=WHITE)
font_subtitle = Font(name='Segoe UI', size=10, italic=True, color='94A3B8')
font_section = Font(name='Segoe UI', size=12, bold=True, color=NAVY_HEADER)
font_card_header = Font(name='Segoe UI', size=11, bold=True, color=NAVY_HEADER)
font_tbl_header = Font(name='Segoe UI', size=10, bold=True, color=WHITE)
font_data_bold = Font(name='Segoe UI', size=10, bold=True, color=TEXT_DARK)
font_data = Font(name='Segoe UI', size=10, color=TEXT_DARK)
font_data_muted = Font(name='Segoe UI', size=9, color=TEXT_MUTED)
font_data_italic = Font(name='Segoe UI', size=9, italic=True, color='475569')

# Fills
fill_header = PatternFill(start_color=NAVY_HEADER, end_color=NAVY_HEADER, fill_type='solid')
fill_sub_header = PatternFill(start_color=NAVY_SUBHEADER, end_color=NAVY_SUBHEADER, fill_type='solid')
fill_zebra = PatternFill(start_color=ZEBRA_FILL, end_color=ZEBRA_FILL, fill_type='solid')
fill_main = PatternFill(start_color=MAIN_LIFT_FILL, end_color=MAIN_LIFT_FILL, fill_type='solid')
fill_card = PatternFill(start_color=CARD_BG, end_color=CARD_BG, fill_type='solid')

# Alignments
align_center = Alignment(horizontal='center', vertical='center', wrap_text=True)
align_left = Alignment(horizontal='left', vertical='center', wrap_text=True)
align_right = Alignment(horizontal='right', vertical='center')
align_header = Alignment(horizontal='center', vertical='center', wrap_text=True)

# Helper function to auto-fit columns
def adjust_col_widths(ws, min_widths=None, max_widths=None):
    if min_widths is None: min_widths = {}
    if max_widths is None: max_widths = {}
    for col in ws.columns:
        col_letter = get_column_letter(col[0].column)
        max_len = 0
        for cell in col:
            if cell.coordinate in ws.merged_cells:
                continue
            if cell.value:
                lines = str(cell.value).split('\n')
                for line in lines:
                    if len(line) > max_len:
                        max_len = len(line)
        calc_w = max(max_len + 3, min_widths.get(col_letter, 10))
        if col_letter in max_widths:
            calc_w = min(calc_w, max_widths[col_letter])
        ws.column_dimensions[col_letter].width = calc_w

# =============================================================
# SHEET 1: DASHBOARD & SETUP
# =============================================================
ws_dash = wb.active
ws_dash.title = 'Setup & Dashboard'
ws_dash.views.sheetView[0].showGridLines = True

# Title Banner
ws_dash.merge_cells('B2:I2')
title_cell = ws_dash['B2']
title_cell.value = 'CHIKO_LIFTS : THE 13-WEEK STRENGTHBENDER SYSTEM'
title_cell.font = Font(name='Segoe UI', size=16, bold=True, color=WHITE)
title_cell.fill = fill_header
title_cell.alignment = align_center

ws_dash.merge_cells('B3:I3')
sub_cell = ws_dash['B3']
sub_cell.value = 'Official Periodized Strength & Peaking Protocol — Dynamic Master Workbook'
sub_cell.font = Font(name='Segoe UI', size=10, italic=True, color='CBD5E1')
sub_cell.fill = fill_header
sub_cell.alignment = align_center
ws_dash.row_dimensions[2].height = 32
ws_dash.row_dimensions[3].height = 20

# Section 1: Athlete 1RM & Training Max Inputs
ws_dash.merge_cells('B5:E5')
ws_dash['B5'] = '1. ATHLETE MAXES & TRAINING MAX CALCULATOR'
ws_dash['B5'].font = font_section

headers_calc = ['Lift', 'Current 1RM (lbs)', 'TM Percentage', 'Calculated TM (lbs)', 'Rounding Rule']
for c_idx, h in enumerate(headers_calc, start=2):
    cell = ws_dash.cell(row=6, column=c_idx, value=h)
    cell.font = font_tbl_header
    cell.fill = fill_sub_header
    cell.alignment = align_header
    cell.border = header_border
ws_dash.row_dimensions[6].height = 26

lifts_setup = [
    ('Back Squat', 335, '90%', '=ROUND(C7*0.9/5, 0)*5', 'Nearest 5 lbs (90% 1RM)'),
    ('Bench Press', 225, '90%', '=ROUND(C8*0.9/5, 0)*5', 'Nearest 5 lbs (90% 1RM)'),
    ('Deadlift', 410, '90%', '=ROUND(C9*0.9/5, 0)*5', 'Nearest 5 lbs (90% 1RM)'),
    ('Paused Rack Pull (mid-shin)', 450, 'Direct Entry', '=C10', 'Independent TM / Baseline Tested W1'),
]

for r_offset, (lift_name, default_1rm, tm_pct, tm_formula, note) in enumerate(lifts_setup, start=7):
    ws_dash.cell(row=r_offset, column=2, value=lift_name).font = font_data_bold
    ws_dash.cell(row=r_offset, column=2).alignment = align_left
    ws_dash.cell(row=r_offset, column=2).border = thin_border
    
    c_1rm = ws_dash.cell(row=r_offset, column=3, value=default_1rm)
    c_1rm.font = Font(name='Segoe UI', size=11, bold=True, color='0284C7')
    c_1rm.alignment = align_center
    c_1rm.border = thin_border
    c_1rm.number_format = '#,##0'
    c_1rm.fill = PatternFill(start_color='F0F9FF', end_color='F0F9FF', fill_type='solid')
    
    c_pct = ws_dash.cell(row=r_offset, column=4, value=tm_pct)
    c_pct.font = font_data
    c_pct.alignment = align_center
    c_pct.border = thin_border
    
    c_tm = ws_dash.cell(row=r_offset, column=5, value=tm_formula)
    c_tm.font = Font(name='Segoe UI', size=11, bold=True, color='16A34A')
    c_tm.alignment = align_center
    c_tm.border = thin_border
    c_tm.number_format = '#,##0'
    c_tm.fill = PatternFill(start_color='F0FDF4', end_color='F0FDF4', fill_type='solid')
    
    c_note = ws_dash.cell(row=r_offset, column=6, value=note)
    c_note.font = font_data_muted
    c_note.alignment = align_left
    c_note.border = thin_border
    ws_dash.row_dimensions[r_offset].height = 24

# Side Box: Program Rules & Autoregulation
ws_dash.merge_cells('G5:I5')
ws_dash['G5'] = 'CORE AUTOREGULATION & RULES'
ws_dash['G5'].font = font_section

rules = [
    ("The 5% Drop Rule", "If the first working set of any top set is >1 RPE point harder than prescribed, or bar speed slows noticeably, DROP LOAD 5% and keep prescribed sets/reps. Never grind."),
    ("Training Max Concept", "All percentages are calibrated against your Training Max (TM = 90% of true 1RM), NOT your absolute 1RM. This guarantees clean bar path and injury prevention."),
    ("RPE Scale Guide", "@6: 4 reps in reserve (warmup/speed)\n@7: 3 reps in reserve (crisp, solid)\n@8: 2 reps in reserve (clean effort)\n@8-9: 1-2 reps in reserve (near-limit)\n@9: 1 rep in reserve (heavy single)\n@10: 0 reps in reserve (true PR attempt)"),
    ("Deload Protocol", "Weeks 5 and 10 are mandatory deloads. Resist the urge to push heavier; fatigue dissipation is required to hit peak adaptations in Weeks 6-9 and 11-13.")
]

curr_r = 6
for r_title, r_desc in rules:
    ws_dash.merge_cells(start_row=curr_r, start_column=7, end_row=curr_r, end_column=9)
    ws_dash.cell(row=curr_r, column=7, value=f"• {r_title}").font = font_card_header
    ws_dash.cell(row=curr_r, column=7).fill = PatternFill(start_color='FEF3C7', end_color='FEF3C7', fill_type='solid')
    ws_dash.cell(row=curr_r, column=7).border = thin_border
    ws_dash.row_dimensions[curr_r].height = 20
    curr_r += 1
    
    ws_dash.merge_cells(start_row=curr_r, start_column=7, end_row=curr_r, end_column=9)
    desc_cell = ws_dash.cell(row=curr_r, column=7, value=r_desc)
    desc_cell.font = font_data
    desc_cell.alignment = align_left
    desc_cell.fill = fill_card
    desc_cell.border = thin_border
    lines = r_desc.count('\n') + 1
    ws_dash.row_dimensions[curr_r].height = max(24, lines * 18 + 10)
    curr_r += 1

# Section 2: Macrocycle Overview (Weeks 1 to 13)
macro_start_r = max(curr_r + 2, 13)
ws_dash.merge_cells(f'B{macro_start_r}:I{macro_start_r}')
ws_dash[f'B{macro_start_r}'] = '2. 13-WEEK PERIODIZATION MACROCYCLE ROADMAP'
ws_dash[f'B{macro_start_r}'].font = font_section

ws_dash.cell(row=macro_start_r+1, column=2, value='Week').font = font_tbl_header
ws_dash.cell(row=macro_start_r+1, column=2).fill = fill_sub_header
ws_dash.cell(row=macro_start_r+1, column=2).alignment = align_header
ws_dash.cell(row=macro_start_r+1, column=2).border = header_border

ws_dash.cell(row=macro_start_r+1, column=3, value='Phase').font = font_tbl_header
ws_dash.cell(row=macro_start_r+1, column=3).fill = fill_sub_header
ws_dash.cell(row=macro_start_r+1, column=3).alignment = align_header
ws_dash.cell(row=macro_start_r+1, column=3).border = header_border

ws_dash.merge_cells(f'D{macro_start_r+1}:F{macro_start_r+1}')
ws_dash[f'D{macro_start_r+1}'] = 'Strategic Objective & Role in Cycle'
ws_dash[f'D{macro_start_r+1}'].font = font_tbl_header
ws_dash[f'D{macro_start_r+1}'].fill = fill_sub_header
ws_dash[f'D{macro_start_r+1}'].alignment = align_header
ws_dash[f'D{macro_start_r+1}'].border = header_border

ws_dash.merge_cells(f'G{macro_start_r+1}:H{macro_start_r+1}')
ws_dash[f'G{macro_start_r+1}'] = 'Primary Prescription'
ws_dash[f'G{macro_start_r+1}'].font = font_tbl_header
ws_dash[f'G{macro_start_r+1}'].fill = fill_sub_header
ws_dash[f'G{macro_start_r+1}'].alignment = align_header
ws_dash[f'G{macro_start_r+1}'].border = header_border

ws_dash.cell(row=macro_start_r+1, column=9, value='Target RPE').font = font_tbl_header
ws_dash.cell(row=macro_start_r+1, column=9).fill = fill_sub_header
ws_dash.cell(row=macro_start_r+1, column=9).alignment = align_header
ws_dash.cell(row=macro_start_r+1, column=9).border = header_border
ws_dash.row_dimensions[macro_start_r+1].height = 24

macro_rows = [
    (1, 'Accumulation', 'Base building: Groove movement patterns, unilateral accessories, establish Rack Pull baseline.', '4x4 @ 68-70% TM', 'RPE 7 (Submaximal)'),
    (2, 'Accumulation', 'Volume accumulation: +1 set on Squat/Bench, +3% load progression.', '5x4 @ 72-73% TM', 'RPE 7'),
    (3, 'Accumulation', 'Volume peak start: Sets rise to 6x3 on Squat, 5x4 on Bench, Deadlift picks up 4th set.', '6x3 @ 76-77% TM', 'RPE 7-8'),
    (4, 'Accumulation Peak', 'Block fatigue peak: Heaviest accumulation sessions before reset. Paused DL dropped to protect back.', '6x3 @ 80% TM', 'RPE 8 (Fatigue High)'),
    (5, 'Deload', 'Fatigue dissipation: Deload volume and intensity to absorb training stress.', '2-3x3 @ 55-60% TM', 'RPE 6 (Recovery)'),
    (6, 'Intensification', 'Shift to neural drive: Volume drops, bar intensity jumps into 80s.', '5x3 @ 82-83% TM', 'RPE 8 (Rested)'),
    (7, 'Intensification', 'Doubles transition: Heavy doubles commence across all 4 lifts.', '5-6x2 @ 86-87% TM', 'RPE 8'),
    (8, 'Intensification', 'Heavy doubles threshold: Competition attempt weight familiarity.', '3-5x2 @ 88-90% TM', 'RPE 8-9 (Heavy)'),
    (9, 'Top of Intensification', 'Final near-max check: Controlled doubles + speed-gated optional singles.', '2-4x2 @ 88-90% (+opt single)', 'RPE 8-9 (Critical gate)'),
    (10, 'Deload', 'Pre-peak reset: Flush nervous system fatigue and supercompensate before peaking.', '2-3x2 @ 60-65% TM', 'RPE 6 (Recovery)'),
    (11, 'Peak / Realization', 'Heavy single realization: 90% TM single + back-off double at 82%.', '1x1 @ 88-90% + back-offs', 'RPE 8-9'),
    (12, 'FINAL FORM (Taper)', 'Sharpening taper: Neuromuscular readiness without fatigue; crisp speed singles.', '2-3x1 @ 82-85% TM', 'RPE 7-8 (Crisp only)'),
    (13, 'Testing Window', 'PR Test Week: Single activation day followed by individual PR test days with rest separation.', 'Openers @ 90% TM -> PRs', 'RPE 9.5-10 (All-Out PRs)')
]

for idx, (w_num, phase_name, obj_text, presc_text, rpe_text) in enumerate(macro_rows, start=macro_start_r+2):
    p_info = PHASE_COLORS.get(phase_name, {'bg': 'FFFFFF', 'text': '000000', 'border': BORDER_GRAY})
    
    ws_dash.cell(row=idx, column=2, value=f'W{w_num}').font = font_data_bold
    ws_dash.cell(row=idx, column=2).alignment = align_center
    ws_dash.cell(row=idx, column=2).border = thin_border
    
    c_p = ws_dash.cell(row=idx, column=3, value=phase_name)
    c_p.font = Font(name='Segoe UI', size=9, bold=True, color=p_info['text'])
    c_p.fill = PatternFill(start_color=p_info['bg'], end_color=p_info['bg'], fill_type='solid')
    c_p.alignment = align_center
    c_p.border = thin_border
    
    ws_dash.merge_cells(start_row=idx, start_column=4, end_row=idx, end_column=6)
    c_obj = ws_dash.cell(row=idx, column=4, value=obj_text)
    c_obj.font = font_data
    c_obj.alignment = align_left
    c_obj.border = thin_border
    
    ws_dash.merge_cells(start_row=idx, start_column=7, end_row=idx, end_column=8)
    c_presc = ws_dash.cell(row=idx, column=7, value=presc_text)
    c_presc.font = font_data_bold
    c_presc.alignment = align_center
    c_presc.border = thin_border
    
    c_rpe = ws_dash.cell(row=idx, column=9, value=rpe_text)
    c_rpe.font = font_data_muted
    c_rpe.alignment = align_center
    c_rpe.border = thin_border
    ws_dash.row_dimensions[idx].height = 22

# Section 3: 13-Week Projected PR Targets (App Model)
proj_start_r = macro_start_r + 2 + len(macro_rows) + 2
ws_dash.merge_cells(f'B{proj_start_r}:I{proj_start_r}')
ws_dash[f'B{proj_start_r}'] = '3. PROJECTED PR TARGETS (13-WEEK ADAPTATION MODEL)'
ws_dash[f'B{proj_start_r}'].font = font_section

proj_headers = ['Lift', 'Current 1RM', 'Est. Weekly Adaptation', 'Projected Base PR', 'Conservative Range', 'Aggressive Range', 'Testing Day']
for c_idx, h in enumerate(proj_headers, start=2):
    ws_dash.cell(row=proj_start_r+1, column=c_idx, value=h).font = font_tbl_header
    ws_dash.cell(row=proj_start_r+1, column=c_idx).fill = fill_sub_header
    ws_dash.cell(row=proj_start_r+1, column=c_idx).alignment = align_header
    ws_dash.cell(row=proj_start_r+1, column=c_idx).border = header_border
ws_dash.row_dimensions[proj_start_r+1].height = 24

proj_rows = [
    ('Back Squat', '=C7', '+0.5% / week', '=ROUND(C7*1.067/5, 0)*5', '=ROUND(E' + str(proj_start_r+2) + '*0.97/5, 0)*5', '=ROUND(E' + str(proj_start_r+2) + '*1.03/5, 0)*5', 'Week 13 — Day 3 (Day C)'),
    ('Bench Press', '=C8', '+0.5% / week', '=ROUND(C8*1.067/5, 0)*5', '=ROUND(E' + str(proj_start_r+3) + '*0.97/5, 0)*5', '=ROUND(E' + str(proj_start_r+3) + '*1.03/5, 0)*5', 'Week 13 — Day 2 (Day B)'),
    ('Deadlift', '=C9', '+0.5% / week', '=ROUND(C9*1.067/5, 0)*5', '=ROUND(E' + str(proj_start_r+4) + '*0.97/5, 0)*5', '=ROUND(E' + str(proj_start_r+4) + '*1.03/5, 0)*5', 'Week 13 — Day 4 (Day D)'),
    ('Rack Pull', '=C10', '+0.5% / week', '=ROUND(C10*1.067/5, 0)*5', '=ROUND(E' + str(proj_start_r+5) + '*0.97/5, 0)*5', '=ROUND(E' + str(proj_start_r+5) + '*1.03/5, 0)*5', 'Week 13 — Day 5 (Day E)'),
]

for p_idx, (lift_name, cur_f, adapt_txt, base_f, con_f, agg_f, test_day) in enumerate(proj_rows, start=proj_start_r+2):
    ws_dash.cell(row=p_idx, column=2, value=lift_name).font = font_data_bold
    ws_dash.cell(row=p_idx, column=2).border = thin_border
    
    ws_dash.cell(row=p_idx, column=3, value=cur_f).font = font_data
    ws_dash.cell(row=p_idx, column=3).alignment = align_center
    ws_dash.cell(row=p_idx, column=3).border = thin_border
    ws_dash.cell(row=p_idx, column=3).number_format = '#,##0'
    
    ws_dash.cell(row=p_idx, column=4, value=adapt_txt).font = font_data_muted
    ws_dash.cell(row=p_idx, column=4).alignment = align_center
    ws_dash.cell(row=p_idx, column=4).border = thin_border
    
    c_b = ws_dash.cell(row=p_idx, column=5, value=base_f)
    c_b.font = Font(name='Segoe UI', size=11, bold=True, color='16A34A')
    c_b.alignment = align_center
    c_b.border = thin_border
    c_b.fill = PatternFill(start_color='F0FDF4', end_color='F0FDF4', fill_type='solid')
    c_b.number_format = '#,##0'
    
    c_c = ws_dash.cell(row=p_idx, column=6, value=con_f)
    c_c.font = font_data
    c_c.alignment = align_center
    c_c.border = thin_border
    c_c.number_format = '#,##0'
    
    c_a = ws_dash.cell(row=p_idx, column=7, value=agg_f)
    c_a.font = font_data
    c_a.alignment = align_center
    c_a.border = thin_border
    c_a.number_format = '#,##0'
    
    c_t = ws_dash.cell(row=p_idx, column=8, value=test_day)
    c_t.font = font_data_italic
    c_t.alignment = align_left
    c_t.border = thin_border
    ws_dash.row_dimensions[p_idx].height = 24

adjust_col_widths(ws_dash, min_widths={'A': 4, 'B': 26, 'C': 20, 'D': 22, 'E': 22, 'F': 22, 'G': 20, 'H': 20, 'I': 22})

# =============================================================
# SHEET 2: MASTER PROGRAM (FLAT TABLE - ALL 259 EXERCISES)
# =============================================================
ws_master = wb.create_sheet(title='Master Program (All Weeks)')
ws_master.views.sheetView[0].showGridLines = True
ws_master.freeze_panes = 'A4'

ws_master.merge_cells('A1:P1')
ws_master['A1'] = 'CHIKO_LIFTS : MASTER 13-WEEK TRAINING PROGRAM LOG'
ws_master['A1'].font = font_title
ws_master['A1'].fill = fill_header
ws_master['A1'].alignment = align_center
ws_master.row_dimensions[1].height = 30

ws_master.merge_cells('A2:P2')
ws_master['A2'] = 'All 13 Weeks, 65 Sessions & 259 Exercises — Live Dynamic Prescribed Load Formulas Linked to Setup & Dashboard TM'
ws_master['A2'].font = font_subtitle
ws_master['A2'].fill = fill_header
ws_master['A2'].alignment = align_center
ws_master.row_dimensions[2].height = 20

master_headers = [
    'Week', 'Phase', 'Day #', 'Day Label / Focus', 'Ex #',
    'Exercise Name', 'Type', 'Lift Ref', 'Sets', 'Reps',
    '% TM', 'Prescribed Load (lbs)', 'Target RPE', 'Prescription / Coaching Notes',
    'Actual Load (lbs)', 'Actual Reps / Notes'
]

for col_idx, h in enumerate(master_headers, start=1):
    cell = ws_master.cell(row=3, column=col_idx, value=h)
    cell.font = font_tbl_header
    cell.fill = fill_sub_header
    cell.alignment = align_header
    cell.border = header_border
ws_master.row_dimensions[3].height = 26

csv_master_rows = [master_headers]

row_num = 4
for w in program_data:
    w_num = w['week']
    phase = w['phase']
    p_info = PHASE_COLORS.get(phase, {'bg': 'FFFFFF', 'text': '000000', 'border': BORDER_GRAY})
    
    for d in w['days']:
        d_num = d['day']
        d_notes = d.get('notes', f'Day {d_num}')
        
        for ex_idx, ex in enumerate(d['exercises'], start=1):
            is_main = ex.get('isMain', False)
            lift = ex.get('lift', '')
            percent = ex.get('percent', None)
            sets = ex.get('sets', '')
            reps = ex.get('reps', '')
            rpe = ex.get('rpe', '')
            ex_notes = ex.get('notes', '')
            
            # Special handling for Week 13 attempts
            if w_num == 13 and d_num in [2, 3, 4, 5] and not sets:
                sets = '2 Attempts' if lift == 'rackPull' else '3 Attempts'
                reps = '1 (Single)'
                
            tm_cell_ref = None
            if lift == 'squat': tm_cell_ref = "'Setup & Dashboard'!$E$7"
            elif lift == 'bench': tm_cell_ref = "'Setup & Dashboard'!$E$8"
            elif lift == 'deadlift': tm_cell_ref = "'Setup & Dashboard'!$E$9"
            elif lift == 'rackPull': tm_cell_ref = "'Setup & Dashboard'!$E$10"
            
            if percent and tm_cell_ref:
                weight_formula = f"=ROUND({tm_cell_ref}*{percent}/5, 0)*5"
            else:
                weight_formula = ""
                
            c_w = ws_master.cell(row=row_num, column=1, value=w_num)
            c_w.font = font_data_bold
            c_w.alignment = align_center
            c_w.border = light_border
            
            c_p = ws_master.cell(row=row_num, column=2, value=phase)
            c_p.font = Font(name='Segoe UI', size=9, bold=True, color=p_info['text'])
            c_p.fill = PatternFill(start_color=p_info['bg'], end_color=p_info['bg'], fill_type='solid')
            c_p.alignment = align_center
            c_p.border = light_border
            
            c_d = ws_master.cell(row=row_num, column=3, value=d_num)
            c_d.font = font_data
            c_d.alignment = align_center
            c_d.border = light_border
            
            c_dl = ws_master.cell(row=row_num, column=4, value=d_notes)
            c_dl.font = font_data
            c_dl.alignment = align_left
            c_dl.border = light_border
            
            c_ord = ws_master.cell(row=row_num, column=5, value=ex_idx)
            c_ord.font = font_data_muted
            c_ord.alignment = align_center
            c_ord.border = light_border
            
            c_name = ws_master.cell(row=row_num, column=6, value=ex['name'])
            c_name.font = font_data_bold if is_main else font_data
            c_name.alignment = align_left
            c_name.border = light_border
            if is_main:
                c_name.fill = fill_main
                
            c_type = ws_master.cell(row=row_num, column=7, value='Main Lift' if is_main else 'Accessory')
            c_type.font = Font(name='Segoe UI', size=9, bold=is_main, color='B45309' if is_main else '64748B')
            c_type.alignment = align_center
            c_type.border = light_border
            if is_main:
                c_type.fill = fill_main
                
            c_lift = ws_master.cell(row=row_num, column=8, value=lift.upper() if lift else '-')
            c_lift.font = font_data_muted
            c_lift.alignment = align_center
            c_lift.border = light_border
            
            c_sets = ws_master.cell(row=row_num, column=9, value=sets)
            c_sets.font = font_data_bold if is_main else font_data
            c_sets.alignment = align_center
            c_sets.border = light_border
            
            c_reps = ws_master.cell(row=row_num, column=10, value=reps)
            c_reps.font = font_data_bold if is_main else font_data
            c_reps.alignment = align_center
            c_reps.border = light_border
            
            c_pct = ws_master.cell(row=row_num, column=11, value=percent if percent else '')
            c_pct.font = font_data_bold if is_main else font_data
            c_pct.alignment = align_center
            c_pct.border = light_border
            if percent:
                c_pct.number_format = '0%'
                
            c_wt = ws_master.cell(row=row_num, column=12, value=weight_formula)
            c_wt.font = Font(name='Segoe UI', size=11, bold=True, color='16A34A') if weight_formula else font_data
            c_wt.alignment = align_center
            c_wt.border = light_border
            if weight_formula:
                c_wt.number_format = '#,##0'
                c_wt.fill = PatternFill(start_color='F0FDF4', end_color='F0FDF4', fill_type='solid')
                
            c_rpe = ws_master.cell(row=row_num, column=13, value=f"RPE {rpe}" if rpe else '')
            c_rpe.font = font_data_bold if rpe else font_data_muted
            c_rpe.alignment = align_center
            c_rpe.border = light_border
            
            c_notes = ws_master.cell(row=row_num, column=14, value=ex_notes)
            c_notes.font = font_data_italic if ex_notes else font_data_muted
            c_notes.alignment = align_left
            c_notes.border = light_border
            
            # User Logging Columns
            c_act_wt = ws_master.cell(row=row_num, column=15, value="")
            c_act_wt.border = thin_border
            c_act_wt.alignment = align_center
            c_act_wt.font = font_data_bold
            
            c_act_reps = ws_master.cell(row=row_num, column=16, value="")
            c_act_reps.border = thin_border
            c_act_reps.alignment = align_left
            c_act_reps.font = font_data
            
            if not is_main and row_num % 2 == 1:
                for c_col in [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13]:
                    ws_master.cell(row=row_num, column=c_col).fill = fill_zebra
                    
            ws_master.row_dimensions[row_num].height = 22
            
            # Prepare row for CSV
            csv_master_rows.append([
                w_num, phase, d_num, d_notes, ex_idx,
                ex['name'], 'Main Lift' if is_main else 'Accessory', lift.upper() if lift else '',
                sets, reps, f"{int(percent*100)}%" if percent else '', '', f"RPE {rpe}" if rpe else '',
                ex_notes, '', ''
            ])
            row_num += 1

adjust_col_widths(ws_master, min_widths={
    'A': 8, 'B': 22, 'C': 8, 'D': 34, 'E': 6,
    'F': 28, 'G': 12, 'H': 12, 'I': 10, 'J': 14,
    'K': 10, 'L': 20, 'M': 14, 'N': 44, 'O': 16, 'P': 24
})

# =============================================================
# BLOCK SHEETS BUILDER HELPER
# =============================================================
def build_block_sheet(wb, title, week_start, week_end, subtitle):
    ws = wb.create_sheet(title=title)
    ws.views.sheetView[0].showGridLines = True
    
    ws.merge_cells('A1:L1')
    ws['A1'] = f"CHIKO_LIFTS : {title.upper()} (WEEKS {week_start}–{week_end})"
    ws['A1'].font = font_title
    ws['A1'].fill = fill_header
    ws['A1'].alignment = align_center
    ws.row_dimensions[1].height = 30
    
    ws.merge_cells('A2:L2')
    ws['A2'] = subtitle
    ws['A2'].font = font_subtitle
    ws['A2'].fill = fill_header
    ws['A2'].alignment = align_center
    ws.row_dimensions[2].height = 20
    
    current_row = 4
    
    for w in program_data:
        if not (week_start <= w['week'] <= week_end):
            continue
            
        w_num = w['week']
        phase = w['phase']
        p_info = PHASE_COLORS.get(phase, {'bg': 'FFFFFF', 'text': '000000', 'border': BORDER_GRAY})
        
        # Week Header Banner
        ws.merge_cells(start_row=current_row, start_column=1, end_row=current_row, end_column=12)
        w_banner = ws.cell(row=current_row, column=1, value=f"WEEK {w_num} — {phase.upper()}")
        w_banner.font = Font(name='Segoe UI', size=13, bold=True, color=p_info['text'])
        w_banner.fill = PatternFill(start_color=p_info['bg'], end_color=p_info['bg'], fill_type='solid')
        w_banner.alignment = align_left
        w_banner.border = thin_border
        ws.row_dimensions[current_row].height = 26
        current_row += 1
        
        for d in w['days']:
            d_num = d['day']
            day_key = f"{w_num}-{d_num}"
            d_notes = d.get('notes', f"Day {d_num}")
            explanation = day_explanations.get(day_key, "")
            
            # Day Header
            ws.merge_cells(start_row=current_row, start_column=1, end_row=current_row, end_column=12)
            d_banner = ws.cell(row=current_row, column=1, value=f"Day {d_num} : {d_notes}")
            d_banner.font = font_card_header
            d_banner.fill = PatternFill(start_color='E2E8F0', end_color='E2E8F0', fill_type='solid')
            d_banner.alignment = align_left
            d_banner.border = thin_border
            ws.row_dimensions[current_row].height = 22
            current_row += 1
            
            # Coaching Rationale Box
            if explanation:
                ws.merge_cells(start_row=current_row, start_column=1, end_row=current_row, end_column=12)
                exp_cell = ws.cell(row=current_row, column=1, value=f"💡 Coaching Rationale: {explanation}")
                exp_cell.font = Font(name='Segoe UI', size=9, italic=True, color='1E3A8A')
                exp_cell.fill = PatternFill(start_color='EFF6FF', end_color='EFF6FF', fill_type='solid')
                exp_cell.alignment = align_left
                exp_cell.border = thin_border
                lines = len(explanation) // 100 + 1
                ws.row_dimensions[current_row].height = max(26, lines * 16)
                current_row += 1
                
            # Table Header
            tbl_h = ['#', 'Exercise', 'Type', 'Sets', 'Reps', '% TM', 'Prescribed Weight', 'Target RPE', 'Prescription Notes', 'Actual Weight', 'Actual Reps', 'Done?']
            for c_i, h_name in enumerate(tbl_h, start=1):
                c = ws.cell(row=current_row, column=c_i, value=h_name)
                c.font = Font(name='Segoe UI', size=9, bold=True, color=WHITE)
                c.fill = fill_sub_header
                c.alignment = align_header
                c.border = header_border
            ws.row_dimensions[current_row].height = 22
            current_row += 1
            
            # Exercises
            for e_idx, ex in enumerate(d['exercises'], start=1):
                is_main = ex.get('isMain', False)
                lift = ex.get('lift', '')
                percent = ex.get('percent', None)
                sets = ex.get('sets', '')
                reps = ex.get('reps', '')
                rpe = ex.get('rpe', '')
                ex_notes = ex.get('notes', '')
                
                # Special handling for Week 13 attempts
                if w_num == 13 and d_num in [2, 3, 4, 5] and not sets:
                    sets = '2 Attempts' if lift == 'rackPull' else '3 Attempts'
                    reps = '1 (Single)'
                
                tm_ref = None
                if lift == 'squat': tm_ref = "'Setup & Dashboard'!$E$7"
                elif lift == 'bench': tm_ref = "'Setup & Dashboard'!$E$8"
                elif lift == 'deadlift': tm_ref = "'Setup & Dashboard'!$E$9"
                elif lift == 'rackPull': tm_ref = "'Setup & Dashboard'!$E$10"
                
                weight_f = f"=ROUND({tm_ref}*{percent}/5, 0)*5" if (percent and tm_ref) else ""
                
                ws.cell(row=current_row, column=1, value=e_idx).alignment = align_center
                ws.cell(row=current_row, column=1).border = light_border
                ws.cell(row=current_row, column=1).font = font_data_muted
                
                c_name = ws.cell(row=current_row, column=2, value=ex['name'])
                c_name.alignment = align_left
                c_name.border = light_border
                c_name.font = font_data_bold if is_main else font_data
                if is_main: c_name.fill = fill_main
                
                c_type = ws.cell(row=current_row, column=3, value='MAIN' if is_main else 'Acc')
                c_type.alignment = align_center
                c_type.border = light_border
                c_type.font = Font(name='Segoe UI', size=8, bold=is_main, color='B45309' if is_main else '64748B')
                if is_main: c_type.fill = fill_main
                
                c_s = ws.cell(row=current_row, column=4, value=sets)
                c_s.alignment = align_center
                c_s.border = light_border
                c_s.font = font_data_bold if is_main else font_data
                
                c_r = ws.cell(row=current_row, column=5, value=reps)
                c_r.alignment = align_center
                c_r.border = light_border
                c_r.font = font_data_bold if is_main else font_data
                
                c_p = ws.cell(row=current_row, column=6, value=percent if percent else "")
                c_p.alignment = align_center
                c_p.border = light_border
                c_p.font = font_data_bold if is_main else font_data
                if percent: c_p.number_format = '0%'
                
                c_w = ws.cell(row=current_row, column=7, value=weight_f)
                c_w.alignment = align_center
                c_w.border = light_border
                c_w.font = Font(name='Segoe UI', size=11, bold=True, color='16A34A') if weight_f else font_data
                if weight_f:
                    c_w.number_format = '#,##0'
                    c_w.fill = PatternFill(start_color='F0FDF4', end_color='F0FDF4', fill_type='solid')
                    
                c_rpe = ws.cell(row=current_row, column=8, value=f"RPE {rpe}" if rpe else "")
                c_rpe.alignment = align_center
                c_rpe.border = light_border
                c_rpe.font = font_data_bold if rpe else font_data_muted
                
                c_n = ws.cell(row=current_row, column=9, value=ex_notes)
                c_n.alignment = align_left
                c_n.border = light_border
                c_n.font = font_data_italic if ex_notes else font_data_muted
                
                # Tracking columns
                c_act_w = ws.cell(row=current_row, column=10, value="")
                c_act_w.border = thin_border
                c_act_w.alignment = align_center
                c_act_w.font = font_data_bold
                
                c_act_r = ws.cell(row=current_row, column=11, value="")
                c_act_r.border = thin_border
                c_act_r.alignment = align_center
                c_act_r.font = font_data
                
                c_chk = ws.cell(row=current_row, column=12, value="")
                c_chk.border = thin_border
                c_chk.alignment = align_center
                c_chk.font = font_data_bold
                
                if not is_main and current_row % 2 == 1:
                    for col_k in [1, 4, 5, 6, 8]:
                        ws.cell(row=current_row, column=col_k).fill = fill_zebra
                        
                ws.row_dimensions[current_row].height = 20
                current_row += 1
                
            current_row += 1
        current_row += 1
        
    adjust_col_widths(ws, min_widths={
        'A': 5, 'B': 26, 'C': 10, 'D': 10, 'E': 12,
        'F': 10, 'G': 18, 'H': 12, 'I': 38, 'J': 15, 'K': 15, 'L': 10
    })

# Build the 3 Block Sheets
build_block_sheet(wb, 'Block 1 (W1-5)', 1, 5, 'Accumulation Base (W1-3) ➔ Volume Peak (W4) ➔ Deload (W5)')
build_block_sheet(wb, 'Block 2 (W6-10)', 6, 10, 'Intensification Doubles (W6-8) ➔ Top of Intensification (W9) ➔ Deload (W10)')
build_block_sheet(wb, 'Block 3 (W11-13)', 11, 13, 'Peak / Realization (W11) ➔ FINAL FORM Taper (W12) ➔ Testing Window PRs (W13)')

# =============================================================
# SHEET 5b: DEDICATED WEEK 13 PR TESTING PROTOCOL SHEET
# =============================================================
ws_test = wb.create_sheet(title='Week 13 PR Testing Plan')
ws_test.views.sheetView[0].showGridLines = True

ws_test.merge_cells('A1:J1')
ws_test['A1'] = 'CHIKO_LIFTS : WEEK 13 PR TESTING WINDOW & ATTEMPT SELECTOR'
ws_test['A1'].font = font_title
ws_test['A1'].fill = fill_header
ws_test['A1'].alignment = align_center
ws_test.row_dimensions[1].height = 30

ws_test.merge_cells('A2:J2')
ws_test['A2'] = 'Strategic 5-Day Testing Architecture — Structured Rest Intervals & Calculated 3-Attempt Progression'
ws_test['A2'].font = font_subtitle
ws_test['A2'].fill = fill_header
ws_test['A2'].alignment = align_center
ws_test.row_dimensions[2].height = 20

# Overview notes
ws_test.merge_cells('A4:J4')
ws_test['A4'] = 'TESTING RULES & ATTEMPT STRATEGY'
ws_test['A4'].font = font_section

test_rules_text = (
    "• Separation Rule: Never test multiple max lifts on consecutive days. Bench tested first (fastest recovery), "
    "followed by 1 rest day before Squat, 2 rest days before Deadlift, and 2 rest days before Rack Pull.\n"
    "• Opener (~90% TM): Must be a weight you can triple on your worst day. Serves as confidence builder and ensures a solid number on the board.\n"
    "• 2nd Attempt (~100% TM / previous 1RM): A smooth, aggressive attempt to equal or slightly top your old best.\n"
    "• 3rd Attempt (PR Target): Based on how fast Attempt 2 moved. Jump 5-15 lbs to set your brand new all-time Personal Record."
)
ws_test.merge_cells('A5:J6')
ws_test['A5'] = test_rules_text
ws_test['A5'].font = font_data
ws_test['A5'].alignment = align_left
ws_test['A5'].fill = fill_card
ws_test['A5'].border = thin_border
ws_test.row_dimensions[5].height = 36
ws_test.row_dimensions[6].height = 36

# Table for PR Sessions
test_headers = [
    'Test Day', 'Lift Scheduled', 'Rest Prior', 'Opener (90% TM)', 'Attempt 2 Target',
    'Attempt 3 (PR Target)', 'Warm-up Primer', 'Plate Loading (Opener)', 'Coaching Strategy & Notes', 'Actual PR Result'
]
for c_i, h in enumerate(test_headers, start=1):
    c = ws_test.cell(row=8, column=c_i, value=h)
    c.font = font_tbl_header
    c.fill = fill_sub_header
    c.alignment = align_header
    c.border = header_border
ws_test.row_dimensions[8].height = 26

test_sessions_data = [
    ('Day 1 (Day A)', 'Light Activation (Squat + Bench)', 'Follows Taper', '=ROUND(\'Setup & Dashboard\'!$E$7*0.5/5, 0)*5', '=ROUND(\'Setup & Dashboard\'!$E$8*0.5/5, 0)*5', '-', 'Bar x 10, 50% 2x3', 'N/A', 'Neural priming only. Move crisp and fast. Zero fatigue.', 'Ready'),
    ('Day 2 (Day B)', 'Bench Press PR', '1 Rest Day', '=ROUND(\'Setup & Dashboard\'!$E$8*0.9/5, 0)*5', '=ROUND(\'Setup & Dashboard\'!$C$8/5, 0)*5', '=ROUND(\'Setup & Dashboard\'!$C$8*1.05/5, 0)*5', '45x10, 95x5, 135x3, 185x1', '45 + plates / side', 'Bench recovers fastest. Hit opener, take small jump, then attack PR.', ''),
    ('Day 3 (Day C)', 'Back Squat PR', '1 Rest Day', '=ROUND(\'Setup & Dashboard\'!$E$7*0.9/5, 0)*5', '=ROUND(\'Setup & Dashboard\'!$C$7/5, 0)*5', '=ROUND(\'Setup & Dashboard\'!$C$7*1.05/5, 0)*5', '45x10, 135x5, 225x3, 275x1', '45 + plates / side', 'Opener will feel light if taper was respected. Stay tight in hole.', ''),
    ('Day 4 (Day D)', 'Deadlift PR', '2 Full Rest Days', '=ROUND(\'Setup & Dashboard\'!$E$9*0.9/5, 0)*5', '=ROUND(\'Setup & Dashboard\'!$C$9/5, 0)*5', '=ROUND(\'Setup & Dashboard\'!$C$9*1.05/5, 0)*5', '135x5, 225x3, 315x1, 350x1', '45 + plates / side', 'Two full rest days pay down spinal fatigue. Lock lats, push floor away.', ''),
    ('Day 5 (Day E)', 'Rack Pull PR', '2 Full Rest Days', '=ROUND(\'Setup & Dashboard\'!$E$10*0.9/5, 0)*5', '=ROUND(\'Setup & Dashboard\'!$E$10*1.03/5, 0)*5', '=ROUND(\'Setup & Dashboard\'!$E$10*1.06/5, 0)*5', '135x5, 225x3, 315x2, 405x1', '45 + plates / side', 'Separated by 2 full rest days from DL. Test mid-shin starting strength.', ''),
]

for idx, (t_day, t_lift, t_rest, op_f, a2_f, a3_f, wm_txt, pl_txt, strat_txt, res_txt) in enumerate(test_sessions_data, start=9):
    ws_test.cell(row=idx, column=1, value=t_day).font = font_data_bold
    ws_test.cell(row=idx, column=1).alignment = align_center
    ws_test.cell(row=idx, column=1).border = thin_border
    
    c_l = ws_test.cell(row=idx, column=2, value=t_lift)
    c_l.font = font_data_bold
    c_l.alignment = align_left
    c_l.border = thin_border
    c_l.fill = PatternFill(start_color='FEF08A', end_color='FEF08A', fill_type='solid')
    
    ws_test.cell(row=idx, column=3, value=t_rest).font = font_data_muted
    ws_test.cell(row=idx, column=3).alignment = align_center
    ws_test.cell(row=idx, column=3).border = thin_border
    
    c_op = ws_test.cell(row=idx, column=4, value=op_f)
    c_op.font = Font(name='Segoe UI', size=11, bold=True, color='16A34A')
    c_op.alignment = align_center
    c_op.border = thin_border
    if op_f != '-':
        c_op.number_format = '#,##0'
        c_op.fill = PatternFill(start_color='F0FDF4', end_color='F0FDF4', fill_type='solid')
        
    c_a2 = ws_test.cell(row=idx, column=5, value=a2_f)
    c_a2.font = Font(name='Segoe UI', size=11, bold=True, color='0284C7')
    c_a2.alignment = align_center
    c_a2.border = thin_border
    if a2_f != '-':
        c_a2.number_format = '#,##0'
        c_a2.fill = PatternFill(start_color='F0F9FF', end_color='F0F9FF', fill_type='solid')
        
    c_a3 = ws_test.cell(row=idx, column=6, value=a3_f)
    c_a3.font = Font(name='Segoe UI', size=12, bold=True, color='DC2626')
    c_a3.alignment = align_center
    c_a3.border = thin_border
    if a3_f != '-':
        c_a3.number_format = '#,##0'
        c_a3.fill = PatternFill(start_color='FEF2F2', end_color='FEF2F2', fill_type='solid')
        
    ws_test.cell(row=idx, column=7, value=wm_txt).font = font_data
    ws_test.cell(row=idx, column=7).alignment = align_left
    ws_test.cell(row=idx, column=7).border = thin_border
    
    ws_test.cell(row=idx, column=8, value=pl_txt).font = font_data_muted
    ws_test.cell(row=idx, column=8).alignment = align_center
    ws_test.cell(row=idx, column=8).border = thin_border
    
    ws_test.cell(row=idx, column=9, value=strat_txt).font = font_data_italic
    ws_test.cell(row=idx, column=9).alignment = align_left
    ws_test.cell(row=idx, column=9).border = thin_border
    
    c_res = ws_test.cell(row=idx, column=10, value=res_txt)
    c_res.font = font_data_bold
    c_res.alignment = align_center
    c_res.border = thin_border
    
    ws_test.row_dimensions[idx].height = 28

adjust_col_widths(ws_test, min_widths={
    'A': 16, 'B': 24, 'C': 16, 'D': 18, 'E': 18, 'F': 20,
    'G': 26, 'H': 20, 'I': 45, 'J': 18
})

# =============================================================
# SHEET 6: COMPLETE COACHING COMPENDIUM (ALL 65 EXPLANATIONS)
# =============================================================
ws_guide = wb.create_sheet(title='Coaching Guide (65 Sessions)')
ws_guide.views.sheetView[0].showGridLines = True
ws_guide.freeze_panes = 'A4'

ws_guide.merge_cells('A1:G1')
ws_guide['A1'] = 'CHIKO_LIFTS : COMPLETE COACHING COMPENDIUM & SESSION RATIONALE'
ws_guide['A1'].font = font_title
ws_guide['A1'].fill = fill_header
ws_guide['A1'].alignment = align_center
ws_guide.row_dimensions[1].height = 30

ws_guide.merge_cells('A2:G2')
ws_guide['A2'] = 'The Biomechanical & Periodization Logic Behind Every Single Day of the 13-Week System'
ws_guide['A2'].font = font_subtitle
ws_guide['A2'].fill = fill_header
ws_guide['A2'].alignment = align_center
ws_guide.row_dimensions[2].height = 20

guide_headers = ['Week', 'Phase', 'Day #', 'Day Label / Focus', 'Primary Lifts Programmed', 'Session Fatigue Profile', 'Detailed Coaching Rationale & Programming Architecture']
for col_idx, h in enumerate(guide_headers, start=1):
    c = ws_guide.cell(row=3, column=col_idx, value=h)
    c.font = font_tbl_header
    c.fill = fill_sub_header
    c.alignment = align_header
    c.border = header_border
ws_guide.row_dimensions[3].height = 26

csv_guide_rows = [guide_headers]

guide_row = 4
for w in program_data:
    w_num = w['week']
    phase = w['phase']
    p_info = PHASE_COLORS.get(phase, {'bg': 'FFFFFF', 'text': '000000', 'border': BORDER_GRAY})
    
    for d in w['days']:
        d_num = d['day']
        day_key = f"{w_num}-{d_num}"
        d_notes = d.get('notes', f"Day {d_num}")
        explanation = day_explanations.get(day_key, "Rest / Recovery or specific testing guidance.")
        
        main_lifts = [ex['name'] for ex in d['exercises'] if ex.get('isMain')]
        main_str = " / ".join(main_lifts) if main_lifts else "Accessories / Deload"
        
        if 'Deload' in phase:
            fatigue = "Low (Fatigue Dissipation)"
        elif 'Peak' in phase or 'Top' in phase:
            fatigue = "High (Supercompensation Trigger)"
        elif 'Taper' in phase:
            fatigue = "Moderate-Low (Sharpening)"
        elif 'Testing' in phase:
            fatigue = "Max Effort (Attempt Day)"
        else:
            fatigue = "Moderate (Systemic Loading)"
            
        c_w = ws_guide.cell(row=guide_row, column=1, value=w_num)
        c_w.font = font_data_bold
        c_w.alignment = align_center
        c_w.border = light_border
        
        c_p = ws_guide.cell(row=guide_row, column=2, value=phase)
        c_p.font = Font(name='Segoe UI', size=9, bold=True, color=p_info['text'])
        c_p.fill = PatternFill(start_color=p_info['bg'], end_color=p_info['bg'], fill_type='solid')
        c_p.alignment = align_center
        c_p.border = light_border
        
        c_d = ws_guide.cell(row=guide_row, column=3, value=d_num)
        c_d.font = font_data
        c_d.alignment = align_center
        c_d.border = light_border
        
        c_dl = ws_guide.cell(row=guide_row, column=4, value=d_notes)
        c_dl.font = font_data_bold
        c_dl.alignment = align_left
        c_dl.border = light_border
        
        c_ml = ws_guide.cell(row=guide_row, column=5, value=main_str)
        c_ml.font = font_data
        c_ml.alignment = align_left
        c_ml.border = light_border
        
        c_f = ws_guide.cell(row=guide_row, column=6, value=fatigue)
        c_f.font = font_data_muted
        c_f.alignment = align_center
        c_f.border = light_border
        
        c_exp = ws_guide.cell(row=guide_row, column=7, value=explanation)
        c_exp.font = font_data
        c_exp.alignment = align_left
        c_exp.border = light_border
        
        if guide_row % 2 == 1:
            for c_col in [1, 3, 4, 5, 6]:
                ws_guide.cell(row=guide_row, column=c_col).fill = fill_zebra
                
        lines = len(explanation) // 90 + 1
        ws_guide.row_dimensions[guide_row].height = max(28, lines * 16)
        
        csv_guide_rows.append([w_num, phase, d_num, d_notes, main_str, fatigue, explanation])
        guide_row += 1

adjust_col_widths(ws_guide, min_widths={
    'A': 8, 'B': 22, 'C': 8, 'D': 30, 'E': 26, 'F': 24, 'G': 75
})

# =============================================================
# SHEET 7: PLATE & WARM-UP CALCULATOR REFERENCE
# =============================================================
ws_calc = wb.create_sheet(title='Plate & Warm-up Reference')
ws_calc.views.sheetView[0].showGridLines = True

ws_calc.merge_cells('A1:J1')
ws_calc['A1'] = 'CHIKO_LIFTS : BARBELL PLATE LOADING & WARM-UP PROTOCOLS'
ws_calc['A1'].font = font_title
ws_calc['A1'].fill = fill_header
ws_calc['A1'].alignment = align_center
ws_calc.row_dimensions[1].height = 30

ws_calc.merge_cells('A2:J2')
ws_calc['A2'] = 'Standard Olympic Bar (45 lbs) Plate Pair Configurations & Algorithmic Warm-up Ladders'
ws_calc['A2'].font = font_subtitle
ws_calc['A2'].fill = fill_header
ws_calc['A2'].alignment = align_center
ws_calc.row_dimensions[2].height = 20

# Section A: Plate Loading Chart
ws_calc.merge_cells('A4:F4')
ws_calc['A4'] = 'A. BARBELL PLATE LOADING REFERENCE (PER SIDE ON 45 LB BAR)'
ws_calc['A4'].font = font_section

plate_headers = ['Total Weight (lbs)', 'Weight Per Side (lbs)', '45 lb Plates', '35 / 25 lb Plates', '10 / 5 / 2.5 lb Plates', 'Full Loading Summary']
for c_i, h in enumerate(plate_headers, start=1):
    c = ws_calc.cell(row=5, column=c_i, value=h)
    c.font = font_tbl_header
    c.fill = fill_sub_header
    c.alignment = align_header
    c.border = header_border
ws_calc.row_dimensions[5].height = 24

def calc_plates(weight):
    if weight <= 45: return 0, 0, 0, 0, 0, 0, "Empty Bar (45 lbs)"
    per_side = (weight - 45) / 2
    rem = per_side
    p45 = int(rem // 45); rem %= 45
    p35 = int(rem // 35); rem %= 35
    p25 = int(rem // 25); rem %= 25
    p10 = int(rem // 10); rem %= 10
    p5 = int(rem // 5); rem %= 5
    p25_fraction = round(rem / 2.5)
    
    parts = []
    if p45: parts.append(f"{p45}x45")
    if p35: parts.append(f"{p35}x35")
    if p25: parts.append(f"{p25}x25")
    if p10: parts.append(f"{p10}x10")
    if p5: parts.append(f"{p5}x5")
    if p25_fraction: parts.append(f"{p25_fraction}x2.5")
    summary = " + ".join(parts) + " / side"
    return p45, p35, p25, p10, p5, p25_fraction, summary

weights_to_show = [
    95, 115, 135, 155, 175, 185, 205, 215, 225, 245, 265, 275, 295, 305, 315,
    335, 355, 365, 385, 405, 425, 445, 455, 475, 495, 515, 535, 545, 565, 585
]

for idx, w in enumerate(weights_to_show, start=6):
    p45, p35, p25, p10, p5, p25_frac, summ = calc_plates(w)
    
    ws_calc.cell(row=idx, column=1, value=w).font = font_data_bold
    ws_calc.cell(row=idx, column=1).alignment = align_center
    ws_calc.cell(row=idx, column=1).border = light_border
    
    ws_calc.cell(row=idx, column=2, value=(w-45)/2).font = font_data
    ws_calc.cell(row=idx, column=2).alignment = align_center
    ws_calc.cell(row=idx, column=2).border = light_border
    
    ws_calc.cell(row=idx, column=3, value=f"{p45} plate(s)" if p45 else "-").font = font_data_bold if p45 else font_data_muted
    ws_calc.cell(row=idx, column=3).alignment = align_center
    ws_calc.cell(row=idx, column=3).border = light_border
    if p45 >= 2:
        ws_calc.cell(row=idx, column=3).fill = PatternFill(start_color='FEF2F2', end_color='FEF2F2', fill_type='solid')
        
    med_plates = []
    if p35: med_plates.append(f"{p35}x 35")
    if p25: med_plates.append(f"{p25}x 25")
    ws_calc.cell(row=idx, column=4, value=", ".join(med_plates) if med_plates else "-").font = font_data if med_plates else font_data_muted
    ws_calc.cell(row=idx, column=4).alignment = align_center
    ws_calc.cell(row=idx, column=4).border = light_border
    
    small_plates = []
    if p10: small_plates.append(f"{p10}x 10")
    if p5: small_plates.append(f"{p5}x 5")
    if p25_frac: small_plates.append(f"{p25_frac}x 2.5")
    ws_calc.cell(row=idx, column=5, value=", ".join(small_plates) if small_plates else "-").font = font_data if small_plates else font_data_muted
    ws_calc.cell(row=idx, column=5).alignment = align_center
    ws_calc.cell(row=idx, column=5).border = light_border
    
    c_s = ws_calc.cell(row=idx, column=6, value=summ)
    c_s.font = font_data_bold
    c_s.alignment = align_left
    c_s.border = light_border
    
    if idx % 2 == 1:
        for c_k in [1, 2, 4, 5]:
            ws_calc.cell(row=idx, column=c_k).fill = fill_zebra
    ws_calc.row_dimensions[idx].height = 20

# Section B: Warm-up Ladders
ws_calc.merge_cells('H4:J4')
ws_calc['H4'] = 'B. APP WARM-UP LADDER PROTOCOL'
ws_calc['H4'].font = font_section

warmup_headers = ['Step', 'Prescription Target', 'Rep Scheme']
for c_i, h in enumerate(warmup_headers, start=8):
    c = ws_calc.cell(row=5, column=c_i, value=h)
    c.font = font_tbl_header
    c.fill = fill_sub_header
    c.alignment = align_header
    c.border = header_border

warmup_steps = [
    ('Step 1: Empty Bar', '45 lbs', '10 reps (Bar groove)'),
    ('Step 2: 1st Load Jump', 'Bench: 95-135 lbs / Squat & DL: 135-185 lbs', '5 reps (Rhythm)'),
    ('Step 3: Moderate Load', '40% - 60% of Target Working Weight', '5 reps (Speed focus)'),
    ('Step 4: Potentiation', '75% - 80% of Target Working Weight', '3 reps (Zero grind)'),
    ('Step 5: Final Acclimation', '90% of Target Working Weight (if heavy)', '1 rep (Crisp primer)'),
    ('Working Sets', 'Target Programmed Weight & RPE', 'Prescribed Sets x Reps'),
]

for idx, (st, ld, rp) in enumerate(warmup_steps, start=6):
    ws_calc.cell(row=idx, column=8, value=st).font = font_data_bold
    ws_calc.cell(row=idx, column=8).alignment = align_left
    ws_calc.cell(row=idx, column=8).border = thin_border
    
    ws_calc.cell(row=idx, column=9, value=ld).font = font_data
    ws_calc.cell(row=idx, column=9).alignment = align_center
    ws_calc.cell(row=idx, column=9).border = thin_border
    
    ws_calc.cell(row=idx, column=10, value=rp).font = font_data_bold if 'Working' in st else font_data
    ws_calc.cell(row=idx, column=10).alignment = align_left
    ws_calc.cell(row=idx, column=10).border = thin_border
    if 'Working' in st:
        ws_calc.cell(row=idx, column=8).fill = PatternFill(start_color='FEF08A', end_color='FEF08A', fill_type='solid')
        ws_calc.cell(row=idx, column=9).fill = PatternFill(start_color='FEF08A', end_color='FEF08A', fill_type='solid')
        ws_calc.cell(row=idx, column=10).fill = PatternFill(start_color='FEF08A', end_color='FEF08A', fill_type='solid')
    ws_calc.row_dimensions[idx].height = 24

ws_calc.merge_cells('H13:J13')
ws_calc['H13'] = 'COACHING TIP: WARM-UP FATIGUE DISCIPLINE'
ws_calc['H13'].font = font_card_header
ws_calc['H13'].fill = PatternFill(start_color='FEF3C7', end_color='FEF3C7', fill_type='solid')
ws_calc['H13'].border = thin_border

ws_calc.merge_cells('H14:J17')
tip_cell = ws_calc['H14']
tip_cell.value = (
    "• Warm-ups exist to grease the groove, potentiate high-threshold motor units, and check joint readiness.\n"
    "• Never take warm-ups to failure or accumulate unnecessary lactic acid.\n"
    "• Keep rest periods brief on early steps (60s), extending to 2-3 minutes before the final primer single and first working set.\n"
    "• If bar speed slows during warm-ups, heed the 5% autoregulation drop rule on working sets."
)
tip_cell.font = font_data
tip_cell.alignment = align_left
tip_cell.fill = fill_card
tip_cell.border = thin_border

adjust_col_widths(ws_calc, min_widths={
    'A': 20, 'B': 22, 'C': 16, 'D': 20, 'E': 24, 'F': 32,
    'G': 6, 'H': 24, 'I': 36, 'J': 26
})

# Save Workbook
output_filename = 'Chiko_Lifts_13_Week_PR_Program.xlsx'
wb.save(output_filename)
print(f"Workbook successfully saved as '{output_filename}' with {len(wb.sheetnames)} sheets.")

# Also export clean CSVs for versatile access
with open('Chiko_Lifts_Master_Program.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerows(csv_master_rows)
print(f"Master Program CSV saved as 'Chiko_Lifts_Master_Program.csv' ({len(csv_master_rows)-1} rows).")

with open('Chiko_Lifts_Coaching_Guide.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerows(csv_guide_rows)
print(f"Coaching Guide CSV saved as 'Chiko_Lifts_Coaching_Guide.csv' ({len(csv_guide_rows)-1} rows).")
