import os
os.environ["CHROMA_SERVER_NOFILE"] = "65535"

import traceback
try:
    import chromadb
    print("SUCCESS")
except Exception as e:
    with open("err.txt", "w") as f:
        traceback.print_exc(file=f)
