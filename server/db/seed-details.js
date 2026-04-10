const path = require("path");
const seedDetails = require(path.join(__dirname, "seed-details.json"));

module.exports = function seedDetailsIntoDb(db) {
  const stmt = db.prepare(`
    INSERT INTO tour_details (tour_id, summary_json, logistics_json, itinerary_json)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(tour_id) DO UPDATE SET
      summary_json = excluded.summary_json,
      logistics_json = excluded.logistics_json,
      itinerary_json = excluded.itinerary_json
  `);

  for (const [tourId, detail] of Object.entries(seedDetails)) {
    const summary = detail.summary ? JSON.stringify(detail.summary) : null;
    const logistics = detail.logistics ? JSON.stringify(detail.logistics) : null;
    const itinerary = detail.itinerary ? JSON.stringify(detail.itinerary) : null;
    stmt.run(tourId, summary, logistics, itinerary);
  }
};
