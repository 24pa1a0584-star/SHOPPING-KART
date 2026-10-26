import React from 'react';
import { IProductVariant } from '../../types';
import { Check } from 'lucide-react';

interface VariantSelectorProps {
  variants: IProductVariant[];
  selectedVariant: IProductVariant | null;
  onSelectVariant: (variant: IProductVariant) => void;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariant,
  onSelectVariant,
}) => {
  if (!variants || variants.length <= 1) {
    return null;
  }

  // Extract all unique option names across variants (e.g. ['Color', 'Size'])
  const optionNames = Array.from(
    new Set(variants.flatMap((v) => v.options.map((o) => o.name)))
  );

  return (
    <div className="space-y-4">
      {variants.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Select Option / Variant:
          </label>
          <div className="flex flex-wrap gap-2.5">
            {variants.map((v) => {
              const isSelected = selectedVariant?._id === v._id;
              const isOut = v.stock <= 0;

              return (
                <button
                  key={v._id}
                  type="button"
                  onClick={() => onSelectVariant(v)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border flex items-center gap-1.5 transition-all select-none ${
                    isSelected
                      ? 'border-[#7444FF] bg-[#F0EBFF] text-[#7444FF] shadow-sm font-semibold'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  } ${isOut ? 'opacity-60 bg-gray-50' : ''}`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#7444FF]" />}
                  <span>{v.title}</span>
                  {isOut ? (
                    <span className="text-[10px] text-[#FF6B67] uppercase font-bold ml-1">(Sold out)</span>
                  ) : v.stock <= 5 ? (
                    <span className="text-[10px] text-amber-600 font-bold ml-1">({v.stock} left)</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
