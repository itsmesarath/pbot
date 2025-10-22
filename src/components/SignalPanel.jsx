import React from 'react';
import { useTradingStore } from '../store/tradingStore';
import { format } from 'date-fns';

const SignalPanel = () => {
  const {
    currentSignal,
    marketState,
    keyLevels,
    orderFlowData,
    signalHistory
  } = useTradingStore();

  const getSignalColor = (type) => {
    switch (type) {
      case 'LONG': return 'text-green-400';
      case 'SHORT': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getAggressionColor = (aggression) => {
    switch (aggression) {
      case 'BULL': return 'text-green-400';
      case 'BEAR': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-bold text-white">AI Signal Analysis</h2>

      {/* Current Signal */}
      {currentSignal ? (
        <div className={`rounded-lg p-4 border-2 ${
          currentSignal.type === 'LONG' ? 'bg-green-900 bg-opacity-20 border-green-500' :
          currentSignal.type === 'SHORT' ? 'bg-red-900 bg-opacity-20 border-red-500' :
          'bg-gray-700 border-gray-600'
        }`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold">Current Signal</h3>
            <span className={`text-2xl font-bold ${getSignalColor(currentSignal.type)}`}>
              {currentSignal.type}
            </span>
          </div>

          {currentSignal.type !== 'FLAT' && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Confidence:</span>
                <span className="text-white font-medium">{currentSignal.confidence}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Entry:</span>
                <span className="text-white">${currentSignal.entry?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Stop Loss:</span>
                <span className="text-red-400">${currentSignal.stopLoss?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Target:</span>
                <span className="text-green-400">${currentSignal.target?.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-gray-600">
                <p className="text-gray-400 text-xs mb-1">Reasoning:</p>
                <p className="text-white text-xs">{currentSignal.reasoning}</p>
              </div>
            </div>
          )}

          {currentSignal.type === 'FLAT' && (
            <p className="text-gray-400 text-sm">
              {currentSignal.reasoning || 'Conditions not aligned for trade signal'}
            </p>
          )}
        </div>
      ) : (
        <div className="bg-gray-700 rounded-lg p-4 text-center text-gray-400">
          No signal generated yet
        </div>
      )}

      {/* Market State */}
      {marketState && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Market State</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Balance:</span>
              <span className={`font-medium ${marketState.balanced ? 'text-blue-400' : 'text-orange-400'}`}>
                {marketState.balanced ? 'BALANCED' : 'IMBALANCED'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Trend:</span>
              <span className={`font-medium ${
                marketState.trend === 'UP' ? 'text-green-400' :
                marketState.trend === 'DOWN' ? 'text-red-400' :
                'text-gray-400'
              }`}>
                {marketState.trend}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Confidence:</span>
              <span className="text-white">{marketState.confidence}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Key Levels */}
      {keyLevels && keyLevels.length > 0 && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Key Levels</h3>
          <div className="space-y-2">
            {keyLevels.map((level, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className={`font-medium ${
                  level.type === 'POC' ? 'text-yellow-400' :
                  level.type === 'HVN' ? 'text-green-400' :
                  level.type === 'LVN' ? 'text-red-400' :
                  'text-gray-400'
                }`}>
                  {level.type}
                </span>
                <span className="text-white">${level.price?.toFixed(2)}</span>
                <span className="text-gray-500 text-xs">{level.significance}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Flow */}
      {orderFlowData && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Order Flow</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">CVD:</span>
              <span className={`font-medium ${orderFlowData.cvd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {orderFlowData.cvd?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Aggression:</span>
              <span className={`font-medium ${getAggressionColor(orderFlowData.aggression)}`}>
                {orderFlowData.aggression}
              </span>
            </div>
            {orderFlowData.imbalances && orderFlowData.imbalances.length > 0 && (
              <div className="pt-2 border-t border-gray-600">
                <p className="text-gray-400 text-xs mb-2">Imbalances:</p>
                <div className="space-y-1">
                  {orderFlowData.imbalances.slice(0, 3).map((imb, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className={imb.type === 'BUY' ? 'text-green-400' : 'text-red-400'}>
                        {imb.type}
                      </span>
                      <span className="text-white">${imb.price?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Signal History */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3">Signal History</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
          {signalHistory.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No signals yet</p>
          ) : (
            signalHistory.slice().reverse().slice(0, 10).map((signal, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${getSignalColor(signal.type)}`}>
                    {signal.type}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {format(new Date(signal.timestamp), 'HH:mm:ss')}
                  </span>
                </div>
                {signal.type !== 'FLAT' && (
                  <div className="mt-1 text-xs text-gray-400">
                    Confidence: {signal.confidence}%
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SignalPanel;
