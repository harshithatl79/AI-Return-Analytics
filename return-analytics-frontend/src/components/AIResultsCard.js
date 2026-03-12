import React from "react";
import { Card, CardContent } from "@mui/material";

function AIResultsCard({ result }) {

  if (!result) return null;

  return (

    <Card style={{marginBottom:"30px"}}>

      <CardContent>

        <h2>AI Analysis Result</h2>

        <p><b>Reason:</b> {result.reason}</p>

        <p><b>Category:</b> {result.category}</p>

        <p><b>Recommendation:</b> {result.recommendation}</p>

      </CardContent>

    </Card>

  );
}

export default AIResultsCard;