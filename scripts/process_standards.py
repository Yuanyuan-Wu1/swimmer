import pandas as pd
import PyPDF2
import os
import json
import re

def extract_text_from_pdf(pdf_path):
    """从PDF文件中提取文本"""
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
    return text

def parse_time(time_str):
    """解析时间字符串"""
    if not time_str or pd.isna(time_str):
        return None
    
    time_str = str(time_str).strip()
    # 移除所有空格
    time_str = time_str.replace(" ", "")
    
    if ':' in time_str:
        try:
            minutes, seconds = time_str.split(':')
            return f"{int(minutes):02d}:{float(seconds):05.2f}"
        except:
            return None
    else:
        try:
            seconds = float(time_str)
            return f"{seconds:.2f}"
        except:
            return None

def process_motivational_standards(text):
    """处理2028动机性标准数据"""
    standards_by_gender = {
        "BOYS": {},
        "GIRLS": {}
    }
    current_gender = None
    current_age_group = None
    
    # 使用更精确的正则表达式匹配
    event_pattern = r"^(?:SCY\s+)?(\d+)\s*(FR|BK|BR|FL|IM)\s+"
    time_pattern = r"(\d+:[\d.]+|\d+\.?\d*)"
    
    lines = text.split('\n')
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # 检查性别
        if 'boys' in line.lower():
            current_gender = "BOYS"
            continue
        elif 'girls' in line.lower():
            current_gender = "GIRLS" 
            continue
            
        # 检查年龄组
        if '& under' in line.lower() or 'age' in line.lower():
            current_age_group = standardize_age_group(line)
            if current_gender and current_age_group:
                if current_age_group not in standards_by_gender[current_gender]:
                    standards_by_gender[current_gender][current_age_group] = {}
            continue

        # 匹配事件和时间
        event_match = re.match(event_pattern, line)
        if event_match and current_gender and current_age_group:
            times = re.findall(time_pattern, line)
            if len(times) >= 6:  # 确保有足够的时间标准
                event = f"{event_match.group(1)}_{event_match.group(2)}"
                
                # 构建标准数据结构
                standards = {
                    "AAAA": parse_time(times[0]),
                    "AAA": parse_time(times[1]), 
                    "AA": parse_time(times[2]),
                    "A": parse_time(times[3]),
                    "BB": parse_time(times[4]),
                    "B": parse_time(times[5])
                }
                
                standards_by_gender[current_gender][current_age_group][event] = standards
    
    return standards_by_gender

def standardize_age_group(age_text):
    """标准化年龄组格式"""
    age_text = age_text.lower().strip()
    if "10 & under" in age_text or "10&under" in age_text:
        return "10_UNDER"
    elif "11-12" in age_text:
        return "11_12"
    elif "13-14" in age_text:
        return "13_14"
    elif "15-16" in age_text:
        return "15_16"
    elif "17-18" in age_text:
        return "17_18"
    return age_text.replace(" ", "_").replace("&", "").upper()


def main():
    # 设置文件路径
    data_dir = "/Users/yoyowu/NEU/swimmer/data"
    motivational_pdf = "/Users/yoyowu/NEU/swimmer/2028-motivational-standards-age-group.pdf"
    champs_pdf = "/Users/yoyowu/NEU/swimmer/2024-pn-14u-sc-champs-draft-standards-092324-923am_051531.pdf"
    
    # 创建输出目录
    os.makedirs(data_dir, exist_ok=True)
    
    # 提取文本
    print("正在从PDF文件中提取文本...")
    motivational_text = extract_text_from_pdf(motivational_pdf)
    champs_text = extract_text_from_pdf(champs_pdf)
    
    # 处理数据
    print("正在处理动机性标准数据...")
   standards = process_motivational_standards(motivational_text)
    
    # 构建最终的数据结构
    final_data = {
        "BOYS_USA_SWIMMING": {
            "SCY": standards["BOYS"]
        },
        "GIRLS_USA_SWIMMING": {
            "SCY": standards["GIRLS"] 
        }
    }
    
    # 保存为JSON文件
    output_file = os.path.join(data_dir, "swimming_standards.json")
    with open(output_file, 'w') as f:
        json.dump(final_data, f, indent=2)
    
    print(f"数据处理完成，结果已保存到: {output_file}")

if __name__ == "__main__":
    main()
