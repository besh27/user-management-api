const Joi = require('joi');
const express = require('express');
const app = express();
const uuidAPIKey = require('uuid-apikey');
const users = require('./db/users')

app.use(express.json());

app.get('/api/v2/users', (req, res) => {
    if(!users) res.status(404).send('This resource is unavailable.');

    res.status(200).send(users);
});

app.get('/api/v2/users/:id', (req, res) => {
    const user = users.find(c => c.id === parseInt(req.params.id));

    if(!user) res.status(404).send('This user id was not found in this resouce.');

    res.status(200).send(user);
})

app.post('/api/v2/users', (req, res) => {

    const { error } = validationUser(req.body);
    if (error) return res.status(400).send(error.details[0].message)
    

    const user = {
        id: users.length + 1,
        apiKey: uuidAPIKey.create().apiKey,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        dateCreated: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        scope: [],
        status: 1
    };

    if(users.find(c => c.email === user.email)){
        res.status(404).send(`'${user.email}' is already in use.`);
    } else {
        users.push(user);
        res.status(200).send(`User ${user.firstName} ${user.lastName}, with an email of '${user.email}' has been created. \n\nNew Api Key: ${user.apiKey}\n\nPlease store it somewhere safe because as soon as you navigate away from this page,\nwe will not be able to retrive or restore this generated token.`);
    }
});


app.put('/api/v2/users/:id', (req, res) => {

    const user = users.find(c => c.id === parseInt(req.params.id));
    if(!user) res.status(404).send('This user id was not found in this resouce.');
    

    const { error } = validationUser(req.body);
    if (error) return res.status(400).send(error.details[0].message)
    

    console.dir('Request body: '+ req.body);

    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.email = req.body.email;
    user.lastUpdated = new Date().toISOString();
    user.scope = [];
    user.status = req.body.status;
    res.status(200).send(`User ${user.firstName} ${user.lastName}, with an email of '${user.email}' has been updated.`);
});

app.delete('/api/v2/users/:id', (req, res) => {
    const user = users.find(c => c.id === parseInt(req.params.id));
    if(!user) res.status(404).send('This user can not be deleted because they was not found in this resouce.');
    

    userName = `${user.firstName} ${user.lastName}`;
    const index = users.indexOf(user);
    users.splice(index, 1);

    res.send(`The user ${userName} has been deleted.`);
});


function validationUser(user){
    const schema = {
        firstName: Joi.string().min(3).required(),
        lastName: Joi.string().min(3).required(),
        email: Joi.string().email().max(256).required(),
        status: Joi.number().required(),
    };
    return Joi.validate(user, schema);
}

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`listening on port ${port}.`);
});
