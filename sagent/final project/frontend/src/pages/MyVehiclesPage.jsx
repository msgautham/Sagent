import { useEffect, useState } from 'react';
import { addVehicle, fetchVehicles, fetchWallet, fetchNotifications, topUpWallet } from '../services/buyerService';
import { currency } from '../utils/formatters';

export default function MyVehiclesPage() {
  const maxTopUpAmount = 99999999.99;
  const [vehicles, setVehicles] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState({ vehicleNumber: '', vehicleType: 'CAR', brand: '', model: '' });
  const [isAddingMoney, setIsAddingMoney] = useState(false);
  const [walletMessage, setWalletMessage] = useState('');
  const [walletError, setWalletError] = useState('');
  const [topUpAmount, setTopUpAmount] = useState('');

  const loadData = async () => {
    const [vehiclesData, walletData, notificationsData] = await Promise.all([
      fetchVehicles(),
      fetchWallet(),
      fetchNotifications()
    ]);
    setVehicles(vehiclesData);
    setWallet(walletData);
    setNotifications(notificationsData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await addVehicle(form);
    setForm({ vehicleNumber: '', vehicleType: 'CAR', brand: '', model: '' });
    loadData();
  };

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
        <div className="col-lg-7">
          <div className="card hero-card p-4">
            <h3 className="fw-bold">My Vehicles</h3>
            <div className="row g-3 mt-1">
              {vehicles.map((vehicle) => (
                <div className="col-md-6" key={vehicle.id}>
                  <div className="border rounded-4 p-3 bg-white h-100">
                    <div className="fw-semibold">{vehicle.vehicleNumber}</div>
                    <div>{vehicle.brand} {vehicle.model}</div>
                    <div className="small text-muted">{vehicle.vehicleType}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card panel-card p-4 mb-4">
            <h4 className="fw-bold">Add Vehicle</h4>
            <form onSubmit={handleSubmit}>
              <input className="form-control mb-2" placeholder="Vehicle number" value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} required />
              <input className="form-control mb-2" placeholder="Vehicle type" value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })} required />
              <input className="form-control mb-2" placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required />
              <input className="form-control mb-3" placeholder="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required />
              <button className="btn btn-primary w-100">Save Vehicle</button>
            </form>
          </div>
          <div className="card panel-card p-4">
            <h4 className="fw-bold">Wallet & Notifications</h4>
            <p>Balance: {currency(wallet?.balance)}</p>
            {walletMessage && <div className="alert alert-success py-2">{walletMessage}</div>}
            {walletError && <div className="alert alert-danger py-2">{walletError}</div>}
            <input
              type="number"
              min="1"
              max={maxTopUpAmount}
              step="0.01"
              className="form-control mb-3"
              placeholder="Enter amount"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
            />
            <button className="btn btn-primary w-100 mb-3" onClick={handleAddMoney} disabled={isAddingMoney}>
              {isAddingMoney ? 'Adding...' : 'Add Money to Wallet'}
            </button>
            <ul className="list-group">
              {notifications.slice(0, 5).map((item) => (
                <li className="list-group-item" key={item.id}>
                  <div className="fw-semibold">{item.title}</div>
                  <div className="small">{item.message}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
