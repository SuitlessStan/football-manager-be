# Football Manager API

Football Manager API is a Node.js-based backend application that provides endpoints for managing football-related data. The project uses Docker for containerization and Knex.js for database migrations.

## Prerequisites

Before running the application, ensure you have the following installed:

- Docker and Docker Compose
- Node.js (for local development)
- MySQL (optional for direct database access)

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd football-manager
   ```

2. Start the Docker containers:
   ```bash
   docker-compose up -d
   ```

3. Access services:
   - Node.js app: [http://localhost:4000](http://localhost:4000)
   - MySQL: Port `8989`
   - PhpMyAdmin: [http://localhost:8080](http://localhost:8080)

4. Open PhpMyAdmin at [http://localhost:8080](http://localhost:8080), log in with the following credentials:
   - **Host**: `mysql`
   - **Username**: `root`
   - **Password**: `root`

   Once logged in, create a new database named `football-manager`.

5. Bash into the Node.js container:
   ```bash
   docker exec -it football-manager-be bash
   ```

6. Run the migration commands to set up the database schema:
   ```bash
   npm run migrate:up
   ```

7. Exit the container:
   ```bash
   exit
   ```

## Testing

The project uses Mocha and Chai for testing. To run the test suite, use the following command:
```bash
npm test
```
This will:
1. Apply test migrations.
2. Run all test files located in the `tests` directory.
3. Roll back test migrations.

## Project Structure

- `app.js`: Entry point for the application.
- `migrations/`: Database migration files.
- `lib/`: Business logic and helper modules.
- `tests/`: Test cases for the application.

## Docker Compose Services

- **Node.js App**: Exposed on port `4000`, linked to the local `lib/`, `migrations/`, and `tests/` directories.
- **MySQL**: Exposed on port `8989`, with volumes configured for data persistence.
- **PhpMyAdmin**: Exposed on port `8080`, connected to the MySQL service.

## Contributions

Feel free to open issues or submit pull requests for improvements and bug fixes.

## Author

Issam Olwan

## License

This project is licensed under the ISC License.
