import PyPDF2
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import re
import numpy as np
import os
import json

def extract_athlete_times(pdf_path):
    """从运动员PDF中提取比赛成绩,包括日期信息"""
    times_data = []
    
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text = page.extract_text()
            # 使用正则表达式匹配比赛项目、时间和日期
            matches = re.finditer(
                r'(\d{4}-\d{2}-\d{2})\s*(\d+)\s*(FR|BK|BR|FL|IM)\s*(\d+:\d+\.\d+|\d+\.\d+)',
                text
            )
            for match in matches:
                date = match.group(1)
                distance = match.group(2)
                stroke = match.group(3)
                time_str = match.group(4)
                
                # 转换时间格式
                time_seconds = convert_time(time_str)
                
                times_data.append({
                    'Date': datetime.strptime(date, '%Y-%m-%d'),
                    'Event': f'{distance}_{stroke}',
                    'Time': time_seconds,
                    'Time_Display': time_str
                })
    
    return pd.DataFrame(times_data)

def extract_standards(pdf_path):
    """从标准PDF中提取标准时间"""
    standards_data = []
    
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text = page.extract_text()
            # 匹配标准时间
            matches = re.finditer(r'(\d+)\s*(FR|BK|BR|FL|IM)\s*(\d+:\d+\.\d+|\d+\.\d+)', text)
            for match in matches:
                distance = match.group(1)
                stroke = match.group(2)
                time_str = match.group(3)
                
                standards_data.append({
                    'Event': f'{distance}_{stroke}',
                    'Standard': time_str
                })
    
    return pd.DataFrame(standards_data)

def analyze_best_times(athlete_df):
    """分析每个项目的最好成绩"""
    return athlete_df.groupby('Event').agg({
        'Time': 'min',
        'Time_Display': lambda x: x[athlete_df.groupby('Event')['Time'].transform('min') == athlete_df['Time']].iloc[0],
        'Date': lambda x: x[athlete_df.groupby('Event')['Time'].transform('min') == athlete_df['Time']].iloc[0]
    }).reset_index()

def analyze_performance_trends(athlete_df):
    """分析每个项目的成绩趋势"""
    trends = {}
    for event in athlete_df['Event'].unique():
        event_data = athlete_df[athlete_df['Event'] == event].sort_values('Date')
        trends[event] = {
            'dates': event_data['Date'].tolist(),
            'times': event_data['Time'].tolist(),
            'times_display': event_data['Time_Display'].tolist()
        }
    return trends

def convert_time(time_str):
    """转换时间字符串为秒数"""
    if ':' in str(time_str):
        minutes, seconds = time_str.split(':')
        return float(minutes) * 60 + float(seconds)
    return float(time_str)

def plot_performance_comparison(best_times_df, standards_df, athlete_name):
    """绘制最好成绩与标准对比图"""
    plt.figure(figsize=(15, 8))
    
    analysis_df = pd.merge(best_times_df, standards_df, on='Event', how='inner')
    analysis_df['Achievement'] = analysis_df.apply(
        lambda row: 'Achieved' if row['Time'] <= convert_time(row['Standard']) else 'Not Achieved',
        axis=1
    )
    
    # 创建双轴图
    fig, ax1 = plt.subplots(figsize=(15, 8))
    ax2 = ax1.twinx()
    
    # 绘制柱状图
    bars = ax1.bar(
        range(len(analysis_df)),
        analysis_df['Time'],
        color=[
            'green' if achieved == 'Achieved' else 'red' 
            for achieved in analysis_df['Achievement']
        ],
        alpha=0.6
    )
    
    # 绘制标准线
    standards_line = ax2.plot(
        range(len(analysis_df)),
        analysis_df['Standard'].apply(convert_time),
        'b--',
        label='Standard',
        linewidth=2
    )
    
    # 设置图表属性
    ax1.set_title(f'Best Times vs Standards - {athlete_name}')
    ax1.set_xlabel('Events')
    ax1.set_ylabel('Time (seconds)')
    ax2.set_ylabel('Standard Time (seconds)')
    
    plt.xticks(
        range(len(analysis_df)),
        analysis_df['Event'],
        rotation=45
    )
    
    # 添加图例
    ax1.legend(bars, ['Achieved', 'Not Achieved'])
    ax2.legend(standards_line, ['Standard'])
    
    plt.tight_layout()
    plt.savefig(f'analysis_comparison_{athlete_name.lower().replace(" ", "_")}.png')
    plt.close()

