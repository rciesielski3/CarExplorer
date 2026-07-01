import { CarSpecification } from '../CarSpecification';

describe('CarSpecification type', () => {
  it('creates a valid CarSpecification object', () => {
    const spec: CarSpecification = {
      engine: ['2.0L', '2.5L', '3.5L'],
      power: ['150 kW', '165 kW', '200 kW'],
      torque: ['280 Nm', '310 Nm', '360 Nm'],
      acceleration: ['10.5 s', '9.8 s', '8.2 s'],
      weight: ['1500 kg', '1550 kg', '1600 kg'],
      dimensions: ['4850x1850x1480 mm'],
      fuelType: ['Petrol', 'Diesel', 'Hybrid'],
      transmission: ['Manual', 'Automatic'],
      topSpeed: ['200 km/h', '220 km/h'],
    };

    expect(spec.engine).toEqual(['2.0L', '2.5L', '3.5L']);
    expect(spec.power).toEqual(['150 kW', '165 kW', '200 kW']);
    expect(spec.transmission).toHaveLength(2);
  });

  it('allows empty string arrays', () => {
    const spec: CarSpecification = {
      engine: [],
      power: [],
      torque: [],
      acceleration: [],
      weight: [],
      dimensions: [],
      fuelType: [],
      transmission: [],
      topSpeed: [],
    };

    expect(spec.engine).toEqual([]);
    expect(spec.power).toEqual([]);
  });

  it('has all 9 required properties', () => {
    const spec: CarSpecification = {
      engine: [],
      power: [],
      torque: [],
      acceleration: [],
      weight: [],
      dimensions: [],
      fuelType: [],
      transmission: [],
      topSpeed: [],
    };

    const keys = Object.keys(spec);
    expect(keys).toHaveLength(9);
    expect(keys).toContain('engine');
    expect(keys).toContain('power');
    expect(keys).toContain('torque');
    expect(keys).toContain('acceleration');
    expect(keys).toContain('weight');
    expect(keys).toContain('dimensions');
    expect(keys).toContain('fuelType');
    expect(keys).toContain('transmission');
    expect(keys).toContain('topSpeed');
  });
});
