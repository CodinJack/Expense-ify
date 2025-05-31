import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Brain, Download, FileText, Loader2 } from 'lucide-react';

interface AIInsightsProps {
  onGetSummary: () => Promise<string>;
  onExportPDF: () => Promise<void>;
  onExportCSV: () => Promise<void>;
}

export const AIInsights = ({ onGetSummary, onExportPDF, onExportCSV }: AIInsightsProps) => {
  const [summary, setSummary] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);

  const handleGetSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const result = await onGetSummary();
      setSummary(result);
      toast({
        title: "AI Summary Generated",
        description: "Your expense summary is ready!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI summary",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      await onExportPDF();
      toast({
        title: "Success",
        description: "PDF exported successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive",
      });
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExportingCSV(true);
    try {
      await onExportCSV();
      toast({
        title: "Success",
        description: "CSV exported successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export CSV",
        variant: "destructive",
      });
    } finally {
      setIsExportingCSV(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>AI Expense Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGetSummary}
            disabled={isLoadingSummary}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
          >
            {isLoadingSummary ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing your expenses...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Generate AI Summary
              </>
            )}
          </Button>
          
          {summary && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-900 mb-2">Your Monthly Expense Insights:</h4>
              <p className="text-purple-800 whitespace-pre-wrap">{summary}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-green-600" />
            <span>Export Your Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              variant="outline"
              className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200"
            >
              {isExportingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span>{isExportingPDF ? "Exporting..." : "Export as PDF"}</span>
            </Button>
            
            <Button
              onClick={handleExportCSV}
              disabled={isExportingCSV}
              variant="outline"
              className="flex items-center space-x-2 hover:bg-green-50 hover:border-green-200"
            >
              {isExportingCSV ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isExportingCSV ? "Exporting..." : "Export as CSV"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
