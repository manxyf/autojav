import json
import os
import re
import urllib.request

# ==================== 配置区 ====================
TARGET_USER = "javlibcom" 
MY_SCRIPT_PATH = "script.user.js"
# ===============================================

def fetch_domain_via_api():
    url = f"https://api.github.com/users/{TARGET_USER}"
    req = urllib.request.Request(url)
    req.add_header("User-Agent", "Mozilla/5.0")
    
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        req.add_header("Authorization", f"token {token}")
        
    try:
        with urllib.request.urlopen(req) as response:
            if response.status != 200:
                raise Exception(f"API 请求失败，HTTP 状态码: {response.status}")
            data = json.loads(response.read().decode('utf-8'))
            blog = data.get("blog")
            if blog:
                return blog.strip()
            else:
                raise Exception("API 返回的数据中 'blog' 字段为空")
    except Exception as e:
        raise Exception(f"访问 GitHub API 时发生异常: {e}")

def update_files(domain_clean):
    # 提取 Host，例如从 https://www.e100k.com 提取出 www.e100k.com
    host = domain_clean.replace("https://", "").replace("http://", "").split("/")[0]
    
    # 1. 保存 domain.txt
    with open("domain.txt", "w", encoding="utf-8") as f:
        f.write(domain_clean)
    print(f"成功更新 domain.txt -> {domain_clean}")
    
    # 2. 如果存在 script.user.js，则修改它的匹配域名和版本号
    if os.path.exists(MY_SCRIPT_PATH):
        with open(MY_SCRIPT_PATH, "r", encoding="utf-8") as f:
            content = f.read()
            
        # 替换元数据中的 @match 为当前最新域名
        new_match_line = f"// @match        *://{host}/cn/*"
        content, count_m = re.subn(r'//\s*@match\s+[^\n]+', new_match_line, content)
        
        # 动态递增版本号：3.7.【GitHub Actions 运行构建号】
        run_number = os.environ.get("GITHUB_RUN_NUMBER", "1")
        new_version_line = f"// @version      3.7.{run_number}"
        content, count_v = re.subn(r'//\s*@version\s+[^\n]+', new_version_line, content)
        
        with open(MY_SCRIPT_PATH, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"成功更新 script.user.js -> @match: {host}, @version: 3.7.{run_number}")
    else:
        print("未找到 script.user.js 文件，跳过脚本规则更新。")

def main():
    try:
        domain = fetch_domain_via_api()
        domain_clean = domain.rstrip('/')
        update_files(domain_clean)
    except Exception as e:
        print(f"运行出错: {e}")
        exit(1)

if __name__ == "__main__":
    main()
