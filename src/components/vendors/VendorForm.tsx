
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Truck } from "lucide-react";
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
import { generateId } from "@/lib/utils";
import { saveVendor } from "@/lib/storage";
import { Vendor } from "@/types";

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(50, { message: "Name cannot exceed 50 characters." }),
  defaultRate: z.coerce
    .number()
    .min(1, { message: "Rate must be at least ₹1." })
    .max(1000, { message: "Rate cannot exceed ₹1000." }),
});

type FormValues = z.infer<typeof formSchema>;

interface VendorFormProps {
  vendor?: Vendor;
  onSaved?: (vendor: Vendor) => void;
}

const VendorForm = ({ vendor, onSaved }: VendorFormProps) => {
  // Create form with default values or existing vendor values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: vendor
      ? {
          name: vendor.name,
          defaultRate: vendor.defaultRate,
        }
      : {
          name: "",
          defaultRate: 50,
        },
  });

  function onSubmit(data: FormValues) {
    const newVendor: Vendor = {
      id: vendor?.id || generateId(),
      name: data.name,
      defaultRate: data.defaultRate,
      createdAt: vendor?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveVendor(newVendor);
    toast.success(vendor ? "Vendor updated successfully" : "Vendor added successfully");
    
    // Reset form if it's a new vendor
    if (!vendor) {
      form.reset({ name: "", defaultRate: 50 });
    }
    
    if (onSaved) {
      onSaved(newVendor);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter vendor name"
                  {...field}
                  className="input-focus"
                />
              </FormControl>
              <FormDescription>
                The name of the milk vendor or dairy.
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
                  className="input-focus"
                />
              </FormControl>
              <FormDescription>
                This rate will be suggested when creating new entries for this vendor.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-milk-500 hover:bg-milk-600">
          <Truck className="mr-2 h-4 w-4" />
          {vendor ? "Update Vendor" : "Add Vendor"}
        </Button>
      </form>
    </Form>
  );
};

export default VendorForm;
