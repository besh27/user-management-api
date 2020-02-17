const express = require('express');
const app = express();
const usersRouter = require('./routes/users');

app.use(express.json());
const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`listening on port ${port}.`);
});

app.use('/api/v2/users', usersRouter);
