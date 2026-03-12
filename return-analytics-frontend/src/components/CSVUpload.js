import React, { useState } from "react";
import { Card, CardContent, Button } from "@mui/material";
import API from "../services/api";

function CSVUpload() {

  const [file, setFile] = useState(null);

  const upload = async () => {

    const formData = new FormData();

    formData.append("file", file);

    await API.post("/ai/upload-returns-csv", formData);

    alert("Dataset uploaded successfully");
  };

  return (

    <Card style={{marginBottom:"30px"}}>

      <CardContent>

        <h2>Upload Return Dataset</h2>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <br/><br/>

        <Button
          variant="contained"
          color="secondary"
          onClick={upload}
        >
          Upload Dataset
        </Button>

      </CardContent>

    </Card>

  );
}

export default CSVUpload;