import express from 'express';
import path from 'path';
import config from '../config.js';

export const app = express();

export const baseUrl = config["base_url"];

app.use(express.json());
app.use(baseUrl, express.static(path.resolve(config["dirname"], 'public')));