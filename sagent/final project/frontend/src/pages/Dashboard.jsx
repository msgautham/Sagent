import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchNotifications, fetchWallet, topUpWallet } from '../services/buyerService';
import { currency } from '../utils/formatters';

export default function Dashboard() {
  const maxTopUpAmount = 99999999.99;
  const [wallet, setWallet] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isAddingMoney, setIsAddingMoney] = useState(false);
  const [walletMessage, setWalletMessage] = useState('');
  const [walletError, setWalletError] = useState('');
  const [topUpAmount, setTopUpAmount] = useState('');

  useEffect(() => {
    Promise.all([fetchWallet(), fetchNotifications()]).then(([walletData, notificationData]) => {
      setWallet(walletData);
      setNotifications(notificationData);
    });
  }, []);

  const handleAddMoney = async () => {
    const parsedAmount = Number(topUpAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setWalletMessage('');
      setWalletError('Enter a valid amount greater than zero');
      return;
    }
    if (parsedAmount > maxTopUpAmount) {
      setWalletMessage('');
      setWalletError(`Amount cannot exceed ${currency(maxTopUpAmount)}`);
      return;
    }

    try {
      setIsAddingMoney(true);
      setWalletMessage('');
      setWalletError('');
      const updatedWallet = await topUpWallet(parsedAmount);
      setWallet((currentWallet) => ({
        ...currentWallet,
        balance: updatedWallet.balance
      }));
      setWalletMessage(`${currency(parsedAmount)} added to wallet.`);
      setTopUpAmount('');
    } catch (err) {
      setWalletMessage('');
      setWalletError(err.response?.data?.message || 'Failed to add money to wallet');
    } finally {
      setIsAddingMoney(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card hero-card p-5 h-100">
            <h1 className="fw-bold">Buyer Dashboard</h1>
            <p className="lead text-muted">Find nearby parking, book slots, manage vehicles, and review wallet activity.</p>
            <div className="d-flex gap-3 flex-wrap">
              <Link className="btn btn-primary" to="/map-search">Search on Map</Link>
              <Link className="btn btn-outline-primary" to="/my-bookings">My Bookings</Link>
              <Link className="btn btn-outline-dark" to="/my-vehicles">My Vehicles</Link>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card panel-card p-4 mb-4">
            <h4 className="fw-bold">Wallet Balance</h4>
            <div className="fs-3 fw-semibold">{currency(wallet?.balance)}</div>
            {walletMessage && <div className="alert alert-success py-2 mt-3 mb-0">{walletMessage}</div>}
            {walletError && <div className="alert alert-danger py-2 mt-3 mb-0">{walletError}</div>}
            <input
              type="number"
              min="1"
              max={maxTopUpAmount}
              step="0.01"
              className="form-control mt-3"
              placeholder="Enter amount"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
            />
            <button className="btn btn-primary mt-3 w-100" onClick={handleAddMoney} disabled={isAddingMoney}>
              {isAddingMoney ? 'Adding...' : 'Add Money to Wallet'}
            </button>
          </div>
          <div className="card panel-card p-4">
            <h4 className="fw-bold">Recent Notifications</h4>
            <div className="d-grid gap-2">
              {notifications.slice(0, 4).map((item) => (
                <div className="border rounded-4 p-3 bg-white" key={item.id}>
                  <div className="fw-semibold">{item.title}</div>
                  <div className="small text-muted">{item.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
