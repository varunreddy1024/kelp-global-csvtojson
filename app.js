const express = require('express');
const fs = require('fs');
const dotenv = require('dotenv');
const { Client } = require('pg');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const connectionString = process.env.DB_URL;

// Check if database connection string is defined
if (!connectionString) {
    console.error('DB connection string is not defined in .env file.');
    process.exit(1);
}

const client = new Client({
    connectionString: connectionString,
});

// Connect to the database
client.connect()
    .then(() => console.log('Connected to DB'))
    .catch(err => {
        console.error('Error connecting to DB:', err);
        process.exit(1);
    });

// Function to parse CSV data
function parseCSV(csvString) {
    // Split CSV data into lines
    const lines = csvString.trim().split('\n');
    const headers = lines[0].split(',');
    const data = [];

    // Parse each line into an object
    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',');
        const rowData = {};
        // Map each field to its corresponding header
        for (let j = 0; j < headers.length; j++) {
            const header = headers[j].trim();
            const value = row[j].trim();
            const keys = header.split('.');
            let tempObj = rowData;
            // Handle nested properties
            for (let k = 0; k < keys.length; k++) {
                const key = keys[k];
                if (k === keys.length - 1) {
                    tempObj[key] = value;
                } else {
                    if (!tempObj[key]) {
                        tempObj[key] = {};
                    }
                    tempObj = tempObj[key];
                }
            }
        }
        data.push(rowData);
    }
    return data;
}

// Function to calculate age distribution
function calcAgeDist(data) {
    const ageDist = { '< 20': 0, '20 to 40': 0, '40 to 60': 0, '> 60': 0 };

    // Iterate through data and count age distribution
    data.forEach(item => {
        if (item.age < 20) {
            ageDist['< 20']++;
        } else if (item.age >= 20 && item.age <= 40) {
            ageDist['20 to 40']++;
        } else if (item.age > 40 && item.age <= 60) {
            ageDist['40 to 60']++;
        } else {
            ageDist['> 60']++;
        }
    });

    return ageDist;
}

// Function to print age distribution report
function printAgeDistReport(ageDist, totalItems) {
    console.log('Age-Group % Distribution');
    // Print the distribution percentages
    for (const group in ageDist) {
        const percentage = ((ageDist[group] / totalItems) * 100).toFixed(2);
        console.log(`${group} ${percentage}`);
    }
}

const csvPath = process.env.FILE_PATH;

// Check if CSV file path is defined
if (!csvPath) {
    console.error('CSV file path is not defined in .env file.');
    process.exit(1);
}

// Read CSV file and process data
fs.readFile(csvPath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading CSV file:', err);
        process.exit(1);
    }

    // Parse CSV data
    const jsonData = parseCSV(data);

    // Define table creation query
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS public.table1 (
            id serial PRIMARY KEY,
            name varchar NOT NULL,
            age int NOT NULL,
            address jsonb NULL,
            additional_info jsonb NULL
        );
    `;

    // Create table if it doesn't exist
    client.query(createTableQuery)
        .then(() => {
            console.log('Table created');

            // Define query to insert data into the table
            const insertQuery = `
                INSERT INTO public.table1 (name, age, address, additional_info) 
                VALUES ($1, $2, $3, $4);
            `;

            // Map CSV data to database columns and execute insertion query
            const values = jsonData.map(row => {
                const { firstName, lastName, age, address, ...additionalInfo } = row;
                const name = `${firstName} ${lastName}`;
                return [name, age, address ? JSON.stringify(address) : null, additionalInfo ? JSON.stringify(additionalInfo) : null];
            });

            return client.query(insertQuery, values);
        })
        .then(() => {
            console.log('Data inserted');

            // Query database to retrieve user data
            const getUsersQuery = 'SELECT * FROM public.table1';
            return client.query(getUsersQuery);
        })
        .then(result => {
            // Calculate age distribution and print report
            const data = result.rows;
            const totalItems = data.length;
            const ageDist = calcAgeDist(data);
            printAgeDistReport(ageDist, totalItems);
        })
        .catch(err => {
            console.error('Error:', err);
        })
        .finally(() => {
            // Close database connection
            client.end();
        });
});

// Start Express server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});