// data/fixtures.js
export const FIXTURE_CATALOG = {
  Kitchen: [
    { key: "refrigerator", label: "Refrigerator", model: "Whirlpool WRT318FZDW" },
    { key: "range", label: "Stove / Oven", model: "GE JB258RMSS" },
    { key: "microwave", label: "Microwave", model: "Samsung ME16K3000AS" },
    { key: "dishwasher", label: "Dishwasher", model: "Frigidaire FFCD2413US" },
    { key: "disposal", label: "Garbage Disposal", model: "InSinkErator Badger 1" },
  ],
  Laundry: [
    { key: "washer", label: "Washer", model: "LG WM3400CW" },
    { key: "dryer", label: "Dryer", model: "LG DLE3400W" },
  ],
  HVAC: [
    { key: "ac", label: "Air Conditioner / Heat", model: "Goodman GSZ14018" },
    { key: "thermostat", label: "Thermostat", model: "Honeywell RTH2300B" },
  ],
  "Bath & Plumbing": [
    { key: "toilet", label: "Toilet", model: "American Standard Cadet 3" },
    { key: "shower", label: "Shower Fixtures", model: "Moen 82604" },
    { key: "faucet", label: "Sink Faucet", model: "Typical 35mm cartridge" },
    { key: "drain", label: "Drain / Trap", model: "S-trap / gasket" },
  ],
  "Electrical / Safety": [
    { key: "smoke", label: "Smoke Detector", model: "First Alert SA304CN3" },
  ],
};

export const CATEGORIES = Object.keys(FIXTURE_CATALOG);

// Helper to find fixture by key
export function getFixtureByKey(key) {
  for (const category of Object.keys(FIXTURE_CATALOG)) {
    const fixture = FIXTURE_CATALOG[category].find(f => f.key === key);
    if (fixture) {
      return { ...fixture, category };
    }
  }
  return null;
}


