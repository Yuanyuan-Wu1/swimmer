import csv
import json
import os

# 定义标准时间数据
standards_data = {
    "50_FR": {
        "AAAA": "22.50",
        "AAA": "23.50",
        "AA": "24.50",
        "A": "25.50",
        "BB": "26.50",
        "B": "27.50"
    },
    "100_FR": {
        "AAAA": "49.50",
        "AAA": "51.50",
        "AA": "53.50",
        "A": "55.50",
        "BB": "57.50",
        "B": "59.50"
    },
    "200_FR": {
        "AAAA": "1:48.50",
        "AAA": "1:51.50",
        "AA": "1:54.50",
        "A": "1:57.50",
        "BB": "2:00.50",
        "B": "2:03.50"
    }
}

# 确保目录存在
os.makedirs('backend/data', exist_ok=True)
os.makedirs('frontend/src/data', exist_ok=True)
os.makedirs('scripts/data', exist_ok=True)

# 生成 CSV 文件
with open('scripts/data/standards.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['Event', 'Level', 'Time'])  # 写入表头
    
    for event in standards_data:
        for level, time in standards_data[event].items():
            writer.writerow([event, level, time])

# 生成 JSON 文件 - 同时写入后端和前端目录
for path in ['scripts/data/standards.json', 'backend/data/standards.json', 'frontend/src/data/standards.json']:
    with open(path, 'w') as jsonfile:
        json.dump(standards_data, jsonfile, indent=2)

print("Standards data generated successfully!") 