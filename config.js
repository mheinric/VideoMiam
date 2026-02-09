import yaml from 'yaml';
import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();

const file = fs.readFileSync(path.join(__dirname, './config.yaml'), 'utf8');
const config = yaml.parse(file);
config["dirname"] = __dirname;

export default config;