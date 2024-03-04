const express = require('express');
const app = express();
const { client, createUser, createProduct, createFavorite, createTables, fetchUsers, fetchProducts, fetchFavorites, destroyFavorite } = require('./db');

app.use(express.json());

app.get('./api/users', async (req, res, next) => {
    try {
        res.send(await fetchUsers());
    } catch(err) {
        next(err);
    }
});

app.get('./api/products', async (req, res, next) => {
    try {
        res.send(await fetchProducts());
    } catch(err) {
        next(err);
    }
});

app.get('./api/user/:id/favorites', async (req, res, next) => {
    try {
        res.send(await fetchFavorites(req.params.id));
    } catch(err) {
        next(err);
    }
});

app.post('./api/users/:userId/favorites/:id', async (req, res, next) => {
    try {
        res.send(await createFavorite(req.params.userId, req.params.id ));
    } catch(err) {
        next(err);
    }
})

app.delete('./api/users/usersId/favorites/:id', async (req, res, next) => {
    try {
        res.send(await destroyFavorite(req.params.userId, req.params.id));
    } catch(err) {
        next(err);
    }
})



//init

const init = async () => {
    client.connect();
    await createTables();
    const [ alex, tom, robert, mattress, guitar, ipad, tv ] = await Promise.all([
        createUser('alex', 'password1'),
        createUser('robert', 'password2'),
        createUser('tom', 'password3'),
        createProduct('tv'),
        createProduct('guitar'),
        createProduct('mattress')
    ]);
    //test
    //console.log(await fetchUsers());
    // console.log(await fetchProducts());
    await Promise.all([
        createFavorite(tom.id, mattress.id),
        createFavorite(robert.id, guitar.id),
        createFavorite(alex.id, ipad.id)
    ]);

    //test
    //await destroyFavorite(guitar.id);
    //console.log(await fetchFavorites(robert.id));

    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
}

init();