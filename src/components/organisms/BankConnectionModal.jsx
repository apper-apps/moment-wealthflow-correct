import React, { useState } from "react";
import Modal from "@/components/molecules/Modal";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";
import { toast } from "react-toastify";
import transactionService from "@/services/api/transactionService";

const BankConnectionModal = ({ isOpen, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Select Bank, 2: Authenticate, 3: Connecting, 4: Success
  const [selectedBank, setSelectedBank] = useState("");
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connectionData, setConnectionData] = useState(null);
  const [importResult, setImportResult] = useState(null);

  const supportedBanks = [
    { value: "chase", label: "Chase Bank", icon: "Building2" },
    { value: "bankofamerica", label: "Bank of America", icon: "Building2" },
    { value: "wells_fargo", label: "Wells Fargo", icon: "Building2" },
    { value: "citibank", label: "Citibank", icon: "Building2" },
    { value: "capital_one", label: "Capital One", icon: "Building2" },
    { value: "us_bank", label: "US Bank", icon: "Building2" }
  ];

  const steps = [
    { number: 1, title: "Select Bank", description: "Choose your financial institution" },
    { number: 2, title: "Authenticate", description: "Secure login verification" },
    { number: 3, title: "Connect", description: "Establishing secure connection" },
    { number: 4, title: "Import", description: "Importing your transactions" }
  ];

  const resetModal = () => {
    setCurrentStep(1);
    setSelectedBank("");
    setCredentials({ username: "", password: "" });
    setLoading(false);
    setError("");
    setConnectionData(null);
    setImportResult(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleBankSelect = () => {
    if (!selectedBank) {
      setError("Please select a bank to continue");
      return;
    }
    setError("");
    setCurrentStep(2);
  };

  const handleAuthentication = async () => {
    if (!credentials.username || !credentials.password) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      // Step 1: Authenticate with bank
      setCurrentStep(3);
      const authResult = await transactionService.authenticateBank(credentials);
      
      // Step 2: Connect to bank account
      const bankInfo = supportedBanks.find(bank => bank.value === selectedBank);
      const connectionResult = await transactionService.connectBankAccount({
        bankName: bankInfo.label,
        accountNumber: "1234567890", // In real implementation, this would come from auth
        authToken: authResult.authToken
      });
      
      setConnectionData(connectionResult);
      setCurrentStep(4);
      
      // Step 3: Import transactions
      const importResult = await transactionService.importTransactions(connectionResult);
      setImportResult(importResult);
      
      toast.success(`Successfully imported ${importResult.imported} transactions from ${bankInfo.label}!`);
      
      // Notify parent component of success
      if (onSuccess) {
        onSuccess(importResult);
      }
      
    } catch (err) {
      setError(err.message);
      setCurrentStep(2); // Go back to authentication step
      toast.error("Connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
            currentStep >= step.number 
              ? 'bg-primary border-primary text-white' 
              : 'border-gray-300 text-gray-400'
          }`}>
            {currentStep > step.number ? (
              <ApperIcon name="Check" size={16} />
            ) : (
              <span className="text-sm font-medium">{step.number}</span>
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-12 h-0.5 mx-2 ${
              currentStep > step.number ? 'bg-primary' : 'bg-gray-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <ApperIcon name="Shield" size={48} className="mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Connect Your Bank Account
              </h3>
              <p className="text-gray-600 text-sm">
                Your data is protected with bank-level security. We use read-only access and never store your login credentials.
              </p>
            </div>

            <Select
              label="Select Your Bank"
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              error={error}
            >
              <option value="">Choose your financial institution</option>
              {supportedBanks.map((bank) => (
                <option key={bank.value} value={bank.value}>
                  {bank.label}
                </option>
              ))}
            </Select>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <ApperIcon name="Info" size={16} className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Secure Connection</p>
                  <p>We use 256-bit encryption and never store your banking passwords. Your connection is read-only and can be revoked at any time.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleBankSelect}>
                Continue
                <ApperIcon name="ArrowRight" size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        );

      case 2:
        const bankInfo = supportedBanks.find(bank => bank.value === selectedBank);
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ApperIcon name="Building2" size={32} className="text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sign in to {bankInfo?.label}
              </h3>
              <p className="text-gray-600 text-sm">
                Enter your online banking credentials to securely connect your account.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter your username"
                autoComplete="username"
              />

              <Input
                label="Password" 
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <ApperIcon name="AlertCircle" size={16} className="text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <ApperIcon name="Lock" size={16} className="text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">Your Security is Protected</p>
                  <p>We never store your banking credentials. This information is only used to establish a secure, encrypted connection.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setCurrentStep(1)}>
                <ApperIcon name="ArrowLeft" size={16} className="mr-2" />
                Back
              </Button>
              <div className="space-x-3">
                <Button variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleAuthentication}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      Connect Account
                      <ApperIcon name="Shield" size={16} className="ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 text-center">
            <div>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Establishing Secure Connection
              </h3>
              <p className="text-gray-600 text-sm">
                Please wait while we securely connect to your bank account...
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-center">
                <ApperIcon name="Shield" size={16} className="text-blue-600 mr-3" />
                <p className="text-sm text-blue-800">
                  Connection secured with 256-bit encryption
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 text-center">
            <div>
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <ApperIcon name="CheckCircle" size={32} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Successfully Connected!
              </h3>
              <p className="text-gray-600 text-sm">
                Your bank account has been connected and transactions imported.
              </p>
            </div>

            {importResult && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-center">
                  <ApperIcon name="Download" size={24} className="text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-800 font-medium">
                    {importResult.imported} transactions imported successfully
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Transactions have been automatically categorized and are now available in your account.
                  </p>
                </div>
              </div>
            )}

            {connectionData && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Connected Account:</span>
                  <span className="font-medium text-gray-900">
                    {connectionData.bankName} {connectionData.accountNumber}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <Button variant="primary" onClick={handleClose}>
                <ApperIcon name="Check" size={16} className="mr-2" />
                Done
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title=""
      size="lg"
      showCloseButton={currentStep !== 3} // Don't allow closing during connection
    >
      <div className="py-2">
        {renderStepIndicator()}
        {renderStepContent()}
      </div>
    </Modal>
  );
};

export default BankConnectionModal;