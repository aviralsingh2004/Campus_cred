import React, { useState } from 'react';
import { 
  GiftIcon, 
  StarIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  FilterIcon,
  SearchIcon,
  ShoppingCartIcon,
  RefreshCwIcon
} from 'lucide-react';
import { cn } from '../utils/helpers';
import { useRewards } from '../hooks/useRewards';
import { usePoints } from '../hooks/usePoints';
import { useAuth } from '../context/AuthContext';

const Rewards = () => {
  const { user } = useAuth();
  const { userPoints, redeemPoints } = usePoints();
  const { 
    rewards, 
    categories, 
    loading, 
    error, 
    filters, 
    updateFilters, 
    refreshData 
  } = useRewards();
  
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [redeeming, setRedeeming] = useState(false);

  const handleRedeem = (reward) => {
    setSelectedReward(reward);
    setShowRedeemModal(true);
  };

  const confirmRedeem = async () => {
    if (!selectedReward) return;
    
    setRedeeming(true);
    try {
      const result = await redeemPoints(selectedReward.id);
      
      if (result.success) {
        setShowRedeemModal(false);
        setSelectedReward(null);
        // Refresh rewards data to update stock
        refreshData();
        // You could show a success message here
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Failed to redeem reward. Please try again.');
    } finally {
      setRedeeming(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rewards</h1>
          <p className="text-gray-600">Redeem your points for amazing rewards</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="flex items-center gap-2">
            <GiftIcon className="h-8 w-8 text-primary-600" />
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-600">{userPoints}</p>
              <p className="text-sm text-gray-500">Available Points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search rewards..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateFilters({ category: 'all' })}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              filters.category === 'all'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            All Rewards ({rewards.length})
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => updateFilters({ category })}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                filters.category === category
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading rewards...</p>
          </div>
        ) : rewards.length > 0 ? (
          rewards.map((reward) => (
            <div key={reward.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🎁</div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">4.5</span>
                    <span className="text-xs text-gray-500">(Popular)</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{reward.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{reward.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary-600">{reward.points_cost}</span>
                  <span className="text-sm text-gray-500">points</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500">
                    Stock: {reward.stock_quantity === -1 ? 'Unlimited' : reward.stock_quantity}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">{reward.category}</span>
                </div>

                <button
                  onClick={() => handleRedeem(reward)}
                  disabled={!reward.is_available || userPoints < reward.points_cost || reward.stock_quantity === 0}
                  className={cn(
                    'w-full py-2 px-4 rounded-lg font-medium transition-colors',
                    reward.is_available && userPoints >= reward.points_cost && reward.stock_quantity !== 0
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  )}
                >
                  {!reward.is_available ? 'Not Available' :
                   userPoints < reward.points_cost ? 'Not Enough Points' :
                   reward.stock_quantity === 0 ? 'Out of Stock' : 'Redeem Now'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No rewards found</p>
          </div>
        )}
      </div>

      {/* Redemption History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Redemption History</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading redemption history...</p>
              </div>
            ) : redemptions && redemptions.length > 0 ? (
              redemptions.map((redemption) => (
                <div key={redemption.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center',
                      getStatusColor(redemption.status).split(' ')[0]
                    )}>
                      {getStatusIcon(redemption.status)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{redemption.reward_name || 'Reward'}</p>
                      <p className="text-xs text-gray-500">{formatDate(redemption.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary-600">-{redemption.points_spent} points</p>
                    <p className="text-xs text-gray-500">ID: {redemption.id}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No redemption history found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Redeem Modal */}
      {showRedeemModal && selectedReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Redemption</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">You're about to redeem:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🎁</div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedReward.name}</p>
                    <p className="text-sm text-gray-600">{selectedReward.description}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-600">{selectedReward.points_cost} points</span>
                  <span className="text-sm text-gray-500">Current balance: {userPoints}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRedeemModal(false)}
                disabled={redeeming}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRedeem}
                disabled={redeeming}
                className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {redeeming ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  'Confirm Redemption'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;
