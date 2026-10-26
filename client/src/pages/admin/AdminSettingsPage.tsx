import React, { useEffect, useState } from 'react';
import { Settings, Save, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    storeName: 'LUMORA',
    tagline: 'Discover more. Love every find.',
    supportEmail: 'care@lumora.store',
    supportPhone: '+91 80000 12345',
    currency: 'INR',
    taxRatePercent: 5,
    freeShippingThresholdRupees: 999,
    standardShippingCostRupees: 70,
    expressShippingCostRupees: 150,
    demoMode: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings');
        if (res.data.success && res.data.settings) {
          const s = res.data.settings;
          setSettings({
            storeName: s.storeName,
            tagline: s.tagline,
            supportEmail: s.supportEmail,
            supportPhone: s.supportPhone,
            currency: s.currency,
            taxRatePercent: s.taxRatePercent,
            freeShippingThresholdRupees: Math.round(s.freeShippingThresholdPaise / 100),
            standardShippingCostRupees: Math.round(s.standardShippingCostPaise / 100),
            expressShippingCostRupees: Math.round(s.expressShippingCostPaise / 100),
            demoMode: s.demoMode,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.put('/admin/settings', {
        storeName: settings.storeName,
        tagline: settings.tagline,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
        currency: settings.currency,
        taxRatePercent: settings.taxRatePercent,
        freeShippingThresholdPaise: settings.freeShippingThresholdRupees * 100,
        standardShippingCostPaise: settings.standardShippingCostRupees * 100,
        expressShippingCostPaise: settings.expressShippingCostRupees * 100,
        demoMode: settings.demoMode,
      });

      if (res.data.success) {
        toast.success('Store settings saved successfully!');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#14152D]">
          Global Store Configuration
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Configure monetary currency thresholds, taxes, and demo simulation rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-[#E8E3FA] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Store Name</label>
            <input
              type="text"
              value={settings.storeName}
              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
              className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Currency Code</label>
            <input
              type="text"
              disabled
              value="INR (Indian Rupee ₹)"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Tagline</label>
          <input
            type="text"
            value={settings.tagline}
            onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">GST Tax Rate (%)</label>
            <input
              type="number"
              min={0}
              max={28}
              value={settings.taxRatePercent}
              onChange={(e) => setSettings({ ...settings, taxRatePercent: Number(e.target.value) })}
              className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Free Shipping (₹)</label>
            <input
              type="number"
              min={0}
              value={settings.freeShippingThresholdRupees}
              onChange={(e) => setSettings({ ...settings, freeShippingThresholdRupees: Number(e.target.value) })}
              className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Standard Shipping (₹)</label>
            <input
              type="number"
              min={0}
              value={settings.standardShippingCostRupees}
              onChange={(e) => setSettings({ ...settings, standardShippingCostRupees: Number(e.target.value) })}
              className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-xs"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.demoMode}
              onChange={(e) => setSettings({ ...settings, demoMode: e.target.checked })}
              className="w-5 h-5 text-[#7444FF] rounded border-gray-300 focus:ring-[#7444FF]"
            />
            <div>
              <span className="font-bold text-xs text-[#14152D] block">
                Enable Demonstration & Sandbox Mode
              </span>
              <span className="text-[11px] text-gray-500">
                Allows simulated checkouts and mock payment testing without real bank debits.
              </span>
            </div>
          </label>
        </div>

        <div className="pt-2">
          <Button type="submit" variant="primary" size="md" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
            Save Store Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
