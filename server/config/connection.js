require('dotenv').config();
const mongoose = require('mongoose');
const House = require('../models/House');
const { faker } = require('@faker-js/faker')

const MONGO_URI = process.env.MONGO_URI


mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB')

        const seed = async () => {
            await House.deleteMany({})

            let houses = []
            for (let i = 0; i < 5; i++) {
                houses.push({
                    address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()} ${faker.location.zipCode()}`,
                    landlordName: faker.person.fullName(),
                    landlordPhone: faker.phone.number(),
                    landlordEmail: faker.internet.email(),
                    numBeds: faker.number.int({ min: 0, max: 10 }),
                    numMattresses: faker.number.int({ min: 0, max: 10 }),
                    numTables: faker.number.int({ min: 0, max: 10 }),
                    numChairs: faker.number.int({ min: 0, max: 10 }),
                })
            }

            await House.insertMany(houses)
                .then(() => {
                    console.log('Houses added')
                })
                .catch(error => {
                    console.error('Error adding houses:', error.message)  
                })
        }

        seed().then(() => console.log('Successfully seeded')).catch(error => console.log('Error seeding:', error.message))
    })
    .catch(error => console.log('Error connecting to MongoDB:', error))

const db = mongoose.connection;

module.exports = db;
