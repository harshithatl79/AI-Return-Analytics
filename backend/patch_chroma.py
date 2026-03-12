import os
import site

target_file = os.path.join(site.getsitepackages()[0], "chromadb", "config.py")

if not os.path.exists(target_file):
    # Try alternate location where Windows venv puts it
    import sys
    base = sys.prefix
    target_file = os.path.join(base, "Lib", "site-packages", "chromadb", "config.py")

with open(target_file, "r", encoding="utf-8") as f:
    content = f.read()

# Replace Pydantic V1 breakage targets carefully!
reps = [
    ("Optional[str]", "Any"),
    ("Optional[int]", "Any"),
    ("Optional[bool]", "Any"),
    ("Optional[float]", "Any"),
    ("Optional[Dict[str, str]]", "Any"),
    ("Optional[Dict[str, List[str]]]", "Any"),
    ("Optional[Union[bool, str]]", "Any"),
    ("Optional[APIVersion]", "Any")
]

for old, new in reps:
    content = content.replace(old, new)

# Also completely neuter chroma_server_nofile as it still errors despite Any
content = content.replace('chroma_server_nofile: Any = None', '# chroma_server_nofile disabled for Windows')
content = content.replace('if settings["chroma_server_nofile"] is not None:', 'if False:')

with open(target_file, "w", encoding="utf-8") as f:
    f.write(content)

print("Patch applied.")