def plot_event_trends(trends_data, event, athlete_name):
    """为单个项目绘制成绩趋势图"""
    plt.figure(figsize=(12, 6))
    
    dates = trends_data[event]['dates']
    times = trends_data[event]['times']
    
    plt.plot(dates, times, 'b-o', label='Performance')
    plt.title(f'{event} Performance Trend - {athlete_name}')
    plt.xlabel('Date')
    plt.ylabel('Time (seconds)')
    plt.grid(True)
    
    # 添加趋势线
    z = np.polyfit(range(len(dates)), times, 1)
    p = np.poly1d(z)
    plt.plot(dates, p(range(len(dates))), "r--", label='Trend')
    
    plt.legend()
    plt.xticks(rotation=45)
    plt.tight_layout()
    
    plt.savefig(f'trend_{event}_{athlete_name.lower().replace(" ", "_")}.png')
    plt.close()

def generate_detailed_report(best_times_df, trends_data, standards_df, athlete_name):
    """生成详细分析报告"""
    report = f"""Performance Analysis Report for {athlete_name}
    
Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

Best Times Analysis:
-------------------
"""
    
    analysis_df = pd.merge(best_times_df, standards_df, on='Event', how='inner')
    analysis_df['Achievement'] = analysis_df.apply(
        lambda row: 'Achieved' if row['Time'] <= convert_time(row['Standard']) else 'Not Achieved',
        axis=1
    )
    
    for _, row in analysis_df.iterrows():
        report += f"""
Event: {row['Event']}
Best Time: {row['Time_Display']} (achieved on {row['Date'].strftime('%Y-%m-%d')})
Standard: {row['Standard']}
Achievement: {row['Achievement']}
Number of Attempts: {len(trends_data[row['Event']]['times'])}
Improvement: {trends_data[row['Event']]['times'][0] - min(trends_data[row['Event']]['times']):.2f} seconds
"""
    
    # 保存报告
    with open(f'detailed_report_{athlete_name.lower().replace(" ", "_")}.txt', 'w') as f:
        f.write(report)
    
    return report

