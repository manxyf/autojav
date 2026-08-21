import json
import os
import urllib.request

# ==================== 配置区 ====================
# 这里填写目标用户的 GitHub 用户名
TARGET_USER = "javlibcom" 
# ===============================================

def fetch_domain_via_api():
    url = f"https://api.github.com/users/{TARGET_USER}"
    
    # 构建请求并伪装 User-Agent
    req = urllib.request.Request(url)
    req.add_header("User-Agent", "Mozilla/5.0")
    
    # 使用 GitHub Actions 运行时的临时 Token，避免触发 API 访问频率限制
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        req.add_header("Authorization", f"token {token}")
        
    try:
        with urllib.request.urlopen(req) as response:
            if response.status != 200:
                raise Exception(f"API 请求失败，HTTP 状态码: {response.status}")
                
            # 解析 JSON 数据
            data = json.loads(response.read().decode('utf-8'))
            
            # 读取 blog 字段并返回
            blog = data.get("blog")
            if blog:
                return blog.strip()
            else:
                raise Exception("API 返回的数据中 'blog' 字段为空")
                
    except Exception as e:
        raise Exception(f"访问 GitHub API 时发生异常: {e}")

def main():
    try:
        domain = fetch_domain_via_api()
        # 移除可能存在的末尾斜杠
        domain_clean = domain.rstrip('/')
        print(f"成功通过 API 抓取到目标域名: {domain_clean}")
        
        # 将最新域名写入 domain.txt 文件
        with open("domain.txt", "w", encoding="utf-8") as f:
            f.write(domain_clean)
            
    except Exception as e:
        print(f"运行出错: {e}")
        exit(1)

if __name__ == "__main__":
    main()
