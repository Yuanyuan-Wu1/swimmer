"""
标准时间数据处理脚本
处理PDF格式的标准时间文档,转换为结构化JSON数据

功能:
- 提取PDF中的标准时间数据
- 转换时间格式(字符串->毫秒)
- 生成标准化的JSON数据
- 支持多种标准时间来源
"""

import pandas as pd
import tabula
import json
import os

def extract_standards_from_pdf(pdf_path):
    """从PDF文件中提取标准时间数据"""
    # 使用tabula读取PDF中的表格
    tables = tabula.read_pdf(pdf_path, pages='all', multiple_tables=True)
    
    standards_data = {
        "AAAA": {},
        "AAA": {},
        "AA": {},
        "A": {},
        "BB": {},
        "B": {}
    }
    
    # 定义游泳项目
    events = [
        "50_FR", "100_FR", "200_FR", "500_FR", "1000_FR", "1650_FR",
        "100_BK", "200_BK",
        "100_BR", "200_BR",
        "100_FL", "200_FL",
        "200_IM", "400_IM"
    ]
    
    # 处理每个表格
    for table in tables:
        # 清理和格式化数据
        df = table.copy()
        df = df.dropna(how='all')
        
        # 提取年龄组和性别信息
        age_group = df.iloc[0][0]  # 假设年龄组在第一行第一列
        gender = "M" if "Boys" in age_group else "F"
        age = age_group.split()[0]  # 提取年龄范围
        
        # 处理每个项目的标准时间
        for event in events:
            if event in df.columns:
                for level in standards_data.keys():
                    time = df[df['Level'] == level][event].values[0]
                    # 格式化时间
                    time = format_time(time)
                    
                    # 存储数据
                    if age not in standards_data[level]:
                        standards_data[level][age] = {}
                    if gender not in standards_data[level][age]:
                        standards_data[level][age][gender] = {}
                    
                    standards_data[level][age][gender][event] = time
    
    return standards_data

def format_time(time_str):
    """格式化时间字符串"""
    # 处理不同格式的时间
    if ':' in str(time_str):
        minutes, seconds = time_str.split(':')
        return f"{int(minutes):02d}:{float(seconds):05.2f}"
    else:
        return f"{float(time_str):05.2f}"

def save_to_csv(standards_data, output_path):
    """将标准时间数据保存为CSV格式"""
    # 创建数据框架
    rows = []
    for level in standards_data:
        for age in standards_data[level]:
            for gender in standards_data[level][age]:
                for event in standards_data[level][age][gender]:
                    rows.append({
                        'Level': level,
                        'Age_Group': age,
                        'Gender': gender,
                        'Event': event,
                        'Time': standards_data[level][age][gender][event]
                    })
    
    df = pd.DataFrame(rows)
    df.to_csv(output_path, index=False)
    print(f"Standards saved to {output_path}")

def save_to_json(standards_data, output_path):
    """将标准时间数据保存为JSON格式"""
    with open(output_path, 'w') as f:
        json.dump(standards_data, f, indent=2)
    print(f"Standards saved to {output_path}")

def main():
    # 设置输入输出路径
    pdf_path = '2024champsstandards.pdf'
    csv_output = 'swimming_standards.csv'
    json_output = 'swimming_standards.json'
    
    # 确保输出目录存在
    os.makedirs('data', exist_ok=True)
    
    # 处理数据
    try:
        print("Extracting standards from PDF...")
        standards_data = extract_standards_from_pdf(pdf_path)
        
        # 保存为CSV和JSON格式
        save_to_csv(standards_data, os.path.join('data', csv_output))
        save_to_json(standards_data, os.path.join('data', json_output))
        
        print("Processing completed successfully!")
        
    except Exception as e:
        print(f"Error processing standards: {str(e)}")

if __name__ == "__main__":
    main()
