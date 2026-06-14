export type StaticAiAnswerId = string;

export type StaticAiSuggestion = {
  id: StaticAiAnswerId;
  questionKey: string;
  fallbackQuestion: string;
};

type StaticAiFaqEntry = StaticAiSuggestion & {
  answerKey: string;
  fallbackAnswer: string;
  keywords: string[];
};

type CreateFaqEntry = Omit<StaticAiFaqEntry, "answerKey" | "questionKey"> & {
  questionKey?: string;
  answerKey?: string;
};

export type StaticAiMatch = {
  id: StaticAiAnswerId;
  questionKey: string;
  fallbackQuestion: string;
  answerKey: string;
  fallbackAnswer: string;
};

const MIN_MATCH_SCORE = 1;

const normalizeQuery = (query: string) =>
  query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const keywordMatches = (normalizedQuery: string, normalizedKeyword: string) => {
  if (normalizedKeyword.includes(" ")) {
    return normalizedQuery.includes(normalizedKeyword);
  }

  return normalizedQuery.split(" ").includes(normalizedKeyword);
};

const faq = ({
  id,
  fallbackQuestion,
  fallbackAnswer,
  keywords,
  questionKey = `aiQuestion_${id}`,
  answerKey = `aiAnswer_${id}`,
}: CreateFaqEntry): StaticAiFaqEntry => ({
  id,
  questionKey,
  fallbackQuestion,
  answerKey,
  fallbackAnswer,
  keywords,
});

