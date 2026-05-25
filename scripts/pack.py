# pack.py - 科研项目文件打包工具
# 用法: python pack.py <项目目录> [输出文件名]

import os
import sys
import zipfile
from pathlib import Path

EXCLUDE_DIRS = {
    "__pycache__", ".git", ".venv", "venv", "env", ".env",
    "node_modules", ".idea", ".vscode", ".DS_Store",
    "build", "dist", ".eggs", "*.egg-info",
}

EXCLUDE_EXTENSIONS = {
    ".pyc", ".pyo", ".pyd", ".so", ".dll", ".exe", ".obj",
    ".log", ".tmp", ".cache", ".DS_Store",
}


def should_exclude(name: str, path: Path) -> bool:
    if name in EXCLUDE_DIRS:
        return True
    if path.suffix.lower() in EXCLUDE_EXTENSIONS:
        return True
    return False


def pack_project(project_dir: str, output_name: str = None) -> str:
    project = Path(project_dir).resolve()

    if not project.exists():
        print(f"错误：目录不存在 - {project_dir}")
        sys.exit(1)

    if output_name is None:
        output_name = f"{project.name}-技术文档.zip"

    output_path = project.parent / output_name

    print(f"打包目录: {project}")
    print(f"输出文件: {output_path}")

    file_count = 0

    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(project):
            # 原地修改 dirs 列表来跳过排除的目录
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

            for file in files:
                file_path = Path(root) / file
                if should_exclude(file, file_path):
                    continue

                arcname = file_path.relative_to(project)
                zf.write(file_path, arcname)
                file_count += 1

    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"打包完成：{file_count} 个文件，{size_mb:.2f} MB")
    return str(output_path)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python pack.py <项目目录> [输出文件名]")
        print("示例: python pack.py ./myproject")
        print("      python pack.py ./myproject 我的项目文档.zip")
        sys.exit(1)

    project_dir = sys.argv[1]
    output_name = sys.argv[2] if len(sys.argv) > 2 else None
    pack_project(project_dir, output_name)
