import React, { useState } from "react";
import { TextField, Button, Card, CardContent } from "@mui/material";
import { analyzeReturn } from "../services/api";

function ReturnAnalyzer({ setResult }) {

  const [comment, setComment] = useState("");

  const handleAnalyze = async () => {

    const res = await analyzeReturn(comment);

    setResult(res.data);
  };

  return (

    <Card style={{marginBottom:"30px"}}>

      <CardContent>

        <h2>Return Comment Analyzer</h2>

        <TextField
          fullWidth
          label="Enter Return Comment"
          multiline
          rows={3}
          onChange={(e) => setComment(e.target.value)}
        />

        <br/><br/>

        <Button
          variant="contained"
          color="primary"
          onClick={handleAnalyze}
        >
          Analyze Comment
        </Button>

      </CardContent>

    </Card>

  );
}

export default ReturnAnalyzer;