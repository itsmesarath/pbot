import React from 'react';
import { useTradingStore } from '../store/tradingStore';
import { format } from 'date-fns';

const Dashboard = () => {
  const {
    accountBalance,
    pnl,
    totalTrades,
    winRate,
    tradeHistory,
    activeTrade
  } = useTradingStore();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-bold text-white">Dashboard</h2>

      {/* Account Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400">Account Balance</p>
          <p className="text-2xl font-bold text-white mt-1">
            {formatCurrency(accountBalance)}
          </p>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400">Total P&L</p>
          <p className={`text-2xl font-bold mt-1 ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(pnl)}
          </p>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400">Total Trades</p>
          <p className="text-2xl font-bold text-white mt-1">
            {totalTrades}
          </p>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400">Win Rate</p>
          <p className="text-2xl font-bold text-white mt-1">
            {formatPercentage(winRate)}
          </p>
        </div>
      </div>

      {/* Active Trade */}
      {activeTrade && (
        <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-300 mb-3">Active Trade</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Type:</span>
              <span className={`font-medium ${activeTrade.type === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                {activeTrade.type}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Entry:</span>
              <span className="text-white">{formatCurrency(activeTrade.entry)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Stop Loss:</span>
              <span className="text-red-400">{formatCurrency(activeTrade.stopLoss)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Target:</span>
              <span className="text-green-400">{formatCurrency(activeTrade.target)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Position Size:</span>
              <span className="text-white">{activeTrade.positionSize.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Risk Amount:</span>
              <span className="text-white">{formatCurrency(activeTrade.riskAmount)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Trade History */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3">Recent Trades</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
          {tradeHistory.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No trades yet</p>
          ) : (
            tradeHistory.slice(0, 10).map((trade, index) => (
              <div
                key={index}
                className="bg-gray-700 rounded-lg p-3 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${trade.type === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.type}
                  </span>
                  <span className={`font-bold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(trade.pnl)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <div>
                    <span>Entry: </span>
                    <span className="text-white">{formatCurrency(trade.entry)}</span>
                  </div>
                  <div>
                    <span>Exit: </span>
                    <span className="text-white">{formatCurrency(trade.exitPrice)}</span>
                  </div>
                  <div className="col-span-2">
                    <span>Closed: </span>
                    <span className="text-white">
                      {format(new Date(trade.closeTime), 'MMM dd, HH:mm:ss')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
