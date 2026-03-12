import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { getAnalytics } from "../services/api";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

function DashboardCharts() {

  const [data, setData] = useState([]);

  useEffect(() => {

    fetchData();

  }, []);

  const fetchData = async () => {

    const res = await getAnalytics();

    const formatted = res.data.top_return_reasons.map(item => ({
      name: item[0],
      value: item[1]
    }));

    setData(formatted);
  };

  return (

    <Card>

      <CardContent>

        <h2>Return Reasons Analytics</h2>

        <PieChart width={400} height={300}>

          <Pie
            data={data}
            dataKey="value"
            outerRadius={120}
          >

            {data.map((entry, index) => (

              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />

            ))}

          </Pie>

          <Tooltip />

        </PieChart>

      </CardContent>

    </Card>

  );
}

export default DashboardCharts;