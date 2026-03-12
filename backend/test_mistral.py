import traceback

try:
    from mistralai import Mistral
    print("MISTRAL_SUCCESS")
except Exception as e:
    with open("err_mistral.txt", "w") as f:
        traceback.print_exc(file=f)
