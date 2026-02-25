import React, { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Plus, ArrowDownToLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const FundsPage = () => {
  // State for account balances
  const [accountBalance, setAccountBalance] = useState(500000);
  const [usedMargin, setUsedMargin] = useState(0);
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('hdfc');
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  // Calculate derived values
  const availableMargin = accountBalance - usedMargin;
  const withdrawableAmount = availableMargin;

  const handleWithdraw = (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    
    if (!withdrawAmount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (amount > withdrawableAmount) {
      toast.error(`Insufficient balance. Available: ₹${withdrawableAmount.toLocaleString('en-IN')}`);
      return;
    }
    
    // Reduce account balance
    setAccountBalance(prev => prev - amount);
    
    toast.success(`Withdrawal request of ₹${amount.toLocaleString('en-IN')} submitted successfully`);
    setWithdrawModalOpen(false);
    setWithdrawAmount('');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 font-[Manrope]">Funds</h1>
        <p className="text-gray-400">Manage your account balance and withdrawals</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Account Balance */}
        <div className="bg-gradient-to-br from-[#131722] to-[#1a1f2e] border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
              <Wallet className="w-6 h-6 text-blue-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-sm text-gray-400 mb-1">Account Balance</div>
          <div className="text-3xl font-bold text-white font-mono-data">₹{accountBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>

        {/* Available Margin */}
        <div className="bg-gradient-to-br from-[#131722] to-[#1a1f2e] border border-white/10 rounded-2xl p-6 hover:border-green-500/30 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="text-sm text-gray-400 mb-1">Available Margin</div>
          <div className="text-3xl font-bold text-white font-mono-data">₹{availableMargin.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>

        {/* Used Margin */}
        <div className="bg-gradient-to-br from-[#131722] to-[#1a1f2e] border border-white/10 rounded-2xl p-6 hover:border-orange-500/30 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
              <TrendingDown className="w-6 h-6 text-orange-400" />
            </div>
          </div>
          <div className="text-sm text-gray-400 mb-1">Used Margin</div>
          <div className="text-3xl font-bold text-white font-mono-data">₹{usedMargin.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>

        {/* Withdrawable Amount */}
        <div className="bg-gradient-to-br from-[#131722] to-[#1a1f2e] border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
              <ArrowDownToLine className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="text-sm text-gray-400 mb-1">Withdrawable Amount</div>
          <div className="text-3xl font-bold text-white font-mono-data">₹{withdrawableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Button
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold px-8 py-6 rounded-xl transition-all duration-150 active:scale-95 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Funds
        </Button>

        <Dialog open={withdrawModalOpen} onOpenChange={setWithdrawModalOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-semibold px-8 py-6 rounded-xl transition-all duration-150 active:scale-95 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
            >
              <ArrowDownToLine className="w-5 h-5 mr-2" />
              Withdraw Funds
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#131722] border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white text-xl font-[Manrope]">Withdraw Funds</DialogTitle>
              <DialogDescription className="text-gray-400">
                Enter withdrawal amount and select your bank account
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleWithdraw} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium text-gray-300">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="bg-[#0b0f14] border-white/10 focus:border-blue-500/50 text-white h-12 rounded-xl font-mono-data text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank" className="text-sm font-medium text-gray-300">Bank Account</Label>
                <select
                  id="bank"
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full bg-[#0b0f14] border border-white/10 focus:border-blue-500/50 text-white h-12 rounded-xl px-4 font-medium transition-colors"
                >
                  <option value="hdfc">HDFC Bank •••• 1234</option>
                  <option value="icici">ICICI Bank •••• 5678</option>
                  <option value="axis">Axis Bank •••• 9012</option>
                </select>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-bold py-6 rounded-xl transition-all duration-150 active:scale-95 shadow-lg shadow-purple-500/30"
              >
                Submit Withdrawal Request
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recent Transactions */}
      <div className="bg-gradient-to-br from-[#131722] to-[#1a1f2e] border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 font-[Manrope]">Recent Transactions</h2>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
            <Wallet className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-gray-400">No transactions yet</p>
        </div>
      </div>
    </div>
  );
};

export default FundsPage;