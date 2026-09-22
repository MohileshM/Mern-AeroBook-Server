import { airports, airlines, aircraftTypes, routePairs } from "./seedData.js";

export const airportByCode = Object.fromEntries(airports.map((a) => [a.code, a]));

const randomOf = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Builds fare tiers (Economy / Premium Economy / Business) from a base economy price
const buildFares = (basePrice) => {
  const priceJitter = 1 + (Math.random() * 0.3 - 0.15); // +/-15%
  const economyPrice = Math.round((basePrice * priceJitter) / 10) * 10;
  return [
    { class: "Economy", price: economyPrice, seatsAvailable: randomInt(8, 45) },
    { class: "Premium Economy", price: Math.round((economyPrice * 1.55) / 10) * 10, seatsAvailable: randomInt(4, 16) },
    { class: "Business", price: Math.round((economyPrice * 2.6) / 10) * 10, seatsAvailable: randomInt(2, 8) },
  ];
};

// Builds every flight (both directions, all curated routes) that departs on one specific calendar date
export const buildFlightsForDate = (dateOnly) => {
  const flights = [];

  const routesBothWays = routePairs.flatMap(([originCode, destCode, duration, basePrice]) => [
    [originCode, destCode, duration, basePrice],
    [destCode, originCode, duration, basePrice],
  ]);

  routesBothWays.forEach(([originCode, destCode, duration, basePrice]) => {
    const flightsPerDay = randomInt(2, 3);

    for (let i = 0; i < flightsPerDay; i++) {
      const airline = randomOf(airlines);
      const departure = new Date(dateOnly);
      departure.setHours(randomInt(5, 22), randomOf([0, 15, 30, 45]), 0, 0);

      const durationJitter = randomInt(-10, 10);
      const arrival = new Date(departure.getTime() + (duration + durationJitter) * 60000);

      flights.push({
        flightNumber: `${airline.code}-${randomInt(100, 999)}`,
        airline: airline.name,
        origin: airportByCode[originCode],
        destination: airportByCode[destCode],
        departureTime: departure,
        arrivalTime: arrival,
        durationMinutes: duration + durationJitter,
        stops: 0,
        fares: buildFares(basePrice),
        aircraft: randomOf(aircraftTypes),
      });
    }
  });

  return flights;
};

export { routePairs };
