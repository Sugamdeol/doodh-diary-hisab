
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Calendar,
  Droplets,
  IndianRupee,
  Milk,
  Plus,
  Truck,
  WalletCards,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import StatsCard from "@/components/dashboard/StatsCard";
import MilkChart from "@/components/dashboard/MilkChart";
import MilkEntryForm from "@/components/entries/MilkEntryForm";
import { calculateMonthlyStats, formatCurrency, getCurrentMonthYear, hasEntryForToday } from "@/lib/utils";
import { getMilkEntries, getMilkEntriesForMonth, getVendors } from "@/lib/storage";
import { MilkEntry } from "@/types";

const HomePage = () => {
  const [showAddEntryDialog, setShowAddEntryDialog] = useState(false);
  const [monthlyEntries, setMonthlyEntries] = useState<MilkEntry[]>([]);
  const [stats, setStats] = useState({
    totalQuantity: 0,
    totalAmount: 0,
    totalPaid: 0,
    pendingAmount: 0,
    missedDays: 0,
  });
  const [hasVendors, setHasVendors] = useState(false);
  const [entryMadeToday, setEntryMadeToday] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const vendors = getVendors();
    setHasVendors(vendors.length > 0);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    const entries = getMilkEntriesForMonth(year, month);
    setMonthlyEntries(entries);
    
    // Calculate stats
    const monthlyStats = calculateMonthlyStats(entries);
    setStats(monthlyStats);
    
    // Check if entry was made today
    setEntryMadeToday(hasEntryForToday(entries));
  };

  const handleEntryAdded = () => {
    loadData();
    setShowAddEntryDialog(false);
    toast.success("Entry added successfully");
  };

  return (
    <div className="pb-16 animate-fade-in">
      {/* Header */}
      <div className="bg-milk-500 text-white p-4 sm:p-6 rounded-b-lg">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h1 className="text-2xl font-bold">Mera Doodh Hisab</h1>
            <p className="text-milk-50 text-sm">Track your daily milk like a pro</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-milk-600 text-white"
              onClick={() => setShowAddEntryDialog(true)}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="text-right text-milk-50 text-xs">
          {format(new Date(), "EEEE, dd MMM yyyy")}
        </div>
      </div>

      {/* Alerts */}
      <div className="px-4 pt-4">
        {!hasVendors && (
          <Alert className="mb-3 bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-800">No vendors yet</AlertTitle>
            <AlertDescription className="text-amber-700">
              Add a vendor to start tracking your milk entries.{" "}
              <Link to="/vendors" className="underline font-medium">
                Add one now
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {!entryMadeToday && hasVendors && (
          <Alert className="mb-3 bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-800">Missing today's entry</AlertTitle>
            <AlertDescription className="text-amber-700">
              You haven't added today's milk entry.{" "}
              <button
                className="underline font-medium"
                onClick={() => setShowAddEntryDialog(true)}
              >
                Add it now
              </button>
            </AlertDescription>
          </Alert>
        )}

        {stats.pendingAmount > 0 && (
          <Alert className="mb-3 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertTitle className="text-red-800">Pending Payment</AlertTitle>
            <AlertDescription className="text-red-700">
              You have {formatCurrency(stats.pendingAmount)} pending payment.{" "}
              <Link to="/entries" className="underline font-medium">
                View details
              </Link>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Stats */}
      <div className="p-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatsCard
          title="Total Milk"
          value={`${stats.totalQuantity.toFixed(1)}L`}
          icon={<Droplets className="h-5 w-5" />}
        />
        <StatsCard
          title="Total Amount"
          value={formatCurrency(stats.totalAmount)}
          icon={<IndianRupee className="h-5 w-5" />}
        />
        <StatsCard
          title="Paid"
          value={formatCurrency(stats.totalPaid)}
          icon={<WalletCards className="h-5 w-5" />}
        />
        <StatsCard
          title="Pending"
          value={formatCurrency(stats.pendingAmount)}
          icon={<Calendar className="h-5 w-5" />}
        />
      </div>

      {/* Charts */}
      <div className="px-4 pb-4">
        <MilkChart entries={monthlyEntries} />
      </div>

      {/* Quick actions */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-auto py-3 border-milk-100 flex flex-col items-center justify-center gap-2"
          onClick={() => setShowAddEntryDialog(true)}
        >
          <Milk className="h-5 w-5 text-milk-500" />
          <span className="text-sm">Add Entry</span>
        </Button>
        <Link to="/vendors" className="flex-1">
          <Button
            variant="outline"
            className="h-auto py-3 border-milk-100 flex flex-col items-center justify-center gap-2 w-full"
          >
            <Truck className="h-5 w-5 text-milk-500" />
            <span className="text-sm">Manage Vendors</span>
          </Button>
        </Link>
      </div>

      {/* Add Entry Dialog */}
      <Dialog open={showAddEntryDialog} onOpenChange={setShowAddEntryDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Milk Entry</DialogTitle>
            <DialogDescription>
              Record today's milk delivery and payment details.
            </DialogDescription>
          </DialogHeader>
          <MilkEntryForm onSaved={handleEntryAdded} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;
