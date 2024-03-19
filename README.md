# CSV to JSON Converter API

This project is a simple CSV to JSON converter API built using Node.js, Express.js, PostgreSQL, and custom logic to parse CSV data.

## Overview

The CSV to JSON converter API allows users to upload a CSV file, which is then converted into JSON format. Each row in the CSV file represents one object, and the fields in the CSV file are mapped to properties inside the JSON objects. The API uploads the converted JSON data into a PostgreSQL database table and calculates the age distribution of all users.

## Features

- Converts CSV files to JSON format
- Custom logic to parse CSV data
- Stores JSON data in a PostgreSQL database table
- Calculates age distribution of users
- Prints age distribution report on the console

## Installation

1. Clone the repository:

```
git clone https://github.com/varunreddy1024/csv-to-json-converter.git
```

2. Navigate to the project directory:

```
cd csv-to-json-converter
```

3. Install dependencies:

```
npm install
```

4. Set up environment variables:

   - Create a `.env` file in the project root directory.
   - Define the following environment variables:

   ```
   PORT=3000
   DB_URL=your_postgresql_connection_string
   FILE_PATH=absolute_path_to_your_csv_file
   ```

5. Start the server:

```
npm start
```

## Usage

1. Upload a CSV file to convert it to JSON format and store it in the database.
2. Access the age distribution report by checking the console output.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your improvements.

## Contact

For any inquiries or feedback, please contact [Bokka Varun Reddy](mailto:bkkvarun24@gmail.com).