const STATIC_AI_FAQ: StaticAiFaqEntry[] = [
  faq({
    id: "flat6",
    questionKey: "aiQuestionFlat6",
    fallbackQuestion: "What is a flat-6 engine?",
    answerKey: "aiAnswerFlat6",
    fallbackAnswer:
      "A flat-6 is a six-cylinder engine with opposing banks of cylinders. It keeps the center of gravity low and is known for smooth power delivery, which is why brands like Porsche use it in performance cars.",
    keywords: ["flat-6", "flat 6", "boxer", "six cylinder", "porsche"],
  }),
  faq({
    id: "bestEv",
    questionKey: "aiQuestionBestEv",
    fallbackQuestion: "What makes a good EV?",
    answerKey: "aiAnswerBestEv",
    fallbackAnswer:
      "A good EV balances real-world range, charging speed, efficiency, warranty, and cabin practicality. For daily use, charging access and predictable range usually matter more than peak horsepower.",
    keywords: ["best ev", "electric", "ev", "range", "charging", "battery"],
  }),
  faq({
    id: "awdVs4wd",
    questionKey: "aiQuestionAwdVs4wd",
    fallbackQuestion: "AWD vs 4WD",
    answerKey: "aiAnswerAwdVs4wd",
    fallbackAnswer:
      "AWD is usually automatic and optimized for road grip in rain, snow, or quick acceleration. 4WD is often more rugged, with low-range gearing for off-road use, towing, or very loose surfaces.",
    keywords: ["awd", "4wd", "four wheel", "all wheel", "drivetrain", "off road"],
  }),
  faq({
    id: "vin",
    questionKey: "aiQuestionVin",
    fallbackQuestion: "What should I check in a VIN?",
    answerKey: "aiAnswerVin",
    fallbackAnswer:
      "A VIN can confirm the model year, manufacturer, body type, and basic vehicle configuration. Always compare the decoded data with the listing, registration documents, and the VIN stamped on the vehicle.",
    keywords: ["vin", "decode", "vehicle identification", "registration"],
  }),
  faq({
    id: "firstCar",
    questionKey: "aiQuestionFirstCar",
    fallbackQuestion: "How do I choose a first car?",
    answerKey: "aiAnswerFirstCar",
    fallbackAnswer:
      "For a first car, prioritize reliability, insurance cost, service history, safety equipment, and simple maintenance. A less exciting car with clear history is usually a better buy than a bargain with hidden repairs.",
    keywords: ["first car", "beginner", "buying", "used car", "reliable", "insurance"],
  }),
  faq({
    id: "hybridVsEv",
    questionKey: "aiQuestionHybridVsEv",
    fallbackQuestion: "Hybrid or EV?",
    answerKey: "aiAnswerHybridVsEv",
    fallbackAnswer:
      "Choose an EV if you can charge regularly and most trips fit its real-world range. A hybrid is easier when you drive long distances often, lack home charging, or want lower fuel use without changing habits.",
    keywords: ["hybrid", "phev", "ev", "electric", "fuel", "charging"],
  }),
  faq({
    id: "turbo",
    questionKey: "aiQuestionTurbo",
    fallbackQuestion: "What does a turbo do?",
    answerKey: "aiAnswerTurbo",
    fallbackAnswer:
      "A turbo uses exhaust energy to push more air into the engine, helping it make more power from a smaller displacement. It can improve performance and efficiency, but maintenance and oil quality matter.",
    keywords: ["turbo", "turbocharger", "boost", "engine", "power"],
  }),
  faq({
    id: "maintenance",
    questionKey: "aiQuestionMaintenance",
    fallbackQuestion: "What maintenance matters most?",
    answerKey: "aiAnswerMaintenance",
    fallbackAnswer:
      "Oil changes, tires, brakes, fluids, battery health, and service records tell you more than a clean exterior. Before buying used, check for overdue maintenance and repeated warning lights.",
    keywords: ["maintenance", "service", "oil", "brakes", "tires", "used car"],
  }),
  faq({
    id: "mileage",
    fallbackQuestion: "How much mileage is too much?",
    fallbackAnswer:
      "Mileage matters less than maintenance, usage, and condition. A well-serviced highway-mile car can be safer than a low-mile car with gaps in history.",
    keywords: ["mileage", "kilometers", "miles", "high mileage", "odometer"],
  }),
  faq({
    id: "serviceHistory",
    fallbackQuestion: "How important is service history?",
    fallbackAnswer:
      "Service history is one of the strongest signals when buying used. Look for regular oil changes, timing belt or chain work when due, brake service, and documented repairs.",
    keywords: ["service history", "records", "maintenance records", "invoices"],
  }),
  faq({
    id: "accidentDamage",
    fallbackQuestion: "How do I spot accident damage?",
    fallbackAnswer:
      "Check panel gaps, paint shade differences, overspray, uneven tire wear, warning lights, and inconsistent VIN labels. A professional inspection is worth it before buying.",
    keywords: ["accident", "crash", "damage", "paint", "panel gaps"],
  }),
  faq({
    id: "salvageTitle",
    fallbackQuestion: "Should I buy a salvage title car?",
    fallbackAnswer:
      "A salvage title can be risky because repairs, safety systems, and resale value may be uncertain. Buy only with full documentation and an independent inspection.",
    keywords: ["salvage", "rebuilt", "title", "write off"],
  }),
  faq({
    id: "prePurchaseInspection",
    fallbackQuestion: "Is a pre-purchase inspection worth it?",
    fallbackAnswer:
      "Yes. A pre-purchase inspection can reveal leaks, worn suspension, hidden body repairs, diagnostic codes, and overdue service before you commit.",
    keywords: ["inspection", "pre purchase", "ppi", "mechanic check"],
  }),
  faq({
    id: "testDrive",
    fallbackQuestion: "What should I check on a test drive?",
    fallbackAnswer:
      "Listen for cold-start noises, check braking, steering, gear changes, suspension bumps, HVAC, infotainment, and whether the car tracks straight.",
    keywords: ["test drive", "drive test", "braking", "steering", "gear changes"],
  }),
  faq({
    id: "coldStart",
    fallbackQuestion: "Why is a cold start important?",
    fallbackAnswer:
      "A cold start can reveal weak batteries, timing chain noise, smoke, rough idle, and leaks that may disappear once the engine is warm.",
    keywords: ["cold start", "start", "rough idle", "smoke", "battery"],
  }),
  faq({
    id: "checkEngine",
    fallbackQuestion: "Can I ignore a check engine light?",
    fallbackAnswer:
      "Do not ignore it before buying. Scan the codes, confirm readiness monitors, and treat recently cleared codes as a warning sign.",
    keywords: ["check engine", "engine light", "obd", "codes", "warning light"],
  }),
  faq({
    id: "obdScanner",
    fallbackQuestion: "Should I use an OBD scanner?",
    fallbackAnswer:
      "An OBD scanner is useful for checking stored codes, emissions readiness, and whether faults were recently cleared. It does not replace a mechanical inspection.",
    keywords: ["obd scanner", "diagnostic", "codes", "readiness"],
  }),
  faq({
    id: "timingBelt",
    fallbackQuestion: "Timing belt or timing chain?",
    fallbackAnswer:
      "Timing belts usually have strict replacement intervals, while chains often last longer but can still stretch or rattle. Always check the model-specific schedule.",
    keywords: ["timing belt", "timing chain", "belt", "chain", "interval"],
  }),
  faq({
    id: "dieselShortTrips",
    fallbackQuestion: "Is diesel good for short trips?",
    fallbackAnswer:
      "Modern diesels are often poor for mostly short trips because DPF regeneration may not complete. Petrol, hybrid, or EV can be better for city use.",
    keywords: ["diesel", "short trips", "dpf", "city driving"],
  }),
  faq({
    id: "dpf",
    fallbackQuestion: "What is a DPF?",
    fallbackAnswer:
      "A DPF is a diesel particulate filter that traps soot and burns it off during regeneration. Frequent short trips can clog it and cause costly repairs.",
    keywords: ["dpf", "particulate filter", "diesel filter", "regeneration"],
  }),
  faq({
    id: "adblue",
    fallbackQuestion: "What is AdBlue?",
    fallbackAnswer:
      "AdBlue is a fluid used by many diesel cars to reduce NOx emissions. If the system fails or the tank runs empty, the car may limit starts or power.",
    keywords: ["adblue", "scr", "diesel emissions", "nox"],
  }),
  faq({
    id: "manualVsAutomatic",
    fallbackQuestion: "Manual or automatic?",
    fallbackAnswer:
      "Manuals can be cheaper and engaging, while automatics are easier in traffic and often better in modern hybrids or EVs. Choose based on commute, reliability, and service cost.",
    keywords: ["manual", "automatic", "gearbox", "transmission"],
  }),
  faq({
    id: "cvt",
    fallbackQuestion: "What is a CVT?",
    fallbackAnswer:
      "A CVT uses variable ratios instead of fixed gears, which can improve efficiency and smoothness. Some drivers dislike the engine sound under acceleration.",
    keywords: ["cvt", "variable transmission", "automatic transmission"],
  }),
  faq({
    id: "dualClutch",
    fallbackQuestion: "What is a dual-clutch transmission?",
    fallbackAnswer:
      "A dual-clutch gearbox shifts quickly using two clutches, often feeling sporty and efficient. It can be expensive if neglected or abused in heavy traffic.",
    keywords: ["dual clutch", "dct", "dsg", "pdk", "transmission"],
  }),
  faq({
    id: "fwdRwdAwd",
    fallbackQuestion: "FWD, RWD, or AWD?",
    fallbackAnswer:
      "FWD is efficient and practical, RWD can feel more balanced and sporty, and AWD adds traction at the cost of weight, complexity, and fuel use.",
    keywords: ["fwd", "rwd", "awd", "front wheel", "rear wheel"],
  }),
  faq({
    id: "horsepowerTorque",
    fallbackQuestion: "Horsepower vs torque?",
    fallbackAnswer:
      "Torque helps the car feel strong at low speeds, while horsepower matters more for sustained acceleration and top-end performance. Gearing changes how both feel.",
    keywords: ["horsepower", "torque", "power", "hp", "nm"],
  }),
  faq({
    id: "zeroToSixty",
    fallbackQuestion: "Does 0-60 matter?",
    fallbackAnswer:
      "0-60 is useful for comparing straight-line performance, but daily driving also depends on throttle response, braking, visibility, comfort, and traction.",
    keywords: ["0-60", "0 to 60", "acceleration", "performance"],
  }),
  faq({
    id: "mpg",
    fallbackQuestion: "How do I compare fuel economy?",
    fallbackAnswer:
      "Compare real-world owner reports, not just official numbers. Driving style, tires, traffic, roof boxes, and temperature can change fuel economy a lot.",
    keywords: ["mpg", "fuel economy", "consumption", "l/100", "efficiency"],
  }),
  faq({
    id: "rangeAnxiety",
    fallbackQuestion: "How do I avoid EV range anxiety?",
    fallbackAnswer:
      "Use real-world range estimates, plan charging on long trips, precondition the battery when possible, and keep a buffer for cold weather or highway speeds.",
    keywords: ["range anxiety", "ev range", "electric range", "charging"],
  }),
  faq({
    id: "fastCharging",
    fallbackQuestion: "What is fast charging?",
    fallbackAnswer:
      "Fast charging uses high-power DC chargers to add range quickly. The real speed depends on charger power, battery temperature, battery state of charge, and the car's charging curve.",
    keywords: ["fast charging", "dc charging", "charger", "charging speed"],
  }),
  faq({
    id: "homeCharging",
    fallbackQuestion: "Do I need home charging for an EV?",
    fallbackAnswer:
      "Home charging makes EV ownership much easier and cheaper. Without it, check nearby reliable chargers and your weekly mileage before buying.",
    keywords: ["home charging", "wallbox", "ev charger", "charging at home"],
  }),
  faq({
    id: "batteryDegradation",
    fallbackQuestion: "Do EV batteries degrade?",
    fallbackAnswer:
      "Yes, but many modern EV batteries degrade slowly when managed well. Heat, frequent fast charging, and sitting at very high charge can accelerate wear.",
    keywords: ["battery degradation", "battery health", "ev battery", "soh"],
  }),
  faq({
    id: "phev",
    fallbackQuestion: "Is a plug-in hybrid worth it?",
    fallbackAnswer:
      "A plug-in hybrid works best if you charge often and daily trips fit the electric range. If you never charge, it may be heavier and less efficient than a regular hybrid.",
    keywords: ["phev", "plug in hybrid", "plugin hybrid", "hybrid"],
  }),
  faq({
    id: "regularHybrid",
    fallbackQuestion: "How does a regular hybrid work?",
    fallbackAnswer:
      "A regular hybrid blends a petrol engine with an electric motor and small battery. It charges itself through braking and engine operation, so you do not plug it in.",
    keywords: ["regular hybrid", "self charging hybrid", "hybrid"],
  }),
  faq({
    id: "mildHybrid",
    fallbackQuestion: "What is a mild hybrid?",
    fallbackAnswer:
      "A mild hybrid uses a small electrical system to assist the engine and improve start-stop behavior. It usually cannot drive on electric power alone.",
    keywords: ["mild hybrid", "mhev", "48v", "start stop"],
  }),
  faq({
    id: "evColdWeather",
    fallbackQuestion: "Do EVs lose range in winter?",
    fallbackAnswer:
      "EVs often lose range in cold weather because the battery and cabin need heat. Heat pumps, preconditioning, and moderate speeds help reduce the drop.",
    keywords: ["winter ev", "cold weather", "ev winter", "heat pump"],
  }),
  faq({
    id: "heatPump",
    fallbackQuestion: "What is an EV heat pump?",
    fallbackAnswer:
      "A heat pump warms the cabin more efficiently than resistive heating, especially in mild winter conditions. It can help preserve range in cold weather.",
    keywords: ["heat pump", "ev heating", "winter range"],
  }),
  faq({
    id: "tires",
    fallbackQuestion: "Which tires matter most?",
    fallbackAnswer:
      "Good tires affect braking, grip, noise, comfort, and efficiency. Buying quality tires often improves safety more than many cosmetic upgrades.",
    keywords: ["tires", "tyres", "grip", "braking", "all season"],
  }),
  faq({
    id: "winterTires",
    fallbackQuestion: "Do I need winter tires?",
    fallbackAnswer:
      "Winter tires improve grip and braking in cold temperatures, snow, and slush. In mild climates, quality all-season tires may be enough.",
    keywords: ["winter tires", "snow tires", "cold", "all season"],
  }),
  faq({
    id: "tireAge",
    fallbackQuestion: "How old can tires be?",
    fallbackAnswer:
      "Tires age even with good tread. Check the DOT date and replace old, cracked, or hardened tires because grip can drop significantly.",
    keywords: ["tire age", "dot date", "old tires", "tread"],
  }),
  faq({
    id: "brakes",
    fallbackQuestion: "How do I know brakes are worn?",
    fallbackAnswer:
      "Warning signs include vibration, squealing, grinding, pulling to one side, a soft pedal, or visible thin pads and scored discs.",
    keywords: ["brakes", "pads", "rotors", "discs", "squealing"],
  }),
  faq({
    id: "suspension",
    fallbackQuestion: "How do I spot suspension issues?",
    fallbackAnswer:
      "Listen for knocks, check uneven tire wear, bouncing after bumps, pulling, leaking shocks, and clunks during slow turns or braking.",
    keywords: ["suspension", "shocks", "struts", "knocking", "clunk"],
  }),
  faq({
    id: "alignment",
    fallbackQuestion: "What are signs of bad alignment?",
    fallbackAnswer:
      "Bad alignment can cause the car to pull, the steering wheel to sit off-center, or tires to wear unevenly. It can also reduce efficiency and comfort.",
    keywords: ["alignment", "pulling", "steering wheel", "uneven tire wear"],
  }),
  faq({
    id: "battery12v",
    fallbackQuestion: "Why does the 12V battery matter?",
    fallbackAnswer:
      "Even EVs and hybrids rely on a 12V battery for control systems. A weak 12V battery can cause strange warnings, no-start issues, and lock problems.",
    keywords: ["12v battery", "battery", "no start", "warnings"],
  }),
  faq({
    id: "oilInterval",
    fallbackQuestion: "How often should oil be changed?",
    fallbackAnswer:
      "Follow the manufacturer's interval, but short trips, turbo engines, towing, or hard driving can justify shorter oil changes with the correct specification.",
    keywords: ["oil change", "oil interval", "engine oil", "service"],
  }),
  faq({
    id: "coolant",
    fallbackQuestion: "Why is coolant important?",
    fallbackAnswer:
      "Coolant controls engine temperature and protects against corrosion or freezing. Low or contaminated coolant can cause overheating and expensive damage.",
    keywords: ["coolant", "antifreeze", "overheating", "temperature"],
  }),
  faq({
    id: "airConditioning",
    fallbackQuestion: "What if the AC is weak?",
    fallbackAnswer:
      "Weak AC can mean low refrigerant, leaks, a failing compressor, clogged cabin filter, or electrical issues. Do not assume it only needs a quick recharge.",
    keywords: ["ac", "air conditioning", "refrigerant", "compressor"],
  }),
  faq({
    id: "rust",
    fallbackQuestion: "How serious is rust?",
    fallbackAnswer:
      "Surface rust can be manageable, but structural rust around suspension, sills, frame rails, or brake lines is a major safety and cost concern.",
    keywords: ["rust", "corrosion", "frame", "sills", "undercarriage"],
  }),
  faq({
    id: "floodDamage",
    fallbackQuestion: "How do I spot flood damage?",
    fallbackAnswer:
      "Look for musty smells, water lines, corrosion under seats, damp carpets, electrical faults, and mismatched interior trim. Flood cars can be very risky.",
    keywords: ["flood damage", "water damage", "musty", "damp", "corrosion"],
  }),
  faq({
    id: "insuranceCost",
    fallbackQuestion: "Why is insurance expensive?",
    fallbackAnswer:
      "Insurance cost depends on repair prices, theft rates, performance, driver profile, safety systems, location, and claim history. Always quote before buying.",
    keywords: ["insurance", "premium", "cost", "repair cost"],
  }),
  faq({
    id: "depreciation",
    fallbackQuestion: "What affects depreciation?",
    fallbackAnswer:
      "Depreciation is driven by brand demand, mileage, condition, options, fuel type, warranty, reliability reputation, and market trends.",
    keywords: ["depreciation", "resale", "value", "market value"],
  }),
  faq({
    id: "totalCost",
    fallbackQuestion: "How do I estimate total ownership cost?",
    fallbackAnswer:
      "Add financing, insurance, fuel or charging, taxes, tires, maintenance, repairs, depreciation, and parking. Purchase price is only one part of cost.",
    keywords: ["total cost", "ownership cost", "tco", "running costs"],
  }),
  faq({
    id: "warranty",
    fallbackQuestion: "What should I check in a warranty?",
    fallbackAnswer:
      "Check what is covered, exclusions, mileage limits, transfer rules, service requirements, claim process, and whether wear items are excluded.",
    keywords: ["warranty", "coverage", "guarantee", "extended warranty"],
  }),
  faq({
    id: "recall",
    fallbackQuestion: "How do I check recalls?",
    fallbackAnswer:
      "Use the VIN with official recall tools or manufacturer sites. Recalls are usually repaired free, but open recalls should be resolved promptly.",
    keywords: ["recall", "vin recall", "safety recall", "manufacturer recall"],
  }),
  faq({
    id: "safetyRating",
    fallbackQuestion: "How should I compare safety ratings?",
    fallbackAnswer:
      "Compare ratings from the same testing organization and year where possible. Also consider active safety features and real-world visibility.",
    keywords: ["safety rating", "ncap", "iihs", "crash test"],
  }),
  faq({
    id: "adas",
    fallbackQuestion: "What are ADAS features?",
    fallbackAnswer:
      "ADAS includes driver assists like lane keeping, adaptive cruise, blind spot monitoring, and emergency braking. They help, but the driver remains responsible.",
    keywords: ["adas", "lane assist", "adaptive cruise", "blind spot", "aeb"],
  }),
  faq({
    id: "isofix",
    fallbackQuestion: "What is ISOFIX?",
    fallbackAnswer:
      "ISOFIX is a standardized child-seat mounting system that can make installation easier and more secure. Check seat compatibility before buying.",
    keywords: ["isofix", "child seat", "car seat", "latch"],
  }),
  faq({
    id: "familyCar",
    fallbackQuestion: "What makes a good family car?",
    fallbackAnswer:
      "A good family car has easy rear access, practical cargo space, safety tech, comfortable ride, low running costs, and simple child-seat installation.",
    keywords: ["family car", "children", "cargo", "practical", "suv"],
  }),
  faq({
    id: "cityCar",
    fallbackQuestion: "What makes a good city car?",
    fallbackAnswer:
      "A city car should be easy to park, efficient in traffic, comfortable at low speeds, visible, and inexpensive to insure and maintain.",
    keywords: ["city car", "urban", "parking", "small car", "commute"],
  }),
  faq({
    id: "longDistance",
    fallbackQuestion: "What makes a good long-distance car?",
    fallbackAnswer:
      "For long trips, prioritize seat comfort, noise isolation, stable highway ride, efficient cruising, driver assists, and enough range between stops.",
    keywords: ["long distance", "highway", "road trip", "comfort"],
  }),
  faq({
    id: "towing",
    fallbackQuestion: "What should I check for towing?",
    fallbackAnswer:
      "Check braked towing capacity, tongue weight, cooling, transmission strength, trailer stability systems, and whether the towbar is factory-approved.",
    keywords: ["towing", "tow", "trailer", "towbar", "capacity"],
  }),
  faq({
    id: "roofBox",
    fallbackQuestion: "Does a roof box affect range?",
    fallbackAnswer:
      "Yes. Roof boxes increase aerodynamic drag, which can reduce fuel economy or EV range, especially at highway speeds.",
    keywords: ["roof box", "roof rack", "aerodynamics", "range", "fuel economy"],
  }),
  faq({
    id: "suvVsWagon",
    fallbackQuestion: "SUV or wagon?",
    fallbackAnswer:
      "SUVs offer height and easier access, while wagons often drive better, use less fuel, and provide similar cargo space. Compare your real use case.",
    keywords: ["suv", "wagon", "estate", "cargo", "family"],
  }),
  faq({
    id: "sedanVsHatch",
    fallbackQuestion: "Sedan or hatchback?",
    fallbackAnswer:
      "Sedans can be quieter and more secure for luggage, while hatchbacks are usually more flexible for bulky items and city use.",
    keywords: ["sedan", "hatchback", "boot", "trunk", "cargo"],
  }),
  faq({
    id: "leaseVsBuy",
    fallbackQuestion: "Lease or buy?",
    fallbackAnswer:
      "Leasing can simplify monthly costs and keep you in newer cars, while buying is usually better if you keep cars long-term and want flexibility.",
    keywords: ["lease", "buy", "finance", "monthly payment"],
  }),
  faq({
    id: "newVsUsed",
    fallbackQuestion: "New or used car?",
    fallbackAnswer:
      "New cars bring warranty and known history, while used cars can save money but require more inspection. Certified used can be a useful middle ground.",
    keywords: ["new car", "used car", "certified", "cpo"],
  }),
  faq({
    id: "certifiedUsed",
    fallbackQuestion: "Is certified pre-owned worth it?",
    fallbackAnswer:
      "Certified pre-owned can be worth it if the inspection, warranty, and return terms are strong. Compare the premium against a normal used car plus independent inspection.",
    keywords: ["certified pre owned", "cpo", "approved used", "warranty"],
  }),
  faq({
    id: "negotiation",
    fallbackQuestion: "How do I negotiate a used car?",
    fallbackAnswer:
      "Use comparable listings, inspection findings, service needs, tire condition, and market days as evidence. Stay polite and be ready to walk away.",
    keywords: ["negotiate", "negotiation", "price", "used car deal"],
  }),
  faq({
    id: "privateVsDealer",
    fallbackQuestion: "Private seller or dealer?",
    fallbackAnswer:
      "Dealers may offer warranty and financing, while private sellers can be cheaper. With private sellers, verify ownership, documents, and payment safety carefully.",
    keywords: ["private seller", "dealer", "dealership", "seller"],
  }),
  faq({
    id: "documents",
    fallbackQuestion: "What documents should I check?",
    fallbackAnswer:
      "Check registration, title or ownership papers, service records, inspection documents, finance status, and that VIN details match the vehicle.",
    keywords: ["documents", "registration", "title", "ownership", "papers"],
  }),
  faq({
    id: "financeOutstanding",
    fallbackQuestion: "What if a car has outstanding finance?",
    fallbackAnswer:
      "Do not buy until finance status is resolved in writing. Outstanding finance can create ownership and repossession risk.",
    keywords: ["outstanding finance", "lien", "loan", "finance check"],
  }),
  faq({
    id: "odometerRollback",
    fallbackQuestion: "How do I spot odometer rollback?",
    fallbackAnswer:
      "Compare mileage across service records, inspections, tire age, interior wear, digital history, and vehicle reports. Inconsistencies are a serious red flag.",
    keywords: ["odometer rollback", "clocked", "mileage fraud", "odometer"],
  }),
  faq({
    id: "importedCar",
    fallbackQuestion: "Should I buy an imported car?",
    fallbackAnswer:
      "Imported cars can be good, but check parts availability, history transparency, emissions compliance, insurance, navigation, lights, and resale value.",
    keywords: ["imported car", "import", "grey import", "jdm"],
  }),
  faq({
    id: "emissionsZone",
    fallbackQuestion: "Should I check emissions zones?",
    fallbackAnswer:
      "Yes. City emissions rules can affect where you can drive and future resale value, especially for older diesel and petrol vehicles.",
    keywords: ["emissions zone", "ulez", "lez", "low emission", "diesel"],
  }),
  faq({
    id: "euroEmissions",
    fallbackQuestion: "What are Euro emissions standards?",
    fallbackAnswer:
      "Euro standards classify vehicle emissions levels. Higher standards generally mean cleaner emissions and fewer restrictions in regulated city zones.",
    keywords: ["euro 6", "euro emissions", "emission standard", "euro 5"],
  }),
  faq({
    id: "carSize",
    fallbackQuestion: "How do I choose the right car size?",
    fallbackAnswer:
      "Measure parking spaces, child-seat needs, cargo, passengers, and usual roads. Bigger cars add comfort but also cost, weight, and parking stress.",
    keywords: ["car size", "compact", "large car", "parking", "dimensions"],
  }),
  faq({
    id: "groundClearance",
    fallbackQuestion: "When does ground clearance matter?",
    fallbackAnswer:
      "Ground clearance matters for rough roads, steep driveways, snow, and light off-road use. It can also affect loading height and handling.",
    keywords: ["ground clearance", "off road", "snow", "driveway"],
  }),
  faq({
    id: "payload",
    fallbackQuestion: "What is payload?",
    fallbackAnswer:
      "Payload is how much weight the vehicle can carry, including people, luggage, accessories, and cargo. Exceeding it can be unsafe and illegal.",
    keywords: ["payload", "load", "weight limit", "cargo weight"],
  }),
  faq({
    id: "curbWeight",
    fallbackQuestion: "Why does curb weight matter?",
    fallbackAnswer:
      "Curb weight affects acceleration, braking, tire wear, efficiency, and handling. Heavier vehicles may feel stable but cost more to run.",
    keywords: ["curb weight", "weight", "mass", "heavy car"],
  }),
  faq({
    id: "brakeRegen",
    fallbackQuestion: "What is regenerative braking?",
    fallbackAnswer:
      "Regenerative braking recovers energy while slowing an EV or hybrid and sends it back to the battery. It can reduce brake wear in daily driving.",
    keywords: ["regenerative braking", "regen", "ev braking", "hybrid braking"],
  }),
  faq({
    id: "onePedal",
    fallbackQuestion: "What is one-pedal driving?",
    fallbackAnswer:
      "One-pedal driving lets an EV slow strongly when you lift off the accelerator. It is convenient in traffic but you still need the brake pedal for emergencies.",
    keywords: ["one pedal", "one-pedal", "ev driving", "regen"],
  }),
  faq({
    id: "chargingCurve",
    fallbackQuestion: "What is an EV charging curve?",
    fallbackAnswer:
      "A charging curve shows how fast an EV charges at different battery levels. Many cars charge fastest at low state of charge and slow down near full.",
    keywords: ["charging curve", "state of charge", "soc", "fast charging"],
  }),
  faq({
    id: "batteryWarranty",
    fallbackQuestion: "What does an EV battery warranty cover?",
    fallbackAnswer:
      "Battery warranties usually cover years, mileage, and minimum capacity. Read the threshold carefully because normal degradation may not qualify.",
    keywords: ["battery warranty", "ev warranty", "capacity warranty"],
  }),
  faq({
    id: "chargingConnector",
    fallbackQuestion: "Which charging connector do I need?",
    fallbackAnswer:
      "Connector standards vary by region and car. Check home charging compatibility, public fast-charger support, and whether adapters are officially supported.",
    keywords: ["charging connector", "ccs", "type 2", "nacs", "chademo"],
  }),
  faq({
    id: "infotainment",
    fallbackQuestion: "How important is infotainment?",
    fallbackAnswer:
      "Infotainment matters because you use it every drive. Check phone integration, responsiveness, physical controls, navigation, updates, and climate controls.",
    keywords: ["infotainment", "carplay", "android auto", "navigation"],
  }),
  faq({
    id: "softwareUpdates",
    fallbackQuestion: "Do software updates matter?",
    fallbackAnswer:
      "Software updates can improve infotainment, charging, range estimates, safety assists, and bug fixes. Check whether updates are free and reliable.",
    keywords: ["software updates", "ota", "over the air", "firmware"],
  }),
  faq({
    id: "keylessTheft",
    fallbackQuestion: "Are keyless cars easier to steal?",
    fallbackAnswer:
      "Some keyless systems are vulnerable to relay attacks. Use a signal-blocking pouch, turn off passive entry if available, and check insurance risk.",
    keywords: ["keyless", "relay theft", "stolen", "security"],
  }),
  faq({
    id: "dashcam",
    fallbackQuestion: "Should I install a dashcam?",
    fallbackAnswer:
      "A dashcam can help document incidents and parking damage. Install it safely, avoid blocking airbags, and follow local privacy rules.",
    keywords: ["dashcam", "camera", "parking mode", "incident"],
  }),
  faq({
    id: "ceramicCoating",
    fallbackQuestion: "Is ceramic coating worth it?",
    fallbackAnswer:
      "Ceramic coating can make washing easier and add paint protection, but it does not prevent chips or replace proper washing and maintenance.",
    keywords: ["ceramic coating", "paint protection", "detailing"],
  }),
  faq({
    id: "paintProtectionFilm",
    fallbackQuestion: "What is paint protection film?",
    fallbackAnswer:
      "Paint protection film is a clear layer that helps resist stone chips and scratches. It is most useful on front bumpers, hoods, mirrors, and high-impact areas.",
    keywords: ["ppf", "paint protection film", "stone chips", "scratches"],
  }),
  faq({
    id: "washing",
    fallbackQuestion: "How should I wash a car safely?",
    fallbackAnswer:
      "Rinse first, use clean mitts and proper car shampoo, avoid dirty brushes, and dry gently. Poor washing can create swirl marks quickly.",
    keywords: ["wash car", "washing", "swirl marks", "detailing"],
  }),
  faq({
    id: "mods",
    fallbackQuestion: "Do modifications hurt resale value?",
    fallbackAnswer:
      "Many modifications narrow the buyer pool and can affect insurance or warranty. Reversible, documented, quality upgrades are usually safer.",
    keywords: ["modifications", "mods", "tuning", "resale", "warranty"],
  }),
  faq({
    id: "chipTuning",
    fallbackQuestion: "Is chip tuning safe?",
    fallbackAnswer:
      "Chip tuning can add power, but it may increase stress on the engine, transmission, cooling, and emissions systems. Use reputable tuners and disclose it to insurance.",
    keywords: ["chip tuning", "remap", "ecu tune", "tuning"],
  }),
  faq({
    id: "premiumFuel",
    fallbackQuestion: "Do I need premium fuel?",
    fallbackAnswer:
      "Use the octane recommended by the manufacturer. Some engines require premium fuel, while others only gain small performance benefits from it.",
    keywords: ["premium fuel", "octane", "gasoline", "petrol"],
  }),
  faq({
    id: "ethanol",
    fallbackQuestion: "Can I use ethanol fuel?",
    fallbackAnswer:
      "Only use ethanol blends approved for your vehicle. Higher ethanol can damage fuel systems or change tuning requirements if the car is not designed for it.",
    keywords: ["ethanol", "e10", "e85", "fuel"],
  }),
  faq({
    id: "warningLights",
    fallbackQuestion: "Which warning lights are urgent?",
    fallbackAnswer:
      "Oil pressure, overheating, brake system, airbag, battery charging, and flashing check-engine lights need immediate attention. Stop safely if the manual advises it.",
    keywords: ["warning lights", "oil pressure", "overheating", "brake light"],
  }),
  faq({
    id: "overheating",
    fallbackQuestion: "What should I do if a car overheats?",
    fallbackAnswer:
      "Stop safely, turn off the engine, and let it cool. Do not open a hot coolant cap, and do not keep driving with high temperature warnings.",
    keywords: ["overheating", "temperature", "coolant", "hot engine"],
  }),
  faq({
    id: "spareTire",
    fallbackQuestion: "Should I check for a spare tire?",
    fallbackAnswer:
      "Yes. Some cars have a spare, some have a repair kit, and some have neither. Know what is included before a long trip.",
    keywords: ["spare tire", "repair kit", "puncture", "flat tire"],
  }),
  faq({
    id: "runFlat",
    fallbackQuestion: "What are run-flat tires?",
    fallbackAnswer:
      "Run-flat tires can be driven for a short distance after pressure loss, but they may ride firmer and cost more. Follow the speed and distance limits.",
    keywords: ["run flat", "run-flat", "puncture", "tire pressure"],
  }),
  faq({
    id: "tpms",
    fallbackQuestion: "What is TPMS?",
    fallbackAnswer:
      "TPMS monitors tire pressure and warns when pressure is low. Correct pressure improves safety, tire life, ride quality, and efficiency.",
    keywords: ["tpms", "tire pressure", "pressure monitoring"],
  }),
];

export const getStaticAiSuggestions = (): StaticAiSuggestion[] =>
  STATIC_AI_FAQ.slice(0, 3).map(({ id, questionKey, fallbackQuestion }) => ({
    id,
    questionKey,
    fallbackQuestion,
  }));

export const getStaticAiFaqCount = (): number => STATIC_AI_FAQ.length;

export const findStaticAiAnswer = (query: string): StaticAiMatch | null => {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) {
    return null;
  }

  const bestMatch = STATIC_AI_FAQ.map((entry) => {
    const score = entry.keywords.reduce((currentScore, keyword) => {
      const normalizedKeyword = normalizeQuery(keyword);
      return keywordMatches(normalizedQuery, normalizedKeyword)
        ? currentScore + Math.max(1, normalizedKeyword.split(" ").length)
        : currentScore;
    }, 0);

    return { entry, score };
  }).sort((left, right) => right.score - left.score)[0];

  if (!bestMatch || bestMatch.score < MIN_MATCH_SCORE) {
    return null;
  }

  const { keywords: _keywords, ...match } = bestMatch.entry;
  return match;
};
