import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import config from '../config.js'

const db = new Database('userData.db');

export async function clearDB() {
    db.prepare("DELETE FROM Users").run(); 
    db.prepare("DELETE FROM UserSubscriptions").run(); 
}

const addUserStatement = db.prepare("INSERT INTO Users(Email, PasswordHash) VALUES (?, ?)");
export async function addUser(email, password) {
    let res = addUserStatement.run(email, await bcrypt.hash(password, config["passwords"]["bcrypt_rounds"]));
    return res.lastInsertRowid;
}

const userExistsStatement = db.prepare("SELECT COUNT(*) AS NbEntries FROM Users WHERE Email = ?");
export async function userExists(email) {
    return userExistsStatement.get(email).NbEntries > 0;
}

const checkUserStatement = db.prepare("SELECT * FROM Users WHERE Email = ?")
export async function checkUserPassword(id, password) {
    let entries = checkUserStatement.all(id, password); 
    if (entries.size == 0 || !await bcrypt.compare(password, entries[0].PasswordHash)) {
        return null; 
    }
    return entries[0].Id;
}

export default {
    clearDB,
    addUser,
    userExists, 
    checkUserPassword,

}