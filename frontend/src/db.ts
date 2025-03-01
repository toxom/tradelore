import { Client } from 'pg';
import type { ClientConfig } from 'pg'; 
import dotenv from 'dotenv';

dotenv.config();

const clientConfig: ClientConfig = {
    user: process.env.DB_USER || '', 
    host: process.env.DB_HOST || '', 
    database: process.env.DB_NAME || '',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '5432'), 
};

const client = new Client(clientConfig);

client.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Connection error', err.stack));

export default client;