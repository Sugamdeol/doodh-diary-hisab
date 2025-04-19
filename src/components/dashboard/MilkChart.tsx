
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { format, parseISO } from "date-fns";
import { MilkEntry } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface MilkChartProps {
  entries: MilkEntry[];
  type?: "quantity" | "amount";
}

const MilkChart = ({ entries, type = "quantity" }: MilkChartProps) => {
  const [chartType, setChartType] = useState<"quantity" | "amount">(type);
  
  // Process data for the chart
  const chartData = entries
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((entry) => ({
      date: entry.date,
      day: format(new Date(entry.date), "dd"),
      quantity: entry.quantity,
      amount: entry.quantity * entry.rate,
      paid: entry.isPaid,
    }));

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{format(parseISO(data.date), "d MMM yyyy")}</p>
          <p className="text-milk-600">
            {chartType === "quantity"
              ? `${data.quantity} liter${data.quantity !== 1 ? "s" : ""}`
              : formatCurrency(data.amount)}
          </p>
          <p className={data.paid ? "text-green-600" : "text-red-600"}>
            {data.paid ? "Paid" : "Unpaid"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card-milk p-3 sm:p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Daily {chartType === "quantity" ? "Quantity" : "Expenses"}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType("quantity")}
            className={`px-2 py-1 text-xs rounded-md ${
              chartType === "quantity"
                ? "bg-milk-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Quantity
          </button>
          <button
            onClick={() => setChartType("amount")}
            className={`px-2 py-1 text-xs rounded-md ${
              chartType === "amount"
                ? "bg-milk-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Amount
          </button>
        </div>
      </div>
      
      <div className="h-64 sm:h-72 w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#eee" }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#eee" }}
                tickFormatter={(value) =>
                  chartType === "quantity"
                    ? `${value}L`
                    : `₹${value}`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey={chartType}
                fill="#4CAF50"
                radius={[4, 4, 0, 0]}
                fillOpacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            No data available
          </div>
        )}
      </div>
    </div>
  );
};

export default MilkChart;
