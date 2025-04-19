
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, SaveAll } from "lucide-react";
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
import { cn, generateId, getCurrentMonthYear, getMonthYearString } from "@/lib/utils";
import { getMonthlySettingByMonth, getVendors, saveMonthlySettings } from "@/lib/storage";

const formSchema = z.object({
  month: z.date({
    required_error: "Please select a month.",
  }),
  defaultRate: z.coerce
    .number()
    .min(1, { message: "Rate must be at least ₹1." })
    .max(1000, { message: "Rate cannot exceed ₹1000." }),
  defaultVendorId: z.string({
    required_error: "Please select a vendor.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const MonthlySettingsForm = () => {
  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([]);
  
  // Form with resolver
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      month: new Date(),
      defaultRate: 50,
      defaultVendorId: "",
    },
  });

  // Load data on component mount
  useEffect(() => {
    const loadedVendors = getVendors();
    setVendors(loadedVendors.map(v => ({ id: v.id, name: v.name })));
    
    // Load existing settings for current month
    const currentMonthYear = getCurrentMonthYear();
    const settings = getMonthlySettingByMonth(currentMonthYear);
    
    if (settings) {
      try {
        const [year, month] = settings.month.split('-').map(Number);
        const settingsDate = new Date(year, month - 1, 1);
        
        // Reset form with current settings
        form.reset({
          month: settingsDate,
          defaultRate: settings.defaultRate,
          defaultVendorId: settings.defaultVendorId,
        });
        
        console.log("Loaded settings:", settings);
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    }
  }, [form]);

  function onSubmit(data: FormValues) {
    const monthYearString = getMonthYearString(data.month);
    const existingSettings = getMonthlySettingByMonth(monthYearString);

    const settings = {
      id: existingSettings?.id || generateId(),
      month: monthYearString,
      defaultRate: data.defaultRate,
      defaultVendorId: data.defaultVendorId,
      createdAt: existingSettings?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveMonthlySettings(settings);
    console.log("Saved settings:", settings);
    toast.success("Monthly settings saved successfully");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="month"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Month</FormLabel>
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
                        format(field.value, "MMMM yyyy")
                      ) : (
                        <span>Pick a month</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    // Show only month and year
                    defaultMonth={field.value}
                    ISOWeek
                    showOutsideDays={false}
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Set default values for this month.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="defaultRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Rate (₹ per liter)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter rate"
                  {...field}
                  className="input-focus shadow-sm border-milk-100 focus-visible:ring-milk-500"
                />
              </FormControl>
              <FormDescription>
                This rate will be auto-filled for new entries.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="defaultVendorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Vendor</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
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
              <FormDescription>
                This vendor will be selected by default for new entries.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-milk-500 hover:bg-milk-600 shadow-md">
          <SaveAll className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </form>
    </Form>
  );
};

export default MonthlySettingsForm;
