import pandas as pd
import json
import os

def convert_excel_to_json():
    try:
        # 读取Excel文件
        print('开始读取Excel文件...')
        df = pd.read_excel('出海工具站收藏夹.xlsx')
        
        # 打印Excel的列名
        print('Excel文件的列名:', df.columns.tolist())
        
        # 打印前几行数据
        print('Excel文件的前几行数据:')
        print(df.head())
        
        # 确保数据目录存在
        if not os.path.exists('data'):
            os.makedirs('data')
        
        # 转换数据为JSON格式
        tools = []
        for index, row in df.iterrows():
            # 打印每行数据
            print(f'处理第{index + 1}行数据:', dict(row))
            
            tool = {
                'id': str(index + 1),
                'name': str(row['网站名称']) if pd.notna(row.get('网站名称', '')) else '',
                'url': str(row['网址']) if pd.notna(row.get('网址', '')) else '',
                'description': str(row['备注']) if pd.notna(row.get('备注', '')) else '',
                'category': str(row['类型']) if pd.notna(row.get('类型', '')) else '未分类'
            }
            tools.append(tool)
        
        # 保存为JSON文件
        with open('data/tools.json', 'w', encoding='utf-8') as f:
            json.dump(tools, f, ensure_ascii=False, indent=2)
        
        print('转换完成！数据已保存到 data/tools.json')
        
    except Exception as e:
        print('转换过程中出现错误:', str(e))
        raise

if __name__ == '__main__':
    convert_excel_to_json() 