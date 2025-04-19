
import { useState } from "react";
import { Download, Upload, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MonthlySettingsForm from "@/components/settings/MonthlySettingsForm";
import { downloadFile } from "@/lib/utils";
import { exportData, importData } from "@/lib/storage";

const SettingsPage = () => {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleExportData = () => {
    const jsonData = exportData();
    const fileName = `mera-doodh-hisab-backup-${new Date().toISOString().slice(0, 10)}.json`;
    downloadFile(jsonData, fileName, "application/json");
    toast.success("Data exported successfully");
  };

  const handleImportData = () => {
    if (!importFile) {
      toast.error("Please select a file to import");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const success = importData(jsonData);
        
        if (success) {
          toast.success("Data imported successfully. Refresh the page to see changes.");
          setShowImportDialog(false);
          setImportFile(null);
          // Reload the page after a short delay to reflect the imported data
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          toast.error("Failed to import data. Invalid format.");
        }
      } catch (error) {
        console.error("Import error:", error);
        toast.error("Failed to import data. Please check the file format.");
      }
    };
    
    reader.readAsText(importFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };

  return (
    <div className="p-4 pb-20 animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center">
          <SettingsIcon className="mr-2 h-6 w-6 text-milk-600" />
          Settings
        </h1>
      </div>
      
      {/* Monthly Settings */}
      <Card className="mb-6 shadow-sm border-milk-100 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-milk-50 to-green-50 pb-4">
          <CardTitle className="text-milk-800">Monthly Defaults</CardTitle>
          <CardDescription>
            Set the default values for milk entries this month.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <MonthlySettingsForm />
        </CardContent>
      </Card>
      
      {/* Data Management */}
      <Card className="shadow-sm border-milk-100 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-milk-50 to-green-50 pb-4">
          <CardTitle className="text-milk-800">Data Management</CardTitle>
          <CardDescription>
            Export or import your milk tracking data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium mb-2 text-milk-800">Export Data</h3>
            <p className="text-sm text-gray-600 mb-3">
              Export all your data as a JSON file for backup or transfer to another device.
            </p>
            <Button 
              onClick={handleExportData} 
              className="w-full sm:w-auto bg-milk-500 hover:bg-milk-600 shadow-sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border-t">
            <h3 className="text-sm font-medium mb-2 text-blue-800">Import Data</h3>
            <p className="text-sm text-gray-600 mb-3">
              Import previously exported data. This will replace all current data.
            </p>
            <Button 
              onClick={() => setShowImportDialog(true)}
              variant="outline" 
              className="w-full sm:w-auto border-blue-200 text-blue-700 hover:bg-blue-100 shadow-sm"
            >
              <Upload className="mr-2 h-4 w-4" />
              Import Data
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
            <DialogDescription>
              Select a backup file to import. This will replace all your current data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-milk-200 bg-milk-50 rounded-lg p-6 text-center">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Upload className="mx-auto h-8 w-8 text-milk-500 mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  {importFile ? importFile.name : "Click to select a file"}
                </p>
                <p className="text-xs text-gray-500">
                  Only .json files are supported
                </p>
              </label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleImportData} 
                disabled={!importFile}
                className="bg-milk-500 hover:bg-milk-600"
              >
                Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