def export_analysis_results(athlete_df, best_times_df, trends_data, standards_df, athlete_name):
    """导出分析结果到不同格式"""
    # 创建输出目录
    output_dir = f'analysis_results_{athlete_name.lower().replace(" ", "_")}'
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. Excel格式导出 - 包含多个sheet
    with pd.ExcelWriter(f'{output_dir}/performance_analysis.xlsx') as writer:
        # 所有成绩记录
        athlete_df.to_excel(writer, sheet_name='All_Performances', index=False)
        
        # 最好成绩
        best_times_df.to_excel(writer, sheet_name='Best_Times', index=False)
        
        # 标准时间
        standards_df.to_excel(writer, sheet_name='Standards', index=False)
        
        # 每个项目的趋势数据
        trends_df = pd.DataFrame()
        for event in trends_data:
            event_df = pd.DataFrame({
                'Event': event,
                'Date': trends_data[event]['dates'],
                'Time': trends_data[event]['times'],
                'Time_Display': trends_data[event]['times_display']
            })
            trends_df = pd.concat([trends_df, event_df])
        trends_df.to_excel(writer, sheet_name='Performance_Trends', index=False)
    
    # 2. CSV格式导出 - 分别保存不同的数据
    athlete_df.to_csv(f'{output_dir}/all_performances.csv', index=False)
    best_times_df.to_csv(f'{output_dir}/best_times.csv', index=False)
    standards_df.to_csv(f'{output_dir}/standards.csv', index=False)
    trends_df.to_csv(f'{output_dir}/performance_trends.csv', index=False)
    
    # 3. JSON格式导出 - 完整的分析结果
    analysis_results = {
        'athlete_name': athlete_name,
        'analysis_date': datetime.now().isoformat(),
        'best_times': best_times_df.to_dict(orient='records'),
        'standards': standards_df.to_dict(orient='records'),
        'trends': trends_data,
        'summary': {
            'total_events': len(best_times_df),
            'total_performances': len(athlete_df),
            'achievements': {
                event: {
                    'best_time': row['Time_Display'],
                    'achieved_date': row['Date'].strftime('%Y-%m-%d'),
                    'standard': standards_df[standards_df['Event'] == event]['Standard'].iloc[0],
                    'achieved': row['Time'] <= convert_time(standards_df[standards_df['Event'] == event]['Standard'].iloc[0])
                }
                for event, row in best_times_df.iterrows()
            }
        }
    }
    
    with open(f'{output_dir}/analysis_results.json', 'w') as f:
        json.dump(analysis_results, f, indent=2)
    
    # 4. 生成HTML报告
    html_report = f"""
    <html>
    <head>
        <title>Performance Analysis - {athlete_name}</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; }}
            table {{ border-collapse: collapse; width: 100%; margin-bottom: 20px; }}
            th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
            th {{ background-color: #f2f2f2; }}
            .achieved {{ color: green; }}
            .not-achieved {{ color: red; }}
        </style>
    </head>
    <body>
        <h1>Performance Analysis Report - {athlete_name}</h1>
        <h2>Best Times</h2>
        {best_times_df.to_html(classes='table')}
        
        <h2>Performance Trends</h2>
        {trends_df.to_html(classes='table')}
        
        <h2>Standards</h2>
        {standards_df.to_html(classes='table')}
        
        <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
        <div id="trend-charts"></div>
        <script>
            // 这里可以添加交互式图表的JavaScript代码
        </script>
    </body>
    </html>
    """
    
    with open(f'{output_dir}/analysis_report.html', 'w') as f:
        f.write(html_report)
    
    return output_dir

def main():
    # 设置文件路径
    athlete_pdf = 'ZhuCharlotte.pdf'
    standards_pdf = '2024champsstandards.pdf'
    athlete_name = 'Charlotte Zhu'
    
    # 提取数据
    print("Extracting athlete's performance data...")
    athlete_df = extract_athlete_times(athlete_pdf)
    
    print("Extracting standards data...")
    standards_df = extract_standards(standards_pdf)
    
    # 分析最好成绩
    print("Analyzing best times...")
    best_times_df = analyze_best_times(athlete_df)
    
    # 分析成绩趋势
    print("Analyzing performance trends...")
    trends_data = analyze_performance_trends(athlete_df)
    
    # 生成可视化
    print("Generating visualizations...")
    plot_performance_comparison(best_times_df, standards_df, athlete_name)
    
    for event in trends_data.keys():
        plot_event_trends(trends_data, event, athlete_name)
    
    # 生成报告
    print("Generating detailed report...")
    report = generate_detailed_report(best_times_df, trends_data, standards_df, athlete_name)
    
    # 导出分析结果
    print("\nExporting analysis results...")
    output_dir = export_analysis_results(
        athlete_df,
        best_times_df,
        trends_data,
        standards_df,
        athlete_name
    )
    
    print(f"\nAnalysis results exported to: {output_dir}")
    print("\nExported files:")
    print("1. Excel: performance_analysis.xlsx")
    print("2. CSV files:")
    print("   - all_performances.csv")
    print("   - best_times.csv")
    print("   - standards.csv")
    print("   - performance_trends.csv")
    print("3. JSON: analysis_results.json")
    print("4. HTML Report: analysis_report.html")

if __name__ == "__main__":
    main() 