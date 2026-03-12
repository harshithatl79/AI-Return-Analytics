from fastapi import UploadFile, File
import pandas as pd


@router.post("/upload-returns-csv")
async def upload_returns_csv(file: UploadFile = File(...)):

    df = pd.read_csv(file.file)

    records = df.to_dict(orient="records")

    saved_records = []

    for record in records:

        new_return = await Return.create(
            product_name=record["product_name"],
            category=record["category"],
            return_reason=record["return_reason"]
        )

        saved_records.append(new_return)

    return {
        "message": "CSV uploaded successfully",
        "records_added": len(saved_records)
    }