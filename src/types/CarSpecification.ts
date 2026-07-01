export type CarSpecification = {
  engine: string[];           // ["2.0L", "2.5L", "3.5L"]
  power: string[];            // ["150 kW", "165 kW", "200 kW"]
  torque: string[];           // ["280 Nm", "310 Nm", "360 Nm"]
  acceleration: string[];     // ["10.5 s", "9.8 s", "8.2 s"]
  weight: string[];           // ["1500 kg", "1550 kg", "1600 kg"]
  dimensions: string[];       // ["4850x1850x1480 mm"]
  fuelType: string[];         // ["Petrol", "Diesel", "Hybrid"]
  transmission: string[];     // ["Manual", "Automatic"]
  topSpeed: string[];         // ["200 km/h", "220 km/h"]
};
