
import { useState, useEffect } from "react";
import { Edit, IndianRupee, Plus, Trash, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { calculateVendorStats } from "@/lib/utils";
import { deleteVendor, getMilkEntries, getVendors } from "@/lib/storage";
import { Vendor, VendorWithStats } from "@/types";
import VendorForm from "@/components/vendors/VendorForm";

const VendorsPage = () => {
  const [vendors, setVendors] = useState<VendorWithStats[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedVendors = getVendors();
    const entries = getMilkEntries();
    
    // Calculate statistics for each vendor
    const vendorsWithStats = loadedVendors.map((vendor) =>
      calculateVendorStats(vendor, entries)
    );
    
    setVendors(vendorsWithStats);
  };

  const handleAddVendor = () => {
    setSelectedVendor(null);
    setShowAddDialog(true);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowEditDialog(true);
  };

  const handleDeleteVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowDeleteDialog(true);
  };

  const confirmDeleteVendor = () => {
    if (selectedVendor) {
      deleteVendor(selectedVendor.id);
      loadData();
      setShowDeleteDialog(false);
      toast.success("Vendor deleted successfully");
    }
  };

  const handleVendorSaved = () => {
    loadData();
    setShowAddDialog(false);
    setShowEditDialog(false);
  };

  return (
    <div className="p-4 pb-20 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Vendors</h1>
        <Button onClick={handleAddVendor} className="bg-milk-500 hover:bg-milk-600">
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      {vendors.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((vendor) => (
            <Card key={vendor.id} className="overflow-hidden">
              <CardHeader className="bg-milk-50 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      <Truck className="mr-2 h-5 w-5 text-milk-600" />
                      {vendor.name}
                    </CardTitle>
                    <CardDescription>
                      Default rate: {formatCurrency(vendor.defaultRate)}/liter
                    </CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-milk-600"
                      onClick={() => handleEditVendor(vendor)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-red-600"
                      onClick={() => handleDeleteVendor(vendor)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-2 bg-gray-50 rounded-md">
                    <div className="text-xs text-gray-500 mb-1">Total Milk</div>
                    <div className="font-bold">{vendor.totalQuantity.toFixed(1)}L</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-md">
                    <div className="text-xs text-gray-500 mb-1">Total Amount</div>
                    <div className="font-bold">{formatCurrency(vendor.totalAmount)}</div>
                  </div>
                </div>
              </CardContent>
              {vendor.pendingAmount > 0 && (
                <CardFooter className="bg-red-50 py-2 px-4 flex justify-between items-center">
                  <div className="text-sm font-medium text-red-700 flex items-center">
                    <IndianRupee className="mr-1 h-4 w-4" />
                    Pending: {formatCurrency(vendor.pendingAmount)}
                  </div>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="card-milk p-8 text-center">
          <Truck className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No vendors yet</h3>
          <p className="text-gray-500 mb-4">
            Add your first vendor to start tracking milk deliveries.
          </p>
          <Button onClick={handleAddVendor} className="bg-milk-500 hover:bg-milk-600">
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Vendor
          </Button>
        </div>
      )}
      
      {/* Add Vendor Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Vendor</DialogTitle>
            <DialogDescription>
              Add a new milk vendor to your records.
            </DialogDescription>
          </DialogHeader>
          <VendorForm onSaved={handleVendorSaved} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Vendor Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
            <DialogDescription>
              Update this vendor's details.
            </DialogDescription>
          </DialogHeader>
          {selectedVendor && (
            <VendorForm vendor={selectedVendor} onSaved={handleVendorSaved} />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Vendor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this vendor? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteVendor}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorsPage;
