import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, Milk } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, generateId, getMonthYearString } from "@/lib/utils";
import { 
  getMonthlySettingByMonth, 
  getVendors, 
  saveMilkEntry 
} from "@/lib/storage";
import { MilkEntry, Vendor } from "@/types";

const formSchema = z.object({
  date: z.date({
    required_error: "Please select a date.",
  }),
  quantity: z.coerce
    .number()
    .min(0.1, { message: "Quantity must be at least 0.1 liter." })
    .max(100, { message: "Quantity cannot exceed 100 liters." }),
  rate: z.coerce
    .number()
    .min(1, { message: "Rate must be at least ₹1." })
    .max(1000, { message: "Rate cannot exceed ₹1000." }),
  vendorId: z.string({
    required_error: "Please select a vendor.",
  }),
  isPaid: z.boolean().default(false),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MilkEntryFormProps {
  entry?: MilkEntry;
  onSaved?: (entry: MilkEntry) => void;
}

const MilkEntryForm = ({ entry, onSaved }: MilkEntryFormProps) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [defaultRate, setDefaultRate] = useState(50);
  const [defaultVendorId, setDefaultVendorId] = useState("");

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      quantity: 1,
      rate: defaultRate,
      vendorId: defaultVendorId,
      isPaid: false,
      notes: "",
    },
  });

  // Load vendors and apply monthly settings for new entries
  useEffect(() => {
    const loadedVendors = getVendors();
    setVendors(loadedVendors);

    // Apply monthly settings and initialize the form
    if (!entry) {
      const today = new Date();
      const monthYearString = getMonthYearString(today);
      const settings = getMonthlySettingByMonth(monthYearString);

      if (settings) {
        setDefaultRate(settings.defaultRate);
        setDefaultVendorId(settings.defaultVendorId);
        
        // Initialize form with default values from settings
        form.reset({
          date: new Date(),
          quantity: 1,
          rate: settings.defaultRate,
          vendorId: settings.defaultVendorId,
          isPaid: false,
          notes: "",
        });
      }
    } else {
      // For existing entry
      form.reset({
        date: new Date(entry.date),
        quantity: entry.quantity,
        rate: entry.rate,
        vendorId: entry.vendorId,
        isPaid: entry.isPaid,
        notes: entry.notes || "",
      });
    }
  }, [entry, form]);

  function onSubmit(data: FormValues) {
    const newEntry: MilkEntry = {
      id: entry?.id || generateId(),
      date: format(data.date, 'yyyy-MM-dd'), // Ensure proper date format
      quantity: data.quantity,
      rate: data.rate,
      vendorId: data.vendorId,
      isPaid: data.isPaid,
      notes: data.notes,
      createdAt: entry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveMilkEntry(newEntry);
    toast.success(entry ? "Entry updated successfully" : "Entry added successfully");
    
    // Reset form if it's a new entry
    if (!entry) {
      // Preserve the current date, but reset other fields
      const currentDate = form.getValues("date");
      form.reset({
        date: currentDate,
        quantity: 1,
        rate: defaultRate, // Use stored default rate
        vendorId: defaultVendorId, // Use stored default vendor
        isPaid: false,
        notes: "",
      });
    }
    
    if (onSaved) {
      onSaved(newEntry);
    }
  }

  // Function to handle date selection explicitly
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      form.setValue("date", date);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal shadow-sm border-milk-100 hover:bg-milk-50",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={handleDateChange}
                    initialFocus
                    className="p-3 pointer-events-auto rounded-md border border-milk-100"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity (L)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="1.0"
                    {...field}
                    className="input-focus shadow-sm border-milk-100 focus-visible:ring-milk-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rate (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="50"
                    {...field}
                    className="input-focus shadow-sm border-milk-100 focus-visible:ring-milk-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="vendorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="shadow-sm border-milk-100 focus-visible:ring-milk-500">
                    <SelectValue placeholder="Select a vendor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {vendors.length > 0 ? (
                    vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No vendors added yet
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPaid"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border border-milk-100 p-4 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-milk-500 data-[state=checked]:border-milk-500"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Paid</FormLabel>
                <FormDescription>
                  Mark this entry as paid if payment has been made.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Extra milk, watery milk, etc."
                  className="resize-none input-focus shadow-sm border-milk-100 focus-visible:ring-milk-500"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-milk-500 hover:bg-milk-600 shadow-md">
          <Milk className="mr-2 h-4 w-4" />
          {entry ? "Update Entry" : "Add Entry"}
        </Button>
      </form>
    </Form>
  );
};

export default MilkEntryForm;
