// Major Indian airports used to generate realistic domestic routes
export const airports = [
  { code: "DEL", city: "Delhi", name: "Indira Gandhi International Airport" },
  { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Maharaj International Airport" },
  { code: "BLR", city: "Bengaluru", name: "Kempegowda International Airport" },
  { code: "MAA", city: "Chennai", name: "Chennai International Airport" },
  { code: "CCU", city: "Kolkata", name: "Netaji Subhas Chandra Bose International Airport" },
  { code: "HYD", city: "Hyderabad", name: "Rajiv Gandhi International Airport" },
  { code: "PNQ", city: "Pune", name: "Pune Airport" },
  { code: "AMD", city: "Ahmedabad", name: "Sardar Vallabhbhai Patel International Airport" },
  { code: "GOI", city: "Goa", name: "Manohar International Airport" },
  { code: "COK", city: "Kochi", name: "Cochin International Airport" },
  { code: "JAI", city: "Jaipur", name: "Jaipur International Airport" },
  { code: "LKO", city: "Lucknow", name: "Chaudhary Charan Singh International Airport" },
  { code: "IXC", city: "Chandigarh", name: "Chandigarh International Airport" },
  { code: "GAU", city: "Guwahati", name: "Lokpriya Gopinath Bordoloi International Airport" },
  { code: "PAT", city: "Patna", name: "Jay Prakash Narayan International Airport" },
];

// Airline code prefixes used for realistic flight numbers
export const airlines = [
  { name: "IndiGo", code: "6E" },
  { name: "Air India", code: "AI" },
  { name: "Air India Express", code: "IX" },
  { name: "SpiceJet", code: "SG" },
  { name: "Akasa Air", code: "QP" },
  { name: "Alliance Air", code: "9I" },
];

export const aircraftTypes = ["Airbus A320neo", "Boeing 737 MAX", "Airbus A321", "ATR 72", "Boeing 787"];

// Curated set of realistic domestic routes: [originCode, destCode, durationMinutes, baseEconomyPriceINR]
// Duration and base price are approximate, used to generate believable flight data.
export const routePairs = [
  ["DEL", "BOM", 130, 4500],
  ["DEL", "BLR", 155, 5200],
  ["DEL", "MAA", 165, 5500],
  ["DEL", "CCU", 130, 4800],
  ["DEL", "HYD", 140, 4900],
  ["DEL", "GOI", 140, 5300],
  ["DEL", "PNQ", 120, 4600],
  ["DEL", "AMD", 95, 4200],
  ["DEL", "JAI", 55, 3200],
  ["DEL", "LKO", 60, 3400],
  ["DEL", "IXC", 50, 3000],
  ["DEL", "GAU", 150, 5800],
  ["DEL", "PAT", 100, 4300],
  ["DEL", "COK", 180, 6200],
  ["BOM", "BLR", 95, 4300],
  ["BOM", "MAA", 110, 4600],
  ["BOM", "CCU", 145, 5400],
  ["BOM", "HYD", 85, 4000],
  ["BOM", "GOI", 65, 3400],
  ["BOM", "PNQ", 45, 2600],
  ["BOM", "AMD", 65, 3300],
  ["BOM", "COK", 120, 4900],
  ["BLR", "MAA", 60, 3200],
  ["BLR", "HYD", 65, 3300],
  ["BLR", "CCU", 140, 5300],
  ["BLR", "COK", 65, 3400],
  ["BLR", "GOI", 70, 3600],
  ["MAA", "CCU", 135, 5100],
  ["MAA", "HYD", 75, 3600],
  ["MAA", "COK", 70, 3500],
  ["HYD", "CCU", 110, 4500],
  ["CCU", "GAU", 65, 3300],
  ["CCU", "PAT", 55, 3000],
];
