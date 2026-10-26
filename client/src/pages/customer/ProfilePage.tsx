import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { IUserAddress } from '../../types';
import { toast } from 'sonner';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, addAddress, deleteAddress, isAdmin } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdating, setIsUpdating] = useState(false);

  // New Address State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState<IUserAddress>({
    name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '',
    country: 'India',
    isDefault: false,
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateProfile(name, phone);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.street || !newAddr.postalCode) {
      toast.error('Please fill in street and postal code.');
      return;
    }
    try {
      await addAddress(newAddr);
      setShowAddAddress(false);
      setNewAddr({
        name: user?.name || '',
        phone: user?.phone || '',
        street: '',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '',
        country: 'India',
        isDefault: false,
      });
    } catch {
      // Error handled in context
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#14152D]">
          Account & Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Manage your personal details and stored delivery addresses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Details Form */}
        <div className="bg-white rounded-3xl border border-[#E8E3FA] p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="font-display font-bold text-lg text-[#14152D]">Personal Information</h2>
            {isAdmin && <Badge variant="violet" size="sm">Admin</Badge>}
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-500 cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#7444FF] focus:bg-white"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#7444FF] focus:bg-white"
                />
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <Button type="submit" variant="primary" size="md" isLoading={isUpdating}>
              Save Profile Changes
            </Button>
          </form>
        </div>

        {/* Saved Addresses List */}
        <div className="bg-white rounded-3xl border border-[#E8E3FA] p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="font-display font-bold text-lg text-[#14152D]">Saved Delivery Addresses</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddAddress(!showAddAddress)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add New
            </Button>
          </div>

          {/* Add Address Form Toggle */}
          {showAddAddress && (
            <form onSubmit={handleSaveAddress} className="p-4 rounded-2xl bg-[#FFF9F1] border border-[#E8E3FA] space-y-3">
              <h3 className="font-bold text-xs uppercase text-[#7444FF]">New Address Details</h3>
              <input
                type="text"
                placeholder="Street, Building, Flat"
                value={newAddr.street}
                onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                className="w-full bg-white border border-[#E8E3FA] rounded-xl px-3 py-2 text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  value={newAddr.city}
                  onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                  className="w-full bg-white border border-[#E8E3FA] rounded-xl px-3 py-2 text-xs"
                />
                <input
                  type="text"
                  placeholder="PIN Code"
                  value={newAddr.postalCode}
                  onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                  className="w-full bg-white border border-[#E8E3FA] rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowAddAddress(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Address
                </Button>
              </div>
            </form>
          )}

          {/* Addresses List */}
          <div className="space-y-3">
            {user.addresses.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">No addresses saved yet.</p>
            ) : (
              user.addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="p-4 rounded-2xl border border-gray-100 bg-gray-50 flex justify-between items-start text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#14152D]">{addr.name}</p>
                    <p className="text-gray-600">{addr.street}</p>
                    <p className="text-gray-600">
                      {addr.city}, {addr.state} - {addr.postalCode}
                    </p>
                    <p className="text-gray-400">Phone: {addr.phone}</p>
                  </div>
                  {addr._id && (
                    <button
                      onClick={() => deleteAddress(addr._id!)}
                      className="text-gray-400 hover:text-red-500 p-1"
                      title="Delete address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
