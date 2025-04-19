
import { useState, useEffect } from "react";
import { BarChart3, CalendarRange, Download, FileDown } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MilkChart from "@/components/dashboard/MilkChart";
import { 
  calculateMonthlyStats, 
  downloadFile, 
  formatCurrency, 
  formatMonthYear, 
  getMissedDaysForMonth
} from "@/lib/utils";
import { exportEntriesAsCSV, getMilkEntries } from "@/lib/storage";
import { MilkEntry } from "@/types";

const ReportsPage = () => {
  const [entries, setEntries] = useState<MilkEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<MilkEntry[]>([]);
  const [stats, setStats] = useState({
    totalQuantity: 0,
    totalAmount: 0,
    totalPaid: 0,
    pendingAmount: 0,
    missedDays: 0,
  });
  const [timeframe, setTimeframe] = useState("current");
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allEntries = getMilkEntries();
    setEntries(allEntries);

    // Extract unique months from entries
    const months = new Set<string>();
    allEntries.forEach((entry) => {
      const date = new Date(entry.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthYear);
    });
    
    setAvailableMonths(Array.from(months).sort((a, b) => b.localeCompare(a)));
    
    // Set initial timeframe
    handleTimeframeChange(timeframe);
  };

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value);
    
    let filtered: MilkEntry[];
    
    if (value === "current") {
      // Current month
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      filtered = entries.filter((entry) => {
        const entryDate = new Date(entry.date);
        return (
          entryDate.getMonth() === currentMonth &&
          entryDate.getFullYear() === currentYear
        );
      });
    } else if (value === "all") {
      // All entries
      filtered = [...entries];
    } else {
      // Specific month
      const [year, month] = value.split("-").map(Number);
      
      filtered = entries.filter((entry) => {
        const entryDate = new Date(entry.date);
        return (
          entryDate.getMonth() === month - 1 &&
          entryDate.getFullYear() === year
        );
      });
    }
    
    setFilteredEntries(filtered);
    
    // Calculate stats for filtered entries
    const calculatedStats = calculateMonthlyStats(filtered);
    setStats(calculatedStats);
  };

  const handleExportCSV = () => {
    const csv = exportEntriesAsCSV(filteredEntries);
    
    // Generate filename
    let filename = "milk-records";
    if (timeframe === "current") {
      filename += `-${format(new Date(), "yyyy-MM")}`;
    } else if (timeframe !== "all") {
      filename += `-${timeframe}`;
    }
    filename += ".csv";
    
    downloadFile(csv, filename, "text/csv");
  };

  const handleExportJSON = () => {
    const data = {
      entries: filteredEntries,
      stats: stats,
      exportedAt: new Date().toISOString()
    };
    
    const json = JSON.stringify(data, null, 2);
    
    // Generate filename
    let filename = "milk-records";
    if (timeframe === "current") {
      filename += `-${format(new Date(), "yyyy-MM")}`;
    } else if (timeframe !== "all") {
      filename += `-${timeframe}`;
    }
    filename += ".json";
    
    downloadFile(json, filename, "application/json");
  };

  // Get missed days information
  let missedDaysInfo = "";
  if (timeframe !== "all" && stats.missedDays > 0) {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    
    if (timeframe !== "current") {
      [year, month] = timeframe.split("-").map(Number);
    }
    
    const missedDays = getMissedDaysForMonth(entries, year, month);
    missedDaysInfo = missedDays.join(", ");
  }

  return (
    <div className="p-4 pb-20 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <FileDown className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={handleExportJSON}>
            <Download className="mr-2 h-4 w-4" />
            JSON
          </Button>
        </div>
      </div>

      {/* Time Period Selector */}
      <div className="mb-4">
        <Select defaultValue={timeframe} onValueChange={handleTimeframeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Current Month</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
            {availableMonths.map((month) => (
              <SelectItem key={month} value={month}>
                {formatMonthYear(month)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="p-3">
            <CardDescription>Total Milk</CardDescription>
            <CardTitle className="text-xl">{stats.totalQuantity.toFixed(1)}L</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-3">
            <CardDescription>Total Amount</CardDescription>
            <CardTitle className="text-xl">{formatCurrency(stats.totalAmount)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-3">
            <CardDescription>Paid</CardDescription>
            <CardTitle className="text-xl">{formatCurrency(stats.totalPaid)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-3">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-xl">{formatCurrency(stats.pendingAmount)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts */}
      <div className="space-y-4">
        <MilkChart entries={filteredEntries} type="quantity" />
        <MilkChart entries={filteredEntries} type="amount" />
      </div>

      {/* Missed Days Card */}
      {timeframe !== "all" && stats.missedDays > 0 && (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <CalendarRange className="h-5 w-5 text-amber-500 mr-2" />
              <CardTitle className="text-lg">Missed Days</CardTitle>
            </div>
            <CardDescription>
              There were {stats.missedDays} days in this period without milk entries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Days without entries: {missedDaysInfo}
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {filteredEntries.length === 0 && (
        <div className="text-center p-8 card-milk mt-4">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No data available</h3>
          <p className="text-gray-500">
            There are no entries for the selected time period.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
