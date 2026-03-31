const readline = require('readline');

function pause(message) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(`\n--- ${message}. Натисніть Enter для продовження ---`, () => {
        rl.close();
        resolve();
    }));
}

const { 
  sequelize, Resort, Hotel,
} = require('../src/models/index'); 
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

// Raw SQL (mysql2)

async function insertRawSQL(connection) {
    console.log('Виконую SQL INSERT...');
    await connection.execute('INSERT INTO resort (name) VALUES (?)', ['TEST RESORT 1']);
    console.log('Дані вставлено успішно.');
}

async function selectRawSQL(connection) {
    console.log('Виконую SQL SELECT...');
    const [resorts] = await connection.execute('SELECT * FROM resort WHERE name = ?', ['TEST RESORT 1']);
    console.log('Результат SELECT:', resorts[0]);
    return resorts[0]?.id;
}

async function updateRawSQL(connection, id) {
    console.log('Виконую SQL UPDATE...');
    await connection.execute('UPDATE resort SET name = ? WHERE id = ?', ['TEST RESORT 1 UPDATED', id]);
    console.log('Запис оновлено.');
}

async function deleteRawSQL(connection, id) {
    console.log('Виконую SQL DELETE...');
    await connection.execute('DELETE FROM resort WHERE id = ?', [id]);
    console.log('Запис видалено.');
}

// Sequelize (ORM)

async function syncDatabase() {
    await sequelize.sync({ alter: true });
    console.log('ORM: Таблиці синхронізовано.');
}

// INSERT
async function insertHotelSequelize(rawResortId) {
    const hotel = await Hotel.create({
        name: 'TEST HOTEL 1',
        numberOfStars: 5,
        address: 'TEST ADDRESS 1',
        resortId: rawResortId
    });
    console.log('ORM: Готель створено через Hotel.create().');
    return hotel;
}

// SELECT
async function selectHotelSequelize(hotelId) {
    const hotelData = await Hotel.findByPk(hotelId, { 
        include: Resort // One-to-Many
    });
    if (hotelData) {
        console.log(`ORM: Знайдено готель: ${hotelData.name}, Курорт: ${hotelData.Resort.name}`);
    }
    return hotelData;
}

// UPDATE
async function updateHotelSequelize(hotelId) {
    await Hotel.update(
        { numberOfStars: 4 }, 
        { where: { id: hotelId } }
    );
    console.log('ORM: Дані готелю оновлено через Hotel.update().');
}

// DELETE
async function deleteHotelSequelize(hotelId) {
    await Hotel.destroy({ 
        where: { id: hotelId } 
    });
    console.log('ORM: Готель видалено через Hotel.destroy().');
}

async function runLab() {
    let connection;
    try {
        // Connect to mysql2
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3305
        });
        console.log('З\'єднання через mysql2 встановлено.');

        // RAW SQL
        await pause('Зараз ми виконаємо INSERT через сирий SQL');
        await insertRawSQL(connection);
        
        await pause('Тепер виконаємо SELECT, щоб отримати ID створеного курорту');
        const resortId = await selectRawSQL(connection);

        await pause('Демонструємо UPDATE: змінимо назву курорту в базі');
        await updateRawSQL(connection, resortId);
        
        // Sequelize 
        await pause('Синхронізуємо моделі (створюємо/оновлюємо таблиці)');
        await syncDatabase();

        await pause('Створимо готель через ORM Sequelize (метод .create())');
        const hotel = await insertHotelSequelize(resortId);

        await pause('Знайдемо цей готель через .findByPk з використанням JOIN (include)');
        await selectHotelSequelize(hotel.id);

        await pause('Оновимо дані готелю через .update()');
        await updateHotelSequelize(hotel.id);
        
        // DELETING
        await pause('Видалимо готель через Sequelize');
        await deleteHotelSequelize(hotel.id);

        await pause('Видалимо курорт через Raw SQL');
        await deleteRawSQL(connection, resortId);

    } catch (error) {
        console.error(error);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}

runLab();
