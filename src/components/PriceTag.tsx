import React from 'react';

interface PriceTagProps {
  priceQAR: number;
  priceDisplay?: string;
  arabicPrice?: string;
  isArabic: boolean;
  className?: string;
}

export const PriceTag: React.FC<PriceTagProps> = ({
  priceQAR,
  priceDisplay,
  arabicPrice,
  isArabic,
  className = '',
}) => {
  let numberStr = '';
  const currencyStr = isArabic ? 'ر.ق' : 'QAR';

  if (isArabic) {
    if (arabicPrice) {
      numberStr = arabicPrice.replace(/\s*ر\.ق\s*/g, '').trim();
    } else if (priceDisplay) {
      numberStr = priceDisplay;
    } else {
      numberStr = priceQAR.toString();
    }
  } else {
    if (priceDisplay) {
      numberStr = priceDisplay;
    } else {
      numberStr = priceQAR.toString();
    }
  }

  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap ${className}`}>
      <span dir="ltr" className="inline-block font-extrabold unicode-bidi-isolate">
        {numberStr}
      </span>
      <span className="font-bold">{currencyStr}</span>
    </span>
  );
};
