import {
  convertPower,
  convertWeight,
  convertSpeed,
  convertAcceleration,
  getUnitLabel,
} from '../unitConverter';

describe('Unit Converter', () => {
  describe('convertPower', () => {
    it('converts kW to HP', () => {
      expect(convertPower(100, true)).toBe('134 HP');
    });

    it('returns kW when not imperial', () => {
      expect(convertPower(100, false)).toBe('100 kW');
    });
  });

  describe('convertWeight', () => {
    it('converts kg to lbs', () => {
      expect(convertWeight(1000, true)).toBe('2205 lbs');
    });

    it('returns kg when not imperial', () => {
      expect(convertWeight(1000, false)).toBe('1000 kg');
    });
  });

  describe('convertSpeed', () => {
    it('converts km/h to mph', () => {
      expect(convertSpeed(100, true)).toBe('62 mph');
    });

    it('returns km/h when not imperial', () => {
      expect(convertSpeed(100, false)).toBe('100 km/h');
    });
  });

  describe('convertAcceleration', () => {
    it('returns seconds unchanged', () => {
      expect(convertAcceleration(10.5)).toBe('10.5 s');
    });
  });

  describe('getUnitLabel', () => {
    it('returns correct label for power in imperial', () => {
      expect(getUnitLabel('power', true)).toBe('HP');
    });

    it('returns correct label for power in metric', () => {
      expect(getUnitLabel('power', false)).toBe('kW');
    });

    it('returns correct label for weight in imperial', () => {
      expect(getUnitLabel('weight', true)).toBe('lbs');
    });

    it('returns correct label for weight in metric', () => {
      expect(getUnitLabel('weight', false)).toBe('kg');
    });

    it('returns correct label for speed in imperial', () => {
      expect(getUnitLabel('topSpeed', true)).toBe('mph');
    });

    it('returns correct label for speed in metric', () => {
      expect(getUnitLabel('topSpeed', false)).toBe('km/h');
    });
  });
});
