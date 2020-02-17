const Joi = require('joi');
const uuidAPIKey = require('uuid-apikey');
const users = require('../db/users')
var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    if(!users) res.status(404).send('This resource is unavailable.');
    res.contentType("application/json");
    res.status(200).send(users);
});

router.get('/:id', (req, res) => {
    const user = users.find(c => c.id === parseInt(req.params.id));

    if(!user) res.status(404).send('This user id was not found in this resouce.');
    res.contentType("application/json");
    res.status(200).send(user);
})

router.post('/', (req, res) => {

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


router.put('/:id', (req, res) => {

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

router.delete('/:id', (req, res) => {
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

module.exports = router;