Flight Booking India — Backend
A RESTful API built with Node.js, Express, and MongoDB for an Indian domestic flight booking platform. Includes full authentication, auto-rolling flight generation, and comprehensive admin analytics.

Features
Auth & Authorization: JWT-based authentication with password hashing using bcrypt.

Dynamic Flight Window: Auto-generates flights for a rolling window of future days, ensuring flight data never goes stale without needing manual re-seeding.

Flight Search & Booking: Search by origin, destination, travel class, and date. Full booking management with PNR lookups and cancellations.

Admin Analytics: Endpoints tracking daily revenue, bookings over time, airline distribution, and popular routes.

Tech Stack
Runtime: Node.js

Framework: Express.js

Database: MongoDB with Mongoose ODM

Authentication: JSON Web Tokens (JWT) & bcrypt

Default Test Accounts:

Admin: admin@flightbooking.in / admin123

User: demo@flightbooking.in / demo1234

Dynamic Flight Generation
The backend keeps flights available dynamically without manual re-seeding:

Server Startup Check: Verifies and fills in any missing flight dates up to ROLLING_WINDOW_DAYS. Safe for hostings that spin down on idle (e.g., Render).

Scheduled Job: A daily node-cron job extends the schedule by one day at midnight.

Manual Trigger: Admin users can manually trigger generation via POST /api/admin/flights/generate.
