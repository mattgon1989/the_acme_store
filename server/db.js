const { Client } = require("pg");
const uuid = require("uuid");
const bcrypt = require("bcrypt");

const client = new Client(process.env.DATABASE_URL || 'postgres://localhost/acme_store_db');

//create tables
async function createTables() {
    const SQL = `
    DROP TABLE IF EXISTS favorites;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS products;

    CREATE TABLE users (
        id UUID PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL
    );

    CREATE TABLE products (
        id UUID PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
    );

    CREATE TABLE favorites (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,  
        CONSTRAINT user_favorites UNIQUE(user_id, product_id)
    );
    `;
        await client.query(SQL);
}


//createUser
async function createUser(username, password) {
    const SQL= `
    INSERT INTO users(id, username, password)
    VALUES ($1, $2, $3)
    RETURNING *;
    `;
    const hash = await bcrypt.hash(password, 5);
    const response = await client.query(SQL, [uuid.v4(), username, hash]);
    return response.rows[0];
}

//createProduct
async function createProduct(name) {
    const SQL = `
    INSERT INTO products(id, name)
    VALUES ($1, $2)
    RETURNING *;
    `;
    const response = await client.query(SQL, [uuid.v4(), name]);
    return response.rows[0];
}

//createFavorite
async function createFavorite(user_id, product_id) {
    const SQL =`
    INSERT INTO favorites(id, user_id, product_id)
    VALUES ($1, $2, $3);

    `;
    await client.query(SQL, [uuid.v4(), user_id, product_id]);
    
}
//fetchUsers
async function fetchUsers() {
    const SQL = `
    SELECT id, username FROM users;
    `;
    const response = await client.query(SQL);
    return response.rows;
}
//fetchProducts
async function fetchProducts() {
    const SQL = `
    SELECT * FROM products;
    `;
    const response = await client.query(SQL);
    return response.rows;
}
//fetchFavorites
async function fetchFavorites(id) {
    const SQL = `
    SELECT products.name
    FROM favorites
    JOIN products ON favorites.product_id = products.id
    WHERE favorites.user_id = $1;
    `;
    const response = await client.query(SQL, [id]);
    return response.rows;
}
//destroyFavorite
async function destroyFavorite(id, user_id) {
    const SQL = `
    DELETE FROM favorites
    WHERE id = $1 AND user_id = $2;
    `;
    await client.query(SQL, [id, user_id]);
}

module.exports = {
    client,
    createTables,
    createUser,
    createFavorite,
    createProduct,
    fetchUsers,
    fetchFavorites,
    fetchProducts,
    destroyFavorite

}