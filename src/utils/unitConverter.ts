// Conversion factors
const KW_TO_HP = 1.34102;
const KG_TO_LBS = 2.20462;
const KMH_TO_MPH = 0.621371;

export const convertPower = (kw: number, toImperial: boolean): string => {
  if (toImperial) {
    const hp = Math.round(kw * KW_TO_HP);
    return `${hp} HP`;
  }
  return `${kw} kW`;
};

export const convertWeight = (kg: number, toImperial: boolean): string => {
  if (toImperial) {
    const lbs = Math.round(kg * KG_TO_LBS);
    return `${lbs} lbs`;
  }
  return `${kg} kg`;
};

export const convertSpeed = (kmh: number, toImperial: boolean): string => {
  if (toImperial) {
    const mph = Math.round(kmh * KMH_TO_MPH);
    return `${mph} mph`;
  }
  return `${kmh} km/h`;
};

export const convertAcceleration = (seconds: number): string => {
  return `${seconds} s`;
};

export const getUnitLabel = (propertyName: string, toImperial: boolean): string => {
  const labels: Record<string, { metric: string; imperial: string }> = {
    power: { metric: 'kW', imperial: 'HP' },
    weight: { metric: 'kg', imperial: 'lbs' },
    topSpeed: { metric: 'km/h', imperial: 'mph' },
    acceleration: { metric: 's', imperial: 's' },
    engine: { metric: 'L', imperial: 'L' },
    torque: { metric: 'Nm', imperial: 'Nm' },
    dimensions: { metric: 'mm', imperial: 'mm' },
    fuelType: { metric: '', imperial: '' },
    transmission: { metric: '', imperial: '' },
  };

  const label = labels[propertyName];
  if (!label) return '';
  return toImperial ? label.imperial : label.metric;
};
