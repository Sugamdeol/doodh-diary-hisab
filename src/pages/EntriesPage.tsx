import { useState, useEffect } from "react";
import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  Edit, 
  Milk, 
  Trash 
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency, formatDate, getCurrentMonthYear } from "@/lib/utils";
import { deleteMilkEntry, getMilkEntries, getVendors } from "@/lib/storage";
import { MilkEntry, Vendor } from "@/types";
import MilkEntryForm from "@/components/entries/MilkEntryForm";

const EntriesPage = () => {
  const [entries, setEntries] = useState<MilkEntry[]>([]);
  const [vendors, setVendors] = useState<Record<string, Vendor>>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [monthView, setMonthView] = useState(getCurrentMonthYear());
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MilkEntry | null>(null);

  useEffect(() => {
    loadData();
  }, [monthView]);

  const loadData = () => {
    const allEntries = getMilkEntries();
    const [year, month] = monthView.split('-').map(Number);
    
    const start = startOfMonth(new Date(year, month - 1));
    const end = endOfMonth(new Date(year, month - 1));
    
    const filteredEntries = allEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end;
    });
    
    setEntries(filteredEntries);
    
    const loadedVendors = getVendors();
    const vendorMap: Record<string, Vendor> = {};
    loadedVendors.forEach((vendor) => {
      vendorMap[vendor.id] = vendor;
    });
    setVendors(vendorMap);
    
    console.log("Loaded vendors:", loadedVendors);
  };

  const handleAddEntry = () => {
    setSelectedEntry(null);
    setShowAddDialog(true);
  };

  const handleEditEntry = (entry: MilkEntry) => {
    setSelectedEntry(entry);
    setShowEditDialog(true);
  };

  const handleDeleteEntry = (entry: MilkEntry) => {
    setSelectedEntry(entry);
    setShowDeleteDialog(true);
  };

  const confirmDeleteEntry = () => {
    if (selectedEntry) {
      deleteMilkEntry(selectedEntry.id);
      loadData();
      setShowDeleteDialog(false);
      toast.success("Entry deleted successfully");
    }
  };

  const handleEntrySaved = () => {
    loadData();
    setShowAddDialog(false);
    setShowEditDialog(false);
  };

  const entriesByDate: Record<string, MilkEntry[]> = {};
  entries.forEach((entry) => {
    if (!entriesByDate[entry.date]) {
      entriesByDate[entry.date] = [];
    }
    entriesByDate[entry.date].push(entry);
  });

  const [year, month] = monthView.split('-').map(Number);
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(new Date(year, month - 1)),
    end: endOfMonth(new Date(year, month - 1))
  });

  const dayRenderer = (date: Date) => {
    const day = date.getDate();
    const dateStr = format(date, 'yyyy-MM-dd');
    const hasEntries = !!entriesByDate[dateStr];
    
    return (
      <div className={cn(
        "h-9 w-9 p-0 font-normal",
        hasEntries ? "bg-milk-100 text-milk-800 font-medium" : ""
      )}>
        {day}
      </div>
    );
  };

  return (
    <div className="p-4 pb-20 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Milk Entries</h1>
        <Button onClick={handleAddEntry} className="bg-milk-500 hover:bg-milk-600">
          <Milk className="mr-2 h-4 w-4" />
          Add Entry
        </Button>
      </div>
      
      <div className="mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(new Date(year, month - 1), 'MMMM yyyy')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={new Date(year, month - 1)}
              onSelect={(date) => {
                if (date) {
                  setMonthView(format(date, 'yyyy-MM'));
                }
              }}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="card-milk mb-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="p-3 pointer-events-auto"
          month={new Date(year, month - 1)}
          modifiers={{
            booked: (date) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              return !!entriesByDate[dateStr];
            }
          }}
          modifiersStyles={{
            booked: { backgroundColor: "#E8F5E9", color: "#2E7D32", fontWeight: "bold" }
          }}
          components={{
            DayContent: ({ date }) => dayRenderer(date),
          }}
        />
      </div>
      
      <div className="card-milk overflow-hidden">
        <div className="p-3 border-b border-gray-100 bg-gray-50">
          <h2 className="font-medium">Entries for {format(new Date(year, month - 1), 'MMMM yyyy')}</h2>
        </div>
        
        {entries.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Qty (L)</TableHead>
                  <TableHead>Rate (₹)</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {daysInMonth.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const dayEntries = entriesByDate[dateStr] || [];
                  
                  return dayEntries.length > 0 ? (
                    dayEntries.map((entry, index) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {formatDate(entry.date)}
                          {entry.notes && (
                            <div className="text-xs text-gray-500 mt-1">{entry.notes}</div>
                          )}
                        </TableCell>
                        <TableCell>{entry.quantity}</TableCell>
                        <TableCell>{entry.rate}</TableCell>
                        <TableCell>{formatCurrency(entry.quantity * entry.rate)}</TableCell>
                        <TableCell>
                          {vendors[entry.vendorId]?.name || (
                            <span className="text-yellow-600 text-sm font-medium">
                              Please select a vendor
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "px-2 py-1 rounded-full text-xs",
                              entry.isPaid
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            )}
                          >
                            {entry.isPaid ? "Paid" : "Unpaid"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-milk-600"
                              onClick={() => handleEditEntry(entry)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-red-600"
                              onClick={() => handleDeleteEntry(entry)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : null;
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No entries found for this month.{" "}
            <button 
              className="text-milk-600 hover:underline" 
              onClick={handleAddEntry}
            >
              Add your first entry
            </button>
          </div>
        )}
      </div>
      
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Milk Entry</DialogTitle>
            <DialogDescription>
              Record a new milk delivery and payment.
            </DialogDescription>
          </DialogHeader>
          <MilkEntryForm onSaved={handleEntrySaved} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Milk Entry</DialogTitle>
            <DialogDescription>
              Update this milk entry's details.
            </DialogDescription>
          </DialogHeader>
          {selectedEntry && (
            <MilkEntryForm entry={selectedEntry} onSaved={handleEntrySaved} />
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteEntry}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EntriesPage;
